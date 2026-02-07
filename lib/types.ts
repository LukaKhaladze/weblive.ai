export type Language = "ka" | "en";

export type SectionType =
  | "hero"
  | "trust_strip"
  | "about"
  | "services"
  | "why_us"
  | "testimonials"
  | "faq"
  | "contact";

export type UIBlock =
  | { type: "heading"; value: string }
  | { type: "text"; value: string }
  | { type: "bullets"; items: string[] }
  | { type: "image"; alt: string; hint: string }
  | { type: "button"; label: string; href: string }
  | { type: "form"; fields: string[] };

export type SectionUI = {
  variant:
    | "hero"
    | "simple"
    | "cards"
    | "list"
    | "split"
    | "faqAccordion"
    | "contactForm"
    | "pricingTable"
    | "teamGrid"
    | "blogList";
  blocks: UIBlock[];
};

export type Blueprint = {
  site: {
    businessName: string;
    category: string;
    city: string;
    tone: string;
    language: Language;
  };
  theme: {
    styleKeywords: string[];
    colorSuggestions: string[];
    fontSuggestions: string[];
    primaryColor?: string;
    secondaryColor?: string;
  };
  recommendedPages: string[];
  pages: Array<{
    slug: "home";
    title: string;
    design: {
      visualStyle: string;
      layoutNotes: string;
      spacing: string;
      palette: string[];
      typography: string[];
      imagery: string[];
      components: string[];
    };
    sections: Array<{
      type: SectionType;
      packId?: string;
      templateId?: string;
      slots?: Record<string, unknown>;
      heading: string;
      content: string;
      bullets: string[];
      cta: {
        label: string;
        href: string;
      };
      ui?: SectionUI;
    }>;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
};

export type GeneratorInputs = {
  businessName: string;
  category: string;
  city: string;
  tone: string;
  language: Language;
  prompt: string;
  targetPage: string;
  businessType: "services" | "products" | "both";
  industrySubcategory: string;
  targetAudience:
    | "მოზრდილები"
    | "ბავშვები"
    | "ოჯახი"
    | "ბიზნესი/კორპორატიული"
    | "ყველა";
  pricePositioning: "ბიუჯეტური" | "საშუალო" | "პრემიუმი";
  primaryGoal:
    | "ზარები/კონსულტაცია"
    | "ონლაინ დაჯავშნა"
    | "პროდუქტის გაყიდვა"
    | "ლიდების შეგროვება";
  hasBooking: boolean;
  hasDelivery: boolean;
  addressArea: string;
  workingHours: string;
  phone: string;
  socialLinks: string;
  primaryColor: string;
  secondaryColor: string;
  logoDataUrl?: string;
  designVariationSeed: string;
  version: number;
  packId: "dental_medical_blue" | "dental_clean_minimal";
};

export type Project = {
  id: string;
  createdAt: string;
  inputs: GeneratorInputs;
  blueprint: Blueprint;
  widgetPages?: WidgetPage[];
};

export type WidgetField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url";
};

export type WidgetDefinition = {
  id: string;
  name: string;
  category:
    | "Headers"
    | "Heroes"
    | "Features"
    | "About"
    | "Services"
    | "Portfolio / Gallery"
    | "Testimonials"
    | "Pricing"
    | "FAQ"
    | "CTA"
    | "Footers";
  tags?: string[];
  thumbnail?: string;
  fields: WidgetField[];
  defaultContent: Record<string, string>;
};

export type WidgetInstance = {
  id: string;
  widgetId: string;
  name: string;
  category: WidgetDefinition["category"];
  content: Record<string, string>;
  createdAt: string;
};

export type WidgetPage = {
  id: string;
  title: string;
  widgets: WidgetInstance[];
};
