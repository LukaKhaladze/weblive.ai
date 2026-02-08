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
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow">
          ▶
        </div>
      </div>
    </div>
  );

  const TextBlock = (
    <div className="space-y-4">
      {props.eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <EditableText
            as="span"
            className="font-semibold"
            value={props.eyebrow}
            onChange={(value) => onEdit?.("eyebrow", value)}
          />
        </div>
      )}
      <EditableText
        as="h2"
        className="text-4xl font-semibold tracking-tight text-slate-900"
        value={props.headline}
        onChange={(value) => onEdit?.("headline", value)}
      />
      {props.subheadline && (
        <EditableText
          as="p"
          className="max-w-xl text-base text-slate-600"
          value={props.subheadline}
          onChange={(value) => onEdit?.("subheadline", value)}
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
          onClick={() => handleCtaClick("ctaPrimary.href", primary.href)}
        >
          <EditableText
            as="span"
            className="font-semibold"
            value={primary.label}
            onChange={(value) => onEdit?.("ctaPrimary.label", value)}
          />
        </button>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700"
          onClick={() => handleCtaClick("ctaSecondary.href", secondary.href)}
        >
          <EditableText
            as="span"
            className="font-semibold"
            value={secondary.label}
            onChange={(value) => onEdit?.("ctaSecondary.label", value)}
          />
        </button>
      </div>
      {props.bullets && props.bullets.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {props.bullets.map((item, index) => (
            <EditableText
              key={index}
              as="span"
              className="flex items-center gap-2"
              value={item}
              onChange={(value) => onEdit?.(`bullets.${index}`, value)}
            />
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
                <EditableText
                  as="span"
                  className="font-semibold"
                  value={props.eyebrow}
                  onChange={(value) => onEdit?.("eyebrow", value)}
                />
              </div>
            )}
            <EditableText
              as="h2"
              className="text-4xl font-semibold tracking-tight text-white"
              value={props.headline}
              onChange={(value) => onEdit?.("headline", value)}
            />
            {props.subheadline && (
              <EditableText
                as="p"
                className="max-w-xl text-base text-white/80"
                value={props.subheadline}
                onChange={(value) => onEdit?.("subheadline", value)}
              />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
                onClick={() => handleCtaClick("ctaPrimary.href", primary.href)}
              >
                <EditableText
                  as="span"
                  className="font-semibold"
                  value={primary.label}
                  onChange={(value) => onEdit?.("ctaPrimary.label", value)}
                />
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/50 px-5 py-2.5 text-sm font-semibold text-white"
                onClick={() => handleCtaClick("ctaSecondary.href", secondary.href)}
              >
                <EditableText
                  as="span"
                  className="font-semibold"
                  value={secondary.label}
                  onChange={(value) => onEdit?.("ctaSecondary.label", value)}
                />
              </button>
            </div>
            {props.bullets && props.bullets.length > 0 && (
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                {props.bullets.map((item, index) => (
                  <EditableText
                    key={index}
                    as="span"
                    className="flex items-center gap-2"
                    value={item}
                    onChange={(value) => onEdit?.(`bullets.${index}`, value)}
                  />
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
            <EditableText
              as="h2"
              className="text-4xl font-semibold tracking-tight text-slate-900"
              value={props.headline}
              onChange={(value) => onEdit?.("headline", value)}
            />
            {props.subheadline && (
              <EditableText
                as="p"
                className="max-w-xl text-base text-slate-600"
                value={props.subheadline}
                onChange={(value) => onEdit?.("subheadline", value)}
              />
            )}
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
              onClick={() => handleCtaClick("ctaPrimary.href", primary.href)}
            >
              <EditableText
                as="span"
                className="font-semibold"
                value={primary.label}
                onChange={(value) => onEdit?.("ctaPrimary.label", value)}
              />
            </button>
          </div>
          <div className="space-y-6">
            {(props.stats || []).map((stat, index) => (
              <div key={index} className="border-b border-slate-200 pb-4">
                <EditableText
                  as="p"
                  className="text-xs uppercase tracking-[0.3em] text-slate-400"
                  value={stat.label}
                  onChange={(value) => onEdit?.(`stats.${index}.label`, value)}
                />
                <EditableText
                  as="p"
                  className="text-2xl font-semibold text-slate-900"
                  value={stat.value}
                  onChange={(value) => onEdit?.(`stats.${index}.value`, value)}
                />
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
