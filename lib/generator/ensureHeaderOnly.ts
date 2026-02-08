import { WizardInput, Site } from "@/lib/schema";
import { createWidgetProps, widgetRegistry } from "@/widgets/registry";

export function ensureHeaderOnly(site: Site, input: WizardInput): Site {
  const headerVariants = widgetRegistry.header.variants;
  const pickVariant = () =>
    headerVariants[Math.floor(Math.random() * headerVariants.length)] || "v1-classic";
  const selectedVariant = pickVariant();
  const heroVariants = widgetRegistry.hero?.variants || [];
  const heroVariant =
    heroVariants[Math.floor(Math.random() * heroVariants.length)] || "v1-split";

  const navLinks = site.pages.map((page) => ({ label: page.name, href: page.slug }));

  const pages = site.pages.map((page, index) => {
    const headerSection = page.sections.find((section) => section.widget === "header");
    const nextHeader = headerSection || {
      id: `sec_header_${index}_${Math.random().toString(36).slice(2, 6)}`,
      widget: "header",
      variant: selectedVariant,
      props: createWidgetProps("header", input, 0),
    };

    const heroSection =
      page.id === "home"
        ? page.sections.find((section) => section.widget === "hero") || {
            id: `sec_hero_${index}_${Math.random().toString(36).slice(2, 6)}`,
            widget: "hero",
            variant: heroVariant,
            props: createWidgetProps("hero", input, 0),
          }
        : null;

    return {
      ...page,
      sections: [
        {
          ...nextHeader,
          variant: selectedVariant,
        },
        ...(heroSection
          ? [
              {
                ...heroSection,
                props: {
                  ...createWidgetProps("hero", input, 0),
                  ...heroSection.props,
                },
              },
            ]
          : []),
      ],
    };
  });

  return {
    ...site,
    pages: pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => {
        if (section.widget !== "header") return section;
        return {
          ...section,
          props: {
            ...section.props,
            logo: section.props?.logo || input.logoUrl || "",
            nav: navLinks,
          },
        };
      }),
    })),
  };
}
