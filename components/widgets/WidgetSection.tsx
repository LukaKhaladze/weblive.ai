import type React from "react";
import { WidgetInstance } from "@/lib/types";
import { WIDGET_COMPONENTS } from "@/components/widgets/WidgetTemplates";

type WidgetSectionProps = {
  widget: WidgetInstance;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoDataUrl?: string;
  };
  onUpdate: (next: WidgetInstance) => void;
};

export default function WidgetSection({ widget, theme, onUpdate }: WidgetSectionProps) {
  const Component =
    (WIDGET_COMPONENTS as Record<string, Record<string, React.ComponentType<any>>>)[
      widget.widgetType
    ]?.[widget.variant];

  if (!Component) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/60">
        Unsupported widget: {widget.widgetType} / {widget.variant}
      </div>
    );
  }

  return (
    <Component
      props={widget.props}
      theme={theme}
      onPropChange={(key: string, value: unknown) =>
        onUpdate({ ...widget, props: { ...widget.props, [key]: value } })
      }
    />
  );
}
