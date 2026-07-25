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

### Plantilla para nuevas entradas

```
## YYYY-MM-DD — Título corto de la decisión

**Contexto:** qué problema o pregunta motivó esto.

**Decisión:** qué se decidió, en una o dos frases.

**Razón:** por qué esta opción y no otra (mencionar alternativas descartadas si aplica).

**Estado:** vigente / reemplazada por [fecha] / obsoleta
```
