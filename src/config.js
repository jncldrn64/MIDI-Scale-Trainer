// config.js: las tablas de la función tonal y las constantes de nota y teclado. Cortado de index.html en la partición, sin mover nada.
// --- CONFIGURACIÓN BASE ---
// Los cinco valores que devuelve getTonalFunction, con su texto en pantalla. Los tres
// primeros son términos de teoría y tienen nombre propio. Los dos últimos dicen qué pasa
// sin sonar a error del programa: uno es que el acorde está fuera del universo, y el otro
// que la teoría para ese tipo de universo todavía no se escribió. Ninguno se oculta.
const TEXTO_FUNCION = {
    tonica: 'Tónica',
    subdominante: 'Subdominante',
    dominante: 'Dominante',
    no_diatonica: 'Fuera del universo',
    por_definir: 'Sin teoría escrita'
};
// Las lecturas del readout no se distinguen por color: se distinguen por la palabra,
// que ya es distinta en cada caso. Solo se usa la escala de texto, primario para lo que el
// motor sabe y secundario para lo que admite no saber. Pintarlas con la paleta de veredicto
// le enseñaba al usuario un significado sobre una tecla y se lo contradecía en una lectura.
const COLOR_FUNCION = {
    tonica: 'var(--text-main)', subdominante: 'var(--text-main)', dominante: 'var(--text-main)',
    no_diatonica: 'var(--text-muted)', por_definir: 'var(--text-muted)'
};

const NOTES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const BLACK_KEYS = [1, 3, 6, 8, 10];
const KEYBOARD_START = 21; const KEYBOARD_END = 108;   // 88 teclas, 52 blancas: un piano completo

// SCALES, CHORD_TEMPLATES y MathEngine viven ahora en src/engine.js
// (cargado arriba). Se exponen como globales para el código de abajo.
const { classifyChordRelation, evaluateMelodyStatus, applyPassingTone } = Engine;
