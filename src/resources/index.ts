import { URL } from "node:url";
import componentsData from "../data/components.json" with { type: "json" };
import tokensData from "../data/tokens.json" with { type: "json" };
import brandsData from "../data/brands.json" with { type: "json" };

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export function listResources(): Resource[] {
  const resources: Resource[] = [];

  // Component docs
  for (const c of componentsData.components) {
    resources.push({
      uri: `ds3://components/${c.tag}`,
      name: `Component: ${c.tag}`,
      description: `${c.category} — ${c.className}`,
      mimeType: "text/markdown",
    });
  }

  // Token categories
  for (const cat of ["fontSize", "fontFamily", "fontWeight", "spacing", "radius", "semantic"]) {
    resources.push({
      uri: `ds3://tokens/${cat}`,
      name: `Tokens: ${cat}`,
      description: `DS 3.0 ${cat} tokens`,
      mimeType: "text/markdown",
    });
  }

  // Brands
  for (const b of brandsData.brands) {
    resources.push({
      uri: `ds3://brands/${b.id}`,
      name: `Brand: ${b.name}`,
      description: b.useCase,
      mimeType: "text/markdown",
    });
  }

  // Master index
  resources.push({
    uri: "ds3://overview",
    name: "DS 3.0 Overview",
    description: "Complete reference for DS 3.0 — components, tokens, brands",
    mimeType: "text/markdown",
  });

  return resources;
}

export function readResource(uri: string): { contents: { uri: string; mimeType: string; text: string }[] } {
  const url = new URL(uri);
  const segments = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const host = url.host;

  let text = "";

  if (host === "components") {
    const tag = segments[0];
    const c = componentsData.components.find((x) => x.tag === tag);
    if (!c) text = `# Not Found\n\nComponent '${tag}' not found in DS 3.0`;
    else {
      text = `# ${c.tag}\n\n**Class:** ${c.className}\n**Category:** ${c.category}\n\n${c.description || ""}\n\n## Props\n\n| Name | Type | Default | Optional |\n|------|------|---------|----------|\n${
        c.props.map((p) => `| \`${p.name}\` | \`${p.type}\` | ${(p as { default?: string }).default ?? "—"} | ${p.optional ? "yes" : "no"} |`).join("\n")
      }\n`;
    }
  } else if (host === "tokens") {
    const cat = segments[0];
    const data = (tokensData as Record<string, unknown>)[cat];
    if (!data) text = `# Not Found\n\nToken category '${cat}' not found`;
    else text = `# ${cat} tokens\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  } else if (host === "brands") {
    const id = segments[0];
    const b = brandsData.brands.find((x) => x.id === id);
    if (!b) text = `# Not Found\n\nBrand '${id}' not found`;
    else
      text = `# ${b.name}\n\n**Primary color:** ${b.primaryColor} (${b.primaryHex})\n\n## Use Case\n${b.useCase}\n\n## Guidelines\n${b.guidelines.map((g) => `- ${g}`).join("\n")}`;
  } else if (host === "overview") {
    text = `# Sellsuki Design System 3.0 — Overview\n\n**Library:** \`@uxuissk/design-system-core@${componentsData.version}\`\n\n## Total ${componentsData.total} components\n\n## Brands: ${brandsData.brands.map((b) => b.id).join(", ")}\n\n## Categories\n${Array.from(new Set(componentsData.components.map((c) => c.category))).map((c) => `- ${c}`).join("\n")}\n\n## Quick start\nWrap your app with \`<ssk-theme-provider brand="ccs3">\` and use \`ssk-*\` components.`;
  } else {
    text = `# Unknown resource\n\nURI: ${uri}`;
  }

  return {
    contents: [{ uri, mimeType: "text/markdown", text }],
  };
}
