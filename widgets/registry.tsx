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
import ProductGrid from "@/widgets/productGrid";

const businessTags = ["ecommerce", "informational"];

const goalLabels: Record<string, string> = {
  calls: "ზარებისთვის",
  leads: "ლიდებისთვის",
  bookings: "დაჯავშნებისთვის",
  sell: "გაყიდვებისთვის",
  visit: "ვიზიტებისთვის",
};

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
  | "productGrid"
  | "contact"
  | "footer";

export type WidgetCategory =
  | "სათაური"
  | "ჰერო"
  | "კონტენტი"
  | "სოციალური მტკიცებულება"
  | "კონტაქტი"
  | "ფუტერი";

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
      "v4-split-tagline",
      "v5-minimal",
      "v6-glass",
      "v7-dark",
      "v8-transparent",
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
  hero: {
    type: "hero",
    name: "ჰერო",
    category: "ჰერო",
    tags: [...businessTags, "headline", "cta"],
    variants: ["split-image-left", "split-image-right", "centered"],
    defaultProps: (input, index) => ({
      headline: `${input.businessName} შექმნილია ${goalLabels[input.goal] || "ზრდისთვის"}`,
      subheadline: input.description,
      ctaText: "ზარის დაჯავშნა",
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
    name: "ლოგოების ზოლი",
    category: "სოციალური მტკიცებულება",
    tags: [...businessTags, "logos"],
    variants: ["default"],
    defaultProps: () => ({
      title: "გუნდის ნდობა მთელ ქალაქში",
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
    name: "სერვისების ბადე",
    category: "კონტენტი",
    tags: [...businessTags, "services", "grid"],
    variants: ["cards", "icons"],
    defaultProps: (input) => ({
      title: `რას გაწვდის ${input.businessName}`,
      items: [
        { title: "მთავარი სერვისი", desc: "გამოცდილებაზე დაფუძნებული მკაფიო შედეგები.", icon: "sparkles" },
        { title: "სპეციალისტის მხარდაჭერა", desc: "კონკრეტულად თქვენს საჭიროებებზე მორგებული რჩევები.", icon: "shield" },
        { title: "სწრაფი რეაგირება", desc: "მოკლე ვადები და დროული უკუკავშირი.", icon: "bolt" },
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
    name: "მახასიათებლები",
    category: "კონტენტი",
    tags: [...businessTags, "features", "benefits"],
    variants: ["stacked"],
    defaultProps: () => ({
      title: "რატომ გვირჩევენ მომხმარებლები",
      items: [
        { title: "გამჭვირვალე ფასები", desc: "ზუსტად იცით რას მიიღებთ." },
        { title: "სწრაფი დაწყება", desc: "დაწყება 24 საათში." },
        { title: "პერსონალური მხარდაჭერა", desc: "გვერდით დაგიდგებით გაშვების შემდეგაც." },
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
    name: "მიმოხილვები",
    category: "სოციალური მტკიცებულება",
    tags: [...businessTags, "reviews"],
    variants: ["cards"],
    defaultProps: () => ({
      title: "კლიენტები გვაფასებენ",
      items: [
        {
          quote: "მათი გუნდი ყველაფერს მარტივად და სწრაფად აგვარებს.",
          name: "ავერი ლოუსონი",
          role: "ოპერაციების ხელმძღვანელი",
        },
        {
          quote: "ლიდები ერთ კვირაში გაორმაგდა.",
          name: "ჯორდან ლი",
          role: "დამფუძნებელი",
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
    name: "კითხვები",
    category: "კონტენტი",
    tags: [...businessTags, "faq"],
    variants: ["accordion"],
    defaultProps: () => ({
      title: "ხშირად დასმული კითხვები",
      items: [
        { q: "რამდენად სწრაფად შეგვიძლია გაშვება?", a: "უმეტეს შემთხვევაში 1 კვირაში." },
        { q: "შემიძლია კონტენტის შეცვლა მოგვიანებით?", a: "დიახ, ცვლილებები მარტივად კეთდება." },
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
    name: "გუნდი",
    category: "კონტენტი",
    tags: [...businessTags, "team"],
    variants: ["grid"],
    defaultProps: () => ({
      title: "გაიცანი გუნდი",
      members: [
        { name: "ტეილორ ბრუკსი", role: "მთავარი სპეციალისტი", bio: "10+ წლის გამოცდილება." },
        { name: "რაილი ჩენი", role: "კლიენტთა წარმატება", bio: "ფოკუსი შედეგებზე." },
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
    name: "ფასები",
    category: "კონტენტი",
    tags: [...businessTags, "pricing"],
    variants: ["tiers"],
    defaultProps: () => ({
      title: "მარტივი ფასები",
      tiers: [
        { name: "სტარტი", price: "$199", desc: "საწყისი გუნდებისთვის" },
        { name: "ზრდა", price: "$399", desc: "მასშტაბირებისთვის" },
        { name: "პრემიუმი", price: "ინდივიდუალური", desc: "კომპანიებისთვის მორგებული" },
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
    name: "ბლოგის პრევიუ",
    category: "კონტენტი",
    tags: [...businessTags, "blog"],
    variants: ["cards"],
    defaultProps: () => ({
      title: "ბოლო სიახლეები",
      posts: [
        { title: "როგორ ავაშენოთ ნდობა სწრაფად", date: "2 თებ", excerpt: "კრედიბილობის მოკლე გზამკვლევი." },
        { title: "კონვერსიისთვის დიზაინი", date: "18 იან", excerpt: "UX-ის ძირითადი ნაბიჯები." },
      ],
    }),
    editable: [
      { label: "Title", path: "title", type: "text" },
      { label: "Posts", path: "posts", type: "list" },
    ],
    Component: BlogPreview,
  },
  productGrid: {
    type: "productGrid",
    name: "პროდუქტები",
    category: "კონტენტი",
    tags: [...businessTags, "products", "ecommerce"],
    variants: ["cards"],
    defaultProps: (input, index) => ({
      title: "პროდუქტები",
      items: [
        {
          title: "პროდუქტის სახელი",
          price: "100 ლარი",
          image: { src: getPlaceholderImage(index), alt: `${input.businessName} პროდუქტი` },
        },
        {
          title: "პროდუქტის სახელი",
          price: "100 ლარი",
          image: { src: getPlaceholderImage(index + 1), alt: `${input.businessName} პროდუქტი` },
        },
        {
          title: "პროდუქტის სახელი",
          price: "100 ლარი",
          image: { src: getPlaceholderImage(index + 2), alt: `${input.businessName} პროდუქტი` },
        },
      ],
    }),
    editable: [
      { label: "სათაური", path: "title", type: "text" },
      { label: "ელემენტები", path: "items", type: "list" },
    ],
    Component: ProductGrid,
  },
  contact: {
    type: "contact",
    name: "კონტაქტი",
    category: "კონტაქტი",
    tags: [...businessTags, "contact"],
    variants: ["split", "centered"],
    defaultProps: (input) => ({
      title: "დაგვიკავშირდით",
      phone: input.contact.phone || "+995 (555) 55-55-55",
      email: input.contact.email || "hello@weblive.ai",
      address: input.contact.address || "მთავარი ქუჩა 123, ქალაქი",
      hours: input.contact.hours || "ორშ-პარ 09:00 - 18:00",
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
    name: "ფუტერი",
    category: "ფუტერი",
    tags: [...businessTags, "footer"],
    variants: ["stacked", "minimal"],
    defaultProps: (input) => ({
      brand: input.businessName,
      tagline: "კონვერსიაზე ორიენტირებული",
      links: [
        { label: "კონფიდენციალურობა", href: "/privacy" },
        { label: "პირობები", href: "/terms" },
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
