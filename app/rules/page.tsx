const rules = [
  "Headers must not use burger menus. Navigation should stay visible on mobile.",
  "Header must always contain logo, navigation, and CTA.",
  "CTA text should be short and action-oriented in English.",
  "Width: max 1200px container, height 72-96px range.",
  "Header variants must be clearly distinct (layout/background/style).",
  "Do not use dropdown or overlay navigation on mobile.",
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-primary text-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">Weblive.ai</p>
        <h1 className="mt-3 text-3xl font-semibold">Header Template Rules</h1>
        <p className="mt-2 text-sm text-muted">
          This page is temporary and for internal use only.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-[#F8FAFC]">
          {rules.map((item) => (
            <li key={item} className="rounded-2xl border border-border bg-primary px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
