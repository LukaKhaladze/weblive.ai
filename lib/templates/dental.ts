import { SectionType } from "@/lib/types";

type DentalTemplate = {
  templateId: string;
  category: "Dental Clinic";
  sectionType:
    | "hero"
    | "trust_strip"
    | "about"
    | "services"
    | "why_us"
    | "testimonials"
    | "faq"
    | "contact";
  name: string;
  description: string;
  slotsSchema: Record<string, unknown>;
  defaultLayout?: Record<string, unknown>;
};

export const DENTAL_TEMPLATES: DentalTemplate[] = [
  {
    templateId: "hero_dental_split_01",
    category: "Dental Clinic",
    sectionType: "hero",
    name: "Split Hero",
    description: "Split hero with image and dual CTAs.",
    slotsSchema: {
      headline: "string",
      subtext: "string",
      ctaPrimary: { label: "string", href: "string" },
      ctaSecondary: { label: "string", href: "string" },
      imageHint: "string"
    }
  },
  {
    templateId: "hero_dental_centered_02",
    category: "Dental Clinic",
    sectionType: "hero",
    name: "Centered Hero",
    description: "Centered hero with background image.",
    slotsSchema: {
      headline: "string",
      subtext: "string",
      cta: { label: "string", href: "string" },
      backgroundImageHint: "string"
    }
  },
  {
    templateId: "trust_strip_dental_03",
    category: "Dental Clinic",
    sectionType: "trust_strip",
    name: "Trust Strip",
    description: "Badges for trust and certification.",
    slotsSchema: { badges: "string[4]" }
  },
  {
    templateId: "about_dental_simple_04",
    category: "Dental Clinic",
    sectionType: "about",
    name: "About Simple",
    description: "Simple about with image hint.",
    slotsSchema: { title: "string", paragraph: "string", imageHint: "string" }
  },
  {
    templateId: "services_dental_cards_05",
    category: "Dental Clinic",
    sectionType: "services",
    name: "Services Cards",
    description: "Three service cards with short text.",
    slotsSchema: { services: "{title, shortText}[3]" }
  },
  {
    templateId: "services_dental_icons_06",
    category: "Dental Clinic",
    sectionType: "services",
    name: "Services Icons",
    description: "Six service names with icons.",
    slotsSchema: { services: "string[6]" }
  },
  {
    templateId: "whyus_dental_07",
    category: "Dental Clinic",
    sectionType: "why_us",
    name: "Why Us",
    description: "Three benefits with short text.",
    slotsSchema: { benefits: "{title, shortText}[3]" }
  },
  {
    templateId: "testimonials_dental_08",
    category: "Dental Clinic",
    sectionType: "testimonials",
    name: "Testimonials",
    description: "Three patient testimonials.",
    slotsSchema: { testimonials: "{name, quote}[3]" }
  },
  {
    templateId: "faq_dental_09",
    category: "Dental Clinic",
    sectionType: "faq",
    name: "FAQ",
    description: "Five to six FAQ items.",
    slotsSchema: { faq: "{question, answer}[5-6]" }
  },
  {
    templateId: "contact_dental_10",
    category: "Dental Clinic",
    sectionType: "contact",
    name: "Contact",
    description: "Contact details and form CTA.",
    slotsSchema: {
      address: "string",
      phone: "string",
      workingHours: "string",
      formCtaLabel: "string"
    }
  }
];

export const DENTAL_SECTION_ORDER: SectionType[] = [
  "hero",
  "about",
  "services",
  "why_us",
  "testimonials",
  "faq",
  "contact"
];
