# How to use DS 3.0 MCP — สำหรับ Developer

> ใช้ MCP ใน Claude Code / Cursor / Codex เพื่อเขียน DS 3.0 component ได้เร็ว ถูก ตามมาตรฐาน

---

## Setup

### Claude Code / Cursor (stdio — แนะนำ local)

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

### Cursor / Codex (HTTP)
```json
{
  "mcpServers": {
    "ds3": {
      "type": "streamable-http",
      "url": "https://ds3-mcp.vercel.app/api/mcp"
    }
  }
}
```

### Restart IDE → MCP loaded

---

## Tools Reference

### Discovery
- `list_components(category?)` — ดู component ทั้งหมด
- `get_component(tag)` — props/slots/events ของ component
- `suggest_components(useCase)` — แนะนำจาก keyword

### Tokens
- `get_design_tokens(category?)` — table ทั้งหมด
- `get_token_value(token)` — ดูค่าของ token เดี่ยว
- `get_color_palette(brand?)` — สีของ brand

### Generation
- `generate_form(fields, brand)` — return HTML ssk-*
- `generate_page_layout(type, sections)` — boilerplate page

### Validation
- `validate_usage(code)` — ตรวจ ssk-* ใน HTML/JSX
- `get_quick_start(framework)` — install + setup guide

---

## Common Tasks

### 1. สร้าง component ใหม่จาก spec

```
You: "สร้าง form login มี email + password + remember me + submit, brand=ccs3"

AI: ใช้ generate_form tool → returns:
<ssk-theme-provider brand="ccs3">
  <ssk-input label="Email" type="email" required></ssk-input>
  <ssk-input label="Password" type="password" required></ssk-input>
  <ssk-checkbox label="Remember me"></ssk-checkbox>
  <ssk-button variant="solid" themeColor="primary">Sign in</ssk-button>
</ssk-theme-provider>
```

### 2. ตรวจ code review

```
You: "review code นี้: <ds-button onClick="handleClick">Submit</ds-button>"

AI: ใช้ validate_usage → 
- ❌ ds-* ถูก deprecated → ใช้ ssk-button
- ⚠ onClick ไม่ใช่ standard prop ของ Lit → ใช้ @click หรือ addEventListener
```

```
You: "validate code นี้: <p class="text-xs text-gray-400">hint</p>"

AI: ใช้ validate_usage →
- ❌ font-size-violation: 'text-xs' produces 12px — below DS 3.0 minimum 18px
  Fix: Use var(--font-size-caption, 18px) or <ssk-text> component
```

### 3. ดู API ของ component

```
You: "ssk-table มี prop อะไรบ้าง"

AI: get_component('ssk-table') → list props + types + defaults
```

### 4. แปลง DS 1.0 → DS 3.0

```
You: "convert <SskButton variant='primary'> → DS 3.0"

AI: ตาม spec DS 3.0 → 
<ssk-button variant="solid" themeColor="primary">...</ssk-button>
```

---

## Best Practices

### Font Size Rules (STRICT)

| Rule | Detail |
|------|--------|
| Minimum 18px | `var(--font-size-caption, 18px)` เป็น minimum สำหรับทุก text |
| Token เท่านั้น | ห้าม hardcode px — ใช้ `var(--font-size-*)` เสมอ |
| ห้าม Tailwind size | `text-xs` (12px), `text-sm` (14px) ห้ามใช้ |

```css
/* ✅ CORRECT */
font-size: var(--font-size-caption, 18px);  /* minimum */
font-size: var(--font-size-p, 20px);        /* body */
font-size: var(--font-size-label, 20px);    /* label */
font-size: var(--font-size-h4, 24px);       /* sub-heading */
font-size: var(--font-size-h3, 28px);       /* heading */

/* ❌ FORBIDDEN */
font-size: 12px;         /* below minimum */
font-size: 14px;         /* below minimum */
class="text-xs"          /* Tailwind 12px */
class="text-sm"          /* Tailwind 14px */
```

### ใช้ token ไม่ hardcode
```css
/* ❌ wrong */
:host { color: #32A9FF; padding: 16px; border-radius: 8px; }

/* ✅ right */
:host {
  color: var(--fg-brand-primary);
  padding: 16px;                        /* spacing ใช้ px ได้ — ไม่มี spacing token inject */
  border-radius: var(--radius-md);
  font-size: var(--font-size-p, 20px);
}
```

### Wrap ด้วย ssk-theme-provider เสมอ
```html
<ssk-theme-provider brand="ccs3">
  <!-- ทุก ssk-* ต้องอยู่ภายใน -->
</ssk-theme-provider>
```

### React + TypeScript types
ก่อนใช้ ssk-* ใน .tsx — เพิ่ม type declaration:
```typescript
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ssk-button": any;
      "ssk-input": any;
      // ...
    }
  }
}
```

หรือเรียก `get_quick_start('react')` → AI generate ให้ครบ

### Custom events
```html
<ssk-input @input=${handler}></ssk-input>
<!-- หรือใน React -->
<ssk-input ref={el => el?.addEventListener('input', handler)}></ssk-input>
```

---

## CI/CD Integration

### Pre-commit validate
เพิ่ม script ใน `package.json`:
```json
{
  "scripts": {
    "ds3:validate": "node scripts/validate-ds3.js"
  }
}
```

`scripts/validate-ds3.js`:
```js
import fetch from 'node-fetch';
import fs from 'fs';

const code = fs.readFileSync('src/**/*.tsx', 'utf-8');
const res = await fetch('https://ds3-mcp.vercel.app/api/v1/validate', {
  method: 'POST',
  body: JSON.stringify({ code })
});
const { valid, issues } = await res.json();
if (!valid) {
  console.error(issues);
  process.exit(1);
}
```

### CI step
```yaml
- name: Validate DS 3.0 usage
  run: npm run ds3:validate
```

---

## Update Library + Sync MCP

ถ้าคุณ contribute เพิ่ม component ใหม่ใน `@uxuissk/design-system-core`:

1. Library: bump version → publish npm
2. ds3-mcp: clone, `npm install @uxuissk/design-system-core@latest`
3. `npm run sync` — auto-extract metadata
4. Tag → CI publishes ds3-mcp ใหม่
5. ทุกคนได้ของใหม่ทันที (ผ่าน npx -y)

---

## Troubleshooting

### MCP tools ไม่ขึ้น
- Restart IDE
- ตรวจ `.mcp.json` syntax
- Run `npx -y @uxuissk/ds3-mcp` แยกดู error

### Component ไม่ render
- ครอบ `ssk-theme-provider` หรือยัง?
- Library version เก่า? → `npm update @uxuissk/design-system-core`

### Type errors ใน TypeScript
- เพิ่ม type declaration ใน `*.d.ts`
- ดู `get_quick_start('react')`

---

## Reference
- npm: [@uxuissk/ds3-mcp](https://www.npmjs.com/package/@uxuissk/ds3-mcp)
- Storybook: [bearycenter.github.io/SellsukiDesignsystem3.0](https://bearycenter.github.io/SellsukiDesignsystem3.0/)
- Library source: [github.com/BearyCenter/SellsukiDesignsystem3.0](https://github.com/BearyCenter/SellsukiDesignsystem3.0)
