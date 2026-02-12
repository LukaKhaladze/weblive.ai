import Link from "next/link";

export default function HomePage() {
  const steps = [
    { title: "Business Name", desc: "Enter your business or brand name." },
    { title: "Category", desc: "Choose a type: ecommerce or informational." },
    { title: "Description", desc: "Briefly describe what you do." },
    { title: "Main Goal", desc: "Leads, sales, calls, or visits." },
    { title: "Logo and Colors", desc: "Upload your logo and pick brand colors." },
    { title: "Contact", desc: "Add phone, address, and email." },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">AI Website Generator</h1>
            <p className="mt-2 text-sm text-white/60">
              Build a professional website in a few steps.
            </p>
          </div>
          <Link
            href="/build"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Start Building
          </Link>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0C1220] p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Build Steps
              </p>
              <span className="text-xs text-white/50">6 steps</span>
            </div>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[20px] border border-white/10 bg-[#0B1120] px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-1 text-xs text-white/60">{step.desc}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/60">
                      Step {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/build"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
              >
                Generate
              </Link>
              <span className="text-xs text-white/50">
                Takes around 2-3 minutes
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0C1220] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Preview</p>
            <div className="mt-4 rounded-[22px] bg-white p-4 text-slate-900">
              <div className="flex items-center justify-between rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold">
                <span>Weblive.ai</span>
                <span>Home</span>
                <span>Products</span>
                <span>Contact</span>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
                  Start Building
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-[18px] bg-slate-100 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Your business hero section
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    AI generates the design and structure
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Text, CTA, and sections are generated automatically.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                      Start Building
                    </button>
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-xs">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="rounded-[18px] bg-slate-100 p-4">
                  <div className="h-32 w-full rounded-[14px] bg-gradient-to-br from-slate-200 to-slate-300" />
                  <p className="mt-3 text-xs text-slate-500">Gallery Preview</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/50">
              A guided step-by-step process instead of a single form.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
