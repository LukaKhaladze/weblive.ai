import { Site } from "@/lib/schema";
import { renderWidget, WidgetType } from "@/widgets/registry";

export default function PreviewRenderer({
  site,
  pageId,
}: {
  site: Site;
  pageId?: string;
}) {
  const page = pageId ? site.pages.find((p) => p.id === pageId) : site.pages[0];
  if (!page) return null;
  return (
    <div
      className="w-full max-w-full rounded-[32px] border border-slate-200 bg-white"
      style={{
        "--primary": site.theme.primaryColor,
        "--secondary": site.theme.secondaryColor,
        "--radius": `${site.theme.radius}px`,
      } as React.CSSProperties}
    >
      {page.sections.map((section) => (
        <div key={section.id}>
          {renderWidget(
            section.widget as WidgetType,
            section.variant,
            section.props,
            site.theme
          )}
        </div>
      ))}
    </div>
  );
}
