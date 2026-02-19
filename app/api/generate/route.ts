import { NextResponse } from "next/server";
import crypto from "crypto";
import { WizardInput, WizardInputSchema } from "@/lib/schema";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { generateEditToken, generateShareSlug } from "@/lib/tokens";
import { normalizeEcommerceInput } from "@/lib/generator/normalizeEcommerceInput";
import { runGeneration } from "@/lib/generator/runGeneration";
import { SiteSpec, SiteSpecSchema } from "@/schemas/siteSpec";
import { renderFromSpec } from "@/lib/renderFromSpec";
import { planSite, inferBusinessNameFromPrompt } from "@/lib/planner";

const OPENAI_IMAGE_MODEL = "gpt-image-1";
const MAX_GENERATED_IMAGES = 2;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; start: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return true;
}

function mapGoalToWizardGoal(goal: string): WizardInput["goal"] {
  if (goal === "sales") return "sell";
  if (goal === "bookings") return "bookings";
  if (goal === "downloads") return "visit";
  if (goal === "calls") return "calls";
  return "leads";
}

function toWizardInputFromSpec(payload: {
  prompt?: string;
  siteSpec: SiteSpec;
  brand?: { colors?: string[]; logo_url?: string };
  contact?: { phone?: string; email?: string; address?: string; city?: string; country?: string };
  inputOverrides?: Partial<WizardInput>;
}): WizardInput {
  const { siteSpec, prompt = "" } = payload;
  const category = siteSpec.site_type === "ecommerce" ? "ecommerce" : "informational";
  const overrides = payload.inputOverrides ?? {};

  return {
    prompt,
    siteSpec,
    businessName: siteSpec.business.name || overrides.businessName || inferBusinessNameFromPrompt(prompt || "My Business"),
    category,
    description: siteSpec.business.description || siteSpec.prompt_summary || overrides.description || "",
    productCategories: overrides.productCategories || "",
    services: overrides.services || "",
    uniqueValue: overrides.uniqueValue || "",
    priceRange: overrides.priceRange || "",
    targetAudience: overrides.targetAudience || "",
    location: overrides.location || [siteSpec.contact?.city, siteSpec.contact?.country].filter(Boolean).join(", "),
    tone: siteSpec.tone,
    visualStyle: overrides.visualStyle || "",
    imageMood: overrides.imageMood || "",
    primaryCta: overrides.primaryCta || "",
    goal: mapGoalToWizardGoal(siteSpec.primary_goal),
    pages: siteSpec.pages.map((p) => (p.slug === "/" ? "home" : p.slug.replace("/", ""))),
    includeProductPage: overrides.includeProductPage ?? false,
    products: overrides.products ?? [],
    brand: {
      primaryColor: siteSpec.brand?.primaryColor || payload.brand?.colors?.[0] || "#1c3d7a",
      secondaryColor: siteSpec.brand?.secondaryColor || payload.brand?.colors?.[1] || "#f4b860",
      extractFromLogo: false,
    },
    logoUrl: siteSpec.brand?.logoUrl || payload.brand?.logo_url || overrides.logoUrl || "",
    contact: {
      phone: siteSpec.contact?.phone || payload.contact?.phone || "",
      email: siteSpec.contact?.email || payload.contact?.email || "",
      address: siteSpec.contact?.address || payload.contact?.address || "",
      hours: overrides.contact?.hours || "",
      socials: {
        instagram: overrides.contact?.socials?.instagram || "",
        facebook: overrides.contact?.socials?.facebook || "",
        linkedin: overrides.contact?.socials?.linkedin || "",
        twitter: overrides.contact?.socials?.twitter || "",
      },
    },
  };
}

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

async function applyGeneratedImages(site: any, projectId: string, apiKey: string, supabaseServer: any, input: WizardInput) {
  let generated = 0;
  const pages = site.pages.map((page: any) => ({
    ...page,
    sections: page.sections.map((section: any) => ({ ...section })),
  }));

  for (const page of pages) {
    for (const section of page.sections) {
      if (generated >= MAX_GENERATED_IMAGES) break;
      const image = section.props?.image;
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

      section.props = {
        ...section.props,
        image: {
          ...image,
          src: signed?.signedUrl || image.src,
          alt: image.alt || `${input.businessName} visual`,
        },
      };
      generated += 1;
    }
  }

  return { ...site, pages };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const editToken = generateEditToken();
  const shareSlug = generateShareSlug();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let supabaseServer;
  try {
    supabaseServer = getSupabaseServer();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Supabase env vars missing" },
      { status: 500 }
    );
  }

  const projectId = crypto.randomUUID();

  try {
    let inputForStorage: WizardInput;
    let site: any;
    let seo: any;

    const parsedSiteSpec = body.siteSpec ? SiteSpecSchema.safeParse(body.siteSpec) : null;

    if (parsedSiteSpec?.success) {
      const rendered = renderFromSpec(parsedSiteSpec.data);
      inputForStorage = toWizardInputFromSpec({
        prompt: typeof body.prompt === "string" ? body.prompt : parsedSiteSpec.data.prompt_summary,
        siteSpec: rendered.siteSpec,
        brand: body.brand,
        contact: body.contact,
        inputOverrides: body.inputOverrides,
      });
      site = rendered.site;
      seo = rendered.seo;

      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        site = await applyGeneratedImages(site, projectId, apiKey, supabaseServer, inputForStorage);
      }
    } else if (typeof body.prompt === "string" && body.prompt.trim()) {
      const plan = await planSite({
        prompt: body.prompt,
        locale: typeof body.locale === "string" ? body.locale : "en",
        brand: body.brand,
        contact: body.contact,
        constraints: body.constraints,
      });
      const rendered = renderFromSpec(plan.siteSpec);
      inputForStorage = toWizardInputFromSpec({
        prompt: body.prompt,
        siteSpec: rendered.siteSpec,
        brand: body.brand,
        contact: body.contact,
        inputOverrides: body.inputOverrides,
      });
      site = rendered.site;
      seo = rendered.seo;

      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        site = await applyGeneratedImages(site, projectId, apiKey, supabaseServer, inputForStorage);
      }
    } else {
      const parsedWizard = WizardInputSchema.safeParse(body);
      if (!parsedWizard.success) {
        return NextResponse.json({ error: parsedWizard.error.flatten() }, { status: 400 });
      }

      inputForStorage = normalizeEcommerceInput(parsedWizard.data);
      const generated = await runGeneration({
        input: inputForStorage,
        projectId,
        supabaseServer,
      });
      site = generated.site;
      seo = generated.seo;
    }

    const { data, error } = await supabaseServer
      .from("projects")
      .insert({
        id: projectId,
        edit_token: editToken,
        share_slug: shareSlug,
        expires_at: expiresAt.toISOString(),
        input: inputForStorage,
        site,
        seo,
        status: "generated",
      })
      .select("id, expires_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to create project" }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      edit_token: editToken,
      share_slug: shareSlug,
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error("/api/generate failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
