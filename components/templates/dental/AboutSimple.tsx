"use client";

import EditableText from "@/components/EditableText";

type AboutSimpleProps = {
  slots: any;
  onSlotChange: (path: string, value: string) => void;
};

export default function AboutSimple({ slots, onSlotChange }: AboutSimpleProps) {
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="space-y-4">
        <EditableText
          as="h3"
          className="text-2xl font-display"
          value={slots.title ?? ""}
          onChange={(value) => onSlotChange("title", value)}
          placeholder="სათაური"
        />
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={slots.paragraph ?? ""}
          onChange={(value) => onSlotChange("paragraph", value)}
          placeholder="აღწერა"
        />
      </div>
      <div className="rounded-2xl bg-shell border border-ink/10 h-40 flex items-center justify-center text-xs text-ink/50">
        {slots.imageHint ?? "სურათის იდეა"}
      </div>
    </section>
  );
}
