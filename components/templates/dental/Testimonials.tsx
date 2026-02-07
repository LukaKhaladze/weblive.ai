"use client";

import EditableText from "@/components/EditableText";

type TestimonialsProps = {
  slots: any;
  secondaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function Testimonials({ slots, secondaryColor, onSlotChange }: TestimonialsProps) {
  const testimonials = slots.testimonials ?? [];
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`testimonial-${index}`} className="rounded-2xl border border-ink/10 p-5 bg-shell">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <EditableText
              as="h4"
              className="mt-3 text-sm font-medium"
              value={testimonials[index]?.name ?? ""}
              onChange={(value) => onSlotChange(`testimonials.${index}.name`, value)}
              placeholder="სახელი"
            />
            <EditableText
              as="p"
              className="mt-2 text-xs text-ink/60"
              value={testimonials[index]?.quote ?? ""}
              onChange={(value) => onSlotChange(`testimonials.${index}.quote`, value)}
              placeholder="შეფასება"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
