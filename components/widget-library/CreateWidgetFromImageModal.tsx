"use client";

import { useMemo, useState } from "react";
import { WidgetCatalogItem } from "@/components/widget-library/widgetCatalog";

type BaseTypeOption = {
  label: string;
  widgetType: string;
  variant: string;
};

const baseTypeOptions: BaseTypeOption[] = [
  { label: "Grid Featured", widgetType: "Services", variant: "cards6" },
  { label: "Cards Grid", widgetType: "Services", variant: "cards3" },
  { label: "Icon Row", widgetType: "Services", variant: "iconRow" },
  { label: "Banner CTA", widgetType: "CTA", variant: "bannerCentered" },
  { label: "Pricing Plans", widgetType: "Pricing", variant: "plans3" },
  { label: "FAQ Accordion", widgetType: "FAQ", variant: "accordion" },
  { label: "Testimonial Cards", widgetType: "Testimonials", variant: "cards" },
  { label: "Contact Block", widgetType: "Contact", variant: "formOnly" },
  { label: "Custom Placeholder", widgetType: "CustomWidgetPlaceholder", variant: "image" }
];

type CreateWidgetFromImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (item: WidgetCatalogItem) => void;
};

export default function CreateWidgetFromImageModal({
  isOpen,
  onClose,
  onCreate
}: CreateWidgetFromImageModalProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Services");
  const [tags, setTags] = useState("");
  const [baseType, setBaseType] = useState<BaseTypeOption>(baseTypeOptions[0]);

  const canCreate = useMemo(() => !!imageDataUrl && !!name.trim(), [imageDataUrl, name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close create widget modal"
      />
      <div className="relative z-10 w-[min(720px,95vw)] rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display">Create Widget from Image</h2>
          <button className="rounded-full border border-ink/20 px-3 py-1" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <label className="text-sm font-medium text-ink/70">Upload image</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result !== "string") return;
                  setImageDataUrl(reader.result);
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>

          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageDataUrl}
              alt="Widget reference"
              className="h-40 w-full rounded-2xl object-cover border border-ink/10"
            />
          ) : null}

          <div>
            <label className="text-sm font-medium text-ink/70">Widget name</label>
            <input
              className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70">Category</label>
            <select
              className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {[
                "Headers",
                "Heroes",
                "Features",
                "About",
                "Services",
                "Portfolio / Gallery",
                "Testimonials",
                "Pricing",
                "FAQ",
                "CTA",
                "Footers"
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70">Widget base type</label>
            <select
              className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
              value={baseType.label}
              onChange={(event) => {
                const option = baseTypeOptions.find((item) => item.label === event.target.value);
                if (option) setBaseType(option);
              }}
            >
              {baseTypeOptions.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70">Tags (optional)</label>
            <input
              className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="medical, minimal, grid"
            />
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-xl bg-accent text-white py-2 font-medium disabled:opacity-50"
              disabled={!canCreate}
              onClick={() => {
                const item: WidgetCatalogItem = {
                  id: crypto.randomUUID(),
                  title: name.trim(),
                  category,
                  widgetType: baseType.widgetType,
                  variant: baseType.variant,
                  tags: tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                  previewImage: imageDataUrl,
                  defaultProps:
                    baseType.widgetType === "CustomWidgetPlaceholder"
                      ? { name: name.trim(), imageDataUrl }
                      : {},
                  isCustom: true
                };
                onCreate(item);
                setImageDataUrl("");
                setName("");
                setTags("");
                setBaseType(baseTypeOptions[0]);
              }}
            >
              Create
            </button>
            <button className="flex-1 rounded-xl border border-ink/20 py-2" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
