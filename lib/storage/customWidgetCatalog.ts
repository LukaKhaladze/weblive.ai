import { WidgetCatalogItem } from "@/components/widget-library/widgetCatalog";

const STORAGE_KEY = "weblive_custom_widget_catalog";

export function loadCustomWidgetCatalog(): WidgetCatalogItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as WidgetCatalogItem[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export function saveCustomWidgetCatalog(items: WidgetCatalogItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function upsertCustomWidget(item: WidgetCatalogItem) {
  const items = loadCustomWidgetCatalog();
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.unshift(item);
  }
  saveCustomWidgetCatalog(items);
  return items;
}
