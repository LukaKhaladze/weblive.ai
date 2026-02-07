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
import WidgetPickerModal from "@/components/editor/WidgetPickerModal";
import SeoPanel from "@/components/editor/SeoPanel";
import { renderWidget, widgetRegistry, WidgetType } from "@/widgets/registry";
import { Site, SeoPayload, WizardInput } from "@/lib/schema";
import { updateByPath } from "@/lib/deepUpdate";

const tabs = ["Sections", "Pages", "Theme", "SEO"] as const;

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
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("Sections");
  const [selectedPageId, setSelectedPageId] = useState(site.pages[0]?.id);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    site.pages[0]?.sections[0]?.id || null
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const sensors = useSensors(useSensor(PointerSensor));

  const currentPage = useMemo(
    () => site.pages.find((page) => page.id === selectedPageId) || site.pages[0],
    [site.pages, selectedPageId]
  );

  const selectedSection = currentPage?.sections.find(
    (section) => section.id === selectedSectionId
  );

  useEffect(() => {
    if (currentPage && !selectedSection) {
      setSelectedSectionId(currentPage.sections[0]?.id || null);
    }
  }, [currentPage, selectedSection]);

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

  function handleAddSection(widget: WidgetType, variant: string) {
    if (!currentPage) return;
    const newSection = {
      id: `sec_${Math.random().toString(36).slice(2, 8)}`,
      widget,
      variant,
      props: widgetRegistry[widget].defaultProps(input, currentPage.sections.length),
    };
    setSite((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === currentPage.id
          ? { ...page, sections: [...page.sections, newSection] }
          : page
      ),
    }));
    setSelectedSectionId(newSection.id);
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

  async function handleImageUpload(sectionId: string, path: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", project.id);
    form.append("type", path.includes("logo") ? "logo" : "images");

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    if (data?.url) {
      updateSection(sectionId, (section) => ({
        ...section,
        props: updateByPath(section.props, path, data.url),
      }));
    }
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

  const expiresAt = new Date(project.expires_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>No pages available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
            <h1 className="text-lg font-semibold">Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={() => setViewMode(viewMode === "desktop" ? "mobile" : "desktop")}
            >
              {viewMode === "desktop" ? "Mobile" : "Desktop"}
            </button>
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={() => setShareOpen(true)}
            >
              Share
            </button>
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              onClick={downloadSeo}
            >
              Download SEO JSON
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[280px_1fr] gap-6 px-6 py-6">
        <aside className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900 p-5 text-white">
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

          {selectedTab === "Sections" && (
            <div className="space-y-3">
              <button
                className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setPickerOpen(true)}
              >
                Add section
              </button>
              <div className="space-y-2 text-sm">
                {currentPage.sections.map((section) => (
                  <button
                    key={section.id}
                    className={`w-full rounded-xl px-3 py-2 text-left ${
                      section.id === selectedSectionId ? "bg-white text-slate-900" : "text-white/70"
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    {widgetRegistry[section.widget as WidgetType]?.name || section.widget}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "Pages" && (
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

          {selectedTab === "Theme" && (
            <div className="space-y-4 text-sm">
              <label className="block">
                Primary Color
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
                Secondary Color
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
            </div>
          )}

          {selectedTab === "SEO" && <SeoPanel seo={seo} />}
        </aside>

        <main>
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
                  {currentPage.sections.map((section, index) => (
                    <SectionFrame
                      key={section.id}
                      id={section.id}
                      selected={section.id === selectedSectionId}
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
                    >
                      {renderWidget(section.widget as WidgetType, section.variant, section.props, site.theme)}
                    </SectionFrame>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {selectedSection && selectedTab !== "SEO" && (
            <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Edit Section</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {widgetRegistry[selectedSection.widget as WidgetType]?.editable.map((field) => (
                  <label key={field.path} className="text-sm">
                    <span className="text-slate-600">{field.label}</span>
                    {field.type === "textarea" && (
                      <textarea
                        className="mt-2 w-full rounded-xl border border-slate-200 p-3"
                        rows={3}
                        value={field.path
                          .split(".")
                          .reduce((acc: any, key) => acc?.[key], selectedSection.props) || ""}
                        onChange={(event) =>
                          updateSection(selectedSection.id, (section) => ({
                            ...section,
                            props: updateByPath(section.props, field.path, event.target.value),
                          }))
                        }
                      />
                    )}
                    {field.type === "text" && (
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-200 p-3"
                        value={field.path
                          .split(".")
                          .reduce((acc: any, key) => acc?.[key], selectedSection.props) || ""}
                        onChange={(event) =>
                          updateSection(selectedSection.id, (section) => ({
                            ...section,
                            props: updateByPath(section.props, field.path, event.target.value),
                          }))
                        }
                      />
                    )}
                    {field.type === "list" && (
                      <textarea
                        className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-xs"
                        rows={4}
                        value={JSON.stringify(
                          field.path
                            .split(".")
                            .reduce((acc: any, key) => acc?.[key], selectedSection.props) || [],
                          null,
                          2
                        )}
                        onChange={(event) => {
                          try {
                            const parsed = JSON.parse(event.target.value);
                            updateSection(selectedSection.id, (section) => ({
                              ...section,
                              props: updateByPath(section.props, field.path, parsed),
                            }));
                          } catch {
                            // ignore invalid JSON while typing
                          }
                        }}
                      />
                    )}
                    {field.type === "image" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs"
                          value={field.path
                            .split(".")
                            .reduce((acc: any, key) => acc?.[key], selectedSection.props) || ""}
                          onChange={(event) =>
                            updateSection(selectedSection.id, (section) => ({
                              ...section,
                              props: updateByPath(section.props, field.path, event.target.value),
                            }))
                          }
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-2 text-xs"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              handleImageUpload(selectedSection.id, field.path, file);
                            }
                          }}
                        />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <WidgetPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddSection}
      />

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Share link</h2>
              <button className="text-sm text-slate-500" onClick={() => setShareOpen(false)}>
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              View-only link expires on {expiresAt}.
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
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
