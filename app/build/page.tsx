"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardInput } from "@/lib/schema";
import { recipes } from "@/lib/generator/recipes";
import { widgetRegistry } from "@/widgets/registry";
import { ECOMMERCE_FIXED_PAGES, normalizeEcommerceInput } from "@/lib/generator/normalizeEcommerceInput";
import { buildPromptFromFields } from "@/lib/planner";
import { LayoutPlan } from "@/schemas/layoutPlan";

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

const demoInput: WizardInput = normalizeEcommerceInput({
  ...defaultInput,
  prompt:
    "Create a modern ecommerce website for a Tbilisi pool construction company with strong trust messaging and contact-first CTAs.",
  businessName: "AquaLine",
  description:
    "AquaLine is a Tbilisi-based pool construction company focused on custom residential and commercial pools with full-cycle service.",
  productCategories: "Pool Construction, Renovation, Maintenance",
  services: "Pool Construction, Renovation, Maintenance",
  uniqueValue: "Certified technical support and turnkey delivery.",
  targetAudience: "Homeowners, hotels, developers",
  location: "Tbilisi, Georgia",
  tone: "professional",
  visualStyle: "modern minimal",
  imageMood: "clean daylight",
  primaryCta: "Call Now",
  products: [
    { name: "Residential Pool", price: "From $18,000", imageUrl: "" },
    { name: "Commercial Pool", price: "From $35,000", imageUrl: "" },
    { name: "Pool Renovation", price: "From $6,000", imageUrl: "" },
  ],
  contact: {
    ...defaultInput.contact,
    phone: "+995 555 123 456",
    email: "hello@aqualine.ge",
    address: "Tbilisi, Georgia",
  },
});

export default function BuildPage() {
  const router = useRouter();
  const [websiteType, setWebsiteType] = useState<"catalog" | "info">("catalog");
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<WizardInput>(defaultInput);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productFiles, setProductFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string>("");
  const [plannerWarnings, setPlannerWarnings] = useState<string[]>([]);
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<string[]>([]);
  const autoStartedRef = useRef(false);

  const steps = useMemo(() => stepsBase, []);
  const products = useMemo(() => (Array.isArray(input.products) ? input.products : []), [input.products]);

  const availablePages = useMemo(() => {
    const pages = recipes?.ecommerce?.pages;
    if (!Array.isArray(pages)) return [];
    return pages.map((page) => ({ id: page.id, name: page.name }));
  }, []);

  const canNext = () => {
    if (step === 0) return input.businessName.trim().length > 0;
    if (step === 1) return input.description.trim().length > 0 || (input.prompt || "").trim().length > 0;
    if (steps[step] === "Products") {
      const products = Array.isArray(input.products) ? input.products : [];
      return products.length > 0 && products.every((p) => p.name && p.price);
    }
    return true;
  };

  async function handleGenerate(sourceInput?: WizardInput) {
    if (loading) return;
    setLoading(true);
    setLastError("");
    try {
      const activeInput = sourceInput ?? input;
      const normalized = normalizeEcommerceInput({
        ...activeInput,
        products: Array.isArray(activeInput.products) ? activeInput.products : [],
      });
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
          website_type: websiteType,
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
          products: normalized.products,
        }),
      });

      const planRaw = await planResponse.text();
      let planData: any = null;
      try {
        planData = planRaw ? JSON.parse(planRaw) : null;
      } catch {
        planData = { error: planRaw?.slice(0, 280) || "Unknown planner response" };
      }
      if (!planResponse.ok || !planData?.layoutPlan) {
        setLoading(false);
        const message = planData?.error ? `Planning failed: ${planData.error}` : "Planning failed.";
        setLastError(message);
        alert(message);
        return;
      }

      const layoutPlan = planData.layoutPlan as LayoutPlan;
      const warnings = Array.isArray(planData.warnings) ? (planData.warnings as string[]) : [];
      const unsupported = Array.isArray(planData.unsupported_features)
        ? (planData.unsupported_features as string[])
        : [];
      setPlannerWarnings(warnings);
      setUnsupportedFeatures(unsupported);

      if (unsupported.length > 0) {
        const notes = [
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
          layoutPlan,
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
          products: normalized.products,
          inputOverrides: normalized,
        }),
      });

      const generateRaw = await response.text();
      let data: any = null;
      try {
        data = generateRaw ? JSON.parse(generateRaw) : null;
      } catch {
        data = { error: generateRaw?.slice(0, 280) || "Unknown generation response" };
      }
      if (!response.ok) {
        setLoading(false);
        const message = data?.error ? `Generation failed: ${data.error}` : "Generation failed.";
        setLastError(message);
        alert(message);
        return;
      }

      if (logoFile && !sourceInput) {
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
              input: normalizeEcommerceInput({ ...activeInput, logoUrl: upload.url }),
              site: updatedSite,
            }),
          });
        } else {
          console.error("Logo upload failed:", upload);
          alert("Logo upload failed. Please try again or upload it later in the editor.");
        }
      }

      if (products.length > 0 && !sourceInput) {
        const updatedProducts = [...products];
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
            input: normalizeEcommerceInput({ ...activeInput, products: updatedProducts }),
          }),
        });
      }

      if (!data?.edit_token || typeof data.edit_token !== "string") {
        throw new Error("Generation response missing edit_token");
      }
      if (typeof window !== "undefined") {
        window.location.href = `/e/${data.edit_token}`;
      } else {
        router.push(`/e/${data.edit_token}`);
      }
      return;
    } catch (error) {
      console.error("Build generate failed", error);
      const message = error instanceof Error ? `Generation failed: ${error.message}` : "Generation failed.";
      setLastError(message);
      alert(message);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "tbilisi-business") return;
    setInput(normalizeEcommerceInput({ ...demoInput, products: demoInput.products || [] }));
    setStep(steps.length - 1);
    if (params.get("autostart") === "1" && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void handleGenerate(demoInput);
    }
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-primary text-[#F8FAFC]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">Build your website</h1>
          </div>
          <div className="text-sm text-muted">
            Step {step + 1} / {steps.length}
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full border border-border bg-primary p-1 text-xs">
          <button
            className={`rounded-full px-4 py-1.5 ${websiteType === "catalog" ? "bg-brand-gradient text-white" : "text-muted"}`}
            onClick={() => setWebsiteType("catalog")}
            type="button"
          >
            Catalog
          </button>
          <button
            className={`rounded-full px-4 py-1.5 ${websiteType === "info" ? "bg-brand-gradient text-white" : "text-muted"}`}
            onClick={() => setWebsiteType("info")}
            type="button"
          >
            Informational
          </button>
        </div>

        <div className="mt-8 rounded-[32px] border border-border bg-primary p-8">
          <h2 className="text-xl font-semibold">{steps[step]}</h2>

          {step === 0 && (
            <div className="mt-6">
              <label className="text-sm text-muted">Business Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                value={input.businessName}
                onChange={(event) => setInput({ ...input, businessName: event.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-muted">
                Describe what website you need (planner prompt)
                <textarea
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  rows={4}
                  value={input.prompt || ""}
                  onChange={(event) => setInput({ ...input, prompt: event.target.value })}
                  placeholder="Example: Create a modern ecommerce site for a beauty salon in Tbilisi with trust-focused copy and product highlights."
                />
              </label>
              <label className="block text-sm text-muted">Short Description</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                rows={4}
                value={input.description}
                onChange={(event) => setInput({ ...input, description: event.target.value })}
              />
            </div>
          )}

          {steps[step] === "Details" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted">
                Product categories (comma separated)
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.productCategories || ""}
                  onChange={(event) => setInput({ ...input, productCategories: event.target.value, services: event.target.value })}
                  placeholder="skincare, makeup, accessories"
                />
              </label>
              <label className="text-sm text-muted">
                Unique value proposition
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.uniqueValue || ""}
                  onChange={(event) => setInput({ ...input, uniqueValue: event.target.value })}
                  placeholder="Why customers should choose you over competitors"
                />
              </label>
              <label className="text-sm text-muted">
                Target audience
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.targetAudience}
                  onChange={(event) => setInput({ ...input, targetAudience: event.target.value })}
                  placeholder="Women 20-45"
                />
              </label>
              <label className="text-sm text-muted">
                Price range
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.priceRange || ""}
                  onChange={(event) => setInput({ ...input, priceRange: event.target.value })}
                  placeholder="mid-range, premium, $30-$120"
                />
              </label>
              <label className="text-sm text-muted">
                Location
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.location}
                  onChange={(event) => setInput({ ...input, location: event.target.value })}
                  placeholder="Tbilisi, Vake"
                />
              </label>
              <label className="text-sm text-muted">
                Tone / style
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.tone}
                  onChange={(event) => setInput({ ...input, tone: event.target.value })}
                  placeholder="elegant, premium"
                />
              </label>
              <label className="text-sm text-muted">
                Visual style
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.visualStyle || ""}
                  onChange={(event) => setInput({ ...input, visualStyle: event.target.value })}
                  placeholder="minimal, modern, dark, light"
                />
              </label>
              <label className="text-sm text-muted">
                Image mood
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.imageMood || ""}
                  onChange={(event) => setInput({ ...input, imageMood: event.target.value })}
                  placeholder="warm, luxury, natural light"
                />
              </label>
              <label className="text-sm text-muted md:col-span-2">
                Primary CTA text
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.primaryCta || ""}
                  onChange={(event) => setInput({ ...input, primaryCta: event.target.value })}
                  placeholder="Order now / Contact us"
                />
              </label>
            </div>
          )}

          {steps[step] === "Main Goal" && (
            <div className="mt-6">
              <div className="rounded-xl border border-border bg-primary px-4 py-4 text-sm text-[#F8FAFC]">
                {GOAL_LABEL}
              </div>
            </div>
          )}

          {steps[step] === "Pages" && (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted">Standard ecommerce pages:</p>
              <div className="grid gap-2 md:grid-cols-2">
                {availablePages.map((page) => (
                  <div key={page.id} className="rounded-xl border border-border bg-primary px-3 py-2 text-sm">
                    {page.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps[step] === "Products" && (
            <div className="mt-6 space-y-4">
              <div className="text-sm text-muted">How many products do you have? (max 3)</div>
              <div className="flex gap-3">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      products.length === count
                        ? "border-border bg-brand-gradient text-white"
                        : "border-border bg-primary text-muted"
                    }`}
                    onClick={() => {
                      const next = Array.from({ length: count }).map((_, index) => ({
                        name: products[index]?.name || "",
                        price: products[index]?.price || "",
                        imageUrl: products[index]?.imageUrl || "",
                      }));
                      setInput((prev) => ({ ...prev, products: next }));
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>

              {products.map((product, index) => (
                <div key={index} className="rounded-2xl border border-border bg-primary p-4">
                  <p className="text-sm font-semibold text-[#F8FAFC]">Product {index + 1}</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-muted">
                      Name
                      <input
                        className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                        value={product.name}
                        onChange={(event) => {
                          const next = [...products];
                          next[index] = { ...next[index], name: event.target.value };
                          setInput((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </label>
                    <label className="text-sm text-muted">
                      Price
                      <input
                        className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                        value={product.price}
                        onChange={(event) => {
                          const next = [...products];
                          next[index] = { ...next[index], price: event.target.value };
                          setInput((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </label>
                    <label className="text-sm text-muted">
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
              <label className="text-sm text-muted">
                Primary color
                <input
                  type="color"
                  value={input.brand.primaryColor}
                  onChange={(event) =>
                    setInput({ ...input, brand: { ...input.brand, primaryColor: event.target.value } })
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-border bg-primary"
                />
              </label>
              <label className="text-sm text-muted">
                Secondary color
                <input
                  type="color"
                  value={input.brand.secondaryColor}
                  onChange={(event) =>
                    setInput({ ...input, brand: { ...input.brand, secondaryColor: event.target.value } })
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-border bg-primary"
                />
              </label>
              <label className="col-span-full flex items-center gap-3 text-sm text-muted">
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
              <label className="text-sm text-muted">Logo upload (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                className="text-sm"
              />
              <p className="text-xs text-muted">
                Recommended size: 120x120px or 240x240px (square).
              </p>
            </div>
          )}

          {steps[step] === "Contact" && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted">
                Phone
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.contact.phone}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, phone: event.target.value },
                    })
                  }
                />
              </label>
              <label className="text-sm text-muted">
                Email
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.contact.email}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, email: event.target.value },
                    })
                  }
                />
              </label>
              <label className="text-sm text-muted">
                Address
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
                  value={input.contact.address}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      contact: { ...input.contact, address: event.target.value },
                    })
                  }
                />
              </label>
              <label className="text-sm text-muted">
                Business hours
                <input
                  className="mt-2 w-full rounded-xl border border-border bg-primary p-3 text-white placeholder-white/40"
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
            <div className="mt-6 space-y-4 text-sm text-muted">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Summary</p>
                <p className="mt-2">{input.businessName}</p>
                {!!input.prompt && <p>Prompt: {input.prompt}</p>}
                <p>{input.description}</p>
                {!!input.productCategories && <p>Categories: {input.productCategories}</p>}
                {!!input.uniqueValue && <p>Unique value proposition: {input.uniqueValue}</p>}
                <p>Goal: {GOAL_LABEL}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Pages</p>
                  <p className="mt-2">{(input.pages || []).join(", ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Widgets</p>
                <p className="mt-2">
                  {(widgetRegistry ? Object.values(widgetRegistry) : [])
                    .map((w) => (w && typeof w.name === "string" ? w.name : ""))
                    .filter(Boolean)
                    .slice(0, 6)
                    .join(", ")}
                  ...
                </p>
              </div>
              {(plannerWarnings.length > 0 || unsupportedFeatures.length > 0) && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Planner Notes</p>
                  {(plannerWarnings || []).length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {(plannerWarnings || []).map((warning, index) => (
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
              className="btn-secondary rounded-full px-4 py-2 text-sm"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  canNext() ? "bg-brand-gradient text-white" : "border border-border text-muted"
                }`}
                onClick={() => canNext() && setStep((prev) => Math.min(prev + 1, steps.length - 1))}
              >
                Next
              </button>
            ) : (
              <button
                className="btn-primary rounded-full px-6 py-2 text-sm font-semibold"
                onClick={() => void handleGenerate()}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Website"}
              </button>
            )}
          </div>
          {lastError && (
            <p className="mt-4 rounded-xl border border-border px-3 py-2 text-xs text-[#F8FAFC]">
              {lastError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
