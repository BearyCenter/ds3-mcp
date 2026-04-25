# How to use DS 3.0 MCP — สำหรับ PO / Product Manager

> Vibecode ฟีเจอร์โดยใช้ AI ที่รู้จัก Sellsuki Design System 3.0 อย่างแม่นยำ

---

## 5 นาทีเริ่มใช้งาน

### Option A: claude.ai (เว็บ — แนะนำสำหรับ PO)

1. เข้า [claude.ai](https://claude.ai) → Settings → Integrations
2. **Add custom MCP** → URL: `https://ds3-mcp.vercel.app/api/mcp`
3. Save → เปิด chat ใหม่ → พิมพ์ใช้งานได้เลย

### Option B: ChatGPT (ผ่าน Custom GPT)

1. สร้าง Custom GPT → Configure → Action
2. Import OpenAPI: `https://ds3-mcp.vercel.app/api/v1/openapi.json`
3. Save → ใช้ได้เลย

---

## ใช้งานยังไง (Vibecode)

### Pattern 1: ใช้ Prompt Template (เร็วสุด)

พิมพ์:
> "Use prompt `create_login_form` with brand=patona"

AI จะสร้าง login form ที่ใช้ ssk-* ครบ:
- ssk-input สำหรับ email/password
- ssk-button สำหรับ submit
- ssk-theme-provider ครอบ
- ใช้ token brand patona ถูกต้อง

### Pattern 2: อธิบาย requirement ปกติ

พิมพ์:
> "ทำหน้า dashboard ที่มี filter date range, แสดง 3 chart, brand=ccs3"

AI จะ:
1. เรียก `suggest_components` → ssk-filter-bar, ssk-line-chart, ssk-card
2. เรียก `get_component` ดู prop
3. เรียก `get_brand_rules` ของ ccs3
4. Generate code ที่พร้อมใช้

### Pattern 3: Validate code

วาง code ที่มีอยู่ → พิมพ์:
> "ตรวจว่า code นี้ใช้ DS 3.0 ถูกหรือยัง"

AI จะเรียก `validate_usage` → รายงาน issues + วิธีแก้

---

## Prompt Templates ที่มีให้ใช้

| Template | ใช้ทำ |
|----------|-------|
| `create_login_form` | หน้า login |
| `create_dashboard` | หน้า dashboard มี chart |
| `create_crud_page` | หน้า list + create + edit + delete |
| `create_settings_page` | หน้า user settings |
| `create_landing_page` | หน้า marketing landing |

---

## ตัวอย่าง Conversation

**คุณ:** "ทำหน้า list สินค้า มี search, filter category, table แสดง 10 รายการต่อหน้า, brand=ccs3"

**AI (ใช้ ds3-mcp):**
```html
<ssk-theme-provider brand="ccs3">
  <ssk-app-shell>
    <ssk-page-header title="สินค้า"></ssk-page-header>
    <ssk-filter-bar>
      <ssk-input slot="search" placeholder="ค้นหาสินค้า"></ssk-input>
      <ssk-dropdown slot="filter" label="หมวดหมู่"></ssk-dropdown>
    </ssk-filter-bar>
    <ssk-table .data=${products} pagination></ssk-table>
  </ssk-app-shell>
</ssk-theme-provider>
```

ส่งให้ Dev → implement ได้ทันที ไม่ต้องเดา component

---

## Tips

✅ **DO**
- บอก brand เสมอ (`brand=patona|ccs3|oc2plus`)
- บอก use case ชัดๆ ("dashboard ขาย", "form สมัครสมาชิก")
- ใช้ template ที่ใกล้สุดก่อน แล้วค่อย customize

❌ **DON'T**
- อย่าใช้ `ds-*` prefix (DS 3.0 ใช้ `ssk-*` เท่านั้น)
- อย่าระบุสีเป็น hex โดยตรง — ใช้ token (`--bg-brand-primary`)
- อย่าให้ AI เดา component — ใช้ tool ดึงข้อมูลจริงทุกครั้ง

---

## ติดปัญหา?

| Issue | วิธีแก้ |
|-------|---------|
| AI ไม่รู้จัก ssk-* | check ว่า MCP register ถูก URL |
| Component ที่อยากใช้ไม่มี | เรียก `list_components` ดู — อาจอยู่ใน `wait` queue |
| Brand ไม่ขึ้น | ลืมครอบ `<ssk-theme-provider>` |

**ถามเพิ่ม:** [#design-system](https://sellsuki.slack.com/channels/design-system) บน Slack
