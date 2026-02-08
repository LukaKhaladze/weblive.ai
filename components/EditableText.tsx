"use client";

import { useEffect, useRef } from "react";

type EditableTextProps = {
  value: string;
  onChange: (value: string) => void;
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  responsiveStyle?: {
    desktop?: Record<string, number | string | undefined>;
    tablet?: Record<string, number | string | undefined>;
    mobile?: Record<string, number | string | undefined>;
  };
};

export default function EditableText({
  value,
  onChange,
  as = "p",
  className,
  placeholder,
  style,
  responsiveStyle
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerText !== value) {
      ref.current.innerText = value || "";
    }
  }, [value]);

  const Component = as as React.ElementType;

  const vars: React.CSSProperties = {
    ...(style || {}),
    ...(responsiveStyle?.desktop?.color ? { ["--text-color-d" as any]: responsiveStyle.desktop.color } : {}),
    ...(responsiveStyle?.tablet?.color ? { ["--text-color-t" as any]: responsiveStyle.tablet.color } : {}),
    ...(responsiveStyle?.mobile?.color ? { ["--text-color-m" as any]: responsiveStyle.mobile.color } : {}),
    ...(responsiveStyle?.desktop?.fontSize ? { ["--font-size-d" as any]: `${responsiveStyle.desktop.fontSize}px` } : {}),
    ...(responsiveStyle?.tablet?.fontSize ? { ["--font-size-t" as any]: `${responsiveStyle.tablet.fontSize}px` } : {}),
    ...(responsiveStyle?.mobile?.fontSize ? { ["--font-size-m" as any]: `${responsiveStyle.mobile.fontSize}px` } : {}),
    ...(responsiveStyle?.desktop?.marginTop ? { ["--mt-d" as any]: `${responsiveStyle.desktop.marginTop}px` } : {}),
    ...(responsiveStyle?.tablet?.marginTop ? { ["--mt-t" as any]: `${responsiveStyle.tablet.marginTop}px` } : {}),
    ...(responsiveStyle?.mobile?.marginTop ? { ["--mt-m" as any]: `${responsiveStyle.mobile.marginTop}px` } : {}),
    ...(responsiveStyle?.desktop?.marginBottom ? { ["--mb-d" as any]: `${responsiveStyle.desktop.marginBottom}px` } : {}),
    ...(responsiveStyle?.tablet?.marginBottom ? { ["--mb-t" as any]: `${responsiveStyle.tablet.marginBottom}px` } : {}),
    ...(responsiveStyle?.mobile?.marginBottom ? { ["--mb-m" as any]: `${responsiveStyle.mobile.marginBottom}px` } : {}),
    ...(responsiveStyle?.desktop?.paddingTop ? { ["--pt-d" as any]: `${responsiveStyle.desktop.paddingTop}px` } : {}),
    ...(responsiveStyle?.tablet?.paddingTop ? { ["--pt-t" as any]: `${responsiveStyle.tablet.paddingTop}px` } : {}),
    ...(responsiveStyle?.mobile?.paddingTop ? { ["--pt-m" as any]: `${responsiveStyle.mobile.paddingTop}px` } : {}),
    ...(responsiveStyle?.desktop?.paddingBottom ? { ["--pb-d" as any]: `${responsiveStyle.desktop.paddingBottom}px` } : {}),
    ...(responsiveStyle?.tablet?.paddingBottom ? { ["--pb-t" as any]: `${responsiveStyle.tablet.paddingBottom}px` } : {}),
    ...(responsiveStyle?.mobile?.paddingBottom ? { ["--pb-m" as any]: `${responsiveStyle.mobile.paddingBottom}px` } : {}),
  };

  return (
    <Component
      ref={ref as unknown as React.RefObject<HTMLElement>}
      contentEditable
      suppressContentEditableWarning
      className={`weblive-text ${className || ""}`}
      style={vars}
      data-placeholder={placeholder}
      onInput={(event: React.FormEvent<HTMLElement>) =>
        onChange((event.currentTarget as HTMLElement).innerText)
      }
      onBlur={(event: React.FocusEvent<HTMLElement>) =>
        onChange(event.currentTarget.innerText.trim())
      }
    />
  );
}
