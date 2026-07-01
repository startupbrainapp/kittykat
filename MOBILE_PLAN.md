# KittyKat — Mobile-First Plan

Goal: a mobile version of every feature, faithful to the existing design system
(same tokens, type, surfaces — responsive behavior only), every experience
intuitive, collapse what's secondary in ways that make sense.

## Principles
- One screen, one job — never two panes at once on a phone; collapse to one column.
- Stick to the tokens — no new fonts/colors; add responsive behavior, not a new look.
- Collapse with meaning — hide nav, filters, brand-brain setup behind a tap; never the main action.
- Touch-first — every tappable target ≥44px; no hover-only actions.

## Nav model
Hamburger → slide-in drawer that reuses the existing sidebar (same sections).
Main content goes full-width. Breakpoint: `≤768px = mobile`.

## Foundations (Phase 0 — build once, reuse everywhere)
1. App shell: sidebar → off-canvas drawer + hamburger + dim backdrop; main full-width.
2. Sheet pattern: drawers/modals → full-screen sheets on mobile.
3. Card-row pattern: wide tables/grids → stacked cards.
4. Filter bar: dropdown/chip rows → horizontal-scroll strip (or Filters sheet).
5. Tap-reveal: hover overlays → always-visible / tap.
6. Touch targets: ≥44px nav items, buttons, icons.

## Per-surface
- Shell (all pages): hamburger drawer, full-width content.
- Home: single-column stack; cards full-width.
- Image Studio (Briefs): table → job cards; stat strip wraps; filters → strip.
- Creator Studio (modal): tab toggle "Images / Chat"; rail → drawer; block editors/focus/picker → full-screen sheets.
- Shortlisted: 2→1 col gallery; hover→tap; drawer→sheet; bulk bar sticky bottom.
- Reviews: full-width cards; Approve/Changes full-width; drawer→sheet; sticky approve bar.
- Workflows: list cards stack; builder modal full-height single column; moodboard wall already responsive.
- Agentic Run + Moodboard: already responsive.
- Team / Presets / Admin: grids → 1 col; tables → card-rows.

## Phasing
- Phase 0 — foundations/shell (global). Highest leverage; makes every page usable.
- Phase 1 — list pages (Image Studio, Shortlisted, Reviews, Workflows, Settings).
- Phase 2 — studios (Creator Studio modal, Workflow builder modal).
- Phase 3 — polish (touch targets, focus/keyboard, safe-area, motion).

## Design system
Add a "Responsive" section to DESIGN.md: breakpoint, drawer-nav, full-screen sheet,
card-row, mobile filter strip, 44px touch-target rule — so future work stays consistent.
