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

Hay seis tipos de caso, en el campo `kind`, y el conteo sale de
`grep -n "kind ===" tests/run.js`, que es la cascada que los despacha. Tres nacieron con la Fase 0 y
tres los sumaron las Fases 3 y 4.

Un caso puede además traer su propio campo `universe`, que pisa el de la fixture para ese caso solo.
Lo usan hoy 7 casos de `grados-romanos.json`, para probar que el mismo Re Mayor es `V` en Sol Mayor y
`II` en Do Mayor. Solo lo leen los tipos `roman` y `function`.

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

`relation` es uno de `diatonic`, `secondary_dominant` o `unclassified`. `targetPC` es
el pitch class al que empuja una dominante secundaria, o `null`. Para probar un conjunto de
notas que no debe reconocerse como acorde, se usa `"expected": { "detected": false }`.

Todo lo que va después de `rootPC` y `type` es opcional: el runner lo comprueba solo si la clave está
en `expected`. Además de las tres de arriba admite `numeral`, `targetNumeral` y `function`, que son
las mismas tres cosas que los tipos `roman` y `function` prueban sueltas. Sirven cuando lo que se
quiere anclar es el acorde entero desde sus notas; los tipos sueltos sirven cuando se quiere anclar
la derivación sin pasar por la detección.

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

### `roman`: numeral romano de un acorde

```json
{
  "kind": "roman",
  "label": "I en Do Mayor (Do Mayor)",
  "chord": { "rootPC": 0, "type": "M" },
  "expected": { "numeral": "I" }
}
```

Lo sumó la Fase 3. No pasa por `detectChord`: arma el acorde con `rootPC` y `type` contra `CHORD_TEMPLATES` y llama a
`getRomanNumeral`. Por eso prueba la derivación del grado y no la detección, que ya prueba `chord`.

### `function`: función tonal de un acorde

```json
{
  "kind": "function",
  "label": "I en Do Mayor (Do Mayor): función tónica",
  "chord": { "rootPC": 0, "type": "M" },
  "expected": { "function": "tonica" }
}
```

Lo sumó la Fase 4. Arma el acorde igual que `roman` y llama a `getTonalFunction`. `function` es uno de `tonica`,
`subdominante`, `dominante`, `no_diatonica` o `por_definir`. Los dos últimos son las dos veces que el
motor admite que no sabe: `no_diatonica` cuando el acorde no pertenece al universo y `por_definir`
cuando el universo no es mayor, porque la teoría de la menor no está escrita.

### `resolution`: un acorde resuelve en otro

```json
{
  "kind": "resolution",
  "label": "...",
  "fromNotes": [42, 50, 60],
  "toNotes": [43, 47, 50],
  "expected": {
    "fromType": "7(no5)",
    "fromRelation": "secondary_dominant",
    "toRootPC": 7
  }
}
```

Es el único tipo que toma dos acordes. Detecta los dos con `detectChord` y afirma, además de lo que
declara `expected`, que **el objetivo que el motor le deriva al primero es la raíz del segundo**. Eso
es lo que vuelve dominante secundaria a un acorde, y hasta que este tipo existió se probaban los dos
acordes por separado, cada uno correcto por su cuenta, sin que nada dijera que uno lleva al otro.

No prueba que la secuencia haya ocurrido en el tiempo. Prueba la relación armónica entre dos
acordes; lo otro pide el arnés de eventos con tiempo simulable que el BACKLOG tiene anotado.

## Fixtures actuales

Cinco archivos y 46 casos. Los dos números se recalculan con `ls tests/fixtures/` y
`node tests/run.js | tail -1`.

| Archivo | Universo | Casos | Qué ancla |
|---|---|---|---|
| `oda-a-la-alegria.json` | Do Mayor | 9 | Re7 como dominante secundaria V/V, y que resuelve al Sol. Más el gap de Fase 3 del Fa# en la melodía. |
| `blues.json` | Do Mayor | 3 | Do7 → V/IV (dominante secundaria), Fa7 → sin clasificar, Sol7 → dominante diatónico. |
| `bad-apple.json` | Re menor | 8 | Do# (sensible menor) como tensión, y el indulto de 180 ms del paso cromático. |
| `grados-romanos.json` | Do Mayor | 23 | Los siete grados con su numeral y su función tonal, más que el mismo acorde cambia de grado al cambiar la tonalidad. |
| `raiz-ambigua.json` | Do Mayor | 3 | Que el bajo decide la raíz: Do-Mi-Sol-La da Do6 o La m7 según qué nota esté abajo. |
