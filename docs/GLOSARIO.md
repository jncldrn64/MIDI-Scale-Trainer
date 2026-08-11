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
- **sensible**: la nota a un semitono por debajo de la tónica, la que hace que el oído espere volver
  a ella. En la leyenda aparece como "Sensible (empuja a la tónica)"; antes se llamaba "Tensión
  Legal", nombre que prometía una familia de tensiones y nombraba una sola nota. **Cuándo la pinta
  este programa:** solo con las cuatro condiciones que `evaluateMelodyStatus` exige a la vez, que el
  universo sea menor, que el pitch class esté un semitono debajo de la tónica, que la nota no
  pertenezca al universo y que no pertenezca al acorde que suena. Por eso en un universo mayor ese
  color no se enciende nunca. Fuente: 2026-08-10, *"Tensión Legal" pasa a "Sensible (empuja a la
  tónica)"*.
- **nomenclatura silábica**: nombrar las notas Do Re Mi. Es **do fijo**: Do es siempre la nota Do, no
  el primer grado de la escala activa. Antes se llamaba "Latina" en pantalla. El nombre interno del
  código sigue siendo `latino`, y renombrarlo es el punto de nombres internos de "Deuda de método y
  documentación" del `ROADMAP.md`. Fuente: CHANGELOG v11.60.
- **nomenclatura alfabética**: nombrar las notas C D E. Antes se llamaba "Anglosajona" en pantalla.
  Usa un carácter donde la silábica usa dos, así que sobre teclas de 24.6 px de lienzo la elección
  tiene consecuencia de legibilidad. Fuente: CHANGELOG v11.60.

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
  como están, porque ese conjunto no siempre es una escala de siete notas. **Condición verificable
  que retira el paréntesis:** que la constante `SCALES` de `src/engine.js` gane una entrada cuya
  fórmula `f` no tenga siete grados. Hoy tiene tres entradas y las tres tienen siete, así que la
  aclaración nace verdadera. Fuentes: 2026-08-09,
  *Mapa de términos*, y 2026-08-10, *Universo es el término primario, y escala la aclaración que se
  retira sola*, que corrige la parte de aquella que daba por hecho el renombre en pantalla.
- **sin clasificar**: el tercer valor que devuelve `classifyChordRelation`, `unclassified` en el
  código. No es un diagnóstico: es lo que queda cuando el acorde no es diatónico y tampoco es una
  dominante secundaria con objetivo en el universo. Se llamó `modal_interchange` hasta el incremento
  5.5.2. En pantalla dice "Sin clasificar", que describe el estado del análisis y no juzga el
  acorde. Fuente: 2026-08-11, *El tercer valor de la clasificación deja de llamarse intercambio
  modal*.
- **intercambio modal**: tomar prestado un acorde del modo paralelo, por ejemplo un acorde de La
  menor dentro de La mayor. Es una técnica real y bien definida, y sigue siendo un término válido
  del proyecto: la Fase 11 es la que va a escribir su teoría y hacer que el motor lo reconozca. Lo
  que dejó de valer es usar esa palabra para nombrar lo que el motor no supo clasificar. Fuente:
  2026-08-11, *El tercer valor de la clasificación deja de llamarse intercambio modal*.
- **paleta de veredicto**: los seis hexadecimales de las categorías del teclado. Viven sobre las
  teclas y en la leyenda que los explica, y ningún otro elemento de la app usa esos valores. La
  regla operativa está en `CLAUDE.md`, sección "Colores". Fuente: 2026-08-11, *La paleta de veredicto
  no se reusa fuera del teclado*.
- **función tonal**: el papel que un acorde cumple dentro del universo activo. Lo deriva
  `getTonalFunction` por índice de grado, así que vale en cualquier tonalidad. Devuelve cinco
  valores y los cinco se muestran en el widget de salida del motor: **tónica** para los grados I,
  iii y vi, **subdominante** para ii y IV, **dominante** para V y vii°, **fuera del universo**
  cuando el acorde no pertenece, y **sin teoría escrita** cuando el universo no es mayor, porque la
  teoría de la menor todavía no está escrita en este repo. Los dos últimos son admisiones de que el
  motor no sabe y no se ocultan. Fuente: 2026-08-11, *La función tonal se muestra completa, con las
  dos veces que el motor admite que no sabe*.
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
- **vista de fórmula**: la grilla que muestra los grados del universo activo con sus pasos. Es
  `formula-display`, y vive adentro del widget de escala. Son dos filas y trece columnas: los siete
  grados abajo en las columnas impares, las seis barras separadoras `|` en las pares, y la etiqueta
  del paso, `S`, `T` o `T+S`, arriba de cada barra. Existía y funcionaba antes del incremento 5.3,
  así que el widget de escala la absorbió en vez de reescribirla. Peor caso medido el 2026-08-10 en
  el formato nuevo: 38 caracteres en silábica y 30 en alfabética. En silábica hay empate en 38 entre
  varias combinaciones, entre ellas `Do#` mayor y `Sol#` menor armónica, que era el peor caso del
  formato viejo. Quien agregue un universo nuevo prueba contra ese largo, y lo recalcula con este
  comando desde la raíz del repo:

  ```sh
  node -e 'const ES=["Do","Do#","Re","Re#","Mi","Fa","Fa#","Sol","Sol#","La","La#","Si"],EN=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const {SCALES}=require("./src/engine.js");
  for (const [nom,N] of [["alfabética",EN],["silábica",ES]]) { let p={l:-1};
    for (let r=0;r<12;r++) for (const [t,d] of Object.entries(SCALES)) { let c=r,s=N[r%12];
      d.f.forEach(k=>{c+=k; if(c-r<12) s+=" | "+N[c%12];});
      if (s.length>p.l) p={l:s.length,s,r:N[r%12],t}; }
    console.log(nom, p.l, p.r, p.t, "->", p.s); }'
  ```

  Fuentes: ROADMAP, alcance del incremento 5.3, y 2026-08-10, *La vista de fórmula pasa a dos filas
  con barra separadora*.
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
- **script clásico**: un `<script src>` sin `type="module"`. Es la única forma de cargar un archivo
  de JavaScript desde `file://`, porque los scripts de tipo módulo se piden con CORS y el origen del
  sistema de archivos es `null`. `index.html` carga así `src/engine.js`. Fuente: 2026-08-11, *Los ES
  Modules no cargan desde `file://`, y el umbral deja de prescribir*.

## Permisos y efectos

- **valor del sistema**: dato que el sistema posee, produce y conserva, y que existe con todos los
  widgets cerrados. El universo activo es uno: vive en `State.universe` y arranca en Do mayor.
  Fuente: 2026-08-11, *El contrato de permisos: sistema, permiso de escritura y solo lectura*.
- **permiso de escritura**: el que tiene un widget que puede cambiar un valor del sistema, además de
  leerlo y presentarlo. Hoy lo tiene uno solo, el widget de escala, sobre el universo. Un editor
  alternativo del mismo valor pide el mismo permiso y no hereda el valor. Fuente: 2026-08-11, *El
  contrato de permisos: sistema, permiso de escritura y solo lectura*.
- **widget de solo lectura**: widget que lee y presenta y no cambia ningún valor. Hoy es el widget de
  salida del motor. Fuente: 2026-08-11, *El contrato de permisos: sistema, permiso de escritura y
  solo lectura*.
- **efecto veredicto**: el color de la tecla y su símbolo, que son una sola señal y no dos. Las seis
  categorías definen los dos en la misma regla de CSS. Fuente: 2026-08-11, *Los efectos sobre las
  teclas, y la primera precedencia escrita del repo*.
- **efecto etiqueta**: el nombre de la nota sobre la tecla. Se enciende y se apaga, y qué dice
  depende de la nomenclatura. Fuente: 2026-08-11, *Los efectos sobre las teclas, y la primera
  precedencia escrita del repo*.
- **precedencia de efecto**: el orden fijo que decide qué dueño gana cuando dos widgets comparten un
  efecto. Compartir está permitido si la precedencia está escrita, y prohibido si no. La única
  escrita es la cascada de cuatro ramas de `UI.renderKeyboard`: acorde, veredicto, nota activa,
  escala. Fuente: 2026-08-11, *Los efectos sobre las teclas, y la primera precedencia escrita del
  repo*.

- **corte puro**: una partición que mueve bloques a archivos y no mueve un solo método, ni renombra,
  ni reordena. Se prueba concatenando los archivos nuevos en orden de carga y comparando contra el
  original: la única diferencia admitida son los encabezados de archivo. Fuente: 2026-08-11, *La
  partición se hace en dos PR, y el primero es un corte puro*.

## Método

- **umbral**: una alarma escrita que obliga a abrir una decisión cuando se cumple. Obliga a decidir
  y no decide: no receta un mecanismo. El único vivo es el de las 1000 líneas de código y markup de
  `index.html`, en el §7 de `ARCHITECTURE.md`. Fuente: 2026-08-11, *Los ES Modules no cargan desde
  `file://`, y el umbral deja de prescribir*.
- **promesa**: una frase del repo que afirma algo sobre una sintaxis, un protocolo o una API, y que
  por lo tanto puede ser falsa aunque el repo entero sea coherente. Un número se recalcula con un
  comando; una promesa solo se comprueba corriéndola. Fuente: 2026-08-11, *Los ES Modules no cargan
  desde `file://`, y el umbral deja de prescribir*.
