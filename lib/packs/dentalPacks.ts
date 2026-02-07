export type DentalPack = {
  packId: "dental_medical_blue" | "dental_clean_minimal";
  name: string;
  description: string;
  tokens: {
    radius: "md" | "lg";
    shadow: "soft" | "minimal";
    headingStyle: "bold" | "clean";
    sectionBackground: "white" | "alt";
    primaryColorDefault: string;
    secondaryColorDefault: string;
    buttonStyle: "pill" | "rounded";
    cardStyle: "bordered" | "shadow";
    heroStyle: "imageOverlay" | "splitClean";
  };
  allowedTemplates: string[];
};

export const DENTAL_PACKS: DentalPack[] = [
  {
    packId: "dental_medical_blue",
    name: "Medical Blue",
    description: "Bold medical look with confident blue gradients and structured cards.",
    tokens: {
      radius: "lg",
      shadow: "soft",
      headingStyle: "bold",
      sectionBackground: "alt",
      primaryColorDefault: "#1e6fff",
      secondaryColorDefault: "#0fb6a6",
      buttonStyle: "pill",
      cardStyle: "shadow",
      heroStyle: "imageOverlay"
    },
    allowedTemplates: [
      "hero_mb_01",
      "hero_mb_02",
      "trust_mb_01",
      "trust_mb_02",
      "about_mb_01",
      "about_mb_02",
      "services_mb_01",
      "services_mb_02",
      "why_mb_01",
      "why_mb_02",
      "testimonials_mb_01",
      "testimonials_mb_02",
      "faq_mb_01",
      "faq_mb_02",
      "contact_mb_01",
      "contact_mb_02",
      "footer_mb_01",
      "footer_mb_02"
    ]
  },
  {
    packId: "dental_clean_minimal",
    name: "Clean Minimal",
    description: "Light, airy layouts with minimal borders and clean typography.",
    tokens: {
      radius: "md",
      shadow: "minimal",
      headingStyle: "clean",
      sectionBackground: "white",
      primaryColorDefault: "#0056d6",
      secondaryColorDefault: "#22c55e",
      buttonStyle: "rounded",
      cardStyle: "bordered",
      heroStyle: "splitClean"
    },
    allowedTemplates: [
      "hero_cm_01",
      "hero_cm_02",
      "trust_cm_01",
      "trust_cm_02",
      "about_cm_01",
      "about_cm_02",
      "services_cm_01",
      "services_cm_02",
      "why_cm_01",
      "why_cm_02",
      "testimonials_cm_01",
      "testimonials_cm_02",
      "faq_cm_01",
      "faq_cm_02",
      "contact_cm_01",
      "contact_cm_02",
      "footer_cm_01",
      "footer_cm_02"
    ]
  }
];
