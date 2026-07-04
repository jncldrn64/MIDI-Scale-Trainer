# ROADMAP.md: MIDI Scale Trainer Pro

> Cómo se usa este documento con Claude Code: una fase por sesión. No se pasa a la fase
> siguiente sin probar la anterior en el piano físico. Cada decisión de teoría musical o
> de arquitectura que se tome durante una fase se anota en `DECISIONS.md` con fecha. No se
> pierde en un chat.

---

## FASE 0: Infraestructura, antes de tocar una regla de teoría musical

**Objetivo:** que el proyecto no se vuelva a perder, y que agregar una regla nueva no
pueda romper una vieja sin que algo avise.

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

**Criterio de éxito:** el repo existe, tiene al menos 2 commits, y hay al menos 3 fixtures
grabadas (Bad Apple, Oda a la Alegría, Blues Do7-Fa7-Sol7). Alcanza con correrlas a mano
al principio, aunque todavía no haya runner automatizado.

---

## FASE 1: Bug de raíz ambigua en `detectChord`

Bloquea la Fase 3. Un numeral romano calculado sobre una raíz mal elegida es un dato
incorrecto que no se nota a simple vista (ver `ARCHITECTURE.md` §4). Por eso va antes que
los grados romanos.

**Tarea:** cambiar el orden de prioridad de las raíces candidatas en `detectChord`. La
opción más simple es probar primero el pitch class del bajo real (`bassPC`) como raíz,
antes de iterar el resto. Así una tríada en posición fundamental o con bajo claro se
identifica bien, y solo se cae al orden ascendente genérico cuando el bajo no forma un
template válido por sí solo (inversión real).

La matemática pura no lo resuelve del todo. Do6 y La m7 son el mismo conjunto de cuatro
notas; ningún humano las separa sin escuchar la canción entera. El objetivo de esta fase
no es resolverlo perfecto. Es preferir la interpretación más probable (bajo como raíz) en
vez de la más baja numéricamente, y dejar escrito en `DECISIONS.md` que la ambigüedad
total no tiene solución algorítmica simple.

**Criterio de éxito:** las fixtures de la Fase 0 siguen pasando, y se agrega una fixture
nueva para este caso (acorde ambiguo con bajo conocido).

---

## FASE 2: Fijar por escrito la jerarquía de evaluación armónica

**Objetivo:** que la pregunta "¿en qué orden se evalúan las reglas cuando una nota no es
diatónica?" tenga una respuesta escrita, no un orden implícito en el código.

Orden propuesto, a discutir y fijar en `DECISIONS.md` antes de programar:

1. ¿Está en la escala activa? → `good`.
2. ¿Está en el acorde activo, incluyendo si ese acorde es una dominante secundaria
   reconocida? → `good`. Esto necesita que la Fase 3 conecte la detección de dominante
   secundaria a `evaluateMelody`, no solo a la UI, corrigiendo el gap que marcó el informe
   de campo.
3. ¿Es la sensible en contexto menor? → `tension`.
4. ¿Dura menos de 180ms al soltarse? → `passing`. Se evalúa al final, sobre lo que haya
   quedado como no-`good`.
5. Nada de lo anterior → `bad`.

Esto no es código todavía. Es la especificación que Claude Code implementa en la Fase 3.

---

## FASE 3: Grados romanos y conectar la dominante secundaria a la evaluación real

1. `MathEngine.getRomanNumeral(chordObj, universeRoot)`: aritmética modular, mayúscula o
   minúscula según la calidad del acorde. Corregir el bug ya detectado en el chat previo:
   el numeral objetivo de una dominante secundaria no se fuerza a minúscula por defecto,
   se calcula como cualquier otro numeral (depende del grado real, no de una regla fija).
2. Conectar la detección de dominante secundaria a `evaluateMelody`, no solo a
   `updateStatus` (UI). Esto es lo que hace que tocar Fa# sobre un Re7 en Do Mayor deje de
   marcar error.
3. UI: el panel "Análisis de Armonía" muestra el numeral.

**Criterio de éxito:** la fixture de Oda a la Alegría pasa mostrando `II7 (V del V)` (o la
etiqueta equivalente correcta), y Fa# tocado en la melodía sobre ese acorde ya no marca
error.

---

## FASE 4: Calidad de vida

- Botón de reset a valores de fábrica (`State.config` más recarga).
- Persistir también `State.universe`. Hoy solo se persiste `State.config`.
- Panel de logs: expandir y contraer en vez de altura fija.
- "Fijar Acordes" dinámico: generar los botones I, IV, V según la escala activa, en vez de
  los dos acordes hardcodeados (Do Mayor y Re m7).

---

## FASE 5: Feedback sonoro (Web Audio API)

Un sonido corto al acertar, otro para tensión, otro para error. Entre 10 y 20 líneas, sin
dependencias. Empieza a entrenar el oído sin mirar la pantalla, que es la brecha más grande
que marcó el informe de campo original.

---

## BACKLOG (sin fecha, necesita más teoría antes de programarse)

- Modos griegos (Dórico, Frigio, Mixolidio, Lidio): extensión directa de `SCALES`.
- Pentatónicas y Blues como universos propios, no como parches de excepción.
- Círculo de quintas. Ya es derivable de la fórmula T-T-S-T-T-T-S aplicada 7 veces. No es
  un sistema nuevo; es otra vista de lo que `MathEngine` ya calcula.
- Glosario in-app que crezca junto con lo aprendido.
- Modo "canción": cargar un MIDI, reproducir el bajo, evaluar la melodía en vivo.
- Entrenamiento de oído puro (dictado de intervalos, identificar un acorde solo de oído).
  El informe de campo ya marcó esto como el objetivo final, y el software actual no lo
  cubre.

---

## Track paralelo de teoría (no bloquea código, informa las Fases 2 y 3)

- Círculo de quintas: ya lo derivaste vos aplicando T-T-S-T-T-T-S desde Re y sacando Do# y
  Fa#. Falta amarrar el nombre "círculo de quintas" a algo que ya sabés hacer, no aprender
  un sistema nuevo.
- Función tonal: Tónica (I, vi, iii), Subdominante (IV, ii), Dominante (V, vii°). Esto
  reemplaza la idea de "progresión obligatoria" que vos mismo cuestionaste. No hay una
  secuencia fija de grados; hay funciones que se resuelven entre sí.
- Dominante secundaria: lo que llamás "una nota que empuja y vuelve" ya tiene nombre, V/V,
  V/ii. Fijar el vocabulario ayuda a leer `DECISIONS.md` y el código sin reinventar el
  concepto cada vez.
