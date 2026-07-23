# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.

## v11.6 — 2026-07-04

Se saltea la v11.5: ese número es el de la versión que se perdió (ver `docs/ARCHITECTURE.md` §0 y `docs/DECISIONS.md`). No se reusa, para no confundir la reconstrucción con la narrativa perdida.

### Changed

- `src/engine.js`, `MathEngine.detectChord`: prueba el pitch class del bajo real (`bassPC`) como raíz candidata antes del orden ascendente. La-Do-Mi-Sol con bajo en La se lee La m7; con bajo en Do, Do6. Cuando el bajo no arma un template, cae al orden ascendente (inversión real). Fase 1 del roadmap; ver `DECISIONS.md` (2026-07-04).
- `CLAUDE.md` (doc): orden de lectura al inicio (`ARCHITECTURE` → `DECISIONS` → `ROADMAP` antes de tocar código, con `DECISIONS` obligatorio en el orden) y excepción por categoría para los `README.md` de subcarpeta, que documentan su propia carpeta y quedan fuera de la regla de los tres docs canónicos.

### Added

- Fixture `tests/fixtures/raiz-ambigua.json`: el mismo conjunto de notas (pitch classes 0, 4, 7, 9) leído según el bajo, más un caso de inversión real que cae al orden ascendente. Las 15 fixtures previas siguen en verde; el runner corre 18 casos.

### Fixed

- `index.html`: el `<title>` y el `<h1>` mostraban `V11.0` con el CHANGELOG en v11.6. Bumpeados a `V11.6` (regla "Versión mostrada" de `CLAUDE.md`). El bump quedó pendiente del PR de código de la Fase 1; este lo cierra. Por tocar `index.html`, el commit es `fix`, no doc-only.
- Documentación sincronizada con el código de la v11.6: `ARCHITECTURE.md` §4 describe el `detectChord` vigente (bajo como raíz, ambigüedad enarmónica como límite, no bug), §6 saca dos gaps ya cerrados (control de versiones y PII), §7 corrige el conteo de `src/engine.js` a 145 líneas; `ROADMAP.md` marca la Fase 1 como cerrada.

## v11.4 — 2026-07-04

### Changed

- `ARCHITECTURE.md` sincronizado con el estado real tras la extracción del motor: §2 suma la columna "Vive en" (`MathEngine` y las reglas puras en `src/engine.js`, el resto en `index.html`); §7 reemplaza "604 líneas" por los dos archivos reales (`index.html` 573 líneas, `src/engine.js` 139); §6 saca el conteo stale de 604.
- `ROADMAP.md`: la Fase 0 queda marcada como cerrada (2026-07-04) y el criterio de éxito refleja que `tests/run.js` corre las fixtures (15 en verde), en vez de "todavía no haya runner".

## v11.3.1 — 2026-07-04

### Fixed

- `CLAUDE.md`, sección "Guion largo": el carácter y los ejemplos de encabezado van en backticks, así son tokens y no prosa. Antes la regla usaba guion largo suelto, lo mismo que prohíbe.
- `CLAUDE.md`, sección "Prosa": la instrucción de instalar el plugin trae los comandos exactos (`/plugin marketplace add realrossmanngroup/no_ai_slop_writing_rules` y `/plugin install no-ai-slop-writing-rules`) y la URL, en vez de un `/plugin` genérico.

## v11.3 — 2026-07-04

### Removed

- Skills vendoreadas `no-ai-slop` y `rossmann-voice` de `.claude/skills/`. El upstream (`realrossmanngroup/no_ai_slop_writing_rules`) no declara licencia y este repo es público; no se redistribuye código de terceros sin su nota de licencia. Quedan como dependencia externa: se instalan con el plugin `no-ai-slop-writing-rules`.

### Added

- Tres reglas en `CLAUDE.md`: "Guion largo" (la única excepción al guion largo es el token de formato de los encabezados de fecha), "Vendoreo de dependencias de terceros" y "Scope de escritura".

### Changed

- `CLAUDE.md`, sección Prosa: la referencia nombra los dos skills (`no-ai-slop-writing-rules:no-ai-slop` y `no-ai-slop-writing-rules:rossmann-voice`) y aclara que no resuelven hasta instalar el plugin, ya que se sacaron del repo.

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
