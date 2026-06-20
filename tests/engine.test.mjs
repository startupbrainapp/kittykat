// Tests the data.js client engine (window.KK) in Node with a localStorage shim.
// No dependencies. Run: npm run test:engine
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const code = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = globalThis;
// eslint-disable-next-line no-eval
eval(code);
const KK = globalThis.KK;

let pass = 0;
const fail = [];
const ok = (c, l) => (c ? (pass++, console.log("  ✓ " + l)) : (fail.push(l), console.log("  ✗ " + l)));

KK.reset();
ok(KK.briefs().length === 12, "seed has 12 briefs");
ok(KK.team().length === 4, "team has 4 members");
ok(KK.campaigns().includes("SS26 · Hana Matsuri"), "campaigns derived from briefs");

const before = KK.briefs().length;
const brief = KK.createBrief({
  name: "Engine Test Brief",
  campaign: "New Test Campaign",
  assignee: "Grace L.",
  deliverables: [
    { name: "Instagram Post", spec: "1080×1080", qty: 3 },
    { name: "Story", spec: "1080×1920", qty: 2 },
  ],
});
ok(KK.briefs().length === before + 1, "createBrief adds a brief");
ok(KK.briefs()[0].id === brief.id, "new brief is at top");
ok(brief.status === "draft" && brief.assetsTotal === 5, "draft + assetsTotal summed");
ok(brief.assignee === "Grace L." && brief.initial === "G", "assignee + initial resolved");
ok(KK.campaigns().includes("New Test Campaign"), "new campaign registered");

const added = KK.generate(brief.id, 8);
ok(added.length === 8 && KK.brief(brief.id).tiles.length === 8, "generate adds 8 tiles");
ok(KK.brief(brief.id).status === "production", "draft -> production on generate");

KK.toggleFinal(brief.id, "images/3.jpg");
ok(KK.isFinal(brief.id, "images/3.jpg"), "toggleFinal hearts an asset");
KK.toggleFinal(brief.id, "images/3.jpg");
ok(!KK.isFinal(brief.id, "images/3.jpg"), "toggleFinal un-hearts");

KK.toggleFinal(brief.id, "images/2.jpg");
KK.submitReview(brief.id);
ok(KK.brief(brief.id).status === "review", "submitReview -> review");
ok(KK.reviewBriefs().some((b) => b.id === brief.id), "appears in reviewBriefs");
KK.requestChanges(brief.id, "warmer");
ok(KK.brief(brief.id).status === "production", "requestChanges -> production");
KK.submitReview(brief.id);
KK.approve(brief.id);
ok(KK.brief(brief.id).status === "shipped", "approve -> shipped");

// edit brief
KK.updateBrief(brief.id, { name: "Renamed Brief", assignee: "Sonia M.", deliverables: [{ name: "Web Banner", spec: "1920×600", qty: 4 }] });
ok(KK.brief(brief.id).name === "Renamed Brief", "updateBrief renames");
ok(KK.brief(brief.id).assignee === "Sonia M." && KK.brief(brief.id).initial === "S", "updateBrief reassigns");
ok(KK.brief(brief.id).assetsTotal === 4, "updateBrief recomputes assetsTotal");

// favourite / archive
ok(KK.toggleFavourite(brief.id) === true && KK.isFavourite(brief.id), "toggleFavourite on");
ok(KK.toggleArchive(brief.id) === true && KK.isArchived(brief.id), "toggleArchive on");

// threaded comments
const c = KK.addComment(brief.id, "Looks great", "Kathy S.");
ok(c && KK.comments(brief.id).length === 1, "addComment");
const rep = KK.addReply(brief.id, c.id, "Agreed", "Sonia M.");
ok(rep && KK.comments(brief.id)[0].replies.length === 1, "addReply nests under comment");
ok(KK.addComment(brief.id, "   ") === null, "empty comment rejected");

// selects -> share
KK.toggleFinal(brief.id, "images/4.jpg");
const share = KK.exportSelects(brief.id, "Client Picks");
ok(share && share.url.startsWith("share.html?s="), "exportSelects creates a share link");
ok(KK.getShare(share.id).assets.includes("images/4.jpg"), "share contains the curated winners");
ok(KK.sharesForBrief(brief.id).length === 1, "sharesForBrief lists the share");

const n = KK.briefs().length;
delete globalThis.KK;
eval(code);
ok(globalThis.KK.briefs().length === n, "state persists across reload");

console.log(`\n${pass} passed, ${fail.length} failed`);
if (fail.length) { console.log("FAILED: " + fail.join(", ")); process.exit(1); }
