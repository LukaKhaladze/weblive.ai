"use client";

import EditableText from "@/components/EditableText";

type FaqProps = {
  slots: any;
  onSlotChange: (path: string, value: string) => void;
};

export default function Faq({ slots, onSlotChange }: FaqProps) {
  const items = slots.faq ?? [];
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`faq-${index}`} className="rounded-2xl border border-ink/10 p-4 bg-shell">
            <EditableText
              as="p"
              className="text-sm text-ink/70"
              value={items[index]?.question ?? ""}
              onChange={(value) => onSlotChange(`faq.${index}.question`, value)}
              placeholder="კითხვა"
            />
            <EditableText
              as="p"
              className="mt-2 text-xs text-ink/60"
              value={items[index]?.answer ?? ""}
              onChange={(value) => onSlotChange(`faq.${index}.answer`, value)}
              placeholder="პასუხი"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
