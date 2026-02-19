"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { widgetRegistry } from "@/widgets/registry";

const businessFilters = [
  { id: "all", label: "All" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "informational", label: "Informational" },
] as const;

export default function WidgetReferencesClient() {
  const searchParams = useSearchParams();
  const editToken = searchParams.get("edit_token");
  const [filter, setFilter] = useState<(typeof businessFilters)[number]["id"]>("all");

  const grouped = useMemo(() => {
    return Object.values(widgetRegistry).reduce((acc, widget) => {
      if (filter !== "all" && !widget.tags.includes(filter)) {
        return acc;
      }
      acc[widget.category] = acc[widget.category] || [];
      acc[widget.category].push(widget);
      return acc;
    }, {} as Record<string, typeof widgetRegistry[keyof typeof widgetRegistry][]>);
  }, [filter]);

  async function handleAdd(widgetType: string, variant: string) {
    if (!editToken) return;
    const res = await fetch(`/api/projects/${editToken}`);
    const project = await res.json();
    const page = project.site.pages[0];
    const newSection = {
      id: `sec_${Math.random().toString(36).slice(2, 8)}`,
      widget: widgetType,
      variant,
      props: widgetRegistry[widgetType as keyof typeof widgetRegistry].defaultProps(
        project.input,
        page.sections.length
      ),
    };

    const updated = {
      ...project.site,
      pages: project.site.pages.map((p: any) =>
        p.id === page.id ? { ...p, sections: [...p.sections, newSection] } : p
      ),
    };

    await fetch(`/api/projects/${editToken}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: updated }),
    });

    alert("Section added to your project.");
  }

  return (
    <div className="min-h-screen bg-primary text-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">Widget Catalog</h1>
          </div>
          <a
            href="/build"
            className="btn-secondary rounded-full px-4 py-2 text-sm"
          >
            Get Started
          </a>
        </header>

        <div className="mt-8 flex flex-wrap gap-2">
          {businessFilters.map((item) => (
            <button
              key={item.id}
              className={`rounded-full px-4 py-2 text-sm ${
                filter === item.id ? "bg-brand-gradient text-white" : "border border-border text-muted"
              }`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {Object.entries(grouped).map(([category, widgets]) => (
            <section key={category}>
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {widgets.map((widget) => (
                  <div key={widget.type} className="rounded-[28px] border border-border bg-primary p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{widget.name}</h3>
                        <p className="mt-1 text-sm text-muted">Variants: {widget.variants.join(", ")}</p>
                      </div>
                      {editToken && (
                        <button
                          className="btn-primary rounded-full px-3 py-1 text-xs font-semibold"
                          onClick={() => handleAdd(widget.type, widget.variants[0])}
                        >
                          Add to project
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted">Tags: {widget.tags.join(", ")}</p>
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {widget.variants.map((variant) => (
                        <div key={variant} className="rounded-2xl border border-border bg-primary p-3">
                          <p className="text-xs uppercase tracking-[0.3em] text-muted">Preview</p>
                          <p className="mt-2 text-sm font-semibold">{variant}</p>
                          <p className="mt-1 text-xs text-muted">Widget: {widget.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
