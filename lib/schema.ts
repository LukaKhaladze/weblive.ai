import { z } from "zod";

export const CategorySchema = z.enum([
  "clinic",
  "lawyer",
  "ecommerce",
  "restaurant",
  "agency",
  "generic",
]);

export const GoalSchema = z.enum(["calls", "leads", "bookings", "sell", "visit"]);

export const ContactInfoSchema = z.object({
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  address: z.string().optional().default(""),
  hours: z.string().optional().default(""),
  socials: z
    .object({
      instagram: z.string().optional().default(""),
      facebook: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
      twitter: z.string().optional().default(""),
    })
    .optional()
    .default({}),
});

export const WizardInputSchema = z.object({
  businessName: z.string().min(1),
  category: CategorySchema,
  description: z.string().min(1),
  goal: GoalSchema,
  pages: z.array(z.string()).min(1),
  brand: z.object({
    primaryColor: z.string().min(3),
    secondaryColor: z.string().min(3),
    extractFromLogo: z.boolean().optional().default(false),
  }),
  logoUrl: z.string().optional().default(""),
  contact: ContactInfoSchema,
});

export const ThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  fontFamily: z.string(),
  radius: z.number(),
  buttonStyle: z.enum(["solid", "outline"]),
});

export const SectionSchema = z.object({
  id: z.string(),
  widget: z.string(),
  variant: z.string(),
  props: z.record(z.any()),
});

export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }),
  sections: z.array(SectionSchema),
});

export const SiteSchema = z.object({
  theme: ThemeSchema,
  pages: z.array(PageSchema).min(1),
});

export const SeoSchema = z.object({
  project: z.object({
    businessName: z.string(),
    category: CategorySchema,
  }),
  pages: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    })
  ),
  recommendations: z.array(z.string()),
});

export const ProjectSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  expires_at: z.string(),
  edit_token: z.string(),
  share_slug: z.string(),
  status: z.string(),
  input: WizardInputSchema,
  site: SiteSchema.nullable(),
  seo: SeoSchema.nullable(),
});

export type WizardInput = z.infer<typeof WizardInputSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type SeoPayload = z.infer<typeof SeoSchema>;
export type ProjectRecord = z.infer<typeof ProjectSchema>;
