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

## Teclas clicables, con el clic entrando por el camino MIDI

**Qué se discute.** Poder tocar el teclado de la pantalla con el puntero, y que ese clic genere un
mensaje MIDI que entre por el mismo manejador que usa el dispositivo real, en vez de llamar al motor
directamente.

**Qué ya se sabe, con evidencia.** El camino existe y es corto: `MIDI.processMsg` recibe el mensaje
y `MIDI.noteOn` y `MIDI.noteOff` son los manejadores, verificado con `grep` sobre `src/midi.js`. Un
clic que entre por ahí ejercita los tres bytes, el corrimiento de estado, el split y la evaluación.
El costo de no tenerlo también está medido: el defecto del acorde pegado era visible en cinco minutos
con el teclado a mano y sobrevivió desde el primer commit del repositorio, porque cada comprobación
exige conectar hardware.

**Qué falta decidir.** Cómo se dibuja la interacción sobre la capa 0, que la entrada del 2026-08-10
declara sin controles interactivos. Un clic sobre una tecla, ¿la convierte en control y contradice esa
regla, o hay una lectura en que no?

**Qué pasa si nadie decide.** Cada defecto del camino de eventos sigue costando una sesión con
hardware, y los que no se noten a simple vista siguen sobreviviendo, como este.

**Entró:** 2026-08-19, PR "add: dónde vive lo que se está discutiendo".

---

## El teclado no se reconoce al recargar la página

**Qué se discute.** Al recargar hay que apagar y encender el teclado físico para que vuelva a
funcionar.

**Qué ya se sabe, con evidencia.** El síntoma lo reportó el autor y no está reproducido en una
corrida. La hipótesis tiene mecanismo y base verificable: `MIDI.bindDevices` recorre
`access.inputs`, engancha `onmidimessage` y **nunca llama a `input.open()`**, comprobado leyendo la
función entera. La apertura implícita puede fallar si el puerto viene de una sesión anterior que no
se cerró, y `onstatechange` no se dispara porque el puerto ya figura como conectado. Apagar el
teclado lo arregla porque fuerza una desconexión seguida de una conexión, que sí dispara el evento.

**Qué falta decidir.** Nada de diseño: falta **comprobar** la hipótesis abriendo el puerto y
esperando esa promesa, con el teclado conectado. Es lo único de este archivo que se cierra con una
corrida y no con una discusión.

**Qué pasa si nadie decide.** Cada sesión con hardware arranca con un ritual que nadie escribió, y el
día que falle por otro motivo nadie va a distinguir un problema nuevo de este.

**Entró:** 2026-08-19, PR "add: dónde vive lo que se está discutiendo".

---

## Auditoría de qué quedó atrás antes de la Fase 5

**Qué se discute.** El autor sospecha que el coloreo del teclado funcionaba mejor antes del rediseño
visual, y que algo se perdió o cambió en el camino.

**Qué ya se sabe, con evidencia.** Es comprobable sin discutirlo: las Fases 2, 3 y 4 tienen su
Alcance y su Criterio de aceptación escritos en el `ROADMAP.md`, y el CHANGELOG registra qué entregó
cada una. Contrastar eso contra lo que el motor hace hoy contesta la pregunta. Y hay al menos dos
hallazgos recientes que apuntan en esa dirección sin ser de la Fase 5: el veredicto de melodía que se
borra cuando aterriza un acorde y el teclado que contradice al motor en la nota que suena, los dos
medidos el 2026-08-11 y los dos en el BACKLOG.

**Qué falta decidir.** Si la auditoría es un PR propio o el trabajo previo de otro. Y qué se hace con
lo que encuentre: si abre ítems, si reabre una fase, o si corrige en el momento.

**Qué pasa si nadie decide.** La sospecha queda como sensación y cada defecto que aparezca se va a
atribuir a la Fase 5 sin prueba, que es exactamente lo que este repo evita desde el 2026-08-09.

**Entró:** 2026-08-19, PR "add: dónde vive lo que se está discutiendo".

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

**Qué falta decidir.** Qué casos concretos faltan. Es justamente lo que la auditoría de este mismo
archivo puede contestar, así que los dos temas están acoplados y conviene leerlos juntos.

**Qué pasa si nadie decide.** El motor se queda en las ocho reglas puras que tiene, que es un estado
razonable y no urgente. Es el tema de este archivo con menos costo por esperar.

**Entró:** 2026-08-19, PR "add: dónde vive lo que se está discutiendo".
