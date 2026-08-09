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
paneles a la vez. El material teórico ya está escrito en la sección "Track paralelo de
teoría" de este documento; el motor implementa eso: Tónica (I, vi, iii), Subdominante
(IV, ii), Dominante (V, vii°).

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

**Estado:** `en progreso`

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
como intercambio modal le afirma al usuario un análisis que el motor no hizo. Se cambia a "no
clasificado" o "por definir", hasta que la Fase 11 escriba la teoría del intercambio modal; el
nombre interno de esa relación en el motor se decide en la Fase 11, no en esta fase. Tercero, la
función tonal que la Fase 4 calcula y escribe en el buffer sin mostrarla se muestra acá en el
panel de Análisis, junto al numeral y la relación, de forma consistente con el relabel honesto:
para un acorde no diatónico la función dice "por definir" y la relación dice "no clasificado",
sin que una contradiga a la otra.

Cuarto, la etiqueta "Universo" que hoy encabeza el selector pasa a "Escala", que es lo que el
usuario elige y la palabra que ya usa. Con una precisión que queda escrita para que una futura
pasada de nomenclatura no la borre: el nombre interno del motor, `universeType`, `universeRoot` y
`universePitchesSet`, se queda como está a propósito. "Universo" adentro nombra el conjunto de
notas permitidas, que no siempre es una escala de siete notas: el backlog trata a las pentatónicas
y al blues como universos propios justamente porque no lo son. Renombrar adentro aplanaría esa
distinción. El renombre interno, si alguna vez se hace, es trabajo del punto de nomenclatura de
"Deuda de método y documentación", con su propio PR y las fixtures en verde.

Quinto, la etiqueta "Tensión Legal" de la leyenda entra a la lista de renombres. Nombra un caso
único, la sensible en universo menor, y se lee como si nombrara una familia de tensiones
permitidas. El nombre nuevo se decide junto con los otros de esta subsección.

**Incrementos de entrega.** La fase se entrega en cinco incrementos, del más estructural al más
cosmético, cada uno un PR de código que se puede ver y corroborar por separado.

- Incremento 5.1, fondo único: el teclado y las notas ocupan todo el ancho y alto como una sola
  capa de fondo, las notas pasan por detrás de los overlays, y la disposición apilada actual pasa
  a fondo más overlays en posiciones por defecto fijas, todavía sin mecánica de widgets. El
  coloreo del teclado que ya existe queda intacto. Motor intacto.
- Incremento 5.2, barra permanente y chrome global: la barra de menús permanente tipo macOS, que
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
- Incremento 5.3, sistema de widgets: mover la caja arrastrando con el mouse, que es la
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
- Incremento 5.4, nomenclatura por forma: las etiquetas del botón de nomenclatura pasan a
  "Silábica" y "Alfabética", con valor por defecto, persistencia por `localStorage` y el botón
  alcanzable. Suma dos trabajos más de nombres y símbolos. Uno es la mudanza física de la leyenda
  de colores a la guía, que la entrada de decisiones del 2026-08-09 ya resolvió en el papel y este
  incremento ejecuta. El otro es decidir la regla de iconos y emojis de la interfaz, que hoy no
  existe escrita; el ítem de coherencia visual del set de iconos del BACKLOG es el material de
  partida y se cierra acá, en vez de quedar dos veces anotado.
- Incremento 5.5, análisis honesto: la función tonal que la Fase 4 dejó en el buffer se muestra en
  el panel de Análisis junto al numeral y la relación, y la etiqueta "Intercambio Modal" se
  relabela a "no clasificado" o "por definir". Van juntos para no dejar un estado intermedio
  contradictorio.

La fase pasa a `en progreso` al completarse el incremento 5.1, y a `cerrada` cuando el 5.5 esté
hecho y corroborado.

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

- El teclado dibuja 61 teclas, de la nota MIDI 36 a la 96, con las constantes `KEYBOARD_START` y
  `KEYBOARD_END`. La documentación fija 88 teclas en cuatro lugares. Un piano de 88 va de la nota 21
  a la 108. El código incumple lo escrito y hay que corregirlo.
- El teclado ocupa demasiado alto para lo que aporta. Ningún documento fija su altura ni su posición,
  así que no es un incumplimiento sino un hueco: queda como pregunta abierta cuánto alto merece el
  teclado y si va pegado al borde inferior. Se decide junto con las 88 teclas, porque a más teclas
  cada una sale más angosta y el alto necesario cambia.
- Dos widgets existen solo como andamiaje y no tienen contenido: el tercer widget, rotulado por
  construir, y el widget de prueba. El segundo se creó porque el cap es de tres y sin un cuarto
  candidato la rama que bloquea una apertura no se puede ejercer desde la interfaz. Los dos nacen
  cerrados, así que no se dibuja nada, y se retiran cuando existan los widgets de verdad.

**Criterio de aceptación:** el fondo es una sola capa con el teclado y las notas a todo el
ancho, las notas pasan por detrás de los overlays, la barra de menús permanente existe como
chrome para opciones y logs, la salida del motor tiene un lugar visible definido o queda
cubierta por el log, el motor y el coloreo quedan intactos, todos los fixtures existentes
siguen pasando, y el autor lo corrobora en el navegador.

**Nota de reapertura (2026-07-25):** el primer intento, apilado, se construyó y quedó en
V11.19. Sirvió para ver que el modelo real es de capas, no de pila. Se reabre la fase para
realinear la disposición a capas según la refinación del modelo del 2026-07-25. El apilado
queda superado, no se borra del código hasta que esta fase corra. La palabra "característica"
de las fases anteriores se lee como "widget" según esa misma refinación.

**Bloquea:** Fase 9 (aporta la primera ranura y la estructura fondo-overlay).

**Bloqueada por:** ninguna declarada.

---

## FASE 5B: Modularizar `index.html` con ES Modules nativos

**Estado:** `pendiente`

**Objetivo:** cumplir el umbral que `ARCHITECTURE.md` §7 fija desde el principio y que ya se
cruzó. Esa sección dice que si `index.html` pasa las 1000 líneas el siguiente paso es
modularizar con ES Modules nativos, sin adoptar framework. Medido el 2026-08-09: `index.html`
tiene 1055 líneas y `src/engine.js` 249.

**Por qué 5B y no un número nuevo:** insertar una Fase 6 nueva obligaría a correr las seis fases
siguientes, y los encabezados de este archivo son anclajes de los que un modelo saca qué hacer al
ejecutar una fase. Tampoco puede llamarse 5.5, porque ese nombre ya lo usa el quinto incremento
de la Fase 5. La letra evita las dos colisiones y deja el orden de ejecución claro: va después de
la Fase 5 completa y antes de la Fase 6.

**Alcance:** partir `index.html` en módulos por responsabilidad, siguiendo la separación que
`ARCHITECTURE.md` §2 ya documenta: `State`, `MIDI`, `UI` y `SysLog`. Se carga con
`<script type="module">`, sin build step, sin bundler y sin framework, que es lo que la decisión
del 2026-07-03 descarta. `src/engine.js` se queda como está: ya es el motor puro y corre en Node
contra las fixtures. La app tiene que seguir abriendo desde `file://`.

**Criterio de aceptación:** las 41 fixtures siguen pasando, la app abre desde `file://` sin
servidor, el autor la corrobora en Chrome con el piano físico, y ningún archivo de código pasa las
1000 líneas. El motor y `renderKeyboard` no cambian de comportamiento.

**Bloquea:** Fase 6.

**Bloqueada por:** Fase 5 completa, con sus cinco incrementos cerrados.

**Excepción de método, anotada a propósito:** esta fase nace de un umbral que se disparó a mitad
de otra fase, y el repo no tenía escrito qué hacer en ese caso. Se decidió terminar la Fase 5
antes de atacarlo, en vez de frenar el trabajo visual en curso. La decisión y su razón viven en
`DECISIONS.md`, entrada del 2026-08-09. Que las reglas para estos casos falten está anotado en el
BACKLOG.

---

## FASE 6: Calidad de vida

**Estado:** `pendiente`

**Objetivo:** sumar las mejoras de calidad de vida que hoy faltan.

**Alcance:**

- Botón de reset a valores de fábrica (`State.config` más recarga).
- Persistir también `State.universe`. Hoy solo se persiste `State.config`.
- Panel de logs: expandir y contraer en vez de altura fija.
- "Fijar Acordes" dinámico: generar los botones I, IV, V según la escala activa, en vez de
  los dos acordes hardcodeados (Do Mayor y Re m7).

**Criterio de aceptación:** por definir.

**Bloquea:** ninguna declarada

---

## FASE 7: Feedback sonoro (Web Audio API)

**Estado:** `pendiente`

**Objetivo:** empezar a entrenar el oído sin mirar la pantalla, que es la brecha más grande
que marcó el informe de campo original.

**Alcance:** un sonido corto al acertar, otro para tensión, otro para error. Entre 10 y 20
líneas, sin dependencias.

**Criterio de aceptación:** por definir.

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
vista.

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
- Pentatónicas y Blues como universos propios, no como parches de excepción. Ojo con esto: no son
  escalas de siete notas, así que no producen una escalera de siete tríadas por grado y la vista de
  calidades de la rueda no se les extiende tal cual. Antes de programarlas hay que decidir qué
  significa ahí un acorde por grado, o si en esos universos la vista muestra otra cosa. Eso es lo
  que las vuelve universos propios y no una escala más en la lista.
- Glosario in-app que crezca junto con lo aprendido.
- Modo "canción": cargar un MIDI, reproducir el bajo, evaluar la melodía en vivo.
- Entrenamiento de oído puro (dictado de intervalos, identificar un acorde solo de oído).
  El informe de campo ya marcó esto como el objetivo final, y el software actual no lo
  cubre.
- Menor melódica como escala disponible, junto a los modos griegos y las pentatónicas ya
  listados. Cobra sentido si el jazz entra como objetivo.
- Calibración de tiempos por tapping. Hoy los cuatro campos del motor, acumulación, retención,
  error visual y split, se ajustan a mano con números. La idea es fijarlos tocando una secuencia y
  que el programa derive los valores de lo que midió. Arrastra dos cosas más: tempos, y que los
  valores buenos dependen del tempo de la canción, lo que lo ata al modo canción de este mismo
  backlog.
- Coherencia visual del set de iconos. Los emojis que la interfaz usa hoy no forman un conjunto
  coherente: cada uno viene de una familia distinta y se ven como piezas sueltas. Queda registrado
  un hallazgo negativo para no repetir el intento: pasarlos a SVG se probó y da más carga, no menos,
  así que el SVG no es la salida por rendimiento. La pregunta abierta es cómo conseguir un set
  coherente sin sumar costo gráfico. Es cosmético y no bloquea nada. Este ítem dejó de estar sin
  fase: el incremento 5.4 lo toma y ahí se decide la regla.
- Lectura de partitura como vista futura. Está anotado para que sea una decisión y no un olvido:
  se mencionó una vez, no está comprometido, y no tiene diseño ni alcance todavía.
- Comparar cómo reparten el espacio los programas que ya explican canciones con notas que caen,
  antes de dar por firme el presupuesto de superposición. Hoy se le reserva altura a un motor que no
  existe, y el tope de tres octavos sale de mirar un boceto, no de medir contra algo que funcione.
  Va junto con la lectura de archivos MIDI, porque hasta cargar una canción real no se sabe cuánto
  alto pide de verdad.
- Metrónomo. No existe en ninguna parte del proyecto hoy. Interesa porque el tiempo ya participa de
  la evaluación: el indulto por paso cromático depende de una duración fija de 180 ms, y tres de
  los cuatro ajustes del motor son ventanas de tiempo. Un metrónomo abre la puerta a que esas ventanas se
  deriven del tempo en vez de fijarse a mano. Va junto con la calibración por tapping y con los
  tempos por canción que ese ítem ya arrastra.
- Hundir el log cuando la barra crezca. Hoy queda alcanzable porque la barra tiene un solo nivel.
  La decisión del 2026-07-25 pide que la consola de debug viva detrás de submenús, oculta para
  quien solo toca. Cuando aparezcan menús que se ganen el espacio, como el de archivo para MIDI y
  entrenamientos, el log baja al lugar que le corresponde.
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
- Redimensionar un widget en tiempo real. Hoy el molde es fijo a propósito, porque el tamaño
  uniforme es lo que hace que las cajas se lean como un sistema. Dejar que el usuario las estire
  abre preguntas que hoy no tienen respuesta: qué pasa con el tope de cobertura, qué pasa con el
  contenido que se recorta, y si el tamaño se persiste por instancia. Queda anotado como idea, no
  como decisión.
- Lineamientos para partir una fase. La Fase 5 tiene cinco incrementos y uno de ellos se entrega en
  dos PR de código, y esa estructura creció sin regla: no hay escrito cuándo un incremento se parte
  ni hasta qué profundidad. Sin lineamiento, el trabajo se subdivide tarde, cuando ya se empezó a
  construir. Va junto con la crítica obligatoria del diseño de fase, que ya está parqueada, porque
  es el mismo problema visto desde el otro lado.
- Describir el destino visual en texto dentro del repo, con números. Ya está parqueado en "Deuda de
  método y documentación" como sugerencia, y quedó demostrado por qué hace falta: una instrucción en
  prosa sobre dónde van las cajas se puede cumplir de varias maneras y la que sale es la que se
  parece a lo que ya había. Los números del molde y de las posiciones viajaron intactos; lo que
  quedó en palabras, no. Este ítem eleva aquella sugerencia a trabajo concreto: las reglas de
  posición se escriben con medidas, no con adjetivos.
- Detectar el rango real del teclado conectado por MIDI, en vez de asumirlo. El protocolo no lo
  informa directamente, así que habría que inferirlo o dejar que el usuario lo declare. Por defecto
  se muestran las 88 teclas, que es lo escrito.
- Barra de menús que se oculta sola cuando no se usa, como una barra de tareas. Devolvería el alto de
  la barra al fondo y eliminaría la única zona vedada al movimiento de widgets.
- Reglas para cuando un umbral escrito se dispara a mitad de otra fase. Pasó el 2026-08-09 con las
  1000 líneas de `index.html` de `ARCHITECTURE.md` §7: el gatillo se cumplió durante la Fase 5 y no
  había escrito si se frena lo que está en curso, si se abre una fase nueva ahí mismo, o si se
  termina primero. Se resolvió caso por caso, con una excepción documentada, y esa es justamente la
  forma de decidir que este repo evita. Falta también cómo se nombra una fase que se inserta entre
  dos existentes sin correr la numeración de las que siguen.
- Reglas para promover un ítem del BACKLOG a fase. Hoy no hay ninguna, así que una idea suelta se
  queda suelta aunque esté madura, y no por falta de mérito sino por falta de criterio escrito de
  qué la hace fase: si es tener alcance cerrado, criterio de aceptación verificable, o alguien que
  la pida. Sin ese criterio el BACKLOG crece y no drena.
- Reglas para reabrir una fase cerrada y para agregarle trabajo. La Fase 5 se cerró, se reabrió y
  después creció a cinco incrementos, con uno partido en tres PR, sin que nada escrito dijera si eso
  se puede ni hasta dónde. Va con el ítem de lineamientos para partir una fase, que ya está en esta
  lista: son dos caras del mismo hueco.
- Levantar los requisitos y requerimientos antes de seguir programando. Ya está parqueado en "Deuda
  de método y documentación" como documento de requisitos, y los tres ítems de arriba son la
  consecuencia de no tenerlo: cada regla de método aparece cuando ya se rompió.
- Subtítulos de feedback parcialmente coloreables. La idea es que el subtítulo pueda teñir la parte
  de su texto que corresponde a una categoría de la leyenda, para que el color y la palabra digan lo
  mismo sin repetirlo. Queda anotada como idea y sin fase: primero hay que cablear los subtítulos a
  la salida del motor, que hoy siguen siendo un marcador de posición.

---

## Direcciones sin fase (capturadas, todavía no son fase)

Ideas de dirección que quedaron dichas y no se pierden, pero que no son fase porque les falta
infraestructura o teoría que todavía no existe. No se construyen hasta que su bloqueo caiga.

- Entrenamientos como datos y un posible taller. Un formato de datos (JSON) para definir
  entrenamientos, que a futuro abriría un taller donde se creen entrenamientos, y hasta widgets,
  sin tocar el código base. Un entrenamiento puede además empaquetar sus propios archivos MIDI,
  uno o varios según el tipo de entrenamiento, junto con su definición en datos y el widget que
  pueda traer. Bloqueada por: el sistema de widgets y ranuras, que el ADR reserva
  para después de la segunda característica, y un motor de notas que caen que hoy no existe.
- La guía de interfaz reactiva a lo abierto. La guía no solo explica el entrenamiento activo,
  también las opciones de cada widget abierto en las ranuras, lo abra el usuario o el
  entrenamiento. Bloqueada por: que haya más de una característica a la que reaccionar (la Fase 9
  aporta la segunda).
- El entrenamiento que propone layout. Un entrenamiento puede proponer una disposición de
  paneles y pedirle al usuario que la acepte o no; es consumidor que no impone, no cambia el
  layout por su cuenta. Bloqueada por: que exista el sistema de entrenamientos, acoplada con
  "entrenamientos como datos".
- Widgets como motores adicionales. Hoy un widget solo presenta lo que el motor calcula; a futuro
  un widget podría además calcular, siendo un motor más, no solo una vista. Bloqueada por: que el
  sistema de widgets exista y se estabilice primero; es dirección, no fase.
- Apagar los efectos del fondo. El teclado y las notas que caen son fondo permanente, pero sus
  efectos, el coloreo de las teclas y lo que se pinte sobre las notas, son salida del motor y
  podrían apagarse como cualquier otra, dejando el teclado limpio. Bloqueada por: nada duro, es
  opción de display; se decide cuando haya con qué probarla.

---

## Track paralelo de teoría (no bloquea código, informa las Fases 2, 3 y 4)

- Círculo de quintas: ya lo derivaste vos aplicando T-T-S-T-T-T-S desde Re y sacando Do# y
  Fa#. Falta amarrar el nombre "círculo de quintas" a algo que ya sabés hacer, no aprender
  un sistema nuevo.
- Función tonal: Tónica (I, vi, iii), Subdominante (IV, ii), Dominante (V, vii°). Esto
  reemplaza la idea de "progresión obligatoria" que vos mismo cuestionaste. No hay una
  secuencia fija de grados; hay funciones que se resuelven entre sí.
- Dominante secundaria: lo que llamás "una nota que empuja y vuelve" ya tiene nombre, V/V,
  V/ii. Fijar el vocabulario ayuda a leer `DECISIONS.md` y el código sin reinventar el
  concepto cada vez.

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
