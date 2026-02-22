import { SeoPayload, Site } from "@/lib/schema";
import { LayoutPlan, parseAndValidateLayoutPlan, SECTION_PROPS_SCHEMAS } from "@/schemas/layoutPlan";
import { STYLE_PRESETS, TemplatePack } from "@/schemas/sectionLibrary";
import { resolveDesignKit } from "@/schemas/designKits";

type RenderOverrides = {
  brand?: { logo_url?: string; colors?: string[] };
  contact?: { phone?: string; email?: string; address?: string };
  products?: { name: string; price?: string; imageUrl?: string }[];
  businessName?: string;
  prompt?: string;
};

const MIDDLE_ORDER = ["/services", "/products", "/pricing", "/portfolio", "/about", "/blog"];

const PAGE_ID_BY_SLUG: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/products": "products",
  "/pricing": "pricing",
  "/portfolio": "portfolio",
  "/contact": "contact",
  "/blog": "blog",
};

function defaultPageName(slug: string) {
  if (slug === "/") return "Home";
  return slug
    .replace(/^\//, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sortPages<T extends { slug: string }>(pages: T[]) {
  const home = pages.find((page) => page.slug === "/");
  const contact = pages.find((page) => page.slug === "/contact");
  const middle = pages.filter((page) => page.slug !== "/" && page.slug !== "/contact");
  middle.sort((a, b) => {
    const aIndex = MIDDLE_ORDER.indexOf(a.slug);
    const bIndex = MIDDLE_ORDER.indexOf(b.slug);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return aRank - bRank;
  });

  return [home, ...middle, contact].filter(Boolean) as T[];
}

function toSectionId(widget: string, pageId: string, index: number) {
  return `sec_${widget}_${pageId}_${index + 1}`;
}

function defaultProps(widget: string, variant: string, context: {
  businessName: string;
  nav: { label: string; href: string }[];
  logo: string;
  contact: { phone?: string; email?: string; address?: string };
  products: { name: string; price?: string; imageUrl?: string }[];
  prompt: string;
}) {
  const cta = { label: "Get Started", href: "/contact" };
  const image = { src: "/placeholders/scene-1.svg", alt: "Image" };
  const fallbackProducts =
    context.products.length > 0
      ? context.products
      : [
          { name: "Featured Product", price: "$99", imageUrl: "/placeholders/scene-2.svg" },
          { name: "Popular Product", price: "$149", imageUrl: "/placeholders/scene-3.svg" },
        ];

  switch (widget) {
    case "header":
      return {
        brand: context.businessName,
        logo: context.logo,
        nav: context.nav,
        cta,
        tagline: "AI website builder",
        announcement: variant === "v10-announcement" ? "Limited-time launch offer" : "",
      };
    case "hero":
      return {
        eyebrow: "Built for growth",
        headline: `${context.businessName} website`,
        subheadline: context.prompt || "Modern website generated from your prompt.",
        ctaPrimary: cta,
        ctaSecondary: { label: "Learn More", href: "/about" },
        bullets: ["Fast launch", "Easy editing", "Brand-consistent design"],
        stats: [
          { label: "Focus", value: "Conversion-first" },
          { label: "Type", value: "Marketing" },
          { label: "Mode", value: "Editable" },
        ],
        image,
        gallery: [
          { src: "/placeholders/scene-2.svg", alt: "Gallery 1" },
          { src: "/placeholders/scene-3.svg", alt: "Gallery 2" },
        ],
        backgroundImage: "/placeholders/scene-5.svg",
        products: fallbackProducts.map((product, index) => ({
          name: product.name,
          price: product.price || "",
          imageUrl: product.imageUrl || `/placeholders/scene-${(index % 3) + 2}.svg`,
          href: `/products/${index + 1}`,
        })),
      };
    case "services":
      return {
        title: "Services",
        items: [
          { title: "Service One", desc: "Clear outcomes for your business.", icon: "sparkles" },
          { title: "Service Two", desc: "Built for quality and speed.", icon: "bolt" },
          { title: "Service Three", desc: "Reliable execution and support.", icon: "shield" },
        ],
      };
    case "features":
    case "promo_strip":
      return {
        title: widget === "features" ? "Why choose us" : "Why customers buy from us",
        items: [
          { title: "Premium quality", desc: "Consistent standards across all offerings." },
          { title: "Trusted support", desc: "Fast help when you need it." },
          { title: "Transparent process", desc: "Clear expectations and results." },
        ],
      };
    case "stats":
      return {
        title: "Results",
        items: [
          { label: "Projects", value: "—" },
          { label: "Clients", value: "—" },
          { label: "Satisfaction", value: "—" },
        ],
      };
    case "testimonials":
      return {
        title: "What clients say",
        items: [
          { quote: "Great service and communication.", name: "Client One", role: "Founder" },
          { quote: "Professional and reliable team.", name: "Client Two", role: "Manager" },
        ],
      };
    case "steps":
      return {
        title: "How it works",
        items: [
          { title: "Discover", desc: "We identify what your audience needs." },
          { title: "Build", desc: "We implement a clear, conversion-ready structure." },
          { title: "Grow", desc: "You iterate with full editing control." },
        ],
      };
    case "about":
      return {
        title: `About ${context.businessName}`,
        body: context.prompt || "We deliver consistent quality and long-term support.",
        image,
      };
    case "faq":
      return {
        title: "Frequently asked questions",
        items: [
          { q: "How fast can we launch?", a: "Most projects can be launched in days, not weeks." },
          { q: "Can we edit content?", a: "Yes, all core text and images remain editable." },
        ],
      };
    case "team":
      return {
        title: "Our team",
        members: [
          { name: "Team Member", role: "Lead", bio: "Focused on quality delivery." },
          { name: "Team Member", role: "Specialist", bio: "Focused on client outcomes." },
        ],
      };
    case "cta":
      return {
        title: "Ready to get started?",
        body: "Tell us your goals and we will help you move faster.",
        cta,
      };
    case "contact":
      return {
        title: "Contact us",
        phone: context.contact.phone || "",
        email: context.contact.email || "",
        address: context.contact.address || "",
        hours: "Mon–Fri, 10:00–18:00",
      };
    case "footer":
      return {
        brand: context.businessName,
        tagline: "Built with Weblive.ai",
        links: context.nav,
        social: [
          { label: "LinkedIn", href: "#" },
          { label: "Instagram", href: "#" },
        ],
      };
    case "categories":
      return {
        title: "Categories",
        items: [
          { title: "Category One", image, href: "/products" },
          { title: "Category Two", image: { src: "/placeholders/scene-2.svg", alt: "Category 2" }, href: "/products" },
        ],
      };
    case "products_grid":
    case "products_carousel":
      return {
        title: "Products",
        items: fallbackProducts.map((product, index) => ({
          title: product.name,
          price: product.price || "",
          desc: "",
          image: {
            src: product.imageUrl || `/placeholders/scene-${(index % 3) + 2}.svg`,
            alt: product.name,
          },
          href: `/products/${index + 1}`,
        })),
      };
    case "banners":
      return {
        title: "Featured collection",
        body: "Discover selected products and seasonal highlights.",
        image,
        items: [{ src: "/placeholders/scene-2.svg", alt: "Banner 1" }, { src: "/placeholders/scene-3.svg", alt: "Banner 2" }],
      };
    case "brands_strip":
      return {
        title: "Trusted brands",
        logos: ["Brand One", "Brand Two", "Brand Three"],
      };
    case "newsletter":
      return {
        title: "Get updates",
        body: "Receive product highlights and launch notes.",
        cta: { label: "Subscribe", href: "/contact" },
      };
    case "blog_teasers":
      return {
        title: "From our blog",
        posts: [
          { title: "Design trends", date: "Today", excerpt: "What matters most this quarter.", image, href: "/blog" },
          { title: "Product insights", date: "This week", excerpt: "How to choose the right setup.", image: { src: "/placeholders/scene-3.svg", alt: "Blog 2" }, href: "/blog" },
        ],
      };
    default:
      return {};
  }
}

function parseSectionProps(
  pack: TemplatePack,
  widget: string,
  seed: Record<string, unknown>,
  defaults: Record<string, unknown>
) {
  const schema = SECTION_PROPS_SCHEMAS[pack]?.[widget];
  if (!schema) return { ...defaults, ...seed };
  return schema.parse({ ...defaults, ...seed });
}

function injectInvariants(site: Site) {
  for (const page of site.pages) {
    const headerIndex = page.sections.findIndex((section) => section.widget === "header");
    if (headerIndex > 0) {
      const [header] = page.sections.splice(headerIndex, 1);
      page.sections.unshift(header);
    }
    if (page.slug === "/") {
      const heroIndex = page.sections.findIndex((section) => section.widget === "hero");
      if (heroIndex > 1) {
        const [hero] = page.sections.splice(heroIndex, 1);
        page.sections.splice(1, 0, hero);
      }
    }
  }
}

export function renderFromPlan(rawPlan: unknown, overrides: RenderOverrides = {}) {
  const layoutPlan = parseAndValidateLayoutPlan(rawPlan);
  const designKit = resolveDesignKit(layoutPlan.designKit);
  const sortedPages = sortPages(layoutPlan.pages);
  const businessName = overrides.businessName || "Weblive.ai";
  const nav = sortedPages.map((page) => ({
    label: page.nav_label || page.name || defaultPageName(page.slug),
    href: page.slug,
  }));
  const logo = overrides.brand?.logo_url || "/placeholders/weblive.png";

  const pages = sortedPages.map((page) => {
    const pageId = PAGE_ID_BY_SLUG[page.slug] || page.slug.replace(/\W+/g, "") || "page";
    const sections = page.sections.map((slot, index) => {
      const props = parseSectionProps(
        layoutPlan.template_pack,
        slot.widget,
        slot.props_seed || {},
        defaultProps(slot.widget, slot.variant, {
          businessName,
          nav,
          logo,
          contact: overrides.contact || {},
          products: overrides.products || [],
          prompt: overrides.prompt || "",
        })
      );

      if (slot.widget === "header") {
        (props as Record<string, unknown>).logo = logo;
        (props as Record<string, unknown>).brand = businessName;
        (props as Record<string, unknown>).nav = nav;
      }

      return {
        id: toSectionId(slot.widget, pageId, index),
        widget: slot.widget,
        variant: slot.variant,
        props,
      };
    });

    return {
      id: pageId,
      slug: page.slug,
      name: page.name || defaultPageName(page.slug),
      seo: {
        title: `${businessName} | ${page.name || defaultPageName(page.slug)}`,
        description: `${page.name || defaultPageName(page.slug)} page for ${businessName}`.slice(0, 160),
        keywords: [businessName, page.name || defaultPageName(page.slug), layoutPlan.website_type].filter(Boolean),
      },
      sections,
    };
  });

  const preset = STYLE_PRESETS[layoutPlan.style_preset];
  const site: Site = {
    theme: {
      primaryColor: overrides.brand?.colors?.[0] || designKit.tokens.primary || preset.primaryColor,
      secondaryColor: overrides.brand?.colors?.[1] || designKit.tokens.secondary || preset.secondaryColor,
      fontFamily: designKit.typography.fontBody || preset.fontFamily,
      radius: designKit.tokens.radius || preset.radius,
      buttonStyle: preset.buttonStyle,
      designKit: layoutPlan.designKit,
    },
    pages,
  };
  injectInvariants(site);

  const seo: SeoPayload = {
    project: {
      businessName,
      category: layoutPlan.website_type === "catalog" ? "ecommerce" : "informational",
    },
    pages: site.pages.map((page) => ({
      slug: page.slug,
      title: page.seo.title,
      description: page.seo.description,
      keywords: page.seo.keywords,
    })),
    recommendations: [...layoutPlan.warnings],
  };

  return { site, seo, layoutPlan };
}
