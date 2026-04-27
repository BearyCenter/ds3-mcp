# DS 3.0 MCP — Setup Guide สำหรับทุก AI

> ครอบคลุม: Claude Code, Cursor, Codex, claude.ai, Claude Desktop, Windsurf, Continue, Cline, ChatGPT, Gemini

---

## 🌐 Endpoints ที่พร้อมใช้

| Endpoint | สำหรับ |
|----------|--------|
| `https://ds3-mcp.vercel.app/api/mcp` | **Streamable HTTP MCP** (claude.ai, Claude Desktop, IDE ส่วนใหญ่) |
| `npx -y @uxuissk/ds3-mcp` | **stdio MCP** (Claude Code, Cursor, IDE local) |
| `https://ds3-mcp.vercel.app/api/v1/*` | **REST API** (ChatGPT Custom GPT, Gemini, custom apps) |
| `https://ds3-mcp.vercel.app/api/v1/openapi.json` | **OpenAPI Spec** สำหรับ ChatGPT Custom GPT |

---

## 📦 Tools, Resources, Prompts ที่ AI จะได้

### Tools (11)
- `list_components` — list ssk-* ทั้งหมด
- `get_component` — props/slots ของ component
- `get_design_tokens` — token tables
- `get_color_palette` — สีของแต่ละ brand
- `get_brand_rules` — guideline ของ brand
- `get_token_value` — lookup ค่า token เดี่ยว
- `suggest_components` — แนะนำจาก use case
- `validate_usage` — ตรวจ code ssk-*
- `get_quick_start` — setup guide ราย framework
- `generate_form` — สร้าง form code
- `generate_page_layout` — สร้าง page boilerplate

### Resources (90+)
- `ds3://components/{tag}` — markdown docs ของ component
- `ds3://tokens/{category}` — token tables
- `ds3://brands/{id}` — brand guidelines
- `ds3://overview` — DS 3.0 master reference

### Prompts (5)
- `create_login_form`
- `create_dashboard`
- `create_crud_page`
- `create_settings_page`
- `create_landing_page`

---

## 🔌 Setup ต่อ AI

### 1. Claude Code (CLI)

`.mcp.json` ใน project root:
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
หรือใช้ HTTP transport:
```json
{
  "mcpServers": {
    "ds3": {
      "type": "http",
      "url": "https://ds3-mcp.vercel.app/api/mcp"
    }
  }
}
```

**Verify:** restart Claude Code → ใน chat ลองพิมพ์ `/list_components`

---

### 2. Cursor

`.cursor/mcp.json` (per project) หรือ `~/.cursor/mcp.json` (global):
```json
{
  "mcpServers": {
    "ds3": {
      "url": "https://ds3-mcp.vercel.app/api/mcp"
    }
  }
}
```

**Verify:** Cmd/Ctrl+Shift+P → "MCP: List servers" → ds3 ต้องขึ้น

---

### 3. claude.ai (Web)

1. เปิด [claude.ai](https://claude.ai)
2. **Settings → Integrations → Add custom integration**
3. **Integration name:** `Sellsuki DS 3.0`
4. **Integration URL:** `https://ds3-mcp.vercel.app/api/mcp`
5. Save

**Verify:** เปิด chat ใหม่ → ปุ่ม integrations แสดง `ds3` → กดเปิด → พิมพ์ "list ds3 components"

---

### 4. Claude Desktop (Mac/Win)

แก้ `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)
หรือ `%APPDATA%\Claude\claude_desktop_config.json` (Win):

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

Restart Claude Desktop

---

### 5. Codex (OpenAI)

`~/.codex/config.toml`:
```toml
[mcp_servers.ds3]
url = "https://ds3-mcp.vercel.app/api/mcp"
```

Restart Codex

---

### 6. Windsurf

`~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "ds3": {
      "serverUrl": "https://ds3-mcp.vercel.app/api/mcp"
    }
  }
}
```

---

### 7. Continue / Cline (VSCode)

ใน Continue config:
```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "streamable-http",
          "url": "https://ds3-mcp.vercel.app/api/mcp"
        }
      }
    ]
  }
}
```

---

### 8. ChatGPT (ผ่าน Custom GPT)

1. ChatGPT → **Explore GPTs → + Create**
2. **Configure → Actions → Create new action**
3. **Import from URL:**
   `https://ds3-mcp.vercel.app/api/v1/openapi.json`
4. Authentication: **None**
5. Privacy policy: ใส่ URL ใดก็ได้
6. **Save**

**System prompt ที่แนะนำ:**
```
คุณเป็น AI ที่ช่วย vibecode ฟีเจอร์ที่ใช้ Sellsuki Design System 3.0
- ใช้ ssk-* เท่านั้น (ไม่ใช่ ds-*)
- ทุก code ต้องครอบด้วย ssk-theme-provider
- เรียก /api/v1/components ก่อนใช้ component ที่ไม่แน่ใจ
- เรียก /api/v1/tokens สำหรับ spacing/font-size
- เรียก /api/v1/generate สำหรับสร้าง form/page boilerplate
- Brand เริ่มต้น: ccs3
```

---

### 9. Gemini (ผ่าน Function Calling)

ใช้ REST API + custom function schema:
```python
import google.generativeai as genai

ds3_api = "https://ds3-mcp.vercel.app/api/v1"

functions = [{
    "name": "list_ds3_components",
    "description": "List Sellsuki Design System 3.0 components",
    "parameters": {
        "type": "object",
        "properties": {
            "category": {"type": "string"}
        }
    }
}]

# In your handler:
if call.name == "list_ds3_components":
    response = requests.get(f"{ds3_api}/components")
    return response.json()
```

---

### 10. Figma Make / Plugin

ตอนนี้ Figma รองรับ MCP ผ่าน Cursor/Claude Code workflow — ใช้ผ่าน Cursor (ข้อ 2) แล้วใช้ Figma Make ได้ทันที

---

## 🧪 Verify ก่อนเริ่มใช้

### Test endpoint
```bash
curl https://ds3-mcp.vercel.app/api/mcp
```
ต้องเห็น:
```json
{"status":"ok","server":"ds3-mcp","version":"1.0.0","transport":"streamable-http","capabilities":["tools","resources","prompts"]}
```

### Test REST
```bash
curl https://ds3-mcp.vercel.app/api/v1/components?tag=ssk-button
```
ต้องเห็น component spec

### Test ใน AI
ถาม AI ว่า:
> "ใช้ ds3 mcp ค้น ssk-button ให้ดู properties"

AI ต้องเรียก `get_component` แล้วตอบกลับ props จริง

---

## 📚 Documentation

| Doc | สำหรับใคร |
|-----|----------|
| [HOW_TO_PO.md](./HOW_TO_PO.md) | PO / Product Manager |
| [HOW_TO_UXUI.md](./HOW_TO_UXUI.md) | UX/UI Designer |
| [HOW_TO_DEV.md](./HOW_TO_DEV.md) | Developer |
| [PLAN.md](./PLAN.md) | Architecture Overview |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech Dev (extend MCP) |

---

## 🔄 Sync with Library

ทุกครั้ง `@uxuissk/design-system-core` มี version ใหม่:

```bash
git clone https://github.com/BearyCenter/ds3-mcp
cd ds3-mcp
npm install --legacy-peer-deps
npm install @uxuissk/design-system-core@latest --save-dev
npm run sync       # auto-extract metadata ใหม่
git commit -am "chore: sync with library X.Y.Z"
git tag vA.B.C
git push --tags    # CI auto-publishes ทั้ง npm + Vercel
```

หลัง sync เสร็จ — ทุก AI ที่ใช้ MCP ได้ของใหม่ทันทีเพราะ:
- `npx -y @uxuissk/ds3-mcp` — pull latest version
- `https://ds3-mcp.vercel.app/api/mcp` — auto-redeployed

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| MCP tools ไม่ขึ้นใน IDE | Restart IDE หลังแก้ config |
| Claude.ai ไม่เห็น integration | ตรวจ URL ถูก, account permissions |
| ChatGPT action error | ตรวจ OpenAPI URL accessible, no auth |
| Component ที่อยากใช้ไม่มี | เรียก `list_components` — อาจอยู่ใน wait queue |
| AI ใช้ `ds-*` แทน `ssk-*` | บอก AI ใหม่ "use ssk-* prefix only, ds-* deprecated" |

---

## 📞 Support

- **Slack:** `#design-system`
- **GitHub Issues:** [github.com/BearyCenter/ds3-mcp/issues](https://github.com/BearyCenter/ds3-mcp/issues)
- **Library Issues:** [github.com/BearyCenter/SellsukiDesignsystem3.0/issues](https://github.com/BearyCenter/SellsukiDesignsystem3.0/issues)
