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

type TemplatePageProps = {
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
      about: "About",
      services: "Services",
      whyUs: "Why Us",
      testimonials: "Testimonials",
      faq: "FAQ",
      contact: "Contact",
      cta: "Get Started",
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
      about: "ჩვენ შესახებ",
      services: "სერვისები",
      whyUs: "რატომ ჩვენ",
      testimonials: "შეფასებები",
      faq: "ხშირად დასმული კითხვები",
      contact: "კონტაქტი",
      cta: "დაგვიკავშირდით",
      map: "რუკა / მისამართი",
      send: "გაგზავნა",
      logo: "ლოგო",
      contactInfo: "მისამართი, ტელეფონი, ელ.ფოსტა"
    }
  }
};

export default function TemplatePage({
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
}: TemplatePageProps) {
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
    <div className="space-y-8">
      <header className="rounded-3xl border border-ink/10 bg-white shadow-soft p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt="Logo"
              className="h-10 w-10 rounded-xl object-contain bg-white border border-ink/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl border border-ink/20 bg-shell text-[10px] text-ink/40 flex items-center justify-center">
              {copy.labels.logo}
            </div>
          )}
          <div className="text-xs uppercase tracking-[0.3em] text-ink/40">
            {blueprint.site.businessName}
          </div>
        </div>
        <div className="flex gap-3 text-xs text-ink/50">
          <span>Menu</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedSections.map((section) => section.type)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
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

      <footer className="rounded-3xl border border-ink/10 bg-white shadow-soft p-6 flex items-center justify-between">
        <div className="text-xs text-ink/50">© {blueprint.site.businessName}</div>
        <div className="h-2 w-24 rounded-full" style={{ backgroundColor: secondaryColor }} />
      </footer>
    </div>
  );
}

function renderSection({
  section,
  copy,
  primaryColor,
  secondaryColor,
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
    case "hero": {
      const heroVariant = section.ui?.variant ?? "hero";
      const isCentered = heroVariant === "simple" || heroVariant === "list";
      const imageFirst = heroVariant === "split" || heroVariant === "cards";
      return (
        <section
          className="rounded-3xl p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
          }}
        >
          <div
            className={`grid gap-6 ${isCentered ? "text-center" : ""} lg:grid-cols-[1.2fr_0.8fr]`}
          >
            {imageFirst ? (
              <div className="rounded-2xl bg-white/20 border border-white/30 h-48 order-1 lg:order-none" />
            ) : null}
            <div className="space-y-4">
              <EditableText
                as="h2"
                className="text-3xl font-display"
                value={section.heading}
                onChange={(value) => onUpdateField(section.type, "heading", value)}
                placeholder="Hero headline"
              />
              <EditableText
                as="p"
                className="text-sm text-white/80"
                value={section.content}
                onChange={(value) => onUpdateField(section.type, "content", value)}
                placeholder="Hero subtext"
              />
              <div className={`flex gap-3 ${isCentered ? "justify-center" : ""}`}>
                <EditableText
                  as="span"
                  className="inline-flex items-center justify-center rounded-full bg-white text-ink px-4 py-2 text-xs uppercase tracking-[0.2em]"
                  value={section.cta?.label || copy.labels.cta}
                  onChange={(value) => onUpdateCta(section.type, "label", value)}
                  placeholder={copy.labels.cta}
                />
                <span className="inline-flex items-center justify-center rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.2em]">
                  Secondary
                </span>
              </div>
            </div>
            {!imageFirst ? (
              <div className="rounded-2xl bg-white/20 border border-white/30 h-48" />
            ) : null}
          </div>
        </section>
      );
    }
    case "about":
      return (
        <section className="rounded-3xl bg-white shadow-soft p-8 space-y-4">
          <EditableText
            as="h3"
            className="text-2xl font-display"
            value={section.heading || copy.labels.about}
            onChange={(value) => onUpdateField(section.type, "heading", value)}
            placeholder={copy.labels.about}
          />
          <EditableText
            as="p"
            className="text-sm text-ink/70"
            value={section.content}
            onChange={(value) => onUpdateField(section.type, "content", value)}
            placeholder={copy.labels.about}
          />
        </section>
      );
    case "services": {
      const servicesVariant = section.ui?.variant ?? "cards";
      return (
        <section className="rounded-3xl bg-white shadow-soft p-8 space-y-6">
          <EditableText
            as="h3"
            className="text-2xl font-display"
            value={section.heading || copy.labels.services}
            onChange={(value) => onUpdateField(section.type, "heading", value)}
            placeholder={copy.labels.services}
          />
          <div
            className={`grid gap-4 ${
              servicesVariant === "list" ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {pickItems(section.bullets, 6, copy.services).map((item, index) => (
              <div
                key={`service-${index}`}
                className={`rounded-2xl border border-ink/10 p-5 shadow-sm bg-shell ${
                  servicesVariant === "list" ? "flex items-center gap-3" : ""
                }`}
              >
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: secondaryColor }} />
                <EditableText
                  as="p"
                  className="mt-3 text-sm font-medium"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.services[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "why_us":
      return (
        <section className="rounded-3xl bg-white shadow-soft p-8 space-y-4">
          <EditableText
            as="h3"
            className="text-2xl font-display"
            value={section.heading || copy.labels.whyUs}
            onChange={(value) => onUpdateField(section.type, "heading", value)}
            placeholder={copy.labels.whyUs}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {pickItems(section.bullets, 3, copy.whyUs).map((item, index) => (
              <div key={`why-${index}`} className="rounded-2xl border border-ink/10 p-5">
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
    case "testimonials": {
      const testimonialsVariant = section.ui?.variant ?? "cards";
      return (
        <section className="rounded-3xl bg-white shadow-soft p-8 space-y-4">
          <EditableText
            as="h3"
            className="text-2xl font-display"
            value={section.heading || copy.labels.testimonials}
            onChange={(value) => onUpdateField(section.type, "heading", value)}
            placeholder={copy.labels.testimonials}
          />
          <div
            className={`grid gap-4 ${
              testimonialsVariant === "list" ? "grid-cols-1" : "sm:grid-cols-3"
            }`}
          >
            {pickItems(section.bullets, 3, copy.testimonials).map((item, index) => (
              <div
                key={`testimonial-${index}`}
                className={`rounded-2xl border border-ink/10 p-5 bg-shell ${
                  testimonialsVariant === "list" ? "flex items-center gap-4" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: secondaryColor }} />
                <EditableText
                  as="p"
                  className="mt-3 text-xs text-ink/60"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.testimonials[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "faq": {
      const faqVariant = section.ui?.variant ?? "faqAccordion";
      return (
        <section className="rounded-3xl bg-white shadow-soft p-8 space-y-4">
          <EditableText
            as="h3"
            className="text-2xl font-display"
            value={section.heading || copy.labels.faq}
            onChange={(value) => onUpdateField(section.type, "heading", value)}
            placeholder={copy.labels.faq}
          />
          <div className={`space-y-3 ${faqVariant === "list" ? "pl-4" : ""}`}>
            {pickItems(section.bullets, 6, copy.faqs).map((item, index) => (
              <div
                key={`faq-${index}`}
                className={`rounded-2xl border border-ink/10 p-4 bg-shell ${
                  faqVariant === "list" ? "border-none bg-transparent" : ""
                }`}
              >
                <EditableText
                  as="p"
                  className="text-sm text-ink/70"
                  value={item}
                  onChange={(value) => onUpdateBullet(section.type, index, value)}
                  placeholder={copy.faqs[index]}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "contact":
      return (
        <section className="rounded-3xl bg-white shadow-soft p-8 space-y-4">
          <EditableText
            as="h3"
            className="text-2xl font-display"
            value={section.heading || copy.labels.contact}
            onChange={(value) => onUpdateField(section.type, "heading", value)}
            placeholder={copy.labels.contact}
          />
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-3">
              {defaultFormFields(copy).map((field) => (
                <div key={field} className="rounded-xl border border-ink/10 px-4 py-2 text-xs text-ink/60">
                  {field}
                </div>
              ))}
              <div
                className="inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: primaryColor }}
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
              <div className="rounded-xl border border-ink/10 bg-shell h-28 flex items-center justify-center text-xs text-ink/40">
                {copy.labels.map}
              </div>
              <EditableText
                as="p"
                className="text-xs text-ink/60"
                value={section.content || copy.labels.contactInfo}
                onChange={(value) => onUpdateField(section.type, "content", value)}
                placeholder={copy.labels.contactInfo}
              />
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

function orderSections(sections: Blueprint["pages"][number]["sections"][number][]) {
  return sections;
}

function defaultFormFields(copy: typeof FALLBACKS.en) {
  return copy === FALLBACKS.ka
    ? ["სახელი", "ტელეფონი", "შეტყობინება"]
    : ["Name", "Phone", "Message"];
}
