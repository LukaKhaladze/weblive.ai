import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type FeaturesProps = {
  variant: string;
  props: {
    title: string;
    items: { title: string; desc: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Features({ props, editable, onEdit }: FeaturesProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const items = Array.isArray(props.items) ? props.items : [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-[36px] bg-[color:var(--secondary)]/15 p-10">
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
          {items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="space-y-3">
              {editable && onEdit ? (
                <EditableText
                  as="h3"
                  className="text-lg font-semibold text-slate-900"
                  value={item.title}
                  onChange={(value) => {
                    const next = [...props.items];
                    next[index] = { ...next[index], title: value };
                    onEdit("items", next);
                  }}
                  responsiveStyle={styleFor("items")}
                />
              ) : (
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              )}
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="text-sm text-slate-600"
                  value={item.desc}
                  onChange={(value) => {
                    const next = [...props.items];
                    next[index] = { ...next[index], desc: value };
                    onEdit("items", next);
                  }}
                  responsiveStyle={styleFor("items")}
                />
              ) : (
                <p className="text-sm text-slate-600">{item.desc}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
