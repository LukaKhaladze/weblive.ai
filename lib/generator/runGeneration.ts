import { WizardInput, Site, SeoPayload } from "@/lib/schema";
import { generateWithAiStub } from "@/lib/generator/aiStub";
import { ensureHeaderOnly } from "@/lib/generator/ensureHeaderOnly";
import { normalizeEcommerceInput } from "@/lib/generator/normalizeEcommerceInput";

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_IMAGE_MODEL = "gpt-image-1";
const MAX_GENERATED_IMAGES = 2;

async function generateImageBase64(prompt: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: "1536x1024",
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data?.data?.[0]?.b64_json || null;
}

async function applyGeneratedImages(
  site: Site,
  projectId: string,
  apiKey: string,
  supabaseServer: any,
  input: WizardInput
) {
  let generated = 0;
  const pages = site.pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => ({ ...section })),
  }));

  for (const page of pages) {
    for (const section of page.sections) {
      if (generated >= MAX_GENERATED_IMAGES) break;
      const image = (section.props as any)?.image;
      if (!image || typeof image.src !== "string") continue;
      if (!image.src.startsWith("/placeholders")) continue;

      const prompt = [
        "Create a high-quality, realistic website hero image for a business.",
        `Business name: ${input.businessName}.`,
        `Category: ${input.category}.`,
        `Description: ${input.description}.`,
        "Style: clean, modern, professional, no text overlays.",
      ].join(" ");

      const base64 = await generateImageBase64(prompt, apiKey);
      if (!base64) continue;

      const buffer = Buffer.from(base64, "base64");
      const path = `${projectId}/images/${section.id}.png`;
      const upload = await supabaseServer.storage
        .from("weblive-assets")
        .upload(path, buffer, { contentType: "image/png", upsert: true });
      if (upload.error) continue;

      const { data: signed } = await supabaseServer.storage
        .from("weblive-assets")
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      (section.props as any) = {
        ...section.props,
        image: {
          ...image,
          src: signed?.signedUrl || image.src,
          alt: image.alt || `${input.businessName} ვიზუალური`,
        },
      };
      generated += 1;
    }
  }

  return { ...site, pages } as Site;
}

export async function runGeneration({
  input,
  supabaseServer,
  projectId,
}: {
  input: WizardInput;
  supabaseServer: any;
  projectId: string;
}): Promise<{ site: Site; seo: SeoPayload }> {
  let site: Site | null = null;
  let seo: SeoPayload | null = null;
  const normalizedInput = normalizeEcommerceInput(input);

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY missing");
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["site", "seo"],
      properties: {
        site: {
          type: "object",
          additionalProperties: false,
          required: ["theme", "pages"],
          properties: {
            theme: {
              type: "object",
              additionalProperties: false,
              required: ["primaryColor", "secondaryColor", "fontFamily", "radius", "buttonStyle"],
              properties: {
                primaryColor: { type: "string" },
                secondaryColor: { type: "string" },
                fontFamily: { type: "string" },
                radius: { type: "number" },
                buttonStyle: { type: "string", enum: ["solid", "outline"] },
              },
            },
            pages: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["id", "slug", "name", "seo", "sections"],
                properties: {
                  id: { type: "string" },
                  slug: { type: "string" },
                  name: { type: "string" },
                  seo: {
                    type: "object",
                    additionalProperties: false,
                    required: ["title", "description", "keywords"],
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      keywords: { type: "array", items: { type: "string" } },
                    },
                  },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "widget", "variant", "props"],
                      properties: {
                        id: { type: "string" },
                        widget: { type: "string" },
                        variant: { type: "string" },
                        props: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        seo: {
          type: "object",
          additionalProperties: false,
          required: ["project", "pages", "recommendations"],
          properties: {
            project: {
              type: "object",
              additionalProperties: false,
              required: ["businessName", "category"],
              properties: {
                businessName: { type: "string" },
                category: { type: "string" },
              },
            },
            pages: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["slug", "title", "description", "keywords"],
                properties: {
                  slug: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                },
              },
            },
            recommendations: { type: "array", items: { type: "string" } },
          },
        },
      },
    };

    const designSeed = Math.floor(Math.random() * 1_000_000);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.8,
        input: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text:
                  "You are an AI website planner. Return ONLY structured JSON that matches the provided schema. " +
                  "Write all copy in Georgian. Create a unique layout each time with different section order " +
                  "and variants. Use only the existing widget types/variants. No HTML.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Business input JSON: ${JSON.stringify(normalizedInput)}. Design seed: ${designSeed}.`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "weblive_site_plan",
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const outputText = data.output_text as string | undefined;
    if (outputText) {
      const parsed = JSON.parse(outputText);
      site = parsed.site;
      seo = parsed.seo;
    } else if (data.output?.[0]?.content?.[0]?.text) {
      const parsed = JSON.parse(data.output[0].content[0].text);
      site = parsed.site;
      seo = parsed.seo;
    } else {
      throw new Error("No output from OpenAI");
    }
  } catch (error) {
    const fallback = await generateWithAiStub(normalizedInput);
    site = fallback.site;
    seo = fallback.seo;
  }

  if (!site || !seo) {
    const fallback = await generateWithAiStub(normalizedInput);
    site = fallback.site;
    seo = fallback.seo;
  }

  site = ensureHeaderOnly(site, normalizedInput);

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    site = await applyGeneratedImages(site, projectId, apiKey, supabaseServer, normalizedInput);
  }

  return { site, seo };
}
