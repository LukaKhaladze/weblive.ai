import { WizardInput } from "@/lib/schema";
import { generateRuleBasedSite } from "@/lib/generator/ruleBased";

export async function generateWithAiStub(input: WizardInput) {
  // TODO: Replace with real AI call that returns structured JSON matching the schema.
  return generateRuleBasedSite(input);
}
