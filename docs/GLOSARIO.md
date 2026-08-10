# GLOSARIO.md: qué significa cada término hoy

> Este archivo dice **qué significa** un término hoy. `DECISIONS.md` dice **por qué** cambió, y es
> append-only, así que una definición vieja se queda escrita ahí para siempre. Acá se corrige.
>
> Cada término apunta a dónde se decidió: la entrada de `DECISIONS.md` citada por fecha y título, o
> la sección del `CHANGELOG.md` cuando la corrección se registró ahí y no generó entrada propia.
> Nunca por número de línea: un número de línea se pudre con el primer refactor (regla 6 de "Prosa"
> en `CLAUDE.md`).
>
> Regla de mantenimiento: toda entrada de `DECISIONS.md` que introduzca o refine un término escribe
> también su línea acá, en el mismo PR.

## Cajas y su mecánica

- **widget**: caja que se mueve, se cierra, tiene opacidad y reset, y aparece como fila en el menú
  de Widgets. Hay siete instancias registradas. Antes se llamó "característica" y también "panel".
  Fuente: 2026-08-09, *Mapa de términos*.
- **widget que compite**: widget que cuenta contra el cap. Hay cuatro registrados, de los cuales dos
  son andamiaje sin contenido. Sinónimo válido: "los tres intercambiables del cap", que nombra a los
  tres que pueden estar abiertos a la vez. Fuente: 2026-08-09, *Dónde nace la guía, y los dos únicos
  sinónimos que valen*.
- **widget de sistema**: widget que no cuenta contra el cap. Son tres: subtítulos del entrenamiento,
  feedback del sistema y guía. No son otra cosa que un widget: se mueven, se cierran y se restauran
  igual que los demás, y la única diferencia es que no compiten. Cerrar los seis deja en pantalla
  solo el fondo, teclado y zona de notas, más la barra. Sinónimo válido: "los tres del sistema".
  Fuente: 2026-08-01, *Nacimiento discreto y movimiento libre*.
- **cap**: el límite de tres widgets que compiten abiertos a la vez. Es un límite, no un espacio
  dibujado en pantalla. Fuente: 2026-07-25, *Precisiones del modelo de widgets*.
- **punto de nacimiento**: coordenada donde aparece un widget que compite al abrirse. Son tres, y
  son puntos, no celdas de una grilla: una vez movida, la caja queda donde el usuario la dejó.
  Fuente: 2026-08-01, *Nacimiento discreto y movimiento libre*.
- **franja de nacimiento**: los 56 px libres debajo de la barra de menús donde no nace ninguna caja,
  para que toda nota que caiga sea visible al aparecer. Fuente: 2026-07-30, *Estándar espacial de
  los widgets*.
- **molde**: el tamaño uniforme de las cajas, 170 por 314.4 px de lienzo. El ancho sale de 23% de
  1280 más 20, debajo del tope de dos octavos que son 320, y vive en la variable CSS `--w-widget`
  desde que el incremento 5.6 eliminó las unidades `vw`. La guía es la única excepción escrita.
  Fuentes: 2026-07-30, *Estándar espacial de los widgets*, y 2026-08-10, *La migración al lienzo se
  parte en dos*.
- **ranura**: término superado. Empezó nombrando una de tres posiciones donde vive algo, después
  pasó a ser un límite y no un espacio, y finalmente el nacimiento se resolvió con tres puntos que
  son coordenadas. Hoy se dice "cap" para el límite y "punto de nacimiento" para la coordenada. La
  definición vieja sigue escrita en 2026-07-25, *Glosario del modelo*, y está superada por las dos
  entradas posteriores del mismo día.
- **overlay**: nombra solo el estado del incremento 5.1, paneles quietos en posición fija. Lo que se
  mueve se llama widget. Fuente: 2026-08-09, *Mapa de términos*.
- **barra de menús permanente**: chrome permanente arriba, con los menús globales. Antes se llamó
  "panel de pestañas", y el modelo de una pestaña por widget quedó reemplazado por un único menú de
  Widgets. Fuente: 2026-07-30, *Un solo menú de widgets en vez de una pestaña por widget*.

## Contenido y superficies

- **guía**: el tercer widget de sistema. Es la única caja que crece en vertical en vez de recortar su
  texto, y esa es su única excepción escrita al molde. Nace anclada al borde derecho, con 16 px de
  margen, y a la mitad vertical de la zona de notas. Adentro vive la leyenda de colores. No se le
  dice "leyenda": la leyenda es contenido, la guía es la caja. Fuente: 2026-08-10, *Geometría del
  teclado de 88 teclas, y la barra no presenta lecturas*, que supera el nacimiento fijado en
  2026-08-09, *Dónde nace la guía, y los dos únicos sinónimos que valen*.
- **leyenda de colores**: la explicación de las seis categorías de color del teclado. Es contenido
  que vive dentro de la guía. No es una caja ni un widget. Fuente: 2026-08-09, *Dónde vive la
  leyenda de colores*.
- **dueño de superficie**: el widget al que pertenece un efecto visible. Cerrar al dueño apaga su
  efecto, porque el efecto no tiene autor en pantalla. Fuente: 2026-08-10, *Dueño de superficie*.
- **salida del motor**: el dato que el motor deriva y deja en el buffer. Lo consume cualquier
  superficie, el teclado incluido, y presentar no es recalcular. Fuente: 2026-08-09, *Mapa de
  términos*.
- **Tensión Legal**: etiqueta de la leyenda que nombra un caso único, la sensible en universo menor.
  El incremento 5.4 la renombra. Fuente: 2026-08-09, *Mapa de términos*.

## Medidas y geometría

- **capa**: cada uno de los tres planos en que se apila la interfaz. **Capa 0**, el fondo: el
  teclado y la grilla de notas que caen, alineados 1 a 1 de modo que cada columna cae sobre su
  tecla. La capa 0 no lleva ningún control interactivo, y esa es su parte operativa: un botón ahí es
  deuda. **Capa 1**, los widgets, que flotan sobre la capa 0 con las notas pasando por detrás.
  **Capa 2**, el chrome: la barra de menús permanente, única zona vedada al movimiento de widgets.
  La capa 2 contiene comandos y no presenta lecturas: si un dato del motor tiene que verse, lo
  muestra el widget que lo lee. Fuentes: 2026-08-10, *Lienzo de referencia y modelo de capas*, y
  2026-08-10, *Geometría del teclado de 88 teclas, y la barra no presenta lecturas*.
- **lienzo de referencia**: el marco de diseño de 1280 x 720 contra el que se escriben todas las
  medidas de la interfaz. Existe en el código desde el incremento 5.6: es el contenedor `#lienzo`,
  de 1280 x 720 px fijos, adentro del cual vive todo el contenido de la app. Fuentes: 2026-08-10,
  *Lienzo de referencia y modelo de capas*, y 2026-08-10, *La migración al lienzo se parte en dos*.
- **escala del lienzo**: el factor único por el que se multiplica todo el contenido para llenar la
  ventana, `min(anchoVentana / 1280, altoVentana / 720)`. Lo calcula el objeto `Lienzo`, que es el
  único lugar de la app que lee el tamaño de la ventana. Fuentes: las dos de arriba.
- **franja negra**: el sobrante que queda a los lados, o arriba y abajo, cuando la relación de
  aspecto de la ventana no es 16:9. No se rellena con contenido: queda negro, como un archivo de
  video con otra relación de aspecto. Fuente: 2026-08-10, *Lienzo de referencia y modelo de capas*.
- **píxel de lienzo**: la unidad en que se escribe toda medida de la interfaz. Un píxel de lienzo
  vale `escala` píxeles de pantalla. Las coordenadas guardadas de cada caja, los puntos de
  nacimiento y el molde están en esta unidad, no en píxeles de pantalla. Fuente: 2026-08-10, *La
  migración al lienzo se parte en dos*.

## Motor

- **universo**: el conjunto de notas permitidas. Es el término primario también en pantalla, con
  "escala" como aclaración entre paréntesis: toda escala es un universo, no todo universo es una
  escala. Los nombres del motor, `universeType`, `universeRoot` y `universePitchesSet`, se quedan
  como están, porque ese conjunto no siempre es una escala de siete notas. Fuentes: 2026-08-09,
  *Mapa de términos*, y 2026-08-10, *Universo es el término primario, y escala la aclaración que se
  retira sola*, que corrige la parte de aquella que daba por hecho el renombre en pantalla.
- **split**: la nota MIDI que separa mano izquierda de derecha, para que el motor sepa qué es bajo y
  qué es melodía. Es una sola nota, la 60 por defecto. No es una ventana de tiempo y no es un rango.
  En el código, el campo `State.config.splitNote` guarda el valor y el control que lo edita es
  `cfg-split`, dentro del menú de Opciones. Fuente: CHANGELOG v11.43, que corrigió el error de
  tratarlo como ventana.

## Artefactos del código

Lo que ya existe en `index.html` y hasta ahora no tenía nombre en ningún documento. Cada uno se
verificó con `grep` contra el archivo antes de escribirse acá.

- **widget de escala**: la caja que contiene los dos selectores y la vista de fórmula. Es un widget
  que compite por el cap, `widget-escala` en el código. No es chrome de opciones: tratarla como tal
  al planear el incremento 5.2 es el error que la subsección "Nomenclatura de lo que ya existe" del
  `ROADMAP.md` registra. Su clase `universe-bar` es el nombre viejo, de cuando era una barra y no un
  widget. Fuente: 2026-07-30, *Estándar espacial de los widgets*.
- **vista de fórmula**: la fila que muestra los grados del universo activo con sus separadores de
  tono y semitono. Es `formula-display`, y vive adentro del widget de escala. Existía y funcionaba
  antes del incremento 5.3, así que el widget de escala la absorbió en vez de reescribirla. Fuente:
  ROADMAP, alcance del incremento 5.3.
- **selector de tónica**: el desplegable que elige la nota raíz del universo, `root-select`. Sus
  opciones cambian de nombre con la nomenclatura elegida.
- **selector de tipo**: el desplegable que elige mayor, menor natural o menor armónica,
  `scale-select`. Escribe `State.universe.type`.
- **panel de fijar acordes**: `lock-chords-panel`, oculto a propósito desde la Fase 5 con el
  atributo `hidden` y un comentario que pide no borrarlo. Ofrece dos acordes fijos, Do Mayor y
  Re m7, para practicar sobre ellos.
- **botón de bloqueo del motor**: `btn-lock`, rotulado "Motor Automático". Bloquea el acorde
  detectado para que el motor deje de redetectarlo mientras se practica encima, y al hacerlo cambia
  su rótulo a "Motor Pausado". Junto con el panel de fijar acordes es la misma característica
  partida en dos controles; juntarlos en un widget está en el BACKLOG. El incremento 5.6 lo ocultó
  porque vivía en la capa 0.
- **contenedor de controles del escenario**: la caja que aloja al botón de bloqueo, oculta desde el
  incremento 5.6. **No tiene identificador estable en el código**: se la ubica solo por su clase
  `stage-controls`. No se le inventa un id acá; nombrarlo es trabajo del PR que decida el destino de
  esa característica.
