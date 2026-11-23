# 005 — Gate hover motion to real pointers (no sticky hovers on touch)

- **Status**: DONE (2026-11-21)
- **Commit**: no git repository — written 2026-11-21 against `gorzki-melon/styles.css`
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, ~8 lines

## Problem

Touch screens fire `:hover` on tap and keep it "stuck" until the next tap elsewhere. These hover rules move elements, so on phones the flag stays lifted, the country name stays shifted/recoloured and the MENU stamp stays rotated after a tap:

```css
/* gorzki-melon/styles.css:117 — current */
.stamp:hover, .stamp:focus-visible { transform: rotate(-9deg) scale(1.04); }
/* gorzki-melon/styles.css:118 — current */
.stamp:hover .stamp__fill, .stamp:focus-visible .stamp__fill { fill: var(--blue); }
/* gorzki-melon/styles.css:119 — current */
.stamp:hover .stamp__core, .stamp:focus-visible .stamp__core { color: var(--paper); }
/* gorzki-melon/styles.css:219 — current */
.cuisine:hover .flag { transform: translateY(-6px); box-shadow: 0 30px 50px -26px rgba(15, 37, 82, .55); }
/* gorzki-melon/styles.css:223 — current */
.cuisine:hover .cuisine__name { transform: translateX(12px); color: var(--blue-2); }
```

(The `.dish:hover` rule is removed by plan 002; if plan 002 has not run yet, leave `.dish:hover` alone here.)

## Target

Keep keyboard focus states un-gated (they are not affected by touch), gate only `:hover`:

```css
/* target — replaces lines 117–119 */
.stamp:focus-visible { transform: rotate(-9deg) scale(1.04); }
.stamp:focus-visible .stamp__fill { fill: var(--blue); }
.stamp:focus-visible .stamp__core { color: var(--paper); }
@media (hover: hover) and (pointer: fine) {
  .stamp:hover { transform: rotate(-9deg) scale(1.04); }
  .stamp:hover .stamp__fill { fill: var(--blue); }
  .stamp:hover .stamp__core { color: var(--paper); }
}

/* target — replaces line 219 */
@media (hover: hover) and (pointer: fine) {
  .cuisine:hover .flag { transform: translateY(-6px); box-shadow: 0 30px 50px -26px rgba(15, 37, 82, .55); }
}

/* target — replaces line 223 */
@media (hover: hover) and (pointer: fine) {
  .cuisine:hover .cuisine__name { transform: translateX(12px); color: var(--blue-2); }
}
```

## Repo conventions to follow

- The file already uses this exact media query for the cursor: `@media (hover: hover) and (pointer: fine) { body.has-cursor, … { cursor: none; } }` (≈ line 86). Reuse the same query string verbatim.

## Steps

1. `gorzki-melon/styles.css` lines 117–119: replace the three `.stamp:hover, .stamp:focus-visible …` lines with the stamp block from the target.
2. Line 219: wrap the `.cuisine:hover .flag` rule in the media query as shown.
3. Line 223: wrap the `.cuisine:hover .cuisine__name` rule in the media query as shown.

## Boundaries

- Do NOT gate `.btn:hover::before` (colour fill, no layout shift; acceptable on touch) or `.chip:hover`/`.menu__tab:hover` (colour only).
- Do NOT change transition declarations on `.stamp`, `.flag`, `.cuisine__name`.
- If lines differ, STOP and report.

## Verification

- **Mechanical**: page loads with no console errors.
- **Feel check**:
  - Desktop with a mouse: hovering the MENU stamp, a flag row and a country name behaves exactly as before.
  - Keyboard: Tab to the MENU stamp — it still rotates and fills (focus-visible).
  - DevTools device toolbar → a touch device (e.g. iPhone), reload, tap a country row: the flag does not stay lifted and the name does not stay shifted after the tap.
- **Done when**: every `:hover` rule that changes `transform` in `styles.css` sits inside `@media (hover: hover) and (pointer: fine)` (check with `grep -n ":hover" gorzki-melon/styles.css`).
