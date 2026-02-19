"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import SectionFrame from "@/components/editor/SectionFrame";
import SeoPanel from "@/components/editor/SeoPanel";
import { renderWidget, widgetRegistry, WidgetType } from "@/widgets/registry";
import { Site, SeoPayload, WizardInput } from "@/lib/schema";
import { updateByPath } from "@/lib/deepUpdate";
import Image from "next/image";

const tabs = ["Pages", "Theme", "SEO", "Widgets"] as const;

export default function EditorShell({
  project,
  baseUrl,
}: {
  project: {
    id: string;
    input: WizardInput;
    site: Site;
    seo: SeoPayload;
    expires_at: string;
    share_slug: string;
    edit_token: string;
  };
  baseUrl: string;
}) {
  const [site, setSite] = useState<Site>(project.site);
  const [seo, setSeo] = useState<SeoPayload>(project.seo);
  const [input, setInput] = useState<WizardInput>(project.input);
  const headerLogoFromSite = useMemo(
    () =>
      site.pages
        .flatMap((page) => page.sections)
        .find((section) => section.widget === "header")?.props?.logo || "",
    [site.pages]
  );
  const resolvedLogoUrl = input.logoUrl || headerLogoFromSite || project.input.logoUrl || "";
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("Pages");
  const [selectedPageId, setSelectedPageId] = useState(site.pages[0]?.id);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    site.pages[0]?.sections[0]?.id || null
  );
  const [widgetFilter, setWidgetFilter] = useState<"all" | "ecommerce" | "informational">("all");
  const [shareOpen, setShareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [regenerating, setRegenerating] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const lastSavedPayloadRef = useRef(JSON.stringify({ site: project.site, seo: project.seo, input: project.input }));
  const sensors = useSensors(useSensor(PointerSensor));

  const currentPage = useMemo(
    () => site.pages.find((page) => page.id === selectedPageId) || site.pages[0],
    [site.pages, selectedPageId]
  );

  const selectedSection = currentPage?.sections.find(
    (section) => section.id === selectedSectionId
  );

  const defaultSectionStyle = {
    bg: "none",
    bgImage: "",
    padding: "md",
    align: "left",
    width: "contained",
    hidden: false,
  };

  function getSectionStyle(section: any) {
    return { ...defaultSectionStyle, ...(section.props?._style || {}) };
  }

  useEffect(() => {
    if (currentPage && !selectedSection) {
      setSelectedSectionId(currentPage.sections[0]?.id || null);
    }
  }, [currentPage, selectedSection]);

  useEffect(() => {
    if (!resolvedLogoUrl) return;
    if (input.logoUrl !== resolvedLogoUrl) {
      setInput((prev) => ({ ...prev, logoUrl: resolvedLogoUrl }));
    }
  }, [resolvedLogoUrl, input.logoUrl]);

  useEffect(() => {
    if (!resolvedLogoUrl) return;
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.widget === "header"
            ? { ...section, props: { ...section.props, logo: resolvedLogoUrl } }
            : section
        ),
      })),
    }));
  }, [resolvedLogoUrl]);

  useEffect(() => {
    if (!site.pages.length) return;
    const navLinks = site.pages
      .filter((page) => page.slug !== "/product")
      .reduce<{ label: string; href: string }[]>((acc, page) => {
        if (acc.some((item) => item.href === page.slug)) return acc;
        acc.push({ label: page.name, href: page.slug });
        return acc;
      }, []);
    let needsUpdate = false;

    const nextPages = site.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => {
        if (section.widget !== "header") return section;
        const nextNav = navLinks;
        const nextCta = section.props?.cta?.label ? section.props.cta : { label: "Get Started", href: "#contact" };
        const navChanged = JSON.stringify(section.props?.nav || []) !== JSON.stringify(nextNav);
        const ctaChanged = JSON.stringify(section.props?.cta || {}) !== JSON.stringify(nextCta);
        if (navChanged || ctaChanged) {
          needsUpdate = true;
          return {
            ...section,
            props: {
              ...section.props,
              nav: nextNav,
              cta: nextCta,
            },
          };
        }
        return section;
      }),
    }));

    if (needsUpdate) {
      setSite((prev) => ({ ...prev, pages: nextPages }));
    }
  }, [site.pages]);

  useEffect(() => {
    const payload = JSON.stringify({ site, seo, input });
    if (payload === lastSavedPayloadRef.current) return;
    setSaveState("saving");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${project.edit_token}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (!res.ok) {
          const errorPayload = await res.json().catch(() => null);
          throw new Error(errorPayload?.error || "Save failed.");
        }
        lastSavedPayloadRef.current = payload;
        setSaveState("saved");
      } catch (error) {
        console.error("Autosave failed", error);
        setSaveState("error");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [site, seo, input, project.edit_token]);

  function updateSection(sectionId: string, updater: (section: any) => any) {
    if (!currentPage) return;
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => {
        if (page.id !== currentPage.id) return page;
        return {
          ...page,
          sections: page.sections.map((section) =>
            section.id === sectionId ? updater(section) : section
          ),
        };
      }),
    }));
  }

  function updateWidgetEverywhere(widget: WidgetType, updater: (section: any) => any) {
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.widget === widget ? updater(section) : section
        ),
      })),
    }));
  }

  async function handleSectionUpload(
    sectionId: string,
    widgetType: WidgetType,
    path: string,
    file: File,
    kind: "logo" | "images" = "images"
  ) {
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", project.id);
    form.append("type", kind);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!data?.url) return;

    const applyUpdate = (sectionData: any) => ({
      ...sectionData,
      props: updateByPath(sectionData.props, path, data.url),
    });

    if (widgetType === "header" || widgetType === "hero") {
      updateWidgetEverywhere(widgetType, applyUpdate);
      if (widgetType === "header") {
        setInput((prev) => ({ ...prev, logoUrl: data.url }));
      }
      return;
    }

    updateSection(sectionId, applyUpdate);
  }

  function updatePageName(pageId: string, name: string) {
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => (page.id === pageId ? { ...page, name } : page)),
    }));
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!currentPage) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentPage.sections.findIndex((item) => item.id === active.id);
    const newIndex = currentPage.sections.findIndex((item) => item.id === over.id);

    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === currentPage.id
          ? { ...page, sections: arrayMove(page.sections, oldIndex, newIndex) }
          : page
      ),
    }));
  }

  function handleDeleteSection(sectionId: string) {
    if (!currentPage) return;
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => {
        if (page.id !== currentPage.id) return page;
        return {
          ...page,
          sections: page.sections.filter((section) => section.id !== sectionId),
        };
      }),
    }));
  }


  function downloadSeo() {
    const payload = JSON.stringify(seo, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "weblive-seo.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleRegenerate() {
    if (regenerating) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/regenerate/${project.edit_token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Generation failed.");
      }
      setSite(data.site);
      setSeo(data.seo);
      setInput(data.input);
      setSelectedPageId(data.site.pages[0]?.id);
      setSelectedSectionId(data.site.pages[0]?.sections[0]?.id || null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setRegenerating(false);
    }
  }


  async function handleLogoUpload(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", project.id);
    form.append("type", "logo");

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!data?.url) return;

    setInput((prev) => ({ ...prev, logoUrl: data.url }));
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.widget === "header"
            ? { ...section, props: { ...section.props, logo: data.url } }
            : section
        ),
      })),
    }));
  }

  function removeLogo() {
    setInput((prev) => ({ ...prev, logoUrl: "" }));
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.widget === "header"
            ? { ...section, props: { ...section.props, logo: "" } }
            : section
        ),
      })),
    }));
  }

  function updateHeaderCta(next: { label?: string; href?: string }) {
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.widget === "header"
            ? {
                ...section,
                props: {
                  ...section.props,
                  cta: {
                    label: next.label ?? section.props?.cta?.label ?? "Get Started",
                    href: next.href ?? section.props?.cta?.href ?? "#contact",
                  },
                },
              }
            : section
        ),
      })),
    }));
  }

  const expiresAt = new Date(project.expires_at).toLocaleDateString("ka-GE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!currentPage) {
    return (
    <div className="min-h-screen bg-primary text-[#F8FAFC] flex items-center justify-center">
        <p>Pages not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-[#F8FAFC]">
      <div className="sticky top-0 z-20 border-b border-border bg-primary/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[#F8FAFC]">
          <div>
            <div className="pl-6 pr-6">
              <Image src="/placeholders/weblive.png" alt="Weblive.ai" width={132} height={34} className="h-auto w-[132px]" />
            </div>
            <h1 className="text-lg font-semibold">Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary rounded-full px-4 py-2 text-sm"
              onClick={() => setViewMode(viewMode === "desktop" ? "mobile" : "desktop")}
            >
              {viewMode === "desktop" ? "Mobile" : "Desktop"}
            </button>
            <button
              className="btn-secondary rounded-full px-4 py-2 text-sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "Generating..." : "Regenerate"}
            </button>
            <button
              className="btn-secondary rounded-full px-4 py-2 text-sm"
              onClick={() => setShareOpen(true)}
            >
              Share
            </button>
            <span
              className={`text-xs ${
                saveState === "saved"
                  ? "text-emerald-300"
                  : saveState === "saving"
                  ? "text-amber-300"
                  : "text-rose-300"
              }`}
            >
              {saveState === "saved"
                ? "Saved"
                : saveState === "saving"
                ? "Saving..."
                : "Save error"}
            </span>
            <button className="btn-primary rounded-full px-4 py-2 text-sm font-semibold" onClick={downloadSeo}>
              Download SEO JSON
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[280px_1fr] gap-6 px-6 py-6">
        <aside className="space-y-6 border border-border bg-primary p-5 text-[#F8FAFC]">
          <a
            href="/rules"
            className="btn-secondary rounded-full px-4 py-2 text-xs text-muted"
            target="_blank"
            rel="noreferrer"
          >
            Template Rules (temporary)
          </a>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`w-full rounded-full px-4 py-2 text-left text-sm ${
                  tab === selectedTab ? "bg-brand-gradient text-white" : "text-muted hover:bg-border"
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === "Pages" && (
            <div className="space-y-2 text-sm">
              {site.pages.map((page) => (
                <button
                  key={page.id}
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    page.id === currentPage.id ? "bg-brand-gradient text-white" : "text-muted hover:bg-border"
                  }`}
                  onClick={() => setSelectedPageId(page.id)}
                >
                  {page.name}
                </button>
              ))}
            </div>
          )}


          {selectedTab === "Theme" && (
            <div className="space-y-4 text-sm">
              <label className="block">
                Logo
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full rounded-xl border border-border bg-transparent p-2 text-xs"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    handleLogoUpload(file);
                    event.currentTarget.value = "";
                  }}
                />
                <p className="mt-2 text-xs text-muted">
                  Recommended size: 120x120px or 240x240px (square).
                </p>
                <button
                  className="btn-secondary mt-2 rounded-full px-3 py-1 text-xs"
                  onClick={(event) => {
                    event.preventDefault();
                    removeLogo();
                  }}
                >
                  Remove Logo
                </button>
                {input.logoUrl && (
                  <p className="mt-2 break-all text-[10px] text-muted">
                    Current Logo: {input.logoUrl}
                  </p>
                )}
              </label>
              <label className="block">
                Primary color
                <input
                  type="color"
                  value={site.theme.primaryColor}
                  className="mt-2 h-10 w-full rounded-xl border border-border bg-transparent"
                  onChange={(event) =>
                    setSite((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, primaryColor: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="block">
                Secondary color
                <input
                  type="color"
                  value={site.theme.secondaryColor}
                  className="mt-2 h-10 w-full rounded-xl border border-border bg-transparent"
                  onChange={(event) =>
                    setSite((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, secondaryColor: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="block">
                CTA text
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-transparent p-2 text-xs text-[#F8FAFC]"
                  value={
                    (site.pages[0]?.sections.find((section) => section.widget === "header")?.props
                      ?.cta?.label as string) || "Get Started"
                  }
                  onChange={(event) => updateHeaderCta({ label: event.target.value })}
                />
              </label>
              <label className="block">
                CTA URL
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-transparent p-2 text-xs text-[#F8FAFC]"
                  value={
                    (site.pages[0]?.sections.find((section) => section.widget === "header")?.props
                      ?.cta?.href as string) || "#contact"
                  }
                  onChange={(event) => updateHeaderCta({ href: event.target.value })}
                />
              </label>
            </div>
          )}

          {selectedTab === "SEO" && <SeoPanel seo={seo} />}

          {selectedTab === "Widgets" && (
            <div className="space-y-4 text-sm">
              <p className="text-muted">
                Below is a full visual preview of all widget variants.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "ecommerce", label: "Ecommerce" },
                  { id: "informational", label: "Informational" },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`rounded-full px-4 py-2 text-xs ${
                      widgetFilter === item.id
                        ? "bg-brand-gradient text-white"
                        : "border border-border text-muted"
                    }`}
                    onClick={() => setWidgetFilter(item.id as typeof widgetFilter)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main>
          {selectedTab === "Widgets" ? (
            <div className="space-y-10">
              {Object.entries(
                Object.values(widgetRegistry)
                  .filter((widget) =>
                    widgetFilter === "all" ? true : widget.tags.includes(widgetFilter)
                  )
                  .reduce((acc, widget) => {
                  acc[widget.category] = acc[widget.category] || [];
                  acc[widget.category].push(widget);
                  return acc;
                }, {} as Record<string, typeof widgetRegistry[keyof typeof widgetRegistry][]>)
              ).map(([category, widgets]) => (
                <section key={category} className="space-y-6">
                  <div className="rounded-full border border-border bg-primary px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
                    {category}
                  </div>
                  {widgets.map((widget) => (
                    <div key={widget.type} className="border border-border bg-primary p-6">
                      <div className="flex items-center justify-between text-[#F8FAFC]">
                        <div>
                          <h3 className="text-lg font-semibold">{widget.name}</h3>
                        </div>
                        <span className="text-xs text-muted">{widget.type}</span>
                      </div>
                      <div className="mt-6 space-y-6">
                        {widget.variants.map((variant) => {
                          const headerSample =
                            widget.type === "header"
                              ? site.pages
                                  .flatMap((page) => page.sections)
                                  .find((section) => section.widget === "header")?.props
                              : null;
                          return (
                          <div key={`${widget.type}-${variant}`} className="border border-border bg-primary">
                            <div className="border-b border-border px-4 py-2 text-xs text-muted">
                              {widget.variantLabels?.[variant] || variant}
                            </div>
                            <div
                              className="p-4"
                              style={{
                                "--primary": site.theme.primaryColor,
                                "--secondary": site.theme.secondaryColor,
                                "--radius": `${site.theme.radius}px`,
                              } as React.CSSProperties}
                            >
                          {renderWidget(
                            widget.type as WidgetType,
                            variant,
                            headerSample
                              ? { ...headerSample, logo: resolvedLogoUrl || headerSample.logo || "" }
                              : widget.defaultProps(input, 0),
                            site.theme,
                            false
                          )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <div
              className={`border border-border bg-primary ${viewMode === "mobile" ? "mx-auto max-w-[420px]" : ""}`}
              style={{
                "--primary": site.theme.primaryColor,
                "--secondary": site.theme.secondaryColor,
                "--radius": `${site.theme.radius}px`,
              } as React.CSSProperties}
            >
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={currentPage.sections.map((section) => section.id)}>
                  <div className="space-y-8 p-4">
                    {currentPage.sections.map((section, index) => {
                      const isSelected = section.id === selectedSectionId;
                      const style = getSectionStyle(section);
                      const wrapperClasses = [
                        style.padding === "sm" ? "py-6" : style.padding === "lg" ? "py-16" : "py-10",
                        style.align === "center" ? "text-center" : "text-left",
                        style.width === "full" ? "w-full" : "max-w-6xl mx-auto",
                      ].join(" ");
                      const wrapperStyle =
                        style.bg === "none" && !style.bgImage
                          ? undefined
                          : {
                              backgroundColor: style.bg === "none" ? "transparent" : style.bg,
                              backgroundImage: style.bgImage ? `url(${style.bgImage})` : undefined,
                              backgroundSize: style.bgImage ? "cover" : undefined,
                              backgroundPosition: style.bgImage ? "center" : undefined,
                              backgroundRepeat: style.bgImage ? "no-repeat" : undefined,
                            };
                      return (
                        <SectionFrame
                          key={section.id}
                          id={section.id}
                          selected={isSelected}
                          onSelect={() => setSelectedSectionId(section.id)}
                          onDelete={() => handleDeleteSection(section.id)}
                          onDuplicate={() => {
                            const copy = { ...section, id: `sec_${Math.random().toString(36).slice(2, 8)}` };
                            setSite((prev) => ({
                              ...prev,
                              pages: prev.pages.map((page) =>
                                page.id === currentPage.id
                                  ? {
                                      ...page,
                                      sections: [
                                        ...page.sections.slice(0, index + 1),
                                        copy,
                                        ...page.sections.slice(index + 1),
                                      ],
                                    }
                                  : page
                              ),
                            }));
                          }}
                          onMoveUp={() => {
                            if (index === 0) return;
                            setSite((prev) => ({
                              ...prev,
                              pages: prev.pages.map((page) =>
                                page.id === currentPage.id
                                  ? {
                                      ...page,
                                      sections: arrayMove(page.sections, index, index - 1),
                                    }
                                  : page
                              ),
                            }));
                          }}
                          onMoveDown={() => {
                            if (index === currentPage.sections.length - 1) return;
                            setSite((prev) => ({
                              ...prev,
                              pages: prev.pages.map((page) =>
                                page.id === currentPage.id
                                  ? {
                                      ...page,
                                      sections: arrayMove(page.sections, index, index + 1),
                                    }
                                  : page
                              ),
                            }));
                          }}
                          toolbar={null}
                          disableControls
                        >
                          <div className={wrapperClasses} style={wrapperStyle}>
                            {style.hidden ? (
                              <div className="rounded-[20px] border border-dashed border-border bg-primary px-6 py-10 text-center text-sm text-muted">
                                Section is hidden
                              </div>
                            ) : (
                              renderWidget(
                                section.widget as WidgetType,
                                section.variant,
                                section.widget === "header"
                                  ? { ...section.props, logo: resolvedLogoUrl || section.props?.logo || "" }
                                  : section.props,
                                site.theme,
                                isSelected,
                                (path, value) => {
                                  const applyUpdate = (sectionData: any) => ({
                                    ...sectionData,
                                    props: updateByPath(sectionData.props, path, value),
                                  });

                                  if (section.widget === "header" || section.widget === "hero") {
                                    updateWidgetEverywhere(section.widget as WidgetType, applyUpdate);
                                  } else {
                                    updateSection(section.id, applyUpdate);
                                  }

                                  if (section.widget === "header" && path.startsWith("nav.")) {
                                    const parts = path.split(".");
                                    if (parts.length === 3 && parts[2] === "label") {
                                      const index = Number(parts[1]);
                                      const navItem = section.props?.nav?.[index];
                                      if (navItem?.href) {
                                        setSite((prev) => ({
                                          ...prev,
                                          pages: prev.pages.map((page) =>
                                            page.slug === navItem.href
                                              ? { ...page, name: value }
                                              : page
                                          ),
                                        }));
                                      }
                                    }
                                  }
                                }
                              ,
                                (path, file, kind) =>
                                  handleSectionUpload(
                                    section.id,
                                    section.widget as WidgetType,
                                    path,
                                    file,
                                    kind
                                  )
                              )
                            )}
                          </div>
                        </SectionFrame>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </main>
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-lg rounded-[28px] border border-border bg-primary p-6">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Share link</h2>
            <button className="text-sm text-muted" onClick={() => setShareOpen(false)}>
              Close
            </button>
            </div>
            <p className="mt-2 text-sm text-muted">
              View-only link expires on {expiresAt}.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-border bg-primary p-3 text-sm text-[#F8FAFC]"
                value={`${baseUrl}/s/${project.share_slug}`}
                readOnly
              />
              <button
                className="btn-primary rounded-full px-4 py-2 text-sm font-semibold"
                onClick={() => {
                  navigator.clipboard.writeText(`${baseUrl}/s/${project.share_slug}`);
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
