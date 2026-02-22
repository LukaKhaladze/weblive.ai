import type { CSSProperties } from "react";
import type { Theme } from "@/lib/schema";
import { resolveDesignKit } from "@/schemas/designKits";

export function getThemeCssVars(theme: Theme): CSSProperties {
  const kit = resolveDesignKit(theme.designKit);
  const primary = theme.primaryColor || kit.tokens.primary;
  const secondary = theme.secondaryColor || kit.tokens.secondary;

  return {
    "--wf-bg": kit.tokens.bg,
    "--wf-surface": kit.tokens.surface,
    "--wf-text": kit.tokens.text,
    "--wf-muted": kit.tokens.muted,
    "--wf-border": kit.tokens.border,
    "--wf-primary": primary,
    "--wf-primary-text": kit.tokens.primaryText,
    "--wf-secondary": secondary,
    "--wf-radius": `${theme.radius || kit.tokens.radius}px`,
    "--wf-font-body": theme.fontFamily || kit.typography.fontBody,
    "--wf-font-display": kit.typography.fontDisplay,
    "--primary": primary,
    "--secondary": secondary,
    "--radius": `${theme.radius || kit.tokens.radius}px`,
  } as CSSProperties;
}
