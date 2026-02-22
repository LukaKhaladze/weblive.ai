import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderFromPlan } from "@/lib/renderFromPlan";

const basePlan = {
  website_type: "catalog" as const,
  designKit: "modern-saas" as const,
  style_preset: "dark-neon" as const,
  template_pack: "CATALOG_PACK" as const,
  recipe_id: "catalog-megamarket",
  pages: [
    {
      slug: "/",
      name: "Home",
      nav_label: "Home",
      sections: [
        { widget: "header", variant: "v2-search", props_seed: {} },
        { widget: "hero", variant: "v2-split", props_seed: {} },
        { widget: "categories", variant: "icons_grid", props_seed: {} },
        { widget: "products_grid", variant: "grid_8", props_seed: {} },
        { widget: "promo_strip", variant: "icons", props_seed: {} },
        { widget: "footer", variant: "v2-mega", props_seed: {} },
      ],
    },
    {
      slug: "/products",
      name: "Products",
      nav_label: "Products",
      sections: [
        { widget: "header", variant: "v2-search", props_seed: {} },
        { widget: "products_grid", variant: "grid_8", props_seed: {} },
        { widget: "footer", variant: "v2-mega", props_seed: {} },
      ],
    },
    {
      slug: "/contact",
      name: "Contact",
      nav_label: "Contact",
      sections: [
        { widget: "header", variant: "v2-search", props_seed: {} },
        { widget: "contact", variant: "form", props_seed: {} },
        { widget: "footer", variant: "v2-mega", props_seed: {} },
      ],
    },
  ],
  required_sections_checklist: {
    header: true,
    hero: true,
    categories: true,
    products_grid: true,
    promo_strip: true,
    footer: true,
  },
  unsupported_features: [],
  warnings: [],
};

describe("renderFromPlan invariants", () => {
  it("keeps header first on every page", () => {
    const { site } = renderFromPlan(basePlan, { businessName: "Demo" });
    for (const page of site.pages) {
      assert.equal(page.sections[0]?.widget, "header");
    }
  });

  it("keeps hero on home", () => {
    const { site } = renderFromPlan(basePlan, { businessName: "Demo" });
    const home = site.pages.find((page) => page.slug === "/");
    assert.equal(home?.sections[1]?.widget, "hero");
  });

  it('orders nav with "/" first and "/contact" last', () => {
    const { site } = renderFromPlan(basePlan, { businessName: "Demo" });
    const nav = site.pages[0].sections[0].props.nav as Array<{ href: string }>;
    assert.equal(nav[0].href, "/");
    assert.equal(nav[nav.length - 1].href, "/contact");
  });

  it("uses deterministic ids", () => {
    const first = renderFromPlan(basePlan, { businessName: "Demo" }).site;
    const second = renderFromPlan(basePlan, { businessName: "Demo" }).site;
    assert.deepEqual(
      first.pages.map((page) => page.sections.map((section) => section.id)),
      second.pages.map((page) => page.sections.map((section) => section.id))
    );
  });

  it("stores selected design kit in theme", () => {
    const { site } = renderFromPlan(basePlan, { businessName: "Demo" });
    assert.equal(site.theme.designKit, "modern-saas");
  });
});
