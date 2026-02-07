import { Theme } from "@/lib/schema";

type FeaturesProps = {
  variant: string;
  props: {
    title: string;
    items: { title: string; desc: string }[];
  };
  theme: Theme;
};

export default function Features({ props }: FeaturesProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-[36px] bg-[color:var(--secondary)]/15 p-10">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {props.items.map((item) => (
            <div key={item.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
