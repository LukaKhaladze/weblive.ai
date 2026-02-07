"use client";

import EditableText from "@/components/EditableText";

type ContactProps = {
  slots: any;
  primaryColor: string;
  onSlotChange: (path: string, value: string) => void;
};

export default function Contact({ slots, primaryColor, onSlotChange }: ContactProps) {
  return (
    <section className="rounded-3xl bg-white shadow-soft p-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="space-y-3">
        <div className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">სახელი</div>
        <div className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">ტელეფონი</div>
        <div className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">შეტყობინება</div>
        <div
          className="inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <EditableText
            as="span"
            className="text-xs uppercase tracking-[0.2em]"
            value={slots.formCtaLabel ?? ""}
            onChange={(value) => onSlotChange("formCtaLabel", value)}
            placeholder="გაგზავნა"
          />
        </div>
      </div>
      <div className="space-y-2">
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={slots.address ?? ""}
          onChange={(value) => onSlotChange("address", value)}
          placeholder="მისამართი"
        />
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={slots.phone ?? ""}
          onChange={(value) => onSlotChange("phone", value)}
          placeholder="ტელეფონი"
        />
        <EditableText
          as="p"
          className="text-sm text-ink/70"
          value={slots.workingHours ?? ""}
          onChange={(value) => onSlotChange("workingHours", value)}
          placeholder="სამუშაო საათები"
        />
      </div>
    </section>
  );
}
