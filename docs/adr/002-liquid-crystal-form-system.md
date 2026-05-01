# ADR-002: Liquid Crystal Form Input Design System

**Status:** Accepted  
**Date:** 2026-05-01  
**Authors:** Development Team  

---

## Context

ADR-001 established the "Liquid Crystal" button system — a multi-layered glass-material approach that makes buttons feel like machined crystal capsules floating above the page surface. However, form controls (inputs, selects, textareas, radios, checkboxes, toggles) still use vanilla UIkit styling: flat, unremarkable, and visually disconnected from the premium button system.

Users interact with forms constantly (registration, ad creation, search, settings). The form experience must match the tactile quality set by buttons while communicating a fundamentally different affordance: **receptivity** (waiting for content) vs. **emissivity** (pushing action).

---

## Decision

We adopt the **"Liquid Crystal Form"** system — extending the glass-material design language to all form controls using an inverted physical metaphor:

- **Buttons** = "Crystal Capsules" — **raised**, convex, floating above the surface
- **Inputs** = "Crystal Wells" — **recessed**, concave, sunk into the surface

This distinction creates an immediate, subconscious affordance signal: raised things push; sunken things receive.

### Sub-Metaphors

| Control | Metaphor | Physical Analogy |
|---------|----------|------------------|
| Input / Select / Textarea | **Crystal Well** | A polished depression in a glass panel |
| Radio / Checkbox | **Crystal Gem** | A small socket that fills with a glowing gemstone when activated |
| Toggle | **Crystal Slider** | A track channel with a sliding crystal thumb |

---

## Technical Design

### Architecture: Token + Formula Separation (Same as ADR-001)

```
┌─────────────────────────────────────┐
│ Theme Tokens (CSS Variables)        │  ← Changes per theme
│ --input-glass-*, --input-shadow-*   │
└──────────────────┬──────────────────┘
                   │ consumed by
┌──────────────────▼──────────────────┐
│ Form Formula (UIkit Hooks)          │  ← Invariant across themes
│ hook-form(), hook-form-misc()       │
└─────────────────────────────────────┘
```

### The 5-Layer Visual Stack (Input / Select / Textarea)

```
┌────────────────────────────────────────────────┐
│ Layer 1: Background — Glass Well Fill          │  Semi-transparent recessed surface + blur(1px)
├────────────────────────────────────────────────┤
│ Layer 2: Border — Concave Edges (inverted)     │  Top/left DARKER, bottom/right LIGHTER
├────────────────────────────────────────────────┤
│ Layer 3: box-shadow — Inner Depth              │  inset shadow from top (recessed illusion)
├────────────────────────────────────────────────┤
│ Layer 4: Focus Ring — Glow Aura                │  Animated brand-colored glow on focus
├────────────────────────────────────────────────┤
│ Layer 5: Transition — State Physics            │  Spring timing for focus/blur transitions
└────────────────────────────────────────────────┘
```

### Key Inversion from Buttons

| Property | Button (Capsule) | Input (Well) |
|----------|-----------------|--------------|
| Border top | Brightest (light catches convex top) | Darkest (shadow falls into concave top) |
| Border bottom | Darkest | Lightest (light catches the concave rim) |
| box-shadow | External depth shadows | **Inset** depth shadows |
| Hover transform | `translateY(-2px)` (lifts) | None (wells don't lift) |
| Focus effect | N/A (buttons don't focus like inputs) | Glow ring + inner shadow softens |

### Interaction States

| State | Visual Change | Timing | Rationale |
|-------|---------------|--------|-----------|
| **Rest** | Subtle recessed well, muted border, soft inner shadow | — | Quietly waiting for interaction |
| **Hover** | Border brightens slightly, inner shadow softens | 150ms spring `(0.34, 1.56, 0.64, 1)` | Acknowledges presence without demanding attention |
| **Focus** | Brand-colored glow ring, border saturates, inner shadow lifts, background brightens | 200ms spring | Clear signal: "I'm ready for your input" |
| **Filled (valid)** | Subtle success tint on border (optional) | 200ms ease | Quiet positive reinforcement |
| **Error (danger)** | Danger-colored border + ambient glow | 200ms ease | Clear but not aggressive (per AGENTS.md: only on blur) |
| **Disabled** | Reduced opacity (0.5), no glass effects, no pointer events | — | Inert, visually receded |

### CSS Variable Tokens

#### Input / Select / Textarea Tokens

| Token | Purpose | Light Theme Default |
|-------|---------|---------------------|
| `--input-glass-bg` | Resting fill | `rgba(255, 255, 255, 0.45)` |
| `--input-glass-bg-hover` | Hover fill | `rgba(255, 255, 255, 0.60)` |
| `--input-glass-bg-focus` | Focus fill (brighter) | `rgba(255, 255, 255, 0.75)` |
| `--input-glass-blur` | Backdrop blur radius | `1px` |
| `--input-glass-saturate` | Backdrop saturation | `120%` |
| `--input-border-top` | Top edge (darkest — shadow) | `rgba(0, 0, 0, 0.10)` |
| `--input-border-side` | Side edges | `rgba(108, 43, 217, 0.12)` |
| `--input-border-bottom` | Bottom edge (lightest — rim) | `rgba(255, 255, 255, 0.60)` |
| `--input-shadow-inner` | Inset depth shadow | `inset 0 2px 4px rgba(0, 0, 0, 0.06)` |
| `--input-shadow-inner-hover` | Softened on hover | `inset 0 1px 3px rgba(0, 0, 0, 0.04)` |
| `--input-shadow-inner-focus` | Lifted on focus | `inset 0 1px 2px rgba(0, 0, 0, 0.03)` |
| `--input-focus-glow` | Focus ring glow | `0 0 0 3px rgba(108, 43, 217, 0.15)` |
| `--input-focus-border` | Focus border color | `rgba(108, 43, 217, 0.40)` |

#### Radio / Checkbox Tokens

| Token | Purpose | Light Theme Default |
|-------|---------|---------------------|
| `--input-radio-bg` | Unchecked fill | `rgba(255, 255, 255, 0.50)` |
| `--input-radio-border` | Unchecked border | `rgba(108, 43, 217, 0.18)` |
| `--input-radio-checked-bg` | Checked fill | `var(--global-primary-background)` |
| `--input-radio-checked-glow` | Checked ambient glow | `0 0 8px rgba(108, 43, 217, 0.30)` |
| `--input-radio-shadow-inner` | Recessed shadow | `inset 0 1px 3px rgba(0, 0, 0, 0.08)` |

#### Toggle Tokens

| Token | Purpose | Light Theme Default |
|-------|---------|---------------------|
| `--input-toggle-track-bg` | Off-state track | `rgba(0, 0, 0, 0.08)` |
| `--input-toggle-track-active` | On-state track | `var(--global-primary-background)` |
| `--input-toggle-thumb-bg` | Thumb fill | `rgba(255, 255, 255, 0.95)` |
| `--input-toggle-thumb-shadow` | Thumb depth | `0 1px 3px rgba(0, 0, 0, 0.15)` |

### Radio & Checkbox: "Crystal Gem" Animation

```
┌──────────────────────────────────────────────────────────────────┐
│ Unchecked              │  Transition         │  Checked           │
│                        │                     │                    │
│  ┌────────────┐        │   scale(0.85)       │  ┌────────────┐   │
│  │  ░░░░░░░░  │  ──►   │   → scale(1.0)      │  │  ████████  │   │
│  │  ░ empty ░ │        │   with overshoot    │  │  ██ gem ██  │   │
│  │  ░░░░░░░░  │        │   (spring 150ms)    │  │  ████████  │   │
│  └────────────┘        │                     │  └────────────┘   │
│  Recessed well         │                     │  Glowing core      │
└──────────────────────────────────────────────────────────────────┘
```

The checked state uses:
- `background: var(--input-radio-checked-bg)` with gradient overlay for convexity
- `box-shadow: var(--input-radio-checked-glow)` for ambient radiance
- `transform: scale(1)` with spring timing from `scale(0.85)` on transition

### Toggle: "Crystal Slider" Mechanics

The toggle is a custom component (not native UIkit). It uses:
- **Track**: styled as a pill-shaped crystal well (same concave treatment as inputs)
- **Thumb**: styled as a mini crystal capsule (same raised treatment as buttons)
- **Transition**: thumb translates with spring physics `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Track fill**: on activation, the track floods with brand color (200ms ease)

### The 1px Blur Distinction

Inputs use `backdrop-filter: blur(1px)` — even less than buttons (2px):
- **Buttons** = Crystal capsules (slight refraction shows precision)
- **Inputs** = Crystal wells (near-clear glass — you need to see the content clearly)
- **Cards** = Frosted panels (blur 12px — atmospheric, diffuse)

This 3-tier blur hierarchy reinforces the visual hierarchy: content containers → interactive fields → action triggers.

### Select Chevron

The native `<select>` element uses UIkit's `FormCustom` wrapper for a custom chevron. The chevron receives a subtle rotation animation (0° → 180°) when the dropdown opens, handled via CSS on the UIkit `uk-open` class.

---

## Accessibility

| Concern | Solution |
|---------|----------|
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables spring transforms, glow pulses, and gem scale animations |
| Keyboard focus | `focus-visible` glow ring: 3px brand-colored ring at 15% opacity, expanded to 20% on `:focus-visible` |
| Color contrast | All borders and backgrounds maintain sufficient contrast against both light and dark themes |
| Error states | Danger glow supplements (does not replace) the existing `uk-form-danger` border color |
| Disabled state | Opacity 0.5, no pointer events, no glass effects — clearly inert |
| High contrast mode | `@media (forced-colors: active)` lets system colors take over |

---

## Performance

- **GPU compositing**: Only `box-shadow`, `border-color`, and `background-color` transition — no layout-triggering properties
- **No `backdrop-filter` animation**: blur/saturate values are static; only colors/shadows animate
- **Minimal pseudo-elements**: Unlike buttons (which need `::before`/`::after` for curvature and shimmer), inputs don't need them — the concave illusion is achieved purely with border colors and inset shadows
- **`isolation: isolate`**: Applied to the form context (not individual inputs) to contain backdrop-filter stacking

---

## Extending to Other Themes

Define the `--input-*` tokens inside each theme's `[data-theme='...']` block. The formula hooks remain invariant:

```scss
[data-theme='dark'] {
  --input-glass-bg: rgba(255, 255, 255, 0.04);
  --input-glass-bg-hover: rgba(255, 255, 255, 0.07);
  --input-glass-bg-focus: rgba(255, 255, 255, 0.10);
  --input-glass-blur: 1px;
  --input-glass-saturate: 120%;
  --input-border-top: rgba(0, 0, 0, 0.30);
  --input-border-side: rgba(255, 255, 255, 0.08);
  --input-border-bottom: rgba(255, 255, 255, 0.12);
  --input-shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.20);
  --input-shadow-inner-hover: inset 0 1px 3px rgba(0, 0, 0, 0.15);
  --input-shadow-inner-focus: inset 0 1px 2px rgba(0, 0, 0, 0.10);
  --input-focus-glow: 0 0 0 3px rgba(30, 135, 240, 0.20);
  --input-focus-border: rgba(30, 135, 240, 0.50);
  // ...radio, toggle tokens
}
```

---

## Blank Variant

The `blank` variant (`.uk-form-blank`) strips all crystal effects — matching how text/link button variants strip glass effects:
- No background, no backdrop-filter
- No border (only bottom border line)
- No inset shadow
- Focus uses a simple underline glow instead of full ring

---

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Matching button treatment (raised inputs)** | Creates affordance confusion — inputs and buttons would look identical at rest. Users need to distinguish "click me" from "type here" at a glance. |
| **Heavy neumorphic inset** | Too aggressive depth creates a visual "hole" that distracts from content. Subtle 2-4px inset is sufficient. |
| **Animated shimmer on focus** | Too distracting during typing. Shimmer works for buttons (momentary interaction) but not for sustained-focus elements. |
| **Custom dropdown panels** | Premature — UIkit's dropdown already matches cards. Revisit when the design system extends to panels/popovers (ADR-003?). |

---

## Consequences

### Positive
- Form controls now share the premium tactile language with buttons while maintaining clear affordance distinction
- Theme-universal: new themes only need to define `--input-*` tokens
- Minimal performance cost — no pseudo-elements needed for the concave illusion
- No React component changes — purely CSS-driven via UIkit hooks
- Respects existing focus-aware UX (AGENTS.md §C): danger only on blur, info guidance on focus

### Negative
- `backdrop-filter: blur(1px)` on inputs adds slight GPU load on pages with many visible fields
- Custom toggle component will need its own React wrapper in the future (not part of UIkit's form system)
- Dark themes with very low-contrast backgrounds may need careful token tuning to keep the concave illusion visible

### Risks
- On very low-end Android WebViews, multiple backdrop-filters (navbar + card + inputs) may cause jank — mitigated by `@supports` fallback
- The `dark-unicorn` theme uses gradient for `--global-primary-background` — focus glow tokens must use `--global-primary-color` (solid) instead

---

## Related Files

- `src/styles/main.scss` — Hook implementations and glass tokens (both button and form)
- `src/styles/uikit-variables.scss` — UIkit form variable overrides
- `src/components/uikit/Form/Form.tsx` — React wrapper components (unchanged)
- `src/components/uikit/Form/Form.stories.tsx` — Storybook showcase (updated)
- `docs/adr/001-liquid-crystal-button-system.md` — Companion button system

---

## Future Considerations

1. **Custom Toggle component** — React wrapper with Framer Motion for the spring-physics thumb slide
2. **Autocomplete overlay** — Crystal well with glass-panel suggestion dropdown
3. **Input groups** — Merged crystal wells with shared border (like button groups)
4. **File upload zone** — Dashed crystal well with drag-hover glow
5. **Search input** — Pill-shaped crystal well with icon integration
6. **Dark theme token refinement** — Fine-tune per-theme after visual testing
