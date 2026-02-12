"use client";

import { widgetRegistry, WidgetType } from "@/widgets/registry";

export default function WidgetPickerModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (widget: WidgetType, variant: string) => void;
}) {
  if (!open) return null;

  const widgets = Object.values(widgetRegistry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Section</h2>
          <button className="text-sm text-slate-500" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {widgets.map((widget) => (
            <div key={widget.type} className="rounded-[24px] border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{widget.category}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{widget.name}</h3>
                </div>
                <div className="flex gap-2">
                  {widget.variants.map((variant) => (
                    <button
                      key={variant}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs"
                      onClick={() => {
                        onAdd(widget.type, variant);
                        onClose();
                      }}
                    >
                      Add {variant}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">Tags: {widget.tags.join(", ")}</p>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {widget.variants.map((variant) => (
                  <div key={variant} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{variant}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
