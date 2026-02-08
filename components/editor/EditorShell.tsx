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

const tabs = ["სექციები", "გვერდები", "თემა", "SEO"] as const;

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
  const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>("სექციები");
  const [selectedPageId, setSelectedPageId] = useState(site.pages[0]?.id);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    site.pages[0]?.sections[0]?.id || null
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [styleBreakpoint, setStyleBreakpoint] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedElementPath, setSelectedElementPath] = useState<string | null>(null);
  const [selectedImagePath, setSelectedImagePath] = useState<string | null>(null);
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
    if (!selectedSection) return;
    const editableFields =
      widgetRegistry[selectedSection.widget as WidgetType]?.editable.filter(
        (field) => field.type === "text" || field.type === "textarea"
      ) || [];
    setSelectedElementPath(editableFields[0]?.path || null);
  }, [selectedSection]);

  function findImagePaths(value: any, path: string[] = [], acc: string[] = []) {
    if (!value || typeof value !== "object") return acc;
    if (Array.isArray(value)) {
      value.forEach((item, index) => findImagePaths(item, [...path, String(index)], acc));
      return acc;
    }

    Object.entries(value).forEach(([key, val]) => {
      if (key === "_style" || key === "_textStyles") return;
      const nextPath = [...path, key];
      if (key === "logo" && typeof val === "string") {
        acc.push(nextPath.join("."));
        return;
      }
      if (key === "src" && typeof val === "string") {
        const parent = path[path.length - 1];
        if (parent === "image") {
          acc.push(nextPath.join("."));
          return;
        }
      }
      if (typeof val === "object") {
        findImagePaths(val, nextPath, acc);
      }
    });
    return acc;
  }

  const imagePaths = useMemo(
    () => (selectedSection ? findImagePaths(selectedSection.props) : []),
    [selectedSection]
  );

  useEffect(() => {
    setSelectedImagePath(imagePaths[0] || null);
  }, [selectedSectionId, JSON.stringify(imagePaths)]);

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

  async function handleBackgroundUpload(sectionId: string, file: File) {
    await handleImageUpload(sectionId, "_style.bgImage", file);
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

          {selectedTab === "სექციები" && (
            <div className="space-y-3">
              <button
                className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setPickerOpen(true)}
              >
                სექციის დამატება
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
                    const textFields =
                      widgetRegistry[section.widget as WidgetType]?.editable.filter(
                        (field) => field.type === "text" || field.type === "textarea"
                      ) || [];
                    const selectedField =
                      textFields.find((field) => field.path === selectedElementPath) ||
                      textFields[0];
                    const textStyles = section.props?._textStyles || {};
                    const activeStyle =
                      (selectedField && textStyles[selectedField.path]?.[styleBreakpoint]) || {};

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
                      toolbar={
                        isSelected ? (
                          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                            <div className="flex flex-wrap items-center gap-3 overflow-x-auto">
                              <div className="flex items-center gap-2">
                                <button
                                  className={`rounded-full border px-2 py-1 ${styleBreakpoint === "desktop" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setStyleBreakpoint("desktop");
                                  }}
                                >
                                  Desktop
                                </button>
                                <button
                                  className={`rounded-full border px-2 py-1 ${styleBreakpoint === "tablet" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setStyleBreakpoint("tablet");
                                  }}
                                >
                                  Tablet
                                </button>
                                <button
                                  className={`rounded-full border px-2 py-1 ${styleBreakpoint === "mobile" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setStyleBreakpoint("mobile");
                                  }}
                                >
                                  Mobile
                                </button>
                              </div>
                              <label className="flex items-center gap-2 whitespace-nowrap">
                                ფონი
                                <input
                                  type="color"
                                  value={style.bg === "none" ? "#ffffff" : style.bg}
                                  onChange={(event) => {
                                    updateSection(section.id, (sectionData) => ({
                                      ...sectionData,
                                      props: updateByPath(sectionData.props, "_style", {
                                        ...style,
                                        bg: event.target.value,
                                      }),
                                    }));
                                  }}
                                />
                                <button
                                  className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    updateSection(section.id, (sectionData) => ({
                                      ...sectionData,
                                      props: updateByPath(sectionData.props, "_style", {
                                        ...style,
                                        bg: "none",
                                      }),
                                    }));
                                  }}
                                >
                                  გამორთვა
                                </button>
                              </label>
                              <label className="flex items-center gap-2 whitespace-nowrap">
                                ფონის სურათი
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`bg-${section.id}`}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    handleBackgroundUpload(section.id, file);
                                    event.currentTarget.value = "";
                                  }}
                                />
                                <button
                                  className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    document.getElementById(`bg-${section.id}`)?.click();
                                  }}
                                >
                                  ატვირთვა
                                </button>
                                {style.bgImage && (
                                  <button
                                    className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      updateSection(section.id, (sectionData) => ({
                                        ...sectionData,
                                        props: updateByPath(sectionData.props, "_style", {
                                          ...style,
                                          bgImage: "",
                                        }),
                                      }));
                                    }}
                                  >
                                    წაშლა
                                  </button>
                                )}
                              </label>
                              {imagePaths.length > 0 && (
                                <label className="flex items-center gap-2 whitespace-nowrap">
                                  სექციის სურათი
                                  <select
                                    className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                    value={selectedImagePath || ""}
                                    onChange={(event) => setSelectedImagePath(event.target.value)}
                                  >
                                    {imagePaths.map((path) => (
                                      <option key={path} value={path}>
                                        {path}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`img-${section.id}`}
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      if (!file || !selectedImagePath) return;
                                      handleImageUpload(section.id, selectedImagePath, file);
                                      event.currentTarget.value = "";
                                    }}
                                  />
                                  <button
                                    className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      document.getElementById(`img-${section.id}`)?.click();
                                    }}
                                  >
                                    შეცვლა
                                  </button>
                                </label>
                              )}
                              <label className="flex items-center gap-2 whitespace-nowrap">
                                შიდა დაშორება
                                <select
                                  className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                  value={style.padding}
                                  onChange={(event) =>
                                    updateSection(section.id, (sectionData) => ({
                                      ...sectionData,
                                      props: updateByPath(sectionData.props, "_style", {
                                        ...style,
                                        padding: event.target.value,
                                      }),
                                    }))
                                  }
                                >
                                  <option value="sm">კომპაქტური</option>
                                  <option value="md">სტანდარტული</option>
                                  <option value="lg">ფართო</option>
                                </select>
                              </label>
                              <label className="flex items-center gap-2 whitespace-nowrap">
                                ტექსტის განლაგება
                                <select
                                  className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                  value={style.align}
                                  onChange={(event) =>
                                    updateSection(section.id, (sectionData) => ({
                                      ...sectionData,
                                      props: updateByPath(sectionData.props, "_style", {
                                        ...style,
                                        align: event.target.value,
                                      }),
                                    }))
                                  }
                                >
                                  <option value="left">მარცხნივ</option>
                                  <option value="center">ცენტრში</option>
                                </select>
                              </label>
                              <label className="flex items-center gap-2 whitespace-nowrap">
                                სიგანე
                                <select
                                  className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                  value={style.width}
                                  onChange={(event) =>
                                    updateSection(section.id, (sectionData) => ({
                                      ...sectionData,
                                      props: updateByPath(sectionData.props, "_style", {
                                        ...style,
                                        width: event.target.value,
                                      }),
                                    }))
                                  }
                                >
                                  <option value="contained">შეკუმშული</option>
                                  <option value="full">სრული</option>
                                </select>
                              </label>
                              <label className="flex items-center gap-2 whitespace-nowrap">
                                დამალვა
                                <input
                                  type="checkbox"
                                  checked={style.hidden}
                                  onChange={(event) =>
                                    updateSection(section.id, (sectionData) => ({
                                      ...sectionData,
                                      props: updateByPath(sectionData.props, "_style", {
                                        ...style,
                                        hidden: event.target.checked,
                                      }),
                                    }))
                                  }
                                />
                              </label>
                              {textFields.length > 0 && (
                                <>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    ელემენტი
                                    <select
                                      className="rounded-full border border-slate-200 bg-white px-2 py-1"
                                      value={selectedField?.path || ""}
                                      onChange={(event) => setSelectedElementPath(event.target.value)}
                                    >
                                      {textFields.map((field) => (
                                        <option key={field.path} value={field.path}>
                                          {field.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    ფერი
                                    <input
                                      type="color"
                                      value={activeStyle.color || "#111827"}
                                      onChange={(event) => {
                                        if (!selectedField) return;
                                        updateSection(section.id, (sectionData) => {
                                          const nextStyles = {
                                            ...(sectionData.props?._textStyles || {}),
                                            [selectedField.path]: {
                                              ...(sectionData.props?._textStyles?.[selectedField.path] || {}),
                                              [styleBreakpoint]: {
                                                ...(sectionData.props?._textStyles?.[selectedField.path]?.[styleBreakpoint] || {}),
                                                color: event.target.value,
                                              },
                                            },
                                          };
                                          return {
                                            ...sectionData,
                                            props: updateByPath(sectionData.props, "_textStyles", nextStyles),
                                          };
                                        });
                                      }}
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    ზომა
                                    <input
                                      type="number"
                                      className="w-20 rounded-full border border-slate-200 bg-white px-2 py-1"
                                      value={activeStyle.fontSize || ""}
                                      onChange={(event) => {
                                        if (!selectedField) return;
                                        const value = Number(event.target.value);
                                        updateSection(section.id, (sectionData) => {
                                          const nextStyles = {
                                            ...(sectionData.props?._textStyles || {}),
                                            [selectedField.path]: {
                                              ...(sectionData.props?._textStyles?.[selectedField.path] || {}),
                                              [styleBreakpoint]: {
                                                ...(sectionData.props?._textStyles?.[selectedField.path]?.[styleBreakpoint] || {}),
                                                fontSize: value || undefined,
                                              },
                                            },
                                          };
                                          return {
                                            ...sectionData,
                                            props: updateByPath(sectionData.props, "_textStyles", nextStyles),
                                          };
                                        });
                                      }}
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    Margin Top
                                    <input
                                      type="number"
                                      className="w-20 rounded-full border border-slate-200 bg-white px-2 py-1"
                                      value={activeStyle.marginTop || ""}
                                      onChange={(event) => {
                                        if (!selectedField) return;
                                        const value = Number(event.target.value);
                                        updateSection(section.id, (sectionData) => {
                                          const nextStyles = {
                                            ...(sectionData.props?._textStyles || {}),
                                            [selectedField.path]: {
                                              ...(sectionData.props?._textStyles?.[selectedField.path] || {}),
                                              [styleBreakpoint]: {
                                                ...(sectionData.props?._textStyles?.[selectedField.path]?.[styleBreakpoint] || {}),
                                                marginTop: value || undefined,
                                              },
                                            },
                                          };
                                          return {
                                            ...sectionData,
                                            props: updateByPath(sectionData.props, "_textStyles", nextStyles),
                                          };
                                        });
                                      }}
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    Margin Bottom
                                    <input
                                      type="number"
                                      className="w-20 rounded-full border border-slate-200 bg-white px-2 py-1"
                                      value={activeStyle.marginBottom || ""}
                                      onChange={(event) => {
                                        if (!selectedField) return;
                                        const value = Number(event.target.value);
                                        updateSection(section.id, (sectionData) => {
                                          const nextStyles = {
                                            ...(sectionData.props?._textStyles || {}),
                                            [selectedField.path]: {
                                              ...(sectionData.props?._textStyles?.[selectedField.path] || {}),
                                              [styleBreakpoint]: {
                                                ...(sectionData.props?._textStyles?.[selectedField.path]?.[styleBreakpoint] || {}),
                                                marginBottom: value || undefined,
                                              },
                                            },
                                          };
                                          return {
                                            ...sectionData,
                                            props: updateByPath(sectionData.props, "_textStyles", nextStyles),
                                          };
                                        });
                                      }}
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    Padding Top
                                    <input
                                      type="number"
                                      className="w-20 rounded-full border border-slate-200 bg-white px-2 py-1"
                                      value={activeStyle.paddingTop || ""}
                                      onChange={(event) => {
                                        if (!selectedField) return;
                                        const value = Number(event.target.value);
                                        updateSection(section.id, (sectionData) => {
                                          const nextStyles = {
                                            ...(sectionData.props?._textStyles || {}),
                                            [selectedField.path]: {
                                              ...(sectionData.props?._textStyles?.[selectedField.path] || {}),
                                              [styleBreakpoint]: {
                                                ...(sectionData.props?._textStyles?.[selectedField.path]?.[styleBreakpoint] || {}),
                                                paddingTop: value || undefined,
                                              },
                                            },
                                          };
                                          return {
                                            ...sectionData,
                                            props: updateByPath(sectionData.props, "_textStyles", nextStyles),
                                          };
                                        });
                                      }}
                                    />
                                  </label>
                                  <label className="flex items-center gap-2 whitespace-nowrap">
                                    Padding Bottom
                                    <input
                                      type="number"
                                      className="w-20 rounded-full border border-slate-200 bg-white px-2 py-1"
                                      value={activeStyle.paddingBottom || ""}
                                      onChange={(event) => {
                                        if (!selectedField) return;
                                        const value = Number(event.target.value);
                                        updateSection(section.id, (sectionData) => {
                                          const nextStyles = {
                                            ...(sectionData.props?._textStyles || {}),
                                            [selectedField.path]: {
                                              ...(sectionData.props?._textStyles?.[selectedField.path] || {}),
                                              [styleBreakpoint]: {
                                                ...(sectionData.props?._textStyles?.[selectedField.path]?.[styleBreakpoint] || {}),
                                                paddingBottom: value || undefined,
                                              },
                                            },
                                          };
                                          return {
                                            ...sectionData,
                                            props: updateByPath(sectionData.props, "_textStyles", nextStyles),
                                          };
                                        });
                                      }}
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                          </div>
                        ) : null
                      }
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
