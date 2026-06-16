# PRD Note — Creative Studio as Agent Workspace

**Status:** Draft for discussion
**Author:** Daniel
**Date:** 2026-06-15
**Source:** UX research with two internal users (Grace, creative designer; Sonya), plus a live audit of ask.kittykat.ai

---

## Problem

KittyKat works for trained employees but is too hard for clients to use themselves — which is the explicit goal ("KittyKat 2.0, clients self-serve"). Two findings drive this note:

1. **It's hard to configure.** Brands, campaigns, and moodboards must be set up and re-selected by hand; the moodboard doesn't remember its campaign; autofill grabs the wrong images; the best model isn't chosen for you. Sonya records a how-to video for every new client.
2. **The laid-out prompts fail both audiences in opposite directions.** The auto-generated prompt chips are too *generic* for insiders (Grace bypasses them and just chats to get precision), yet writing a good prompt is too *hard* for clients (the chips exist as training wheels they still can't steer).

The live audit confirmed the structure behind this: a long, dense home page (chat bar + 8 action chips + Brand panel + Campaign + Moodboard + Creative Studio), empty "your campaign/moodboard will appear here" placeholders that start blank every time, uploads that dump into the brand instead of the campaign you're in, and a manual model dropdown.

## Insight

There are two users, not one:
- **Clients / outsiders** — can't prompt, won't configure. Want: describe it, get the asset.
- **Insiders / Grace** — need precision and control. Want: see the prompt, steer it, refine.

The product should serve both **without making either choose a mode up front** (choosing a mode is itself a configuration decision — the thing both users hate).

## Proposal

Promote **Creative Studio from a section to the primary workspace**: a single chat + canvas screen that replaces the dense multi-panel home. Brand / Campaign / Moodboard stop being panels the user configures and become context the agent manages and surfaces.

```
┌─────────────────────────────┬──────────────────┐
│  CANVAS (left)              │  CHAT (right)     │
│  • current asset + versions │  user describes   │
│  • references in play       │  what they want   │
│  • the moodboard in use     │  → agent works    │
│  • click asset → the prompt │  → asset appears  │
│    + model behind it (edit) │    on the left    │
│  [full gallery 1 click away]│                   │
└─────────────────────────────┴──────────────────┘
```

**One flow, two depths:**
- **Default (agent):** Brand set up once → user describes the want → agent autonomously produces the asset, remembering everything → user refines by asking again in chat.
- **Manual (on demand):** Click any asset on the left to reveal and edit the prompt, reference images, and model that made it. Manual is *drilling into the agent's work*, never a separate screen or upfront toggle.

This also collapses the "so much going on / don't know where to look" problem by fusing the two halves that already exist (right-side chat, the gallery) into one screen.

## What makes or breaks it

1. **Brand setup must be cheap, or done before the client arrives.** Agent mode's "if the brand is set up" precondition carries the load. Either brand setup becomes agent-driven (paste website / brand PDF → built), or it stays a one-time job the insider does before the client opens the workspace. Decide who owns it — a client who hits "set up the brand" first is lost.
2. **Follow-up prompts must carry state.** The agent has to remember the brand, the asset it just made, "this face," and the campaign. Stateless one-shots recreate Grace's worst chore (re-uploading the same face every time). The persistent working set is the real unlock — more than the autonomy.
3. **The left panel is a working canvas, not the old gallery transplanted.** It defaults to *what we're working on now* (current asset, versions, references, moodboard in use). This is where Grace's unmet asks finally land: side-by-side compare, version history, multi-select. The full gallery stays one click away. If we just paste the messy gallery next to a chat, we've moved the clutter, not fixed it.

## Open questions

- **How much does the agent do autonomously?** Just the final image, or the full chain (moodboard → showboard → product placement)? Lean: deliver the final asset by default, keep intermediate work (the moodboard used, the prompt written) visible and one tap away so a wrong output drops into manual instead of a blind re-roll.
- **Who sets up the brand** (see make-or-break #1).
- **Model selection** — agent should pick the best model silently; manual exposes the dropdown.

## Out of scope (for this note)

- Old-platform sharing/review flow (clients still get final assets via the old path today) — needs its own decision.
- Video generation defaults — same "pick the best model silently" principle applies, deferred.

## Evidence not yet verified

The image-heavy complaints (autofill picking wrong images, reuse requiring download-then-reupload, heart/favorite behavior, prompt quality) were confirmed as *capabilities/structure* on the live site but not exercised on real data — the audit account (BAPE) had no images or campaigns. Re-test on a populated account (e.g. Bandolier or Haze Farm) before locking the canvas spec.
