"use client";

import EditableText from "@/components/EditableText";

type HeroCenteredProps = {
  slots: any;
  primaryColor: string;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function HeroCentered({ slots, primaryColor, secondaryColor, onSlotChange }: HeroCenteredProps) {
  return (
    <section
      className="rounded-3xl p-10 text-center text-white"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
    >
      <div className="space-y-4 max-w-2xl mx-auto">
        <EditableText
          as="h2"
          className="text-4xl font-display"
          value={slots.headline ?? ""}
          onChange={(value) => onSlotChange("headline", value)}
          placeholder="ჰერო სათაური"
        />
        <EditableText
          as="p"
          className="text-sm text-white/80"
          value={slots.subtext ?? ""}
          onChange={(value) => onSlotChange("subtext", value)}
          placeholder="ქვესათაური"
        />
        <EditableText
          as="span"
          className="inline-flex items-center justify-center rounded-full bg-white text-ink px-4 py-2 text-xs uppercase tracking-[0.2em]"
          value={slots.cta?.label ?? ""}
          onChange={(value) => onSlotChange("cta.label", value)}
          placeholder="CTA"
        />
        <div className="mt-6 rounded-2xl bg-white/20 border border-white/30 h-40 flex items-center justify-center text-xs text-white/70">
          {slots.backgroundImageHint ?? "ფონის სურათის იდეა"}
        </div>
      </div>
    </section>
  );
}
