export interface Prompt {
  name: string;
  description: string;
  arguments?: { name: string; description: string; required?: boolean }[];
}

const brandArg = {
  name: "brand",
  description: "Brand identity (patona | ccs3 | oc2plus). Default ccs3.",
  required: false,
};

export const promptsList: Prompt[] = [
  {
    name: "create_login_form",
    description: "สร้างหน้า login form ที่ใช้ ssk-* ครบ พร้อม brand token",
    arguments: [brandArg, { name: "fields", description: "comma-separated extra fields beyond email+password", required: false }],
  },
  {
    name: "create_dashboard",
    description: "สร้างหน้า dashboard มี chart, stat card, filter bar",
    arguments: [brandArg, { name: "metrics", description: "comma-separated metrics to show", required: false }],
  },
  {
    name: "create_crud_page",
    description: "สร้างหน้า CRUD (list+create+edit+delete) สำหรับ entity",
    arguments: [brandArg, { name: "entity", description: "ชื่อ entity เช่น 'Product', 'Order'", required: true }],
  },
  {
    name: "create_settings_page",
    description: "สร้างหน้า user settings มี profile, security, notifications",
    arguments: [brandArg],
  },
  {
    name: "create_landing_page",
    description: "สร้างหน้า marketing landing — hero + features + CTA",
    arguments: [brandArg, { name: "product", description: "ชื่อ product", required: false }],
  },
  {
    name: "create_table_view",
    description: "สร้างหน้า list ที่มี table + filter + pagination",
    arguments: [
      brandArg,
      { name: "entity", description: "ชื่อ entity เช่น 'Order', 'Customer'", required: true },
      { name: "columns", description: "comma-separated column names", required: false },
    ],
  },
  {
    name: "create_onboarding_flow",
    description: "สร้าง multi-step onboarding flow with stepper + progress",
    arguments: [
      brandArg,
      { name: "steps", description: "comma-separated step names", required: false },
    ],
  },
];

// ─── Shared rules appended to every template ─────────────────────────────────

const FONT_RULES = `
## DS 3.0 Rules (STRICT — must follow)

### Tags
- ALL tags MUST be ssk-* (never ds-*)
- Wrap root with ssk-theme-provider brand="..."

### Font size (MINIMUM 18px — non-negotiable)
✅ CORRECT — use these tokens only:
  var(--font-size-caption, 18px)   ← helper text, captions (minimum)
  var(--font-size-p, 20px)         ← body text
  var(--font-size-label, 20px)     ← form labels
  var(--font-size-h4, 24px)        ← sub-headings
  var(--font-size-h3, 28px)        ← headings
  var(--font-size-h2, 36px)        ← section titles
  var(--font-size-h1, 44px)        ← page titles

❌ FORBIDDEN — never write:
  class="text-xs"          (Tailwind 12px)
  class="text-sm"          (Tailwind 14px)
  font-size: 12px
  font-size: 14px
  font-size: 16px
  fontSize: "13px"

### For text content: prefer ssk components
  <ssk-text>body text</ssk-text>
  <ssk-heading>heading</ssk-heading>

### Colors & tokens
- Use themeColor prop for danger/success/warning/info, NOT variant
- For custom CSS: use var(--text-primary), var(--bg-primary), var(--stroke-primary)
- Never hardcode hex colors
- Never use --ssk-colors-* primitives directly
`;

export function getPrompt(name: string, args: Record<string, string> = {}): { messages: { role: "user"; content: { type: "text"; text: string } }[] } {
  const brand = args.brand ?? "ccs3";

  const templates: Record<string, () => string> = {
    create_login_form: () => {
      const extra = args.fields ? args.fields.split(",").map((f) => f.trim()) : [];
      const extraInputs = extra.map((f) => `      <ssk-input label="${f}" placeholder="${f}"></ssk-input>`).join("\n");
      return `Create a login form using DS 3.0 ssk-* Web Components with brand="${brand}".

Use this exact structure:

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-card>
    <ssk-heading slot="header">เข้าสู่ระบบ</ssk-heading>
    <form style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
      <ssk-input label="Email" type="email" required></ssk-input>
      <ssk-input label="Password" type="password" required></ssk-input>
${extraInputs}
      <ssk-checkbox label="Remember me"></ssk-checkbox>
      <ssk-button variant="solid" themeColor="primary" type="submit">เข้าสู่ระบบ</ssk-button>
      <ssk-button variant="ghost">ลืมรหัสผ่าน?</ssk-button>
    </form>
  </ssk-card>
</ssk-theme-provider>
\`\`\`
${FONT_RULES}`;
    },

    create_dashboard: () => {
      const metrics = args.metrics ? args.metrics.split(",").map((m) => m.trim()) : ["Sales", "Orders", "Customers"];
      const stats = metrics.map((m) => `      <ssk-card>
        <ssk-text>${m}</ssk-text>
        <ssk-heading>0</ssk-heading>
      </ssk-card>`).join("\n");
      return `Create a dashboard page using DS 3.0 ssk-* with brand="${brand}".

Metrics: ${metrics.join(", ")}

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-app-shell>
    <ssk-page-header title="Dashboard"></ssk-page-header>
    <ssk-filter-bar>
      <ssk-date-picker slot="filter" label="Period"></ssk-date-picker>
    </ssk-filter-bar>
    <ssk-widget-grid>
${stats}
      <ssk-line-chart></ssk-line-chart>
      <ssk-bar-chart></ssk-bar-chart>
      <ssk-donut-chart></ssk-donut-chart>
    </ssk-widget-grid>
  </ssk-app-shell>
</ssk-theme-provider>
\`\`\`

Use get_component for each tag to fill in actual props (data, labels).
${FONT_RULES}`;
    },

    create_crud_page: () => {
      const entity = args.entity ?? "Item";
      return `Create a full CRUD page for "${entity}" using DS 3.0 with brand="${brand}".

Include: list view, create modal, edit modal, delete confirmation.

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-app-shell>
    <ssk-page-header title="${entity} List">
      <ssk-button slot="action" variant="solid" themeColor="primary" id="btn-create">+ New ${entity}</ssk-button>
    </ssk-page-header>
    <ssk-filter-bar>
      <ssk-input slot="search" placeholder="Search ${entity}..."></ssk-input>
    </ssk-filter-bar>
    <ssk-table id="${entity.toLowerCase()}-table" sortable selectable></ssk-table>
    <ssk-pagination></ssk-pagination>

    <ssk-modal id="create-modal">
      <ssk-heading slot="header">Create ${entity}</ssk-heading>
      <!-- form fields here — use ssk-input, ssk-dropdown, ssk-checkbox -->
      <ssk-button slot="footer" variant="outline">Cancel</ssk-button>
      <ssk-button slot="footer" variant="solid" themeColor="primary">Save</ssk-button>
    </ssk-modal>
  </ssk-app-shell>
</ssk-theme-provider>
\`\`\`
${FONT_RULES}`;
    },

    create_settings_page: () =>
      `Create a settings page using DS 3.0 with brand="${brand}".

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-app-shell>
    <ssk-page-header title="Settings"></ssk-page-header>
    <ssk-tabs>
      <ssk-tab label="Profile">
        <ssk-card>
          <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
            <ssk-input label="Name"></ssk-input>
            <ssk-input label="Email" type="email"></ssk-input>
            <ssk-button variant="solid" themeColor="primary">Save</ssk-button>
          </div>
        </ssk-card>
      </ssk-tab>
      <ssk-tab label="Security">
        <ssk-card>
          <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
            <ssk-input label="Current password" type="password"></ssk-input>
            <ssk-input label="New password" type="password"></ssk-input>
            <ssk-button variant="solid" themeColor="primary">Update password</ssk-button>
          </div>
        </ssk-card>
      </ssk-tab>
      <ssk-tab label="Notifications">
        <div style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
          <ssk-toggle label="Email notifications"></ssk-toggle>
          <ssk-toggle label="SMS notifications"></ssk-toggle>
        </div>
      </ssk-tab>
    </ssk-tabs>
  </ssk-app-shell>
</ssk-theme-provider>
\`\`\`
${FONT_RULES}`,

    create_landing_page: () => {
      const product = args.product ?? "Sellsuki";
      return `Create a marketing landing page for "${product}" using DS 3.0 with brand="${brand}".

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-top-navbar>
    <ssk-logo slot="logo"></ssk-logo>
    <ssk-button slot="action" variant="solid" themeColor="primary">Sign up</ssk-button>
  </ssk-top-navbar>

  <section style="padding: 40px 24px; display: flex; flex-direction: column; gap: 16px;">
    <ssk-heading size="xl">${product} — เริ่มต้นใช้งาน</ssk-heading>
    <ssk-text>คำอธิบายสั้น ๆ เกี่ยวกับ ${product}</ssk-text>
    <ssk-button variant="solid" themeColor="primary" size="lg">Get started</ssk-button>
  </section>

  <section style="padding: 0 24px 40px;">
    <ssk-widget-grid>
      <ssk-card>Feature 1</ssk-card>
      <ssk-card>Feature 2</ssk-card>
      <ssk-card>Feature 3</ssk-card>
    </ssk-widget-grid>
  </section>
</ssk-theme-provider>
\`\`\`
${FONT_RULES}`;
    },

    create_table_view: () => {
      const entity = args.entity ?? "Item";
      const columns = args.columns
        ? args.columns.split(",").map((c) => c.trim())
        : ["ID", "Name", "Status", "Created", "Actions"];
      const colHeader = columns.map((c) => `        <th>${c}</th>`).join("\n");
      return `Create a table view page for "${entity}" using DS 3.0 with brand="${brand}".

Columns: ${columns.join(", ")}

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-app-shell>
    <ssk-page-header title="${entity} List">
      <ssk-button slot="action" variant="solid" themeColor="primary">+ New ${entity}</ssk-button>
    </ssk-page-header>
    <ssk-filter-bar>
      <ssk-input slot="search" placeholder="Search ${entity}..."></ssk-input>
      <ssk-dropdown slot="filter" label="Status"></ssk-dropdown>
      <ssk-date-picker slot="filter" label="Date"></ssk-date-picker>
    </ssk-filter-bar>
    <ssk-table sortable selectable>
      <thead>
        <tr>
${colHeader}
        </tr>
      </thead>
      <tbody>
        <!-- rows here -->
      </tbody>
    </ssk-table>
    <ssk-pagination total="100" pageSize="10"></ssk-pagination>
  </ssk-app-shell>
</ssk-theme-provider>
\`\`\`
${FONT_RULES}`;
    },

    create_onboarding_flow: () => {
      const steps = args.steps
        ? args.steps.split(",").map((s) => s.trim())
        : ["Welcome", "Profile", "Preferences", "Complete"];
      const stepItems = steps.map((s, i) => `      <ssk-step label="${s}" ${i === 0 ? "active" : ""}></ssk-step>`).join("\n");
      return `Create a multi-step onboarding flow with brand="${brand}".

Steps: ${steps.join(" → ")}

\`\`\`html
<ssk-theme-provider brand="${brand}">
  <ssk-container>
    <ssk-stepper>
${stepItems}
    </ssk-stepper>

    <ssk-card>
      <!-- step content here, swap based on current step -->
      <ssk-heading>${steps[0]}</ssk-heading>
      <ssk-text>เนื้อหา step 1</ssk-text>
      <!-- form fields — use ssk-input, ssk-checkbox, ssk-dropdown -->
    </ssk-card>

    <div style="display: flex; justify-content: space-between; margin-top: 24px;">
      <ssk-button variant="outline">ย้อนกลับ</ssk-button>
      <ssk-button variant="solid" themeColor="primary">ถัดไป</ssk-button>
    </div>

    <ssk-progress-bar value="25" max="100"></ssk-progress-bar>
  </ssk-container>
</ssk-theme-provider>
\`\`\`

Validate each step before allowing next. Use ssk-alert themeColor="danger" for validation errors.
${FONT_RULES}`;
    },
  };

  const generator = templates[name];
  const text = generator
    ? generator()
    : `# Unknown prompt: ${name}\n\nAvailable prompts: ${promptsList.map((p) => p.name).join(", ")}`;

  return {
    messages: [
      {
        role: "user",
        content: { type: "text", text },
      },
    ],
  };
}
