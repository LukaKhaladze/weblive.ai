import { z } from "zod";

export const ALLOWED_PAGE_SLUGS = [
  "/",
  "/about",
  "/services",
  "/products",
  "/pricing",
  "/portfolio",
  "/contact",
] as const;

export const COMPLEX_UNSUPPORTED_KEYWORDS = [
  "login",
  "sign in",
  "sign-in",
  "auth",
  "authentication",
  "payments",
  "payment",
  "checkout",
  "marketplace",
  "booking engine",
  "dashboard",
  "portal",
  "admin panel",
] as const;

export const SAFE_SUPPORTED_FEATURES = [
  "marketing_pages",
  "lead_capture",
  "contact_section",
  "seo_metadata",
  "analytics_placeholders",
  "gallery_sections",
  "product_showcase",
] as const;

const HexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);

const PageSchema = z.object({
  slug: z.enum(ALLOWED_PAGE_SLUGS),
  nav_label: z.string().trim().min(1).max(40),
  purpose: z.string().trim().min(1).max(160),
});

export const SiteSpecSchema = z
  .object({
    prompt_summary: z.string().trim().min(1).max(240),
    site_type: z.enum([
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
    ]),
    primary_goal: z.enum(["calls", "leads", "bookings", "sales", "downloads"]),
    tone: z.enum(["professional", "friendly", "premium", "bold", "minimal", "playful"]),
    locale: z.string().trim().default("en"),
    business: z.object({
      name: z.string().trim().min(1).max(80),
      tagline: z.string().trim().max(120).optional(),
      description: z.string().trim().max(400).optional(),
    }),
    contact: z
      .object({
        phone: z.string().trim().max(40).optional(),
        email: z.string().trim().max(120).optional(),
        address: z.string().trim().max(160).optional(),
        city: z.string().trim().max(80).optional(),
        country: z.string().trim().max(80).optional(),
      })
      .optional(),
    brand: z
      .object({
        primaryColor: HexColorSchema.optional(),
        secondaryColor: HexColorSchema.optional(),
        fontFamily: z.string().trim().max(80).optional(),
        logoUrl: z.string().trim().url().optional(),
      })
      .optional(),
    pages: z.array(PageSchema).min(1).max(5),
    requested_features: z.array(z.string().trim().min(1).max(120)).optional(),
    supported_features: z.array(z.string().trim().min(1).max(120)).default([]),
    unsupported_features: z.array(z.string().trim().min(1).max(120)).default([]),
    warnings: z.array(z.string().trim().min(1).max(240)).default([]),
  })
  .strict();

export type SiteSpec = z.infer<typeof SiteSpecSchema>;

const CLAIM_PATTERNS = [
  /\b#1\b/i,
  /\bguaranteed\b/i,
  /\bcure\b/i,
  /\brisk[- ]?free\b/i,
  /\bno[- ]?risk\b/i,
  /\bdouble your money\b/i,
];

function stripUnsafeClaims(value: string): string {
  let next = value;
  for (const pattern of CLAIM_PATTERNS) {
    next = next.replace(pattern, "");
  }
  return next.replace(/\s{2,}/g, " ").trim();
}

function dedupeBy<T, K>(items: T[], getKey: (item: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function normalizeSiteSpec(spec: SiteSpec): SiteSpec {
  const warnings = [...spec.warnings];

  const requestedRaw = (spec.requested_features ?? []).map((item) => item.toLowerCase());
  const requestedFromPages = spec.pages.map((p) => p.purpose.toLowerCase());
  const requestedFromSummary = [spec.prompt_summary.toLowerCase()];
  const requestedAll = [...requestedRaw, ...requestedFromPages, ...requestedFromSummary];

  const unsupportedDetected: string[] = [];
  for (const token of COMPLEX_UNSUPPORTED_KEYWORDS) {
    if (requestedAll.some((item) => item.includes(token))) {
      unsupportedDetected.push(token);
    }
  }

  const userUnsupported = (spec.unsupported_features ?? []).map((item) => item.toLowerCase());
  const unsupported_features = dedupeBy([...userUnsupported, ...unsupportedDetected], (v) => v);

  if (unsupported_features.length > 0) {
    warnings.push(
      "Complex app features requested. Generator will produce a marketing website only."
    );
  }

  const supportedFromInput = (spec.supported_features ?? []).map((item) => item.toLowerCase());
  const supported_features = dedupeBy(
    [
      ...supportedFromInput.filter((item) =>
        SAFE_SUPPORTED_FEATURES.includes(item as (typeof SAFE_SUPPORTED_FEATURES)[number])
      ),
      "marketing_pages",
      "seo_metadata",
      "contact_section",
    ],
    (v) => v
  );

  let pages = dedupeBy(spec.pages, (page) => page.slug).slice(0, 5);

  if (!pages.some((page) => page.slug === "/")) {
    pages.unshift({ slug: "/", nav_label: "Home", purpose: "Main landing page" });
  }

  if (!pages.some((page) => page.slug === "/contact")) {
    if (pages.length >= 5) pages = pages.slice(0, 4);
    pages.push({ slug: "/contact", nav_label: "Contact", purpose: "Contact and inquiry page" });
  }

  if (spec.site_type === "ecommerce" && !pages.some((page) => page.slug === "/products")) {
    if (pages.length >= 5) pages = pages.slice(0, 4);
    pages.splice(1, 0, {
      slug: "/products",
      nav_label: "Products",
      purpose: "Product listing page",
    });
  }

  const combinedText = [spec.prompt_summary, spec.business.tagline ?? "", spec.business.description ?? ""].join(" ");
  const hasUnsafeClaims = CLAIM_PATTERNS.some((re) => re.test(combinedText));
  if (hasUnsafeClaims) {
    warnings.push("Unsafe marketing claims were removed or neutralized.");
  }

  return {
    ...spec,
    prompt_summary: hasUnsafeClaims ? stripUnsafeClaims(spec.prompt_summary) : spec.prompt_summary,
    business: {
      ...spec.business,
      tagline: spec.business.tagline
        ? hasUnsafeClaims
          ? stripUnsafeClaims(spec.business.tagline)
          : spec.business.tagline
        : undefined,
      description: spec.business.description
        ? hasUnsafeClaims
          ? stripUnsafeClaims(spec.business.description)
          : spec.business.description
        : undefined,
    },
    pages: pages.slice(0, 5),
    supported_features,
    unsupported_features,
    warnings: dedupeBy(warnings, (v) => v),
  };
}
