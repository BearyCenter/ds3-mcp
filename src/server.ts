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
import {
  getColorPalette,
  getColorPaletteSchema,
  getBrandRules,
  getBrandRulesSchema,
  getTokenValue,
  getTokenValueSchema,
} from "./tools/brands.js";
import {
  suggestComponents,
  suggestComponentsSchema,
  validateUsage,
  validateUsageSchema,
  getQuickStart,
  getQuickStartSchema,
} from "./tools/helpers.js";

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
  {
    name: "get_color_palette",
    description:
      "Get color palette สำหรับแต่ละ brand (patona, ccs3, oc2plus). หรือ 'all' เพื่อดูทุก brand",
    inputSchema: zodToJsonSchema(getColorPaletteSchema) as object,
    handler: getColorPalette,
  },
  {
    name: "get_brand_rules",
    description:
      "Get usage guidelines + use case ของแต่ละ brand (patona, ccs3, oc2plus)",
    inputSchema: zodToJsonSchema(getBrandRulesSchema) as object,
    handler: getBrandRules,
  },
  {
    name: "get_token_value",
    description:
      "ดูค่าจริงของ token เช่น '--ssk-font-size-md' = 20px, 'spacing.lg' = 16px",
    inputSchema: zodToJsonSchema(getTokenValueSchema) as object,
    handler: getTokenValue,
  },
  {
    name: "suggest_components",
    description:
      "แนะนำ DS 3.0 component จาก use case ที่อธิบาย เช่น 'ผู้ใช้กรอกข้อมูล' → ssk-input, ssk-form...",
    inputSchema: zodToJsonSchema(suggestComponentsSchema) as object,
    handler: suggestComponents,
  },
  {
    name: "validate_usage",
    description:
      "ตรวจ HTML/JSX snippet ว่าใช้ ssk-* tags + props ถูกต้องไหม รายงาน issue ที่พบ",
    inputSchema: zodToJsonSchema(validateUsageSchema) as object,
    handler: validateUsage,
  },
  {
    name: "get_quick_start",
    description:
      "Setup guide สำหรับใช้ DS 3.0 ใน React/Vue/Vanilla รวม install, ssk-theme-provider, type declarations",
    inputSchema: zodToJsonSchema(getQuickStartSchema) as object,
    handler: getQuickStart,
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
