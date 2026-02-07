"use client";

import EditableText from "@/components/EditableText";

type WhyUsProps = {
  slots: any;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function WhyUs({ slots, secondaryColor, onSlotChange }: WhyUsProps) {
  const benefits = slots.benefits ?? [];
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`benefit-${index}`} className="rounded-2xl border border-ink/10 p-5">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <EditableText
              as="h4"
              className="mt-3 text-sm font-medium"
              value={benefits[index]?.title ?? ""}
              onChange={(value) => onSlotChange(`benefits.${index}.title`, value)}
              placeholder="უპირატესობა"
            />
            <EditableText
              as="p"
              className="mt-2 text-xs text-ink/60"
              value={benefits[index]?.shortText ?? ""}
              onChange={(value) => onSlotChange(`benefits.${index}.shortText`, value)}
              placeholder="მოკლე აღწერა"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
