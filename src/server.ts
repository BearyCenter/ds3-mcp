#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  listComponents,
  listComponentsSchema,
  getComponent,
  getComponentSchema,
} from "./tools/components.js";
import {
  getDesignTokens,
  getDesignTokensSchema,
} from "./tools/tokens.js";

const server = new Server(
  {
    name: "ds3-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const tools = [
  {
    name: "list_components",
    description:
      "List Sellsuki Design System 3.0 components (ssk-* Lit Web Components). Optionally filter by category.",
    inputSchema: zodToJsonSchema(listComponentsSchema) as object,
    handler: listComponents,
  },
  {
    name: "get_component",
    description:
      "Get detailed information about a specific DS 3.0 component — props, slots, events, examples.",
    inputSchema: zodToJsonSchema(getComponentSchema) as object,
    handler: getComponent,
  },
  {
    name: "get_design_tokens",
    description:
      "Get DS 3.0 design tokens — font-size, spacing, radius, semantic tokens, etc.",
    inputSchema: zodToJsonSchema(getDesignTokensSchema) as object,
    handler: getDesignTokens,
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ handler, ...tool }) => tool),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Tool '${request.params.name}' not found`);
  }
  const result = await tool.handler(request.params.arguments as never);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[ds3-mcp] Server running on stdio");
