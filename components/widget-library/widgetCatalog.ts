import { WIDGET_DEFINITIONS } from "@/lib/widgets/registry";

export type WidgetCatalogItem = {
  id: string;
  title: string;
  category: string;
  widgetType: string;
  variant: string;
  tags: string[];
  previewPropsKa: Record<string, unknown>;
  previewPropsEn: Record<string, unknown>;
};

const previewData = {
  ka: {
    headerLinks: ["მთავარი", "სერვისები", "კონტაქტი"],
    heroHeadline: "სტომატოლოგიური კლინიკა თბილისში",
    heroSub: "თანამედროვე მომსახურება და პროფესიონალური გუნდი.",
    services: [
      { title: "იმპლანტაცია", description: "მდგრადი შედეგი" },
      { title: "ორთოდონტია", description: "ესთეტიკური ღიმილი" },
      { title: "გათეთრება", description: "ბუნებრივი ბზინვარება" }
    ],
    services6: [
      { title: "იმპლანტაცია", description: "მდგრადი შედეგი" },
      { title: "ორთოდონტია", description: "ესთეტიკური ღიმილი" },
      { title: "თერაპია", description: "კბილების მოვლა" },
      { title: "ქირურგია", description: "უსაფრთხო პროცედურები" },
      { title: "ჰიგიენა", description: "პროფილაქტიკა" },
      { title: "ბრექსები", description: "მორგებული გეგმა" }
    ],
    testimonials: [
      { name: "ნინო ქ.", quote: "ძალიან კმაყოფილი ვარ მომსახურებით." },
      { name: "ლაშა თ.", quote: "სანდო კლინიკა და თბილი გარემო." },
      { name: "ეკა მ.", quote: "პროფესიონალური გუნდი." }
    ],
    faq: [
      { question: "როგორ დავჯავშნო ვიზიტი?", answer: "დაგვიკავშირდით ან შეავსეთ ფორმა." },
      { question: "რა არის სამუშაო საათები?", answer: "ყოველდღე 10:00-დან 20:00-მდე." }
    ]
  },
  en: {
    headerLinks: ["Home", "Services", "Contact"],
    heroHeadline: "Dental clinic in Tbilisi",
    heroSub: "Modern care with a professional team.",
    services: [
      { title: "Implants", description: "Reliable results" },
      { title: "Orthodontics", description: "Confident smiles" },
      { title: "Whitening", description: "Natural shine" }
    ],
    services6: [
      { title: "Implants", description: "Reliable results" },
      { title: "Orthodontics", description: "Confident smiles" },
      { title: "Therapy", description: "Dental care" },
      { title: "Surgery", description: "Safe procedures" },
      { title: "Hygiene", description: "Prevention" },
      { title: "Braces", description: "Custom plans" }
    ],
    testimonials: [
      { name: "Nino K.", quote: "Great service and friendly staff." },
      { name: "Lasha T.", quote: "Trusted clinic in the city." },
      { name: "Eka M.", quote: "Professional team." }
    ],
    faq: [
      { question: "How do I book?", answer: "Call us or submit the form." },
      { question: "Working hours?", answer: "Daily 10:00–20:00." }
    ]
  }
};

export function getWidgetPreviewProps(
  widgetType: string,
  variant: string,
  language: "ka" | "en"
) {
  const data = previewData[language];
  switch (widgetType) {
    case "Header":
      return {
        brand: language === "ka" ? "სტომატოლოგია" : "Dental Clinic",
        links: data.headerLinks
      };
    case "Hero":
      return {
        headline: data.heroHeadline,
        subheadline: data.heroSub,
        ctaLabel: language === "ka" ? "ჩანიშნე ვიზიტი" : "Book a visit",
        ctaHref: "/contact",
        imageHint: language === "ka" ? "კლინიკის ფოტო" : "Clinic image"
      };
    case "TrustBadges":
      return {
        badges:
          language === "ka"
            ? ["ლიცენზირებული ექიმები", "სტერილური გარემო", "სანდო შედეგი", "თანამედროვე აპარატურა"]
            : ["Licensed doctors", "Sterile environment", "Trusted results", "Modern equipment"]
      };
    case "About":
      return {
        title: language === "ka" ? "ჩვენ შესახებ" : "About",
        body:
          language === "ka"
            ? "ჩვენი გუნდი გთავაზობთ თანამედროვე სტომატოლოგიურ მომსახურებას."
            : "We provide modern dental care with a friendly team.",
        imageHint: language === "ka" ? "ექიმის პორტრეტი" : "Doctor portrait"
      };
    case "Services":
      if (variant === "cards6") {
        return { services: data.services6 };
      }
      if (variant === "iconRow") {
        return {
          items:
            language === "ka"
              ? ["იმპლანტაცია", "ორთოდონტია", "ჰიგიენა", "თერაპია", "ბრექსები", "ბავშვები"]
              : ["Implants", "Orthodontics", "Hygiene", "Therapy", "Braces", "Kids"]
        };
      }
      return { services: data.services };
    case "WhyUs":
      return {
        benefits:
          language === "ka"
            ? [
                { title: "გამოცდილი გუნდი", description: "ყურადღებიანი მომსახურება" },
                { title: "უსაფრთხო გარემო", description: "სტერილური სტანდარტები" },
                { title: "სანდო შედეგი", description: "გრძელვადიანი მოვლა" }
              ]
            : [
                { title: "Experienced team", description: "Patient-first care" },
                { title: "Safe environment", description: "Sterile standards" },
                { title: "Trusted results", description: "Long-term care" }
              ]
      };
    case "Stats":
      return {
        stats:
          language === "ka"
            ? [
                { value: "5000+", label: "კმაყოფილი პაციენტი" },
                { value: "10+", label: "წლიანი გამოცდილება" },
                { value: "24/7", label: "კონსულტაცია" }
              ]
            : [
                { value: "5000+", label: "Happy patients" },
                { value: "10+", label: "Years experience" },
                { value: "24/7", label: "Support" }
              ]
      };
    case "Testimonials":
      return { testimonials: data.testimonials };
    case "Pricing":
      return {
        plans:
          language === "ka"
            ? [
                { name: "საწყისი", price: "₾150", features: ["კონსულტაცია", "გეგმა"] },
                { name: "სტანდარტი", price: "₾350", features: ["მკურნალობა", "ჰიგიენა"] },
                { name: "პრო", price: "₾600", features: ["კომპლექსური სერვისი", "მონიტორინგი"] }
              ]
            : [
                { name: "Starter", price: "$49", features: ["Consultation", "Plan"] },
                { name: "Standard", price: "$99", features: ["Treatment", "Hygiene"] },
                { name: "Pro", price: "$199", features: ["Full service", "Monitoring"] }
              ]
      };
    case "FAQ":
      return { faq: data.faq };
    case "CTA":
      return {
        headline: language === "ka" ? "დაგეგმეთ ვიზიტი დღესვე" : "Book your visit today",
        subheadline: language === "ka" ? "მიიღეთ კონსულტაცია ერთ დღეში." : "Get a consultation fast.",
        ctaLabel: language === "ka" ? "დაგვიკავშირდით" : "Contact us",
        ctaHref: "/contact"
      };
    case "Contact":
      return {
        address: language === "ka" ? "თბილისი, ვაკე" : "Tbilisi, Vake",
        phone: "+995 555 12 34 56",
        email: "info@clinic.ge",
        workingHours: language === "ka" ? "ყოველდღე 10:00-20:00" : "Daily 10:00-20:00",
        formCtaLabel: language === "ka" ? "გაგზავნა" : "Send",
        formLabels: language === "ka" ? ["სახელი", "ტელეფონი", "შეტყობინება"] : ["Name", "Phone", "Message"]
      };
    case "Footer":
      return {
        brand: language === "ka" ? "სტომატოლოგია" : "Dental Clinic",
        links: language === "ka" ? ["ჩვენ შესახებ", "სერვისები", "კონტაქტი"] : ["About", "Services", "Contact"],
        copyright:
          language === "ka"
            ? "© 2026 Dental Clinic. ყველა უფლება დაცულია."
            : "© 2026 Dental Clinic. All rights reserved."
      };
    default:
      return {};
  }
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = WIDGET_DEFINITIONS.map((def) => ({
  id: def.id,
  title: def.name,
  category: def.category,
  widgetType: def.widgetType,
  variant: def.variant,
  tags: def.tags ?? [],
  previewPropsKa: getWidgetPreviewProps(def.widgetType, def.variant, "ka"),
  previewPropsEn: getWidgetPreviewProps(def.widgetType, def.variant, "en")
}));
