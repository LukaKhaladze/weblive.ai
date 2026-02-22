import { z } from "zod";
import { DesignKitIdSchema } from "@/schemas/designKits";
import {
  CATALOG_PACK,
  CATALOG_RECIPES,
  INFO_PACK,
  INFO_RECIPES,
  SECTION_LIBRARY,
  StylePresetId,
  TemplatePack,
  WebsiteType,
} from "@/schemas/sectionLibrary";

const pageSlugSchema = z.enum([
  "/",
  "/about",
  "/services",
  "/products",
  "/pricing",
  "/portfolio",
  "/contact",
  "/blog",
]);

const sectionSlotSchema = z
  .object({
    widget: z.string().min(1),
    variant: z.string().min(1),
    props_seed: z.record(z.any()).default({}),
  })
  .strict();

const pagePlanSchema = z
  .object({
    slug: pageSlugSchema,
    name: z.string().min(1).max(60),
    nav_label: z.string().min(1).max(40),
    sections: z.array(sectionSlotSchema).min(1),
  })
  .strict();

export const LayoutPlanSchema = z
  .object({
    website_type: z.enum(["info", "catalog"] satisfies [WebsiteType, ...WebsiteType[]]),
    designKit: DesignKitIdSchema,
    style_preset: z.enum(["dark-neon", "light-commerce", "premium-minimal"] satisfies [StylePresetId, ...StylePresetId[]]),
    template_pack: z.enum(["INFO_PACK", "CATALOG_PACK"] satisfies [TemplatePack, ...TemplatePack[]]),
    recipe_id: z.string().min(1),
    pages: z.array(pagePlanSchema).min(1).max(7),
    required_sections_checklist: z.record(z.boolean()),
    unsupported_features: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  })
  .strict();

export type LayoutPlan = z.infer<typeof LayoutPlanSchema>;

const RECIPE_IDS = new Set<string>([
  ...INFO_RECIPES.map((recipe) => recipe.id),
  ...CATALOG_RECIPES.map((recipe) => recipe.id),
]);

function validateSectionWidgetVariant(
  templatePack: TemplatePack,
  widget: string,
  variant: string
) {
  const library = SECTION_LIBRARY[templatePack];
  const entry = library[widget];
  if (!entry) return false;
  return entry.variants.includes(variant);
}

function ensureRequiredSections(plan: LayoutPlan) {
  const home = plan.pages.find((page) => page.slug === "/");
  if (!home) return false;
  const widgetsOnHome = home.sections.map((section) => section.widget);
  const allWidgets = plan.pages.flatMap((page) => page.sections.map((section) => section.widget));

  if (!allWidgets.includes("header")) return false;
  if (!widgetsOnHome.includes("hero")) return false;

  if (plan.website_type === "info") {
    const hasServicesOrFeatures = allWidgets.includes("services") || allWidgets.includes("features");
    const hasCredibility = allWidgets.includes("testimonials") || allWidgets.includes("stats");
    const hasCta = allWidgets.includes("cta");
    const hasContact = allWidgets.includes("contact");
    const hasFooter = allWidgets.includes("footer");
    return hasServicesOrFeatures && hasCredibility && hasCta && hasContact && hasFooter;
  }

  const hasCategories = allWidgets.includes("categories");
  const hasProducts = allWidgets.includes("products_grid");
  const hasPromo = allWidgets.includes("promo_strip");
  const hasFooter = allWidgets.includes("footer");
  const hasContact = allWidgets.includes("contact");
  return hasCategories && hasProducts && hasPromo && (hasFooter || hasContact);
}

export function validateLayoutPlan(plan: LayoutPlan) {
  if (plan.template_pack === "INFO_PACK" && plan.website_type !== "info") return false;
  if (plan.template_pack === "CATALOG_PACK" && plan.website_type !== "catalog") return false;
  if (!RECIPE_IDS.has(plan.recipe_id)) return false;

  for (const page of plan.pages) {
    for (const section of page.sections) {
      if (!validateSectionWidgetVariant(plan.template_pack, section.widget, section.variant)) {
        return false;
      }
    }
  }

  return ensureRequiredSections(plan);
}

export function parseAndValidateLayoutPlan(input: unknown): LayoutPlan {
  const parsed = LayoutPlanSchema.parse(input);
  if (!validateLayoutPlan(parsed)) {
    throw new Error("Invalid layout plan: widget/variant mismatch or missing required sections.");
  }
  return parsed;
}

export const SECTION_PROPS_SCHEMAS: Record<TemplatePack, Record<string, z.ZodTypeAny>> = {
  INFO_PACK: Object.fromEntries(
    Object.entries(INFO_PACK).map(([widget, entry]) => [widget, entry.propsSchema])
  ),
  CATALOG_PACK: Object.fromEntries(
    Object.entries(CATALOG_PACK).map(([widget, entry]) => [widget, entry.propsSchema])
  ),
};
