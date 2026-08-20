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

*(vacío)*
