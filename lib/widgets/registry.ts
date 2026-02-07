import { WidgetDefinition, WidgetCategory, WidgetType } from "@/lib/types";

export const WIDGET_CATEGORIES = [
  "All",
  "Headers",
  "Heroes",
  "Features",
  "About",
  "Services",
  "Portfolio / Gallery",
  "Testimonials",
  "Pricing",
  "FAQ",
  "CTA",
  "Footers"
] as const;

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: "header_minimal",
    name: "Header Minimal",
    category: "Headers",
    widgetType: "Header",
    variant: "minimal",
    tags: ["clean", "minimal"],
    editableFields: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "links", label: "Links", type: "list" }
    ],
    defaultProps: {
      brand: "Dental Clinic",
      links: ["სერვისები", "ჩვენ შესახებ", "კონტაქტი"]
    }
  },
  {
    id: "header_centered",
    name: "Header Centered",
    category: "Headers",
    widgetType: "Header",
    variant: "centered",
    tags: ["centered"],
    editableFields: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "links", label: "Links", type: "list" }
    ],
    defaultProps: {
      brand: "Dental Clinic",
      links: ["სერვისები", "ექიმები", "კონტაქტი"]
    }
  },
  {
    id: "hero_split_right",
    name: "Hero Split Right",
    category: "Heroes",
    widgetType: "Hero",
    variant: "splitImageRight",
    tags: ["split"],
    editableFields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "subheadline", label: "Subheadline", type: "textarea" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      { key: "ctaHref", label: "CTA Link", type: "url" },
      { key: "imageHint", label: "Image Hint", type: "text" }
    ],
    defaultProps: {
      headline: "ჯანსაღი ღიმილი ყოველდღე",
      subheadline: "თანამედროვე სტომატოლოგიური მომსახურება გამოცდილ გუნდთან ერთად.",
      ctaLabel: "ჩანიშნე ვიზიტი",
      ctaHref: "/contact",
      imageHint: "დენტალური კლინიკის ინტერიერი"
    }
  },
  {
    id: "hero_centered_overlay",
    name: "Hero Centered",
    category: "Heroes",
    widgetType: "Hero",
    variant: "centeredOverlay",
    tags: ["centered"],
    editableFields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "subheadline", label: "Subheadline", type: "textarea" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      { key: "ctaHref", label: "CTA Link", type: "url" }
    ],
    defaultProps: {
      headline: "თანამედროვე სტომატოლოგია თბილისში",
      subheadline: "პროფესიონალური გუნდი და კომფორტული გარემო.",
      ctaLabel: "კონსულტაცია",
      ctaHref: "/contact"
    }
  },
  {
    id: "trust_row",
    name: "Trust Badges Row",
    category: "Features",
    widgetType: "TrustBadges",
    variant: "row",
    tags: ["badges"],
    editableFields: [{ key: "badges", label: "Badges", type: "list" }],
    defaultProps: {
      badges: [
        "ლიცენზირებული ექიმები",
        "სტერილური გარემო",
        "დამტკიცებული მასალები",
        "თანამედროვე აპარატურა"
      ]
    }
  },
  {
    id: "trust_pill",
    name: "Trust Badges Pill",
    category: "Features",
    widgetType: "TrustBadges",
    variant: "pill",
    tags: ["pill"],
    editableFields: [{ key: "badges", label: "Badges", type: "list" }],
    defaultProps: {
      badges: ["უსაფრთხო პროცედურები", "მრავალწლიანი გამოცდილება", "სანდო შედეგები", "ღია ფასები"]
    }
  },
  {
    id: "about_text_image",
    name: "About Text + Image",
    category: "About",
    widgetType: "About",
    variant: "textImage",
    tags: ["image"],
    editableFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "imageHint", label: "Image Hint", type: "text" }
    ],
    defaultProps: {
      title: "ჩვენ შესახებ",
      body: "ჩვენი კლინიკა ორიენტირებულია ოჯახის სტომატოლოგიურ ჯანმრთელობაზე და კომფორტზე.",
      imageHint: "ექიმის კონსულტაცია"
    }
  },
  {
    id: "about_text_only",
    name: "About Text Only",
    category: "About",
    widgetType: "About",
    variant: "textOnly",
    tags: ["text"],
    editableFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" }
    ],
    defaultProps: {
      title: "კლინიკის ისტორია",
      body: "პროფესიონალი გუნდი, თანამედროვე ტექნოლოგიები და მუდმივი ზრუნვა."
    }
  },
  {
    id: "services_cards3",
    name: "Services Cards (3)",
    category: "Services",
    widgetType: "Services",
    variant: "cards3",
    tags: ["cards"],
    editableFields: [{ key: "services", label: "Services", type: "list" }],
    defaultProps: {
      services: [
        { title: "იმპლანტაცია", description: "მდგრადი და ბუნებრივი შედეგი" },
        { title: "ორთოდონტია", description: "კბილების გასწორება სხვადასხვა ასაკში" },
        { title: "ჰიგიენა", description: "პროფილაქტიკური მოვლა და წმენდა" }
      ]
    }
  },
  {
    id: "services_cards6",
    name: "Services Cards (6)",
    category: "Services",
    widgetType: "Services",
    variant: "cards6",
    tags: ["grid"],
    editableFields: [{ key: "services", label: "Services", type: "list" }],
    defaultProps: {
      services: [
        { title: "იმპლანტაცია", description: "მდგრადი შედეგი" },
        { title: "ორთოდონტია", description: "ესთეტიკური ღიმილი" },
        { title: "თერაპია", description: "კბილების მკურნალობა" },
        { title: "ქირურგია", description: "უსაფრთხო პროცედურები" },
        { title: "ჰიგიენა", description: "პროფილაქტიკური მოვლა" },
        { title: "ბრექსები", description: "მორგებული გეგმები" }
      ]
    }
  },
  {
    id: "services_icon_row",
    name: "Services Icon Row",
    category: "Services",
    widgetType: "Services",
    variant: "iconRow",
    tags: ["icons"],
    editableFields: [{ key: "items", label: "Items", type: "list" }],
    defaultProps: {
      items: ["კონსულტაცია", "იმპლანტაცია", "ორთოდონტია", "ესთეტიკა", "ჰიგიენა", "ბავშვთა სტომატოლოგია"]
    }
  },
  {
    id: "why_cards3",
    name: "Why Us (3 Cards)",
    category: "Features",
    widgetType: "WhyUs",
    variant: "3cards",
    tags: ["benefits"],
    editableFields: [{ key: "benefits", label: "Benefits", type: "list" }],
    defaultProps: {
      benefits: [
        { title: "გამოცდილი გუნდი", description: "პაციენტზე ორიენტირებული მიდგომა" },
        { title: "უსაფრთხო გარემო", description: "სტერილური სტანდარტები" },
        { title: "სანდო შედეგი", description: "გრძელვადიანი მოვლა" }
      ]
    }
  },
  {
    id: "stats_numbers_row",
    name: "Stats Numbers",
    category: "Features",
    widgetType: "Stats",
    variant: "numbersRow",
    tags: ["numbers"],
    editableFields: [{ key: "stats", label: "Stats", type: "list" }],
    defaultProps: {
      stats: [
        { value: "5000+", label: "კმაყოფილი პაციენტი" },
        { value: "10+", label: "წლიანი გამოცდილება" },
        { value: "24/7", label: "კონსულტაციის მხარდაჭერა" }
      ]
    }
  },
  {
    id: "testimonials_cards",
    name: "Testimonials Cards",
    category: "Testimonials",
    widgetType: "Testimonials",
    variant: "cards",
    tags: ["cards"],
    editableFields: [{ key: "testimonials", label: "Testimonials", type: "list" }],
    defaultProps: {
      testimonials: [
        { name: "ნინო ქ.", quote: "საუკეთესო მომსახურება და მეგობრული გარემო." },
        { name: "ლაშა თ.", quote: "პროფესიონალური გუნდი და სანდო შედეგი." },
        { name: "ეკა მ.", quote: "დიდი მადლობა ყურადღებისთვის." }
      ]
    }
  },
  {
    id: "testimonials_slider",
    name: "Testimonials Slider",
    category: "Testimonials",
    widgetType: "Testimonials",
    variant: "sliderSimple",
    tags: ["slider"],
    editableFields: [{ key: "testimonials", label: "Testimonials", type: "list" }],
    defaultProps: {
      testimonials: [
        { name: "კმაყოფილი პაციენტი", quote: "თბილი მომსახურება და სწრაფი შედეგი." },
        { name: "რეკომენდაციით მოსული", quote: "სანდო კლინიკა თბილისში." },
        { name: "ადგილობრივი კლიენტი", quote: "მაქსიმალური კომფორტი ვიზიტზე." }
      ]
    }
  },
  {
    id: "pricing_plans3",
    name: "Pricing Plans",
    category: "Pricing",
    widgetType: "Pricing",
    variant: "plans3",
    tags: ["pricing"],
    editableFields: [{ key: "plans", label: "Plans", type: "list" }],
    defaultProps: {
      plans: [
        { name: "საწყისი", price: "₾150", features: ["კონსულტაცია", "გეგმვა"] },
        { name: "სტანდარტი", price: "₾350", features: ["მკურნალობა", "ჰიგიენა"] },
        { name: "პრო", price: "₾600", features: ["კომპლექსური სერვისი", "მონიტორინგი"] }
      ]
    }
  },
  {
    id: "faq_accordion",
    name: "FAQ Accordion",
    category: "FAQ",
    widgetType: "FAQ",
    variant: "accordion",
    tags: ["faq"],
    editableFields: [{ key: "faq", label: "FAQ", type: "list" }],
    defaultProps: {
      faq: [
        { question: "როგორ დავჯავშნო ვიზიტი?", answer: "დაგვიკავშირდით ტელეფონით ან ონლაინ ფორმით." },
        { question: "რა არის სამუშაო საათები?", answer: "ყოველდღე 10:00-დან 20:00-მდე." },
        { question: "არის თუ არა ფასები წინასწარ განსაზღვრული?", answer: "კონსულტაციაზე ვადგენთ გეგმას." }
      ]
    }
  },
  {
    id: "cta_banner_split",
    name: "CTA Banner Split",
    category: "CTA",
    widgetType: "CTA",
    variant: "bannerSplit",
    tags: ["banner"],
    editableFields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "subheadline", label: "Subheadline", type: "textarea" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      { key: "ctaHref", label: "CTA Link", type: "url" }
    ],
    defaultProps: {
      headline: "დაგეგმეთ ვიზიტი დღესვე",
      subheadline: "ჩატარდება ინდივიდუალური კონსულტაცია და მკურნალობის გეგმა.",
      ctaLabel: "დაგვიკავშირდით",
      ctaHref: "/contact"
    }
  },
  {
    id: "cta_banner_centered",
    name: "CTA Banner Centered",
    category: "CTA",
    widgetType: "CTA",
    variant: "bannerCentered",
    tags: ["centered"],
    editableFields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      { key: "ctaHref", label: "CTA Link", type: "url" }
    ],
    defaultProps: {
      headline: "მიიღე უფასო კონსულტაცია",
      ctaLabel: "ჩანიშვნა",
      ctaHref: "/contact"
    }
  },
  {
    id: "contact_form_map",
    name: "Contact Form + Map",
    category: "CTA",
    widgetType: "Contact",
    variant: "formMap",
    tags: ["contact"],
    editableFields: [
      { key: "address", label: "Address", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "workingHours", label: "Working Hours", type: "text" },
      { key: "formCtaLabel", label: "Form CTA", type: "text" }
    ],
    defaultProps: {
      address: "თბილისი, ვაკე",
      phone: "+995 555 12 34 56",
      email: "info@clinic.ge",
      workingHours: "ყოველდღე 10:00-დან 20:00-მდე",
      formCtaLabel: "გაგზავნა",
      formLabels: ["სახელი", "ტელეფონი", "შეტყობინება"]
    }
  },
  {
    id: "contact_form_only",
    name: "Contact Form Only",
    category: "CTA",
    widgetType: "Contact",
    variant: "formOnly",
    tags: ["form"],
    editableFields: [
      { key: "address", label: "Address", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "formCtaLabel", label: "Form CTA", type: "text" }
    ],
    defaultProps: {
      address: "თბილისი, საბურთალო",
      phone: "+995 555 00 11 22",
      formCtaLabel: "შეტყობინების გაგზავნა",
      formLabels: ["სახელი", "ტელეფონი", "შეტყობინება"]
    }
  },
  {
    id: "footer_columns",
    name: "Footer Columns",
    category: "Footers",
    widgetType: "Footer",
    variant: "columns",
    tags: ["columns"],
    editableFields: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "links", label: "Links", type: "list" }
    ],
    defaultProps: {
      brand: "Dental Clinic",
      links: ["ჩვენ შესახებ", "სერვისები", "კონტაქტი", "პოლიტიკა"]
    }
  },
  {
    id: "footer_simple",
    name: "Footer Simple",
    category: "Footers",
    widgetType: "Footer",
    variant: "simple",
    tags: ["simple"],
    editableFields: [{ key: "copyright", label: "Copyright", type: "text" }],
    defaultProps: {
      copyright: "© 2026 Dental Clinic. ყველა უფლება დაცულია."
    }
  }
];

export const ALLOWED_WIDGETS = WIDGET_DEFINITIONS.reduce<Record<WidgetType, string[]>>(
  (acc, def) => {
    acc[def.widgetType] = acc[def.widgetType] || [];
    acc[def.widgetType].push(def.variant);
    return acc;
  },
  {} as Record<WidgetType, string[]>
);

export function getWidgetDefinition(widgetType: WidgetType, variant: string) {
  return WIDGET_DEFINITIONS.find(
    (def) => def.widgetType === widgetType && def.variant === variant
  );
}
