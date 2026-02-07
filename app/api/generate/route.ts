import { NextRequest, NextResponse } from "next/server";
import {
  Blueprint,
  GeneratorInputs,
  SectionType,
  SectionUI,
  UIBlock
} from "@/lib/types";

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
  return null;
}

function buildPrompt(inputs: GeneratorInputs, strict: boolean) {
  const lines = [
    "You are a senior brand strategist. Produce ONLY valid JSON that matches the schema exactly.",
    "",
    "Requirements:",
    "- The business is in Georgia (country).",
    "- Content must be practical for small businesses in Georgia.",
    "- If language is ka, ALL strings must be Georgian.",
    "- If language is en, ALL strings must be English.",
    "- No markdown, no code fences, no commentary, JSON only.",
    "- Use the section order: hero, about, services, why_us, testimonials, faq, contact.",
    "- Provide 3-5 bullets per section when relevant.",
    "- Provide realistic CTA labels and hrefs (e.g., /contact, tel:+995..., mailto:...).",
    "- Include recommendedPages (5-8 page names) that best fit the business.",
    "- Generate content for the target page only, but keep pages array with a single page object.",
    "- Include a design object for the page (visualStyle, layoutNotes, spacing, palette, typography, imagery, components).",
    "- For each section include a ui object for preview rendering.",
    "- ui.variant must be one of: hero, simple, cards, list, split, faqAccordion, contactForm, pricingTable, teamGrid, blogList.",
    "- ui.blocks is an array of blocks: heading, text, bullets, image, button, form.",
    "- If target page is FAQ, set the FAQ section ui.variant to faqAccordion and include more detailed Q&A.",
    "- If target page is Contact, set the Contact section ui.variant to contactForm.",
    "- If target page is Home, use a hero-style layout with an image + CTA in the hero section."
  ];

  if (strict) {
    lines.push(
      "- Output must be strictly valid JSON. If you cannot comply, output an empty JSON object: {}"
    );
  }

  lines.push(
    "",
    "Schema:",
    "{",
    '  "site": {',
    '    "businessName": string,',
    '    "category": string,',
    '    "city": string,',
    '    "tone": string,',
    '    "language": "ka" | "en"',
    "  },",
    '  "theme": {',
    '    "styleKeywords": string[],',
    '    "colorSuggestions": string[],',
    '    "fontSuggestions": string[]',
    "  },",
    '  "recommendedPages": string[],',
    '  "pages": [',
    "    {",
    '      "slug": "home",',
    '      "title": string,',
    '      "design": {',
    '        "visualStyle": string,',
    '        "layoutNotes": string,',
    '        "spacing": string,',
    '        "palette": string[],',
    '        "typography": string[],',
    '        "imagery": string[],',
    '        "components": string[]',
    "      },",
    '      "sections": [',
    "        {",
    '          "type": "hero" | "about" | "services" | "why_us" | "testimonials" | "faq" | "contact",',
    '          "heading": string,',
    '          "content": string,',
    '          "bullets": string[],',
    '          "cta": { "label": string, "href": string },',
    '          "ui": {',
    '            "variant": "hero" | "simple" | "cards" | "list" | "split" | "faqAccordion" | "contactForm" | "pricingTable" | "teamGrid" | "blogList",',
    '            "blocks": [',
    '              { "type": "heading", "value": string },',
    '              { "type": "text", "value": string },',
    '              { "type": "bullets", "items": string[] },',
    '              { "type": "image", "alt": string, "hint": string },',
    '              { "type": "button", "label": string, "href": string },',
    '              { "type": "form", "fields": string[] }',
    "            ]",
    "          }",
    "        }",
    "      ]",
    "    }",
    "  ],",
    '  "seo": {',
    '    "metaTitle": string,',
    '    "metaDescription": string,',
    '    "keywords": string[]',
    "  }",
    "}",
    "",
    "Input:",
    `Business name: ${inputs.businessName}`,
    `Category: ${inputs.category}`,
    `City: ${inputs.city}`,
    `Tone: ${inputs.tone}`,
    `Language: ${inputs.language}`,
    `Target page: ${inputs.targetPage}`,
    `User prompt: ${inputs.prompt}`
  );

  return lines.join("\n");
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

function parseBlueprint(raw: string) {
  const trimmed = raw.trim();
  return JSON.parse(trimmed) as Blueprint;
}

function toLocalizedFields(language: "ka" | "en") {
  if (language === "ka") {
    return ["სახელი", "ტელეფონი", "ელ.ფოსტა", "შეტყობინება"];
  }
  return ["Name", "Phone", "Email", "Message"];
}

function fallbackVariant(
  type: SectionType,
  targetPage: string
): SectionUI["variant"] {
  const normalized = targetPage.toLowerCase();
  if (type === "faq" || normalized === "faq") return "faqAccordion";
  if (type === "contact" || normalized === "contact") return "contactForm";
  if (type === "hero" || normalized === "home") return "hero";
  if (type === "services") return "cards";
  if (type === "testimonials") return "cards";
  if (type === "why_us") return "list";
  if (type === "about") return "split";
  return "simple";
}

function withFallbackUI(
  blueprint: Blueprint,
  targetPage: string
): Blueprint {
  const fields = toLocalizedFields(blueprint.site.language);
  const pages = blueprint.pages.map((page) => {
    const sections = page.sections.map((section) => {
      if (section.ui) return section;
      const variant = fallbackVariant(section.type, targetPage);
      const blocks: UIBlock[] = [
        { type: "heading", value: section.heading },
        { type: "text", value: section.content }
      ];

      if (section.bullets?.length) {
        blocks.push({ type: "bullets", items: section.bullets });
      }
      if (variant === "hero" || variant === "split") {
        blocks.push({
          type: "image",
          alt: section.heading,
          hint: blueprint.site.category
        });
      }
      if (variant === "contactForm") {
        blocks.push({ type: "form", fields });
      } else {
        blocks.push({
          type: "button",
          label: section.cta.label,
          href: section.cta.href
        });
      }

      const ui: SectionUI = { variant, blocks };
      return { ...section, ui };
    });
    return { ...page, sections };
  });
  return { ...blueprint, pages };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeneratorInputs;
    const error = validateInputs(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const initialPrompt = buildPrompt(body, false);
    let raw = await callOpenAI(initialPrompt);
    try {
      const blueprint = withFallbackUI(parseBlueprint(raw), body.targetPage);
      return NextResponse.json(blueprint);
    } catch {
      const strictPrompt = buildPrompt(body, true);
      raw = await callOpenAI(strictPrompt);
      const blueprint = withFallbackUI(parseBlueprint(raw), body.targetPage);
      return NextResponse.json(blueprint);
    }
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unexpected server error occurred."
      },
      { status: 500 }
    );
  }
}
