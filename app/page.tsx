import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Weblive.ai</p>
            <h1 className="text-3xl font-semibold">AI website generator</h1>
          </div>
          <Link
            href="/build"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Start building
          </Link>
        </header>

        <section className="mt-16 grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-5xl font-semibold leading-tight">
              Generate a complete website plan in minutes.
            </h2>
            <p className="mt-6 text-lg text-white/70">
              Weblive.ai turns your business details into a structured, editable website blueprint. No
              login required, no hosting — just a fast, sharable preview.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/build"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                Launch the wizard
              </Link>
              <Link
                href="/widget-references"
                className="rounded-full border border-white/20 px-6 py-3 text-sm"
              >
                Explore widgets
              </Link>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">What you get</p>
            <ul className="mt-6 space-y-4 text-sm text-white/70">
              <li>Step-by-step wizard for business inputs.</li>
              <li>AI-ready JSON site plan with widgets.</li>
              <li>Editable preview with drag-and-drop sections.</li>
              <li>7-day shareable preview link.</li>
              <li>Downloadable SEO pack.</li>
            </ul>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            "Clinic-ready layouts",
            "Agency-style storytelling",
            "E-commerce conversion flows",
          ].map((item) => (
            <div key={item} className="rounded-[28px] border border-white/10 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold">{item}</h3>
              <p className="mt-2 text-sm text-white/60">
                Curated widget recipes tailored to your category.
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
