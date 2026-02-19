"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardInput } from "@/lib/schema";
import { recipes } from "@/lib/generator/recipes";
import { widgetRegistry } from "@/widgets/registry";
import { ECOMMERCE_FIXED_PAGES, normalizeEcommerceInput } from "@/lib/generator/normalizeEcommerceInput";
import { buildPromptFromFields } from "@/lib/planner";
import { SiteSpec } from "@/schemas/siteSpec";

const GOAL_LABEL = "Get calls from products";

const defaultInput: WizardInput = {
  prompt: "",
  businessName: "",
  category: "ecommerce",
  description: "",
  productCategories: "",
  services: "",
  uniqueValue: "",
  priceRange: "",
  targetAudience: "",
  location: "",
  tone: "",
  visualStyle: "",
  imageMood: "",
  primaryCta: "",
  goal: "calls",
  pages: [...ECOMMERCE_FIXED_PAGES],
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
  "Business Name",
  "Description",
  "Details",
  "Main Goal",
  "Pages",
  "Products",
  "Brand Colors",
  "Logo",
  "Contact",
  "Review",
];

export default function BuildPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<WizardInput>(defaultInput);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productFiles, setProductFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [plannerWarnings, setPlannerWarnings] = useState<string[]>([]);
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<string[]>([]);

  const steps = useMemo(() => stepsBase, []);

  const availablePages = useMemo(() => {
    const recipe = recipes.ecommerce;
    return recipe.pages.map((page) => ({ id: page.id, name: page.name }));
  }, []);

  const canNext = () => {
    if (step === 0) return input.businessName.trim().length > 0;
    if (step === 1) return input.description.trim().length > 0 || (input.prompt || "").trim().length > 0;
    if (steps[step] === "Products") {
      return input.products.length > 0 && input.products.every((p) => p.name && p.price);
    }
    return true;
  };

  async function handleGenerate() {
    setLoading(true);
    try {
      const normalized = normalizeEcommerceInput(input);
      const prompt =
        normalized.prompt?.trim() ||
        buildPromptFromFields({
          businessName: normalized.businessName,
          description: normalized.description,
          productCategories: normalized.productCategories,
          targetAudience: normalized.targetAudience,
          location: normalized.location,
          tone: normalized.tone,
          uniqueValue: normalized.uniqueValue,
        });

      const planResponse = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          locale: "en",
          brand: {
            colors: [normalized.brand.primaryColor, normalized.brand.secondaryColor],
            logo_url: normalized.logoUrl || undefined,
          },
          contact: {
            phone: normalized.contact.phone,
            email: normalized.contact.email,
            address: normalized.contact.address,
            city: normalized.location || undefined,
          },
          constraints: { max_pages: 5 },
        }),
      });

      const planData = await planResponse.json();
      if (!planResponse.ok || !planData?.siteSpec) {
        setLoading(false);
        alert("Planning failed.");
        return;
      }

      const siteSpec = planData.siteSpec as SiteSpec;
      const warnings = Array.isArray(planData.warnings) ? (planData.warnings as string[]) : [];
      const unsupported = Array.isArray(planData.unsupported_features)
        ? (planData.unsupported_features as string[])
        : [];
      setPlannerWarnings(warnings);
      setUnsupportedFeatures(unsupported);

      if (warnings.length > 0 || unsupported.length > 0) {
        const notes = [
          warnings.length ? `Warnings:\n- ${warnings.join("\n- ")}` : "",
          unsupported.length ? `Unsupported features:\n- ${unsupported.join("\n- ")}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
        alert(`Planner notes:\n\n${notes}`);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSpec,
          prompt,
          brand: {
            colors: [normalized.brand.primaryColor, normalized.brand.secondaryColor],
            logo_url: normalized.logoUrl || undefined,
          },
          contact: {
            phone: normalized.contact.phone,
            email: normalized.contact.email,
            address: normalized.contact.address,
            city: normalized.location || undefined,
          },
          inputOverrides: normalized,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setLoading(false);
        alert("Generation failed.");
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
              input: normalizeEcommerceInput({ ...input, logoUrl: upload.url }),
              site: updatedSite,
            }),
          });
        } else {
          console.error("Logo upload failed:", upload);
          alert("Logo upload failed. Please try again or upload it later in the editor.");
        }
      }

      if (input.products.length > 0) {
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
            input: normalizeEcommerceInput({ ...input, products: updatedProducts }),
          }),
        });
      }

      router.push(`/e/${data.edit_token}`);
    } catch (error) {
      console.error("Build generate failed", error);
      alert("Generation failed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">Build your website</h1>
          </div>
          <div className="text-sm text-white/60">
            Step {step + 1} / {steps.length}
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-white/10 bg-slate-900 p-8">
          <h2 className="text-xl font-semibold">{steps[step]}</h2>

          {step === 0 && (
            <div className="mt-6">
              <label className="text-sm text-white/70">Business Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                value={input.businessName}
                onChange={(event) => setInput({ ...input, businessName: event.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-white/70">
                Describe what website you need (planner prompt)
                <textarea
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  rows={4}
                  value={input.prompt || ""}
                  onChange={(event) => setInput({ ...input, prompt: event.target.value })}
                  placeholder="Example: Create a modern ecommerce site for a beauty salon in Tbilisi with trust-focused copy and product highlights."
                />
              </label>
              <label className="block text-sm text-white/70">Short Description</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                rows={4}
                value={input.description}
                onChange={(event) => setInput({ ...input, description: event.target.value })}
              />
            </div>
          )}

          {steps[step] === "Details" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Product categories (comma separated)
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.productCategories || ""}
                  onChange={(event) => setInput({ ...input, productCategories: event.target.value, services: event.target.value })}
                  placeholder="skincare, makeup, accessories"
                />
              </label>
              <label className="text-sm text-white/70">
                Unique value proposition
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.uniqueValue || ""}
                  onChange={(event) => setInput({ ...input, uniqueValue: event.target.value })}
                  placeholder="Why customers should choose you over competitors"
                />
              </label>
              <label className="text-sm text-white/70">
                Target audience
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.targetAudience}
                  onChange={(event) => setInput({ ...input, targetAudience: event.target.value })}
                  placeholder="Women 20-45"
                />
              </label>
              <label className="text-sm text-white/70">
                Price range
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.priceRange || ""}
                  onChange={(event) => setInput({ ...input, priceRange: event.target.value })}
                  placeholder="mid-range, premium, $30-$120"
                />
              </label>
              <label className="text-sm text-white/70">
                Location
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.location}
                  onChange={(event) => setInput({ ...input, location: event.target.value })}
                  placeholder="Tbilisi, Vake"
                />
              </label>
              <label className="text-sm text-white/70">
                Tone / style
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.tone}
                  onChange={(event) => setInput({ ...input, tone: event.target.value })}
                  placeholder="elegant, premium"
                />
              </label>
              <label className="text-sm text-white/70">
                Visual style
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.visualStyle || ""}
                  onChange={(event) => setInput({ ...input, visualStyle: event.target.value })}
                  placeholder="minimal, modern, dark, light"
                />
              </label>
              <label className="text-sm text-white/70">
                Image mood
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.imageMood || ""}
                  onChange={(event) => setInput({ ...input, imageMood: event.target.value })}
                  placeholder="warm, luxury, natural light"
                />
              </label>
              <label className="text-sm text-white/70 md:col-span-2">
                Primary CTA text
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white placeholder-white/40"
                  value={input.primaryCta || ""}
                  onChange={(event) => setInput({ ...input, primaryCta: event.target.value })}
                  placeholder="Order now / Contact us"
                />
              </label>
            </div>
          )}

          {steps[step] === "Main Goal" && (
            <div className="mt-6">
              <div className="rounded-xl border border-white bg-white px-4 py-4 text-sm text-slate-900">
                {GOAL_LABEL}
              </div>
            </div>
          )}

          {steps[step] === "Pages" && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-white/70">Standard ecommerce pages:</p>
              <div className="grid gap-2 md:grid-cols-2">
                {availablePages.map((page) => (
                  <div key={page.id} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm">
                    {page.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps[step] === "Products" && (
            <div className="mt-6 space-y-4">
              <div className="text-sm text-white/70">How many products do you have? (max 3)</div>
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
                  <p className="text-sm font-semibold text-white/80">Product {index + 1}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-white/70">
                      Name
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
                      Price
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
                      Image
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

          {steps[step] === "Brand Colors" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Primary color
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
                Secondary color
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
                Extract colors from logo (temporary behavior)
              </label>
            </div>
          )}

          {steps[step] === "Logo" && (
            <div className="mt-6 space-y-3">
              <label className="text-sm text-white/70">Logo upload (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                className="text-sm"
              />
              <p className="text-xs text-white/50">
                Recommended size: 120x120px or 240x240px (square).
              </p>
            </div>
          )}

          {steps[step] === "Contact" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Phone
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
                Email
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
                Address
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
                Business hours
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

          {steps[step] === "Review" && (
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Summary</p>
                <p className="mt-2">{input.businessName}</p>
                {!!input.prompt && <p>Prompt: {input.prompt}</p>}
                <p>{input.description}</p>
                {!!input.productCategories && <p>Categories: {input.productCategories}</p>}
                {!!input.uniqueValue && <p>Unique value proposition: {input.uniqueValue}</p>}
                <p>Goal: {GOAL_LABEL}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pages</p>
                <p className="mt-2">{input.pages.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Widgets</p>
                <p className="mt-2">{Object.values(widgetRegistry).map((w) => w.name).slice(0, 6).join(", ")}...</p>
              </div>
              {(plannerWarnings.length > 0 || unsupportedFeatures.length > 0) && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Planner Notes</p>
                  {plannerWarnings.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {plannerWarnings.map((warning, index) => (
                        <li key={`warning-${index}`}>{warning}</li>
                      ))}
                    </ul>
                  )}
                  {unsupportedFeatures.length > 0 && (
                    <p className="mt-2">
                      Unsupported features: {unsupportedFeatures.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  canNext() ? "bg-white text-slate-900" : "bg-white/30 text-white/50"
                }`}
                onClick={() => canNext() && setStep((prev) => Math.min(prev + 1, steps.length - 1))}
              >
                Next
              </button>
            ) : (
              <button
                className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Website"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
