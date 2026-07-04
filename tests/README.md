# tests/: fixtures de regresión (Fase 0)

El mismo problema aparece en todo el historial del proyecto: se resuelve un caso (Bad
Apple, Oda a la Alegría, Blues) y no hay forma de saber si una regla nueva rompe un caso
viejo en silencio. Estas fixtures son la red: casos reales ya resueltos, grabados como
datos, corridos contra el motor real (`src/engine.js`), el mismo que carga `index.html` en
el navegador. No hay framework de testing. Node más `assert`, como pide `docs/ROADMAP.md`.

## Correr

```bash
node tests/run.js          # todas las fixtures
node tests/run.js blues    # solo las que matcheen el nombre de archivo
```

Exit code `0` si todo pasa, `1` si algo falla. Sirve para CI más adelante.

## Regla de uso

Sale del roadmap y no es negociable:

- Cada caso nuevo que se resuelve (canción real, log real) se agrega acá como fixture.
- Cada fase que toque `MathEngine` o las reglas de evaluación corre estas fixtures antes
  de darse por terminada. Si una fixture existente falla por un cambio intencional, se
  actualiza el esperado y se documenta el porqué en `docs/DECISIONS.md`. Un esperado no se
  afloja en silencio.

## Formato de fixture

Un archivo `.json` por caso o canción en `tests/fixtures/`:

```json
{
  "name": "id-corto",
  "title": "Descripción legible",
  "universe": { "root": 0, "type": "major" },
  "cases": [ /* ... */ ]
}
```

`universe.root` es un pitch class de 0 a 11 (0 es Do). `universe.type` es una clave de
`SCALES`: `major`, `minor` o `harmonic_minor`.

Hay tres tipos de caso, en el campo `kind`.

### `chord`: detección de acorde y su relación con el universo

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

`relation` es uno de `diatonic`, `secondary_dominant` o `modal_interchange`. `targetPC` es
el pitch class al que empuja una dominante secundaria, o `null`. Para probar un conjunto de
notas que no debe reconocerse como acorde, se usa `"expected": { "detected": false }`.

### `melody`: estado de una nota de melodía

```json
{
  "kind": "melody",
  "label": "...",
  "melodyNote": 66,
  "chordNotes": [50, 54, 57, 60],
  "expected": { "status": "good" }
}
```

`chordNotes` es el acorde de contexto activo, o `null` si no hay. `status` es uno de
`good`, `tension` o `bad`.

### `passing`: indulto por paso cromático (umbral de 180 ms)

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
| `oda-a-la-alegria.json` | Do Mayor | Re7 como dominante secundaria V/V. Más el gap de Fase 3 del Fa# en la melodía. |
| `blues.json` | Do Mayor | Do7 → V/IV (dominante secundaria), Fa7 → intercambio modal, Sol7 → dominante diatónico. |
| `bad-apple.json` | Re menor | Do# (sensible menor) como tensión, y el indulto de 180 ms del paso cromático. |
