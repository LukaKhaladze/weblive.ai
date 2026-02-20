import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type FaqProps = {
  variant: string;
  props: {
    title: string;
    items: { q: string; a: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Faq({ props, editable, onEdit }: FaqProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const items = Array.isArray(props.items) ? props.items : [];
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
        <div className="mt-6 space-y-4">
          {items.map((item, index) => (
            <div
              key={`${item.q}-${index}`}
              className="rounded-[24px] border border-slate-200 bg-white p-5"
            >
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="font-semibold text-slate-900"
                  value={item.q}
                  onChange={(value) => {
                    const next = [...props.items];
                    next[index] = { ...next[index], q: value };
                    onEdit("items", next);
                  }}
                  responsiveStyle={styleFor("items")}
                />
              ) : (
                <p className="font-semibold text-slate-900">{item.q}</p>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="mt-2 text-sm text-slate-600"
                  value={item.a}
                  onChange={(value) => {
                    const next = [...props.items];
                    next[index] = { ...next[index], a: value };
                    onEdit("items", next);
                  }}
                  responsiveStyle={styleFor("items")}
                />
              ) : (
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
