import { z } from "zod";

const Brand = z.enum(["patona", "ccs3", "oc2plus"]).default("ccs3");

// ─── generate_form ──────────────────────────────────────────────────────────

export const generateFormSchema = z.object({
  brand: Brand.optional(),
  fields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string().optional(),
        type: z.enum(["text", "email", "password", "number", "textarea", "checkbox", "radio", "dropdown", "date"]).default("text"),
        required: z.boolean().optional().default(false),
        placeholder: z.string().optional(),
      }),
    )
    .min(1)
    .describe("รายการ field ของ form"),
  submitLabel: z.string().optional().default("Submit"),
  title: z.string().optional(),
});

export function generateForm(input: z.infer<typeof generateFormSchema>) {
  const { brand = "ccs3", fields, submitLabel = "Submit", title } = input;

  const renderField = (f: typeof fields[number]): string => {
    const label = f.label ?? f.name;
    const required = f.required ? " required" : "";
    const placeholder = f.placeholder ? ` placeholder="${f.placeholder}"` : "";

    switch (f.type) {
      case "textarea":
        return `  <ssk-textarea label="${label}"${placeholder}${required}></ssk-textarea>`;
      case "checkbox":
        return `  <ssk-checkbox label="${label}"${required}></ssk-checkbox>`;
      case "radio":
        return `  <ssk-radio-group label="${label}"${required}></ssk-radio-group>`;
      case "dropdown":
        return `  <ssk-dropdown label="${label}"${required}></ssk-dropdown>`;
      case "date":
        return `  <ssk-date-picker label="${label}"${required}></ssk-date-picker>`;
      case "email":
      case "password":
      case "number":
      case "text":
      default:
        return `  <ssk-input label="${label}" type="${f.type}"${placeholder}${required}></ssk-input>`;
    }
  };

  const formBody = fields.map(renderField).join("\n");
  const heading = title ? `  <ssk-heading slot="header">${title}</ssk-heading>\n` : "";

  const code = `<ssk-theme-provider brand="${brand}">
  <ssk-card>
${heading}    <form>
${formBody}
      <ssk-button variant="solid" themeColor="primary" type="submit">${submitLabel}</ssk-button>
    </form>
  </ssk-card>
</ssk-theme-provider>`;

  return {
    brand,
    fieldCount: fields.length,
    code,
    notes: [
      "ครอบด้วย ssk-theme-provider เพื่อ inject brand tokens",
      "ใช้ ssk-card เป็น container",
      "ssk-button variant='solid' เป็น primary CTA",
    ],
  };
}

// ─── generate_page_layout ───────────────────────────────────────────────────

export const generatePageLayoutSchema = z.object({
  brand: Brand.optional(),
  pageType: z.enum(["dashboard", "list", "detail", "settings", "landing"]).describe("ชนิดของหน้า"),
  title: z.string().describe("ชื่อหน้า"),
  hasFilter: z.boolean().optional().default(false),
  hasSidebar: z.boolean().optional().default(true),
});

export function generatePageLayout(input: z.infer<typeof generatePageLayoutSchema>) {
  const { brand = "ccs3", pageType, title, hasFilter = false, hasSidebar = true } = input;

  const filter = hasFilter
    ? `      <ssk-filter-bar>\n        <ssk-input slot="search" placeholder="ค้นหา..."></ssk-input>\n      </ssk-filter-bar>\n`
    : "";

  const contentByType: Record<string, string> = {
    dashboard: `      <ssk-widget-grid>\n        <ssk-card>Stat 1</ssk-card>\n        <ssk-card>Stat 2</ssk-card>\n        <ssk-line-chart></ssk-line-chart>\n      </ssk-widget-grid>`,
    list: `      <ssk-table sortable selectable></ssk-table>\n      <ssk-pagination></ssk-pagination>`,
    detail: `      <ssk-card>\n        <ssk-heading>${title} Details</ssk-heading>\n        <!-- detail content -->\n      </ssk-card>`,
    settings: `      <ssk-tabs>\n        <ssk-tab label="Profile"></ssk-tab>\n        <ssk-tab label="Security"></ssk-tab>\n        <ssk-tab label="Notifications"></ssk-tab>\n      </ssk-tabs>`,
    landing: `      <section>\n        <ssk-heading size="xl">${title}</ssk-heading>\n        <ssk-button variant="solid" themeColor="primary" size="lg">Get started</ssk-button>\n      </section>`,
  };

  const shellOpen = hasSidebar ? `  <ssk-app-shell>\n    <ssk-sidebar slot="sidebar"></ssk-sidebar>` : "  <ssk-app-shell>";
  const shellClose = "  </ssk-app-shell>";

  const code = `<ssk-theme-provider brand="${brand}">
${shellOpen}
    <main>
      <ssk-page-header title="${title}"></ssk-page-header>
${filter}${contentByType[pageType]}
    </main>
${shellClose}
</ssk-theme-provider>`;

  return {
    brand,
    pageType,
    code,
    nextSteps: [
      `เรียก get_component สำหรับแต่ละ tag เพื่อดู props จริง`,
      `เติม data, event handler ตาม use case`,
      `ใช้ token --ssk-spacing-* สำหรับ custom CSS`,
    ],
  };
}
