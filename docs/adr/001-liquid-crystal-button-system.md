# ADR-001: Liquid Crystal Button Design System

**Status:** Accepted  
**Date:** 2026-05-01  
**Authors:** Development Team  

---

## Context

We researched the state-of-the-art in premium UI (Apple visionOS/iOS 26 "Liquid Glass", Linear, Vercel, Stripe, Raycast) and identified a gap: Material Design relies on single-layer elevation shadows and symmetric timing, while premium products use multi-layer depth, specular highlights, spring physics, and asymmetric transitions to create a tactile, physically-grounded experience.

---

## Decision

We adopt the **"Liquid Crystal"** button design system — a CSS-variable-driven, multi-layered glass-material approach that makes buttons look and behave like precisely machined crystal capsules floating above the page surface.

### Design Language

The system is named "Liquid Crystal" because it blends:
- **Liquid Glass** (Apple 2025): low-blur refractive surfaces with strong polished edges
- **Crystal**: solid, precise, machined feel — not ethereal or atmospheric

### Core Principles

1. **Physical Depth Over Flat Elevation** — Buttons exist as 3D objects in a light field, not colored rectangles with drop shadows.
2. **Spring Physics** — Interactions follow real-world spring dynamics: fast snap-in, slow gravity-out, instant impact response.
3. **Specular Lighting Model** — A single virtual light source (top-left) consistently illuminates all button surfaces.
4. **Theme Universality** — The formula is invariant; only the glass token values change per theme.
5. **Progressive Enhancement** — Graceful degradation when `backdrop-filter` is unsupported.

---

## Technical Design

### Architecture: Token + Formula Separation

```
┌─────────────────────────────────┐
│ Theme Tokens (CSS Variables)    │  ← Changes per theme
│ --btn-glass-bg, --btn-shadow-*  │
└────────────────┬────────────────┘
                 │ consumed by
┌────────────────▼────────────────┐
│ Button Formula (UIkit Hooks)    │  ← Invariant across themes
│ hook-button(), hook-button-misc │
└─────────────────────────────────┘
```

Themes define **what** the material looks like; the formula defines **how** it behaves.

### The 5-Layer Visual Stack

Every Liquid Crystal button is constructed from 5 simultaneous visual layers:

```
┌────────────────────────────────────────┐
│ Layer 1: ::before — Curvature Gradient │  Convex surface illusion (light → dark top-to-bottom)
├────────────────────────────────────────┤
│ Layer 2: Background — Glass Fill       │  Semi-opaque milky surface + backdrop-filter blur(2px)
├────────────────────────────────────────┤
│ Layer 3: Border — Asymmetric Edges     │  Top/left brighter, bottom darker (directional light)
├────────────────────────────────────────┤
│ Layer 4: box-shadow — Depth Stack      │  Ambient + Direct + Specular Rim (inset 1px)
├────────────────────────────────────────┤
│ Layer 5: ::after — Shimmer Sweep       │  Light refraction flash on hover enter
└────────────────────────────────────────┘
```

### The 2px Blur Distinction

Buttons use `backdrop-filter: blur(2px)` while cards use `blur(12px)`. This is intentional:
- **Cards** are frosted surfaces (high blur = atmospheric, diffuse)
- **Buttons** are solid crystal objects (low blur = refractive, precise)

This contrast creates a clear visual hierarchy: buttons feel like physical objects **sitting on** frosted cards.

### Interaction Physics Model

| State | Transform | Shadow Behavior | Timing | Rationale |
|-------|-----------|-----------------|--------|-----------|
| **Rest** | `translateY(0)` | Ambient + direct + specular rim | — | Object sits on surface |
| **Hover** | `translateY(-2px)` | Shadows expand + glow appears | 150ms spring `(0.34, 1.56, 0.64, 1)` | Object lifts off surface |
| **Hover Exit** | Back to rest | Shadows contract | 300ms ease `(0.4, 0, 0.2, 1)` | Gravity pulls it back (slower) |
| **Active** | `translateY(1px) scale(0.982)` | Inset shadows (recessed) | 80ms ease-in | Instant mechanical press |
| **Disabled** | None | None | — | Inert, no glass effects |

**Key insight: Asymmetric timing.** Enter transitions are fast and snappy (spring overshoot), exit transitions are slow and weighted (gravity). This creates a subconscious "rightness" that symmetric easing cannot achieve.

### The Spring Bezier: `cubic-bezier(0.34, 1.56, 0.64, 1)`

The `1.56` y2 value creates a ~0.5px overshoot before settling. This replicates the behavior of a critically-damped spring — imperceptible consciously, but felt as physical correctness.

### CSS Variables (Glass Tokens)

Each theme defines these tokens:

| Token | Purpose | Light Theme Value |
|-------|---------|-------------------|
| `--btn-glass-bg` | Resting fill | `rgba(255, 255, 255, 0.65)` |
| `--btn-glass-bg-hover` | Hover fill (brighter) | `rgba(255, 255, 255, 0.82)` |
| `--btn-glass-bg-active` | Active fill (dimmer) | `rgba(255, 255, 255, 0.50)` |
| `--btn-glass-blur` | Backdrop blur radius | `2px` |
| `--btn-glass-saturate` | Backdrop saturation boost | `180%` |
| `--btn-glass-border-top` | Top edge (brightest) | `rgba(255, 255, 255, 0.92)` |
| `--btn-glass-border-side` | Left/right edges | `rgba(255, 255, 255, 0.75)` |
| `--btn-glass-border-bottom` | Bottom edge (darkest) | `rgba(200, 190, 220, 0.45)` |
| `--btn-specular-opacity` | Top 1px highlight intensity | `0.90` |
| `--btn-shadow-ambient` | Ambient depth shadow | `0 6px 20px rgba(108, 43, 217, 0.10)` |
| `--btn-shadow-direct` | Direct elevation shadow | `0 2px 5px rgba(0, 0, 0, 0.06)` |
| `--btn-shadow-glow` | Colored hover glow | `0 0 20px rgba(108, 43, 217, 0.20)` |
| `--btn-shimmer-color` | Shimmer sweep opacity | `rgba(255, 255, 255, 0.18)` |
| `--btn-curvature-top` | Curvature gradient start | `rgba(255, 255, 255, 0.18)` |
| `--btn-curvature-mid` | Curvature gradient midpoint | `rgba(255, 255, 255, 0.05)` |

### Variant Overrides

Colored variants (primary, secondary, danger) override the formula with:
- **Layered gradient** over brand color: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.05) 100%)` — simulates a convex surface catching light from above
- **`color-mix()` borders**: Top edge lighter (mixed with white), bottom darker (mixed with black)
- **Colored `--btn-shadow-ambient`**: The ambient glow takes on the button's hue

### Text & Link Variants

These are explicitly stripped of all glass effects — they remain minimal, inline elements without depth or material properties.

---

## Accessibility

| Concern | Solution |
|---------|----------|
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all transforms, shimmer, and animations |
| Keyboard focus | `focus-visible` ring: 2px outline in brand color at 60% opacity, 3px offset |
| Color contrast | Primary (#6c2bd9 on white text) maintains WCAG AA (4.6:1 ratio) |
| Browser support | `@supports not (backdrop-filter)` falls back to solid `rgba(255,255,255,0.92)` |
| Disabled state | Reduced opacity (0.45), no pointer events, all effects stripped |

---

## Performance

- **GPU compositing**: `will-change: transform` + `translateZ(0)` — transforms and opacity never trigger layout
- **No `backdrop-filter` animation**: The blur/saturate values are static; only transform and box-shadow animate
- **Pseudo-element layers**: `::before` and `::after` are `pointer-events: none` and don't add to the interactive tree
- **`isolation: isolate`**: Creates a stacking context to prevent bleed from `backdrop-filter` into unrelated elements

---

## Extending to Other Themes

To add Liquid Crystal to a new theme, define the `--btn-*` tokens inside that theme's `[data-theme='...']` block:

```scss
[data-theme='dark'] {
  --btn-glass-bg: rgba(255, 255, 255, 0.06);
  --btn-glass-bg-hover: rgba(255, 255, 255, 0.10);
  --btn-glass-bg-active: rgba(255, 255, 255, 0.04);
  --btn-glass-blur: 2px;
  --btn-glass-saturate: 150%;
  --btn-glass-border-top: rgba(255, 255, 255, 0.15);
  --btn-glass-border-side: rgba(255, 255, 255, 0.08);
  --btn-glass-border-bottom: rgba(0, 0, 0, 0.20);
  --btn-specular-opacity: 0.12;
  --btn-shadow-ambient: 0 6px 20px rgba(0, 0, 0, 0.40);
  --btn-shadow-direct: 0 2px 5px rgba(0, 0, 0, 0.30);
  --btn-shadow-glow: 0 0 20px rgba(30, 135, 240, 0.25);
  --btn-shimmer-color: rgba(255, 255, 255, 0.06);
  --btn-curvature-top: rgba(255, 255, 255, 0.08);
  --btn-curvature-mid: rgba(255, 255, 255, 0.02);
}
```

No changes to the formula hooks are needed.

---

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Material Design 3 elevation system** | Single-shadow model lacks specular highlights and physical depth. Timing is symmetric — feels computational, not physical. |
| **Pure glassmorphism (blur 12–24px)** | Too atmospheric/ethereal for buttons — makes them feel like panels, not interactive objects. The frosted look obscures content behind the button, reducing clarity. |
| **Neumorphism** | Requires specific background colors, poor contrast on colored surfaces, accessibility concerns with low-contrast edges. |
| **Framer Motion `motion.button` wrapper** | Deferred (not rejected). CSS spring bezier provides excellent overshoot already. Framer Motion adds bundle weight and requires wrapping every button in a `motion` component. Can be revisited for multi-axis spring interactions. |
| **CSS `@keyframes` breathing gradient (Stripe style)** | Too distracting for general-use buttons. Appropriate for hero CTAs only, not for the entire button system. May be added as an optional `variant="cta"` in the future. |

---

## Consequences

### Positive
- Buttons now have a distinct, premium tactile feel that differentiates Gimlee from every competitor using flat design
- Theme-universal architecture means new themes get buttons "for free" by defining tokens
- Performance is excellent — only GPU-composited properties animate
- Accessibility is maintained with motion reduction, focus rings, and browser fallbacks

### Negative
- `backdrop-filter` has no support in IE11 (irrelevant for our target audience)
- The shimmer `::after` pseudo-element means buttons cannot use `::after` for other purposes (e.g., custom icons via pseudo-elements must use `::before` or child elements instead)
- Slightly higher CSS specificity in `hook-button-misc()` due to `.uk-button:hover:not(:disabled)` chains

### Risks
- On very low-end Android WebViews, `backdrop-filter` may cause jank — mitigated by the `@supports` fallback
- Some UIkit components internally use `.uk-button` (e.g., upload buttons, close buttons) — the text/link variant stripping handles most cases, but edge cases may need additional exclusions

---

## Related Files

- `src/styles/main.scss` — Hook implementations and glass tokens
- `src/styles/uikit-variables.scss` — UIkit button variable overrides
- `src/components/uikit/Button/Button.tsx` — React wrapper component
- `src/components/uikit/Button/Button.stories.tsx` — Storybook showcase

---

## Future Considerations

1. **Framer Motion upgrade** — For drag-to-dismiss or multi-axis spring interactions
2. **`variant="cta"`** — A breathing-gradient hero button for landing pages
3. **Dark theme tokens** — Extend to `dark`, `dark-unicorn`, and `iron-age` themes
4. **Haptic feedback** — On Capacitor native builds, trigger `Haptics.impact()` on button press
5. **Segmented controls** — Apply the "glass within glass" (Linear-style nested depth) pattern to tab groups and toggle switches
