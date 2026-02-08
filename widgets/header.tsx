import Link from "next/link";
import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";
import ClickUpload from "@/components/ClickUpload";

type HeaderProps = {
  variant: string;
  props: {
    brand: string;
    nav: { label: string; href: string }[];
    cta: { label: string; href: string };
    logo?: string;
    tagline?: string;
    announcement?: string;
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
  onImageUpload?: (path: string, file: File, kind?: "logo" | "images") => void;
};

export default function Header({ variant, props, editable, onEdit, onImageUpload }: HeaderProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const isDark = variant === "v7-dark";
  const isTransparent = variant === "v8-transparent";
  const isGlass = variant === "v6-glass";
  const isBordered = variant === "v9-bordered";
  const isCenteredLogo = variant === "v3-centered-logo";
  const isClassic = variant === "v1-classic";
  const isCompact = variant === "v2-compact-right";
  const isSplitTagline = variant === "v4-split-tagline";
  const isAnnouncement = variant === "v10-announcement";

  const baseText = isDark || isTransparent ? "text-white" : "text-neutral-900";
  const mutedText = isDark || isTransparent ? "text-white/70" : "text-neutral-700";

  const frameClasses = [
    "rounded-[18px] shadow-none",
    isTransparent ? "bg-transparent" : "bg-white",
    isDark ? "bg-neutral-900" : "",
    isGlass ? "bg-white/70 backdrop-blur-md" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = [
    "mx-auto flex w-full items-center justify-between gap-6 px-6",
    isCenteredLogo ? "py-4" : "h-20",
    variant === "v5-minimal" ? "h-16" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const renderNavItem = (item: { label: string; href: string }, index: number) => {
    if (editable) {
      return (
        <span key={`${item.href}-${index}`} className={`max-w-[140px] truncate text-sm ${mutedText}`}>
          {onEdit ? (
            <EditableText
              as="span"
              className="font-medium"
              value={item.label}
              onChange={(value) => onEdit(`nav.${index}.label`, value)}
              responsiveStyle={styleFor(`nav.${index}.label`)}
            />
          ) : (
            item.label
          )}
        </span>
      );
    }
    return (
      <Link key={item.href} href={item.href}>
        <span className="max-w-[140px] truncate">{item.label}</span>
      </Link>
    );
  };

  const logoSrc = (props.logo || "").trim();
  const LogoBlock = (
    <div className="flex items-center gap-3">
      {editable && onImageUpload ? (
        <ClickUpload onUpload={(file) => onImageUpload("logo", file, "logo")}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${props.brand} logo`}
              className="h-10 w-10 rounded-xl object-contain"
            />
          ) : (
            <EditableText
              as="span"
              className={`font-semibold text-lg tracking-tight ${baseText}`}
              value={props.brand}
              onChange={(value) => onEdit?.("brand", value)}
              responsiveStyle={styleFor("brand")}
            />
          )}
        </ClickUpload>
      ) : logoSrc ? (
        <img
          src={logoSrc}
          alt={`${props.brand} logo`}
          className="h-10 w-10 rounded-xl object-contain"
        />
      ) : (
        <span className={`font-semibold text-lg tracking-tight ${baseText}`}>{props.brand}</span>
      )}
    </div>
  );

  const ctaLabel = props.cta?.label || "დაწყება";
  const ctaHref = props.cta?.href || "#contact";
  const CtaButton = (
    <Link
      href={ctaHref}
      className={`px-6 py-2.5 text-sm font-semibold shadow ${
        isBordered
          ? "rounded-lg border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
          : isTransparent
          ? "rounded-lg border-2 border-white text-white hover:bg-white hover:text-neutral-900"
          : isDark
          ? "rounded-lg bg-white text-neutral-900 hover:bg-neutral-100"
          : isCompact
          ? "rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
          : "rounded-lg bg-[color:var(--primary)] text-white hover:opacity-90"
      }`}
    >
      {editable && onEdit ? (
        <EditableText
          as="span"
          className="font-semibold"
          value={ctaLabel}
          onChange={(value) => onEdit("cta.label", value)}
          responsiveStyle={styleFor("cta.label")}
        />
      ) : (
        ctaLabel
      )}
    </Link>
  );

  return (
    <header className="px-6 py-6">
      {isAnnouncement && props.announcement && (
        <div className="mx-auto mb-3 max-w-6xl rounded-full bg-[color:var(--primary)] px-4 py-2 text-center text-xs font-semibold text-white">
          {props.announcement}
        </div>
      )}

      <div className={`mx-auto max-w-6xl ${frameClasses}`}>
        {isCenteredLogo ? (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              {LogoBlock}
              <div className="flex-1 flex justify-end">{CtaButton}</div>
            </div>
            <nav className={`mt-4 flex flex-wrap items-center justify-center gap-6 pb-2 text-xs ${mutedText} md:text-sm`}>
              {props.nav.map((item, index) => renderNavItem(item, index))}
            </nav>
          </div>
        ) : (
          <div className={containerClasses}>
            {isSplitTagline ? (
              <div className="flex flex-col">
                {LogoBlock}
                {props.tagline && (
                  <span className={`mt-1 text-xs ${mutedText}`}>{props.tagline}</span>
                )}
              </div>
            ) : (
              LogoBlock
            )}

            <nav className={`flex flex-wrap items-center justify-center gap-6 text-xs ${mutedText} md:text-sm`}>
              {props.nav.map((item, index) => renderNavItem(item, index))}
            </nav>

            {CtaButton}
          </div>
        )}
      </div>
    </header>
  );
}
