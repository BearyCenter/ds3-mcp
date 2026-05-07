#!/usr/bin/env node
/**
 * DS 3.0 Vibecode Contract Audit — ds3-mcp templates
 *
 * Iterates every prompt × every brand, extracts HTML code-blocks,
 * runs runContract() on each, and prints a violation report.
 *
 * Exits 0 if 100% pass rate, 1 otherwise — suitable for CI.
 *
 * Usage:
 *   npm run build              # produce dist/
 *   node audit-templates.mjs
 *
 * The contract helper (vibecode-contract.mjs) is copied from
 * @uxuissk/design-system-core/test-utils/vibecode-contract — keep in sync
 * with that package's release.
 */

import { runContract } from "./vibecode-contract.mjs";
import { getPrompt, promptsList } from "./dist/prompts/index.js";

const BRANDS = ["ccs3", "patona", "oc2plus"];

/** Extract first ```html …``` code-block from prompt text. */
function extractHtmlBlock(text) {
  const m = text.match(/```html\n([\s\S]*?)\n```/);
  return m ? m[1] : null;
}

const results = [];

for (const prompt of promptsList) {
  for (const brand of BRANDS) {
    const args = { brand };
    if (prompt.arguments) {
      for (const a of prompt.arguments) {
        if (a.required && a.name !== "brand") {
          args[a.name] =
            a.name === "entity"
              ? "Order"
              : a.name === "featureName"
                ? "Customer Insights"
                : "demo";
        }
      }
    }

    const { messages } = getPrompt(prompt.name, args);
    const html = extractHtmlBlock(messages[0].content.text);

    if (!html) {
      results.push({ prompt: prompt.name, brand, skipped: true });
      continue;
    }

    const templateName = prompt.name.replace(/^create_/, "");
    const result = runContract(html, { templateName, brand });
    results.push({
      prompt: prompt.name,
      brand,
      ok: result.ok,
      violations: result.violations,
    });
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log("\n=== DS 3.0 Vibecode Contract Audit — ds3-mcp templates ===\n");

const grouped = {};
for (const r of results) {
  if (r.skipped) continue;
  if (!grouped[r.prompt]) grouped[r.prompt] = { ok: 0, fail: 0, violations: [] };
  if (r.ok) grouped[r.prompt].ok++;
  else {
    grouped[r.prompt].fail++;
    grouped[r.prompt].violations.push(...r.violations);
  }
}

let totalOk = 0;
let totalFail = 0;
for (const [name, stat] of Object.entries(grouped)) {
  const status = stat.fail === 0 ? "✅" : "❌";
  console.log(
    `${status} ${name.padEnd(28)} ok=${stat.ok}/3 fail=${stat.fail}/3`,
  );
  totalOk += stat.ok;
  totalFail += stat.fail;
}

const total = totalOk + totalFail;
const passRate = total > 0 ? ((totalOk / total) * 100).toFixed(1) : "0.0";
console.log(`\n--- Summary ---`);
console.log(`Pass:  ${totalOk}/${total}`);
console.log(`Fail:  ${totalFail}/${total}`);
console.log(`Rate:  ${passRate}%`);

if (totalFail > 0) {
  console.log("\n=== Sample violations (first failing prompt, ccs3 brand) ===\n");
  const seen = new Set();
  for (const r of results) {
    if (r.skipped || r.ok || r.brand !== "ccs3") continue;
    if (seen.has(r.prompt)) continue;
    seen.add(r.prompt);
    console.log(`📌 ${r.prompt} (${r.brand}):`);
    const unique = new Map();
    for (const v of r.violations) {
      const key = `${v.rule}:${v.ruleLabel}`;
      if (!unique.has(key)) unique.set(key, v);
    }
    for (const v of unique.values()) {
      console.log(`   [rule ${v.rule}/${v.ruleLabel}] ${v.message}`);
    }
    console.log();
  }
}

console.log();
process.exit(totalFail > 0 ? 1 : 0);
