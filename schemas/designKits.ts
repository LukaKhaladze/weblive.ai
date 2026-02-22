import { z } from "zod";

export const DESIGN_KIT_IDS = [
  "clean-minimal",
  "modern-saas",
  "medical-blue",
  "bold-gradient",
  "luxury-elegant",
  "warm-organic",
] as const;

export const DesignKitIdSchema = z.enum(DESIGN_KIT_IDS);
export type DesignKitId = z.infer<typeof DesignKitIdSchema>;

export const DesignKitSchema = z
  .object({
    id: DesignKitIdSchema,
    label: z.string().min(1),
    tokens: z
      .object({
        bg: z.string().min(1),
        surface: z.string().min(1),
        text: z.string().min(1),
        muted: z.string().min(1),
        border: z.string().min(1),
        primary: z.string().min(1),
        primaryText: z.string().min(1),
        secondary: z.string().min(1),
        radius: z.number().int().min(0).max(48),
        shadow: z.string().min(1),
      })
      .strict(),
    typography: z
      .object({
        fontBody: z.string().min(1),
        fontDisplay: z.string().min(1),
        h1: z.string().min(1),
        h2: z.string().min(1),
        h3: z.string().min(1),
        body: z.string().min(1),
        lead: z.string().min(1),
      })
      .strict(),
    layout: z
      .object({
        sectionPaddingY: z.string().min(1),
        containerWidth: z.string().min(1),
        cardStyle: z.enum(["flat", "soft", "elevated"]),
      })
      .strict(),
  })
  .strict();

export type DesignKit = z.infer<typeof DesignKitSchema>;

export const designKitLibrary: Record<DesignKitId, DesignKit> = {
  "clean-minimal": {
    id: "clean-minimal",
    label: "Clean Minimal",
    tokens: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
      primary: "#2F9BFD",
      primaryText: "#FFFFFF",
      secondary: "#4D5CF3",
      radius: 16,
      shadow: "none",
    },
    typography: {
      fontBody: "Manrope",
      fontDisplay: "Manrope",
      h1: "text-4xl md:text-6xl font-semibold tracking-tight",
      h2: "text-3xl md:text-4xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold",
      body: "text-base leading-7",
      lead: "text-lg leading-8",
    },
    layout: {
      sectionPaddingY: "py-16 md:py-24",
      containerWidth: "max-w-6xl",
      cardStyle: "flat",
    },
  },
  "modern-saas": {
    id: "modern-saas",
    label: "Modern SaaS",
    tokens: {
      bg: "#0F192B",
      surface: "#111E33",
      text: "#F8FAFC",
      muted: "#94A3B8",
      border: "#1E293B",
      primary: "#4D5CF3",
      primaryText: "#FFFFFF",
      secondary: "#2F9BFD",
      radius: 20,
      shadow: "none",
    },
    typography: {
      fontBody: "Manrope",
      fontDisplay: "Manrope",
      h1: "text-4xl md:text-6xl font-semibold tracking-tight",
      h2: "text-3xl md:text-5xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold",
      body: "text-base leading-7",
      lead: "text-lg leading-8",
    },
    layout: {
      sectionPaddingY: "py-16 md:py-24",
      containerWidth: "max-w-7xl",
      cardStyle: "soft",
    },
  },
  "medical-blue": {
    id: "medical-blue",
    label: "Medical Blue",
    tokens: {
      bg: "#F1F5F9",
      surface: "#FFFFFF",
      text: "#0F172A",
      muted: "#475569",
      border: "#CBD5E1",
      primary: "#2563EB",
      primaryText: "#FFFFFF",
      secondary: "#2F9BFD",
      radius: 18,
      shadow: "none",
    },
    typography: {
      fontBody: "Inter",
      fontDisplay: "Manrope",
      h1: "text-4xl md:text-6xl font-semibold tracking-tight",
      h2: "text-3xl md:text-4xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold",
      body: "text-base leading-7",
      lead: "text-lg leading-8",
    },
    layout: {
      sectionPaddingY: "py-16 md:py-20",
      containerWidth: "max-w-6xl",
      cardStyle: "soft",
    },
  },
  "bold-gradient": {
    id: "bold-gradient",
    label: "Bold Gradient",
    tokens: {
      bg: "#0F192B",
      surface: "#111827",
      text: "#F8FAFC",
      muted: "#A5B4FC",
      border: "#312E81",
      primary: "#7333F2",
      primaryText: "#FFFFFF",
      secondary: "#4D5CF3",
      radius: 22,
      shadow: "none",
    },
    typography: {
      fontBody: "Manrope",
      fontDisplay: "Manrope",
      h1: "text-4xl md:text-6xl font-bold tracking-tight",
      h2: "text-3xl md:text-5xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold",
      body: "text-base leading-7",
      lead: "text-lg leading-8",
    },
    layout: {
      sectionPaddingY: "py-16 md:py-24",
      containerWidth: "max-w-7xl",
      cardStyle: "elevated",
    },
  },
  "luxury-elegant": {
    id: "luxury-elegant",
    label: "Luxury Elegant",
    tokens: {
      bg: "#FAF8F4",
      surface: "#FFFFFF",
      text: "#1C1917",
      muted: "#78716C",
      border: "#E7E5E4",
      primary: "#8B5CF6",
      primaryText: "#FFFFFF",
      secondary: "#2F9BFD",
      radius: 14,
      shadow: "none",
    },
    typography: {
      fontBody: "Lora",
      fontDisplay: "Playfair Display",
      h1: "text-4xl md:text-6xl font-semibold tracking-tight",
      h2: "text-3xl md:text-5xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold",
      body: "text-base leading-8",
      lead: "text-lg leading-8",
    },
    layout: {
      sectionPaddingY: "py-20 md:py-28",
      containerWidth: "max-w-6xl",
      cardStyle: "soft",
    },
  },
  "warm-organic": {
    id: "warm-organic",
    label: "Warm Organic",
    tokens: {
      bg: "#FFFDF7",
      surface: "#FFFBEB",
      text: "#292524",
      muted: "#78716C",
      border: "#E7E5E4",
      primary: "#2F9BFD",
      primaryText: "#FFFFFF",
      secondary: "#4D5CF3",
      radius: 20,
      shadow: "none",
    },
    typography: {
      fontBody: "Manrope",
      fontDisplay: "Manrope",
      h1: "text-4xl md:text-6xl font-semibold tracking-tight",
      h2: "text-3xl md:text-4xl font-semibold tracking-tight",
      h3: "text-xl md:text-2xl font-semibold",
      body: "text-base leading-7",
      lead: "text-lg leading-8",
    },
    layout: {
      sectionPaddingY: "py-16 md:py-24",
      containerWidth: "max-w-6xl",
      cardStyle: "soft",
    },
  },
};

export function resolveDesignKit(designKitId?: string): DesignKit {
  if (designKitId && designKitId in designKitLibrary) {
    return designKitLibrary[designKitId as DesignKitId];
  }
  return designKitLibrary["clean-minimal"];
}
