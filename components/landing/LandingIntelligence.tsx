const cards = [
  {
    title: "Real-time analytics",
    text: "Track engagement signals and understand which sections drive the most user intent.",
  },
  {
    title: "SEO optimization",
    text: "Ship clean metadata, page structure, and keyword-ready content from day one.",
  },
];

export default function LandingIntelligence() {
  return (
    <section className="surface-card rounded-[28px] p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-[#F8FAFC]">Built-In Intelligence</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-border bg-primary p-5">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">{card.title}</h3>
            <p className="mt-2 text-sm text-muted">{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
