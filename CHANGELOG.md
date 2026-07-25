# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.

## v11.29 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 aclara que el gestor de paneles se parte. El ADR reservaba el gestor completo para la segunda característica; se precisa que mover y persistir la posición de un overlay es de esta fase, sobre los overlays del fondo único, y que lo que espera a la Fase 9 es la competencia por las tres ranuras. Además resuelve el "dónde vive la salida del motor" del incremento 5.1: las tres lecturas, notas activas, acorde y análisis, se consolidan en una sola superficie permanente sobre el fondo, sin ranura ni conmutador, y colorean teclas o escriben feedback como consumidores del buffer, no por ser widget.

### Added

- `docs/ROADMAP.md`: la Fase 9 suma una nota de pregunta abierta, el contrato de salida de una característica, qué puede escribir hacia afuera y si el reporte va en abanico o en cadena, que se decide con la primera característica real y no antes.

## v11.28 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 suma una subsección de incrementos de entrega que corta la fase en cuatro PRs de código ordenados del más estructural al más cosmético: 5.1 fondo único, 5.2 panel de pestañas, 5.3 nomenclatura por forma, 5.4 análisis honesto (función tonal en pantalla más el relabel de "Intercambio Modal", juntos para no dejar un estado contradictorio). No cambia el Objetivo, el Alcance ni la Terminología; solo agrega el orden de entrega. La fase sigue en `pendiente` y pasa a `en progreso` con el 5.1. La versión mostrada sigue en V11.27; el desfase lo cierra el próximo PR de código, el incremento 5.1.

### Added

- `docs/ROADMAP.md`: sección "Direcciones sin fase" que captura tres ideas de dirección para que no se pierdan, sin volverlas fase: entrenamientos como datos y un posible taller, la guía reactiva a lo que está abierto, y el entrenamiento que propone layout. Cada una con su bloqueo anotado.

## v11.27 — 2026-07-25

### Added

- `src/engine.js`: `getTonalFunction(chordObj, universeRoot, universeType)`, función pura que deriva la función tonal por índice de grado (Tónica I/iii/vi, Subdominante ii/IV, Dominante V/vii°), así que V es dominante en cualquier tonalidad mayor. Nada de nombres de nota ni de tono en la lógica. La menor devuelve `por_definir` (la teoría escrita cubre solo la agrupación mayor) y un acorde no diatónico devuelve `no_diatonica`, sin función forzada.
- `tests/fixtures/grados-romanos.json`: casos `function` para cada grado diatónico mayor, una segunda tonalidad (el mismo Sol Mayor es I en Sol y V en Do), un acorde no diatónico y un caso menor. `tests/run.js` suma el tipo `function` y afirma `expected.function` en los casos de acorde. El conteo sube de 30 a 41.
- `tests/fixtures/oda-a-la-alegria.json`: función esperada en los casos de acorde (Sol = dominante, Re7 = no_diatonica).

### Changed

- `index.html`: la función tonal se calcula en el análisis del acorde, se guarda en el buffer (`State.harmony.function`) y se suma a la línea de log MATH ("· función <valor>"). Sin display: no cambia ningún panel; la función queda en el buffer para que la Fase 5 la muestre después. Versión mostrada de V11.24 a V11.27, cerrando el desfase acumulado.
- `docs/ROADMAP.md`: se cierran dos fases con la regla de que el PR de código que completa una fase la cierra. La Fase 4 pasa a `cerrada (2026-07-25)` con nota de cierre (función calculada, bufferada y logueada; display parqueado en la Fase 5). La Fase 3, hecha y validada en su PR pero con el Estado todavía en `pendiente` porque ese PR no tocó el ROADMAP, pasa también a `cerrada (2026-07-25)`.

## v11.26 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 suma terminología de pantalla a su Alcance, correcciones de display, no de motor. Las etiquetas del botón de nomenclatura pasan de "Latina" y "Anglosajona" a "Silábica" (Do-Re-Mi) y "Alfabética" (C-D-E), con valor por defecto, persistencia por `localStorage` y el botón alcanzable en los menús nuevos. La etiqueta "Intercambio Modal", que hoy sale del caso else de `classifyChordRelation` y afirma un análisis que el motor no hizo, se relabela a "no clasificado" o "por definir" hasta que la Fase 11 escriba la teoría. Y la función tonal de la Fase 4 se muestra en el panel de Análisis junto al numeral y la relación, coherente con el relabel honesto. Además el criterio deja de decir "los 18 fixtures" y pasa a "todos los fixtures existentes", que no se pone rancio cuando el conteo sube.

## v11.25 — 2026-07-25

### Added

- `docs/ROADMAP.md`: Fase 11, intercambio modal, después de la Fase 10 y antes del Track paralelo de teoría. Es salida del motor (otra lente, sin panel), el tercer caso después del diatónico (función tonal, Fase 4) y de la dominante secundaria (relación, Fase 3): un acorde que no es ninguno de los dos. Criterio por definir: primero hay que escribir la teoría del intercambio modal en el Track paralelo, sin eso no hay fixture. Bloqueada por las Fases 3 y 4 y por esa teoría, no por la rueda; su número es prioridad, no dependencia. La versión mostrada sigue en V11.24; el desfase lo cierra el próximo PR de código, la Fase 4.

## v11.24 — 2026-07-25

### Added

- `src/engine.js`: `getRomanNumeral(chordObj, universeRoot, universeType)`, función pura que deriva el numeral romano del acorde. El grado sale de ubicar la raíz en la escala activa, la caja de la tercera del acorde, el sufijo de la quinta y el séptimo. Nada hardcodeado, ni notas ni tabla de grados. El objetivo de una dominante secundaria se calcula como cualquier grado y va en mayúscula, sin forzar minúscula.
- `src/engine.js`: `isSecondaryDominantLeadingTone`, que reconoce el tono conductor de una dominante secundaria hacia un grado de tríada mayor, derivado y por tonalidad.
- `tests/fixtures/grados-romanos.json`: casos de numeral en dos tonalidades (I, IV, V mayúscula; ii, iii, vi minúscula; vii disminuido; II7) y del tono conductor generalizado a Sol Mayor, con un contraste que prueba que no se acepta cualquier cromática. `tests/run.js` suma el tipo `roman` y las aserciones de numeral; el conteo sube de 18 a 30 casos.

### Changed

- `src/engine.js`: `evaluateMelodyStatus` acepta como `good` el tono conductor de una dominante secundaria aunque el acorde no suene. Cierra el gap de Oda (Fa# sobre Do Mayor deja de marcar error), sin tocar Re menor (Sol# sigue `bad`, Do# sigue `tension`).
- `index.html`: el panel Análisis de Armonía muestra el numeral, y para la dominante secundaria "II7 (V del V)". `classifyChordRelation` y el veredicto nota por nota ahora emiten al log con `SysLog` (MATH el numeral, la relación y el objetivo; EVAL el veredicto con su porqué), cerrando el hueco que la decisión del log del 2026-07-25 dejó anotado. Versión mostrada de V11.19 a V11.24, cerrando el desfase con el CHANGELOG.

## v11.23 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: tres cambios apoyados en las entradas de `DECISIONS.md` del 2026-07-25. El encabezado suma una convención de log: el criterio de aceptación de toda fase incluye que el motor emita al log, etiquetado, lo que esa fase agrega. La Fase 3 suma un punto de Alcance (que `classifyChordRelation` registre su resultado, cerrando el hueco anotado) y la validación de tres vías en el Criterio. La Fase 5 se reabre: pasa de `cerrada (2026-07-25)` a `pendiente` y se reescribe hacia el modelo de capas del 2026-07-25 (fondo único de teclado y notas, características como widgets, panel de pestañas como chrome permanente, teclado fijo de 88 teclas); la nota de cierre pasa a nota de reapertura. El primer intento apilado quedó en V11.19 y no se borra hasta que la fase corra. La versión mostrada sigue en V11.19; el desfase lo cierra el próximo PR de código, la Fase 3.

## v11.22 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que fija el log como canal canónico de validación. Toda salida del motor emite al log etiquetada cada vez que se calcula, se muestre o no en pantalla, cerrando la asimetría actual (`detectChord` loguea con MATH, `classifyChordRelation` no). Una fase se valida por tres vías a la vez: fixtures verdes, sesión humana en Chrome y el log auditable; cada fase registra lo que agrega (el grado romano de la Fase 3, la función tonal de la Fase 4). Refina el trato que el protocolo del 2026-07-25 le da a la consola de debug y extiende la refinación del contrato del mismo día. Cerrar el hueco de `classifyChordRelation` es código y va con la Fase 3.

## v11.21 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que refina el modelo de UI con cuatro reglas. Fondo único: el teclado más las notas que caen son una sola capa que ocupa todo el ancho y alto, y las notas pasan por detrás de los widgets. Widget: la palabra para lo que el protocolo del 2026-07-25 llamó "característica", un panel en ranura que se mueve, se oculta y se comunica por las superficies compartidas. Panel de pestañas: cuarta categoría, el chrome interactivo permanente donde viven opciones y logs, separado del fondo mudo. Teclado fijo de 88 teclas independiente del controlador MIDI. Refina reglas del ADR del 2026-07-24 y del protocolo, el glosario y la refinación del contrato del 2026-07-25, sin contradecirlos. Deja anotado que la Fase 5, cerrada apilada, queda desalineada con el modelo de capas y habrá que reabrirla desde el ROADMAP.

## v11.20 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 (reencuadre visual al modelo de paneles) pasa de `pendiente` a `cerrada (2026-07-25)`, ya implementada y mergeada en V11.19 con los 18 fixtures en verde y el motor intacto. Se le suma una nota de cierre que deja registrado que la disposición quedó apilada a propósito, no superpuesta: el overlay real de características flotando sobre el fondo llega en la Fase 10, cuando la escala se vuelve un panel con contenido. El apilado es decisión, no deuda olvidada.

## v11.19 — 2026-07-25

### Changed

- `index.html`: reencuadre visual de la Fase 5, sin tocar comportamiento ni motor. El teclado pasa a ser el fondo fijo protagonista, con una zona reservada y vacía arriba para las futuras notas que caen. El resto de la UI pasa a overlay: la barra de universo, los tres paneles de estado (salida del motor, siguen visibles porque el autor los mira mientras toca) y los Ajustes del Motor, ahora rotulados como avanzados pero visibles y alcanzables. Se dibujan tres ranuras de característica reservadas y vacías (Escala, Progresiones, Rueda de quintas), sin gestor de paneles ni mecánica de slots. La consola de logs queda colapsada detrás de un botón; al abrirla suma copiar al portapapeles a la descarga `.txt` que ya existía. El panel "Fijar Acordes" se oculta de la pantalla pero queda intacto en el código, con `UI.lockChord` sin tocar. No se toca `src/engine.js` ni el coloreo de `renderKeyboard`, y los 18 fixtures siguen pasando. Cierra el desfase de versión mostrada: `<title>` y `<h1>` pasan de V11.6 a V11.19.

## v11.18 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que generaliza el contrato de salida del motor. La salida vive en el buffer y cualquier superficie la consume, sea panel o fondo; el teclado ya es una superficie de feedback que es fondo, no panel (`renderKeyboard` pinta `validPitches` y el veredicto por nota sin panel de por medio). Refina la definición de "superficie de feedback" del glosario del 2026-07-25, que queda como caso particular. De ahí cae que la visibilidad de un panel y su efecto son separables. Deja fijado que, si se construye una confirmación previa a una acción, va solo del lado de lo irreversible.

### Changed

- `docs/ROADMAP.md`: la Fase 5 se reescribe como reencuadre visual puro. La escala no se extrae a un panel: se queda coloreando el teclado, que pasa a ser el fondo protagonista, con el resto de la UI en overlay, la consola detrás de un submenú y las ranuras reservadas dibujadas vacías. No toca el motor ni el coloreo de `renderKeyboard`. Se corrigen dos referencias desactualizadas: la Fase 9 ya no llama a la Fase 5 "la escala con rueda" sino "las ranuras reservadas", y la Fase 10 aclara en su Alcance que es ella la que mueve la escala del teclado a un panel y le suma la rueda, y su "Bloqueada por: Fase 5" pasa a citar "la estructura de fondo y ranuras" en vez del panel de escala.

## v11.17 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 se parte en dos. Ahora la Fase 5 es solo el rediseño visual, la escala como panel de característica sobre el teclado de fondo, en vista lineal, sin rueda ni conmutador (con una sola vista no hay nada que conmutar). Es presentación pura: lee `scalePitches` del motor y no lo toca.

### Added

- `docs/ROADMAP.md`: Fase 10, la rueda de quintas como segunda vista de la escala, con el conmutador que nace ahí. La rueda deriva de `scalePitches`; queda abierto si además muestra las calidades diatónicas, en cuyo caso depende de la función tonal de la Fase 4. Bloqueada por la Fase 5; su número es posterior por secuencia de decisión, no por dependencia con las progresiones.

## v11.16 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: dos correcciones de coherencia, sin cambiar decisiones. La Fase 3 ahora declara "Bloquea: Fase 4", así la dependencia con la Fase 4 (que ya decía "Bloqueada por: Fase 3") queda declarada en los dos sentidos, como el resto del ROADMAP. El encabezado del "Track paralelo de teoría" pasa de "informa las Fases 2 y 3" a "informa las Fases 2, 3 y 4", porque la Función tonal (Fase 4) también sale de ese material.

## v11.15 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: reestructurado con las fases del modelo de paneles, apoyado en las entradas de `DECISIONS.md` del 2026-07-24 (paneles) y 2026-07-25 (protocolo de clasificación y glosario). Fases nuevas: Función tonal (Fase 4, salida del motor al buffer, bloqueada por la Fase 3 de grados romanos), Escala con rueda de quintas (Fase 5, primer incremento del ADR de paneles, estrena el sistema de ranuras, puede ir en paralelo), y dos de progresiones (Fase 8, detección de secuencia como salida del motor; Fase 9, la característica en una ranura). Calidad de vida y Feedback sonoro se corren a Fases 6 y 7. Se sacó "Círculo de quintas" del BACKLOG porque ahora es parte de la Fase 5. El "Track paralelo de teoría" queda como material de apoyo, sin cambios.

## v11.14 — 2026-07-25

### Added

- `docs/DECISIONS.md`: dos entradas nuevas (2026-07-25) que se apoyan en la del 2026-07-24 (arquitectura de UI de paneles sobre un fondo fijo). "Protocolo de clasificación" fija el criterio para clasificar toda parte de la UI en característica, salida del motor, o fondo/chrome, como corolario de la regla "característica es un rol, no una clase". "Glosario del modelo" define en un solo lugar el vocabulario de arquitectura (fondo, panel, ranura, característica, salida del motor, buffer del motor, superficie de feedback); solo arquitectura, sin vocabulario musical.

## v11.13 — 2026-07-23

### Fixed

- `docs/DECISIONS.md`: la plantilla del final abría el ejemplo con `### YYYY-MM-DD` (tres almohadillas), pero el estándar de `CLAUDE.md` y las últimas cinco entradas usan `##`. Corregido a `## YYYY-MM-DD`, para que quien copie el machete no arranque desalineado. La plantilla no es una entrada: append-only protege el registro de decisiones, no el machete del final, así que esto no reescribe historia. Las entradas del 2026-07-03 que usan `###` quedan como están.

## v11.12 — 2026-07-23

### Added

- `docs/DECISIONS.md`: entrada 2026-07-23 que fija la jerarquía de evaluación de una nota de melodía (Fase 2 del roadmap). Cinco pasos, la primera regla que matchea gana: escala activa, acorde activo (incluida la dominante secundaria que completa la Fase 3), sensible en contexto menor, indulto de paso cromático (180 ms), y bad. Documenta qué pasos ya están en el código y cuál falta, más el límite conocido de que el indulto colapsa una tensión corta igual que un error corto.

### Changed

- `docs/ROADMAP.md`: la Fase 2 queda marcada como `cerrada (2026-07-23)` y su criterio de aceptación cita el ADR. Es especificación, no código: la implementación es de la Fase 3.

## v11.11 — 2026-07-23

### Removed

- `CLAUDE.md`, sección "Repos hermanos": borrada, con su política de anclaje. Describir otros repos fue un error: esas descripciones envejecen (la de TL-FCCU afirmó "un solo script bash" después de que ese repo sumara un agente Java, y hubo que corregirla) e insinúan una dependencia entre repos que no existe.

### Added

- `CLAUDE.md`, en "Scope de escritura": regla corta. Este repo no describe otros repos; el nombre de otro solo aparece como procedencia histórica, nunca como información operativa, y ningún documento de acá depende de otro para entenderse.

## v11.10 — 2026-07-23

### Changed

- `CLAUDE.md`, sección "Repos hermanos": corregida la descripción de TL-FCCU. "Un solo script bash (`run.sh`)" era falso; el repo hoy suma un agente Java en `scripts/` (Byte Buddy) que intercepta el HTTP, verificado el 2026-07-23 contra el repo en la sesión. La política de referencias cruzadas ahora exige que una descripción diga qué es el proyecto, no cómo está construido, salvo que su estructura se haya verificado en la sesión.

## v11.9 — 2026-07-23

### Changed

- `CLAUDE.md`, sección "Guion largo": la exención se amplía. La prosa escrita antes de que se adoptara la regla (v11.3) queda como está, igual que los encabezados. En `docs/DECISIONS.md` es obligatorio porque el archivo es append-only: sus guiones largos viejos (entradas del 2026-07-03 y sección Histórico, en prosa corrida y entre paréntesis) son deuda tolerada, no algo a arreglar.

### Added

- `CLAUDE.md`, sección "Repos hermanos": nombra los otros tres repos del autor (TL-FCCU, TdeA-Mimos-Website, TdeA-Mimos-API-REST) con una línea cada uno, y fija la política de referencias cruzadas. Una mención a otro repo se ancla en esa sección, no se borra; la historia no se reescribe para agregar ni sacar anclajes (la mención a TLauncher_FCCU en v11.8 resuelve contra ella).

## v11.8 — 2026-07-23

### Changed

- `docs/ROADMAP.md`: reformateado al molde uniforme por fase, tomado del ROADMAP de TLauncher_FCCU y traducido al español. Cada fase numerada lleva `Estado`, `Objetivo`, `Alcance`, `Criterio de aceptación` y `Bloquea`/`Bloqueada por`, y arriba se declara el vocabulario de estado (`pendiente`, `en progreso`, `cerrada (YYYY-MM-DD)`). Mismo contenido: el "Tarea" de la Fase 1 se separó en `Objetivo` (el para qué) y `Alcance` (el qué se hace), el "Bloquea la Fase 3" pasó a campo, y los criterios que no existían quedaron en "por definir". La nota introductoria, el BACKLOG y el "Track paralelo de teoría" quedan como estaban.

## v11.7 — 2026-07-23

### Changed

- `CLAUDE.md`, sección "CHANGELOG": regla nueva. Un PR doc-only abre su propia sección fechada, con la fecha real del cambio, en vez de plegarse en una versión ya publicada. La última versión del CHANGELOG puede quedar por delante de la versión mostrada; ese desfase es intencional y lo cierra el próximo PR de código. Esta sección estrena la regla: es doc-only, así que la versión mostrada no se bumpea y sigue en V11.6.

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
