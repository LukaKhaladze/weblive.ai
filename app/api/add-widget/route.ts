import { NextRequest, NextResponse } from "next/server";
import { GeneratorInputs, WidgetInstance, WidgetType } from "@/lib/types";
import { ALLOWED_WIDGETS } from "@/lib/widgets/registry";

export const runtime = "nodejs";

type AddWidgetPayload = {
  inputs: GeneratorInputs;
  targetPage: string;
  widgets: Array<{ widgetType: string; variant: string }>;
  styleTokens?: Record<string, unknown> | null;
  userPrompt: string;
};

function allowedList() {
  return Object.entries(ALLOWED_WIDGETS)
    .map(([type, variants]) => `${type}: ${variants.join(", ")}`)
    .join("\n");
}

function buildPrompt(payload: AddWidgetPayload, strict: boolean) {
  const { inputs, userPrompt, widgets, targetPage } = payload;
  const lines = [
    "You are a senior UX planner. Output ONLY valid JSON.",
    "",
    "Rules:",
    "- Return exactly ONE widget.",
    "- Use only widgetType/variant from the allowed list.",
    "- Match the language of the project (ka or en).",
    "- Keep content realistic for the business category.",
    "- The widget must visually match the theme colors.",
    "- If styleTokens are provided, reuse them to keep the widget consistent.",
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
    '  "widget": {',
    '    "widgetType": string,',
    '    "variant": string,',
    '    "props": object',
    "  },",
    '  "insertAfterId"?: string',
    "}",
    "",
    "Context:",
    `Target page: ${targetPage}`,
    `Business name: ${inputs.businessName}`,
    `Category: ${inputs.category}`,
    `City: ${inputs.city}`,
    `Tone: ${inputs.tone}`,
    `Language: ${inputs.language}`,
    `Primary color: ${inputs.primaryColor}`,
    `Secondary color: ${inputs.secondaryColor}`,
    `User prompt: ${userPrompt}`,
    `Existing widgets: ${widgets.map((w) => `${w.widgetType}:${w.variant}`).join(", ")}`,
    `Style tokens (if any): ${payload.styleTokens ? JSON.stringify(payload.styleTokens) : "None"}`
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

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as AddWidgetPayload;
  if (!payload?.inputs || !payload?.userPrompt) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const prompt = buildPrompt(payload, false);
  try {
    const raw = await callOpenAI(prompt);
    const parsed = safeParse(raw);
    const widget = normalizeWidget(parsed?.widget);
    return NextResponse.json({ widget, insertAfterId: parsed?.insertAfterId });
  } catch (error) {
    const strictPrompt = buildPrompt(payload, true);
    try {
      const raw = await callOpenAI(strictPrompt);
      const parsed = safeParse(raw);
      const widget = normalizeWidget(parsed?.widget);
      return NextResponse.json({ widget, insertAfterId: parsed?.insertAfterId });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to add widget." },
        { status: 500 }
      );
    }
  }
}
