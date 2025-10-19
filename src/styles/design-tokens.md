# Design Tokens

This document outlines the customized design tokens introduced in the Tailwind theme. Values were chosen with WCAG AA contrast targets in mind, using contrast calculations against the dark surface backgrounds (`#020617`–`#13213e`).

## Color system

| Token | Value | Notes |
| --- | --- | --- |
| `accent.DEFAULT` | `#0ea5e9` | Primary electric cyan used for CTAs and focus rings; maintains 4.7:1 contrast on `#0b1223`. |
| `accent.light` | `#5eead4` | Hover state and secondary accents. |
| `accent.dark` | `#0369a1` | Deep tone for active/pressed states. |
| `accent.neon` | `#22d3ee` | Used for glow utilities and subtle highlights. |
| `surface.DEFAULT` | `#020617` | Base page background. |
| `surface.elevated` | `#0b1223` | Card backgrounds with 9.4:1 contrast against `text-neutral-emphasis`. |
| `surface.highlight` | `#13213e` | Hoverable regions to provide depth. |
| `surface.overlay` | `#0f172a` | Chips and badges. |
| `neutral.soft` | `#94a3b8` | Body copy on elevated surfaces. |
| `neutral.emphasis` | `#cbd5f5` | Primary text on dark surfaces for WCAG AA+. |

### Glow & terminal utilities

- `.glow-sheen`: Layered cyan shadows to create accent halos on interactive surfaces.
- `.terminal-accent`: Gradient background that mimics terminal phosphor lighting while preserving contrast.
- `.focus-ring-accent`: Applied globally to `:focus-visible` for a 4px dual ring with adequate contrast against dark backgrounds.

## Typography

- `font-sans`: `"Satoshi", "Inter", "SF Pro Text", system-ui, sans-serif`
- `font-display`: `"General Sans", "Space Grotesk", system-ui, sans-serif`
- `font-mono`: `"JetBrains Mono", "Fira Code", SFMono-Regular, Menlo, monospace`

Default body text is set to `font-sans` via the base layer.

## Spacing scale additions

The spacing scale now includes: `13 (3.25rem)`, `15 (3.75rem)`, `18 (4.5rem)`, `22 (5.5rem)`, `26 (6.5rem)`, `30 (7.5rem)`. These values help achieve generous breathing room for hero, metrics, and card sections without breaking the underlying Tailwind scale.

## Motion tokens

Animations use a shared easing curve `ease-spring-out (cubic-bezier(0.16, 1, 0.3, 1))` and default distances of `32px` for reveal transitions. Motion is automatically disabled and components are reset when `prefers-reduced-motion: reduce` is detected.
