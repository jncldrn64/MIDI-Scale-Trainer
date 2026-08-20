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

## El acorde no se suelta mientras queden bajos apretados que no forman nada

**Qué se discute.** Con uno o dos bajos apretados que no arman ningún acorde reconocible, el acorde
anterior sigue vigente sin límite. La condición de liberar exige cero bajos y la de detectar exige al
menos tres, así que entre uno y dos hay una zona donde no se libera lo viejo ni se detecta lo nuevo.

**Qué ya se sabe, con evidencia.** Reproducido con registro del autor: seis segundos con el acorde
pegado, y la línea "Retención vencida y el contexto se queda: todavía hay N bajo(s) apretado(s)"
apareciendo justo al vencer el plazo. No hace falta equivocarse con el split para llegar acá: pasa
igual soltando una nota de tres para reacomodar el dedo. Las dos condiciones están a la vista, la de
liberar en `MIDI.triggerContextTimeout` y la de detectar en `MIDI.triggerAccumulation`. Y el mínimo
de tres no es arbitrario: es la cantidad mínima de notas que puede formar un acorde, y
`Engine.detectChord` abre con `if (notesArray.length < 3) return null`. El motor reconoce diecisiete
plantillas, ocho de tres notas y nueve de cuatro, contadas sobre `CHORD_TEMPLATES` de
`src/engine.js`.

**Qué falta decidir.** Cuál de estas cuatro, sabiendo que la última es la más prometedora:

- Liberar cuando los bajos bajen de tres. Rompe el reacomodo de dedos, que es un gesto normal.
- Que la retención se re-arme al apretar un bajo, no solo al soltarlo. Hoy el reloj corre desde el
  último soltado, así que apretar notas nuevas no lo reinicia.
- Reevaluar cada vez que cambia el conjunto de bajos, en vez de solo al llegar a tres.
- Mirar el contenido y no el conteo: si aparece una nota que no pertenece al acorde activo, eso es
  evidencia directa de que el acorde cambió, y hoy esa evidencia se descarta. Con desvanecimiento
  gradual en vez de interruptor, y soltando del todo al detectar otro acorde.

Y debajo de las cuatro, la pregunta de fondo: **si "no reconozco" borra el acorde anterior o lo
conserva.** Borrarlo es honesto y puede parpadear; conservarlo es estable y miente. Es el mismo
dilema que la función tonal ya resolvió, diciendo "sin teoría escrita" en vez de forzar una función.

**Esto se decide con un boceto, no discutiendo.** Es una pregunta de interacción y no de corrección:
cuál se siente mejor se contesta tocando, no argumentando. Las teclas clicables de la v11.81 lo
permiten sin hardware. El repo ya resolvió así el alto de la tecla blanca y la vista de fórmula.

**Qué pasa si nadie decide.** El contexto sigue ensuciándose y las evaluaciones siguen dando falsos
aciertos contra un acorde que ya no suena, que es lo que llevó al autor a creer que el coloreo había
empeorado con el rediseño visual.

**Entró:** 2026-08-20, PR "fix: el split se lee dos veces, y el fallo mudo cuando no hay teclado".

---

## El teclado encendido antes de abrir la página no se detecta

**Qué se discute.** Con el teclado ya encendido, la app no lo detecta al cargar. Hay que apagarlo y
encenderlo con la página corriendo.

**Qué ya se sabe, con evidencia. Lo valioso son cuatro hipótesis descartadas con prueba.**

- No es que el puerto quede tomado por la pestaña anterior: cerrar Chrome entero no cambia nada.
- No es lentitud de la enumeración: el puerto virtual del sistema aparece en el mismo segundo.
- No es el dispositivo: Qsynth lo reconoce apenas se conecta, así que el sistema lo ve.
- No es algo que este proyecto haya introducido. El arranque MIDI no se tocó en toda la serie:
  `git log -S"requestMIDIAccess"` devuelve dos commits, el primero del repositorio y el de la
  partición, que lo movió de archivo sin cambiarlo.

Y dos cosas más quedaron comprobadas por el camino: el enganche del manejador funciona, y los puertos
que sí aparecen se abren bien, con su línea de apertura explícita desde la v11.81.

**Qué falta decidir.** Nada del lado de la app hasta saber la causa, y averiguarla queda fuera de
alcance: apunta al navegador o a una actualización del sistema, ninguno de los dos cosa de este repo.
La pregunta abierta es qué corrida separaría esas dos.

**Qué pasa si nadie decide.** El autor sigue apagando y encendiendo el teclado. Es una molestia
conocida, con solución conocida, y desde la v11.82 la app la dice en pantalla en vez de quedarse
muda.

**Entró:** 2026-08-20, PR "fix: el split se lee dos veces, y el fallo mudo cuando no hay teclado".

---

## Correr en el navegador del usuario tiene un costo que ninguna entrada nombró

**Qué se discute.** El proyecto corre desde `file://` en el navegador que el usuario ya tiene, sin
empaquetar nada. Esa decisión arrastra una consecuencia que ninguna entrada de `DECISIONS.md`
escribió: **el programa depende de una versión de navegador que cambia sin aviso y que nadie de acá
controla.**

**Qué ya se sabe, con evidencia.** El caso del teclado que no se detecta es el primer ejemplo
concreto, y llegó con las cuatro hipótesis de arriba descartadas y ninguna causa del lado del repo.
La alternativa que otros programas usan es empaquetar el navegador junto con la aplicación, y su
costo está nombrado: obliga a distribuir una entrega por sistema operativo.

**Qué falta decidir.** Nada por ahora, y esa es la respuesta, no una evasiva: el costo de empaquetar
es alto y hoy no hay nada que lo justifique. Lo que faltaba era que la consecuencia quedara escrita.

**Qué pasa si nadie decide.** La próxima vez que algo se rompa sin que nadie lo haya tocado, la
sesión que lo investigue va a empezar buscando el error en este repo, que es donde no está.

**Entró:** 2026-08-20, PR "fix: el split se lee dos veces, y el fallo mudo cuando no hay teclado".

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
