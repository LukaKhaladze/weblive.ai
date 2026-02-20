import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";
import ClickUpload from "@/components/ClickUpload";
import Link from "next/link";

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
    products?: { name: string; price: string; imageUrl: string; href?: string }[];
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
  const isSplit = variant === "v1-split" || variant === "v1-centered" || variant === "v2-split";
  const isFullBg = variant === "v2-full-bg";
  const isCard = variant === "v3-card";
  const isMetrics = variant === "v4-metrics";

  const primary = props.ctaPrimary || { label: "Get Started", href: "#contact" };
  const secondary = props.ctaSecondary || { label: "Learn More", href: "#more" };
  const bullets = Array.isArray(props.bullets) ? props.bullets : [];
  const stats = Array.isArray(props.stats) ? props.stats : [];
  const gallery = Array.isArray(props.gallery) ? props.gallery : [];

  const handleCtaClick = (path: string, current: string) => {
    if (!editable || !onEdit) return;
    const next = window.prompt("Enter URL", current);
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
    <div className="relative overflow-hidden rounded-[24px] bg-primary border border-border">
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
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-primary px-3 py-1 text-xs font-semibold text-muted">
          {renderText("span", "font-semibold", props.eyebrow, "eyebrow")}
        </div>
      )}
      {renderText(
        "h2",
        "text-4xl font-semibold tracking-tight text-[#F8FAFC]",
        props.headline,
        "headline"
      )}
      {props.subheadline && (
        renderText(
          "p",
          "max-w-xl text-base text-muted",
          props.subheadline,
          "subheadline"
        )
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary px-5 py-2.5 text-sm font-semibold"
          {...(editable ? { onClick: () => handleCtaClick("ctaPrimary.href", primary.href) } : {})}
        >
          {renderText("span", "font-semibold", primary.label, "ctaPrimary.label")}
        </button>
        <button
          type="button"
          className="btn-secondary px-5 py-2.5 text-sm font-semibold"
          {...(editable
            ? { onClick: () => handleCtaClick("ctaSecondary.href", secondary.href) }
            : {})}
        >
          {renderText("span", "font-semibold", secondary.label, "ctaSecondary.label")}
        </button>
      </div>
      {bullets.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          {bullets.map((item, index) => (
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
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-primary/60 px-3 py-1 text-xs font-semibold text-[#F8FAFC]">
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
                "max-w-xl text-base text-muted",
                props.subheadline,
                "subheadline"
              )
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary px-5 py-2.5 text-sm font-semibold"
                {...(editable
                  ? { onClick: () => handleCtaClick("ctaPrimary.href", primary.href) }
                  : {})}
              >
                {renderText("span", "font-semibold", primary.label, "ctaPrimary.label")}
              </button>
              <button
                type="button"
                className="btn-secondary px-5 py-2.5 text-sm font-semibold"
                {...(editable
                  ? { onClick: () => handleCtaClick("ctaSecondary.href", secondary.href) }
                  : {})}
              >
                {renderText("span", "font-semibold", secondary.label, "ctaSecondary.label")}
              </button>
            </div>
            {bullets.length > 0 && (
              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {bullets.map((item, index) => (
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
              <span className="btn-secondary rounded-full px-3 py-1 text-xs font-semibold">
                Change background
              </span>
            </ClickUpload>
          </div>
        )}
      </section>
    );
  }

  if (isCard) {
    return (
      <section className="relative overflow-hidden rounded-[28px] bg-primary border border-border">
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
        <div className="relative z-10 max-w-xl rounded-[24px] border border-border bg-primary p-8">
          {TextBlock}
        </div>
      </section>
    );
  }

  if (isMetrics) {
    const products =
      props.products && props.products.length > 0
        ? props.products
        : gallery.map((item, index) => ({
            name: `Product ${index + 1}`,
            price: "",
            imageUrl: item.src,
            href: `/products/${index + 1}`,
          }));

    return (
      <section className="space-y-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            {renderText(
              "h2",
              "text-4xl font-semibold tracking-tight text-[#F8FAFC]",
              props.headline,
              "headline"
            )}
            {props.subheadline && (
              renderText(
                "p",
                "max-w-xl text-base text-muted",
                props.subheadline,
                "subheadline"
              )
            )}
            <button
              type="button"
              className="btn-primary px-5 py-2.5 text-sm font-semibold"
              {...(editable
                ? { onClick: () => handleCtaClick("ctaPrimary.href", primary.href) }
                : {})}
            >
              {renderText("span", "font-semibold", primary.label, "ctaPrimary.label")}
            </button>
          </div>
          <div className="space-y-6">
            {stats.map((stat, index) => (
              <div key={index} className="border-b border-border pb-4">
                {renderText(
                  "p",
                  "text-xs uppercase tracking-[0.3em] text-muted",
                  stat.label,
                  `stats.${index}.label`
                )}
                {renderText(
                  "p",
                  "text-2xl font-semibold text-[#F8FAFC]",
                  stat.value,
                  `stats.${index}.value`
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={`grid gap-6 ${products.length === 1 ? "md:grid-cols-1" : products.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {products.map((product, index) => (
            <div key={index} className="overflow-hidden rounded-[20px] border border-border bg-primary">
              <div className="aspect-[4/3] overflow-hidden">
                {editable && onImageUpload ? (
                  <ClickUpload onUpload={(file) => onImageUpload(`products.${index}.imageUrl`, file, "images")}>
                    <img
                      src={product.imageUrl || "/placeholders/scene-2.svg"}
                      alt={product.name || `product ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </ClickUpload>
                ) : (
                  <img
                    src={product.imageUrl || "/placeholders/scene-2.svg"}
                    alt={product.name || `product ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="space-y-3 p-4">
                {renderText(
                  "p",
                  "text-lg font-semibold text-[#F8FAFC]",
                  product.name || `Product ${index + 1}`,
                  `products.${index}.name`
                )}
                {renderText(
                  "p",
                  "text-base font-medium text-muted",
                  product.price || "",
                  `products.${index}.price`
                )}
                {editable ? (
                  <button
                    type="button"
                    className="btn-primary rounded-[14px] px-4 py-2 text-sm font-semibold"
                    onClick={() =>
                      handleCtaClick(
                        `products.${index}.href`,
                        product.href || `/products/${index + 1}`
                      )
                    }
                  >
                    View Details
                  </button>
                ) : (
                  <Link
                    href={product.href || `/products/${index + 1}`}
                    className="btn-primary inline-flex rounded-[14px] px-4 py-2 text-sm font-semibold"
                  >
                    View Details
                  </Link>
                )}
              </div>
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
