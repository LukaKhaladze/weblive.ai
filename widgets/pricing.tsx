import { Theme } from "@/lib/schema";

type PricingProps = {
  variant: string;
  props: {
    title: string;
    tiers: { name: string; price: string; desc: string }[];
  };
  theme: Theme;
};

export default function Pricing({ props }: PricingProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {props.tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${
                index === 1 ? "border-[color:var(--primary)]" : ""
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{tier.price}</p>
              <p className="mt-3 text-sm text-slate-600">{tier.desc}</p>
              <button className="mt-6 w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                Choose plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
