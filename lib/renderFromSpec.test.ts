import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderFromSpec } from "@/lib/renderFromSpec";
import { SiteSpec } from "@/schemas/siteSpec";

const baseSpec: SiteSpec = {
  prompt_summary: "Modern ecommerce website for skin care products",
  site_type: "ecommerce",
  primary_goal: "sales",
  tone: "premium",
  locale: "en",
  business: {
    name: "Glow Studio",
    description: "High-quality skincare products and expert guidance.",
  },
  pages: [
    { slug: "/", nav_label: "Home", purpose: "Landing page" },
    { slug: "/products", nav_label: "Products", purpose: "Product listing" },
    { slug: "/about", nav_label: "About", purpose: "Brand story" },
    { slug: "/contact", nav_label: "Contact", purpose: "Contact page" },
  ],
  supported_features: ["marketing_pages"],
  unsupported_features: [],
  warnings: [],
};

describe("renderFromSpec invariants", () => {
  it('always includes "/" and "/contact"', () => {
    const { site } = renderFromSpec({
      ...baseSpec,
      pages: [{ slug: "/about", nav_label: "About", purpose: "About" }],
    });
    const slugs = site.pages.map((page) => page.slug);
    assert.ok(slugs.includes("/"));
    assert.ok(slugs.includes("/contact"));
  });

  it("contains only header and hero widgets", () => {
    const { site } = renderFromSpec(baseSpec);
    const widgets = site.pages.flatMap((page) => page.sections.map((section) => section.widget));
    assert.ok(widgets.every((widget) => widget === "header" || widget === "hero"));
  });

  it("keeps header as first section on all pages", () => {
    const { site } = renderFromSpec(baseSpec);
    site.pages.forEach((page) => {
      assert.equal(page.sections[0]?.widget, "header");
    });
  });

  it("keeps hero as second section on home only", () => {
    const { site } = renderFromSpec(baseSpec);
    const home = site.pages.find((page) => page.slug === "/");
    assert.equal(home?.sections[1]?.widget, "hero");
    site.pages
      .filter((page) => page.slug !== "/")
      .forEach((page) => {
        assert.equal(page.sections.some((section) => section.widget === "hero"), false);
      });
  });

  it('orders nav with "/" first and "/contact" last', () => {
    const { site } = renderFromSpec({
      ...baseSpec,
      pages: [
        { slug: "/contact", nav_label: "Contact", purpose: "Contact" },
        { slug: "/pricing", nav_label: "Pricing", purpose: "Pricing" },
        { slug: "/", nav_label: "Home", purpose: "Home" },
      ],
    });
    const nav = site.pages[0]?.sections[0]?.props?.nav as Array<{ href: string }>;
    assert.equal(nav[0]?.href, "/");
    assert.equal(nav[nav.length - 1]?.href, "/contact");
  });

  it("uses deterministic section ids", () => {
    const first = renderFromSpec(baseSpec).site;
    const second = renderFromSpec(baseSpec).site;
    assert.deepEqual(
      first.pages.map((page) => page.sections.map((section) => section.id)),
      second.pages.map((page) => page.sections.map((section) => section.id))
    );
  });
});

