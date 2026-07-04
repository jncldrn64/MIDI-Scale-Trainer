# CLAUDE.md: estándar del proyecto

Reglas que valen en cada sesión. Se leen antes de tocar nada.

## Documentación

La documentación vive en `docs/`. Los archivos canónicos son tres: `ARCHITECTURE.md`,
`ROADMAP.md` y `DECISIONS.md`. No se crea ningún archivo de documentación nuevo sin
preguntar primero.

## CHANGELOG

`CHANGELOG.md` está en la raíz, en formato [Keep a Changelog](https://keepachangelog.com).
Es un solo archivo que crece por secciones, nunca uno por fase. Lo más nuevo va arriba, en
orden descendente. Cada sección abre con `## vX.Y — YYYY-MM-DD` y adentro lleva
`### Added`, `### Changed`, `### Fixed` o `### Removed`.

## DECISIONS

`docs/DECISIONS.md` es append-only, estilo ADR. No se borra una entrada vieja aunque quede
obsoleta; se agrega una nueva que la reemplaza y la referencia. Cada entrada abre con
`## YYYY-MM-DD — <título>`. La v11.5 se perdió por no tener este registro; por eso la
historia acá no se reescribe.

## Fechas

Siempre ISO 8601 (`YYYY-MM-DD`). Nunca formato local.

## Commits

El mensaje es `<tipo>: <resumen imperativo corto>`, con `tipo` en `{add, chg, fix, rmv,
doc}`:

- `add`: nueva capacidad.
- `chg`: cambio de comportamiento.
- `fix`: corrección.
- `rmv`: se sacó algo.
- `doc`: solo documentación.

El cuerpo del commit no vuelve a narrar el cambio: máximo 1 o 2 líneas y una referencia a
la sección del CHANGELOG. El qué vive en el CHANGELOG, el porqué en DECISIONS, no en el
mensaje del commit.

## Prosa

Docs y comentarios en español, en mi voz, aplicando dos skills:
`no-ai-slop-writing-rules:no-ai-slop` y `no-ai-slop-writing-rules:rossmann-voice`. Las dos
salen del plugin `no-ai-slop-writing-rules` (realrossmanngroup). No están vendoreadas en el
repo: se sacaron por no traer licencia (ver "Vendoreo de dependencias de terceros" y
CHANGELOG v11.3). Esas referencias no resuelven hasta instalar el plugin con `/plugin`. Sin
relleno, sin frases de IA, sin guion largo en la prosa. Cada afirmación cierra sobre un
dato concreto: un número, una línea de código, una fecha, un pitch class.

## Guion largo

Guion largo (—): prohibido en toda la prosa (regla 1 de no-ai-slop). Se permite únicamente
como token de formato en los encabezados de fecha de CHANGELOG (## vX.Y — YYYY-MM-DD) y
DECISIONS (## YYYY-MM-DD — <título>). La historia no se normaliza: los encabezados ya
escritos quedan como están.

## Honestidad de estado

Nada se declara "funciona" o "probado" sin una corrida real. Si no se verificó, se dice
con esas palabras.

## Flujo de trabajo

Se trabaja vía Pull Request. Si `push`, `branch` o `PR` devuelve `403`, se para y se avisa
que falta permiso de escritura. No se arma una subida manual de archivos sueltos.

## Vendoreo de dependencias de terceros

Cuando se copia una skill, plantilla o cualquier código de terceros a este repo, se
copia también su LICENSE y su atribución, en la misma carpeta. Este repo es público:
no se redistribuye nada sin su nota de licencia. Si la fuente no la trae, se para y se
avisa antes de commitear.

## Scope de escritura

Este repo (MIDI-Scale-Trainer) es el único destino de escritura. Cualquier otro
repositorio clonado en la sesión es solo lectura y contexto: se copia DESDE él, nunca
se escribe EN él. No se traen a este repo convenciones de otro (idioma, DECISIONS vs
Known gaps, formato). Ante duda de en qué repo estás escribiendo, se para y se pregunta.
