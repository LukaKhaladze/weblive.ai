import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";
import ClickUpload from "@/components/ClickUpload";

type ProductGridProps = {
  variant: string;
  props: {
    title: string;
    items: { title: string; price: string; image: { src: string; alt: string } }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
  onImageUpload?: (path: string, file: File, kind?: "logo" | "images") => void;
};

export default function ProductGrid({ props, editable, onEdit, onImageUpload }: ProductGridProps) {
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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="aspect-square w-full overflow-hidden rounded-[20px] bg-slate-50">
                {editable && onImageUpload ? (
                  <ClickUpload onUpload={(file) => onImageUpload(`items.${index}.image.src`, file, "images")}>
                    <img src={item.image.src} alt={item.image.alt} className="h-full w-full object-contain" />
                  </ClickUpload>
                ) : (
                  <img src={item.image.src} alt={item.image.alt} className="h-full w-full object-contain" />
                )}
              </div>
              <div className="mt-4 space-y-1">
                {editable && onEdit ? (
                  <EditableText
                    as="p"
                    className="text-base font-semibold text-slate-900"
                    value={item.title}
                    onChange={(value) => {
                      const next = [...props.items];
                      next[index] = { ...next[index], title: value };
                      onEdit("items", next);
                    }}
                    responsiveStyle={styleFor("items")}
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                )}
                {editable && onEdit ? (
                  <EditableText
                    as="p"
                    className="text-sm text-slate-600"
                    value={item.price}
                    onChange={(value) => {
                      const next = [...props.items];
                      next[index] = { ...next[index], price: value };
                      onEdit("items", next);
                    }}
                    responsiveStyle={styleFor("items")}
                  />
                ) : (
                  <p className="text-sm text-slate-600">{item.price}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
