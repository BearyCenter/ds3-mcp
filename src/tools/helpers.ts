import { z } from "zod";
import componentsData from "../data/components.json" with { type: "json" };

// ─── suggest_components ─────────────────────────────────────────────────────

const useCaseKeywords: Record<string, string[]> = {
  "ssk-button": ["click", "action", "submit", "save", "delete", "ปุ่ม", "กด"],
  "ssk-input": ["text", "input", "type", "form", "field", "กรอก", "ป้อน", "ข้อมูล"],
  "ssk-textarea": ["multi", "long text", "description", "ข้อความยาว"],
  "ssk-checkbox": ["check", "multiple choice", "select multiple", "เลือกหลาย"],
  "ssk-radio": ["single choice", "option", "เลือกอย่างเดียว"],
  "ssk-toggle": ["on/off", "switch", "boolean", "เปิด/ปิด"],
  "ssk-dropdown": ["select", "choose", "list", "menu", "เลือกจากรายการ"],
  "ssk-input-tag": ["tags", "multiple values", "chips"],
  "ssk-pin-code": ["otp", "verification", "code", "รหัส"],
  "ssk-calendar": ["date", "calendar", "วันที่"],
  "ssk-date-picker": ["date", "picker", "schedule", "เลือกวันที่"],
  "ssk-badge": ["status", "label", "count", "notification", "ตัวเลข", "สถานะ"],
  "ssk-tag": ["tag", "category", "filter", "หมวดหมู่"],
  "ssk-avatar": ["user", "profile", "picture", "รูปโปรไฟล์"],
  "ssk-card": ["container", "group", "section", "การ์ด"],
  "ssk-table": ["data table", "rows", "columns", "ตาราง"],
  "ssk-timeline": ["history", "events", "progress", "ลำดับ", "ประวัติ"],
  "ssk-alert": ["warning", "error", "info", "message", "แจ้งเตือน"],
  "ssk-toast": ["notification", "success", "popup message", "ข้อความแจ้ง"],
  "ssk-spinner": ["loading", "wait", "loading indicator", "กำลังโหลด"],
  "ssk-skeleton": ["placeholder", "loading content", "skeleton"],
  "ssk-tooltip": ["hint", "info on hover", "explanation", "คำอธิบาย"],
  "ssk-progress-bar": ["progress", "percentage", "loading", "ความคืบหน้า"],
  "ssk-modal": ["dialog", "popup", "overlay", "confirm", "หน้าต่าง"],
  "ssk-drawer": ["side panel", "sidebar drawer", "slide panel"],
  "ssk-menu": ["context menu", "dropdown menu", "เมนู"],
  "ssk-sidebar": ["navigation", "side nav", "main menu", "เมนูข้าง"],
  "ssk-top-navbar": ["header", "top nav", "app bar", "navigation"],
  "ssk-tabs": ["tab", "switch view", "navigation", "แท็บ"],
  "ssk-stepper": ["wizard", "steps", "progress", "ขั้นตอน"],
  "ssk-accordion": ["collapse", "expand", "faq", "พับ"],
  "ssk-container": ["layout", "width", "wrapper"],
  "ssk-divider": ["separator", "line", "เส้นคั่น"],
  "ssk-app-shell": ["layout", "page shell", "main layout", "โครง"],
  "ssk-page-header": ["page title", "header", "หัวข้อหน้า"],
  "ssk-line-chart": ["trend", "time series", "line graph", "กราฟเส้น"],
  "ssk-bar-chart": ["comparison", "bar graph", "กราฟแท่ง"],
  "ssk-donut-chart": ["proportion", "ratio", "percentage", "กราฟวงกลม"],
  "ssk-theme-provider": ["theme", "brand", "wrapper", "required"],
  "ssk-icon": ["icon", "symbol", "ไอคอน"],
};

export const suggestComponentsSchema = z.object({
  useCase: z
    .string()
    .describe("คำอธิบาย use case เช่น 'ผู้ใช้กรอกข้อมูลส่วนตัว' หรือ 'show loading state'"),
  limit: z.number().optional().default(5).describe("จำนวน suggestion สูงสุด"),
});

export function suggestComponents(input: z.infer<typeof suggestComponentsSchema>) {
  const { useCase, limit = 5 } = input;
  const lower = useCase.toLowerCase();
  const scores = new Map<string, number>();

  for (const [tag, keywords] of Object.entries(useCaseKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) score += 1;
    }
    if (score > 0) scores.set(tag, score);
  }

  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sorted.length === 0) {
    return {
      useCase,
      suggestions: [],
      hint: "ไม่พบ component ตรงกับ use case — ลอง keyword อื่นหรือดู list_components",
    };
  }

  return {
    useCase,
    suggestions: sorted.map(([tag, score]) => {
      const comp = componentsData.components.find((c) => c.tag === tag);
      return {
        tag,
        score,
        category: comp?.category ?? "Other",
        description: comp?.description ?? "",
      };
    }),
  };
}

// ─── validate_usage ─────────────────────────────────────────────────────────

const validTags = new Set(componentsData.components.map((c) => c.tag));
const propsByTag = new Map(
  componentsData.components.map((c) => [
    c.tag,
    new Set(c.props.map((p) => p.name.toLowerCase())),
  ]),
);

export const validateUsageSchema = z.object({
  code: z.string().describe("HTML/JSX snippet ที่ใช้ ssk-* tags"),
});

export function validateUsage(input: z.infer<typeof validateUsageSchema>) {
  const { code } = input;
  const issues: Array<{ tag: string; type: string; message: string }> = [];

  // 1. หา tag ทั้งหมด
  const tagPattern = /<(ssk-[a-z][a-z-]*|ds-[a-z][a-z-]*)\b/g;
  const foundTags = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(code)) !== null) {
    foundTags.add(match[1]);
  }

  // 2. ตรวจ tag ที่ไม่มีอยู่จริง
  for (const tag of foundTags) {
    if (tag.startsWith("ds-")) {
      issues.push({
        tag,
        type: "deprecated-prefix",
        message: `Use 'ssk-' prefix instead. DS 3.0 ใช้ 'ssk-*' เป็น canonical (ds-* ถูกลบใน v3.1)`,
      });
    } else if (!validTags.has(tag)) {
      issues.push({
        tag,
        type: "unknown-tag",
        message: `Tag <${tag}> ไม่มีอยู่ใน DS 3.0 — ลอง suggest_components หรือ list_components`,
      });
    }
  }

  // 3. ตรวจ prop ที่ไม่มีอยู่จริงสำหรับแต่ละ tag
  const tagWithPropsPattern = /<(ssk-[a-z][a-z-]*)\s+([^>]*)>/g;
  while ((match = tagWithPropsPattern.exec(code)) !== null) {
    const [, tag, attrsRaw] = match;
    if (!validTags.has(tag)) continue;
    const validProps = propsByTag.get(tag);
    if (!validProps) continue;
    const attrPattern = /(\w[\w-]*)\s*(?:=|\s|$)/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrPattern.exec(attrsRaw)) !== null) {
      const attr = attrMatch[1].toLowerCase();
      // skip standard html attrs and event handlers
      if (
        attr.startsWith("on") ||
        attr.startsWith("data-") ||
        attr.startsWith("aria-") ||
        ["class", "id", "style", "slot"].includes(attr)
      ) continue;
      if (!validProps.has(attr) && !validProps.has(attr.replace(/-/g, ""))) {
        issues.push({
          tag,
          type: "unknown-prop",
          message: `Prop '${attr}' ไม่มีใน <${tag}> — ใช้ get_component('${tag}') ดู prop ที่มี`,
        });
      }
    }
  }

  return {
    valid: issues.length === 0,
    foundTags: Array.from(foundTags),
    issuesCount: issues.length,
    issues,
  };
}

// ─── get_quick_start ────────────────────────────────────────────────────────

export const getQuickStartSchema = z.object({
  framework: z
    .enum(["react", "vue", "vanilla", "all"])
    .optional()
    .default("all")
    .describe("framework ที่ใช้"),
});

export function getQuickStart(input: z.infer<typeof getQuickStartSchema>) {
  const { framework = "all" } = input;
  const guides: Record<string, any> = {
    install: {
      title: "Install",
      command: "npm install @uxuissk/design-system-core",
    },
    bootstrap: {
      title: "Register all components (run once at app entry)",
      code: 'import "@uxuissk/design-system-core";',
    },
    react: {
      title: "Use in React",
      note: "เพิ่ม type declarations เพื่อให้ TypeScript รู้จัก ssk-* tags",
      typeDecl: `declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ssk-button": any;
      "ssk-theme-provider": any;
      // ... more
    }
  }
}`,
      example: `<ssk-theme-provider brand="ccs3">
  <ssk-button variant="solid" themeColor="primary">Click</ssk-button>
</ssk-theme-provider>`,
    },
    vue: {
      title: "Use in Vue",
      note: "Vue เห็น custom elements เป็น component ได้เลย — ไม่ต้อง type decl",
      example: `<ssk-theme-provider brand="ccs3">
  <ssk-button variant="solid" @click="handler">Click</ssk-button>
</ssk-theme-provider>`,
    },
    vanilla: {
      title: "Use in vanilla HTML",
      example: `<script type="module" src="https://unpkg.com/@uxuissk/design-system-core"></script>
<ssk-theme-provider brand="ccs3">
  <ssk-button variant="solid">Click</ssk-button>
</ssk-theme-provider>`,
    },
    note: "ssk-theme-provider จำเป็น — ครอบที่ root ของแอปเสมอเพื่อ inject brand tokens",
  };

  if (framework === "all") return guides;
  return {
    install: guides.install,
    bootstrap: guides.bootstrap,
    [framework]: guides[framework],
    note: guides.note,
  };
}
