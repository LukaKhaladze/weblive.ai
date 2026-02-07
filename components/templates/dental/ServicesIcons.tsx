"use client";

import EditableText from "@/components/EditableText";

type ServicesIconsProps = {
  slots: any;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function ServicesIcons({ slots, secondaryColor, onSlotChange }: ServicesIconsProps) {
  const services = slots.services ?? [];
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`service-icon-${index}`} className="rounded-2xl border border-ink/10 p-4 flex items-center gap-3">
            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <EditableText
              as="p"
              className="text-sm text-ink/70"
              value={services[index] ?? ""}
              onChange={(value) => onSlotChange(`services.${index}`, value)}
              placeholder="სერვისი"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
