import { NextRequest, NextResponse } from "next/server";
import {
  Blueprint,
  GeneratorInputs,
  SectionType,
  SectionUI,
  UIBlock
} from "@/lib/types";
import { DENTAL_PACKS } from "@/lib/packs/dentalPacks";

export const runtime = "nodejs";

const categories = [
  "Dental Clinic",
  "Restaurant",
  "Hotel",
  "Beauty Salon",
  "Law Firm",
  "Real Estate",
  "Education",
  "E-commerce",
  "Other"
];

const tones = ["Professional", "Friendly", "Luxury", "Minimal"];

const languages = ["ka", "en"] as const;

function validateInputs(body: GeneratorInputs) {
  if (!body.businessName?.trim()) return "Business name is required.";
  if (!categories.includes(body.category)) return "Invalid category.";
  if (!body.city?.trim()) return "City is required.";
  if (!tones.includes(body.tone)) return "Invalid tone.";
  if (!languages.includes(body.language)) return "Invalid language.";
  if (!body.prompt?.trim()) return "Prompt is required.";
  if (!body.targetPage?.trim()) return "Target page is required.";
  if (!body.primaryColor?.trim()) return "Primary color is required.";
  if (!body.secondaryColor?.trim()) return "Secondary color is required.";
  if (!body.packId?.trim()) return "Pack is required.";
  return null;
}

function buildPrompt(inputs: GeneratorInputs, strict: boolean) {
  const pack = DENTAL_PACKS.find((p) => p.packId === inputs.packId) ?? DENTAL_PACKS[0];
  const templateSummary = pack.allowedTemplates.join(", ");
  const lines = [
    "You are a senior brand strategist. Produce ONLY valid JSON that matches the schema exactly.",
    "",
    "Requirements:",
    "- The business is in Georgia (country).",
    "- Content must be practical for small businesses in Georgia.",
    "- If language is ka, ALL strings must be Georgian (including section titles: სერვისები, რატომ ჩვენ, შეფასებები, ხშირად დასმული კითხვები, კონტაქტი).",
    "- If language is en, ALL strings must be English.",
    "- No markdown, no code fences, no commentary, JSON only.",
    "- Use the section order: hero, trust_strip, about, services, why_us, testimonials, faq, contact.",
    "- Provide 3-5 bullets per section when relevant.",
    "- Provide realistic CTA labels and hrefs (e.g., /contact, tel:+995..., mailto:...).",
    "- Include recommendedPages (5-8 page names) that best fit the business.",
    "- Generate content for the target page only, but keep pages array with a single page object.",
    "- Include a design object for the page (visualStyle, layoutNotes, spacing, palette, typography, imagery, components).",
    "- For each section include a ui object for preview rendering.",
    "- ui.variant must be one of: hero, simple, cards, list, split, faqAccordion, contactForm, pricingTable, teamGrid, blogList.",
    "- ui.blocks is an array of blocks: heading, text, bullets, image, button, form.",
    "- Set theme.primaryColor and theme.secondaryColor to match the chosen colors, and place them as the first two entries in theme.colorSuggestions.",
    "- If target page is FAQ, set the FAQ section ui.variant to faqAccordion and include more detailed Q&A.",
    "- If target page is Contact, set the Contact section ui.variant to contactForm.",
    "- If target page is Home, use a hero-style layout with an image + CTA in the hero section.",
    "- Change layouts based on the design variation seed: hero layout (centered vs split vs image-first vs text-first), number of service cards (3–6), testimonials layout (slider vs grid vs quotes), FAQ style (accordion vs list), section order where possible, and button placement.",
    "- Apply the chosen primary and secondary colors consistently across layout components.",
    "- For category Dental Clinic: use ONLY templateIds from the selected design pack.",
    "- Select one templateId per section type and fill slots accordingly.",
    "- Use the designVariationSeed to switch template variants (hero_mb_01 -> hero_mb_02 etc.).",
    "- Choose ONE layout archetype and design accordingly:",
    "- A) Modern SaaS-style (clean hero, split layout, big typography)",
    "- B) Luxury/Clinic-style (large hero image, softer spacing, premium look)",
    "- C) Agency-style (bold typography, minimal imagery, strong CTAs)",
    "- D) Product-style (card-based sections, grid layout)",
    "- E) Portfolio-style (visual-first, large images, minimal text)",
    "- Structure and visual hierarchy must resemble contemporary professional websites."
  ];

  if (strict) {
    lines.push(
      "- Output must be strictly valid JSON. If you cannot comply, output an empty JSON object: {}"
    );
  }

  lines.push(
    "",
    `Selected Design Pack: ${pack.packId}`,
    `Allowed templateIds: ${templateSummary}`,
    "",
    "Schema:",
    "{",
    '  "site": {',
    '    "businessName": string,',
    '    "category": string,',
    '    "city": string,',
    '    "tone": string,',
    '    "language": "ka" | "en"',
    "  },",
    '  "theme": {',
    '    "styleKeywords": string[],',
    '    "colorSuggestions": string[],',
    '    "fontSuggestions": string[],',
    '    "primaryColor": string,',
    '    "secondaryColor": string',
    "  },",
    '  "recommendedPages": string[],',
    '  "pages": [',
    "    {",
    '      "slug": "home",',
    '      "title": string,',
    '      "design": {',
    '        "visualStyle": string,',
    '        "layoutNotes": string,',
    '        "spacing": string,',
    '        "palette": string[],',
    '        "typography": string[],',
    '        "imagery": string[],',
    '        "components": string[]',
    "      },",
    '      "sections": [',
    "        {",
      '          "type": "hero" | "trust_strip" | "about" | "services" | "why_us" | "testimonials" | "faq" | "contact",',
      '          "packId": string,',
      '          "templateId": string,',
      '          "slots": object,',
      '          "heading": string,',
      '          "content": string,',
    '          "bullets": string[],',
    '          "cta": { "label": string, "href": string },',
    '          "ui": {',
    '            "variant": "hero" | "simple" | "cards" | "list" | "split" | "faqAccordion" | "contactForm" | "pricingTable" | "teamGrid" | "blogList",',
    '            "blocks": [',
    '              { "type": "heading", "value": string },',
    '              { "type": "text", "value": string },',
    '              { "type": "bullets", "items": string[] },',
    '              { "type": "image", "alt": string, "hint": string },',
    '              { "type": "button", "label": string, "href": string },',
    '              { "type": "form", "fields": string[] }',
    "            ]",
    "          }",
    "        }",
    "      ]",
    "    }",
    "  ],",
    '  "seo": {',
    '    "metaTitle": string,',
    '    "metaDescription": string,',
    '    "keywords": string[]',
    "  }",
    "}",
    "",
    "Input:",
    `Business name: ${inputs.businessName}`,
    `Category: ${inputs.category}`,
    `City: ${inputs.city}`,
    `Tone: ${inputs.tone}`,
    `Language: ${inputs.language}`,
    `Target page: ${inputs.targetPage}`,
    `Business type: ${inputs.businessType}`,
    `Industry subcategory: ${inputs.industrySubcategory}`,
    `Target audience: ${inputs.targetAudience}`,
    `Price positioning: ${inputs.pricePositioning}`,
    `Primary goal: ${inputs.primaryGoal}`,
    `Has booking: ${inputs.hasBooking ? "yes" : "no"}`,
    `Has delivery: ${inputs.hasDelivery ? "yes" : "no"}`,
    `Address area: ${inputs.addressArea}`,
    `Working hours: ${inputs.workingHours}`,
    `Phone: ${inputs.phone}`,
    `Social links: ${inputs.socialLinks}`,
    `Primary color: ${inputs.primaryColor}`,
    `Secondary color: ${inputs.secondaryColor}`,
    `Design variation seed: ${inputs.designVariationSeed}`,
    `Design pack: ${inputs.packId}`,
    `User prompt: ${inputs.prompt}`
  );

  return lines.join("\n");
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output only JSON." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "OpenAI request failed.");
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI.");
  }
  return content as string;
}

function parseBlueprint(raw: string) {
  const trimmed = raw.trim();
  return JSON.parse(trimmed) as Blueprint;
}

function toLocalizedFields(language: "ka" | "en") {
  if (language === "ka") {
    return ["სახელი", "ტელეფონი", "ელ.ფოსტა", "შეტყობინება"];
  }
  return ["Name", "Phone", "Email", "Message"];
}

function defaultCta(language: "ka" | "en") {
  return language === "ka"
    ? { label: "დაგვიკავშირდით", href: "/contact" }
    : { label: "Contact us", href: "/contact" };
}

function fallbackVariant(
  type: SectionType,
  targetPage: string
): SectionUI["variant"] {
  const normalized = targetPage.toLowerCase();
  if (type === "faq" || normalized === "faq") return "faqAccordion";
  if (type === "contact" || normalized === "contact") return "contactForm";
  if (type === "hero" || normalized === "home") return "hero";
  if (type === "services") return "cards";
  if (type === "testimonials") return "cards";
  if (type === "why_us") return "list";
  if (type === "about") return "split";
  return "simple";
}

function withFallbackUI(
  blueprint: Blueprint,
  targetPage: string
): Blueprint {
  const fields = toLocalizedFields(blueprint.site.language);
  const fallbackCta = defaultCta(blueprint.site.language);
  const pages = blueprint.pages.map((page) => {
    const sections = page.sections.map((section) => {
      const safeCta = section.cta ?? fallbackCta;
      if (section.ui) return { ...section, cta: safeCta };
      const variant = fallbackVariant(section.type, targetPage);
      const blocks: UIBlock[] = [
        { type: "heading", value: section.heading },
        { type: "text", value: section.content }
      ];

      if (section.bullets?.length) {
        blocks.push({ type: "bullets", items: section.bullets });
      }
      if (variant === "hero" || variant === "split") {
        blocks.push({
          type: "image",
          alt: section.heading,
          hint: blueprint.site.category
        });
      }
      if (variant === "contactForm") {
        blocks.push({ type: "form", fields });
      } else {
        blocks.push({
          type: "button",
          label: safeCta.label,
          href: safeCta.href
        });
      }

      const ui: SectionUI = { variant, blocks };
      return { ...section, cta: safeCta, ui };
    });
    return { ...page, sections };
  });
  return { ...blueprint, pages };
}

function applyThemeColors(
  blueprint: Blueprint,
  primaryColor: string,
  secondaryColor: string
): Blueprint {
  const colorSuggestions = [
    primaryColor,
    secondaryColor,
    ...blueprint.theme.colorSuggestions.filter(
      (color) => color !== primaryColor && color !== secondaryColor
    )
  ];
  return {
    ...blueprint,
    theme: {
      ...blueprint.theme,
      primaryColor,
      secondaryColor,
      colorSuggestions
    }
  };
}

function dentalDefaults(language: "ka" | "en") {
  if (language === "ka") {
    return {
      heroSplit: {
        headline: "ჯანსაღი ღიმილი ყოველდღე",
        subtext: "კომფორტული სტომატოლოგიური მომსახურება თანამედროვე ტექნოლოგიებით.",
        ctaPrimary: { label: "ჩანიშნე ვიზიტი", href: "/contact" },
        ctaSecondary: { label: "დაგვიკავშირდით", href: "/contact" },
        imageHint: "კლინიკა და ექიმები"
      },
      heroCentered: {
        headline: "თანამედროვე სტომატოლოგია თბილისში",
        subtext: "სანდო გუნდი, უსაფრთხო გარემო და ხარისხიანი მოვლა.",
        cta: { label: "კონსულტაცია", href: "/contact" },
        backgroundImageHint: "ღიმილიანი პაციენტი"
      },
      trustStrip: { badges: ["ლიცენზირებული ექიმები", "სტერილური გარემო", "დამტკიცებული მასალები", "გერმანული ტექნოლოგიები"] },
      about: { title: "ჩვენ შესახებ", paragraph: "ვზრუნავთ ოჯახების სტომატოლოგიურ ჯანმრთელობაზე პროფესიონალურად და სიყვარულით.", imageHint: "კლინიკის ინტერიერი" },
      servicesCards: {
        services: [
          { title: "თერაპიული მკურნალობა", shortText: "კარიესისა და ფესვის არხების მართვა." },
          { title: "ბრეკეტები და ალაინერები", shortText: "ღიმილის გასწორება ინდივიდუალური გეგმებით." },
          { title: "ჰიგიენა და პროფილაქტიკა", shortText: "პროფესიონალური წმენდა და პრევენცია." }
        ]
      },
      servicesIcons: { services: ["გათეთრება", "იმპლანტაცია", "ბრეკეტები", "ბავშვთა სტომატოლოგია", "ჰიგიენა", "პროთეზირება"] },
      whyUs: {
        benefits: [
          { title: "გამოცდილი გუნდი", shortText: "საუკეთესო პრაქტიკა და მუდმივი განვითარება." },
          { title: "უსაფრთხო გარემო", shortText: "სრული სტერილიზაცია და ხარისხის კონტროლი." },
          { title: "საერთაშორისო სტანდარტი", shortText: "თანამედროვე აპარატურა და მეთოდები." }
        ]
      },
      testimonials: {
        testimonials: [
          { name: "ნინო", quote: "ძალიან კომფორტული გამოცდილება და პროფესიონალური მომსახურება." },
          { name: "გიორგი", quote: "მშვენიერი გუნდი და სწრაფი შედეგი." },
          { name: "მარია", quote: "სისუფთავე და ყურადღება დეტალებზე." }
        ]
      },
      faq: {
        faq: [
          { question: "როგორ დავჯავშნო ვიზიტი?", answer: "დაგვიკავშირდით ტელეფონით ან ონლაინ." },
          { question: "არის კონსულტაცია ფასიანი?", answer: "პირველადი შეფასება ხშირად უფასოა." },
          { question: "ბავშვებისთვის გაქვთ მომსახურება?", answer: "დიახ, სპეციალური პედიატრიული მიმართულება გვაქვს." },
          { question: "რამდენ ხანს გრძელდება გათეთრება?", answer: "საშუალოდ 60–90 წუთი." },
          { question: "მიიღებთ დაზღვევას?", answer: "დეტალებისთვის დაგვიკავშირდით." }
        ]
      },
      contact: {
        address: "თბილისი, ვაკე",
        phone: "+995...",
        workingHours: "ორშ-შაბ 09:00-20:00",
        formCtaLabel: "გაგზავნა"
      }
    };
  }
  return {
    heroSplit: {
      headline: "Healthy smiles every day",
      subtext: "Comfortable dental care with modern technology.",
      ctaPrimary: { label: "Book a visit", href: "/contact" },
      ctaSecondary: { label: "Contact us", href: "/contact" },
      imageHint: "Clinic and team"
    },
    heroCentered: {
      headline: "Modern dentistry in Tbilisi",
      subtext: "Trusted team, safe environment, quality care.",
      cta: { label: "Consultation", href: "/contact" },
      backgroundImageHint: "Smiling patient"
    },
    trustStrip: { badges: ["Licensed doctors", "Sterile environment", "Certified materials", "German technology"] },
    about: { title: "About us", paragraph: "We care for family dental health with professionalism and care.", imageHint: "Clinic interior" },
    servicesCards: {
      services: [
        { title: "Therapeutic care", shortText: "Caries and root canal treatment." },
        { title: "Braces & aligners", shortText: "Smile alignment with custom plans." },
        { title: "Hygiene & prevention", shortText: "Professional cleaning and prevention." }
      ]
    },
    servicesIcons: { services: ["Whitening", "Implants", "Braces", "Pediatric care", "Hygiene", "Prosthetics"] },
    whyUs: {
      benefits: [
        { title: "Experienced team", shortText: "Best practices and continuous improvement." },
        { title: "Safe environment", shortText: "Full sterilization and quality control." },
        { title: "International standards", shortText: "Modern equipment and methods." }
      ]
    },
    testimonials: {
      testimonials: [
        { name: "Nino", quote: "Comfortable experience and professional care." },
        { name: "Giorgi", quote: "Great team and fast results." },
        { name: "Maria", quote: "Clean and attentive to detail." }
      ]
    },
    faq: {
      faq: [
        { question: "How do I book a visit?", answer: "Contact us by phone or online." },
        { question: "Is the consultation paid?", answer: "Initial assessment is often free." },
        { question: "Do you treat children?", answer: "Yes, we have pediatric services." },
        { question: "How long does whitening take?", answer: "Usually 60–90 minutes." },
        { question: "Do you accept insurance?", answer: "Contact us for details." }
      ]
    },
    contact: {
      address: "Tbilisi, Vake",
      phone: "+995...",
      workingHours: "Mon-Sat 09:00-20:00",
      formCtaLabel: "Send"
    }
  };
}

function ensureDentalTemplates(
  blueprint: Blueprint,
  packId: GeneratorInputs["packId"]
): Blueprint {
  if (blueprint.site.category !== "Dental Clinic") return blueprint;
  const defaults = dentalDefaults(blueprint.site.language);
  const pack = DENTAL_PACKS.find((p) => p.packId === packId) ?? DENTAL_PACKS[0];
  const templateIds = new Set(pack.allowedTemplates);
  const pages = blueprint.pages.map((page) => {
    const sections = page.sections.map((section) => {
      let templateId = section.templateId;
      let slots = (section.slots ?? {}) as Record<string, unknown>;

      if (!templateId || !templateIds.has(templateId)) {
        switch (section.type) {
          case "hero":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("hero_")) ?? pack.allowedTemplates[0];
            slots = defaults.heroSplit;
            break;
          case "trust_strip":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("trust_")) ?? pack.allowedTemplates[0];
            slots = defaults.trustStrip;
            break;
          case "about":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("about_")) ?? pack.allowedTemplates[0];
            slots = defaults.about;
            break;
          case "services":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("services_")) ?? pack.allowedTemplates[0];
            slots = defaults.servicesCards;
            break;
          case "why_us":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("why_")) ?? pack.allowedTemplates[0];
            slots = defaults.whyUs;
            break;
          case "testimonials":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("testimonials_")) ?? pack.allowedTemplates[0];
            slots = defaults.testimonials;
            break;
          case "faq":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("faq_")) ?? pack.allowedTemplates[0];
            slots = defaults.faq;
            break;
          case "contact":
            templateId = pack.allowedTemplates.find((id) => id.startsWith("contact_")) ?? pack.allowedTemplates[0];
            slots = defaults.contact;
            break;
          default:
            break;
        }
      } else {
        const isValid = validateDentalSlots(templateId, slots);
        if (!isValid) {
          slots = fallbackSlotsForTemplate(templateId, defaults);
        }
      }

      return {
        ...section,
        packId: pack.packId,
        templateId,
        slots
      };
    });
    return { ...page, sections };
  });
  return { ...blueprint, pages };
}

function fallbackSlotsForTemplate(templateId: string, defaults: ReturnType<typeof dentalDefaults>) {
  if (templateId.startsWith("hero_")) return defaults.heroSplit;
  if (templateId.startsWith("trust_")) return defaults.trustStrip;
  if (templateId.startsWith("about_")) return defaults.about;
  if (templateId.startsWith("services_")) return defaults.servicesCards;
  if (templateId.startsWith("why_")) return defaults.whyUs;
  if (templateId.startsWith("testimonials_")) return defaults.testimonials;
  if (templateId.startsWith("faq_")) return defaults.faq;
  if (templateId.startsWith("contact_")) return defaults.contact;
  return defaults.about;
}

function validateDentalSlots(templateId: string, slots: Record<string, unknown>) {
  if (templateId.startsWith("hero_")) {
    return Boolean(slots.headline && slots.subtext);
  }
  if (templateId.startsWith("trust_")) {
    return Array.isArray((slots as any).badges) && (slots as any).badges.length >= 4;
  }
  if (templateId.startsWith("about_")) {
    return Boolean(slots.title && slots.paragraph);
  }
  if (templateId.startsWith("services_")) {
    return Array.isArray((slots as any).services) && (slots as any).services.length >= 3;
  }
  if (templateId.startsWith("why_")) {
    return Array.isArray((slots as any).benefits) && (slots as any).benefits.length >= 3;
  }
  if (templateId.startsWith("testimonials_")) {
    return Array.isArray((slots as any).testimonials) && (slots as any).testimonials.length >= 3;
  }
  if (templateId.startsWith("faq_")) {
    return Array.isArray((slots as any).faq) && (slots as any).faq.length >= 5;
  }
  if (templateId.startsWith("contact_")) {
    return Boolean(slots.address && slots.phone && slots.workingHours && slots.formCtaLabel);
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeneratorInputs;
    const error = validateInputs(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const initialPrompt = buildPrompt(body, false);
    let raw = await callOpenAI(initialPrompt);
    try {
      const blueprint = applyThemeColors(
        ensureDentalTemplates(withFallbackUI(parseBlueprint(raw), body.targetPage), body.packId),
        body.primaryColor,
        body.secondaryColor
      );
      return NextResponse.json(blueprint);
    } catch {
      const strictPrompt = buildPrompt(body, true);
      raw = await callOpenAI(strictPrompt);
      const blueprint = applyThemeColors(
        ensureDentalTemplates(withFallbackUI(parseBlueprint(raw), body.targetPage), body.packId),
        body.primaryColor,
        body.secondaryColor
      );
      return NextResponse.json(blueprint);
    }
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unexpected server error occurred."
      },
      { status: 500 }
    );
  }
}
