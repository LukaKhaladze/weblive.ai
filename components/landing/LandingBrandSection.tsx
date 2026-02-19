const cards = [
  {
    title: "Create on-brand images",
    text: "Generate visual placeholders and section media that align with your product style and tone.",
  },
  {
    title: "Get AI-crafted logos",
    text: "Start with your brand name and refine into a logo direction that fits your landing identity.",
  },
];

export default function LandingBrandSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Make it uniquely yours</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-white/65">{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
