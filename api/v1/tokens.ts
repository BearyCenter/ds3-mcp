import type { IncomingMessage, ServerResponse } from "node:http";
import { getDesignTokens } from "../../src/tools/tokens.js";
import { getTokenValue } from "../../src/tools/brands.js";


export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url ?? "/", "http://localhost");
  const token = url.searchParams.get("token");
  const category = url.searchParams.get("category") as
    | "fontSize"
    | "fontFamily"
    | "fontWeight"
    | "spacing"
    | "radius"
    | "semantic"
    | "all"
    | null;

  if (token) {
    const result = getTokenValue({ token });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
    return;
  }

  const result = getDesignTokens({ category: category ?? "all" });
  res.statusCode = 200;
  res.end(JSON.stringify(result));
}
