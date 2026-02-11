import { WizardInput } from "@/lib/schema";

export const ECOMMERCE_FIXED_PAGES = ["home", "products", "about", "contact"] as const;

export function normalizeEcommerceInput(input: WizardInput): WizardInput {
  return {
    ...input,
    category: "ecommerce",
    goal: "calls",
    pages: [...ECOMMERCE_FIXED_PAGES],
    includeProductPage: false,
  };
}

