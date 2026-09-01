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

**2026-08-23, el autor, con lectura del revisor. Bloque A: puntos de entrada y paridad entre repos.**
Nada de esto se resuelve acá, es el paso 1 de ocho de un plan del autor y los pasos 2, 4 y 5 son
auditorías que van en sus propios PR.

- **El repo no tiene punto de entrada para un modelo, y lo comprobé.** `CLAUDE.md` abre con "Reglas
  que valen en cada sesión", o sea que es manual de operación: dice cómo escribir antes de decir qué
  es esto. `ARCHITECTURE.md` abre con su regla de verificación y su §0 es "Punto de partida real",
  que habla de la v11.0 y de la v11.5 perdida, no de qué hace la app ni para quién. `ROADMAP.md` abre
  con cómo usarlo con Claude Code, `DECISIONS.md` con su regla append-only y `GLOSARIO.md` con la
  suya. Ninguno de los cinco contesta qué es el repo y por qué existe. Lo más cerca es la "Orden de
  lectura" de `CLAUDE.md`, que es un mapa de cuándo leer cada archivo y nada más.
- **El repo hermano del autor, TL-FCCU, tiene un `AGENTS.md` que sí cumple esa función.** Según el
  autor su encabezado dice "start here" y cubre cuatro cosas: qué es el repo y por qué existe,
  restricciones duras, mapa de qué archivo sirve para qué y cuándo leerlo, y gaps conocidos. Ahí la
  división es que `AGENTS.md` orienta y `DESIGN.md` norma. **No lo verifiqué: este repo es el único
  destino de escritura de la sesión y no tengo el otro a mano.** El paso 4 pide esa auditoría y hace
  falta acceso a los dos.
- **El autor intentó traer `AGENTS.md` acá y Claude Code se negó**, con razón parcial, porque
  `CLAUDE.md` prohíbe crear documentación nueva sin preguntar primero. **Comprobado: esa negativa no
  quedó registrada en ninguna parte.** `grep -rn "AGENTS" docs/ CLAUDE.md CHANGELOG.md` devuelve una
  sola línea, la de `CLAUDE.md` que dice "Este repo no tiene `AGENTS.md`", que constata la ausencia y
  no cuenta el intento ni por qué se frenó. Vivió solo en conversación hasta esta anotación.
- **La asimetría, según el autor:** este repo tiene mejores reglas de escritura, medidas con
  comandos, y tiene `CONTEXTO-TEMPORAL.md`; el otro tiene `AGENTS.md` y no tiene ninguna de las dos.
- **Y una lectura del revisor, que es opinión y no decisión:** no todo debería estandarizarse entre
  los dos repos. La estructura de carpetas sigue al contenido, no a la simetría. Lo que sí valdría
  propagar es el método, las reglas de prosa y el archivo de contexto hacia el otro repo, y el punto
  de entrada hacia este.
- **El `README.md` no compite con esto.** El autor decidió que es para humanos y que espera a la
  versión mayor siguiente. Un punto de entrada para modelos es otra audiencia.

**2026-08-23, el autor y el revisor. Bloque B: teoría musical, sin verificar contra fuentes.** Todo
lo de acá espera al paso 6. **Las correcciones del revisor están tan sin verificar como lo que
corrigen**, y eso lo señaló el propio autor: usar memoria introduce alucinaciones, y esa advertencia
alcanza también a quien corrige. Lo único que comprobé es lo que el motor puede contestar solo.

Lo que el autor descubrió:

- El VI grado de una escala mayor es la tónica de su relativo menor, y las dos comparten las siete
  notas. **Verificado contra el motor**, corrida abajo.
- Desde la menor se construye la armónica sostiendo el VII. **Verificado contra el motor.**
- Desde la menor se construye la melódica sostiendo el VI y el VII. **No se puede verificar acá: la
  menor melódica no existe en `SCALES`**, que tiene tres entradas, `major`, `minor` y
  `harmonic_minor`.
- Su lectura general: de la mayor sale la menor, y de la menor salen las otras dos, como una
  recursión. La rueda de quintas muestra la relación entre mayor y menor y no muestra esas dos.
- Un caso que le llamó la atención: viniendo de La mayor aparece un Mi mayor con Sol#, fuera de la
  escala, y suena bien. Lo asoció con la sensible.

Las correcciones del revisor, sin verificar salvo donde se diga:

- El VI no es la dominante sino la submediante; la dominante es el V.
- El relativo mayor de una menor está en el III grado, no en el VI. **Verificado contra el motor:**
  el III de La menor es Do y los dos conjuntos coinciden.
- Mi# no es Fa. Suenan igual y no son la misma nota escrita, que es el problema de enarmonía ya
  anotado en el BACKLOG.
- Lo de ascendente y descendente es de la melódica, no de la armónica. La armónica lleva el VII
  sostenido siempre; la melódica clásica sube con VI y VII sostenidos y baja como menor natural.
- Sobre el Mi mayor con Sol#: dijo que es la sensible y que esa es la razón de existir de la menor
  armónica, tener una dominante que resuelva. **Sin verificar.**

El hallazgo que es del código y no de la teoría:

- **El universo del motor es un conjunto de alturas sin dirección. Verificado**, la firma es
  `evaluateMelodyStatus({ pc, universePitchesSet, chordObj, universeType, universeRoot })`: recibe un
  conjunto y no sabe qué nota vino antes.
- **La menor melódica clásica no se puede representar en un conjunto**, porque la misma nota es
  válida subiendo e inválida bajando. No se arregla agregando una fila a `SCALES`, como sí pasa con
  los modos griegos: es un parámetro más en la firma del motor, y eso toca las 46 fixtures.
- **Y hay una salida barata que puede ser la correcta:** la melódica ascendente sola es una escala de
  siete notas como cualquier otra y entra en `SCALES` sin cambiar nada. Según el revisor, en el jazz
  y en buena parte de la música moderna se usa solo esa forma en las dos direcciones, mientras que la
  asimétrica es la regla clásica. **Sin verificar, y es justo lo que el paso 6 tiene que resolver**,
  porque de eso depende si el ítem es barato o caro.
- Quedan tres casos ambiguos que la memoria de una nota no resuelve sola: la primera nota de todas,
  una nota repetida, y un salto grande que no es una línea melódica.
- **Una precisión del revisor que conviene guardar:** saber la dirección no es heurística. Comparar
  la nota actual con la anterior es determinista, igual que el indulto de 180 ms ya usa el pasado sin
  serlo. Lo que falta no es una estimación, es memoria.

Lo que el autor propone construir, sin colocar todavía:

- Un botón que salte al relativo desde el selector de escala, sin pasar por el desplegable. Lo quiere
  antes de la rueda de quintas.
- Que la guía muestre formas alternativas de leer lo mismo, que es el propósito que le ve a la rueda.
- Mejorar la descripción de los elementos en pantalla.

**2026-08-23, el autor, aceptado por el revisor. Bloque C: lo que este repo hace es FDD, no TDD.**
Entrega por características completas y verificables, con fases e incrementos, y las fixtures llegan
después o junto, no antes. TDD estricto exige escribir la prueba primero y acá casi nunca pasó.
**Comprobado antes de escribir esto: `grep -ri "TDD" docs/ CLAUDE.md` devolvía 0, y "FDD" tampoco
aparecía en ningún archivo.** O sea que la confusión vivió solo en conversación, y esta anotación
existe para que no vuelva. Corrido ahora ese grep devuelve 3 y las tres son estas líneas, así que el
número queda fechado en vez de escrito como si fuera permanente: es la misma trampa que el §"Documento
de requisitos" del ROADMAP tenía y que la v11.96 corrigió.
