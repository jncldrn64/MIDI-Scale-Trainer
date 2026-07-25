# ROADMAP.md: MIDI Scale Trainer Pro

> Cómo se usa este documento con Claude Code: una fase por sesión. No se pasa a la fase
> siguiente sin probar la anterior en el piano físico. Cada decisión de teoría musical o
> de arquitectura que se tome durante una fase se anota en `DECISIONS.md` con fecha. No se
> pierde en un chat.

**Valores de estado:** `pendiente`, `en progreso`, `cerrada (YYYY-MM-DD)`.

**Convención de log (2026-07-25):** el criterio de aceptación de toda fase incluye que el
motor emita al log, etiquetado, lo que esa fase agrega, para que una sesión humana sea
auditable después. Ver DECISIONS, entrada del 2026-07-25.

---

## FASE 0: Infraestructura, antes de tocar una regla de teoría musical

**Estado:** `cerrada (2026-07-04)`

**Objetivo:** que el proyecto no se vuelva a perder, y que agregar una regla nueva no pueda
romper una vieja sin que algo avise.

**Alcance:** cuatro piezas de infraestructura.

1. **Sacar la PII.** El nombre real hardcodeado en `.credits` se reemplaza por algo
   genérico antes del primer commit.
2. **Repo git.** Local como mínimo; remoto privado (GitHub o GitLab) como backup real. La
   pérdida de la v11.5 fue exactamente el escenario que un repo evita.
   - `git init`.
   - Commit inicial: v11.0 (ya sin PII) como `index.html` en la raíz o en `src/`.
   - La v3.0 se guarda en `/legacy/v3.html` como referencia histórica, o se excluye. No
     aporta código reutilizable, solo contexto.
   - `.gitignore` mínimo. No hay build step todavía.
3. **Carpeta `docs/`** con `ARCHITECTURE.md`, `ROADMAP.md` y `DECISIONS.md` adentro del
   repo, al lado del código, no en un chat aparte.
4. **Fixtures de regresión.** El problema que se repite en todo el historial (Bad Apple,
   Oda a la Alegría, Blues) fue siempre el mismo: se arregla un caso y no hay forma de
   saber si una regla nueva rompe un caso viejo en silencio. La solución son datos: se
   graban los casos reales ya resueltos y se corre `MathEngine` contra ellos en Node. No
   hace falta framework de testing; un script con `assert` alcanza.

   Formato sugerido de una fixture:
   ```json
   {
     "name": "oda-a-la-alegria-re7",
     "universe": { "root": 0, "type": "major" },
     "notesPlayed": [50, 54, 57, 60],
     "expected": { "isDiatonic": false, "isSecondaryDominant": true, "target": "G" }
   }
   ```
   Cada caso nuevo que se resuelva (canción real, log real) se agrega como fixture. Cada
   fase que toque `MathEngine` corre las fixtures existentes antes de darse por terminada.

**Criterio de aceptación:** el repo existe con al menos 2 commits, las 3 fixtures (Bad
Apple, Oda a la Alegría, Blues Do7-Fa7-Sol7) están grabadas, y el runner `tests/run.js` las
corre con Node y `assert`, sin framework: 15 casos en verde. Cumplido el 2026-07-04; ya no
hay que correrlas a mano.

**Bloquea:** ninguna declarada

---

## FASE 1: Bug de raíz ambigua en `detectChord`

**Estado:** `cerrada (2026-07-04)`

**Objetivo:** preferir la interpretación más probable del acorde, el bajo como raíz, en vez
de la más baja numéricamente. Un numeral romano calculado sobre una raíz mal elegida es un
dato incorrecto que no se nota a simple vista (ver `ARCHITECTURE.md` §4), así que esta fase
va antes que los grados romanos.

**Alcance:** cambiar el orden de prioridad de las raíces candidatas en `detectChord`.
Probar primero el pitch class del bajo real (`bassPC`) como raíz, antes de iterar el resto,
y caer al orden ascendente genérico solo cuando el bajo no forma un template válido por sí
solo (inversión real). La matemática pura no lo resuelve del todo: Do6 y La m7 son el mismo
conjunto de cuatro notas, y ningún humano las separa sin escuchar la canción entera, así
que la fase no busca resolverlo perfecto. Se deja escrito en `DECISIONS.md` que la
ambigüedad total no tiene solución algorítmica simple. Implementada en la v11.6.

**Criterio de aceptación:** las fixtures de la Fase 0 siguen pasando y se agrega una fixture
nueva para el acorde ambiguo con bajo conocido. Cumplido con `tests/fixtures/raiz-ambigua.json`
(La m7 con bajo en La, Do6 con bajo en Do): `node tests/run.js` da 18 casos en verde.

**Bloquea:** Fase 3

---

## FASE 2: Fijar por escrito la jerarquía de evaluación armónica

**Estado:** `cerrada (2026-07-23)`

**Objetivo:** que la pregunta "¿en qué orden se evalúan las reglas cuando una nota no es
diatónica?" tenga una respuesta escrita, no un orden implícito en el código.

**Alcance:** fijar en `DECISIONS.md`, antes de programar, el orden de evaluación propuesto:

1. ¿Está en la escala activa? → `good`.
2. ¿Está en el acorde activo, incluyendo si ese acorde es una dominante secundaria
   reconocida? → `good`. Esto necesita que la Fase 3 conecte la detección de dominante
   secundaria a `evaluateMelody`, no solo a la UI, corrigiendo el gap que marcó el informe
   de campo.
3. ¿Es la sensible en contexto menor? → `tension`.
4. ¿Dura menos de 180ms al soltarse? → `passing`. Se evalúa al final, sobre lo que haya
   quedado como no-`good`.
5. Nada de lo anterior → `bad`.

Esto no es código todavía: es la especificación que la Fase 3 implementa.

**Criterio de aceptación:** el orden de evaluación queda escrito y fijado en `DECISIONS.md`
antes de programarlo. Cumplido el 2026-07-23: la jerarquía de cinco pasos quedó fijada en
`DECISIONS.md` (entrada 2026-07-23), con qué ya está en el código y qué completa la Fase 3.

**Bloquea:** ninguna declarada

---

## FASE 3: Grados romanos y conectar la dominante secundaria a la evaluación real

**Estado:** `pendiente`

**Objetivo:** que el motor muestre el numeral romano del acorde y que una nota de la
tonicización, por ejemplo Fa# sobre un Re7 en Do Mayor, deje de marcar error en la
evaluación, no solo en la UI.

**Alcance:**

1. `MathEngine.getRomanNumeral(chordObj, universeRoot)`: aritmética modular, mayúscula o
   minúscula según la calidad del acorde. Corregir el bug ya detectado en el chat previo:
   el numeral objetivo de una dominante secundaria no se fuerza a minúscula por defecto,
   se calcula como cualquier otro numeral (depende del grado real, no de una regla fija).
2. Conectar la detección de dominante secundaria a `evaluateMelody`, no solo a
   `updateStatus` (UI). Esto es lo que hace que tocar Fa# sobre un Re7 en Do Mayor deje de
   marcar error.
3. UI: el panel "Análisis de Armonía" muestra el numeral.
4. El motor emite al log, etiquetado, lo que esta fase agrega: el numeral romano derivado, la
   relación del acorde y el objetivo de la dominante secundaria. `classifyChordRelation`, que
   hoy no loguea (solo puebla la UI en `index.html:566`), pasa a registrar su resultado; esto
   cierra el hueco que la decisión del log del 2026-07-25 dejó anotado.

**Criterio de aceptación:** la fixture de Oda a la Alegría pasa mostrando `II7 (V del V)` (o
la etiqueta equivalente correcta), y Fa# tocado en la melodía sobre ese acorde ya no marca
error. Además, la validación es de tres vías a la vez: la fixture pasa desde los archivos, el
autor lo ve en Chrome, y el log registra el numeral, la relación y el veredicto nota por nota,
de modo que si la UI luego mueve el panel, la prueba ya quedó en el log.

**Bloquea:** Fase 4

**Bloqueada por:** Fase 1

---

## FASE 4: Función tonal

**Estado:** `pendiente`

**Objetivo:** que el motor nombre la función de cualquier acorde (Tónica: I, vi, iii;
Subdominante: IV, ii; Dominante: V, vii°) y la exponga en el buffer del motor para que
cualquier panel la consuma.

**Alcance:** es salida del motor, no una característica (ver el protocolo de clasificación
en `DECISIONS.md`, 2026-07-25). No lleva panel propio: el motor deriva la función del grado
del acorde en la tonalidad y la escribe en el buffer del motor, del que leen todos los
paneles a la vez. El material teórico ya está escrito en la sección "Track paralelo de
teoría" de este documento; el motor implementa eso: Tónica (I, vi, iii), Subdominante
(IV, ii), Dominante (V, vii°).

**Criterio de aceptación:** dado un acorde y una tonalidad, el motor devuelve su función, y
las fixtures existentes lo confirman en los casos que apliquen.

**Bloquea:** Fase 8.

**Bloqueada por:** Fase 3 (necesita el numeral romano).

---

## FASE 5: Reencuadre visual al modelo de paneles (el teclado como fondo)

**Estado:** `pendiente`

**Objetivo:** realinear la UI al modelo de capas del 2026-07-25, superando el primer intento
apilado. El fondo es una sola capa de piano más notas que caen; las características flotan como
widgets sobre ese fondo; y las opciones y los logs viven en un panel de pestañas, chrome
permanente. Sigue sin tocar el motor.

**Alcance:** los cambios son de disposición, estructura y estilo, no de motor. Fondo único: el
teclado y las notas que caen ocupan todo el ancho y alto, y las notas pasan por detrás de los
widgets, no en una franja aparte. Las características flotantes se tratan como widgets sobre el
fondo, sin construir todavía el gestor completo de paneles, que el ADR del 2026-07-24 reserva
para la segunda característica. El panel de pestañas se establece como chrome permanente para
opciones y logs, separado del fondo mudo. Y se decide dónde vive la salida del motor en el
modelo de capas, sobre el teclado, en una superficie de feedback permanente, o dentro del
widget que la pidió, garantizando que siga habiendo una lectura visible o que el log la cargue.
El teclado visual es fijo de 88 teclas a todo el ancho, independiente del zoom. No se toca el
motor ni el coloreo de `renderKeyboard`.

**Criterio de aceptación:** el fondo es una sola capa con el teclado y las notas a todo el
ancho, las notas pasan por detrás de los overlays, el panel de pestañas existe como chrome
permanente para opciones y logs, la salida del motor tiene un lugar visible definido o queda
cubierta por el log, el motor y el coloreo quedan intactos, los 18 fixtures siguen pasando, y
el autor lo corrobora en el navegador.

**Nota de reapertura (2026-07-25):** el primer intento, apilado, se construyó y quedó en
V11.19. Sirvió para ver que el modelo real es de capas, no de pila. Se reabre la fase para
realinear la disposición a capas según la refinación del modelo del 2026-07-25. El apilado
queda superado, no se borra del código hasta que esta fase corra. La palabra "característica"
de las fases anteriores se lee como "widget" según esa misma refinación.

**Bloquea:** Fase 9 (aporta la primera ranura y la estructura fondo-overlay).

**Bloqueada por:** ninguna declarada.

---

## FASE 6: Calidad de vida

**Estado:** `pendiente`

**Objetivo:** sumar las mejoras de calidad de vida que hoy faltan.

**Alcance:**

- Botón de reset a valores de fábrica (`State.config` más recarga).
- Persistir también `State.universe`. Hoy solo se persiste `State.config`.
- Panel de logs: expandir y contraer en vez de altura fija.
- "Fijar Acordes" dinámico: generar los botones I, IV, V según la escala activa, en vez de
  los dos acordes hardcodeados (Do Mayor y Re m7).

**Criterio de aceptación:** por definir.

**Bloquea:** ninguna declarada

---

## FASE 7: Feedback sonoro (Web Audio API)

**Estado:** `pendiente`

**Objetivo:** empezar a entrenar el oído sin mirar la pantalla, que es la brecha más grande
que marcó el informe de campo original.

**Alcance:** un sonido corto al acertar, otro para tensión, otro para error. Entre 10 y 20
líneas, sin dependencias.

**Criterio de aceptación:** por definir.

**Bloquea:** ninguna declarada

---

## FASE 8: Progresiones, detección de la secuencia de acordes

**Estado:** `pendiente`

**Objetivo:** que el motor detecte la secuencia de acordes en el tiempo y la exponga en el
buffer del motor.

**Alcance:** es salida del motor, no una característica (ver el protocolo de clasificación en
`DECISIONS.md`, 2026-07-25). El motor deriva la progresión del estado, los acordes que fueron
sonando, y la escribe en el buffer del motor. Sin panel todavía: esta fase solo produce la
salida que la característica de progresiones va a dibujar. Una progresión sin funciones
nombradas no dice nada, por eso depende de la función tonal.

**Criterio de aceptación:** el motor expone en el buffer la secuencia de acordes detectada
del estado, lista para que un panel la consuma.

**Bloquea:** Fase 9.

**Bloqueada por:** Fase 4 (la función tonal).

---

## FASE 9: Progresiones, la característica

**Estado:** `pendiente`

**Objetivo:** la característica de progresiones, el panel que dibuja la progresión y sus
ejemplos en una ranura.

**Alcance:** es una característica, un panel en una ranura. Reusa el sistema de ranuras que
estrena la Fase 5 (las ranuras reservadas) y consume la secuencia de acordes del buffer del
motor que produce la Fase 8.

**Criterio de aceptación:** por definir cuando exista la Fase 8 (detección de secuencia).

**Bloqueada por:** Fase 8 (detección de secuencia) y Fase 5 (el sistema de ranuras).

---

## FASE 10: Rueda de quintas como vista alterna de la escala

**Estado:** `pendiente`

**Objetivo:** agregar la rueda de quintas como segunda vista dentro del panel de la escala,
con el conmutador que alterna entre lineal y rueda. El conmutador nace acá, con la segunda
vista.

**Alcance:** esta fase mueve la escala del teclado a un panel de característica en una ranura,
primero en vista lineal, y le suma la rueda de quintas como vista alterna con su conmutador. La
rueda deriva del motor (`scalePitches`), no hardcodea nada. Queda abierto si además muestra las
calidades de acorde diatónicas (3 mayores, 3 menores, 1 disminuido): si las muestra, necesita
la función tonal que expone la Fase 4, porque el motor no deriva calidad por grado hoy. La
iluminación de posiciones es sutil.

**Criterio de aceptación:** por definir cuando se decida el contenido (solo notas de la
escala, o también calidades).

**Bloquea:** ninguna declarada.

**Bloqueada por:** Fase 5 (la estructura de fondo y ranuras debe existir); y Fase 4 si muestra
calidades de acorde. No depende de las fases de progresiones; su número es posterior por
secuencia de decisión, no por dependencia.

---

## BACKLOG (sin fecha, necesita más teoría antes de programarse)

- Modos griegos (Dórico, Frigio, Mixolidio, Lidio): extensión directa de `SCALES`.
- Pentatónicas y Blues como universos propios, no como parches de excepción.
- Glosario in-app que crezca junto con lo aprendido.
- Modo "canción": cargar un MIDI, reproducir el bajo, evaluar la melodía en vivo.
- Entrenamiento de oído puro (dictado de intervalos, identificar un acorde solo de oído).
  El informe de campo ya marcó esto como el objetivo final, y el software actual no lo
  cubre.

---

## Track paralelo de teoría (no bloquea código, informa las Fases 2, 3 y 4)

- Círculo de quintas: ya lo derivaste vos aplicando T-T-S-T-T-T-S desde Re y sacando Do# y
  Fa#. Falta amarrar el nombre "círculo de quintas" a algo que ya sabés hacer, no aprender
  un sistema nuevo.
- Función tonal: Tónica (I, vi, iii), Subdominante (IV, ii), Dominante (V, vii°). Esto
  reemplaza la idea de "progresión obligatoria" que vos mismo cuestionaste. No hay una
  secuencia fija de grados; hay funciones que se resuelven entre sí.
- Dominante secundaria: lo que llamás "una nota que empuja y vuelve" ya tiene nombre, V/V,
  V/ii. Fijar el vocabulario ayuda a leer `DECISIONS.md` y el código sin reinventar el
  concepto cada vez.
