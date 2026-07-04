# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.

## v11.2 — 2026-07-04

### Added

- Skills de escritura `no-ai-slop` y `rossmann-voice` en `.claude/skills/`. La referencia del `CLAUDE.md` a `no-ai-slop-writing-rules:no-ai-slop` ahora resuelve en el repo.

### Changed

- `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md`, `CHANGELOG.md`, `tests/README.md` y los comentarios de `src/engine.js` y `tests/run.js` reescritos en la voz Rossmann: sin guion largo en la prosa, sin frases de IA, cada afirmación cerrada sobre un dato concreto. Los hechos técnicos no cambiaron. La historia de `DECISIONS.md` se dejó textual (append-only).

## v11.1 — 2026-07-04

### Added

- `CLAUDE.md`: estándar del proyecto (documentación, CHANGELOG, DECISIONS, fechas ISO, convención de commits, honestidad de estado, flujo por PR).
- `CHANGELOG.md`: este registro.
- `.gitignore` mínimo. No hay build step todavía.
- Fixtures de regresión en `tests/fixtures/` (Bad Apple, Oda a la Alegría, Blues) y runner `tests/run.js` (Node más `assert`, sin framework). Cierran el criterio de la Fase 0: 15 casos, corridos en verde contra el motor real.

### Changed

- Motor de teoría musical extraído a `src/engine.js` como fuente única de verdad. `index.html` lo carga por `<script src>` en vez de reimplementar la lógica inline. El comportamiento no cambió. Ratificado en `DECISIONS.md` (2026-07-04).
