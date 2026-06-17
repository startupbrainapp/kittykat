# Execution Section — Wiring Plan

**Status:** Draft for build
**Author:** Daniel
**Date:** 2026-06-17
**Scope:** Connect the four Execution pages (Briefs, Creator Studio, Reviews, Asset Manager) into one coherent, clickable flow.

---

## Framing decision

The repo is a **static prototype**, so "wire up" means making the Execution pages flow together as a clickable demo driven by **shared client-side state** — a fake-data module plus `localStorage` so transitions persist across page loads. This structure maps 1:1 onto a real backend later (same entities, same transitions, swap only the data layer). Build prototype-first.

**Real-build delta:** Phase 0's `localStorage` module becomes the API/DB. Everything else — status transitions, context passing, status-driven UI — stays identical.

---

## The spine: the brief is the unit of work

Everything in Execution is a brief moving through a lifecycle, and each page owns one stage. If the brief's **status** is the single source of truth, every page just reflects and advances it. That is the whole job.

```
Briefs            Creator Studio        Reviews            Asset Manager
(list + entry) →  (produce, per brief) → (approve)      →  (the library)

Draft  ──Open Studio──▶  In Production  ──Submit──▶  In Review  ──Approve──▶  Shipped
                              ▲                          │
                              └────── Request changes ───┘
```

- **Briefs** — the list, creation, tracking, and the entry into the studio.
- **Creator Studio** — produce assets, per brief (the full-screen workspace).
- **Reviews** — approve or send back.
- **Asset Manager** — the library of everything produced and shipped.

---

## Phase 0 — Shared state (foundation; everything depends on it)

One data module all four pages read/write (e.g. `data.js` exposing a `KK` global, persisted to `localStorage`). Today each page has its own inline fake arrays (e.g. `briefs.html` has its own brief list); Phase 0 consolidates them so a change on one page shows on the others.

**Entities & relationships:**
- **Brand → Campaign → Brief** `{ id, name, campaign, status, assignee, due, assetsDone, assetsTotal }`
- **Brief → Exploration** `{ briefId, name, candidates[], versions[], branches[] }` (the candidates-vs-versions model from the Creative Branching PRD)
- **Asset** `{ id, briefId, explorationId, src, role: candidate | version | final | approved, favorited }`
- **ReviewItem** `{ briefId, finalSelects[], decision, notes }`

**Status values:** `draft → production → review → shipped` (with `production` reachable again from `review` via "request changes").

---

## Phase 1 — Brief → Studio handoff (biggest lift)

Today "Open Studio" loads `creator_studio.html` with **no brief context**. Wire it:
- Pass the brief id: `creator_studio.html?brief=<id>`.
- Studio reads it and loads *that brief's* world — the title chip, its moodboard, its references (the Environment / Person / Products locks), and its existing explorations in the timeline.
- "Back" / close returns to the brief.
- Opening the studio flips a `draft` brief to `production`.

---

## Phase 2 — Produce → Final Selects

- Generating in the studio writes assets into shared state, tagged to the brief + exploration. (Prototype: simulate by appending entries — no real model call.)
- "Add to Final Selects" promotes an asset to the brief's deliverable set (`role: final`).

---

## Phase 3 — Submit → Reviews

- The studio's **Submit to Reviews** action sets `status = review` and creates a `ReviewItem` from the brief's Final Selects.
- `reviews.html` lists in-review briefs, shows their Final Selects, and offers:
  - **Approve** → `status = shipped`, assets marked `approved`.
  - **Request changes** → `status = production`, notes saved and surfaced back in the studio.

> After Phase 3 the demo is fully walkable: Brief → Studio → Reviews → (Shipped). Phases 4–5 are completeness.

---

## Phase 4 — Asset Manager

- Reads all assets from shared state; filter by brand / campaign / brief / status.
- Each asset links back to its brief (and "Open in Studio").
- Approved / shipped assets flagged.

---

## Phase 5 — Consistency + cross-links (the payoff)

- Brief **status drives every surface**: the status dot, the status pill, the brief-drawer footer action, and the row "Open Studio" button. A `draft` shows "Open Studio," `review` shows "Open in Reviews," `shipped` shows "View in Asset Manager." (This logic already exists in `briefs.html` — Phase 5 makes it read from shared state.)
- Breadcrumb-style links between pages so the lifecycle is navigable both directions.
- `assetsDone / assetsTotal` counts update as assets are produced and approved.

---

## Sequence & rationale

1. **Phase 0** unblocks everything (shared state).
2. **Phase 1** makes the studio real (brief context).
3. **Phases 2–3** complete the produce → approve loop.
4. **Phase 4** gives the library.
5. **Phase 5** ties the visible status together.

Recommended first build chunk: **Phase 0 + Phase 1**, since that's where the flow actually comes alive (a brief opens its own studio).

---

## Key decisions / open questions

1. **Prototype vs real build** — `localStorage` shared state now; backend later. Confirmed prototype-first.
2. **Asset identity across roles** — one asset row carries a `role` (candidate → version → final → approved) rather than copying between collections, so favoriting/promoting/approving never duplicates or loses an image. Ties to the Creative Branching PRD's candidates-vs-versions split.
3. **Final Selects = the deliverable** — per brief; it's exactly what Submit to Reviews sends and what the client sees. Closes the old-platform/PDF round-trip from the research.
4. **Campaigns** — `campaigns.html` exists but is currently reachable from no nav. If Campaigns should be a real destination, decide that separately (add deliberately to all sidebars) rather than as part of Execution wiring.
