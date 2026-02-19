import { SeoPayload, Site } from "@/lib/schema";
import { SiteSpec, normalizeSiteSpec } from "@/schemas/siteSpec";

const SORT_ORDER = ["/services", "/products", "/pricing", "/portfolio", "/about"];

const SLUG_TO_PAGE_ID: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/products": "products",
  "/pricing": "pricing",
  "/portfolio": "portfolio",
  "/contact": "contact",
};

const SITE_TYPE_DESCRIPTOR: Record<SiteSpec["site_type"], string> = {
  agency: "creative agency",
  restaurant: "restaurant & dining",
  clinic: "modern clinic",
  portfolio: "portfolio website",
  saas: "software product",
  event: "event experience",
  real_estate: "real estate services",
  education: "education platform",
  nonprofit: "nonprofit mission",
  local_service: "local services",
  ecommerce: "online store",
  blog: "blog & insights",
};

const GOAL_CTA: Record<SiteSpec["primary_goal"], string> = {
  calls: "Call Now",
  leads: "Get Quote",
  bookings: "Book Now",
  sales: "Shop Now",
  downloads: "Download",
};

const HERO_BULLETS: Record<SiteSpec["site_type"], [string, string, string]> = {
  agency: ["Clear project scope", "Fast launch cycles", "Consistent brand experience"],
  restaurant: ["Simple menu discovery", "Quick reservation path", "Location-first experience"],
  clinic: ["Clear treatment overview", "Trusted provider messaging", "Easy contact path"],
  portfolio: ["Showcase best work", "Highlight expertise", "Direct client inquiry"],
  saas: ["Clear value proposition", "Feature-focused structure", "Conversion-first CTA"],
  event: ["Event details upfront", "Timeline clarity", "Fast registration intent"],
  real_estate: ["Listing clarity", "Neighborhood context", "Direct inquiry options"],
  education: ["Program overview", "Outcome-focused copy", "Easy enrollment contact"],
  nonprofit: ["Mission-first narrative", "Trust-building structure", "Clear support actions"],
  local_service: ["Service clarity", "Local trust signals", "Direct contact CTA"],
  ecommerce: ["Product-first layout", "Simple discovery flow", "Clear buying intent"],
  blog: ["Topic clarity", "Scannable structure", "Consistent publishing cadence"],
};

function safePageName(slug: string, navLabel?: string): string {
  if (navLabel && navLabel.trim()) return navLabel.trim();
  if (slug === "/") return "Home";
  return slug
    .replace(/^\//, "")
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function sortPages(pages: SiteSpec["pages"]): SiteSpec["pages"] {
  const home = pages.find((p) => p.slug === "/");
  const contact = pages.find((p) => p.slug === "/contact");
  const middle = pages.filter((p) => p.slug !== "/" && p.slug !== "/contact");

  const sortedMiddle = [...middle].sort((a, b) => {
    const ai = SORT_ORDER.indexOf(a.slug);
    const bi = SORT_ORDER.indexOf(b.slug);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank === bRank) return 0;
    return aRank - bRank;
  });

  const result: SiteSpec["pages"] = [];
  if (home) result.push(home);
  result.push(...sortedMiddle);
  if (contact) result.push(contact);
  return result;
}

function buildKeywords(spec: SiteSpec, pageName: string): string[] {
  const base = [
    spec.business.name,
    spec.site_type.replace("_", " "),
    pageName,
    spec.contact?.city,
    spec.contact?.country,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .map((value) => value.replace(/[^a-z0-9\s-]/g, "").trim())
    .filter(Boolean);

  const deduped = Array.from(new Set(base));
  return deduped.slice(0, 8);
}

function buildHeaderProps(spec: SiteSpec, nav: Array<{ label: string; href: string }>) {
  const ctaLabel = spec.primary_goal === "sales" && spec.site_type !== "ecommerce" ? "Get Started" : GOAL_CTA[spec.primary_goal];
  const announcement = /sale|discount|offer|promo/i.test(spec.prompt_summary)
    ? "Limited-time offer available now"
    : undefined;

  return {
    brand: spec.business.name,
    logo: spec.brand?.logoUrl || "",
    nav,
    cta: {
      label: ctaLabel,
      href: "/contact",
    },
    tagline: spec.business.tagline || "AI-generated website",
    ...(announcement ? { announcement } : {}),
  };
}

function buildHeroProps(spec: SiteSpec, hasAbout: boolean, hasServices: boolean) {
  const secondaryHref = hasAbout ? "/about" : hasServices ? "/services" : "#more";
  const ctaLabel = spec.primary_goal === "sales" && spec.site_type !== "ecommerce" ? "Get Started" : GOAL_CTA[spec.primary_goal];

  const eyebrow = spec.contact?.city
    ? `Serving ${spec.contact.city}`
    : spec.site_type === "local_service"
    ? "Local service you can rely on"
    : "Built for modern businesses";

  return {
    eyebrow,
    headline: `${spec.business.name} — ${SITE_TYPE_DESCRIPTOR[spec.site_type]}`,
    subheadline: spec.business.description || spec.prompt_summary,
    ctaPrimary: { label: ctaLabel, href: "/contact" },
    ctaSecondary: { label: "Learn More", href: secondaryHref },
    bullets: [...HERO_BULLETS[spec.site_type]],
    stats: [
      { label: "Established", value: "—" },
      { label: "Location", value: spec.contact?.city || "—" },
      { label: "Focus", value: spec.site_type.replace("_", " ") },
    ],
    image: { src: "/placeholders/scene-1.svg", alt: "hero" },
    gallery: [{ src: "/placeholders/scene-2.svg", alt: "gallery" }],
    backgroundImage: "/placeholders/scene-5.svg",
  };
}

export function renderFromSpec(rawSpec: SiteSpec): { site: Site; seo: SeoPayload; siteSpec: SiteSpec } {
  const spec = normalizeSiteSpec(rawSpec);

  const orderedPages = sortPages(spec.pages).slice(0, 5);
  const nav = orderedPages.map((page) => ({
    label: safePageName(page.slug, page.nav_label),
    href: page.slug,
  }));

  const hasAbout = orderedPages.some((p) => p.slug === "/about");
  const hasServices = orderedPages.some((p) => p.slug === "/services");

  const pages = orderedPages.map((page) => {
    const pageId = SLUG_TO_PAGE_ID[page.slug] || page.slug.replace("/", "") || "home";
    const pageName = safePageName(page.slug, page.nav_label);

    const sections: Array<{ id: string; widget: string; variant: string; props: Record<string, unknown> }> = [
      {
        id: `sec_header_${pageId}`,
        widget: "header",
        variant: "v1-classic",
        props: buildHeaderProps(spec, nav),
      },
    ];

    if (page.slug === "/") {
      sections.push({
        id: "sec_hero_home",
        widget: "hero",
        variant: "v4-metrics",
        props: buildHeroProps(spec, hasAbout, hasServices),
      });
    }

    return {
      id: pageId,
      slug: page.slug,
      name: pageName,
      seo: {
        title: `${spec.business.name} | ${pageName}`,
        description: (page.purpose || spec.prompt_summary || "Marketing website page").slice(0, 160),
        keywords: buildKeywords(spec, pageName),
      },
      sections,
    };
  });

  const site: Site = {
    theme: {
      primaryColor: spec.brand?.primaryColor || "#1c3d7a",
      secondaryColor: spec.brand?.secondaryColor || "#f4b860",
      fontFamily: spec.brand?.fontFamily || "Manrope",
      radius: 24,
      buttonStyle: "solid",
    },
    pages,
  };

  const seo: SeoPayload = {
    project: {
      businessName: spec.business.name,
      category: spec.site_type === "ecommerce" ? "ecommerce" : "informational",
    },
    pages: pages.map((page) => ({
      slug: page.slug,
      title: page.seo.title,
      description: page.seo.description,
      keywords: page.seo.keywords,
    })),
    recommendations: [
      ...spec.warnings,
      ...(spec.unsupported_features.length
        ? [
            `Unsupported feature requests were excluded: ${spec.unsupported_features.join(", ")}`,
          ]
        : []),
    ],
  };

  return { site, seo, siteSpec: spec };
}
