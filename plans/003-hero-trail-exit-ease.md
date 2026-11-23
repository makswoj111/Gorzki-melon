# 003 — Hero photo trail: exit with ease-out instead of ease-in

- **Status**: DONE (2026-11-21)
- **Commit**: no git repository — written 2026-11-21 against `gorzki-melon/app.js`
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file, 1 line

## Problem

In the hero, photos appear behind the cursor and fade away after ~1s. The exit uses an **ease-in** curve (`power2.in`), which starts slowly and delays the moment the eye is tracking, so leftover photos linger and pile up while the user keeps moving the mouse:

```js
// gorzki-melon/app.js:318–319 — current (inside function dropShot)
G.timeline({ onComplete: () => el.remove() })
  .to(el, { scale: 1, opacity: 1, duration: .45, ease: "back.out(1.8)" })
  .to(el, { scale: .85, opacity: 0, y: y + 30, duration: .45, ease: "power2.in" }, 1);
```

The entrance (`back.out(1.8)`) is a deliberate delight moment in the hero (rare, first impression) — keep it.

## Target

```js
// target — gorzki-melon/app.js:319
  .to(el, { scale: .92, opacity: 0, y: y + 24, duration: .35, ease: "power2.out" }, 1);
```

## Repo conventions to follow

- GSAP eases are strings, e.g. `app.js:380` uses `ease: "power3.out"`.

## Steps

1. In `gorzki-melon/app.js`, find the line containing `ease: "power2.in" }, 1);` inside `dropShot` (≈ line 319).
2. Replace that whole line with the target line above.

## Boundaries

- Do NOT change the entrance tween (`back.out(1.8)`), the 90px trigger threshold, or the 700ms mobile scatter.
- Do NOT touch the loader's `power2.in` at ≈ line 426 (separate, decorative, out of scope).
- If the line differs, STOP and report.

## Verification

- **Mechanical**: `node --check gorzki-melon/app.js` → OK; no console errors on `http://localhost:4180`.
- **Feel check** (desktop): move the mouse continuously over the hero for 5 seconds:
  - Photos pop in as before, then leave promptly — no slow "hang then drop".
  - At most a handful of photos are visible at once; none linger noticeably.
  - DevTools Animations at 10%: the exit moves fastest at its start, slowest at its end.
- **Done when**: `grep -n 'power2.in" }, 1' gorzki-melon/app.js` returns nothing.
