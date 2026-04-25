# @uxuissk/ds3-mcp

MCP server สำหรับ **Sellsuki Design System 3.0** — ให้ AI agent (Claude, Cursor) เข้าใจและใช้งาน `ssk-*` Lit Web Components, design tokens, brand rules ได้ถูกต้อง

---

## Quick Start

### Local (stdio)

```bash
# ติดตั้ง
npm install -g @uxuissk/ds3-mcp

# config ใน .mcp.json
{
  "mcpServers": {
    "ds3": {
      "command": "npx",
      "args": ["@uxuissk/ds3-mcp"]
    }
  }
}
```

### Develop locally

```bash
git clone https://github.com/BearyCenter/ds3-mcp
cd ds3-mcp
npm install
npm run dev
```

---

## Tools

| Tool | Description |
|------|-------------|
| `list_components` | List ssk-* components ทั้งหมด (filter ด้วย category) |
| `get_component` | ดู prop, slot, event, examples ของ component |
| `get_design_tokens` | ดู font-size, spacing, radius, semantic tokens |

### Coming soon

- `get_color_palette` — สีของ patona, ccs3, oc2plus
- `get_brand_rules` — กฎการใช้แต่ละ brand
- `suggest_components` — แนะนำ component จาก use case
- `validate_usage` — เช็ค code ว่าใช้ DS 3.0 ถูกต้อง

---

## Architecture

ดูที่ [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Roadmap

- [x] **Phase 1** MVP — list/get components, get tokens
- [ ] **Phase 2** Auto-extractor จาก `@uxuissk/design-system-core`
- [ ] **Phase 3** Brand & color tools
- [ ] **Phase 4** AI helpers (suggest, validate)
- [ ] **Phase 5** Deploy SSE/HTTP MCP

---

## License

MIT
