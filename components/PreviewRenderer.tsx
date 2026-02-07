import { Site } from "@/lib/schema";
import { renderWidget, WidgetType } from "@/widgets/registry";

export default function PreviewRenderer({ site }: { site: Site }) {
  return (
    <div
      className="rounded-[32px] border border-slate-200 bg-white"
      style={{
        "--primary": site.theme.primaryColor,
        "--secondary": site.theme.secondaryColor,
        "--radius": `${site.theme.radius}px`,
      } as React.CSSProperties}
    >
      {site.pages[0]?.sections.map((section) => (
        <div key={section.id}>
          {renderWidget(section.widget as WidgetType, section.variant, section.props, site.theme)}
        </div>
      ))}
    </div>
  );
}
