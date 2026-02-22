import { WizardInput, Site, SeoPayload } from "@/lib/schema";
import { recipes } from "@/lib/generator/recipes";
import { widgetRegistry, createWidgetProps, WidgetType } from "@/widgets/registry";

type GenerateOptions = {
  seed?: number;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seed?: number) {
  const fallback = Math.floor(Math.random() * 1_000_000_000);
  return mulberry32(seed ?? fallback);
}

function pick<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function createSectionId(index: number) {
  return `sec_${index}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildSeoPages(site: Site) {
  return site.pages.map((page) => ({
    slug: page.slug,
    title: page.seo.title,
    description: page.seo.description,
    keywords: page.seo.keywords,
  }));
}

export function generateRuleBasedSite(
  input: WizardInput,
  options: GenerateOptions = {}
): { site: Site; seo: SeoPayload } {
  const rng = createRng(options.seed);
  const categoryLabels: Record<string, string> = {
    ecommerce: "ecommerce",
    informational: "informational",
  };
  const goalLabels: Record<string, string> = {
    calls: "calls",
    leads: "leads",
    bookings: "bookings",
    sell: "sales",
    visit: "visits",
  };
  const recipe = recipes[input.category] ?? recipes.informational;
  const fontOptions = ["Space Grotesk", "Sora", "Manrope", "Urbanist", "Plus Jakarta Sans"];
  const radiusOptions = [12, 16, 20, 24];
  const buttonOptions: Array<"solid" | "outline"> = ["solid", "outline"];
  const theme = {
    primaryColor: input.brand.primaryColor,
    secondaryColor: input.brand.secondaryColor,
    fontFamily: pick(fontOptions, rng),
    radius: pick(radiusOptions, rng),
    buttonStyle: pick(buttonOptions, rng),
    designKit: "clean-minimal" as const,
  };

  function buildSections(base: WidgetType[]): WidgetType[] {
    return base.includes("header") ? ["header"] : [];
  }

  const pages = recipe.pages
    .filter((page) => input.pages.includes(page.id))
    .map((page, pageIndex) => {
      const baseSections = buildSections(page.sections);
      const sections = baseSections.map((widgetType, sectionIndex) => {
        const widget = widgetRegistry[widgetType];
        const variant = widget?.variants?.length
          ? pick(widget.variants, rng)
          : "default";
        return {
          id: createSectionId(pageIndex * 100 + sectionIndex),
          widget: widgetType,
          variant,
          props: createWidgetProps(widgetType, input, sectionIndex),
        };
      });

      return {
        id: page.id,
        slug: page.slug,
        name: page.name,
        seo: {
          title: `${input.businessName} | ${page.name}`,
          description: input.description,
          keywords: [
            categoryLabels[input.category] || "business",
            goalLabels[input.goal] || "growth",
            "local",
            "services",
          ],
        },
        sections,
      };
    });

  const navLinks = pages.map((page) => ({ label: page.name, href: page.slug }));
  const updatedPages = pages.map((page) => ({
    ...page,
    sections: page.sections.map((section) => {
      if (section.widget === "header") {
        return {
          ...section,
          props: {
            ...section.props,
            nav: navLinks,
          },
        };
      }
      return section;
    }),
  }));

  const site: Site = {
    theme,
    pages: updatedPages,
  };

  const seo: SeoPayload = {
    project: {
      businessName: input.businessName,
      category: input.category,
    },
    pages: buildSeoPages(site),
    recommendations: [
      "Make sure each page has a unique title (up to 60 characters).",
      "Add location-focused keywords for better local visibility.",
      "Use descriptive alt text for all images, including the logo.",
      "Keep meta descriptions within 120-160 characters.",
    ],
  };

  return { site, seo };
}
