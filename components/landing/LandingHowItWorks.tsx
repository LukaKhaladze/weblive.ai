import Link from "next/link";

const steps = [
  {
    title: "Start with a single prompt",
    text: "Describe your business once. We generate page structure, theme direction, and baseline copy.",
  },
  {
    title: "Customize anything",
    text: "Edit text, swap images, tune branding, and adjust sections with instant live preview.",
  },
  {
    title: "Launch your site",
    text: "Share a ready version in minutes and keep iterating as your business evolves.",
  },
];

function StepIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-200" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d={`M8 ${10 + index}h8`} />
    </svg>
  );
}

export default function LandingHowItWorks() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-white/10 bg-[#0b1326] p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5">
              <StepIcon index={index} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-white/65">{step.text}</p>
          </article>
        ))}
      </div>
      <Link
        href="/build"
        className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        Build Your Website
      </Link>
    </section>
  );
}
