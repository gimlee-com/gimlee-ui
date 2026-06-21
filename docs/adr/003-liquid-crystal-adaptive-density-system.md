# ADR-003: Liquid Crystal Adaptive Density System

**Status:** Accepted  
**Date:** 2026-06-21  
**Authors:** Development Team  

---

## Context

ADR-001 (buttons) and ADR-002 (form inputs) established the **"Liquid Crystal"** material language — how surfaces *look* and *feel*. Neither addresses how content *sizes and packs itself* as the viewport narrows.

The trigger for this ADR was a concrete request: show **two ad cards per row on mobile** instead of one (see `dual-ads-in-mobile-listings.md`). Investigating that request revealed a systemic gap:

- Listing pages each hand-roll their own responsive column classes (`uk-child-width-1-2@s`, `uk-child-width-1-2`, `uk-child-width-1-3@s`, …) — **inconsistent across `AdListingPage`, `HomePage`, `AdWatchlistPage`, and `AdDetailsPage`**.
- `AdCard` padding (`16px`), title (`1rem`), and price (`1.25rem`) are **fixed pixel/rem values** tuned for wide cards. They do not adapt when the same card is squeezed into a half-width mobile column.
- There is **no shared definition of "how dense is too dense"** — no minimum tap target, no minimum legible font size, no canonical mobile gap.

Solving the dual-ad request with a one-off media query in `AdCard.module.scss` would "work," but it would be the third or fourth independent responsive ruleset in the codebase. For a platform that aims to compete with global marketplaces, ad-hoc shrinking is a readability and accessibility liability.

We therefore elevate **responsive sizing dynamics to a first-class, design-system-wide regime** — the same way ADR-001/002 elevated material treatment. Density becomes a *designed property*, not an emergent accident of CSS classes.

---

## Decision

We adopt the **"Liquid Crystal Adaptive Density"** system — a global, token-driven regime that governs how any content compresses on narrower screens while guaranteeing readability and accessibility floors.

### Guiding Metaphor

Extending the material language of ADR-001/002:

> Liquid Crystal does not *break* under pressure — it **compresses elastically**. As the viewport narrows, surfaces draw closer, type settles into a tighter fluid scale, and ornament recedes — but the crystal never crushes legibility or tap targets below their physical minimums.

### Core Principles

1. **Density is a Mode, Not an Accident** — Every content surface declares a *density intent* (`comfortable`, `compact`, `dense`), resolved by the system. Components never invent their own breakpoint magic numbers.
2. **Fluid Over Stepped** — Prefer continuous `clamp()`-based fluid scaling over discrete per-breakpoint overrides. Type and spacing interpolate smoothly between a mobile floor and a desktop ceiling, eliminating "jump" reflows at breakpoints.
3. **Reveal More, Read Less Worse** — Increasing on-screen information density must **never** reduce legibility below the accessibility floors. We gain density by *removing optional ornament*, not by shrinking essential text below the floor.
4. **Progressive Disclosure of Ornament** — Non-essential elements (secondary icons, footers, dividers, helper chrome) are the first to recede under pressure; essential content (title, price, primary action) is the last.
5. **Token + Formula Separation** — Identical to ADR-001/002: themes/contexts set *what* the density values are; shared formula utilities decide *how* they apply.
6. **Accessibility Is a Floor, Not a Setting** — Minimum font size, minimum tap target, and minimum contrast are hard limits the system physically cannot cross, regardless of density mode.

---

## Technical Design

### Architecture: Token + Formula Separation (Same as ADR-001/002)

```
┌──────────────────────────────────────┐
│ Density Tokens (CSS Variables)       │  ← Changes per density mode / theme
│ --density-*, --fluid-*, --grid-*     │
└───────────────────┬──────────────────┘
                    │ consumed by
┌───────────────────▼──────────────────┐
│ Density Formula (SCSS mixins/utils)  │  ← Invariant; lives in main.scss
│ fluid(), hook-density(), grid utils  │
└───────────────────────────────────────┘
```

Density modes define **what** the compression values are; the formula defines **how** content responds. A component opts into a mode (`data-density="compact"`) and inherits the entire scale — it never hardcodes pixels.

### The Breakpoint Contract

We standardize on **UIkit's existing SCSS breakpoint variables** (available via `_uikit-imports.scss`). **No new pixel literals** are introduced — Principle "Think Twice Before Hardcoding" (AGENTS.md §19).

| Tier | UIkit variable | Width | Default density mode |
|------|----------------|-------|----------------------|
| Phone | `< $breakpoint-small` | `< 640px` | `dense` |
| Phablet / small tablet | `$breakpoint-small` | `640px+` | `compact` |
| Tablet / desktop | `$breakpoint-medium` | `960px+` | `comfortable` |
| Large desktop | `$breakpoint-large` | `1200px+` | `comfortable` |

Density mode is a **default per tier**, but a surface may override it (e.g., a data-dense dashboard may request `compact` even on desktop).

### The Fluid Scale: `clamp()` Formula

The heart of the system is a single fluid helper that interpolates a value between a mobile floor and a desktop ceiling against the viewport:

```scss
// main.scss — invariant formula
// Linear interpolation between $min (at $from vw) and $max (at $to vw),
// clamped so it never crosses the floor/ceiling.
@function fluid($min, $max, $from: 360px, $to: 1200px) {
  $slope: math.div($max - $min, $to - $from);
  $intercept: $min - $slope * $from;
  @return clamp(
    #{$min},
    #{$intercept} + #{$slope * 100}vw,
    #{$max}
  );
}
```

This yields **continuous** scaling — text at 360px is at its floor, text at 1200px is at its ceiling, and everything between interpolates smoothly without a single media-query "jump."

### Density Token Tables

#### Fluid Typography Tokens

| Token | Floor (≈360px) | Ceiling (≈1200px) | Notes |
|-------|----------------|-------------------|-------|
| `--fluid-text-title` | `0.875rem` (14px) | `1rem` (16px) | Card titles |
| `--fluid-text-price` | `1.0625rem` (17px) | `1.25rem` (20px) | Primary price — stays prominent |
| `--fluid-text-meta` | `0.75rem` (12px) | `0.8125rem` (13px) | Location / secondary meta |
| `--fluid-text-body` | `0.9375rem` (15px) | `1rem` (16px) | Long-form / descriptions |

> **Floors are non-negotiable.** `0.75rem` (12px) is the absolute minimum legible size; the system never scales any readable text below it.

#### Density (Spacing) Tokens

| Token | `comfortable` | `compact` | `dense` | Purpose |
|-------|---------------|-----------|---------|---------|
| `--density-gap` | `$global-medium-gutter` (40px) | `$global-gutter` (30px) | `$global-small-gutter` (15px) | Grid gutter ("breathing room") |
| `--density-pad` | `16px` | `12px` | `10px` | Card / surface inner padding |
| `--density-stack` | `12px` | `8px` | `6px` | Vertical rhythm between meta rows |
| `--density-radius` | `var(--card-border-radius)` | `var(--card-border-radius)` | `calc(var(--card-border-radius) * 0.85)` | Slightly tighter corners when dense |

> **The grid gap is the canonical "breathing room" token.** It maps **directly onto UIkit's native gutter scale** (`$global-medium-gutter` → `$global-gutter` → `$global-small-gutter`) rather than to raw pixels. This keeps the listing gutters in lockstep with the rest of the design system: a single UIkit gutter retune cascades everywhere, and there is one — and only one — gutter token to reason about. Desktop gets the most room (40px) so dense grids don't overwhelm; phones tighten to 15px so two cards fit comfortably per row.
>
> **Why `--density-pad` / `--density-stack` stay explicit (and that's correct):** per the *Think Twice* rule (AGENTS.md §19) we evaluated UIkit's spacing scale for these too — but the card interior is *deliberately* tighter than any UIkit step. UIkit's smallest grid/card spacing is `$global-small-gutter` (15px), already too generous for a 2-up mobile card, and the next step jumps to 30/40px. Forcing the interior onto that coarse scale would inflate the card and defeat the density goal, so these remain purpose-tuned literals. The rule is *"don't hardcode a value that a UIkit variable already expresses"* — not *"never use a literal"*.

#### Grid Tokens

| Token | Phone | `$breakpoint-small`+ | `$breakpoint-medium`+ | `$breakpoint-large`+ |
|-------|-------|----------------------|-----------------------|----------------------|
| `--grid-cols-cards` | `2` | `3` | `4` | `5` |

This token directly resolves the original request: **2 columns on phones**, progressively more on wider screens — defined **once**, consumed everywhere.

> **One gutter token, not two.** Earlier drafts of this ADR proposed a separate `--grid-gap` token alongside `--density-gap`. That was redundant: the grid gutter *is* a density concern. The canonical token is **`--density-gap`** (see the Density Tokens table) — it is the single source of truth for the listing gutter and is what the shipped `.uk-grid-adaptive` utility consumes. Column **count** (`--grid-cols-cards`) and column **gutter** (`--density-gap`) are deliberately separate axes.

### Accessibility Floors (Hard Limits)

These are enforced by the formula and cannot be overridden by any density mode:

| Floor | Value | Rationale |
|-------|-------|-----------|
| Minimum readable font | `0.75rem` (12px) | WCAG legibility for sustained reading |
| Minimum interactive font | `0.875rem` (14px) | Links/buttons users must act on |
| Minimum tap target | `44 × 44px` (`--tap-min`) | WCAG 2.5.5 / Apple HIG / Material |
| Minimum text contrast | WCAG AA (4.5:1) | Inherited from theme tokens |
| Minimum line-height | `1.3` | Prevents cramped multi-line wrapping |

Tap targets are protected even when *visual* density increases: a control may *look* small but its hit area is padded to `--tap-min` via an invisible `::before` expander (the same technique used for the watch button overlay).

### The Density Cascade (Progressive Disclosure Order)

When a surface enters a denser mode, ornament recedes in this strict priority order — essential content is always last to go:

```
dense  ─────────────────────────────────────────────►  comfortable
│                                                                  │
│ 1. Decorative dividers / footers      (first to hide)            │
│ 2. Secondary meta icons (keep label)                             │
│ 3. Tertiary meta lines (e.g., settlement currencies)             │
│ 4. ─────────── ESSENTIAL FLOOR ───────────                       │
│ 5. Location (city only, no region)                               │
│ 6. Title (clamped to 2 lines)         ── never hidden            │
│ 7. Price                              ── never hidden, never < floor │
│ 8. Primary action / tap target        ── never below --tap-min   │
```

### Reference Application — `AdCard` Density Modes

The original dual-ads request becomes a *trivial, principled* application of the system rather than a bespoke media query:

```scss
// AdCard.module.scss
@import "../../styles/uikit-imports.scss";

.content {
  padding: var(--density-pad);
  gap: var(--density-stack);
}
.title  { font-size: var(--fluid-text-title); }
.primaryPrice { font-size: var(--fluid-text-price); }
.locationWrapper { font-size: var(--fluid-text-meta); }

// Dense mode (phones): recede ornament per the cascade
[data-density="dense"] & {
  .footer { display: none; }              // step 1 — decorative
  .locationWrapper .icon { display: none; } // step 2 — secondary icon
}
```

And the adaptive gutter is consumed through the existing `Grid` wrapper via a dedicated `gap="adaptive"` value — no per-page pixel tuning, no bespoke media query:

```tsx
// Every listing surface (AdListingPage, HomePage, AdWatchlistPage,
// UserSpacePage, AdDetailsPage "related ads") uses the same gap.
<Grid gap="adaptive" match className="uk-child-width-1-2 uk-child-width-1-3@s uk-child-width-1-4@m uk-child-width-1-5@l">
  {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
</Grid>
```

`gap="adaptive"` resolves to the `.uk-grid-adaptive` utility in `main.scss`, which simply re-points UIkit's gutter machinery at `--density-gap`:

```scss
// main.scss — adaptive gutter (consumes the canonical --density-gap token)
.uk-grid-adaptive {
  margin-left: calc(-1 * var(--density-gap)) !important;
  > * { padding-left: var(--density-gap) !important; }
  &.uk-grid-stack > .uk-grid-margin,
  & + .uk-grid-adaptive,
  * + .uk-grid-margin { margin-top: var(--density-gap) !important; }
}
```

> A future, fully standardized `<CardGrid>` wrapper (see *Future Considerations*) could also read `--grid-cols-cards` to drop the `uk-child-width-*` classes entirely; `gap="adaptive"` is the shipped first step toward that.

### Integration With Existing Animation Rules

- Because fluid type/spacing changes are **continuous** (not stepped), they avoid layout "jumps" — reinforcing AGENTS.md §B/Q (smooth layout transitions).
- Density-driven `display: none` of ornament must still respect AGENTS.md §47: never animate height-to-zero on a margin-bearing wrapper. Receding elements either hard-hide (no layout animation) or use the established `expandCollapseProps` with margins on an inner child.

---

## Accessibility

| Concern | Solution |
|---------|----------|
| Tiny text on dense cards | Hard floor `--fluid-text-*` minimums (12px readable / 14px interactive) enforced in the `fluid()` clamp |
| Shrunken tap targets | `--tap-min: 44px` hit-area expander on all interactive controls regardless of visual size |
| Reduced motion | Fluid scaling is CSS-driven and instant; no motion introduced. Honors existing `prefers-reduced-motion` rules |
| Zoom / text resize | `rem`-based floors mean OS/browser font scaling still enlarges everything proportionally |
| High contrast mode | Contrast inherited from theme tokens; density never alters color tokens |
| Cognitive load | Progressive disclosure removes *ornament*, never *information hierarchy* — title/price/action always present |

---

## Performance

- **Pure CSS, zero JS**: density resolves via CSS custom properties + `clamp()`; no resize listeners, no layout thrash.
- **Fewer media queries**: continuous `clamp()` replaces multiple stepped breakpoint overrides, shrinking compiled CSS.
- **No reflow on resize jumps**: continuous interpolation avoids the multiple discrete reflows that stepped breakpoints cause during orientation changes.
- **Compositor-friendly**: density changes touch `font-size`/`padding` (layout) only at load/resize — never animated per-frame.

---

## Extending to Other Contexts / Themes

Density modes are theme-agnostic (they govern *space*, not *color*). To apply a density mode to any surface, set the attribute and consume the tokens:

```scss
[data-density="compact"] {
  --density-pad: 12px;
  --density-stack: 8px;
  --density-gap: #{$global-gutter}; // canonical gutter token, mapped to a UIkit variable
}
```

New themes inherit the regime automatically — they only override color tokens (ADR-U / AGENTS.md §U), never the density formula. A future data-dashboard could opt an entire route into `dense` regardless of viewport.

---

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **One-off media query in `AdCard.module.scss`** | Solves the immediate dual-ads request but adds a 4th independent responsive ruleset. No reuse, no floors, guarantees future inconsistency. |
| **Per-breakpoint stepped overrides only** (no `clamp()`) | Causes visible "jumps" at each breakpoint, conflicting with the spring/smoothness ethos (AGENTS.md §B). More CSS, harder to tune. |
| **JS-measured container queries via ResizeObserver** | Native CSS container queries are simpler, but browser support across our Capacitor WebView floor is uneven for the full feature set; `clamp()` + UIkit breakpoints cover 100% of targets today. Revisit when container-query support is universal. |
| **Pure CSS container queries** | Promising and aligned with the goal; deferred (not rejected) pending WebView baseline verification. The token architecture here is forward-compatible — switching the *trigger* from viewport to container later requires no token changes. |
| **Shrink fonts uniformly with a viewport `vw` font-size** | Risks dropping below legibility floors and breaks user zoom. `clamp()` with rem floors preserves accessibility. |
| **Keep single-column mobile listings** | Rejected by product: higher density measurably improves selection exposure and conversion; the system makes it safe. |

---

## Consequences

### Positive

- The original **2-ads-per-row mobile** goal is delivered as a *principled, reusable* feature, not a patch.
- Every listing surface (`AdListingPage`, `HomePage`, `AdWatchlistPage`, `AdDetailsPage`) converges on **one** grid/density definition — eliminating the current `uk-child-width-*` divergence.
- Accessibility floors are guaranteed *by construction*, removing a class of "mobile text too small" bugs.
- Continuous fluid scaling removes breakpoint "jumps," reinforcing the premium tactile feel.
- Future surfaces (chat, profiles, dashboards) get responsive density "for free."

### Negative

- Introduces a new token vocabulary (`--density-*`, `--fluid-*`, `--grid-*`) developers must learn and reach for instead of UIkit width classes.
- Requires a one-time refactor of existing listing pages to the standardized grid/density wrapper.
- `clamp()` interpolation math (`fluid()` mixin) is less immediately readable than a flat pixel value.

### Risks

- **Inconsistent adoption**: if some components keep hardcoding pixels, the regime fragments. Mitigation: lint/Storybook stories demonstrating density modes; code review enforcement.
- **Over-compression temptation**: teams may push `dense` everywhere. Mitigation: hard accessibility floors physically cap the damage.
- **Capacitor WebView `clamp()` edge cases** on very old Android WebViews — mitigated by `rem` floors that degrade gracefully to the minimum.

---

## Related Files

- `src/styles/main.scss` — Density tokens (`:root` / per-tier blocks), the `--density-gap` → UIkit gutter mapping, and the `.uk-grid-adaptive` utility
- `src/components/uikit/Grid/Grid.tsx` — `Grid` wrapper exposing `gap="adaptive"` (applies `.uk-grid-adaptive`)
- `src/styles/_uikit-imports.scss` — Source of `$breakpoint-*` and `$global-*-gutter` variables used by the density tiers
- `src/components/CardGrid/` — (To be added) standardized density-aware grid wrapper that would also drive `--grid-cols-cards`
- `src/ads/components/AdCard.module.scss` — Reference application of fluid type + density cascade
- `dual-ads-in-mobile-listings.md` — The originating request this ADR generalizes
- `docs/adr/001-liquid-crystal-button-system.md`, `docs/adr/002-liquid-crystal-form-system.md` — Companion design-system ADRs

---

## Future Considerations

1. **Container queries** — Migrate the density *trigger* from viewport to per-container once WebView support is universal (token architecture is already forward-compatible).
2. **User density preference** — Expose a "Compact / Comfortable" toggle in Regional/Display settings, persisted like theme (AGENTS.md §U), letting power users opt into higher density globally.
3. **`<CardGrid>` component** — Ship the standardized density-aware grid wrapper and migrate all listing pages onto it.
4. **Density-aware imagery** — Pair `dense` mode with the progressive thumbnail strategy (AGENTS.md §G) to fetch smaller thumbnails when cards are physically smaller.
5. **Storybook density matrix** — A story rendering each card/surface across all three density modes for visual regression.
6. **Lint rule** — Flag raw `uk-child-width-*` and hardcoded padding/font px in component SCSS to enforce token usage.
