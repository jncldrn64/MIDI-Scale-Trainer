# CLAUDE.md: estándar del proyecto

Reglas que valen en cada sesión. Se leen antes de tocar nada.

## Orden de lectura

Este repo no tiene `AGENTS.md`. Antes de tocar código se leen tres archivos de `docs/`, en
este orden:

1. `ARCHITECTURE.md`: el estado real del sistema, qué módulo vive en qué archivo y qué gaps
   quedan.
2. `DECISIONS.md`: las restricciones vigentes. No es opcional y va en este orden.
   Restricciones como "no migrar a framework" y "reconstruir desde v11.0, no desde v11.5"
   viven solo acá; un agente que las saltee puede proponer justo lo que ya está descartado.
3. `ROADMAP.md`: la fase actual y qué sigue.

Recién después se toca código.

## Documentación

La documentación canónica vive en `docs/` y son tres archivos: `ARCHITECTURE.md`,
`ROADMAP.md` y `DECISIONS.md`. No se crea ningún archivo de documentación nuevo sin
preguntar primero.

Excepción por categoría: un `README.md` de subcarpeta documenta su propia carpeta y no
cuenta como doc canónico. `tests/README.md` explica cómo correr las fixtures; un futuro
`src/README.md` explicaría el motor. Mientras se queden en describir su carpeta, no piden
permiso aparte.

## CHANGELOG

`CHANGELOG.md` está en la raíz, en formato [Keep a Changelog](https://keepachangelog.com).
Es un solo archivo que crece por secciones, nunca uno por fase. Lo más nuevo va arriba, en
orden descendente. Cada sección abre con `## vX.Y — YYYY-MM-DD` y adentro lleva
`### Added`, `### Changed`, `### Fixed` o `### Removed`.

Un PR doc-only abre su propia sección fechada. No se pliega dentro de la sección de una
versión ya publicada: esa sección es historia y no se reescribe. La sección nueva lleva la
fecha real del cambio en ISO 8601, nunca la de una versión anterior. Un PR doc-only puede
dejar la última versión del CHANGELOG por delante de la versión que muestra el artefacto;
ese desfase es intencional y lo cierra el próximo PR de código (ver "Versión mostrada").

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
CHANGELOG v11.3). Esas referencias no resuelven hasta instalar el plugin: se instala por
sesión con `/plugin marketplace add realrossmanngroup/no_ai_slop_writing_rules` y después
`/plugin install no-ai-slop-writing-rules`
(https://github.com/realrossmanngroup/no_ai_slop_writing_rules). Sin relleno, sin frases de
IA, sin guion largo en la prosa. Cada afirmación cierra sobre un dato concreto: un número,
una línea de código, una fecha, un pitch class.

## Guion largo

Guion largo (`—`): prohibido en toda la prosa (regla 1 de no-ai-slop). Se permite únicamente
como token de formato en los encabezados de fecha de CHANGELOG (`## vX.Y — YYYY-MM-DD`) y
DECISIONS (`## YYYY-MM-DD — <título>`). La historia no se normaliza: los encabezados ya
escritos quedan como están.

La regla se adoptó en la v11.3 (ver CHANGELOG). La prosa escrita antes de esa versión queda
como está, igual que los encabezados, aunque use guion largo en oración corrida o entre
paréntesis. En `docs/DECISIONS.md` eso además es obligatorio: el archivo es append-only, así
que las entradas viejas (las del 2026-07-03 y la sección Histórico, con guion largo en
prosa) no se editan ni para sacarlo. Es deuda tolerada, no algo a arreglar; tocarla
violaría append-only.

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

Este repo no describe otros repos. El nombre de otro repo puede aparecer como procedencia
histórica, de dónde salió una convención, nunca como información operativa. Ningún documento
de este repo depende de otro para entenderse ni para trabajar acá.

## Versión mostrada

La versión que muestra la app (el `<title>` y el `<h1>` de `index.html`) es fuente única
con el CHANGELOG: siempre es la última versión del CHANGELOG. Se bumpea en el mismo PR que
trae el cambio de código que la amerita, nunca en un PR doc-only.
