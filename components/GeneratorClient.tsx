"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import WidgetSection from "@/components/widgets/WidgetSection";
import WidgetLibraryModal from "@/components/widget-library/WidgetLibraryModal";
import { WIDGET_DEFINITIONS } from "@/lib/widgets/registry";
import { pageBlueprintToMarkdown } from "@/lib/markdown";
import {
  GeneratorInputs,
  PageBlueprint,
  Project,
  WidgetInstance
} from "@/lib/types";
import { DENTAL_PACKS } from "@/lib/packs/dentalPacks";
import {
  getProjectById,
  loadProjects,
  setCurrentProjectId,
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
  "Testimonials",
  "Pricing",
  "FAQ",
  "Contact"
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
  version: 1,
  packId: "dental_medical_blue"
};

const createSeed = () => Math.random().toString(36).slice(2, 8);

function normalizePageKey(page: string) {
  return page.trim().toLowerCase();
}

export default function GeneratorClient() {
  const searchParams = useSearchParams();
  const [inputs, setInputs] = useState<GeneratorInputs>(defaultInputs);
  const [pageBlueprints, setPageBlueprints] = useState<Record<string, PageBlueprint>>({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addWidgetPrompt, setAddWidgetPrompt] = useState("");
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);

  const currentProjects = useMemo(() => loadProjects(), [status]);

  const canGenerate = useMemo(() => {
    return (
      inputs.businessName.trim() &&
      inputs.city.trim() &&
      inputs.prompt.trim()
    );
  }, [inputs]);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId) return;
    const project = getProjectById(projectId);
    if (!project) return;
    setInputs({ ...defaultInputs, ...project.inputs });
    setPageBlueprints(project.pageBlueprints ?? {});
    setStatus("Project loaded.");
    setCurrentProjectId(project.id);
  }, [searchParams]);

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
      const response = await fetch("/api/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputs, designVariationSeed: seed, version: 1 })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate page.");
      }
      const data = (await response.json()) as PageBlueprint;
      const key = normalizePageKey(inputs.targetPage);
      setPageBlueprints((prev) => ({ ...prev, [key]: data }));
      setStatus("Page generated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while generating."
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
      const response = await fetch("/api/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputs, designVariationSeed: seed, version: nextVersion })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate page.");
      }
      const data = (await response.json()) as PageBlueprint;
      const key = normalizePageKey(inputs.targetPage);
      setPageBlueprints((prev) => ({ ...prev, [key]: data }));
      setStatus(`Page generated (v${nextVersion}).`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while generating."
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputs, canGenerate]);

  const handleClear = () => {
    setInputs(defaultInputs);
    setPageBlueprints({});
    setStatus("Cleared.");
    setError("");
  };

  const handleSave = () => {
    const project: Project = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      inputs,
      pageBlueprints
    };
    upsertProject(project);
    setCurrentProjectId(project.id);
    setStatus("Project saved.");
  };

  const handleExport = (format: "json" | "md") => {
    const currentPage = pageBlueprints[normalizePageKey(inputs.targetPage)];
    if (!currentPage) {
      setError("Generate a page before exporting.");
      return;
    }
    const data =
      format === "json"
        ? JSON.stringify(currentPage, null, 2)
        : pageBlueprintToMarkdown(currentPage);
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

  const updateWidget = (pageKey: string, widgetId: string, next: WidgetInstance) => {
    setPageBlueprints((prev) => {
      const page = prev[pageKey];
      if (!page) return prev;
      return {
        ...prev,
        [pageKey]: {
          ...page,
          widgets: page.widgets.map((widget) => (widget.id === widgetId ? next : widget))
        }
      };
    });
  };

  const insertWidget = (pageKey: string, widget: WidgetInstance, insertAfterId?: string | null) => {
    setPageBlueprints((prev) => {
      const page = prev[pageKey];
      if (!page) return prev;
      const nextWidgets = [...page.widgets];
      if (insertAfterId) {
        const index = nextWidgets.findIndex((item) => item.id === insertAfterId);
        if (index >= 0) {
          nextWidgets.splice(index + 1, 0, widget);
        } else {
          nextWidgets.push(widget);
        }
      } else {
        nextWidgets.push(widget);
      }
      return { ...prev, [pageKey]: { ...page, widgets: nextWidgets } };
    });

    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-widget-id="${widget.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  const removeWidget = (pageKey: string, widgetId: string) => {
    setPageBlueprints((prev) => {
      const page = prev[pageKey];
      if (!page) return prev;
      return {
        ...prev,
        [pageKey]: { ...page, widgets: page.widgets.filter((w) => w.id !== widgetId) }
      };
    });
  };

  const moveWidget = (pageKey: string, widgetId: string, direction: "up" | "down") => {
    setPageBlueprints((prev) => {
      const page = prev[pageKey];
      if (!page) return prev;
      const index = page.widgets.findIndex((w) => w.id === widgetId);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= page.widgets.length) return prev;
      const nextWidgets = [...page.widgets];
      const [moved] = nextWidgets.splice(index, 1);
      nextWidgets.splice(nextIndex, 0, moved);
      return { ...prev, [pageKey]: { ...page, widgets: nextWidgets } };
    });
  };

  const handleAddWidgetAI = async () => {
    const prompt = addWidgetPrompt.trim();
    if (!prompt) return;
    const pageKey = normalizePageKey(inputs.targetPage);
    const currentPage = pageBlueprints[pageKey];
    if (!currentPage) {
      setError("Generate a page before adding widgets.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/add-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs,
          targetPage: inputs.targetPage,
          widgets: currentPage.widgets.map((widget) => ({
            widgetType: widget.widgetType,
            variant: widget.variant
          })),
          userPrompt: prompt
        })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to add widget.");
      }
      const data = (await response.json()) as { widget: WidgetInstance; insertAfterId?: string };
      insertWidget(pageKey, data.widget, data.insertAfterId ?? activeWidgetId);
      setAddWidgetPrompt("");
      setStatus("Widget added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add widget.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentPage = pageBlueprints[normalizePageKey(inputs.targetPage)];
  const theme = currentPage?.theme ?? {
    primaryColor: inputs.primaryColor,
    secondaryColor: inputs.secondaryColor,
    logoDataUrl: inputs.logoDataUrl
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={inputs.logoDataUrl}
                  alt="Logo preview"
                  className="mt-2 h-12 w-12 rounded-xl object-contain border border-ink/10 bg-white"
                />
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-ink/70">
                დიზაინის პაკეტი
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
                value={inputs.packId}
                onChange={(event) => {
                  const packId = event.target.value as GeneratorInputs["packId"];
                  const pack = DENTAL_PACKS.find((p) => p.packId === packId);
                  setInputs((prev) => ({
                    ...prev,
                    packId,
                    primaryColor: pack?.tokens.primaryColorDefault ?? prev.primaryColor,
                    secondaryColor: pack?.tokens.secondaryColorDefault ?? prev.secondaryColor
                  }));
                }}
              >
                {DENTAL_PACKS.map((pack) => (
                  <option key={pack.packId} value={pack.packId}>
                    {pack.name}
                  </option>
                ))}
              </select>
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

            {status ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {status}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-ink/10 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                  Page Preview
                </p>
                <h2 className="text-xl font-display">
                  {currentPage?.page.title || inputs.targetPage}
                </h2>
                <p className="text-xs text-ink/50">
                  Target page: {inputs.targetPage} · Version v{inputs.version}
                </p>
              </div>
              <button
                onClick={() => setIsWidgetLibraryOpen(true)}
                className="rounded-xl border border-ink/20 px-3 py-2 text-sm"
                type="button"
              >
                Open Widget Library
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <input
                className="flex-1 rounded-xl border border-ink/10 px-3 py-2 text-sm"
                placeholder="Add widget with AI (e.g. CTA banner)"
                value={addWidgetPrompt}
                onChange={(event) => setAddWidgetPrompt(event.target.value)}
              />
              <button
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
                onClick={handleAddWidgetAI}
                disabled={isLoading}
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {currentPage?.widgets?.length ? (
              currentPage.widgets.map((widget, index) => (
                <div
                  key={widget.id}
                  data-widget-id={widget.id}
                  className={`space-y-2 rounded-3xl p-2 transition ${
                    activeWidgetId === widget.id ? "ring-2 ring-accent/40" : ""
                  }`}
                  onClick={() => setActiveWidgetId(widget.id)}
                >
                  <div className="flex items-center justify-between text-xs text-ink/40">
                    <span>
                      {widget.widgetType} · {widget.variant}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-ink/20 px-2 py-1"
                        onClick={() =>
                          moveWidget(normalizePageKey(inputs.targetPage), widget.id, "up")
                        }
                      >
                        Up
                      </button>
                      <button
                        className="rounded-lg border border-ink/20 px-2 py-1"
                        onClick={() =>
                          moveWidget(normalizePageKey(inputs.targetPage), widget.id, "down")
                        }
                      >
                        Down
                      </button>
                      <button
                        className="rounded-lg border border-red-200 text-red-600 px-2 py-1"
                        onClick={() =>
                          removeWidget(normalizePageKey(inputs.targetPage), widget.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <WidgetSection
                    widget={widget}
                    theme={theme}
                    onUpdate={(next) =>
                      updateWidget(normalizePageKey(inputs.targetPage), widget.id, next)
                    }
                  />
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-ink/10 bg-white p-6 text-sm text-ink/60">
                Generate a page to see widgets here.
              </div>
            )}
          </div>
        </section>
      </main>

      <WidgetLibraryModal
        isOpen={isWidgetLibraryOpen}
        onClose={() => setIsWidgetLibraryOpen(false)}
        theme={theme}
        onInsert={(widgetType, variant, props) => {
          const def = WIDGET_DEFINITIONS.find(
            (item) => item.widgetType === widgetType && item.variant === variant
          );
          const instance: WidgetInstance = {
            id: crypto.randomUUID(),
            widgetType,
            variant,
            props: def ? { ...def.defaultProps, ...props } : props,
            createdAt: new Date().toISOString()
          };
          insertWidget(normalizePageKey(inputs.targetPage), instance, activeWidgetId);
          setIsWidgetLibraryOpen(false);
          setActiveWidgetId(instance.id);
        }}
        language={inputs.language}
      />
    </div>
  );
}
