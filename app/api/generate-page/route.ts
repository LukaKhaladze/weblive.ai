import { NextRequest, NextResponse } from "next/server";
import {
  GeneratorInputs,
  PageBlueprint,
  WidgetInstance,
  WidgetType
} from "@/lib/types";
import { ALLOWED_WIDGETS } from "@/lib/widgets/registry";

export const runtime = "nodejs";

const categories = [
  "Dental Clinic",
  "Restaurant",
  "Hotel",
  "Beauty Salon",
  "Law Firm",
  "Real Estate",
  "Education",
  "E-commerce",
  "Other"
];

const tones = ["Professional", "Friendly", "Luxury", "Minimal"];

const languages = ["ka", "en"] as const;

function validateInputs(body: GeneratorInputs) {
  if (!body.businessName?.trim()) return "Business name is required.";
  if (!categories.includes(body.category)) return "Invalid category.";
  if (!body.city?.trim()) return "City is required.";
  if (!tones.includes(body.tone)) return "Invalid tone.";
  if (!languages.includes(body.language)) return "Invalid language.";
  if (!body.prompt?.trim()) return "Prompt is required.";
  if (!body.targetPage?.trim()) return "Target page is required.";
  if (!body.primaryColor?.trim()) return "Primary color is required.";
  if (!body.secondaryColor?.trim()) return "Secondary color is required.";
  return null;
}

function allowedList() {
  return Object.entries(ALLOWED_WIDGETS)
    .map(([type, variants]) => `${type}: ${variants.join(", ")}`)
    .join("\n");
}

function buildPrompt(inputs: GeneratorInputs, strict: boolean) {
  const lines = [
    "You are a senior UX writer and UI planner. Output ONLY valid JSON.",
    "",
    "Rules:",
    "- The business is in Georgia (country).",
    "- If language is ka, ALL strings must be Georgian (section labels, CTA, placeholders).",
    "- If language is en, ALL strings must be English.",
    "- Use only widgetType/variant from the allowed list.",
    "- Generate widgets ONLY for the selected target page (single page).",
    "- Use realistic content for the business category.",
    "- Apply primary/secondary colors in CTA labels and accents.",
    "- Create a Style Tokens object (radius, shadow, border, spacing, typography, heroStyle, cardStyle, sectionBg).",
    "- Use styleTokens to choose widget variants and props.",
    "- Keep output compact and practical.",
    strict
      ? "- Output must be strictly valid JSON. If you cannot comply, output an empty JSON object: {}"
      : ""
  ];

  lines.push(
    "",
    "Allowed widgets:",
    allowedList(),
    "",
    "Schema:",
    "{",
    '  "page": { "slug": string, "title": string },',
    '  "theme": { "primaryColor": string, "secondaryColor": string, "logoDataUrl"?: string },',
    '  "styleTokens": {',
    '    "radius": "md|lg|xl",',
    '    "shadow": "none|soft|medium",',
    '    "border": "none|thin",',
    '    "spacing": "compact|normal|airy",',
    '    "typography": "clean|bold|premium",',
    '    "heroStyle": "split|centered|overlay",',
    '    "cardStyle": "bordered|shadowed",',
    '    "sectionBg": "white|alt|dark"',
    "  },",
    '  "widgets": [',
    "    {",
    '      "widgetType": string,',
    '      "variant": string,',
    '      "props": object',
    '      "uiTokens"?: object',
    "    }",
    "  ]",
    "}",
    "",
    "Input:",
    `Business name: ${inputs.businessName}`,
    `Category: ${inputs.category}`,
    `City: ${inputs.city}`,
    `Tone: ${inputs.tone}`,
    `Language: ${inputs.language}`,
    `Target page: ${inputs.targetPage}`,
    `Business type: ${inputs.businessType}`,
    `Industry subcategory: ${inputs.industrySubcategory}`,
    `Target audience: ${inputs.targetAudience}`,
    `Price positioning: ${inputs.pricePositioning}`,
    `Primary goal: ${inputs.primaryGoal}`,
    `Has booking: ${inputs.hasBooking ? "yes" : "no"}`,
    `Has delivery: ${inputs.hasDelivery ? "yes" : "no"}`,
    `Address area: ${inputs.addressArea}`,
    `Working hours: ${inputs.workingHours}`,
    `Phone: ${inputs.phone}`,
    `Social links: ${inputs.socialLinks}`,
    `Primary color: ${inputs.primaryColor}`,
    `Secondary color: ${inputs.secondaryColor}`,
    `Design variation seed: ${inputs.designVariationSeed}`,
    `User prompt: ${inputs.prompt}`
  );

  return lines.filter(Boolean).join("\n");
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output only JSON." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "OpenAI request failed.");
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI.");
  }
  return content as string;
}

function safeParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeWidget(widget: any): WidgetInstance {
  const widgetType = (widget?.widgetType ?? "CTA") as WidgetType;
  const variants = ALLOWED_WIDGETS[widgetType] ?? [];
  const variant =
    variants.includes(widget?.variant) ? widget.variant : variants[0] ?? "bannerCentered";
  return {
    id: crypto.randomUUID(),
    widgetType,
    variant,
    props: widget?.props && typeof widget.props === "object" ? widget.props : {},
    createdAt: new Date().toISOString()
  };
}

function normalizePageBlueprint(inputs: GeneratorInputs, raw: any): PageBlueprint {
  const widgets = Array.isArray(raw?.widgets) ? raw.widgets.map(normalizeWidget) : [];
  return {
    page: {
      slug: inputs.targetPage.toLowerCase(),
      title: inputs.targetPage
    },
    theme: {
      primaryColor: inputs.primaryColor,
      secondaryColor: inputs.secondaryColor,
      logoDataUrl: inputs.logoDataUrl
    },
    styleTokens: raw?.styleTokens ?? undefined,
    widgets
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as GeneratorInputs;
  const validationError = validateInputs(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const prompt = buildPrompt(body, false);
  try {
    const raw = await callOpenAI(prompt);
    const parsed = safeParse(raw);
    const pageBlueprint = normalizePageBlueprint(body, parsed ?? {});
    return NextResponse.json(pageBlueprint);
  } catch (error) {
    const strictPrompt = buildPrompt(body, true);
    try {
      const raw = await callOpenAI(strictPrompt);
      const parsed = safeParse(raw);
      const pageBlueprint = normalizePageBlueprint(body, parsed ?? {});
      return NextResponse.json(pageBlueprint);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to generate page." },
        { status: 500 }
      );
    }
  }
}
