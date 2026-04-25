/**
 * Vercel Serverless function — Streamable HTTP MCP endpoint
 * URL: https://ds3-mcp.vercel.app/api/mcp
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "../src/server.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS for browser-based MCP clients
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // GET → simple health/info
  if (req.method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: "ok",
        server: "ds3-mcp",
        version: "1.0.0",
        transport: "streamable-http",
        capabilities: ["tools", "resources", "prompts"],
        documentation: "https://github.com/BearyCenter/ds3-mcp",
      }),
    );
    return;
  }

  // Stateless mode — new transport per request
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  });

  const server = createServer();
  await server.connect(transport);

  // Read body
  let body: unknown = undefined;
  if (req.method === "POST") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const raw = Buffer.concat(chunks).toString("utf-8");
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }
    }
  }

  await transport.handleRequest(req, res, body);
}
