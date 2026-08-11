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
  harmony: { chord, isLocked, function },                  // function la escribe la Fase 4
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
`MathEngine` y las reglas puras viven en `src/engine.js`, que `index.html` carga con
`<script src>`. Empezaron siendo tres, `classifyChordRelation`, `evaluateMelodyStatus` y
`applyPassingTone`; las Fases 3 y 4 sumaron `getRomanNumeral`,
`isSecondaryDominantLeadingTone`, `getTonalFunction` y `scaleDegreesOrdered`, y `scalePitches`
ya estaba. Son ocho, y la lista viva es el bloque de exports al final del archivo. El
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
que el orden ascendente. Dentro de `detectChord`, en `src/engine.js`, la línea que empieza con
`const bassPC =` lo calcula, y la de `const candidateRoots =` lo pone al frente. Si el bajo forma un template, gana esa lectura; si no, cae al orden
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

## 5. Evaluación armónica: jerarquía escrita y verificada

La jerarquía ya no es un accidente del orden del código: quedó fijada en la entrada del
2026-07-23 de `DECISIONS.md` y está implementada en `evaluateMelodyStatus` más
`applyPassingTone` (`src/engine.js`). La primera regla que matchea gana:

1. El pitch class está en la escala activa o en el acorde que suena → `good`.
2. Es el tono conductor de una dominante secundaria hacia un grado de tríada mayor
   (`isSecondaryDominantLeadingTone`) → `good`, aunque el acorde no suene.
3. Es la sensible en universo menor, `(root + 11) % 12` → `tension`.
4. Al soltar, quedó no-`good` y duró menos de 180 ms → `passing`.
5. Nada de lo anterior → `bad`.

La afirmación vieja de esta sección, que la dominante secundaria solo actualizaba la
interfaz, dejó de ser cierta: la Fase 3 la conectó a la evaluación, y `evaluateMelodyStatus`
devuelve `good` para su tono conductor. Verificado leyendo la función: el chequeo corre
después de `inScale || inChord` y antes de la sensible.

La relación del acorde con el universo sigue fuera de la evaluación de notas a propósito. Es una
etiqueta que devuelve `classifyChordRelation`, no un estado de nota. Su tercer valor se llamó
`modal_interchange` hasta el incremento 5.5.2, que lo renombró a `unclassified`: no era un
diagnóstico sino el `return` final de la cascada, o sea todo lo que el motor no supo clasificar.

El umbral de 180 ms (`PASSING_TONE_MS`) está fijo en el código: no es uno de los cuatro
ajustes que el usuario edita (acumulación, retención, error visual y split), y se calibró a
mano contra Bad Apple. Límite conocido, decidido y no bug: una tensión de menos de 180 ms se
colapsa en paso cromático, indistinguible de un error corto.

## 5.1. La leyenda de colores: dos de contexto y cuatro de veredicto

La interfaz pinta las teclas con seis categorías. Su leyenda vive adentro del widget de la
guía, en el bloque `legend-grid` de `index.html`, y cada fila nombra además al widget dueño
de esa categoría. Las seis mezclan dos cosas distintas que conviene no confundir.

Dos son contexto, no veredicto. "Escala" (`#bae6fd`, símbolo `•`) pinta las notas del
universo activo, y "Acorde" (`#f59e0b`, símbolo `♦`) pinta las del acorde detectado. Se
pintan aunque el usuario no toque nada.

Cuatro son el veredicto nota por nota y salen de la jerarquía de la sección anterior:
"Correcto" (`#22c55e`, `✓`), "Sensible (empuja a la tónica)" (`#f97316`, `!`), "Paso Cromático" (`#a855f7`,
`~`) y "Error" (`#ef4444`, `✕`).

La etiqueta naranja nombra un caso único, la sensible en universo menor, y no una familia de
tensiones permitidas. Se llamaba "Tensión Legal" y prometía más de lo que cubre; el incremento 5.4
la renombró a "Sensible (empuja a la tónica)", con la razón medida contra el motor en
`DECISIONS.md`, entrada del 2026-08-10.

## 6. Gaps confirmados leyendo el código

- `State.universe` (tonalidad y escala elegidas) no se persiste. Solo se persiste
  `State.config`. Recargás la página y perdés la tonalidad.
- Cero feedback sonoro. No hay una sola llamada a Web Audio API en el código.
- "Fijar Acordes" hardcodea dos acordes: Do Mayor y Re m7.

## 7. No framework, por ahora

Desde la v11.69 el código son quince archivos: `index.html`, que quedó como markup, más catorce bajo
`src/`. El motor puro sigue en `src/engine.js` (`MathEngine` y las funciones de teoría), los
estilos en `src/estilos.css`, y el script que vivía adentro de `index.html` se repartió en trece
archivos, cargados como scripts clásicos en este orden: `config.js`, `state.js`, `log.js`,
`midi.js`, `armonia.js`, `escala.js`, `teclado.js`, `readout.js`, `cajas.js`, `lienzo.js`,
`layout.js`, `widgets.js` y `arranque.js`. Cada uno toma el nombre de lo que define, y
`arranque.js` va último porque contiene la única sentencia que ejecuta algo al cargar.

El reparto sigue los tres niveles de permiso del contrato: `escala.js` es el único con permiso de
escritura, sobre el universo; `readout.js` solo lee y presenta; y el resto es sistema. El objeto
`UI` dejó de existir en ese reparto, porque nombraba una capa y no un nivel. Ver `DECISIONS.md`,
entrada del 2026-08-11 "`UI` se disuelve: el reparto por permiso y las fixtures de geometría".

Los objetos-módulo ya
separan responsabilidades. Los colapsos que se documentan del historial (freeze del hilo
principal, fuga de memoria por `innerHTML +=`) fueron problemas de patrones DOM y async, no
del lenguaje. Migrar a React o Vue no arregla el bug de raíz ambigua ni ningún problema de
teoría musical, y apila una curva de aprendizaje de framework encima de la de teoría
musical, que es la prioridad real.

El umbral está fijado en números: si `index.html` pasa las 1000 líneas de código y markup, hay
que abrir una decisión sobre cómo se parte, y esa decisión se escribe en `DECISIONS.md` con la
corrida que descarta lo que no funciona. El umbral obliga a decidir y no decide: no receta
ningún mecanismo. Un framework se reconsidera solo si aparece una necesidad real de UI reactiva
compleja, tipo múltiples vistas o routing, que hoy no existe.

La versión anterior de este párrafo sí recetaba: decía que el paso siguiente era modularizar con
ES Modules nativos y `<script type="module">`. Eso no carga desde `file://`, que es requisito de
esta app, y nunca se corrió en los treinta y nueve días que estuvo escrito. El camino que queda
es scripts clásicos en varios archivos, que `src/engine.js` ya demuestra. La corrida del CORS y
las tres partes de la decisión viven en `DECISIONS.md`, entrada del 2026-08-11 "Los ES Modules no
cargan desde `file://`, y el umbral deja de prescribir". Esa misma entrada retira el segundo
gatillo que este párrafo tenía, "o el estado se vuelve difícil de razonar", por no tener medida.

**El umbral se cruzó y la partición ya lo bajó.** Antes, medido el
2026-08-11: `index.html` tenía 1524 líneas totales, 126 vacías y 227 de comentario, o sea 1171 de
código y markup. Después de la v11.69: 246 totales, 9 vacías y 25 de comentario, o sea 212. El
archivo más grande es `src/layout.js` con 304 líneas, y ninguno se acerca a las 1000. El
gatillo se cumplió durante la Fase 5, con el trabajo visual en curso, y se decidió terminar esa
fase antes de tocarlo. La partición es la Fase 5B del `ROADMAP.md`, entre la Fase 5 y la Fase 6.
Este párrafo se borra cuando la 5B cierre.

El conteo se recalcula con estos tres comandos, y el de código y markup es la resta:

```sh
wc -l < index.html
grep -c '^[[:space:]]*$' index.html
grep -c '^[[:space:]]*\(//\|/\*\|\*\|<!--\)' index.html
```

La versión anterior de este texto declaraba 573 y 145 líneas, números de la v11.0 que
envejecieron tres incrementos sin que nadie los volviera a correr, y por eso el umbral se cruzó
sin que se notara.
