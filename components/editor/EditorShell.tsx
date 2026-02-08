"use client";

import { useEffect, useMemo, useState } from "react";
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

const tabs = ["გვერდები", "თემა", "SEO", "ვიჯეტები"] as const;

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
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("გვერდები");
  const [selectedPageId, setSelectedPageId] = useState(site.pages[0]?.id);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    site.pages[0]?.sections[0]?.id || null
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [regenerating, setRegenerating] = useState(false);
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
    if (!input.logoUrl) return;
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) => ({
        ...page,
        sections: page.sections.map((section) =>
          section.widget === "header" && !section.props?.logo
            ? { ...section, props: { ...section.props, logo: input.logoUrl } }
            : section
        ),
      })),
    }));
  }, [input.logoUrl]);

  useEffect(() => {
    if (!site.pages.length) return;
    const navLinks = site.pages.map((page) => ({ label: page.name, href: page.slug }));
    let needsUpdate = false;

    const nextPages = site.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) => {
        if (section.widget !== "header") return section;
        const nextNav = navLinks;
        const nextCta = section.props?.cta?.label ? section.props.cta : { label: "დაწყება", href: "#contact" };
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
    const timer = setTimeout(() => {
      fetch(`/api/projects/${project.edit_token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, seo, input }),
      }).catch(() => null);
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
        throw new Error(data?.error || "გენერაცია ვერ შესრულდა.");
      }
      setSite(data.site);
      setSeo(data.seo);
      setInput(data.input);
      setSelectedPageId(data.site.pages[0]?.id);
      setSelectedSectionId(data.site.pages[0]?.sections[0]?.id || null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "გენერაცია ვერ შესრულდა.");
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
                    label: next.label ?? section.props?.cta?.label ?? "დაწყება",
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>გვერდები არ მოიძებნა.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
            <h1 className="text-lg font-semibold">რედაქტორი</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={() => setViewMode(viewMode === "desktop" ? "mobile" : "desktop")}
            >
              {viewMode === "desktop" ? "მობილური" : "დესკტოპი"}
            </button>
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "მზადდება..." : "ხელახლა გენერაცია"}
            </button>
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={() => setShareOpen(true)}
            >
              გაზიარება
            </button>
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              onClick={downloadSeo}
            >
              SEO JSON ჩამოტვირთვა
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[280px_1fr] gap-6 px-6 py-6">
        <aside className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900 p-5 text-white">
          <a
            href="/rules"
            className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70"
            target="_blank"
            rel="noreferrer"
          >
            შაბლონების წესები (დროებითი)
          </a>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`w-full rounded-full px-4 py-2 text-left text-sm ${
                  tab === selectedTab ? "bg-white text-slate-900" : "text-white/70"
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === "გვერდები" && (
            <div className="space-y-2 text-sm">
              {site.pages.map((page) => (
                <button
                  key={page.id}
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    page.id === currentPage.id ? "bg-white text-slate-900" : "text-white/70"
                  }`}
                  onClick={() => setSelectedPageId(page.id)}
                >
                  {page.name}
                </button>
              ))}
            </div>
          )}


          {selectedTab === "თემა" && (
            <div className="space-y-4 text-sm">
              <label className="block">
                ლოგო
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full rounded-xl border border-white/20 bg-transparent p-2 text-xs"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    handleLogoUpload(file);
                    event.currentTarget.value = "";
                  }}
                />
                <p className="mt-2 text-xs text-white/60">
                  რეკომენდებული ზომა: 120×120px ან 240×240px (კვადრატი).
                </p>
                <button
                  className="mt-2 rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                  onClick={(event) => {
                    event.preventDefault();
                    removeLogo();
                  }}
                >
                  ლოგოს წაშლა
                </button>
                {input.logoUrl && (
                  <p className="mt-2 break-all text-[10px] text-white/40">
                    მიმდინარე ლოგო: {input.logoUrl}
                  </p>
                )}
              </label>
              <label className="block">
                მთავარი ფერი
                <input
                  type="color"
                  value={site.theme.primaryColor}
                  className="mt-2 h-10 w-full rounded-xl border border-white/20 bg-transparent"
                  onChange={(event) =>
                    setSite((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, primaryColor: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="block">
                მეორადი ფერი
                <input
                  type="color"
                  value={site.theme.secondaryColor}
                  className="mt-2 h-10 w-full rounded-xl border border-white/20 bg-transparent"
                  onChange={(event) =>
                    setSite((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, secondaryColor: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="block">
                CTA ტექსტი
                <input
                  className="mt-2 w-full rounded-xl border border-white/20 bg-transparent p-2 text-xs text-white"
                  value={
                    (site.pages[0]?.sections.find((section) => section.widget === "header")?.props
                      ?.cta?.label as string) || "დაწყება"
                  }
                  onChange={(event) => updateHeaderCta({ label: event.target.value })}
                />
              </label>
              <label className="block">
                CTA ბმული
                <input
                  className="mt-2 w-full rounded-xl border border-white/20 bg-transparent p-2 text-xs text-white"
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

          {selectedTab === "ვიჯეტები" && (
            <div className="space-y-4 text-sm">
              <p className="text-white/70">
                ქვემოთ ხედავთ ყველა ვიჯეტის სრულ ვიზუალურ პრევიუს (ყველა ვარიანტი).
              </p>
            </div>
          )}
        </aside>

        <main>
          {selectedTab === "ვიჯეტები" ? (
            <div className="space-y-10">
              {Object.entries(
                Object.values(widgetRegistry).reduce((acc, widget) => {
                  acc[widget.category] = acc[widget.category] || [];
                  acc[widget.category].push(widget);
                  return acc;
                }, {} as Record<string, typeof widgetRegistry[keyof typeof widgetRegistry][]>)
              ).map(([category, widgets]) => (
                <section key={category} className="space-y-6">
                  <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                    {category}
                  </div>
                  {widgets.map((widget) => (
                    <div key={widget.type} className="rounded-[28px] border border-white/10 bg-slate-900 p-6">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <h3 className="text-lg font-semibold">{widget.name}</h3>
                        </div>
                        <span className="text-xs text-white/50">{widget.type}</span>
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
                          <div key={`${widget.type}-${variant}`} className="rounded-[24px] border border-white/10 bg-white">
                            <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500">
                              ვარიანტი: {variant}
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
                                headerSample || widget.defaultProps(input, 0),
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
              className={`rounded-[32px] border border-slate-200 bg-white ${
                viewMode === "mobile" ? "mx-auto max-w-[420px]" : ""
              }`}
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
                              <div className="rounded-[20px] border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-sm text-slate-500">
                                სექცია დამალულია
                              </div>
                            ) : (
                              renderWidget(
                                section.widget as WidgetType,
                                section.variant,
                                section.props,
                                site.theme,
                                isSelected,
                                (path, value) => {
                                  updateSection(section.id, (sectionData) => ({
                                    ...sectionData,
                                    props: updateByPath(sectionData.props, path, value),
                                  }));
                                }
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
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">გაზიარების ბმული</h2>
            <button className="text-sm text-slate-500" onClick={() => setShareOpen(false)}>
              დახურვა
            </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              მხოლოდ ნახვის ბმულის ვადა იწურება {expiresAt}.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-200 p-3 text-sm"
                value={`${baseUrl}/s/${project.share_slug}`}
                readOnly
              />
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  navigator.clipboard.writeText(`${baseUrl}/s/${project.share_slug}`);
                }}
              >
                კოპირება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
