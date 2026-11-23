# 001 — Animate the custom cursor with `scale`, not width/height/margin

- **Status**: DONE (2026-11-21)
- **Commit**: no git repository — written 2026-11-21 against `gorzki-melon/styles.css` (≈550 lines) and `gorzki-melon/app.js` (≈460 lines)
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file (`styles.css`), 4 lines

## Problem

The custom cursor grows from a 10px dot into a 96px labelled circle whenever the pointer enters any `[data-cursor]` element (every photo, every CTA, every dish thumbnail area). It does this by transitioning **layout properties** — `width`, `height` and `margin` — which forces layout + paint on every frame, many times per visit.

```css
/* gorzki-melon/styles.css:79 — current */
.cursor { position: fixed; top: 0; left: 0; z-index: 300; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: var(--blue); pointer-events: none; display: grid; place-items: center; transition: width .35s var(--ease-sauce), height .35s var(--ease-sauce), margin .35s var(--ease-sauce), background .3s; }
/* gorzki-melon/styles.css:81 — current */
.cursor.is-label { width: 96px; height: 96px; margin: -48px 0 0 -48px; }
```

Position is driven by GSAP (`app.js:183`: `G.quickTo(cur, "x" …)` / `"y"`), which writes the element's `transform`. So the size change must NOT use `transform` (GSAP would overwrite it). Use the independent CSS `scale` property, which composes with `transform` and is GPU-composited.

## Target

```css
/* target — gorzki-melon/styles.css:79 */
.cursor { position: fixed; top: 0; left: 0; z-index: 300; width: 96px; height: 96px; margin: -48px 0 0 -48px; border-radius: 50%; background: var(--blue); pointer-events: none; display: grid; place-items: center; scale: .104; transition: scale 250ms var(--ease-out), background 200ms ease; will-change: transform, scale; }
/* target — gorzki-melon/styles.css:81 */
.cursor.is-label { scale: 1; }
```

`.104` ≈ 10px / 96px, so the resting dot keeps its current 10px size.

## Repo conventions to follow

- Design tokens live in `:root` at the top of `gorzki-melon/styles.css` (around lines 7–36), e.g. `--ease-sauce: cubic-bezier(.22, 1, .36, 1);`.
- Add the strong ease-out token there if it does not exist yet (plans 002 and 003 use it too):
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`

## Steps

1. In `gorzki-melon/styles.css`, inside `:root`, directly below the line `--ease-bounce: cubic-bezier(.34, 1.56, .64, 1);`, add `  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);` (skip if already present).
2. Replace the `.cursor { … }` rule at line 79 with the target rule above (exactly).
3. Replace the `.cursor.is-label { … }` rule at line 81 with `.cursor.is-label { scale: 1; }`.
4. Leave `.cursor__label` (line 80), `.cursor.is-label .cursor__label` (line 82) and `.cursor.is-cta` (line 83) unchanged.

## Boundaries

- Do NOT touch `app.js` — the GSAP `quickTo` position code stays as is.
- Do NOT change any other selector or the HTML.
- Do NOT add dependencies.
- If line 79/81 no longer match the excerpts above, STOP and report instead of improvising.

## Verification

- **Mechanical**: `node --check app.js` still passes (JS untouched); load `http://localhost:4180` — no console errors.
- **Feel check** (desktop, mouse):
  - The resting cursor is still a ~10px blue dot that follows the mouse.
  - Hovering a photo grows it into the 96px circle with the label ("SMACZNEGO"), smoothly, without the label text jumping or reflowing.
  - DevTools → Performance: record while moving across several photos; there are no "Layout" entries caused by the cursor.
  - DevTools → Animations at 10% speed: the circle grows from its center (not from the top‑left corner).
- **Done when**: the cursor no longer transitions `width`, `height` or `margin` anywhere in `styles.css`.
