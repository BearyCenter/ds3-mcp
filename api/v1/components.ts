import type { IncomingMessage, ServerResponse } from "node:http";
import { listComponents, getComponent } from "../../src/tools/components.js";


export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const url = new URL(req.url ?? "/", "http://localhost");
  const tag = url.searchParams.get("tag");
  const category = url.searchParams.get("category");

  if (tag) {
    const result = getComponent({ tag });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
    return;
  }

  const result = listComponents({ category: category ?? undefined });
  res.statusCode = 200;
  res.end(JSON.stringify(result));
}
