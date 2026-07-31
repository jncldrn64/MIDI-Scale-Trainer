# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.

## v11.42 — 2026-07-31

### Added

- `docs/ROADMAP.md`: el incremento 5.2 fija la forma del menú de opciones. Arriba un preajuste de aprendizaje que mueve juntas las cuatro ventanas de tiempo del motor, abajo los cuatro campos para afinar. Se escribe antes de implementar para no construir el menú dos veces.
- `docs/ROADMAP.md`: la Fase 5 suma la convención de que lo activo se señala bajando la opacidad de lo demás, sin marcos ni colores nuevos, coherente con la opacidad como jerarquía de atención y con el presupuesto visual.
- `docs/ROADMAP.md`: nuevo ítem de backlog, la tabla histórica como widget candidato. Muestra qué se tocó, en qué orden, con qué acorde detectado y qué veredicto, sin pedir motor nuevo, y cubre una pregunta que ni la Fase 8 ni el modo canción responden.

## v11.41 — 2026-07-30

### Fixed

- `docs/ARCHITECTURE.md`: la sección 5 afirmaba que la jerarquía de evaluación no estaba escrita y que la dominante secundaria solo actualizaba la interfaz, dos cosas que dejaron de ser ciertas. La jerarquía quedó fijada en la entrada del 2026-07-23 de DECISIONS y está implementada, y la Fase 3 conectó la dominante secundaria a la evaluación: `evaluateMelodyStatus` devuelve correcto para su tono conductor, verificado leyendo la función. Se mantiene escrito que el intercambio modal queda fuera de la evaluación de notas a propósito, que el umbral de 180 ms está fijo en el código y no es uno de los cuatro ajustes editables, y el límite conocido de que una tensión corta se colapsa en paso cromático.

### Added

- `docs/ARCHITECTURE.md`: sección 5.1 nueva que documenta por primera vez la leyenda de colores de `index.html`, separando las dos categorías de contexto (Escala y Acorde, que se pintan sin tocar nada) de las cuatro de veredicto (Correcto, Tensión Legal, Paso Cromático y Error), con sus colores y símbolos reales, y anotando que "Tensión Legal" nombra un caso único y promete más de lo que cubre.
- `docs/DECISIONS.md`: entrada nueva con el estándar espacial de los widgets. Franja de nacimiento debajo de la barra que ningún widget ocupa, para que toda nota sea visible al aparecer; la oclusión parcial como señal y no defecto; tamaño y separación uniformes para que los widgets se lean como piezas de un sistema; y la guía naciendo debajo del widget de la derecha, con más espacio del que le corresponde porque es temporal. Refina el presupuesto de superposición de la misma fecha; ajustar las posiciones del 5.1 es trabajo del incremento que dé posición a los widgets.
- `docs/ROADMAP.md`: dos ítems de backlog. Metrónomo, porque el tiempo ya participa de la evaluación (el indulto de 180 ms y las cuatro ventanas del motor) y un tempo permitiría derivar esas ventanas en vez de fijarlas a mano. Y hundir el log cuando la barra crezca, devolviéndolo detrás de submenús como pide la decisión del 2026-07-25.

### Changed

- `docs/ROADMAP.md`: el incremento 5.2 deja escrita la desviación consciente del log. Queda visible como menú alcanzable porque la barra tiene un solo nivel y esconderlo sería inventar profundidad vacía; se corrige cuando la barra crezca.
- `docs/ROADMAP.md`: la Terminología de pantalla suma dos renombres. "Universo" pasa a "Escala" en pantalla, con el nombre interno del motor (`universeType`, `universeRoot`, `universePitchesSet`) preservado a propósito, porque adentro nombra el conjunto de notas permitidas, que no siempre es una escala de siete notas. Y "Tensión Legal" entra a la lista por nombrar un caso único como si fuera una familia.
- `docs/ROADMAP.md`: la Fase 5 deja escrito el reparto entre las dos superficies de salida del motor. El feedback muestra lo de nota por nota en paralelo con el coloreo de teclas; el readout muestra lo de nivel de acorde, el análisis de armonía y el intercambio modal incluidos. Es el rol que ya estaba implícito en el código.

## v11.40 — 2026-07-30

### Fixed

- `docs/ROADMAP.md`: el incremento 5.2 se contradecía consigo mismo. Su encabezado y su primera frase seguían prometiendo el menú colocador y colocar widgets en ranuras, mientras el cuerpo del mismo bullet ya decía que eso se construye en el 5.3. El encabezado pasa a "barra permanente y chrome global" y la frase inicial deja de prometer lo que el 5.2 no hace.
- `docs/ROADMAP.md`: el incremento 5.3 decía que los controles de un widget salen de la pestaña del widget, que es el modelo reemplazado por el menú único. Ahora dice menú de widgets.

### Changed

- `docs/ROADMAP.md`: la barra deja de llamarse panel de pestañas y pasa a llamarse barra de menús permanente, porque el nombre viejo describe una solución que ya no existe y manda a buscar pestañas donde hay menús. La equivalencia con el nombre viejo queda escrita una vez para que las decisiones anteriores sigan siendo rastreables. Es el primer caso concreto de la deuda de nomenclatura parqueada en "Deuda de método y documentación".

## v11.39 — 2026-07-30

### Added

- `docs/DECISIONS.md`: entrada nueva con el presupuesto de superposición. Las notas conservan toda la altura entre la barra y el piano; los widgets flotan encima con las notas pasando por detrás y no tapan más de tres octavos de ese alto, con dos octavos de ancho por widget como máximo y dos octavos de aire lateral. La posición es libre y la cobertura es lo acotado, por un motivo funcional: despejar el registro que una canción usa. Los seis paneles se mueven, los puede mover el usuario o un entrenamiento, y los subtítulos y el feedback quedan centrados por defecto, el feedback debajo.
- `docs/DECISIONS.md`: entrada nueva que reemplaza la pestaña por widget por un único menú de widgets, porque con varias instancias de la misma característica las pestañas se multiplican y porque el estado por defecto abriría la barra con cuatro o cinco pestañas. El menú lista instancias y no tipos, y cada instancia guarda su ubicación, vista, opacidad y opciones, con reset propio.

### Changed

- `docs/ROADMAP.md`: la pregunta abierta de la reserva del fondo queda resuelta. No se reduce la reserva; se acota la cobertura de los widgets, así que la regla 3 del ADR del 2026-07-24 queda en pie y ahora es verificable con un número. Queda escrito que el alto se reserva para un motor que todavía no existe.
- `docs/ROADMAP.md`: la Fase 5 suma el requisito no funcional de legibilidad. La legibilidad manda sobre el tamaño, la agrupación se resuelve por proximidad, alineación y contraste en vez de efectos, y cada elemento tiene que ganarse el espacio que tapa.
- `docs/ROADMAP.md`: se corrige el límite entre los incrementos 5.2 y 5.3. El 5.2 construye la barra con opciones y log, y el hogar de "Centrar en Split"; el menú de widgets, el estado por instancia y el reset por instancia pasan al 5.3, junto con los widgets que ese menú lista. El 5.2 como estaba escrito no era construible: pedía una pestaña por widget cuando todavía no existe ninguno.
- `docs/ROADMAP.md`: nuevo ítem de backlog para comparar el reparto de espacio contra programas que ya muestran notas cayendo, antes de dar por firme el tope de tres octavos.

## v11.38 — 2026-07-30

### Changed

- `docs/ROADMAP.md`: la Fase 10 cierra la pregunta abierta de las calidades de acorde. La rueda las muestra, derivadas del universo activo armando la tríada sobre cada grado con `scalePitches` y las plantillas de intervalos del motor. Se corrige la dependencia declarada, en el Alcance y en la línea "Bloqueada por": no depende de la función tonal de la Fase 4, que devuelve función y no calidad y además exige un acorde detectado; lo que hace falta es una función pura de calidades por grado, y es trabajo de la propia Fase 10. Y se corrige la enumeración: era válida solo para mayor y menor natural; en menor armónica son 2 mayores, 2 menores, 2 disminuidos y 1 aumentado, así que la vista deriva en vez de traer una lista fija. Esto además resuelve la contradicción que había quedado en el Alcance, donde un párrafo dejaba las calidades abiertas y otro las daba por hechas.
- `docs/ROADMAP.md`: el Criterio de aceptación de la Fase 10 pasa de "por definir" a concreto, incluida la comprobación en los tres universos que el motor soporta hoy y que en menor armónica aparezca el grado aumentado.
- `docs/ROADMAP.md`: el ítem del backlog sobre los iconos se reescribe. El problema es la coherencia visual del conjunto, no la nitidez, y queda registrado el hallazgo negativo de que pasarlos a SVG da más carga y no menos, para que nadie repita el intento. La pregunta abierta es cómo lograr coherencia sin sumar costo gráfico.
- `docs/ROADMAP.md`: los ítems de modos griegos y de pentatónicas y blues precisan en qué se diferencian. Los modos son rotaciones de la mayor, con siete notas y las mismas calidades en otros grados, así que la vista de calidades los cubre sin cambios. Las pentatónicas y el blues no tienen siete notas y no producen una escalera de tríadas por grado, así que antes de programarlas hay que decidir qué muestra la rueda en esos universos.
- `docs/ROADMAP.md`: la Fase 5 suma el requisito no funcional del presupuesto visual. El texto es la superficie barata y por eso el feedback y los subtítulos son texto; el coloreo de teclas que ya existe es el techo de gasto en pintado, no un piso.

## v11.37 — 2026-07-30

### Added

- `docs/ROADMAP.md`: la Fase 10 enriquece la especificación de la rueda de quintas. Son tres vistas acopladas, rueda, escala lineal y teclado, moviéndose juntas, donde girar un paso cambia una sola nota; suma el anillo de la menor relativa y los vecinos diatónicos; el cambio es instantáneo; y queda abierto si la rueda reemplaza al selector de escala como interfaz. Desarrolla el patrón de vistas sincronizadas de la regla 5 del ADR del 2026-07-24.
- `docs/ROADMAP.md`: la Fase 5 gana la regla de animación en su Alcance. Sutil y solo para dar feedback, cambios instantáneos, y las teclas del fondo no se mueven. Se escribe ahora porque el incremento 5.3 introduce mover y opacidad.
- `docs/ROADMAP.md`: el incremento 5.2 suma el techo de tres clics para lo que se usa mientras se toca, como número revisable que vuelve verificable la restricción de fricción que ya estaba.
- `docs/ROADMAP.md`: la Fase 8 registra que analizar una línea de acordes ajena es una capacidad distinta de detectar en vivo y del modo canción, y que hoy no tiene fase.
- `docs/ROADMAP.md`: la dirección de entrenamientos como datos suma que un entrenamiento puede empaquetar sus propios archivos MIDI.
- `docs/ROADMAP.md`: cuatro ítems nuevos en el BACKLOG. Menor melódica; calibración de tiempos por tapping, con sus colas de tempos y de valores por canción; reemplazar los emojis por SVG por nitidez y herencia de color; y lectura de partitura, anotada como mención sin compromiso para que sea decisión y no olvido.
- `docs/ROADMAP.md`: el punto del documento de requisitos suma el motivo pedagógico de que el layout se pueda rearmar, que la jerarquía de atención del usuario cambia mientras aprende.

## v11.36 — 2026-07-30

### Added

- `docs/DECISIONS.md`: entrada nueva con la arquitectura destino. El motor queda terminado y estable, y lo único que crece son widgets que lo consumen como API, sin abrir el motor ni rehacer lo visual; los widgets de la primera serie sirven de referencia del patrón; la extensibilidad depende del contrato que la Fase 9 tiene pendiente; los entrenamientos son datos y no una vía para modificar el motor; y la meta lejana es cargar MIDI y entrenamientos propios sin tocar el motor. Estaba solo en conversación y no en ningún archivo.
- `docs/ROADMAP.md`: la Fase 5 gana una pregunta abierta sobre la reserva del fondo para las notas que caen. El límite de tres ranuras se justifica hoy por esa reserva, pero la característica no tiene motor ni fase y el incremento 5.1 dejó esa zona ocupando la mayor parte de la pantalla vacía. Se enuncian tres salidas posibles sin elegir ninguna y se deja dicho que conviene decidirlo antes del incremento 5.3, que es el que implementa el cap.

### Changed

- `docs/ROADMAP.md`: el incremento 5.2 deja escrita la restricción de que los cuatro campos de Ajustes del Motor sigan alcanzables sin fricción si se mudan a un menú, porque el código explica que están visibles a propósito.
- `docs/ROADMAP.md`: el incremento 5.3 deja escrito que el widget de escala absorbe la vista lineal que ya existe y funciona en la barra de universo, en vez de construirla de nuevo.
- `docs/ROADMAP.md`: la Terminología de pantalla suma la distinción entre Do fijo y Do móvil, y aclara que la app usa Do fijo, precisión que se había identificado antes y no estaba escrita.

## v11.35 — 2026-07-30

### Added

- `docs/ROADMAP.md`: sección nueva "Deuda de método y documentación", que parquea seis puntos sobre cómo se documenta y se versiona el proyecto, sin ejecutar ninguno y sin tocar el estándar. Un esquema de versión de cuatro segmentos con dos preguntas abiertas registradas, los PR mixtos y qué cuenta el segundo segmento, más la posibilidad de que ese esquema elimine el desfase entre la versión mostrada y el CHANGELOG. La regla de criticar el diseño de una fase y documentar su impacto sobre lo ya implementado antes de planearla, con la prioridad de evaluar una fase intermedia en vez de colgar lo nuevo al final. Un documento de requisitos, propósito y público objetivo, que hoy no existe en ninguna forma, incluidos los requisitos no funcionales que ya gobiernan el diseño sin estar escritos como tales. La nomenclatura de los artefactos que ya existen en el código, que ningún documento nombra. Y dos sugerencias del revisor externo: que el glosario salga del flujo append-only para no quedar desactualizado, y que el destino visual acordado se describa en texto dentro del repo en vez de vivir solo en bocetos externos.

## v11.34 — 2026-07-26

### Added

- `docs/DECISIONS.md`: entrada nueva que resuelve dónde viven los controles de un widget. Cada widget colocado, del usuario o de un entrenamiento, abre su propia pestaña en la barra tipo macOS, como un navegador; los controles del widget viven en el menú que despliega esa pestaña, y la única acción directa sobre la caja es moverla arrastrando. La barra tiene una pestaña por widget abierto más un menú colocador que lista todos y restaura los cerrados. Los widgets de sistema también abren pestaña. Queda anotada la tensión de que un widget con contenido clickeable a futuro necesitará una zona de agarre para separar mover de tocar.

### Changed

- `docs/ROADMAP.md`: la Fase 5 detalla el modelo de pestañas. El incremento 5.2 deja escrito que cada widget colocado abre su propia pestaña y que los controles del widget viven en el menú de esa pestaña, con un menú colocador aparte que restaura los cerrados. El incremento 5.3 aclara que mover la caja arrastrando es la única acción directa sobre ella, y que opacidad, apagar y reset salen de la pestaña.

## v11.33 — 2026-07-25

### Fixed

- `index.html`: el atributo `hidden` ahora oculta de verdad en toda la app, con un reset `[hidden] { display: none !important; }`. Antes una regla de autor con `display` le ganaba, por eso las acciones de la consola (Copiar, Exportar, Limpiar) se veían aunque su contenedor estuviera `hidden`. Se arregla la raíz, no el síntoma.

### Changed

- `index.html`: el botón "Centrar en Split" se parquea, oculto pero presente en el código, porque todavía no tiene hogar definitivo. Se lo deja en el DOM para no romper el auto-centrado del teclado que corre al cargar. Su lugar planeado es el menú tipo macOS o las opciones del motor del incremento 5.2. El botón "Motor Automático" sigue visible.
- `index.html`: la versión mostrada sube de V11.32 a V11.33.
- `docs/ROADMAP.md`: el incremento 5.2 documenta que además le dará hogar en el menú a los controles parqueados, "Centrar en Split" y el panel "Fijar Acordes" ya oculto, para que el plan quede escrito y no se pierda.

## v11.32 — 2026-07-25

### Changed

- `index.html`: incremento 5.1 de la Fase 5, fondo único. El teclado y la zona reservada de notas pasan a ser una sola capa de fondo fija a viewport completo; los paneles de estado, la barra de universo y los ajustes pasan a overlays en posiciones por defecto fijas encima del fondo, sin mecánica de movimiento todavía. La disposición apilada anterior queda reemplazada por fondo más overlays. `renderKeyboard` y el coloreo de teclas quedan intactos; el motor no cambia.
- `index.html`: la versión mostrada sube de V11.27 a V11.32, cerrando el desfase que los cuatro PR de documentación anteriores habían dejado entre el historial y la pantalla.

### Removed

- `index.html`: se retiran las tres cajas punteadas de ranura (`.slots-row`), que dibujaban la ranura como tres espacios en pantalla. En el modelo vigente la ranura es un límite de cuántos widgets compiten, no un lugar dibujado, así que el dibujo se elimina.

### Docs

- `docs/ROADMAP.md`: la Fase 5 pasa de `pendiente` a `en progreso` al entregarse el incremento 5.1.

## v11.31 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva con tres precisiones del modelo de widgets. Cada widget tiene posición por defecto aunque el cap sea de tres. Un widget de serie, uno futuro y uno de un entrenamiento son la misma categoría; lo que distingue es el contenido y si compite por el cap, no el origen. Y el cap de tres cuenta solo a los que compiten (escala, progresiones, readout); subtítulos, feedback y guía tienen lugar propio, se mueven pero no cuentan. Refina la refinación del modelo del 2026-07-25 sin tocar el motor.

### Changed

- `docs/ROADMAP.md`: la Fase 5 se realinea al modelo de widgets. El coloreo del teclado que ya existe en `renderKeyboard` queda explícito en el Alcance como superficie de feedback de la que dependen los widgets, preservada en la fase, no diferida. Los incrementos de entrega pasan de cuatro a cinco: se agrega el 5.3, sistema de widgets (mover, opacidad, apagar, reset, persistir, cap de ranuras, el readout como primer widget), y nomenclatura y análisis se corren a 5.4 y 5.5. Y el párrafo del readout se corrige: la salida del motor se presenta en un widget de sistema que ocupa ranura y se cierra, no en una superficie permanente sin ranura, alineado con la refinación del 2026-07-25.

## v11.30 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que refina el modelo de capas en cinco puntos. El readout de la salida del motor es un widget de presentación (lee el buffer, no recalcula, así que presentar no es hardcodear): se mueve tipo picture in picture, opacidad, se cierra, y ocupa una ranura contando contra el límite, mientras el dato sigue en el buffer y el log. La ranura es un límite de tres widgets abiertos a la vez, no una grilla de espacios fijos; los overlays se ubican libres como un HUD de simulador y la misma info se puede repetir. El menú (panel de pestañas) coloca, cierra y restaura cualquier widget, y aloja opciones y el log, que solo se descarga o copia, sin terminal. Se nombra "widget de sistema" a los paneles sin contenido intercambiable (guía, subtítulos, feedback, readout). Y el feedback, además del veredicto nota por nota, trae avisos simples del sistema (ranuras completas, restaurar widget oculto). Refina el protocolo, el glosario, el ADR y la refinación del contrato del 2026-07-25, sin reescribirlos ni tocar el motor.
- `docs/ROADMAP.md`: "Direcciones sin fase" suma dos ideas capturadas: widgets como motores adicionales a futuro, y apagar los efectos del fondo (coloreo del teclado y de las notas) dejando el teclado limpio. Cada una con su bloqueo.

## v11.29 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 aclara que el gestor de paneles se parte. El ADR reservaba el gestor completo para la segunda característica; se precisa que mover y persistir la posición de un overlay es de esta fase, sobre los overlays del fondo único, y que lo que espera a la Fase 9 es la competencia por las tres ranuras. Además resuelve el "dónde vive la salida del motor" del incremento 5.1: las tres lecturas, notas activas, acorde y análisis, se consolidan en una sola superficie permanente sobre el fondo, sin ranura ni conmutador, y colorean teclas o escriben feedback como consumidores del buffer, no por ser widget.

### Added

- `docs/ROADMAP.md`: la Fase 9 suma una nota de pregunta abierta, el contrato de salida de una característica, qué puede escribir hacia afuera y si el reporte va en abanico o en cadena, que se decide con la primera característica real y no antes.

## v11.28 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 suma una subsección de incrementos de entrega que corta la fase en cuatro PRs de código ordenados del más estructural al más cosmético: 5.1 fondo único, 5.2 panel de pestañas, 5.3 nomenclatura por forma, 5.4 análisis honesto (función tonal en pantalla más el relabel de "Intercambio Modal", juntos para no dejar un estado contradictorio). No cambia el Objetivo, el Alcance ni la Terminología; solo agrega el orden de entrega. La fase sigue en `pendiente` y pasa a `en progreso` con el 5.1. La versión mostrada sigue en V11.27; el desfase lo cierra el próximo PR de código, el incremento 5.1.

### Added

- `docs/ROADMAP.md`: sección "Direcciones sin fase" que captura tres ideas de dirección para que no se pierdan, sin volverlas fase: entrenamientos como datos y un posible taller, la guía reactiva a lo que está abierto, y el entrenamiento que propone layout. Cada una con su bloqueo anotado.

## v11.27 — 2026-07-25

### Added

- `src/engine.js`: `getTonalFunction(chordObj, universeRoot, universeType)`, función pura que deriva la función tonal por índice de grado (Tónica I/iii/vi, Subdominante ii/IV, Dominante V/vii°), así que V es dominante en cualquier tonalidad mayor. Nada de nombres de nota ni de tono en la lógica. La menor devuelve `por_definir` (la teoría escrita cubre solo la agrupación mayor) y un acorde no diatónico devuelve `no_diatonica`, sin función forzada.
- `tests/fixtures/grados-romanos.json`: casos `function` para cada grado diatónico mayor, una segunda tonalidad (el mismo Sol Mayor es I en Sol y V en Do), un acorde no diatónico y un caso menor. `tests/run.js` suma el tipo `function` y afirma `expected.function` en los casos de acorde. El conteo sube de 30 a 41.
- `tests/fixtures/oda-a-la-alegria.json`: función esperada en los casos de acorde (Sol = dominante, Re7 = no_diatonica).

### Changed

- `index.html`: la función tonal se calcula en el análisis del acorde, se guarda en el buffer (`State.harmony.function`) y se suma a la línea de log MATH ("· función <valor>"). Sin display: no cambia ningún panel; la función queda en el buffer para que la Fase 5 la muestre después. Versión mostrada de V11.24 a V11.27, cerrando el desfase acumulado.
- `docs/ROADMAP.md`: se cierran dos fases con la regla de que el PR de código que completa una fase la cierra. La Fase 4 pasa a `cerrada (2026-07-25)` con nota de cierre (función calculada, bufferada y logueada; display parqueado en la Fase 5). La Fase 3, hecha y validada en su PR pero con el Estado todavía en `pendiente` porque ese PR no tocó el ROADMAP, pasa también a `cerrada (2026-07-25)`.

## v11.26 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 suma terminología de pantalla a su Alcance, correcciones de display, no de motor. Las etiquetas del botón de nomenclatura pasan de "Latina" y "Anglosajona" a "Silábica" (Do-Re-Mi) y "Alfabética" (C-D-E), con valor por defecto, persistencia por `localStorage` y el botón alcanzable en los menús nuevos. La etiqueta "Intercambio Modal", que hoy sale del caso else de `classifyChordRelation` y afirma un análisis que el motor no hizo, se relabela a "no clasificado" o "por definir" hasta que la Fase 11 escriba la teoría. Y la función tonal de la Fase 4 se muestra en el panel de Análisis junto al numeral y la relación, coherente con el relabel honesto. Además el criterio deja de decir "los 18 fixtures" y pasa a "todos los fixtures existentes", que no se pone rancio cuando el conteo sube.

## v11.25 — 2026-07-25

### Added

- `docs/ROADMAP.md`: Fase 11, intercambio modal, después de la Fase 10 y antes del Track paralelo de teoría. Es salida del motor (otra lente, sin panel), el tercer caso después del diatónico (función tonal, Fase 4) y de la dominante secundaria (relación, Fase 3): un acorde que no es ninguno de los dos. Criterio por definir: primero hay que escribir la teoría del intercambio modal en el Track paralelo, sin eso no hay fixture. Bloqueada por las Fases 3 y 4 y por esa teoría, no por la rueda; su número es prioridad, no dependencia. La versión mostrada sigue en V11.24; el desfase lo cierra el próximo PR de código, la Fase 4.

## v11.24 — 2026-07-25

### Added

- `src/engine.js`: `getRomanNumeral(chordObj, universeRoot, universeType)`, función pura que deriva el numeral romano del acorde. El grado sale de ubicar la raíz en la escala activa, la caja de la tercera del acorde, el sufijo de la quinta y el séptimo. Nada hardcodeado, ni notas ni tabla de grados. El objetivo de una dominante secundaria se calcula como cualquier grado y va en mayúscula, sin forzar minúscula.
- `src/engine.js`: `isSecondaryDominantLeadingTone`, que reconoce el tono conductor de una dominante secundaria hacia un grado de tríada mayor, derivado y por tonalidad.
- `tests/fixtures/grados-romanos.json`: casos de numeral en dos tonalidades (I, IV, V mayúscula; ii, iii, vi minúscula; vii disminuido; II7) y del tono conductor generalizado a Sol Mayor, con un contraste que prueba que no se acepta cualquier cromática. `tests/run.js` suma el tipo `roman` y las aserciones de numeral; el conteo sube de 18 a 30 casos.

### Changed

- `src/engine.js`: `evaluateMelodyStatus` acepta como `good` el tono conductor de una dominante secundaria aunque el acorde no suene. Cierra el gap de Oda (Fa# sobre Do Mayor deja de marcar error), sin tocar Re menor (Sol# sigue `bad`, Do# sigue `tension`).
- `index.html`: el panel Análisis de Armonía muestra el numeral, y para la dominante secundaria "II7 (V del V)". `classifyChordRelation` y el veredicto nota por nota ahora emiten al log con `SysLog` (MATH el numeral, la relación y el objetivo; EVAL el veredicto con su porqué), cerrando el hueco que la decisión del log del 2026-07-25 dejó anotado. Versión mostrada de V11.19 a V11.24, cerrando el desfase con el CHANGELOG.

## v11.23 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: tres cambios apoyados en las entradas de `DECISIONS.md` del 2026-07-25. El encabezado suma una convención de log: el criterio de aceptación de toda fase incluye que el motor emita al log, etiquetado, lo que esa fase agrega. La Fase 3 suma un punto de Alcance (que `classifyChordRelation` registre su resultado, cerrando el hueco anotado) y la validación de tres vías en el Criterio. La Fase 5 se reabre: pasa de `cerrada (2026-07-25)` a `pendiente` y se reescribe hacia el modelo de capas del 2026-07-25 (fondo único de teclado y notas, características como widgets, panel de pestañas como chrome permanente, teclado fijo de 88 teclas); la nota de cierre pasa a nota de reapertura. El primer intento apilado quedó en V11.19 y no se borra hasta que la fase corra. La versión mostrada sigue en V11.19; el desfase lo cierra el próximo PR de código, la Fase 3.

## v11.22 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que fija el log como canal canónico de validación. Toda salida del motor emite al log etiquetada cada vez que se calcula, se muestre o no en pantalla, cerrando la asimetría actual (`detectChord` loguea con MATH, `classifyChordRelation` no). Una fase se valida por tres vías a la vez: fixtures verdes, sesión humana en Chrome y el log auditable; cada fase registra lo que agrega (el grado romano de la Fase 3, la función tonal de la Fase 4). Refina el trato que el protocolo del 2026-07-25 le da a la consola de debug y extiende la refinación del contrato del mismo día. Cerrar el hueco de `classifyChordRelation` es código y va con la Fase 3.

## v11.21 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que refina el modelo de UI con cuatro reglas. Fondo único: el teclado más las notas que caen son una sola capa que ocupa todo el ancho y alto, y las notas pasan por detrás de los widgets. Widget: la palabra para lo que el protocolo del 2026-07-25 llamó "característica", un panel en ranura que se mueve, se oculta y se comunica por las superficies compartidas. Panel de pestañas: cuarta categoría, el chrome interactivo permanente donde viven opciones y logs, separado del fondo mudo. Teclado fijo de 88 teclas independiente del controlador MIDI. Refina reglas del ADR del 2026-07-24 y del protocolo, el glosario y la refinación del contrato del 2026-07-25, sin contradecirlos. Deja anotado que la Fase 5, cerrada apilada, queda desalineada con el modelo de capas y habrá que reabrirla desde el ROADMAP.

## v11.20 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 (reencuadre visual al modelo de paneles) pasa de `pendiente` a `cerrada (2026-07-25)`, ya implementada y mergeada en V11.19 con los 18 fixtures en verde y el motor intacto. Se le suma una nota de cierre que deja registrado que la disposición quedó apilada a propósito, no superpuesta: el overlay real de características flotando sobre el fondo llega en la Fase 10, cuando la escala se vuelve un panel con contenido. El apilado es decisión, no deuda olvidada.

## v11.19 — 2026-07-25

### Changed

- `index.html`: reencuadre visual de la Fase 5, sin tocar comportamiento ni motor. El teclado pasa a ser el fondo fijo protagonista, con una zona reservada y vacía arriba para las futuras notas que caen. El resto de la UI pasa a overlay: la barra de universo, los tres paneles de estado (salida del motor, siguen visibles porque el autor los mira mientras toca) y los Ajustes del Motor, ahora rotulados como avanzados pero visibles y alcanzables. Se dibujan tres ranuras de característica reservadas y vacías (Escala, Progresiones, Rueda de quintas), sin gestor de paneles ni mecánica de slots. La consola de logs queda colapsada detrás de un botón; al abrirla suma copiar al portapapeles a la descarga `.txt` que ya existía. El panel "Fijar Acordes" se oculta de la pantalla pero queda intacto en el código, con `UI.lockChord` sin tocar. No se toca `src/engine.js` ni el coloreo de `renderKeyboard`, y los 18 fixtures siguen pasando. Cierra el desfase de versión mostrada: `<title>` y `<h1>` pasan de V11.6 a V11.19.

## v11.18 — 2026-07-25

### Added

- `docs/DECISIONS.md`: entrada nueva que generaliza el contrato de salida del motor. La salida vive en el buffer y cualquier superficie la consume, sea panel o fondo; el teclado ya es una superficie de feedback que es fondo, no panel (`renderKeyboard` pinta `validPitches` y el veredicto por nota sin panel de por medio). Refina la definición de "superficie de feedback" del glosario del 2026-07-25, que queda como caso particular. De ahí cae que la visibilidad de un panel y su efecto son separables. Deja fijado que, si se construye una confirmación previa a una acción, va solo del lado de lo irreversible.

### Changed

- `docs/ROADMAP.md`: la Fase 5 se reescribe como reencuadre visual puro. La escala no se extrae a un panel: se queda coloreando el teclado, que pasa a ser el fondo protagonista, con el resto de la UI en overlay, la consola detrás de un submenú y las ranuras reservadas dibujadas vacías. No toca el motor ni el coloreo de `renderKeyboard`. Se corrigen dos referencias desactualizadas: la Fase 9 ya no llama a la Fase 5 "la escala con rueda" sino "las ranuras reservadas", y la Fase 10 aclara en su Alcance que es ella la que mueve la escala del teclado a un panel y le suma la rueda, y su "Bloqueada por: Fase 5" pasa a citar "la estructura de fondo y ranuras" en vez del panel de escala.

## v11.17 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: la Fase 5 se parte en dos. Ahora la Fase 5 es solo el rediseño visual, la escala como panel de característica sobre el teclado de fondo, en vista lineal, sin rueda ni conmutador (con una sola vista no hay nada que conmutar). Es presentación pura: lee `scalePitches` del motor y no lo toca.

### Added

- `docs/ROADMAP.md`: Fase 10, la rueda de quintas como segunda vista de la escala, con el conmutador que nace ahí. La rueda deriva de `scalePitches`; queda abierto si además muestra las calidades diatónicas, en cuyo caso depende de la función tonal de la Fase 4. Bloqueada por la Fase 5; su número es posterior por secuencia de decisión, no por dependencia con las progresiones.

## v11.16 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: dos correcciones de coherencia, sin cambiar decisiones. La Fase 3 ahora declara "Bloquea: Fase 4", así la dependencia con la Fase 4 (que ya decía "Bloqueada por: Fase 3") queda declarada en los dos sentidos, como el resto del ROADMAP. El encabezado del "Track paralelo de teoría" pasa de "informa las Fases 2 y 3" a "informa las Fases 2, 3 y 4", porque la Función tonal (Fase 4) también sale de ese material.

## v11.15 — 2026-07-25

### Changed

- `docs/ROADMAP.md`: reestructurado con las fases del modelo de paneles, apoyado en las entradas de `DECISIONS.md` del 2026-07-24 (paneles) y 2026-07-25 (protocolo de clasificación y glosario). Fases nuevas: Función tonal (Fase 4, salida del motor al buffer, bloqueada por la Fase 3 de grados romanos), Escala con rueda de quintas (Fase 5, primer incremento del ADR de paneles, estrena el sistema de ranuras, puede ir en paralelo), y dos de progresiones (Fase 8, detección de secuencia como salida del motor; Fase 9, la característica en una ranura). Calidad de vida y Feedback sonoro se corren a Fases 6 y 7. Se sacó "Círculo de quintas" del BACKLOG porque ahora es parte de la Fase 5. El "Track paralelo de teoría" queda como material de apoyo, sin cambios.

## v11.14 — 2026-07-25

### Added

- `docs/DECISIONS.md`: dos entradas nuevas (2026-07-25) que se apoyan en la del 2026-07-24 (arquitectura de UI de paneles sobre un fondo fijo). "Protocolo de clasificación" fija el criterio para clasificar toda parte de la UI en característica, salida del motor, o fondo/chrome, como corolario de la regla "característica es un rol, no una clase". "Glosario del modelo" define en un solo lugar el vocabulario de arquitectura (fondo, panel, ranura, característica, salida del motor, buffer del motor, superficie de feedback); solo arquitectura, sin vocabulario musical.

## v11.13 — 2026-07-23

### Fixed

- `docs/DECISIONS.md`: la plantilla del final abría el ejemplo con `### YYYY-MM-DD` (tres almohadillas), pero el estándar de `CLAUDE.md` y las últimas cinco entradas usan `##`. Corregido a `## YYYY-MM-DD`, para que quien copie el machete no arranque desalineado. La plantilla no es una entrada: append-only protege el registro de decisiones, no el machete del final, así que esto no reescribe historia. Las entradas del 2026-07-03 que usan `###` quedan como están.

## v11.12 — 2026-07-23

### Added

- `docs/DECISIONS.md`: entrada 2026-07-23 que fija la jerarquía de evaluación de una nota de melodía (Fase 2 del roadmap). Cinco pasos, la primera regla que matchea gana: escala activa, acorde activo (incluida la dominante secundaria que completa la Fase 3), sensible en contexto menor, indulto de paso cromático (180 ms), y bad. Documenta qué pasos ya están en el código y cuál falta, más el límite conocido de que el indulto colapsa una tensión corta igual que un error corto.

### Changed

- `docs/ROADMAP.md`: la Fase 2 queda marcada como `cerrada (2026-07-23)` y su criterio de aceptación cita el ADR. Es especificación, no código: la implementación es de la Fase 3.

## v11.11 — 2026-07-23

### Removed

- `CLAUDE.md`, sección "Repos hermanos": borrada, con su política de anclaje. Describir otros repos fue un error: esas descripciones envejecen (la de TL-FCCU afirmó "un solo script bash" después de que ese repo sumara un agente Java, y hubo que corregirla) e insinúan una dependencia entre repos que no existe.

### Added

- `CLAUDE.md`, en "Scope de escritura": regla corta. Este repo no describe otros repos; el nombre de otro solo aparece como procedencia histórica, nunca como información operativa, y ningún documento de acá depende de otro para entenderse.

## v11.10 — 2026-07-23

### Changed

- `CLAUDE.md`, sección "Repos hermanos": corregida la descripción de TL-FCCU. "Un solo script bash (`run.sh`)" era falso; el repo hoy suma un agente Java en `scripts/` (Byte Buddy) que intercepta el HTTP, verificado el 2026-07-23 contra el repo en la sesión. La política de referencias cruzadas ahora exige que una descripción diga qué es el proyecto, no cómo está construido, salvo que su estructura se haya verificado en la sesión.

## v11.9 — 2026-07-23

### Changed

- `CLAUDE.md`, sección "Guion largo": la exención se amplía. La prosa escrita antes de que se adoptara la regla (v11.3) queda como está, igual que los encabezados. En `docs/DECISIONS.md` es obligatorio porque el archivo es append-only: sus guiones largos viejos (entradas del 2026-07-03 y sección Histórico, en prosa corrida y entre paréntesis) son deuda tolerada, no algo a arreglar.

### Added

- `CLAUDE.md`, sección "Repos hermanos": nombra los otros tres repos del autor (TL-FCCU, TdeA-Mimos-Website, TdeA-Mimos-API-REST) con una línea cada uno, y fija la política de referencias cruzadas. Una mención a otro repo se ancla en esa sección, no se borra; la historia no se reescribe para agregar ni sacar anclajes (la mención a TLauncher_FCCU en v11.8 resuelve contra ella).

## v11.8 — 2026-07-23

### Changed

- `docs/ROADMAP.md`: reformateado al molde uniforme por fase, tomado del ROADMAP de TLauncher_FCCU y traducido al español. Cada fase numerada lleva `Estado`, `Objetivo`, `Alcance`, `Criterio de aceptación` y `Bloquea`/`Bloqueada por`, y arriba se declara el vocabulario de estado (`pendiente`, `en progreso`, `cerrada (YYYY-MM-DD)`). Mismo contenido: el "Tarea" de la Fase 1 se separó en `Objetivo` (el para qué) y `Alcance` (el qué se hace), el "Bloquea la Fase 3" pasó a campo, y los criterios que no existían quedaron en "por definir". La nota introductoria, el BACKLOG y el "Track paralelo de teoría" quedan como estaban.

## v11.7 — 2026-07-23

### Changed

- `CLAUDE.md`, sección "CHANGELOG": regla nueva. Un PR doc-only abre su propia sección fechada, con la fecha real del cambio, en vez de plegarse en una versión ya publicada. La última versión del CHANGELOG puede quedar por delante de la versión mostrada; ese desfase es intencional y lo cierra el próximo PR de código. Esta sección estrena la regla: es doc-only, así que la versión mostrada no se bumpea y sigue en V11.6.

## v11.6 — 2026-07-04

Se saltea la v11.5: ese número es el de la versión que se perdió (ver `docs/ARCHITECTURE.md` §0 y `docs/DECISIONS.md`). No se reusa, para no confundir la reconstrucción con la narrativa perdida.

### Changed

- `src/engine.js`, `MathEngine.detectChord`: prueba el pitch class del bajo real (`bassPC`) como raíz candidata antes del orden ascendente. La-Do-Mi-Sol con bajo en La se lee La m7; con bajo en Do, Do6. Cuando el bajo no arma un template, cae al orden ascendente (inversión real). Fase 1 del roadmap; ver `DECISIONS.md` (2026-07-04).
- `CLAUDE.md` (doc): orden de lectura al inicio (`ARCHITECTURE` → `DECISIONS` → `ROADMAP` antes de tocar código, con `DECISIONS` obligatorio en el orden) y excepción por categoría para los `README.md` de subcarpeta, que documentan su propia carpeta y quedan fuera de la regla de los tres docs canónicos.

### Added

- Fixture `tests/fixtures/raiz-ambigua.json`: el mismo conjunto de notas (pitch classes 0, 4, 7, 9) leído según el bajo, más un caso de inversión real que cae al orden ascendente. Las 15 fixtures previas siguen en verde; el runner corre 18 casos.

### Fixed

- `index.html`: el `<title>` y el `<h1>` mostraban `V11.0` con el CHANGELOG en v11.6. Bumpeados a `V11.6` (regla "Versión mostrada" de `CLAUDE.md`). El bump quedó pendiente del PR de código de la Fase 1; este lo cierra. Por tocar `index.html`, el commit es `fix`, no doc-only.
- Documentación sincronizada con el código de la v11.6: `ARCHITECTURE.md` §4 describe el `detectChord` vigente (bajo como raíz, ambigüedad enarmónica como límite, no bug), §6 saca dos gaps ya cerrados (control de versiones y PII), §7 corrige el conteo de `src/engine.js` a 145 líneas; `ROADMAP.md` marca la Fase 1 como cerrada.

## v11.4 — 2026-07-04

### Changed

- `ARCHITECTURE.md` sincronizado con el estado real tras la extracción del motor: §2 suma la columna "Vive en" (`MathEngine` y las reglas puras en `src/engine.js`, el resto en `index.html`); §7 reemplaza "604 líneas" por los dos archivos reales (`index.html` 573 líneas, `src/engine.js` 139); §6 saca el conteo stale de 604.
- `ROADMAP.md`: la Fase 0 queda marcada como cerrada (2026-07-04) y el criterio de éxito refleja que `tests/run.js` corre las fixtures (15 en verde), en vez de "todavía no haya runner".

## v11.3.1 — 2026-07-04

### Fixed

- `CLAUDE.md`, sección "Guion largo": el carácter y los ejemplos de encabezado van en backticks, así son tokens y no prosa. Antes la regla usaba guion largo suelto, lo mismo que prohíbe.
- `CLAUDE.md`, sección "Prosa": la instrucción de instalar el plugin trae los comandos exactos (`/plugin marketplace add realrossmanngroup/no_ai_slop_writing_rules` y `/plugin install no-ai-slop-writing-rules`) y la URL, en vez de un `/plugin` genérico.

## v11.3 — 2026-07-04

### Removed

- Skills vendoreadas `no-ai-slop` y `rossmann-voice` de `.claude/skills/`. El upstream (`realrossmanngroup/no_ai_slop_writing_rules`) no declara licencia y este repo es público; no se redistribuye código de terceros sin su nota de licencia. Quedan como dependencia externa: se instalan con el plugin `no-ai-slop-writing-rules`.

### Added

- Tres reglas en `CLAUDE.md`: "Guion largo" (la única excepción al guion largo es el token de formato de los encabezados de fecha), "Vendoreo de dependencias de terceros" y "Scope de escritura".

### Changed

- `CLAUDE.md`, sección Prosa: la referencia nombra los dos skills (`no-ai-slop-writing-rules:no-ai-slop` y `no-ai-slop-writing-rules:rossmann-voice`) y aclara que no resuelven hasta instalar el plugin, ya que se sacaron del repo.

## v11.2 — 2026-07-04

### Added

- Skills de escritura `no-ai-slop` y `rossmann-voice` en `.claude/skills/`. La referencia del `CLAUDE.md` a `no-ai-slop-writing-rules:no-ai-slop` ahora resuelve en el repo.

### Changed

- `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md`, `CHANGELOG.md`, `tests/README.md` y los comentarios de `src/engine.js` y `tests/run.js` reescritos en la voz Rossmann: sin guion largo en la prosa, sin frases de IA, cada afirmación cerrada sobre un dato concreto. Los hechos técnicos no cambiaron. La historia de `DECISIONS.md` se dejó textual (append-only).

## v11.1 — 2026-07-04

### Added

- `CLAUDE.md`: estándar del proyecto (documentación, CHANGELOG, DECISIONS, fechas ISO, convención de commits, honestidad de estado, flujo por PR).
- `CHANGELOG.md`: este registro.
- `.gitignore` mínimo. No hay build step todavía.
- Fixtures de regresión en `tests/fixtures/` (Bad Apple, Oda a la Alegría, Blues) y runner `tests/run.js` (Node más `assert`, sin framework). Cierran el criterio de la Fase 0: 15 casos, corridos en verde contra el motor real.

### Changed

- Motor de teoría musical extraído a `src/engine.js` como fuente única de verdad. `index.html` lo carga por `<script src>` en vez de reimplementar la lógica inline. El comportamiento no cambió. Ratificado en `DECISIONS.md` (2026-07-04).
