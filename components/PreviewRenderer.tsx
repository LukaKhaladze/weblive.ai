import { Site } from "@/lib/schema";
import { renderWidget, WidgetType } from "@/widgets/registry";
import { getThemeCssVars } from "@/lib/designKitTheme";

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
      className="w-full max-w-full"
      style={{
        ...getThemeCssVars(site.theme),
        background: "var(--wf-bg)",
        color: "var(--wf-text)",
      }}
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
