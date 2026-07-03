# ROADMAP.md — MIDI Scale Trainer Pro

> Cómo usar este documento con Claude Code: una fase por sesión. No se avanza a la
> siguiente fase sin probar la anterior en el piano físico. Cada decisión de teoría
> musical o de arquitectura que se tome durante una fase se anota en `DECISIONS.md`
> con fecha, no se pierde en un chat.

---

## FASE 0 — Infraestructura (antes de tocar una sola regla de teoría musical)

**Objetivo:** que este proyecto nunca se vuelva a perder, y que agregar una regla nueva
no pueda romper una regla vieja sin que algo lo avise.

1. **Sacar la PII.** Reemplazar el nombre hardcodeado en `.credits` por algo genérico o
   quitarlo, antes de cualquier commit.
2. **Repo git.** Local como mínimo; remoto privado (GitHub/GitLab) recomendado como backup
   real — la pérdida de v11.5 fue exactamente el escenario que un repo previene.
   - `git init`
   - Commit inicial: v11.0 (ya limpio de PII) como `index.html` en la raíz o `src/`.
   - `v3.0` se puede guardar en `/legacy/v3.html` solo como referencia histórica, o
     excluirse del repo — no aporta código a reutilizar, solo contexto.
   - `.gitignore` mínimo (nada específico todavía, no hay build step).
3. **Carpeta `docs/`** con `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md` (estos tres
   documentos) en el repo, junto al código — no en un chat aparte.
4. **Fixtures de regresión.** El problema recurrente de todo el historial (Bad Apple,
   Oda a la Alegría, Blues) fue: se soluciona un caso, y no hay forma de saber si una
   regla nueva rompe silenciosamente un caso viejo. Solución: grabar los casos reales
   ya resueltos como datos de prueba y correr `MathEngine` contra ellos en Node (sin
   framework de testing, un script con `assert` alcanza).

   Ejemplo de fixture (formato sugerido, no final):
   ```json
   {
     "name": "oda-a-la-alegria-re7",
     "universe": { "root": 0, "type": "major" },
     "notesPlayed": [50, 54, 57, 60],
     "expected": { "isDiatonic": false, "isSecondaryDominant": true, "target": "G" }
   }
   ```
   Cada vez que se resuelva un caso nuevo (canción real, log real), se agrega como
   fixture. Cada fase de este roadmap que toque `MathEngine` corre las fixtures
   existentes antes de darse por terminada.

**Criterio de éxito de la Fase 0:** el repo existe, tiene al menos 2 commits, y hay al
menos 3 fixtures grabadas (Bad Apple / Oda a la Alegría / Blues Do7-Fa7-Sol7) aunque
todavía no haya test runner automatizado — pueden correrse a mano al principio.

---

## FASE 1 — Bug de raíz ambigua en `detectChord` (bloqueante para Fase 3)

**Por qué va antes que Grados Romanos:** un numeral romano calculado sobre una raíz mal
elegida es un dato incorrecto que no se nota a simple vista (ver `ARCHITECTURE.md` §4).

**Tarea:** cambiar el orden de prioridad de raíces candidatas en `detectChord`. Opción
más simple: probar primero el pitch class del **bajo real** (`bassPC`) como raíz antes
de iterar el resto — así una tríada en posición fundamental o con bajo claro se identifica
correctamente, y solo se cae al orden ascendente genérico cuando el bajo no forma un
template válido por sí solo (inversión real).

**No se resuelve del todo con matemática pura** — hay ambigüedad enarmónica real (Do6 y
Lam7 son el mismo conjunto de notas) que ni un humano resuelve sin contexto de la canción
completa. El objetivo de esta fase no es "resolverlo perfecto", es "preferir la
interpretación más probable (bajo como raíz) en vez de la más baja numéricamente", y
dejar documentado en `DECISIONS.md` que la ambigüedad total no tiene solución algorítmica
simple.

**Criterio de éxito:** las fixtures de Fase 0 siguen pasando, y se agrega una fixture
nueva específica para este caso (acorde ambiguo con bajo conocido).

---

## FASE 2 — Formalizar la jerarquía de evaluación armónica

**Objetivo:** que la pregunta "¿en qué orden se evalúan las reglas cuando una nota no es
diatónica?" tenga una respuesta escrita, no un orden implícito en el código.

Propuesta de orden a discutir y fijar en `DECISIONS.md` antes de programar:

1. ¿Está en la escala activa? → `good`
2. ¿Está en el acorde activo (incluyendo si el acorde activo es una dominante secundaria
   reconocida)? → `good` — **esto requiere que la Fase 3 conecte la detección de
   dominante secundaria a `evaluateMelody`, no solo a la UI**, corrigiendo el gap que
   señaló el informe de campo.
3. ¿Es la sensible en contexto menor? → `tension`
4. ¿Dura menos de 180ms al soltarse? → `passing` (se evalúa al final, sobre lo que haya
   quedado como no-`good`)
5. Nada de lo anterior → `bad`

Esto no es código todavía — es la especificación que Claude Code implementa en la Fase 3.

---

## FASE 3 — Grados Romanos + conectar dominante secundaria a la evaluación real

1. `MathEngine.getRomanNumeral(chordObj, universeRoot)` — aritmética modular, mayúscula/
   minúscula según calidad del acorde. **Corregir el bug ya detectado en el chat previo**:
   el numeral objetivo de una dominante secundaria no se fuerza a minúscula por defecto,
   se calcula igual que cualquier otro numeral (depende del grado real, no de una regla
   fija).
2. Conectar la detección de dominante secundaria a `evaluateMelody`, no solo a
   `updateStatus` (UI). Esto es lo que hace que tocar Fa# sobre un Re7 en Do Mayor deje
   de marcar error.
3. UI: panel "Análisis de Armonía" muestra el numeral.

**Criterio de éxito:** fixture de Oda a la Alegría pasa mostrando `II7 (V del V)` (o
etiqueta equivalente correcta), y Fa# tocado en la melodía sobre ese acorde ya no
marca error.

---

## FASE 4 — Calidad de vida

- Botón de reset a valores de fábrica (`State.config` + recarga).
- Persistir también `State.universe` (hoy solo se persiste `State.config`).
- Panel de logs: expandir/contraer en vez de altura fija.
- "Fijar Acordes" dinámico: generar botones I/IV/V según la escala activa en vez de
  Do Mayor / Re m7 hardcodeados.

---

## FASE 5 — Feedback sonoro (Web Audio API)

Sonido corto al acertar, sonido distinto para tensión, distinto para error. ~10-20 líneas,
sin dependencias. Empieza a entrenar el oído sin mirar la pantalla — es la brecha más
grande que señaló el informe de campo original.

---

## BACKLOG (sin fecha, requiere más teoría antes de programarse)

- Modos griegos (Dórico, Frigio, Mixolidio, Lidio) — extensión directa de `SCALES`.
- Pentatónicas y Blues como universos, no como parches de excepción.
- Visualización del círculo de quintas (nota: matemáticamente ya derivable de la fórmula
  T-T-S-T-T-T-S aplicada 7 veces — no es un sistema nuevo, es una vista distinta de lo
  que `MathEngine` ya calcula).
- Glosario/base de conocimiento in-app que crezca junto con lo aprendido.
- Modo "canción": cargar MIDI, reproducir bajo, evaluar melodía en vivo.
- Entrenamiento de oído puro (dictado de intervalos, identificar acorde solo al oído) —
  el informe de campo ya marcó esto como el objetivo final y el software actual no lo
  cubre en absoluto.

---

## Track paralelo de teoría (no bloquea código, pero informa las Fases 2-3)

- Círculo de quintas: ya lo derivaste vos mismo aplicando T-T-S-T-T-T-S desde Re y
  obteniendo Do#/Fa# — falta amarrar el nombre "círculo de quintas" a algo que ya sabés
  hacer, no aprender un sistema nuevo.
- Función tonal: Tónica (I, vi, iii) / Subdominante (IV, ii) / Dominante (V, vii°). Esto
  reemplaza la idea de "progresión obligatoria" que cuestionaste vos mismo — no hay una
  secuencia fija de grados, hay funciones que se resuelven entre sí.
- Vocabulario de dominante secundaria: lo que llamás informalmente "una nota que empuja y
  vuelve" ya tiene nombre — V/V, V/ii, etc. Fijar el vocabulario ayuda a leer `DECISIONS.md`
  y el código sin reinventar el concepto cada vez.
