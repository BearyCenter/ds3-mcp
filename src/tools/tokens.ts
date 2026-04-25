import { z } from "zod";
import tokensData from "../data/tokens.json" with { type: "json" };

export const getDesignTokensSchema = z.object({
  category: z
    .enum(["fontSize", "fontFamily", "fontWeight", "spacing", "radius", "semantic", "all"])
    .optional()
    .default("all")
    .describe("category ของ token ที่ต้องการดู"),
});

export function getDesignTokens(input: z.infer<typeof getDesignTokensSchema>) {
  const { category = "all" } = input;

  if (category === "all") {
    return {
      version: tokensData.version,
      tokens: tokensData,
    };
  }

  return {
    version: tokensData.version,
    category,
    tokens: tokensData[category as keyof typeof tokensData],
  };
}
