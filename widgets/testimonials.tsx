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
  const items = Array.isArray(props.items) ? props.items : [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {editable && onEdit ? (
          <EditableText
            as="h2"
            className="text-3xl font-semibold"
            value={props.title}
            onChange={(value) => onEdit("title", value)}
            responsiveStyle={styleFor("title")}
          />
        ) : (
          <h2 className="text-3xl font-semibold">{props.title}</h2>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="rounded-[28px] border p-6"
              style={{
                background: "var(--wf-surface)",
                borderColor: "var(--wf-border)",
                boxShadow: "none",
              }}
            >
              {editable && onEdit ? (
                <EditableText
                  as="p"
                  className="text-base"
                  value={item.quote}
                  onChange={(value) => {
                    const next = [...props.items];
                    next[index] = { ...next[index], quote: value };
                    onEdit("items", next);
                  }}
                  responsiveStyle={styleFor("items")}
                />
              ) : (
                <p style={{ color: "var(--wf-muted)" }}>“{item.quote}”</p>
              )}
              <div className="mt-4 text-sm" style={{ color: "var(--wf-muted)" }}>
                {editable && onEdit ? (
                  <EditableText
                    as="span"
                    className="font-semibold"
                    value={item.name}
                    onChange={(value) => {
                      const next = [...props.items];
                      next[index] = { ...next[index], name: value };
                      onEdit("items", next);
                    }}
                    responsiveStyle={styleFor("items")}
                  />
                ) : (
                  <strong style={{ color: "var(--wf-text)" }}>{item.name}</strong>
                )}
                {" · "}
                {editable && onEdit ? (
                  <EditableText
                    as="span"
                    className="text-sm"
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
