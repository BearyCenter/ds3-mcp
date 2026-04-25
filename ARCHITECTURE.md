# Architecture — ds3-mcp

> สำหรับ Tech Dev ที่จะต่อยอด

---

## Overview

```
@uxuissk/design-system-core (npm package)
              ↓ (Phase 2: auto-extract)
              ↓
         ds3-mcp data
              ↓
         MCP tools (list/get/suggest)
              ↓
         AI Agent (Claude, Cursor)
```

---

## Folder Structure

```
src/
├── server.ts          ← MCP server entry point (stdio)
├── tools/             ← Tool implementations
│   ├── components.ts  ← list_components, get_component
│   └── tokens.ts      ← get_design_tokens
└── data/              ← Component metadata (JSON)
    ├── components.json
    └── tokens.json
scripts/
└── sync.ts            ← Auto-sync จาก library (Phase 2)
```

---

## Adding a New Tool

1. สร้างไฟล์ `src/tools/your-tool.ts`:

```typescript
import { z } from "zod";

export const yourToolSchema = z.object({
  param: z.string().describe("..."),
});

export function yourTool(input: z.infer<typeof yourToolSchema>) {
  return { result: "..." };
}
```

2. ลงทะเบียนใน `src/server.ts`:

```typescript
{
  name: "your_tool",
  description: "...",
  inputSchema: zodToJsonSchema(yourToolSchema),
  handler: yourTool,
}
```

3. เขียน test ใน `src/tools/your-tool.test.ts`

---

## Data Sync Strategy

### Phase 1 (current)
- Manual JSON files ใน `src/data/`
- อัปเดตเมื่อ library bump version

### Phase 2 (planned)
- `scripts/sync.ts` ดึงจาก npm package
- Parse `node_modules/@uxuissk/design-system-core/dist/types/*.d.ts`
- Extract `@property` decorators, types, defaults
- Auto-generate `data/components.json`

```bash
npm run sync   # ดึงข้อมูลล่าสุดจาก npm
```

---

## Deployment

### stdio MCP (developer use)
```bash
npm publish
```

### SSE MCP (claude.ai)
- Wrap stdio server with SSE transport
- Deploy to Vercel Edge Function
- Register URL บน claude.ai/settings/mcp

---

## Versioning

- Semver — ตาม contract ของ MCP tools
- Bump major เมื่อ breaking change ใน tool signature
- Bump minor เมื่อเพิ่ม tool ใหม่
- Bump patch เมื่อแก้ data หรือ bug

ไม่ผูกตรงกับ library version — MCP version ไปคนละทาง
