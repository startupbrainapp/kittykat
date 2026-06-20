// Tests the KK.admin engine extension (data-admin.js) in Node with a localStorage shim.
// No dependencies. Run: npm run test:admin
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const base = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
const ext = fs.readFileSync(path.join(ROOT, "data-admin.js"), "utf8");

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = globalThis;
// eslint-disable-next-line no-eval
eval(base);
eval(ext);
const KK = globalThis.KK;

let pass = 0;
const fail = [];
const ok = (c, l) => (c ? (pass++, console.log("  ✓ " + l)) : (fail.push(l), console.log("  ✗ " + l)));

KK.admin.reset();

// --- Team ---
ok(KK.admin.members().length === 7, "seed has 7 members");
ok(KK.admin.roles().includes("Designer"), "roles list available");
const m = KK.admin.addMember({ email: "newbie@bape.com", role: "Designer" });
ok(KK.admin.members().length === 8 && m.name === "Newbie", "addMember derives name from email");
KK.admin.updateMember(m.id, { role: "Analyst" });
ok(KK.admin.member(m.id).role === "Analyst", "updateMember changes role");
ok(KK.admin.audit()[0].action.includes("Changed role"), "role change writes audit entry");
KK.admin.removeMember(m.id);
ok(KK.admin.members().length === 7, "removeMember drops the member");

// --- Invites ---
const before = KK.admin.invites().length;
const inv = KK.admin.invite("scout@bape.com", "Analyst");
ok(KK.admin.invites().length === before + 1, "invite adds a pending invite");
KK.admin.revokeInvite(inv.id);
ok(KK.admin.invites().length === before, "revokeInvite removes it");

// --- Integrations ---
KK.admin.setIntegration("meta", false);
ok(KK.admin.integrations().find((i) => i.id === "meta").connected === false, "disconnect integration");
KK.admin.setIntegration("meta", true);
ok(KK.admin.integrations().find((i) => i.id === "meta").connected === true, "reconnect integration");

// --- Settings ---
KK.admin.setSetting("retainCampaignData", "36 months");
ok(KK.admin.settings().retainCampaignData === "36 months", "setSetting persists");
KK.admin.setSetting("autoDeleteRejected", false);
ok(KK.admin.settings().autoDeleteRejected === false, "toggle setting persists");

// --- Audit + CSV ---
ok(KK.admin.auditCsv().split("\n")[0] === '"User","Action","Date","Time"', "auditCsv has header row");

// --- Templates ---
const t = KK.admin.addTemplate({ title: "Drop Brief", desc: "x" });
ok(KK.admin.templates()[0].id === t.id, "addTemplate prepends");
const dup = KK.admin.duplicateTemplate(t.id);
ok(dup.title === "Drop Brief (Copy)", "duplicateTemplate copies");
KK.admin.removeTemplate(t.id); KK.admin.removeTemplate(dup.id);
ok(KK.admin.templates().length === 3, "removeTemplate restores count");

// --- Export formats + audiences ---
const f = KK.admin.addFormat({ name: "Snapchat", specs: "1080x1920" });
ok(KK.admin.exportFormats().some((x) => x.id === f.id), "addFormat works");
const a = KK.admin.addAudience({ name: "Test", region: "X" });
ok(KK.admin.audiences().some((x) => x.id === a.id), "addAudience works");

// --- Weights ---
KK.admin.setWeights({ "w-dna": 40, "w-trending": 10 });
ok(KK.admin.weights().find((w) => w.id === "w-dna").value === 40, "setWeights updates value");

// --- Data sources ---
ok(KK.admin.dataSourceGroups().includes("Social Channels"), "data source groups derived");
const ds = KK.admin.dataSources().find((d) => d.id === "ds-yt");
KK.admin.toggleSource("ds-yt", true);
ok(KK.admin.dataSources().find((d) => d.id === "ds-yt").connected === true, "toggleSource connects");

// --- Persistence across reload ---
const memberCount = KK.admin.members().length;
delete globalThis.KK;
eval(base); eval(ext);
ok(globalThis.KK.admin.members().length === memberCount, "admin state persists across reload");

// --- Isolation: admin engine never touched Execution state ---
ok(globalThis.KK.briefs().length === 12, "Execution state (12 briefs) untouched by admin engine");

console.log(`\n${pass} passed, ${fail.length} failed`);
if (fail.length) { console.log("FAILED: " + fail.join(", ")); process.exit(1); }
