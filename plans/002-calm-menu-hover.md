# 002 — Calm down menu hover: no bounce on 159 dishes, crisp thumbnail

- **Status**: DONE (2026-11-21)
- **Commit**: no git repository — written 2026-11-21 against `gorzki-melon/styles.css` and `gorzki-melon/app.js`
- **Severity**: HIGH
- **Category**: Purpose & frequency / Easing & duration
- **Estimated scope**: 2 files, ~4 lines

## Problem

Scanning the menu is a high-frequency interaction: the card lists 159 dishes and a guest hovers dozens of them per visit. Two motions fire on every single row:

1. Each row slides 4px right with an **overshooting (bouncy) curve** over 450ms:

```css
/* gorzki-melon/styles.css:290 — current */
.dish { break-inside: avoid; padding: 9px 0; transition: transform .45s var(--ease-bounce); }
/* gorzki-melon/styles.css:291 — current */
.dish:hover { transform: translateX(4px); }
```

(`--ease-bounce` is `cubic-bezier(.34, 1.56, .64, 1)`.)

2. The floating thumbnail pops in with an overshoot (`back.out(1.7)`) on every row enter and fades out with GSAP's default ease:

```js
// gorzki-melon/app.js:169 — current
G.to(box, { opacity: 1, scale: 1, rotate: G.utils.random(-6, 6), duration: .4, ease: "back.out(1.7)", overwrite: "auto" });
// gorzki-melon/app.js:172 — current
it.addEventListener("mouseleave", () => G.to(box, { opacity: 0, scale: .8, duration: .3, overwrite: "auto" }));
```

Note: `bindFollow` (app.js ~158–174) is shared by the menu (`.follow--menu`) and the "Trzy kuchnie" list (`.cuisines .follow`). The cuisines list has only 3 rows (low frequency) — changing the shared easing is still correct for both.

Frequent motion should be removed or drastically reduced; overshoot belongs to rare delight moments only.

## Target

```css
/* target — styles.css:290 */
.dish { break-inside: avoid; padding: 9px 0; }
/* target — styles.css:291: delete the .dish:hover rule entirely */
```

```js
// target — app.js:169
G.to(box, { opacity: 1, scale: 1, rotate: G.utils.random(-4, 4), duration: .2, ease: "power3.out", overwrite: "auto" });
// target — app.js:172
it.addEventListener("mouseleave", () => G.to(box, { opacity: 0, scale: .94, duration: .15, ease: "power2.out", overwrite: "auto" }));
```

And the initial scale at `app.js:163` changes from `.8` to `.94` (never animate from far below; 0.9–0.97 is the physical range):

```js
// target — app.js:163
G.set(box, { xPercent: -50, yPercent: -60, scale: .94, rotate: -4 });
```

## Repo conventions to follow

- GSAP eases are written as strings (`"power3.out"`, `"expo.out"`), e.g. `app.js:380` `G.from(el, { y: 50, opacity: 0, duration: .9, ease: "power3.out", … })`.

## Steps

1. `gorzki-melon/styles.css:290`: remove `transition: transform .45s var(--ease-bounce);` from `.dish`, leaving `.dish { break-inside: avoid; padding: 9px 0; }`.
2. `gorzki-melon/styles.css:291`: delete the whole line `.dish:hover { transform: translateX(4px); }`.
3. `gorzki-melon/app.js:163`: change `scale: .8` → `scale: .94`.
4. `gorzki-melon/app.js:169`: replace with the target line above.
5. `gorzki-melon/app.js:172`: replace with the target line above.

## Boundaries

- Do NOT remove the thumbnail feature or change which elements bind it.
- Do NOT touch `.cuisine` hover styles (handled by plan 005).
- If the lines differ from the excerpts, STOP and report.

## Verification

- **Mechanical**: `node --check gorzki-melon/app.js` → no output (OK). Page loads without console errors.
- **Feel check** (desktop): open the menu ("Rozwiń całą kartę"), sweep the mouse quickly down 20 dishes:
  - Rows no longer slide or wobble.
  - The thumbnail follows the pointer and swaps images without a "boing" overshoot; it settles in ~200ms.
  - DevTools Animations at 10%: the thumbnail scales from 0.94 → 1 with no value above 1.
- **Done when**: `grep -n "ease-bounce" gorzki-melon/styles.css` no longer matches `.dish`, and `grep -n "back.out(1.7)" gorzki-melon/app.js` returns nothing.
