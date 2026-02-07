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
import { DENTAL_PACKS } from "@/lib/packs/dentalPacks";
import { MedicalBlueTemplates } from "@/components/templates/dental/medical-blue";
import { CleanMinimalTemplates } from "@/components/templates/dental/clean-minimal";

const PACK_REGISTRY: Record<string, Record<string, (props: any) => JSX.Element>> = {
  dental_medical_blue: MedicalBlueTemplates,
  dental_clean_minimal: CleanMinimalTemplates
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
  primaryColor,
  secondaryColor,
  logoDataUrl,
  sections,
  onReorder,
  onUpdateSlots
}: TemplatePageProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const pack = DENTAL_PACKS.find((p) => p.packId === blueprint.pages[0]?.sections?.[0]?.packId) ?? DENTAL_PACKS[0];
  const registry = PACK_REGISTRY[pack.packId];

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
                  registry,
                  tokens: pack.tokens,
                  colors: { primary: primaryColor, secondary: secondaryColor },
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
  registry,
  tokens,
  colors,
  onUpdateSlots
}: {
  section: Blueprint["pages"][number]["sections"][number];
  registry: Record<string, (props: any) => JSX.Element>;
  tokens: any;
  colors: { primary: string; secondary: string };
  onUpdateSlots: (
    type: SectionType,
    updater: (slots: Record<string, unknown>) => Record<string, unknown>
  ) => void;
}) {
  const Component = registry[section.templateId ?? ""];
  if (!Component) return null;

  const onSlotChange = (path: string, value: string) => {
    onUpdateSlots(section.type, (slots) => setPathValue({ ...slots }, path, value));
  };

  return (
    <Component
      slots={section.slots ?? {}}
      tokens={tokens}
      colors={colors}
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
