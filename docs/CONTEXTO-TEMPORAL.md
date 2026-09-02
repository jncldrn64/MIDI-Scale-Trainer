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
**Por qué sigue acá (2026-08-21):** no se puede colocar porque no se sabe qué dice. Espera a que el
autor recuerde de qué se trataba; si no lo recuerda, se descarta, que es la cuarta salida que las
reglas de arriba contemplan y que todavía no se ejerció ninguna vez.

**2026-08-20, el autor.** Para las fixtures con partituras, ¿`.mid` o `.md`? Preguntó qué formato
serviría mejor y quedó sin discutir. Va acá y no al BACKLOG porque el ítem "Fixtures derivadas de
partituras de dominio público" ya dice que falta decidir el formato; lo que ese ítem no tiene son las
dos opciones concretas que él barajó.
**Por qué sigue acá (2026-08-21):** su destino depende de una decisión en curso. El autor está tocando
las piezas y corrigiendo las fixtures una por una, y hasta que eso avance no se sabe si el formato es
un ítem, una decisión o nada.

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

**Por qué sigue acá (2026-08-21):** es el estado de una discusión que está corriendo. Colocarlo ahora
la congelaría antes de que termine.

**2026-08-20, el autor.** Confundir una dominante secundaria con un intercambio modal es un error
didáctico esperable. Lo vivió: tocaba Re7 en Do mayor, sentía que algo pasaba, y creyó que era
intercambio modal cuando era una dominante secundaria. El programa hoy lo indulta y no lo nombra: el
readout dice `II7 (V del V) empuja a G`, o sea que el dato está, pero la nota de melodía que se
acepta por ese camino no dice por qué se aceptó. Material para los modos de entrenamiento.
**Por qué sigue acá (2026-08-21):** depende de la misma decisión en curso que las otras dos de
fixtures. Es material para los modos de entrenamiento, y el ítem de esos modos acaba de entrar al
BACKLOG con su pregunta abierta, así que esta anotación se coloca cuando esa pregunta se conteste.

**2026-08-21, el modelo que implementa.** Un entrenamiento que trae sus propios widgets choca con una
regla que ya está escrita. La visión entró hoy a "Direcciones sin fase" del ROADMAP; la regla es la
entrada del 2026-08-11 "El motor no ejecuta lógica que venga de afuera", que dice que el motor
consume datos y no ejecuta lógica que no esté en `src/engine.js` y cubierta por las fixtures.

El choque: si un entrenamiento de un tercero trae un widget, ese widget es código. Corriendo desde
`file://`, sin aislamiento, con acceso al estado. La regla protege al motor y no dice nada de la
interfaz, así que hoy no hay nada escrito que impida eso, ni nada escrito que lo autorice.

Salida candidata, que es la misma que ya se eligió una vez: un entrenamiento aporta datos, no lógica.
Un widget traído por un entrenamiento sería una composición de piezas que ya existen (qué vistas usa,
qué valores muestra, cómo se ordenan), no una pieza nueva con código propio. Es el mismo movimiento
que el ejemplo de esa entrada, donde un universo nuevo es una entrada en `SCALES` y no un algoritmo.

**No se resuelve acá a propósito.** Va anotado porque el día que alguien diseñe el formato de
entrenamiento va a tener que elegir, y si esto no está escrito va a elegir lo fácil.
**Por qué sigue acá (2026-08-21):** nace acá. No se coloca todavía porque colocarla sería resolverla,
y quien la resuelva tiene que ser quien diseñe el formato.

**2026-08-22, el modelo que implementa.** Barrida de auditoría sobre lo que ninguna sesión había
leído: `GLOSARIO.md` completo, `tests/README.md`, el §"Deuda de método" del ROADMAP, y el resto del
BACKLOG por muestreo. Salieron siete hallazgos del mismo patrón que el PR #97, documentación que
afirma algo del código y el código dice otra cosa. Las tres contradicciones de `GLOSARIO.md` las
cerró la v11.95, las cuatro de `docs/ROADMAP.md` la v11.96, la de `tests/README.md` la v11.97 y la
de `src/armonia.js` la v11.98. **Los siete están cerrados.** Queda solo lo de abajo, que no son
correcciones sino dos preguntas abiertas que pide decidir el autor, no auditar. Esta anotación se
borra entera cuando las dos se contesten o se descarten.

**Y dos cosas de análisis, que son lo que más se pierde si nadie las escribe.**

- **El mecanismo detrás de casi todos estos casos.** `DECISIONS.md` es append-only, así que congela
  nombres que después mueren; la entrada del 2026-08-11 del contrato de permisos usa `UI.updateStatus`
  y `UI.lockChord`, y `UI` se disolvió el mismo día en otra entrada del mismo archivo. Correcto que
  se quede. El problema es que la regla de glosario de `CLAUDE.md` **empuja texto desde el archivo
  congelado hacia el vivo**, y así llegó `UI.renderKeyboard` a `GLOSARIO.md`. No se sabe todavía si
  esto pide una regla nueva o si alcanza con la disciplina que ya existe.
- **"El sistema es un solo autor con varias manos" describe y no prohíbe.** Esa acotación del contrato
  de permisos del 2026-08-11 es legítima como límite de alcance, la regla de autoría se escribió sobre
  widgets. Falla como justificación: afirma que varios escritores sobre una rama del estado son
  inocuos adentro del sistema, y el repo pagó esa suposición dos veces, las dos en las dos ramas que
  esa misma entrada enumera. El bajo fantasma en `State.midi.activeBasses` y el acorde pegado en
  `State.harmony.chord`, los dos vivos desde el primer commit, los dos encontrados por síntoma y no
  por el contrato. La forma que sí prohíbe algo ya está escrita, es la entrada del 2026-08-20 "Nada
  que decida el destino de un evento se recalcula después de que el evento ocurrió". Si el contrato
  necesita una invariante escrita entre sus escritores, o si con esa entrada alcanza, no se decidió.

**2026-08-23, el autor. Bloque A, lo que queda: el documento de requisitos.** El resto de este bloque
lo recogió la v11.103, que creó `AGENTS.md`; la razón entera vive en `docs/DECISIONS.md`, entrada del
2026-09-02. Lo de abajo sigue sin destino, porque es otro trabajo: `AGENTS.md` orienta y no dice qué
tiene que ser verdad para que el programa esté bien hecho.

- **Ampliado el 2026-09-01, paso 2: el repo ya pidió este documento y nadie lo relacionó.** La
  subsección "Documento de requisitos, propósito y público objetivo" de "Deuda de método y
  documentación" del ROADMAP existe desde antes de toda esta conversación, la citan **seis** lugares
  del mismo archivo como hogar definitivo de lo que hoy está parqueado en otro lado. El conteo sale de
  `grep -n -i "documento de requisitos" docs/ROADMAP.md`, que da ocho líneas: seis citas desde otras
  partes del archivo (243, 252, 260, 501, 1101 y 2099), el encabezado de la subsección (1991) y una
  línea de adentro del propio ítem (2007), que no es cita. El mismo grep sin `-i` da dos, porque
  cinco de las citas escriben el nombre en minúscula, así que ese es el número que engaña. Su último
  párrafo ya se hace la pregunta que el autor está haciendo ahora, con estas palabras: "el lector que
  más lo necesita es un modelo que grepea texto plano, no una persona que quiere orientarse en
  treinta segundos. Esos dos lectores quieren documentos distintos, y eso puede empujar a que sean
  dos y no uno". O sea que el repo ya se inclinó a que sean dos, sin decidirlo.
- **Los seis que lo citan, para que el paso 3 sepa qué arrastra:** tres convenciones visuales del
  Alcance de la Fase 5, que se declaran requisitos no funcionales sin hogar (el presupuesto visual,
  el minimalismo funcional y la convención de estados excluyentes); el Alcance de la Fase 5B, que
  dice que lo que esa fase pedía era el contrato de widgets y entrenamientos "que la subsección ya
  reclama"; el ítem del BACKLOG "Levantar los requisitos y requerimientos antes de seguir
  programando", que dice estar parqueado ahí; y la subsección del material de referencia externo, que
  propone que el destino visual acordado viva "en el mismo documento de requisitos o en uno propio".

**2026-08-23, el autor. Bloque B, lo que queda: dos ideas de vista, sin destino.** La teoría de este
bloque la recogió la v11.104, que la verificó contra fuentes; el resultado vive en `docs/DECISIONS.md`,
entrada del 2026-09-02, en `docs/GLOSARIO.md` y en el ítem de la menor melódica del ROADMAP. La línea
sobre Mi# y Fa se descartó por duplicada: el ítem de enarmonía del BACKLOG ya la cubre. Queda esto,
que no es teoría y no lo contesta ninguna fuente:

- **Su lectura general de cómo se encadenan las escalas:** de la mayor sale la menor, y de la menor
  salen las otras dos, como una recursión. Y la observación que trae pegada, que la rueda de quintas
  muestra la relación entre mayor y menor y no muestra esas dos. Se toca con la Fase 10 y con lo de
  abajo, así que se leen juntas.
- **Lo que propone construir, sin colocar todavía:** un botón que salte al relativo desde el selector
  de escala, sin pasar por el desplegable, que lo quiere antes de la rueda de quintas; que la guía
  muestre formas alternativas de leer lo mismo, que es el propósito que le ve a la rueda; y mejorar la
  descripción de los elementos en pantalla.
- **Por qué sigue acá:** las tres son de interfaz y las tres tocan la Fase 10, que está pendiente.
  Colocarlas pide decidir si son alcance de esa fase o ítems aparte, y eso no se decidió.

**2026-08-23, el autor, aceptado por el revisor. Bloque C: lo que este repo hace es FDD, no TDD.**
Entrega por características completas y verificables, con fases e incrementos, y las fixtures llegan
después o junto, no antes. TDD estricto exige escribir la prueba primero y acá casi nunca pasó.
**Comprobado antes de escribir esto: `grep -ri "TDD" docs/ CLAUDE.md` devolvía 0, y "FDD" tampoco
aparecía en ningún archivo.** O sea que la confusión vivió solo en conversación, y esta anotación
existe para que no vuelva. Corrido ahora ese grep devuelve 3 y las tres son estas líneas, así que el
número queda fechado en vez de escrito como si fuera permanente: es la misma trampa que el §"Documento
de requisitos" del ROADMAP tenía y que la v11.96 corrigió.

**2026-09-01, el autor. Reglas en el prompt en vez de archivos.** Sigue sin destino después de que la
v11.103 creara `AGENTS.md`, porque el archivo no la contesta. El caso que la motivó está contado en
`docs/DECISIONS.md`, entrada del 2026-09-02: a un modelo le dieron material previo junto con el repo y
ese material le dirigió la lectura. Si el prompt hubiera dicho que el repo manda y que lo anterior es
historia, eso no habría pasado.

**Con su límite, que es lo que la hace no reemplazar al archivo:** una regla de prompt existe solo si
alguien la escribe cada vez. **Un archivo en el repo viaja con el repo; una regla de prompt no.**
Sirven para casos distintos, el archivo para quien llega solo y la regla para cuando el autor arma el
contexto.

