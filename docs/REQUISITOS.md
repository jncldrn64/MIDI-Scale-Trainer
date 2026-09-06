# REQUISITOS.md: qué tiene que ser verdad, y para quién

> Este archivo dice **qué tiene que ser verdad** para que el programa esté bien hecho, y para quién.
> No lleva fechas ni orden de trabajo: eso es `ROADMAP.md`. No explica por qué se eligió una forma
> sobre otra: eso es `DECISIONS.md`, que es append-only y guarda la historia. Acá se cita esa
> historia y no se repite.
>
> Vive en `docs/` y no en la raíz. `AGENTS.md` ya es el punto de entrada de quien llega sin contexto,
> y un `README.md` es para personas que llegan por GitHub, que el autor dejó para la versión mayor
> siguiente. Este documento tiene un tercer lector: el que ya está trabajando y necesita saber contra
> qué se mide lo que hace.

## 1. Para quién es

El propósito es **entender por qué la música hace lo que hace mientras se toca**. El público es
alguien que ya toca, aunque sea poco, y quiere el porqué de lo que le suena bien.

Hay un segundo uso y su jerarquía importa. El entrenamiento mecánico, subir de 60 a 200 BPM con
negras, corcheas, semicorcheas y tresillos, por escala y por mano, **es una capacidad que se apoya en
el propósito y no es el propósito**. La distinción no es cosmética: un documento que diga que el
programa sirve para las dos cosas por igual deja justificar cualquier decisión futura apelando a la
que convenga.

**El estado real, sin adornarlo.** Hoy hay un usuario, el autor, y el programa está afinado a su
nivel. Que sirva en una universidad para complementar lo que alguien ya sabe es una aspiración
declarada, no un hecho.

## 2. Qué tiene que ser verdad

**Que evalúe correctamente lo que se toca, en tiempo real.** Esto dejó de ser aspiración: 46 fixtures
verdes cubren la teoría del motor, y se corren con `node tests/run.js`. Cada fase que toca
`src/engine.js` las corre antes de cerrarse.

**Que explique por qué, no solo si estuvo bien.** Es lo que separa este programa de los que enseñan a
tocar una canción paso a paso. Un veredicto sin razón no enseña nada.

**Que la disposición se pueda rearmar.** Es requisito y no comodidad, y el motivo es pedagógico. En un
simulador de manejo uno entra con la interfaz por defecto, y cuando entiende, saca el radar de
proximidad y pone el cronómetro relativo. **La disposición por defecto es la del que llega; rearmarla
es señal de que entendiste algo.** Por eso la app no fija una disposición correcta para siempre.

## 3. Qué no es

- **No sustituye clases de piano.**
- **No compite con los programas que enseñan a tocar una canción paso a paso.**

Todo lo que está en el BACKLOG se propone como complemento y no como reemplazo de ninguna de las dos
cosas.

Eso coincide con lo que salió de mirar la competencia, que vive en el BACKLOG del `ROADMAP.md`, en el
ítem de cargar un archivo MIDI: aparecieron tres herramientas cercanas y **ninguna explica por qué**.
Las tres analizan el acorde que se sostiene.

## 4. Requisitos no funcionales, separando el fin del medio

Cada uno dice qué hay que conseguir y con qué se consigue hoy. Confundir las dos cosas es lo que
convierte una comodidad en una restricción sin que nadie lo note.

**Que el usuario abra el programa sin instalar ni compilar nada.** Ese es el fin, y es innegociable.
El medio actual es abrir `index.html` desde el sistema de archivos, sin servidor, sin build y sin
dependencias. El medio es discutible: el propio autor mencionó empaquetar un navegador como
alternativa.

**La distinción no es teórica: ese medio ya gobernó decisiones grandes.** Los ES Modules quedaron
descartados porque no cargan desde `file://`, y con ellos se reformuló el umbral de las 1000 líneas
del §7 de `ARCHITECTURE.md`; ver `DECISIONS.md`, entrada del 2026-08-11 "Los ES Modules no cargan
desde `file://`, y el umbral deja de prescribir". El SoundFont se descartó por un camino parecido,
en la entrada del mismo día "El SoundFont no entra por el camino del audio, y MIDI de salida lo
reemplaza".

El autor eligió `file://` por simplicidad y sin pensarlo mucho, y terminó ordenando la arquitectura.
Escribirlo como fin y medio es lo que evita que la próxima decisión se tome contra un medio en vez de
contra un requisito.

**Que el programa reciba lo que se toca en un teclado físico.** El medio actual es Web MIDI, que hoy
implementa Chrome. El fin es la entrada en vivo; el navegador es el medio.

**Que el teclado en pantalla represente un piano completo.** Son 88 teclas, de la 21 a la 108. Acá
fin y medio coinciden, porque el instrumento define el número.

**Que la pantalla no gaste en pintar más de lo que ya gasta.** El presupuesto visual, el minimalismo
funcional y la convención de señalar lo activo bajando la opacidad de lo demás son las tres formas
que toma ese requisito, y su razón está en el Alcance de la Fase 5 del `ROADMAP.md`. El fin es que
las notas del fondo se lean; los efectos son el medio y cada uno tiene que ganarse el espacio que
tapa.

**El cap de tres widgets que compiten** tiene su razón escrita y es pedagógica además de espacial:
`DECISIONS.md`, entrada del 2026-08-11 "El cap de tres tiene una razón pedagógica, además de la
espacial". No se repite acá.

**Y uno que es la situación de hoy y no un requisito: el repo es público.** Nada del diseño depende de
eso, y cambiarlo no rompería ninguna de las líneas de arriba.

## 5. Qué recursos armónicos reconoce el motor

Esta es la pregunta que trajo al autor al proyecto: tocaba un acorde que no pertenecía a la escala,
sonaba bien, y no sabía por qué.

**Lo que reconoce hoy**, leído en `evaluateMelodyStatus` de `src/engine.js`, en el orden en que la
primera regla que coincide gana:

1. La nota pertenece al universo activo o al acorde que suena.
2. Es el tono conductor de una dominante secundaria hacia un grado que arma tríada mayor, y se acepta
   aunque el acorde no suene.
3. Es la sensible en universo menor, y se marca como tensión.
4. Al soltarla duró menos de 180 ms, y se indulta como paso cromático.

**Lo que no reconoce**, y está anotado: el intercambio modal, que tiene la Fase 11 asignada, más los
modos, la napolitana, las sextas aumentadas, la sustitución de tritono y la modulación.

### Los recursos que conoce son reglas, no una lista de casos

Esto importa porque es lo que hace que el programa sirva para una canción que nadie previó.
`isSecondaryDominantLeadingTone` no compara contra una tabla: pide que la nota esté fuera del
universo, que la nota un semitono arriba pertenezca al universo, y que esa nota destino arme una
tríada mayor con notas del universo.

**La prueba está en las fixtures.** En Sol mayor, un Do# se acepta y un Re# no. Los dos son
sostenidos fuera de la escala. Do# empuja a Re, y Re con Fa# y La está entera en Sol mayor, así que
arma tríada mayor. Re# empuja a Mi, y Mi con Sol# no, porque Sol# no pertenece a Sol mayor.

Ninguna lista de casos particulares produce esa diferencia. Los dos casos viven en
`tests/fixtures/grados-romanos.json`.

### Tres mecanismos distintos, contra la intuición de que son el mismo

- La **dominante secundaria** toma prestado de otra tonalidad.
- La **sensible en menor** no toma prestado de ningún lado: eleva un grado de la propia escala para
  fabricar una dominante que resuelva.
- El **intercambio modal** toma del modo paralelo, la misma tónica con otro modo.

Son tres orígenes distintos. Si fueran el mismo, el motor no podría separarlos, y separa los dos que
conoce.

Lo que sí los une es que todos son casos de un fenómeno único: la música tonal sale de la escala de
formas sistemáticas y con nombre. **Pero no hay una fórmula que los genere a todos. Hay un catálogo, y
el motor conoce dos.** Esta lista está incompleta a propósito y el documento no promete completarla.

## 6. Qué puede alterar un entrenamiento y qué un widget

**Esta sección está pendiente y se declara pendiente en vez de improvisarse.** El contenido completo
depende de que exista la primera característica de verdad, que es lo que la Nota del 2026-07-25 de la
Fase 9 del `ROADMAP.md` deja como pregunta abierta: sin un caso real que lo fuerce, cualquier
estándar sería una adivinanza.

**Lo que sí está decidido y vale desde ahora.** El motor consume datos y no ejecuta lógica que no
esté en `src/engine.js` y cubierta por las fixtures; ver `DECISIONS.md`, entrada del 2026-08-11 "El
motor no ejecuta lógica que venga de afuera". De ahí sale que un entrenamiento aporte datos y no
lógica.

**Dónde está la frontera, sin cerrarla.** El autor quiere que un entrenamiento pueda cargar widgets,
elegir disposición, escribir en los subtítulos y poner reglas de juego, como exigir un tempo o
esperar una entrada. Cargar widgets y elegir disposición es componer piezas que ya existen, y eso
cabe del lado de los datos. Las reglas de juego están en la frontera y no se deciden acá.
