import { Theme } from "@/lib/schema";

type FaqProps = {
  variant: string;
  props: {
    title: string;
    items: { q: string; a: string }[];
  };
  theme: Theme;
};

export default function Faq({ props }: FaqProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-6 space-y-4">
          {props.items.map((item) => (
            <div key={item.q} className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="font-semibold text-slate-900">{item.q}</p>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
