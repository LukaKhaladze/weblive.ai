import { WizardInput, Theme } from "@/lib/schema";
import Header from "@/widgets/header";
import Hero from "@/widgets/hero";

const businessTags = ["ecommerce", "informational"];

const goalLabels: Record<string, string> = {
  calls: "for calls",
  leads: "for leads",
  bookings: "for bookings",
  sell: "for sales",
  visit: "for visits",
};

export type WidgetType = "header" | "hero";

export type WidgetCategory =
  | "Header"
  | "Hero";

export type EditableField = {
  label: string;
  path: string;
  type: "text" | "textarea" | "image" | "list";
};

export type WidgetDefinition = {
  type: WidgetType;
  name: string;
  category: WidgetCategory;
  tags: string[];
  variants: string[];
  variantLabels?: Record<string, string>;
  defaultProps: (input: WizardInput, index: number) => Record<string, any>;
  editable: EditableField[];
  Component: (props: {
    variant: string;
    props: any;
    theme: Theme;
    editable?: boolean;
    onEdit?: (path: string, value: any) => void;
    onImageUpload?: (path: string, file: File, kind?: "logo" | "images") => void;
  }) => JSX.Element;
};

export const widgetRegistry: Record<WidgetType, WidgetDefinition> = {
  header: {
    type: "header",
    name: "Header",
    category: "Header",
    tags: [...businessTags, "navigation", "brand"],
    variants: [
      "v1-classic",
      "v2-compact-right",
      "v3-centered-logo",
      "v6-glass",
      "v9-bordered",
      "v10-announcement",
    ],
    variantLabels: {
      "v1-classic": "Version 1",
      "v2-compact-right": "Version 2",
      "v3-centered-logo": "Version 3",
      "v6-glass": "Version 4",
      "v9-bordered": "Version 5",
      "v10-announcement": "Version 6",
    },
    defaultProps: (input) => ({
      brand: input.businessName,
      nav: [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
      cta: { label: input.primaryCta || "Get Started", href: "#contact" },
      tagline: "AI-generated website",
      announcement: "New Offer — 50% off first month",
      logo: input.logoUrl || "",
    }),
    editable: [
      { label: "Brand", path: "brand", type: "text" },
      { label: "CTA Label", path: "cta.label", type: "text" },
      { label: "CTA Link", path: "cta.href", type: "text" },
      { label: "Tagline", path: "tagline", type: "text" },
      { label: "Announcement", path: "announcement", type: "text" },
      { label: "Logo URL", path: "logo", type: "image" },
    ],
    Component: Header,
  },
  hero: {
    type: "hero",
    name: "Hero Section",
    category: "Hero",
    tags: [...businessTags, "hero"],
    variants: ["v1-split", "v2-full-bg", "v3-card", "v4-metrics"],
    variantLabels: {
      "v1-split": "Version 1",
      "v2-full-bg": "Version 2",
      "v3-card": "Version 3",
      "v4-metrics": "Version 4",
    },
    defaultProps: (input) => ({
      eyebrow: input.location ? `📍 ${input.location}` : "⭐️ 5,000+ happy customers",
      headline: `${input.businessName} — ${input.tone || "modern"} online store`,
      subheadline: input.description,
      ctaPrimary: { label: input.primaryCta || "Get Started", href: "#contact" },
      ctaSecondary: { label: "Learn More", href: "#more" },
      bullets: (input.productCategories || input.services)
        ? (input.productCategories || input.services)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 3)
        : ["Trending products", "High quality", "Fast delivery"],
      stats: [
        { label: "Since", value: "2020" },
        { label: "Clients", value: "150+ companies" },
        { label: "Traffic", value: "1M+ visitors" },
      ],
      products:
        input.products && input.products.length > 0
          ? input.products.map((product, index) => ({
              name: product.name,
              price: product.price,
              imageUrl:
                product.imageUrl ||
                `/placeholders/scene-${(index % 4) + 2}.svg`,
              href: `/products/${index + 1}`,
            }))
          : [
              {
                name: "Product 1",
                price: "$100",
                imageUrl: "/placeholders/scene-2.svg",
                href: "/products/1",
              },
            ],
      image: { src: "/placeholders/scene-1.svg", alt: "hero" },
      gallery: [
        { src: "/placeholders/scene-2.svg", alt: "gallery 1" },
        { src: "/placeholders/scene-3.svg", alt: "gallery 2" },
        { src: "/placeholders/scene-4.svg", alt: "gallery 3" },
      ],
      backgroundImage: "/placeholders/scene-5.svg",
    }),
    editable: [
      { label: "Headline", path: "headline", type: "text" },
      { label: "Subheadline", path: "subheadline", type: "textarea" },
      { label: "CTA Label", path: "ctaPrimary.label", type: "text" },
      { label: "CTA Link", path: "ctaPrimary.href", type: "text" },
      { label: "Image", path: "image.src", type: "image" },
      { label: "Background", path: "backgroundImage", type: "image" },
    ],
    Component: Hero,
  },
};

export function createWidgetProps(widgetType: WidgetType, input: WizardInput, index: number) {
  return widgetRegistry[widgetType].defaultProps(input, index);
}

export function renderWidget(
  widgetType: WidgetType,
  variant: string,
  props: any,
  theme: Theme,
  editable?: boolean,
  onEdit?: (path: string, value: any) => void,
  onImageUpload?: (path: string, file: File, kind?: "logo" | "images") => void
) {
  const WidgetComponent = widgetRegistry[widgetType]?.Component;
  if (!WidgetComponent) {
    return null;
  }
  return (
    <WidgetComponent
      variant={variant}
      props={props}
      theme={theme}
      editable={editable}
      onEdit={onEdit}
      onImageUpload={onImageUpload}
    />
  );
}
