# ROADMAP.md: MIDI Scale Trainer Pro

> Cómo se usa este documento con Claude Code: una fase por sesión. No se pasa a la fase
> siguiente sin probar la anterior en el piano físico. Cada decisión de teoría musical o
> de arquitectura que se tome durante una fase se anota en `DECISIONS.md` con fecha. No se
> pierde en un chat.

**Valores de estado:** `pendiente`, `en progreso`, `cerrada (YYYY-MM-DD)`.

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

**Criterio de aceptación:** la fixture de Oda a la Alegría pasa mostrando `II7 (V del V)` (o
la etiqueta equivalente correcta), y Fa# tocado en la melodía sobre ese acorde ya no marca
error.

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

## FASE 5: Escala como característica sobre el fondo fijo (vista lineal)

**Estado:** `pendiente`

**Objetivo:** reencuadrar la UI actual al modelo de paneles del ADR del 2026-07-24. El
teclado pasa a ser el fondo fijo; la escala que hoy se muestra en lineal se vuelve un panel
de característica en una ranura. Sin rueda y sin conmutador: con una sola vista no hay nada
que conmutar.

**Alcance:** es presentación pura. El panel lee solo lo que el motor ya expone, las notas de
la escala activa vía `scalePitches`; no cambia una línea del motor. Establece la estructura
de fondo más overlay y la primera ranura. No construye el gestor de paneles completo (el ADR
del 2026-07-24 dice por qué espera a la segunda característica) ni un sistema de barras de
título. La presentación es sutil.

**Criterio de aceptación:** el teclado queda de fondo fijo, la escala se ve como panel sobre
él en vista lineal, el motor queda intacto y los 18 fixtures siguen pasando. El "se siente
reorganizado" lo corrobora el autor en el navegador.

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
estrena la Fase 5 (la escala con rueda) y consume la secuencia de acordes del buffer del
motor que produce la Fase 8.

**Criterio de aceptación:** por definir cuando exista la Fase 8 (detección de secuencia).

**Bloqueada por:** Fase 8 (detección de secuencia) y Fase 5 (el sistema de ranuras).

---

## FASE 10: Rueda de quintas como vista alterna de la escala

**Estado:** `pendiente`

**Objetivo:** agregar la rueda de quintas como segunda vista dentro del panel de la escala,
con el conmutador que alterna entre lineal y rueda. El conmutador nace acá, con la segunda
vista.

**Alcance:** la rueda deriva del motor (`scalePitches`), no hardcodea nada. Queda abierto si
además muestra las calidades de acorde diatónicas (3 mayores, 3 menores, 1 disminuido): si
las muestra, necesita la función tonal que expone la Fase 4, porque el motor no deriva
calidad por grado hoy. La iluminación de posiciones es sutil.

**Criterio de aceptación:** por definir cuando se decida el contenido (solo notas de la
escala, o también calidades).

**Bloquea:** ninguna declarada.

**Bloqueada por:** Fase 5 (el panel de escala debe existir); y Fase 4 si muestra calidades de
acorde. No depende de las fases de progresiones; su número es posterior por secuencia de
decisión, no por dependencia.

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
