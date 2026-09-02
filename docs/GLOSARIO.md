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
  de Widgets. Hay siete instancias registradas. Es **quién tiene el permiso**: lo que puede tocar una
  caja se sabe mirándola, y no cambia según lo que esté mostrando. Antes se llamó "característica" y
  también "panel". Fuentes: 2026-08-09, *Mapa de términos*, y 2026-08-11, *Una vista es cómo se mira,
  un widget es quién tiene el permiso*.
- **vista**: una forma de mostrar el mismo dato dentro de un widget. Cambia cómo se mira y qué
  controles se ofrecen; nunca cambia qué puede tocar la caja. Un widget puede tener varias: la vista
  lineal y la de rueda de quintas son el mismo widget de escala con el mismo permiso. Abrir el mismo
  widget dos veces con vistas distintas es coherente con el modelo y **todavía no tiene mecanismo**:
  `CAJAS` es un registro fijo de siete entradas atadas al markup. Fuente: 2026-08-11, *Una vista es
  cómo se mira, un widget es quién tiene el permiso*.
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
  dibujado en pantalla. Tiene dos razones y las dos valen: la espacial, que no tapen las notas del
  fondo, y la pedagógica, que el usuario elija qué le conviene mirar en la fase de aprendizaje en la
  que está. De ahí sale la consecuencia operativa: **un widget nuevo no sube el cap, lo disputa**.
  Fuentes: 2026-07-25, *Precisiones del modelo de widgets*, y 2026-08-11, *El cap de tres tiene una
  razón pedagógica, además de la espacial*.
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

- **bajo fantasma**: una nota que quedó en `State.midi.activeBasses` después de soltarla, porque se
  la buscó en el conjunto equivocado. Cuenta contra el mínimo de tres bajos que la retención exige
  para liberar el contexto, así que el acorde detectado se queda vigente sin límite. La causaba
  recalcular la clasificación contra el split al soltar, y se arregló leyéndola del conjunto.
  **Corregido el 2026-08-22:** esta línea decía que la liberación "exige cero bajos", que fue cierto
  hasta el PR que agregó la segunda mitad de la retención. `triggerContextTimeout` en `src/midi.js`
  libera con `activeBasses.size < 3`, y la entrada **retención del contexto** de este mismo archivo
  ya lo decía bien: las dos se contradecían. Fuentes: 2026-08-20, *Nada que decida el destino de un
  evento se recalcula después de que el evento ocurrió*, y 2026-08-20, *La retención se re-arma con
  cualquier movimiento de bajos, y libera por debajo de tres*.
- **dispositivo real** y **puerto virtual del sistema**: los dos grupos en que la app reparte los
  puertos MIDI de entrada que enumera. Real es el que declara fabricante, virtual el que no.
  `MIDIPort` no expone ningún campo que lo diga, así que es una heurística sobre una observación y no
  un dato de la interfaz; por eso el log imprime `manufacturer`, `version` y `name` de cada puerto y
  en qué grupo lo puso. Fuente: 2026-08-20, *Un puerto virtual se distingue de un dispositivo por el
  fabricante, y es una heurística*.
- **retención del contexto**: la ventana de `holdMs` que decide cuánto sobrevive el acorde detectado
  después de que la mano izquierda deja de moverse. Se re-arma con cualquier movimiento de bajos,
  apretar o soltar, así que mide quietud y no tiempo desde el último soltado. Al vencer libera el
  acorde si quedan menos de tres bajos apretados, que es el mismo mínimo de `Engine.detectChord` y por
  el mismo motivo. No corre contra un acorde fijado a mano. Fuente: 2026-08-20, *La retención se
  re-arma con cualquier movimiento de bajos, y libera por debajo de tres*.
- **superficie sin autor**: una caja que nadie está escribiendo. No muestra lo último que se escribió
  como si siguiera vigente. Es la misma falla que un acorde que sigue detectado sin bajos que lo
  sostengan. **Corregido el 2026-08-20:** esta línea decía que el caso vivo eran los subtítulos, y era
  al revés. Los subtítulos no tienen autor y por eso llevan rótulo y ningún mensaje; la caja con autor
  y con mensaje viejo es el feedback del sistema, que se arregló marcando la hora. Fuentes: 2026-08-20,
  *Una superficie sin autor no muestra el último mensaje como si siguiera vigente*, y 2026-08-20, *Se
  vació la caja equivocada, y el mecanismo del error es usar el nombre de la conversación*.
- **subtítulos del entrenamiento** (`sys-subtitles`): caja de sistema **sin autor**. Ninguna función
  escribe ahí: el sistema de entrenamientos que va a hacerlo no existe. Muestra su rótulo y nada más,
  para que se la reconozca en pantalla y en el menú de Widgets. **No es la caja de los avisos.**
  Fuente: 2026-08-20, *Se vació la caja equivocada, y el mecanismo del error es usar el nombre de la
  conversación*.
- **feedback del sistema** (`sys-feedback`): caja de sistema **con autor**, `Feedback.avisar`, llamada
  desde el chasis y desde MIDI. Muestra el último aviso con la hora en que se escribió, y ese aviso no
  caduca ni se borra solo. **Es la caja de los avisos, y la que en conversación se puede confundir con
  los subtítulos.** Fuente: 2026-08-20, *El aviso del chasis se marca con su hora, no se borra ni
  caduca*.
- **entrada sustituta**: un mensaje MIDI que fabrica la app en vez de recibirlo de un dispositivo, y
  que entra por el mismo manejador, `MIDI.processMsg`. Hoy la produce una sola cosa, el clic sobre
  una tecla de la capa 0, con la función `MIDI.entradaSintetica`. No es un control: un control cambia
  una configuración y esto produce el mismo mensaje que produce el teclado físico, así que la capa 0
  sigue sin controles y gana una entrada. Va detrás del interruptor "Teclas clicables" de Opciones,
  apagado de fábrica. Fuente: 2026-08-19, *El clic entra por el camino MIDI, no por el motor*.
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
- **dominante secundaria**: el acorde que funciona como dominante de un grado que no es la tónica,
  y que se escribe V/V, V/ii y así. Es el nombre técnico de lo que se percibe como una nota que
  empuja hacia otra y vuelve. El motor no la detecta como acorde: lo que evalúa desde la Fase 3 es su
  tono conductor, con `isSecondaryDominantLeadingTone`, que devuelve `good` para esa nota aunque el
  acorde no suene y aunque la nota esté fuera del universo. Fuente: 2026-08-11, *Un apunte que
  describe algo ya hecho no es una dirección pendiente*, que lo trajo desde el Track paralelo de
  teoría del `ROADMAP.md`.
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
- **panel de fijar acordes**: **artefacto retirado.** Fue `lock-chords-panel`, con dos acordes fijos,
  Do Mayor y Re m7, para practicar sobre ellos. La v11.76 lo sacó del markup y hoy
  `grep -rn "lock-chords-panel" index.html src/` no devuelve nada. El término se queda porque el
  BACKLOG lo nombra al pedir que se junte con el botón de bloqueo en un widget de acompañamiento, y
  quien lea ese ítem necesita saber qué era. Lo que sobrevive del panel es `Armonia.lockChord`, sin
  llamador activo, que el §6 de `ARCHITECTURE.md` lista como gap. **Corregido el 2026-08-22:** esta
  línea lo daba por existente y oculto con `hidden`, la misma afirmación muerta que el PR #97 sacó
  del §6 sin mirar acá.
- **lock de acorde**: fijar un acorde para que el motor deje de redetectarlo y evalúe la melodía
  contra él. Hasta el 2026-08-11 nombraba un botón; hoy nombra el caso más simple de una función,
  liberar la mano izquierda para concentrarse en la melodía. Un acorde, sostenido, sin ritmo; arpegio,
  vals y progresión son los casos siguientes de la misma función. Escribe `State.harmony`, no
  `State.universe`. Fuente: 2026-08-11, *El lock de acorde es su propio widget, y su función es
  liberar la mano izquierda*.
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
  escrita es la cascada de cuatro ramas de `Teclado.renderKeyboard`: acorde, veredicto, nota activa,
  escala. **Corregido el 2026-08-22:** decía `UI.renderKeyboard`, y la entrada *`Escala`, `Teclado`,
  `Readout` y `Armonia`* de este mismo archivo dice que `UI` ya no existe. Las cuatro ramas sí son
  las que están en `src/teclado.js`; el objeto que las contiene era el nombre viejo. Fuente: 2026-08-11, *Los efectos sobre las teclas, y la primera precedencia escrita del
  repo*.

- **`Escala`, `Teclado`, `Readout` y `Armonia`**: los cuatro objetos en que se disolvió `UI` al
  repartir por permiso. `Escala` edita el universo y es el único con permiso de escritura, `Teclado`
  construye y pinta las 88 teclas y es capa 0, `Readout` presenta la salida del motor y solo lee, y
  `Armonia` manda sobre el buffer de armonía y el de evaluaciones. `UI` ya no existe. Fuente:
  2026-08-11, *`UI` se disuelve: el reparto por permiso y las fixtures de geometría*.
- **corte puro**: una partición que mueve bloques a archivos y no mueve un solo método, ni renombra,
  ni reordena. Se prueba concatenando los archivos nuevos en orden de carga y comparando contra el
  original: la única diferencia admitida son los encabezados de archivo. Fuente: 2026-08-11, *La
  partición se hace en dos PR, y el primero es un corte puro*.

- **registro diferencial**: forma de registrar el coloreo que escribe una línea solo cuando una tecla
  cambia de categoría, con la tecla, la categoría que sale, la que entra y qué rama de la cascada
  ganó. Un repintado que no cambia nada no escribe nada. Todavía no está construido. Fuente:
  2026-08-11, *El coloreo se registra de forma diferencial, no absoluta*.

- **estado derivado**: un dato que el programa calcula a partir de otro que el usuario eligió. El
  conjunto de alturas válidas del universo es el caso vivo: sale de la tónica y el tipo. No se
  persiste, se reconstruye. Fuente: 2026-08-11, *El estado derivado no se persiste, se reconstruye*.
- **reset a fábrica**: el control que devuelve la configuración a sus valores por defecto. Borra
  `midiTrainerCfg` y `midiTrainerUniverse`, y no toca `midiTrainerLayout`, que tiene su propio reset
  en el menú de Widgets. Vive dentro de la consola y pide confirmación. Fuente: 2026-08-11, *El reset
  a fábrica borra la configuración y no toca la disposición*.

- **feedback de veredicto sonoro**: los tres sonidos cortos que marcan acierto, sensible y error.
  Se generan con osciladores al vuelo, sin archivos y sin MIDI, y son una superficie del sistema que
  cada widget decide usar, igual que el teclado coloreable. Es lo que entrega la Fase 7. Fuente:
  2026-08-11, *Feedback de veredicto y música son dos cosas, y el sonido es una superficie del
  sistema*.
- **música**: acompañamiento, arpegios y progresiones. Sale por MIDI hacia el sintetizador que el
  usuario ya tiene, no la sintetiza la app, y es del widget de acompañamiento. No es de la Fase 7.
  Fuente: 2026-08-11, *Feedback de veredicto y música son dos cosas, y el sonido es una superficie
  del sistema*.
- **pánico**: mandar el apagado de todas las notas a los dieciséis canales del destino, no solo al
  activo. Se dispara al cerrar la página, al cambiar de puerto o de canal, y a mano. Va a los
  dieciséis porque si la app deja algo encendido no va a saber dónde, y el destino no tiene
  recuperación automática. Todavía no está construido. Fuente: 2026-08-11, *Dos requisitos de
  cualquier trabajo que mande notas MIDI*.

- **falso positivo declarado**: el sonido de error que suena por una nota que el indulto va a
  reclasificar a paso cromático al soltarla. Se acepta y no se corrige, porque al apretar el motor
  todavía no sabía. Fuente: 2026-08-11, *El feedback de veredicto suena al apretar, y el indulto no
  lo corrige*.

- **contexto temporal**: lo que se observó y se perdería si nadie lo escribe. Vive en
  `docs/CONTEXTO-TEMPORAL.md`, entra con una línea, su fecha y quién la anotó, sin evidencia
  obligatoria y sin campos, y sale a uno de cuatro destinos con el porqué que traía: un PR que la
  ataque, el BACKLOG, una fase, o el descarte. Su estado normal es vacío y su métrica es la velocidad
  de vaciado. Su prosa está exenta de las reglas de estilo. Reemplaza a **tema en discusión**, que
  vivía en `EN-DISCUSION.md` y exigía cuatro campos: eso filtraba por madurez, y lo que se pierde es
  lo crudo. Los cuatro campos siguen existiendo, pero como lo que una línea gana si se la promueve a
  tema, no como requisito de entrada. Fuentes: 2026-08-19, *Un tema en discusión tiene dónde vivir, y
  de dónde salir*, y 2026-08-20, *El archivo de tránsito filtraba por madurez, y lo que se pierde es
  lo crudo*, que la reemplaza.

## Método

- **piso de prosa**: las siete reglas propias de la sección "Prosa" de `CLAUDE.md`, que valen cuando
  el material original de las dos skills no está disponible en la sesión. Si está, por el plugin o por
  cualquier otra vía, ese material manda y el piso pasa a segundo plano. Cubre catorce de las
  veinticuatro reglas del original, medido el 2026-08-20. Fuente: 2026-08-20, *El material original
  manda si está, y el piso escrito cubre catorce de veinticuatro reglas*.
- **prosa corrida**: el texto de un documento que no es viñeta, tabla, encabezado, cita ni línea de
  glosario. Es lo único que alcanza el techo de cinco oraciones por párrafo de la regla 7, porque el
  resto es lista por diseño. Fuente: la misma entrada.
- **estado observable**: lo que vive en `State` y lo que persiste en `localStorage`. Es el disparador
  de la regla de verbosidad: una función que lo escribe deja su línea de `SysLog` en el mismo cuerpo.
  Lo que queda afuera es lo local a una función y lo que se deriva sin guardarse. Fuente: 2026-08-20,
  *La verbosidad del registro es una regla con disparador, no una intención*.
- **erosión de la verbosidad**: que el registro se vuelva menos completo con cada PR, porque el
  código nuevo lo trae solo si alguien se acuerda de pedirlo. Se mide contra la línea base de 94
  llamadas a `SysLog` del 2026-08-20: si un PR agrega funciones que escriben estado y ese total no se
  mueve, está pasando. Fuente: la misma entrada.
- **punto de entrada**: el archivo que contesta qué es el proyecto y hacia dónde ir, para quien llega
  sin contexto. Es `AGENTS.md`, en la raíz, y su trabajo termina cuando el lector llegó a `CLAUDE.md`
  y a `docs/ROADMAP.md`: no explica el método ni el estado, remite. No es un `README.md`, que sería
  para personas y que el autor pospuso, ni cuenta el estado del proyecto, que vive en el ROADMAP.
  Fuente: 2026-09-02, *`AGENTS.md` es el punto de entrada, y adoptarlo no garantiza que un modelo lo
  lea*.
- **documentación canónica**: los seis archivos que afirman algo del repo y que por eso envejecen y se
  corrigen. Cinco en `docs/`, más `AGENTS.md` en la raíz. Crear uno nuevo pide permiso del autor; la
  única excepción escrita es el `README.md` de subcarpeta que describe su propia carpeta, y
  `AGENTS.md` no entró por ahí. Fuente: la misma entrada.
- **gap**: algo que falta o que está limitado en el código, confirmado leyéndolo y con el comando que
  lo comprueba escrito al lado. Vive en el §6 de `ARCHITECTURE.md` y **se poda**: se borra en el PR
  que lo cierra, porque ese documento guarda el presente y el CHANGELOG guarda la historia. No es lo
  mismo que un ítem del BACKLOG, que es algo que se quiere hacer; un gap es algo que hoy es cierto
  del código. Fuente: 2026-08-21, *El §6 se poda en el PR que cierra el gap, y los números del §7 se
  recalculan con el mismo comando que declaran*.



- **umbral**: una alarma escrita que obliga a abrir una decisión cuando se cumple. Obliga a decidir
  y no decide: no receta un mecanismo. El único vivo es el de las 1000 líneas de código y markup de
  `index.html`, en el §7 de `ARCHITECTURE.md`. Fuente: 2026-08-11, *Los ES Modules no cargan desde
  `file://`, y el umbral deja de prescribir*.
- **promesa**: una frase del repo que afirma algo sobre una sintaxis, un protocolo o una API, y que
  por lo tanto puede ser falsa aunque el repo entero sea coherente. Un número se recalcula con un
  comando; una promesa solo se comprueba corriéndola. Fuente: 2026-08-11, *Los ES Modules no cargan
  desde `file://`, y el umbral deja de prescribir*.
