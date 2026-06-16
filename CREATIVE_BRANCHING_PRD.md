# KittyCat 2.0 — Creative Branching & Versioning UX

**Status:** Draft v2 (revised after Jenny / Grace / Sonya / Mark interviews)
**Author:** Daniel
**Date:** 2026-06-16

---

## Context

Across the interviews with Jenny, Grace, Sonya, and Mark, one insight dominates:

**Creative work is not linear.**

Users do not generate one image and refine it in a straight line. They:

- Generate **many** candidates at once (4 or 8 at a time) and shortlist
- Pick promising candidates and push them in new directions
- Return to earlier versions and fork from them
- Compare alternatives side by side
- Promote a small set as the client deliverable
- Work alongside teammates in the same campaign

The current platform doesn't represent this. At the same time, exposing a full technical version tree would overwhelm most users — and would terrify clients, who are the people KittyCat 2.0 is trying to serve.

The goal: a versioning system that supports branching while staying simple, and that fits the **modal-based creative experience** (chat on the right, asset-focused canvas in the center, exploration navigation on the left).

---

## What changed in this revision

Four findings from the interviews reshaped the original draft:

1. **Candidates ≠ versions.** "Generate 8 options" (a fan of siblings you triage) is a different object from "change the shirt, keep the face" (a saved edit you branch from). Folding them together drowns the history. This doc now models them separately.
2. **Branching must be legible, not invisible.** Mark's real fear isn't branching — it's *finding his way back*. Hidden-but-announced beats silent.
3. **Collaboration is a behavior change.** Today, assets are shared but **chat/prompt history is private per user**. Making history shared is correct, but introduces concurrency and restore/branch semantics that must be defined.
4. **The product stops short of the last mile.** Final Selects must *be* the client deliverable (today they drop to the old platform / a PDF). And product fidelity (logos, exact products) still needs a manual Photoshop re-entry path. Video is out of scope for v2 but the hand-off must be explicit.

---

## Design Principles

### 1. Hide complexity by default
The data model can support unlimited branching. The UI must not. Most users only ask three questions:

- What is my current image?
- What did I try before?
- Can I go back?

Optimize for those three. The full tree is opt-in (see **Show Lineage**).

### 2. Organize work into Creative Explorations
Users work inside **Explorations**, not individual files. Examples: *Grey Hat Lifestyle*, *Product Hero Shot*, *Summer Beach Scene*, *Wedding Collection*. Each exploration holds many generations, candidates, and saved versions. The left panel reads like **Figma Pages**, not a file system — navigate concepts, not files.

### 3. Separate exploring from keeping
Generating options is cheap and noisy; deciding is the real work. The system must visually distinguish the **scratch** (candidates you're triaging) from the **kept** (versions and Final Selects). This is the principle that keeps the history clean.

---

## The core object model

Three layers, deliberately distinct:

| Object | What it is | Lifecycle |
|---|---|---|
| **Candidates** | The fan of images from one generation ("give me 8"). Siblings, not history. | Ephemeral. You keep 1–2; the rest fade unless explicitly saved. Never clutter the history. |
| **Versions** | A saved, intentional milestone you can return to and branch from. | Persistent. Auto-created on edit. Named from intent. |
| **Final Selects** | The curated set you deliver to the client. | Persistent + shareable. The deliverable. |

> **Why this matters:** Mark generates *hundreds* of candidates per product. If each became a "version," the history would be unusable. Candidates live on the canvas for triage; only what you keep becomes a version.

---

## Left Panel — Exploration navigation

Replace image-by-image navigation with exploration-based navigation:

```
Brand ▸ Campaign

  Grey Hat Lifestyle        24 versions
  Product Hero Shot         18 versions
  Summer Beach Scene        31 versions
  ★ Final Selects            5 images
```

- Feels like Figma Pages.
- At Bandolier scale (100 campaigns × many explorations × hundreds of versions), this list gets long — so it needs **search/filter within a campaign**. Wayfinding is a first-class requirement, not a nice-to-have (this is Mark's "find my way back" concern).

---

## Center Canvas — built for deciding

The canvas always prioritizes visual review: **large images, never tiny thumbnails** (directly answers Grace's "images are too small" and "I can't compare" pain).

Two canvas modes, matching the object model:

**A. Triage mode (candidates).** After a generation, the canvas shows the batch of 4–8 as a large grid. The user:
- Compares them at size
- Favorites the keepers (♥)
- Discards or ignores the rest (they don't enter history)
- Promotes a keeper to a Version, or straight into Final Selects

**B. Focus mode (one asset).** Click a candidate or version to focus it large. From here the chat acts on *this* image, and its version history is one tap away. Drilling in and popping back out must be effortless — this is Mark's preferred "stay contained in one area, revisit anytime" pattern, chosen over an infinite zoomable canvas (he'd get lost) and over breadcrumbs (poor discoverability).

Side-by-side **compare** (two versions, or two candidates) is a core action, not a hidden feature.

---

## Right Panel — Chat as the editor

The chat is the primary editing interface. The **selected image is the context** for every message:

- "Change shirt to white"
- "Use product reference A"
- "Keep model, change background"
- "Make the pose more dynamic"
- "Generate 8 more options"
- "Replace the bracelet"

No navigating multiple edit screens. Manual controls (the exact prompt, references, model) stay one tap away under the asset for power users, but the model is **chosen automatically** by default (everyone wanted latest-model, no dropdown anxiety — especially for clients).

---

## Versioning behavior

Editing the **current** image creates a new version; the original stays:

```
Current Version
   ↓ "change shirt to white"
Edited Version  (new current)
```

Users never lose work. Versions are **auto-named from the edit intent** ("White Shirt," "Darker Hair") — not "Untitled 14." Good auto-naming is load-bearing: the whole "navigate concepts" promise collapses without it. Users can rename.

---

## Branching behavior — automatic but legible

Editing an **older** version forks a branch:

```
Version 3
   ↓ "change shirt to white"  (edited from v3, not the tip)
White Shirt v1  (new branch)
```

The user doesn't *plan* the branch — but the system **tells them it happened**, in one quiet line:

> *You edited an older version — started a new direction: "White Shirt."*

This is the key revision: branching is **hidden-but-announced**, not invisible. It resolves the original draft's internal tension (auto-branch silently vs. "never feel trapped"). The "don't get trapped" goal is really a **wayfinding** requirement — always show where this edit came from and how to get back.

---

## History & restore

Each exploration has a lightweight history panel (kept versions only — candidates never appear here):

```
Current:  White Shirt v2

History
  • Original
  • Version 2
  • Version 3
  • White Shirt v1
  • White Shirt v2
```

**Restore vs. branch — defined semantics (non-destructive):**
- **Restore** = move the *current* pointer to an older version. Nothing is deleted; the later versions remain in history.
- **Edit from a non-tip version** = create a branch (see above). You never overwrite or lose a later version by going back and editing.

This makes "never lose work" concrete rather than a vibe.

---

## Show Lineage (advanced, opt-in)

Only when requested. Most users never see it.

```
Version 3
 ├ White Shirt v1
 │  └ White Shirt v2
 └ Black Shirt v1
```

---

## Collaboration

**Single source of truth. Shared history. No personal version trees.** If Mark creates `Grey Hat Lifestyle ▸ White Shirt v2`, Jenny and Sonya see the same branch, the same history, and the same prompts.

> **This is a behavior change.** Today, generated assets are shared in the campaign folder, but **each person's chat/prompt history is private**. Making prompt history shared is the right call (Daniel: "it should all be visible"), but it must be designed in, not assumed.

**Concurrency (new requirement, unaddressed in v1):** Mark and Jenny generate into the *same* product folder in parallel today. The model is **async shared state with presence hints**, not live multiplayer canvas:
- Show "Jenny is working in this exploration" presence.
- Two people branching the same version at once both succeed — they create two branches, both visible. No locking, no lost work.
- We are **not** building Figma-style real-time co-editing of a single image. That's the most expensive piece and the interviews don't ask for it.

---

## Final Selects = the deliverable (closing the last mile)

Today, Grace and Jenny leave KittyCat and use the **old platform or a PDF** to share with clients. Final Selects must replace that:

- Promote any version into **Final Selects**.
- Final Selects is **shareable to the client directly** (a clean review view — large images, the client's pick/comment, no working clutter). This is the "showboard" both Grace and Sonya described.
- This removes the old-platform round-trip entirely.

---

## Product fidelity & external re-entry

AI alone won't reliably place exact products — logos come out wrong, left/right hand flips, some content is blocked (the banana→Photoshop workaround). So the pipeline must let a **corrected/external image come back in as a version**:

- "Drop in the real product" / upload a Photoshopped image → it enters the exploration as a normal version (with a note that it was externally edited).
- Product reference stays available, but the system shouldn't pretend AI nails fidelity — the Photoshop re-entry path is a routine step, not an edge case.

---

## Scope: image-first, video handed off (explicit)

KittyCat 2.0's creative experience is **image-first**. Jenny's video work (KittyCat images → Kling → ElevenLabs → After Effects) stays an external chain for now. Decision for this PRD:

- An exploration holds **images and their versions**. Video generation is **out of scope** for this milestone.
- Provide a **clean hand-off**: export Final Selects / storyboard frames in the order/format Jenny needs to take into Kling. Don't half-build video.
- Revisit absorbing video (and voiceover/music/edit) as a later milestone, explicitly.

---

## Key product goal

The user should feel: **"I can safely explore."**

They should never worry about:
- Losing work
- Overwriting a teammate's work
- Forgetting which version was best
- Getting trapped inside a branch (→ always show where I am and how to get back)

The system encourages experimentation while keeping navigation simple.

**North star (sharpened):** *Lightroom's version history + ChatGPT's conversational refinement, browsed like Pinterest boards, on one shared source of truth.* We are deliberately **not** building Figma-style live multiplayer editing — shared async state with presence is enough, and far cheaper.

---

## Open decisions

1. **Candidate retention** — do unpicked candidates auto-expire (and after how long / how many), or persist until manually cleared? Affects cost and clutter.
2. **Auto-naming quality** — how are exploration/version/branch names generated, and can the model name them well enough that the left panel stays legible at scale?
3. **Final Selects sharing surface** — lightweight public review link, or in-app client account? (Ties to the broader "clients self-serve" goal.)
4. **Presence depth** — just "someone's here" indicators, or live cursor/edit awareness? (Recommend the former for v2.)
