import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type PricingProps = {
  variant: string;
  props: {
    title: string;
    tiers: { name: string; price: string; desc: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Pricing({ props, editable, onEdit }: PricingProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {editable && onEdit ? (
          <EditableText
            as="h2"
            className="text-3xl font-semibold text-slate-900"
            value={props.title}
            onChange={(value) => onEdit("title", value)}
            responsiveStyle={styleFor("title")}
          />
        ) : (
          <h2 className="text-3xl font-semibold text-slate-900">{props.title}</h2>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {props.tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${
                index === 1 ? "border-[color:var(--primary)]" : ""
              }`}
            >
              {editable && onEdit ? (
                <EditableText
                  as="h3"
                  className="text-lg font-semibold text-slate-900"
                  value={tier.name}
                  onChange={(value) => {
                    const next = [...props.tiers];
                    next[index] = { ...next[index], name: value };
                    onEdit("tiers", next);
                  }}
                  responsiveStyle={styleFor("tiers")}
                />
              ) : (
                <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="mt-2 text-3xl font-semibold text-slate-900"
                  value={tier.price}
                  onChange={(value) => {
                    const next = [...props.tiers];
                    next[index] = { ...next[index], price: value };
                    onEdit("tiers", next);
                  }}
                  responsiveStyle={styleFor("tiers")}
                />
              ) : (
                <p className="mt-2 text-3xl font-semibold text-slate-900">{tier.price}</p>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="mt-3 text-sm text-slate-600"
                  value={tier.desc}
                  onChange={(value) => {
                    const next = [...props.tiers];
                    next[index] = { ...next[index], desc: value };
                    onEdit("tiers", next);
                  }}
                  responsiveStyle={styleFor("tiers")}
                />
              ) : (
                <p className="mt-3 text-sm text-slate-600">{tier.desc}</p>
              )}
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
