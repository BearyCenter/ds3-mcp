/**
 * DS 3.0 Vibecode Contract — public API
 *
 * Used by ds3-mcp (and any other vibecode template generator) to verify that
 * generated HTML output conforms to DS 3.0 standards.
 *
 * @example
 *   import { runContract } from "@uxuissk/design-system-core/test-utils/vibecode-contract";
 *
 *   const result = runContract(html, { templateName: "feature-page", brand: "ccs3" });
 *   if (result.violations.length > 0) {
 *     throw new Error(`Template violates DS 3.0:\n${result.violations.map(v => v.message).join("\n")}`);
 *   }
 */
export const ALLOWED_BRANDS = ["patona", "ccs3", "oc2plus"];
// ── Helpers ──────────────────────────────────────────────────────────────────
/** Strip HTML comments — they're documentation, not enforced output. */
function stripComments(html) {
    return html.replace(/<!--[\s\S]*?-->/g, "");
}
/** Strip everything inside `var(...)` so token references don't count as hex. */
function stripVarCalls(html) {
    return html.replace(/var\([^)]*\)/g, "var(_)");
}
// ── Rule implementations ────────────────────────────────────────────────────
function rule1_rootIsAppShellProvider(body) {
    const trimmed = body.trim();
    if (!trimmed.startsWith("<ssk-app-shell-provider")) {
        return {
            rule: 1,
            ruleLabel: "root-app-shell-provider",
            message: "Root element must be <ssk-app-shell-provider>. Got: " +
                trimmed.slice(0, 80) +
                "…",
        };
    }
    return null;
}
function rule2_brandWhitelistAndMatch(body, meta) {
    const violations = [];
    const m = body.match(/<ssk-app-shell-provider\s+brand="([^"]+)"/);
    if (!m) {
        violations.push({
            rule: 2,
            ruleLabel: "brand-attribute-required",
            message: "<ssk-app-shell-provider> must declare brand attribute",
        });
        return violations;
    }
    const brand = m[1];
    if (!ALLOWED_BRANDS.includes(brand)) {
        violations.push({
            rule: 2,
            ruleLabel: "brand-whitelist",
            message: `brand="${brand}" must be one of ${ALLOWED_BRANDS.join("|")}`,
            snippet: brand,
        });
    }
    if (brand !== meta.brand) {
        violations.push({
            rule: 2,
            ruleLabel: "brand-mismatch",
            message: `brand attribute "${brand}" does not match expected "${meta.brand}"`,
            snippet: brand,
        });
    }
    return violations;
}
function rule3_noHexLiteralsOutsideVar(bodyNoVar) {
    const hex = bodyNoVar.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    return hex.map((h) => ({
        rule: 3,
        ruleLabel: "no-hex-color",
        message: `Hardcoded hex color ${h} — use semantic tokens via var(--bg-*, --fg-*, --text-*)`,
        snippet: h,
    }));
}
function rule4_noFontSizeBelow18(body) {
    const matches = [...body.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)];
    return matches
        .filter((m) => parseFloat(m[1]) < 18)
        .map((m) => ({
        rule: 4,
        ruleLabel: "min-font-size-18px",
        message: `font-size: ${m[1]}px violates DS 3.0 minimum 18px — use var(--font-size-caption) (18px) or larger`,
        snippet: m[0],
    }));
}
function rule5_customTagsMustBeSskPrefix(body) {
    const tags = [...body.matchAll(/<([a-z][a-z0-9]*-[a-z0-9-]*)\b/g)];
    const offenders = new Set();
    for (const m of tags) {
        if (!m[1].startsWith("ssk-"))
            offenders.add(m[1]);
    }
    return [...offenders].map((tag) => ({
        rule: 5,
        ruleLabel: "ssk-tag-prefix",
        message: `Custom-element tag <${tag}> must use ssk-* prefix`,
        snippet: tag,
    }));
}
function rule6_noTailwindForbiddenSize(body) {
    const found = body.match(/\b(text-xs|text-sm)\b/g) ?? [];
    return [...new Set(found)].map((klass) => ({
        rule: 6,
        ruleLabel: "no-forbidden-tailwind-size",
        message: `Tailwind class '${klass}' (${klass === "text-xs" ? "12px" : "14px"}) violates DS 3.0 minimum 18px`,
        snippet: klass,
    }));
}
function rule7_buttonUsesVariantTone(body) {
    const violations = [];
    const buttons = [...body.matchAll(/<ssk-button\b[^>]*>/gi)].map((m) => m[0]);
    // Match camelCase, kebab-case, lowercase variants — HTML attrs are case-insensitive
    const LEGACY = /\b(themecolor|theme-color|backgroundcolor|background-color|fontsize|font-size)=/i;
    for (const btn of buttons) {
        if (LEGACY.test(btn)) {
            violations.push({
                rule: 7,
                ruleLabel: "button-no-legacy-props",
                message: "<ssk-button> must use variant+tone, not legacy themeColor/backgroundColor/fontSize",
                snippet: btn,
            });
        }
        if (!/\bvariant=/i.test(btn)) {
            violations.push({
                rule: 7,
                ruleLabel: "button-explicit-variant",
                message: '<ssk-button> should declare explicit variant="solid|outline|ghost|solid-light"',
                snippet: btn,
            });
        }
    }
    return violations;
}
// ── Public API ───────────────────────────────────────────────────────────────
/**
 * Validate a vibecode template HTML against DS 3.0 contract rules.
 *
 * @param html  Generated HTML output (full document or fragment).
 * @param meta  { templateName, brand } — brand must be in the allowed set.
 * @returns     { ok, violations, meta } — ok=true means zero violations.
 */
export function runContract(html, meta) {
    const body = stripComments(html);
    const bodyNoVar = stripVarCalls(body);
    const violations = [];
    const r1 = rule1_rootIsAppShellProvider(body);
    if (r1)
        violations.push(r1);
    violations.push(...rule2_brandWhitelistAndMatch(body, meta));
    violations.push(...rule3_noHexLiteralsOutsideVar(bodyNoVar));
    violations.push(...rule4_noFontSizeBelow18(body));
    violations.push(...rule5_customTagsMustBeSskPrefix(body));
    violations.push(...rule6_noTailwindForbiddenSize(body));
    violations.push(...rule7_buttonUsesVariantTone(body));
    return {
        ok: violations.length === 0,
        violations,
        meta,
    };
}
/**
 * Brand-switching contract — verify two templates have identical structure
 * apart from the `brand` attribute on the provider. This guarantees that
 * brand switching at runtime does not require structural changes.
 */
export function compareBrandSwitching(htmlA, htmlB) {
    const normalize = (h) => stripComments(h).replace(/(<ssk-app-shell-provider\s+brand=)"[^"]+"/, '$1"_"');
    const a = normalize(htmlA);
    const b = normalize(htmlB);
    if (a === b)
        return { ok: true };
    return {
        ok: false,
        reason: "Templates differ beyond just the brand attribute. Brand-switching " +
            "requires structurally identical output across brands.",
    };
}
