#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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
import {
  generateForm,
  generateFormSchema,
  generatePageLayout,
  generatePageLayoutSchema,
} from "./tools/generate.js";
import { listResources, readResource } from "./resources/index.js";
import { promptsList, getPrompt } from "./prompts/index.js";

export function createServer() {
  const server = new Server(
    { name: "ds3-mcp", version: "1.0.0" },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  const tools = [
    { name: "list_components", description: "List Sellsuki Design System 3.0 components (ssk-* Lit Web Components). Optionally filter by category.", inputSchema: zodToJsonSchema(listComponentsSchema) as object, handler: listComponents },
    { name: "get_component", description: "Get detailed information about a specific DS 3.0 component — props, slots, events, examples.", inputSchema: zodToJsonSchema(getComponentSchema) as object, handler: getComponent },
    { name: "get_design_tokens", description: "Get DS 3.0 design tokens — font-size, spacing, radius, semantic tokens, etc.", inputSchema: zodToJsonSchema(getDesignTokensSchema) as object, handler: getDesignTokens },
    { name: "get_color_palette", description: "Get color palette for each brand (patona, ccs3, oc2plus). Use 'all' for all brands.", inputSchema: zodToJsonSchema(getColorPaletteSchema) as object, handler: getColorPalette },
    { name: "get_brand_rules", description: "Get usage guidelines + use case for each brand (patona, ccs3, oc2plus)", inputSchema: zodToJsonSchema(getBrandRulesSchema) as object, handler: getBrandRules },
    { name: "get_token_value", description: "Lookup actual value of a token e.g. '--ssk-font-size-md' = 20px", inputSchema: zodToJsonSchema(getTokenValueSchema) as object, handler: getTokenValue },
    { name: "suggest_components", description: "Suggest DS 3.0 components based on a use case description", inputSchema: zodToJsonSchema(suggestComponentsSchema) as object, handler: suggestComponents },
    { name: "validate_usage", description: "Validate HTML/JSX snippet uses ssk-* tags + props correctly. Also checks font-size violations (minimum 18px, no text-xs/text-sm Tailwind classes).", inputSchema: zodToJsonSchema(validateUsageSchema) as object, handler: validateUsage },
    { name: "get_quick_start", description: "Setup guide for using DS 3.0 in React/Vue/Vanilla. Includes font size rules: minimum 18px, token-only, no Tailwind text-xs/text-sm.", inputSchema: zodToJsonSchema(getQuickStartSchema) as object, handler: getQuickStart },
    { name: "generate_form", description: "Generate a complete form using ssk-* components from field specs", inputSchema: zodToJsonSchema(generateFormSchema) as object, handler: generateForm },
    { name: "generate_page_layout", description: "Generate a page layout boilerplate (dashboard, list, detail, settings, landing)", inputSchema: zodToJsonSchema(generatePageLayoutSchema) as object, handler: generatePageLayout },
  ];

  // Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ handler, ...t }) => t),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) throw new Error(`Tool '${request.params.name}' not found`);
    const result = await tool.handler(request.params.arguments as never);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // Resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: listResources(),
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (request) =>
    readResource(request.params.uri),
  );

  // Prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: promptsList,
  }));
  server.setRequestHandler(GetPromptRequestSchema, async (request) =>
    getPrompt(request.params.name, (request.params.arguments ?? {}) as Record<string, string>),
  );

  return server;
}

// stdio entry
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("server.js")) {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[ds3-mcp] Server running on stdio");
}
