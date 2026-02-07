"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EditableText from "@/components/EditableText";
import { blueprintToMarkdown } from "@/lib/markdown";
import {
  Blueprint,
  GeneratorInputs,
  Project,
  SectionType
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
  prompt: ""
};

export default function GeneratorClient() {
  const searchParams = useSearchParams();
  const [inputs, setInputs] = useState<GeneratorInputs>(defaultInputs);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (!projectId) return;
    const project = getProjectById(projectId);
    if (project) {
      setInputs(project.inputs);
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
    value: string
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
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs)
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
    const data =
      format === "json"
        ? JSON.stringify(blueprint, null, 2)
        : blueprintToMarkdown(blueprint);
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
          ? { ...section, cta: { ...section.cta, [field]: value } }
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
                onClick={handleGenerate}
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
            <div className="space-y-8">
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
                  onChange={(value) => updateSeo("metaDescription", value)}
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

              {sectionOrder.map((type) => {
                const section = blueprint.pages[0].sections.find(
                  (entry) => entry.type === type
                );
                if (!section) return null;
                return (
                  <div key={section.type} className="border-t border-ink/10 pt-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
                      {section.type.replace("_", " ")}
                    </p>
                    <EditableText
                      as="h3"
                      className="text-xl font-display"
                      value={section.heading}
                      onChange={(value) =>
                        updateSectionField(section.type, "heading", value)
                      }
                      placeholder="Section heading"
                    />
                    <EditableText
                      as="p"
                      className="text-sm text-ink/70"
                      value={section.content}
                      onChange={(value) =>
                        updateSectionField(section.type, "content", value)
                      }
                      placeholder="Section content"
                    />
                    {section.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((bullet, index) => (
                          <li key={`${section.type}-${index}`}>
                            <EditableText
                              as="p"
                              className="text-sm text-ink/70"
                              value={bullet}
                              onChange={(value) =>
                                updateSectionBullet(section.type, index, value)
                              }
                              placeholder="Bullet"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <EditableText
                        as="span"
                        className="text-xs uppercase tracking-[0.2em] text-ink/50"
                        value={section.cta.label}
                        onChange={(value) =>
                          updateSectionCta(section.type, "label", value)
                        }
                        placeholder="CTA label"
                      />
                      <EditableText
                        as="span"
                        className="text-xs text-ink/60"
                        value={section.cta.href}
                        onChange={(value) =>
                          updateSectionCta(section.type, "href", value)
                        }
                        placeholder="CTA link"
                      />
                    </div>
                  </div>
                );
              })}
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
