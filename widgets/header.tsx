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
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Header({ variant, props, editable, onEdit }: HeaderProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const renderNavItem = (item: { label: string; href: string }) => {
    if (editable) {
      return (
        <span key={item.href} className="max-w-[140px] truncate text-sm text-slate-600">
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

  return (
    <header className="py-6 px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
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
              className="font-semibold text-lg tracking-tight"
              value={props.brand}
              onChange={(value) => onEdit("brand", value)}
              responsiveStyle={styleFor("brand")}
            />
          ) : (
            <span className="font-semibold text-lg tracking-tight">{props.brand}</span>
          )}
        </div>
        <nav className="hidden max-w-[60%] flex-wrap items-center gap-4 text-sm text-slate-600 md:flex">
          {props.nav.map(renderNavItem)}
        </nav>
        {editable ? (
          <button className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow">
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
          </button>
        ) : (
          <Link
            href={props.cta.href}
            className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow"
          >
            {props.cta.label}
          </Link>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-500 md:hidden">
        {props.nav.map(renderNavItem)}
      </div>
    </header>
  );
}
