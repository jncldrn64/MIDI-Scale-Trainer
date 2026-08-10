# GLOSARIO.md: qué significa cada término hoy

> Este archivo dice **qué significa** un término hoy. `DECISIONS.md` dice **por qué** cambió, y es
> append-only, así que una definición vieja se queda escrita ahí para siempre. Acá se corrige.
>
> Cada término apunta a la entrada de `DECISIONS.md` que lo decidió, citada por fecha y título.
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
- **molde**: el tamaño uniforme de las cajas, 170 px de alto por 23vw más 20 px de ancho, con tope
  de dos octavos del ancho de la ventana. La guía es la única excepción escrita. Fuente: 2026-07-30,
  *Estándar espacial de los widgets*.
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
  texto, y esa es su única excepción escrita al molde. Nace en la columna derecha, bajo el tercer
  punto de nacimiento. Adentro vive la leyenda de colores. No se le dice "leyenda": la leyenda es
  contenido, la guía es la caja. Fuente: 2026-08-09, *Dónde nace la guía, y los dos únicos sinónimos
  que valen*.
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

- **lienzo de referencia**: el marco de diseño de 1280 x 720 contra el que se escriben todas las
  medidas de la interfaz. Fuente: 2026-08-10, *Lienzo de referencia y modelo de capas*.
- **escala del lienzo**: el factor único por el que se multiplica todo el contenido para llenar la
  ventana, `min(anchoVentana / 1280, altoVentana / 720)`. Lo que sobra queda en negro. Fuente:
  2026-08-10, *Lienzo de referencia y modelo de capas*.

## Motor

- **universo**: el conjunto de notas permitidas. En pantalla la etiqueta pasa a "Escala" en el
  incremento 5.4, pero los nombres `universeType`, `universeRoot` y `universePitchesSet` se quedan
  en el motor, porque ese conjunto no siempre es una escala de siete notas. Fuente: 2026-08-09,
  *Mapa de términos*.
- **split**: la nota MIDI que separa mano izquierda de derecha, para que el motor sepa qué es bajo y
  qué es melodía. Es una sola nota, la 60 por defecto. No es una ventana de tiempo y no es un rango.
  Fuente: CHANGELOG v11.43, que corrigió el error de tratarlo como ventana.
