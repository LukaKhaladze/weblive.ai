"use client";

import { useMemo, useState } from "react";
import { WIDGET_CATEGORIES, WIDGET_DEFINITIONS } from "@/lib/widgets/registry";
import {
  loadProjects,
  upsertProject,
  getProjectById,
  getCurrentProjectId
} from "@/lib/storage";
import { WidgetInstance, WidgetPage } from "@/lib/types";

export default function WidgetReferencesPage() {
  const [category, setCategory] = useState<(typeof WIDGET_CATEGORIES)[number]>("All");
  const [search, setSearch] = useState("");
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>("");
  const [targetPageId, setTargetPageId] = useState<string>("");
  const [status, setStatus] = useState("");

  const projects = useMemo(() => loadProjects(), [status]);
  const filtered = useMemo(() => {
    return WIDGET_DEFINITIONS.filter((widget) => {
      if (category !== "All" && widget.category !== category) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        widget.name.toLowerCase().includes(term) ||
        widget.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }, [category, search]);

  const openInsert = (id: string) => {
    setSelectedWidget(id);
    setTargetProjectId(getCurrentProjectId() ?? projects[0]?.id ?? "");
    setTargetPageId("");
  };

  const handleInsert = () => {
    if (!selectedWidget || !targetProjectId) return;
    const project = getProjectById(targetProjectId);
    if (!project) return;
    const widgetDef = WIDGET_DEFINITIONS.find((w) => w.id === selectedWidget);
    if (!widgetDef) return;

    const widgetPages: WidgetPage[] = project.widgetPages ?? project.blueprint.pages.map((page) => ({
      id: page.slug,
      title: page.title,
      widgets: []
    }));

    const pageId = targetPageId || widgetPages[0]?.id;
    const pageIndex = widgetPages.findIndex((page) => page.id === pageId);
    if (pageIndex < 0) return;

    const instance: WidgetInstance = {
      id: crypto.randomUUID(),
      widgetId: widgetDef.id,
      name: widgetDef.name,
      category: widgetDef.category,
      content: { ...widgetDef.defaultContent },
      createdAt: new Date().toISOString()
    };

    const updatedPages = [...widgetPages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      widgets: [...updatedPages[pageIndex].widgets, instance]
    };

    upsertProject({ ...project, widgetPages: updatedPages });
    setStatus("Widget inserted.");
    setSelectedWidget(null);
  };

  return (
    <div className="min-h-screen bg-shell">
      <header className="px-6 py-6 border-b border-ink/10 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Weblive AI</p>
            <h1 className="text-2xl md:text-3xl font-display">Widget references</h1>
          </div>
          <a className="text-sm font-medium text-accent hover:text-accentDark" href="/">
            Back to generator
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          {WIDGET_CATEGORIES.map((item) => (
            <button
              key={item}
              className={`px-3 py-1 rounded-full text-xs border ${
                category === item
                  ? "bg-accent text-white border-accent"
                  : "bg-white border-ink/10 text-ink/70"
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <input
          className="w-full rounded-xl border border-ink/10 px-3 py-2"
          placeholder="Search widgets"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((widget) => (
            <div key={widget.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft">
              <div className="h-24 rounded-xl bg-shell border border-ink/10 flex items-center justify-center text-xs text-ink/40">
                Preview
              </div>
              <div className="mt-3">
                <p className="font-medium">{widget.name}</p>
                <p className="text-xs text-ink/50">{widget.category}</p>
                {widget.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {widget.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-shell border border-ink/10 text-ink/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                className="mt-4 w-full rounded-xl bg-ink text-white py-2 text-sm"
                onClick={() => openInsert(widget.id)}
              >
                Add to page
              </button>
            </div>
          ))}
        </div>

        {selectedWidget && (
          <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft space-y-3">
            <p className="font-medium">Insert widget</p>
            <select
              className="w-full rounded-xl border border-ink/10 px-3 py-2"
              value={targetProjectId}
              onChange={(event) => setTargetProjectId(event.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.inputs.businessName || "Untitled"}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-xl border border-ink/10 px-3 py-2"
              value={targetPageId}
              onChange={(event) => setTargetPageId(event.target.value)}
            >
              {(getProjectById(targetProjectId)?.widgetPages ?? []).map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-accent text-white py-2" onClick={handleInsert}>
                Confirm insert
              </button>
              <button className="flex-1 rounded-xl border border-ink/20 py-2" onClick={() => setSelectedWidget(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {status && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            {status}
          </p>
        )}
      </main>
    </div>
  );
}
