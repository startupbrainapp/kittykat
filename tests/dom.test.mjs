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
// stat strip is computed live from real brief statuses (not hardcoded)
ok(w.document.getElementById("statActive").textContent === String(w.KK.briefs().filter((x) => x.status !== "shipped" && !x.archived).length), "Active briefs stat is the live in-flight count");
ok(w.document.getElementById("statShipped").textContent === String(w.KK.briefs().filter((x) => x.status === "shipped" && !x.archived).length), "Shipped stat is the live shipped count");
// default order is latest-updated (demo recency), not clustered by status
ok(/Sakura Camo/.test(w.document.querySelector("#briefList .brief-row .brief-name").textContent), "default order leads with the most-recently-updated brief (not status order)");
w.openNewBrief();
w.openVault();
ok(w.document.getElementById("newBriefDrawer").classList.contains("stacked") && w.document.getElementById("vaultSheet").classList.contains("open"), "Visual Vault opens as a stacked sheet over the brief drawer");
ok(w.document.querySelectorAll("#vaultGrid .vault-tile").length > 8 && w.document.querySelectorAll("#vaultFilters .vault-chip").length > 1, "vault has a large grid + filters");
w.vaultToggle("images/2.jpg");
w.vaultAddSelected();
ok(w.nbState.refs.includes("images/2.jpg") && !w.document.getElementById("vaultSheet").classList.contains("open"), "selecting from the vault adds the ref and closes the sheet");
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

// Create a campaign on its own; Campaign is the leading column (no grouping headers)
ok(typeof w.newCampaign === "function" && [...w.document.querySelectorAll(".topbar-right button")].some((b) => /New campaign/.test(b.textContent)), "standalone New campaign action exists");
w.KK.addCampaign("Standalone Test Camp");
w.renderTable();
ok(w.KK.campaigns().includes("Standalone Test Camp"), "New campaign is registered");
const listHtml = w.document.getElementById("briefList").innerHTML;
ok(/Standalone Test Camp/.test(listHtml) && /No briefs yet/.test(listHtml), "a brief-less campaign shows as its own row");
ok(/Standalone Test Camp/.test(w.document.querySelector("#briefList .brief-row .cell-campaign").textContent), "a newly created campaign lands at the TOP of the list");
const hdr = [...w.document.querySelectorAll(".table-header > div")].map((d) => d.textContent);
ok(hdr[0] === "Campaign" && hdr[1] === "Brief", "Campaign is the first column, then Brief");
ok(w.document.querySelectorAll("#briefList .campaign-group-header").length === 0, "no campaign grouping headers");
// list sorts by latest updated — editing a brief bubbles it to the top
w.KK.updateBrief("chrome-milo", { desc: "touched" });
w.renderTable();
ok(/Chrome Milo/.test(w.document.querySelector("#briefList .brief-row .brief-name").textContent), "editing a brief sorts it to the top (latest updated)");

// ---- roles: creator (worker bee) vs approver ----
console.log("roles");
const apprPage = loadPage("briefs.html");
ok(apprPage.dom.window.KK.canApprove() && apprPage.dom.window.document.querySelector('a.nav-item[href$="reviews.html"]').style.display !== "none", "approver (default) sees the Reviews tab + can approve");
const creatorPage = loadPage("briefs.html", { seedState: createdState }).dom.window;
creatorPage.KK.setRole("creator");
creatorPage.KK._applyRoleUI();
ok(creatorPage.KK.isCreator() && !creatorPage.KK.canApprove(), "creator role cannot approve");
ok(creatorPage.document.querySelector('a.nav-item[href$="reviews.html"]').style.display === "none", "creator does not see the Reviews tab");
ok(creatorPage.document.querySelector(".user-item").style.cursor === "pointer", "user chip is wired as a role switcher");
creatorPage.KK.setRole("approver"); // reset so later pages default correctly
// approval actions don't leak: no bulk Approve in Shortlisted; Home approval widget hides for creators
const slBulk = loadPage("asset_manager.html").dom.window;
ok(![...slBulk.document.querySelectorAll(".bulk-btn")].some((b) => b.textContent.trim() === "Approve"), "Shortlisted has no bulk Approve (approval only happens in Reviews)");
const homeCreator = loadPage("home.html").dom.window;
homeCreator.KK.setRole("creator");
homeCreator.KK._applyRoleUI();
const apprWidgets = [...homeCreator.document.querySelectorAll("[data-approver-only]")];
ok(apprWidgets.length > 0 && apprWidgets.every((el) => el.style.display === "none"), "Home 'Pending My Approval' widget hides for creators");
homeCreator.KK.setRole("approver");

// ---- creator_studio.html ----
console.log("creator_studio.html");
const s = loadPage("creator_studio.html", { query: `?brief=${created.id}`, seedState: createdState });
const sw = s.dom.window;
ok(s.errors.length === 0, "loads with no script errors" + (s.errors[0] ? " -> " + s.errors[0] : ""));
ok(sw.KK.brief(created.id) !== null, "studio resolves ?brief=");
ok(sw.document.querySelectorAll("#candGrid .cand").length >= 8, "studio auto-generates 8 concepts on entry");
ok(/starting concepts/.test(sw.document.querySelector("#chatMsgs .bubble").textContent), "chat opens with a contextual KittyKat message");
// Timeline reflects REAL generation history, not dummy data
const tlBefore = sw.document.querySelectorAll("#tlBody .tl-step").length;
ok(tlBefore >= 1 && /generated/.test(sw.document.querySelector("#tlBody .tl-meta").textContent), "Timeline shows real generation batches (count · favorited · time)");
sw.generateAssets();
ok(sw.document.querySelectorAll("#tlBody .tl-step").length === tlBefore + 1, "pressing Generate adds a new timeline batch");
if (typeof sw.generateAssets === "function") sw.generateAssets();
ok(sw.KK.brief(created.id).tiles.length >= 8, "generate produces assets");
sw.KK.toggleFinal(created.id, "images/" + sw.KK.brief(created.id).tiles[0] + ".jpg");
ok(sw.KK.finalSelects(created.id).length >= 1, "hearting records a final select");
// Fullscreen view has a working heart that syncs back to the brief's selects
sw.openFocus(sw.focusList[1]);
const focusFavBtn = sw.document.getElementById("focusFav");
const selectsBefore = sw.KK.finalSelects(created.id).length;
sw.focusFav();
ok(!!focusFavBtn && sw.KK.finalSelects(created.id).length === selectsBefore + 1, "fullscreen heart favorites the viewed image");
// Environment / Person / Products controls save real per-brief settings
sw.backToTriage();
sw.openBlock("environment");
sw.addRef("environment"); // tap + → opens chooser, adds nothing yet
ok(sw.document.getElementById("refPicker").classList.contains("show") && sw.blockDraft.environment.refs.length === 0, "tapping + opens a chooser without auto-adding a reference");
const firstChoice = sw.document.querySelector("#pickerGrid .picker-tile img").getAttribute("src");
sw.pickItem(firstChoice);
sw.document.getElementById("envDesc").value = "Neon Tokyo alley, rain-slick.";
sw.confirmBlock();
const savedEnv = sw.KK.getBlocks(created.id).environment;
ok(savedEnv && savedEnv.refs.length === 1 && savedEnv.refs[0] === firstChoice && /Neon Tokyo/.test(savedEnv.desc), "Environment panel saves the chosen reference + description to the brief");
ok(sw.document.getElementById("pill-environment").classList.contains("set"), "a configured control marks its pill as set");
sw.generateAssets();
ok(sw.KK.history(created.id).slice(-1)[0].scene === savedEnv.desc, "generation records the locked scene that fed it");

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

// ---- asset_manager.html (Shortlisted) ----
console.log("asset_manager.html (Shortlisted)");
const a = loadPage("asset_manager.html");
const aw = a.dom.window;
ok(a.errors.length === 0, "loads with no script errors" + (a.errors[0] ? " -> " + a.errors[0] : ""));
ok(aw.document.querySelectorAll("#assetGrid .asset-tile").length > 0, "renders a flat shortlist grid");
ok(aw.document.getElementById("campaignFolders") === null, "no folder view — flat list only");
ok(/shortlisted/.test(aw.document.getElementById("filterCount").textContent), "count reads 'N shortlisted'");
ok(!!aw.document.getElementById("fCampaign") && aw.document.getElementById("fBrief") === null, "Campaign filter present, Brief filter gone");
// removing from the shortlist drops the tile
const beforeCount = aw.document.querySelectorAll("#assetGrid .asset-tile").length;
aw.unshortlist(aw.LAST_RENDERED[0].id);
ok(aw.document.querySelectorAll("#assetGrid .asset-tile").length === beforeCount - 1, "un-shortlisting removes the asset from the list");

// Only Studio-hearted assets are shortlisted; raw un-hearted generations are excluded
const slState = {
  briefs: [{
    id: "sl-test", name: "SL Test", status: "production", statusLabel: "In Production",
    campaign: "SL Camp", assignee: "Grace L.", initial: "G", assetsDone: 0, assetsTotal: 8,
    due: "TBD", desc: "", deliverables: [], tiles: [1, 2, 3, 4, 5, 6, 7, 8],
    finalSelects: ["images/1.jpg", "images/2.jpg", "images/3.jpg"],
  }],
  customCampaigns: [],
};
const slw = loadPage("asset_manager.html", { seedState: slState }).dom.window;
const slTiles = [...slw.document.querySelectorAll("#assetGrid .asset-overlay-name")].filter((n) => /SL Test/.test(n.textContent));
ok(slTiles.length === 3, "only the 3 hearted Studio assets are shortlisted (raw generations excluded)");

// Duplicate stock images don't flood the shortlist — collapse to one per hearted image
const dupTiles = [];
for (let i = 0; i < 56; i++) dupTiles.push((i % 8) + 1);
const dupState = {
  briefs: [{
    id: "dup", name: "Dup Brief", status: "production", statusLabel: "In Production",
    campaign: "Dup Camp", assignee: "G", initial: "G", assetsTotal: 56,
    tiles: dupTiles, finalSelects: ["images/1.jpg", "images/2.jpg"],
  }],
  customCampaigns: [],
};
const dupw = loadPage("asset_manager.html", { seedState: dupState }).dom.window;
const dupShown = dupw.LAST_RENDERED.filter((a) => a.brief === "Dup Brief");
ok(dupShown.length === 2, "shortlist collapses 56 duplicate tiles to 2 distinct hearted images");

// batch Send to Reviews submits the selected briefs
slw.toggleSelectMode();
slw.bulkSelectAll();
slw.sendSelectedToReviews();
ok(slw.KK.brief("sl-test").status === "review", "batch Send to Reviews moves the brief(s) into review");

console.log(`\n${pass} passed, ${fail.length} failed`);
if (fail.length) { console.log("FAILED: " + fail.join(" | ")); process.exit(1); }
