import { CategorySchema } from "@/lib/schema";
import { z } from "zod";

export type Category = z.infer<typeof CategorySchema>;

export type Recipe = {
  pages: {
    id: string;
    name: string;
    slug: string;
    sections: string[];
  }[];
};

export const recipes: Record<Category, Recipe> = {
  clinic: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [
          "header",
          "hero",
          "logosStrip",
          "servicesGrid",
          "features",
          "testimonials",
          "faq",
          "contact",
          "footer",
        ],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header", "team", "features", "testimonials", "footer"],
      },
      {
        id: "services",
        name: "Services",
        slug: "/services",
        sections: ["header", "servicesGrid", "pricing", "faq", "footer"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header", "contact", "footer"],
      },
    ],
  },
  lawyer: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [
          "header",
          "hero",
          "features",
          "servicesGrid",
          "testimonials",
          "faq",
          "contact",
          "footer",
        ],
      },
      {
        id: "practice",
        name: "Practice Areas",
        slug: "/practice",
        sections: ["header", "servicesGrid", "faq", "footer"],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header", "team", "testimonials", "footer"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header", "contact", "footer"],
      },
    ],
  },
  ecommerce: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [
          "header",
          "hero",
          "logosStrip",
          "features",
          "blogPreview",
          "testimonials",
          "contact",
          "footer",
        ],
      },
      {
        id: "products",
        name: "Products",
        slug: "/products",
        sections: ["header", "features", "pricing", "footer"],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header", "features", "team", "footer"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header", "contact", "footer"],
      },
    ],
  },
  restaurant: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [
          "header",
          "hero",
          "servicesGrid",
          "features",
          "testimonials",
          "contact",
          "footer",
        ],
      },
      {
        id: "menu",
        name: "Menu",
        slug: "/menu",
        sections: ["header", "servicesGrid", "features", "footer"],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header", "team", "testimonials", "footer"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header", "contact", "footer"],
      },
    ],
  },
  agency: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [
          "header",
          "hero",
          "logosStrip",
          "features",
          "servicesGrid",
          "testimonials",
          "contact",
          "footer",
        ],
      },
      {
        id: "services",
        name: "Services",
        slug: "/services",
        sections: ["header", "servicesGrid", "pricing", "faq", "footer"],
      },
      {
        id: "work",
        name: "Work",
        slug: "/work",
        sections: ["header", "features", "testimonials", "footer"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header", "contact", "footer"],
      },
    ],
  },
  generic: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: [
          "header",
          "hero",
          "features",
          "servicesGrid",
          "testimonials",
          "contact",
          "footer",
        ],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header", "features", "team", "footer"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header", "contact", "footer"],
      },
    ],
  },
};
