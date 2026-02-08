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
        name: "მთავარი",
        slug: "/",
        sections: ["header"],
      },
      {
        id: "products",
        name: "პროდუქტები",
        slug: "/products",
        sections: ["header"],
      },
      {
        id: "product",
        name: "პროდუქტი",
        slug: "/products/1",
        sections: ["header"],
      },
      {
        id: "about",
        name: "ჩვენ შესახებ",
        slug: "/about",
        sections: ["header"],
      },
      {
        id: "contact",
        name: "კონტაქტი",
        slug: "/contact",
        sections: ["header"],
      },
    ],
  },
  informational: {
    pages: [
      {
        id: "home",
        name: "მთავარი",
        slug: "/",
        sections: ["header"],
      },
      {
        id: "about",
        name: "ჩვენ შესახებ",
        slug: "/about",
        sections: ["header"],
      },
      {
        id: "blog",
        name: "ბლოგი",
        slug: "/blog",
        sections: ["header"],
      },
      {
        id: "contact",
        name: "კონტაქტი",
        slug: "/contact",
        sections: ["header"],
      },
    ],
  },
};
