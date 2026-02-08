import Link from "next/link";
import { Theme } from "@/lib/schema";
import EditableText from "@/components/EditableText";

type FooterProps = {
  variant: string;
  props: {
    brand: string;
    tagline: string;
    links: { label: string; href: string }[];
    social: { label: string; href: string }[];
  };
  theme: Theme;
  editable?: boolean;
  onEdit?: (path: string, value: any) => void;
};

export default function Footer({ variant, props, editable, onEdit }: FooterProps) {
  const textStyles = (props as any)._textStyles || {};
  const styleFor = (path: string) => textStyles[path];
  const minimal = variant === "minimal";
  return (
    <footer className="px-6 py-12">
      <div
        className={`mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-slate-50 px-8 py-8 ${
          minimal ? "text-center" : ""
        }`}
      >
        <div className={`flex flex-col gap-6 ${minimal ? "items-center" : "md:flex-row md:justify-between"}`}>
          <div>
            {editable && onEdit ? (
              <EditableText
                as="h3"
                className="text-lg font-semibold text-slate-900"
                value={props.brand}
                onChange={(value) => onEdit("brand", value)}
                responsiveStyle={styleFor("brand")}
              />
            ) : (
              <h3 className="text-lg font-semibold text-slate-900">{props.brand}</h3>
            )}
            {editable && onEdit ? (
              <EditableText
                as="p"
                className="mt-2 text-sm text-slate-600"
                value={props.tagline}
                onChange={(value) => onEdit("tagline", value)}
                responsiveStyle={styleFor("tagline")}
              />
            ) : (
              <p className="mt-2 text-sm text-slate-600">{props.tagline}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            {props.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            {props.social.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-400">გენერირებულია Weblive.ai-ის მიერ</p>
      </div>
    </footer>
  );
}
