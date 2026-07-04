# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.

## v11.1 — 2026-07-04

### Added

- `CLAUDE.md`: estándar del proyecto (documentación, CHANGELOG, DECISIONS, fechas ISO, convención de commits, honestidad de estado, flujo por PR).
- `CHANGELOG.md`: este registro.
- `.gitignore` mínimo (todavía no hay build step).
- Fixtures de regresión en `tests/fixtures/` (Bad Apple, Oda a la Alegría, Blues) y runner `tests/run.js` (Node + `assert`, sin framework). Cierran el criterio de Fase 0 del roadmap: 15 casos, verificados en verde contra el motor real.

### Changed

- Motor de teoría musical extraído a `src/engine.js` como fuente única de verdad; `index.html` lo carga por `<script src>` en vez de reimplementar la lógica inline. Comportamiento preservado. Ratificado en `DECISIONS.md` (2026-07-04).
