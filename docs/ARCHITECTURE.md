# ARCHITECTURE.md — MIDI Scale Trainer Pro

> **Regla de este documento:** todo lo escrito acá está verificado línea por línea contra
> el código fuente real. Si algo no se pudo verificar, se marca explícitamente como
> "no verificado" o "narrativa no confirmada". Este proyecto perdió una versión (v11.5)
> que solo existía como descripción en chats de IA — nunca más se documenta algo como
> hecho sin haber leído el código que lo prueba.

## 0. Punto de partida real

- **Fuente de verdad actual:** `midi-trainer-completo_v11_0.html` (604 líneas), verificado
  el 2026-07-03.
- **v3.0** (3514 líneas): arquetipo procedimental temprano, se conserva solo como referencia
  histórica de "qué NO hacer" (evaluación binaria, sin módulos, comentarios de dependencias
  en vez de dependencias reales).
- **v11.5:** código perdido. Todo lo que se decía de v11.5 (V10.1–V10.5, V11.1–V11.3, con
  changelog detallado) proviene de reconstrucciones narrativas de Gemini sobre logs de chat,
  **no de haber leído el archivo**. Se trata como hipótesis no verificada, no como historia.
  No se reconstruye de memoria: se reconstruye hacia adelante, versionado desde ya.

## 1. Modelo de estado (`State`)

```js
State = {
  config: { latino, accumMs, holdMs, errMs, splitNote },  // persistido en localStorage
  universe: { root, type, validPitches: Set },             // NO persistido (bug conocido)
  midi: { access, activeBasses: Set, activeMelodies: Set, keysDown: Set, sustainActive },
  harmony: { chord, isLocked },
  evaluations: Map<midiNote, {status, timeout, startTime}>,
  timers: { accumulation, contextHold },
  logHistory: []
}
```

Fuente única de verdad centralizada. Sin frameworks, sin proxies reactivos — el render se
dispara manualmente llamando `UI.renderKeyboard()` / `UI.updateStatus()` después de cada
mutación. Esto funciona porque el volumen de mutaciones por segundo es bajo (eventos MIDI
humanos, no un loop de animación).

## 2. Separación de responsabilidades (confirmada en código)

| Módulo | Responsabilidad | Toca el DOM |
|---|---|---|
| `MathEngine` | Detección de acordes, diatonismo | No — función pura |
| `MIDI` | Recibe eventos hardware, actualiza `State`, dispara evaluación | Indirectamente (llama a `UI.*`) |
| `UI` | Construye/pinta teclado, actualiza paneles | Sí |
| `SysLog` / config | Logs y persistencia | Sí (logs) / localStorage (config) |

`MathEngine.detectChord` y `MathEngine.isDiatonic` no leen `State` ni el DOM — reciben
argumentos y devuelven datos. Esto es correcto y hay que preservarlo: cualquier lógica
nueva de teoría musical (grados romanos, prioridad de reglas armónicas) debe vivir acá,
no en `UI` ni en `MIDI`.

## 3. Flujo de evento MIDI (verificado)

```
noteOn(note, vel)
  → keysDown.add(note)
  → si note < splitNote:  activeBasses.add(note) → triggerAccumulation()
  → si note >= splitNote: activeMelodies.add(note) → evaluateMelody(note)
  → UI.renderKeyboard() + UI.updateStatus()

triggerAccumulation()
  → espera accumMs (debounce)
  → si activeBasses.size >= 3 → MathEngine.detectChord(activeBasses)
  → guarda en State.harmony.chord

evaluateMelody(note)
  → inScale = pc está en validPitches
  → inChord = pc está en el template del acorde activo
  → isSensible = escala menor && pc === (root+11)%12 && !inScale && !inChord
  → status = inScale||inChord ? 'good' : (isSensible ? 'tension' : 'bad')
  → si status !== 'good': se autolimpia solo a los errMs ms (timeout)

releaseNoteInternal(note, isBass)  [al soltar la tecla]
  → duration = now - startTime
  → si status !== 'good' && duration < 180ms → status = 'passing' (INDULTO)
```

**Detalle importante no documentado antes:** el indulto de 180ms aplica a **cualquier**
estado que no sea `'good'` — incluye tanto `'bad'` como `'tension'`. Una nota de tensión
legítima que dura menos de 180ms se reclasifica igual a `'passing'`. No rompe nada hoy,
pero si en el futuro se quiere distinguir visualmente "tensión corta" de "error corto",
esta línea hay que tocarla.

## 4. Detección de acorde: el bug de raíz ambigua (hallazgo nuevo, no documentado antes)

```js
detectChord(notesArray) {
  const pitchClasses = [...new Set(notesArray.map(n => n % 12))].sort((a,b) => a-b);
  for (let root of pitchClasses) {           // ← itera en orden ASCENDENTE de pitch class
    const intervals = pitchClasses.map(pc => (pc - root + 12) % 12).sort((a,b)=>a-b);
    for (const [type, template] of Object.entries(CHORD_TEMPLATES)) {
      if (template matches intervals) return { rootPC: root, type, ... };  // primer match gana
    }
  }
}
```

**Problema:** para un mismo conjunto de notas físicas, este algoritmo **siempre** elige
la raíz de menor pitch class que matchee algún template, sin importar dónde está el bajo
ni la intención armónica real.

**Ejemplo concreto:** Do-Mi-Sol-La (pitch classes 0,4,7,9).
- Probando raíz=0 (Do) primero (por ser la más baja numéricamente): intervalos `[0,4,7,9]`
  → matchea el template `'6'` → el motor dice **"Do6"**.
- Nunca prueba la interpretación **"La menor 7"** (La-Do-Mi-Sol, mismas notas, raíz=9),
  aunque el bajo físico esté en La y la canción esté claramente en vi7.

Esto es tolerable hoy porque el output es solo texto informativo. **Deja de ser tolerable
en cuanto se implementen Grados Romanos**, porque el numeral depende 100% de qué pitch
class se eligió como raíz. El motor nunca tirará error — tirará el numeral equivocado
de forma silenciosa y consistente. Este bug se prioriza en el roadmap antes de Grados
Romanos (ver `ROADMAP.md`, Fase 1).

## 5. Evaluación armónica: reglas existentes, sin jerarquía formal (gap real)

Hoy conviven, sin un orden explícito documentado en ningún lado:

1. Nota dentro de la escala activa (`inScale`)
2. Nota dentro del acorde activo (`inChord`)
3. Sensible en escala menor (`isSensible`)
4. Paso cromático por duración (`<180ms` al soltar)
5. Dominante secundaria — **solo visual, no afecta `evaluateMelody`**
6. Intercambio modal — fallback genérico cuando nada más aplica, **solo visual**

El orden en que estas reglas se evalúan hoy es un accidente del orden del código, no una
decisión de diseño escrita. Antes de agregar Grados Romanos hace falta fijar por escrito
la prioridad de estas reglas (ver `ROADMAP.md`, Fase 2) para que agregar una regla nueva
no dependa de adivinar en qué orden compiten con las existentes.

## 6. Gaps confirmados (no narrativa — confirmados leyendo el código)

- `State.universe` (tonalidad/escala elegida) no se persiste — solo `State.config`.
- Sin feedback sonoro (cero Web Audio API en el archivo).
- "Fijar Acordes" hardcodea Do Mayor y Re m7 únicamente.
- Sin control de versiones — el proyecto vivió y se perdió como archivos sueltos.
- **PII hardcodeada:** el `<div class="credits">` tiene un nombre real hardcodeado en el
  HTML. Se debe reemplazar antes de subir esto a cualquier repositorio, incluso privado.

## 7. Decisión de arquitectura: no framework (por ahora)

604 líneas con objetos-módulo (`State`/`MathEngine`/`MIDI`/`UI`) ya separan responsabilidades
razonablemente. Los colapsos históricos documentados (freeze de hilo principal, fuga de
memoria por `innerHTML +=`) fueron problemas de patrones DOM/async, no del lenguaje. Migrar
a React/Vue ahora no resuelve el bug de raíz ambigua ni ningún problema de teoría musical, y
apila una curva de aprendizaje adicional sobre la de teoría musical, que es la prioridad real.

**Umbral de reconsideración:** si el archivo supera ~1000 líneas o el estado se vuelve
genuinamente difícil de razonar, el primer paso es modularizar con ES Modules nativos
(`<script type="module">`), no adoptar un framework. Un framework se reconsidera solo si
aparece una necesidad real de UI reactiva compleja (ej. múltiples vistas, routing) que hoy
no existe.
