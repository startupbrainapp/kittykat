# KittyKat Prototype — Handover & Parallel-Work Guide

This is the working prototype for the **new KittyKat** product. It's a static HTML app
(no build step) with a shared client-side engine in `data.js` (localStorage-backed).

This doc lets **multiple terminals / agents work on different sections at once** without
stepping on each other. Read the whole thing before starting a section.

---

## 0. Quick start

```bash
cd ~/kittykat
npm install        # one time (installs jsdom for tests)
npm start          # serves the app on http://localhost:8090
```

Open `http://localhost:8090/briefs.html`. Edits to HTML/JS are live — just refresh
(the server reads from disk).

Run the tests anytime:

```bash
npm test           # engine tests + DOM tests across the wired pages
npm run test:engine   # pure logic (no deps)
npm run test:dom      # loads each page in a real DOM (jsdom) and asserts behavior
```

---

## 1. The product in one paragraph

KittyKat is an AI creative-workflow platform with **three sections** — **Inspiration**
(what to make / brand knowledge), **Execution** (make it), **Performance** (how it did) —
plus **Home** and **Settings/Admin**. Everything hangs off one **client/brand**. Only the
**Execution** section is functional today; the rest are designed but not wired.

Plain-English overview: https://claude.ai/code/artifact/27a9fd4a-45a3-44ff-b214-30b4b898e138
Phase-1 plan: https://claude.ai/code/artifact/13dfa71f-0940-4779-82da-c934a170de17

---

## 2. Status & page → section map (THE OWNERSHIP TABLE)

**This is the most important table for parallel work.** Pick a section, own its files,
don't touch another section's files.

| Section | Pages (files you own) | Status |
|---|---|---|
| **Execution** ✅ | `briefs.html`, `creator_studio.html`, `reviews.html`, `asset_manager.html` | **WIRED & TESTED** — leave alone unless fixing |
| (Execution orphan) | `brief_new.html` | standalone create page, NOT wired. The live create UI is the drawer **inside** `briefs.html`. Probably delete or ignore. |
| **Home** | `home.html` | not wired — personalized "what needs attention" dashboard |
| **Inspiration** | `visual_search.html` (Visual Vault), `trend_matching.html` (Opportunities), `brand_sandbox.html`, `clusters.html` (Thematic Intelligence), `current_brand.html` (Brand DNA), `brand_alignment.html`, `campaigns.html` | not wired |
| **Performance** | `roas_dashboard.html`, `reports.html`, `competitive_intel.html` | not wired (real data lives in the separate Maven app — these are shells) |
| **Settings / Admin** | `admin.html`, `team.html`, `presets.html`, `brand_setup_v1.html`, `brand_setup_v2.html` (Data Sources) | not wired |
| Misc | `mobile.html` | mobile view sketch |
| **SHARED** | `data.js`, `server.js`, `tests/`, this doc | see §5 before touching |

---

## 3. The engine — `window.KK` (in `data.js`)

Every page loads `<script src="data.js"></script>`, which exposes `window.KK`. State is
seeded once and persisted to `localStorage` (`kk_state_v1`). Call `KK.reset()` in the
console to reseed.

**Reads**
- `KK.briefs()` → all briefs · `KK.brief(id)` → one brief or null
- `KK.campaigns()` → string[] (derived from briefs + custom) · `KK.team()` → `[{name,initial,role}]`
- `KK.statusLabel(s)` · `KK.finalSelects(id)` → hearted srcs · `KK.isFinal(id, src)`
- `KK.reviewBriefs()` → briefs with status `review`

**Writes** (all persist)
- `KK.createBrief({name, campaign, desc, assignee, due, deliverables:[{name,spec,qty}], refs, status})` → new brief
- `KK.generate(id, count)` → appends stub assets to `brief.tiles`, returns added; draft→production
- `KK.toggleFinal(id, src)` · `KK.addCampaign(name)`
- `KK.setStatus(id, s)` · `KK.enterStudio(id)` (draft→production)
- `KK.submitReview(id)` (→review) · `KK.approve(id)` (→shipped) · `KK.requestChanges(id, notes)` (→production)
- `KK.save()` · `KK.reset()`

**Brief shape**
```
{ id, name, status: 'draft'|'production'|'review'|'shipped', statusLabel,
  campaign, assignee, initial, assetsDone, assetsTotal, due, desc,
  deliverables:[{name, spec}], refs:[src], tiles:[int 1-8 → images/{n}.jpg],
  finalSelects:[src] }
```
Images are `images/1.jpg … images/9.jpg`. Tiles are integers; render as `images/${n}.jpg`.

---

## 4. Design system & page conventions (so new pages match)

Every page copies the same `:root` token block and sidebar. **Copy an existing page as
your starting skeleton** (e.g. `current_brand.html` for an Inspiration page,
`team.html` for a Settings page) so chrome stays identical.

**Tokens** (in each page's `<style> :root`):
```
--bg-canvas #08090a  --bg-panel #0f1011  --bg-surface #191a1b  --bg-elevated #28282c
--text-primary #f7f8f8  --text-secondary #d0d6e0  --text-tertiary #8a8f98  --text-quaternary #62666d
--brand #5e6ad2  --brand-accent #7170ff  --brand-hover #828fff
--border-subtle / --border-standard / --border-solid   --surface-1/2/3
--status-green #10b981  --status-amber #f59e0b  --status-red #ef4444
```
Font: Inter (`https://rsms.me/inter/inter.css`). Sidebar nav markup is identical across
pages — copy it and set the `active` class on your page's nav item.

**Wiring conventions**
- Add behavior in the page's inline `<script>` (and `onclick`/`id` hooks). Don't restyle.
- Read/write shared data through `KK`. Keep state in the engine, not the DOM.
- Re-render from state after every change (see `renderTable()` in `briefs.html`).

---

## 5. PARALLEL-WORK PROTOCOL (read before you start)

**Rule 1 — One terminal owns one section's files.** Never have two terminals editing the
same `.html` file. Use the table in §2.

**Rule 2 — `data.js` is shared. Do NOT edit it from a section terminal.** Instead, create
a section engine file that *augments* `KK` after it loads:

```js
// data-inspiration.js  (loaded only on Inspiration pages, AFTER data.js)
(function () {
  window.KK.inspiration = {
    vault: function () { /* return image set */ },
    // ...section-specific reads/writes; call window.KK.save() to persist
  };
})();
```
On your section's pages, add it right after the data.js tag:
```html
<script src="data.js"></script>
<script src="data-inspiration.js"></script>
```
This way two terminals never touch the same JS file. Shared seed/persistence stays in
`data.js`. If you genuinely must change `data.js` (e.g. add a new top-level entity),
do it **solo** — pause other terminals, make the change, commit, then resume.

**Rule 3 — Branch per section.** This repo is git (`origin = startupbrainapp/kittykat`).
```bash
git checkout -b section/inspiration
```
Commit small and often **on your branch**. Don't push to `main` from two terminals at
once — fetch and merge deliberately. (Multiple Claude sessions share the same git
identity, so coordinate pushes.)

**Rule 4 — Test before you commit.** Run `npm test`. If you added section logic, add a
couple of checks to `tests/` (see §7).

**Rule 5 — Locked product rules (apply everywhere):**
- **No fake scores.** Do not invent "brand alignment" percentages. Those are hidden until
  a real Brand Brain exists — leave the slot, no numbers.
- **Preserve the design.** Wire behavior; don't change layout/spacing/color.
- **User inputs are user-chosen.** Don't auto-populate things the user should pick
  (e.g. reference images use a picker, not auto-fill).
- **Plain English** in any user-facing copy.

---

## 6. How to wire a fresh section (recipe)

1. `git checkout -b section/<name>`
2. Open your section's page(s) from §2. Skim the markup — most have static demo content.
3. Decide the data: can you reuse `KK` (briefs/campaigns/team), or do you need new state?
   If new, create `data-<name>.js` per Rule 2.
4. Replace static demo content with rendered-from-state content; wire every dead button.
5. Keep the chrome (sidebar/topbar) identical; only the section content changes.
6. `npm test`, add checks, commit on your branch.

---

## 7. Adding tests for your section

- **Logic** → add to `tests/engine.test.mjs` (pure node, loads `data.js` + your
  `data-<name>.js` with a localStorage shim). Pattern is at the top of that file.
- **Page render/interaction** → add a block to `tests/dom.test.mjs` (jsdom loads the real
  page and runs its scripts; assert elements render and handlers work). Copy an existing
  page block. It catches script errors automatically (`jsdomError`).

---

## 8. Starter briefs for the likely next sections

### Inspiration (`section/inspiration`)
- **`current_brand.html` — Brand DNA.** This is the source the brief drawer auto-loads
  (palette / voice / audience / do's / don'ts). Make it **editable** and store it in the
  engine (e.g. `KK.brand()` / `KK.updateBrand()` in `data-inspiration.js`), then have the
  brief drawer read from it instead of hardcoded values.
- **`visual_search.html` — Visual Vault.** A searchable image library. For the prototype,
  back it with an image set (`images/1-9.jpg` or a larger vault list in `data-inspiration.js`)
  and wire search/filter + "use as reference" (which could feed a brief's refs later).
- **`trend_matching.html`, `clusters.html`, `brand_sandbox.html`** — wire their filters /
  toggles / cards from a small dataset in `data-inspiration.js`. No fake scores.

### Settings / Admin (`section/admin`)
- **`team.html`** — manage members. Reuse/extend `KK.team()`; add add/edit/remove via
  `data-admin.js` (`KK.admin.addMember(...)`, persist with `KK.save()`).
- **`presets.html`** — saved generation presets; a new `KK.admin.presets()` store.
- **`admin.html`** — model config / feature flags; back with a settings object.
- **`brand_setup_v2.html`** — "Data Sources" connections (toggles/state only).

---

## 9. What NOT to build yet
- Real AI generation (Studio generation is stubbed — uses sample images).
- Real Performance data (lives in the separate **Maven** app, not this repo).
- Brand-alignment scoring (waits on the real Brand Brain).
- Anything in the real `kittykat-ai` GitHub org — this prototype is separate.

---

*Execution is wired & tested (engine 17/17, DOM 14/14). Build the other sections the same
way: state in the engine, behavior wired to it, design preserved, tests green.*
