import { ALLOWED_PAGE_SLUGS, normalizeSiteSpec, SiteSpec, SiteSpecSchema } from "@/schemas/siteSpec";
import { LayoutPlan, LayoutPlanSchema, parseAndValidateLayoutPlan } from "@/schemas/layoutPlan";
import {
  CATALOG_RECIPES,
  FORBIDDEN_CATALOG_FEATURE_KEYWORDS,
  INFO_RECIPES,
  STYLE_PRESETS,
  TemplatePack,
  WebsiteType,
} from "@/schemas/sectionLibrary";
import { DesignKitId, DESIGN_KIT_IDS } from "@/schemas/designKits";

type PlanInput = {
  prompt: string;
  locale?: string;
  brand?: { colors?: string[]; logo_url?: string };
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  constraints?: { max_pages?: number };
};

type PlanOutput = {
  siteSpec: SiteSpec;
  warnings: string[];
  unsupported_features: string[];
};

const OPENAI_MODEL = "gpt-4o-mini";

function slugifyName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function heuristicSiteType(prompt: string): SiteSpec["site_type"] {
  const p = prompt.toLowerCase();
  if (p.includes("restaurant") || p.includes("cafe") || p.includes("food")) return "restaurant";
  if (p.includes("clinic") || p.includes("dental") || p.includes("medical")) return "clinic";
  if (p.includes("portfolio") || p.includes("photographer") || p.includes("designer")) return "portfolio";
  if (p.includes("saas") || p.includes("software") || p.includes("app")) return "saas";
  if (p.includes("event") || p.includes("conference")) return "event";
  if (p.includes("real estate") || p.includes("property")) return "real_estate";
  if (p.includes("course") || p.includes("academy") || p.includes("education")) return "education";
  if (p.includes("nonprofit") || p.includes("charity")) return "nonprofit";
  if (p.includes("store") || p.includes("shop") || p.includes("ecommerce") || p.includes("product"))
    return "ecommerce";
  if (p.includes("blog") || p.includes("news")) return "blog";
  if (p.includes("agency")) return "agency";
  return "local_service";
}

function buildHeuristicSpec(input: PlanInput): SiteSpec {
  const siteType = heuristicSiteType(input.prompt);
  const maxPages = Math.max(2, Math.min(input.constraints?.max_pages ?? 5, 5));
  const businessNameGuess = input.prompt.split(/[\n,.!]/)[0].trim().slice(0, 60) || "My Business";

  const defaultPages: SiteSpec["pages"] = [
    { slug: "/", nav_label: "Home", purpose: "Main landing page" },
    { slug: "/about", nav_label: "About", purpose: "Trust and company story" },
    {
      slug: siteType === "ecommerce" ? "/products" : "/services",
      nav_label: siteType === "ecommerce" ? "Products" : "Services",
      purpose: siteType === "ecommerce" ? "Product listing" : "Service overview",
    },
    { slug: "/contact", nav_label: "Contact", purpose: "Lead capture and contact details" },
  ].slice(0, maxPages) as SiteSpec["pages"];

  const requestedFeatures = [
    ...input.prompt
      .toLowerCase()
      .split(/[,.;\n]+/)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 12),
  ];

  const spec: SiteSpec = {
    prompt_summary: input.prompt.trim().slice(0, 240),
    site_type: siteType,
    primary_goal: siteType === "ecommerce" ? "sales" : "leads",
    tone: "professional",
    locale: input.locale || "en",
    business: {
      name: businessNameGuess,
      tagline: "",
      description: input.prompt.trim().slice(0, 400),
    },
    contact: input.contact,
    brand: {
      primaryColor: input.brand?.colors?.[0],
      secondaryColor: input.brand?.colors?.[1],
      logoUrl: input.brand?.logo_url,
    },
    pages: defaultPages,
    requested_features: requestedFeatures,
    supported_features: [],
    unsupported_features: [],
    warnings: ["Used deterministic planner fallback."],
  };

  return normalizeSiteSpec(spec);
}

async function callPlannerModel(input: PlanInput, repairPayload?: unknown): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const maxPages = Math.max(2, Math.min(input.constraints?.max_pages ?? 5, 5));

  const schema = {
    type: "object",
    additionalProperties: false,
    required: [
      "prompt_summary",
      "site_type",
      "primary_goal",
      "tone",
      "locale",
      "business",
      "pages",
      "supported_features",
      "unsupported_features",
      "warnings",
    ],
    properties: {
      prompt_summary: { type: "string" },
      site_type: {
        type: "string",
        enum: [
          "agency",
          "restaurant",
          "clinic",
          "portfolio",
          "saas",
          "event",
          "real_estate",
          "education",
          "nonprofit",
          "local_service",
          "ecommerce",
          "blog",
        ],
      },
      primary_goal: { type: "string", enum: ["calls", "leads", "bookings", "sales", "downloads"] },
      tone: { type: "string", enum: ["professional", "friendly", "premium", "bold", "minimal", "playful"] },
      locale: { type: "string" },
      business: {
        type: "object",
        additionalProperties: false,
        required: ["name"],
        properties: {
          name: { type: "string" },
          tagline: { type: "string" },
          description: { type: "string" },
        },
      },
      contact: {
        type: "object",
        additionalProperties: false,
        properties: {
          phone: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
          city: { type: "string" },
          country: { type: "string" },
        },
      },
      brand: {
        type: "object",
        additionalProperties: false,
        properties: {
          primaryColor: { type: "string" },
          secondaryColor: { type: "string" },
          fontFamily: { type: "string" },
          logoUrl: { type: "string" },
        },
      },
      pages: {
        type: "array",
        maxItems: maxPages,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["slug", "nav_label", "purpose"],
          properties: {
            slug: {
              type: "string",
              enum: ALLOWED_PAGE_SLUGS,
            },
            nav_label: { type: "string" },
            purpose: { type: "string" },
          },
        },
      },
      requested_features: { type: "array", items: { type: "string" } },
      supported_features: { type: "array", items: { type: "string" } },
      unsupported_features: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
    },
  };

  const systemPrompt =
    "You are a website planner that outputs JSON only. " +
    "Choose pages only from the allowed slug list. Keep max pages under constraint. " +
    "Do not promise unsupported app functionality. " +
    "If request includes auth/payments/marketplace/booking engine/portals, list those in unsupported_features and add warnings. " +
    "Do not fabricate factual numbers. Use neutral placeholders. " +
    "Output must match schema exactly.";

  const userPayload = repairPayload
    ? {
        mode: "repair",
        invalid_payload: repairPayload,
        instruction: "Fix this payload to match schema exactly. Keep original intent.",
      }
    : {
        mode: "plan",
        prompt: input.prompt,
        locale: input.locale || "en",
        brand: input.brand,
        contact: input.contact,
        constraints: { max_pages: maxPages },
      };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      input: [
        { role: "system", content: [{ type: "text", text: systemPrompt }] },
        { role: "user", content: [{ type: "text", text: JSON.stringify(userPayload) }] },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "site_spec",
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Planner model error: ${res.status}`);
  }

  const data = await res.json();
  const outputText = data.output_text as string | undefined;
  if (outputText) {
    return JSON.parse(outputText);
  }
  const altText = data.output?.[0]?.content?.[0]?.text;
  if (altText) {
    return JSON.parse(altText);
  }

  throw new Error("Planner returned empty output");
}

export async function planSite(input: PlanInput): Promise<PlanOutput> {
  const prompt = input.prompt?.trim() || "";
  if (!prompt) {
    const fallback = buildHeuristicSpec({ ...input, prompt: "Business website" });
    return {
      siteSpec: fallback,
      warnings: fallback.warnings,
      unsupported_features: fallback.unsupported_features,
    };
  }

  try {
    const raw = await callPlannerModel(input);
    const parsed = SiteSpecSchema.safeParse(raw);
    if (parsed.success) {
      const normalized = normalizeSiteSpec(parsed.data);
      return {
        siteSpec: normalized,
        warnings: normalized.warnings,
        unsupported_features: normalized.unsupported_features,
      };
    }

    const repairedRaw = await callPlannerModel(input, raw);
    const repairedParsed = SiteSpecSchema.safeParse(repairedRaw);
    if (repairedParsed.success) {
      const normalized = normalizeSiteSpec(repairedParsed.data);
      return {
        siteSpec: normalized,
        warnings: normalized.warnings,
        unsupported_features: normalized.unsupported_features,
      };
    }

    const fallback = buildHeuristicSpec(input);
    return {
      siteSpec: fallback,
      warnings: fallback.warnings,
      unsupported_features: fallback.unsupported_features,
    };
  } catch (error) {
    const fallback = buildHeuristicSpec(input);
    const warnings = Array.from(
      new Set([...fallback.warnings, "AI planner unavailable, used deterministic fallback."])
    );
    return {
      siteSpec: fallback,
      warnings,
      unsupported_features: fallback.unsupported_features,
    };
  }
}

export function buildPromptFromFields(input: {
  businessName?: string;
  description?: string;
  productCategories?: string;
  services?: string;
  targetAudience?: string;
  location?: string;
  tone?: string;
  uniqueValue?: string;
}): string {
  const lines = [
    `Business: ${input.businessName || "My Business"}`,
    `Description: ${input.description || ""}`,
    `Categories/Services: ${input.productCategories || input.services || ""}`,
    `Target audience: ${input.targetAudience || ""}`,
    `Location: ${input.location || ""}`,
    `Tone: ${input.tone || "professional"}`,
    `Unique value: ${input.uniqueValue || ""}`,
  ];
  return lines.join("\n").trim();
}

export function inferBusinessNameFromPrompt(prompt: string): string {
  const first = prompt.split(/\n|[.!?]/)[0]?.trim() || "My Business";
  if (first.length <= 80) return first;
  return first.slice(0, 80);
}

export function fallbackSlugToName(slug: string): string {
  if (slug === "/") return "Home";
  return slug
    .replace(/^\//, "")
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function stableSectionId(prefix: string, pageId: string) {
  return `sec_${prefix}_${slugifyName(pageId) || pageId}`;
}

type LayoutPlanInput = {
  prompt: string;
  website_type?: WebsiteType;
  locale?: string;
  brand?: { colors?: string[]; logo_url?: string };
  contact?: { phone?: string; email?: string; address?: string; city?: string; country?: string };
  products?: { name: string; price?: string; imageUrl?: string }[];
};

type LayoutPlanOutput = {
  layoutPlan: LayoutPlan;
  warnings: string[];
  unsupported_features: string[];
};

const CATALOG_HINTS = ["product", "catalog", "shop", "store", "collection", "sku"];

const PAGE_ORDER = ["/", "/services", "/products", "/pricing", "/portfolio", "/about", "/blog", "/contact"] as const;
const PAGE_NAME_DEFAULTS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/services": "Services",
  "/products": "Products",
  "/pricing": "Pricing",
  "/portfolio": "Portfolio",
  "/contact": "Contact",
  "/blog": "Blog",
};

type BusinessArchetype = "medical" | "saas" | "luxury" | "restaurant" | "agency" | "general";

function detectWebsiteType(prompt: string, forced?: WebsiteType): WebsiteType {
  if (forced) return forced;
  const normalized = prompt.toLowerCase();
  return CATALOG_HINTS.some((hint) => normalized.includes(hint)) ? "catalog" : "info";
}

function detectBusinessArchetype(prompt: string): BusinessArchetype {
  const normalized = prompt.toLowerCase();
  if (/(medical|clinic|dental|hospital|health)/.test(normalized)) return "medical";
  if (/(saas|startup|software|ai|platform)/.test(normalized)) return "saas";
  if (/(luxury|premium|boutique|high-end|exclusive)/.test(normalized)) return "luxury";
  if (/(restaurant|cafe|organic|farm|bakery|food)/.test(normalized)) return "restaurant";
  if (/(agency|marketing|creative|branding|studio)/.test(normalized)) return "agency";
  return "general";
}

function selectDesignKit(
  prompt: string,
  websiteType: WebsiteType,
  tone?: string
): DesignKitId {
  const normalized = `${prompt} ${tone || ""}`.toLowerCase();
  const archetype = detectBusinessArchetype(normalized);
  if (archetype === "medical") return "medical-blue";
  if (archetype === "saas") return "modern-saas";
  if (archetype === "luxury") return "luxury-elegant";
  if (archetype === "restaurant") return "warm-organic";
  if (archetype === "agency") return "bold-gradient";
  if (websiteType === "catalog") return "clean-minimal";
  return "clean-minimal";
}

function stylePresetFromKit(designKit: DesignKitId): keyof typeof STYLE_PRESETS {
  if (designKit === "modern-saas" || designKit === "bold-gradient") return "dark-neon";
  if (designKit === "warm-organic") return "light-commerce";
  return "premium-minimal";
}

function chooseRecipe(websiteType: WebsiteType, archetype: BusinessArchetype) {
  const recipes = websiteType === "catalog" ? CATALOG_RECIPES : INFO_RECIPES;
  if (websiteType === "catalog") {
    if (archetype === "luxury") return recipes.find((r) => r.id === "catalog-boutique") || recipes[0];
    if (archetype === "saas" || archetype === "agency") {
      return recipes.find((r) => r.id === "catalog-megamarket") || recipes[0];
    }
    if (archetype === "restaurant") return recipes.find((r) => r.id === "catalog-story") || recipes[0];
    return recipes.find((r) => r.id === "catalog-clean") || recipes[0];
  }

  if (archetype === "saas") return recipes.find((r) => r.id === "info-agency-modern") || recipes[0];
  if (archetype === "medical") return recipes.find((r) => r.id === "info-service-trust") || recipes[0];
  if (archetype === "luxury") return recipes.find((r) => r.id === "info-premium") || recipes[0];
  if (archetype === "agency") return recipes.find((r) => r.id === "info-agency-modern") || recipes[0];
  return recipes.find((r) => r.id === "info-corporate-clean") || recipes[0];
}

function chooseVariant(
  widget: string,
  defaultVariant: string,
  context: { websiteType: WebsiteType; designKit: DesignKitId; archetype: BusinessArchetype; pageSlug: string }
) {
  if (widget === "header") {
    return context.websiteType === "catalog" ? "v2-search" : "v1-classic";
  }
  if (widget === "hero") {
    if (context.designKit === "modern-saas") return "v2-split";
    if (context.designKit === "medical-blue") return "v1-centered";
    if (context.designKit === "luxury-elegant") return "v2-split";
    if (context.designKit === "bold-gradient") return "v4-metrics";
    return context.pageSlug === "/" ? "v1-centered" : defaultVariant;
  }
  if (widget === "services") {
    if (context.archetype === "agency" || context.archetype === "saas") return "grid";
    if (context.archetype === "medical") return "list";
    if (context.archetype === "restaurant") return "grid";
  }
  if (widget === "testimonials") {
    if (context.archetype === "luxury") return "slider";
    if (context.archetype === "medical") return "slider";
    return "cards";
  }
  if (widget === "promo_strip" && context.archetype === "restaurant") return "cards";
  if (widget === "categories" && context.archetype === "luxury") return "image_grid";
  return defaultVariant;
}

function normalizePages(
  websiteType: WebsiteType,
  candidatePages: Array<{ slug: string; name?: string; nav_label?: string }> | undefined
) {
  const sourcePages =
    candidatePages && candidatePages.length > 0
      ? candidatePages
      : websiteType === "catalog"
        ? [
            { slug: "/", name: "Home", nav_label: "Home" },
            { slug: "/products", name: "Products", nav_label: "Products" },
            { slug: "/about", name: "About", nav_label: "About" },
            { slug: "/contact", name: "Contact", nav_label: "Contact" },
          ]
        : [
            { slug: "/", name: "Home", nav_label: "Home" },
            { slug: "/services", name: "Services", nav_label: "Services" },
            { slug: "/about", name: "About", nav_label: "About" },
            { slug: "/contact", name: "Contact", nav_label: "Contact" },
          ];

  const allowed = new Set<string>([...ALLOWED_PAGE_SLUGS, "/blog"]);
  const map = new Map<string, { slug: string; name: string; nav_label: string }>();
  for (const page of sourcePages) {
    if (!allowed.has(page.slug)) continue;
    if (map.has(page.slug)) continue;
    map.set(page.slug, {
      slug: page.slug,
      name: page.name?.trim() || PAGE_NAME_DEFAULTS[page.slug] || fallbackSlugToName(page.slug),
      nav_label: page.nav_label?.trim() || page.name?.trim() || PAGE_NAME_DEFAULTS[page.slug] || fallbackSlugToName(page.slug),
    });
  }

  if (!map.has("/")) map.set("/", { slug: "/", name: "Home", nav_label: "Home" });
  if (!map.has("/contact")) {
    map.set("/contact", { slug: "/contact", name: "Contact", nav_label: "Contact" });
  }
  if (websiteType === "catalog" && !map.has("/products")) {
    map.set("/products", { slug: "/products", name: "Products", nav_label: "Products" });
  }

  return Array.from(map.values())
    .sort((a, b) => {
      const aRank = PAGE_ORDER.findIndex((slug) => slug === a.slug);
      const bRank = PAGE_ORDER.findIndex((slug) => slug === b.slug);
      const aValue = aRank === -1 ? Number.MAX_SAFE_INTEGER : aRank;
      const bValue = bRank === -1 ? Number.MAX_SAFE_INTEGER : bRank;
      return aValue - bValue;
    })
    .slice(0, 7);
}

function sectionSeedsByPageAndWidget(
  pages: Array<{ slug: string; sections?: Array<{ widget: string; props_seed?: Record<string, unknown> }> }>
) {
  const seeds: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const page of pages || []) {
    if (!page?.slug || !Array.isArray(page.sections)) continue;
    seeds[page.slug] = seeds[page.slug] || {};
    for (const section of page.sections) {
      if (!section?.widget) continue;
      seeds[page.slug][section.widget] = section.props_seed || {};
    }
  }
  return seeds;
}

function buildSectionsForSlug(args: {
  slug: string;
  websiteType: WebsiteType;
  designKit: DesignKitId;
  archetype: BusinessArchetype;
  recipeSections: readonly string[];
  seedMap: Record<string, Record<string, Record<string, unknown>>>;
}) {
  const parsedRecipe = args.recipeSections.map((item) => {
    const [widget, variant] = item.split(":");
    return { widget, variant };
  });
  const hasWidget = (name: string) => parsedRecipe.some((item) => item.widget === name);
  const byWidget = (name: string, fallbackVariant = "v1-classic") =>
    parsedRecipe.find((item) => item.widget === name) || { widget: name, variant: fallbackVariant };

  let composition = parsedRecipe;
  if (args.slug !== "/") {
    if (args.slug === "/contact") {
      composition = [byWidget("header"), hasWidget("contact") ? byWidget("contact", "form") : byWidget("cta", "v1-banner"), byWidget("footer", "v1-simple")];
    } else if (args.slug === "/about") {
      composition = [byWidget("header"), hasWidget("about") ? byWidget("about", "split") : byWidget("features", "cards"), hasWidget("testimonials") ? byWidget("testimonials", "cards") : byWidget("stats", "grid"), byWidget("cta", "v2-card"), byWidget("footer", "v1-simple")];
    } else if (args.slug === "/services") {
      composition = [byWidget("header"), hasWidget("services") ? byWidget("services", "grid") : byWidget("features", "icons"), hasWidget("steps") ? byWidget("steps", "steps") : byWidget("cta", "v1-banner"), byWidget("cta", "v1-banner"), byWidget("footer", "v1-simple")];
    } else if (args.slug === "/products") {
      composition = [
        byWidget("header", "v2-search"),
        hasWidget("categories") ? byWidget("categories", "icons_grid") : byWidget("products_grid", "grid_8"),
        byWidget("products_grid", "grid_8"),
        hasWidget("promo_strip") ? byWidget("promo_strip", "icons") : byWidget("cta", "v1-banner"),
        byWidget("footer", "v1-simple"),
      ];
    } else {
      composition = [byWidget("header"), hasWidget("cta") ? byWidget("cta", "v1-banner") : byWidget("features", "cards"), byWidget("footer", "v1-simple")];
    }
  }

  const seen = new Set<string>();
  return composition
    .filter((item) => {
      if (item.widget === "hero" && args.slug !== "/") return false;
      const dedupeKey = `${item.widget}:${item.variant}`;
      if (seen.has(dedupeKey) && item.widget !== "products_grid" && item.widget !== "blog_teasers") {
        return false;
      }
      seen.add(dedupeKey);
      return true;
    })
    .map((item) => ({
      widget: item.widget,
      variant: chooseVariant(item.widget, item.variant, {
        websiteType: args.websiteType,
        designKit: args.designKit,
        archetype: args.archetype,
        pageSlug: args.slug,
      }),
      props_seed: args.seedMap[args.slug]?.[item.widget] || {},
    }));
}

function computeRequiredChecklist(pages: Array<{ sections: Array<{ widget: string }> }>, websiteType: WebsiteType) {
  const widgets = pages.flatMap((page) => page.sections.map((section) => section.widget));
  const home = pages[0];
  const has = (widget: string) => widgets.includes(widget);
  const checklist: Record<string, boolean> = {
    header: has("header"),
    hero: home?.sections.some((section) => section.widget === "hero") || false,
  };
  if (websiteType === "info") {
    checklist.services_or_features = has("services") || has("features");
    checklist.credibility = has("testimonials") || has("stats");
    checklist.cta = has("cta");
    checklist.contact = has("contact");
    checklist.footer = has("footer");
  } else {
    checklist.categories = has("categories");
    checklist.products_grid = has("products_grid");
    checklist.promo_strip = has("promo_strip");
    checklist.contact_or_footer = has("contact") || has("footer");
  }
  return checklist;
}

function buildDeterministicLayoutPlan(
  input: LayoutPlanInput,
  modelPlan?: LayoutPlan
) {
  const websiteType = detectWebsiteType(input.prompt, input.website_type || modelPlan?.website_type);
  const archetype = detectBusinessArchetype(input.prompt);
  const designKit = selectDesignKit(input.prompt, websiteType);
  const stylePreset = stylePresetFromKit(designKit);
  const templatePack: TemplatePack = websiteType === "catalog" ? "CATALOG_PACK" : "INFO_PACK";
  const recipe =
    (modelPlan?.recipe_id
      ? [...INFO_RECIPES, ...CATALOG_RECIPES].find((candidate) => candidate.id === modelPlan.recipe_id)
      : undefined) || chooseRecipe(websiteType, archetype);

  const pages = normalizePages(
    websiteType,
    modelPlan?.pages?.map((page) => ({
      slug: page.slug,
      name: page.name,
      nav_label: page.nav_label,
    }))
  );
  const seedMap = sectionSeedsByPageAndWidget(modelPlan?.pages || []);
  const pagePlans = pages.map((page) => ({
    slug: page.slug as LayoutPlan["pages"][number]["slug"],
    name: page.name,
    nav_label: page.nav_label,
    sections: buildSectionsForSlug({
      slug: page.slug,
      websiteType,
      designKit,
      archetype,
      recipeSections: recipe.sections,
      seedMap,
    }),
  }));

  const unsupported = FORBIDDEN_CATALOG_FEATURE_KEYWORDS.filter((token) =>
    input.prompt.toLowerCase().includes(token)
  );
  const warnings = [
    ...(modelPlan?.warnings || []),
    ...(unsupported.length > 0 ? ["Marketing/catalog site only; advanced features not included."] : []),
  ];

  return parseAndValidateLayoutPlan({
    website_type: websiteType,
    designKit,
    style_preset: stylePreset,
    template_pack: templatePack,
    recipe_id: recipe.id,
    pages: pagePlans,
    required_sections_checklist: computeRequiredChecklist(pagePlans, websiteType),
    unsupported_features: [...new Set([...(modelPlan?.unsupported_features || []), ...unsupported])],
    warnings: [...new Set(warnings)],
  });
}

function fallbackLayoutPlan(input: LayoutPlanInput): LayoutPlan {
  const plan = buildDeterministicLayoutPlan(input);
  return {
    ...plan,
    warnings: [...new Set([...plan.warnings, "Used deterministic planner fallback."])],
  };
}

async function callLayoutPlannerModel(input: LayoutPlanInput, repairPayload?: unknown): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");

  const websiteType = detectWebsiteType(input.prompt, input.website_type);
  const recipeIds = websiteType === "catalog" ? CATALOG_RECIPES.map((r) => r.id) : INFO_RECIPES.map((r) => r.id);
  const templatePack = websiteType === "catalog" ? "CATALOG_PACK" : "INFO_PACK";

  const schema = {
    type: "object",
    additionalProperties: false,
    required: [
      "website_type",
      "designKit",
      "style_preset",
      "template_pack",
      "recipe_id",
      "pages",
      "required_sections_checklist",
      "unsupported_features",
      "warnings",
    ],
    properties: {
      website_type: { type: "string", enum: ["info", "catalog"] },
      designKit: { type: "string", enum: [...DESIGN_KIT_IDS] },
      style_preset: { type: "string", enum: Object.keys(STYLE_PRESETS) },
      template_pack: { type: "string", enum: ["INFO_PACK", "CATALOG_PACK"] },
      recipe_id: { type: "string", enum: recipeIds },
      pages: {
        type: "array",
        maxItems: 7,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["slug", "name", "nav_label", "sections"],
          properties: {
            slug: { type: "string", enum: [...ALLOWED_PAGE_SLUGS, "/blog"] },
            name: { type: "string" },
            nav_label: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["widget", "variant", "props_seed"],
                properties: {
                  widget: { type: "string" },
                  variant: { type: "string" },
                  props_seed: { type: "object", additionalProperties: true },
                },
              },
            },
          },
        },
      },
      required_sections_checklist: { type: "object", additionalProperties: { type: "boolean" } },
      unsupported_features: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
    },
  };

  const systemPrompt =
    "You output strict JSON only. Use only curated widgets/variants from the chosen template pack. " +
    "Do not include cart/checkout/payments/login/dashboard. " +
    "If user asks those, put in unsupported_features and add warning: Marketing/catalog site only; advanced features not included. " +
    "Ensure header on all pages and hero on home. " +
    "Pick designKit from allowed ids and keep sections deterministic.";

  const userPayload = repairPayload
    ? {
        mode: "repair",
        invalid_payload: repairPayload,
        instruction: "Fix JSON to match schema exactly and keep only allowed widgets/variants.",
      }
    : {
        mode: "plan",
        website_type: websiteType,
        template_pack: templatePack,
        prompt: input.prompt,
        locale: input.locale || "en",
        brand: input.brand,
        contact: input.contact,
        products: input.products || [],
      };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      input: [
        { role: "system", content: [{ type: "text", text: systemPrompt }] },
        { role: "user", content: [{ type: "text", text: JSON.stringify(userPayload) }] },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "layout_plan",
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Layout planner model error: ${res.status}`);
  }
  const data = await res.json();
  const outputText = data.output_text as string | undefined;
  if (outputText) return JSON.parse(outputText);
  const altText = data.output?.[0]?.content?.[0]?.text;
  if (altText) return JSON.parse(altText);
  throw new Error("Layout planner returned empty output");
}

export async function planLayout(input: LayoutPlanInput): Promise<LayoutPlanOutput> {
  const prompt = input.prompt?.trim() || "";
  if (!prompt) {
    const fallback = fallbackLayoutPlan({ ...input, prompt: "Business website" });
    return {
      layoutPlan: fallback,
      warnings: fallback.warnings,
      unsupported_features: fallback.unsupported_features,
    };
  }

  let modelPlan: LayoutPlan | undefined;
  let plannerWarnings: string[] = [];
  let plannerUnsupported: string[] = [];

  try {
    const raw = await callLayoutPlannerModel(input);
    const parsed = LayoutPlanSchema.safeParse(raw);
    if (parsed.success) {
      modelPlan = parseAndValidateLayoutPlan(parsed.data);
      plannerWarnings = modelPlan.warnings;
      plannerUnsupported = modelPlan.unsupported_features;
    } else {
      const repairedRaw = await callLayoutPlannerModel(input, raw);
      const repaired = LayoutPlanSchema.safeParse(repairedRaw);
      if (repaired.success) {
        modelPlan = parseAndValidateLayoutPlan(repaired.data);
        plannerWarnings = modelPlan.warnings;
        plannerUnsupported = modelPlan.unsupported_features;
      } else {
        plannerWarnings = ["Planner fallback was used due to invalid model output."];
      }
    }
  } catch (error) {
    plannerWarnings = ["Planner used fallback due to temporary AI error."];
  }

  const deterministicPlan = buildDeterministicLayoutPlan(input, modelPlan);
  const warnings = [...new Set([...deterministicPlan.warnings, ...plannerWarnings])];
  const unsupportedFeatures = [
    ...new Set([...deterministicPlan.unsupported_features, ...plannerUnsupported]),
  ];
  return {
    layoutPlan: { ...deterministicPlan, warnings, unsupported_features: unsupportedFeatures },
    warnings,
    unsupported_features: unsupportedFeatures,
  };
}
