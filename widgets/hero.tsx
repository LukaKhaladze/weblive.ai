import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type HeroProps = {
  variant: string;
  props: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaHref: string;
    image: { src: string; alt: string };
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Hero({ variant, props, editable, onEdit }: HeroProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const isCentered = variant === "centered";
  const reverse = variant === "split-image-right";

  return (
    <section className="px-6 py-16">
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 ${
          isCentered ? "text-center" : "md:grid-cols-2"
        } ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}
      >
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Weblive.ai
          </p>
          {editable && onEdit ? (
            <EditableText
              as="h2"
              className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl"
              value={props.headline}
              onChange={(value) => onEdit("headline", value)}
              responsiveStyle={styleFor("headline")}
            />
          ) : (
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              {props.headline}
            </h1>
          )}
          {editable && onEdit ? (
            <EditableText
              as="p"
              className="text-lg text-slate-600"
              value={props.subheadline}
              onChange={(value) => onEdit("subheadline", value)}
              responsiveStyle={styleFor("subheadline")}
            />
          ) : (
            <p className="text-lg text-slate-600">{props.subheadline}</p>
          )}
          <div className={`${isCentered ? "justify-center" : ""} flex gap-3`}>
            <a
              href={props.ctaHref}
              className="rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white"
            >
              {editable && onEdit ? (
                <EditableText
                  as="span"
                  className="font-semibold"
                  value={props.ctaText}
                  onChange={(value) => onEdit("ctaText", value)}
                  responsiveStyle={styleFor("ctaText")}
                />
              ) : (
                props.ctaText
              )}
            </a>
            <a
              href="#services"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              სერვისების ნახვა
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-[32px] bg-[color:var(--secondary)]/20 blur-2xl" />
          <img
            src={props.image.src}
            alt={props.image.alt}
            className="relative h-[320px] w-full rounded-[28px] object-cover shadow-lg md:h-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
