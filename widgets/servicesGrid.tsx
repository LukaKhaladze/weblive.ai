import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type ServicesGridProps = {
  variant: string;
  props: {
    title: string;
    items: { title: string; desc: string; icon: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function ServicesGrid({ variant, props, editable, onEdit }: ServicesGridProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const items = Array.isArray(props.items) ? props.items : [];
  const isIcons = variant === "icons";
  return (
    <section id="services" className="px-6 py-16">
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
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${
                isIcons ? "flex gap-4" : ""
              }`}
            >
              {isIcons && (
                <div className="h-10 w-10 rounded-full bg-[color:var(--primary)]/15" />
              )}
              <div>
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
                    className="mt-2 text-sm text-slate-600"
                    value={item.desc}
                    onChange={(value) => {
                      const next = [...props.items];
                      next[index] = { ...next[index], desc: value };
                      onEdit("items", next);
                    }}
                    responsiveStyle={styleFor("items")}
                  />
                ) : (
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
