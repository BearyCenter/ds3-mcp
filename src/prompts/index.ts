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
];

export function getPrompt(name: string, args: Record<string, string> = {}): { messages: { role: "user"; content: { type: "text"; text: string } }[] } {
  const brand = args.brand ?? "ccs3";

  const templates: Record<string, () => string> = {
    create_login_form: () => {
      const extra = args.fields ? args.fields.split(",").map((f) => f.trim()) : [];
      const extraInputs = extra.map((f) => `      <ssk-input label="${f}" placeholder="${f}"></ssk-input>`).join("\n");
      return `Create a login form using DS 3.0 ssk-* Web Components with brand="${brand}".\n\nUse this exact structure:\n\n\`\`\`html\n<ssk-theme-provider brand="${brand}">\n  <ssk-card>\n    <ssk-heading slot="header">เข้าสู่ระบบ</ssk-heading>\n    <form>\n      <ssk-input label="Email" type="email" required></ssk-input>\n      <ssk-input label="Password" type="password" required></ssk-input>\n${extraInputs}\n      <ssk-checkbox label="Remember me"></ssk-checkbox>\n      <ssk-button variant="solid" themeColor="primary" type="submit">เข้าสู่ระบบ</ssk-button>\n      <ssk-button variant="ghost">ลืมรหัสผ่าน?</ssk-button>\n    </form>\n  </ssk-card>\n</ssk-theme-provider>\n\`\`\`\n\nFollow these rules:\n- All tags MUST be ssk-* (not ds-*)\n- Use design tokens (--ssk-spacing-*, --ssk-font-size-*) for any custom CSS\n- Use themeColor prop for danger/success/warning, NOT variant\n- Wrap with ssk-theme-provider\n`;
    },

    create_dashboard: () => {
      const metrics = args.metrics ? args.metrics.split(",").map((m) => m.trim()) : ["Sales", "Orders", "Customers"];
      const stats = metrics.map((m) => `      <ssk-card>\n        <ssk-text>${m}</ssk-text>\n        <ssk-heading>0</ssk-heading>\n      </ssk-card>`).join("\n");
      return `Create a dashboard page using DS 3.0 ssk-* with brand="${brand}".\n\nMetrics: ${metrics.join(", ")}\n\n\`\`\`html\n<ssk-theme-provider brand="${brand}">\n  <ssk-app-shell>\n    <ssk-page-header title="Dashboard"></ssk-page-header>\n    <ssk-filter-bar>\n      <ssk-date-picker slot="filter" label="Period"></ssk-date-picker>\n    </ssk-filter-bar>\n    <ssk-widget-grid>\n${stats}\n      <ssk-line-chart></ssk-line-chart>\n      <ssk-bar-chart></ssk-bar-chart>\n      <ssk-donut-chart></ssk-donut-chart>\n    </ssk-widget-grid>\n  </ssk-app-shell>\n</ssk-theme-provider>\n\`\`\`\n\nUse get_component for each tag to fill in actual props (data, labels).`;
    },

    create_crud_page: () => {
      const entity = args.entity ?? "Item";
      return `Create a full CRUD page for "${entity}" using DS 3.0 with brand="${brand}".\n\nInclude: list view, create modal, edit modal, delete confirmation.\n\n\`\`\`html\n<ssk-theme-provider brand="${brand}">\n  <ssk-app-shell>\n    <ssk-page-header title="${entity} List">\n      <ssk-button slot="action" variant="solid" themeColor="primary" id="btn-create">+ New ${entity}</ssk-button>\n    </ssk-page-header>\n    <ssk-filter-bar>\n      <ssk-input slot="search" placeholder="Search ${entity}..."></ssk-input>\n    </ssk-filter-bar>\n    <ssk-table id="${entity.toLowerCase()}-table" sortable selectable></ssk-table>\n    <ssk-pagination></ssk-pagination>\n\n    <ssk-modal id="create-modal">\n      <ssk-heading slot="header">Create ${entity}</ssk-heading>\n      <!-- form fields here -->\n      <ssk-button slot="footer" variant="outline">Cancel</ssk-button>\n      <ssk-button slot="footer" variant="solid" themeColor="primary">Save</ssk-button>\n    </ssk-modal>\n  </ssk-app-shell>\n</ssk-theme-provider>\n\`\`\``;
    },

    create_settings_page: () =>
      `Create a settings page using DS 3.0 with brand="${brand}".\n\n\`\`\`html\n<ssk-theme-provider brand="${brand}">\n  <ssk-app-shell>\n    <ssk-page-header title="Settings"></ssk-page-header>\n    <ssk-tabs>\n      <ssk-tab label="Profile">\n        <ssk-card>\n          <ssk-input label="Name"></ssk-input>\n          <ssk-input label="Email" type="email"></ssk-input>\n          <ssk-button variant="solid" themeColor="primary">Save</ssk-button>\n        </ssk-card>\n      </ssk-tab>\n      <ssk-tab label="Security">\n        <ssk-card>\n          <ssk-input label="Current password" type="password"></ssk-input>\n          <ssk-input label="New password" type="password"></ssk-input>\n          <ssk-button variant="solid" themeColor="primary">Update password</ssk-button>\n        </ssk-card>\n      </ssk-tab>\n      <ssk-tab label="Notifications">\n        <ssk-toggle label="Email notifications"></ssk-toggle>\n        <ssk-toggle label="SMS notifications"></ssk-toggle>\n      </ssk-tab>\n    </ssk-tabs>\n  </ssk-app-shell>\n</ssk-theme-provider>\n\`\`\``,

    create_landing_page: () => {
      const product = args.product ?? "Sellsuki";
      return `Create a marketing landing page for "${product}" using DS 3.0 with brand="${brand}".\n\n\`\`\`html\n<ssk-theme-provider brand="${brand}">\n  <ssk-top-navbar>\n    <ssk-logo slot="logo"></ssk-logo>\n    <ssk-button slot="action" variant="solid" themeColor="primary">Sign up</ssk-button>\n  </ssk-top-navbar>\n\n  <section style="padding: var(--ssk-spacing-xl);">\n    <ssk-heading size="xl">${product} — เริ่มต้นใช้งาน</ssk-heading>\n    <ssk-text>คำอธิบายสั้น ๆ เกี่ยวกับ ${product}</ssk-text>\n    <ssk-button variant="solid" themeColor="primary" size="lg">Get started</ssk-button>\n  </section>\n\n  <section>\n    <ssk-widget-grid>\n      <ssk-card>Feature 1</ssk-card>\n      <ssk-card>Feature 2</ssk-card>\n      <ssk-card>Feature 3</ssk-card>\n    </ssk-widget-grid>\n  </section>\n</ssk-theme-provider>\n\`\`\``;
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
