# EN-DISCUSION.md: los temas abiertos, mientras lo están

> Este archivo guarda lo que se está discutiendo y todavía no es ninguna de las otras dos cosas que
> el repo sabe guardar. `DECISIONS.md` guarda lo decidido y es append-only. El BACKLOG del
> `ROADMAP.md` guarda lo parqueado, con su fecha y su procedencia. Un tema en debate, con parte
> resuelta y parte abierta, no es ni una cosa ni la otra, y hasta el 2026-08-19 vivía solo en la
> conversación y desaparecía con ella.
>
> **Nada vive acá para siempre.** Esa es la propiedad que hace útil al archivo y la que lo separa de
> una segunda lista de pendientes.

## Las tres reglas que definen este archivo

**1. No es una transcripción.** De cada tema se guarda su **estado**, no su historia. Un pseudochat
reintroduce lo que este repo lleva veinte PR evitando: documentos que solo se entienden si estuviste
en la conversación. Toda entrada tiene los mismos cuatro campos, y una entrada sin los cuatro no
está lista para entrar:

- **Qué se discute.** El tema en una o dos frases, entendible sin contexto de chat.
- **Qué ya se sabe, con evidencia.** Lo que está medido o citado, con su comando o su puntero. Si no
  hay nada medido, se dice.
- **Qué falta decidir.** La pregunta abierta, en forma de pregunta.
- **Qué pasa si nadie decide.** El costo de dejarlo quieto, que es lo que permite priorizar.

Más la línea `**Entró:**` con su fecha y el PR que lo trajo, igual que un ítem del BACKLOG, porque
sin ella no se puede aplicar la regla 3.

**2. Salida garantizada.** Un tema entra cuando se está discutiendo y **sale** de una de dos formas:
se decide y pasa a `DECISIONS.md`, o se aparca y pasa al BACKLOG con su fecha y su procedencia. No
hay una tercera. Sin esta regla, en dos meses hay dos listas de pendientes que se contradicen y nadie
sabe cuál manda.

**3. Contención: cinco PR sin moverse y se va al BACKLOG.** Un tema que no avanza no está en
discusión, está parqueado y nadie lo dijo. El número es arbitrario, como el umbral de las 1000 líneas
del §7 de `ARCHITECTURE.md`, y lo que importa no es acertarlo sino que la salida exista. Cinco se
eligió midiendo el ritmo real: el día más cargado de este repo mergeó 13 PR y el más flojo mergeó 1,
así que cinco abarca desde media jornada activa hasta una semana floja. Se recuenta con
`git log --merges --format="%ad" --date=short | sort | uniq -c`.

---

## Fixtures con partituras de dominio público

**Qué se discute.** Reemplazar o complementar las 41 fixtures con casos derivados de partituras de
dominio público o archivos MIDI, que el autor pueda tocar y verificar de oído.

**Qué ya se sabe, con evidencia.** El planteo es fuerte y no está refutado: las 41 fixtures actuales
vienen de una sesión anterior cuyo contexto se perdió, así que **que estén verdes significa que el
motor coincide consigo mismo, no que sea correcto**. Una partitura de dominio público sí es
verificable contra algo externo al repo. Lo que hoy corre es `node tests/run.js` con un solo
`require`, el de `src/engine.js`.

**Qué falta decidir.** Tres cosas y ninguna es obvia: qué formato de entrada, cómo se convierte a
fixture sin volver a inventar la respuesta correcta, y qué pasa con las 41 actuales, si se retiran,
se conservan como regresión o se revisan una por una.

**Qué pasa si nadie decide.** La única garantía dura del proyecto sigue apoyada en una fuente que
nadie verificó, y cada PR que declara "41 fixtures verdes" declara menos de lo que parece.

**Entró:** 2026-08-19, PR "add: dónde vive lo que se está discutiendo".

---

## Análisis por comportamiento

**Qué se discute.** Que el motor reconozca más casos con reglas generales sobre relaciones, en vez de
con una lista de casos particulares. La acepción es la del antivirus: análisis genérico de lo que
ocurre, en oposición a una base de firmas.

**Qué ya se sabe, con evidencia.** El motor ya hace esto: la sensible, la dominante secundaria y el
paso cromático son reglas generales sobre relaciones, no una lista de canciones, y las tres viven en
`src/engine.js`. **La objeción que lo había rechazado quedó retirada**, porque usaba la otra acepción
de la palabra, la de regla aproximada que puede fallar. Y no está en conflicto con la entrada del
2026-08-11 "El motor no ejecuta lógica que venga de afuera": esa regla dice de dónde viene la lógica,
no cuán general puede ser.

**Qué falta decidir.** Qué casos concretos faltan. El acople con la auditoría se deshizo sin dar
respuesta: la auditoría corrió el 2026-08-19 y no encontró ninguna regla de teoría perdida, sino tres
defectos de pintado que vienen del primer commit. Así que la pregunta sigue abierta y ahora sin una
fuente esperada que la conteste.

**Qué pasa si nadie decide.** El motor se queda en las ocho reglas puras que tiene, que es un estado
razonable y no urgente. Es el tema de este archivo con menos costo por esperar.

**Entró:** 2026-08-19, PR "add: dónde vive lo que se está discutiendo".
