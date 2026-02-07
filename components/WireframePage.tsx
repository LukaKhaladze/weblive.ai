"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import EditableText from "@/components/EditableText";
import SortableSection from "@/components/SortableSection";
import { Blueprint, SectionType } from "@/lib/types";

type WireframePageProps = {
  blueprint: Blueprint;
  targetPage: string;
  primaryColor: string;
  secondaryColor: string;
  logoDataUrl?: string;
  sections: Blueprint["pages"][number]["sections"];
  onReorder: (nextOrder: SectionType[]) => void;
  onUpdateField: (type: SectionType, field: "heading" | "content", value: string) => void;
  onUpdateBullet: (type: SectionType, index: number, value: string) => void;
  onUpdateCta: (type: SectionType, field: "label" | "href", value: string) => void;
};

const FALLBACKS = {
  en: {
    services: ["Service 1", "Service 2", "Service 3"],
    whyUs: ["Benefit 1", "Benefit 2", "Benefit 3"],
    faqs: [
      "What services do you provide?",
      "How can I book an appointment?",
      "What are your working hours?",
      "Do you offer consultations?"
    ],
    testimonials: ["Happy customer", "Local client", "Returning guest"],
    labels: {
      hero: "Hero",
      about: "About",
      services: "Services",
      whyUs: "Why Us",
      testimonials: "Testimonials",
      faq: "FAQ",
      contact: "Contact",
      cta: "Call to Action",
      image: "Image placeholder",
      map: "Map / Address",
      send: "Send",
      logo: "Logo",
      contactInfo: "Address, phone, email"
    }
  },
  ka: {
    services: ["სერვისი 1", "სერვისი 2", "სერვისი 3"],
    whyUs: ["უპირატესობა 1", "უპირატესობა 2", "უპირატესობა 3"],
    faqs: [
      "რომელი სერვისები გაქვთ?",
      "როგორ დავჯავშნო ვიზიტი?",
      "რა არის სამუშაო საათები?",
      "გთავაზობთ კონსულტაციას?"
    ],
    testimonials: [
      "კმაყოფილი პაციენტი",
      "ადგილობრივი კლიენტი",
      "რეკომენდაციით მოსული"
    ],
    labels: {
      hero: "ჰერო",
      about: "ჩვენ შესახებ",
      services: "სერვისები",
      whyUs: "რატომ ჩვენ",
      testimonials: "შეფასებები",
      faq: "ხშირად დასმული კითხვები",
      contact: "კონტაქტი",
      cta: "დაგვიკავშირდით",
      image: "სურათის ადგილი",
      map: "რუკა / მისამართი",
      send: "გაგზავნა",
      logo: "ლოგო",
      contactInfo: "მისამართი, ტელეფონი, ელ.ფოსტა"
    }
  }
};

export default function WireframePage({
  blueprint,
  targetPage,
  primaryColor,
  secondaryColor,
  logoDataUrl,
  sections,
  onReorder,
  onUpdateField,
  onUpdateBullet,
  onUpdateCta
}: WireframePageProps) {
  const page = resolvePage(blueprint, targetPage);
  const language = blueprint.site.language;
  const copy = language === "ka" ? FALLBACKS.ka : FALLBACKS.en;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const orderedSections = sections;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentIds = orderedSections.map((section) => section.type);
    const oldIndex = currentIds.indexOf(String(active.id) as SectionType);
    const newIndex = currentIds.indexOf(String(over.id) as SectionType);
    const nextOrder = arrayMove(currentIds, oldIndex, newIndex);
    onReorder(nextOrder);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="Logo"
                className="h-10 w-10 rounded-xl object-contain bg-white/70 border border-ink/10"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl border border-dashed border-ink/30 bg-white/60 text-[10px] text-ink/40 flex items-center justify-center">
                {copy.labels.logo}
              </div>
            )}
            <div className="h-4 w-24 rounded bg-ink/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 w-10 rounded bg-ink/10" />
            <div className="h-3 w-10 rounded bg-ink/10" />
            <div className="h-3 w-10 rounded bg-ink/10" />
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedSections.map((section) => section.type)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {orderedSections.map((section) => (
              <SortableSection key={section.type} id={section.type}>
                {renderSection({
                  section,
                  copy,
                  primaryColor,
                  secondaryColor,
                  onUpdateField,
                  onUpdateBullet,
                  onUpdateCta
                })}
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <footer className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-4">
        <div className="h-3 w-32 rounded" style={{ backgroundColor: secondaryColor }} />
      </footer>
    </div>
  );
}

function renderSection({
  section,
  copy,
  primaryColor,
  onUpdateField,
  onUpdateBullet,
  onUpdateCta
}: {
  section: Blueprint["pages"][number]["sections"][number];
  copy: typeof FALLBACKS.en;
  primaryColor: string;
  secondaryColor: string;
  onUpdateField: (type: SectionType, field: "heading" | "content", value: string) => void;
  onUpdateBullet: (type: SectionType, index: number, value: string) => void;
  onUpdateCta: (type: SectionType, field: "label" | "href", value: string) => void;
}) {
  switch (section.type) {
    case "hero":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/80 px-4 py-3 border border-ink/10">
                <EditableText
                  as="h3"
                  className="text-xl font-display"
                  value={section.heading || copy.labels.hero}
                  onChange={(value) => onUpdateField(section.type, "heading", value)}
                  placeholder={copy.labels.hero}
                />
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-3 border border-ink/10 text-sm text-ink/70">
                <EditableText
                  as="p"
                  className="text-sm text-ink/70"
                  value={section.content || copy.labels.cta}
                  onChange={(value) => onUpdateField(section.type, "content", value)}
                  placeholder={copy.labels.cta}
                />
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              >
                <EditableText
                  as="span"
                  className="text-xs uppercase tracking-[0.2em]"
                  value={section.cta?.label || copy.labels.cta}
                  onChange={(value) => onUpdateCta(section.type, "label", value)}
                  placeholder={copy.labels.cta}
                />
              </div>
            </div>
            <div className="h-44 rounded-2xl border border-dashed border-ink/30 bg-white/40 flex items-center justify-center text-xs text-ink/40">
              {copy.labels.image}
            </div>
          </div>
        </section>
      );
    case "about":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6 space-y-4">
          <div className="rounded-2xl bg-white/80 px-4 py-2 border border-ink/10">
            <EditableText
              as="h3"
              className="text-lg font-display"
              value={section.heading || copy.labels.about}
              onChange={(value) => onUpdateField(section.type, "heading", value)}
              placeholder={copy.labels.about}
            />
          </div>
          <div className="space-y-2">
            {splitLines(section.content || copy.labels.about, 4).map((line, index) => (
              <div
                key={`about-line-${index}`}
                className="rounded-full bg-white/70 px-4 py-2 border border-ink/10 text-sm text-ink/60"
              >
                {line}
              </div>
            ))}
          </div>
        </section>
      );
    case "services":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6 space-y-4">
          <div className="rounded-2xl bg-white/80 px-4 py-2 border border-ink/10">
            <EditableText
              as="h3"
              className="text-lg font-display"
              value={section.heading || copy.labels.services}
              onChange={(value) => onUpdateField(section.type, "heading", value)}
              placeholder={copy.labels.services}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pickItems(section.bullets, 6, copy.services).map((item, index) => (
              <div
                key={`service-${index}`}
                className="rounded-2xl border border-ink/10 bg-white/70 p-4 space-y-3"
              >
                <div className="h-16 rounded-xl border border-dashed border-ink/20 bg-shell/60" />
                <EditableText
                  as="p"
                  className="text-sm font-medium text-ink/70"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.services[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    case "why_us":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6 space-y-4">
          <div className="rounded-2xl bg-white/80 px-4 py-2 border border-ink/10">
            <EditableText
              as="h3"
              className="text-lg font-display"
              value={section.heading || copy.labels.whyUs}
              onChange={(value) => onUpdateField(section.type, "heading", value)}
              placeholder={copy.labels.whyUs}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {pickItems(section.bullets, 3, copy.whyUs).map((item, index) => (
              <div
                key={`why-${index}`}
                className="rounded-2xl border border-ink/10 bg-white/70 p-4"
              >
                <EditableText
                  as="p"
                  className="text-sm text-ink/70"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.whyUs[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    case "testimonials":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6 space-y-4">
          <div className="rounded-2xl bg-white/80 px-4 py-2 border border-ink/10">
            <EditableText
              as="h3"
              className="text-lg font-display"
              value={section.heading || copy.labels.testimonials}
              onChange={(value) => onUpdateField(section.type, "heading", value)}
              placeholder={copy.labels.testimonials}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {pickItems(section.bullets, 3, copy.testimonials).map((item, index) => (
              <div
                key={`testimonial-${index}`}
                className="rounded-2xl border border-ink/10 bg-white/70 p-4 space-y-2"
              >
                <div className="h-10 rounded bg-ink/10" />
                <EditableText
                  as="p"
                  className="text-xs text-ink/60"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.testimonials[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6 space-y-4">
          <div className="rounded-2xl bg-white/80 px-4 py-2 border border-ink/10">
            <EditableText
              as="h3"
              className="text-lg font-display"
              value={section.heading || copy.labels.faq}
              onChange={(value) => onUpdateField(section.type, "heading", value)}
              placeholder={copy.labels.faq}
            />
          </div>
          <div className="space-y-3">
            {pickItems(section.bullets, 6, copy.faqs).map((item, index) => (
              <div
                key={`faq-${index}`}
                className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-ink/60"
              >
                <EditableText
                  as="p"
                  className="text-sm text-ink/60"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.faqs[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    case "contact":
      return (
        <section className="rounded-3xl border border-dashed border-ink/20 bg-shell/40 p-6 space-y-4">
          <div className="rounded-2xl bg-white/80 px-4 py-2 border border-ink/10">
            <EditableText
              as="h3"
              className="text-lg font-display"
              value={section.heading || copy.labels.contact}
              onChange={(value) => onUpdateField(section.type, "heading", value)}
              placeholder={copy.labels.contact}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-3">
              {defaultFormFields(copy).map((field) => (
                <div
                  key={field}
                  className="rounded-xl border border-ink/10 bg-white/70 px-4 py-2 text-xs text-ink/60"
                >
                  {field}
                </div>
              ))}
              <div
                className="inline-flex items-center rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              >
                <EditableText
                  as="span"
                  className="text-xs uppercase tracking-[0.2em]"
                  value={section.cta?.label || copy.labels.send}
                  onChange={(value) => onUpdateCta(section.type, "label", value)}
                  placeholder={copy.labels.send}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-ink/20 bg-shell/60 h-28 flex items-center justify-center text-xs text-ink/40">
                {copy.labels.map}
              </div>
              <div className="rounded-xl border border-ink/10 bg-white/70 px-4 py-2 text-xs text-ink/60">
                <EditableText
                  as="p"
                  className="text-xs text-ink/60"
                  value={section.content || copy.labels.contactInfo}
                  onChange={(value) => onUpdateField(section.type, "content", value)}
                  placeholder={copy.labels.contactInfo}
                />
              </div>
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}

function resolvePage(blueprint: Blueprint, targetPage: string) {
  const normalized = targetPage.trim().toLowerCase();
  return (
    blueprint.pages.find((page) => page.slug === normalized) ||
    blueprint.pages.find((page) => page.title.toLowerCase().includes(normalized)) ||
    blueprint.pages[0]
  );
}

function pickItems(source: string[] | undefined, max: number, fallback: string[]) {
  if (source && source.length > 0) {
    return source.slice(0, max);
  }
  return fallback.slice(0, max);
}

function splitLines(text: string, count: number) {
  const parts = text
    .split(/\.|\?|!|\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= count) return parts.slice(0, count);
  if (parts.length === 0) return Array.from({ length: count }, () => text);
  const lines = [...parts];
  while (lines.length < count) {
    lines.push(parts[parts.length - 1]);
  }
  return lines.slice(0, count);
}

function orderSections(sections: Blueprint["pages"][number]["sections"][number][]) {
  return sections;
}

function defaultFormFields(copy: typeof FALLBACKS.en) {
  return copy === FALLBACKS.ka
    ? ["სახელი", "ტელეფონი", "შეტყობინება"]
    : ["Name", "Phone", "Message"];
}
