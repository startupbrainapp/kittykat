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
ok(w.KK.briefs().length === 12, "12 seed briefs loaded");
ok(w.document.querySelectorAll("#briefList .brief-row").length === w.KK.briefs().filter((x) => x.status !== "shipped" && !x.archived).length, "Active view shows in-flight briefs (shipped excluded)");
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
ok(w.KK.briefs().length === 13, "create brief via form adds a 13th brief");
ok(w.document.querySelectorAll("#briefList .brief-row").length === w.KK.briefs().filter((x) => x.status !== "shipped" && !x.archived).length, "new draft brief appears in the Active view");
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

// Active excludes shipped; the Shipped pill lists only shipped
const shippedExpected = w.KK.briefs().filter((x) => x.status === "shipped" && !x.archived).length;
w.setBriefView("shipped");
ok(shippedExpected > 0 && w.document.querySelectorAll("#briefList .brief-row").length === shippedExpected, "Shipped pill lists only shipped briefs");
w.setBriefView("active");
const activeExpected = w.KK.briefs().filter((x) => x.status !== "shipped" && !x.archived).length;
ok(w.document.querySelectorAll("#briefList .brief-row").length === activeExpected, "Active view excludes shipped briefs");
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
ok(![...aw.document.querySelectorAll("#campaignFolders .folder-name")].some((n) => n.textContent === "All assets"), "no 'All assets' folder");
aw.openCampaign("Tokyo After Dark");
ok(aw.document.querySelectorAll("#assetGrid .asset-tile").length === 4, "opening a campaign folder shows its assets");
ok(aw.document.querySelectorAll("#assetGrid .brief-subheader").length === 0 && !!aw.document.getElementById("fBrief"), "campaign view is a flat grid with a Brief filter");
aw.backToFolders();
ok(aw.document.getElementById("campaignFolders").style.display !== "none", "breadcrumb returns to folder view");
// asset drawer uses the aligned per-brief actions (no old "Open in Creator Studio" wording)
aw.openDrawer(13); // a production-status asset
const amFooter = aw.document.getElementById("drawerFooter").textContent;
ok(/Submit to Reviews/.test(amFooter) && /Edit more/.test(amFooter) && !/Open in Creator Studio/.test(amFooter), "asset drawer footer matches the per-brief model");

const a2 = loadPage("asset_manager.html", { query: "?brief=neon-abc" });
const a2w = a2.dom.window;
ok(a2w.document.getElementById("assetsView").style.display !== "none" && a2w.document.querySelectorAll("#assetGrid .asset-tile").length > 0, "Studio deep-link drills into the brief's campaign folder");
ok(a2w.document.getElementById("amBreadcrumbCurrent").textContent === "Tokyo After Dark", "deep-link breadcrumb shows the brief's campaign");

// Studio -> Asset Manager loop: a brief generated in Studio (tiles) shows up here
const loopState = {
  briefs: [{
    id: "loop-test", name: "Loop Test Brief", status: "production", statusLabel: "In Production",
    campaign: "Loop Test Campaign", assignee: "Grace L.", initial: "G",
    assetsDone: 0, assetsTotal: 8, due: "TBD", desc: "", deliverables: [],
    tiles: [1, 2, 3, 4, 5, 6, 7, 8], finalSelects: [],
  }],
  customCampaigns: [],
};
const a3 = loadPage("asset_manager.html", { seedState: loopState });
const a3w = a3.dom.window;
const loopFolders = [...a3w.document.querySelectorAll("#campaignFolders .folder-name")].map((n) => n.textContent);
ok(loopFolders.includes("Loop Test Campaign"), "Studio-generated brief surfaces as a campaign folder (loop closed)");
a3w.openCampaign("Loop Test Campaign");
ok(a3w.document.querySelectorAll("#assetGrid .asset-tile").length === 8, "generated tiles appear as assets under the brief");
ok(a3w.document.querySelectorAll("#assetGrid .brief-subheader").length === 0, "campaign drill-in is a flat grid (no sub-folders)");
a3w.submitBrief("loop-test");
ok(a3w.KK.brief("loop-test").status === "review", "submitting from Asset Manager moves the brief into review");

// Final-select markers are visible + Submit is count-aware
const selState = {
  briefs: [{
    id: "sel-test", name: "Sel Test", status: "production", statusLabel: "In Production",
    campaign: "Sel Camp", assignee: "Grace L.", initial: "G", assetsDone: 0, assetsTotal: 8,
    due: "TBD", desc: "", deliverables: [], tiles: [1, 2, 3, 4, 5, 6, 7, 8],
    finalSelects: ["images/1.jpg", "images/2.jpg"],
  }],
  customCampaigns: [],
};
const a4w = loadPage("asset_manager.html", { query: "?brief=sel-test", seedState: selState }).dom.window;
ok(a4w.document.querySelectorAll("#assetGrid .asset-fav.on").length === 2, "selected assets show a filled heart in the Asset Manager");
const selBar = a4w.document.getElementById("briefBar");
ok(selBar && selBar.style.display !== "none" && /Submit 2 selects to Reviews/.test(selBar.textContent), "campaign submit bar shows the select count");

// "+N new" badge on campaign folders for freshly generated assets, clears on open
const badgeW = loadPage("asset_manager.html", { seedState: loopState }).dom.window;
const lc = [...badgeW.document.querySelectorAll("#campaignFolders .campaign-folder")].find((c) => c.querySelector(".folder-name").textContent === "Loop Test Campaign");
ok(lc && /\+8 new/.test(lc.textContent), "campaign folder shows '+N new' for freshly generated assets");
badgeW.openCampaign("Loop Test Campaign");
badgeW.backToFolders();
const lc2 = [...badgeW.document.querySelectorAll("#campaignFolders .campaign-folder")].find((c) => c.querySelector(".folder-name").textContent === "Loop Test Campaign");
ok(lc2 && !/new/.test(lc2.textContent), "'+N new' badge clears after opening the campaign");

console.log(`\n${pass} passed, ${fail.length} failed`);
if (fail.length) { console.log("FAILED: " + fail.join(" | ")); process.exit(1); }
