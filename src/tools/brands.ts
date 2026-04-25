import { z } from "zod";
import brandsData from "../data/brands.json" with { type: "json" };
import tokensData from "../data/tokens.json" with { type: "json" };

export const getColorPaletteSchema = z.object({
  brand: z
    .enum(["patona", "ccs3", "oc2plus", "all"])
    .optional()
    .default("all")
    .describe("brand id"),
});

export function getColorPalette(input: z.infer<typeof getColorPaletteSchema>) {
  const { brand = "all" } = input;
  if (brand === "all") {
    return {
      version: brandsData.version,
      brands: brandsData.brands.map((b) => ({
        id: b.id,
        name: b.name,
        primaryColor: b.primaryColor,
        primaryHex: b.primaryHex,
      })),
    };
  }
  const found = brandsData.brands.find((b) => b.id === brand);
  if (!found) return { error: `Brand '${brand}' not found` };
  return found;
}

export const getBrandRulesSchema = z.object({
  brand: z
    .enum(["patona", "ccs3", "oc2plus"])
    .describe("brand id ที่ต้องการดู guidelines"),
});

export function getBrandRules(input: z.infer<typeof getBrandRulesSchema>) {
  const found = brandsData.brands.find((b) => b.id === input.brand);
  if (!found) return { error: `Brand '${input.brand}' not found` };
  return {
    brand: found.id,
    name: found.name,
    useCase: found.useCase,
    guidelines: found.guidelines,
    usage: brandsData.usage,
  };
}

export const getTokenValueSchema = z.object({
  token: z
    .string()
    .describe("token name e.g. '--ssk-font-size-md', 'font-size.md', '--bg-primary'"),
});

export function getTokenValue(input: z.infer<typeof getTokenValueSchema>) {
  const raw = input.token.replace(/^--ssk-/, "").replace(/^--/, "");
  const parts = raw.split(/[-.]/);

  // Try direct path: e.g. fontSize.md
  if (parts.length >= 2) {
    const category = parts[0] === "font" && parts[1] === "size"
      ? "fontSize"
      : parts[0] === "font" && parts[1] === "family"
        ? "fontFamily"
        : parts[0] === "font" && parts[1] === "weight"
          ? "fontWeight"
          : parts[0];
    const key = parts[0] === "font" ? parts.slice(2).join("-") : parts.slice(1).join("-");

    const cat = (tokensData as any)[category];
    if (cat && key in cat) {
      return {
        token: input.token,
        category,
        key,
        value: cat[key],
      };
    }
  }

  // Try semantic tokens (e.g. --bg-primary, --text-primary)
  for (const [groupName, group] of Object.entries(tokensData.semantic)) {
    const fullKey = `--${raw}`;
    if (fullKey in (group as Record<string, string>)) {
      return {
        token: input.token,
        category: "semantic",
        group: groupName,
        key: fullKey,
        description: (group as Record<string, string>)[fullKey],
      };
    }
  }

  return {
    error: `Token '${input.token}' not found. Use get_design_tokens to see available tokens.`,
  };
}
