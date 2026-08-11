# CLAUDE.md: estándar del proyecto

Reglas que valen en cada sesión. Se leen antes de tocar nada.

## Orden de lectura

Este repo no tiene `AGENTS.md`. Antes de tocar código se leen tres archivos de `docs/`, en
este orden:

1. `ARCHITECTURE.md`: el estado real del sistema, qué módulo vive en qué archivo y qué gaps
   quedan.
2. `DECISIONS.md`: las restricciones vigentes. No es opcional y va en este orden.
   Restricciones como "no migrar a framework" y "reconstruir desde v11.0, no desde v11.5"
   viven solo acá; un agente que las saltee puede proponer justo lo que ya está descartado.
3. `ROADMAP.md`: la fase actual y qué sigue.

Recién después se toca código.

## Documentación

La documentación canónica vive en `docs/` y son cuatro archivos: `ARCHITECTURE.md`,
`ROADMAP.md`, `DECISIONS.md` y `GLOSARIO.md`. No se crea ningún archivo de documentación
nuevo sin preguntar primero.

Regla de glosario: toda entrada de `docs/DECISIONS.md` que introduzca o refine un término
escribe también su línea en `docs/GLOSARIO.md`, en el mismo PR. `DECISIONS.md` guarda por qué
cambió y es append-only; `GLOSARIO.md` guarda qué significa hoy y se corrige.

Criterio de entrada a una fase en curso: un ítem parqueado entra a una fase que ya arrancó solo
si dejarlo afuera hace imposible ejecutar un incremento pendiente, o si obliga a rehacer trabajo
ya entregado. La razón vive en `docs/DECISIONS.md`, entrada del 2026-08-10.

Excepción por categoría: un `README.md` de subcarpeta documenta su propia carpeta y no
cuenta como doc canónico. `tests/README.md` explica cómo correr las fixtures; un futuro
`src/README.md` explicaría el motor. Mientras se queden en describir su carpeta, no piden
permiso aparte.

## CHANGELOG

`CHANGELOG.md` está en la raíz, en formato [Keep a Changelog](https://keepachangelog.com).
Es un solo archivo que crece por secciones, nunca uno por fase. Lo más nuevo va arriba, en
orden descendente. Cada sección abre con `## vX.Y — YYYY-MM-DD` y adentro lleva
`### Added`, `### Changed`, `### Fixed` o `### Removed`.

Un PR doc-only abre su propia sección fechada. No se pliega dentro de la sección de una
versión ya publicada: esa sección es historia y no se reescribe. La sección nueva lleva la
fecha real del cambio en ISO 8601, nunca la de una versión anterior. Un PR doc-only puede
dejar la última versión del CHANGELOG por delante de la versión que muestra el artefacto;
ese desfase es intencional y lo cierra el próximo PR de código (ver "Versión mostrada").

Una viñeta no pasa de 60 palabras: es la regla 3 de "Prosa", con su medición y su comando.

## DECISIONS

`docs/DECISIONS.md` es append-only, estilo ADR. No se borra una entrada vieja aunque quede
obsoleta; se agrega una nueva que la reemplaza y la referencia. Cada entrada abre con
`## YYYY-MM-DD — <título>`. La v11.5 se perdió por no tener este registro; por eso la
historia acá no se reescribe.

## Fechas

Siempre ISO 8601 (`YYYY-MM-DD`). Nunca formato local.

## Commits

El mensaje es `<tipo>: <resumen imperativo corto>`, con `tipo` en `{add, chg, fix, rmv,
doc}`:

- `add`: nueva capacidad.
- `chg`: cambio de comportamiento.
- `fix`: corrección.
- `rmv`: se sacó algo.
- `doc`: solo documentación.

El cuerpo del commit no vuelve a narrar el cambio: máximo 1 o 2 líneas y una referencia a
la sección del CHANGELOG. El qué vive en el CHANGELOG, el porqué en DECISIONS, no en el
mensaje del commit.

El título del Pull Request usa el mismo formato que el commit, con el mismo tipo. Así la lista
de PR del repo se lee igual que el `git log` y se puede filtrar por tipo desde los dos lados.
Estuvo vigente de hecho hasta el PR #48 y se cortó sin motivo en el #49, por no estar escrito.

## Prosa

Docs y comentarios en español, en mi voz, aplicando dos skills:
`no-ai-slop-writing-rules:no-ai-slop` y `no-ai-slop-writing-rules:rossmann-voice`. Las dos
salen del plugin `no-ai-slop-writing-rules` (realrossmanngroup). No están vendoreadas en el
repo: se sacaron por no traer licencia (ver "Vendoreo de dependencias de terceros" y
CHANGELOG v11.3). Esas referencias no resuelven hasta instalar el plugin: se instala por
sesión con `/plugin marketplace add realrossmanngroup/no_ai_slop_writing_rules` y después
`/plugin install no-ai-slop-writing-rules`
(https://github.com/realrossmanngroup/no_ai_slop_writing_rules). Sin relleno, sin frases de
IA, sin guion largo en la prosa. Cada afirmación cierra sobre un dato concreto: un número,
una línea de código, una fecha, un pitch class.

Lo que sigue es el mínimo para escribir acá sin el plugin instalado. Son reglas propias,
escritas con los números que salieron de medir este repo el 2026-08-09, no una copia del
plugin: el texto de ese proyecto no se copia porque no trae licencia. Con el plugin instalado
manda igual todo lo que dice; estas seis son el piso.

1. Las listas de palabras vetadas del plugin están en inglés y acá se escribe en español, así
   que atrapan poco. No traducirlas. Lo que sí se busca antes de entregar: "muy",
   "absolutamente", "claramente", "simplemente", "probablemente". Medido el 2026-08-09: un solo
   caso de prosa viva, `docs/DECISIONS.md:825`, que por append-only se queda. Los demás hits de
   este grep, y los de "delve", "leverage" y "robust", caen todos en viñetas del CHANGELOG que
   citan estas mismas reglas. Se descuentan al contar.
2. El paralelismo contrastivo, el "no es X, es Y", se usa como máximo una vez cada 500
   palabras. Medido el 2026-08-09: `docs/DECISIONS.md` va en uno cada 419 y se pasa del techo;
   `docs/ROADMAP.md` en uno cada 546 y `docs/ARCHITECTURE.md` en uno cada 784 lo cumplen.
3. Una viñeta del CHANGELOG no pasa de 60 palabras. Si el cambio no entra, son dos viñetas.
   Medido el 2026-08-09: **66 viñetas por encima del techo**, la más larga con 204 palabras. Las
   secciones publicadas no se reescriben, así que esas 66 son historia congelada y el número no
   debe subir. Si sube, lo subió la sección que se está escribiendo. No se declara un total de
   viñetas ni de palabras: el CHANGELOG crece en cada PR y cualquier total queda viejo antes de
   mergear.
4. Un encabezado no lleva aclaración entre paréntesis cuando ese paréntesis no aporta un dato.
   Sí se queda cuando lleva el estado de verificación de la sección o un número: sacarlo
   empobrece el documento y choca con "Honestidad de estado". Medido el 2026-08-09: 17 casos.
   Los 3 de `docs/ARCHITECTURE.md` se quedan: dos llevan el estado, "confirmada en código" y
   "verificado", y el tercero es el identificador `State`. De los 2 de `tests/README.md`, el del
   umbral de 180 ms se queda por el número, y el "(Fase 0)" del título se queda por otro motivo,
   que conviene decir en vez de forzarlo dentro de la excepción: es un puntero a la fase que creó
   esa carpeta y ese README documenta su propia carpeta. Los
   4 de `docs/DECISIONS.md` no se tocan por append-only. Los 8 de `docs/ROADMAP.md` son los
   únicos candidatos, y ese archivo es del que un modelo saca qué hacer al ejecutar una fase:
   renombrar un encabezado ahí mueve anclajes, así que se corrige junto con todo lo que los
   cite, nunca por su cuenta.
5. Decir "no se verificó" sobre el estado del código es obligatorio y se queda (ver
   "Honestidad de estado"). Lo que no va es narrar qué se buscó y no se encontró mientras se
   redacta.
6. Una afirmación sobre el código se ancla en algo que sobreviva a un refactor: el nombre de la
   función, o una cita textual que se pueda grepear. Nunca en un número de línea. Medido el
   2026-08-09: de las cuatro referencias `archivo:línea` que había en `docs/`, tres apuntaban a
   otra cosa. Las dos de `docs/DECISIONS.md` quedan por append-only y son deuda tolerada. Lo
   mismo vale para un número que describe el código, como un conteo de líneas: va con el comando
   que lo recalcula, o no va.

Los números de arriba son de la prosa que ya está escrita y sirven de línea base. Se recalculan
con estos comandos, desde la raíz del repo, para que una sesión que no tenga este historial pueda
comparar en vez de creer:

```sh
# Palabras de prosa, el total de la regla 1.
wc -w CHANGELOG.md docs/*.md tests/README.md

# Léxico de la regla 1. Descontar los de este archivo, que son la lista de la regla.
grep -rniE "\b(muy |absolutamente|claramente|simplemente|probablemente)\b" \
  CHANGELOG.md docs/*.md tests/README.md

# Paralelismos de la regla 2, por archivo. Dividir wc -w por este conteo.
grep -cE "no (es|son|era|fue) [^,.;]{2,45}[,;] (es|sino|son)|[a-zá-úñ]+, no (un|una|el|la|de|por|lo|a|con) [a-zá-úñ]" docs/ROADMAP.md

# Palabras por viñeta del CHANGELOG, de la más corta a la más larga, regla 3.
grep -E "^- \`" CHANGELOG.md | awk '{print NF}' | sort -n

# Encabezados con paréntesis, por archivo, regla 4.
grep -rcE "^#{1,4} .*\(.*\)" CHANGELOG.md docs/*.md tests/README.md
```

`CLAUDE.md` queda fuera del corpus a propósito: es el archivo del estándar, y cada vez que se
lo edita movería los números que él mismo declara.

El conteo de la regla 2 depende de su expresión regular: cambiarla cambia el número y rompe la
comparación con la línea base. Si hace falta afinarla, se recalculan los tres archivos de una
y se reescribe la regla con los valores nuevos y su fecha.

## Iconos y emojis

Seis reglas, medidas el 2026-08-10 sobre los 20 símbolos distintos que tenía `index.html`.

1. Los seis símbolos de la leyenda, `•` `♦` `✓` `!` `~` `✕`, no son iconos decorativos. Son
   feedback: se repiten sobre las teclas, se eligen por legibilidad a 24.6 px de lienzo y se
   explican en la guía. Quedan fuera de esta regla, y cambiarlos es cambiar el feedback.
2. Ninguno de esos seis se reusa como adorno en otro lado. Un `✓` en un botón o en una lectura
   le enseña al usuario un significado que después contradice sobre el teclado.
3. El rótulo de un control no lleva emoji. Un botón dice lo que hace con palabras.
4. Un símbolo tipográfico sí puede ser el rótulo entero de un control cuando la palabra no
   entra. El caso vivo es el `↺` del reset por instancia, que mide lo que mide una fila del
   menú. Si hay lugar para la palabra, va la palabra. La misma puerta vale para un separador
   estructural de un dato, que no rotula nada y solo marca dónde termina una parte y empieza
   otra: el caso vivo es la barra `|` de la vista de fórmula, que separa dos grados igual que
   el borde entre dos teclas.
5. En el log se permite un solo prefijo, `⚠`, para marcar una línea de aviso. El log es texto
   plano sin color ni columnas, así que el prefijo es lo único que distingue un aviso al leer
   una corrida entera. Ningún otro símbolo va al log: la etiqueta de categoría ya dice de dónde
   viene la línea.
6. El `🎹` del título se queda. Es identidad de producto, aparece una sola vez y no rotula
   ningún control.

Un emoji que no encaje en ninguna de las seis se saca en el mismo PR que lo introduce.

## Colores

Tres reglas, medidas el 2026-08-11.

1. La paleta de veredicto son seis hexadecimales: `#bae6fd`, `#f59e0b`, `#22c55e`, `#f97316`,
   `#a855f7` y `#ef4444`. Significan lo que la guía dice que significan, y viven en dos lugares:
   sobre las teclas y en la leyenda que los explica. Ningún otro elemento de la app usa esos
   seis valores.
2. Las lecturas del readout no se distinguen por color. Se distinguen por la palabra, que ya es
   distinta en cada caso, y usan la escala de texto: primario para lo que el motor sabe,
   secundario para lo que admite no saber. Pintarlas con la paleta le enseña al usuario un
   significado sobre una tecla y se lo contradice en una lectura.
3. El resto de la interfaz, botones, categorías del log y acentos, tiene su propia paleta y no
   repite un hexadecimal de la de veredicto. Puede quedar en la misma familia de color, que es
   lo que ya hacía `.btn-success` con su verde propio; lo que no puede es repetir el valor.

Medido antes de escribir la regla: cuatro elementos fuera del teclado usaban valores de la
paleta, dos botones y dos categorías del log, más las tres lecturas del readout y las cinco de
la función tonal. Los seis valores quedaron solo en las clases del teclado y en la leyenda.

## Guion largo

Guion largo (`—`): prohibido en toda la prosa (regla 1 de no-ai-slop). Se permite únicamente
como token de formato en los encabezados de fecha de CHANGELOG (`## vX.Y — YYYY-MM-DD`) y
DECISIONS (`## YYYY-MM-DD — <título>`). La historia no se normaliza: los encabezados ya
escritos quedan como están.

La regla se adoptó en la v11.3 (ver CHANGELOG). La prosa escrita antes de esa versión queda
como está, igual que los encabezados, aunque use guion largo en oración corrida o entre
paréntesis. En `docs/DECISIONS.md` eso además es obligatorio: el archivo es append-only, así
que las entradas viejas (las del 2026-07-03 y la sección Histórico, con guion largo en
prosa) no se editan ni para sacarlo. Es deuda tolerada, no algo a arreglar; tocarla
violaría append-only.

## Honestidad de estado

Nada se declara "funciona" o "probado" sin una corrida real. Si no se verificó, se dice
con esas palabras.

## Flujo de trabajo

Se trabaja vía Pull Request. Si `push`, `branch` o `PR` devuelve `403`, se para y se avisa
que falta permiso de escritura. No se arma una subida manual de archivos sueltos.

## Vendoreo de dependencias de terceros

Cuando se copia una skill, plantilla o cualquier código de terceros a este repo, se
copia también su LICENSE y su atribución, en la misma carpeta. Este repo es público:
no se redistribuye nada sin su nota de licencia. Si la fuente no la trae, se para y se
avisa antes de commitear.

## Scope de escritura

Este repo (MIDI-Scale-Trainer) es el único destino de escritura. Cualquier otro
repositorio clonado en la sesión es solo lectura y contexto: se copia DESDE él, nunca
se escribe EN él. No se traen a este repo convenciones de otro (idioma, DECISIONS vs
Known gaps, formato). Ante duda de en qué repo estás escribiendo, se para y se pregunta.

Este repo no describe otros repos. El nombre de otro repo puede aparecer como procedencia
histórica, de dónde salió una convención, nunca como información operativa. Ningún documento
de este repo depende de otro para entenderse ni para trabajar acá.

## Versión mostrada

La versión que muestra la app (el `<title>` y el `<h1>` de `index.html`) es fuente única
con el CHANGELOG: siempre es la última versión del CHANGELOG. Se bumpea en el mismo PR que
trae el cambio de código que la amerita, nunca en un PR doc-only.
