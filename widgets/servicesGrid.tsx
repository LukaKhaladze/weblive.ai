import { Theme } from "@/lib/schema";

type ServicesGridProps = {
  variant: string;
  props: {
    title: string;
    items: { title: string; desc: string; icon: string }[];
  };
  theme: Theme;
};

export default function ServicesGrid({ variant, props }: ServicesGridProps) {
  const isIcons = variant === "icons";
  return (
    <section id="services" className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {props.items.map((item) => (
            <div
              key={item.title}
              className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${
                isIcons ? "flex gap-4" : ""
              }`}
            >
              {isIcons && (
                <div className="h-10 w-10 rounded-full bg-[color:var(--primary)]/15" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
