# CLAUDE.md — estándar del proyecto

Reglas que valen en cada sesión. Léelas antes de tocar nada.

## Documentación

- Vive en `docs/`. Archivos canónicos: `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`.
- **No crear ningún archivo de documentación nuevo sin preguntar primero.**

## CHANGELOG

- `CHANGELOG.md` en la raíz, formato [Keep a Changelog](https://keepachangelog.com).
- Un solo archivo que crece por secciones, nunca uno por fase.
- Lo más nuevo va **arriba** (orden descendente).
- Cada sección: `## vX.Y — YYYY-MM-DD`, y adentro `### Added` / `### Changed` / `### Fixed` / `### Removed`.

## DECISIONS

- `docs/DECISIONS.md` es **append-only**, estilo ADR. No se borran entradas viejas.
- Cada entrada empieza con `## YYYY-MM-DD — <título>`.

## Fechas

- **Siempre** ISO 8601 (`YYYY-MM-DD`). Nunca formato local.

## Commits

- `<tipo>: <resumen imperativo corto>`, con `tipo` en `{add, chg, fix, rmv, doc}`:
  - `add` = nueva capacidad
  - `chg` = cambio de comportamiento
  - `fix` = corrección
  - `rmv` = se sacó algo
  - `doc` = solo documentación
- El **cuerpo** del commit no re-narra el cambio: máximo 1-2 líneas y una referencia a la sección del CHANGELOG.
- El detalle vive en CHANGELOG (qué) y DECISIONS (por qué), no en el mensaje del commit.

## Prosa

- Docs y comentarios en español, en mi voz, aplicando la skill `no-ai-slop-writing-rules:no-ai-slop`.
- Nada de relleno ni frases de IA.

## Honestidad de estado

- No declarar algo como "funciona / probado" sin una corrida real.
- Si no se verificó, decirlo explícitamente.

## Flujo de trabajo

- Trabajar **vía Pull Request**.
- Si `push` / `branch` / `PR` devuelve `403`, **parar y avisar** que falta permiso de escritura. No armar una subida manual de archivos sueltos.
