"use client";

import EditableText from "@/components/EditableText";

type HeroSplitProps = {
  slots: any;
  primaryColor: string;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function HeroSplit({ slots, primaryColor, secondaryColor, onSlotChange }: HeroSplitProps) {
  return (
    <section
      className="rounded-3xl p-8 text-white"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <EditableText
            as="h2"
            className="text-3xl font-display"
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
          <div className="flex gap-3">
            <EditableText
              as="span"
              className="inline-flex items-center justify-center rounded-full bg-white text-ink px-4 py-2 text-xs uppercase tracking-[0.2em]"
              value={slots.ctaPrimary?.label ?? ""}
              onChange={(value) => onSlotChange("ctaPrimary.label", value)}
              placeholder="ძირითადი CTA"
            />
            <EditableText
              as="span"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              value={slots.ctaSecondary?.label ?? ""}
              onChange={(value) => onSlotChange("ctaSecondary.label", value)}
              placeholder="მეორეული CTA"
            />
          </div>
        </div>
        <div className="rounded-2xl bg-white/20 border border-white/30 h-48 flex items-center justify-center text-xs text-white/70">
          {slots.imageHint ?? "სურათის იდეა"}
        </div>
      </div>
    </section>
  );
}
