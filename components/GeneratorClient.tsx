"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EditableText from "@/components/EditableText";
import WireframePage from "@/components/WireframePage";
import TemplatePage from "@/components/TemplatePage";
import { blueprintToMarkdown } from "@/lib/markdown";
import {
  Blueprint,
  GeneratorInputs,
  Project,
  SectionType,
  SectionUI,
  UIBlock
} from "@/lib/types";
import {
  getProjectById,
  loadProjects,
  upsertProject
} from "@/lib/storage";

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

const languages = [
  { label: "Georgian (ka)", value: "ka" },
  { label: "English (en)", value: "en" }
];

const pageOptions = [
  "Home",
  "About",
  "Services",
  "Pricing",
  "Gallery",
  "FAQ",
  "Contact",
  "Booking",
  "Blog"
];

const businessTypes = [
  { label: "სერვისები", value: "services" },
  { label: "პროდუქტები", value: "products" },
  { label: "ორივე", value: "both" }
];

const audienceOptions = [
  "მოზრდილები",
  "ბავშვები",
  "ოჯახი",
  "ბიზნესი/კორპორატიული",
  "ყველა"
];

const priceOptions = ["ბიუჯეტური", "საშუალო", "პრემიუმი"];

const goalOptions = [
  "ზარები/კონსულტაცია",
  "ონლაინ დაჯავშნა",
  "პროდუქტის გაყიდვა",
  "ლიდების შეგროვება"
];

const sectionOrder: SectionType[] = [
  "hero",
  "about",
  "services",
  "why_us",
  "testimonials",
  "faq",
  "contact"
];

const defaultInputs: GeneratorInputs = {
  businessName: "",
  category: categories[0],
  city: "",
  tone: tones[0],
  language: "ka",
  prompt: "",
  targetPage: pageOptions[0],
  businessType: "services",
  industrySubcategory: "",
  targetAudience: "ყველა",
  pricePositioning: "საშუალო",
  primaryGoal: "ზარები/კონსულტაცია",
  hasBooking: false,
  hasDelivery: false,
  addressArea: "",
  workingHours: "",
  phone: "",
  socialLinks: "",
  primaryColor: "#007bff",
  secondaryColor: "#28a745",
  logoDataUrl: undefined,
  designVariationSeed: "",
  version: 1
};

const defaultFormFields = {
  ka: ["სახელი", "ტელეფონი", "ელ.ფოსტა", "შეტყობინება"],
  en: ["Name", "Phone", "Email", "Message"]
};

function fallbackVariant(type: SectionType, targetPage: string) {
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

function buildFallbackUI(
  section: Blueprint["pages"][number]["sections"][number],
  language: "ka" | "en",
  targetPage: string,
  category: string
): SectionUI {
  const variant = fallbackVariant(section.type, targetPage);
  const blocks: UIBlock[] = [
    { type: "heading", value: section.heading },
    { type: "text", value: section.content }
  ];

  if (section.bullets?.length) {
    blocks.push({ type: "bullets", items: section.bullets });
  }

  if (variant === "hero" || variant === "split") {
    blocks.push({ type: "image", alt: section.heading, hint: category });
  }

  if (variant === "contactForm") {
    blocks.push({ type: "form", fields: defaultFormFields[language] });
  } else {
    blocks.push({ type: "button", label: section.cta.label, href: section.cta.href });
  }

  return { variant, blocks };
}

function stripUiForExport(blueprint: Blueprint): Blueprint {
  return {
    ...blueprint,
    pages: blueprint.pages.map((page) => ({
      ...page,
      sections: page.sections.map(({ ui, ...rest }) => rest)
    }))
  };
}

export default function GeneratorClient() {
  const searchParams = useSearchParams();
  const [inputs, setInputs] = useState<GeneratorInputs>(defaultInputs);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(true);
  const [templateMode, setTemplateMode] = useState(false);

  const createSeed = () =>
    Math.random().toString(36).slice(2, 8);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId) return;
    const project = getProjectById(projectId);
    if (project) {
      setInputs({ ...defaultInputs, ...project.inputs });
      setBlueprint(project.blueprint);
      setStatus("Project loaded.");
    }
  }, [searchParams]);

  const canGenerate = useMemo(() => {
    return (
      inputs.businessName.trim() &&
      inputs.city.trim() &&
      inputs.prompt.trim()
    );
  }, [inputs]);

  const handleInputChange = (
    key: keyof GeneratorInputs,
    value: GeneratorInputs[keyof GeneratorInputs]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setStatus("");
    if (!canGenerate) {
      setError("Please fill in business name, city, and prompt.");
      return;
    }
    const seed = createSeed();
    setInputs((prev) => ({ ...prev, designVariationSeed: seed, version: 1 }));
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputs, designVariationSeed: seed, version: 1 })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate blueprint.");
      }
      const data = (await response.json()) as Blueprint;
      setBlueprint(data);
      setStatus("Blueprint generated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating."
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputs, canGenerate]);

  const handleRegenerate = useCallback(async () => {
    setError("");
    setStatus("");
    if (!canGenerate) {
      setError("Please fill in business name, city, and prompt.");
      return;
    }
    const nextVersion = inputs.version + 1;
    const seed = createSeed();
    setInputs((prev) => ({
      ...prev,
      designVariationSeed: seed,
      version: nextVersion
    }));
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inputs,
          designVariationSeed: seed,
          version: nextVersion
        })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate blueprint.");
      }
      const data = (await response.json()) as Blueprint;
      setBlueprint(data);
      setStatus(`Blueprint generated (v${nextVersion}).`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating."
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputs, canGenerate]);

  const handleClear = () => {
    setInputs(defaultInputs);
    setBlueprint(null);
    setStatus("Cleared.");
    setError("");
  };

  const handleSave = () => {
    if (!blueprint) {
      setError("Generate a blueprint before saving.");
      return;
    }
    const project: Project = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      inputs,
      blueprint
    };
    upsertProject(project);
    setStatus("Project saved.");
  };

  const handleExport = (format: "json" | "md") => {
    if (!blueprint) {
      setError("Generate a blueprint before exporting.");
      return;
    }
    const exportBlueprint =
      format === "json" ? stripUiForExport(blueprint) : blueprint;
    const data =
      format === "json"
        ? JSON.stringify(exportBlueprint, null, 2)
        : blueprintToMarkdown(exportBlueprint);
    const blob = new Blob([data], {
      type: format === "json" ? "application/json" : "text/markdown"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      format === "json"
        ? `${inputs.businessName || "weblive"}.json`
        : `${inputs.businessName || "weblive"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updateSectionField = (
    type: SectionType,
    field: "heading" | "content",
    value: string
  ) => {
    if (!blueprint) return;
    setBlueprint((prev) => {
      if (!prev) return prev;
      const pages = [...prev.pages];
      const page = { ...pages[0] };
      page.sections = page.sections.map((section) =>
        section.type === type ? { ...section, [field]: value } : section
      );
      pages[0] = page;
      return { ...prev, pages };
    });
  };

  const updateSectionBullet = (
    type: SectionType,
    index: number,
    value: string
  ) => {
    if (!blueprint) return;
    setBlueprint((prev) => {
      if (!prev) return prev;
      const pages = [...prev.pages];
      const page = { ...pages[0] };
      page.sections = page.sections.map((section) => {
        if (section.type !== type) return section;
        const bullets = [...section.bullets];
        bullets[index] = value;
        return { ...section, bullets };
      });
      pages[0] = page;
      return { ...prev, pages };
    });
  };

  const updateSectionCta = (
    type: SectionType,
    field: "label" | "href",
    value: string
  ) => {
    if (!blueprint) return;
    setBlueprint((prev) => {
      if (!prev) return prev;
      const pages = [...prev.pages];
      const page = { ...pages[0] };
      page.sections = page.sections.map((section) =>
        section.type === type
          ? {
              ...section,
              cta: { ...(section.cta ?? { label: "", href: "" }), [field]: value }
            }
          : section
      );
      pages[0] = page;
      return { ...prev, pages };
    });
  };

  const updateSeo = (field: "metaTitle" | "metaDescription", value: string) => {
    if (!blueprint) return;
    setBlueprint((prev) =>
      prev ? { ...prev, seo: { ...prev.seo, [field]: value } } : prev
    );
  };

  const updateKeyword = (index: number, value: string) => {
    if (!blueprint) return;
    setBlueprint((prev) => {
      if (!prev) return prev;
      const keywords = [...prev.seo.keywords];
      keywords[index] = value;
      return { ...prev, seo: { ...prev.seo, keywords } };
    });
  };

  const currentProjects = useMemo(() => loadProjects(), [status]);
  const recommendedPages = blueprint?.recommendedPages ?? [];
  const design = blueprint?.pages?.[0]?.design ?? {
    visualStyle: "",
    layoutNotes: "",
    spacing: "",
    palette: [],
    typography: [],
    imagery: [],
    components: []
  };
  const page = blueprint?.pages?.[0];
  const pageSections = useMemo(() => page?.sections ?? [], [page]);

  const applySectionOrder = useCallback(
    (nextOrder: SectionType[]) => {
      if (!blueprint) return;
      setBlueprint((prev) => {
        if (!prev) return prev;
        const page = { ...prev.pages[0] };
        const sectionMap = new Map(
          page.sections.map((section) => [section.type, section])
        );
        page.sections = nextOrder
          .map((type) => sectionMap.get(type))
          .filter(Boolean) as typeof page.sections;
        return { ...prev, pages: [page, ...prev.pages.slice(1)] };
      });
    },
    [blueprint]
  );

  const resolveUI = useCallback(
    (section: Blueprint["pages"][number]["sections"][number]) => {
      if (!blueprint) return null;
      return (
        section.ui ??
        buildFallbackUI(
          section,
          blueprint.site.language,
          inputs.targetPage,
          blueprint.site.category
        )
      );
    },
    [blueprint, inputs.targetPage]
  );

  const renderBlock = (
    section: Blueprint["pages"][number]["sections"][number],
    block: UIBlock,
    index: number
  ) => {
    switch (block.type) {
      case "heading":
        return (
          <EditableText
            key={`${section.type}-heading-${index}`}
            as="h3"
            className="text-2xl font-display"
            value={block.value}
            onChange={(value) => updateSectionField(section.type, "heading", value)}
            placeholder="Heading"
          />
        );
      case "text":
        return (
          <EditableText
            key={`${section.type}-text-${index}`}
            as="p"
            className="text-sm text-ink/70"
            value={block.value}
            onChange={(value) => updateSectionField(section.type, "content", value)}
            placeholder="Text"
          />
        );
      case "bullets":
        return (
          <ul key={`${section.type}-bullets-${index}`} className="space-y-2">
            {block.items.map((item, bulletIndex) => (
              <li
                key={`${section.type}-bullet-${bulletIndex}`}
                className="flex items-start gap-2"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-ink/30" />
                <EditableText
                  as="p"
                  className="text-sm text-ink/70"
                  value={item}
                  onChange={(value) =>
                    updateSectionBullet(section.type, bulletIndex, value)
                  }
                  placeholder="Bullet"
                />
              </li>
            ))}
          </ul>
        );
      case "image":
        return (
          <div
            key={`${section.type}-image-${index}`}
            className="rounded-2xl border border-dashed border-ink/20 bg-shell/60 h-40 flex items-center justify-center text-xs text-ink/50"
          >
            {block.hint || block.alt || "Image"}
          </div>
        );
      case "button":
        return (
          <div key={`${section.type}-button-${index}`} className="flex gap-2">
            <EditableText
              as="span"
              className="inline-flex items-center justify-center rounded-xl bg-ink text-white px-4 py-2 text-xs uppercase tracking-[0.2em]"
              value={block.label || "CTA"}
              onChange={(value) => updateSectionCta(section.type, "label", value)}
              placeholder="CTA"
            />
            <EditableText
              as="span"
              className="text-xs text-ink/50 self-center"
              value={block.href || "/contact"}
              onChange={(value) => updateSectionCta(section.type, "href", value)}
              placeholder="/contact"
            />
          </div>
        );
      case "form":
        return (
          <div
            key={`${section.type}-form-${index}`}
            className="grid gap-2"
          >
            {block.fields.map((field) => (
              <div
                key={field}
                className="rounded-xl border border-ink/10 bg-shell/60 px-3 py-2 text-xs text-ink/50"
              >
                {field}
              </div>
            ))}
            <div className="rounded-xl bg-ink text-white px-4 py-2 text-xs uppercase tracking-[0.2em] w-fit">
              Submit
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSection = (
    section: Blueprint["pages"][number]["sections"][number]
  ) => {
    const ui = resolveUI(section);
    if (!ui) return null;
    const isFaq = ui.variant === "faqAccordion";
    const isContact = ui.variant === "contactForm";
    return (
      <div
        key={section.type}
        className="rounded-3xl border border-ink/10 bg-shell/40 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.3em] text-ink/40">
            {section.type.replace("_", " ")} · {ui.variant}
          </span>
        </div>
        {isFaq ? (
          <div className="space-y-3">
            {section.bullets.map((question, index) => (
              <div
                key={`${section.type}-faq-${index}`}
                className="rounded-2xl border border-ink/10 bg-white p-4"
              >
                <EditableText
                  as="p"
                  className="text-sm font-medium"
                  value={question}
                  onChange={(value) =>
                    updateSectionBullet(section.type, index, value)
                  }
                  placeholder="Question"
                />
                <EditableText
                  as="p"
                  className="text-xs text-ink/60 mt-2"
                  value={section.content}
                  onChange={(value) =>
                    updateSectionField(section.type, "content", value)
                  }
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
        ) : isContact ? (
          <div className="space-y-4">
            {ui.blocks.map((block, index) => renderBlock(section, block, index))}
          </div>
        ) : (
          <div className="space-y-4">
            {ui.blocks.map((block, index) => renderBlock(section, block, index))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 border-b border-ink/10 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ink/50">
              Weblive AI
            </p>
            <h1 className="text-2xl md:text-3xl font-display">
              Website Blueprint Generator
            </h1>
          </div>
          <a
            className="text-sm font-medium text-accent hover:text-accentDark"
            href="/projects"
          >
            View Projects ({currentProjects.length})
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 px-6 py-8">
        <section className="bg-white shadow-soft rounded-3xl p-6 border border-ink/5">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink/70">
                Business name
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.businessName}
                onChange={(event) =>
                  handleInputChange("businessName", event.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">Category</label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.category}
                onChange={(event) =>
                  handleInputChange("category", event.target.value)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">City</label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.city}
                onChange={(event) =>
                  handleInputChange("city", event.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">Tone</label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.tone}
                onChange={(event) =>
                  handleInputChange("tone", event.target.value)
                }
              >
                {tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">Language</label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.language}
                onChange={(event) =>
                  handleInputChange("language", event.target.value)
                }
              >
                {languages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                ბიზნესის ტიპი
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.businessType}
                onChange={(event) =>
                  handleInputChange(
                    "businessType",
                    event.target.value as GeneratorInputs["businessType"]
                  )
                }
              >
                {businessTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                ინდუსტრიის ქვეკატეგორია
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.industrySubcategory}
                onChange={(event) =>
                  handleInputChange("industrySubcategory", event.target.value)
                }
                placeholder="მაგალითად: ორთოდონტია"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                მიზნობრივი აუდიტორია
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.targetAudience}
                onChange={(event) =>
                  handleInputChange(
                    "targetAudience",
                    event.target.value as GeneratorInputs["targetAudience"]
                  )
                }
              >
                {audienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                ფასის პოზიციონირება
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.pricePositioning}
                onChange={(event) =>
                  handleInputChange(
                    "pricePositioning",
                    event.target.value as GeneratorInputs["pricePositioning"]
                  )
                }
              >
                {priceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                ძირითადი მიზანი
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.primaryGoal}
                onChange={(event) =>
                  handleInputChange(
                    "primaryGoal",
                    event.target.value as GeneratorInputs["primaryGoal"]
                  )
                }
              >
                {goalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={inputs.hasBooking}
                  onChange={(event) =>
                    handleInputChange("hasBooking", event.target.checked)
                  }
                />
                ონლაინ დაჯავშნა
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={inputs.hasDelivery}
                  onChange={(event) =>
                    handleInputChange("hasDelivery", event.target.checked)
                  }
                />
                მიწოდება
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                უბანი / ტერიტორია
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.addressArea}
                onChange={(event) =>
                  handleInputChange("addressArea", event.target.value)
                }
                placeholder="მაგალითად: ვაკე"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                სამუშაო საათები
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.workingHours}
                onChange={(event) =>
                  handleInputChange("workingHours", event.target.value)
                }
                placeholder="მაგალითად: ორშ-შაბ 09:00-20:00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">ტელეფონი</label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.phone}
                onChange={(event) =>
                  handleInputChange("phone", event.target.value)
                }
                placeholder="+995..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                სოციალური ბმულები (optional)
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.socialLinks}
                onChange={(event) =>
                  handleInputChange("socialLinks", event.target.value)
                }
                placeholder="instagram.com/..., facebook.com/..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-ink/70">
                  Primary color
                </label>
                <input
                  type="color"
                  className="mt-1 h-10 w-full rounded-xl border border-ink/10 px-2"
                  value={inputs.primaryColor}
                  onChange={(event) =>
                    handleInputChange("primaryColor", event.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink/70">
                  Secondary color
                </label>
                <input
                  type="color"
                  className="mt-1 h-10 w-full rounded-xl border border-ink/10 px-2"
                  value={inputs.secondaryColor}
                  onChange={(event) =>
                    handleInputChange("secondaryColor", event.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                ლოგო
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    handleInputChange(
                      "logoDataUrl",
                      typeof reader.result === "string" ? reader.result : ""
                    );
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <p className="mt-1 text-xs text-ink/50">
                Recommended: 512×512 (or SVG).
              </p>
              {inputs.logoDataUrl ? (
                <img
                  src={inputs.logoDataUrl}
                  alt="Logo preview"
                  className="mt-2 h-12 w-12 rounded-xl object-contain border border-ink/10 bg-white"
                />
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">Prompt</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 min-h-[120px]"
                placeholder="მაგალითად: შექმენი სტომატოლოგიური კლინიკის საიტის სტრუქტურა თბილისისათვის, აქცენტით ოჯახის მოვლასა და ბავშვთა დენტალურ მომსახურებაზე."
                value={inputs.prompt}
                onChange={(event) =>
                  handleInputChange("prompt", event.target.value)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                Target page
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.targetPage}
                onChange={(event) =>
                  handleInputChange("targetPage", event.target.value)
                }
              >
                {pageOptions.map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="flex-1 rounded-xl bg-accent text-white py-2 font-medium disabled:opacity-50"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
              <button
                className="flex-1 rounded-xl border border-ink/20 py-2 font-medium"
                onClick={handleRegenerate}
                disabled={isLoading}
              >
                Regenerate
              </button>
              <button
                className="flex-1 rounded-xl border border-ink/20 py-2 font-medium"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="flex-1 rounded-xl bg-ink text-white py-2 font-medium"
                onClick={handleSave}
              >
                Save Project
              </button>
              <button
                className="flex-1 rounded-xl border border-ink/20 py-2 font-medium"
                onClick={() => handleExport("json")}
              >
                Export JSON
              </button>
              <button
                className="flex-1 rounded-xl border border-ink/20 py-2 font-medium"
                onClick={() => handleExport("md")}
              >
                Export Markdown
              </button>
            </div>

            {status && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                {status}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </section>

        <section className="bg-white shadow-soft rounded-3xl p-6 border border-ink/5">
          {blueprint ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                    Page Preview
                  </p>
                  <h2 className="text-2xl font-display">
                    {page?.title || inputs.targetPage}
                  </h2>
                  <p className="text-xs text-ink/50">
                    Target page: {inputs.targetPage}
                  </p>
                  <p className="text-xs text-ink/50">
                    Version: v{inputs.version}
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-xs text-ink/60">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wireframeMode}
                      onChange={(event) => setWireframeMode(event.target.checked)}
                    />
                    Wireframe Mode
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateMode}
                      onChange={(event) => setTemplateMode(event.target.checked)}
                    />
                    Template Mode
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showGlobal}
                      onChange={(event) => setShowGlobal(event.target.checked)}
                    />
                    Show Global Settings
                  </label>
                </div>
              </div>

              {templateMode ? (
                <TemplatePage
                  blueprint={blueprint}
                  targetPage={inputs.targetPage}
                  primaryColor={inputs.primaryColor}
                  secondaryColor={inputs.secondaryColor}
                  logoDataUrl={inputs.logoDataUrl}
                  sections={pageSections}
                  onReorder={applySectionOrder}
                  onUpdateField={updateSectionField}
                  onUpdateBullet={updateSectionBullet}
                  onUpdateCta={updateSectionCta}
                />
              ) : wireframeMode ? (
                <WireframePage
                  blueprint={blueprint}
                  targetPage={inputs.targetPage}
                  primaryColor={inputs.primaryColor}
                  secondaryColor={inputs.secondaryColor}
                  logoDataUrl={inputs.logoDataUrl}
                  sections={pageSections}
                  onReorder={applySectionOrder}
                  onUpdateField={updateSectionField}
                  onUpdateBullet={updateSectionBullet}
                  onUpdateCta={updateSectionCta}
                />
              ) : pageSections.length > 0 ? (
                <div className="space-y-5">
                  {pageSections.map((section) => renderSection(section))}
                </div>
              ) : (
                <p className="text-sm text-ink/60">
                  No sections available for this page yet.
                </p>
              )}

              {showGlobal && (
                <div className="space-y-6 border-t border-ink/10 pt-6">
                  {recommendedPages.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                        Recommended Pages
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recommendedPages.map((pageName) => (
                          <button
                            key={pageName}
                            className={`text-xs rounded-full px-3 py-1 border ${
                              inputs.targetPage === pageName
                                ? "bg-accent text-white border-accent"
                                : "bg-shell border-ink/10 text-ink/70"
                            }`}
                            onClick={() => {
                              handleInputChange("targetPage", pageName);
                              setStatus("Target page selected. Click Generate.");
                            }}
                          >
                            {pageName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                      SEO
                    </p>
                    <EditableText
                      as="h2"
                      className="text-2xl font-display"
                      value={blueprint.seo.metaTitle}
                      onChange={(value) => updateSeo("metaTitle", value)}
                      placeholder="SEO Meta Title"
                    />
                    <EditableText
                      as="p"
                      className="text-sm text-ink/70"
                      value={blueprint.seo.metaDescription}
                      onChange={(value) =>
                        updateSeo("metaDescription", value)
                      }
                      placeholder="SEO Meta Description"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {blueprint.seo.keywords.map((keyword, index) => (
                        <EditableText
                          key={`${keyword}-${index}`}
                          as="span"
                          className="text-xs bg-shell border border-ink/10 rounded-full px-3 py-1"
                          value={keyword}
                          onChange={(value) => updateKeyword(index, value)}
                          placeholder="keyword"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                      Theme
                    </p>
                    <p className="text-sm text-ink/70">
                      Style: {blueprint.theme.styleKeywords.join(", ")}
                    </p>
                    <p className="text-sm text-ink/70">
                      Colors: {blueprint.theme.colorSuggestions.join(", ")}
                    </p>
                    <p className="text-sm text-ink/70">
                      Fonts: {blueprint.theme.fontSuggestions.join(", ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                      Page Design
                    </p>
                    <p className="text-sm text-ink/70">
                      Visual style: {design.visualStyle}
                    </p>
                    <p className="text-sm text-ink/70">
                      Layout notes: {design.layoutNotes}
                    </p>
                    <p className="text-sm text-ink/70">
                      Spacing: {design.spacing}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {design.palette.map((color) => (
                        <span
                          key={color}
                          className="text-xs bg-shell border border-ink/10 rounded-full px-3 py-1"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-ink/70">
                      Typography: {design.typography.join(", ")}
                    </p>
                    <p className="text-sm text-ink/70">
                      Imagery: {design.imagery.join(", ")}
                    </p>
                    <p className="text-sm text-ink/70">
                      Components: {design.components.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-ink/60">
              <p className="text-lg font-display">Preview will appear here.</p>
              <p className="text-sm">
                Fill out the form and generate a blueprint to start editing.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
