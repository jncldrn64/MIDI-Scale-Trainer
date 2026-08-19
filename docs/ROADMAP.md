# ROADMAP.md: MIDI Scale Trainer Pro

> Cómo se usa este documento con Claude Code: una fase por sesión. No se pasa a la fase
> siguiente sin probar la anterior en el piano físico. Cada decisión de teoría musical o
> de arquitectura que se tome durante una fase se anota en `DECISIONS.md` con fecha. No se
> pierde en un chat.

**Valores de estado:** `pendiente`, `en progreso`, `cerrada (YYYY-MM-DD)`.

**Convención de log (2026-07-25):** el criterio de aceptación de toda fase incluye que el
motor emita al log, etiquetado, lo que esa fase agrega, para que una sesión humana sea
auditable después. Ver DECISIONS, entrada del 2026-07-25.

---

## FASE 0: Infraestructura, antes de tocar una regla de teoría musical

**Estado:** `cerrada (2026-07-04)`

**Objetivo:** que el proyecto no se vuelva a perder, y que agregar una regla nueva no pueda
romper una vieja sin que algo avise.

**Alcance:** cuatro piezas de infraestructura.

1. **Sacar la PII.** El nombre real hardcodeado en `.credits` se reemplaza por algo
   genérico antes del primer commit.
2. **Repo git.** Local como mínimo; remoto privado (GitHub o GitLab) como backup real. La
   pérdida de la v11.5 fue exactamente el escenario que un repo evita.
   - `git init`.
   - Commit inicial: v11.0 (ya sin PII) como `index.html` en la raíz o en `src/`.
   - La v3.0 se guarda en `/legacy/v3.html` como referencia histórica, o se excluye. No
     aporta código reutilizable, solo contexto.
   - `.gitignore` mínimo. No hay build step todavía.
3. **Carpeta `docs/`** con `ARCHITECTURE.md`, `ROADMAP.md` y `DECISIONS.md` adentro del
   repo, al lado del código, no en un chat aparte.
4. **Fixtures de regresión.** El problema que se repite en todo el historial (Bad Apple,
   Oda a la Alegría, Blues) fue siempre el mismo: se arregla un caso y no hay forma de
   saber si una regla nueva rompe un caso viejo en silencio. La solución son datos: se
   graban los casos reales ya resueltos y se corre `MathEngine` contra ellos en Node. No
   hace falta framework de testing; un script con `assert` alcanza.

   Formato sugerido de una fixture:
   ```json
   {
     "name": "oda-a-la-alegria-re7",
     "universe": { "root": 0, "type": "major" },
     "notesPlayed": [50, 54, 57, 60],
     "expected": { "isDiatonic": false, "isSecondaryDominant": true, "target": "G" }
   }
   ```
   Cada caso nuevo que se resuelva (canción real, log real) se agrega como fixture. Cada
   fase que toque `MathEngine` corre las fixtures existentes antes de darse por terminada.

**Criterio de aceptación:** el repo existe con al menos 2 commits, las 3 fixtures (Bad
Apple, Oda a la Alegría, Blues Do7-Fa7-Sol7) están grabadas, y el runner `tests/run.js` las
corre con Node y `assert`, sin framework: 15 casos en verde. Cumplido el 2026-07-04; ya no
hay que correrlas a mano.

**Bloquea:** ninguna declarada

---

## FASE 1: Bug de raíz ambigua en `detectChord`

**Estado:** `cerrada (2026-07-04)`

**Objetivo:** preferir la interpretación más probable del acorde, el bajo como raíz, en vez
de la más baja numéricamente. Un numeral romano calculado sobre una raíz mal elegida es un
dato incorrecto que no se nota a simple vista (ver `ARCHITECTURE.md` §4), así que esta fase
va antes que los grados romanos.

**Alcance:** cambiar el orden de prioridad de las raíces candidatas en `detectChord`.
Probar primero el pitch class del bajo real (`bassPC`) como raíz, antes de iterar el resto,
y caer al orden ascendente genérico solo cuando el bajo no forma un template válido por sí
solo (inversión real). La matemática pura no lo resuelve del todo: Do6 y La m7 son el mismo
conjunto de cuatro notas, y ningún humano las separa sin escuchar la canción entera, así
que la fase no busca resolverlo perfecto. Se deja escrito en `DECISIONS.md` que la
ambigüedad total no tiene solución algorítmica simple. Implementada en la v11.6.

**Criterio de aceptación:** las fixtures de la Fase 0 siguen pasando y se agrega una fixture
nueva para el acorde ambiguo con bajo conocido. Cumplido con `tests/fixtures/raiz-ambigua.json`
(La m7 con bajo en La, Do6 con bajo en Do): `node tests/run.js` da 18 casos en verde.

**Bloquea:** Fase 3

---

## FASE 2: Fijar por escrito la jerarquía de evaluación armónica

**Estado:** `cerrada (2026-07-23)`

**Objetivo:** que la pregunta "¿en qué orden se evalúan las reglas cuando una nota no es
diatónica?" tenga una respuesta escrita, no un orden implícito en el código.

**Alcance:** fijar en `DECISIONS.md`, antes de programar, el orden de evaluación propuesto:

1. ¿Está en la escala activa? → `good`.
2. ¿Está en el acorde activo, incluyendo si ese acorde es una dominante secundaria
   reconocida? → `good`. Esto necesita que la Fase 3 conecte la detección de dominante
   secundaria a `evaluateMelody`, no solo a la UI, corrigiendo el gap que marcó el informe
   de campo.
3. ¿Es la sensible en contexto menor? → `tension`.
4. ¿Dura menos de 180ms al soltarse? → `passing`. Se evalúa al final, sobre lo que haya
   quedado como no-`good`.
5. Nada de lo anterior → `bad`.

Esto no es código todavía: es la especificación que la Fase 3 implementa.

**Criterio de aceptación:** el orden de evaluación queda escrito y fijado en `DECISIONS.md`
antes de programarlo. Cumplido el 2026-07-23: la jerarquía de cinco pasos quedó fijada en
`DECISIONS.md` (entrada 2026-07-23), con qué ya está en el código y qué completa la Fase 3.

**Bloquea:** ninguna declarada

---

## FASE 3: Grados romanos y conectar la dominante secundaria a la evaluación real

**Estado:** `cerrada (2026-07-25)`

**Objetivo:** que el motor muestre el numeral romano del acorde y que una nota de la
tonicización, por ejemplo Fa# sobre un Re7 en Do Mayor, deje de marcar error en la
evaluación, no solo en la UI.

**Alcance:**

1. `MathEngine.getRomanNumeral(chordObj, universeRoot)`: aritmética modular, mayúscula o
   minúscula según la calidad del acorde. Corregir el bug ya detectado en el chat previo:
   el numeral objetivo de una dominante secundaria no se fuerza a minúscula por defecto,
   se calcula como cualquier otro numeral (depende del grado real, no de una regla fija).
2. Conectar la detección de dominante secundaria a `evaluateMelody`, no solo a
   `updateStatus` (UI). Esto es lo que hace que tocar Fa# sobre un Re7 en Do Mayor deje de
   marcar error.
3. UI: el panel "Análisis de Armonía" muestra el numeral.
4. El motor emite al log, etiquetado, lo que esta fase agrega: el numeral romano derivado, la
   relación del acorde y el objetivo de la dominante secundaria. `classifyChordRelation`, que
   cuando se escribió esta fase solo poblaba la UI, pasa a registrar su resultado; esto
   cierra el hueco que la decisión del log del 2026-07-25 dejó anotado. Cumplido: hoy la llamada
   vive en `UI.updateStatus` y escribe la línea "Análisis:" con la etiqueta MATH.

**Criterio de aceptación:** la fixture de Oda a la Alegría pasa mostrando `II7 (V del V)` (o
la etiqueta equivalente correcta), y Fa# tocado en la melodía sobre ese acorde ya no marca
error. Además, la validación es de tres vías a la vez: la fixture pasa desde los archivos, el
autor lo ve en Chrome, y el log registra el numeral, la relación y el veredicto nota por nota,
de modo que si la UI luego mueve el panel, la prueba ya quedó en el log.

**Bloquea:** Fase 4

**Bloqueada por:** Fase 1

---

## FASE 4: Función tonal

**Estado:** `cerrada (2026-07-25)`

**Objetivo:** que el motor nombre la función de cualquier acorde (Tónica: I, vi, iii;
Subdominante: IV, ii; Dominante: V, vii°) y la exponga en el buffer del motor para que
cualquier panel la consuma.

**Alcance:** es salida del motor, no una característica (ver el protocolo de clasificación
en `DECISIONS.md`, 2026-07-25). No lleva panel propio: el motor deriva la función del grado
del acorde en la tonalidad y la escribe en el buffer del motor, del que leen todos los
paneles a la vez. El material teórico es el que el `GLOSARIO.md` guarda bajo "función tonal";
el motor implementa eso: Tónica (I, vi, iii), Subdominante (IV, ii), Dominante (V, vii°).

**Criterio de aceptación:** dado un acorde y una tonalidad, el motor devuelve su función, y
las fixtures existentes lo confirman en los casos que apliquen.

**Nota de cierre (2026-07-25):** la función se calcula, se bufferea (`State.harmony.function`)
y se loguea; su display en el panel de Análisis es alcance de la Fase 5, parqueado ahí, no se
hizo acá. La menor devuelve "por definir", porque la teoría escrita cubre solo la agrupación
mayor, y un acorde no diatónico no recibe función forzada.

**Bloquea:** Fase 8.

**Bloqueada por:** Fase 3 (necesita el numeral romano).

---

## FASE 5: Reencuadre visual al modelo de paneles (el teclado como fondo)

**Estado:** `cerrada (2026-08-11)`, con la v11.64

**Objetivo:** realinear la UI al modelo de capas del 2026-07-25, superando el primer intento
apilado. El fondo es una sola capa de piano más notas que caen; las características flotan como
widgets sobre ese fondo; y las opciones y los logs viven en una barra de menús permanente.
Sigue sin tocar el motor.

**Alcance:** los cambios son de disposición, estructura y estilo, no de motor. Fondo único: el
teclado y las notas que caen ocupan todo el ancho y alto, y las notas pasan por detrás de los
widgets, no en una franja aparte. Las características flotantes se tratan como widgets sobre el
fondo, sin construir todavía el gestor completo de paneles, que el ADR del 2026-07-24 reserva
para la segunda característica. La barra de menús permanente, que las entradas de decisiones
anteriores llaman panel de pestañas, se establece como chrome para opciones y logs, separado del
fondo mudo. Y se decide dónde vive la salida del motor en el
modelo de capas, sobre el teclado, en una superficie de feedback permanente, o dentro del
widget que la pidió, garantizando que siga habiendo una lectura visible o que el log la cargue.
El teclado visual es fijo de 88 teclas a todo el ancho, independiente del zoom. El coloreo del
teclado que ya existe en `renderKeyboard`, la escala pintando sus notas y el veredicto nota por
nota pintando lo que se toca, es una superficie de feedback de la que dependen los dos widgets
planeados, y se preserva en esta fase: no se rehace, no se difiere y no se apaga, porque apagarlo
es una idea de backlog y no de esta fase. No se toca el motor.

La animación es sutil y solo existe para dar feedback. No se busca el estilo de las interfaces de
Apple, con transiciones largas y decorativas. Los cambios de estado son instantáneos, y las teclas
del fondo no se mueven, no tiemblan ni rebotan: son la referencia estable contra la que el usuario
lee. Esto aplica a todo lo que el sistema de widgets agregue, mover, opacidad y abrir o cerrar. Se
escribe acá porque el incremento 5.3 introduce mover y opacidad, y sin regla escrita se agregan
transiciones por costumbre. Es un requisito no funcional y su hogar definitivo es el documento de
requisitos parqueado en "Deuda de método y documentación"; vive acá mientras ese documento no
exista.

El presupuesto visual también es una restricción, no una preferencia. El texto es la superficie
barata, y por eso el feedback del sistema y los subtítulos del entrenamiento son texto y no
efectos. El coloreo de las teclas que ya existe es el techo de lo que la pantalla gasta en pintar,
no un piso desde el cual crecer: si algo nuevo necesita más que eso, primero hay que justificar por
qué. Como la regla de animación, esto es un requisito no funcional y su hogar definitivo es el
documento de requisitos parqueado en "Deuda de método y documentación".

La legibilidad manda sobre el tamaño. Un widget chico que se lee sirve; uno grande que tapa las
notas no, y si todo se hace grande no entra nada. El criterio es el de las interfaces que permiten
escalar su tamaño: a cualquier escala, el texto y los iconos tienen que seguir siendo legibles, y
si al reducir algo deja de leerse, el problema es el diseño de ese algo y no la escala. De ahí que
la agrupación se resuelva por proximidad, alineación y contraste, las leyes de la percepción, en
vez de por efectos, marcos y sombras. Minimalismo funcional: cada elemento que se agrega tiene que
ganarse el espacio que tapa. Como la regla de animación y el presupuesto visual, esto es un
requisito no funcional y su hogar definitivo es el documento de requisitos parqueado en "Deuda de
método y documentación".

Qué está activo se señala bajando la opacidad de lo demás, no agregando marcos, colores nuevos ni
subrayados. Vale para elegir entre vistas de un mismo widget y para cualquier control con estados
excluyentes. Es coherente con dos cosas ya escritas: la opacidad ya es la jerarquía de atención
entre vistas simultáneas, y el presupuesto visual pide que nada nuevo gaste pintado si se puede
resolver con lo que ya existe. Como sus hermanas, esta convención es un requisito no funcional y su
hogar definitivo es el documento de requisitos parqueado en "Deuda de método y documentación".

Los tres widgets que compiten nacen con el mismo molde, y el molde tiene número: alto de 170 px y
ancho de veinte píxeles más que el ancho anterior de 23vw, sin pasar nunca de dos octavos del ancho
de la ventana. Nacen repartidos en tres puntos, con la misma separación entre ellos, debajo de la
franja de nacimiento. Entre los tres no tapan más de tres octavos del alto de la zona de notas; las
cajas de sistema no cuentan contra ese tope y se miden aparte. Si el molde entra en conflicto con el
tope en alguna resolución, manda el tope, y la app lo reporta al cargar.

**Terminología de pantalla.** La Fase 5 también corrige los nombres que ve el usuario, que son
de display, no de motor. Primero, las etiquetas del botón de nomenclatura, hoy "Latina" y
"Anglosajona", se reemplazan por etiquetas de forma: "Silábica" para Do-Re-Mi y "Alfabética"
para C-D-E. Do-Re-Mi es solfeo, de origen italiano medieval, no latinoamericano, y las letras
no son propiamente anglosajonas; nombrarlas por su forma evita atribuir a una cultura algo que
es de notación. Falta una distinción que hasta ahora no había quedado escrita en ningún documento
del repo, aunque ya se había identificado: el solfeo puede usarse con Do fijo, donde Do es siempre
la misma altura, o con Do móvil, donde Do es la tónica de la escala activa y se corre con ella.
Esta app usa Do fijo. Por eso nombrar la opción por su forma, silábica frente a alfabética, es
correcto pero incompleto si alguien asume Do móvil: la etiqueta dice cómo se escriben las notas,
no si la referencia se mueve. Junto con eso, se define el valor por defecto de la nomenclatura, se persiste la
elección por `localStorage` con el mismo mecanismo que la persistencia de layout, y se deja el
botón alcanzable en los menús nuevos. Segundo, la etiqueta "Intercambio Modal" que hoy muestra
el panel de Análisis sale del caso else de `classifyChordRelation`, el fallback de "no diatónico
y no dominante secundaria"; no es un diagnóstico derivado, es "no reconocido", y presentarlo
como intercambio modal le afirma al usuario un análisis que el motor no hizo. **Entregado en el
incremento 5.5.2:** el texto en pantalla dice "Sin clasificar" y el valor interno pasó a
`unclassified`, en el mismo idioma que sus dos hermanos. El nombre interno se decidió acá y no en
la Fase 11, que es la que va a escribir la teoría del intercambio modal de verdad. Tercero, la
función tonal que la Fase 4 calcula y escribe en el buffer sin mostrarla se muestra acá en el
panel de Análisis, junto al numeral y la relación, de forma consistente con el relabel honesto:
para un acorde no diatónico la función dice "por definir" y la relación dice "no clasificado",
sin que una contradiga a la otra.

Cuarto, el rótulo del widget de escala se deduplica. Hoy la caja dice "Escala" en su título y
"Universo:" en la línea de abajo, dos palabras para la misma cosa sin relación declarada. Queda un
solo rótulo, con "Universo" como término primario y "escala" como aclaración entre paréntesis, según
`DECISIONS.md`, entrada del 2026-08-10 "Universo es el término primario, y escala la aclaración que
se retira sola". Esa entrada trae además la condición que retira el paréntesis: el día que entre al
selector un universo que no es una escala, o sea las pentatónicas o el blues del BACKLOG. Con una
precisión que queda escrita para que una futura pasada de nomenclatura no la borre: el nombre
interno del motor, `universeType`, `universeRoot` y
`universePitchesSet`, se queda como está a propósito. "Universo" adentro nombra el conjunto de
notas permitidas, que no siempre es una escala de siete notas: el backlog trata a las pentatónicas
y al blues como universos propios justamente porque no lo son. Renombrar adentro aplanaría esa
distinción. El renombre interno, si alguna vez se hace, es trabajo del punto de nomenclatura de
"Deuda de método y documentación", con su propio PR y las fixtures en verde.

Quinto, la etiqueta naranja de la leyenda entra a la lista de renombres. Nombra un caso
único, la sensible en universo menor, y se lee como si nombrara una familia de tensiones
permitidas. El nombre nuevo se decide junto con los otros de esta subsección.

**Incrementos de entrega.** La fase se entrega en cinco incrementos, del más estructural al más
cosmético, cada uno un PR de código que se puede ver y corroborar por separado.

- Incremento 5.1, **entregado en la v11.32**, fondo único: el teclado y las notas ocupan todo el ancho y alto como una sola
  capa de fondo, las notas pasan por detrás de los overlays, y la disposición apilada actual pasa
  a fondo más overlays en posiciones por defecto fijas, todavía sin mecánica de widgets. El
  coloreo del teclado que ya existe queda intacto. Motor intacto.
- Incremento 5.2, **entregado en la v11.43**, barra permanente y chrome global: la barra de menús permanente tipo macOS, que
  las entradas de decisiones anteriores llaman panel de pestañas, y que aloja las opciones y el
  log. La barra trae los menús que ya tienen contenido real: opciones, donde viven los
  cuatro ajustes del motor, y log, que se descarga o se copia y no tiene terminal propia. El menú de
  widgets no se construye acá sino en el 5.3, junto con los widgets que va a listar. El 5.2 le da
  hogar en el menú de opciones al botón "Centrar en Split", que hoy está parqueado y oculto. El
  panel "Fijar Acordes" sigue esperando: no está decidido si es un control, y entonces va a
  opciones, o una característica de práctica, y entonces es candidato a widget y su lugar es el menú
  de widgets del 5.3. Ninguno de los dos se borra. Con una restricción verificada contra el
  comentario que hoy tiene `index.html` en su línea 354, el que quedó después de la mudanza del
  5.2: los Ajustes del Motor "siguen alcanzables mientras se toca: abrir el menú es un clic y cada
  campo queda a la vista". El 5.2 puede darles hogar en un menú, pero tiene que seguir cumpliendo esa razón,
  así que los cuatro campos, acumulación, retención, error visual y split, quedan alcanzables sin
  fricción mientras se toca, no enterrados a varios niveles de profundidad. Como techo de trabajo:
  nada que alguien use mientras toca debería costar más de tres clics. El número es un techo
  revisable y no un dogma; lo que no se negocia es que quien solo quiere tocar no pague fricción.
  En esta entrega el log queda visible como menú u opción alcanzable, aunque la decisión del
  2026-07-25 diga que la consola de debug se queda detrás de submenús, oculta para quien solo
  toca. El motivo: hoy la barra tiene un solo nivel y no hay nada detrás de lo cual esconderlo,
  así que esconderlo sería inventar profundidad vacía. Es una desviación consciente y temporal, no
  un olvido, y se corrige cuando la barra crezca. El menú de opciones se ordena con un preajuste
  arriba y los números abajo. Las ventanas de tiempo del motor son tres, acumulación, retención y
  error visual, y hoy quien quiere leer más despacio tiene que entender y tocar esos números.
  Encima de ellos va un preajuste de aprendizaje, un solo control que mueve esas tres juntas a
  valores tolerantes. Split queda fuera del preajuste: escribe `State.config.splitNote`, el número
  de nota MIDI donde se separan las manos, y es una preferencia de manos del usuario, no una
  tolerancia de lectura. Los cuatro campos siguen viviendo juntos abajo para quien quiera afinar.
  Es la misma regla de fricción escrita más arriba: el que solo quiere tocar no debería pagar
  decisiones numéricas para que la lectura le siga el pulso. Esta forma del menú se fija ahora
  aunque los valores concretos del preajuste se decidan al implementar, para no construir el menú
  dos veces.
- Incremento 5.3, **entregado en las v11.44, v11.46 y v11.53**, sistema de widgets: mover la caja arrastrando con el mouse, que es la
  única acción directa sobre ella, y el resto desde el menú de widgets, opacidad, apagar, reset
  a posición por defecto y persistir; el cap de tres ranuras para los que compiten; el menú de
  widgets en la barra, que coloca, restaura uno cerrado y da acceso a los controles de cada
  instancia colocada, listando instancias y no tipos; el estado por instancia, ubicación, vista,
  opacidad y opciones, con reset por instancia; el readout de la
  salida del motor se vuelve el primer widget de sistema en una ranura, el caso de prueba. El
  feedback suma los avisos simples del sistema, ranuras completas y restaurar widget oculto. El
  widget de escala no se construye desde cero: la vista lineal ya existe y funciona hoy dentro de
  la barra de universo, es el elemento identificado en el código como la vista de fórmula, y el
  widget de escala la absorbe. Reescribirla de nuevo es un error a evitar. Este apunte existe
  justamente porque nada en el repo nombraba qué era esa vista, y por eso se la pasaba por alto al
  planear. El 5.3 se entrega en tres PR de código: el primero la forma, las cajas en su molde y su
  posición por defecto, todas quietas; el segundo el movimiento, con el molde y la medición de
  cobertura separada en dos cifras, el arrastre, los límites del área, el piano abajo y la barra
  arriba, los puntos de nacimiento con su reset y la persistencia por identidad; el tercero
  cerrar, el menú de widgets y el cap de tres. El orden es a propósito: la disposición por defecto
  tiene que ser verificable antes de que exista el arrastre, porque con arrastre cualquier caja
  mal puesta se excusa con moverla. Y cerrar va con el menú en el mismo PR, no antes: cerrar sin
  un menú que restaure deja una caja cerrada sin forma de recuperarla salvo recargando la página.
  Ese tercer PR emite además por el feedback el aviso de cada cierre con la forma de restaurarlo.
  **Las tres partes están entregadas.** La tercera corrigió además el clamp de abajo: el área de
  arrastre llega al borde de la ventana, según la corrección del 2026-08-09, y un widget puede
  quedar sobre el piano. El punto de nacimiento de un widget que se abre desde el menú quedó
  decidido acá: el primero libre de izquierda a derecha, contando por asignación y no por dónde
  esté la caja en pantalla, y con los tres tomados la apertura se bloquea y el feedback lo avisa.
- Incremento 5.4, **entregado en la v11.60**, nomenclatura por forma: las etiquetas del botón de nomenclatura pasan a
  "Silábica" y "Alfabética", con valor por defecto, persistencia por `localStorage` y el botón
  alcanzable. Suma dos trabajos más de nombres y símbolos. Uno es la mudanza física de la leyenda
  de colores a la guía, que la entrada de decisiones del 2026-08-09 ya resolvió en el papel y este
  incremento ejecuta. El otro es decidir la regla de iconos y emojis de la interfaz, que hoy no
  existe escrita; el ítem de coherencia visual del set de iconos del BACKLOG es el material de
  partida y se cierra acá, en vez de quedar dos veces anotado. Suma tres trabajos más. La leyenda de
  colores se muda a la guía con contenido escrito a mano, seis filas con color, nombre de la
  categoría y widget dueño, fijo y sin filtrado dinámico. El punto "Nomenclatura de lo que ya
  existe" de la deuda de método deja de estar suelto y lo toma este incremento. Y "Glosario vivo en
  vez de glosario congelado" deja de ser sugerencia: lo ejecutó el PR que creó `docs/GLOSARIO.md`, y
  lo que queda acá es poblarlo con los nombres de los artefactos que hoy no tiene nombre ningún
  documento. Suma también el interruptor para encender y apagar los nombres de las teclas, que va
  junto al selector de nomenclatura porque son la misma superficie de control. La razón que lo hace
  pertinente y que no estaba escrita en ningún lado: la nomenclatura alfabética usa un carácter
  donde la silábica usa dos, así que elegir nomenclatura tiene una consecuencia de legibilidad que
  crece cuando la pantalla es chica.
  **Entregado.** Los seis trabajos están hechos: las dos etiquetas de nomenclatura, el renombre de
  la sensible, la deduplicación del rótulo del widget de escala, la regla de iconos escrita en
  `CLAUDE.md` con el código conforme a ella, el interruptor de nombres de tecla y el arreglo del
  texto borroso. Dos cosas quedaron afuera a propósito y no se dan por cerradas: el nombre interno
  `latino` sigue como está, porque renombrarlo es el punto de nombres internos de "Deuda de método y
  documentación" con su propio PR, y poblar el glosario con los artefactos ya lo hizo el PR anterior
  del 2026-08-10.
- Incremento 5.5, **entregado en las v11.62 y v11.63**, análisis honesto. Se entrega en dos PR, con el mismo criterio con que el 5.3 se
  entregó en tres: el corte es si toca el motor. El **5.5.1**, entregado, muestra la función tonal
  y no toca `src/engine.js`. El **5.5.2**, entregado, hizo el relabel del tercer valor de la
  clasificación y es el primero y único de toda la Fase 5 que tocó el motor: una sola línea, el
  `return` final de `classifyChordRelation`, con las 41 fixtures como red. La subdivisión no
  renumera nada: el 5.5 sigue existiendo y la fase sigue cerrando con el 5.6.
  El alcance original: la función tonal que la Fase 4 dejó en el buffer se muestra en
  el panel de Análisis junto al numeral y la relación, y la etiqueta del tercer caso de la cascada se
  relabela. Los dos trabajos no fueron juntos: el corte por motor los separó, y el estado intermedio
  quedó declarado en vez de evitado. Los dos están entregados.
- Incremento 5.6, **entregado en la v11.58**, el cascarón del lienzo: el contenedor de 1280 x 720 escalado y centrado, con las
  franjas negras, la corrección del arrastre y las medidas que leían la ventana pasando a leer el
  lienzo. Es la primera de las dos piezas en que se partió la migración; la segunda, normalizar cada
  medida y cada comentario restante, se queda en la Fase 5B. Entra a esta fase por el criterio del
  2026-08-10: sin lienzo hay que escribir reubicación de cajas por `resize` y borrarla después. La
  razón completa vive en `DECISIONS.md`, entrada del 2026-08-10 "La migración al lienzo se parte en
  dos, y la primera mitad vuelve a la Fase 5".

La fase pasó a `en progreso` al completarse el incremento 5.1, y a `cerrada` el 2026-08-11, con los
seis entregados y corroborados por el autor en el navegador.

**El gestor de paneles se parte, y la salida del motor tiene lugar.** El ADR del 2026-07-24
reserva el gestor completo de paneles para la segunda característica. Esa reserva es del gestor
completo, no de toda capacidad de manejo. Mover y persistir la posición de un overlay es de esta
fase, sobre los overlays que el fondo único crea: el readout, el feedback, los subtítulos y los
controles. Lo que espera a la Fase 9, la primera característica de verdad, es la competencia por
las tres ranuras. Y el "dónde vive la salida del motor" se
resuelve según la refinación del readout como widget del 2026-07-25: las tres lecturas, notas
activas, acorde detectado y análisis, se presentan en el readout, un widget de sistema que ocupa
una ranura, se mueve, opacidad y se cierra, mientras el dato sigue siempre en el buffer y en el
log. Presentar no hardcodea: el widget lee el buffer, no recalcula. El teclado sigue consumiendo
el buffer aparte, coloreando sus teclas, como cualquier otro consumidor.

El feedback del sistema muestra lo de nota por nota, correcto, tensión, paso cromático y error, en
paralelo con el coloreo de las teclas, que consume el mismo buffer. El readout muestra lo de nivel
de acorde: notas activas, acorde detectado y el análisis de armonía, que es donde vive la relación
del acorde con el universo, el intercambio modal incluido. No es un rol nuevo, es el que ya está
implícito en el código y no estaba escrito.

**La reserva del fondo, resuelta con un presupuesto de superposición.** La reserva no se reduce. Las
notas conservan toda la altura entre la barra de menú y el piano, y los widgets flotan encima con
las notas pasando por detrás. Lo que se acota es cuánto pueden taparla: tres octavos del alto como
tope, y dos octavos del ancho por widget como máximo, dejando dos octavos de aire lateral. Así la
regla 3 del ADR del 2026-07-24 queda en pie y además se puede verificar con un número, en vez de
ser una intención.

La distinción entre mostrar notas que bajan como ayuda de lectura y un juego de ritmo con puntaje
sigue valiendo: lo segundo es otro eje de producto. Y queda dicho sin adornos que este alto se le
reserva a un motor de notas que todavía no existe ni tiene fase, que es una apuesta tomada a
conciencia.

**Deuda verificada contra el código.** Lo que sigue no es impresión: cada punto se comprobó contra
`index.html`.

- Dos widgets existen solo como andamiaje y no tienen contenido: el tercer widget, rotulado por
  construir, y el widget de prueba. El segundo se creó porque el cap es de tres y sin un cuarto
  candidato la rama que bloquea una apertura no se puede ejercer desde la interfaz. Los dos nacen
  cerrados, así que no se dibuja nada, y se retiran cuando existan los widgets de verdad.
- El botón "Motor Automático" bloquea el acorde detectado para que el motor deje de redetectarlo
  mientras se practica sobre él, y al hacerlo cambia su rótulo a "Motor Pausado". El incremento 5.6
  lo ocultó, con el mismo mecanismo y el mismo tenor que "Fijar Acordes": vivía en el contenedor de
  controles del escenario, que es capa 0, y esa capa no lleva controles interactivos. Se ocultó, no
  se borró, y `lockChord` y `unlockChord` siguen funcionando. Lo que queda sin decidir es el destino
  de la característica.
- El panel "Fijar Acordes" ya está oculto a propósito, con un comentario en `index.html` que lo
  declara y pide no borrarlo. Su destino no está decidido, y es la otra mitad de la misma
  característica que "Motor Automático".

**Criterio de aceptación:** el fondo es una sola capa con el teclado y las notas a todo el
ancho, las notas pasan por detrás de los overlays, la barra de menús permanente existe como
chrome para opciones y logs, la salida del motor tiene un lugar visible definido o queda
cubierta por el log, ningún cambio de esta fase altera el comportamiento del motor, todos los
fixtures existentes siguen pasando, y el autor lo corrobora en el navegador.

La cláusula del motor decía "el motor y el coloreo quedan intactos" y se reformuló, porque el
incremento 5.5.2 tocó una línea de `src/engine.js` a propósito. Que un criterio de aceptación de
una fase de interfaz admita tocar el motor no es un descuido: está decidido y comprobado en
`DECISIONS.md`, entrada del 2026-08-11 "El Criterio de aceptación de la Fase 5 decía que el motor
queda intacto, y envejeció". Ahí están las dos pruebas que reemplazan a la palabra "intactos", un
`diff` sobre `src/engine.js` que muestre solo cambios de nombre de un valor de salida, y las 41
fixtures en verde.

**Nota de reapertura (2026-07-25):** el primer intento, apilado, se construyó y quedó en
V11.19. Sirvió para ver que el modelo real es de capas, no de pila. Se reabre la fase para
realinear la disposición a capas según la refinación del modelo del 2026-07-25. El apilado
queda superado, no se borra del código hasta que esta fase corra. La palabra "característica"
de las fases anteriores se lee como "widget" según esa misma refinación.

**Bloquea:** Fase 9 (aporta la primera ranura y la estructura fondo-overlay).

**Bloqueada por:** ninguna declarada.

---

## FASE 5B: Partir `index.html` en archivos, con el contrato escrito antes

**Estado:** `cerrada (2026-08-11)`, con la v11.70

**Objetivo:** escribir qué tiene que hacer cada pieza y recién entonces partir el archivo. Lo que
pide esta fase no es el conteo de líneas sino el contrato de widgets y entrenamientos, que la
subsección "Documento de requisitos, propósito y público objetivo" de "Deuda de método y
documentación" ya reclama: qué puede usar o alterar un entrenamiento, qué puede usar o alterar un
widget, y qué determina que algo sea uno, otro o ninguno.

Ese motivo manda sobre el conteo por una razón mecánica: cómo se parte el archivo depende de qué
tiene que hacer cada pieza. Partir primero y escribir el contrato después garantiza repartir de
nuevo, que es el trabajo sobre trabajo que la Fase 5 sufrió por no levantar requisitos antes.

El umbral del §7 sigue siendo la alarma que abrió esta fase y ya no dice cómo resolverla. Desde el
2026-08-11 obliga a abrir una decisión, no a aplicar un mecanismo: la razón vive en `DECISIONS.md`,
entrada del 2026-08-11 "Los ES Modules no cargan desde `file://`, y el umbral deja de prescribir".
Medido el 2026-08-11, `index.html` tiene 1524 líneas totales y 1171 de código y markup, y
`src/engine.js` 249; el §7 trae los comandos que lo recalculan.

**Por qué 5B y no un número nuevo:** insertar una Fase 6 nueva obligaría a correr las seis fases
siguientes, y los encabezados de este archivo son anclajes de los que un modelo saca qué hacer al
ejecutar una fase. Tampoco puede llamarse 5.5, porque ese nombre ya lo usa el quinto incremento
de la Fase 5. La letra evita las dos colisiones y deja el orden de ejecución claro: va después de
la Fase 5 completa y antes de la Fase 6.

**Alcance:** partir `index.html` en archivos con scripts clásicos, cada uno cargado con su
`<script src>`, sin `import`, sin `export`, sin build step, sin bundler y sin framework.
`src/engine.js` se queda como está: ya es el motor puro y corre en Node contra las fixtures. La app
tiene que seguir abriendo desde `file://`.

**Primer trabajo: el contrato de permisos. Entregado el 2026-08-11.** Doc-only, antes de tocar una
línea de código. Vive en `DECISIONS.md`, entradas del 2026-08-11 "El contrato de permisos: sistema,
permiso de escritura y solo lectura" y "Los efectos sobre las teclas, y la primera precedencia
escrita del repo". Fija tres niveles de permiso, qué efectos hay sobre las teclas y con qué dueño, y
que compartir un efecto se permite solo con precedencia escrita.

Lo de los entrenamientos queda diferido a propósito, no olvidado: qué pueden alterar, su formato y
cómo se registran se definen de forma colateral cuando exista el primero, y ese es el disparador.
Cuando llegue hay que atarlo a la nota de contrato de salida parqueada en la Fase 9, para no
terminar con dos documentos que dicen lo mismo con sentidos distintos.

**Segundo trabajo: la partición, en dos PR.** Con el contrato en la mano los cortes se deducen en vez
de discutirse: **se corta donde cambia el permiso.** Lo que es sistema va junto, lo que tiene permiso
de escritura va junto, y lo que solo lee y presenta va junto. La separación que `ARCHITECTURE.md` §2
documenta, `State`, `MIDI`, `UI` y `SysLog`, es el punto de partida, no el resultado.

**Primera parte, el corte puro. Entregada el 2026-08-11 con la v11.67.** Los bloques se mudaron a
archivos y no se movió un solo método entre objetos: `index.html` quedó como markup, los estilos
salieron a `src/estilos.css` y el script se repartió en diez archivos bajo `src/`, cargados como
scripts clásicos en el orden del original. Por qué se hace en dos PR, los dos datos que lo hacen
seguro y el criterio de nombres viven en `DECISIONS.md`, entrada del 2026-08-11 "La partición se hace
en dos PR, y el primero es un corte puro".

**La verificación con el piano físico que el Criterio de aceptación pide quedó cerrada el
2026-08-11.** El PR del corte puro la declaró pendiente, porque corrió headless y ahí no hay Web
MIDI. El autor conectó un teclado CASIO por USB y tocó sobre el `index.html` ya partido: el
dispositivo se conectó, las notas entraron, el motor detectó cuatro contextos distintos y evaluó nota
por nota, incluida la sensible en universo menor, que es el único caso que dispara ese color. La
segunda parte se corroboró igual y con más exigencia, comparando dos registros de la misma pieza
tocada dos veces: los contextos, los análisis armónicos y los veintinueve veredictos salieron
idénticos, línea por línea y en orden.

También quedó ejecutado lo que ya estaba decidido acá: el CSS salió a su propio archivo, 270 líneas,
y el markup se quedó, porque sin ES Modules y sin build no existe forma de incluir un fragmento de
HTML desde otro archivo. Sacarlo obligaría a construirlo desde JavaScript, que es peor de leer y
elimina la posibilidad de ver la estructura abriendo el archivo. Es la misma familia de restricción
de plataforma que el CORS: ver `DECISIONS.md`, entrada del 2026-08-11 "Los ES Modules no cargan desde
`file://`, y el umbral deja de prescribir".

**Segunda parte, la reorganización por permiso. Entregada el 2026-08-11 con la v11.69.** `UI` se
disolvió en cuatro objetos, uno por nivel de permiso: `Escala` con `buildUniverse`, el único con
permiso de escritura; `Teclado` con `buildKeyboard` y `renderKeyboard`, capa 0; `Readout` con
`updateStatus`, solo lectura; y `Armonia` con `clearEvaluations`, `lockChord` y `unlockChord`,
sistema. `saveLayout` y `loadLayout` volvieron a `layout.js`, y `saveConfig` y `loadConfig` se fueron
con `State`: la persistencia vive con lo que persiste. Los dos puntos de deuda que arrastraba quedaron
cerrados, el tratamiento visual de las cuatro lecturas del readout y el log de puertos MIDI, que ahora
escribe tipo e identificador. Las razones viven en `DECISIONS.md`, entrada del 2026-08-11 "`UI` se
disuelve: el reparto por permiso y las fixtures de geometría".

**Las fixtures de geometría quedaron decididas que no**, y con criterio de reapertura escrito. La
justificación que este documento les daba, que la geometría es aritmética pura sin DOM, se verificó y
es falsa: `Layout.area`, `Layout.zonaNotas`, `Layout.clamp`, `Layout.cobertura` y
`Layout.puntosCompeten` leen todas el documento. Cubrirlas hoy pide un DOM falso, y un DOM falso
prueba el doble. La condición que reabre la decisión está en la misma entrada de `DECISIONS.md` y se
comprueba con `grep` sobre `layout.js`.

Una restricción de la partición que conviene tener presente desde ahora: las fixtures corren en
Node, y `src/engine.js` lleva una envoltura escrita a mano por eso, con `module.exports` para Node y
`root.Engine` para el navegador. Cualquier archivo nuevo que quiera cubrirse con `node tests/run.js`
paga ese mismo peaje; los que sean de interfaz pura, no. Cuáles son cuáles lo decide el contrato, no
la partición.

**Tercer trabajo: los restos del lienzo. Entregado el 2026-08-11 con la v11.70.**

Esta pieza se describió como pasar cada medida y cada comentario restante a unidades de lienzo, y esa
descripción se escribió antes de que el cascarón existiera. Un barrido sobre las catorce piezas la
desmintió: **la migración la hizo el cascarón del incremento 5.6.** Quedaba una sola lectura de la
ventana, la del cálculo de la escala en `lienzo.js`, que es el único lugar que debe leerla; una sola
unidad de viewport en el CSS, la altura del `body`, que es correcta porque el `body` es el marco donde
se dibujan las franjas negras y no contenido del lienzo; y las mediciones contra el DOM que quedan son
`offsetWidth` y `offsetHeight`, previas a la transformación y ya migradas.

Lo que quedaba eran cuatro restos, y así se hizo: el teclado pasó a derivar su ancho de
`LIENZO_ANCHO` en vez de medir el contenedor, se borró la regla `.container` con su tope de 1600 px
de la era anterior al lienzo, se corrigieron tres comentarios que seguían diciendo que el fondo toma
el viewport, y se borró un `font-size` de CSS que no se alcanzaba nunca. La razón de escribirlo así
en vez de inventarle volumen a la pieza vive en `DECISIONS.md`, entrada del 2026-08-11 "La tercera
pieza de la Fase 5B era chica, y se dice".

**Criterio de aceptación:** el contrato está escrito y mergeado antes del primer PR de código, las
41 fixtures siguen pasando, la app abre desde `file://` sin servidor, el autor la corrobora en
Chrome con el piano físico, y ningún archivo de código pasa las 1000 líneas contadas como las cuenta
el §7. El motor y `renderKeyboard` no cambian de comportamiento.

**Bloquea:** Fase 6.

**Bloqueada por:** Fase 5 completa, que cerró el 2026-08-11 con seis incrementos.

**Excepción de método, anotada a propósito:** esta fase nace de un umbral que se disparó a mitad
de otra fase, y el repo no tenía escrito qué hacer en ese caso. Se decidió terminar la Fase 5
antes de atacarlo, en vez de frenar el trabajo visual en curso. La decisión y su razón viven en
`DECISIONS.md`, entrada del 2026-08-09. Que las reglas para estos casos falten está anotado en el
BACKLOG.

---

## FASE 6: Calidad de vida

**Estado:** `cerrada (2026-08-11)`, con la v11.76

**Objetivo:** sumar las mejoras de calidad de vida que hoy faltan.

**Alcance:**

- Botón de reset a valores de fábrica (`State.config` más recarga). **Entregado.** Borra
  `midiTrainerCfg` y `midiTrainerUniverse` y deja `midiTrainerLayout` intacta, que tiene su propio
  reset en el menú de Widgets. Vive dentro del desplegable de la consola y pide confirmación. Ver
  `DECISIONS.md`, entrada del 2026-08-11 "El reset a fábrica borra la configuración y no toca la
  disposición".
- Persistir también `State.universe`. Hoy solo se persiste `State.config`. **Entregado**, y solo con
  lo que no se deriva: la tónica y el tipo van a `midiTrainerUniverse`, y el conjunto de alturas lo
  reconstruye `Escala.buildUniverse`. Guardar la rama entera habría dejado un `Set` serializado como
  `{}` y un universo sin alturas al recargar. Ver `DECISIONS.md`, entrada del 2026-08-11 "El estado
  derivado no se persiste, se reconstruye".
- Panel de logs: expandir y contraer en vez de altura fija. **Entregado.** Dos altos de lienzo, 250 y
  560 px, con un botón dentro de las acciones de la consola. No es arrastrable: redimensionar con el
  puntero es el ítem parqueado de redimensionar un widget y no entra acá.
- Retirar el panel "Fijar Acordes" con sus dos acordes escritos a mano. **Entregado**, markup y
  botones. `Armonia.lockChord` se queda sin llamadores y anotada, porque es el caso más simple del
  widget de acompañamiento y borrarla obligaría a reescribirla igual. Este punto decía antes que
  había que mejorar el panel generando los botones I, IV y V, o sea que daba por hecho que el panel
  sobrevive; eso contradecía al ítem del BACKLOG que lo disuelve. Dónde vive el lock no lo decide
  esta fase: lo decide el widget de acompañamiento cuando exista. Ver `DECISIONS.md`, entrada del
  2026-08-11 "El lock de acorde es su propio widget, y su función es liberar la mano izquierda".

**Criterio de aceptación**, escrito el 2026-08-11 porque la fase decía "por definir" y un criterio
escrito después del trabajo y a su medida no verifica nada. Los cuatro puntos son comprobables desde
`file://` y sin dispositivo MIDI:

1. **Reset:** con la consola abierta, el botón pide confirmación; al aceptar, `midiTrainerCfg` y
   `midiTrainerUniverse` quedan en `null` y `midiTrainerLayout` conserva su contenido, y tras la
   recarga los ajustes del motor vuelven a sus valores por defecto.
2. **Universo persistido:** elegido un universo distinto del inicial y recargada la app, vuelven la
   misma tónica y el mismo tipo, **y el conjunto de pitch classes pintado sobre el teclado es el
   mismo antes y después**. Esa segunda mitad es la que prueba que el derivado se reconstruyó, y es
   donde el `Set` podía fallar en silencio.
3. **Panel de logs:** el alto medido pasa de 250 a 560 px y vuelve a 250, con el rótulo del botón
   siguiendo el estado.
4. **Panel de acordes:** `document.getElementById('lock-chords-panel')` devuelve `null`, y nada más
   se rompe: las 88 teclas siguen dibujadas y la consola no tira errores.

Más, para toda la fase: las 41 fixtures en verde, `node --check` sobre los catorce archivos de
`src/`, `src/engine.js` y `tests/` sin tocar, y redimensionar la ventana sin que ninguna caja se
mueva ni cambie la cobertura.

**Bloquea:** ninguna declarada

## FASE 7: Feedback sonoro (Web Audio API)

**Estado:** `pendiente`

**Objetivo:** empezar a entrenar el oído sin mirar la pantalla, que es la brecha más grande
que marcó el informe de campo original.

**Alcance:** un sonido corto al acertar, otro para tensión, otro para error. Entre 10 y 20
líneas, sin dependencias.

**Lo que esta fase no es, y hasta el 2026-08-11 no estaba escrito.** Feedback de veredicto y música
son dos cosas. Esta fase entrega lo primero, tres sonidos generados con osciladores al vuelo, sin
archivos y sin MIDI. El acompañamiento, los arpegios y las progresiones son música, salen por MIDI
hacia el sintetizador del usuario y son del widget de acompañamiento del BACKLOG. Ver `DECISIONS.md`,
entrada del 2026-08-11 "Feedback de veredicto y música son dos cosas, y el sonido es una superficie
del sistema".

Los tres sonidos son una superficie del sistema, igual que el teclado coloreable: los ofrece el
sistema y cada widget decide cuál usar, en vez de que cada uno traiga los suyos. Hoy el motor es el
único que da feedback, así que basta con que él tenga la variedad.

**Criterio de aceptación**, escrito el 2026-08-11 porque decía "por definir" y la Fase 6 mostró que
un criterio escrito después del trabajo no verifica nada:

1. Tocando desde `file://` con el piano físico, cada una de las tres categorías de veredicto que el
   motor produce, correcto, sensible y error, dispara su sonido, y los tres se distinguen de oído sin
   mirar la pantalla.
2. Los tres se generan con osciladores: `grep -rn "fetch\|Audio(\|\.mp3\|\.wav" src/` no devuelve
   nada nuevo. Sin archivos y sin dependencias.
3. El paso cromático, que dura 180 ms, no alcanza a disparar un sonido que se corte a sí mismo: se
   comprueba tocando una nota fuera del universo por menos de ese umbral y verificando en el log que
   el veredicto llegó a `passing` sin que el sonido quede colgado.
4. Con el sonido apagado la app se comporta igual que hoy: las 41 fixtures verdes y el coloreo del
   teclado sin cambios.

**Entregado el 2026-08-11 con la v11.78**, salvo el punto 1 del Criterio, que pide comprobar de oído
con el piano físico y no se puede hacer sin el instrumento. Por eso la fase queda `pendiente` hasta
esa corroboración. Lo entregado: `src/sonido.js` con los tres sonidos derivados de una tabla, el
interruptor en Opciones que arranca apagado y persiste, y el disparo al apretar la tecla. Las
decisiones que este trabajo tomó viven en `DECISIONS.md`, entrada del 2026-08-11 "El feedback de
veredicto suena al apretar, y el indulto no lo corrige".

**Bloquea:** ninguna declarada

---

## FASE 8: Progresiones, detección de la secuencia de acordes

**Estado:** `pendiente`

**Objetivo:** que el motor detecte la secuencia de acordes en el tiempo y la exponga en el
buffer del motor.

**Alcance:** es salida del motor, no una característica (ver el protocolo de clasificación en
`DECISIONS.md`, 2026-07-25). El motor deriva la progresión del estado, los acordes que fueron
sonando, y la escribe en el buffer del motor. Sin panel todavía: esta fase solo produce la
salida que la característica de progresiones va a dibujar. Una progresión sin funciones
nombradas no dice nada, por eso depende de la función tonal.

**Criterio de aceptación:** el motor expone en el buffer la secuencia de acordes detectada
del estado, lista para que un panel la consuma.

**Nota (2026-07-30): una capacidad vecina que no es esta fase.** La fase detecta la secuencia de
acordes de lo que se toca en vivo. Queda pendiente, sin fase, un caso distinto: entregarle al motor
una línea de acordes ajena, escrita o cargada, para que la descomponga y la explique. No es lo
mismo que detectar en vivo, ni que el modo canción del backlog, que evalúa una melodía contra un
MIDI cargado.

**Bloquea:** Fase 9.

**Bloqueada por:** Fase 4 (la función tonal).

---

## FASE 9: Progresiones, la característica

**Estado:** `pendiente`

**Objetivo:** la característica de progresiones, el panel que dibuja la progresión y sus
ejemplos en una ranura.

**Alcance:** es una característica, un panel en una ranura. Reusa el sistema de ranuras que
estrena la Fase 5 (las ranuras reservadas) y consume la secuencia de acordes del buffer del
motor que produce la Fase 8.

**Criterio de aceptación:** por definir cuando exista la Fase 8 (detección de secuencia).

**Bloqueada por:** Fase 8 (detección de secuencia) y Fase 5 (el sistema de ranuras).

**Nota (2026-07-25): pregunta abierta, el contrato de salida.** Cuando esta fase construya la
primera característica de verdad, se define qué puede escribir una característica hacia afuera:
colorear teclas, escribir el subtítulo de feedback, o solo pintar su propio panel; y si ese
reporte va en abanico, con todos leyendo el buffer del motor, o en cadena. Es una pregunta
abierta que se resuelve acá, con el primer caso real. Sin una característica que lo fuerce,
cualquier estándar sería adivinanza.

---

## FASE 10: Rueda de quintas como vista alterna de la escala

**Estado:** `pendiente`

**Objetivo:** agregar la rueda de quintas como segunda vista dentro del panel de la escala,
con el conmutador que alterna entre lineal y rueda. El conmutador nace acá, con la segunda
vista. Vista y no widget aparte: es el mismo widget de escala con el mismo permiso, según
`DECISIONS.md`, entrada del 2026-08-11 "Una vista es cómo se mira, un widget es quién tiene el
permiso".

**Alcance:** esta fase mueve la escala del teclado a un panel de característica en una ranura,
primero en vista lineal, y le suma la rueda de quintas como vista alterna con su conmutador. La
rueda deriva del motor (`scalePitches`), no hardcodea nada. La rueda muestra las calidades de
acorde de cada grado del universo activo, porque saber qué acordes entran es justo lo que se busca
al mirarla. Las calidades se derivan, no se enumeran a mano: se arma la tríada sobre cada grado con
las notas que `scalePitches` ya entrega y se lee su calidad contra las plantillas de intervalos que
el motor ya tiene, mayor, menor, disminuido y aumentado.

Esto no depende de la función tonal de la Fase 4. `getTonalFunction` devuelve función tonal, tónica,
subdominante o dominante, leída de una tabla por grado, y además exige un acorde ya detectado. La
rueda necesita lo contrario: las calidades derivadas de la escala sola, sin que suene nada. Lo que
hace falta es una función pura nueva de calidades por grado, y es trabajo de esta misma fase.

La enumeración depende del universo, así que los números de abajo son ejemplos y no una constante.
En mayor son 3 mayores, 3 menores y 1 disminuido. En menor natural son los mismos tres números,
porque es una rotación de la mayor, aunque en otros grados. En menor armónica son 2 mayores, 2
menores, 2 disminuidos y 1 aumentado. Por eso la vista deriva en vez de traer la lista escrita: el
selector ya ofrece menor armónica hoy, y una lista fija sería falsa para ella. La iluminación de
posiciones es sutil.

La rueda no son dos vistas sino tres acopladas que se mueven juntas: la rueda, la escala lineal y
el teclado. Girar un paso de la rueda cambia una sola nota de la escala, y ese es el punto
pedagógico, ver que las escalas vecinas se diferencian en una nota. La rueda muestra además el
anillo de la menor relativa y los vecinos de acordes diatónicos. El cambio de estado es
instantáneo, sin animación de giro. Queda como pregunta abierta si la rueda puede reemplazar al
selector de escala como interfaz, dejando las escalas donde están, en el motor: sería cambiar el
control por otro más expresivo, no mover lógica musical a la interfaz. Esto desarrolla el patrón de
vistas sincronizadas de la regla 5 del ADR del 2026-07-24, no lo reemplaza: es la misma idea, con
el detalle de qué se sincroniza con qué.

**Criterio de aceptación:** la rueda se muestra como vista alterna de la escala con su conmutador;
girar un paso cambia una sola nota y las tres vistas acopladas se actualizan juntas; y las
calidades de cada grado se muestran derivadas del universo activo, verificado en los tres universos
que el motor soporta hoy, comprobando que en menor armónica aparece el grado aumentado.

**Bloquea:** ninguna declarada.

**Bloqueada por:** Fase 5 (la estructura de fondo y ranuras debe existir). No depende de la Fase 4:
las calidades por grado se derivan de la escala sola, sin acorde detectado y sin función tonal.
Tampoco depende de las fases de progresiones; su número es posterior por secuencia de decisión, no
por dependencia.

---

## FASE 11: Intercambio modal

**Estado:** `pendiente`

**Objetivo:** que el motor reconozca y nombre los acordes de intercambio modal, los préstamos
de otro modo. Es el tercer caso después del diatónico (que tiene función tonal, Fase 4) y de
la dominante secundaria (que tiene relación, Fase 3): un acorde que no es ninguno de los dos.

**Alcance:** es salida del motor, otra lente, no una característica; no lleva panel propio. El
motor deriva la clasificación una vez escrita la teoría. Hoy estos acordes caen en "no
diatónico" o "acorde no reconocido"; esta fase les da nombre. La teoría todavía no está
escrita: qué acordes cuentan como intercambio modal, de qué modo se prestan y cómo se nombran,
se escribe en el Track paralelo de teoría antes de tocar código, igual que se hizo con la
función tonal.

**Criterio de aceptación:** por definir. Requiere primero escribir la teoría del intercambio
modal en el Track paralelo de teoría. Sin esa respuesta correcta escrita no hay fixture, y sin
fixture el motor devolvería una adivinanza que nadie puede comprobar.

**Nota (2026-07-25):** el disparador de esta fase es concreto. El día que toques una canción y
el motor te marque un acorde "no diatónico" que tampoco sea dominante secundaria, esa es la
señal de que falta esta fase. Ahí se escribe la teoría una vez, se le pone fixture, y el motor
la deriva para todas las canciones.

**Bloquea:** ninguna declarada.

**Bloqueada por:** Fase 3 y Fase 4 (las dos lentes que lo definen por descarte deben existir),
y la teoría escrita en el Track paralelo. El número la pone después de la Fase 10 por
prioridad, no porque la rueda la bloquee.

---

## BACKLOG (sin fecha, necesita más teoría antes de programarse)

- Modos griegos (Dórico, Frigio, Mixolidio, Lidio): extensión directa de `SCALES`. Son rotaciones
  de la escala mayor, así que tienen siete notas y la misma colección de calidades de acorde por
  grado, solo repartidas en otros grados. La vista de calidades de la rueda los cubre sin cambios.
  **Entró:** 2026-07-04, PR "doc: reescribir docs y comentarios en la voz Rossmann". Ese es el
  primer commit que toca `docs/ROADMAP.md`, así que este ítem está desde que el archivo existe y
  `git log -S` no puede rastrearlo más atrás. Con ese mismo PR entraron "Pentatónicas y Blues como
  universos propios", "Glosario in-app que crezca junto con lo aprendido", "Modo canción" y
  "Entrenamiento de oído puro".
  **Sin origen recuperable.** Entró con el primer commit que toca `docs/ROADMAP.md`, así que `git
  log` no puede ir más atrás y ese commit no dejó ninguna razón escrita. Es una de las ideas con
  las que el roadmap nació, y no se sabe más que eso.
- Pentatónicas y Blues como universos propios, no como parches de excepción. Ojo con esto: no son
  escalas de siete notas, así que no producen una escalera de siete tríadas por grado y la vista de
  calidades de la rueda no se les extiende tal cual. Antes de programarlas hay que decidir qué
  significa ahí un acorde por grado, o si en esos universos la vista muestra otra cosa. Eso es lo
  que las vuelve universos propios y no una escala más en la lista.
  **Entró:** 2026-07-04, PR "doc: reescribir docs y comentarios en la voz Rossmann". Ese es el
  primer commit que toca `docs/ROADMAP.md`, así que este ítem está desde que el archivo existe y
  `git log -S` no puede rastrearlo más atrás. Con ese mismo PR entraron "Modos griegos (Dórico,
  Frigio, Mixolidio, Lidio)", "Glosario in-app que crezca junto con lo aprendido", "Modo canción"
  y "Entrenamiento de oído puro".
  **Sin origen recuperable.** Entró con el primer commit que toca `docs/ROADMAP.md`, así que `git
  log` no puede ir más atrás y ese commit no dejó ninguna razón escrita. Es una de las ideas con
  las que el roadmap nació, y no se sabe más que eso.
- Glosario in-app que crezca junto con lo aprendido.
  **Entró:** 2026-07-04, PR "doc: reescribir docs y comentarios en la voz Rossmann". Ese es el
  primer commit que toca `docs/ROADMAP.md`, así que este ítem está desde que el archivo existe y
  `git log -S` no puede rastrearlo más atrás. Con ese mismo PR entraron "Modos griegos (Dórico,
  Frigio, Mixolidio, Lidio)", "Pentatónicas y Blues como universos propios", "Modo canción" y
  "Entrenamiento de oído puro".
  **Sin origen recuperable.** Entró con el primer commit que toca `docs/ROADMAP.md`, así que `git
  log` no puede ir más atrás y ese commit no dejó ninguna razón escrita. Es una de las ideas con
  las que el roadmap nació, y no se sabe más que eso.
- Modo "canción": cargar un MIDI, reproducir el bajo, evaluar la melodía en vivo.
  **Entró:** 2026-07-04, PR "doc: reescribir docs y comentarios en la voz Rossmann". Ese es el
  primer commit que toca `docs/ROADMAP.md`, así que este ítem está desde que el archivo existe y
  `git log -S` no puede rastrearlo más atrás. Con ese mismo PR entraron "Modos griegos (Dórico,
  Frigio, Mixolidio, Lidio)", "Pentatónicas y Blues como universos propios", "Glosario in-app que
  crezca junto con lo aprendido" y "Entrenamiento de oído puro".
  **Sin origen recuperable.** Entró con el primer commit que toca `docs/ROADMAP.md`, así que `git
  log` no puede ir más atrás y ese commit no dejó ninguna razón escrita. Es una de las ideas con
  las que el roadmap nació, y no se sabe más que eso.
- Entrenamiento de oído puro (dictado de intervalos, identificar un acorde solo de oído).
  El informe de campo ya marcó esto como el objetivo final, y el software actual no lo
  cubre.
  **Entró:** 2026-07-04, PR "doc: reescribir docs y comentarios en la voz Rossmann". Ese es el
  primer commit que toca `docs/ROADMAP.md`, así que este ítem está desde que el archivo existe y
  `git log -S` no puede rastrearlo más atrás. Con ese mismo PR entraron "Modos griegos (Dórico,
  Frigio, Mixolidio, Lidio)", "Pentatónicas y Blues como universos propios", "Glosario in-app que
  crezca junto con lo aprendido" y "Modo canción".
  **Sin origen recuperable.** Entró con el primer commit que toca `docs/ROADMAP.md`, así que `git
  log` no puede ir más atrás y ese commit no dejó ninguna razón escrita. Es una de las ideas con
  las que el roadmap nació, y no se sabe más que eso.
- Menor melódica como escala disponible, junto a los modos griegos y las pentatónicas ya
  listados. Cobra sentido si el jazz entra como objetivo.
  **Entró:** 2026-07-30, PR "doc: enriquecer la rueda de quintas, la regla de animación y el
  backlog". Con ese mismo PR entraron "Calibración de tiempos por tapping" y "Lectura de partitura
  como vista futura".
  **Hipótesis:** se anotó al especificar la rueda de quintas, que es lo que hacía ese PR, y que se
  apoya en las escalas que `SCALES` ya tiene. Base: el mismo commit enriqueció la Fase 10 con tres
  vistas acopladas de escala. No hay nada escrito que lo diga, así que esto se puede discutir.
- Calibración de tiempos por tapping. Hoy los cuatro campos del motor, acumulación, retención,
  error visual y split, se ajustan a mano con números. La idea es fijarlos tocando una secuencia y
  que el programa derive los valores de lo que midió. Arrastra dos cosas más: tempos, y que los
  valores buenos dependen del tempo de la canción, lo que lo ata al modo canción de este mismo
  backlog.
  **Entró:** 2026-07-30, PR "doc: enriquecer la rueda de quintas, la regla de animación y el
  backlog". Con ese mismo PR entraron "Menor melódica como escala disponible" y "Lectura de
  partitura como vista futura".
  **Sin origen recuperable.** El PR que lo trajo trataba de la rueda de quintas y el CHANGELOG de
  ese día lo nombra sin dar razón. No hay base para una hipótesis, así que queda declarado el
  vacío en vez de inventarle una.
- Coherencia visual del set de iconos. Los emojis que la interfaz usa hoy no forman un conjunto
  coherente: cada uno viene de una familia distinta y se ven como piezas sueltas. Queda registrado
  un hallazgo negativo para no repetir el intento: pasarlos a SVG se probó y da más carga, no menos,
  así que el SVG no es la salida por rendimiento. La pregunta abierta es cómo conseguir un set
  coherente sin sumar costo gráfico. Es cosmético y no bloquea nada. Este ítem dejó de estar sin
  fase: el incremento 5.4 lo tomó y ahí se decidió la regla. **Acotado:** esa regla existe desde el
  2026-08-10 y vive en `CLAUDE.md`, sección "Iconos y emojis", con el código conforme a sus seis
  puntos. Lo que queda de este ítem es solo la parte estética, conseguir un set coherente sin sumar
  costo gráfico.
  **Entró:** 2026-07-30, PR "doc: cerrar las calidades de acorde de la rueda y precisar el
  backlog".
- Lectura de partitura como vista futura. Está anotado para que sea una decisión y no un olvido:
  se mencionó una vez, no está comprometido, y no tiene diseño ni alcance todavía.
  **Entró:** 2026-07-30, PR "doc: enriquecer la rueda de quintas, la regla de animación y el
  backlog". Con ese mismo PR entraron "Menor melódica como escala disponible" y "Calibración de
  tiempos por tapping".
  **Por qué se anotó:** el CHANGELOG v11.37 lo dice, "anotada como mención sin compromiso para que
  sea decisión y no olvido". El ítem se escribió para que la idea quedara registrada como
  descartada por ahora y no como algo que nadie recordó.
- Comparar cómo reparten el espacio los programas que ya explican canciones con notas que caen,
  antes de dar por firme el presupuesto de superposición. Hoy se le reserva altura a un motor que no
  existe, y el tope de tres octavos sale de mirar un boceto, no de medir contra algo que funcione.
  Va junto con la lectura de archivos MIDI, porque hasta cargar una canción real no se sabe cuánto
  alto pide de verdad.
  **Entró:** 2026-07-30, PR "doc: presupuesto de superposición y un solo menú de widgets".
  **Por qué se anotó:** el CHANGELOG v11.39 lo dice, "antes de dar por firme el tope de tres
  octavos". El mismo commit creó la entrada del 2026-07-30 "Presupuesto de superposición", que
  inventó ese tope; el ítem nació como la comprobación pendiente del número que ese PR acababa de
  fijar.
- Metrónomo. No existe en ninguna parte del proyecto hoy. Interesa porque el tiempo ya participa de
  la evaluación: el indulto por paso cromático depende de una duración fija de 180 ms, y tres de
  los cuatro ajustes del motor son ventanas de tiempo. Un metrónomo abre la puerta a que esas ventanas se
  deriven del tempo en vez de fijarse a mano. Va junto con la calibración por tapping y con los
  tempos por canción que ese ítem ya arrastra.
  **Entró:** 2026-07-30, PR "doc: actualizar ARCHITECTURE a la jerarquía real y fijar el estándar
  espacial". Con ese mismo PR entró "Hundir el log cuando la barra crezca".
  **Reapuntado el 2026-08-11:** deja de ser una idea suelta. Es dependencia del widget de
  acompañamiento, que necesita un tempo para encadenar progresiones o tocar una figura.
  **Por qué se anotó:** el CHANGELOG v11.41 da la razón entera, "porque el tiempo ya participa de
  la evaluación (el indulto de 180 ms y las cuatro ventanas del motor) y un tempo permitiría
  derivar esas ventanas en vez de fijarlas a mano". El PR que lo trajo trataba del estándar
  espacial de los widgets y no tiene relación temática, así que es una anotación de paso cuya
  razón igual quedó escrita.
- Hundir el log cuando la barra crezca. Hoy queda alcanzable porque la barra tiene un solo nivel.
  La decisión del 2026-07-25 pide que la consola de debug viva detrás de submenús, oculta para
  quien solo toca. Cuando aparezcan menús que se ganen el espacio, como el de archivo para MIDI y
  entrenamientos, el log baja al lugar que le corresponde. **Acotado:** la jerarquía de menús ya fija
  que la consola vive por debajo del piso de tres clics, así que la parte de dónde tiene que vivir
  está resuelta y lo que queda es mudarlo cuando la barra crezca. Ver `DECISIONS.md`, entrada del
  2026-08-10 "Jerarquía de menús: el tres es techo y también es piso".
  **Entró:** 2026-07-30, PR "doc: actualizar ARCHITECTURE a la jerarquía real y fijar el estándar
  espacial". Con ese mismo PR entró "Metrónomo".
- Tabla histórica como widget candidato. Una vista tabular de lo que se tocó en orden, con el
  acorde detectado y el veredicto que el motor le dio a cada nota. No pide motor nuevo: el buffer y
  el log ya tienen esos datos, así que sería un widget que presenta, como el readout. Cubre una
  pregunta que hoy no cubre nada: qué acabo de tocar y por qué me lo marcó así. Es distinta de la
  Fase 8, que detecta la progresión de lo que suena en vivo, y del modo canción de este mismo
  backlog, que evalúa una melodía contra un archivo cargado. Antes de programarla hay que decidir
  cuánto histórico guarda y si se limpia sola. Con ella llega una pregunta que hoy no está
  decidida: si además de listar, la vista cuenta aciertos y errores de la sesión. Contar no es
  puntuar precisión temporal, que es el eje de juego de ritmo que el proyecto dejó afuera, pero se
  le acerca lo suficiente como para no resolverlo de paso. Se decide cuando esta vista se diseñe,
  no antes.
  **Entró:** 2026-07-31, PR "doc: preajuste de aprendizaje, selección por opacidad y tabla
  histórica".
  **Por qué se anotó:** el CHANGELOG v11.42 lo dice, "cubre una pregunta que ni la Fase 8 ni el
  modo canción responden". El mismo PR trataba de la selección por opacidad y del preajuste de
  aprendizaje, así que el ítem es una anotación de paso con su razón registrada.
- Redimensionar un widget en tiempo real. Hoy el molde es fijo a propósito, porque el tamaño
  uniforme es lo que hace que las cajas se lean como un sistema. Dejar que el usuario las estire
  abre preguntas que hoy no tienen respuesta: qué pasa con el tope de cobertura, qué pasa con el
  contenido que se recorta, y si el tamaño se persiste por instancia. Queda anotado como idea, no
  como decisión.
  **Entró:** 2026-08-01, PR "doc: nacimiento discreto, movimiento libre y el molde con números".
  Con ese mismo PR entraron "Lineamientos para partir una fase" y "Describir el destino visual en
  texto dentro del repo".
  **Por qué se anotó:** el CHANGELOG v11.45 lo dice, "anotado como idea y no como decisión, con
  las preguntas que abre". El mismo commit fijó el molde uniforme con números en el Alcance de la
  Fase 5, así que el ítem es la contrapregunta que ese molde abre al fijarse.
- Lineamientos para partir una fase. La Fase 5 tiene cinco incrementos y uno de ellos se entrega en
  dos PR de código, y esa estructura creció sin regla: no hay escrito cuándo un incremento se parte
  ni hasta qué profundidad. Sin lineamiento, el trabajo se subdivide tarde, cuando ya se empezó a
  construir. Va junto con la crítica obligatoria del diseño de fase, que ya está parqueada, porque
  es el mismo problema visto desde el otro lado. **Origen anterior a la sesión de la v11.53 a la
  v11.70; lo que esa sesión aporta son tres casos reales para estudiar:** el incremento 5.3 partido
  en tres PR, el 5.5 en dos, y la partición de la Fase 5B en dos.
  **Entró:** 2026-08-01, PR "doc: nacimiento discreto, movimiento libre y el molde con números".
  Con ese mismo PR entraron "Redimensionar un widget en tiempo real" y "Describir el destino
  visual en texto dentro del repo".
- Describir el destino visual en texto dentro del repo, con números. Ya está parqueado en "Deuda de
  método y documentación" como sugerencia, y quedó demostrado por qué hace falta: una instrucción en
  prosa sobre dónde van las cajas se puede cumplir de varias maneras y la que sale es la que se
  parece a lo que ya había. Los números del molde y de las posiciones viajaron intactos; lo que
  quedó en palabras, no. Este ítem eleva aquella sugerencia a trabajo concreto: las reglas de
  posición se escriben con medidas, no con adjetivos.
  **Entró:** 2026-08-01, PR "doc: nacimiento discreto, movimiento libre y el molde con números".
  Con ese mismo PR entraron "Redimensionar un widget en tiempo real" y "Lineamientos para partir
  una fase".
  **Por qué se anotó:** el CHANGELOG v11.45 lo dice, "eleva a trabajo concreto una sugerencia ya
  parqueada". No es una idea nueva de ese PR: es una sugerencia previa que ahí pasó a tener forma
  de trabajo.
- Detectar el rango real del teclado conectado por MIDI, en vez de asumirlo. El protocolo no lo
  informa directamente, así que habría que inferirlo o dejar que el usuario lo declare. Por defecto
  se muestran las 88 teclas, que es lo escrito. **Procedencia:** salió del incremento que llevó el
  teclado de 61 a 88 teclas, como la alternativa que se descartó ahí mismo. Ver `DECISIONS.md`,
  entrada del 2026-08-10 "Geometría del teclado de 88 teclas, y la barra no presenta lecturas".
  **Entró:** 2026-08-09, PR "doc: consolidar el area de movimiento, el mapa de terminos y la deuda
  verificada". Con ese mismo PR entró "Barra de menús que se oculta sola cuando no se usa".
- Barra de menús que se oculta sola cuando no se usa, como una barra de tareas. Devolvería el alto de
  la barra al fondo y eliminaría la única zona vedada al movimiento de widgets.
  **Entró:** 2026-08-09, PR "doc: consolidar el area de movimiento, el mapa de terminos y la deuda
  verificada". Con ese mismo PR entró "Detectar el rango real del teclado conectado".
  **Por qué se anotó:** el CHANGELOG v11.47 da la razón, "que devolvería su alto al fondo". Ese PR
  estaba corrigiendo el área de movimiento de los widgets y declarando que la barra es la única
  zona vedada, así que el ítem es la pregunta que esa restricción abre.
- Reglas para cuando un umbral escrito se dispara a mitad de otra fase. Pasó el 2026-08-09 con las
  1000 líneas de `index.html` de `ARCHITECTURE.md` §7: el gatillo se cumplió durante la Fase 5 y no
  había escrito si se frena lo que está en curso, si se abre una fase nueva ahí mismo, o si se
  termina primero. Se resolvió caso por caso, con una excepción documentada, y esa es justamente la
  forma de decidir que este repo evita. Falta también cómo se nombra una fase que se inserta entre
  dos existentes sin correr la numeración de las que siguen. **Origen anterior a esta sesión, y
  parcialmente resuelto:** el protocolo mínimo de tres preguntas que una decisión de umbral tiene que
  contestar ya está escrito en `CLAUDE.md`, sección "Promesas y umbrales", desde la v11.65. Lo que
  queda es el protocolo completo. La parte de cómo nombrar una fase insertada tiene ahora su caso
  resuelto, la Fase 5B, y la razón está escrita en su propia subsección "Por qué 5B y no un número
  nuevo".
  **Entró:** 2026-08-09, PR "add: Fase 5B para el umbral de las 1000 lineas y reglas de metodo que
  faltaban". Con ese mismo PR entraron "Reglas para promover un ítem del BACKLOG a fase", "Reglas
  para reabrir una fase cerrada" y "Levantar los requisitos y requerimientos antes".
- Reglas para promover un ítem del BACKLOG a fase. Hoy no hay ninguna, así que una idea suelta se
  queda suelta aunque esté madura, y no por falta de mérito sino por falta de criterio escrito de
  qué la hace fase: si es tener alcance cerrado, criterio de aceptación verificable, o alguien que
  la pida. Sin ese criterio el BACKLOG crece y no drena. **Origen anterior a esta sesión, y sigue
  abierto.** Lo único que ganó es vecindad: existe desde el 2026-08-10 un criterio de entrada de un
  ítem parqueado a una fase **en curso**, que es otra pregunta y no lo reemplaza.
  **Entró:** 2026-08-09, PR "add: Fase 5B para el umbral de las 1000 lineas y reglas de metodo que
  faltaban". Con ese mismo PR entraron "Reglas para cuando un umbral escrito se dispara", "Reglas
  para reabrir una fase cerrada" y "Levantar los requisitos y requerimientos antes".
- Reglas para reabrir una fase cerrada y para agregarle trabajo. La Fase 5 se cerró, se reabrió y
  después creció a seis incrementos, con uno partido en tres PR, sin que nada escrito dijera si eso
  se puede ni hasta dónde. Va con el ítem de lineamientos para partir una fase, que ya está en esta
  lista: son dos caras del mismo hueco. **Origen anterior a esta sesión, y sigue abierto.** Hay dos
  casos reales para estudiar en vez de uno: la Fase 5, que cerró el 2026-08-11 con seis incrementos,
  y la Fase 5B, que nació de un umbral disparado a mitad de otra fase.
  **Entró:** 2026-08-09, PR "add: Fase 5B para el umbral de las 1000 lineas y reglas de metodo que
  faltaban". Con ese mismo PR entraron "Reglas para cuando un umbral escrito se dispara", "Reglas
  para promover un ítem del BACKLOG a fase" y "Levantar los requisitos y requerimientos antes".
- Levantar los requisitos y requerimientos antes de seguir programando. Ya está parqueado en "Deuda
  de método y documentación" como documento de requisitos, y los tres ítems de arriba son la
  consecuencia de no tenerlo: cada regla de método aparece cuando ya se rompió. **Origen anterior a
  esta sesión, y parcialmente atendido:** el contrato de permisos del 2026-08-11 cubre qué puede usar
  o alterar un widget, y deja los entrenamientos afuera a propósito, con su disparador declarado.
  **Entró:** 2026-08-09, PR "add: Fase 5B para el umbral de las 1000 lineas y reglas de metodo que
  faltaban". Con ese mismo PR entraron "Reglas para cuando un umbral escrito se dispara", "Reglas
  para promover un ítem del BACKLOG a fase" y "Reglas para reabrir una fase cerrada".
- Subtítulos de feedback parcialmente coloreables. La idea es que el subtítulo pueda teñir la parte
  de su texto que corresponde a una categoría de la leyenda, para que el color y la palabra digan lo
  mismo sin repetirlo. Queda anotada como idea y sin fase: primero hay que cablear los subtítulos a
  la salida del motor, que hoy siguen siendo un marcador de posición.
  **Entró:** 2026-08-09, PR "doc: fijar donde vive la leyenda de colores y dos precisiones de
  nomenclatura".
  **Hipótesis:** se anotó mientras se decidía dónde vive la explicación de los colores, que es lo
  que hacía ese PR. Base: el mismo commit produjo la entrada del 2026-08-09 "Dónde vive la leyenda
  de colores", que reparte quién dice qué entre el teclado, los subtítulos y la guía. El CHANGELOG
  de ese día anota el ítem con su bloqueo y sin razón, así que esto se puede discutir.
- Que el coloreo del teclado obedezca de verdad al estado abierto o cerrado de su dueño, según el
  reparto de la entrada del 2026-08-10 "Dueño de superficie: cerrar el widget apaga su efecto". Hoy
  `Teclado.renderKeyboard` pinta las seis categorías sin mirar qué widget está en pantalla.
  **Procedencia:** es la implementación de una decisión que hoy solo vive en documentación; esa
  entrada declara ella misma que no trae cambio de código detrás y que cablearla es backlog. El
  bloqueo que tenía escrito, que la Fase 5 preservaba `renderKeyboard` intacto, venció: esa fase
  cerró el 2026-08-11.
  **Entró:** 2026-08-10, PR "doc: dueno de superficie, lienzo de referencia y el glosario vivo".
  Con ese mismo PR entraron "La precedencia entre el widget de escala", "La rama del preveredicto
  de `renderKeyboard`", "El split como rango", "Que el widget de feedback del sistema se abra
  solo" y "Convertir Motor Automático y el panel Fijar Acordes".
- Los códigos del motor están en dos idiomas. `classifyChordRelation` devuelve `diatonic`,
  `secondary_dominant` y `unclassified`, en inglés, y `getTonalFunction` devuelve `tonica`,
  `subdominante`, `dominante`, `no_diatonica` y `por_definir`, en español. Los dos son salida del
  mismo motor y los lee el mismo código. Unificarlos toca `src/engine.js` y las fixtures, así que va
  con su propio PR y no se coló en el incremento que encontró la inconsistencia. **Procedencia:**
  salió del renombre del tercer valor de la clasificación, que entregó la v11.63; ese renombre
  respetó el idioma de sus vecinos para no crear un conjunto mixto, y la inconsistencia mayor quedó
  anotada en vez de arreglada.
  **Entró:** 2026-08-11, PR "chg: incremento 5.5.2, el analisis dice lo que sabe y lo que no".
- La leyenda no explica por qué una nota fuera del universo puede salir verde. El motor acepta dos
  casos de nota fuera del universo: la sensible, que se pinta naranja y desde el incremento 5.4 está
  explicada, y el tono conductor de una dominante secundaria, que se pinta verde como si fuera
  correcta y no aparece en la leyenda por ningún lado. El usuario ve una nota fuera de la escala en
  verde y no tiene dónde averiguar por qué. Se cruza con el ítem siguiente, el de la guía compuesta
  por secciones: las dos cosas cambian qué muestra la guía, así que conviene decidirlas juntas.
  **Procedencia:** salió de leer el motor mientras se decidía el nombre nuevo de la sensible. Ver
  `DECISIONS.md`, entrada del 2026-08-10 '"Tensión Legal" pasa a "Sensible (empuja a la tónica)"'.
  **Entró:** 2026-08-10, PR "chg: incremento 5.4, nomenclatura y rotulos honestos".
- La guía compuesta por secciones que aporta cada widget. Una sección por widget abierto, con su
  dueño y su propósito, y cerrar un widget cierra su sección. Absorbe lo que este ítem pedía antes,
  que la leyenda se filtrara sola: filtrar filas de una tabla fija es menos que componer la guía con
  lo que cada widget trae, y el resultado visible es el mismo. Sigue bloqueado por el ítem anterior,
  el de la nota fuera del universo que sale verde sin explicación. **Procedencia:** la formulación
  amplia, con el propósito de cada widget y no solo su dueño, se escribió al revisar la guía después
  de la primera sesión con el teclado conectado. Entró con la v11.68.
  **Entró:** 2026-08-11, PR "add: el contrato de permisos, primer trabajo de la Fase 5B". Con ese
  mismo PR entraron "Agrupar las categorías del log y filtrar por grupo" y "El feedback lee del
  log en vez de escribirle".
- **Agrupar las categorías del log y filtrar por grupo. Va primero de los tres que siguen**, porque
  es la condición para que los otros dos sean usables. No hay que inventar categorías: las seis que
  existen ya se agrupan solas. `MIDI`, `MATH` y `EVAL` son musicales; `LAYOUT`, `SYS` y `ERROR` son
  de sistema. Medido el 2026-08-11 con
  `grep -o "SysLog('[A-Z]*'" src/*.js | sed 's/.*SysLog(//' | sort | uniq -c | sort -rn`: de 60
  llamadas, 51 son de sistema y 9 musicales, o sea 85% contra 15%. Lo musical está enterrado bajo lo
  demás. Falta agrupación y filtro, no vocabulario nuevo. El filtro es de desarrollo, así que vive
  donde vive la consola, por debajo del piso de tres clics de la entrada del 2026-08-10 "Jerarquía
  de menús: el tres es techo y también es piso". **Procedencia:** salió de contar la proporción real
  del registro en la primera sesión con el teclado conectado por USB. La taxonomía que hacía falta ya
  existía; lo que faltaba era agruparla.
  **Entró:** 2026-08-11, PR "add: el contrato de permisos, primer trabajo de la Fase 5B". El texto
  de hoy entró como "Log filtrable por categoría" y se reescribió el mismo día con la v11.68. Con
  ese mismo PR entraron "La guía compuesta por secciones que aporta cada" y "El feedback lee del
  log en vez de escribirle".
- **El coloreo se registra de forma diferencial.** Bloqueado por el ítem anterior. Hoy el log
  registra el veredicto y no registra qué se pintó: ni qué tecla recibió qué categoría, ni qué rama
  de la cascada de precedencia ganó, ni qué dueño la produjo. Choca con dos cosas escritas, la
  entrada del 2026-07-25 "El log como canal de validación: toda salida del motor se registra, se
  muestre o no", y el contrato de permisos, que define la cascada de `UI.renderKeyboard` como la
  primera precedencia escrita del repo y deja su resultado invisible. El caso que lo hace urgente:
  una nota puede estar a la vez en el universo y en el acorde detectado, la cascada le da el color
  de acorde y el log dice que la evaluación fue correcta; los dos son ciertos, no coinciden, y hoy
  no hay forma de detectar esa divergencia sin mirar la pantalla. Qué tiene que lograr y qué no
  puede hacer está en `DECISIONS.md`, entrada del 2026-08-11 "El coloreo se registra de forma
  diferencial, no absoluta". **Procedencia:** salió de descartar el video como forma de mostrar el
  coloreo. El paso cromático dura 180 ms por definición del motor, o sea once cuadros a sesenta por
  segundo, y extraer de imágenes un dato que el programa ya conoce y no escribe es más caro y menos
  preciso que escribirlo. La restricción de que el registro sea diferencial salió de contar los
  lugares desde los que se repinta el teclado, doce, y multiplicarlo por las 88 teclas.
  **Entró:** 2026-08-11, PR "doc: lo que la primera sesion con MIDI real dejo ver".
- **El feedback lee del log en vez de escribirle.** Depende del ítem de agrupar y filtrar. Hoy es al
  revés: `Feedback.avisar` escribe el texto en la caja y recién después lo manda al log con
  categoría de disposición. La razón nueva, del registro con MIDI real: si el log distingue musical
  de sistema, el feedback puede elegir qué grupo mostrar, y sin esa distinción leer del log no le
  sirve de nada. **Procedencia:** salió de leer la superficie de avisos mientras se escribía el
  contrato de permisos.
  **Entró:** 2026-08-11, PR "add: el contrato de permisos, primer trabajo de la Fase 5B". El texto
  de hoy reescrito el mismo día con la v11.68. Con ese mismo PR entraron "La guía compuesta por
  secciones que aporta cada" y "Agrupar las categorías del log y filtrar por grupo".
- Dos comentarios de `src/engine.js` citan `UI.buildUniverse` y `UI.updateStatus` "en index.html".
  Las dos citas están muertas: esos métodos dejaron `index.html` en la primera parte de la partición
  y desde la segunda el objeto `UI` no existe. Hoy viven en `Escala` y en `Readout`. Bloqueado por
  nada: es un comentario. Quedó afuera porque los dos PR de la partición declararon que no tocaban
  `src/engine.js`, y romper esa promesa por dos comentarios habría costado más que anotarlos.
  **Entró:** 2026-08-11, PR "chg: partir index.html, segunda parte, repartir por permiso".
  **Por qué se anotó:** lo dice el propio ítem y lo confirma el PR que lo trajo, que es el que
  dejó esas citas muertas al disolver `UI`. Se anotó porque los dos PR de la partición declararon
  que no tocaban `src/engine.js`.
- Alto del teclado configurable por el usuario. Hoy son 140 px de lienzo fijos. El techo está
  calculado y escrito: 236 px de lienzo, porque a partir de ahí la zona de notas baja de 453.3 px y
  los 170 px del molde se pasan del tope de tres octavos. Un control que deje elegir tiene que
  frenar ahí o negociar el molde o el cap. **Procedencia:** el techo no es una preferencia, sale de
  cruzar el molde de 170 px con el tope de tres octavos. Por eso el ítem lleva el número y no una
  fracción cómoda: un tercio del lienzo son 240 px y se pasa de 236.7.
  **Entró:** 2026-08-10, PR "chg: teclado de 88 teclas de borde a borde y la leyenda dentro de la
  guia". Con ese mismo PR entró "Ancho de la negra configurable".
- Ancho de la negra configurable. Hoy es 0.62 del ancho de la blanca. Los dos extremos ya están
  medidos: a 0.58 es lo que usa un piano real, a 0.62 quedan 9.4 px de blanco visible entre dos
  negras, y a 0.80 caen a 4.9 px, con lo que el tope de las blancas casi desaparece y el teclado deja
  de leerse como teclado. Es cosmético y no bloquea nada. **Procedencia:** salió de evaluar si
  ensanchar las negras dejaría entrar texto en ellas. El motivo se cayó solo cuando se decidió que
  las negras no llevan etiqueta, así que lo que queda del ítem es solo la proporción.
  **Entró:** 2026-08-10, PR "chg: teclado de 88 teclas de borde a borde y la leyenda dentro de la
  guia". Con ese mismo PR entró "Alto del teclado configurable por el usuario".
- La precedencia entre el widget de escala y el de salida del motor cuando los dos reclaman el rojo,
  porque la nota se sale de la escala. Es un conflicto de dos dueños sobre el mismo color y todavía
  no tiene regla escrita. **Procedencia:** salió de notar que el selector de universo también produce
  error: una nota se pinta roja por estar fuera de la escala, y esa decisión depende del universo
  aunque el color pertenezca al widget de salida del motor.
  **Entró:** 2026-08-10, PR "doc: dueno de superficie, lienzo de referencia y el glosario vivo".
  Con ese mismo PR entraron "Que el coloreo del teclado obedezca de verdad", "La rama del
  preveredicto de `renderKeyboard`", "El split como rango", "Que el widget de feedback del sistema
  se abra solo" y "Convertir Motor Automático y el panel Fijar Acordes".
- La rama del preveredicto de `renderKeyboard`, la que pinta una nota recién tocada usando el
  conjunto de alturas válidas de la escala, que es dato del widget de escala, con un color del
  widget de salida del motor. No tiene dueño limpio y hay que decidirlo. **Procedencia:** salió de
  leer la cascada de precedencia mientras se repartían los colores por dueño. Usa dato de un dueño y
  color de otro, y esa mezcla es el problema.
  **Entró:** 2026-08-10, PR "doc: dueno de superficie, lienzo de referencia y el glosario vivo".
  Con ese mismo PR entraron "Que el coloreo del teclado obedezca de verdad", "La precedencia entre
  el widget de escala", "El split como rango", "Que el widget de feedback del sistema se abra
  solo" y "Convertir Motor Automático y el panel Fijar Acordes".
- El split como rango: el usuario declara desde qué nota hasta qué nota quiere que el motor evalúe,
  con el split exacto adentro de ese rango, y adapta su forma de tocar para caer dentro. Es distinto
  del split actual, que es una sola nota. Bloqueado: toca la evaluación, o sea el motor. El bloqueo
  escrito antes decía que quedaba fuera del alcance de la Fase 5, y esa fase cerró el 2026-08-11; lo
  que sigue bloqueando es tocar el motor, no la fase.
  **Entró:** 2026-08-10, PR "doc: dueno de superficie, lienzo de referencia y el glosario vivo".
  Con ese mismo PR entraron "Que el coloreo del teclado obedezca de verdad", "La precedencia entre
  el widget de escala", "La rama del preveredicto de `renderKeyboard`", "Que el widget de feedback
  del sistema se abra solo" y "Convertir Motor Automático y el panel Fijar Acordes".
  **Sin origen recuperable.** El PR que lo trajo produjo cuatro entradas de decisiones, sobre
  dueño de superficie, lienzo de referencia, jerarquía de menús y criterio de entrada a una fase
  en curso, y ninguna toca la evaluación ni el split. El CHANGELOG de ese día lo nombra dentro de
  una lista de siete sin dar razón. No hay base para una hipótesis.
- Que el widget de feedback del sistema se abra solo cuando aparece un error, estando cerrado.
  Bloqueado por un conflicto que hay que resolver antes: contradice que cerrar una caja sea una
  decisión del usuario que el sistema respeta. Quien lo tome tiene que decidir si el feedback es una
  excepción declarada o si el aviso viaja por otro canal.
  **Entró:** 2026-08-10, PR "doc: dueno de superficie, lienzo de referencia y el glosario vivo".
  Con ese mismo PR entraron "Que el coloreo del teclado obedezca de verdad", "La precedencia entre
  el widget de escala", "La rama del preveredicto de `renderKeyboard`", "El split como rango" y
  "Convertir Motor Automático y el panel Fijar Acordes".
  **Hipótesis:** se anotó al escribir la regla que contradice. Base: el mismo commit produjo la
  entrada del 2026-08-10 "Dueño de superficie: cerrar el widget apaga su efecto", que fija que
  cerrar una caja es una decisión del usuario que el sistema respeta, y el ítem quedó escrito con
  ese conflicto declarado en vez de como pedido limpio. El CHANGELOG no lo dice, así que esto se
  puede discutir.
- Una regla de persistencia: qué merece guardarse, dónde vive y qué pasa cuando la forma de lo
  guardado cambia. Hoy no hay ninguna escrita. Persisten dos cosas con dos claves de `localStorage`:
  `midiTrainerCfg` guarda `State.config` y `midiTrainerLayout` guarda `Layout.estado`. Funciona por
  dos comportamientos que conviene documentar en vez de dejar como accidente: `loadConfig` fusiona lo
  guardado sobre los valores por defecto, así que agregar un campo nuevo no rompe nada; y `loadLayout`
  descarta el estado entero con un aviso si es ilegible o si viola el cap. Lo que cuesta no tenerla ya
  pasó: el comentario de `src/state.js` dice que renombrar el campo `latino` dejaría a medias una
  migración de `midiTrainerCfg`, o sea que una migración que no existe frenó un renombre. Nueve ítems
  parqueados van a necesitarla, y dos de ellos ya traen la pregunta adentro sin respuesta: el alto del
  teclado configurable, el ancho de la negra, el filtro del log por categoría, apagar los efectos del
  fondo, la barra auto-ocultable, el split como rango, la vista activa por instancia, **el tamaño de
  un widget redimensionable**, que pregunta si el tamaño se persiste por instancia, y **cuánto
  histórico guarda la tabla histórica**, que pregunta si se limpia sola. Esto pide una decisión y no
  una receta: fijar hoy el formato de almacenamiento para preferencias que no existen es lo que la
  sección "Promesas y umbrales" de `CLAUDE.md` prohíbe.
  **Entró:** 2026-08-11, PR "doc: vista contra widget, el cap pedagógico y dónde vive el lock de
  acorde".
  **Por qué se anotó:** salió de revisar dónde vive el lock de acorde. Al contar qué ítems implican
  una preferencia nueva quedó a la vista que no hay regla que diga dónde guardarla.
- **Salida MIDI configurable.** El usuario elige un puerto de salida y un canal, y la app manda notas
  ahí. Hoy `MIDI.bindDevices` recorre `access.inputs` y nunca toca `access.outputs`, así que la mitad
  de salida del protocolo está sin usar. Medido el 2026-08-11 desde `file://` en Chromium 149: tres
  destinos distintos recibieron notas, dos hacia Qsynth y uno hacia el teclado por sus propios
  parlantes. Puerto y canal son configuración del sistema y no un widget: no producen nada, deciden
  por dónde sale lo que otros producen, que es la misma categoría que el split. **Dos requisitos, no
  sugerencias:** el canal y la nota de un apagado se capturan al encender, no se leen después, y el
  pánico va a los dieciséis canales y no al activo. Los dos salieron de fallas observadas y sus
  síntomas viven en `DECISIONS.md`, entrada del 2026-08-11 "Dos requisitos de cualquier trabajo que
  mande notas MIDI".

  **Dos preguntas que hay que contestar al implementarlo, anotadas el 2026-08-11.** Primero, si el
  usuario elige un solo puerto y canal para todo o uno por función: el acompañamiento y el metrónomo
  podrían querer canales distintos, y sin esta anotación quien lo implemente va a elegir un destino
  global porque es lo obvio, y el segundo consumidor va a pedir el suyo. Segundo, la razón de fondo
  de que el canal lo elija el usuario y no la app: **MIDI no devuelve nada**, así que la app manda y
  no se entera de si el canal tiene un piano, un órgano o nada.
  **Entró:** 2026-08-11, PR "doc: qué se puede hacer sonar, medido, y la Fase 7 reescrita".
  **Por qué se anotó:** salió de medir qué se puede hacer sonar desde `file://`. El SoundFont no
  entra y la salida MIDI sí, así que el sonido de calidad deja de ser un problema de la app.
- **Program Change como petición declarada.** Pedirle al destino que use tal instrumento en tal canal.
  La dificultad está medida y va escrita: la app no puede saber qué hay en cada canal del destino, y
  MIDI no devuelve confirmación, así que pide y no se entera de si obtuvo. En la corrida del
  2026-08-11 el cambio de programa no hizo nada hasta que hubo un SoundFont General MIDI en el canal.
  Y el canal 10 reservado a percusión es una convención que la configuración real del autor no cumple.
  No es imposible: necesita que el usuario declare qué tiene, y esa es una decisión de interfaz que
  no se toma acá. Bloqueado por la salida MIDI configurable.
  **Entró:** 2026-08-11, PR "doc: qué se puede hacer sonar, medido, y la Fase 7 reescrita". Con ese
  mismo PR entraron "Salida MIDI configurable" y "Cargar un SoundFont".
  **Por qué se anotó:** salió de la misma corrida que midió la salida MIDI.
- **Cargar un SoundFont para que la app sintetice su propio sonido.** Queda anotado con lo que se
  midió y sin promesa de que se haga. `decodeAudioData` no entiende un `.sf2`: con un archivo de 21.5
  MB devolvió `EncodingError`, porque un SoundFont es un contenedor con muestras y mapeos, no un
  archivo de audio. Usarlo exigiría escribir un analizador de formato propio. **El riesgo de memoria
  que se temía no existe por ese camino**, y tampoco se puede medir: `performance.memory` mide el heap
  de JavaScript y los búferes de audio viven fuera, `measureUserAgentSpecificMemory` no existe, y un
  hilo aparte se crea pero adentro `AudioContext` da `undefined`. **El criterio disponible**, si algún
  día se retoma, es poner el tope por tamaño de archivo antes de leerlo, que el selector da sin costo.
  Las corridas completas viven en `DECISIONS.md`, entrada del 2026-08-11 "El SoundFont no entra por el
  camino del audio, y MIDI de salida lo reemplaza".
  **Entró:** 2026-08-11, PR "doc: qué se puede hacer sonar, medido, y la Fase 7 reescrita". Con ese
  mismo PR entraron "Salida MIDI configurable" y "Program Change como petición declarada".
  **Por qué se anotó:** salió de querer que el programa sonara a piano de verdad. Se anota para que
  quede el resultado medido y nadie vuelva a intentarlo por el mismo camino.
- **Cubrir el manejo de eventos con pruebas.** Hoy `tests/run.js` hace un solo `require`, el de
  `src/engine.js`, así que las 41 fixtures prueban lógica pura y nada de `src/midi.js`. El caso que
  lo justifica: el acorde detectado nunca se liberaba, porque el temporizador de liberación vivía en
  una rama inalcanzable para las notas de bajo, y el defecto sobrevivió desde el primer commit del
  repositorio sin que ninguna prueba lo tocara. Cubrirlo pide tres cosas que no existen: `src/midi.js`
  cargable desde Node con su envoltura, un doble del DOM, y tiempo simulable, porque una prueba que
  espera 2000 ms reales no sirve. Las razones viven en `DECISIONS.md`, entrada del 2026-08-11 "El
  manejo de eventos no se cubre con fixtures todavía, y el motivo es el costo".
  **Entró:** 2026-08-11, PR "fix: el acorde detectado nunca se libera". Con ese mismo PR entraron
  "El veredicto de melodía se borra cuando aterriza un acorde" y "El teclado contradice al motor en
  la nota que está sonando".
  **Por qué se anotó:** salió de arreglar el acorde pegado y encontrar que ninguna fixture lo cubría.
- **El veredicto de melodía se borra cuando aterriza un acorde, antes de su tiempo.** Medido el
  2026-08-11: una nota de error muestra su veredicto y a los 300 ms ya no tiene evaluación, con
  `errMs` en 1000. La causa está a la vista: `MIDI.triggerAccumulation` llama a
  `Armonia.clearEvaluations` cada vez que detecta un acorde, y la acumulación son 120 ms, así que
  cualquier veredicto de melodía vivo se borra al aterrizar el acorde. Es el síntoma que el autor
  reportó como que el símbolo se ve un instante y desaparece antes de lo que el temporizador declara.
  Falta decidir si limpiar las evaluaciones al detectar un contexto nuevo es lo correcto y el
  temporizador miente, o al revés.
  **Entró:** 2026-08-11, PR "fix: el acorde detectado nunca se libera". Con ese mismo PR entraron
  "Cubrir el manejo de eventos con pruebas" y "El teclado contradice al motor en la nota que está
  sonando".
  **Por qué se anotó:** el autor lo reportó y se reprodujo al verificar el arreglo del acorde pegado.
  No lo causaba ese defecto: se reprodujo igual antes y después.
- **El teclado contradice al motor en la nota que está sonando.** Medido el 2026-08-11 con un acorde
  de Do mayor activo y el universo en Fa# mayor: el motor dice `OK E (en el acorde activo) -> good` y
  la tecla queda `color-inactive`, o sea gris. La causa son dos cosas encadenadas. Un veredicto
  `good` se borra casi al instante, porque `MIDI.evaluateMelody` le da un temporizador de cero, así
  que la rama de evaluaciones de la cascada deja de aplicar. Y la rama siguiente, la del preveredicto,
  vuelve a derivar el color del universo en vez de leer el veredicto que el motor ya dio. Es el
  síntoma que el autor reportó como que las notas alteradas no se colorean, y es el mismo ítem del
  preveredicto que ya está en esta lista, ahora con su medición y su consecuencia visible.
  **Entró:** 2026-08-11, PR "fix: el acorde detectado nunca se libera". Con ese mismo PR entraron
  "Cubrir el manejo de eventos con pruebas" y "El veredicto de melodía se borra cuando aterriza un
  acorde".
  **Por qué se anotó:** el autor lo reportó y se reprodujo al verificar el arreglo del acorde pegado.
  No lo causaba ese defecto: se reprodujo igual antes y después.
- **Un widget de acompañamiento, con un propósito: liberar la mano izquierda para concentrarse en la
  melodía.** Reemplaza a los dos controles de acordes que hoy están partidos en dos, "Motor
  Automático" visible en el escenario y "Fijar Acordes" oculto a propósito. Es su propio widget
  porque produce acompañamiento, que no es elegir el universo ni presentar análisis, y su permiso es
  escritura sobre `State.harmony`. El lock actual es el caso más simple de esa función: un acorde,
  sostenido, sin ritmo.

  **Capacidades, como lista abierta y sin decidir:** elegir un acorde entre los que el universo activo
  admite, sostenerlo, arpegiarlo, tocarlo en vals u otras figuras, encadenar progresiones a un tempo
  dado, y eventualmente admitir acordes de intercambio modal u otras familias fuera del universo. La
  lista va abierta a propósito: el propósito no envejece, y qué figuras toca se decide cuando el
  widget se construya y se vea qué hace falta. Prometer hoy una lista cerrada de capacidades para algo
  que no existe es lo que "Promesas y umbrales" de `CLAUDE.md` prohíbe.

  **Bloqueado por dos cosas, corregidas el 2026-08-11.** La salida MIDI configurable, que es el ítem
  nuevo de este mismo BACKLOG, y el metrónomo para el tempo, que deja de ser una idea suelta y pasa a
  ser dependencia de este widget. **El bloqueo anterior decía la Fase 7 y era falso:** esa fase
  entrega tres sonidos de veredicto, no un motor de acompañamiento, y el acompañamiento no la
  necesita porque no sintetiza nada, manda MIDI hacia el sintetizador del usuario.

  **El matiz que salva la parte útil:** el acorde fijo sin ritmo no necesita sonar, porque el motor
  evalúa contra él igual. El lock de hoy sigue funcionando como está, y un widget mínimo que solo
  permita elegir y sostener un acorde de los grados del universo activo ya cumple el propósito sin
  esperar a nada. Lo que espera es el acompañamiento con tempo.

  Las razones completas viven en `DECISIONS.md`, entrada del 2026-08-11 "El lock de acorde es su
  propio widget, y su función es liberar la mano izquierda", que supera a la de ese mismo día que lo
  ponía en una vista del widget de escala. **Procedencia:** salió de rastrear en el código qué hace el botón, que
  bloquea el acorde detectado para que el motor deje de redetectarlo mientras se practica encima, y
  de encontrar que su otra mitad, el panel de fijar acordes, ya estaba oculta con el atributo
  `hidden` y un comentario que pide no borrarla. Por eso el ítem los junta.
  **Entró:** 2026-08-10, PR "doc: dueno de superficie, lienzo de referencia y el glosario vivo".
  Con ese mismo PR entraron "Que el coloreo del teclado obedezca de verdad", "La precedencia entre
  el widget de escala", "La rama del preveredicto de `renderKeyboard`", "El split como rango" y
  "Que el widget de feedback del sistema se abra solo".

---

## Direcciones sin fase (capturadas, todavía no son fase)

Ideas de dirección que quedaron dichas y no se pierden, pero que no son fase porque les falta
infraestructura o teoría que todavía no existe. No se construyen hasta que su bloqueo caiga.

**Los primeros cuatro son caras del mismo tema y están listados como si fueran independientes.**
Entrenamientos como datos, la guía reactiva a lo abierto, el entrenamiento que escribe en los
subtítulos y el entrenamiento que propone layout describen todos el mismo sistema de entrenamientos,
que no existe. Decidir cualquiera de los cuatro por separado es decidir sobre los otros tres sin
decirlo, así que se leen juntos o no se leen.

- Entrenamientos como datos y un posible taller. Un formato de datos (JSON) para definir
  entrenamientos, que a futuro abriría un taller donde se creen entrenamientos, y hasta widgets,
  sin tocar el código base. Un entrenamiento puede además empaquetar sus propios archivos MIDI,
  uno o varios según el tipo de entrenamiento, junto con su definición en datos y el widget que
  pueda traer. Bloqueada por: el sistema de widgets y ranuras, que el ADR reserva
  para después de la segunda característica, y un motor de notas que caen que hoy no existe.
  **Entró:** 2026-07-25, PR "doc: incrementos de entrega en la Fase 5 y Direcciones sin fase". Con
  ese mismo PR entraron "La guía de interfaz reactiva a lo abierto" y "El entrenamiento que
  propone layout".
  **Por qué se anotó:** el CHANGELOG v11.28 lo dice para las tres ideas que ese PR capturó, "para
  que no se pierdan, sin volverlas fase", cada una con su bloqueo. El motivo de la anotación es no
  perder la idea, no que hubiera trabajo por hacer.
- La guía de interfaz reactiva a lo abierto. La guía no solo explica el entrenamiento activo,
  también las opciones de cada widget abierto en las ranuras, lo abra el usuario o el
  entrenamiento. Bloqueada por: que haya más de una característica a la que reaccionar (la Fase 9
  aporta la segunda).
  **Entró:** 2026-07-25, PR "doc: incrementos de entrega en la Fase 5 y Direcciones sin fase". Con
  ese mismo PR entraron "Entrenamientos como datos y un posible taller" y "El entrenamiento que
  propone layout".
  **Por qué se anotó:** el CHANGELOG v11.28 lo dice para las tres ideas que ese PR capturó, "para
  que no se pierdan, sin volverlas fase", cada una con su bloqueo.
- El entrenamiento escribe sus instrucciones en los subtítulos del entrenamiento. Hoy los
  subtítulos están definidos como directrices en tiempo real, pero ningún documento dice quién las
  produce: la superficie existe y no tiene autor. Bloqueada por: que exista el sistema de
  entrenamientos. Pregunta abierta que trae, contra la regla de dueño de superficie del 2026-08-10:
  si el entrenamiento escribe ahí, es un autor más, y hay que decidir qué pasa cuando el
  entrenamiento y el motor quieren escribir en la misma superficie.
  **Entró:** 2026-08-10, PR "doc: nombrar lo que ya existe y resolver Universo contra Escala".
  **Por qué se anotó:** el CHANGELOG v11.59 lo dice, "los subtítulos, que hoy son una superficie
  sin autor declarado, con la pregunta abierta de qué pasa cuando el motor quiere escribir ahí
  también". El PR estaba nombrando artefactos que ya existían y encontró una superficie sin dueño.
- El entrenamiento que propone layout. Un entrenamiento puede proponer una disposición de
  paneles y pedirle al usuario que la acepte o no; es consumidor que no impone, no cambia el
  layout por su cuenta. Bloqueada por: que exista el sistema de entrenamientos, acoplada con
  "entrenamientos como datos".
  **Entró:** 2026-07-25, PR "doc: incrementos de entrega en la Fase 5 y Direcciones sin fase". Con
  ese mismo PR entraron "Entrenamientos como datos y un posible taller" y "La guía de interfaz
  reactiva a lo abierto".
  **Por qué se anotó:** el CHANGELOG v11.28 lo dice para las tres ideas que ese PR capturó, "para
  que no se pierdan, sin volverlas fase", cada una con su bloqueo.
- Widgets como motores adicionales. Hoy un widget solo presenta lo que el motor calcula; a futuro
  un widget podría además calcular, siendo un motor más, no solo una vista. Bloqueada por: que el
  sistema de widgets exista y se estabilice primero; es dirección, no fase.
  **Entró:** 2026-07-25, PR "doc: refinar el modelo de capas (readout widget, ranura límite, menú
  colocador)". Con ese mismo PR entró "Apagar los efectos del fondo".
  **Por qué se anotó:** es la contrapregunta directa de lo que ese mismo commit decidió. Su
  entrada del 2026-07-25 "Refinación del modelo: el readout es un widget que presenta" fija que un
  widget lee el buffer y no recalcula, o sea que presentar no es recalcular; el ítem anota la
  dirección contraria para no perderla.
- Apagar los efectos del fondo. El teclado y las notas que caen son fondo permanente, pero sus
  efectos, el coloreo de las teclas y lo que se pinte sobre las notas, son salida del motor y
  podrían apagarse como cualquier otra, dejando el teclado limpio. Bloqueada por: nada duro, es
  opción de display; se decide cuando haya con qué probarla.
  **Entró:** 2026-07-25, PR "doc: refinar el modelo de capas (readout widget, ranura límite, menú
  colocador)". Con ese mismo PR entró "Widgets como motores adicionales".
  **Hipótesis:** se anotó extendiendo al fondo lo que ese mismo commit decidió para los widgets.
  Base: su entrada del 2026-07-25 fija que un widget de presentación se cierra y el dato sigue en
  el buffer; el ítem pregunta lo mismo para los efectos del fondo, que también son salida del
  motor. El CHANGELOG lo anota como idea capturada con su bloqueo y sin razón, así que esto se
  puede discutir.

---

## Track paralelo de teoría (no bloquea código, informa las Fases 2, 3 y 4)

Esta sección es donde se escribe la teoría antes de tocar código. Sigue viva y con trabajo asignado:
la Fase 11 declara que la teoría del intercambio modal se escribe acá antes de que el motor lo
reconozca, porque sin respuesta correcta escrita no hay fixture.

Lo que sí drenó el 2026-08-11 son sus tres apuntes didácticos. Los tres describían cosas que el repo
ya resolvió en otro lado, y un apunte que describe algo ya hecho no es trabajo pendiente. El criterio
y su razón viven en `DECISIONS.md`, entrada del 2026-08-11 "Un apunte que describe algo ya hecho no
es una dirección pendiente". Adónde fue cada uno:

- **Función tonal.** Listaba qué grados corresponden a cada función. `getTonalFunction` la deriva
  desde la Fase 4 y `Readout.updateStatus` la muestra desde el incremento 5.5.1. El `GLOSARIO.md` ya
  trae el término completo, con los cinco valores y las dos veces que el motor admite no saber, así
  que el apunte se retira por duplicado.
- **Dominante secundaria.** Fijaba el vocabulario para "una nota que empuja y vuelve". El motor la
  evalúa desde la Fase 3, en `isSecondaryDominantLeadingTone`. El vocabulario sigue valiendo, así que
  pasa a `GLOSARIO.md`, que es donde vive lo que un término significa hoy.
- **Círculo de quintas.** No describe algo implementado: describe el trabajo de la Fase 10, que sigue
  `pendiente`. Duplicar una fase declarada como apunte no agrega nada, así que se retira y la Fase 10
  queda como el único lugar donde vive.

---

## Deuda de método y documentación (no es fase, y altera el estándar)

Esta sección parquea trabajo sobre cómo se documenta y se versiona el proyecto, no sobre lo que
hace la app. Nada de acá se ejecuta hasta terminar la Fase 5 completa, con sus cinco incrementos
entregados y corroborados. Varios de estos puntos cambian el estándar compartido que vive en
`CLAUDE.md`, así que no tocan solo este repo: tocan también los otros que siguen ese estándar. Por
eso se parquean juntos y se ejecutan de a uno, con su propia discusión.

El motivo de fondo es uno solo. Un modelo no lee la conversación completa: lee un resumen
comprimido donde los matices se pierden, y lo que se perdió no vuelve. El repo, en cambio, lo lee
en texto plano y lo puede grepear. Entonces el contexto que importa tiene que vivir en el repo, no
en el chat. Cada punto de abajo es un pedazo de contexto que hoy vive en el chat o en la cabeza de
alguien, y debería estar en un archivo.

### Esquema de versión de cuatro segmentos

La propuesta es un número de cuatro segmentos, del tipo 11.22.33.44, donde cada segmento cuenta
una clase distinta de trabajo. El primero es la versión mayor y solo sube cuando termina un roadmap
entero, con su última fase definida entregada; no sube por backlog pendiente, porque el backlog no
tiene fecha ni compromiso. El segundo se mueve por trabajo sobre una característica que está en el
roadmap como fase definida, cuando se introduce, se cambia, se altera o se remueve. El tercero se
mueve por lo mismo, pero cuando la cosa está en el backlog, es un issue, o es una característica
desarrollada fuera de la documentación y por lo tanto fuera del roadmap; también cubre el caso de
descubrir más adelante que algo de una fase quedó mal implementado, que en vez de reabrir la fase o
mover el segundo, mueve el tercero. El cuarto se mueve solo por cambios de documentación de
cualquier tipo, reestructura o redocumentación.

Los cuatro segmentos son independientes y no hay acarreo. 11.99.99.99 no se convierte en
12.00.00.00, y mover un segmento no reinicia los de la derecha. Conviene dejarlo escrito con esas
palabras porque el formato invita a leerlo como versionado semántico, y no lo es: son cuatro
contadores concatenados, uno por clase de trabajo. Funciona porque acá la versión es una etiqueta
de trabajo y no un contrato de dependencias; nadie instala este repo como paquete.

Quedan dos preguntas abiertas, sin resolver. La primera son los PR mixtos. Casi todo PR de código
toca también documentación, aunque sea el CHANGELOG, y falta decidir si eso mueve el cuarto
segmento además del que corresponda por el código. La sugerencia registrada es que no, que el
cuarto quede solo para PR cuya única sustancia es documentación, porque si se mueve en cada PR deja
de significar algo. La segunda es qué cuenta exactamente el segundo segmento. Leído literal parece
contar cambios a la definición de una fase, y entonces nada se movería al entregar el código de una
fase ya definida, que es justo el trabajo más grande. La lectura sugerida es que el segundo cuente
el trabajo sobre características que pertenecen a una fase definida, entregarla incluido, y que el
tercero cuente lo mismo cuando la cosa está fuera del roadmap. Queda sin decidir.

El premio de todo esto es concreto. Hoy un PR doc-only no puede tocar la versión que muestra el
artefacto, así que la versión mostrada queda por detrás del CHANGELOG y ese desfase intencional se
arrastra hasta el próximo PR de código. Con un segmento propio para documentación, ese desfase
puede desaparecer, si se decide que editar únicamente el string de la versión mostrada sigue
contando como doc-only. Eso también queda por decidir.

Cuando esto se ejecute, el punto de partida 11.xx.xx.xx se infiere de lo que ya está escrito en el
CHANGELOG y en el resto de la documentación, contando cuántos cambios de cada tipo hubo. No hace
falta recorrer el historial de commits.

### Crítica obligatoria del diseño de fase, y el impacto sobre lo ya implementado

La regla propuesta es esta. Que una fase pueda estar bloqueada por otra ya está contemplado y
funciona. Lo que falta es el paso anterior: antes de planear una fase hay que preguntar de forma
explícita si los cambios previstos afectan características que ya están implementadas, y si las
afectan, documentar cómo y dónde. Y cuando aparece algo nuevo, la prioridad no debe ser colgarlo al
final del roadmap, ni como última fase ni como backlog, sino evaluar si merece ser una fase
intermedia, incluso si eso obliga a reordenar el roadmap entero.

Esto no sale de la teoría, sale de dos cosas que ya pasaron acá. La primera: el coloreo de teclas
que ya existía casi queda diferido en el reencuadre visual, y hubo que rescatarlo a mano dentro de
la definición de la Fase 5, agregando al Alcance que se preserva y no se rehace ni se apaga. Nadie
lo había marcado como afectado porque nadie hizo la pregunta. La segunda: durante la planificación
del incremento 5.2 se categorizó mal la barra de universo, tratándola como chrome de opciones,
cuando contiene la vista lineal de la escala, que es material de widget. El error no fue de
distracción, salió de que ningún documento del repo nombra qué es esa barra.

Cuando esto se ejecute va a necesitar una entrada propia en `DECISIONS.md` y no solo una
línea de backlog, porque es una regla de método permanente y las reglas de método son exactamente
lo que ese archivo guarda.

### Documento de requisitos, propósito y público objetivo

El faltante es concreto y se verifica en dos comandos: hoy no existe `README.md` en el repo, y los
términos "público objetivo", "requisito", "requerimiento" y "no funcional" no aparecen en ningún
documento. El repo documenta el plan en el ROADMAP y el porqué de cada decisión en DECISIONS, pero
no documenta para quién es la app, cuál es su propósito, cuál es su alcance, ni qué tiene que ser
verdad para que esté bien hecha.

No es redundante con lo que ya hay, porque los tres documentos responden preguntas distintas. El
ROADMAP dice qué sigue. DECISIONS dice por qué esta forma y no otra, y es historia append-only que
no se reescribe. Un documento de requisitos dice qué tiene que ser verdad y para quién, sin fecha y
sin orden de trabajo. Solo se volvería redundante si repitiera decisiones, y evitar eso es el
trabajo principal cuando se escriba.

Esto no es burocracia. La razón ya está a la vista: varios requisitos no funcionales
gobiernan el diseño hoy, pero están dispersos como justificación adentro de decisiones sueltas. El
límite de tres ranuras existe porque las notas del fondo necesitan aire, o sea es un requisito no
funcional disfrazado de regla de interfaz. Lo mismo pasa con abrir desde `file://` sin servidor, sin
framework y sin build, con depender de Web MIDI en Chrome, con el repo privado, y con el teclado
fijo de 88 teclas. Juntos son el piso sobre el que se apoya el modelo de widgets, y hoy hay que
reconstruirlos leyendo entradas sueltas y sacando conclusiones.

El documento también debería incluir los lineamientos de qué puede usar o alterar un entrenamiento
y qué puede usar o alterar un widget, y qué determina que algo sea uno, otro o ninguno. Eso se cruza
con la nota de "contrato de salida" ya parqueada en la Fase 9, así que hay que atarlos a propósito,
para no terminar con dos documentos que dicen lo mismo con sentidos distintos.

Ese documento tiene que dejar escrito además por qué el layout se puede rearmar. La jerarquía de lo
que el usuario necesita mirar cambia a medida que aprende: lo que hoy es lo primero que busca,
cuando ya lo entiende pasa a segundo plano y libera atención para otra cosa. Por eso la app no fija
una disposición correcta para siempre sino una por defecto que ya funciona y se puede rearmar. El
mecanismo está construido en el modelo de widgets; el motivo pedagógico no está escrito en ninguna
parte, y es de los primeros que se pierde cuando se comprime una conversación.

Queda abierto si esto vive en un `README.md` nuevo o en un documento aparte dentro de `docs/`. El
criterio para decidirlo es quién lo lee: el lector que más lo necesita es un modelo que grepea texto
plano, no una persona que quiere orientarse en treinta segundos. Esos dos lectores quieren
documentos distintos, y eso puede empujar a que sean dos y no uno.

### Nomenclatura de lo que ya existe

El glosario que hay en DECISIONS declara de sí mismo que es solo vocabulario de arquitectura, y
cumple: nombra el modelo nuevo, fondo, panel, ranura, característica, salida del motor, buffer del
motor, superficie de feedback. Lo que no hace, porque no se lo propuso, es nombrar los artefactos
que ya están en el código. No hay una línea en todo el repo que diga qué es la barra de universo, la
vista de fórmula, el selector de escala, el split, ni el panel de fijar acordes. Por eso dos cosas
que viven en la misma caja se pueden confundir con cosas distintas, que es exactamente lo que pasó
al planear el incremento 5.2.

Los artefactos ya están nombrados: el PR del 2026-08-10 abrió la sección "Artefactos del código"
en `docs/GLOSARIO.md` con el widget de escala, la vista de fórmula, los dos selectores, el split, el
panel de fijar acordes y el botón de bloqueo del motor. El contenedor de controles del escenario
quedó nombrado como lo que es, sin identificador estable, en vez de inventarle uno. Lo que sigue
pendiente de este punto es lo otro.

Hay un segundo problema, el de los nombres internos. El incremento 5.4 de la Fase 5 arregla las
etiquetas que ve el usuario, "Silábica" y "Alfabética" en vez de "Latina" y "Anglosajona", y el
propio ROADMAP aclara que ese cambio es de display y no de motor. La consecuencia es que el nombre
interno sigue diciendo latino en el código, y quien lea el código sigue leyendo una categoría
cultural para algo que es una forma de nombrar notas. Este punto es sobre eso, nombres internos y de
documentación, y es distinto del 5.4, que solo toca lo que se muestra en pantalla. No lo duplica.

### Glosario vivo en vez de glosario congelado (sugerencia del revisor)

Este punto es una sugerencia del revisor externo, no un pedido del autor, y se anota como tal.

El hallazgo se verifica leyendo el archivo: DECISIONS es append-only, y el glosario está adentro
como una entrada más. La definición de ranura en el glosario dice que es una de las tres posiciones
donde vive una característica. Una entrada posterior del mismo día decidió que la ranura es un
límite y no un espacio, y que no hay tres cajas fijas en la pantalla. Las dos líneas conviven en el
mismo archivo, y la del glosario aparece primero cuando alguien busca la palabra.

El mecanismo del problema es este: en un archivo append-only, un glosario se vuelve una mina. Su
trabajo es decir qué significa una palabra ahora, y el formato lo obliga a decir qué significaba
cuando se escribió. Los dos objetivos se pelean y gana el formato. La sugerencia es sacar el
glosario del flujo append-only y volverlo un documento vivo y editable, dejando que DECISIONS siga
siendo el historial de por qué cambió cada cosa. La alternativa es exigir que toda entrada que
refine un término reescriba también la línea del glosario, pero es más frágil, porque depende de que
nadie se olvide.

### El material de referencia que vive fuera del repo (sugerencia del revisor)

También es sugerencia del revisor externo.

Durante la planificación del reencuadre visual se produjeron bocetos de la interfaz que sirvieron
para acordar el destino, y funcionaron. El problema es que viven fuera del repo: no se pueden
grepear y no sobreviven al cierre de una conversación. La idea parqueada es que el destino visual
acordado quede descrito en texto adentro del repo, en el mismo documento de requisitos o en uno
propio, con qué widget va por defecto en qué lugar, qué es permanente y qué no. La prueba de que
está bien escrito es que un modelo pueda reconstruir la intención sin ver ninguna imagen. Queda por
decidir si además conviene versionar algún boceto en el repo, o si la descripción en texto alcanza.

Los bocetos de la interfaz son una secuencia cronológica, no una fuente paralela de autoridad: cada
uno refina al anterior, y el último es el que corresponde al modelo vigente. Los primeros contienen
ideas que se superaron a conciencia, cajas de tamaños distintos que el molde uniforme reemplazó,
botones dentro de cada caja que los controles en el menú reemplazaron, y una barra de menús centrada
que quedó con el título a la izquierda. Quien los mire después tiene que leerlos en ese orden y no
tomar el primero como destino, o va a restaurar cosas descartadas creyendo que recupera el diseño
original. Frente a una duda, mandan las entradas fechadas de decisiones, no un dibujo. La conclusión
práctica para lo que se escriba de acá en más: lo que se fijó con números sobrevivió intacto a cada
relevo, y lo que quedó en adjetivos se reinterpretó cada vez contra lo que ya existía en el código,
que es la razón por la que este punto pide medidas y no descripciones.
