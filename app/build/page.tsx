"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardInput } from "@/lib/schema";
import { recipes } from "@/lib/generator/recipes";
import { widgetRegistry } from "@/widgets/registry";

const categories = [
  { id: "ecommerce", label: "ელ-კომერცია" },
  { id: "informational", label: "საინფორმაციო" },
] as const;

const goals = [
  { id: "calls", label: "ზარები" },
  { id: "leads", label: "ლიდები" },
  { id: "bookings", label: "დაჯავშნა" },
  { id: "sell", label: "გაყიდვა" },
  { id: "visit", label: "ვიზიტები" },
] as const;

const defaultInput: WizardInput = {
  businessName: "",
  category: "informational",
  description: "",
  goal: "leads",
  pages: ["home", "about", "contact"],
  includeProductPage: false,
  products: [],
  brand: {
    primaryColor: "#1c3d7a",
    secondaryColor: "#f4b860",
    extractFromLogo: false,
  },
  logoUrl: "",
  contact: {
    phone: "",
    email: "",
    address: "",
    hours: "",
    socials: {
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
    },
  },
};

const stepsBase = [
  "ბიზნესის დასახელება",
  "კატეგორია",
  "აღწერა",
  "მთავარი მიზანი",
  "გვერდები",
  "პროდუქტები",
  "ბრენდის ფერები",
  "ლოგო",
  "კონტაქტი",
  "გადახედვა",
];

export default function BuildPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<WizardInput>(defaultInput);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productFiles, setProductFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(false);

  const steps = useMemo(() => {
    if (input.category === "ecommerce") return stepsBase;
    return stepsBase.filter((item) => item !== "პროდუქტები");
  }, [input.category]);

  const availablePages = useMemo(() => {
    const recipe = recipes[input.category] || recipes.informational;
    return recipe.pages
      .filter((page) => (page.id === "product" ? input.includeProductPage : true))
      .map((page) => ({ id: page.id, name: page.name }));
  }, [input.category]);

  const canNext = () => {
    if (step === 0) return input.businessName.trim().length > 0;
    if (step === 2) return input.description.trim().length > 0;
    if (steps[step] === "პროდუქტები" && input.category === "ecommerce") {
      if (!input.includeProductPage) return true;
      return input.products.length > 0 && input.products.every((p) => p.name && p.price);
    }
    return true;
  };

  async function handleGenerate() {
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok) {
      setLoading(false);
      alert("გენერაცია ვერ შესრულდა.");
      return;
    }

    if (logoFile) {
      const form = new FormData();
      form.append("file", logoFile);
      form.append("projectId", data.id);
      form.append("type", "logo");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      const upload = await uploadRes.json();

      if (upload?.url) {
        const projectRes = await fetch(`/api/projects/${data.edit_token}`);
        const project = await projectRes.json();
        const updatedSite = {
          ...project.site,
          pages: project.site.pages.map((page: any) => ({
            ...page,
            sections: page.sections.map((section: any) =>
              section.widget === "header"
                ? { ...section, props: { ...section.props, logo: upload.url } }
                : section
            ),
          })),
        };

        await fetch(`/api/projects/${data.edit_token}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { ...input, logoUrl: upload.url },
            site: updatedSite,
          }),
        });
      }
    }

    if (input.category === "ecommerce" && input.products.length > 0) {
      const updatedProducts = [...input.products];
      for (let i = 0; i < updatedProducts.length; i += 1) {
        const file = productFiles[i];
        if (!file) continue;
        const form = new FormData();
        form.append("file", file);
        form.append("projectId", data.id);
        form.append("type", "images");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        const upload = await uploadRes.json();
        if (upload?.url) {
          updatedProducts[i] = { ...updatedProducts[i], imageUrl: upload.url };
        }
      }

      await fetch(`/api/projects/${data.edit_token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ...input, products: updatedProducts },
        }),
      });
    }

    router.push(`/e/${data.edit_token}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">შექმენი შენი საიტი</h1>
          </div>
          <div className="text-sm text-white/60">
            ნაბიჯი {step + 1} / {steps.length}
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-white/10 bg-slate-900 p-8">
          <h2 className="text-xl font-semibold">{steps[step]}</h2>

          {step === 0 && (
            <div className="mt-6">
              <label className="text-sm text-white/70">ბიზნესის დასახელება</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                value={input.businessName}
                onChange={(event) => setInput({ ...input, businessName: event.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`rounded-2xl border px-4 py-6 text-left ${
                    input.category === category.id
                      ? "border-white bg-white text-slate-900"
                      : "border-white/10 bg-slate-950 text-white/70"
                  }`}
                  onClick={() =>
                    setInput((prev) => ({
                      ...prev,
                      category: category.id,
                      includeProductPage:
                        category.id === "ecommerce" ? prev.includeProductPage : false,
                      products: category.id === "ecommerce" ? prev.products : [],
                      pages: recipes[category.id].pages
                        .filter((page) =>
                          page.id === "product"
                            ? category.id === "ecommerce" && prev.includeProductPage
                            : true
                        )
                        .map((page) => page.id),
                    }))
                  }
                >
                  <h3 className="text-lg font-semibold">{category.label}</h3>
                  <p className="mt-2 text-sm opacity-70">შესაფერისია {category.label.toLowerCase()}-სთვის.</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <label className="text-sm text-white/70">მოკლე აღწერა</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                rows={4}
                value={input.description}
                onChange={(event) => setInput({ ...input, description: event.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  className={`rounded-xl border px-4 py-4 text-sm ${
                    input.goal === goal.id
                      ? "border-white bg-white text-slate-900"
                      : "border-white/10 bg-slate-950 text-white/70"
                  }`}
                  onClick={() => setInput({ ...input, goal: goal.id })}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          )}

          {steps[step] === "გვერდები" && (
            <div className="mt-6 space-y-3">
              {availablePages.map((page) => (
                <label key={page.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={input.pages.includes(page.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...input.pages, page.id]
                        : input.pages.filter((id) => id !== page.id);
                      setInput({ ...input, pages: next.length ? next : [page.id] });
                    }}
                  />
                  {page.name}
                </label>
              ))}
            </div>
          )}

          {steps[step] === "პროდუქტები" && input.category === "ecommerce" && (
            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={input.includeProductPage}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setInput((prev) => ({
                      ...prev,
                      includeProductPage: checked,
                      pages: checked
                        ? Array.from(new Set([...prev.pages, "product"]))
                        : prev.pages.filter((id) => id !== "product"),
                    }));
                  }}
                />
                დამატება: პროდუქტის ერთეული გვერდი
              </label>
              <div className="text-sm text-white/70">რამდენი პროდუქტი გაქვთ? (მაქს. 3)</div>
              <div className="flex gap-3">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      input.products.length === count
                        ? "border-white bg-white text-slate-900"
                        : "border-white/10 bg-slate-950 text-white/70"
                    }`}
                    onClick={() => {
                      const next = Array.from({ length: count }).map((_, index) => ({
                        name: input.products[index]?.name || "",
                        price: input.products[index]?.price || "",
                        imageUrl: input.products[index]?.imageUrl || "",
                      }));
                      setInput((prev) => ({ ...prev, products: next }));
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>

              {input.products.map((product, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                  <p className="text-sm font-semibold text-white/80">პროდუქტი {index + 1}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-white/70">
                      დასახელება
                      <input
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white placeholder-white/40"
                        value={product.name}
                        onChange={(event) => {
                          const next = [...input.products];
                          next[index] = { ...next[index], name: event.target.value };
                          setInput((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </label>
                    <label className="text-sm text-white/70">
                      ფასი
                      <input
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white placeholder-white/40"
                        value={product.price}
                        onChange={(event) => {
                          const next = [...input.products];
                          next[index] = { ...next[index], price: event.target.value };
                          setInput((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </label>
                    <label className="text-sm text-white/70">
                      სურათი
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setProductFiles((prev) => ({
                            ...prev,
                            [index]: event.target.files?.[0] || null,
                          }))
                        }
                        className="mt-2 text-sm"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {steps[step] === "ბრენდის ფერები" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                მთავარი ფერი
                <input
                  type="color"
                  value={input.brand.primaryColor}
                  onChange={(event) =>
                    setInput({ ...input, brand: { ...input.brand, primaryColor: event.target.value } })
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950"
                />
              </label>
              <label className="text-sm text-white/70">
                მეორადი ფერი
                <input
                  type="color"
                  value={input.brand.secondaryColor}
                  onChange={(event) =>
                    setInput({ ...input, brand: { ...input.brand, secondaryColor: event.target.value } })
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-slate-950"
                />
              </label>
              <label className="col-span-full flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={input.brand.extractFromLogo}
                  onChange={(event) =>
                    setInput({ ...input, brand: { ...input.brand, extractFromLogo: event.target.checked } })
                  }
                />
                ლოგოდან ფერების ამოღება (დროებითი ქცევა)
              </label>
            </div>
          )}

          {steps[step] === "ლოგო" && (
            <div className="mt-6 space-y-3">
              <label className="text-sm text-white/70">ლოგოს ატვირთვა (არასავალდებულო)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                className="text-sm"
              />
              <p className="text-xs text-white/50">
                რეკომენდებული ზომა: 120×120px ან 240×240px (კვადრატი).
              </p>
            </div>
          )}

          {steps[step] === "კონტაქტი" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                ტელეფონი
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.contact.phone}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, phone: event.target.value },
                    })
                  }
                />
              </label>
              <label className="text-sm text-white/70">
                ელ. ფოსტა
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.contact.email}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, email: event.target.value },
                    })
                  }
                />
              </label>
              <label className="text-sm text-white/70">
                მისამართი
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.contact.address}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, address: event.target.value },
                    })
                  }
                />
              </label>
              <label className="text-sm text-white/70">
                სამუშაო საათები
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.contact.hours}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, hours: event.target.value },
                    })
                  }
                />
              </label>
            </div>
          )}

          {steps[step] === "გადახედვა" && (
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">შეჯამება</p>
                <p className="mt-2">{input.businessName}</p>
                <p>{input.description}</p>
                <p>მიზანი: {goals.find((goal) => goal.id === input.goal)?.label}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">გვერდები</p>
                <p className="mt-2">{input.pages.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">ვიჯეტები</p>
                <p className="mt-2">{Object.values(widgetRegistry).map((w) => w.name).slice(0, 6).join(", ")}...</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0}
            >
              უკან
            </button>
            {step < steps.length - 1 ? (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  canNext() ? "bg-white text-slate-900" : "bg-white/30 text-white/50"
                }`}
                onClick={() => canNext() && setStep((prev) => Math.min(prev + 1, steps.length - 1))}
              >
                შემდეგი
              </button>
            ) : (
              <button
                className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "მზადდება..." : "საიტის გენერაცია"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
