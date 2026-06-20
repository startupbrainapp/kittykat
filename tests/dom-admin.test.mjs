// DOM smoke test for the Settings/Admin pages wired to KK.admin.
// Loads data.js + data-admin.js + each page's inline scripts in true document
// order (avoids the jsdom async external-<script> race), then asserts each page
// renders from engine state and reacts to a representative action.
// Run: npm run test:dom:admin   (requires jsdom)
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const ROOT = path.join(import.meta.dirname, "..");
const base = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
const ext = fs.readFileSync(path.join(ROOT, "data-admin.js"), "utf8");

let pass = 0;
const fail = [];
const ok = (c, l) => (c ? (pass++, console.log("  ✓ " + l)) : (fail.push(l), console.log("  ✗ " + l)));

const geval = eval; // indirect eval -> runs in global scope (sees globalThis.window etc.)

function loadPage(file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const dom = new JSDOM(html, { url: "http://localhost/" + file });
  const w = dom.window;
  // wire Node globals to this page's window so bare `window`/`document`/`KK` resolve
  globalThis.window = w;
  globalThis.document = w.document;
  globalThis.localStorage = w.localStorage;
  globalThis.Event = w.Event;
  globalThis.confirm = () => true;
  globalThis.alert = () => {};
  globalThis.prompt = () => null;
  w.localStorage.clear();
  geval(base);
  geval(ext);
  globalThis.KK = w.KK; // inline scripts reference KK bare
  // run every inline (no-src) script in document order
  w.document.querySelectorAll("script").forEach((s) => {
    if (!s.src && s.textContent.trim()) {
      try { geval(s.textContent); } catch (e) { fail.push(file + " inline script threw: " + e.message); }
    }
  });
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  return w;
}

console.log("admin.html");
{
  const w = loadPage("admin.html");
  const d = w.document;
  ok(d.querySelectorAll(".int-card").length === 6, "renders 6 integration cards");
  ok(d.querySelectorAll(".audit-table tbody tr").length === 8, "renders 8 audit rows");
  const connBefore = w.KK.admin.integrations().filter((i) => i.connected).length;
  w.KK.admin.setIntegration("meta", false);
  ok(w.KK.admin.integrations().filter((i) => i.connected).length === connBefore - 1, "disconnect updates engine");
  ok(w.KK.admin.audit()[0].action.includes("Disconnected Meta"), "disconnect logged to audit");
}

console.log("team.html");
{
  const w = loadPage("team.html");
  const d = w.document;
  ok(d.querySelectorAll(".team-table tbody tr").length === 7, "renders 7 member rows");
  ok(d.querySelectorAll(".pending-table tbody tr").length === 2, "renders 2 pending invites");
  w.KK.admin.invite("dom-test@bape.com", "Analyst");
  ok(w.KK.admin.invites().length === 3, "invite adds a pending invite in engine");
}

console.log("presets.html");
{
  const w = loadPage("presets.html");
  const d = w.document;
  ok(d.querySelectorAll(".template-card").length === 3, "renders 3 template cards");
  ok(d.querySelectorAll(".export-card").length === 4, "renders 4 export formats");
  ok(d.querySelectorAll(".audience-row").length === 5, "renders 5 audience rows");
  ok(d.querySelectorAll(".weight-row").length === 4, "renders 4 weight rows");
  w.KK.admin.addTemplate({ title: "DOM Template" });
  ok(w.KK.admin.templates().length === 4, "addTemplate updates engine");
}

console.log("brand_setup_v2.html");
{
  const w = loadPage("brand_setup_v2.html");
  ok(!!(w.KK && w.KK.admin), "KK.admin present on page");
  ok(w.KK.admin.dataSources().length === 10, "engine seeds 10 data sources");
  ok(w.KK.admin.dataSourceGroups().length === 4, "4 data source groups");
}

console.log(`\n${pass} passed, ${fail.length} failed`);
if (fail.length) { console.log("FAILED:\n  " + fail.join("\n  ")); process.exit(1); }
