/**
 * Auto-sync component metadata from @uxuissk/design-system-core npm package
 * Usage: npm run sync
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PKG_DIR = path.join(ROOT, "node_modules", "@uxuissk", "design-system-core");
const DTS_PATH = path.join(PKG_DIR, "dist", "main.d.ts");
const PKG_JSON_PATH = path.join(PKG_DIR, "package.json");
const OUT_COMPONENTS = path.join(ROOT, "src", "data", "components.json");

// PascalCase → kebab-case
function toKebab(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

interface PropInfo {
  name: string;
  type: string;
  default?: string;
  optional: boolean;
}

interface ComponentInfo {
  tag: string;
  className: string;
  category: string;
  description: string;
  props: PropInfo[];
}

// Heuristic: assign category from class name
function categoryFor(className: string): string {
  const map: Record<string, string> = {
    Button: "Form & Input",
    Input: "Form & Input",
    Textarea: "Form & Input",
    Checkbox: "Form & Input",
    Radio: "Form & Input",
    Toggle: "Form & Input",
    Dropdown: "Form & Input",
    InputTag: "Form & Input",
    PinCode: "Form & Input",
    Calendar: "Form & Input",
    DatePicker: "Form & Input",
    Badge: "Data Display",
    Tag: "Data Display",
    Avatar: "Data Display",
    Card: "Data Display",
    Table: "Data Display",
    Timeline: "Data Display",
    Image: "Data Display",
    DateDisplay: "Data Display",
    Alert: "Feedback",
    Toast: "Feedback",
    Spinner: "Feedback",
    Skeleton: "Feedback",
    Tooltip: "Feedback",
    ProgressBar: "Feedback",
    Modal: "Overlay",
    Drawer: "Overlay",
    Menu: "Navigation",
    Sidebar: "Navigation",
    TopNavbar: "Navigation",
    Tabs: "Navigation",
    Stepper: "Navigation",
    Accordion: "Navigation",
    Container: "Layout",
    Divider: "Layout",
    AppShell: "Layout",
    PageHeader: "Layout",
    LineChart: "Charts",
    BarChart: "Charts",
    DonutChart: "Charts",
    ThemeProvider: "Foundation",
    AppShellProvider: "Foundation",
    I18nProvider: "Foundation",
    ToastProvider: "Foundation",
    Icon: "Foundation",
    Logo: "Foundation",
    Heading: "Typography",
    Text: "Typography",
  };
  return map[className] ?? "Other";
}

function extractClassDescription(node: ts.ClassDeclaration): string {
  const tags = ts.getJSDocTags(node);
  const summary = tags.find((t) => t.tagName.text === "summary");
  if (summary && typeof summary.comment === "string") return summary.comment;

  const jsDoc = (node as any).jsDoc?.[0];
  if (jsDoc?.comment) {
    return typeof jsDoc.comment === "string" ? jsDoc.comment : "";
  }
  return "";
}

function extractPropType(decl: ts.PropertyDeclaration): string {
  if (decl.type) {
    return decl.type.getText().replace(/\s+/g, " ").trim();
  }
  return "any";
}

function extractDefault(decl: ts.PropertyDeclaration): string | undefined {
  if (decl.initializer) {
    return decl.initializer.getText();
  }
  return undefined;
}

function isPublicProp(decl: ts.PropertyDeclaration): boolean {
  if (!decl.modifiers) return true;
  return !decl.modifiers.some(
    (m) =>
      m.kind === ts.SyntaxKind.PrivateKeyword ||
      m.kind === ts.SyntaxKind.ProtectedKeyword ||
      m.kind === ts.SyntaxKind.StaticKeyword,
  );
}

function isLitElementClass(node: ts.ClassDeclaration): boolean {
  return (
    node.heritageClauses?.some((h) =>
      h.types.some((t) => {
        const name = t.expression.getText();
        return name === "LitElement" || name.endsWith("Element");
      }),
    ) ?? false
  );
}

function parseClass(node: ts.ClassDeclaration): ComponentInfo | null {
  if (!node.name || !isLitElementClass(node)) return null;

  const className = node.name.text;
  const tag = `ssk-${toKebab(className)}`;
  const props: PropInfo[] = [];

  for (const member of node.members) {
    if (ts.isPropertyDeclaration(member) && member.name && isPublicProp(member)) {
      const propName = (member.name as ts.Identifier).text;
      if (!propName || propName.startsWith("_")) continue;
      props.push({
        name: propName,
        type: extractPropType(member),
        default: extractDefault(member),
        optional: !!member.questionToken,
      });
    }
  }

  return {
    tag,
    className,
    category: categoryFor(className),
    description: extractClassDescription(node),
    props,
  };
}

async function main() {
  const pkgJson = JSON.parse(fs.readFileSync(PKG_JSON_PATH, "utf-8"));
  const sourceText = fs.readFileSync(DTS_PATH, "utf-8");
  const sourceFile = ts.createSourceFile(
    "main.d.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const components: ComponentInfo[] = [];
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      const info = parseClass(node);
      if (info) components.push(info);
    }
  });

  components.sort((a, b) => a.tag.localeCompare(b.tag));

  const output = {
    version: pkgJson.version,
    lastSync: new Date().toISOString().split("T")[0],
    total: components.length,
    components,
  };

  fs.writeFileSync(OUT_COMPONENTS, JSON.stringify(output, null, 2));

  console.log(`✓ Synced ${components.length} components from @uxuissk/design-system-core@${pkgJson.version}`);
  console.log(`  → ${OUT_COMPONENTS}`);

  // Summary by category
  const byCategory = components.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nBy category:");
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat.padEnd(20)} ${count}`);
  }
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
