// Real-DOM (jsdom) smoke across the wired execution pages. Run: npm run test:dom
// Requires jsdom (npm install). Loads each page, runs its real scripts, asserts behavior.
import { JSDOM, VirtualConsole } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const dataJs = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");

let pass = 0;
const fail = [];
const ok = (c, l) => (c ? (pass++, console.log("  ✓ " + l)) : (fail.push(l), console.log("  ✗ " + l)));

function loadPage(file, { query = "", seedState = null } = {}) {
  let html = fs.readFileSync(path.join(ROOT, file), "utf8");
  html = html.replace(/<script src="data\.js"><\/script>/, `<script>\n${dataJs}\n</script>`);
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message || String(e)));
  const dom = new JSDOM(html, {
    url: `https://kk.test/${file}${query}`,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      if (seedState) window.localStorage.setItem("kk_state_v1", JSON.stringify(seedState));
      else window.localStorage.clear();
    },
  });
  return { dom, errors };
}

// ---- briefs.html ----
console.log("briefs.html");
const b = loadPage("briefs.html");
const w = b.dom.window;
ok(b.errors.length === 0, "loads with no script errors" + (b.errors[0] ? " -> " + b.errors[0] : ""));
ok(w.document.querySelectorAll("#briefList .brief-row").length === 12, "renders 12 seed briefs");
w.openNewBrief();
w.nbOpenRefPicker();
const thumb = w.document.querySelector('#nbMenu div[title="images/2.jpg"]');
ok(!!thumb, "reference picker offers a Visual Vault to choose from");
if (thumb) thumb.click();
ok(w.nbState.refs.includes("images/2.jpg"), "reference is user-chosen, not auto");
w.document.getElementById("nbTitle").value = "DOM Test Brief";
w.nbSetCampaign("SS26 · Hana Matsuri");
w.nbSetAssignee("Grace L.");
w.nbSave("draft");
ok(w.KK.briefs().length === 13 && w.document.querySelectorAll("#briefList .brief-row").length === 13, "create brief via form -> 13 rows");
const created = w.KK.briefs()[0];
const createdState = JSON.parse(w.localStorage.getItem("kk_state_v1"));

// edit a brief
w.openEditBrief(created.id);
ok(w.document.getElementById("nbTitle").value === created.name, "edit prefills the title");
w.document.getElementById("nbTitle").value = "Edited Title";
w.nbSave("production"); // edit mode updates (no navigation)
ok(w.KK.brief(created.id).name === "Edited Title", "edit saves via updateBrief");

// favourite + view filter
w.toggleBriefFav(created.id);
ok(w.KK.isFavourite(created.id), "favourite toggles on");
w.setBriefView("favourites");
ok(w.document.querySelectorAll("#briefList .brief-row").length >= 1, "favourites view lists favourited briefs");

// archive hides from active view
w.archiveBrief(created.id);
w.setBriefView("active");
const archivedShows = Array.from(w.document.querySelectorAll("#briefList .brief-name")).some((n) => n.textContent === "Edited Title");
ok(!archivedShows, "archived brief is hidden from the Active view");
w.setBriefView("active"); // reset view

// ---- creator_studio.html ----
console.log("creator_studio.html");
const s = loadPage("creator_studio.html", { query: `?brief=${created.id}`, seedState: createdState });
const sw = s.dom.window;
ok(s.errors.length === 0, "loads with no script errors" + (s.errors[0] ? " -> " + s.errors[0] : ""));
ok(sw.KK.brief(created.id) !== null, "studio resolves ?brief=");
if (typeof sw.generateAssets === "function") sw.generateAssets();
ok(sw.KK.brief(created.id).tiles.length >= 8, "generate produces assets");
sw.KK.toggleFinal(created.id, "images/" + sw.KK.brief(created.id).tiles[0] + ".jpg");
ok(sw.KK.finalSelects(created.id).length >= 1, "hearting records a final select");

// ---- share.html (client-facing selects view) ----
console.log("share.html");
const shareRec = sw.KK.exportSelects(created.id, "Client Picks");
const shState = JSON.parse(sw.localStorage.getItem("kk_state_v1"));
const sh = loadPage("share.html", { query: `?s=${shareRec.id}`, seedState: shState });
ok(sh.errors.length === 0, "share view loads with no script errors" + (sh.errors[0] ? " -> " + sh.errors[0] : ""));
ok(sh.dom.window.document.querySelector(".hero-title").textContent.includes("Client Picks"), "share view shows the folder name");
ok(sh.dom.window.document.querySelectorAll(".grid .tile").length >= 1, "share view renders the curated winners");
const badShare = loadPage("share.html", { query: "?s=nope" });
ok(badShare.dom.window.document.querySelector(".empty"), "unknown share link shows a friendly empty state");

// ---- reviews.html ----
console.log("reviews.html");
const r = loadPage("reviews.html");
const rw = r.dom.window;
ok(r.errors.length === 0, "loads with no script errors" + (r.errors[0] ? " -> " + r.errors[0] : ""));
ok(rw.document.querySelectorAll("#reviewList > *").length > 0, "review queue renders");
const rb = rw.KK.reviewBriefs()[0];
if (rb && typeof rw.approveBrief === "function") { rw.approveBrief(rb.id); ok(rw.KK.brief(rb.id).status === "shipped", "approve -> shipped"); }
else ok(false, "approveBrief available");

// ---- asset_manager.html ----
console.log("asset_manager.html");
const a = loadPage("asset_manager.html");
const aw = a.dom.window;
ok(a.errors.length === 0, "loads with no script errors" + (a.errors[0] ? " -> " + a.errors[0] : ""));
ok(aw.document.querySelectorAll("#campaignFolders .campaign-folder").length > 0, "campaign folders render by default");
aw.openCampaign("Tokyo After Dark");
ok(aw.document.querySelectorAll("#assetGrid .asset-tile").length === 4, "opening a campaign folder shows its assets");
aw.backToFolders();
ok(aw.document.getElementById("campaignFolders").style.display !== "none", "breadcrumb returns to folder view");

const a2 = loadPage("asset_manager.html", { query: "?brief=neon-abc" });
ok(a2.dom.window.document.querySelectorAll("#assetGrid .asset-tile").length > 0, "brief deep-link lands straight on filtered assets");

console.log(`\n${pass} passed, ${fail.length} failed`);
if (fail.length) { console.log("FAILED: " + fail.join(" | ")); process.exit(1); }
