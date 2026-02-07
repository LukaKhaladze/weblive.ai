import { WidgetDefinition } from "@/lib/types";

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: "header_v1",
    name: "Header v1",
    category: "Headers",
    tags: ["minimal", "clean"],
    fields: [
      { key: "brand", label: "Brand", type: "text" },
      { key: "link1", label: "Link 1", type: "text" },
      { key: "link2", label: "Link 2", type: "text" },
      { key: "link3", label: "Link 3", type: "text" }
    ],
    defaultContent: { brand: "Dental Clinic", link1: "სერვისები", link2: "ჩვენ შესახებ", link3: "კონტაქტი" }
  },
  {
    id: "hero_v1",
    name: "Hero v1",
    category: "Heroes",
    tags: ["medical", "split"],
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "subheadline", label: "Subheadline", type: "textarea" },
      { key: "cta", label: "CTA", type: "text" }
    ],
    defaultContent: {
      headline: "ჯანსაღი ღიმილი ყოველდღე",
      subheadline: "სანდო სტომატოლოგიური მომსახურება თანამედროვე ტექნოლოგიებით.",
      cta: "ჩანიშნე ვიზიტი"
    }
  },
  {
    id: "features_v1",
    name: "Features v1",
    category: "Features",
    tags: ["cards"],
    fields: [
      { key: "title1", label: "Title 1", type: "text" },
      { key: "title2", label: "Title 2", type: "text" },
      { key: "title3", label: "Title 3", type: "text" }
    ],
    defaultContent: { title1: "თანამედროვე აპარატურა", title2: "უსაფრთხო გარემო", title3: "გამოცდილი გუნდი" }
  },
  {
    id: "about_v1",
    name: "About v1",
    category: "About",
    tags: ["text"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" }
    ],
    defaultContent: { title: "ჩვენ შესახებ", body: "ჩვენი კლინიკა ზრუნავს ოჯახის სტომატოლოგიურ ჯანმრთელობაზე." }
  },
  {
    id: "services_v1",
    name: "Services v1",
    category: "Services",
    tags: ["list"],
    fields: [
      { key: "s1", label: "Service 1", type: "text" },
      { key: "s2", label: "Service 2", type: "text" },
      { key: "s3", label: "Service 3", type: "text" }
    ],
    defaultContent: { s1: "იმპლანტაცია", s2: "ორთოდონტია", s3: "ჰიგიენა" }
  },
  {
    id: "gallery_v1",
    name: "Gallery v1",
    category: "Portfolio / Gallery",
    tags: ["grid"],
    fields: [
      { key: "caption", label: "Caption", type: "text" }
    ],
    defaultContent: { caption: "კლინიკის გარემო" }
  },
  {
    id: "testimonials_v1",
    name: "Testimonials v1",
    category: "Testimonials",
    tags: ["quotes"],
    fields: [
      { key: "t1", label: "Quote 1", type: "text" },
      { key: "t2", label: "Quote 2", type: "text" }
    ],
    defaultContent: { t1: "საუკეთესო მომსახურება!", t2: "ძალიან კმაყოფილი ვარ." }
  },
  {
    id: "pricing_v1",
    name: "Pricing v1",
    category: "Pricing",
    tags: ["table"],
    fields: [
      { key: "plan1", label: "Plan 1", type: "text" },
      { key: "price1", label: "Price 1", type: "text" }
    ],
    defaultContent: { plan1: "საწყისი", price1: "150₾" }
  },
  {
    id: "faq_v1",
    name: "FAQ v1",
    category: "FAQ",
    tags: ["accordion"],
    fields: [
      { key: "q1", label: "Question 1", type: "text" },
      { key: "q2", label: "Question 2", type: "text" }
    ],
    defaultContent: { q1: "როგორ დავჯავშნო ვიზიტი?", q2: "რა არის სამუშაო საათები?" }
  },
  {
    id: "cta_v1",
    name: "CTA v1",
    category: "CTA",
    tags: ["button"],
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "button", label: "Button", type: "text" }
    ],
    defaultContent: { headline: "მიიღე კონსულტაცია დღეს", button: "დაგვიკავშირდით" }
  },
  {
    id: "footer_v1",
    name: "Footer v1",
    category: "Footers",
    tags: ["minimal"],
    fields: [
      { key: "copyright", label: "Copyright", type: "text" }
    ],
    defaultContent: { copyright: "© 2026 Dental Clinic" }
  }
];

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
