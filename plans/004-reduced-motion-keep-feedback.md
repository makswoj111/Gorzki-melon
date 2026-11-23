# 004 — Reduced motion: drop movement, keep colour/opacity feedback

- **Status**: DONE (2026-11-21)
- **Commit**: no git repository — written 2026-11-21 against `gorzki-melon/styles.css`
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, ~6 lines

## Problem

For visitors with `prefers-reduced-motion: reduce`, a global rule kills **every** animation and transition, including colour and opacity changes that only give feedback (button hover fills, tab underline, FAQ icon, cursor label, review fade). Reduced motion should mean fewer and gentler animations, not zero feedback.

```css
/* gorzki-melon/styles.css:475–482 — current */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
  .hero__trail, .follow { display: none; }
  .rv-marquee { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
  .rv-track .rv[aria-hidden] { display: none; }
  .loader { display: none; }
  .fade { transition: opacity .6s ease !important; transform: none; }
}
```

The JS already skips GSAP motion when reduced (`app.js:10` `const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;`), so CSS only needs to neutralise CSS‑driven movement.

## Target

```css
/* target — gorzki-melon/styles.css, replacing lines 475–482 */
@media (prefers-reduced-motion: reduce) {
  /* stop looping/decorative keyframes (marquees, ember glow, reviews strip) */
  *, *::before, *::after { animation: none !important; }
  /* keep short colour/opacity feedback, remove movement */
  *, *::before, *::after { transition-property: color, background-color, border-color, opacity, fill, box-shadow !important; transition-duration: 200ms !important; transition-timing-function: ease !important; }
  .hero__trail, .follow { display: none; }
  .rv-marquee { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
  .rv-track .rv[aria-hidden] { display: none; }
  .loader { display: none; }
  .fade { transition: opacity .6s ease !important; transform: none; }
}
```

Effect: transitions on `transform`, `height`, `scale`, `translate`, `rotate` are no longer animated (they jump instantly), while colour/opacity changes still fade over 200ms.

## Repo conventions to follow

- The reduced-motion block lives near the end of the "Responsywność" part of `styles.css`; keep it in the same place.
- There is a second, separate rule at ≈ line 551: `@media (prefers-reduced-motion: reduce) { .tagline__text .tw { color: var(--blue); } }` — leave it unchanged.

## Steps

1. In `gorzki-melon/styles.css`, locate the block starting `@media (prefers-reduced-motion: reduce) {` whose first inner line is `*, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }` (≈ line 475).
2. Replace the entire block (through its closing `}`) with the target block above.

## Boundaries

- Do NOT change `app.js`.
- Do NOT modify the tagline reduced-motion rule (≈ line 551).
- If the block differs, STOP and report.

## Verification

- **Mechanical**: page loads with no console errors.
- **Feel check**: DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload:
  - No marquee movement, no preloader, no hero photo trail, no sliding/scaling on hover.
  - Hovering a button still shows its colour change as a short fade (not an instant flip).
  - Menu tabs, FAQ answers and "Rozwiń całą kartę" still work (instantly).
  - Turn emulation off and confirm normal motion is unchanged.
- **Done when**: the string `transition-duration: .01ms` no longer appears in `styles.css`.
