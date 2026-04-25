# DS 3.0 MCP — v1.0 Best-in-Class Plan

> **Goal:** ให้ทีม Product/PO/UX/UI/Dev ใช้ AI เพื่อ vibecode ฟีเจอร์ที่ใช้ DS 3.0 ถูกต้อง 100%
> **Date:** 2026-04-26
> **Status:** Sprint Plan

---

## Vision

```
ก่อน: PO ↔ AI ↔ มั่วๆ component, แล้ว Dev มาแก้ใหม่
หลัง: PO ↔ AI (ใช้ ds3-mcp) ↔ DS 3.0 spec → code ที่ถูกต้องครั้งเดียว
```

ทุก role ใช้ AI ตัวไหนก็ได้ (Claude, Cursor, Codex, claude.ai, ChatGPT) แล้วได้ผลลัพธ์ตรง spec เดียวกัน

---

## Strategic Decisions

### Why Streamable HTTP (not stdio only)?
- **PO/UX/UI ใช้ web ได้ทันที** — ไม่ต้อง install Node.js
- **Single URL ใช้ได้ทุกที่** — claude.ai, Cursor, Codex, Claude Desktop
- **สอดคล้อง DS 2.0 MCP** ที่มีอยู่ (`/api/mcp` pattern เดียวกัน)
- **Future-proof** — MCP 2025 spec

### Why MCP + REST?
- **MCP** — ครอบคลุม Claude/Cursor/Codex (90% use case)
- **REST mirror** — เปิดให้ ChatGPT Custom GPT / Gemini Function Calling เรียกได้ด้วย
- โค้ดเดียวกัน 2 endpoint = maintenance ต่ำ

### Why Tools + Resources + Prompts (เต็ม MCP)?
- **Tools** = ให้ AI ดึงข้อมูลแบบ on-demand
- **Resources** = ให้ AI อ่านเอกสาร component แบบ pre-load (เร็วกว่า)
- **Prompts** = template สำเร็จรูปให้ user เลือก (PO กดปุ่มเดียว → ได้ login form)

---

## Architecture

```
ds3-mcp (npm package)
│
├── Source of truth (1 codebase)
│   ├── tools/      9 ตัวเดิม + generation tools ใหม่
│   ├── resources/  ds3://components/*, ds3://tokens/*, ds3://brands/*
│   └── prompts/    "Create login form", "Build dashboard", ...
│
└── Deploy 3 ทาง
    ├── stdio MCP   → @uxuissk/ds3-mcp (npm) → Claude Code, Cursor (local)
    ├── HTTP MCP    → ds3-mcp.vercel.app/api/mcp → claude.ai, Cursor (web)
    └── REST API    → ds3-mcp.vercel.app/api/v1/* → ChatGPT, Gemini, custom apps
```

---

## Sprint Breakdown

### Sprint 1 — MCP Resources (Day 1)
- Define resource URIs: `ds3://components/{tag}`, `ds3://tokens/{category}`, `ds3://brands/{id}`
- Implement `ListResources` + `ReadResource` handlers
- Resources return Markdown content (อ่านง่ายสำหรับ AI)

### Sprint 2 — MCP Prompts (Day 1)
- Implement common templates:
  - `create_login_form(brand, fields?)`
  - `create_dashboard(brand, metrics?)`
  - `create_crud_page(brand, entity)`
  - `create_settings_page(brand)`
  - `create_landing_page(brand)`
- ผู้ใช้กดเลือก prompt → AI ได้ template ที่ใช้ DS 3.0 ทันที

### Sprint 3 — Generation Tools (Day 2)
- `generate_form(fields[], brand)` → return ssk-* code
- `generate_page_layout(type, sections)` → return AppShell + content
- `generate_component_usage(tag, scenario)` → boilerplate code

### Sprint 4 — HTTP Transport (Day 2-3)
- Setup Vercel project structure
- `api/mcp.ts` — Streamable HTTP MCP endpoint
- ใช้ `StreamableHTTPServerTransport` จาก MCP SDK
- Test locally + deploy

### Sprint 5 — REST API Mirror (Day 3)
- `api/v1/components` — list
- `api/v1/components/[tag]` — detail
- `api/v1/tokens`
- `api/v1/brands/[id]`
- `api/v1/generate/form` — POST
- OpenAPI spec for ChatGPT Custom GPT

### Sprint 6 — Docs + Release (Day 4)
- Update README + ARCHITECTURE
- Write HOW_TO_PO.md, HOW_TO_UXUI.md, HOW_TO_DEV.md
- Tag `v1.0.0` → CI publish npm + Vercel deploy
- Announce internally

---

## Success Metrics

| Metric | Target |
|--------|--------|
| AI accuracy (correct ssk-* usage) | ≥95% |
| Vibecode rounds (PO → finished code) | ≤2 turns |
| Coverage AI tools | Claude + Cursor + Codex + claude.ai + ChatGPT (via REST) |
| Sync lag (library → MCP) | ≤1 commit |
| Maintenance cost | 1 codebase, auto-publish |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vercel cold start | Slow first call | Edge runtime + caching |
| Token limits in resources | AI overflow | Paginate + summarize |
| Library breaking change | MCP outdated | Auto-sync + version pinning |
| Multi-AI consistency | ผลลัพธ์ต่าง | Same data source via MCP+REST |

---

## Definition of Done (v1.0)

- [ ] All 9 existing tools + 3 generation tools = 12 tools
- [ ] 5+ Resources types
- [ ] 5+ Prompt templates
- [ ] Streamable HTTP MCP deployed
- [ ] REST API live
- [ ] Docs published (PLAN, ARCHITECTURE, HOW_TO ×3)
- [ ] CI auto-publishes both npm + Vercel
- [ ] tested with: Claude Code, claude.ai, Cursor, ChatGPT Custom GPT
