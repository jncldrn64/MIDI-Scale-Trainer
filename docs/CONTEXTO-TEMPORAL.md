# CONTEXTO-TEMPORAL.md: lo que se pierde si no se anota

> Acá va lo que se observó y se perdería si nadie lo escribe. Una línea alcanza. **El criterio de
> entrada no es si está maduro: es si se pierde.**
>
> Este archivo reemplaza a `EN-DISCUSION.md`, que se diseñó mal. Aquel pedía cuatro campos con
> evidencia y pregunta formulada, o sea que filtraba por madurez, y lo que se pierde no es lo maduro
> sino lo crudo. Ver `DECISIONS.md`, entrada del 2026-08-20 "El archivo de tránsito filtraba por
> madurez, y lo que se pierde es lo crudo".
>
> **Tiende a cero.** Su métrica es la velocidad con que se vacía, no lo que contiene. Un archivo
> grande dice que el vaciado no se está haciendo, no que se anotó bien.

## Entrada: barata

Una línea. Qué se observó, quién lo aportó y por qué podría importar. **Sin evidencia obligatoria,
sin pregunta formulada, sin campos.** Si no se sabe por qué importa, se escribe igual y se dice que
no se sabe.

**El modelo escribe sin pedir permiso**, tanto el que implementa como el que revisa, y también lo que
no viene del autor. Que un archivo del código no registre nada por consola, que dos clases del CSS
mezclen idiomas: nada de eso justifica interrumpir una conversación, y todo eso se pierde si no hay
dónde ponerlo.

**Lo único obligatorio es la fecha y quién lo anotó.**

## La prosa acá está exenta

**Este archivo no cumple las reglas de estilo de `CLAUDE.md`.** Puede ser feo, telegráfico,
desprolijo, con guion largo y con las palabras que la regla 1 veta. Está declarado para que ningún
revisor lo marque como incumplimiento.

La razón: su único trabajo es que algo sobreviva, y encarecer la escritura es lo que garantiza que no
se escriba. Una línea fea que existe vale más que una prolija que nadie escribió.

## Salida: ahí está toda la disciplina

Cada línea se coloca o se descarta. Cuatro destinos y ninguno más:

- **Un PR que la ataque de inmediato.**
- **El BACKLOG**, con el porqué que la línea traía. El porqué viaja con ella o el vaciado no sirvió
  de nada.
- **Una fase.**
- **El descarte**, si resulta duplicada o irrelevante. Se borra sin dejar rastro.

**Los cuatro campos del archivo viejo no se perdieron: dejaron de ser requisito de entrada y pasaron
a ser lo que una línea gana si se la promueve.** Qué se discute, qué se sabe con evidencia, qué falta
decidir y qué pasa si nadie decide. Una observación que sobrevive al repaso y merece discusión se
escribe con los cuatro; una que no, se coloca o se descarta.

## La frontera con el BACKLOG

**Al BACKLOG va lo que ya se sabe que se quiere.** De ahí sale el próximo roadmap, así que sus ítems
tienen que poder evaluarse: qué bloquea a qué, qué se puede implementar y qué se posterga. No todos
tienen bloqueo declarado, y documentarlos es lo que permite levantarlos cuando llegue el momento.

**Acá va lo que todavía no se sabe si se quiere.** Una observación suelta no se puede evaluar y no
sirve para armar un roadmap.

## Cuándo anotar y cuándo recoger

**Primero se pregunta, después se anota.** Si el alcance se abre y lo anterior no quedó documentado,
lo correcto es preguntarle al autor si conviene darle forma a lo abierto antes de seguir. Eso manda
la idea directo a su hogar sin pasar por acá. Este archivo es la red para cuando esa pregunta no se
hace o no se acepta. El orden importa: al revés, el archivo se vuelve la excusa para no preguntar y
se acumula igual que el anterior.

**Anotar:** cuando una rama de alcance se está cerrando. Se abrió un tema, se pivoteó, y la discusión
empieza a asentarse. Es incremental: se anota a medida que aparece, no se junta todo para el final.

**Recoger:** cuando esa rama se cierra y se está viendo qué quedó de lado.

**Y dos números que son red de seguridad, no el mecanismo.** Anotar, si pasaron tres prompts sin que
se anote nada y hubo discusión. Recoger, si pasaron nueve PR sin fase activa y el archivo no se
vació.

**Por qué existen los números, que es lo que los hace no arbitrarios:** un modelo con ventana grande
reconoce la condición de estado, uno con ventana chica no. La regla se escribe para el peor lector,
no para el mejor, que es el criterio con el que este repo escribe todo desde el primer PR. Si la
condición de estado se reconoce, los números no se usan nunca.

---

## Anotaciones

**2026-08-20, el autor.** El tema de los sonidos se conecta con otra fase. No dijo con cuál ni cómo.
Decidió no abrirlo ahí para no diluir el trabajo que estaba en curso. Queda incompleto a propósito:
lo que se pierde si no se anota es que la conexión existe, aunque no se sepa cuál.

**2026-08-20, el autor.** Para las fixtures con partituras, ¿`.mid` o `.md`? Preguntó qué formato
serviría mejor y quedó sin discutir. Va acá y no al BACKLOG porque el ítem "Fixtures derivadas de
partituras de dominio público" ya dice que falta decidir el formato; lo que ese ítem no tiene son las
dos opciones concretas que él barajó.

**2026-08-20, el autor.** Quiere discutir las fixtures con partituras de dominio público. Esto es el
estado de la discusión antes de empezarla, para que si la conversación se corta el punto de partida no
se pierda. No se decide nada acá.

- Que las 41 actuales vienen de una sesión con otro modelo y nadie verificó que representen lo que
  esas canciones son: eso ya está escrito en el ítem del BACKLOG, no se repite.
- Lo que agrega él: una partitura o un archivo MIDI sí es verificable, porque lo puede tocar y oír si
  coincide. Eso convierte las fixtures de lo que un modelo creyó a lo que la música dice.
- Lo separó explícito: la discusión es de método de prueba, no de implementación. No se está hablando
  de las notas que caen ni de MIDI de salida, se está hablando de ampliar la cobertura de pruebas de
  forma correcta.
- Se toca con el ítem "Cubrir el manejo de eventos con pruebas", que hoy ninguna fixture alcanza.
  Decidir el formato de las fixtures nuevas condiciona si ese otro ítem se resuelve con el mismo
  mecanismo o pide uno aparte. Los dos ítems viven en el BACKLOG del `ROADMAP.md`.

**2026-08-20, el autor.** Los modos de entrenamiento deben exponer la teoría de forma gradual. Es la
conexión entre los ítems de entrenamientos del BACKLOG y el problema que lo trajo al proyecto: las
salidas de la escala lo dejaban mal porque nadie se las había nombrado. Ninguno de los cinco ítems de
entrenamiento que hay dice esto: hablan de qué entrena cada modo, no de en qué orden se muestra la
teoría.

**2026-08-20, el autor.** El motor cubre unos pocos recursos de un catálogo más grande. Lo que hoy
reconoce `Engine.evaluateMelodyStatus`, leído del código: la nota que está en el universo o en el
acorde activo, el tono conductor de una dominante secundaria, y la sensible en menor. Aparte, al
soltar, `applyPassingTone` indulta el paso cromático por duración. La teoría tonal tiene más recursos
para salir de la escala. El intercambio modal es la Fase 11; los modos griegos y el blues ya están en
el BACKLOG desde el primer commit que tocó el ROADMAP. Esto es una lista de lo que hay, no un plan.

**2026-08-20, el autor.** Confundir una dominante secundaria con un intercambio modal es un error
didáctico esperable. Lo vivió: tocaba Re7 en Do mayor, sentía que algo pasaba, y creyó que era
intercambio modal cuando era una dominante secundaria. El programa hoy lo indulta y no lo nombra: el
readout dice `II7 (V del V) empuja a G`, o sea que el dato está, pero la nota de melodía que se
acepta por ese camino no dice por qué se aceptó. Material para los modos de entrenamiento.

**2026-08-20, el autor.** Un fragmento que ejerce un recurso concreto vale más que una canción
completa. Dos compases con una dominante secundaria aíslan el caso y se pueden nombrar; una pieza
entera arrastra material que no prueba nada y, si es de otro, arrastra su licencia.

**2026-08-20, el autor.** Sobre de dónde pueden venir las fixtures nuevas, y va como distinción que
él aportó, no como asesoramiento: los términos de un sitio son contractuales y el estado de la obra es
otra cosa. Una obra en dominio público lo sigue siendo aunque el sitio imponga condiciones; lo que el
sitio puede reclamar es su edición, no la música. Y un archivo MIDI no tiene licencia por ser MIDI:
hereda el estado de lo que representa, y la transcripción puede tener derechos propios aunque la obra
no los tenga.

**2026-08-21, Claude.** El registro de la Oda muestra `DOWN: Do (60)`, `DOWN: Re (50)` y
`DOWN: Fa# (42)`, y enseguida `Contexto: Re7(no5)`. Con el split en su valor de fábrica eso no puede
pasar: 60 no es menor que 60, así que el Do va a melodía, quedan dos bajos y `detectChord` devuelve
null con menos de tres notas. **Inferencia, con su base:** el autor tenía el split por encima de 60 en
esa sesión. No cambia nada de las fixtures, que llaman a `detectChord` directo y no pasan por el
split, pero sí quiere decir que un registro no se puede leer sin saber con qué configuración se grabó.
Lo que no se sabe es si conviene que el registro anote la configuración al arrancar.

**2026-08-20, Claude.** Al medir el punto 3 del Criterio de la Fase 7 quedó a la vista algo que no es
ese defecto y no tiene dónde ir: el momento de inicio de una nota se estampa antes de que corra el
resto del manejador, así que cualquier cosa lenta que se meta en ese camino le come tiempo al indulto
de 180 ms. Hoy el único caso es el contexto de audio y ya está en el BACKLOG. Lo que no se sabe es si
conviene una regla que prohíba trabajo pesado en ese camino, o si con arreglar el caso alcanza.
