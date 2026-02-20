import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type LogosStripProps = {
  variant: string;
  props: {
    title: string;
    logos: string[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function LogosStrip({ props, editable, onEdit }: LogosStripProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const logos = Array.isArray(props.logos) ? props.logos : [];
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white/70 px-8 py-6 shadow-sm">
        {editable && onEdit ? (
          <EditableText
            as="p"
            className="text-sm text-slate-500"
            value={props.title}
            onChange={(value) => onEdit("title", value)}
            responsiveStyle={styleFor("title")}
          />
        ) : (
          <p className="text-sm text-slate-500">{props.title}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-6 text-base font-semibold text-slate-700">
          {logos.map((logo, index) =>
            editable && onEdit ? (
              <EditableText
                key={`${logo}-${index}`}
                as="span"
                className="font-semibold"
                value={logo}
                onChange={(value) => {
                  const next = [...props.logos];
                  next[index] = value;
                  onEdit("logos", next);
                }}
                responsiveStyle={styleFor("logos")}
              />
            ) : (
              <span key={logo}>{logo}</span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
