import type { IncomingMessage, ServerResponse } from "node:http";
import { generateForm, generatePageLayout } from "../../src/tools/generate.js";


export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed — use POST" }));
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  let body: { type?: string; [key: string]: unknown };
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  try {
    if (body.type === "form") {
      const result = generateForm(body as never);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
    } else if (body.type === "page") {
      const result = generatePageLayout(body as never);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
    } else {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "type must be 'form' or 'page'" }));
    }
  } catch (err) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }));
  }
}
