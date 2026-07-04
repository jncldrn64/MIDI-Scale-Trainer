# tests/ — Fixtures de regresión (Fase 0)

El problema recurrente de todo el historial del proyecto (Bad Apple, Oda a la
Alegría, Blues) fue: se resuelve un caso y no hay forma de saber si una regla
nueva rompe silenciosamente un caso viejo. Estas fixtures son la red de
seguridad: casos reales ya resueltos, grabados como datos, que se corren contra
el motor puro real (`src/engine.js`) — el mismo que usa `index.html` en el
navegador. No hay framework de testing: solo Node + `assert`, como pide
`docs/ROADMAP.md`.

## Correr

```bash
node tests/run.js          # todas las fixtures
node tests/run.js blues    # solo las que matcheen el nombre de archivo
```

Exit code `0` si todo pasa, `1` si algo falla (apto para CI a futuro).

## Regla de uso (del roadmap)

- Cada vez que se resuelve un caso nuevo (canción real, log real), se agrega
  como fixture acá.
- **Cada fase que toque `MathEngine` o las reglas de evaluación corre estas
  fixtures antes de darse por terminada.** Si una fixture existente falla por un
  cambio intencional, se actualiza el esperado *y se documenta el porqué* en
  `docs/DECISIONS.md` — nunca se afloja un esperado en silencio.

## Formato de fixture

Un archivo `.json` por caso/canción en `tests/fixtures/`:

```json
{
  "name": "id-corto",
  "title": "Descripción legible",
  "universe": { "root": 0, "type": "major" },
  "cases": [ /* ... */ ]
}
```

`universe.root` es un pitch class 0–11 (0 = Do). `universe.type` es una clave de
`SCALES` (`major`, `minor`, `harmonic_minor`).

Tres tipos de caso (`kind`):

### `chord` — detección de acorde y su relación con el universo
```json
{
  "kind": "chord",
  "label": "qué se está verificando",
  "notesPlayed": [50, 54, 57, 60],
  "expected": {
    "detected": true,
    "rootPC": 2,
    "type": "7",
    "isDiatonic": false,
    "relation": "secondary_dominant",
    "targetPC": 7
  }
}
```
`relation` ∈ `diatonic` | `secondary_dominant` | `modal_interchange`. `targetPC`
es el pitch class al que empuja una dominante secundaria (o `null`). Para probar
un conjunto de notas que NO debe reconocerse como acorde, usar
`"expected": { "detected": false }`.

### `melody` — estado de una nota de melodía
```json
{
  "kind": "melody",
  "label": "...",
  "melodyNote": 66,
  "chordNotes": [50, 54, 57, 60],
  "expected": { "status": "good" }
}
```
`chordNotes` es el acorde de contexto activo (o `null` si no hay). `status` ∈
`good` | `tension` | `bad`.

### `passing` — indulto por paso cromático (umbral de 180 ms)
```json
{
  "kind": "passing",
  "label": "...",
  "status": "bad",
  "durationMs": 150,
  "expected": { "status": "passing" }
}
```

## Fixtures actuales

| Archivo | Universo | Qué ancla |
|---|---|---|
| `oda-a-la-alegria.json` | Do Mayor | Re7 como dominante secundaria V/V (ejemplo del roadmap); gap Fase 3 del Fa# en melodía. |
| `blues.json` | Do Mayor | Do7/Fa7/Sol7 → V/IV (dom. secundaria) / intercambio modal / dominante diatónico. |
| `bad-apple.json` | Re menor | Sensible menor (Do#) como tensión, y el indulto de 180 ms del paso cromático. |
