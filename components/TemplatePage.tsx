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
import SortableSection from "@/components/SortableSection";
import { Blueprint, SectionType } from "@/lib/types";
import HeroSplit from "@/components/templates/dental/HeroSplit";
import HeroCentered from "@/components/templates/dental/HeroCentered";
import TrustStrip from "@/components/templates/dental/TrustStrip";
import AboutSimple from "@/components/templates/dental/AboutSimple";
import ServicesCards from "@/components/templates/dental/ServicesCards";
import ServicesIcons from "@/components/templates/dental/ServicesIcons";
import WhyUs from "@/components/templates/dental/WhyUs";
import Testimonials from "@/components/templates/dental/Testimonials";
import Faq from "@/components/templates/dental/Faq";
import Contact from "@/components/templates/dental/Contact";

const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  hero_dental_split_01: HeroSplit,
  hero_dental_centered_02: HeroCentered,
  trust_strip_dental_03: TrustStrip,
  about_dental_simple_04: AboutSimple,
  services_dental_cards_05: ServicesCards,
  services_dental_icons_06: ServicesIcons,
  whyus_dental_07: WhyUs,
  testimonials_dental_08: Testimonials,
  faq_dental_09: Faq,
  contact_dental_10: Contact
};

type TemplatePageProps = {
  blueprint: Blueprint;
  targetPage: string;
  primaryColor: string;
  secondaryColor: string;
  logoDataUrl?: string;
  sections: Blueprint["pages"][number]["sections"];
  onReorder: (nextOrder: SectionType[]) => void;
  onUpdateSlots: (
    type: SectionType,
    updater: (slots: Record<string, unknown>) => Record<string, unknown>
  ) => void;
};

export default function TemplatePage({
  blueprint,
  targetPage,
  primaryColor,
  secondaryColor,
  logoDataUrl,
  sections,
  onReorder,
  onUpdateSlots
}: TemplatePageProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentIds = sections.map((section) => section.type);
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
              Logo
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
        <SortableContext items={sections.map((section) => section.type)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
            {sections.map((section) => (
              <SortableSection key={section.type} id={section.type}>
                {renderTemplate({
                  section,
                  primaryColor,
                  secondaryColor,
                  onUpdateSlots
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

function renderTemplate({
  section,
  primaryColor,
  secondaryColor,
  onUpdateSlots
}: {
  section: Blueprint["pages"][number]["sections"][number];
  primaryColor: string;
  secondaryColor: string;
  onUpdateSlots: (
    type: SectionType,
    updater: (slots: Record<string, unknown>) => Record<string, unknown>
  ) => void;
}) {
  const Component = TEMPLATE_MAP[section.templateId ?? ""];
  if (!Component) {
    return null;
  }

  const onSlotChange = (path: string, value: string) => {
    onUpdateSlots(section.type, (slots) => setPathValue({ ...slots }, path, value));
  };

  return (
    <Component
      slots={section.slots ?? {}}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      onSlotChange={onSlotChange}
    />
  );
}

function setPathValue(obj: Record<string, any>, path: string, value: any) {
  const parts = path.split(".");
  let current = obj;
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const key = Number.isNaN(Number(part)) ? part : Number(part);
    if (isLast) {
      current[key] = value;
      return;
    }
    if (current[key] == null) {
      current[key] = typeof parts[index + 1] === "string" && !Number.isNaN(Number(parts[index + 1])) ? [] : {};
    }
    current = current[key];
  });
  return obj;
}
