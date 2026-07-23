# DECISIONS.md — MIDI Scale Trainer Pro

> Registro append-only. No se borran entradas viejas aunque queden obsoletas — se agrega
> una entrada nueva que referencia y reemplaza a la anterior. El objetivo es que nunca
> más se pierda el "por qué" de una decisión, como pasó con v11.5.

---

### 2026-07-03 — Base de reconstrucción: v11.0, no v11.5

**Contexto:** el proyecto llegó a una v11.5 (interfaz responsive líquida, según chats de
Gemini) pero el archivo se perdió y no hay repositorio.

**Decisión:** se reconstruye hacia adelante desde `v11.0` (604 líneas, archivo real
disponible y verificado), no se intenta recuperar v11.5 de memoria/chats.

**Razón:** todo lo que se sabe de v11.5 es narrativa de IA sobre logs de chat, nunca
confirmada contra código real. Reconstruir de memoria una versión no verificada arriesga
fijar como "hecho" algo que puede estar inflado o mal atribuido (ver hallazgos de
`ARCHITECTURE.md` §0).

**Estado:** vigente.

---

### 2026-07-03 — No migrar a framework (React/Vue/etc.) por ahora

**Contexto:** se consideró migrar a un framework para "ordenar" la arquitectura y evitar
futuros parches hardcodeados.

**Decisión:** se mantiene JavaScript vanilla con el patrón de objetos-módulo actual
(`State`/`MathEngine`/`MIDI`/`UI`). Se reconsidera solo si el archivo supera ~1000 líneas
o aparece necesidad real de UI reactiva compleja.

**Razón:** los colapsos históricos documentados (freeze en V6, fuga de memoria por
`innerHTML`) fueron problemas de patrones DOM/async, no límites del lenguaje. El problema
real de fondo es la falta de una jerarquía formal de reglas de teoría musical (ver Fase 2
del roadmap), y eso no lo resuelve ningún framework. Sumar una curva de aprendizaje de
framework ahora compite con la curva de aprendizaje de teoría musical, que es la prioridad.

**Estado:** vigente.

---

### 2026-07-03 — Repositorio privado + PII fuera del código

**Contexto:** se encontró un nombre real hardcodeado en `<div class="credits">` de v11.0.

**Decisión:** se quita esa información antes de cualquier commit. El repositorio se
mantiene privado independientemente de eso.

**Razón:** información personal en código fuente no debería depender de que el repo sea
público o privado para estar protegida — un repo privado puede volverse público por error,
puede tener colaboradores futuros, etc.

**Estado:** vigente.

---

### (Histórico, no verificado en código — solo referencia) Heurísticas de v11.0

Estas reglas SÍ están confirmadas leyendo el archivo real (a diferencia de la narrativa de
versiones V10.x/V11.x de Gemini, que no se pudo verificar):

- **Sensible en escala menor:** `(root + 11) % 12`. Se marca `tension` si esa nota suena
  y no está en la escala ni en el acorde activo, solo en universos `minor`/`harmonic_minor`.
  Pendiente (no resuelto): la sensible también existe en escalas mayores y no se detecta
  ahí — queda para cuando se formalice la Fase 2 del roadmap.
- **Paso cromático:** cualquier nota no-`good` que dure menos de 180ms al soltarse se
  reclasifica a `passing`. Umbral elegido empíricamentemente contra el caso Bad Apple, no
  matemáticamente derivado — es la heurística más "hardcodeada" que sigue viva en el motor.
- **Dominante secundaria:** target a `+5` semitones (cuarta justa ascendente) desde la raíz
  del acorde. Confirmado que hoy **solo actualiza texto en la UI**, no afecta
  `evaluateMelody`. Corrección planeada en Fase 3 del roadmap.

---

### 2026-07-03 — Fase 0: fixtures de regresión + extracción del motor puro a `src/engine.js`

**Contexto:** la Fase 0 del roadmap pide grabar los casos reales ya resueltos
(Bad Apple, Oda a la Alegría, Blues) como fixtures y correrlos en Node. Pero la
lógica de teoría musical vivía duplicable dentro del `<script>` inline de
`index.html`, entrelazada con DOM/State/timers, y correrla en Node hubiera
implicado copiarla a un archivo de test — exactamente la duplicación
"código-que-nadie-verifica-contra-el-real" que este proyecto quiere evitar.

**Decisión:** se extrajo el núcleo puro de teoría musical a `src/engine.js` como
fuente única de verdad, y `index.html` lo carga vía `<script src>` y lo usa. El
módulo funciona como global de navegador y como `require` de Node sin build step
ni ES Modules. Se movió `SCALES`, `CHORD_TEMPLATES` y `MathEngine` tal cual, y se
extrajeron a funciones puras las reglas que estaban inline: relación acorde/
universo (`classifyChordRelation`), estado de nota de melodía
(`evaluateMelodyStatus`) e indulto de paso cromático (`applyPassingTone`).
`index.html` ahora llama a esas funciones en vez de reimplementarlas. Las
fixtures viven en `tests/fixtures/*.json` y corren con `node tests/run.js` (solo
`assert`, sin framework). 15 casos, todos en verde.

**Razón:** con el motor en un solo lugar, las fixtures prueban el código real que
usa la app, no una copia. Además la Fase 1 va a editar `detectChord`: tenerlo ya
en `src/engine.js` hace que ese cambio quede automáticamente cubierto por las
fixtures. Se descartó (a) duplicar la lógica en el test —anti-patrón que costó
v11.5— y (b) migrar a ES Modules/framework —innecesario, un `<script src>` global
alcanza y respeta la decisión de "no framework" de más arriba.

**Salvedad (honestidad de estado):** el refactor del navegador preserva el
comportamiento línea por línea (verificado leyendo cada reemplazo y con un smoke
test headless en Chromium: carga sin errores de consola, `MathEngine`/`Engine`
disponibles, detección y relación correctas, teclado renderizado). Pero el gate
del roadmap —probar en el piano físico antes de cerrar una fase— no se puede
correr en este entorno (no hay MIDI). La Fase 0 no se da por cerrada hasta ese
smoke test manual en el piano.

**Nota de sincronización:** `Engine.scalePitches` (pitch classes de un universo)
es el único derivado que queda en paralelo con el recorrido inline de
`UI.buildUniverse` (que además arma el HTML de la fórmula). Ambos leen la misma
constante `SCALES` y hacen la misma cuenta de 2 líneas; no se unificó para no
tocar código de DOM que hoy funciona. Si se toca uno, tocar el otro.

**Estado:** vigente.

---

### 2026-07-03 — El agente no tiene permiso de escritura en el repo (push/branch/PR bloqueados)

**Contexto:** terminada la Fase 0, el commit quedó armado localmente en la branch
`claude/regression-fixtures-phase-0-no7fe1` pero **no se pudo pushear**. Se
verificó que es un bloqueo de permisos de escritura, no de red:

- `git fetch` (lectura) funciona.
- `git push` → el endpoint `git-receive-pack` del relay devuelve `403 Forbidden`.
- GitHub App API: `create_branch` y `create_pull_request` devuelven
  `403 Resource not accessible by integration`.

Es decir: el GitHub App de la sesión tiene acceso de **solo lectura** a
`jncldrn64/midi-scale-trainer`. Desde el agente no se puede crear branch, pushear
ni abrir PR.

**Decisión:** no se reintenta el 403 (política del entorno: los 403/407 son
denegaciones de policy, no fallas transitorias). El trabajo se entrega commiteado
localmente + como patch (`git format-patch`), y el push/PR queda como paso manual
del humano hasta que se habilite escritura.

**Procedimiento para próximas iteraciones (mientras el acceso siga en solo lectura):**

1. Habilitar escritura (recomendado, lo resuelve de raíz): en la config del
   Claude GitHub App, dar permiso **Contents: read & write** (y Pull requests si
   se quiere que el agente abra PRs) sobre `jncldrn64/midi-scale-trainer`. Una vez
   hecho, el agente puede `git push -u origin <branch>` y abrir el PR normalmente.
2. Alternativa sin cambiar permisos (push manual del humano): aplicar el patch que
   entrega el agente y pushear con una credencial con escritura:
   ```bash
   git checkout -b claude/regression-fixtures-phase-0-no7fe1 origin/main
   git am 0001-*.patch          # patch entregado por el agente
   git push -u origin claude/regression-fixtures-phase-0-no7fe1
   # luego abrir el PR a mano contra main
   ```

**Nota de estado del commit:** autor/committer = `noreply@anthropic.com` (para que
GitHub no lo marque Unverified). El contenido de la Fase 0 no depende de esto; si
el acceso se habilita, se pushea la branch tal cual.

**Estado:** vigente hasta que se habilite escritura del GitHub App sobre el repo.

---

## 2026-07-04 — Ratificada la extracción del motor a `src/engine.js`

**Contexto:** la entrada del 2026-07-03 aplicó la extracción del motor, pero al
revisarla se la trató como decisión abierta: adoptarla ahora o diferirla al umbral
de ~1000 líneas de `ARCHITECTURE.md` §7. El batch de Fase 0 ya llegó a `main` con la
extracción puesta.

**Decisión:** se ratifica. `src/engine.js` queda como fuente única de verdad e
`index.html` lo carga por `<script src>`. No se difiere.

**Razón:** ya funciona y está verificado (15/15 fixtures en verde contra el motor
real, corrida del 2026-07-04). La Fase 1 edita `detectChord`, que ahora vive en un
solo lugar cubierto por las fixtures; diferir la extracción obligaría a mover ese
código en plena Fase 1. El umbral de ~1000 líneas sigue vigente para la pregunta
grande (¿modularizar todo `index.html`?), pero para el núcleo de teoría musical el
beneficio de fuente única ya se justifica hoy.

**Estado:** vigente. Confirma la decisión del 2026-07-03.

---

## 2026-07-04 — Acceso de escritura concedido

**Contexto:** la entrada del 2026-07-03 "El agente no tiene permiso de escritura en
el repo" documentó un bloqueo 403 en push/branch/PR.

**Decisión:** se habilitó la escritura del GitHub App sobre el repo. `create_branch`,
`push_files` y `create_pull_request` funcionan; los commits por API salen Verified.
El trabajo vuelve al flujo por PR, sin patches ni subidas manuales.

**Estado:** cierra y deja obsoleta la entrada de bloqueo del 2026-07-03.

---

## 2026-07-04 — Fase 1: el bajo como raíz candidata, y el límite de la ambigüedad enarmónica

**Contexto:** `detectChord` elegía siempre la raíz de menor pitch class que matcheara un
template (ver `ARCHITECTURE.md` §4). Para La-Do-Mi-Sol (pitch classes 0, 4, 7, 9) devolvía
"Do6" aunque el bajo estuviera en La y la música fuera vi7.

**Decisión:** en `src/engine.js`, `detectChord` prueba primero el pitch class del bajo real
(`bassPC`) como raíz candidata, antes del orden ascendente. Si el bajo arma un template
válido, gana esa lectura; si no, cae al orden ascendente de siempre, que es la inversión
real.

**Razón y límite:** esto prefiere la lectura más probable, el bajo como raíz, pero no
resuelve la ambigüedad. Do6 y La m7 son las mismas cuatro notas; con el bajo en La el motor
ahora dice La m7, con el bajo en Do dice Do6. La ambigüedad enarmónica total (mismas notas,
mismo bajo, dos lecturas que solo separa la canción entera) no tiene solución algorítmica
simple, y no la va a tener sin el contexto de la progresión completa. Queda como límite
documentado, no como bug pendiente.

**Estado:** vigente.

---

## 2026-07-04 — Documentación que describía código previo a un fix ya mergeado

**Contexto:** después de mergear la v11.6 (Fase 1), la doc quedó atrás del código.
`ARCHITECTURE.md` §4 seguía describiendo el `detectChord` viejo ("elige siempre la raíz de
menor pitch class", "no mira el bajo"), §6 listaba dos gaps ya cerrados, §7 tenía el conteo
de líneas viejo, `ROADMAP.md` no marcaba la Fase 1, e `index.html` mostraba `V11.0`. La doc
describía un estado que el código dejó de tener el mismo día.

**Decisión:** cada PR que cambia el comportamiento del motor actualiza, en ese mismo PR, la
sección de `ARCHITECTURE.md` que describe ese comportamiento, el estado de la fase en
`ROADMAP.md` y la versión mostrada en `index.html`. La doc no se sincroniza en un pase
aparte "más adelante"; se toca junto al código que la vuelve falsa. Cuando igual aparece un
desfasaje, se corrige leyendo el código, no de memoria.

**Razón:** la regla de `ARCHITECTURE.md` §0 es una sola: nada se documenta como hecho sin
leer el código que lo prueba. Un fix que cambia el algoritmo y deja intacta la sección que
lo describe rompe esa regla en silencio, el mismo modo en que se perdió la v11.5 (descrita
sin código). Atar la actualización de doc al PR de código evita que la descripción y el
código se separen entre fases.

**Estado:** vigente.

---

## 2026-07-23 — Jerarquía de evaluación de una nota de melodía (Fase 2)

**Contexto:** `MathEngine.evaluateMelodyStatus` (en `src/engine.js`) decide el estado de una
nota con un orden que es un accidente del código, no una decisión escrita. `ARCHITECTURE.md`
§5 lista seis reglas y ninguna tiene prioridad documentada. Antes de sumar grados romanos
(Fase 3), ese orden se fija por escrito, para que agregar una regla nueva sea contra una
prioridad declarada y no contra el orden de las líneas.

**Decisión:** el estado de una nota de melodía se resuelve en este orden. La primera regla
que matchea gana.

1. El pitch class está en la escala activa (`validPitches`) → `good`.
2. El pitch class está en el acorde activo, incluida la dominante secundaria reconocida →
   `good`. Hoy `evaluateMelodyStatus` solo mira el template del acorde literal (`inScale ||
   inChord`); conectar la dominante secundaria a la evaluación, no solo a la UI de
   `classifyChordRelation`, es trabajo de la Fase 3. Hasta entonces este paso cubre solo las
   notas del acorde literal.
3. Es la sensible en contexto menor, `(root + 11) % 12`, y no cayó en 1 ni en 2 → `tension`.
   Solo en universos `minor` y `harmonic_minor`.
4. Al soltar la tecla, la nota duró menos de `PASSING_TONE_MS` (180 ms) y había quedado
   no-`good` → `passing`. Se evalúa al final, en `MIDI.releaseNoteInternal`, sobre lo que
   haya quedado como no-`good`. El umbral de 180 ms se calibró a mano contra Bad Apple.
5. Nada de lo anterior → `bad`.

**Qué ya existe y qué falta:** los pasos 1, 3, 4 y 5 ya están en el código
(`evaluateMelodyStatus` más `applyPassingTone`) y las 18 fixtures los cubren. El paso 2 está
a medias: el acorde literal sí, la dominante secundaria todavía no; eso lo completa la Fase
3. El intercambio modal (regla 6 de `ARCHITECTURE.md` §5) no entra en esta jerarquía: es una
etiqueta de relación del acorde con el universo (`classifyChordRelation`), no un estado de
nota, y se queda en la UI.

**Límite conocido, no un bug:** el paso 4 reclasifica a `passing` cualquier no-`good` corto,
así que una tensión de menos de 180 ms se colapsa igual que un error corto (ver
`ARCHITECTURE.md` §3). Por ahora el indulto no distingue "tensión corta" de "error corto";
separarlas obligaría a tocar `MIDI.releaseNoteInternal`. Queda como decisión, no como
pendiente silencioso.

**Razón:** este orden es el que ya vive en el código para los pasos que existen, más el que
la Fase 3 completará en el paso 2. No es código todavía: es la especificación que la Fase 3
implementa.

**Estado:** vigente.

---

### Plantilla para nuevas entradas

```
## YYYY-MM-DD — Título corto de la decisión

**Contexto:** qué problema o pregunta motivó esto.

**Decisión:** qué se decidió, en una o dos frases.

**Razón:** por qué esta opción y no otra (mencionar alternativas descartadas si aplica).

**Estado:** vigente / reemplazada por [fecha] / obsoleta
```
