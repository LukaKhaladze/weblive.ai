import Link from "next/link";
import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

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
};

export default function Header({ variant, props, editable, onEdit }: HeaderProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const isDark = variant === "v7-dark";
  const isTransparent = variant === "v8-transparent";
  const isGlass = variant === "v6-glass";
  const isBordered = variant === "v9-bordered";
  const isMinimal = variant === "v5-minimal";
  const isCenteredLogo = variant === "v3-centered-logo";
  const isClassic = variant === "v1-classic";
  const isCompact = variant === "v2-compact-right";
  const isSplitTagline = variant === "v4-split-tagline";
  const isAnnouncement = variant === "v10-announcement";

  const baseText = isDark || isTransparent ? "text-white" : "text-slate-900";
  const mutedText = isDark || isTransparent ? "text-white/70" : "text-slate-600";
  const wrapperClasses = [
    "relative px-6 py-5",
    isTransparent ? "bg-transparent" : "bg-white",
    isDark ? "bg-slate-950" : "",
    isGlass ? "bg-white/60 backdrop-blur border border-white/30" : "",
    isBordered ? "border border-slate-200" : "",
    "rounded-[22px]",
    "shadow-sm",
  ]
    .filter(Boolean)
    .join(" ");
  const renderNavItem = (item: { label: string; href: string }) => {
    if (editable) {
      return (
        <span key={item.href} className={`max-w-[140px] truncate text-sm ${mutedText}`}>
          {item.label}
        </span>
      );
    }
    return (
      <Link key={item.href} href={item.href}>
        <span className="max-w-[140px] truncate">{item.label}</span>
      </Link>
    );
  };

  const LogoBlock = (
    <div className="flex items-center gap-3">
      {props.logo ? (
        <img
          src={props.logo}
          alt={`${props.brand} logo`}
          className="h-10 w-10 rounded-xl object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-xl bg-[color:var(--primary)]/15" />
      )}
      {editable && onEdit ? (
        <EditableText
          as="span"
          className={`font-semibold text-lg tracking-tight ${baseText}`}
          value={props.brand}
          onChange={(value) => onEdit("brand", value)}
          responsiveStyle={styleFor("brand")}
        />
      ) : (
        <span className={`font-semibold text-lg tracking-tight ${baseText}`}>{props.brand}</span>
      )}
    </div>
  );

  const CtaButton = (
    <Link
      href={props.cta.href}
      className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
        isBordered || isTransparent
          ? "border border-white/50 text-white"
          : isDark
          ? "bg-white text-slate-900"
          : "bg-[color:var(--primary)] text-white"
      } ${isCompact ? "px-5" : ""}`}
    >
      {editable && onEdit ? (
        <EditableText
          as="span"
          className="font-semibold"
          value={props.cta.label}
          onChange={(value) => onEdit("cta.label", value)}
          responsiveStyle={styleFor("cta.label")}
        />
      ) : (
        props.cta.label
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

      <div className={`mx-auto max-w-6xl ${wrapperClasses}`}>
        <div
          className={`flex items-center gap-4 ${
            isCenteredLogo ? "justify-center" : "justify-between"
          }`}
        >
          {!isCenteredLogo && LogoBlock}

          {(isClassic || isBordered) && (
            <nav className={`hidden items-center gap-6 text-sm ${mutedText} md:flex`}>
              {props.nav.map(renderNavItem)}
            </nav>
          )}

          {isSplitTagline && (
            <div className="hidden flex-1 justify-center md:flex">
              <p className={`text-sm ${mutedText}`}>{props.tagline}</p>
            </div>
          )}

          {isCompact && (
            <nav className={`hidden items-center gap-4 text-sm ${mutedText} md:flex`}>
              {props.nav.map(renderNavItem)}
            </nav>
          )}

          {isCenteredLogo && (
            <>
              {LogoBlock}
              <nav className={`hidden items-center gap-6 text-sm ${mutedText} md:flex`}>
                {props.nav.map(renderNavItem)}
              </nav>
            </>
          )}

          {CtaButton}
        </div>

        {!isMinimal && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs md:hidden">
            {props.nav.map(renderNavItem)}
          </div>
        )}
      </div>
    </header>
  );
}
