# ARCHITECTURE.md: MIDI Scale Trainer Pro

> **Regla de este documento:** todo lo que está acá se verificó línea por línea contra
> el código real. Lo que no se pudo verificar se marca como "no verificado" o "narrativa
> no confirmada". Este proyecto ya perdió una versión, la v11.5, que existía solo como
> descripción en chats de IA. No se vuelve a documentar nada como hecho sin haber leído
> el código que lo prueba.

## 0. Punto de partida real

La fuente de verdad es `midi-trainer-completo_v11_0.html`, 604 líneas, verificado el
2026-07-03. Todo lo demás es referencia o hipótesis.

La v3.0 tiene 3514 líneas y se guarda solo como muestra de qué no hacer: evaluación
binaria, cero módulos, comentarios que describen dependencias en vez de dependencias
reales.

La v11.5 no existe como archivo. El changelog detallado que se le atribuye (V10.1 a
V10.5, V11.1 a V11.3) sale de reconstrucciones de Gemini sobre logs de chat, no de haber
abierto el archivo. Se trata como hipótesis no verificada. No se reconstruye de memoria;
se reconstruye hacia adelante, versionado desde ahora.

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

El estado es único y centralizado. No hay framework ni proxy reactivo. El render se
dispara a mano llamando `UI.renderKeyboard()` y `UI.updateStatus()` después de cada
mutación. Esto alcanza porque el volumen de mutaciones por segundo es bajo: eventos MIDI
de dedos humanos, no un loop de animación a 60 fps.

## 2. Separación de responsabilidades (confirmada en código)

| Módulo | Responsabilidad | Toca el DOM | Vive en |
|---|---|---|---|
| `MathEngine` | Detección de acordes, diatonismo | No, función pura | `src/engine.js` |
| `MIDI` | Recibe eventos hardware, actualiza `State`, dispara evaluación | Indirecto (llama a `UI.*`) | `index.html` |
| `UI` | Construye y pinta el teclado, actualiza paneles | Sí | `index.html` |
| `SysLog` / config | Logs y persistencia | Sí (logs) / localStorage (config) | `index.html` |

`MathEngine.detectChord` y `MathEngine.isDiatonic` no leen `State` ni el DOM. Reciben
argumentos y devuelven datos. Desde la extracción del 2026-07-04 (ver `DECISIONS.md`),
`MathEngine` y las tres reglas puras `classifyChordRelation`, `evaluateMelodyStatus` y
`applyPassingTone` viven en `src/engine.js`, que `index.html` carga con `<script src>`. El
resto (`State`, `MIDI`, `UI`, `SysLog`) sigue en `index.html`. Cualquier lógica nueva de
teoría musical (grados romanos, prioridad de reglas armónicas) va en `src/engine.js`, no en
`UI` ni en `MIDI`. Esa es la línea que mantiene las fixtures corriendo en Node contra el
mismo código que usa el navegador.

## 3. Flujo de evento MIDI (verificado)

```
noteOn(note, vel)
  → keysDown.add(note)
  → si note < splitNote:  activeBasses.add(note) → triggerAccumulation()
  → si note >= splitNote: activeMelodies.add(note) → evaluateMelody(note)
  → UI.renderKeyboard() + UI.updateStatus()

triggerAccumulation()
  → espera accumMs (debounce, 120ms por defecto)
  → si activeBasses.size >= 3 → MathEngine.detectChord(activeBasses)
  → guarda en State.harmony.chord

evaluateMelody(note)
  → inScale = pc está en validPitches
  → inChord = pc está en el template del acorde activo
  → isSensible = escala menor && pc === (root+11)%12 && !inScale && !inChord
  → status = inScale||inChord ? 'good' : (isSensible ? 'tension' : 'bad')
  → si status !== 'good': se autolimpia a los errMs (1000ms por defecto)

releaseNoteInternal(note, isBass)  [al soltar la tecla]
  → duration = now - startTime
  → si status !== 'good' && duration < 180ms → status = 'passing' (INDULTO)
```

El indulto de 180ms aplica a cualquier estado que no sea `'good'`, o sea a `'bad'` y a
`'tension'` por igual. Una nota de tensión legítima que dura 179ms se reclasifica a
`'passing'` igual que un error. Hoy no rompe nada. El día que se quiera distinguir
"tensión corta" de "error corto" en pantalla, esta línea es la que hay que tocar.

## 4. Detección de acorde: raíz por el bajo, y la ambigüedad que queda

```js
detectChord(notesArray) {
  const pitchClasses = [...new Set(notesArray.map(n => n % 12))].sort((a,b) => a-b);
  const bassPC = Math.min(...notesArray) % 12;
  const candidateRoots = [bassPC, ...pitchClasses.filter(pc => pc !== bassPC)];  // el bajo, primero
  for (const root of candidateRoots) {
    const intervals = pitchClasses.map(pc => (pc - root + 12) % 12).sort((a,b)=>a-b);
    for (const [type, template] of Object.entries(CHORD_TEMPLATES)) {
      if (template matches intervals) return { rootPC: root, type, bassPC, ... };  // primer match gana
    }
  }
}
```

Desde la v11.6 (Fase 1), el algoritmo prueba el pitch class del bajo real como raíz antes
que el orden ascendente. `src/engine.js:54` calcula `bassPC`; `:60` arma `candidateRoots`
con el bajo al frente. Si el bajo forma un template, gana esa lectura; si no, cae al orden
ascendente, que es la inversión real.

El caso Do-Mi-Sol-La sigue de ejemplo, pitch classes 0, 4, 7, 9. Con el bajo en La el motor
devuelve La m7; con el bajo en Do, Do6. El bajo decide, que es lo que antes no pasaba: la
versión previa a la v11.6 devolvía siempre Do6, por ser Do la raíz de menor pitch class.

Lo que no se resuelve es la ambigüedad enarmónica de fondo. Con el bajo en Do el motor dice
Do6, pero esas mismas cuatro notas con Do en el bajo también pueden ser La m7 en primera
inversión (Am7/C). El bajo ya no alcanza para separarlas; solo el contexto de la canción
entera lo hace, y eso no tiene solución algorítmica simple (ver `DECISIONS.md`, 2026-07-04).
No es un bug abierto: es un límite documentado.

Para los grados romanos esto importa: el numeral depende cien por ciento de qué pitch class
quedó como raíz. Ahora la raíz sigue al bajo, la apuesta más probable, pero cuando la
ambigüedad persiste el numeral la hereda.

## 5. Evaluación armónica: seis reglas sin jerarquía escrita

Hoy conviven seis reglas y ninguna tiene un orden documentado:

1. Nota dentro de la escala activa (`inScale`).
2. Nota dentro del acorde activo (`inChord`).
3. Sensible en escala menor (`isSensible`).
4. Paso cromático por duración: menos de 180ms al soltar.
5. Dominante secundaria: solo actualiza la UI, no afecta `evaluateMelody`.
6. Intercambio modal: fallback genérico cuando nada más aplica, también solo visual.

El orden en que se evalúan es un accidente del orden del código, no una decisión escrita.
Antes de agregar grados romanos hay que fijar por escrito esa prioridad (ver `ROADMAP.md`,
Fase 2), para que sumar una regla nueva no dependa de adivinar contra qué compite.

## 6. Gaps confirmados leyendo el código

- `State.universe` (tonalidad y escala elegidas) no se persiste. Solo se persiste
  `State.config`. Recargás la página y perdés la tonalidad.
- Cero feedback sonoro. No hay una sola llamada a Web Audio API en el código.
- "Fijar Acordes" hardcodea dos acordes: Do Mayor y Re m7.

## 7. No framework, por ahora

Hoy el código son dos archivos: `index.html` (573 líneas: `State`, `MIDI`, `UI`, `SysLog`)
y `src/engine.js` (145 líneas: `MathEngine` y las tres reglas puras). Los objetos-módulo ya
separan responsabilidades. Los colapsos que se documentan del historial (freeze del hilo
principal, fuga de memoria por `innerHTML +=`) fueron problemas de patrones DOM y async, no
del lenguaje. Migrar a React o Vue no arregla el bug de raíz ambigua ni ningún problema de
teoría musical, y apila una curva de aprendizaje de framework encima de la de teoría
musical, que es la prioridad real.

El umbral está fijado en números: si `index.html` pasa las 1000 líneas, o el estado se
vuelve difícil de razonar, el siguiente paso es modularizar con ES Modules nativos
(`<script type="module">`), no adoptar un framework. Un framework se reconsidera solo si
aparece una necesidad real de UI reactiva compleja, tipo múltiples vistas o routing, que
hoy no existe.
