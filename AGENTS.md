# AGENTS.md: empezá acá

## Qué es esto

Un entrenador de armonía que corre en el navegador y escucha un teclado MIDI. Dibuja las 88 teclas,
detecta el acorde que sostiene la mano izquierda y clasifica cada nota de melodía contra dos cosas a
la vez, el universo de notas elegido y ese acorde. Pinta el veredicto sobre la tecla y explica por
qué una nota fuera de la escala igual puede ser correcta.

El propósito es pedagógico. No es un secuenciador, no es un sintetizador y no reproduce música: el
sonido lo pone el piano del usuario. Se abre haciendo doble clic en `index.html`, sin servidor, sin
instalación y sin conexión.

## Qué manda cuando dos documentos se contradicen

Este repo perdió una versión entera por documentar lo que nadie había leído en el código, y esa
cicatriz define la jerarquía. De arriba hacia abajo:

1. **El código.** Si un documento afirma algo del programa y el programa hace otra cosa, el documento
   está mal. Pasó ocho veces en agosto de 2026 y las ocho se corrigieron contra el código, nunca al
   revés.
2. **`docs/DECISIONS.md`.** Guarda por qué el código es como es. Lo ya escrito ahí queda intacto para
   siempre, así que una entrada vieja puede describir un estado que hoy no existe: eso es correcto y
   no es un defecto a corregir.
3. **`CLAUDE.md`.** El método de trabajo vigente. Manda sobre cómo se escribe, se mide y se entrega.
4. **`docs/ARCHITECTURE.md`, `docs/ROADMAP.md` y `docs/GLOSARIO.md`.** Describen el presente y se
   corrigen cuando envejecen. El primero promete en su encabezado estar verificado contra el código,
   y esa promesa ya falló una vez.

`docs/CONTEXTO-TEMPORAL.md` queda fuera de la escala: no afirma nada, guarda lo que todavía no tiene
lugar. Las reglas de estilo del repo no lo alcanzan, y eso es deliberado.

## Lo que no se rompe

- **La app abre desde el sistema de archivos.** Nada de build, de servidor ni de dependencias que se
  instalen. Eso descarta soluciones que en otro proyecto serían obvias, y la razón de cada descarte
  está escrita.
- **`docs/DECISIONS.md` no se edita.** Se agrega al final. Corregir una entrada vieja borra la única
  prueba de que alguien pensó distinto antes.
- **`src/engine.js` es puro y tiene pruebas.** Corre igual en el navegador y en Node. Cualquier
  cambio ahí se comprueba con las fixtures antes de darse por hecho, y agregar teoría musical nueva
  al resto del código en vez de al motor rompe esa garantía.
- **La documentación nueva se pregunta antes de crearse.** Este archivo existe porque el autor lo
  autorizó.

## Dónde sigue

Para el método completo, `CLAUDE.md`. Ahí está cómo se escribe, cómo se mide lo escrito, qué forma
tiene un commit y qué tiene que traer un PR para darse por terminado. Nada de eso se repite acá.

**Una advertencia sobre ese archivo, que él no da sobre sí mismo.** Buena parte de sus reglas se
cumplen corriendo algo: recuentos que hay que recalcular, mediciones de prosa, comprobaciones del
registro. Están escritas para quien puede abrir una terminal. Quien no pueda, puede entender las
reglas y no puede certificar que las cumple, y lo honesto ahí es decirlo en vez de afirmar que se
verificó.

Y para saber en qué anda el proyecto ahora, `docs/ROADMAP.md`. Ese archivo y `CLAUDE.md` son el
mínimo para trabajar acá con seguridad.

## Lo que este archivo no promete

Que exista no hace que nadie lo lea. Los dos modelos que leyeron este repo desde afuera eligieron su
propio orden y ninguno abrió primero el archivo que el repo señalaba. Lo que se gana adoptando la
convención es que el repo la cumpla; que el lector la respete no depende de acá.
