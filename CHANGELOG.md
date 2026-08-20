# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.

## v11.84 — 2026-08-20

### Fixed

- El acorde detectado podía quedarse vigente sin límite. `MIDI.triggerContextTimeout` se llamaba solo al soltar un bajo, así que quien soltaba unos y apretaba otros dejaba el reloj corriendo desde el soltado viejo, y al vencer encontraba bajos apretados y no liberaba nada.
- La retención se re-arma ahora con cualquier movimiento de bajos, apretar o soltar, así que mide el tiempo desde que la mano izquierda se quedó quieta.
- Y libera con menos de tres bajos apretados, no con cero. No es un umbral nuevo: es el mismo mínimo y por el mismo motivo que `Engine.detectChord`, porque con dos notas no hay acorde que sostener.
- Los subtítulos nacen vacíos. El texto de relleno que tenían decía algo que nadie escribía y nadie retiraba, que es la misma falla que un acorde vigente sin bajos que lo sostengan.

### Added

- El registro dice qué re-armó la retención, apretar o soltar, y cuántos bajos quedan. Antes la línea era la misma en los dos casos y no permitía reconstruir el gesto.
- `docs/DECISIONS.md`: la estrategia elegida y cómo se eligió, con el hueco que queda medido; y por qué una superficie sin autor queda vacía.
- `docs/ROADMAP.md`: la estrategia por contenido con su condición de reapertura reproducible, y una señal visual de que las cajas se arrastran.
- `docs/GLOSARIO.md`: retención del contexto y superficie sin autor.
- `docs/EN-DISCUSION.md`: la sexta hipótesis descartada del teclado que no se detecta.

**Las dos mitades del arreglo se necesitan, y la medición lo obliga.** Re-armar sin bajar el umbral no
arregla nada: tres bajos que forman Do mayor, soltarlos, apretar dos nuevos, y el acorde seguía
vigente a los 4800 ms. Bajar el umbral sin re-armar rompería el reacomodo de dedos, porque soltar una
nota de tres arrancaría un reloj que nadie reinicia al volver a apretarla.

**El hueco que queda está medido y no tapado.** Tres o más bajos que no forman ningún acorde conservan
el anterior. Es la condición de reapertura de la estrategia por contenido, escrita como caso
reproducible y no como "más adelante".

**Cómo se eligió, que es método y no anécdota.** Con un boceto, no discutiendo: es una pregunta de
interacción y no de corrección, y el repo ya resolvió así el alto de la tecla blanca y la vista de
fórmula.

**El teclado que no se detecta suma su sexta hipótesis descartada, y es la que cierra el tema del lado
de la app:** el síntoma se reprodujo en un segundo programa, con otro código y otro camino de
arranque. Dos implementaciones independientes con el mismo síntoma no dejan lugar a que la causa esté
en ninguna de las dos.

## v11.83 — 2026-08-20

### Added

- `CLAUDE.md`: la sección "Verbosidad del registro", con dos disparadores mecánicos. Toda función que escriba estado observable deja su línea de `SysLog` en el mismo cuerpo, y una razón que el registro imprime no se recalcula, viene de quien tomó la decisión.
- La regla trae su línea base para que una sesión futura compare en vez de creer: 94 llamadas a `SysLog` con categoría literal, 72 de sistema contra 22 musicales, con el comando que las recuenta.
- `docs/DECISIONS.md`: por qué la verbosidad pasa a ser regla con disparador y no intención, con el caso que la justifica y con la regla de 2026-07-25 que ya la contenía a medias.
- `docs/EN-DISCUSION.md`: la quinta hipótesis descartada del teclado que no se detecta, y el tema del formato del registro con la razón que se calcula dos veces.
- `docs/ROADMAP.md`: dejar el código conforme a la regla, y la razón duplicada del registro como ítem propio con su riesgo declarado.
- `docs/GLOSARIO.md`: estado observable y erosión de la verbosidad.

**La v3.0 ya había probado el reintento de puertos, y no sirvió.** Su registro de arranque trae un
monitor que reconsultaba los dispositivos cada segundo durante cinco, y el teclado tampoco aparecía:
un solo puerto y es el virtual del sistema, idéntico al síntoma de hoy. De ahí salen dos cosas. El
defecto es de arrastre, anterior a este repositorio, así que no es regresión de ningún PR de esta
serie. Y reintentar la enumeración no resuelve nada, que es lo que alguien iba a programar primero.

**Una regla que ya existía a medias.** La entrada del 2026-07-25 "El log como canal de validación"
obliga a registrar toda salida del motor. No alcanzó por dos motivos: cubre lo que el motor devuelve
y no lo que cualquier función cambia, y vive en `DECISIONS.md`, que se lee para entender por qué algo
es como es, no para saber qué hacer al escribir código.

**Este PR escribe la regla y no la implementa.** Lo que falta para que el código la cumpla quedó
medido y anotado en el BACKLOG: `src/armonia.js` con cuatro escrituras a `State` y cero `SysLog`, y
`src/widgets.js` con una y cero. La versión mostrada no se toca, que es lo que corresponde a un PR
doc-only.

## v11.82 — 2026-08-20

### Fixed

- El split se leía dos veces. `MIDI.noteOn` clasificaba una nota comparándola contra el split y `MIDI.noteOff` repetía la comparación al soltar. Si el split se movía con la tecla apretada, la nota entraba por una puerta y salía por la otra, y quedaba encendida para siempre en el conjunto donde entró.
- El bajo fantasma que dejaba ese defecto bloqueaba la liberación del contexto armónico, que exige cero bajos, así que el acorde detectado se quedaba vigente sin límite. Medido contra la v11.81: la nota sobrevivía a la retención entera y no producía ninguna línea de log al soltarse.
- `MIDI.noteOff` lee ahora la clasificación de `State.midi.activeBasses`, que es el registro de la decisión tomada al apretar. El camino del pedal de sustain ya lo hacía bien, comprobado antes de tocarlo: itera los conjuntos en vez de recalcular.

### Added

- El log avisa cuando la clasificación guardada de una nota y la que daría el split de hoy no coinciden. El defecto vivió desde el primer commit porque no dejaba rastro: la nota que fallaba no producía ninguna línea, y una línea que falta no se ve.
- Resumen de puertos MIDI al terminar de enganchar: cuántas entradas se enumeraron, cuáles son dispositivos reales y cuáles puertos virtuales del sistema, con nombre.
- Aviso en el feedback del sistema cuando no hay ningún dispositivo real, cuando el navegador niega el acceso MIDI y cuando no expone Web MIDI. Antes se tocaba y no pasaba nada, sin ninguna pista de por qué.
- El aviso se levanta solo cuando aparece un teclado. `bindDevices` vuelve a correr con cada cambio de estado, así que un teclado enchufado después dejaba en pantalla un texto que ya era falso.
- `docs/DECISIONS.md`: la regla generalizada, y el criterio para distinguir un puerto virtual de un dispositivo con su heurística declarada.
- `docs/EN-DISCUSION.md`: tres temas nuevos. El acorde que no se suelta con bajos apretados, el teclado que no se detecta al arrancar, y el costo de correr en el navegador del usuario.
- `docs/GLOSARIO.md`: bajo fantasma, dispositivo real y puerto virtual del sistema.

**La regla de la entrada nueva ya estaba escrita a medias.** La entrada del 2026-08-11 "Dos requisitos
de cualquier trabajo que mande notas MIDI" dice que un apagado se captura y no se lee después, y la
escribió el mismo error del lado de la salida. No atrapó este caso porque estaba redactada como si
fuera solo de MIDI de salida. La forma general es que nada que decida el destino de un evento se
recalcula después de que el evento ocurrió.

**No se agregó ningún reintento ni reenumeración de puertos.** La causa de que un teclado encendido
antes de abrir la página no se detecte sigue sin resolver, con cuatro hipótesis descartadas y ninguna
confirmada. El aviso dice apagar y encender el teclado porque es lo que el autor comprobó que
funciona.

## v11.81 — 2026-08-19

### Added

- Teclas clicables. Apretar el ratón sobre una tecla enciende la nota y soltarlo la apaga. El clic no llama al motor: llama a `MIDI.entradaSintetica`, que fabrica los tres bytes y los mete por `MIDI.processMsg`, la misma puerta del dispositivo. Así ejercita el split, la acumulación y la retención.
- Interruptor "Teclas clicables" en Opciones, apagado de fábrica y persistido en `midiTrainerCfg`. Arranca apagado porque la capa 0 no lleva controles interactivos: encenderlo hace explícita la excepción en vez de disolver la regla. El log lo anuncia al cargar.
- Captura del puntero sobre la tecla apretada, para que soltar el ratón afuera apague igual. Va en `try`: si la captura falla, la nota suena lo mismo y el log escribe el aviso, en vez de que el manejador aborte y la tecla quede muda.
- `MIDI.bindDevices` abre cada puerto de entrada con `input.open()` y espera la promesa. Antes solo enganchaba `onmidimessage` y dejaba la apertura implícita, que puede fallar con un puerto de una sesión anterior sin cerrar.
- El log escribe el estado y la conexión de cada puerto al arrancar, con su id y su fabricante. Sin esa línea, un puerto que no responde era invisible: el log solo hablaba de puertos cuando ya habían cambiado de estado.
- `docs/DECISIONS.md`: por qué el clic entra por el camino MIDI, por qué va detrás de un interruptor, y por qué una tecla clicada es entrada sustituta y no un control.
- `docs/ROADMAP.md`: notas de auditoría fechadas en las fases 2, 3 y 4, y tres ítems nuevos de backlog.
- `docs/GLOSARIO.md`: el término entrada sustituta.

### Changed

- `docs/EN-DISCUSION.md`: salen sus tres primeros temas, que es el primer ejercicio de la regla de salida. Quedan dos, y a uno se le actualizó el campo de qué falta decidir, porque la auditoría que esperaba ya corrió.
- `docs/ARCHITECTURE.md`: el diagrama del §3 arranca en `processMsg` y nombra las dos entradas; la tabla de módulos y el conteo del §7 se ponen al día.

### Fixed

- Nada. Este PR no corrige ningún defecto: la auditoría produjo una lista y no correcciones, que es lo que se le pidió.

**La auditoría de las fases 2, 3 y 4 no confirma la sospecha del autor.** Ninguna regla de teoría se
perdió ni cambió en el rediseño visual de la Fase 5. Los cinco pasos de la jerarquía de la Fase 2
siguen implementados en orden; el `II7 (V del V)` de la Fase 3 sigue apareciendo en el panel; y la
función tonal de la Fase 4 se calcula, se bufferea, se loguea y ahora además se muestra.

Lo que sí encontró son tres defectos de pintado, y `git log -S` los rastrea a todos hasta el primer
commit del repositorio, el del 2026-07-04, o sea que son anteriores a la Fase 2. Dos ya estaban en el
BACKLOG desde el 2026-08-11 y no se duplicaron. El tercero es nuevo y hay que decirlo entero: la
liberación del contexto también borra los veredictos de melodía vivos, y ese camino no era alcanzable
hasta que la v11.79 arregló el acorde pegado. El arreglo no causó el síntoma que el autor reportó,
que se reproduce igual sin él, pero le abrió una segunda situación en la que dispara.

**El síntoma del símbolo que dura un instante no lo explica el acorde fantasma.** La hipótesis era
que las notas de un acorde pegado se pintaban con el color de acorde en vez del de error. No puede
pasar: `MIDI.noteOn` manda las notas por debajo del split a `activeBasses` y las de arriba a
`activeMelodies`, y solo las de arriba reciben evaluación, así que las teclas que `renderKeyboard`
pinta con `color-chord` y las que pinta con un veredicto son conjuntos que nunca se cruzan, con
cualquier valor de split. La causa medida es otra: `Armonia.clearEvaluations`.

**La hipótesis del puerto sigue sin comprobar y necesita el teclado físico.** Chromium sin cabeza
niega el acceso MIDI entero, así que `bindDevices` nunca corre ahí. Lo que sí se comprobó con dos
puertos simulados es que el código nuevo corre y escribe sus líneas, incluida la del error cuando la
apertura se rechaza.

## v11.80 — 2026-08-19

### Added

- `docs/EN-DISCUSION.md`: archivo nuevo, quinto canónico. Guarda lo que se está discutiendo y todavía no es ni una decisión ni un ítem parqueado, que era el único estado del trabajo que el repo no sabía representar.
- `docs/EN-DISCUSION.md`: sus tres reglas. Una entrada trae cuatro campos fijos y no es una transcripción; un tema sale decidido o parqueado, sin tercera forma; y cinco PR sin moverse lo mandan al BACKLOG solo.
- `docs/DECISIONS.md`: la razón del archivo, con el reparto del poblado inicial. De once temas, cinco entraron, tres fueron al BACKLOG, uno al versionado y dos ya estaban parqueados.
- `docs/DECISIONS.md`: dos correcciones de método. Se descarta una idea si la complejidad supera el beneficio medible, no si suena riesgosa; y una instrucción de comprobación trae sus condiciones.
- `docs/ROADMAP.md`: tres ítems de backlog sobre sonido y tiempos, y una tercera pregunta abierta en el esquema de versión, cómo se versiona un PR que no pertenece a ninguna fase.
- `CLAUDE.md`: el orden de lectura pasa a cuatro archivos y la lista de canónicos a cinco. Las dos correcciones de método quedan en forma operativa, una en "Promesas y umbrales" y otra en "Honestidad de estado".
- `docs/GLOSARIO.md`: el término tema en discusión, con su salida y su contención.

El número cinco de la contención sale de medir el ritmo real con `git log --merges`: el día más cargado mergeó 13 PR y el más flojo 1, así que cinco abarca desde media jornada activa hasta una semana floja.

Dos temas del documento de trabajo ya estaban en el BACKLOG desde el 2026-08-11 y no se duplicaron: el símbolo del veredicto que desaparece antes de tiempo, que quedó anotado con su medición, y cubrir el manejo de eventos con pruebas.

La versión mostrada sigue en V11.79.

## v11.79 — 2026-08-11

### Fixed

- `src/midi.js`: el acorde detectado nunca se liberaba. `triggerContextTimeout` vivía dentro de la rama que solo corre cuando la nota soltada tiene evaluación, y los bajos nunca crean una, así que la rama que limpia el acorde era inalcanzable para las notas que lo crean.
- `src/midi.js`: el retiro de la nota de su conjunto sale del `if (ev)` y pasa a correr siempre. El indulto por paso cromático se queda adentro, que es lo único que de verdad depende de que haya evaluación.

### Added

- `src/midi.js`: `triggerContextTimeout` registra cuándo arma la retención, con cuántos bajos quedan, y qué pasa al vencer: si libera el contexto, si el acorde está fijado a mano o si todavía hay bajos apretados.
- `docs/DECISIONS.md`: por qué el manejo de eventos no se cubre con fixtures todavía, y cómo se verifica el arreglo mientras tanto.
- `docs/ROADMAP.md`: tres ítems de backlog. Cubrir el manejo de eventos con pruebas, y los dos defectos que el autor reportó, medidos y confirmados como distintos de este.

El defecto está desde el primer commit del repositorio, con la misma forma. Sobrevivió 39 días y 81 pull requests porque hay que soltar todo y esperar dos segundos mirando la pantalla, y porque las 41 fixtures prueban `src/engine.js`, que no tiene la culpa.

Contaminaba todo lo que venía después: con un acorde pegado, una nota fuera del universo se evalúa como correcta si pertenece a ese acorde.

Los dos síntomas que el autor reportó aparte se reprodujeron idénticos antes y después del arreglo, así que este defecto no los causaba. Quedan anotados con su medición y sin resolver.

## v11.78 — 2026-08-11

### Added

- `src/sonido.js`: el objeto `Sonido` con los tres sonidos de veredicto, generados con osciladores al vuelo. Sin archivos, sin dependencias y sin MIDI. Son 47 líneas, la tabla incluida.
- `src/sonido.js`: los tres salen de una tabla y no están escritos a mano en tres lugares, así que agregar una variante cuesta una fila. Elegir entre variantes sigue siendo backlog y no se implementa.
- `index.html` y `src/arranque.js`: interruptor de feedback sonoro en el menú de Opciones. Arranca apagado y persiste con el resto de la configuración.
- `src/midi.js`: el sonido se dispara en `evaluateMelody`, al apretar la tecla. El paso cromático no suena, porque solo existe al soltar.
- `docs/DECISIONS.md`: cuándo suena el feedback respecto del indulto, por qué arranca apagado, y el falso positivo declarado del error corto.

### Changed

- `docs/ARCHITECTURE.md`: `Sonido` entra en la tabla de responsabilidades, el flujo de evento MIDI muestra dónde se dispara, y `State.config` deja de estar desactualizado.

El contexto de audio se crea y se reanuda con el primer clic o la primera tecla, no al cargar: creado al cargar queda suspendido y el primer veredicto no sale sin que nadie entienda por qué.

Medido con `OfflineAudioContext`: los picos de los tres son 0.117, 0.115 y 0.095, y cuatro sonidos a la vez dan 0.401, debajo de 1.0, así que no saturan.

La Fase 7 queda `pendiente` a propósito. El primer punto de su Criterio pide comprobar de oído con el piano físico y eso no se puede hacer sin el instrumento.

## v11.77 — 2026-08-11

### Added

- `docs/DECISIONS.md`: el SoundFont no falla por memoria, falla antes. `decodeAudioData` devolvió `EncodingError` sobre un `.sf2` de 21.5 MB, porque un SoundFont es un contenedor con muestras y mapeos, no un archivo de audio.
- `docs/DECISIONS.md`: la salida MIDI lo reemplaza. `src/midi.js` recorre `access.inputs` y nunca toca `access.outputs`; tres destinos distintos recibieron notas en la corrida, dos hacia un sintetizador de software y uno hacia el teclado.
- `docs/DECISIONS.md`: la app no elige el sonido. Program Change es una petición sin confirmación y el canal de percusión es una convención, así que qué suena es responsabilidad de quien configuró el destino.
- `docs/DECISIONS.md`: dos requisitos de cualquier trabajo que mande notas, con el síntoma que los produjo. El apagado se captura al encender, y el pánico va a los dieciséis canales.
- `docs/DECISIONS.md`: feedback de veredicto y música son dos cosas. La Fase 7 entrega lo primero con osciladores; lo segundo sale por MIDI y es del widget de acompañamiento.
- `docs/ROADMAP.md`: tres ítems de backlog, salida MIDI configurable, Program Change como petición declarada y cargar un SoundFont, este último anotado con lo medido y sin promesa.
- `docs/GLOSARIO.md`: tres términos, feedback de veredicto sonoro, música y pánico.

### Changed

- `docs/ROADMAP.md`: la Fase 7 dice qué no es y gana su Criterio de aceptación, que decía "por definir". El Alcance no cambia: tres sonidos con osciladores siguen siendo viables tal como estaban escritos.
- `docs/ROADMAP.md`: el widget de acompañamiento deja de estar bloqueado por la Fase 7, que era falso. Lo bloquean la salida MIDI configurable y el metrónomo.

Todo lo que este PR afirma sobre sonido sale de dos diagnósticos corridos desde `file://` en Chromium 149, con teclado conectado y sintetizador andando. Ninguna corrida la hice yo.

La versión mostrada sigue en V11.76.

## v11.76 — 2026-08-11

### Added

- `src/state.js`: el universo persiste en `midiTrainerUniverse`, con la tónica y el tipo nada más. `validPitches` es un `Set` y `JSON.stringify` lo serializa como `{}`, así que guardar la rama entera dejaba un universo sin alturas al recargar.
- `src/state.js`: `loadUniverse` descarta el guardado entero y avisa si el tipo no está en `SCALES` o si la tónica no es un entero de 0 a 11. Es el criterio que `loadLayout` ya usaba contra el cap, no un sistema de migración.
- `index.html` y `src/arranque.js`: botón de reset a valores de fábrica. Vive dentro del desplegable de la consola y pide confirmación, porque borra trabajo del usuario y no puede rozarse mientras se toca.
- `index.html` y `src/estilos.css`: el panel de logs crece y vuelve, entre 250 y 560 px de lienzo. Sin transición y sin arrastre: redimensionar con el puntero es otro ítem, parqueado.
- `docs/DECISIONS.md`: el estado derivado no se persiste, se reconstruye. Vale para los nueve ítems parqueados que van a pedir persistencia, no solo para el universo.
- `docs/DECISIONS.md`: el reset a fábrica borra las dos claves de configuración y deja la disposición intacta, que ya tiene su propio reset en el menú de Widgets.

### Removed

- `index.html`: se retira el panel "Fijar Acordes" con sus tres botones. Estaba desde el primer commit del repositorio y oculto desde el incremento 5.6.

### Fixed

- `src/estilos.css`: `.logs-wrapper` gana `flex-shrink: 0`. El menú es un contenedor flex en columna con techo, así que el panel se encogía por debajo del alto que declaraba: medía 222 px con 250 escritos.

`Armonia.lockChord` queda sin llamadores y anotada. Es el caso más simple del widget de acompañamiento y borrarla obligaría a reescribirla igual. Mientras nadie la llame, `State.harmony.isLocked` no puede volverse verdadero.

La Fase 6 queda `cerrada (2026-08-11)` con sus cuatro puntos entregados. Su Criterio de aceptación decía "por definir" y se escribió en este PR, en términos que se corren.

## v11.75 — 2026-08-11

### Fixed

- `docs/DECISIONS.md`: entrada que supera a la de hoy que ponía el lock de acorde en una vista del widget de escala. Ese widget escribe `State.universe` y el lock escribe `State.harmony`: dos ramas distintas con autores distintos, agrupadas bajo la palabra "contexto".
- `docs/DECISIONS.md`: la generalización que evita repetirlo. El permiso de un widget sale de qué produce, no de qué escritura le queda cómoda. Con el criterio contrario, un solo widget terminaría absorbiéndolas todas.
- `docs/ROADMAP.md`: el punto de "Fijar Acordes" de la Fase 6 deja de decir dónde vive el lock. El panel se retira igual; dónde vive lo decide el widget cuando exista.

### Changed

- `docs/ROADMAP.md`: el ítem del widget de acordes se rehace con el propósito adelante, liberar la mano izquierda para concentrarse en la melodía, y las capacidades como lista abierta sin decidir.
- `docs/ROADMAP.md`: ese ítem declara sus dos bloqueos, la Fase 7 por el sonido y el metrónomo por el tempo, con el matiz de que un acorde fijo sin ritmo no necesita sonido y ya cumple el propósito.
- `docs/ROADMAP.md`: el metrónomo deja de ser una idea suelta y pasa a ser dependencia declarada del widget de acompañamiento.
- `docs/GLOSARIO.md`: el término lock de acorde, que hasta hoy nombraba un botón y ahora nombra el caso más simple de una función.

El panel "Fijar Acordes" está en el primer commit del repositorio, con sus dos acordes escritos a mano. Es herencia de la v11.0 y ningún documento dice para qué se construyó, así que no hay propósito que recuperar.

De ahí sale un criterio que queda escrito: un control heredado sin propósito declarado se evalúa por lo que hace hoy, no por lo que alguien quiso alguna vez.

## v11.74 — 2026-08-11

### Added

- `docs/DECISIONS.md`: una vista es cómo se mira, un widget es quién tiene el permiso. Un widget puede tener varias vistas, y el permiso es del widget, porque si fuera de la vista dejaría de poder saberse qué toca una caja mirándola.
- `docs/DECISIONS.md`: el cap de tres gana su razón pedagógica, que el usuario elija qué le conviene mirar en la fase de aprendizaje en la que está. De ahí sale que un widget nuevo no sube el cap, lo disputa.
- `docs/DECISIONS.md`: el motor consume datos y no ejecuta lógica que no esté en `src/engine.js` y cubierta por las fixtures. Si algo externo sustituyera el cálculo, las 41 fixtures dejarían de significar algo.
- `docs/DECISIONS.md`: el lock de acorde va en otra vista del widget de escala, con condición de salida escrita. Resuelve el conflicto entre el Alcance de la Fase 6 y un ítem del BACKLOG, que se contradecían sin citarse.
- `docs/GLOSARIO.md`: el término vista, más widget y cap refinados con lo que ganaron.
- `docs/ROADMAP.md`: ítem de backlog que pide una regla de persistencia, con el inventario de los nueve ítems parqueados que la van a necesitar.

### Changed

- `docs/ROADMAP.md`: el punto de "Fijar Acordes" de la Fase 6 pasa de mejorar el panel a retirarlo. Mejorarlo era construir botones dinámicos adentro de algo que otro ítem quiere disolver.
- `docs/ROADMAP.md`: el ítem del widget de acordes se reapunta a una vista del widget de escala, y el Objetivo de la Fase 10 dice que la rueda es vista y no widget aparte.

Dos afirmaciones del pedido no resolvieron contra el repo. El cap sí tenía razón escrita desde el 2026-07-25, la espacial, así que la de hoy se suma en vez de llenar un vacío. Y abrir el mismo widget dos veces no está soportado: `CAJAS` es un registro fijo de siete entradas atadas al markup.

## v11.73 — 2026-08-11

### Added

- `docs/ROADMAP.md`: los 24 ítems que tenían fecha y ninguna explicación quedan clasificados en tres categorías distinguibles. Trece con cita a su fuente, cuatro con hipótesis y su base a la vista, y siete con el vacío declarado.
- `docs/DECISIONS.md`: una inferencia se marca como inferencia y con su base a la vista, nunca como hecho. Ante la duda entre inferir y declarar el vacío, se declara el vacío.
- `CLAUDE.md`: la regla en su forma operativa, dentro de "Honestidad de estado", con los tres marcadores que el ROADMAP usa.

Dos ítems pasaron de inferidos a sin origen al aplicar el criterio, la calibración por tapping y el split como rango. Los dos tienen una explicación cómoda a mano que no sale del PR que los trajo, así que sería invención con forma de deducción.

Un ítem anotado por un PR sin relación temática no es lo mismo que un ítem sin explicación. El metrónomo entró con el PR del estándar espacial y su CHANGELOG escribió la razón completa igual.

Con esto los 44 ítems parqueados quedan con fecha, PR de entrada y una respuesta sobre su origen, sea una cita, una hipótesis marcada o un vacío declarado.

## v11.72 — 2026-08-11

### Added

- `docs/ROADMAP.md`: los 44 ítems del BACKLOG y de "Direcciones sin fase" quedan fechados, con el PR que los trajo y con qué otros ítems entraron. El dato sale de `git log -S` sobre el archivo, así que cualquiera lo reproduce.
- `docs/DECISIONS.md`: un ítem parqueado nace con su fecha y el PR que lo trajo. Con la advertencia de que `-S` encuentra cuándo apareció una cadena, no cuándo apareció una idea.
- `CLAUDE.md`: la regla operativa en la sección "Fechas". Un ítem nuevo se escribe con su línea de entrada, para que este trabajo no haya que repetirlo.

Antes: 22 de 44 ítems sin ninguna referencia a su origen. Después: 0 sin fecha de entrada. Los 22 que ya tenían procedencia del PR anterior la conservan y ganan la fecha.

Cinco ítems se rastrean al primer commit que toca el archivo, así que están desde que el ROADMAP existe y `git log` no puede ir más atrás. Dos habían sido reescritos, y su línea dice las dos fechas.

## v11.71 — 2026-08-11

### Added

- `docs/ROADMAP.md`: procedencia escrita para 20 de los 38 ítems del BACKLOG. Cada uno dice ahora qué evidencia lo produjo, no solo qué se quiere hacer y qué lo bloquea.
- `docs/ROADMAP.md`: los primeros cuatro ítems de "Direcciones sin fase" quedan declarados como caras del mismo sistema de entrenamientos. Decidir cualquiera por separado es decidir sobre los otros tres sin decirlo.
- `docs/DECISIONS.md`: un apunte que describe algo ya implementado, o algo que ya es una fase declarada, no es una dirección pendiente. Con el criterio de adónde va cada caso.
- `docs/GLOSARIO.md`: el término dominante secundaria, traído desde el Track paralelo de teoría.

### Removed

- `docs/ROADMAP.md`: los tres apuntes didácticos del Track paralelo de teoría. Función tonal se retira por duplicado del glosario, dominante secundaria pasa al glosario, y círculo de quintas se retira porque describe el trabajo de la Fase 10. La sección sigue viva: la Fase 11 tiene teoría asignada ahí.

### Fixed

- `docs/ROADMAP.md`: dos ítems declaraban un bloqueo vencido. El del coloreo por dueño decía que la Fase 5 preserva `renderKeyboard` intacto y el del split como rango decía que quedaba fuera del alcance de esa fase; la Fase 5 cerró el 2026-08-11.
- `docs/ROADMAP.md`: el ítem de reabrir una fase cerrada decía que la Fase 5 creció a cinco incrementos. Fueron seis.
- `docs/ROADMAP.md`: el Alcance de la Fase 4 apuntaba al Track paralelo de teoría por el material de la función tonal. Ese apunte se retiró, así que ahora apunta al glosario.

Seis ítems quedan acotados por trabajo posterior a su escritura, con qué los acotó: la regla de iconos, el destino del log, el protocolo de umbral, el criterio de entrada a fase en curso, el contrato de permisos y los tres casos reales de fase partida.

La versión mostrada sigue en V11.70.

## v11.70 — 2026-08-11

### Changed

- `src/teclado.js`: el ancho de la blanca y el del teclado salen de `LIENZO_ANCHO` y ya no de medir el contenedor. Daba el mismo número, pero un relleno o un borde lateral en ese contenedor lo habría cambiado en silencio.
- `src/estilos.css`: se borra la regla `.container` entera, con su tope de 1600 px de la era anterior al lienzo. Adentro de 1280 px fijos ese tope no puede activarse nunca, y el flex, el gap y el centrado no tenían efecto.
- `src/estilos.css` e `index.html`: tres comentarios decían que el fondo es una capa fija que toma el viewport entero. Toma el lienzo desde el incremento 5.6, porque su bloque contenedor es el cascarón transformado.
- `src/estilos.css`: `.status-value` pierde su `font-size`. Las cuatro lecturas viven dentro del widget y `.widget .status-value` lo pisaba siempre por especificidad, así que el 1.6em no se aplicaba nunca.
- `docs/ARCHITECTURE.md`: los §1, §2 y §3 seguían diciendo que `UI` construye el teclado y que todo vive en `index.html`. Las dos cosas dejaron de ser ciertas con la partición.

### Added

- `docs/DECISIONS.md`: la tercera pieza de la Fase 5B era chica y se dice, en vez de inventarle volumen para que el trabajo se pareciera a su descripción. La migración la había hecho el cascarón.

La Fase 5B queda `cerrada (2026-08-11)`. Sus tres trabajos: el contrato de permisos con la v11.66, la partición con la v11.67 y la v11.69, y los restos del lienzo con esta.

Medido antes de tocar nada: queda una sola lectura de la ventana en toda la app, la del cálculo de la escala; una sola unidad de viewport en el CSS, la altura del `body`; y las dos apariciones de `getBoundingClientRect` son comentarios que explican por qué no se usa.

## v11.69 — 2026-08-11

### Changed

- `src/`: `UI` deja de existir. Sus siete métodos se reparten en `Escala`, `Teclado`, `Readout` y `Armonia`, uno por nivel de permiso, cada uno en su archivo. "UI" nombraba una capa del programa, no un nivel.
- `src/`: los llamadores quedan diciendo qué produce el efecto. Donde había `UI.renderKeyboard()` hay `Teclado.renderKeyboard()`, y el nombre del objeto agrega lo que el del método no decía.
- `src/layout.js`: `saveLayout` y `loadLayout` vuelven desde `cajas.js`. `src/state.js`: `saveConfig` y `loadConfig` llegan desde el difunto `ui.js`. La persistencia vive con lo que persiste.
- `src/estilos.css` y `index.html`: las cuatro lecturas del readout comparten tamaño, peso y color primario. Sale el `#facc15` de la regla base y sale el `font-size` en línea que llevaba una sola de las cuatro.
- `src/midi.js`: el log de puertos escribe tipo e identificador además del nombre. Tres líneas con el mismo nombre ya se pueden distinguir de un evento registrado tres veces.

### Fixed

- `src/readout.js`: al soltar el acorde, las dos lecturas que reciben color desde JavaScript se quedaban en secundario, así que el mismo guion se veía de dos colores según lo que hubiera sonado antes. Vuelven al primario.

### Added

- `docs/DECISIONS.md`: el reparto por permiso, por qué `UI` se disuelve en vez de sobrevivir, y la decisión sobre las fixtures de geometría, que es que no, con la condición que la reabre.
- `docs/ROADMAP.md`: ítem de backlog por dos comentarios de `src/engine.js` que citan métodos de un objeto que ya no existe.

Las fixtures de geometría se decidieron que no. La justificación que el ROADMAP les daba, que la geometría es aritmética pura sin DOM, se verificó y es falsa: las cinco funciones leen el documento.

`index.html` queda en 246 líneas, 212 de código y markup. El archivo más grande es `src/layout.js` con 304.

## v11.68 — 2026-08-11

### Added

- `docs/DECISIONS.md`: el coloreo se registra de forma diferencial. Una línea cuando una tecla cambia de categoría, con la tecla, la que sale, la que entra y qué rama de la cascada ganó. Un repintado que no cambia nada no escribe nada.
- `docs/ROADMAP.md`: tres ítems de backlog con orden declarado entre ellos. Agrupar y filtrar el log va primero porque es la condición para que los otros dos sean usables.
- `docs/ROADMAP.md`: dos puntos de deuda verificada dentro de la segunda parte de la partición. Las cuatro lecturas del readout no comparten tratamiento visual, y el log de puertos MIDI no distingue tres puertos de un evento repetido.
- `docs/GLOSARIO.md`: el término registro diferencial, marcado como todavía no construido.

### Changed

- `docs/ROADMAP.md`: la verificación con el piano físico que la Fase 5B pide queda cerrada para la primera parte. El corte puro la había declarado pendiente porque corrió headless, y ahí no hay Web MIDI.
- `docs/ROADMAP.md`: el ítem del log filtrable pasa a hablar de grupos y no de categorías sueltas, con la cuenta recontada sobre `src/`. Las seis categorías ya se agrupan solas: 51 llamadas de sistema contra 9 musicales.
- `docs/ROADMAP.md`: el comando que contaba las categorías apuntaba a `index.html` y ahí ya no hay script. La partición lo dejó devolviendo cero.

Ninguno de estos ítems entra a la Fase 5B: por el criterio del 2026-08-10, dejarlos afuera no impide ejecutar la segunda parte de la partición ni obliga a rehacer la primera. Los dos de deuda sí van adentro, porque son código que esa segunda parte toca igual.

La versión mostrada sigue en V11.67.

## v11.67 — 2026-08-11

### Changed

- `index.html`: queda como markup. Pasa de 1524 líneas a 242, de las cuales 208 son código y markup. Los estilos salen a `src/estilos.css` y el script se reparte en diez archivos bajo `src/`, cargados como scripts clásicos en el orden del original.
- `index.html`: el orden de carga va explicado en un comentario. Solo `arranque.js` ejecuta algo, así que el orden de los otros nueve no cambia el comportamiento y está elegido para leerse de arriba abajo.
- `src/`: diez archivos nuevos, uno por bloque. Cada uno toma el nombre de lo que define, así el nombre no es una categoría inventada que haya que mantener sincronizada con el código.
- `docs/ARCHITECTURE.md`: el §7 pasa de describir dos archivos a describir doce, y el conteo del umbral se vuelve a correr. El archivo más grande que salió es `src/layout.js` con 283 líneas.

### Added

- `docs/DECISIONS.md`: por qué la partición va en dos PR. Un corte puro se puede probar concatenando los archivos y comparando contra el original; en cuanto se mueve un método esa propiedad se pierde.
- `docs/DECISIONS.md`: los dos datos que hacen segura esta partición. Hay una sola sentencia ejecutable de primer nivel, y en scripts clásicos un `const` de primer nivel va al ámbito léxico global compartido.
- `docs/ROADMAP.md`: la primera parte de la partición queda marcada como entregada, y la segunda con lo que arrastra. El criterio atraviesa `UI` por la mitad y hay que decidir las fixtures de geometría.
- `docs/GLOSARIO.md`: el término corte puro, con la prueba que lo define.

El `diff` de la prueba de corte puro dio diez líneas de diferencia sobre 1025, una por archivo, y las diez son el comentario de encabezado. El `diff` del CSS dio cero.

`saveLayout` y `loadLayout` quedaron en `cajas.js` y su lugar es `layout.js`. En el original viven entre el registro de cajas y el cascarón del lienzo, y un corte contiguo no puede moverlas. Lo acomoda el PR siguiente.

## v11.66 — 2026-08-11

### Added

- `docs/DECISIONS.md`: el contrato de permisos, primer trabajo de la Fase 5B. Tres niveles: el sistema posee los valores, un widget con permiso de escritura los cambia, y uno de solo lectura lee y presenta. Hoy el único con escritura es el widget de escala, sobre el universo.
- `docs/DECISIONS.md`: por qué eso no contradice que los widgets no se hablen entre sí. El de escala afecta lo que el de salida del motor muestra y nunca lo llama: escribe en el sistema y el otro lee del sistema.
- `docs/DECISIONS.md`: los dos efectos sobre las teclas con su dueño, veredicto y etiqueta, más el marcador del split anotado como hueco sin dueño de widget. El color y el símbolo son una sola señal, definida en la misma regla de CSS.
- `docs/DECISIONS.md`: compartir un efecto se permite solo con precedencia escrita. La cascada de cuatro ramas de `UI.renderKeyboard`, acorde, veredicto, nota activa y escala, queda como la primera precedencia escrita del repo.
- `docs/DECISIONS.md`: el criterio de corte de la partición. Se corta donde cambia el permiso, y con eso el objeto de layout es sistema, porque ningún widget tiene permiso sobre abrir, cerrar, mover, persistir ni medir.
- `docs/ROADMAP.md`: tres ítems de backlog. Log filtrable por categoría, la guía compuesta por secciones que aporta cada widget, y el feedback leyendo del log en vez de escribirle.
- `docs/GLOSARIO.md`: seis términos con su sección, valor del sistema, permiso de escritura, widget de solo lectura, efecto veredicto, efecto etiqueta y precedencia de efecto.

### Changed

- `docs/DECISIONS.md`: se acota la regla de autoría del 2026-08-10, que hoy está incumplida. Habla de widgets, no del código interno del sistema: dos partes del sistema pueden escribir la misma rama del estado porque el sistema es un solo autor con varias manos.
- `docs/ROADMAP.md`: el primer trabajo de la Fase 5B queda marcado como entregado, con puntero a las dos entradas. Lo de los entrenamientos queda diferido con su disparador, que es que exista el primero.
- `docs/ROADMAP.md`: dos decisiones de la partición escritas y no ejecutadas. El CSS sale a su propio archivo, 270 líneas; el markup no puede salir, porque sin ES Modules y sin build no hay forma de incluir un fragmento de HTML desde otro archivo.
- `docs/ROADMAP.md`: el ítem de que la leyenda se filtre sola queda absorbido por el de la guía compuesta por secciones, que pide lo mismo y más. La referencia cruzada del ítem que lo citaba se reapunta.

Medido al escribir el contrato: el universo no persiste. `saveConfig` guarda solo `State.config`, así que cada recarga vuelve a Do mayor. Si debería persistir no se decide acá.

La versión mostrada sigue en V11.63; el desfase lo cierra el próximo PR de código.

## v11.65 — 2026-08-11

### Fixed

- `docs/ARCHITECTURE.md`: el §7 recetaba `<script type="module">` como salida del umbral de las 1000 líneas. Los scripts de tipo módulo se piden con CORS y desde `file://` el origen es `null`, así que no cargan. La receta estuvo escrita treinta y nueve días sin correrse.
- `docs/ARCHITECTURE.md`: el umbral deja de recetar un mecanismo y pasa a obligar a abrir una decisión. Una alarma escrita meses antes no puede prometer un remedio que nadie probó.
- `docs/ARCHITECTURE.md`: se retira el segundo gatillo del §7, "o el estado se vuelve difícil de razonar". No tiene medida, y no se le inventa una sobre código que todavía no existe.
- `docs/ARCHITECTURE.md`: el conteo del umbral pasa a ser por archivo, sin comentarios ni líneas vacías, con los tres comandos que lo recalculan. Medido el 2026-08-11: 1524 líneas totales, 126 vacías, 227 de comentario, 1171 de código y markup.
- `docs/DECISIONS.md`: entrada con la corrida del CORS pegada. La respuesta correcta ya vivía en la entrada del 2026-07-03 desde el mismo día; lo que falló fue que se propagó la versión escrita en el archivo con más autoridad aparente.

### Changed

- `docs/ROADMAP.md`: la Fase 5B se rejustifica. Deja de existir por el conteo de líneas y pasa a existir por el contrato de widgets y entrenamientos, que va primero porque cómo se parte el archivo depende de qué tiene que hacer cada pieza.
- `docs/ROADMAP.md`: la fase queda con tres trabajos en orden, contrato, partición y la segunda pieza del lienzo. El alcance pasa a scripts clásicos en varios archivos. La subsección "Por qué 5B y no un número nuevo" no se tocó.
- `docs/ROADMAP.md`: se anota una restricción de la partición que no estaba escrita. Las fixtures corren en Node y `src/engine.js` lleva envoltura a mano por eso; cualquier archivo nuevo que quiera cubrirse paga el mismo peaje.
- `docs/ROADMAP.md`: "Bloqueada por" decía cinco incrementos cerrados. La Fase 5 cerró con seis.
- `CLAUDE.md`: sección "Promesas y umbrales". Ninguna regla del repo receta un mecanismo futuro, y toda frase que nombre una sintaxis, un protocolo o una API va con su corrida pegada. El disparador es mecánico porque el error fue clasificar mal la frase.
- `CLAUDE.md`: protocolo mínimo de tres preguntas para cuando un umbral se dispara. Qué se vuelve difícil y con qué número, qué opciones hay y qué cuestan, y cuál es la corrida que descarta las que no funcionan.
- `docs/GLOSARIO.md`: tres términos, script clásico, umbral y promesa, con su sección de método.

La versión mostrada sigue en V11.63; el desfase lo cierra el próximo PR de código.

## v11.64 — 2026-08-11

### Fixed

- `docs/ROADMAP.md`: el Criterio de aceptación de la Fase 5 decía que el motor queda intacto y el incremento 5.5.2 tocó una línea. La cláusula pasa a pedir que ningún cambio de la fase altere el comportamiento del motor.
- `docs/ROADMAP.md`: esa cláusula lleva puntero a la entrada que la decidió. Un criterio de interfaz que admite tocar el motor sin puntero se lee como algo que se coló.
- `docs/DECISIONS.md`: entrada que supera la cláusula y la reemplaza por dos pruebas que se corren en vez de interpretarse, un `diff` sobre `src/engine.js` y las 41 fixtures.

### Changed

- `docs/ROADMAP.md`: la Fase 5 pasa a `cerrada (2026-08-11)`. Los seis incrementos quedan marcados con la versión que los entregó, para que el cierre se pueda comprobar en vez de creerse.
- `docs/ROADMAP.md`: se borra la subsección "Qué falta para cerrar la fase". Su primer punto ya estaba cumplido, el autor confirmó el arreglo del texto borroso con GPU real al recibir la v11.60, y el segundo lo resuelve este PR.
- `CLAUDE.md`: regla de referencia cruzada. Un texto operativo lleva puntero a `DECISIONS.md` cuando sin él se leería como arbitrario. Extiende lo que el glosario ya hace con su campo de fuente.
- `CLAUDE.md`: regla de método sobre el numstat. La tabla del cuerpo de un PR se copia del comando corrido como último paso, con los dos errores que la motivaron y su causa.

La Fase 5 se abrió, se cerró apilada en la v11.19, se reabrió al modelo de capas y cierra ahora con seis incrementos y treinta y dos versiones publicadas.

La versión mostrada sigue en V11.63; el desfase lo cierra el próximo PR de código.

## v11.63 — 2026-08-11

### Changed

- `src/engine.js`: el tercer valor de `classifyChordRelation` pasa de `modal_interchange` a `unclassified`. Una sola línea, el `return` final de la cascada. Es lo único que la Fase 5 tocó del motor.
- `index.html`: la lectura de análisis dice "Sin clasificar" en vez de "Intercambio Modal". Ese valor era el cajón de lo que el motor no supo clasificar, no un diagnóstico.
- `tests/fixtures/blues.json` y `tests/README.md`: el valor esperado y la prosa que lo describe adoptan el nombre nuevo. No se agregó ni se borró ninguna fixture.
- `index.html`: las lecturas del readout dejan de usar la paleta de veredicto. Se distinguen por la palabra y usan la escala de texto, primario para lo que el motor sabe y secundario para lo que admite no saber.
- `index.html`: dos botones y dos categorías del log dejan de repetir hexadecimales de la paleta. Los seis valores quedan solo en las clases del teclado y en la leyenda.
- `index.html`: la versión mostrada sube de V11.62 a V11.63.
- `docs/ARCHITECTURE.md`: la sección de evaluación adopta el nombre nuevo y registra qué era el valor viejo.

### Added

- `CLAUDE.md`: la regla de color, en tres puntos, al lado de la de iconos. Dónde vale la paleta de veredicto, cómo se distinguen las lecturas y qué usa el resto de la interfaz.
- `docs/DECISIONS.md`: entrada con el renombre y su razón medida contra la cascada del motor, más la demostración de que la fixture ejercía ese camino.
- `docs/DECISIONS.md`: entrada con la colisión de colores y por qué no se resolvió declarando que la paleta vale solo sobre las teclas.
- `docs/GLOSARIO.md`: "sin clasificar", "intercambio modal" como término musical que sigue siendo válido, y "paleta de veredicto".
- `docs/ROADMAP.md`: ítem de backlog nuevo. Los códigos del motor están en dos idiomas, inglés en la clasificación y español en la función tonal.

### Fixed

- `docs/ROADMAP.md`: la Fase 5 deja escrito qué le falta para cerrar. Los seis incrementos están entregados, pero el Criterio de aceptación pide corroboración del autor en el navegador y declara que el motor queda intacto, cláusula que este PR contradice a propósito.

La fase sigue `en progreso`. Cerrarla con esas dos cosas sin resolver sería peor que dejarla abierta un PR más, y el ROADMAP ya lleva una reapertura registrada.

## v11.62 — 2026-08-11

### Added

- `index.html`: incremento 5.5.1. La función tonal que la Fase 4 dejó en el buffer se muestra como cuarta lectura del widget de salida del motor, que es su dueño. No se calcula nada nuevo: la variable ya estaba llena.
- `index.html`: los cinco valores se muestran, incluidos los dos que admiten que el motor no sabe. "Fuera del universo" cuando el acorde no pertenece, y "Sin teoría escrita" cuando el universo no es mayor.
- `docs/DECISIONS.md`: entrada con por qué esos dos no se ocultan ni se maquillan. Un hueco visible es información; un hueco tapado es un error futuro que el usuario no va a poder detectar.
- `docs/GLOSARIO.md`: la función tonal con sus cinco valores y qué significa cada uno.

### Fixed

- `index.html`: la grilla de la vista de fórmula estaba declarada pero sin alinear. Ningún elemento declaraba su columna, así que los seis rótulos de paso caían en las columnas 1 a 6 en vez de sobre su barra.
- `index.html`: la columna va ahora explícita en cada elemento. El grado con índice i va a la columna 2i+1, y su etiqueta y su barra a la 2i+2. Medido: las seis diferencias entre centro de rótulo y centro de barra dan cero.

### Changed

- `docs/ROADMAP.md`: el incremento 5.5 se parte en dos PR, con el mismo criterio que partió al 5.3: el corte es si toca el motor. El 5.5.1 queda entregado; el 5.5.2 se lleva el relabel de "Intercambio Modal" y las fixtures.
- `index.html`: la versión mostrada sube de V11.61 a V11.62.

El PR anterior entregó la grilla rota porque su criterio de aceptación medía filas y ancho, no la relación espacial que era el punto del cambio. La comprobación de este mide los centros.

## v11.61 — 2026-08-10

### Changed

- `index.html`: la vista de fórmula pasa de una fila con guiones a una grilla de dos filas y trece columnas. Los siete grados abajo en las impares, las seis barras separadoras en las pares, y la etiqueta del paso arriba de cada barra.
- `index.html`: los guiones se van. Existían para indicar que el paso va entre dos notas; en una grilla eso lo dice la posición, igual que una tecla negra no necesita una flecha para indicar que está entre dos blancas.
- `index.html`: la regla base de la vista de fórmula pasa de flex a grid, y la del widget pierde el `flex-wrap`, que en una grilla no hace nada.
- `index.html`: la versión mostrada sube de V11.60 a V11.61.
- `CLAUDE.md`: la regla 4 de iconos se amplía a los separadores estructurales de un dato, que no rotulan nada y solo marcan dónde termina una parte. La barra de la fórmula es ese caso.

### Added

- `docs/DECISIONS.md`: entrada con el problema medido sobre las 36 combinaciones y por qué los guiones se pueden sacar sin perder información. Sin esa razón escrita, alguien los va a querer devolver.
- `docs/GLOSARIO.md`: la vista de fórmula describe la forma nueva y trae el peor caso medido con el comando que lo recalcula, para que quien agregue un universo nuevo sepa contra qué probar.

El molde de 314.4 px no se tocó: la solución entra en el espacio que ya estaba decidido. Los rótulos `S`, `T` y `T+S` tampoco.

## v11.60 — 2026-08-10

### Changed

- `index.html`: incremento 5.4. Las dos opciones de nomenclatura pasan a "Silábica" y "Alfabética". El comentario deja escrito que la silábica de este programa es do fijo: Do es siempre la nota Do, no el primer grado de la escala activa.
- `index.html`: "Tensión Legal" pasa a "Sensible (empuja a la tónica)". El nombre viejo prometía una familia de tensiones y el motor pinta una sola nota, en un solo tipo de universo, cuando no está escrita en él.
- `index.html`: el rótulo del widget de escala queda una sola vez, en el `widget-tag`, que es donde toda caja lleva su nombre. Dice "Universo (escala)": término primario más aclaración.
- `index.html`: doce emojis salen de rótulos de control, de lecturas y del log, según la regla nueva. Quedan los seis símbolos de la leyenda, el prefijo de aviso del log, el `↺` del reset por instancia y el del título.
- `index.html`: los símbolos de veredicto dejan de reusarse como adorno. El botón "Liberar" y la lectura "Diatónico" usaban los mismos glifos que la leyenda enseña sobre las teclas.
- `index.html`: la versión mostrada sube de V11.58 a V11.60.
- `docs/ARCHITECTURE.md`: la sección de la leyenda adopta el nombre nuevo y cita la entrada que lo decidió.

### Added

- `index.html`: interruptor de nombres de tecla en el menú de Opciones, junto al control de nomenclatura porque son la misma superficie. Persiste con el resto de la configuración.
- `CLAUDE.md`: la regla de iconos y emojis, en seis puntos, medidos sobre los 20 símbolos distintos que tenía el archivo. Lo que no encaja en ninguno se saca en el mismo PR que lo introduce.
- `docs/DECISIONS.md`: entrada con el renombre de la sensible y su razón medida contra `evaluateMelodyStatus`, que exige cuatro condiciones a la vez.
- `docs/DECISIONS.md`: entrada con el mecanismo del texto borroso. Una capa de composición se rasteriza una vez y cambiar el transform de un ancestro no la invalida: la estira.
- `docs/GLOSARIO.md`: la sensible con sus tres capas, incluida cuándo la pinta el programa; las dos nomenclaturas; y la condición verificable que retira el paréntesis de "universo".
- `docs/ROADMAP.md`: ítem de backlog nuevo. La leyenda no explica por qué una nota fuera del universo puede salir verde, que es el caso del tono conductor de una dominante secundaria.

### Fixed

- `index.html`: el texto quedaba borroso al redimensionar. Se reescribe el transform de cada caja abierta con las mismas coordenadas, que ensucia su capa y la obliga a rasterizar a la escala nueva. No recalcula ninguna posición.
- `index.html`: se retiran el desenfoque de fondo de los paneles y la pista de composición de las cajas. Los dos promovían cada caja a capa propia, que es lo que hacía posible el borroso.

El incremento 5.4 queda entregado. El nombre interno `latino` se deja como está a propósito: renombrarlo es el punto de nombres internos del ROADMAP, con su propio PR.

## v11.59 — 2026-08-10

### Added

- `docs/GLOSARIO.md`: sección nueva "Artefactos del código" con lo que ya existe en `index.html` y no tenía nombre en ningún documento. Cada uno verificado con `grep` contra el archivo antes de escribirse.
- `docs/GLOSARIO.md`: entran el widget de escala, la vista de fórmula, los dos selectores, el panel de fijar acordes y el botón de bloqueo del motor, cada uno con su identificador real. "Split" suma dónde vive su valor y su control.
- `docs/GLOSARIO.md`: el contenedor de controles del escenario queda nombrado como lo que es, sin identificador estable, en vez de inventarle uno. Solo tiene la clase `stage-controls`.
- `docs/DECISIONS.md`: entrada que resuelve "Universo" contra "Escala". Universo es el término primario en pantalla y escala la aclaración entre paréntesis, con la condición que la retira sola.
- `docs/ROADMAP.md`: ítem nuevo en "Direcciones sin fase". El entrenamiento escribe sus instrucciones en los subtítulos, que hoy son una superficie sin autor declarado, con la pregunta abierta de qué pasa cuando el motor quiere escribir ahí también.

### Fixed

- `docs/ROADMAP.md`: el cuarto punto del incremento 5.4 se contradecía. Mandaba renombrar "Universo" a "Escala" en pantalla y tres líneas después defendía el nombre interno con un argumento que vale igual afuera.
- `docs/ROADMAP.md`: ese punto pasa a mandar la deduplicación del rótulo. La caja dice hoy "Escala" en su título y "Universo:" abajo, dos palabras para la misma cosa sin relación declarada.
- `docs/ROADMAP.md`: la subsección de nomenclatura registra que los artefactos ya están nombrados y qué le queda pendiente, que son los nombres internos del código.

La prueba de que la contradicción mordía está en el BACKLOG: las pentatónicas y el blues están planeados como universos propios, y el día que entren el selector diría "Escala: Blues".

La versión mostrada sigue en V11.58; el desfase lo cierra el próximo PR de código.

## v11.58 — 2026-08-10

### Added

- `index.html`: incremento 5.6, el cascarón del lienzo. Todo el contenido vive en un contenedor `#lienzo` de 1280 x 720 px fijos, que JS escala y centra contra la ventana. Lo que sobra queda negro.
- `index.html`: el objeto `Lienzo` es el único lugar de la app que lee el tamaño de la ventana. Calcula escala y offsets, se los escribe al cascarón, y los reporta al log en cada carga y en cada `resize`.
- `index.html`: conversión del puntero a coordenadas de lienzo en el arrastre. Sin ella, a escala 1.5 la caja se movería un 50% más rápido que el puntero, y con franjas negras quedaría además desplazada por el offset.
- `docs/DECISIONS.md`: entrada que parte la migración en dos piezas y trae la primera a la Fase 5, con la evidencia que lo justifica y el riesgo del arrastre escrito para que no se vuelva a pisar.
- `docs/GLOSARIO.md`: entran "franja negra" y "píxel de lienzo"; "lienzo de referencia" y "escala del lienzo" dejan de ser decisión sin ejecución.

### Changed

- `index.html`: las medidas dejan de leer la ventana. `Layout.area`, `zonaNotas`, `clamp`, `puntosCompeten`, `nacimientoSistema`, la cobertura y dos líneas de log pasan a píxeles de lienzo. No queda ningún `innerWidth` ni `innerHeight` fuera del cálculo de la escala.
- `index.html`: los ocho `getBoundingClientRect` del layout se retiran. Bajo el cascarón devuelven píxeles ya escalados; en su lugar van `offsetWidth` y `offsetHeight`, previos a la transformación, y para la posición de una caja se usa su estado.
- `index.html`: el molde deja de usar unidades `vw`. Pasa a la variable `--w-widget` de 314.4 px de lienzo, que es 23% de 1280 más 20, debajo del tope de 320. El archivo ya no tiene ningún `vw`.
- `index.html`: `buildKeyboard` pierde la fórmula de escala provisional. El alto de la blanca vuelve a ser 140 px planos, porque ahora el cascarón aplica la escala una sola vez.
- `index.html`: los controles del escenario se ocultan, con el mismo mecanismo que "Fijar Acordes". Vivían en la capa 0, que no lleva controles interactivos. `lockChord` y `unlockChord` siguen funcionando contra el botón oculto.
- `index.html`: la versión mostrada sube de V11.57 a V11.58.
- `docs/ROADMAP.md`: vuelve el incremento 5.6 a la Fase 5, con el alcance recortado a la primera pieza. La fase cierra ahora con el 5.6. La Fase 5B pasa a describir solo la segunda.
- `docs/ROADMAP.md`: el punto de deuda de "Motor Automático" decía que no se oculta ni se borra. Este PR lo ocultó; lo que queda sin decidir es el destino de la característica.

Verificado a 1920x1080, 960x1000 y 800x600: la cobertura de los widgets que compiten da 31.8% en los tres, y las cinco cajas conservan sus coordenadas de lienzo. Si el número variara, algo seguiría leyendo la ventana.

## v11.57 — 2026-08-10

### Changed

- `index.html`: el teclado pasa de 61 teclas a 88. `KEYBOARD_START` va de 36 a 21 y `KEYBOARD_END` de 96 a 108, que son las 52 blancas de un piano completo. El código alcanza a lo que la documentación fijaba en cuatro lugares.
- `index.html`: el teclado llega de borde a borde. El ancho de la blanca se deriva del ancho disponible dividido 52, sin medida fija. Se eliminan `W_WIDTH`, el `transform: scale()`, la variable de escala y el `min-height` que la multiplicaba.
- `index.html`: el alto de la blanca son 140 px de lienzo, calculados con la fórmula del lienzo aplicada a ese único número. No es la migración al lienzo, que es de la Fase 5B: es la fórmula usada por adelantado donde hoy hace falta.
- `index.html`: el teclado va pegado al borde inferior. La leyenda salió del escenario y el relleno de abajo quedó en cero, porque la capa 0 es solo teclado y grilla.
- `index.html`: las negras dejan de llevar nombre y conservan color y símbolo. A 24.6 px de blanca la negra mide 15.3 px, donde no entra texto de tres caracteres legible. Las blancas conservan el nombre, con la fuente derivada del ancho.
- `index.html`: la leyenda de colores se mudó adentro de la guía, seis filas con color, símbolo, categoría y widget dueño. Contenido escrito a mano; filtrarla según qué widgets estén abiertos es backlog.
- `index.html`: la guía deja de nacer alineada con el tercer punto de nacimiento. Nace anclada al borde derecho con 16 px de margen y a la mitad vertical de la zona de notas, para que no se lea como cuarta caja de la fila.
- `index.html`: "Centrar en Split" pasa a marcar la nota de split sobre el teclado en vez de desplazar el contenedor. Con 88 teclas que entran completas no hay desbordamiento que centrar. Conserva su id y su hogar en Opciones.
- `index.html`: se retira el auto-clic de ese botón al cargar. Existía para auto-centrar; dejarlo encendería la marca del split sola, que es una decisión que nadie tomó.
- `index.html`: la versión mostrada sube de V11.53 a V11.57, cerrando el desfase de los cuatro PR de documentación anteriores.
- `docs/ARCHITECTURE.md`: la sección de la leyenda decía que vive debajo del teclado y apuntaba a un número de línea. Ahora dice que vive adentro de la guía y ancla en el bloque `legend-grid`.

### Added

- `docs/DECISIONS.md`: entrada con la geometría del teclado. Alto de 140 px de lienzo sobre un rango considerado de 120 a 160, negra en 0.62 de ancho y alto, y sin nombre.
- `docs/DECISIONS.md`: la misma entrada calcula el techo real del alto del teclado, 236 px de lienzo y no un tercio de 720. Los 170 px del molde se pasan del tope de tres octavos cuando la zona de notas baja de 453.3 px.
- `docs/DECISIONS.md`: refinación de la capa 2. La barra contiene comandos y no presenta lecturas: con una lectura ahí, cerrar las seis cajas deja de dejar el fondo solo, que es un objetivo entregado en la v11.53.
- `docs/ROADMAP.md`: el incremento 5.4 suma el interruptor de nombres de tecla, junto al selector de nomenclatura. La alfabética usa un carácter donde la silábica usa dos, y esa diferencia pesa en pantalla chica.
- `docs/ROADMAP.md`: dos ítems de backlog, el alto del teclado configurable con su techo de 236 px escrito, y el ancho de la negra configurable con sus dos extremos medidos.
- `docs/GLOSARIO.md`: "guía" actualiza su nacimiento y "capa" suma que la capa 2 no presenta lecturas, según la regla de glosario.

### Removed

- `docs/ROADMAP.md`: de la deuda verificada salen los dos puntos que este PR cierra, el de las 61 teclas contra las 88 y el del alto sin decidir.

## v11.56 — 2026-08-10

### Fixed

- `docs/GLOSARIO.md`: faltaba el término "capa". La entrada del lienzo introduce tres niveles con definición propia, y la regla de glosario que ese mismo PR escribió obliga a darles línea. Entra como un término único con los tres adentro.
- `docs/GLOSARIO.md`: la línea de "capa" incluye la parte operativa, que la capa 0 no lleva controles interactivos. De ahí salen los dos puntos de deuda sobre "Motor Automático" y "Fijar Acordes".
- `docs/GLOSARIO.md`: el encabezado prometía que todo término cita una entrada de `DECISIONS.md`. "Split" cita una sección del CHANGELOG, que es la cita correcta. Se corrigió el encabezado para admitir las dos fuentes, sin tocar esa línea.

### Changed

- `docs/DECISIONS.md`: entrada nueva que saca la migración al lienzo de la Fase 5 y la pasa a la Fase 5B, como su primer trabajo declarado. El criterio de entrada a una fase en curso queda sin excepciones.
- `docs/DECISIONS.md`: la misma entrada dice qué queda superado y qué no. Cae solo el párrafo de tensión declarada que justificaba al 5.6; el criterio queda intacto, y los dos ítems que sí entraron a la Fase 5 se quedan.
- `docs/ROADMAP.md`: el incremento 5.6 sale de la lista de la Fase 5 y la línea de cierre vuelve a nombrar al 5.5. La Fase 5B suma la migración con su razón: reescribe las mismas funciones que la migración toca.

La razón de fondo, en una línea: una regla cuyo estreno es una excepción no gobierna después.

La versión mostrada sigue en V11.53; el desfase lo cierra el próximo PR de código.

## v11.55 — 2026-08-10

### Added

- `docs/GLOSARIO.md`: archivo nuevo, cuarto documento canónico. Dice qué significa cada término hoy y se corrige; `DECISIONS.md` dice por qué cambió y es append-only. Cada término apunta a su entrada por fecha y título, nunca por número de línea.
- `docs/GLOSARIO.md`: 19 términos sembrados desde las tres fuentes que hoy hacen de glosario sin gobernar. "Ranura" queda marcado como superado, con los dos términos que lo reemplazaron: cap para el límite y punto de nacimiento para la coordenada.
- `docs/DECISIONS.md`: entrada de dueño de superficie. Cada categoría de color del teclado tiene un widget dueño y cerrar al dueño apaga su efecto. La escala es del widget de escala; las otras cinco, del widget de salida del motor.
- `docs/DECISIONS.md`: la misma entrada fija que los widgets no se hablan entre sí. Un dato tiene un autor y muchos lectores. Con canales de a pares el número crece con el cuadrado; con estado compartido, un widget nuevo no conoce a ninguno.
- `docs/DECISIONS.md`: entrada del lienzo de referencia de 1280 x 720, con la fórmula de escala única y sin comportamiento responsive. Lo que sobra queda en negro. El precedente que se evita es la v11.5, que era una interfaz líquida.
- `docs/DECISIONS.md`: la misma entrada escribe por primera vez el modelo de capas. Capa 0 el fondo, teclado y grilla alineados 1 a 1 y sin controles; capa 1 los widgets; capa 2 la barra.
- `docs/DECISIONS.md`: entrada de jerarquía de menús. Tres entradas de primer nivel, todo a dos clics, y el log a cuatro bajo Ayuda. El tres es techo para lo que se usa tocando y piso para lo que no debería encontrarse.
- `docs/DECISIONS.md`: entrada con el criterio de entrada a una fase en curso. Un ítem parqueado entra solo si dejarlo afuera bloquea un incremento pendiente o obliga a rehacer lo entregado.
- `docs/ROADMAP.md`: incremento 5.6, migrar las medidas al lienzo de 1280 x 720. Va después del 5.5, sin renumerar nada. La fase cierra ahora con el 5.6 y no con el 5.5.
- `docs/ROADMAP.md`: siete ítems de backlog nuevos, cada uno con su bloqueo declarado. El coloreo obedeciendo al dueño, la leyenda que se filtra sola, dos conflictos de dueño sin resolver, el split como rango, el feedback que se abre solo y el widget de acordes.
- `docs/ROADMAP.md`: dos puntos nuevos de deuda verificada. Dónde vive el botón "Motor Automático", que está en la capa 0 y esa capa no lleva controles, y el destino sin decidir del panel "Fijar Acordes".
- `CLAUDE.md`: regla de glosario. Toda entrada de DECISIONS que introduzca o refine un término escribe su línea en GLOSARIO en el mismo PR.
- `CLAUDE.md`: criterio de entrada a una fase en curso, en su forma operativa de dos líneas. La razón vive en DECISIONS.

### Changed

- `CLAUDE.md`: la documentación canónica pasa de tres archivos a cuatro. Entra `docs/GLOSARIO.md`.
- `docs/ROADMAP.md`: el incremento 5.4 suma tres trabajos. La mudanza de la leyenda a la guía con seis filas escritas a mano, el punto de nomenclatura de lo que ya existe, y poblar el glosario con los artefactos que hoy no tienen nombre.

Ninguna de las cuatro entradas nuevas de `docs/DECISIONS.md` trae cambio de código detrás. Lo que obedece hoy es la documentación, y cablearlo está en el backlog.

La versión mostrada sigue en V11.53; el desfase lo cierra el próximo PR de código.

## v11.54 — 2026-08-09

### Added

- `docs/DECISIONS.md`: entrada nueva con dónde vive la leyenda de colores. El teclado da el veredicto nota por nota con color; los subtítulos dan lo que el color no alcanza; la explicación de qué significa cada color vive en la guía, que es su primer contenido real.
- `docs/DECISIONS.md`: la misma entrada asume la consecuencia. La guía se cierra como cualquier caja, así que el usuario puede cerrar la explicación de los colores. Se prefiere eso a convertir la guía en otra excepción.
- `docs/DECISIONS.md`: entrada nueva con dos precisiones de nomenclatura. La guía nace en la columna derecha, bajo el tercer punto de nacimiento, y quedan válidos dos sinónimos: "los tres del sistema" y "los tres intercambiables del cap".
- `docs/DECISIONS.md`: queda escrita la regla que evita que esa lista crezca sola. Un sinónimo vale solo si el mapa de términos lo registra; cualquier otra forma de nombrar un grupo de cajas no se usa.
- `docs/ROADMAP.md`: el incremento 5.4 suma dos trabajos. La mudanza física de la leyenda a la guía, que la decisión de hoy resolvió en el papel, y decidir la regla de iconos y emojis de la interfaz.
- `docs/ROADMAP.md`: ítem de backlog nuevo, subtítulos de feedback parcialmente coloreables. Anotado como idea y sin fase: primero hay que cablear los subtítulos a la salida del motor.

### Changed

- `docs/ROADMAP.md`: el ítem de coherencia visual del set de iconos deja de estar sin fase. Lo toma el incremento 5.4, así que el mismo trabajo no queda anotado en dos lugares.

### Fixed

- `docs/ROADMAP.md`: la deuda verificada decía que el incremento 5.1 dejaba la leyenda asociada al teclado. Esa atribución no resuelve contra ningún texto: el Alcance del 5.1 no nombra la leyenda. El punto entero sale, porque la decisión de hoy lo cierra.
- `docs/DECISIONS.md`: la entrada nueva registra de dónde salió el error. Se confundió `ARCHITECTURE.md` §5.1, que describe dónde vive hoy la leyenda como hecho verificado, con el incremento 5.1 del ROADMAP.

La versión mostrada sigue en V11.53; el desfase lo cierra el próximo PR de código.

## v11.53 — 2026-08-09

### Added

- `index.html`: incremento 5.3, tercera parte. Toda caja se cierra y se restaura desde el menú de Widgets. Cerrar oculta y no destruye: la instancia conserva posición, opacidad y punto de nacimiento. Con todas cerradas queda el fondo solo, teclado y zona de notas, más la barra.
- `index.html`: menú de Widgets en la barra, al lado de Opciones. Lista siete instancias por identidad y no por tipo, abiertas y cerradas, cada una con abrir o cerrar, opacidad y reset de su posición. Abrir un menú cierra el otro.
- `index.html`: cap de tres widgets que compiten. Al abrir uno va al primer punto de nacimiento libre de izquierda a derecha. Un punto se considera ocupado por asignación, no por dónde quedó la caja en pantalla.
- `index.html`: con los tres lugares tomados, la apertura se bloquea y el feedback lo dice con el nombre de la caja. Verificado: el cuarto candidato no se abre y el log nombra los tres ocupados.
- `index.html`: la guía, tercera caja de sistema. Nace bajo el tercer punto de nacimiento y crece en vertical en vez de recortar su texto, que es la excepción escrita al molde uniforme. Sin cablear al motor.
- `index.html`: el feedback del sistema muestra los avisos que genera el chasis, cierres y bloqueos del cap. No viene del motor: cablearlo sigue pendiente.
- `index.html`: persistencia extendida. Además de la posición se guardan por instancia el estado de abierto, la opacidad y el punto asignado, siempre contra la identidad de la caja.
- `index.html`: si lo guardado es incoherente, por ejemplo cuatro widgets que compiten marcados como abiertos contra un cap de tres, se descarta entero y se vuelve al estado por defecto con aviso en el log. Un JSON roto hace lo mismo.

### Changed

- `index.html`: el clamp de abajo se levantó. El área de arrastre llega al borde de la ventana y un widget puede quedar sobre el piano, según la corrección del 2026-08-09. Verificado: el readout arrastrado queda con su borde inferior en 900 y el piano empieza en 570.
- `index.html`: la cobertura se mide contra la zona de notas, de la barra al piano, que dejó de coincidir con el área de arrastre. Los widgets que compiten dan 31.5% de 540 px, debajo del tope de tres octavos.
- `index.html`: el tercer widget perdió el recuadro punteado y nace cerrado. El modelo no dibuja espacios reservados a la vista: el lugar libre se percibe al abrir, no anunciándolo.
- `index.html`: el reset global se mudó del menú de Opciones al de Widgets, que era su hogar planeado, y ahí convive con el reset por instancia.
- `index.html`: la versión mostrada sube de V11.46 a V11.53, cerrando el desfase de los siete PR de documentación anteriores.
- `docs/ROADMAP.md`: el incremento 5.3 queda con sus tres partes entregadas, y con el punto de nacimiento de un widget abierto desde el menú ya decidido.

### Removed

- `docs/ROADMAP.md`: de la deuda verificada salen tres puntos que este PR resuelve, la caja punteada, la guía que faltaba y el punto de nacimiento sin decidir. Entra uno nuevo: los dos widgets de andamiaje sin contenido.

Andamiaje declarado: el tercer widget y el widget de prueba existen sin contenido real. El segundo se creó porque con tres candidatos el bloqueo del cap no se puede ejercer desde la interfaz. Los dos nacen cerrados y se retiran cuando existan los widgets de verdad.

## v11.52 — 2026-08-09

### Added

- `docs/ROADMAP.md`: Fase 5B, modularizar `index.html` con ES Modules nativos, entre la Fase 5 y la Fase 6. Estado `pendiente`, bloqueada por la Fase 5 completa. Sin bundler, sin build step, y la app tiene que seguir abriendo desde `file://`.
- `docs/DECISIONS.md`: entrada con por qué la 5B se atiende después de cerrar la Fase 5 y por qué lleva letra en vez de número. Correr la numeración movería los anclajes de seis fases, y "5.5" ya es el quinto incremento de la Fase 5.
- `docs/ROADMAP.md`: cuatro ítems de backlog sobre reglas de método que faltan. Qué hacer cuando un umbral se dispara a mitad de fase, cómo se promueve un ítem del backlog a fase, cómo se reabre una fase cerrada, y levantar los requisitos antes de seguir programando.
- `CLAUDE.md`: regla 6 de "Prosa". Una afirmación sobre el código se ancla en el nombre de la función o en una cita grepeable, nunca en un número de línea. De las cuatro referencias `archivo:línea` que había en `docs/`, tres apuntaban a otra cosa.

### Fixed

- `docs/ARCHITECTURE.md`: el umbral de las 1000 líneas de §7 ya se cruzó y el documento no lo sabía. Declaraba 573 líneas de `index.html`; `wc -l` da 1055, y `src/engine.js` pasó de 145 a 249. Los conteos se reemplazan por el comando que los recalcula.
- `docs/ARCHITECTURE.md`: el modelo de `State` de §1 no incluía `harmony.function`, que la Fase 4 escribe en cada análisis.
- `docs/ARCHITECTURE.md`: §2 hablaba de "las tres reglas puras" de `src/engine.js`. Son ocho desde las Fases 3 y 4, y la lista viva es el bloque de exports del archivo.
- `docs/ROADMAP.md`: la Fase 3 apuntaba a `index.html:566` para decir que `classifyChordRelation` no logueaba. Esa línea está vacía. Ahora ancla en `UI.updateStatus` y en la línea "Análisis:" con etiqueta MATH, que sí existe.

La versión mostrada sigue en V11.46; el desfase lo cierra el próximo PR de código.

## v11.51 — 2026-08-09

### Fixed

- `docs/ROADMAP.md`: el ítem del incremento 5.2 citaba un comentario de `index.html` que decía "visibles y alcanzables". `grep -c` sobre el archivo da 0: esa línea murió en el 5.1. Ahora cita el comentario vivo, `index.html:354`.
- `CLAUDE.md`: la regla 3 declaraba "66 de 142 viñetas". El total ya era 150 al mergear, porque el propio PR agrega una sección. Pasa a declarar solo las 66 históricas por encima del techo, que es un número que no crece salvo que alguien lo rompa.
- `CLAUDE.md`: la regla 1 declaraba un total de 32.079 palabras de prosa que quedó viejo en el mismo commit. Se saca: no aportaba nada operativo.
- `CLAUDE.md`: la regla 4 justificaba cinco paréntesis con cuatro razones. El del título de `tests/README.md` queda por ser un README que documenta su propia carpeta, no por la excepción de estado o número.
- `CLAUDE.md`: la regla 1 aclara que los hits de "delve", "leverage" y "robust" caen en viñetas del CHANGELOG que citan estas reglas, y se descuentan.

### Added

- `docs/DECISIONS.md`: entrada nueva con por qué las reglas de prosa viven escritas en el repo y no en una dependencia externa. Seis puntos: el piso sin plugin, no copiar texto sin licencia, cada número con su comando, ninguna regla borra información, los encabezados del ROADMAP son anclajes, y nada de totales sobre el CHANGELOG.
- `CLAUDE.md`: el título del Pull Request usa el mismo formato que el commit. Estuvo vigente de hecho hasta el PR #48 y se cortó en el #49 por no estar escrito.

Los números concretos viven en `CLAUDE.md`, que es editable. En `docs/DECISIONS.md` vive por qué existen esas reglas.

La versión mostrada sigue en V11.46; el desfase lo cierra el próximo PR de código.

## v11.50 — 2026-08-09

### Fixed

- `CLAUDE.md`: la regla 4 mandaba borrar paréntesis que llevan información. Los de `docs/ARCHITECTURE.md` dicen "confirmada en código" y "verificado", y `tests/README.md` lleva el umbral de 180 ms. Ahora la regla los conserva y apunta solo al paréntesis sin dato.
- `CLAUDE.md`: la regla 4 ya no manda corregir "los de archivos editables". Dice cuáles se quedan y por qué, archivo por archivo: 3 en ARCHITECTURE, 2 en tests, 4 congelados por append-only y 8 candidatos en ROADMAP.
- `CLAUDE.md`: los 8 del ROADMAP no se tocan por su cuenta. Ese archivo es del que un modelo saca qué hacer al ejecutar una fase, y renombrar un encabezado mueve anclajes que un prompt puede citar literal.

### Added

- `CLAUDE.md`: cada número de las cinco reglas viaja con el comando que lo produce. Cinco comandos de shell, corribles desde la raíz, para que una sesión sin el historial pueda recalcular en vez de creer.
- `CLAUDE.md`: queda escrito que el conteo de la regla 2 depende de su expresión regular. Cambiarla rompe la comparación con la línea base, así que se recalculan los tres archivos juntos.
- `CLAUDE.md`: la sección "CHANGELOG" apunta al techo de 60 palabras por viñeta, que vive en "Prosa". Antes había que leer la otra sección para enterarse.

### Changed

- `CLAUDE.md`: las mediciones se rehicieron después del merge del PR #52 y `CLAUDE.md` sale del corpus. Paralelismos: `docs/DECISIONS.md` en uno cada 419, `docs/ROADMAP.md` en uno cada 546, `docs/ARCHITECTURE.md` en uno cada 784.
- `CLAUDE.md`: la regla 3 suma cuánto falta. De 142 viñetas del CHANGELOG, 66 se pasan de 60 palabras y la más larga tiene 204. El promedio de las quince más nuevas bajó de 102 a 63.

La versión mostrada sigue en V11.46; el desfase lo cierra el próximo PR de código.

## v11.49 — 2026-08-09

### Fixed

- `CLAUDE.md`: la regla 2 leía mal su propia medición. Un paralelismo cada 517 palabras es menos frecuente que uno cada 500, así que `docs/ROADMAP.md` cumple el techo con un 3% de margen. El que se pasa es `docs/DECISIONS.md`, con uno cada 402.
- `docs/ROADMAP.md`: cinco correcciones de prosa contra las reglas de la sección "Prosa". Dos "muy" en el ítem del incremento 5.2, dos hedges con "probablemente" y un "vale la pena" en la deuda de método.
- `docs/ROADMAP.md`: los cuatro campos del motor quedan descritos por el tempo de la canción en sus dos extremos, en vez de "muy rápida o muy lenta". El requisito no cambia: siguen alcanzables sin fricción.

### Changed

- `docs/ROADMAP.md`: la pasada de prosa no toca un solo encabezado. Los 8 con paréntesis quedan para un PR aparte, porque renombrarlos mueve los anclajes del archivo del que un modelo saca qué hacer al ejecutar una fase.

Ningún Estado, Alcance, Criterio de aceptación ni relación de bloqueo cambió. El diff son 5 líneas.

La versión mostrada sigue en V11.46; el desfase lo cierra el próximo PR de código.

## v11.48 — 2026-08-09

### Added

- `CLAUDE.md`: la sección "Prosa" suma cinco reglas propias, el mínimo para escribir acá sin el plugin instalado. Cada una lleva el número que salió de medir el repo el 2026-08-09.
- `CLAUDE.md`: techo de paralelismo contrastivo. El "no es X, es Y" se usa una vez cada 500 palabras como máximo. Hoy `docs/DECISIONS.md` va en uno cada 402 y `docs/ROADMAP.md` en uno cada 517.
- `CLAUDE.md`: techo de 60 palabras por viñeta del CHANGELOG. Las quince viñetas más viejas promedian 42 palabras; las quince más nuevas, 102, y la más larga tiene 204.
- `CLAUDE.md`: prohibición de aclaraciones entre paréntesis en encabezados, con los 17 casos que hay hoy, 8 de ellos en `docs/ROADMAP.md`.
- `CLAUDE.md`: queda escrito cuál manda entre honestidad de estado y no narrar el proceso. Decir "no se verificó" sobre el código sigue siendo obligatorio. Queda prohibido narrar qué se buscó y no se encontró mientras se redacta.

### Changed

- `CLAUDE.md`: la nota sobre las listas de palabras vetadas. Están en inglés y acá se escribe en español: "delve", "leverage" y "robust" dan cero, y los equivalentes castellanos dieron 5 casos en 32.588 palabras. No se traducen.

Las referencias al plugin `no-ai-slop-writing-rules` se quedan como fuente y como lectura ampliada. No se copió su texto al repo: sigue sin traer licencia.

La versión mostrada sigue en V11.46; el desfase lo cierra el próximo PR de código.

## v11.47 — 2026-08-09

### Added

- `docs/DECISIONS.md`: entrada nueva con el mapa de términos. Para cada palabra del proyecto, el nombre vigente, el nombre viejo y qué cambió: widget (antes "característica" y "panel"), widget de sistema, ranura (posición, después límite, y finalmente tres puntos de nacimiento que son coordenadas y no celdas), barra de menús permanente (antes "panel de pestañas"), overlay (hoy nombra solo el estado del incremento 5.1), universo (la etiqueta pasa a "Escala" en pantalla, pero `universeType`, `universeRoot` y `universePitchesSet` se quedan porque nombran el conjunto de notas permitidas y no siempre es una escala de siete), salida del motor y "Tensión Legal". El archivo es append-only, así que las palabras viejas siguen escritas y siguen siendo válidas en su fecha; este mapa dice cuál manda hoy sin tener que leer doce entradas en orden.
- `docs/ROADMAP.md`: la Fase 5 suma la deuda verificada contra el código, seis puntos comprobados uno por uno contra `index.html`. El teclado dibuja 61 teclas, de la nota MIDI 36 a la 96 con `KEYBOARD_START` y `KEYBOARD_END`, contra las 88 que la documentación fija en cuatro lugares, y un piano de 88 va de la 21 a la 108. El alto del teclado no lo fija ningún documento, así que no es incumplimiento sino hueco, y se decide junto con las 88 teclas porque a más teclas cada una sale más angosta. La leyenda de colores vive al pie y no tiene hogar escrito, con tensión entre quedarse asociada al teclado y mudarse a la guía. La guía todavía no existe mientras el tercer widget sí tiene caja. Esa caja punteada contradice el modelo, porque no hay espacios reservados a la vista, y se retira cuando exista el menú de widgets. Y falta decidir en qué punto nace un widget abierto desde el menú, y qué pasa si el punto está ocupado.
- `docs/ROADMAP.md`: dos ítems de backlog. Detectar el rango real del teclado MIDI conectado en vez de asumirlo, sabiendo que el protocolo no lo informa directamente. Y una barra de menús que se oculte sola cuando no se usa, como una barra de tareas, que devolvería su alto al fondo.

### Changed

- `docs/DECISIONS.md`: entrada nueva que corrige el área de movimiento de los widgets. El fondo es el piano más las notas que caen, y los widgets flotan por encima de ese fondo entero, así que el área es toda la ventana por debajo de la barra de menús. "Intocable" quiere decir que el fondo no se reordena ni se recorta para hacerle lugar a un widget, no que un widget no pueda taparlo. La única zona vedada es la barra. El tope de tres octavos y la franja de nacimiento siguen vigentes: son reglas de dónde nacen y cuánto tapan por defecto, no un cerco al arrastre. Corrige el punto 4 de la entrada del 2026-08-01, que ponía el piano como límite de abajo, y deja la deuda escrita: la segunda parte del incremento 5.3 implementó ese límite, así que el clamp inferior debe levantarse hasta el borde de la ventana.
- `docs/ROADMAP.md`: el punto del material de referencia que vive fuera del repo suma que los bocetos de la interfaz son una secuencia cronológica y no una especificación paralela. Cada uno refina al anterior y el último es el del modelo vigente; los primeros traen ideas superadas a conciencia, cajas de tamaños distintos, botones dentro de cada caja y una barra centrada. Leerlos fuera de orden hace restaurar cosas descartadas creyendo que se recupera el diseño original. Lo que se fijó con números sobrevivió intacto a cada relevo; lo que quedó en adjetivos se reinterpretó cada vez contra lo que ya existía en el código.

La versión mostrada sigue en V11.46; el desfase lo cierra el próximo PR de código.

## v11.46 — 2026-08-01

### Added

- `index.html`: incremento 5.3 de la Fase 5, segunda parte, el movimiento. Las cinco cajas se arrastran con el mouse, con Pointer Events y sin una sola librería: `pointerdown`, `pointermove`, `pointerup` y `setPointerCapture`, y la posición se escribe con `transform: translate()` para no forzar reflow. El arrastre no roba el clic a los controles de adentro: si el `pointerdown` sale de un select, botón, input, textarea, option o enlace, la caja no se mueve. Verificado: con el widget de escala en su nacimiento (177, 86), cambiar `#scale-select` a menor cambió `State.universe.type` y la caja no se movió un píxel.
- `index.html`: los límites del área. Una caja no pasa del piano por abajo, no se mete debajo de la barra de menús por arriba y no se sale por los costados. El área en la ventana de referencia va de 30 a 570 px de alto. Los cuatro frenos se verificaron uno por uno: borde inferior en 570 contra el fondo del área, `x + ancho` sin pasar de 1440, `y` sin bajar de 30 y `x` sin bajar de 0. Cuando el arrastre frena contra un borde, el log lo dice.
- `index.html`: los puntos de nacimiento y el reset. Los tres widgets nacen en fila debajo de la franja, en (177, 86), (544, 86) y (912, 86), y las dos cajas de sistema centradas debajo, en (591, 414) y (609, 459). "↺ Restablecer posiciones" vive dentro del menú de Opciones y devuelve todo ahí; es provisorio y se muda al menú de widgets cuando ese menú exista, en el tercer PR del 5.3. Verificado: readout arrastrado a (744, 286), reset, readout de vuelta en (544, 86).
- `index.html`: persistencia por identidad en `localStorage`, clave `midiTrainerLayout`, con el mismo patrón de `saveConfig` y `loadConfig` que ya existía. Se guarda la posición contra el id de cada caja, nunca contra un índice ni un lugar, que es lo que permite que dos widgets intercambien lugar sin que el sistema se confunda. Lo que se lee y cae fuera del área se reubica en su punto de nacimiento en vez de quedar inalcanzable, y un JSON roto se descarta con aviso en el log y todo vuelve a los nacimientos. Verificado con recarga real, un widget y una caja de sistema.

### Changed

- `index.html`: el molde de widget pasa a 170 px de alto por 23vw más 20 px de ancho, con tope de dos octavos del ancho de la ventana. En la ventana de referencia de 1440 la caja mide 351 por 170, debajo del tope de 360. El tope no es decorativo: manda sobre el molde, y por debajo de los 1000 px de ancho es el que recorta.
- `index.html`: la medición de cobertura se separa en dos cifras, como fija la entrada del 2026-08-01 de `DECISIONS.md`. Contra el tope de tres octavos se mide solo lo que compite, los tres widgets, y da 31.5% sobre los 540 px de la zona de notas: entra. Aparte, informativa y sin tope, la unión de todas las cajas incluidas las de sistema, que da 41.1%. Con una sola cifra el molde de 170 px no habría pasado, y por eso el molde y la medición separada van en el mismo commit. El veredicto del log además distingue de quién es el exceso cuando lo hay: si las cajas están en su nacimiento, el molde se pasó y es un defecto; si el usuario las movió, es su decisión.
- `index.html`: la versión mostrada sube de V11.44 a V11.46.
- `docs/ROADMAP.md`: el incremento 5.3 va en tres PR y no en dos. El primero la forma, el segundo el movimiento con el molde y la medición separada, el tercero cerrar con el menú de widgets y el cap. El motivo del corte nuevo: cerrar sin un menú que restaure deja una caja cerrada sin forma de recuperarla salvo recargando la página.

## v11.45 — 2026-08-01

### Added

- `docs/DECISIONS.md`: entrada nueva con el nacimiento discreto y el movimiento libre. Un widget nace en uno de tres puntos por defecto y el reset lo devuelve ahí, pero esos puntos son coordenadas de arranque y no celdas: el movimiento es libre y dos widgets intercambian lugar sin que sea una operación aparte, porque el sistema identifica cada uno por identidad y no por posición. El nacimiento espaciado y con tamaño uniforme es lo que le enseña al usuario que hay tres lugares, sin dibujar nada. El área de movimiento tiene el piano como límite de abajo y la barra de menús como límite de arriba, este último anotado como discutible. El tope de tres octavos aplica solo a los widgets que compiten: las cajas de sistema quedan fuera y se miden aparte, y la app reporta las dos cifras por separado. La guía es la excepción al molde uniforme y crece en vertical. Y todo panel se puede cerrar, incluidos los de sistema, hasta dejar el piano solo, con el feedback avisando qué se cerró y cómo restaurarlo. Precisa la entrada del 2026-07-25 sobre la ranura como límite, y las dos del 2026-07-30, el presupuesto de superposición y el estándar espacial, sin invalidarlas.
- `docs/ROADMAP.md`: tres ítems de backlog. Redimensionar un widget en tiempo real, anotado como idea y no como decisión, con las preguntas que abre. Lineamientos para partir una fase, porque la estructura de cinco incrementos con uno partido en dos PR creció sin regla escrita. Y describir el destino visual con medidas y no con adjetivos, que eleva a trabajo concreto una sugerencia ya parqueada.

### Changed

- `docs/ROADMAP.md`: el Alcance de la Fase 5 fija el molde con números. Alto de 170 px y ancho de veinte píxeles más que el 23vw anterior, sin pasar de dos octavos del ancho de la ventana, con los tres puntos de nacimiento debajo de la franja y la misma separación entre cajas. Si el molde entra en conflicto con el tope de cobertura en alguna resolución, manda el tope y la app lo reporta al cargar.
- `docs/ROADMAP.md`: el segundo PR del incremento 5.3, el del chasis, suma respetar los límites del área, el piano abajo y la barra arriba, y emitir por el feedback el aviso de cada cierre con la forma de restaurarlo.

La versión mostrada sigue en V11.44; el desfase lo cierra el próximo PR de código, el chasis del incremento 5.3.

## v11.44 — 2026-08-01

### Added

- `index.html`: incremento 5.3 de la Fase 5, primera parte, la forma. El molde uniforme de widget: cajas de 23vw de ancho (331 px en una ventana de 1440, debajo del tope de dos octavos que son 360) por 150 px de alto, con 16 px de separación uniforme entre ellas y contra la fila. Un widget nace con ese tamaño aunque su contenido sea distinto; si el contenido no entra, se recorta o se apila, la caja no se agranda. Tres cajas en el molde: la escala, el readout y el lugar reservado y visible del tercer widget, rotulado como por construir. Todas quietas: el chasis, arrastrar, opacidad, cerrar, reset, persistir y el menú de widgets, es el segundo PR del 5.3.
- `index.html`: la franja de nacimiento, 56 px libres entre la barra y la fila de widgets, para que toda nota que caiga sea visible al aparecer; ningún widget ni rótulo la ocupa. Con la zona de notas midiendo 540 px en la ventana de referencia de 900 de alto, las cajas tapan 202 px, el 37.4%, debajo del tope de tres octavos (37.5%) del presupuesto de superposición. El cálculo no es de fe: la página lo mide al cargar y lo escribe en el log, con la franja, el molde y la posición de cada caja.
- `index.html`: los subtítulos del entrenamiento y el feedback del sistema creados como cajas de sistema, píldoras de texto centradas, el feedback debajo de los subtítulos, como fija el estándar espacial. Son marcadores de posición sin lógica: cablearlos al motor es trabajo posterior.

### Changed

- `index.html`: el readout dejó de ser tres cards sueltos y pasó a una sola caja de widget con las tres lecturas apiladas, notas activas, acorde detectado y análisis de armonía, con markup movido y cada id intacto. La barra de universo entró al mismo molde como widget de escala, con la vista de fórmula adentro y el contenido apilado para entrar en la caja.
- `index.html`: el rótulo de la zona de notas se corrió del centro superior a la esquina inferior derecha, porque ocupaba justo la franja de nacimiento que este PR deja libre.
- `index.html`: la versión mostrada sube de V11.43 a V11.44.
- `docs/ROADMAP.md`: el incremento 5.3 deja escrito que se entrega en dos PR de código, primero la forma y después el chasis, porque la disposición por defecto tiene que ser verificable antes de que exista el arrastre.

## v11.43 — 2026-07-31

### Added

- `index.html`: incremento 5.2 de la Fase 5, la barra de menús permanente. Fija arriba, de borde a borde, de 30 px, por encima de los overlays y siempre visible, con cambios de estado instantáneos según la regla de animación. Trae el menú de Opciones, que despliega de arriba abajo: el preajuste, los cuatro campos del motor, "Centrar en Split" y la consola completa. Clic afuera o Escape lo cierran.
- `index.html`: el preajuste de aprendizaje (`cfg-preset`), un solo control que mueve juntas las tres ventanas de tiempo. "Normal" son los valores de arranque, 120, 2000 y 1000 ms. "Aprendizaje" abre las tres para leer despacio: 400 ms de acumulación juntan las notas de un acorde arpegiado lento sin fusionar acordes distintos, 5000 ms de retención sostienen el contexto mientras se lee el análisis, y 2500 ms de error visual dejan ver qué tecla quedó marcada antes de que se borre. Elegir un preajuste escribe los tres campos, actualiza `State.config` y persiste con el `saveConfig` que ya existía; editar cualquier campo a mano pasa el select a "Personalizado" sin pisar lo escrito. Split no lo toca el preajuste: es la nota donde se separan las manos, no una tolerancia.

### Changed

- `index.html`: los cuatro campos del motor, "Centrar en Split" y la consola entera (desplegable, Copiar, Exportar, Limpiar y el contenedor de log) se reubicaron dentro del menú de Opciones, movidos y no recreados, con cada id intacto y su JS sin reescribir. "Centrar en Split" perdió el `hidden` del parqueo: este menú es el hogar que esperaba, y el auto-centrado al cargar sigue corriendo. El log queda a dos clics de abrirse y tres de accionarse, dentro del techo escrito en el ROADMAP.
- `index.html`: el título y la versión se mudaron a la izquierda de la barra, con los créditos como texto secundario, y el overlay de encabezado se retiró junto con los de ajustes y consola, que quedaron vacíos. Se resuelve el solape del título con el card de análisis que quedó anotado en el 5.1.
- `index.html`: convención de selección aplicada a la barra: con el menú abierto, el resto de la barra baja su opacidad a 0.35, sin marcos, colores nuevos ni subrayados.
- `index.html`: la versión mostrada sube de V11.33 a V11.43, cerrando el desfase que dejaron los diez PR de documentación anteriores.

### Fixed

- `docs/ROADMAP.md`: el incremento 5.2 decía que los cuatro ajustes del motor son ventanas de tiempo. Split no lo es: escribe `State.config.splitNote`, la nota MIDI donde se separan las manos, y por eso queda fuera del preajuste. Las ventanas son tres, acumulación, retención y error visual. El ítem del metrónomo del backlog repetía el mismo error y se corrige con el ajuste mínimo.

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
