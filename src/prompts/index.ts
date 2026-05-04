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
  // ── Phase 5: Product Feature Templates (AppShell-based) ──────────────────
  {
    name: "create_feature_page",
    description: "สร้าง feature page พร้อม AppShell + Sidebar + PageHeader — starting point สำหรับ feature ใหม่ใน Sellsuki product",
    arguments: [
      brandArg,
      { name: "featureName", description: "ชื่อ feature เช่น 'Order Management', 'Customer Profile'", required: true },
      { name: "ctaLabel",    description: "ข้อความ primary action button เช่น '+ New Order'", required: false },
    ],
  },
  {
    name: "create_product_list",
    description: "สร้างหน้า list ของ entity ใน Sellsuki product พร้อม AppShell + filter + table + pagination",
    arguments: [
      brandArg,
      { name: "entity",   description: "ชื่อ entity เช่น 'Product', 'Order', 'Customer'", required: true },
      { name: "columns",  description: "comma-separated column names", required: false },
    ],
  },
  {
    name: "create_product_form",
    description: "สร้างหน้า create/edit form สำหรับ entity ใน Sellsuki product พร้อม AppShell + validation",
    arguments: [
      brandArg,
      { name: "entity",      description: "ชื่อ entity เช่น 'Product', 'Order'", required: true },
      { name: "fields",      description: "comma-separated field names", required: false },
      { name: "submitLabel", description: "label ของ submit button", required: false },
    ],
  },
  {
    name: "create_analytics_widget",
    description: "สร้างหน้า analytics/dashboard สำหรับ Sellsuki product พร้อม AppShell + widget + chart",
    arguments: [
      brandArg,
      { name: "metrics",   description: "comma-separated metric names เช่น 'Sales,Orders,Customers'", required: false },
      { name: "chartType", description: "line | bar | donut (default line)", required: false },
    ],
  },
];

// ─── Shared AppShell base (Phase 5 product templates) ────────────────────────

const APPSHELL_RULES = `
## AppShell Structure (REQUIRED for all Sellsuki product features)

\`\`\`html
<!-- ✅ Correct: ssk-app-shell-provider wraps everything -->
<ssk-app-shell-provider brand="ccs3">
  <ssk-app-shell>
    <ssk-sidebar slot="sidebar">
      <!-- navigation items -->
    </ssk-sidebar>
    <main>
      <!-- page content -->
    </main>
  </ssk-app-shell>
</ssk-app-shell-provider>
\`\`\`

### Brand values
- **ccs3** = Sellsuki (default — ใช้เมื่อไม่ระบุ)
- **patona** = Patona product
- **oc2plus** = OC2Plus product

### AppShell injects all tokens automatically
- ไม่ต้อง import CSS แยก
- ไม่ต้องตั้ง font-family เอง — DB HeaventRounded โหลดให้อัตโนมัติ
- สี, token, radius ทั้งหมดพร้อมใช้ผ่าน var(--token-name)
`;

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

    // ── Phase 5: Product Feature Templates ───────────────────────────────────

    create_feature_page: () => {
      const featureName = args.featureName ?? "Feature Name";
      const ctaLabel = args.ctaLabel ?? `+ New ${featureName}`;
      return `Create a new Sellsuki product feature page for "${featureName}" with brand="${brand}".

This is the standard starting structure for ALL Sellsuki product features.

\`\`\`html
<ssk-app-shell-provider brand="${brand}">
  <ssk-app-shell>

    <!-- Sidebar navigation -->
    <ssk-sidebar slot="sidebar">
      <ssk-logo slot="logo"></ssk-logo>
      <ssk-sidebar-group>
        <ssk-sidebar-items label="${featureName}" active></ssk-sidebar-items>
        <!-- add more navigation items here -->
      </ssk-sidebar-group>
    </ssk-sidebar>

    <!-- Main content -->
    <main>
      <ssk-page-header title="${featureName}">
        <ssk-button slot="action" variant="solid" themeColor="primary">
          ${ctaLabel}
        </ssk-button>
      </ssk-page-header>

      <!-- Feature content goes here -->
      <div style="padding: 24px;">
        <ssk-text>เนื้อหา ${featureName}</ssk-text>
      </div>
    </main>

  </ssk-app-shell>
</ssk-app-shell-provider>
\`\`\`
${APPSHELL_RULES}${FONT_RULES}`;
    },

    create_product_list: () => {
      const entity = args.entity ?? "Item";
      const columns = args.columns
        ? args.columns.split(",").map((c) => c.trim())
        : ["ID", "Name", "Status", "Date", "Actions"];
      const colHeaders = columns.map((c) => `              <th>${c}</th>`).join("\n");
      return `Create a product list page for "${entity}" in Sellsuki with brand="${brand}".

\`\`\`html
<ssk-app-shell-provider brand="${brand}">
  <ssk-app-shell>

    <ssk-sidebar slot="sidebar">
      <ssk-logo slot="logo"></ssk-logo>
      <ssk-sidebar-group>
        <ssk-sidebar-items label="${entity} List" active></ssk-sidebar-items>
      </ssk-sidebar-group>
    </ssk-sidebar>

    <main>
      <ssk-page-header title="${entity} List">
        <ssk-button slot="action" variant="solid" themeColor="primary">
          + New ${entity}
        </ssk-button>
      </ssk-page-header>

      <!-- Filter bar -->
      <ssk-filter-bar>
        <ssk-input slot="search" placeholder="Search ${entity}..."></ssk-input>
        <ssk-dropdown slot="filter" label="Status"></ssk-dropdown>
        <ssk-date-picker slot="filter" label="Date"></ssk-date-picker>
      </ssk-filter-bar>

      <!-- Data table -->
      <ssk-table sortable selectable>
        <thead>
          <tr>
${colHeaders}
          </tr>
        </thead>
        <tbody>
          <!-- rows — populate with real data -->
        </tbody>
      </ssk-table>

      <!-- Pagination -->
      <ssk-pagination total="100" pageSize="20"></ssk-pagination>
    </main>

  </ssk-app-shell>
</ssk-app-shell-provider>
\`\`\`
${APPSHELL_RULES}${FONT_RULES}`;
    },

    create_product_form: () => {
      const entity = args.entity ?? "Item";
      const fields = args.fields
        ? args.fields.split(",").map((f) => f.trim())
        : ["Name", "Description", "Status", "Date"];
      const submitLabel = args.submitLabel ?? `Save ${entity}`;
      const formFields = fields.map((f) => {
        if (f.toLowerCase().includes("status")) {
          return `        <ssk-dropdown label="${f}" required></ssk-dropdown>`;
        }
        if (f.toLowerCase().includes("date")) {
          return `        <ssk-date-picker label="${f}"></ssk-date-picker>`;
        }
        if (f.toLowerCase().includes("description") || f.toLowerCase().includes("note")) {
          return `        <ssk-textarea label="${f}" placeholder="${f}..."></ssk-textarea>`;
        }
        return `        <ssk-input label="${f}" placeholder="${f}" required></ssk-input>`;
      }).join("\n");
      return `Create a product form page for "${entity}" in Sellsuki with brand="${brand}".

\`\`\`html
<ssk-app-shell-provider brand="${brand}">
  <ssk-app-shell>

    <ssk-sidebar slot="sidebar">
      <ssk-logo slot="logo"></ssk-logo>
      <ssk-sidebar-group>
        <ssk-sidebar-items label="${entity}"></ssk-sidebar-items>
      </ssk-sidebar-group>
    </ssk-sidebar>

    <main>
      <ssk-page-header title="Create ${entity}">
        <ssk-button slot="action" variant="outline">Cancel</ssk-button>
      </ssk-page-header>

      <!-- Validation error alert -->
      <ssk-alert themeColor="danger" hidden id="error-alert">
        กรุณากรอกข้อมูลให้ครบถ้วน
      </ssk-alert>

      <!-- Form card -->
      <ssk-card>
        <ssk-heading slot="header">ข้อมูล ${entity}</ssk-heading>
        <form id="${entity.toLowerCase()}-form"
              style="display: flex; flex-direction: column; gap: 16px; padding: 24px;">
${formFields}
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
            <ssk-button variant="outline" type="button">Cancel</ssk-button>
            <ssk-button variant="solid" themeColor="primary" type="submit">
              ${submitLabel}
            </ssk-button>
          </div>
        </form>
      </ssk-card>
    </main>

  </ssk-app-shell>
</ssk-app-shell-provider>
\`\`\`
${APPSHELL_RULES}${FONT_RULES}`;
    },

    create_analytics_widget: () => {
      const metrics = args.metrics
        ? args.metrics.split(",").map((m) => m.trim())
        : ["Sales", "Orders", "Customers"];
      const chartType = args.chartType ?? "line";
      const chartTag = chartType === "bar" ? "ssk-bar-chart" : chartType === "donut" ? "ssk-donut-chart" : "ssk-line-chart";
      const metricWidgets = metrics.map((m) => `        <ssk-widget-matric label="${m}" subText="vs last period"></ssk-widget-matric>`).join("\n");
      return `Create an analytics dashboard for Sellsuki product with brand="${brand}".

Metrics: ${metrics.join(", ")} — Chart: ${chartType}

\`\`\`html
<ssk-app-shell-provider brand="${brand}">
  <ssk-app-shell>

    <ssk-sidebar slot="sidebar">
      <ssk-logo slot="logo"></ssk-logo>
      <ssk-sidebar-group>
        <ssk-sidebar-items label="Analytics" active></ssk-sidebar-items>
        <ssk-sidebar-items label="Reports"></ssk-sidebar-items>
      </ssk-sidebar-group>
    </ssk-sidebar>

    <main>
      <ssk-page-header title="Analytics">
        <ssk-button slot="action" variant="outline">Export</ssk-button>
      </ssk-page-header>

      <!-- Date filter -->
      <ssk-filter-bar>
        <ssk-date-picker slot="filter" label="Period" range></ssk-date-picker>
        <ssk-dropdown slot="filter" label="Compare"></ssk-dropdown>
      </ssk-filter-bar>

      <!-- Metric widgets -->
      <ssk-widget-grid>
${metricWidgets}
      </ssk-widget-grid>

      <!-- Chart -->
      <ssk-card style="margin-top: 24px;">
        <ssk-heading slot="header">${metrics[0]} Trend</ssk-heading>
        <${chartTag}
          labels='["Jan","Feb","Mar","Apr","May","Jun"]'
          datasets='[{"label":"${metrics[0]}","data":[0,0,0,0,0,0]}]'>
        </${chartTag}>
      </ssk-card>

      <!-- Breakdown table -->
      <ssk-card style="margin-top: 24px;">
        <ssk-heading slot="header">Breakdown</ssk-heading>
        <ssk-table sortable>
          <thead>
            <tr>
              <th>Period</th>
              ${metrics.map((m) => `<th>${m}</th>`).join("")}
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <!-- populate with real data -->
          </tbody>
        </ssk-table>
      </ssk-card>
    </main>

  </ssk-app-shell>
</ssk-app-shell-provider>
\`\`\`

Use get_component for ssk-widget-matric, ${chartTag} to fill actual props.
${APPSHELL_RULES}${FONT_RULES}`;
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
