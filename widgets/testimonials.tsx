import { Theme } from "@/lib/schema";

type TestimonialsProps = {
  variant: string;
  props: {
    title: string;
    items: { quote: string; name: string; role: string }[];
  };
  theme: Theme;
};

export default function Testimonials({ props }: TestimonialsProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {props.items.map((item) => (
            <div key={item.name} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-slate-700">“{item.quote}”</p>
              <div className="mt-4 text-sm text-slate-500">
                <strong className="text-slate-900">{item.name}</strong> · {item.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
