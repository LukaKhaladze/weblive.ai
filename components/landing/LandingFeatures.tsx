const featureCards = [
  {
    title: "Clone",
    description: "Start from high-quality structures instantly and adapt them to your business model.",
  },
  {
    title: "Plan",
    description: "Get AI-generated page plans, content structure, and launch-ready section combinations.",
  },
];

const previews = Array.from({ length: 6 }, (_, index) => index + 1);

function MiniIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-accentBlue" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d={`M7 ${7 + (index % 3) * 4}h10`} />
    </svg>
  );
}

export default function LandingFeatures() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {featureCards.map((card, index) => (
          <article key={card.title} className="surface-card rounded-3xl p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary">
              <MiniIcon index={index} />
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[#F8FAFC]">{card.title}</h3>
            <p className="mt-2 text-sm text-muted">{card.description}</p>
          </article>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {previews.map((item) => (
          <div
            key={item}
            className="bg-brand-gradient h-24 rounded-2xl border border-border opacity-20"
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  );
}
