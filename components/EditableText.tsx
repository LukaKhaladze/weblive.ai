"use client";

import { useEffect, useRef } from "react";

type EditableTextProps = {
  value: string;
  onChange: (value: string) => void;
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
};

export default function EditableText({
  value,
  onChange,
  as = "p",
  className,
  placeholder,
  style
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerText !== value) {
      ref.current.innerText = value || "";
    }
  }, [value]);

  const Component = as as React.ElementType;

  return (
    <Component
      ref={ref as unknown as React.RefObject<HTMLElement>}
      contentEditable
      suppressContentEditableWarning
      className={className}
      style={style}
      data-placeholder={placeholder}
      onBlur={(event: React.FocusEvent<HTMLElement>) =>
        onChange(event.currentTarget.innerText.trim())
      }
    />
  );
}
