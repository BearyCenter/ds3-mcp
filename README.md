# @uxuissk/ds3-mcp

[![npm](https://img.shields.io/npm/v/@uxuissk/ds3-mcp)](https://www.npmjs.com/package/@uxuissk/ds3-mcp)

MCP server สำหรับ **Sellsuki Design System 3.0** — ให้ AI agent (Claude, Cursor, Continue) เข้าใจและใช้งาน `ssk-*` Lit Web Components, design tokens, brand rules ได้ถูกต้อง

---

## Install & Use

### Quick install (recommended)

เพิ่มใน `.mcp.json` ของ project:

```json
{
  "mcpServers": {
    "ds3": {
      "command": "npx",
      "args": ["-y", "@uxuissk/ds3-mcp"]
    }
  }
}
```

แล้ว restart Claude Code / Cursor — เสร็จ

### Local development

```bash
git clone https://github.com/BearyCenter/ds3-mcp
cd ds3-mcp
npm install --legacy-peer-deps
npm run sync     # ดึงข้อมูล component จาก @uxuissk/design-system-core ล่าสุด
npm run build
```

---

## Tools

| Tool | Description |
|------|-------------|
| `list_components` | List ssk-* components ทั้งหมด (filter ด้วย category) |
| `get_component` | ดู prop, slot, event ของ component |
| `get_design_tokens` | font-size, spacing, radius, semantic tokens |
| `get_color_palette` | สีของแต่ละ brand (patona, ccs3, oc2plus) |
| `get_brand_rules` | กฎการใช้แต่ละ brand |
| `get_token_value` | ดูค่า token เช่น `--ssk-font-size-md` = 20px |
| `suggest_components` | แนะนำ component จาก use case |
| `validate_usage` | ตรวจ code ว่าใช้ ssk-* ถูกต้อง |
| `get_quick_start` | Setup guide React/Vue/Vanilla |

---

## Architecture

ดู [ARCHITECTURE.md](./ARCHITECTURE.md) — สำหรับ Tech Dev ที่จะต่อยอด

---

## Sync with library

ทุกครั้งที่ `@uxuissk/design-system-core` มี version ใหม่:

```bash
npm install @uxuissk/design-system-core@latest --save-dev
npm run sync       # auto-extract component metadata
git commit -am "chore: sync with library X.Y.Z"
git tag v0.X.Y
git push --tags    # CI auto-publishes ขึ้น npm
```

---

## Roadmap

- [x] **Phase 1** MVP — list/get components, get tokens
- [x] **Phase 2** Auto-extractor จาก `@uxuissk/design-system-core`
- [x] **Phase 3** Brand & color tools
- [x] **Phase 4** AI helpers (suggest, validate, quick-start)
- [x] **Phase 5** npm publish + CI/CD
- [ ] **Phase 6** SSE/HTTP MCP สำหรับ claude.ai integration

---

## License

MIT
