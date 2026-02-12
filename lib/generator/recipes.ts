import { CategorySchema } from "@/lib/schema";
import { z } from "zod";
import { WidgetType } from "@/widgets/registry";

export type Category = z.infer<typeof CategorySchema>;

export type Recipe = {
  pages: {
    id: string;
    name: string;
    slug: string;
    sections: WidgetType[];
  }[];
};

export const recipes: Record<Category, Recipe> = {
  ecommerce: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: ["header"],
      },
      {
        id: "products",
        name: "Products",
        slug: "/products",
        sections: ["header"],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header"],
      },
    ],
  },
  informational: {
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "/",
        sections: ["header"],
      },
      {
        id: "about",
        name: "About",
        slug: "/about",
        sections: ["header"],
      },
      {
        id: "blog",
        name: "Blog",
        slug: "/blog",
        sections: ["header"],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "/contact",
        sections: ["header"],
      },
    ],
  },
};
