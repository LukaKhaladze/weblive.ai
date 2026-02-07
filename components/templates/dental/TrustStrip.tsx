"use client";

import EditableText from "@/components/EditableText";

type TrustStripProps = {
  slots: any;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function TrustStrip({ slots, secondaryColor, onSlotChange }: TrustStripProps) {
  const badges = slots.badges ?? [];
  return (
    <section className="rounded-3xl bg-white shadow-soft px-6 py-4">
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`badge-${index}`}
            className="rounded-full border border-ink/10 px-3 py-2 text-xs text-ink/60 text-center"
            style={{ backgroundColor: secondaryColor + "22" }}
          >
            <EditableText
              as="span"
              className="text-xs"
              value={badges[index] ?? ""}
              onChange={(value) => onSlotChange(`badges.${index}`, value)}
              placeholder="ნიშანი"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
