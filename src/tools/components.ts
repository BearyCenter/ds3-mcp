import { z } from "zod";
import componentsData from "../data/components.json" with { type: "json" };

const componentMap = new Map(
  componentsData.components.map((c) => [c.tag, c]),
);

export const listComponentsSchema = z.object({
  category: z.string().optional().describe("กรองตาม category เช่น 'Form & Input'"),
});

export function listComponents(input: z.infer<typeof listComponentsSchema>) {
  const filtered = input.category
    ? componentsData.components.filter((c) => c.category === input.category)
    : componentsData.components;

  return {
    version: componentsData.version,
    total: filtered.length,
    components: filtered.map((c) => ({
      tag: c.tag,
      category: c.category,
      description: c.description,
    })),
  };
}

export const getComponentSchema = z.object({
  tag: z.string().describe("ชื่อ tag เช่น 'ssk-button'"),
});

export function getComponent(input: z.infer<typeof getComponentSchema>) {
  const component = componentMap.get(input.tag);
  if (!component) {
    return {
      error: `Component '${input.tag}' not found. Use list_components to see available components.`,
      available: Array.from(componentMap.keys()),
    };
  }
  return component;
}
