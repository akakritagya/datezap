---
name: datezap
description: A live split-flap departure board that converts, browses, and embeds Nepali (Bikram Sambat) and Gregorian dates, powered by nepkit.
colors:
  casing: "#0b0a08"
  casing-deep: "#050504"
  panel: "#1c1a15"
  panel-line: "#322d24"
  bezel: "#26221c"
  flap: "#f3ede0"
  flap-dim: "#d9d2bf"
  flap-ink: "#171310"
  ivory: "#f3ede0"
  muted: "#a9a290"
  amber: "#ffb020"
  amber-ink: "#241a02"
  hazard: "#ff6b3d"
  hazard-ink: "#2a0f06"
typography:
  display:
    fontFamily: "Big Shoulders, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  flap:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "clamp(0.875rem, 2.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
rounded:
  sm: "3px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  board-panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.lg}"
    padding: "24px 28px"
  flap-cell:
    backgroundColor: "{colors.flap}"
    textColor: "{colors.flap-ink}"
    typography: "{typography.flap}"
    rounded: "{rounded.sm}"
  button-primary:
    backgroundColor: "{colors.bezel}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.amber-ink}"
  nav-link-active:
    textColor: "{colors.amber}"
---

# Design System: datezap

## Overview

**Creative North Star: "Split-Flap Departure Board"**

datezap renders every date as a physical object flipping into place, not a form field reporting a value. The whole app is staged as one dim, single instrument — a departure-hall board bolted into a near-black casing — and every page (converter, calendar, picker) is a different panel on the same board, sharing one flap-cell grammar rather than inventing per-page cards. The thesis, taken directly from the build's own direction contract: "converting a date is not a form submit, it is a board flipping to the right answer, shown not stated."

The system is deliberately unlit outside its amber pilot-light and hazard-orange accents: casing near-black, flap faces ivory, everything else muted bronze-grey. There is no light mode — the dim hall is a committed identity, not a `prefers-color-scheme` default. State (today, selected, disabled, error) is communicated through marks — outline, dot, icon swap, diagonal stripe — never through color alone or opacity alone.

**Key Characteristics:**
- One shared flap-cell/board-panel module system across all three routes — no per-page one-off cards.
- Mechanical realism over flat UI: rivets, split lines, inset shadows, a physical flap-in rotation.
- State as a mark (outline shape, icon, stripe), not a hue swap.
- A single committed dark scene; no theme toggle.

## Colors

The palette reads as one physical object under one light source: dark metal casing, ivory paper flaps, and a single amber pilot lamp — with hazard-orange reserved strictly for out-of-range/error flaps.

### Primary
- **Pilot Amber** (`#ffb020`): the board's one live accent — "today" outline and pilot-dot, selected-state dashed outline, active nav underline/text, primary button hover, focus rings, caret, text selection, custom scrollbar thumb hover. Used sparingly and always to mean "this is live/current/selected."

### Secondary
- **Hazard Stripe** (`#ff6b3d` diagonal on `#050504`): reserved for error and out-of-range states only — the `ERROR` flap row, boundary-year Prev/Next borders, inline warning text. Never used as a decorative accent.

### Neutral
- **Board Casing** (`#0b0a08`): page background, the room the board sits in.
- **Casing Deep** (`#050504`): recessed surfaces — nav bar, input fields, scrollbar track, hazard-stripe's dark band.
- **Panel** (`#1c1a15`): the `.board-panel` housing background — every card/module in the app is this color.
- **Panel Line** (`#322d24`): panel borders, dividers, input borders, inactive button-group borders.
- **Bezel** (`#26221c`): rivet base color, default (non-hover) primary-button background.
- **Flap Ivory** (`#f3ede0`): the physical flap-card face — background for every `.flap-cell`, and the app's primary text color (`--ivory`) on the dark casing.
- **Flap Ink** (`#171310`): glyph color printed on flap faces (near-black-on-ivory, not white-on-dark — the one deliberate inversion in the system).
- **Muted Bronze** (`#a9a290`): secondary/label text, inactive nav links, helper copy.

### Named Rules
**The Mark-Not-Hue Rule.** State is never conveyed by color alone. Today = amber solid outline + pilot-dot. Selected = amber dashed outline + a corner `LatchIcon`, placed opposite the pilot-dot. Boundary-disabled = icon swap (chevron → `EndStopIcon`) plus a hazard-tinted border, not opacity alone. Error = diagonal hazard-stripe flap background, never red text alone.

**The One Lamp Rule.** Amber is the board's only "live" signal. It marks exactly one thing at a time (today, selection, active nav, focus) and never doubles as a generic decorative highlight.

## Typography

**Display Font:** Big Shoulders (with system-ui, sans-serif fallback)
**Body Font:** Archivo (with system-ui, sans-serif fallback)
**Label/Mono Font:** Martian Mono (flap-cell numerals and data only)

**Character:** A condensed, heavy-weight display face for board chrome (headings, nav, buttons, labels) paired with a plain grotesque for body copy, and a monospace exclusively inside flap cells — diegetic to the split-flap object itself, never used for prose.

### Hierarchy
- **Display** (800, `clamp(1.75rem, 4vw, 3rem)`, uppercase, tight tracking): page H1s, panel headers, primary/direction-toggle buttons, active nav label.
- **Flap** (700, `clamp(0.875rem, 2.5vw, 2.25rem)` scaling by cell `size` prop sm/md/lg, tabular): the only typeface that appears inside a `.flap-cell` — today widget, conversion result, calendar day numerals, picker grid.
- **Body** (400, 1rem, 1.5 line-height): descriptive paragraph copy under H1s, ISO/AD date sublines under flap rows.
- **Label** (600, 11px, 0.14em tracking, uppercase): section labels ("Today", "Direction", "Date"), weekday headers, nav "API docs" pill.

### Named Rules
**The Diegetic Mono Rule.** Martian Mono is reserved for characters that live physically on a flap card. It never appears in body copy, labels, or chrome — those stay in Archivo/Big Shoulders. If a number isn't inside a `.flap-cell`, it isn't in the flap font.

## Layout

Every route is a single centered column inside `.board-panel` modules: converter and calendar use `max-w-4xl` / `max-w-2xl` containers with `px-6 py-10` (`py-14` on `sm:`) outer padding and a consistent `gap-8`–`gap-10` vertical rhythm between stacked panels. The picker is a compact, fixed-width (`w-72`) embeddable module rather than a full-page layout, demonstrating it can drop into a host form. Panels stack vertically on all viewports; no multi-column page grid is used. Flap-cell rows wrap (`flex-wrap`) rather than truncate on narrow viewports, and calendar/picker grids use a fixed 7-column CSS/table grid with `gap`/`border-spacing` of `1.5` (6px) between cells — the board's mechanical mullions.

## Elevation & Depth

The system is layered and structural, not flat and not merely ambient: every physical object (board casing, flap face) carries a specific, load-bearing shadow that describes its material, and depth is never decorative.

### Shadow Vocabulary
- **Panel housing** (`box-shadow: 0 12px 28px -12px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)`): the `.board-panel` casing — a heavy drop shadow implying a bolted metal box sitting proud of the page, plus a hairline inset top highlight.
- **Flap face** (`box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset, 0 -2px 3px rgba(0,0,0,0.18) inset, 0 2px 4px rgba(0,0,0,0.35)`): the `.flap-cell` card — inset highlight/shade pair simulating a slightly curved paper flap, plus a small drop shadow lifting it off the panel.
- **Pilot glow** (`box-shadow: 0 0 6px 1px rgba(255,176,32,0.7)`): the `.pilot-dot` — a soft amber glow, the only ambient (non-structural) shadow in the system, reserved for the "live" indicator.

### Named Rules
**The Load-Bearing Shadow Rule.** Shadows describe a physical object (housing depth, flap curvature, lamp glow); they are never applied for generic UI lift on flat elements like plain buttons or inputs, which stay flat with a 1px border instead.

## Shapes

Corners are small and consistent: `10px` on board panels, `6px` on buttons/inputs/pills, `3px` on flap cells (just enough to read as trimmed card stock, not app-chrome rounding), and full pill radius only on the pilot-dot and nav "API docs" affordance. `.board-panel` carries two visible rivet dots (`::before`/`::after` top corners, `.rivet` spans bottom corners) — a recurring bolted-housing silhouette on every panel instance. `.flap-cell` carries a fixed horizontal split line at its vertical center (`::after`, 1px, `rgba(0,0,0,0.22)`) on every cell, representing the physical seam where the flap folds — this is present whether or not the cell is animating.

## Components

### Buttons
- **Shape:** 6px radius, uppercase Big Shoulders label, bold tracking-wide.
- **Primary:** bezel background (`#26221c`) / ivory text at rest (e.g. "Flip the board" submit); amber background / amber-ink text on hover.
- **Toggle group (direction switch):** two-segment pill with a shared 6px-radius border; active segment is amber-filled, inactive is casing-deep with muted text.
- **Ghost/nav-adjacent (Prev/Next, API docs):** transparent-ish casing-deep background, panel-line border, hover swaps border and text to amber/ivory. Disabled boundary state swaps border to hazard-tinted and swaps the leading/trailing icon from chevron to `EndStopIcon` rather than just dimming.

### Cards / Containers
- **Corner Style:** 10px radius (`.board-panel`).
- **Background:** panel (`#1c1a15`) over casing background.
- **Shadow Strategy:** see Elevation & Depth — Panel housing shadow, always paired with the two-rivet decoration.
- **Border:** 1px `panel-line` (`#322d24`).
- **Internal Padding:** roughly `px-5 py-6` to `px-8 py-9` depending on content density (compact for the today-strip, generous for the form/result panels).

### Inputs / Fields
- **Style:** casing-deep background, 1px panel-line border, 6px radius, flap-font (Martian Mono) for date-value text.
- **Focus:** border shifts to amber; global focus-visible ring is also amber (2px outline, 3px offset) — inputs don't get a separate glow treatment beyond the shared ring.
- **Error:** surfaced as a separate hazard-striped `ERROR` flap row plus inline hazard-colored text with a `WarningIcon`, adjacent to the field — not a red input border.

### Navigation
- Casing-deep header bar, 1px panel-line bottom border. Brand mark is a pilot-dot + uppercase Big Shoulders wordmark + muted tagline. Route links are uppercase Big Shoulders; active route is amber text with a 2px amber underline bar offset below the link; inactive is muted with an ivory hover. A distinct bordered "API docs" pill (external-link icon) sits apart from the route links to mark it as leaving the app. No separate mobile nav pattern — links wrap via flexbox.

### Flap Cell & Board Panel (signature components)
The two components that carry the whole world. `.board-panel` (via the `BoardPanel` wrapper) is the housing every module sits in: dark panel background, panel-line border, layered housing shadow, and two decorative rivets. `.flap-cell` (rendered per-character by `FlapRow`, and per-day by `CalendarGrid`) is the physical flap card: ivory background, flap-ink glyph, layered inset+drop shadow, a permanent horizontal split line, and — on value change, keyed by the character/day value — a `rotateX` flap-in animation (320ms, custom cubic-bezier, 15%→100% opacity) that respects `prefers-reduced-motion: reduce` by disabling itself entirely. Every date-bearing surface in the app (today widget, conversion result, calendar grid, embeddable picker grid) renders through this same module — there is no page with its own bespoke date-display treatment.

**Protect this system.** The finish review that closed this build flagged the flap-cell shadow/split-line/animation/hazard-stripe stack as the standout committed moment of the redesign. Do not let a future change flatten it into a plain CSS card (flat background, single drop-shadow, no split line, no flap-in transition) — that would erase the one piece of craft that makes the metaphor legible rather than decorative.

## Do's and Don'ts

### Do:
- **Do** route every date-bearing value through `FlapRow`/`.flap-cell`, even in a new surface — it's the app's one shared grammar, not a converter-page-only pattern.
- **Do** mark state with an outline/icon/stripe change (see The Mark-Not-Hue Rule), keeping amber reserved for exactly one "live" thing per view.
- **Do** keep the housing shadow + two-rivet decoration on any new `.board-panel` instance; it's a recurring signature, not an optional flourish.
- **Do** use Martian Mono only inside flap cells; keep body/label copy in Archivo/Big Shoulders.

### Don't:
- **Don't** introduce a light theme or `prefers-color-scheme` branch — the dim board is a committed single identity.
- **Don't** flatten `.flap-cell` into a plain rounded rectangle with a single box-shadow; the inset highlight/shade pair and split line are load-bearing to the metaphor (see the Protect This System note above).
- **Don't** use hazard-orange for anything other than error/out-of-range states — it is not a general warm accent.
- **Don't** add opacity-only disabled states on interactive board elements; boundary/disabled states get an icon swap and/or hazard-tinted border, matching the Mark-Not-Hue Rule.
