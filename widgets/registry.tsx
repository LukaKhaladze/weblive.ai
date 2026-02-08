import { WizardInput, Theme } from "@/lib/schema";
import Header from "@/widgets/header";

const businessTags = ["ecommerce", "informational"];

const goalLabels: Record<string, string> = {
  calls: "ზარებისთვის",
  leads: "ლიდებისთვის",
  bookings: "დაჯავშნებისთვის",
  sell: "გაყიდვებისთვის",
  visit: "ვიზიტებისთვის",
};

export type WidgetType = "header";

export type WidgetCategory =
  | "სათაური";

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
  defaultProps: (input: WizardInput, index: number) => Record<string, any>;
  editable: EditableField[];
  Component: (props: {
    variant: string;
    props: any;
    theme: Theme;
    editable?: boolean;
    onEdit?: (path: string, value: any) => void;
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
  onEdit?: (path: string, value: any) => void
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
    />
  );
}
