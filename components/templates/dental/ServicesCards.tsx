"use client";

import EditableText from "@/components/EditableText";

type ServicesCardsProps = {
  slots: any;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function ServicesCards({ slots, secondaryColor, onSlotChange }: ServicesCardsProps) {
  const services = slots.services ?? [];
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`service-${index}`} className="rounded-2xl border border-ink/10 p-5 bg-shell">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <EditableText
              as="h4"
              className="mt-3 text-sm font-medium"
              value={services[index]?.title ?? ""}
              onChange={(value) => onSlotChange(`services.${index}.title`, value)}
              placeholder="სერვისი"
            />
            <EditableText
              as="p"
              className="mt-2 text-xs text-ink/60"
              value={services[index]?.shortText ?? ""}
              onChange={(value) => onSlotChange(`services.${index}.shortText`, value)}
              placeholder="მოკლე აღწერა"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
