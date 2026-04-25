import type { IncomingMessage, ServerResponse } from "node:http";

export const config = { runtime: "nodejs" };

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Sellsuki Design System 3.0 — REST API",
    description: "Public REST API for AI agents to query DS 3.0 components, tokens, brands, and generate code. Mirrors the MCP server functionality.",
    version: "1.0.0",
  },
  servers: [{ url: "https://ds3-mcp.vercel.app" }],
  paths: {
    "/api/v1/components": {
      get: {
        operationId: "listComponents",
        summary: "List DS 3.0 components",
        parameters: [
          { name: "tag", in: "query", schema: { type: "string" }, description: "Specific component tag to fetch" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category" },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/tokens": {
      get: {
        operationId: "getTokens",
        summary: "Get design tokens or token value",
        parameters: [
          { name: "category", in: "query", schema: { type: "string", enum: ["fontSize", "fontFamily", "fontWeight", "spacing", "radius", "semantic", "all"] } },
          { name: "token", in: "query", schema: { type: "string" }, description: "Specific token to lookup, e.g. '--ssk-font-size-md'" },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/brands": {
      get: {
        operationId: "getBrands",
        summary: "Get brand info — palette or rules",
        parameters: [
          { name: "brand", in: "query", schema: { type: "string", enum: ["patona", "ccs3", "oc2plus", "all"] } },
          { name: "mode", in: "query", schema: { type: "string", enum: ["palette", "rules"] }, description: "What to return" },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/generate": {
      post: {
        operationId: "generate",
        summary: "Generate ssk-* code (form or page layout)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    type: "object",
                    required: ["type", "fields"],
                    properties: {
                      type: { type: "string", const: "form" },
                      brand: { type: "string", enum: ["patona", "ccs3", "oc2plus"] },
                      fields: {
                        type: "array",
                        items: {
                          type: "object",
                          required: ["name"],
                          properties: {
                            name: { type: "string" },
                            label: { type: "string" },
                            type: { type: "string", enum: ["text", "email", "password", "number", "textarea", "checkbox", "radio", "dropdown", "date"] },
                            required: { type: "boolean" },
                            placeholder: { type: "string" },
                          },
                        },
                      },
                      submitLabel: { type: "string" },
                      title: { type: "string" },
                    },
                  },
                  {
                    type: "object",
                    required: ["type", "pageType", "title"],
                    properties: {
                      type: { type: "string", const: "page" },
                      brand: { type: "string", enum: ["patona", "ccs3", "oc2plus"] },
                      pageType: { type: "string", enum: ["dashboard", "list", "detail", "settings", "landing"] },
                      title: { type: "string" },
                      hasFilter: { type: "boolean" },
                      hasSidebar: { type: "boolean" },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: { "200": { description: "Generated code" } },
      },
    },
  },
};

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify(openapi, null, 2));
}
