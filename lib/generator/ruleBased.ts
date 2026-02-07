import { WizardInput, Site, SeoPayload } from "@/lib/schema";
import { recipes } from "@/lib/generator/recipes";
import { widgetRegistry, createWidgetProps } from "@/widgets/registry";

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

export function generateRuleBasedSite(input: WizardInput): { site: Site; seo: SeoPayload } {
  const recipe = recipes[input.category] ?? recipes.generic;
  const theme = {
    primaryColor: input.brand.primaryColor,
    secondaryColor: input.brand.secondaryColor,
    fontFamily: "Space Grotesk",
    radius: 16,
    buttonStyle: "solid" as const,
  };

  const pages = recipe.pages
    .filter((page) => input.pages.includes(page.id))
    .map((page, pageIndex) => {
      const sections = page.sections.map((widgetType, sectionIndex) => {
        const widget = widgetRegistry[widgetType];
        const variant = widget?.variants?.[0] ?? "default";
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
          keywords: [input.category, input.goal, "local", "services"],
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
      if (section.widget === "footer") {
        return {
          ...section,
          props: {
            ...section.props,
            links: navLinks.slice(0, 3),
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
      "Ensure each page has a unique title under 60 characters.",
      "Add location-specific keywords to improve local search visibility.",
      "Use descriptive alt text for all images, including the logo.",
      "Keep meta descriptions between 120-160 characters.",
    ],
  };

  return { site, seo };
}
