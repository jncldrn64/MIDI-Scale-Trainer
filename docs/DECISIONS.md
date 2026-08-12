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

## 2026-07-24 — Arquitectura de UI: paneles sobre un fondo fijo, el motor como única fuente

**Contexto.** Hoy la UI de `index.html` reparte espacio parejo entre elementos de distinta importancia: el teclado, los paneles de escala y acorde, y la consola de debug conviven al mismo nivel. Para el usuario objetivo, que lee nota por nota y quiere entender qué toca y por qué, eso tira para muchos lados y no deja claro qué mira primero. Además, las features que vienen (rueda de quintas como vista alterna de la escala, progresiones, notas que caen estilo Synthesia, entrenamientos) no tienen dónde acomodarse sin pegarse como parásitos, el mismo problema que los botones de "Fijar Acordes", que hoy hardcodean Do Mayor y Re m7 en vez de derivarlos del motor. El riesgo concreto es repetir la V3.0: crecer a miles de líneas de features acumuladas sin modelo y tener que reescribir todo de una.

**Decisión.** Se adopta un modelo de UI de paneles sobre un fondo fijo, con estas reglas:

1. **El fondo no se toca.** El teclado y el espacio superior reservado para las notas que caen son el fondo permanente. No se cierran, no se mueven, no ceden espacio. Todo lo demás es overlay.

2. **Todo overlay es un panel; "característica" es un rol, no una clase.** Subtítulos, feedback de texto, guía de interfaz, escala, progresiones, y hasta el menú de opciones son el mismo tipo de objeto: un panel flotante con contenido. Lo único que los distingue es una propiedad: si compiten o no por las ranuras de característica.

3. **Tres ranuras de característica, límite deliberado.** Las features (las que tienen contenido intercambiable) viven en un máximo de tres ranuras simultáneas. El límite no es estético: existe porque el aire superior está reservado para las notas que caen, que son fondo y no negocian espacio. Sin límite, el usuario tapa ese lugar y rompe el propósito. El número puede afinarse, el límite no se elimina.

4. **El motor es la única fuente de verdad musical.** Ningún panel codifica a mano lo que `MathEngine` puede derivar. La UI es una proyección de lo que el motor calcula dado el estado. Toda fuente de notas (el piano, un MIDI cargado, un futuro track de notas que caen) entra por el mismo punto de evaluación. Los botones de acorde hardcodeados son la única violación actual de esta regla y se corrigen volviéndolos dinámicos (derivar I, IV, V de la escala activa).

5. **Una característica puede ocupar hasta las tres ranuras a la vez.** Si tiene varias vistas de la misma estructura (la escala: lineal y rueda de quintas), puede mostrarse en más de una ranura a distinta opacidad, una de fondo y una de foco. Es el patrón de vistas sincronizadas del proyecto, ahora con jerarquía de atención por opacidad.

6. **Default cerrado y correcto.** La app abre en un estado usable sin configurar nada: una ranura con la escala en vista lineal, feedback y subtítulos visibles, guía abierta la primera vez y cerrable. Mover, opacidad, segunda vista y apagar paneles son descubrimiento opcional, no configuración obligatoria. El usuario objetivo quiere abrir y que ya esté bien puesto, no armar su espacio antes de empezar.

7. **Dos superficies de control, dos momentos distintos.** La config de layout (qué panel vive en qué ranura, opacidad, posición) se maneja en los paneles mismos, entre sesiones. La config de detección MIDI (cuánto espera para detectar un acorde, umbrales, delays) es avanzada, impacta en tiempo real y vive en el menú desplegable superior, separada. No se mezclan: cambiar detección mientras se toca es el error de tocar opciones en mitad de una carrera.

8. **Persistencia de layout, mecanismo sin fijar.** El estado del layout (posición, opacidad, qué vive en cada ranura) persiste entre sesiones. El mecanismo se decide al construir; corriendo desde `file://` la vía disponible hoy es `localStorage`, que es donde el repo ya guarda config. No se compromete un `.ini` ni nada que la plataforma no dé gratis.

**Consecuencias.**

- El sistema de paneles es infraestructura de UI, no una feature, y todo lo que venga después se cuelga de él. Por eso se decide antes de construirse.
- Construir el gestor de paneles completo cruzará el umbral del §7 de `ARCHITECTURE.md` (1000 líneas). Cuando pase, la respuesta ya está decidida ahí: modularizar con ES Modules nativos, no adoptar framework. Este ADR no cambia esa decisión, la anticipa.
- **Este ADR fija la dirección, no un orden de construcción.** No se construye el gestor de paneles completo mientras solo exista una característica que lo llene: hacerlo es diseñar a ciegas contra un solo caso y rehacerlo al llegar el segundo, justo la refactorización masiva que este modelo busca evitar. El sistema de ranuras se diseña contra dos características reales, no una imaginada. El primer incremento de código es la escala con su vista alterna (lineal y rueda) sobre el fondo del teclado; el gestor de paneles nace cuando las progresiones aporten la segunda característica. El ROADMAP define ese secuenciado.
- Las ranuras que nacen sin característica no muestran un hueco mudo: indican qué va a vivir ahí y que aún no existe.

**Estado:** aceptada, sin construir. El primer incremento (escala con vista lineal y rueda) entra como fase en el ROADMAP.

---

## 2026-07-25 — Protocolo de clasificación: característica, salida del motor, fondo o chrome

**Contexto:** la entrada del 2026-07-24, regla 2, dice que "característica es un rol, no una clase", pero no da el criterio para clasificar algo nuevo cuando aparece. Sin ese criterio, cada idea futura reabre la discusión de si es característica o no. Esta entrada fija el criterio como corolario operativo de esa regla.

**Decisión:** toda parte de la UI cae en exactamente una de tres categorías.

- **Característica:** tiene contenido intercambiable, compite por una de las tres ranuras, y el usuario la abre, mueve o cierra. Puede tener varias vistas de la misma estructura (la escala, en vista lineal y en rueda de quintas). Ejemplos: la escala; las progresiones cuando existan.
- **Salida del motor:** el motor la deriva del estado y varios paneles la consumen del mismo buffer único. No compite por ranura, no se abre ni se cierra, está disponible para todos los paneles a la vez. Ejemplos: los grados romanos, la función tonal (tónica, subdominante, dominante), el veredicto nota por nota. Nada de esto es característica: darle panel propio sería hardcodearlo, el mismo pecado que los botones de Fijar Acordes que la entrada del 2026-07-24 ya señala.
- **Fondo o chrome:** permanente, no se cierra. Ejemplos: el teclado, la zona de notas que caen, la barra de menú de detección MIDI.

**Razón:** sin este protocolo, "¿esto es característica o motor?" se rediscute cada vez. Con él, cualquier idea futura cae sola en su lugar. La prueba práctica: si el motor lo puede derivar del estado, es salida del motor y va al buffer, no es característica de nadie.

**Consecuencia:** hay tres superficies de texto distintas y no se fusionan. Los subtítulos del entrenamiento (directrices en tiempo real, propias del entrenamiento activo) y el feedback del sistema (el veredicto nota por nota) son salida visible para el usuario. La consola de debug (logs de desarrollo) es una tercera superficie, no es lo mismo que el feedback, y se queda detrás de submenús, oculta para quien solo toca. Un modelo previo fusionó feedback y consola; esta consecuencia existe para que no se repita.

**Estado:** vigente.

---

## 2026-07-25 — Glosario del modelo: vocabulario de arquitectura

**Contexto:** los términos de arquitectura del proyecto (ranura, panel, buffer del motor, superficie de feedback, fondo) se usan en las entradas de DECISIONS y se van a usar en el ROADMAP y en los prompts, pero no están definidos en un solo lugar. Un modelo frío que llegue puede inventar su propio vocabulario o interpretar mal el existente. Este glosario fija los términos. Es solo vocabulario de arquitectura, para quien construye. El vocabulario musical (tónica, dominante, grado romano) no va acá: eso es contenido de la app que la característica de la escala y la guía de interfaz le explican al usuario, y vive en el buffer del motor y en la guía, no en la documentación del repo.

**Decisión:** se definen los términos, cada uno en una línea, alineados con la entrada del 2026-07-24 (no son definiciones nuevas):

- **Fondo:** el teclado y la zona de notas que caen. Permanente, no se cierra, no cede espacio.
- **Panel:** cualquier overlay con contenido que flota sobre el fondo. Puede cerrarse.
- **Ranura:** una de las tres posiciones donde vive una característica. Máximo tres simultáneas.
- **Característica:** un panel con contenido intercambiable que compite por una ranura (ver Protocolo de clasificación).
- **Salida del motor:** dato que `MathEngine` deriva del estado y expone en un buffer único que cualquier panel consume (ver Protocolo de clasificación).
- **Buffer del motor:** el punto único desde donde los paneles leen la salida del motor. Ningún panel recalcula ni hardcodea lo que el buffer ya provee.
- **Superficie de feedback:** un panel que muestra salida del motor al usuario. Hay tres distintas: subtítulos del entrenamiento, feedback del sistema, y la consola de debug (esta última oculta).

**Razón:** un glosario corto evita que cada sesión reinvente los términos o los use con sentidos distintos. Se limita a arquitectura a propósito; mezclar vocabulario musical lo volvería contenido de producto y no documentación de repo.

**Estado:** vigente.

---

## 2026-07-25 — Refinación del contrato: la salida del motor la consume cualquier superficie, panel o fondo

**Contexto:** el glosario del 2026-07-25 define "superficie de feedback" como un panel que
muestra salida del motor. Esa definición quedó estrecha. Verificado contra `src/engine.js` e
`index.html`: el teclado ya es una superficie de feedback y no es un panel, es fondo.
`renderKeyboard` (`index.html:458`) pinta dos salidas del motor sobre las teclas, las notas de
la escala activa (`validPitches`) y el veredicto nota por nota (`good`, `tension`, `passing`,
`bad`). O sea, el teclado ya consume del estado del motor sin panel de por medio.

**Decisión:** se generaliza el contrato. La salida del motor vive en el buffer del motor, y
cualquier superficie la consume, sea panel o fondo. El teclado es fondo que consume del
buffer. Un panel que muestre lo mismo es otro consumidor independiente. De ahí cae directo que
la visibilidad de un panel y su efecto son separables, porque son dos lectores del mismo
buffer: ocultar el panel de una característica no apaga el coloreo del teclado, y al revés
tampoco. No es una feature a programar, es una propiedad que cae del contrato.

**Razón:** sin esta generalización el glosario implica que solo los paneles muestran salida
del motor, y el código ya demuestra lo contrario desde `renderKeyboard`. Esta entrada refina
la definición de "superficie de feedback" del glosario del 2026-07-25, que queda como caso
particular: un panel es una superficie, y el fondo también puede serlo.

**Consecuencia:** qué superficies y qué efectos existan a futuro no se fija acá; una
superficie nueva consume el buffer igual que las de hoy. Y una restricción para cuando eso
llegue: cualquier confirmación previa a una acción, del tipo pedir permiso antes de cambiar
algo, pertenece solo a lo irreversible, como resetear todos los layouts o un entrenamiento que
sobrescribe la disposición del usuario. Nunca a un cambio de layout rutinario y reversible,
que tiene que ser sin fricción y deshacible. Esto no autoriza a construir esa confirmación;
fija que, si se construye, va solo del lado de lo irreversible.

**Estado:** vigente.

---

## 2026-07-25 — Refinación del modelo: fondo único de piano y notas, widgets, y panel de pestañas

**Contexto:** al construir la Fase 5 quedaron a la vista tres imprecisiones del modelo. Una:
se trató la zona de notas que caen como una franja separada de las ranuras, apiladas, cuando
el modelo real es una sola capa de fondo. Dos: faltaba una palabra para las características
flotantes que se mueven y se comunican con el sistema. Tres: cosas como el panel de logs y las
opciones no son ni característica ni fondo mudo, y no tenían categoría. Esta entrada corrige
las tres.

**Decisión:** cuatro reglas.

1. **Fondo único.** El fondo es una sola capa: el teclado más la zona de notas que caen,
   ocupando todo el ancho y todo el alto disponible. Las notas que caen no viven en una franja
   aparte; usan todo el fondo y pasan por detrás de los widgets. Esto refina la regla 1 y la
   regla 3 del ADR del 2026-07-24: el límite de tres ranuras se mantiene, pero su razón se
   precisa. No protege una franja reservada, evita que los widgets tapen tanto que no se puedan
   leer las notas que caen por detrás. Mismo límite, mismo propósito, mecanismo corregido.

2. **Widget.** Se adopta la palabra "widget" para lo que el protocolo de clasificación del
   2026-07-25 llamó "característica": un panel de contenido intercambiable que vive en una
   ranura, se mueve, se oculta, y se comunica con el sistema a través de las superficies
   compartidas, alterando o leyendo las notas, el teclado o el bus de feedback (el buffer del
   motor), nunca con copias privadas. Widget y característica-en-ranura son el mismo rol; se
   usa "widget" de acá en adelante. No cambia el protocolo, precisa su vocabulario.

3. **Panel de pestañas.** Categoría nueva, la cuarta. Es chrome interactivo permanente donde
   viven las cosas que no son widget ni fondo: las opciones y el panel de logs. No compite por
   ranura, no es característica, está siempre presente como la barra de menú de macOS, y su
   contenido cambia según lo que esté abierto. La analogía del proyecto: el teclado es la barra
   de tareas, siempre abajo; el panel de pestañas es la barra de menú, siempre arriba. Nada se
   abre en pantalla completa; cada widget tiene su propia rueda de opciones. Esto refina la
   categoría "Fondo o chrome" del protocolo de clasificación del 2026-07-25, separando el fondo
   mudo (teclado y notas) del chrome interactivo (panel de pestañas).

4. **Teclado fijo.** El teclado visual es fijo de 88 teclas, a todo el ancho de la pantalla,
   independiente del zoom. No se detecta el tamaño del controlador MIDI: el protocolo MIDI
   manda números de nota de 0 a 127 sin importar cuántas teclas físicas tenga el controlador, y
   cada nota ilumina la tecla visual que le corresponde. Una nota fuera del rango visible de 88
   se ignora o se recorta al borde; el detalle se decide al construir. Esto cierra un hueco que
   el ADR del 2026-07-24 no cubría.

**Razón:** el modelo apilado que produjo la Fase 5 divergía de la intención, que son capas, no
franjas. Y sin las palabras "widget" y "panel de pestañas" cada cosa nueva no tenía dónde caer.
Estas cuatro reglas cierran esos huecos sin reabrir el motor ni contradecir el contrato: los
widgets siguen consumiendo del buffer, el fondo sigue siendo superficie de feedback (refinación
del contrato del 2026-07-25), y el límite de ranuras sigue vigente.

**Consecuencia:** la Fase 5, cerrada apilada, queda desalineada con este modelo de capas y
habrá que reabrirla. Eso se maneja en el ROADMAP, no acá. El glosario del 2026-07-25 queda
refinado: "característica" se lee ahora como "widget", y "superficie de feedback" incluye al
fondo, no solo a los paneles, algo que la refinación del contrato del 2026-07-25 ya anticipó.

**Estado:** vigente.

---

## 2026-07-25 — El log como canal de validación: toda salida del motor se registra, se muestre o no

**Contexto:** el borde MIDI no se puede testear solo. Nadie automatiza "¿el humano oyó o vio
lo correcto?". Y el rediseño de UI puede ocultar o reencaminar la lectura en pantalla. Hoy hay
un hueco concreto: `detectChord` registra su resultado en el log con la etiqueta MATH
(`index.html:441`), pero `classifyChordRelation`, que puebla el panel Análisis de Armonía y es
donde vivirá el grado romano de la Fase 3, no registra nada, se muestra solo en pantalla. La
salida del motor que más importa para validar el núcleo armónico es la única invisible al log.

**Decisión:** cuatro reglas.

1. Toda salida del motor emite al log, etiquetada, cada vez que se calcula, sin importar si se
   muestra en pantalla ni dónde. Hoy `detectChord` lo hace, `classifyChordRelation` no; esa
   asimetría se cierra.

2. El log es el canal canónico de validación. Una fase se valida por tres vías a la vez: los
   fixtures verdes desde los archivos, una sesión humana en Chrome, y el log capturando qué
   decidió el motor para que la sesión sea auditable después. Cuando la sesión no puede
   mostrarlo, porque la UI ocultó o reencaminó la lectura, el log es la única verdad visible.

3. Cada fase, al implementarse, emite al log etiquetado lo que esa fase agrega. Cuando la Fase
   3 agregue el grado romano derivado, ese número se registra; cuando la Fase 4 agregue la
   función tonal, se registra. Es criterio de aceptación permanente, y el ROADMAP lo referencia
   por fase.

4. La obligación del log es independiente de la decisión de display. Se oculte el panel, se
   borre de la vista, o se reencamine a otra superficie de feedback, la salida del motor sigue
   yendo al log.

**Razón:** el borde MIDI no se testea solo y el rediseño puede cegar la validación visible; el
log es el único lugar donde "qué decidió el motor" siempre se recupera.

**Consecuencia:** cerrar el hueco actual, que `classifyChordRelation` registre su resultado, es
código y queda fuera del alcance de esta entrada doc-only. Va con la Fase 3, que extiende justo
ese camino con el grado romano: al agregar el número se agrega también el `SysLog`, y se cierra
el hueco nuevo y el viejo de una. Esta entrada refina el trato que el protocolo de
clasificación del 2026-07-25 le da a la consola de debug: el log no es solo una superficie
oculta, es el canal canónico de validación. Y extiende la refinación del contrato del
2026-07-25: la salida del motor la consume cualquier superficie, y además siempre el log.

**Estado:** vigente.

---

## 2026-07-25 — Refinación del modelo: el readout es un widget que presenta, la ranura es un límite y no un espacio, el menú coloca

**Contexto:** al dibujar el modelo completo quedaron tres cosas por precisar. Si la salida del
motor puede vivir en un widget movible o solo en superficies fijas. Qué es exactamente una
ranura. Y de dónde se colocan los widgets. Ninguna reabre el motor ni contradice el contrato;
las tres afinan vocabulario y mecánica.

**Decisión:** cinco puntos.

1. La salida del motor se puede presentar en un widget. El motor calcula y escribe en el buffer;
   un widget que la muestra solo lee lo que el buffer ya tiene, no recalcula ni guarda copia
   propia. Presentar no es hardcodear, así que el protocolo de clasificación sigue en pie: la
   salida del motor como dato vive en el buffer, está siempre disponible y no es característica.
   Lo que se agrega es que un widget de presentación de esa salida, el readout de notas activas,
   acorde y análisis, es un widget como cualquiera: se mueve tipo picture in picture, se le baja
   la opacidad, se cierra, y ocupa una ranura contando contra el límite. Cerrar ese widget no
   borra el dato: sigue en el buffer y en el log. Así se cierra la tensión aparente entre "la
   salida del motor no se cierra", que habla del dato, y "el readout es un widget", que habla de
   su presentación. Esto extiende la refinación del contrato del 2026-07-25: si cualquier
   superficie consume el buffer, un widget movible que lo presenta es una superficie más, y
   precisa el "darle panel propio sería hardcodearlo" del protocolo: hardcodear sería un panel
   que recalcula; uno que solo presenta lo que el buffer ya tiene, no.

2. La ranura es un límite, no un espacio. No hay tres cajas fijas en la pantalla. Hay un límite
   de tres widgets abiertos a la vez entre los que compiten, ubicados libremente, movibles, como
   el HUD configurable de un simulador de manejo, el HUD custom de Assetto Corsa es el ejemplo
   que lo inspiró: cada overlay se pone donde uno quiera, se mueve, opacidad, se apaga, y la
   misma información se puede repetir en más de una posición, algo que la regla 5 del ADR del
   2026-07-24 ya permitía. Solo los widgets que compiten cuentan contra el límite de tres. El
   número puede afinarse, el límite no se elimina, por la razón de siempre: que los widgets no
   tapen las notas que caen del fondo. Esto precisa la regla 3 del ADR del 2026-07-24, que
   nombraba "ranuras" y se leía como espacios; son un cupo, no una grilla.

3. El menú es el colocador. El panel de pestañas, la barra tipo macOS decidida el 2026-07-25, es
   de donde se abre, se cierra, se restaura y se manda a una ranura cualquier widget, sea de
   característica o de sistema. Ahí viven también las opciones y el log. El log no tiene terminal
   propia: solo se descarga o se copia al portapapeles.

4. Widget de sistema. Se nombra la clase que el modelo ya distinguía sin nombre: un widget sin
   contenido intercambiable ni vista alterna, propio del sistema, no una característica que el
   usuario elija. La guía de interfaz, los subtítulos del entrenamiento, el feedback del sistema
   y el readout de la salida del motor son widgets de sistema. Se mueven, se apagan, opacidad y
   reset como cualquier widget; lo que los separa de las características es que no traen contenido
   intercambiable. Esto refina el glosario del 2026-07-25.

5. El feedback también trae avisos del sistema. La superficie de feedback, además del veredicto
   nota por nota, muestra avisos simples del sistema: que las ranuras están completas, o que un
   widget quedó oculto y se puede restaurar, sea de característica o de sistema. Vale aun cuando
   el feedback esté en modo veredicto.

**Razón:** sin estos cinco puntos, "widget", "ranura" y "salida del motor" se rediscuten cada
vez que se dibuja la UI. Cierran el vocabulario del modelo de capas sin tocar el motor.

**Consecuencia:** el protocolo, el glosario y el ADR quedan refinados, no reescritos. "Widget"
incluye ahora a los de presentación de la salida del motor; "ranura" se lee como límite y no
como espacio; "widget de sistema" nombra a los paneles que no compiten. El motor y el contrato
siguen intactos: todo widget lee del buffer, nada recalcula ni hardcodea.

**Estado:** vigente.

---

## 2026-07-25 — Precisiones del modelo de widgets: posición por defecto, categoría única por origen, y el cap cuenta solo a los que compiten

**Contexto:** al ver el modelo final quedaron tres precisiones. Si con el cap de tres cada widget
tiene igual una posición por defecto. Si un widget que viene de serie es de otra clase que uno
que se agregue después o que traiga un entrenamiento. Y cuántos de los widgets planeados cuentan
contra el cap.

**Decisión:** tres puntos.

1. Cada widget tiene una posición por defecto. El cap de tres limita cuántos compiten a la vez,
   no de dónde arrancan. Cada widget nace en un lugar por defecto y desde ahí se mueve, se
   persiste y se resetea. Coherente con la regla 6 del ADR del 2026-07-24, que abre la app bien
   puesta sin configurar.

2. Categoría única, no importa el origen. Un widget que viene de serie, uno que se agregue a
   futuro y uno que traiga un entrenamiento son el mismo tipo de objeto y se tratan igual; no hay
   una clase de fábrica aparte. Ata con la dirección parqueada de entrenamientos como datos: un
   entrenamiento que aporte un widget aporta un widget común, no una especie distinta. Lo que
   sigue distinguiendo un widget de otro es su contenido, característica o de sistema, y si
   compite o no por el cap, no de dónde salió.

3. El cap de tres cuenta solo a los que compiten. De los widgets planeados hoy son seis: tres
   compiten por el cap, la escala, las progresiones y el readout de la salida del motor; y tres
   no cuentan contra el cap, los subtítulos, el feedback y la guía, que tienen lugar propio pero
   igual se mueven, se apagan, opacidad y reset como cualquiera. El total puede crecer con
   widgets futuros o de entrenamiento; el cap de tres competidores no cambia, por la razón de
   siempre, que no tapen las notas del fondo. Precisa el "solo los widgets que compiten cuentan
   contra el límite" de la refinación anterior.

**Razón:** sin estas tres precisiones, la posición por defecto, el origen de un widget y cuántos
cuentan se rediscuten cada vez. Cierran el modelo de widgets.

**Consecuencia:** refina la refinación del modelo del 2026-07-25 sin tocar el motor. Los widgets
de sistema con lugar propio, subtítulos, feedback y guía, quedan explícitamente movibles y fuera
del cap.

**Estado:** vigente.

---

## 2026-07-26 — Una pestaña por widget: los controles viven en la pestaña, arrastrar es la única acción directa sobre la caja

**Contexto:** faltaba resolver dónde viven los controles de un widget. Dos caminos. Una barrita
de título sobre cada caja, con sus opciones ahí. O la barra de pestañas que el modelo ya preveía,
una pestaña por widget, como un navegador. Y una pregunta atada: si el control de un widget es su
pestaña y lo cerrás, desde dónde lo restaurás, si su pestaña ya no está.

**Decisión:** el modelo de pestaña por widget. Cinco puntos.

1. Cada widget que se coloca, lo ponga el usuario o un entrenamiento, abre su propia pestaña en la
   barra tipo macOS, como una pestaña de navegador. Una pestaña por widget. Refuerza la categoría
   única por origen: un widget de entrenamiento abre pestaña igual que uno que ponés vos, sin clase
   de fábrica aparte.

2. Los controles de un widget viven en el menú que despliega su pestaña. Nada de chrome sobre la
   caja. El fondo y las cajas quedan limpios, que es lo que protege las notas del teclado que están
   detrás.

3. La única acción directa sobre la caja es moverla con el mouse, arrastrando. Todo lo demás,
   opacidad, apagar, cambiar de vista como la escala de lineal a rueda, sale de la pestaña, no de
   la caja.

4. La barra tiene dos cosas distintas, como un navegador. Una pestaña por cada widget abierto. Y un
   menú colocador que lista todos, abiertos y cerrados, para traer de vuelta uno oculto. Cerrar un
   widget se lleva su pestaña, así que restaurarlo es desde el colocador, no desde la pestaña que
   ya no existe. Es pestaña abierta contra nueva pestaña.

5. Los widgets de sistema, subtítulos, feedback y guía, también abren pestaña, porque también se
   mueven, opacidad y se cierran. Uniforme con el resto. La barra llega hasta seis pestañas más los
   menús globales, como un navegador con seis pestañas, manejable.

**Razón:** un solo lugar y una sola forma de encontrar los controles de cualquier widget, su
pestaña, sin cazar un engranaje distinto en cada caja. Un widget a baja opacidad o medio salido de
pantalla se controla igual, porque su pestaña está entera en la barra aunque la caja no se alcance.
Y resuelve la pregunta del cierre sin vueltas.

**Consecuencia:** desarrolla el "panel de pestañas" de la refinación del modelo del 2026-07-25, que
hasta ahora solo alojaba las opciones globales y el log; ahora aloja además una pestaña por widget.
Ubica el cambio de la escala de lineal a rueda en la pestaña de ese widget, no en la caja. Y deja
una tensión anotada para cuando aparezca: hoy todos los widgets planeados son superficies de
lectura, el readout, los subtítulos, el feedback, la guía, la escala mostrando notas, se miran y no
se clickean por dentro, así que arrastrar la caja entera para moverla funciona sin conflicto. El
día que una característica tenga contenido clickeable adentro, va a hacer falta una zona de agarre
para distinguir mover de tocar, como la barra de título de una pestaña de navegador. No se decide
acá; queda escrito que ahí aparece.

**Estado:** vigente.

---

## 2026-07-30 — Arquitectura destino: el motor como API y los widgets como única superficie que crece

**Contexto:** el repo documenta el estado actual en `ARCHITECTURE.md` y el porqué de cada decisión
acá, pero en ningún archivo está escrito hacia dónde va la arquitectura, ni por qué existe el
modelo de widgets. Eso vivía solo en conversación, que es donde se pierde.

**Decisión:** se fija la arquitectura destino, que es el norte al que apuntan las fases, no una
fase en sí.

El destino es que el motor quede terminado y estable, y que a partir de ahí lo único que crezca
sean widgets que lo consumen como una API. Agregar una característica nueva no debe requerir tocar
el motor ni rehacer la capa visual. Si para sumar algo hay que abrir `src/engine.js`, o hay que
reacomodar la pantalla entera, el destino no se alcanzó todavía.

Los widgets de la primera serie funcionan además como referencia. Son dos ejemplos visuales que
fijan cómo se consume el motor y cómo se comporta un widget, para que los que vengan después se
escriban copiando el patrón en vez de inventándolo cada vez. Por eso importa que esos dos primeros
queden bien: no son solo dos características, son la plantilla de todas las siguientes.

Esa extensibilidad depende de un contrato explícito, y el contrato tiene tres partes: qué puede
leer un widget, qué puede escribir hacia afuera, y qué no puede hacer nunca, empezando por
recalcular lo que el motor ya deriva. El contrato todavía no está escrito. La pregunta abierta ya
está registrada como "Nota: pregunta abierta, el contrato de salida" en la Fase 9 del ROADMAP, y
ese es el lugar donde se resuelve, con la primera característica real en la mano.

La misma regla vale para los entrenamientos. Un entrenamiento es datos. Puede traer o no un
widget, y puede proponer cambios de disposición pidiendo permiso, pero no es una vía para
modificar el motor. Un entrenamiento que necesite que el motor calcule algo nuevo es un pedido al
motor, no una excepción del entrenamiento.

La meta lejana que ordena todo esto es concreta: cargar archivos MIDI, y entrenamientos del
sistema o propios definidos como datos, sin que ninguno de los dos obligue a abrir el motor.

**Razón:** sin esta arquitectura destino escrita, cada sesión rediscute por qué existe el modelo de
widgets, y el modelo se lee como una preferencia estética en vez de lo que es, la condición para
que la app crezca sin reescribirse. Es también la respuesta concreta a la V3.0 que el ADR del
2026-07-24 cita como riesgo, crecer a miles de líneas de features apiladas sin modelo y tener que
reescribir todo de una.

**Consecuencia:** refuerza la regla 4 del ADR del 2026-07-24, el motor como única fuente de verdad
musical, dándole un objetivo además de una prohibición. No cambia ninguna fase ni ningún estado. Y
deja explícito que el contrato pendiente de la Fase 9 no es un detalle tardío, es la pieza que
habilita el destino: sin contrato, cada widget nuevo negocia sus permisos de cero y el motor se
vuelve a abrir.

**Estado:** vigente.

---

## 2026-07-30 — Presupuesto de superposición: las notas conservan todo el alto, los widgets cubren hasta tres octavos

**Contexto:** faltaba el número. Estaba escrito que el fondo se reserva para las notas y que la
ranura es un límite y no un espacio, pero nada decía cuánto de ese aire puede taparlo un widget.
Con eso, tres widgets grandes podían dejar la reserva en nada sin violar ninguna regla escrita.

**Decisión:** la zona de las notas es toda la altura entre el borde inferior de la barra de menú y
el borde superior del piano. No se parte ni se le resta: es la altura completa.

Los widgets no ocupan una banda que le quite alto a esa zona. Flotan encima, en una capa superior,
y las notas pasan por detrás. Eso es lo que significa que se muevan como una imagen dentro de otra.

La cobertura sí tiene tope: los widgets no tapan más de tres octavos del alto de esa zona. Ese es
el presupuesto de superposición, y es el número que faltaba. En ancho, cada widget no pasa de dos
octavos del ancho de la pantalla, así que los tres suman como máximo seis octavos y quedan dos
octavos de aire repartidos entre ellos y los bordes. Sirve para dos cosas: impide widgets gigantes,
y deja aire lateral para que se lean como piezas separadas y no como una sola barra.

Cuando las notas importan, lo único que se ajusta es la opacidad de los widgets. No se corren ni se
encogen solos.

La posición es libre y la cobertura es lo acotado. Un widget se arrastra a donde el usuario quiera
dentro de la pantalla; lo que no se negocia es el tope de cobertura. El motivo es funcional y no
estético: si una canción usa solo un registro angosto del teclado, hay que poder despejar esa
franja moviendo el widget que estorba, o directamente no abrirlo. Intercambiar dos widgets de lugar
no es una operación aparte: con posición libre, es mover los dos.

Los seis paneles se mueven, los tres que compiten por el cap y los tres de sistema, y los puede
mover tanto el usuario como un entrenamiento cargado. Posiciones por defecto: los subtítulos del
entrenamiento centrados, y el feedback del sistema centrado debajo de ellos.

**Razón:** sin un tope de cobertura, la reserva del fondo era una intención sin número y cualquier
layout la podía anular. Con el tope, la regla 3 del ADR del 2026-07-24 queda intacta y además
verificable.

**Consecuencia:** refina la entrada del 2026-07-25 sobre la ranura como límite y no como espacio.
Sigue sin haber cajas dibujadas ni posiciones fijas, pero ahora hay un presupuesto: libre en
posición, acotado en cobertura. Y queda escrito que el alto se le está reservando a un motor de
notas que todavía no existe, que es una apuesta consciente.

**Estado:** vigente.

---

## 2026-07-30 — Un solo menú de widgets en vez de una pestaña por widget, y estado por instancia

**Contexto:** la entrada del 2026-07-26 resolvió que cada widget colocado abriera su propia pestaña
en la barra. Al mirar dos cosas juntas, esa solución se cae. La regla 5 del ADR del 2026-07-24 ya
permite que una misma característica ocupe hasta las tres ranuras a la vez, así que puede haber tres
ruedas de quintas abiertas y "una pestaña por widget" se vuelve "una pestaña por instancia", con
tres pestañas que dicen lo mismo. Y la regla 6 abre la app con la escala, el feedback, los
subtítulos y la guía, así que la barra arrancaría con cuatro o cinco pestañas antes de que el
usuario toque nada, lo contrario de presentarle lo mínimo.

**Decisión:** la barra tiene un único menú de widgets. Desde ahí se coloca, se restaura uno cerrado,
y se accede a los controles de cada instancia colocada. No hay una pestaña por widget.

Los controles siguen fuera de la caja. La caja no lleva chrome encima, y arrastrar sigue siendo la
única acción directa sobre ella. Eso no cambia.

El menú lista instancias, no tipos. Si hay tres ruedas de quintas colocadas, aparecen las tres por
separado. Cada instancia guarda su propio estado: ubicación, vista elegida, opacidad y sus
opciones. El reset es por instancia, no por tipo. Dos ruedas comparten código y no comparten estado.

Cuesta un nivel más de profundidad que una pestaña, y entra dentro del techo de tres clics que la
Fase 5 ya fija.

**Razón:** un solo lugar donde están los controles de todo, que no se multiplica cuando se abren
varias instancias de lo mismo, y que deja la barra igual de corta con seis widgets que con uno. Es
también el patrón del HUD configurable que inspiró el modelo: lo esencial visible por defecto, y lo
demás se agrega entrando a un menú, no teniéndolo siempre delante.

**Consecuencia:** supera la entrada del 2026-07-26 en dos puntos, el de la pestaña por widget y el
del menú colocador aparte, que ahora son el mismo menú. Todo lo demás de esa entrada sigue vigente:
controles fuera de la caja, arrastrar como única acción directa, y la tensión anotada de que un
widget con contenido clickeable necesitará una zona de agarre. Mueve además trabajo de incremento:
el menú de widgets se construye en el 5.3, con el sistema de widgets que va a listar, no en el 5.2.

**Estado:** vigente.

---

## 2026-07-30 — Estándar espacial de los widgets: franja de nacimiento, tamaño y separación uniformes

**Contexto:** el presupuesto de superposición fijó cuánto pueden tapar los widgets, pero no dónde
ni con qué forma. Con los overlays arriba por defecto y las notas naciendo arriba, una nota
aparecería ya tapada, que es lo contrario de lo que se busca.

**Decisión:** debajo de la barra de menús queda una franja de nacimiento que ningún widget ocupa,
para que toda nota que cae sea visible cuando aparece. Los widgets tapan tramo medio, nunca el
nacimiento.

La oclusión parcial es una señal, no un defecto. Ver una nota y perderla detrás de un widget le
dice al usuario que ahí viene algo puntual, y que si le importa, mueva el widget. Los widgets
comparten el espacio con las notas de la forma menos intrusiva posible; no compiten por él.

Tamaño y separación uniformes. Un widget nace con el mismo tamaño y la misma separación que los
demás, aunque su contenido sea distinto. Es lo que hace que se lean como piezas de un mismo
sistema, por proximidad y alineación, en vez de como recortes sueltos. Si un contenido no entra en
ese molde, el problema es el contenido y no el molde. La rueda de quintas va a ser la primera
prueba real de si el molde aguanta.

La guía nace debajo del widget de la derecha. Ocupa más espacio del que le correspondería, y se
acepta porque es temporal: existe mientras el usuario aprende los controles de cada widget.

**Razón:** sin una regla de dónde, el presupuesto de cuánto no alcanza, y el atisbo de la nota
queda librado a la suerte de dónde arrastró el usuario cada caja.

**Consecuencia:** refina el presupuesto de superposición de la misma fecha. Las posiciones por
defecto que dejó el incremento 5.1 no cumplen la franja de nacimiento, así que ajustarlas es
trabajo del incremento en el que los widgets ganen posición, no una corrección de emergencia.

**Estado:** vigente.

---

## 2026-08-01 — Nacimiento discreto y movimiento libre: puntos de nacimiento, límites del área y qué cuenta contra el presupuesto

**Contexto:** quedaba sin precisar de dónde nace un widget, hasta dónde se puede mover, y si las
cajas de sistema consumen el mismo presupuesto de cobertura que los widgets que compiten por el cap.

**Decisión:** siete puntos.

1. Tres puntos de nacimiento, no tres secciones. Un widget nace en uno de tres puntos por defecto y
   el reset lo devuelve ahí. No son celdas, ni cajas, ni zonas reservadas: son coordenadas de
   arranque. Esto precisa la entrada del 2026-07-25 sobre la ranura como límite y no como espacio:
   sigue sin haber cajas dibujadas ni secciones en la pantalla, y ahora queda dicho que sí hay
   posiciones de nacimiento.

2. El movimiento es absolutamente libre. Un widget se arrastra a cualquier parte del área
   permitida, y dos widgets pueden intercambiar lugar sin que eso sea una operación aparte. El
   sistema identifica cada widget por identidad y no por dónde está parado, así que puede quedar el
   del centro a la izquierda y el de la izquierda al centro sin que nada se confunda.

3. El nacimiento es discreto aunque el movimiento sea libre, y esa mezcla no es una contradicción,
   es la que enseña la regla. Si los widgets nacen espaciados y con el mismo tamaño, el usuario
   deduce solo que hay tres lugares y que el límite es tres, sin que haya que dibujar nada ni
   explicárselo.

4. Límites del área de movimiento. El piano es el límite de abajo y no se invade. La barra de menús
   es el límite de arriba. Ese segundo límite queda anotado como discutible: si más adelante conviene
   que un widget pueda solaparse con la barra, se decide entonces.

5. Qué cuenta contra el presupuesto de superposición. El tope de tres octavos del alto de la zona de
   notas aplica a los widgets que compiten por el cap. Las cajas de sistema, subtítulos, feedback y
   guía, quedan fuera de ese tope, con su propia regla: son delgadas, y el usuario las cierra cuando
   quiere la pantalla limpia. La app mide y reporta las dos cifras por separado, la de los que
   compiten contra el tope y el total de todo lo que tapa, para que la diferencia quede a la vista y
   se pueda revisar. Esto precisa el presupuesto de superposición del 2026-07-30, que fijaba el tope
   sin decir a quiénes alcanzaba.

6. La guía es la excepción al molde uniforme. Crece en vertical para acomodar el texto que muestre,
   incluido el que cargue un entrenamiento. Estorba a propósito mientras el usuario aprende los
   controles, y es la primera caja que va a querer cerrar. Esto precisa el estándar espacial del
   2026-07-30, que fija tamaño uniforme para el resto.

7. Todo panel se puede cerrar, incluidos los de sistema. Cerrados todos, queda el piano de extremo a
   extremo y nada más. Cada cierre lo avisa el feedback, diciendo qué se cerró y que se restaura
   desde el menú, que es el aviso del sistema ya previsto. El feedback también se usa para avisos que
   valen la pena interrumpir, como que un entrenamiento terminó.

**Razón:** sin estas precisiones, "libre" y "por defecto" se leían como contradictorias, y no estaba
claro si una caja de sistema delgada consumía el mismo presupuesto que un widget entero.

**Consecuencia:** refina las tres entradas nombradas sin invalidarlas. El chasis del incremento 5.3,
arrastrar, reset y cerrar, se construye contra estas reglas.

**Estado:** vigente.

---

## 2026-08-09 — Los widgets flotan sobre el fondo entero: el piano y las notas son intocables por debajo, no por delante

**Contexto:** una entrada anterior fijó que el piano era el límite de abajo del área de movimiento.
Eso no era lo decidido. El fondo es el piano más las notas que caen, y los widgets siempre están por
encima de ese fondo, como una imagen dentro de otra. Con el piano de límite, media pantalla queda
vedada al arrastre sin que ninguna regla lo pida.

**Decisión:**

1. El área de movimiento de un widget es toda la ventana por debajo de la barra de menús. Un widget
   puede quedar sobre el piano y sobre la zona de notas, porque vive en una capa superior.
2. "Intocable" significa que el fondo no se reordena ni se recorta para hacerle lugar a un widget,
   no que un widget no pueda taparlo. El piano sigue fijo y a todo el ancho pase lo que pase.
3. La única zona vedada es la barra de menús, que se queda arriba y no se solapa. Queda anotada como
   idea sin decidir la de que la barra se oculte sola cuando no se usa, como una barra de tareas, y
   entonces esa veda desaparecería.
4. El tope de cobertura de tres octavos y la franja de nacimiento siguen vigentes: son reglas de
   dónde nacen y cuánto tapan por defecto, no un cerco al arrastre.

**Razón:** el tope de cobertura ya protege la lectura de las notas por defecto. Un cerco además del
tope le quita al usuario lo único que se le pide que haga, mover la caja que estorba.

**Consecuencia:** corrige el punto 4 de la entrada del 2026-08-01, que ponía el piano como límite. El
código de la segunda parte del incremento 5.3 implementó ese límite, así que queda deuda: el clamp
inferior debe levantarse hasta el borde de la ventana.

**Estado:** vigente.

---

## 2026-08-09 — Mapa de términos: qué se llamaba antes de una forma y ahora de otra

**Contexto:** los términos del proyecto se refinaron varias veces y este archivo es append-only, así
que las palabras viejas siguen escritas en entradas viejas y siguen siendo válidas en su fecha. Sin
un mapa, alguien que llega y busca una palabra encuentra dos sentidos y no sabe cuál manda.

**Decisión:** se registra el mapa de términos. Para cada uno, el nombre vigente, el nombre viejo y
qué cambió.

- **Widget.** Antes "característica" y también "panel". Es una caja de contenido intercambiable que
  se coloca, se mueve y presenta datos del buffer.
- **Widget de sistema.** Los subtítulos, el feedback y la guía. Se mueven y se cierran como
  cualquiera, pero no compiten por el cap de tres.
- **Ranura.** Empezó siendo una de tres posiciones donde vive algo, después pasó a ser un límite de
  cuántos widgets compiten a la vez y no un espacio, y finalmente el nacimiento se resolvió con tres
  puntos por defecto que son coordenadas de arranque y no celdas. El glosario del 2026-07-25
  conserva la definición vieja y está superada por esas dos entradas posteriores.
- **Barra de menús permanente.** Antes "panel de pestañas". Chrome permanente arriba con los menús
  globales. El modelo de una pestaña por widget fue reemplazado por un único menú de widgets.
- **Overlay.** Se usó como sinónimo de widget durante la primera parte del reencuadre. Hoy nombra
  solo el estado del incremento 5.1, paneles quietos en posición fija, y lo que se mueve se llama
  widget.
- **Universo.** En pantalla la etiqueta pasa a "Escala" en el incremento 5.4. Adentro del motor los
  nombres `universeType`, `universeRoot` y `universePitchesSet` se quedan a propósito, porque nombran
  el conjunto de notas permitidas, que no siempre es una escala de siete notas.
- **Salida del motor.** El dato que el motor deriva y deja en el buffer. Lo consume cualquier
  superficie, el teclado incluido. El readout es el widget que lo presenta, y presentar no es
  recalcular.
- **Tensión Legal.** Etiqueta de la leyenda que nombra un caso único, la sensible en universo menor.
  El incremento 5.4 la renombra.

**Razón:** sin este mapa hay que reconstruir la historia leyendo doce entradas en orden para saber
qué palabra manda hoy.

**Consecuencia:** cuando una entrada futura refine un término, agrega su línea acá. Este mapa es la
respuesta corta; las entradas fechadas siguen siendo la explicación larga.

**Estado:** vigente.

---

## 2026-08-09 — Las reglas de prosa viven escritas en el repo, con su método, y no en una dependencia externa

**Contexto:** la sección "Prosa" de `CLAUDE.md` nombraba dos skills de un plugin de terceros por
referencia. Esas rutas no resuelven hasta instalar el plugin por sesión, así que una sesión que no
lo instalaba se quedaba con tres reglas escritas literales de veinticuatro. El resultado se puede
medir: el guion largo, que sí estaba escrito, sobrevivió intacto, y `docs/DECISIONS.md` llegó a un
paralelismo contrastivo cada 419 palabras mientras las reglas se aplicaban de memoria. Ese archivo
es append-only, así que esa degradación ya no se puede revertir.

**Decisión:**

1. El mínimo para escribir acá vive escrito en `CLAUDE.md`, en cinco reglas propias, y no depende
   de instalar nada. Con el plugin instalado manda todo lo que el plugin dice; las cinco son el
   piso.
2. No se copia texto del plugin. No trae LICENSE y este repo es público, así que las reglas están
   redactadas de cero contra mediciones de esta prosa. La referencia al proyecto de origen queda
   como fuente.
3. Cada número que una regla declara viaja con el comando de shell que lo produce. Un número sin
   método no se puede recalcular, y entonces una sesión futura no sabe si mejoró o empeoró.
4. Una regla no manda borrar información. Un paréntesis en un encabezado que lleva el estado de
   verificación de la sección o un número se queda, porque sacarlo choca con "Honestidad de
   estado".
5. Los encabezados de `docs/ROADMAP.md` no se renombran por su cuenta. Ese archivo es del que un
   modelo saca qué hacer al ejecutar una fase, así que un encabezado ahí es un anclaje y se
   cambia junto con todo lo que lo cite.
6. No se declaran totales sobre el CHANGELOG. Todo PR le agrega una sección, así que un total
   queda viejo antes de mergear. Se declara lo que no crece solo, como la cantidad de viñetas
   históricas por encima del techo.

**Razón:** la documentación del proyecto tiene que sostener el contexto entera, aunque el chat
muera y aunque el plugin no esté. Un modelo que llega nuevo lee el repo y greps; si la regla vive
afuera, no la lee, y si el número no trae su comando, no lo puede comprobar.

**Consecuencia:** los números concretos viven en `CLAUDE.md`, que es editable, y no en esta
entrada, que es append-only y quedaría desactualizada sin poder corregirse. Acá vive por qué esas
reglas existen; allá, cuánto dan hoy.

**Estado:** vigente.

---

## 2026-08-09 — El umbral de las 1000 líneas se cruzó durante la Fase 5, y se atiende después de cerrarla

**Contexto:** `ARCHITECTURE.md` §7 fija desde el principio que si `index.html` pasa las 1000
líneas, el paso siguiente es modularizar con ES Modules nativos, sin framework. La misma sección
declaraba 573 líneas, un número de la v11.0 que nadie volvió a correr. Medido con `wc -l` el
2026-08-09: `index.html` tiene 1055 líneas y `src/engine.js` 249. El gatillo se cumplió en algún
punto de la Fase 5 y pasó desapercibido porque el documento seguía declarando el número viejo.

**Decisión:**

1. La modularización se hace, y se hace después de que la Fase 5 cierre con sus cinco incrementos.
   Frenar el trabajo visual a mitad de camino para partir el archivo dejaría las dos cosas por la
   mitad, y la Fase 5 todavía va a mover mucho de `index.html`.
2. Entra al `ROADMAP.md` como Fase 5B, entre la Fase 5 y la Fase 6. Se usa una letra y no un
   número para no correr la numeración de las seis fases siguientes, porque sus encabezados son
   anclajes de los que un modelo saca qué hacer al ejecutar una fase. Tampoco puede ser 5.5: ese
   nombre ya es el quinto incremento de la Fase 5.
3. El alcance es partir por la separación que `ARCHITECTURE.md` §2 ya documenta, `State`, `MIDI`,
   `UI` y `SysLog`, con `<script type="module">`, sin bundler y sin build step. La app tiene que
   seguir abriendo desde `file://`. La decisión del 2026-07-03 de no migrar a framework sigue
   vigente y esto la respeta: modularizar no es adoptar un framework.
4. Esto es una excepción de método tomada a conciencia. El repo no tiene escrito qué hacer cuando
   un umbral se dispara a mitad de otra fase, así que se resolvió caso por caso. Que esas reglas
   falten queda anotado en el BACKLOG, junto con las de promover un ítem del BACKLOG a fase y las
   de reabrir una fase cerrada.

**Razón:** el umbral es una regla escrita del propio repo y llevaba tiempo incumplida sin que
nadie lo supiera. Ignorarla porque incomoda sería peor que la deuda técnica: dejaría demostrado
que un número escrito acá no obliga a nada.

**Consecuencia:** `ARCHITECTURE.md` §7 pierde los conteos viejos y gana el comando que los
recalcula, más un párrafo que dice que el umbral se cruzó y que se borra cuando la 5B cierre. La
regla 6 de "Prosa" en `CLAUDE.md` sale de acá: un número que describe el código va con el comando
que lo produce, o no va.

**Estado:** vigente.

---

## 2026-08-09 — Dónde vive la leyenda de colores: el teclado da el veredicto y la guía da la explicación

**Contexto:** el `ROADMAP.md` tenía anotado como deuda que la leyenda de colores no tiene hogar
escrito, y que se decide cuando la guía se construya. La guía se construyó en la tercera parte del
incremento 5.3, así que la pregunta ya se puede cerrar.

**Decisión:**

1. Hay dos espacios de feedback al usuario y cada uno tiene un trabajo distinto. El teclado
   coloreable da el veredicto nota por nota, con color, sobre la tecla que se tocó. Los subtítulos
   dan lo que el color no alcanza: lo que no entra en las seis categorías, y lo que necesita ser
   descriptivo en vez de categórico.
2. La leyenda que explica qué significa cada color vive en la guía. La guía es donde vive la
   explicación de las funciones y de lo que se ve en pantalla, así que la leyenda es su primer
   contenido real.
3. La mudanza física de la leyenda es trabajo del incremento 5.4. Esta entrada decide dónde va, no
   la mueve.
4. Consecuencia asumida: la guía se cierra como cualquier otra caja, así que el usuario puede
   cerrar la explicación de los colores. Es coherente con que toda caja se pueda cerrar y con que
   el feedback avise cómo restaurarla, y se prefiere eso a hacer de la guía una excepción más.

**Razón:** las seis categorías de color son un vocabulario cerrado y la leyenda es su diccionario.
Un diccionario vive con la explicación, no pegado al instrumento. Dejarla al pie del teclado la
mantiene visible a costa de ocupar alto del fondo de forma permanente, y ese alto es el que el
presupuesto de superposición protege.

**Corrección de una atribución:** la deuda del `ROADMAP.md` decía que el incremento 5.1 dejaba la
leyenda asociada al teclado dentro del fondo. Esa atribución no resuelve contra ningún texto: el
Alcance del incremento 5.1 no nombra la leyenda. Lo que sí existe es `ARCHITECTURE.md` §5.1, que
describe dónde vive hoy, como hecho verificado y no como decisión. La confusión fue entre un número
de sección y un número de incremento. Así que esta entrada no supera una decisión anterior: decide
algo que nunca se había decidido.

**Estado:** vigente.

---

## 2026-08-09 — Dónde nace la guía, y los dos únicos sinónimos que valen

**Contexto:** el mapa de términos del 2026-08-09 registra qué palabra manda hoy para cada cosa. Es
append-only, así que se amplía desde afuera con entradas nuevas y no editándolo. Faltan dos
precisiones que la tercera parte del incremento 5.3 dejó en el código sin registrar en la prosa.

**Decisión:**

1. La guía nace en la columna derecha de la ventana, bajo el tercer punto de nacimiento. Su
   excepción al molde uniforme ya estaba escrita en la entrada del 2026-08-01, que la deja crecer
   en vertical en vez de recortar su texto. Lo que se agrega acá es solo dónde nace.
2. Quedan declarados válidos dos sinónimos, y solo estos dos. "Los tres del sistema" nombra a los
   subtítulos, el feedback y la guía. "Los tres intercambiables del cap" nombra a los que compiten
   por el cap de tres.
3. Un sinónimo es válido únicamente si el mapa de términos lo registra. Cualquier otra forma de
   nombrar a un grupo de cajas no se usa en la documentación de este repo.

**Razón:** los dos grupos se nombraban con perífrasis distintas en cada documento, y una perífrasis
que cambia de forma en cada uso obliga a releer para saber si habla de lo mismo. Dos nombres fijos
cuestan menos que seis variantes. La regla del punto 3 es lo que evita que la lista vuelva a
crecer sola.

**Consecuencia:** amplía el mapa de términos del 2026-08-09 sin tocarlo. Una entrada futura que
refine un término agrega su línea de la misma forma.

**Estado:** vigente.

---

## 2026-08-10 — Dueño de superficie: cerrar el widget apaga su efecto

**Contexto:** el teclado pinta seis categorías de color y ninguna tenía autor declarado. Con los
widgets ya cerrables desde la tercera parte del incremento 5.3, la pregunta se volvió concreta: si
el usuario cierra el widget que produce un color, el color no debería seguir apareciendo solo.

**Decisión:** toda superficie de salida tiene un widget dueño, y cerrar el dueño apaga su efecto.
El reparto de las seis categorías del teclado, con los colores que `ARCHITECTURE.md` §5.1 verificó:

| Categoría | Color | Dueño |
|---|---|---|
| Escala | `#bae6fd` | widget de escala |
| Acorde | `#f59e0b` | widget de salida del motor |
| Correcto | `#22c55e` | widget de salida del motor |
| Tensión Legal | `#f97316` | widget de salida del motor |
| Paso Cromático | `#a855f7` | widget de salida del motor |
| Error | `#ef4444` | widget de salida del motor |

La guía es donde el usuario averigua quién produce cada efecto y contra quién compite. Esa es la
razón de fondo por la que la leyenda vive ahí y no debajo del teclado.

**Regla de comunicación entre widgets:** los widgets no se hablan entre sí. Un dato tiene un autor
y muchos lectores. El widget de escala es el editor de la escala, no su dueño: el motor la lee del
estado compartido y la sigue leyendo con ese widget cerrado. La cuenta que sostiene la regla: con
widgets que se hablan de a pares, cada widget nuevo tiene que conocer a todos los anteriores y el
número de canales crece con el cuadrado. Con estado compartido y un autor por dato, un widget nuevo
no conoce a ninguno.

**Refinación, no corrección:** la frase de `ROADMAP.md` que dice que el teclado consume el buffer
aparte, coloreando sus teclas como cualquier otro consumidor, queda refinada. El teclado pinta por
delegación de los widgets, no por voluntad propia. La frase no era falsa, era incompleta.

**Distinción explícita:** esto no es el ítem de backlog "Apagar los efectos del fondo", que es un
interruptor de display a elección del usuario y sigue en backlog. Acá el color no se apaga, deja de
existir porque su autor no está en pantalla. Es propiedad, no preferencia. La misma distinción vale
contra la frase del Alcance de la Fase 5 que dice que el coloreo no se apaga: esa frase habla de un
interruptor global, y su propia razón, que el coloreo existe porque los widgets planeados dependen
de él, es la que sostiene que el coloreo siga a los widgets.

**Esta entrada no trae cambio de código.** Lo que obedece hoy es la documentación. Hacer que
`renderKeyboard` obedezca el reparto está en el BACKLOG del `ROADMAP.md`.

**Estado:** vigente.

---

## 2026-08-10 — Lienzo de referencia y modelo de capas

**Contexto:** las medidas de la interfaz mezclan píxeles con unidades `vw`, y ningún archivo dice
contra qué tamaño de ventana se escribieron. Tampoco estaba escrito el modelo de capas, aunque el
código lo implementa desde el incremento 5.1.

**Decisión:** se diseña sobre un lienzo de 1280 x 720. La app calcula
`escala = min(anchoVentana / 1280, altoVentana / 720)` y escala el contenido entero por ese factor
único. Lo que sobra queda en negro, arriba y abajo o a los lados, como un archivo de video con otra
relación de aspecto. No hay comportamiento responsive: ningún elemento se reacomoda, se reordena ni
cambia de tamaño relativo al escalar. Todo mantiene sus proporciones.

**Razón:** con lienzo estático hay un solo número que cambia con la ventana. Con comportamiento
responsive, cada medida escrita pasa a ser condicional y cada regla nueva tiene que declarar qué
hace en cada rango. La v11.0 que este proyecto reconstruye reemplazó a una v11.5 que era una
interfaz responsive líquida, según la entrada del 2026-07-03 "Base de reconstrucción: v11.0, no
v11.5". Ese precedente es el que se está evitando.

**Por qué 1280 x 720:** es la resolución 16:9 más chica de uso corriente, así que es el caso peor de
legibilidad y todo lo demás escala hacia arriba. La aritmética que sostiene la elección: las 52
teclas blancas del teclado que la documentación fija reparten 1280 en 24.6 px de lienzo por tecla,
y a 1920 de ancho real eso son 36.9 px. `buildKeyboard` ya tiene la constante `W_WIDTH` fija en 36.
O sea que el teclado ya estaba dimensionado para 1080p sin que nadie lo hubiera decidido. Este
párrafo usa ese número como evidencia y no abre la deuda del rango del teclado, que sigue como
está.

**Modelo de capas**, que hasta hoy no estaba escrito en ningún archivo:

- **Capa 0, fondo.** El teclado y la grilla de notas que caen. Están en el mismo plano y se alinean
  1 a 1: cada columna de la grilla cae sobre su tecla, y por eso el teclado tiene que llegar de
  borde a borde. Nada más vive en esta capa, y en particular ningún control interactivo.
- **Capa 1, widgets.** Los que compiten por el cap y los de sistema. Flotan sobre la capa 0 y las
  notas pasan por detrás.
- **Capa 2, chrome.** La barra de menús permanente, siempre arriba, única zona vedada al movimiento
  de widgets.

**Consecuencia:** la leyenda de colores no puede vivir en la capa 0 debajo del teclado, porque esa
capa es solo teclado y grilla. Su hogar es la guía, que es capa 1.

**Alcance:** esta entrada fija la base y la fórmula. No decide el alto del teclado, que se elige
mirando un boceto, y no migra las medidas existentes. Esa migración es el incremento 5.6 y no trae
código en este PR.

**Estado:** vigente.

---

## 2026-08-10 — Jerarquía de menús: el tres es techo y también es piso

**Contexto:** el `ROADMAP.md` fija dentro del incremento 5.2 un techo de tres clics para todo lo que
alguien use mientras toca, y en el mismo ítem declara una desviación consciente: el log quedó
alcanzable porque la barra tenía un solo nivel y no había nada detrás de lo cual esconderlo. La
barra ya creció: hoy tiene Opciones y Widgets.

**Decisión:** la barra tiene tres entradas en el primer nivel, `Opciones`, `Widgets` y `Ayuda`, y
las tres dejan su contenido a dos clics. El log de desarrollo cuelga de
`Ayuda > Acerca de > Desarrollo`, o sea a cuatro clics. `Ayuda` todavía no existe en el código: esta
entrada decide el destino, no describe el presente.

**El número tres funciona de las dos formas**, y eso es lo que hace la regla útil. Es techo para
todo lo que alguien use mientras toca. Y es piso para lo que no debería encontrar quien solo quiere
tocar: el log no está oculto porque esté escondido, está oculto porque cuesta más de tres clics.
Con esto se cierra la desviación que el propio ROADMAP declaró.

**Por qué `Ayuda` y no `Opciones` para colgar `Acerca de`:** `Opciones` es lo que se toca mientras
se toca y está sujeto al techo. Meterle un submenú de dos niveles lo vuelve un menú de profundidad
mixta, donde el usuario no sabe si lo que busca está a dos clics o a cuatro.

**Decisión emparejada:** el hogar del control de split es el widget de salida del motor y no el menú
de Opciones, porque quien consume ese valor es el motor. La mudanza es trabajo futuro.

**Estado:** vigente.

---

## 2026-08-10 — Criterio de entrada de un ítem parqueado a una fase en curso

**Contexto:** la Fase 5 ya se reabrió una vez, según su propia nota de reapertura del 2026-07-25, y
el backlog creció durante su ejecución. El `ROADMAP.md` tiene anotado como hueco que no existe
criterio escrito para promover un ítem a fase, y este es el primero de esos huecos que se cierra.

**Decisión:** un ítem parqueado entra a una fase en curso solo si dejarlo afuera hace imposible
ejecutar un incremento pendiente, o si obliga a rehacer trabajo ya entregado. Todo lo demás se queda
donde está, aunque sea buena idea y aunque el momento parezca oportuno.

**Razón:** sin criterio, cada idea que aparece a mitad de fase parece obligatoria, y una fase que
absorbe todo lo que se le cruza no cierra nunca.

**Aplicación inmediata:** entran al alcance de la Fase 5 dos ítems que ya estaban escritos en la
sección "Deuda de método y documentación" del `ROADMAP.md`, "Nomenclatura de lo que ya existe" y
"Glosario vivo en vez de glosario congelado". Los dos porque el incremento 5.4 renombra cosas, y no
se puede renombrar lo que ningún documento nombra ni fijar un nombre en un archivo que no se puede
editar.

No entran: barra de menús auto-ocultable, detección del rango MIDI real del dispositivo, glosario
in-app, widgets como motores adicionales, subtítulos parcialmente coloreables, apagar los efectos
del fondo.

**Tensión declarada en vez de disimulada:** este mismo PR le agrega a la Fase 5 el incremento 5.6,
la migración de medidas al lienzo. Por el criterio de arriba no habría entrado, porque no bloquea al
5.4 ni al 5.5. Entra igual por otra razón, que se dice acá para que quede a la vista: el lienzo es
una decisión de esta fase y dejar la migración afuera la volvería una decisión sin ejecución, que es
la forma exacta en que se perdió la v11.5. Si el autor prefiere moverla al BACKLOG o a la Fase 5B,
esta entrada es el lugar donde se ve qué se está negociando.

**Estado:** vigente.

---

## 2026-08-10 — La migración al lienzo sale de la Fase 5 y pasa a la Fase 5B

**Contexto:** la entrada de hoy "Criterio de entrada de un ítem parqueado a una fase en curso" fijó
que un ítem entra a una fase que ya arrancó solo si dejarlo afuera bloquea un incremento pendiente
o si obliga a rehacer trabajo entregado. En su propia sección de aplicación inmediata declaró en
voz alta que el incremento 5.6, la migración de medidas al lienzo, no cumplía ese criterio y entraba
igual. Esta entrada resuelve esa tensión en el otro sentido.

**Decisión:** la migración de las medidas al lienzo de referencia deja de ser el incremento 5.6 de
la Fase 5. Pasa a ser el primer trabajo declarado de la Fase 5B, la que modulariza `index.html` con
ES Modules nativos. La Fase 5 vuelve a cerrar con el incremento 5.5.

**Razón**, en tres partes:

1. El criterio de entrada tiene un PR de vida y su primera aplicación era una excepción a sí mismo.
   Una regla cuyo estreno es una excepción no gobierna después: la siguiente vez que alguien quiera
   meter algo a una fase en curso, el precedente que va a encontrar es el de saltearla.
2. El argumento de que dejarla afuera volvería al lienzo una decisión sin ejecución no se sostiene.
   La decisión queda escrita con su base, su fórmula y su razón, y tiene ejecución agendada, solo
   que en otra fase. Lo que se perdió con la v11.5 fue una implementación sin decisión escrita, o
   sea el caso opuesto.
3. La Fase 5B va a reescribir las mismas funciones que la migración tiene que tocar: las que
   calculan el área de arrastre, la zona de notas, los puntos de nacimiento y la cobertura, más el
   molde que hoy usa unidades `vw`. Dos pasadas separadas sobre el mismo código es trabajo doble.

**Qué queda superado:** de la entrada "Criterio de entrada de un ítem parqueado a una fase en curso"
queda superado solo el párrafo de tensión declarada, el que justificaba la entrada del 5.6 a la
Fase 5. El criterio en sí queda intacto y sin excepciones, que es justamente lo que esta entrada
busca. Las dos entradas que sí entraron a la Fase 5 por ese criterio, "Nomenclatura de lo que ya
existe" y "Glosario vivo en vez de glosario congelado", se quedan donde están: las dos cumplen la
prueba de bloquear al incremento 5.4.

**Consecuencia:** `ROADMAP.md` pierde el incremento 5.6 de la lista de la Fase 5, su línea de cierre
vuelve a nombrar al 5.5, y la Fase 5B suma la migración como primer trabajo declarado. La entrada
del lienzo del 2026-08-10 no se toca: sigue diciendo qué se decidió, y ahora la ejecución vive en
otra fase.

**Estado:** vigente.

---

## 2026-08-10 — Geometría del teclado de 88 teclas, y la barra no presenta lecturas

**Contexto:** el `ROADMAP.md` tenía dos puntos de deuda verificada sobre el teclado. Uno era
incumplimiento: el código dibujaba 61 teclas mientras la documentación fija 88 en cuatro lugares.
El otro era hueco: ningún archivo decía cuánto alto merece el teclado ni si va pegado al borde
inferior. Esta entrada cierra los dos y agrega una refinación al modelo de capas.

**Alto de la tecla blanca: 140 px de lienzo**, o sea el 19.4% de los 720 del lienzo de referencia
del 2026-08-10. El método fue mirar un boceto a 1280 x 720 con las 52 blancas reales. El rango que
se consideró aceptable fue de 120 a 160, y 140 es el punto medio. El alto se calcula con la fórmula
del lienzo aplicada a ese único número, así que la proporción diseñada se mantiene en cualquier
ventana. Eso no es la migración al lienzo, que es el primer trabajo declarado de la Fase 5B: es la
fórmula usada por adelantado para el único número que hoy la necesita.

**El techo real del alto del teclado son 236 px de lienzo, no un tercio de 720.** La cuenta: los
widgets que compiten cubren 170 px, que es el alto del molde, y el tope de tres octavos se alcanza
cuando la zona de notas baja a 453.3 px. Con la barra ocupando 30, la zona mide `690 - altoTeclado`,
así que el teclado no puede pasar de 236.7 sin romper el presupuesto. Un tercio de 720 son 240 y se
pasa. Para llegar a 240 tendría que ceder el molde o el cap.

**La negra va en 0.62 del ancho y del alto de la blanca, y sin nombre.** Con la blanca en 24.6 px
de lienzo, a 0.62 la negra mide 15.3 px y deja 9.4 px de blanco visible entre dos negras; a 0.80
ese blanco cae a 4.9 px y el teclado deja de leerse como teclado. Un piano real va en 0.58, así que
0.62 ya es generoso. Y en 15.3 px no entra ningún texto de tres caracteres legible: la negra
conserva su color y su símbolo de veredicto, que es la información que importa. Las blancas sí
llevan nombre, con el tamaño de fuente derivado del ancho de la tecla.

**El teclado va pegado al borde inferior y de borde a borde.** Sale de la capa 0 del modelo de
capas del 2026-08-10, que es solo teclado y grilla de notas alineados 1 a 1. La leyenda de colores
no es capa 0 y por eso se mudó adentro de la guía. El ancho de la blanca se deriva del ancho
disponible dividido las 52 blancas, sin medida fija y sin `transform: scale()`, que dibujaba más
chico sin achicar la caja de layout y dejaba una franja muerta debajo.

**El nacimiento de la guía cambia de lugar.** Nace anclada al borde derecho con 16 px de margen, y
a la mitad vertical de la zona de notas. Su `x` deja de derivarse del tercer punto de nacimiento.
Razón: alineada bajo la fila comunicaba que es parte de esa fila, y no lo es. La guía es algo que
se aprende y se apaga; los que compiten son la fila permanente. Esto supera la entrada del
2026-08-09 "Dónde nace la guía, y los dos únicos sinónimos que valen" en su parte de nacimiento.
Los dos sinónimos que esa entrada declara siguen vigentes.

**La barra de menús no presenta lecturas.** Refinación de la definición de capa 2: el chrome
contiene comandos, no salida del motor ni estado de widgets. Si la tonalidad activa tiene que
verse, la muestra el widget de salida del motor, que es su lector. El motivo es operativo y no
estético: con una lectura en la barra, cerrar las seis cajas deja de dejar el fondo solo, y eso es
un objetivo que la v11.53 entregó.

**Consecuencia sobre "Centrar en Split":** con 88 teclas que entran completas a lo ancho no hay
desbordamiento que centrar, así que el botón pasa a marcar la nota de split sobre el teclado,
encendiendo y apagando. Conserva su identificador y su hogar en el menú de Opciones. El split sigue
siendo una sola nota MIDI, la 60 por defecto.

**Estado:** vigente.

---

## 2026-08-10 — La migración al lienzo se parte en dos, y la primera mitad vuelve a la Fase 5

**Contexto:** esta es la tercera entrada sobre el mismo tema en tres PR, y conviene decirlo sin
maquillaje. La primera metió la migración a la Fase 5 como incremento 5.6 con una tensión declarada.
La segunda la sacó entera y la mandó a la Fase 5B. Esta la parte en dos y trae la mitad de vuelta.
Lo que hace legítima cada vuelta es que trajo un dato que antes no existía. El de esta es concreto y
se verificó con `grep`: el único manejador de `resize` de la app reconstruye el teclado y nada más.

**La evidencia:** las posiciones de las cajas se guardan en píxeles absolutos de la ventana donde se
arrastraron, y el ancho de cada caja encogía con la ventana porque usaba unidades `vw`, pero su
posición no se recalculaba nunca. Al achicar la ventana, las cajas quedaban fuera del área visible
y desaparecían. `Layout.clamp` hace exactamente la cuenta que haría falta, pero solo corre al
arrastrar y al colocar, no al redimensionar.

Sin lienzo, la corrección es llamar a `clamp` desde el `resize`, o sea escribir lógica de
reubicación que el lienzo vuelve innecesaria el día que llegue. El criterio del 2026-08-10 admite un
ítem a una fase en curso cuando dejarlo afuera obliga a rehacer trabajo. Este es ese caso.

**Decisión:** la migración se parte en dos piezas.

1. **El cascarón, que vuelve a la Fase 5 como incremento 5.6.** El contenedor de 1280 x 720 escalado
   y centrado, las franjas negras, la corrección del arrastre, y las medidas que leían la ventana
   pasando a leer el lienzo.
2. **La normalización, que se queda en la Fase 5B.** Pasar cada medida y cada comentario restante a
   unidades de lienzo, junto con la modularización, porque esa fase reescribe esas funciones igual.

**Qué queda superado de "La migración al lienzo sale de la Fase 5":** solo la parte que manda la
pieza 1 a la Fase 5B. La pieza 2 se queda ahí y las tres razones de aquella entrada siguen valiendo
para ella, en especial la tercera, que la 5B reescribe las mismas funciones.

**El riesgo del arrastre, que es la clase de detalle que se vuelve a pisar.** Con el cascarón
escalado, `getBoundingClientRect` devuelve coordenadas de pantalla, ya multiplicadas por la escala,
mientras que `style.transform = translate(x, y)` escribe coordenadas de lienzo. El arrastre mezclaba
las dos: leía `clientX` y lo escribía como si fuera lienzo. Sin corregirlo, a escala 1.5 la caja se
mueve un 50% más rápido que el puntero y se despega, y con franjas negras además queda desplazada
por el offset. La corrección es convertir el puntero antes de usarlo,
`(clientX - offsetX) / escala`, en el `pointerdown` y en el `pointermove`.

Por la misma razón, adentro del lienzo no se mide con `getBoundingClientRect`: se usa `offsetWidth`
y `offsetHeight`, que son valores previos a la transformación, y para la posición de una caja se usa
su estado, que ya está en coordenadas de lienzo.

**Estado:** vigente.

---

## 2026-08-10 — Universo es el término primario, y escala la aclaración que se retira sola

**Contexto:** el cuarto punto del incremento 5.4 en el `ROADMAP.md` manda que la etiqueta "Universo"
del selector pase a "Escala", con el argumento de que es la palabra que el usuario ya usa. Tres
líneas después, el mismo párrafo defiende que el nombre interno del motor no se renombre, y lo hace
con este argumento: "Universo" adentro nombra el conjunto de notas permitidas, que no siempre es una
escala de siete notas, y renombrar aplanaría esa distinción.

Ese argumento vale igual afuera. Si renombrar adentro aplana la distinción, renombrar en pantalla la
aplana también, y encima donde la ve el usuario. La prueba de que muerde ya está en el BACKLOG: las
pentatónicas y el blues están planeados como universos propios, y el día que entren el selector
diría "Escala: Blues", que es justo lo que el documento dice que no es.

**Hay además un dato de código que nadie decidió.** El widget de escala tiene hoy dos rótulos para
la misma cosa: el título de la caja dice "Escala" y la línea de abajo dice "🌌 Universo:". Verificado
con `grep` sobre `index.html`. Quedó de arrastre, no de una decisión.

**Decisión:**

1. El término primario en pantalla es **Universo**. Es el técnicamente correcto: un universo es el
   conjunto de notas permitidas, y no siempre es una escala de siete notas. El jazz trabaja con
   grupos de notas que no se dejan describir como escala.
2. Se acompaña con **escala** como aclaración entre paréntesis, para el usuario que todavía no tiene
   el término. Es una aclaración y no un sinónimo: toda escala es un universo, no todo universo es
   una escala.
3. La duplicación actual se elimina. Queda un solo rótulo en la caja.
4. **Condición de salida del paréntesis**, para que no viva para siempre: cae el día que un universo
   que no es una escala entre al selector, o sea cuando entren las pentatónicas o el blues, que ya
   están en el BACKLOG. Ese día la aclaración pasa a ser falsa para al menos una opción de la lista.
   Es una condición verificable, no una promesa.
5. El nombre interno del motor se queda como está, por la razón que el ROADMAP ya da.

**Las dos alternativas que se descartaron.** Dejar "Universo" solo era lo más consistente y deja
afuera a quien recién empieza, que abre la app sin el término. Pasar todo a "Escala" gana
familiaridad y pierde exactitud justo donde el BACKLOG ya tiene planeado contradecirla, así que
compra comodidad hoy a cambio de un renombre forzado después.

**Consecuencia:** el cuarto punto del incremento 5.4 deja de mandar el renombre y pasa a mandar la
deduplicación del rótulo más la aclaración. Este PR decide el nombre; el 5.4 lo aplica en pantalla.

**Estado:** vigente.

---

## 2026-08-10 — "Tensión Legal" pasa a "Sensible (empuja a la tónica)"

**Contexto:** el nombre estaba en la lista de renombres de la Terminología de pantalla desde que
`ARCHITECTURE.md` §5.1 anotó que promete más de lo que cubre. Para decidir el nombre nuevo se fue al
motor en vez de discutir sobre la etiqueta.

**Lo que hace el motor.** En `evaluateMelodyStatus`, dentro de `src/engine.js`, el estado `tension`
sale de cuatro condiciones simultáneas: el universo es menor, el pitch class es el que está un
semitono debajo de la tónica, la nota no pertenece al universo, y no pertenece al acorde que suena.
La línea que las junta es la que asigna `isSensible`. O sea que ese color nombra **una sola nota, en
un solo tipo de universo, y solo cuando no está escrita en él**.

**Por qué el nombre viejo estaba mal.** "Tensión" sugiere una familia con miembros, la novena, la
oncena, cualquier nota de color, y el usuario espera que se le pinten varias. Se le pinta una. Y
"legal" es una metáfora que no significa nada fuera de la cabeza de quien la escribió.

**Decisión:** en la leyenda de la guía el nombre pasa a **Sensible (empuja a la tónica)**, con el
mismo patrón que la decisión de hoy sobre Universo: término técnico primario más aclaración
didáctica. "Sensible" no es una elección de estilo, es como se llama en la teoría musical en español
el séptimo grado a semitono de la tónica, y el propio motor ya lo nombra así en `sensiblePC` e
`isSensible`. "Empuja a la tónica" describe lo que el oído siente, que es lo que hace que la nota
funcione.

**Consecuencia:** `docs/GLOSARIO.md` guarda tres capas y no dos, porque la pantalla no aguanta más
de dos y el glosario sí: el término, qué significa, y cuándo lo pinta este programa. Esa tercera
capa es la que responde por qué en un universo mayor el color no se enciende nunca.

**Estado:** vigente.

---

## 2026-08-10 — Por qué el texto quedaba borroso: la capa de composición que no se invalida

**Contexto:** después del cascarón del lienzo, el texto de las cajas quedaba borroso al
redimensionar, y el autor reportó cuatro observaciones que parecían no tener un patrón común.

**El mecanismo**, que es la parte que no se deriva leyendo el código. Una capa de composición se
rasteriza una vez, a la escala que había cuando se creó, y el compositor la reutiliza. Cambiar el
`transform` de un ancestro no la invalida: la estira. Recién vuelve a rasterizarse cuando algo la
ensucia.

Eso explica las cuatro observaciones sin excepciones. Al redimensionar la caja queda borrosa porque
su capa sigue rasterizada a la escala vieja. Al cambiar la nomenclatura se afila porque el texto
cambió y ensució la capa. Al cerrar y reabrir los widgets se afilan porque la capa se destruye y se
crea a la escala actual. Y la página de prueba que reescribía el ancho y el alto del contenedor en
cada ajuste nunca reprodujo el problema, porque invalidaba siempre.

**Decisión:** tres cambios.

1. Después de escribir el `transform` del lienzo, se reescribe el `transform` de cada caja abierta
   con las mismas coordenadas. Escribir el mismo valor ensucia la capa y la obliga a rasterizar a la
   escala nueva. Esto no es lógica de reubicación por `resize`, que sigue prohibida: no recalcula
   ninguna posición, reescribe la que la caja ya tenía.
2. Se retira el desenfoque de fondo de los paneles. Sobre un color plano oscuro no aporta nada
   visible y cuesta una capa por caja.
3. Se retira la pista de composición que tenían las cajas. Protegía la fluidez de una animación que
   la regla de animación de la Fase 5 prohíbe tener.

**Consecuencia operativa:** agregar a una caja un filtro, un desenfoque de fondo o una pista de
composición la promueve a capa propia y reintroduce esto. No se hace sin volver a mirar esta
entrada.

**Estado:** vigente.

---

## 2026-08-10 — La vista de fórmula pasa a dos filas con barra separadora

**Contexto:** el incremento 5.4 trajo la nomenclatura silábica y con ella la vista de fórmula dejó
de entrar en el molde. La alfabética usa uno o dos caracteres por nota donde la silábica usa dos o
tres, así que la misma fórmula ocupa bastante más. Y el salto de tres semitonos de la menor
armónica, que se rotula `T+S`, es el separador más largo y empuja el máximo.

**Medido sobre las 36 combinaciones**, doce tónicas por tres tipos de universo, contando caracteres
de la cadena: con el formato viejo de guiones, el peor caso alfabético son 31 caracteres y el peor
silábico son 40, `Sol#` menor armónica. Con el formato nuevo bajan a 30 y 38. El comando que
recalcula los dos números vive en `GLOSARIO.md`, en la línea de la vista de fórmula.

**Decisión:** la vista de fórmula pasa de una fila con guiones a una grilla de dos filas y trece
columnas. Los siete grados van abajo, en las columnas impares. Las seis barras separadoras, `|`, van
en las pares, y la etiqueta del paso va arriba, en la misma columna que la barra a la que se
refiere. Sin barras en los extremos. La analogía es el teclado que el usuario ya tiene abajo en la
pantalla: la barra es el borde entre dos teclas.

**Por qué los guiones se pueden sacar sin perder información**, que es la parte que hay que dejar
escrita para que nadie los quiera devolver. Los guiones de `-T-` existían para indicar que el paso
va entre dos notas y no pertenece a ninguna. En una grilla eso lo dice la posición: la etiqueta está
sobre la barra, y la barra está entre dos grados. Es la misma razón por la que una tecla negra no
necesita una flecha que indique que está entre dos blancas.

**Lo que no cambia:** el molde de 314.4 px no se toca, la solución entra en el espacio que ya está
decidido. Los tres rótulos, `S`, `T` y `T+S`, se quedan tal cual. `T+S` se lee "tono más semitono",
que es exactamente lo que el intervalo es; colapsarlo a `T` lo volvería indistinguible de un tono, y
esa distinción es la que le da su sonido a la menor armónica.

**Estado:** vigente.

---

## 2026-08-11 — La función tonal se muestra completa, con las dos veces que el motor admite que no sabe

**Contexto:** `getTonalFunction` existe desde la Fase 4, se calcula en cada `updateStatus` y se
guarda en el buffer. El comentario del código decía que ahí no se mostraba en ningún panel. El
incremento 5.5.1 la muestra, en el widget de salida del motor, que es su dueño.

**Los cinco valores que devuelve.** Tres son términos de teoría: tónica para los grados I, iii y vi
de un universo mayor, subdominante para ii y IV, dominante para V y vii°. **Los otros dos son
confesiones de que el motor no sabe**: uno dice que el acorde no pertenece al universo, y el otro
que el universo no es mayor, porque la teoría de la menor no está escrita en este repo.

**Decisión: los cinco se muestran, incluidos los dos últimos.** Ese es el punto entero de lo que el
ROADMAP llama análisis honesto.

**Por qué no se ocultan ni se maquillan**, que es la razón que hay que dejar escrita porque el
incremento 5.5.2 la va a aplicar de nuevo a otro rótulo. Esconder una lectura cuando el motor no
sabe le enseña al usuario que el programa siempre tiene respuesta, y la primera vez que le muestre
una equivocada no va a tener forma de dudar de ella. Mostrar "Tónica" cuando el motor devolvió que
no está definida es la misma clase de mentira, con la agravante de que es indistinguible de un dato
bueno. Un hueco visible es información; un hueco tapado es un error futuro.

**Consecuencia concreta que no se esconde:** en cualquier universo menor la función tonal dice hoy
que no hay teoría escrita, siempre, porque `getTonalFunction` corta en su primera línea si el tipo
no es mayor. Eso no es un defecto del incremento: es el estado real de la teoría de este repo, y así
tiene que verse hasta que el Track paralelo la escriba.

**Los textos elegidos:** "Tónica", "Subdominante" y "Dominante" para los tres términos. "Fuera del
universo" para el acorde que no pertenece, que dice qué pasa sin sonar a error. "Sin teoría escrita"
para el universo no mayor, que nombra la causa real en vez de culpar al acorde. Los dos últimos van
en el gris de texto secundario, no en un color de veredicto, porque no son un juicio sobre lo que se
tocó.

**Estado:** vigente.

---

## 2026-08-11 — El tercer valor de la clasificación deja de llamarse intercambio modal

**Contexto:** `classifyChordRelation`, en `src/engine.js`, es una cascada de tres casos. Los dos
primeros reconocen algo, diatónico y dominante secundaria. El tercero era el `return` final, el que
se ejecuta cuando fallaron los dos anteriores, y devolvía `modal_interchange`.

**El problema:** ese valor no era un diagnóstico, era el cajón de todo lo que el motor no supo
clasificar. Un intercambio modal de verdad es una técnica específica y bien definida, tomar prestado
un acorde del modo paralelo. Llamar así a lo que sobra le promete al usuario un análisis que el
motor nunca hizo. Es el mismo defecto que tenía "Tensión Legal", donde el rótulo prometía una
familia de tensiones y el código pintaba una sola nota.

**Decisión,** que es la segunda aplicación del principio escrito en la entrada del incremento 5.5.1:
lo que el motor admite no saber no se oculta ni se maquilla. El valor interno pasa a `unclassified`,
en inglés como sus dos hermanos `diatonic` y `secondary_dominant`, y el texto en pantalla pasa a
"Sin clasificar". "Sin clasificar" describe el estado del análisis y no juzga el acorde: un acorde
que el motor no sabe nombrar no es un acorde equivocado.

**Lo que este renombre no hace:** no agrega casos de clasificación. Que el motor reconozca de verdad
un intercambio modal es trabajo de la Fase 11, que es la que va a escribir esa teoría.

**La red funcionó y quedó demostrada.** Se cambió primero la línea del motor y se corrieron las
fixtures sin tocar nada más: la de blues se puso roja y nombró el caso exacto, "esperaba
'modal_interchange', obtuve 'unclassified'". Recién después se actualizó la fixture. Eso prueba que
ese camino estaba cubierto, en vez de cambiar las dos cosas a la vez y no saberlo.

**Estado:** vigente.

---

## 2026-08-11 — La paleta de veredicto no se reusa fuera del teclado

**Contexto:** `CLAUDE.md` tenía desde el incremento 5.4 una regla para los iconos y ninguna para los
colores. Sin regla, cuatro de los seis hexadecimales de la leyenda significaban además otra cosa en
otra superficie: el verde de "Correcto" era también Tónica y Diatónico, el ámbar de "Acorde" era
Dominante, el naranja de "Sensible" era dominante secundaria, y el rojo de "Error" era intercambio
modal.

**Por qué muerde:** la guía se titula "qué significa cada color" y lista seis. Un color que en
pantalla significa otra cosa y no está en esa lista contradice la única superficie que existe para
explicarlos. Es la misma colisión semántica que el incremento 5.4 corrigió con los glifos cuando
sacó el `✕` de un botón y el `✓` de una lectura.

El caso del rojo es el que se cruza con el renombre de hoy: un acorde que el motor no supo
clasificar se pintaba del mismo rojo que la guía enseña como Error. El motor no dijo que estuviera
mal, dijo que no supo.

**Decisión:** la regla vive en `CLAUDE.md` porque es operativa, y son tres puntos. Los seis
hexadecimales son la paleta de veredicto y viven solo sobre las teclas y en la leyenda que los
explica. Las lecturas del readout se distinguen por la palabra, que ya es distinta en cada caso, y
usan la escala de texto, primario para lo que el motor sabe y secundario para lo que admite no
saber. El resto de la interfaz tiene su propia paleta y no repite un hexadecimal de la de veredicto.

**Por qué no la alternativa.** Se consideró declarar que la paleta vale solo sobre las teclas y
dejar que otras superficies la reusen con otro sentido. Eso obliga al usuario a saber en qué
superficie está mirando antes de interpretar un color, que es exactamente el trabajo que la guía
existe para ahorrarle.

**Estado:** vigente.

---

## 2026-08-11 — El Criterio de aceptación de la Fase 5 decía que el motor queda intacto, y envejeció

**Contexto:** el Criterio de aceptación de la Fase 5 dice, textualmente, que "el motor y el coloreo
quedan intactos". Se escribió al abrir la fase, cuando se la creía enteramente de disposición: el
reencuadre visual no tenía por qué tocar teoría musical, y la cláusula era la garantía de que un
rediseño de interfaz no se llevara por delante la lógica.

**Qué la contradijo:** el incremento 5.5.2 tocó `src/engine.js`. Una línea, el `return` final de
`classifyChordRelation`, que renombró el valor que la cascada devuelve cuando no reconoce nada.

**Por qué el espíritu se cumplió aunque la letra no.** La cláusula existe para impedir que un
rediseño de interfaz rehaga la lógica musical. El 5.5.2 no cambió ninguna regla de evaluación, ni el
orden de la cascada, ni un umbral, ni un template de acorde: cambió el nombre de un valor de salida
porque ese nombre afirmaba un análisis que el motor nunca hizo. Las 41 fixtures pasaban antes y
pasan después, y la única que se tocó es la que verifica ese nombre. Además se corrió a propósito
con el motor cambiado y la fixture sin tocar, para que se pusiera roja y demostrara que ese camino
estaba cubierto.

**Cerrar la fase dejando la cláusula intacta** haría que el ROADMAP afirmara para siempre que la
Fase 5 no tocó el motor mientras el historial dice lo contrario. Es el modo de falla que este repo
viene combatiendo desde el 2026-08-09: un documento que dice una cosa mientras el código hace otra.

**Decisión: la cláusula se reformula en algo comprobable.** Donde decía que el motor queda intacto,
pasa a decir que ningún cambio de esta fase altera el comportamiento del motor, con dos pruebas que
se corren en vez de interpretarse:

1. `git diff` sobre `src/engine.js` a lo largo de la fase muestra solo cambios de nombre de un valor
   de salida. Ninguna condición, ningún umbral, ningún orden de la cascada, ninguna constante de
   `SCALES` ni de `CHORD_TEMPLATES`.
2. `node tests/run.js` da los 41 casos en verde con las mismas fixtures, salvo la línea que verifica
   el nombre renombrado.

Lo que se sigue prohibiendo queda igual de explícito: una fase de interfaz no agrega, saca ni
reordena reglas de evaluación, no cambia umbrales y no toca las constantes de teoría. Si hace falta,
es otra fase.

**Por qué verificable y no "no se toca el motor sin buena razón":** esa formulación no se puede
comprobar y deja la decisión en manos de quien quiera justificarla. Un `diff` y una corrida sí.

**Estado:** vigente.

---

## 2026-08-11 — Los ES Modules no cargan desde `file://`, y el umbral deja de prescribir

**Contexto:** el §7 de `ARCHITECTURE.md`, sección "No framework, por ahora", fija desde el
2026-07-03 que si `index.html` pasa las 1000 líneas el paso siguiente es modularizar con ES Modules
nativos y `<script type="module">`. Eso no funciona desde `file://` y nunca se probó.

Los scripts de tipo módulo, a diferencia de los clásicos, se piden con CORS. Desde el sistema de
archivos el origen es `null`, y las peticiones de origen cruzado solo se admiten para los esquemas
http, https, data, chrome y chrome-extension. La corrida, con una página que carga un script clásico
y un módulo del mismo directorio, en Chromium 141:

```
blocked by CORS policy: Cross origin requests are only supported for
protocol schemes: chrome, chrome-untrusted, data, http, https.
RESULTADO: {"clasico":"el clasico cargo","modulo":null}
```

El clásico cargó y el módulo no. No es un bug ni una versión vieja del navegador: cuando se pidió
permitir módulos desde `file://`, la respuesta fue que las funciones nuevas usan CORS sin excepción,
porque la exención de los scripts clásicos es una herencia anterior al modelo de seguridad y no se
quiere repetir.

**Lo que hace grave este caso es que el repo ya tenía la respuesta correcta, desde el mismo día.**
La entrada del 2026-07-03 de este archivo, *Fase 0: fixtures de regresión + extracción del motor puro
a `src/engine.js`*, descarta migrar a ES Modules y dice que un `<script src>` global alcanza. El §7,
escrito el mismo día en otro archivo, dice lo contrario. No faltaba información: había dos afirmaciones contradictorias y se
propagó la del archivo que se lee como autoridad de arquitectura.

**Y la alternativa ya está demostrada en producción.** `index.html` carga `src/engine.js` con un
script clásico desde `file://` y funciona hoy. El encabezado de ese archivo explica por qué está
escrito así: corre como global de navegador y como módulo de Node, sin build step ni ES Modules. El
archivo que funciona documenta que funciona porque evita los módulos, y el §7 seguía prescribiéndolos.

**Decisión, en tres partes.**

1. **Los ES Modules quedan descartados mientras `file://` sea un requisito.** El camino de
   modularización es scripts clásicos en varios archivos: sin `import` ni `export`, sin build, sin
   bundler y sin framework.
2. **El §7 deja de prescribir un mecanismo y pasa a abrir una decisión.** El umbral hizo bien su
   trabajo: se disparó y alguien abrió la Fase 5B. Que el número sea arbitrario da igual, porque el
   valor de una alarma no está en acertar el umbral sino en existir. Lo que falló es que la misma
   frase que alertaba también recetaba el remedio, y esa receta nunca se corrió. Una regla de umbral
   no puede prometer un mecanismo, porque entre que se escribe y que se dispara pueden pasar meses y
   el mecanismo puede no existir o no ser el mejor. Al cruzarse, el umbral obliga a abrir una
   decisión que se escribe acá con su corrida, y nada más.
3. **El segundo gatillo del §7, "o el estado se vuelve difícil de razonar", se retira.** No tiene
   medida y no se le inventa una: fijar hoy un umbral sobre código que todavía no existe repetiría
   el error que esta entrada corrige. El gatillo de líneas alcanza como alarma, y si mañana el
   estado se vuelve difícil de razonar con menos líneas, eso abre una decisión igual, por la vía
   normal.

**Qué queda superado.** Toda aparición que prescriba `<script type="module">` o ES Modules nativos
como el paso siguiente: el §7 de `ARCHITECTURE.md`, el título, el objetivo y el alcance de la Fase
5B en `ROADMAP.md`, y en este archivo las entradas del 2026-07-24 *Arquitectura de UI: paneles sobre
un fondo fijo, el motor como única fuente*, del 2026-08-09 *El umbral de las 1000 líneas se cruzó
durante la Fase 5, y se atiende después de cerrarla* y del 2026-08-10 *La migración al lienzo sale de
la Fase 5 y pasa a la Fase 5B*. Las tres de acá se quedan escritas por append-only y quedan
superadas por esta entrada en la parte que prescribe el mecanismo, no en el resto. La del 2026-07-03
no queda superada: decía lo correcto.

**El hueco de método, que es lo que hay que cerrar.** El PR que agendó la Fase 5B se llamó a sí
mismo un arreglo de números y referencias que se pudren, y verificó seis cosas: el conteo de líneas,
cuatro referencias de archivo y línea, dos citas del motor, las fixtures, las viñetas y la versión
mostrada. Las seis eran sobre el estado del repo. Ninguna era sobre el destino que ese PR estaba
agendando. La regla 6 de "Prosa" pide que un número que describe el código vaya con el comando que
lo recalcula, y `wc -l` recalcula un número, pero nada recalcula una promesa. Un número heredado se
recalcula y un mecanismo heredado no se prueba: esa asimetría es el hueco. La corrección va como
regla operativa en `CLAUDE.md`, sección "Prosa", más el protocolo de tres preguntas que una decisión
de umbral tiene que contestar.

**Razón para no escribir acá cómo se parte el archivo.** El orden de carga de los scripts clásicos,
el reparto de responsabilidades y el espacio de nombres son decisiones de la partición, y la
partición todavía no ocurrió. Prescribir el mecanismo antes de necesitarlo es exactamente el error
que esta entrada corrige.

**Estado:** vigente. Supera al §7 en su formulación anterior.

---

## 2026-08-11 — El contrato de permisos: sistema, permiso de escritura y solo lectura

**Contexto:** el `ROADMAP.md` declara al contrato como el primer trabajo de la Fase 5B, porque cómo
se parte `index.html` depende de qué tiene que hacer cada pieza. El repo venía preguntándose quién
es responsable de qué, y esa pregunta no cerraba: el widget de escala parecía dueño de la escala
aunque el motor la siga leyendo con el widget cerrado.

**La pregunta correcta es quién tiene permiso de qué.** No es que un widget tenga la acción, es que
tiene permiso de cambiar el valor por defecto del sistema.

**Decisión: tres niveles de permiso.**

| Nivel | Qué puede hacer | Quién es hoy |
|---|---|---|
| El sistema | posee los valores, los produce y los conserva. No se cierra ni se apaga | el motor, el estado, el log, el lienzo, la infraestructura de cajas |
| Widget con permiso de escritura | cambia un valor del sistema, además de leerlo y presentarlo | el widget de escala, que escribe el universo |
| Widget de solo lectura | lee y presenta. No cambia ningún valor | el widget de salida del motor |

**Esto no contradice la regla de que los widgets no se hablan entre sí**, de la entrada del
2026-08-10 *Dueño de superficie: cerrar el widget apaga su efecto*. El widget de escala afecta lo
que el de salida del motor muestra, y nunca lo llama: escribe en el sistema y el otro lee del
sistema. El sistema es siempre el intermediario, y por eso un widget nuevo no necesita conocer a
ninguno de los anteriores.

**Acotación de la regla de autoría, que hoy está incumplida.** Esa misma entrada dice que un dato
tiene un autor y muchos lectores. Sobre `index.html` no se cumple, y conviene acotarla en vez de
dejarla mintiendo:

- `State.harmony` la escriben dos lugares distintos. `MIDI.triggerAccumulation` y
  `MIDI.triggerContextTimeout` escriben el acorde detectado; `UI.updateStatus` escribe la función
  tonal, y `UI.lockChord` y `UI.unlockChord` escriben el acorde fijado y el bloqueo.
- `State.evaluations` la escribe `MIDI.evaluateMelody` y la borran `MIDI.releaseNoteInternal`, el
  temporizador que arma la propia `evaluateMelody` y `UI.clearEvaluations`.

La acotación: **la regla habla de widgets, no del código interno del sistema.** Que dos partes del
sistema escriban la misma rama del estado no la viola, porque el sistema es un solo autor con varias
manos. Los widgets sí están limitados a un autor por dato, y solo los que tienen permiso de
escritura pueden ser ese autor.

**Los valores del sistema existen siempre.** Cerrar un widget cierra su editor y sus efectos, nunca
borra el valor que editaba. Esto describe lo que el programa ya hace: `State.universe` arranca en
`root: 0, type: 'major'`, o sea Do mayor, y vive en el estado global, no adentro del widget de
escala. Si viviera adentro, cerrar el widget dejaría al motor sin universo contra el cual evaluar y
al readout sin nada que leer. El contrato le pone nombre a esa realidad y no la cambia.

Un detalle medido al escribir esto, que corrige una suposición razonable: **el universo no
persiste.** `saveConfig` guarda `State.config` en `midiTrainerCfg` y nada más, así que cada recarga
vuelve a Do mayor. Si debería persistir es una decisión que esta entrada no toma.

**Consecuencia de diseño: quien quiera un editor alternativo del universo pide el mismo permiso**, y
no hereda el valor. Si mañana existe otro selector de escala, los dos escriben el mismo valor del
sistema y ninguno se entera del otro.

**Por dónde se corta cuando llegue la partición: donde cambia el permiso.** Lo que es sistema va
junto, lo que tiene permiso de escritura va junto, y lo que solo lee y presenta va junto. Con ese
criterio el objeto de layout deja de ser un problema: abrir, cerrar, mover, persistir y medir son
sistema, porque ningún widget tiene permiso sobre eso.

**Qué queda diferido, a propósito.** Los entrenamientos no se tocan acá: qué pueden alterar, su
formato y cómo se registran se definen de forma colateral cuando exista el primero, y el disparador
es ese. Los nombres de los archivos, el orden de carga y el espacio de nombres son la partición, y
su disparador es el PR que la ejecute. Escribirlos hoy sería recetar un mecanismo futuro, que la
sección "Promesas y umbrales" de `CLAUDE.md` prohíbe.

**Razón para que casi todo esto sea descriptivo.** Los tres niveles describen lo que el programa ya
hace, la precedencia ya existe en el código y el universo ya vive en el sistema. Lo único nuevo es
ponerles nombre y declarar qué queda diferido. Un contrato que describe lo que hay no envejece; uno
que promete mecanismos sí, y ese error ya costó treinta y nueve días con `<script type="module">`.

**Estado:** vigente. Refina la entrada del 2026-08-10 *Dueño de superficie: cerrar el widget apaga su
efecto* sin editarla.

---

## 2026-08-11 — Los efectos sobre las teclas, y la primera precedencia escrita del repo

**Contexto:** el contrato de permisos necesita saber sobre qué actúa un widget. Sobre el teclado hay
más de un efecto y no estaban separados por nombre.

**Decisión: dos efectos con dueño y un hueco.**

**Efecto veredicto: color y símbolo, juntos e inseparables.** Las seis categorías pintan la tecla y
le ponen su símbolo en la misma regla de CSS, en los pares `.color-scale` y `.color-scale::before` y
sus cinco hermanos: `•` escala, `♦` acorde, `✓` correcto, `!` sensible, `~` paso cromático, `✕`
error. No son dos efectos: es uno con dos señales, y el símbolo existe para que el color no sea la
única. El reparto de dueños es el de la entrada del 2026-08-10 *Dueño de superficie: cerrar el
widget apaga su efecto*: escala pertenece al widget de escala y las otras cinco al de salida del
motor.

**Efecto etiqueta: el nombre de la nota sobre la tecla.** Se enciende y se apaga con
`State.config.nombresTecla`, y qué dice depende de la nomenclatura, que es un valor del sistema que
un widget con permiso de escritura puede cambiar.

**Un tercer lugar disponible, todavía sin dueño de widget: el marcador del split.** Es la clase
`split-mark`, no es veredicto ni etiqueta, y lo enciende un control del sistema a través de
`State.ui.marcaSplit`. Queda anotado como el hueco donde entraría un efecto nuevo aportado por un
widget futuro. Es un hueco, no un plan.

**Compartir un efecto está permitido si la precedencia está escrita. Sin precedencia escrita, no.**
Dos widgets ya comparten el efecto veredicto y el código ya lo resuelve sin que nadie lo llamara
así: `UI.renderKeyboard` recorre una cascada de cuatro ramas en este orden, acorde, veredicto, nota
activa y escala. Esa cascada queda documentada como la primera precedencia del repo.

La tercera rama de esa cascada, la del preveredicto, sigue sin dueño limpio: pinta una nota recién
tocada usando el conjunto de alturas válidas de la escala, que es dato del widget de escala, con un
color del widget de salida del motor. No se resuelve acá; ya está anotada en el BACKLOG del
`ROADMAP.md`, junto con el conflicto entre los dos widgets cuando los dos reclaman el rojo.

**Estado:** vigente.

---

## 2026-08-11 — La partición se hace en dos PR, y el primero es un corte puro

**Contexto:** el segundo trabajo de la Fase 5B es partir `index.html` en archivos. El contrato de
permisos ya dice por dónde se corta, donde cambia el permiso, pero ese criterio atraviesa `UI` por
la mitad: `buildUniverse` escribe el universo, o sea permiso de escritura; `buildKeyboard` y
`renderKeyboard` son capa 0, o sea sistema; y `updateStatus` solo lee y presenta. Repartir esos
métodos y mover los bloques en el mismo PR mezcla dos trabajos que fallan distinto.

**Decisión: la partición se hace en dos PR.** El primero mueve bloques a archivos y no mueve un
solo método entre objetos: ni renombres, ni reordenamientos internos, ni arreglos de paso. El
segundo reorganiza por permiso, que es donde está el trabajo de verdad.

**Razón: un corte puro se puede probar.** Concatenando los archivos nuevos en orden de carga y
comparando contra el bloque de script original, el resultado tiene que ser idéntico salvo los
encabezados de archivo. Eso convierte "no cambió el comportamiento" de una afirmación en una
comprobación. En cuanto se mueve un método, esa propiedad se pierde y hay que volver a confiar en
la lectura. El `diff` de la corrida dio exactamente diez líneas de diferencia, una por archivo, y
las diez son el comentario de encabezado.

**Los dos datos que hacen segura esta partición**, y que son la razón de que no necesite la
ceremonia que una partición normalmente necesita:

1. **En todo el script hay una sola sentencia ejecutable de primer nivel**, la asignación de
   `window.onload`. Todo lo demás son declaraciones de constantes y de funciones. Eso resuelve las
   referencias hacia adelante, que existen y son varias: `lienzo.js` nombra a `Layout` y `layout.js`
   nombra a `Lienzo`, que es un ciclo entre dos archivos; `cajas.js` nombra a `Layout` y `midi.js`
   nombra a `UI`, los dos definidos en archivos que cargan después. Con módulos serían un problema
   de resolución; con scripts clásicos y solo definiciones no lo son, porque esas referencias viven
   dentro de cuerpos de método y se resuelven cuando el método corre, que es siempre después de que
   los diez archivos cargaron.
2. **En scripts clásicos, un `const` de primer nivel va al ámbito léxico global**, compartido entre
   todos los scripts de la página. No hace falta objeto contenedor, ni exportar, ni inventar un
   espacio de nombres: un `const` definido en un archivo se ve desde otro. Por eso ningún archivo
   nuevo lleva envoltura, y `src/engine.js` conserva la suya, que existe por otro motivo, correr en
   Node contra las fixtures.

**Criterio de nombres: cada archivo toma el nombre de lo que define.** `lienzo.js` define `Lienzo`,
`layout.js` define `Layout`, `cajas.js` define `CAJAS`, `midi.js` define `MIDI`. Así el nombre del
archivo no es una categoría inventada que haya que mantener sincronizada con el código, y el día que
un objeto se renombre el archivo se renombra con él. Los nombres mezclan español e inglés porque los
identificadores del código ya lo hacen, y renombrar identificadores es su propio PR, ya anotado en
"Deuda de método y documentación" del `ROADMAP.md`.

**El orden de carga es el orden del archivo original.** Como solo `arranque.js` ejecuta, el orden de
los otros nueve no cambia el comportamiento; queda elegido para que se lea de arriba abajo, primero
las constantes, después el estado, después los productores de datos, después la interfaz, después el
chasis de cajas. Va dicho en un comentario del HTML. No se usó el atributo que difiere la ejecución:
no hacía falta, y agregarlo habría sido un cambio de comportamiento en un PR que se define por no
tener ninguno.

**Un efecto lateral del corte contiguo, que muestra por qué hace falta el segundo PR.**
`saveLayout` y `loadLayout` quedaron en `cajas.js` y no en `layout.js`, porque en el archivo
original viven entre el registro de cajas y el cascarón del lienzo, y un corte puro no puede
moverlas. Ese es exactamente el tipo de acomodo que el segundo PR resuelve.

**Qué queda diferido.** Cubrir la geometría del layout con fixtures no se decide acá: agregar
envoltura para Node rompería la propiedad de corte puro, porque metería código que en el original no
existe. El dato que lo justifica está a la vista igual: la geometría es aritmética sobre números del
lienzo, hoy no tiene ninguna prueba, y es donde se rompieron dos cosas durante la Fase 5, el clamp
que no corría al redimensionar y la alineación de la grilla de la fórmula. El disparador es el PR de
la segunda parte.

**Estado:** vigente.

---

## 2026-08-11 — El coloreo se registra de forma diferencial, no absoluta

**Contexto:** la primera sesión con un teclado conectado por USB dejó ver un hueco del log. El log
registra el veredicto de cada nota y no registra qué se pintó: ni qué tecla recibió qué categoría, ni
qué rama de la cascada ganó, ni qué dueño la produjo. Eso choca con dos cosas ya escritas, la entrada
del 2026-07-25 *El log como canal de validación: toda salida del motor se registra, se muestre o no*,
y el contrato de permisos del 2026-08-11, que declara la cascada de `UI.renderKeyboard` como la
primera precedencia escrita del repo y deja su resultado invisible.

El caso que lo vuelve urgente: una nota puede estar a la vez en el universo y en el acorde detectado.
La cascada le da el color de acorde y el log dice que la evaluación fue correcta. Los dos son
ciertos, no coinciden, y hoy no hay forma de detectar esa divergencia sin mirar la pantalla.

**Por qué el video no es alternativa, y por qué esto va escrito.** El paso cromático dura 180
milisegundos por definición del motor, o sea once cuadros a sesenta por segundo. Grabar y revisar
imágenes para extraer un dato que el programa ya conoce y no escribe es más caro y menos preciso que
escribirlo. El log no es una alternativa al video: es el único instrumento posible.

**La restricción que obliga a decidir esto ahora.** `UI.renderKeyboard` repinta las 88 teclas enteras
y se lo llama desde doce lugares distintos, uno por cada nota que baja o sube, cada detección o
liberación de acorde, cada vencimiento de temporizador y cada cambio de universo o de nomenclatura.
Una línea por tecla pintada convertiría unos segundos de música en miles de líneas y volvería el
instrumento inservible justo cuando más hace falta.

**Decisión: el registro es diferencial, no absoluto.** Se escribe una línea cuando una tecla cambia
de categoría, con la tecla, la categoría que sale, la que entra y qué rama de la cascada ganó. Un
repintado que no cambia nada no escribe nada.

Esto fija qué tiene que lograr el registro y qué no puede hacer, y nada sobre cómo. Cuándo se
construye lo decide el ítem del BACKLOG, que está bloqueado por el de agrupar y filtrar las
categorías: un registro nuevo sobre un log donde el 85% de las líneas son de disposición se pierde
igual que lo musical se pierde hoy.

**Estado:** vigente.

---

## 2026-08-11 — `UI` se disuelve: el reparto por permiso y las fixtures de geometría

**Contexto:** la segunda parte de la partición reparte por permiso, y el criterio atravesaba `UI` por
la mitad. Sus siete métodos caían en tres niveles distintos del contrato del 2026-08-11: `buildUniverse`
escribe el universo, `buildKeyboard` y `renderKeyboard` son capa 0, `updateStatus` solo lee y presenta,
y `clearEvaluations`, `lockChord` y `unlockChord` mandan sobre el buffer de armonía.

**Decisión: `UI` deja de existir.** No queda como uno de los tres. Sus métodos se reparten en cuatro
objetos nuevos, cada uno en su archivo, siguiendo el criterio de nombres que ya rige, el archivo se
llama como lo que define:

| Objeto y archivo | Qué se llevó | Nivel de permiso |
|---|---|---|
| `Escala`, `escala.js` | `buildUniverse` | permiso de escritura sobre el universo |
| `Teclado`, `teclado.js` | `buildKeyboard`, `renderKeyboard` | sistema, capa 0 |
| `Readout`, `readout.js` | `updateStatus` y su firma de análisis | solo lectura |
| `Armonia`, `armonia.js` | `clearEvaluations`, `lockChord`, `unlockChord` | sistema, buffer de armonía |

**Por qué se disuelve en vez de quedar como uno de los tres.** "UI" nombra una capa del programa, no
un nivel de permiso. Dejarlo vivo obligaría a que uno de los tres niveles se llamara con el
vocabulario viejo, y a que quien lea una llamada tenga que acordarse de cuál de los siete métodos
quedó adentro. Con los cuatro objetos, cada llamada dice a la vista qué produce el efecto:
`Teclado.renderKeyboard()` dice que repinta el teclado, y `UI.renderKeyboard()` no decía nada que el
nombre del método no dijera ya.

**Lo que se mudó por la misma razón, aunque no sea de `UI`:** `saveLayout` y `loadLayout` pasan de
`cajas.js` a `layout.js`, la deuda que la primera parte declaró. `saveConfig` y `loadConfig` pasan de
`ui.js` a `state.js`. La regla que sale de las dos mudanzas: **la persistencia vive con lo que
persiste**, `Layout.estado` con `Layout` y `State.config` con `State`.

**Las cuatro lecturas del readout pasan a un solo tratamiento.** Es la deuda que el ROADMAP anotaba
del PR que escribió la regla de color: ese PR sacó los hexadecimales de la paleta de veredicto de las
lecturas y dejó la mitad del widget sin migrar. El `#facc15` de la regla base sale y queda
`var(--text-main)`, así las cuatro comparten tamaño, peso y color primario, y la única diferencia que
sobrevive es la que la regla 2 de "Colores" de `CLAUDE.md` permite: bajar al secundario cuando el
motor admite no saber. Sale también un `font-size` en línea que solo llevaba una de las cuatro.

Un defecto que apareció al unificar y se arregla acá: al soltar el acorde, las dos lecturas que
reciben color desde JavaScript se quedaban en secundario, así que el mismo guion se veía de dos
colores según lo que hubiera sonado antes. El secundario dice que el motor admite no saber, no que no
haya nada, así que el guion vuelve al primario.

**Decisión sobre las fixtures de geometría: no, y este es el criterio que la reabre.** El ROADMAP la
justificaba diciendo que la geometría es aritmética pura sobre números del lienzo, sin DOM. Se
verificó y es falso: `Layout.area` lee `offsetHeight` de la barra, `Layout.zonaNotas` lee además el
del teclado, `Layout.clamp` lee `offsetWidth` y `offsetHeight` de la caja que recibe, `Layout.cobertura`
recorre el documento con `querySelectorAll` y suma `offsetHeight`, y `Layout.puntosCompeten` lee el
ancho del widget de escala. Cubrirlas hoy no pide una envoltura para Node: pide un DOM falso, y un DOM
falso prueba el doble, no el código.

**El criterio que la reabre:** el día que esas funciones reciban sus medidas como argumentos en vez de
leerlas del documento, la aritmética queda aislada y se cubre con fixtures en el mismo PR que la
aísle. No es una fecha ni un "más adelante": es una condición que se comprueba con `grep` sobre
`layout.js` buscando `offsetWidth`, `offsetHeight` y `querySelectorAll`.

**Lo que este PR no pudo arreglar y queda anotado.** `src/engine.js` tiene dos comentarios que citan
`UI.buildUniverse` y `UI.updateStatus` "en index.html". Los dos ya estaban muertos desde la primera
parte, porque esos métodos habían dejado index.html, y hoy además el objeto no existe. Tocar
`src/engine.js` estaba fuera del alcance de este PR. Queda en el BACKLOG.

**Estado:** vigente.

---

## 2026-08-11 — La tercera pieza de la Fase 5B era chica, y se dice

**Contexto:** el `ROADMAP.md` describía el tercer trabajo de la Fase 5B como pasar cada medida y cada
comentario restante a unidades de lienzo, y revisar que ninguna regla de CSS siguiera resolviendo
contra la ventana. Esa descripción se escribió el 2026-08-10, cuando el cascarón todavía no existía y
se suponía que quedaba mucho por migrar.

**El barrido dice otra cosa.** Sobre las catorce piezas de código quedaba una sola lectura de la
ventana, la del cálculo de la escala en `lienzo.js`, que es el único lugar que debe leerla y cuyo
comentario ya lo declaraba; una sola unidad de viewport en el CSS, la altura del `body`; las dos
apariciones de `getBoundingClientRect` son comentarios que explican por qué no se usa; y las
mediciones contra el DOM que quedan son `offsetWidth` y `offsetHeight`, previas a la transformación y
por lo tanto ya en unidades de lienzo. La migración la había hecho el cascarón del incremento 5.6.

**Decisión: se entrega lo que hay, cuatro restos, y se dice que era chica.** La alternativa, buscarle
volumen a la pieza para que el trabajo entregado se pareciera a su descripción, es lo contrario de lo
que este repo viene haciendo desde el 2026-08-09. Los cuatro restos son el teclado midiendo su
contenedor en vez de usar `LIENZO_ANCHO`, una regla `.container` con un tope de 1600 px que adentro de
1280 no puede activarse nunca, tres comentarios que decían que el fondo toma el viewport cuando toma
el lienzo, y un `font-size` de CSS inalcanzable por especificidad.

**Lo que esto deja escrito para la próxima vez.** Una descripción de trabajo futuro predice su tamaño,
y una predicción escrita meses antes puede errarle por mucho. Cuando la pieza llega, lo que manda es
la medición, y la diferencia se escribe en vez de disimularse. Es la misma familia de error que el
2026-08-11 corrigió en el §7 con `<script type="module">`: una frase escrita por adelantado que
nadie volvió a contrastar contra el estado real.

**Estado:** vigente.

---

## 2026-08-11 — Un apunte que describe algo ya hecho no es una dirección pendiente

**Contexto:** el `ROADMAP.md` guarda ítems parqueados en tres lugares, el BACKLOG con 38, "Direcciones
sin fase" con 6 y el "Track paralelo de teoría" con 3. Al escribir la procedencia de cada uno
aparecieron tres que no eran trabajo: los tres apuntes del track de teoría describían cosas que el
repo ya había resuelto en otro lado.

**Decisión: un apunte que describe algo ya implementado, o algo que ya es una fase declarada, se
retira de la lista de pendientes.** No es trabajo, es explicación, y su lugar depende de si sigue
aportando:

- Si el término sigue haciendo falta para leer el repo, va a `GLOSARIO.md`, que es donde vive lo que
  un término significa hoy.
- Si lo que describe ya está escrito en otro lado con más precisión, se retira por duplicado.
- Si describe el trabajo de una fase declarada, se retira y la fase queda como el único lugar donde
  vive.

**Razón:** una lista de pendientes que contiene cosas hechas obliga a releer el código para saber cuál
es cuál, y esa relectura se paga cada vez que alguien recorre la lista. El costo crece con el tiempo
y con la cantidad de ítems, que es exactamente lo contrario de lo que una lista de pendientes tiene
que hacer.

**Aplicación inmediata.** "Función tonal" se retira por duplicado: `getTonalFunction` la deriva desde
la Fase 4, `Readout.updateStatus` la muestra desde el incremento 5.5.1, y el glosario ya trae el
término completo. "Dominante secundaria" pasa al glosario: el motor evalúa su tono conductor desde la
Fase 3, en `isSecondaryDominantLeadingTone`, y el vocabulario sigue haciendo falta. "Círculo de
quintas" se retira porque describe el trabajo de la Fase 10, que sigue `pendiente`.

**Qué no decide esta entrada.** El "Track paralelo de teoría" no se cierra: sigue siendo el lugar
donde se escribe la teoría antes de tocar código, y la Fase 11 ya tiene trabajo asignado ahí. Lo que
drenó son sus tres apuntes, no la sección.

**Estado:** vigente.

---

## 2026-08-11 — Un ítem parqueado nace con su fecha y el PR que lo trajo

**Contexto:** el PR anterior le dio procedencia a los ítems cuyo origen alguien todavía recordaba, y
22 de los 44 parqueados quedaron sin nada. Recordar no escalaba, pero el dato existía igual: cada
ítem entró en un commit, y el commit se encuentra.

```sh
git log -S "fragmento distintivo del ítem" --format="%h %ad %s" --date=short -- docs/ROADMAP.md
```

El commit más viejo de esa lista es el que introdujo la cadena. Con ese comando los 44 ítems del
BACKLOG y de "Direcciones sin fase" quedaron fechados, sin adivinar ninguno.

**Decisión: un ítem parqueado se escribe con la fecha de su entrada y el PR que lo trajo.** La regla
operativa vive en `CLAUDE.md`, sección "Fechas". Un ítem nuevo nace con ese dato, para que este
trabajo no haya que repetirlo.

**Por qué el dato importa, más allá de la fecha.** Dos ítems agregados por el mismo PR tienen una
relación que el ROADMAP no muestra: se anotaron mirando lo mismo. Eso ya cambió la lectura de tres
grupos. El PR del dueño de superficie trajo seis ítems de una vez, entre ellos la precedencia del
rojo y la rama del preveredicto, que son el mismo conflicto visto desde dos lados. El PR de la Fase
5B trajo los cuatro ítems de reglas de método juntos, que es lo que se esperaría, y el del estándar
espacial trajo el metrónomo, que no tiene nada que ver con el espacio.

**Lo que este dato no dice, y hay que decir que no dice.** El commit responde cuándo entró un ítem y
con qué otros, no por qué se anotó. Los dos son datos distintos y mezclarlos contamina uno exacto con
uno interpretado. Por eso este trabajo va antes que cualquier intento de explicar los ítems.

**Una advertencia de método sobre el comando.** `-S` encuentra cuándo apareció una cadena, no cuándo
apareció una idea. Si un ítem se reescribió, buscar su texto de hoy devuelve el commit de la
reescritura. Pasó con dos: el ítem de agrupar el log entró como "Log filtrable por categoría" y el
del feedback entró con otra redacción, los dos con el PR del contrato de permisos, y los dos se
reescribieron el mismo día. Se resolvieron buscando la redacción vieja, y el ítem dice las dos cosas.

**Estado:** vigente.

---

## 2026-08-11 — Una inferencia se marca como inferencia, y ante la duda se declara el vacío

**Contexto:** después de fechar los 44 ítems parqueados quedaban 24 con fecha y sin nada que
explicara por qué se anotaron. Explicarlos con lo que el repo tiene, el PR que los trajo y lo que ese
PR produjo, trae un riesgo distinto del de los trabajos anteriores de esta serie. Antes el modo de
falla era escribir algo falso creyéndolo cierto. Acá es escribir algo **plausible** que suene a
hecho.

**Decisión: una inferencia se escribe marcada como inferencia y con su base a la vista, nunca como
hecho. Ante la duda entre inferir y declarar el vacío, se declara el vacío.** La regla operativa vive
en `CLAUDE.md`, sección "Honestidad de estado", con los tres marcadores.

**Razón:** una explicación bien armada sobre una base débil es peor que un hueco declarado, porque el
hueco se nota y la explicación no. Un resultado con siete vacíos y cuatro hipótesis se puede confiar
entero; uno con once hipótesis obliga a auditar cada una.

**El saldo de los 24**, que es el dato que la transición al roadmap siguiente va a necesitar:

| Categoría | Cuántos |
|---|---|
| Explicado, con cita a la fuente | 13 |
| Inferido, marcado como hipótesis con su base | 4 |
| Sin origen recuperable | 7 |

**Dos ítems pasaron de inferidos a sin origen al aplicar el criterio**, y conviene decirlo porque es
donde la regla hizo trabajo. La calibración de tiempos por tapping y el split como rango tienen cada
uno una explicación cómoda a mano, el motor ya usa ventanas de tiempo y el split ya existe como
concepto. Ninguna de las dos sale del PR que trajo el ítem, así que serían invención con forma de
deducción.

**Un hallazgo que corrige una suposición razonable.** Un ítem anotado por un PR sin relación temática
no es necesariamente un ítem sin explicación. El metrónomo entró con el PR del estándar espacial de
los widgets, que no tiene nada que ver, y sin embargo el CHANGELOG de ese día escribió la razón
completa. Lo mismo pasa con la tabla histórica. Anotación de paso y razón registrada son cosas
distintas y pueden convivir.

**Lo que este trabajo no hace.** Explicar por qué se anotó un ítem no es decidir qué hacer con él, y
tampoco agrupar los que resultan ser el mismo tema. Las dos cosas son trabajo de la transición al
roadmap siguiente y ya están anotadas.

**Estado:** vigente.

---

## 2026-08-11 — Una vista es cómo se mira, un widget es quién tiene el permiso

**Contexto:** el contrato del 2026-08-11 *El contrato de permisos: sistema, permiso de escritura y
solo lectura* dice qué puede tocar cada caja. Lo que no dice es qué pasa cuando una misma caja
ofrece más de una forma de mostrar el mismo dato, que es lo que la Fase 10 pide con la rueda de
quintas.

**Decisión: una vista es una forma de mostrar el mismo dato; un widget es quién tiene el permiso.**
La vista cambia cómo se mira y qué controles se ofrecen. Nunca cambia qué puede tocar la caja.

Tres consecuencias:

1. **Un widget puede tener varias vistas.** El selector de universo con vista lineal y con vista de
   rueda de quintas es el mismo widget con el mismo permiso, no dos widgets. La Fase 10 ya lo
   describe así, "la rueda de quintas como segunda vista dentro del panel de la escala".
2. **Abrir el mismo widget más de una vez con vistas distintas es coherente con el modelo**, para ver
   cómo una se liga con la otra. El modelo lo admite: una caja se identifica por identidad y no por
   posición, y su estado se guarda por instancia. **Lo que no existe es el mecanismo.** `CAJAS` es un
   registro fijo de siete entradas, cada una atada a un id que ya vive en el markup, y no hay ninguna
   forma de crear una instancia nueva en tiempo de ejecución. Que el modelo lo admita y que el código
   lo permita son dos cosas distintas, y hoy solo vale la primera.
3. **El permiso es del widget, no de la vista.** Si cada vista tuviera el suyo, dejaría de poder
   saberse qué puede tocar una caja mirándola, que es justo lo que el contrato garantiza.

**Lo que esta entrada no decide:** cómo se cambia de vista, cómo se elige y dónde va el control. Eso
es trabajo de la fase que construya la segunda vista.

**Estado:** vigente. Refina el contrato del 2026-08-11 desde afuera, sin editarlo.

---

## 2026-08-11 — El cap de tres tiene una razón pedagógica, además de la espacial

**Contexto:** el cap está escrito como número desde el incremento 5.3 y tiene una razón escrita, la
de la entrada del 2026-07-25 *Precisiones del modelo de widgets*: "que no tapen las notas del fondo".
Esa razón es espacial y sigue vigente. Lo que faltaba es la otra, que es la que decide qué pasa
cuando aparezca un widget nuevo.

**Decisión: el límite de tres existe para que el usuario elija qué le conviene mirar en la fase de
aprendizaje en la que está.** No es una restricción de rendimiento. La espacial acota cuánto se tapa,
que es el presupuesto de tres octavos; esta acota cuántas cosas compiten por la atención a la vez.

**La consecuencia, que es lo que hace útil a la decisión: un widget nuevo no sube el cap, lo
disputa.** Cuando aparezca uno que valga la pena, la pregunta correcta es qué sale, no cuánto sube el
número.

**Sobre los dos widgets de andamiaje.** El tercer widget y el widget de prueba existen sin contenido,
y el `ROADMAP.md` ya declara que están para poder ejercer el cap. Con esta entrada queda explícito
que no son el lugar reservado de dos widgets futuros: son las dos ranuras vacías contra las que el
usuario aprende que hay un límite.

**Estado:** vigente.

---

## 2026-08-11 — El motor no ejecuta lógica que venga de afuera

**Contexto:** a medida que el proyecto crece aparece la tentación de que algo cargado desde afuera
aporte su propio cálculo musical. Esta entrada fija qué garantiza el motor, y no depende de que ese
algo llegue nunca.

**Decisión: el motor consume datos. No ejecuta lógica que no esté en `src/engine.js` y cubierta por
las fixtures.**

**Razón, con el número:** las 41 fixtures son la única garantía dura del proyecto y corrieron verdes
en veinte entregas seguidas. Si algo externo pudiera sustituir el cálculo del motor, esa cobertura
dejaría de significar nada, porque lo que corre no sería lo que las fixtures prueban. Y el fallo
aparecería solo con ese algo cargado, o sea en el caso menos reproducible posible.

**El ejemplo que la vuelve concreta.** Un universo nuevo es un dato, no un algoritmo. `SCALES` en
`src/engine.js` guarda hoy tres entradas, `major`, `minor` y `harmonic_minor`, y cada una es un
arreglo de intervalos más un nombre, de la forma `{ f: [2, 2, 1, 2, 2, 2, 1], n: 'Mayor' }`. Agregar
la escala de blues, que el BACKLOG pide desde el primer commit del `ROADMAP.md`, es agregar una
entrada a esa constante. No hace falta lógica nueva.

**La salida cuando un dato no alcance:** si algún día hace falta una regla que el motor no tiene, se
agrega al motor con sus fixtures. Es más lento, y es la única forma en que las 41 fixtures siguen
queriendo decir algo.

**Estado:** vigente.

---

## 2026-08-11 — El lock de acorde vive en una vista del widget de escala, por ahora

**Contexto:** dos textos vivos del `ROADMAP.md` se contradicen sobre los dos controles de acordes,
que están ocultos desde el incremento 5.6. El Alcance de la Fase 6 pide mejorar "Fijar Acordes"
generando los botones I, IV y V según la escala activa, o sea que asume que sigue siendo un panel de
botones. Y el BACKLOG pide convertir "Motor Automático" y "Fijar Acordes" en un widget que asista con
los acordes, o sea que asume que el panel se disuelve. Se escribieron con días de diferencia y
ninguno cita al otro. Hacer el punto de la Fase 6 primero sería construir botones dinámicos adentro
de un panel que el otro ítem quiere disolver.

**Decisión: el lock de acorde no va en el readout ni en un widget propio. Va en otra vista del widget
de escala.** Tres razones:

1. **El readout es de solo lectura** según el contrato del 2026-08-11. Un botón que congela el
   análisis lo convertiría en widget con permiso de escritura, y su nombre dejaría de describir lo
   que hace.
2. **El widget de escala ya tiene permiso de escritura** sobre el contexto que el motor evalúa. Fijar
   un acorde es decirle al motor contra qué evaluar, igual que elegir un universo: es la misma clase
   de acto.
3. **Los botones de grados se derivan del universo que ese widget ya conoce.** Dejan de ser un panel
   suelto con dos acordes escritos a mano.

**Esta decisión tiene condición de salida y no es firme.** Se toma porque la vista lineal tiene
espacio, sabiendo que la vista de rueda no lo va a tener. La ubicación se revisa cuando la vista de
rueda exista y se vea si el control cabe, y esa revisión puede terminar en un widget propio sin que
esta decisión haya estado mal.

**Primer caso concreto de la entrada de hoy sobre vistas:** dos vistas del mismo widget pueden
ofrecer distintos controles. El permiso sigue siendo el mismo; lo que cambia es qué se ofrece en
pantalla.

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
