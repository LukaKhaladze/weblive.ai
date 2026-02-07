"use client";

import { useMemo, useState } from "react";
import WidgetSection from "@/components/widgets/WidgetSection";
import { WIDGET_CATEGORIES } from "@/lib/widgets/registry";
import {
  BUILTIN_WIDGET_CATALOG,
  WidgetCatalogItem
} from "@/components/widget-library/widgetCatalog";
import { WidgetType } from "@/lib/types";
import CreateWidgetFromImageModal from "@/components/widget-library/CreateWidgetFromImageModal";
import {
  loadCustomWidgetCatalog,
  upsertCustomWidget
} from "@/lib/storage/customWidgetCatalog";

type WidgetLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (widgetType: WidgetType, variant: string, props: Record<string, unknown>) => void;
  language: "ka" | "en";
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoDataUrl?: string;
  };
};

export default function WidgetLibraryModal({
  isOpen,
  onClose,
  onInsert,
  language,
  theme
}: WidgetLibraryModalProps) {
  const [category, setCategory] = useState<(typeof WIDGET_CATEGORIES)[number]>("All");
  const [search, setSearch] = useState("");
  const [customWidgets, setCustomWidgets] = useState<WidgetCatalogItem[]>(() =>
    loadCustomWidgetCatalog()
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const catalog = useMemo(
    () => [...customWidgets, ...BUILTIN_WIDGET_CATALOG],
    [customWidgets]
  );

  const filtered = useMemo(() => {
    return catalog.filter((widget) => {
      if (category !== "All" && widget.category !== category) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        widget.title.toLowerCase().includes(term) ||
        widget.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  }, [category, search, catalog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close widget library"
      />
      <div className="relative z-10 max-h-[85vh] w-[min(1100px,95vw)] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/40">
              Widget Library
            </p>
            <h2 className="text-xl font-display">Browse widgets</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-ink/20 px-3 py-1 text-sm"
              onClick={() => setIsCreateOpen(true)}
            >
              + Add widget
            </button>
            <button
              className="rounded-full border border-ink/20 px-3 py-1 text-sm"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-6 py-4">
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

        <div className="px-6 pb-4">
          <input
            className="w-full rounded-xl border border-ink/10 px-3 py-2"
            placeholder="Search widgets"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((widget) => {
              const previewProps = language === "ka" ? widget.previewPropsKa : widget.previewPropsEn;
              return (
                <div
                  key={widget.id}
                  className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft space-y-3"
                >
                  <div className="h-32 overflow-hidden rounded-xl border border-ink/10 bg-shell relative">
                    <div className="absolute left-2 top-2 text-[9px] uppercase tracking-[0.2em] text-ink/40">
                      Preview
                    </div>
                    {widget.isCustom && widget.previewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={widget.previewImage}
                        alt={widget.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="pointer-events-none origin-top-left scale-[0.6] p-3">
                        <WidgetSection
                          widget={{
                            id: `preview-${widget.id}`,
                            widgetType: widget.widgetType as WidgetType,
                            variant: widget.variant,
                            props: previewProps ?? {},
                            createdAt: new Date().toISOString()
                          }}
                          theme={{
                            primaryColor: theme.primaryColor,
                            secondaryColor: theme.secondaryColor,
                            logoDataUrl:
                              theme.logoDataUrl ??
                              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='12' fill='%23e2e8f0'/><text x='32' y='38' font-size='10' text-anchor='middle' fill='%236b7280'>LOGO</text></svg>"
                          }}
                          onUpdate={() => {}}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{widget.title}</p>
                    <p className="text-xs text-ink/50">{widget.category}</p>
                    {widget.tags.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {widget.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-1 rounded-full bg-shell border border-ink/10 text-ink/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <button
                    className="w-full rounded-xl bg-ink text-white py-2 text-sm"
                    onClick={() =>
                      onInsert(
                        widget.widgetType as WidgetType,
                        widget.variant,
                        (widget.defaultProps ?? previewProps) as Record<string, unknown>
                      )
                    }
                  >
                    Insert
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateWidgetFromImageModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(item) => {
          const updated = upsertCustomWidget(item);
          setCustomWidgets(updated);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
