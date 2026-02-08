import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type TestimonialsProps = {
  variant: string;
  props: {
    title: string;
    items: { quote: string; name: string; role: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Testimonials({ props, editable, onEdit }: TestimonialsProps) {
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
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {props.items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="text-slate-700"
                  value={item.quote}
                  onChange={(value) => {
                    const next = [...props.items];
                    next[index] = { ...next[index], quote: value };
                    onEdit("items", next);
                  }}
                  responsiveStyle={styleFor("items")}
                />
              ) : (
                <p className="text-slate-700">“{item.quote}”</p>
              )}
              <div className="mt-4 text-sm text-slate-500">
                {editable && onEdit ? (
                  <EditableText
                    as="span"
                    className="font-semibold text-slate-900"
                    value={item.name}
                    onChange={(value) => {
                      const next = [...props.items];
                      next[index] = { ...next[index], name: value };
                      onEdit("items", next);
                    }}
                    responsiveStyle={styleFor("items")}
                  />
                ) : (
                  <strong className="text-slate-900">{item.name}</strong>
                )}
                {" · "}
                {editable && onEdit ? (
                  <EditableText
                    as="span"
                    className="text-slate-500"
                    value={item.role}
                    onChange={(value) => {
                      const next = [...props.items];
                      next[index] = { ...next[index], role: value };
                      onEdit("items", next);
                    }}
                    responsiveStyle={styleFor("items")}
                  />
                ) : (
                  item.role
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
