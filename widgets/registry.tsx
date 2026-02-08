import { WizardInput, Theme } from "@/lib/schema";
import Header from "@/widgets/header";
import Hero from "@/widgets/hero";

const businessTags = ["ecommerce", "informational"];

const goalLabels: Record<string, string> = {
  calls: "ზარებისთვის",
  leads: "ლიდებისთვის",
  bookings: "დაჯავშნებისთვის",
  sell: "გაყიდვებისთვის",
  visit: "ვიზიტებისთვის",
};

export type WidgetType = "header" | "hero";

export type WidgetCategory =
  | "სათაური"
  | "ჰირო";

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
    name: "სათაური",
    category: "სათაური",
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
      "v1-classic": "ვერსია 1",
      "v2-compact-right": "ვერსია 2",
      "v3-centered-logo": "ვერსია 3",
      "v6-glass": "ვერსია 4",
      "v9-bordered": "ვერსია 5",
      "v10-announcement": "ვერსია 6",
    },
    defaultProps: (input) => ({
      brand: input.businessName,
      nav: [
        { label: "მთავარი", href: "/" },
        { label: "სერვისები", href: "/services" },
        { label: "კონტაქტი", href: "/contact" },
      ],
      cta: { label: "დაწყება", href: "#contact" },
      tagline: "AI-ით შექმნილი ვებგვერდი",
      announcement: "ახალი შეთავაზება — 50% ფასდაკლება პირველ თვეზე",
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
    name: "ჰირო სექცია",
    category: "ჰირო",
    tags: [...businessTags, "hero"],
    variants: ["v1-split", "v2-full-bg", "v3-card", "v4-metrics"],
    variantLabels: {
      "v1-split": "ვერსია 1",
      "v2-full-bg": "ვერსია 2",
      "v3-card": "ვერსია 3",
      "v4-metrics": "ვერსია 4",
    },
    defaultProps: (input) => ({
      eyebrow: "⭐️ 5,000+ კმაყოფილი მომხმარებელი",
      headline: `${input.businessName} წარმატებისთვის`,
      subheadline:
        "გამორჩეული გამოცდილება, სუფთა დიზაინი და ძლიერი შედეგები თქვენი ბიზნესისთვის.",
      ctaPrimary: { label: "დაწყება", href: "#contact" },
      ctaSecondary: { label: "გაიგე მეტი", href: "#more" },
      bullets: ["99.9% uptime", "24/7 მხარდაჭერა", "პროფესიონალური გუნდი"],
      stats: [
        { label: "საწყისი წელი", value: "2020 წელი" },
        { label: "კლიენტები", value: "150+ კომპანია" },
        { label: "ტრაფიკი", value: "1M+ ვიზიტორი" },
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
