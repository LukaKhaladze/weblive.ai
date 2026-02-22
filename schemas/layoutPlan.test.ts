import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LayoutPlanSchema, parseAndValidateLayoutPlan } from "@/schemas/layoutPlan";

describe("layout plan validation", () => {
  it("rejects unknown widgets", () => {
    const payload = {
      website_type: "info",
      designKit: "clean-minimal",
      style_preset: "dark-neon",
      template_pack: "INFO_PACK",
      recipe_id: "info-corporate-clean",
      pages: [
        {
          slug: "/",
          name: "Home",
          nav_label: "Home",
          sections: [
            { widget: "header", variant: "v1-classic", props_seed: {} },
            { widget: "magic_widget", variant: "x", props_seed: {} },
            { widget: "footer", variant: "v1-simple", props_seed: {} },
          ],
        },
        {
          slug: "/contact",
          name: "Contact",
          nav_label: "Contact",
          sections: [{ widget: "header", variant: "v1-classic", props_seed: {} }],
        },
      ],
      required_sections_checklist: {},
      unsupported_features: [],
      warnings: [],
    };

    const parsed = LayoutPlanSchema.parse(payload);
    assert.throws(() => parseAndValidateLayoutPlan(parsed));
  });
});
