import type { IncomingMessage, ServerResponse } from "node:http";
import { getColorPalette, getBrandRules } from "../../src/tools/brands.js";

export const config = { runtime: "nodejs" };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url ?? "/", "http://localhost");
  const brand = url.searchParams.get("brand") as "patona" | "ccs3" | "oc2plus" | "all" | null;
  const mode = url.searchParams.get("mode"); // 'palette' | 'rules'

  if (mode === "rules" && brand && brand !== "all") {
    const result = getBrandRules({ brand });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
    return;
  }

  const result = getColorPalette({ brand: brand ?? "all" });
  res.statusCode = 200;
  res.end(JSON.stringify(result));
}
