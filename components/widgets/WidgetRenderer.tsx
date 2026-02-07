"use client";

import EditableText from "@/components/EditableText";
import { WidgetInstance, WidgetDefinition } from "@/lib/types";

export default function WidgetRenderer({
  widget,
  definition,
  onUpdate
}: {
  widget: WidgetInstance;
  definition: WidgetDefinition;
  onUpdate: (next: WidgetInstance) => void;
}) {
  const updateField = (key: string, value: string) => {
    onUpdate({ ...widget, content: { ...widget.content, [key]: value } });
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] text-ink/40">
        {definition.name}
      </div>
      {definition.fields.map((field) => (
        <div key={field.key}>
          <EditableText
            as={field.type === "textarea" ? "p" : "span"}
            className={
              field.type === "textarea"
                ? "text-sm text-ink/70"
                : "text-sm font-medium"
            }
            value={widget.content[field.key] ?? ""}
            onChange={(value) => updateField(field.key, value)}
            placeholder={field.label}
          />
        </div>
      ))}
    </div>
  );
}
