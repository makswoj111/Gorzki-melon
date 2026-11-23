# Animation plans — Gorzki Melon

Written by the `improve-animations` skill on 2026-11-21. The project has no git repository, so plans reference current line numbers in `styles.css` / `app.js`; if those drift, the executor must stop and report.

| # | Plan | Severity | Status |
|---|---|---|---|
| 001 | [Cursor: animate with `scale`, not width/height/margin](001-cursor-transform-scale.md) | HIGH | DONE |
| 002 | [Calm menu hover: no bounce on dishes, crisp thumbnail](002-calm-menu-hover.md) | HIGH | DONE |
| 003 | [Hero photo trail: exit with ease-out](003-hero-trail-exit-ease.md) | MEDIUM | DONE |
| 004 | [Reduced motion: keep colour/opacity feedback](004-reduced-motion-keep-feedback.md) | MEDIUM | DONE |
| 005 | [Gate hover motion to real pointers](005-gate-hover-motion.md) | MEDIUM | DONE |

## Recommended order

1. **001** first — it adds the shared `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` token to `:root`.
2. **002** — independent of 001 in code, but run before 005 (005 assumes `.dish:hover` is already gone).
3. **003** — independent.
4. **004** — independent.
5. **005** — after 002.

## Dependencies

- 005 → after 002 (shared `.dish:hover` rule).
- No plan adds dependencies or changes HTML.

## Not planned (from the audit, lower leverage)

- Menu expand animates `height` for 800ms on a ~5700px block (shorten to 500ms, `cubic-bezier(0.32, 0.72, 0, 1)`).
- Hand-typed cubic-beziers in several places → consolidate into tokens.
- `.btn` press scale has no transform transition (add `transform 160ms var(--ease-out)`).
- Missed opportunities: booking success message appears without transition; menu content swap on filter change has no crossfade.
