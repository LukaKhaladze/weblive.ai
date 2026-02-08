import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";
import ClickUpload from "@/components/ClickUpload";

type HeroProps = {
  variant: string;
  props: {
    eyebrow?: string;
    headline: string;
    subheadline?: string;
    ctaPrimary?: { label: string; href: string };
    ctaSecondary?: { label: string; href: string };
    bullets?: string[];
    stats?: { label: string; value: string }[];
    image?: { src: string; alt?: string };
    gallery?: { src: string; alt?: string }[];
    backgroundImage?: string;
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
  onImageUpload?: (path: string, file: File, kind?: "logo" | "images") => void;
};

export default function Hero({
  variant,
  props,
  editable,
  onEdit,
  onImageUpload,
}: HeroProps) {
  const isSplit = variant === "v1-split";
  const isFullBg = variant === "v2-full-bg";
  const isCard = variant === "v3-card";
  const isMetrics = variant === "v4-metrics";

  const primary = props.ctaPrimary || { label: "დაწყება", href: "#contact" };
  const secondary = props.ctaSecondary || { label: "გაიგე მეტი", href: "#more" };

  const handleCtaClick = (path: string, current: string) => {
    if (!editable || !onEdit) return;
    const next = window.prompt("შეიყვანე ბმული", current);
    if (next !== null) {
      onEdit(path, next.trim());
    }
  };

  const renderText = (
    as: "h2" | "p" | "span",
    className: string,
    value: string,
    path: string
  ) => {
    if (editable && onEdit) {
      return (
        <EditableText
          as={as}
          className={className}
          value={value}
          onChange={(next) => onEdit(path, next)}
        />
      );
    }
    const Tag = as as React.ElementType;
    return <Tag className={className}>{value}</Tag>;
  };

  const heroStyle = isFullBg
    ? {
        backgroundImage: `url(${props.backgroundImage || props.image?.src || ""})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const ImageBlock = (
    <div className="relative overflow-hidden rounded-[24px] bg-slate-100">
      {editable && onImageUpload ? (
        <ClickUpload onUpload={(file) => onImageUpload("image.src", file, "images")}>
          <img
            src={props.image?.src || "/placeholders/scene-1.svg"}
            alt={props.image?.alt || "hero"}
            className="h-full w-full object-cover"
          />
        </ClickUpload>
      ) : (
        <img
          src={props.image?.src || "/placeholders/scene-1.svg"}
          alt={props.image?.alt || "hero"}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );

  const TextBlock = (
    <div className="space-y-4">
      {props.eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {renderText("span", "font-semibold", props.eyebrow, "eyebrow")}
        </div>
      )}
      {renderText(
        "h2",
        "text-4xl font-semibold tracking-tight text-slate-900",
        props.headline,
        "headline"
      )}
      {props.subheadline && (
        renderText(
          "p",
          "max-w-xl text-base text-slate-600",
          props.subheadline,
          "subheadline"
        )
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
          onClick={() => handleCtaClick("ctaPrimary.href", primary.href)}
        >
          {renderText("span", "font-semibold", primary.label, "ctaPrimary.label")}
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
          onClick={() => handleCtaClick("ctaSecondary.href", secondary.href)}
        >
          {renderText("span", "font-semibold", secondary.label, "ctaSecondary.label")}
        </button>
      </div>
      {props.bullets && props.bullets.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {props.bullets.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {renderText("span", "flex items-center gap-2", item, `bullets.${index}`)}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (isFullBg) {
    return (
      <section className="relative overflow-hidden rounded-[28px] text-white" style={heroStyle}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-10 py-16">
          <div className="max-w-2xl space-y-5">
            {props.eyebrow && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                {renderText("span", "font-semibold", props.eyebrow, "eyebrow")}
              </div>
            )}
            {renderText(
              "h2",
              "text-4xl font-semibold tracking-tight text-white",
              props.headline,
              "headline"
            )}
            {props.subheadline && (
              renderText(
                "p",
                "max-w-xl text-base text-white/80",
                props.subheadline,
                "subheadline"
              )
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
                onClick={() => handleCtaClick("ctaPrimary.href", primary.href)}
              >
                {renderText("span", "font-semibold", primary.label, "ctaPrimary.label")}
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/50 px-5 py-2.5 text-sm font-semibold text-white"
                onClick={() => handleCtaClick("ctaSecondary.href", secondary.href)}
              >
                {renderText("span", "font-semibold", secondary.label, "ctaSecondary.label")}
              </button>
            </div>
            {props.bullets && props.bullets.length > 0 && (
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                {props.bullets.map((item, index) => (
                  <span key={index} className="flex items-center gap-2">
                    {renderText("span", "flex items-center gap-2", item, `bullets.${index}`)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {editable && onImageUpload && (
          <div className="absolute bottom-4 right-4 z-20">
            <ClickUpload onUpload={(file) => onImageUpload("backgroundImage", file, "images")}>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                შეცვალე ფონი
              </span>
            </ClickUpload>
          </div>
        )}
      </section>
    );
  }

  if (isCard) {
    return (
      <section className="relative overflow-hidden rounded-[28px] bg-slate-100">
        <div className="absolute inset-0">
          {editable && onImageUpload ? (
            <ClickUpload onUpload={(file) => onImageUpload("backgroundImage", file, "images")}>
              <img
                src={props.backgroundImage || props.image?.src || "/placeholders/scene-2.svg"}
                alt="background"
                className="h-full w-full object-cover"
              />
            </ClickUpload>
          ) : (
            <img
              src={props.backgroundImage || props.image?.src || "/placeholders/scene-2.svg"}
              alt="background"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 max-w-xl rounded-[24px] bg-white p-8 shadow">
          {TextBlock}
        </div>
      </section>
    );
  }

  if (isMetrics) {
    return (
      <section className="space-y-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            {renderText(
              "h2",
              "text-4xl font-semibold tracking-tight text-slate-900",
              props.headline,
              "headline"
            )}
            {props.subheadline && (
              renderText(
                "p",
                "max-w-xl text-base text-slate-600",
                props.subheadline,
                "subheadline"
              )
            )}
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => handleCtaClick("ctaPrimary.href", primary.href)}
            >
              {renderText("span", "font-semibold", primary.label, "ctaPrimary.label")}
            </button>
          </div>
          <div className="space-y-6">
            {(props.stats || []).map((stat, index) => (
              <div key={index} className="border-b border-slate-200 pb-4">
                {renderText(
                  "p",
                  "text-xs uppercase tracking-[0.3em] text-slate-400",
                  stat.label,
                  `stats.${index}.label`
                )}
                {renderText(
                  "p",
                  "text-2xl font-semibold text-slate-900",
                  stat.value,
                  `stats.${index}.value`
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(props.gallery || []).map((item, index) => (
            <div key={index} className="overflow-hidden rounded-[20px]">
              {editable && onImageUpload ? (
                <ClickUpload onUpload={(file) => onImageUpload(`gallery.${index}.src`, file, "images")}>
                  <img src={item.src} alt={item.alt || "gallery"} className="h-full w-full object-cover" />
                </ClickUpload>
              ) : (
                <img src={item.src} alt={item.alt || "gallery"} className="h-full w-full object-cover" />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
      {ImageBlock}
      {TextBlock}
    </section>
  );
}
