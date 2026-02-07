import Link from "next/link";
import { Theme } from "@/lib/schema";

type HeaderProps = {
  variant: string;
  props: {
    brand: string;
    nav: { label: string; href: string }[];
    cta: { label: string; href: string };
    logo?: string;
  };
  theme: Theme;
};

export default function Header({ variant, props }: HeaderProps) {
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
          <span className="font-semibold text-lg tracking-tight">{props.brand}</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {props.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={props.cta.href}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow"
        >
          {props.cta.label}
        </Link>
      </div>
      {variant === "centered" && (
        <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500 md:hidden">
          {props.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
