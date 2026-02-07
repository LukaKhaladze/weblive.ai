"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardInput } from "@/lib/schema";
import { recipes } from "@/lib/generator/recipes";
import { widgetRegistry } from "@/widgets/registry";

const categories = [
  { id: "clinic", label: "Clinic" },
  { id: "lawyer", label: "Lawyer" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "restaurant", label: "Restaurant" },
  { id: "agency", label: "Agency" },
  { id: "generic", label: "Generic" },
] as const;

const goals = [
  { id: "calls", label: "Calls" },
  { id: "leads", label: "Leads" },
  { id: "bookings", label: "Bookings" },
  { id: "sell", label: "Sell" },
  { id: "visit", label: "Visit" },
] as const;

const defaultInput: WizardInput = {
  businessName: "",
  category: "generic",
  description: "",
  goal: "leads",
  pages: ["home", "about", "contact"],
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

const steps = [
  "Business name",
  "Category",
  "Description",
  "Main goal",
  "Pages",
  "Brand colors",
  "Logo",
  "Contact",
  "Review",
];

export default function BuildPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<WizardInput>(defaultInput);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const availablePages = useMemo(() => {
    const recipe = recipes[input.category] || recipes.generic;
    return recipe.pages.map((page) => ({ id: page.id, name: page.name }));
  }, [input.category]);

  const canNext = () => {
    if (step === 0) return input.businessName.trim().length > 0;
    if (step === 2) return input.description.trim().length > 0;
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
            input: { ...input, logoUrl: upload.url },
            site: updatedSite,
          }),
        });
      }
    }

    router.push(`/e/${data.edit_token}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">Build your site</h1>
          </div>
          <div className="text-sm text-white/60">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-white/10 bg-slate-900 p-8">
          <h2 className="text-xl font-semibold">{steps[step]}</h2>

          {step === 0 && (
            <div className="mt-6">
              <label className="text-sm text-white/70">Business name</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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
                      pages: recipes[category.id].pages.map((page) => page.id),
                    }))
                  }
                >
                  <h3 className="text-lg font-semibold">{category.label}</h3>
                  <p className="mt-2 text-sm opacity-70">Best for {category.label.toLowerCase()}.</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <label className="text-sm text-white/70">Short description</label>
              <textarea
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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

          {step === 4 && (
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

          {step === 5 && (
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
                Extract colors from logo (placeholder behavior)
              </label>
            </div>
          )}

          {step === 6 && (
            <div className="mt-6 space-y-3">
              <label className="text-sm text-white/70">Upload logo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
          )}

          {step === 7 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Phone
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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
                Hours
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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

          {step === 8 && (
            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Summary</p>
                <p className="mt-2">{input.businessName}</p>
                <p>{input.description}</p>
                <p>Goal: {input.goal}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pages</p>
                <p className="mt-2">{input.pages.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Widgets</p>
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
                {loading ? "Generating..." : "Generate site"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
