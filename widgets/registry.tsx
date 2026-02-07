import { WizardInput, Theme } from "@/lib/schema";
import { getPlaceholderImage } from "@/lib/placeholders";
import Header from "@/widgets/header";
import Hero from "@/widgets/hero";
import LogosStrip from "@/widgets/logosStrip";
import ServicesGrid from "@/widgets/servicesGrid";
import Features from "@/widgets/features";
import Testimonials from "@/widgets/testimonials";
import Faq from "@/widgets/faq";
import Team from "@/widgets/team";
import Pricing from "@/widgets/pricing";
import BlogPreview from "@/widgets/blogPreview";
import Contact from "@/widgets/contact";
import Footer from "@/widgets/footer";

const businessTags = [
  "clinic",
  "lawyer",
  "ecommerce",
  "restaurant",
  "agency",
  "generic",
];

export type WidgetType =
  | "header"
  | "hero"
  | "logosStrip"
  | "servicesGrid"
  | "features"
  | "testimonials"
  | "faq"
  | "team"
  | "pricing"
  | "blogPreview"
  | "contact"
  | "footer";

export type WidgetCategory =
  | "Header"
  | "Hero"
  | "Content"
  | "Social proof"
  | "Contact"
  | "Footer";

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
  Component: (props: { variant: string; props: any; theme: Theme }) => JSX.Element;
};

export const widgetRegistry: Record<WidgetType, WidgetDefinition> = {
  header: {
    type: "header",
    name: "Header",
    category: "Header",
    tags: [...businessTags, "navigation", "brand"],
    variants: ["centered", "split"],
    defaultProps: (input) => ({
      brand: input.businessName,
      nav: [
        { label: "Home", href: "/" },
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact" },
      ],
      cta: { label: "Get Started", href: "#contact" },
      logo: input.logoUrl || "",
    }),
    editable: [
      { label: "Brand", path: "brand", type: "text" },
      { label: "CTA Label", path: "cta.label", type: "text" },
      { label: "CTA Link", path: "cta.href", type: "text" },
      { label: "Logo URL", path: "logo", type: "image" },
    ],
    Component: Header,
  },
  hero: {
    type: "hero",
    name: "Hero",
    category: "Hero",
    tags: [...businessTags, "headline", "cta"],
    variants: ["split-image-left", "split-image-right", "centered"],
    defaultProps: (input, index) => ({
      headline: `${input.businessName} built for ${input.goal}`,
      subheadline: input.description,
      ctaText: "Book a call",
      ctaHref: "#contact",
      image: {
        src: getPlaceholderImage(index),
        alt: `${input.businessName} preview`,
      },
    }),
    editable: [
      { label: "Headline", path: "headline", type: "text" },
      { label: "Subheadline", path: "subheadline", type: "textarea" },
      { label: "CTA Text", path: "ctaText", type: "text" },
      { label: "CTA Link", path: "ctaHref", type: "text" },
      { label: "Hero Image", path: "image.src", type: "image" },
    ],
    Component: Hero,
  },
  logosStrip: {
    type: "logosStrip",
    name: "Logos Strip",
    category: "Social proof",
    tags: [...businessTags, "logos"],
    variants: ["default"],
    defaultProps: () => ({
      title: "Trusted by teams across the city",
      logos: ["Northwind", "Brightline", "Everwell", "Skyward"],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Logos", path: "logos", type: "list" },
    ],
    Component: LogosStrip,
  },
  servicesGrid: {
    type: "servicesGrid",
    name: "Services Grid",
    category: "Content",
    tags: [...businessTags, "services", "grid"],
    variants: ["cards", "icons"],
    defaultProps: (input) => ({
      title: `What ${input.businessName} delivers`,
      items: [
        { title: "Primary Service", desc: "Clear outcomes with expert care.", icon: "sparkles" },
        { title: "Specialist Support", desc: "Guidance tailored to your needs.", icon: "shield" },
        { title: "Fast Response", desc: "Quick turnarounds and follow-ups.", icon: "bolt" },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Items", path: "items", type: "list" },
    ],
    Component: ServicesGrid,
  },
  features: {
    type: "features",
    name: "Features",
    category: "Content",
    tags: [...businessTags, "features", "benefits"],
    variants: ["stacked"],
    defaultProps: () => ({
      title: "Why customers choose us",
      items: [
        { title: "Transparent pricing", desc: "Know exactly what to expect." },
        { title: "Fast onboarding", desc: "Get started within 24 hours." },
        { title: "Dedicated support", desc: "We stay with you after launch." },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Items", path: "items", type: "list" },
    ],
    Component: Features,
  },
  testimonials: {
    type: "testimonials",
    name: "Testimonials",
    category: "Social proof",
    tags: [...businessTags, "reviews"],
    variants: ["cards"],
    defaultProps: () => ({
      title: "Loved by clients",
      items: [
        {
          quote: "Their team made everything simple and fast.",
          name: "Avery Lawson",
          role: "Operations Lead",
        },
        {
          quote: "Our leads doubled within a week.",
          name: "Jordan Lee",
          role: "Founder",
        },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Items", path: "items", type: "list" },
    ],
    Component: Testimonials,
  },
  faq: {
    type: "faq",
    name: "FAQ",
    category: "Content",
    tags: [...businessTags, "faq"],
    variants: ["accordion"],
    defaultProps: () => ({
      title: "Frequently asked questions",
      items: [
        { q: "How fast can we launch?", a: "Most sites go live in a week." },
        { q: "Can I update content later?", a: "Yes, edits are simple and fast." },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Items", path: "items", type: "list" },
    ],
    Component: Faq,
  },
  team: {
    type: "team",
    name: "Team",
    category: "Content",
    tags: [...businessTags, "team"],
    variants: ["grid"],
    defaultProps: () => ({
      title: "Meet the team",
      members: [
        { name: "Taylor Brooks", role: "Lead Specialist", bio: "10+ years of expertise." },
        { name: "Riley Chen", role: "Client Success", bio: "Focused on customer outcomes." },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Members", path: "members", type: "list" },
    ],
    Component: Team,
  },
  pricing: {
    type: "pricing",
    name: "Pricing",
    category: "Content",
    tags: [...businessTags, "pricing"],
    variants: ["tiers"],
    defaultProps: () => ({
      title: "Simple pricing",
      tiers: [
        { name: "Starter", price: "$199", desc: "For early-stage teams" },
        { name: "Growth", price: "$399", desc: "For scaling operations" },
        { name: "Premium", price: "Custom", desc: "Tailored for enterprises" },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Tiers", path: "tiers", type: "list" },
    ],
    Component: Pricing,
  },
  blogPreview: {
    type: "blogPreview",
    name: "Blog Preview",
    category: "Content",
    tags: [...businessTags, "blog"],
    variants: ["cards"],
    defaultProps: () => ({
      title: "Latest insights",
      posts: [
        { title: "How to build trust quickly", date: "Feb 2", excerpt: "A short guide on credibility." },
        { title: "Designing for conversion", date: "Jan 18", excerpt: "Key UX moves to try." },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Posts", path: "posts", type: "list" },
    ],
    Component: BlogPreview,
  },
  contact: {
    type: "contact",
    name: "Contact",
    category: "Contact",
    tags: [...businessTags, "contact"],
    variants: ["split", "centered"],
    defaultProps: (input) => ({
      title: "Let’s talk",
      phone: input.contact.phone || "+1 (555) 555-5555",
      email: input.contact.email || "hello@weblive.ai",
      address: input.contact.address || "123 Main St, City",
      hours: input.contact.hours || "Mon-Fri 9am - 6pm",
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Phone", path: "phone", type: "text" },
      { label: "Email", path: "email", type: "text" },
      { label: "Address", path: "address", type: "text" },
      { label: "Hours", path: "hours", type: "text" },
    ],
    Component: Contact,
  },
  footer: {
    type: "footer",
    name: "Footer",
    category: "Footer",
    tags: [...businessTags, "footer"],
    variants: ["stacked", "minimal"],
    defaultProps: (input) => ({
      brand: input.businessName,
      tagline: "Designed to convert",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
      social: [
        { label: "Instagram", href: input.contact.socials?.instagram || "#" },
        { label: "LinkedIn", href: input.contact.socials?.linkedin || "#" },
      ],
    }),
    editable: [
      { label: "Brand", path: "brand", type: "text" },
      { label: "Tagline", path: "tagline", type: "text" },
      { label: "Links", path: "links", type: "list" },
      { label: "Social", path: "social", type: "list" },
    ],
    Component: Footer,
  },
};

export function createWidgetProps(widgetType: WidgetType, input: WizardInput, index: number) {
  return widgetRegistry[widgetType].defaultProps(input, index);
}

export function renderWidget(
  widgetType: WidgetType,
  variant: string,
  props: any,
  theme: Theme
) {
  const WidgetComponent = widgetRegistry[widgetType]?.Component;
  if (!WidgetComponent) {
    return null;
  }
  return <WidgetComponent variant={variant} props={props} theme={theme} />;
}
