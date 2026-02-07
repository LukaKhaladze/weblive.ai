import { Blueprint, PageBlueprint } from "./types";

export function blueprintToMarkdown(blueprint: Blueprint) {
  const lines: string[] = [];
  lines.push(`# ${blueprint.site.businessName}`);
  lines.push("");
  lines.push(`Category: ${blueprint.site.category}`);
  lines.push(`City: ${blueprint.site.city}`);
  lines.push(`Tone: ${blueprint.site.tone}`);
  lines.push(`Language: ${blueprint.site.language}`);
  lines.push("");

  if (blueprint.recommendedPages?.length) {
    lines.push("## Recommended Pages");
    blueprint.recommendedPages.forEach((page) => lines.push(`- ${page}`));
    lines.push("");
  }

  lines.push("## SEO");
  lines.push(`Meta Title: ${blueprint.seo.metaTitle}`);
  lines.push(`Meta Description: ${blueprint.seo.metaDescription}`);
  lines.push(`Keywords: ${blueprint.seo.keywords.join(", ")}`);
  lines.push("");

  const page = blueprint.pages[0];
  lines.push(`## Page: ${page.title}`);
  lines.push("");
  lines.push("### Design");
  lines.push(`Visual style: ${page.design.visualStyle}`);
  lines.push(`Layout notes: ${page.design.layoutNotes}`);
  lines.push(`Spacing: ${page.design.spacing}`);
  lines.push(`Palette: ${page.design.palette.join(", ")}`);
  lines.push(`Typography: ${page.design.typography.join(", ")}`);
  lines.push(`Imagery: ${page.design.imagery.join(", ")}`);
  lines.push(`Components: ${page.design.components.join(", ")}`);
  lines.push("");

  page.sections.forEach((section) => {
    lines.push(`### ${titleForType(section.type)}`);
    lines.push(`Heading: ${section.heading}`);
    lines.push(`Content: ${section.content}`);
    if (section.bullets.length) {
      lines.push("Bullets:");
      section.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    }
    lines.push(`CTA: ${section.cta.label} (${section.cta.href})`);
    lines.push("");
  });

  lines.push("## Theme");
  lines.push(`Style keywords: ${blueprint.theme.styleKeywords.join(", ")}`);
  lines.push(`Color suggestions: ${blueprint.theme.colorSuggestions.join(", ")}`);
  lines.push(`Font suggestions: ${blueprint.theme.fontSuggestions.join(", ")}`);

  return lines.join("\n");
}

export function pageBlueprintToMarkdown(blueprint: PageBlueprint) {
  const lines: string[] = [];
  lines.push(`# ${blueprint.page.title}`);
  lines.push("");
  lines.push(`Primary color: ${blueprint.theme.primaryColor}`);
  lines.push(`Secondary color: ${blueprint.theme.secondaryColor}`);
  lines.push("");

  blueprint.widgets.forEach((widget, index) => {
    lines.push(`## Widget ${index + 1}`);
    lines.push(`Type: ${widget.widgetType}`);
    lines.push(`Variant: ${widget.variant}`);
    lines.push("Props:");
    Object.entries(widget.props ?? {}).forEach(([key, value]) => {
      lines.push(`- ${key}: ${JSON.stringify(value)}`);
    });
    lines.push("");
  });

  return lines.join("\n");
}

function titleForType(type: string) {
  return type
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}
