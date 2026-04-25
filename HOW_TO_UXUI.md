# How to use DS 3.0 MCP — สำหรับ UX/UI Designer

> ใช้ AI เพื่อตรวจ design + generate prototype HTML ที่ใช้ DS 3.0 ถูกต้อง

---

## Setup (ครั้งเดียว)

### Figma Make / claude.ai
1. claude.ai → Integrations → Add MCP
2. URL: `https://ds3-mcp.vercel.app/api/mcp`

### Cursor / Claude Code
แก้ `.mcp.json`:
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

---

## Use Cases สำหรับ Designer

### 1. ตรวจสอบ design — component ที่ใช้มีจริงไหม

**คุณ:** "design นี้ใช้ component พวกนี้ ขอเช็คใน DS 3.0 มีไหม: card, badge, dropdown, file upload"

**AI:** เรียก `list_components` → รายงาน:
- ✅ ssk-card, ssk-badge, ssk-dropdown — มีแล้ว
- ❌ file upload — ยังเป็น "wait" status — ต้อง custom

### 2. ดู prop ของ component

**คุณ:** "ssk-button มีอะไรให้ปรับบ้าง"

**AI:** เรียก `get_component('ssk-button')` → list ครบ:
- variant: solid | outline | ghost | solid-light
- themeColor: primary | danger | success | warning | info
- size: xs | sm | md | lg | xl
- disabled, loading, testId

### 3. เลือก token ที่ถูก

**คุณ:** "spacing 16px ใช้ token อะไร"

**AI:** เรียก `get_token_value` → `--ssk-spacing-lg`

### 4. Multi-brand preview

**คุณ:** "ขอดูสีของ patona, ccs3, oc2plus เปรียบเทียบ"

**AI:** เรียก `get_color_palette('all')` →
- patona = aerospace-orange (#EC5E2A)
- ccs3 = sky (#32A9FF)
- oc2plus = emerald (#10B981)

### 5. Generate prototype HTML

**คุณ:** "สร้าง HTML prototype ของ login screen ตาม mockup นี้ brand=patona"

**AI:** ใช้ prompt `create_login_form` → ได้ HTML ที่ใช้ ssk-* ทำ live preview ใน browser ได้เลย

---

## Designer Workflow

```
Figma (ออกแบบ)
   ↓
Claude/Figma Make + ds3-mcp
   ↓
1. ตรวจ component coverage (มีจริงไหม)
2. Generate HTML prototype พร้อม token ถูก
3. ส่งให้ Dev — ไม่ต้องอธิบายมาก
```

---

## Tips สำหรับ Designer

### ตรวจ design system compliance
ก่อน handoff ให้ Dev — copy design spec → ถาม AI:
> "Component พวกนี้มีใน DS 3.0 ไหม? ถ้าไม่มีให้แนะนำ alternative"

### หา component ที่ใกล้เคียง
> "ฉันต้องการ component คล้าย Pinterest masonry layout — DS 3.0 มีอะไรที่ใช้แทนได้"

### Generate ตาม brand
ทุกคำสั่งระบุ brand เสมอ:
- "brand=patona" — สำหรับ Patona product
- "brand=ccs3" — Sellsuki main
- "brand=oc2plus" — OC2Plus

### Validate token usage
> "Code นี้ hardcode สี #32A9FF — ควรใช้ token อะไรแทน"

---

## ส่ง feedback กลับเข้า DS

ถ้า component ที่ออกแบบยังไม่มีใน DS 3.0:
1. เปิด Jira ticket → assign DS team
2. ส่งใน [#design-system](https://sellsuki.slack.com/channels/design-system)
3. ระหว่างรอ — ใช้ prototype HTML ที่ AI generate ก่อน

---

## ส่งต่อ Dev

หลัง prototype พร้อม → ส่งให้ Dev พร้อม:
- HTML output จาก AI
- Brand ที่ใช้ (ccs3/patona/oc2plus)
- Component list (จาก `list_components` filter)

Dev จะ implement จาก HTML นั้นได้ตรงๆ — ไม่ต้องเดา
