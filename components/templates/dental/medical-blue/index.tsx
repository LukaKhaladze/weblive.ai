"use client";

import EditableText from "@/components/EditableText";

type TemplateProps = {
  slots: any;
  tokens: any;
  colors: { primary: string; secondary: string };
  onSlotChange: (path: string, value: string) => void;
};

export const MedicalBlueTemplates: Record<string, (props: TemplateProps) => JSX.Element> = {
  hero_mb_01: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl p-10 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-4">
          <EditableText as="h2" className="text-3xl font-display" value={slots.headline ?? ""} onChange={(v) => onSlotChange("headline", v)} placeholder="ჰერო სათაური" />
          <EditableText as="p" className="text-sm text-white/80" value={slots.subtext ?? ""} onChange={(v) => onSlotChange("subtext", v)} placeholder="ქვესათაური" />
          <div className="flex gap-3">
            <EditableText as="span" className="inline-flex items-center rounded-full bg-white text-ink px-4 py-2 text-xs uppercase tracking-[0.2em]" value={slots.ctaPrimary?.label ?? ""} onChange={(v) => onSlotChange("ctaPrimary.label", v)} placeholder="ძირითადი CTA" />
            <EditableText as="span" className="inline-flex items-center rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em]" value={slots.ctaSecondary?.label ?? ""} onChange={(v) => onSlotChange("ctaSecondary.label", v)} placeholder="მეორეული CTA" />
          </div>
        </div>
        <div className="rounded-2xl bg-white/20 border border-white/30 h-56 flex items-center justify-center text-xs text-white/70">{slots.imageHint ?? "სურათის იდეა"}</div>
      </div>
    </section>
  ),
  hero_mb_02: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl p-10 text-white" style={{ background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})` }}>
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <EditableText as="h2" className="text-4xl font-display" value={slots.headline ?? ""} onChange={(v) => onSlotChange("headline", v)} placeholder="ჰერო სათაური" />
        <EditableText as="p" className="text-sm text-white/80" value={slots.subtext ?? ""} onChange={(v) => onSlotChange("subtext", v)} placeholder="ქვესათაური" />
        <EditableText as="span" className="inline-flex items-center rounded-full bg-white text-ink px-4 py-2 text-xs uppercase tracking-[0.2em]" value={slots.cta?.label ?? ""} onChange={(v) => onSlotChange("cta.label", v)} placeholder="CTA" />
        <div className="mt-6 rounded-2xl bg-white/20 border border-white/30 h-44 flex items-center justify-center text-xs text-white/70">{slots.backgroundImageHint ?? "ფონის სურათი"}</div>
      </div>
    </section>
  ),
  trust_mb_01: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {(slots.badges ?? Array(4).fill("")).map((badge: string, i: number) => (
          <div key={i} className="rounded-full border border-ink/10 px-3 py-2 text-xs text-ink/60 text-center" style={{ backgroundColor: colors.secondary + "22" }}>
            <EditableText as="span" className="text-xs" value={badge} onChange={(v) => onSlotChange(`badges.${i}`, v)} placeholder="ნიშანი" />
          </div>
        ))}
      </div>
    </section>
  ),
  trust_mb_02: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-shell p-6 border border-ink/10">
      <div className="flex flex-wrap gap-2">
        {(slots.badges ?? Array(4).fill("")).map((badge: string, i: number) => (
          <div key={i} className="rounded-full px-3 py-2 text-xs text-ink/70" style={{ backgroundColor: colors.primary + "22" }}>
            <EditableText as="span" className="text-xs" value={badge} onChange={(v) => onSlotChange(`badges.${i}`, v)} placeholder="ნიშანი" />
          </div>
        ))}
      </div>
    </section>
  ),
  about_mb_01: ({ slots, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="space-y-4">
        <EditableText as="h3" className="text-2xl font-display" value={slots.title ?? ""} onChange={(v) => onSlotChange("title", v)} placeholder="სათაური" />
        <EditableText as="p" className="text-sm text-ink/70" value={slots.paragraph ?? ""} onChange={(v) => onSlotChange("paragraph", v)} placeholder="აღწერა" />
      </div>
      <div className="rounded-2xl bg-shell border border-ink/10 h-40 flex items-center justify-center text-xs text-ink/50">{slots.imageHint ?? "სურათის იდეა"}</div>
    </section>
  ),
  about_mb_02: ({ slots, onSlotChange }) => (
    <section className="rounded-3xl bg-shell p-8 border border-ink/10">
      <EditableText as="h3" className="text-2xl font-display" value={slots.title ?? ""} onChange={(v) => onSlotChange("title", v)} placeholder="სათაური" />
      <EditableText as="p" className="mt-3 text-sm text-ink/70" value={slots.paragraph ?? ""} onChange={(v) => onSlotChange("paragraph", v)} placeholder="აღწერა" />
    </section>
  ),
  services_mb_01: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {(slots.services ?? Array(3).fill({})).map((svc: any, i: number) => (
          <div key={i} className="rounded-2xl border border-ink/10 p-5 bg-shell">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.secondary }} />
            <EditableText as="h3" className="mt-3 text-sm font-medium" value={svc.title ?? ""} onChange={(v) => onSlotChange(`services.${i}.title`, v)} placeholder="სერვისი" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={svc.shortText ?? ""} onChange={(v) => onSlotChange(`services.${i}.shortText`, v)} placeholder="მოკლე აღწერა" />
          </div>
        ))}
      </div>
    </section>
  ),
  services_mb_02: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(slots.services ?? Array(6).fill(" ")).map((svc: string, i: number) => (
          <div key={i} className="rounded-2xl border border-ink/10 p-4 flex items-center gap-3">
            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: colors.secondary }} />
            <EditableText as="p" className="text-sm text-ink/70" value={svc} onChange={(v) => onSlotChange(`services.${i}`, v)} placeholder="სერვისი" />
          </div>
        ))}
      </div>
    </section>
  ),
  why_mb_01: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {(slots.benefits ?? Array(3).fill({})).map((benefit: any, i: number) => (
          <div key={i} className="rounded-2xl border border-ink/10 p-5">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.secondary }} />
            <EditableText as="h3" className="mt-3 text-sm font-medium" value={benefit.title ?? ""} onChange={(v) => onSlotChange(`benefits.${i}.title`, v)} placeholder="უპირატესობა" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={benefit.shortText ?? ""} onChange={(v) => onSlotChange(`benefits.${i}.shortText`, v)} placeholder="მოკლე აღწერა" />
          </div>
        ))}
      </div>
    </section>
  ),
  why_mb_02: ({ slots, onSlotChange }) => (
    <section className="rounded-3xl bg-shell p-8 border border-ink/10">
      <div className="grid gap-3 sm:grid-cols-3">
        {(slots.benefits ?? Array(3).fill({})).map((benefit: any, i: number) => (
          <div key={i} className="rounded-xl border border-ink/10 p-4 bg-white">
            <EditableText as="h3" className="text-sm font-medium" value={benefit.title ?? ""} onChange={(v) => onSlotChange(`benefits.${i}.title`, v)} placeholder="უპირატესობა" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={benefit.shortText ?? ""} onChange={(v) => onSlotChange(`benefits.${i}.shortText`, v)} placeholder="მოკლე აღწერა" />
          </div>
        ))}
      </div>
    </section>
  ),
  testimonials_mb_01: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {(slots.testimonials ?? Array(3).fill({})).map((t: any, i: number) => (
          <div key={i} className="rounded-2xl border border-ink/10 p-5 bg-shell">
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors.secondary }} />
            <EditableText as="h3" className="mt-3 text-sm font-medium" value={t.name ?? ""} onChange={(v) => onSlotChange(`testimonials.${i}.name`, v)} placeholder="სახელი" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={t.quote ?? ""} onChange={(v) => onSlotChange(`testimonials.${i}.quote`, v)} placeholder="შეფასება" />
          </div>
        ))}
      </div>
    </section>
  ),
  testimonials_mb_02: ({ slots, onSlotChange }) => (
    <section className="rounded-3xl bg-shell p-8 border border-ink/10">
      <div className="grid gap-4 sm:grid-cols-2">
        {(slots.testimonials ?? Array(3).fill({})).map((t: any, i: number) => (
          <div key={i} className="rounded-2xl border border-ink/10 p-5 bg-white">
            <EditableText as="h3" className="text-sm font-medium" value={t.name ?? ""} onChange={(v) => onSlotChange(`testimonials.${i}.name`, v)} placeholder="სახელი" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={t.quote ?? ""} onChange={(v) => onSlotChange(`testimonials.${i}.quote`, v)} placeholder="შეფასება" />
          </div>
        ))}
      </div>
    </section>
  ),
  faq_mb_01: ({ slots, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8">
      <div className="space-y-3">
        {(slots.faq ?? Array(6).fill({})).map((item: any, i: number) => (
          <div key={i} className="rounded-2xl border border-ink/10 p-4 bg-shell">
            <EditableText as="p" className="text-sm text-ink/70" value={item.question ?? ""} onChange={(v) => onSlotChange(`faq.${i}.question`, v)} placeholder="კითხვა" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={item.answer ?? ""} onChange={(v) => onSlotChange(`faq.${i}.answer`, v)} placeholder="პასუხი" />
          </div>
        ))}
      </div>
    </section>
  ),
  faq_mb_02: ({ slots, onSlotChange }) => (
    <section className="rounded-3xl bg-shell p-8 border border-ink/10">
      <div className="grid gap-4 sm:grid-cols-2">
        {(slots.faq ?? Array(6).fill({})).map((item: any, i: number) => (
          <div key={i} className="rounded-xl border border-ink/10 p-4 bg-white">
            <EditableText as="p" className="text-sm text-ink/70" value={item.question ?? ""} onChange={(v) => onSlotChange(`faq.${i}.question`, v)} placeholder="კითხვა" />
            <EditableText as="p" className="mt-2 text-xs text-ink/60" value={item.answer ?? ""} onChange={(v) => onSlotChange(`faq.${i}.answer`, v)} placeholder="პასუხი" />
          </div>
        ))}
      </div>
    </section>
  ),
  contact_mb_01: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-white shadow-soft p-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="space-y-3">
        <div className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">სახელი</div>
        <div className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">ტელეფონი</div>
        <div className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">შეტყობინება</div>
        <div className="inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white" style={{ backgroundColor: colors.primary }}>
          <EditableText as="span" className="text-xs uppercase tracking-[0.2em]" value={slots.formCtaLabel ?? ""} onChange={(v) => onSlotChange("formCtaLabel", v)} placeholder="გაგზავნა" />
        </div>
      </div>
      <div className="space-y-2">
        <EditableText as="p" className="text-sm text-ink/70" value={slots.address ?? ""} onChange={(v) => onSlotChange("address", v)} placeholder="მისამართი" />
        <EditableText as="p" className="text-sm text-ink/70" value={slots.phone ?? ""} onChange={(v) => onSlotChange("phone", v)} placeholder="ტელეფონი" />
        <EditableText as="p" className="text-sm text-ink/70" value={slots.workingHours ?? ""} onChange={(v) => onSlotChange("workingHours", v)} placeholder="სამუშაო საათები" />
      </div>
    </section>
  ),
  contact_mb_02: ({ slots, colors, onSlotChange }) => (
    <section className="rounded-3xl bg-shell p-8 border border-ink/10">
      <EditableText as="p" className="text-sm text-ink/70" value={slots.address ?? ""} onChange={(v) => onSlotChange("address", v)} placeholder="მისამართი" />
      <EditableText as="p" className="text-sm text-ink/70 mt-2" value={slots.phone ?? ""} onChange={(v) => onSlotChange("phone", v)} placeholder="ტელეფონი" />
      <EditableText as="p" className="text-sm text-ink/70 mt-2" value={slots.workingHours ?? ""} onChange={(v) => onSlotChange("workingHours", v)} placeholder="სამუშაო საათები" />
      <div className="mt-4 inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white" style={{ backgroundColor: colors.primary }}>
        <EditableText as="span" className="text-xs uppercase tracking-[0.2em]" value={slots.formCtaLabel ?? ""} onChange={(v) => onSlotChange("formCtaLabel", v)} placeholder="გაგზავნა" />
      </div>
    </section>
  ),
  footer_mb_01: () => (
    <footer className="rounded-3xl bg-white shadow-soft p-6 text-xs text-ink/50">© Dental Clinic</footer>
  ),
  footer_mb_02: () => (
    <footer className="rounded-3xl bg-shell border border-ink/10 p-6 text-xs text-ink/50">© Dental Clinic</footer>
  )
};
