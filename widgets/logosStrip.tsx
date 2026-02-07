import { Theme } from "@/lib/schema";

type LogosStripProps = {
  variant: string;
  props: {
    title: string;
    logos: string[];
  };
  theme: Theme;
};

export default function LogosStrip({ props }: LogosStripProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white/70 px-8 py-6 shadow-sm">
        <p className="text-sm text-slate-500">{props.title}</p>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-base font-semibold text-slate-700">
          {props.logos.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
