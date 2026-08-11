// state.js: el estado global, el formateador de nombre de nota y la persistencia de la config.

// --- ESTADO GLOBAL ---
const State = {
    // `latino` guarda si la nomenclatura es silábica (Do Re Mi) o alfabética (C D E).
    // El nombre interno se queda: renombrarlo es el punto de nombres internos de "Deuda
    // de método y documentación" del ROADMAP, que pide su propio PR con las fixtures en
    // verde. Cambiarlo acá dejaría a medias una migración de `midiTrainerCfg`.
    // La nomenclatura silábica de este programa es DO FIJO: Do es siempre la nota Do, no
    // el primer grado de la escala activa. Quien viene de do móvil espera lo contrario.
    config: { latino: false, nombresTecla: true, accumMs: 120, holdMs: 2000, errMs: 1000, splitNote: 60 },
    universe: { root: 0, type: 'major', validPitches: new Set() },
    midi: { access: null, activeBasses: new Set(), activeMelodies: new Set(), keysDown: new Set(), sustainActive: false },
    harmony: { chord: null, isLocked: false },
    evaluations: new Map(),
    timers: { accumulation: null, contextHold: null },
    ui: { marcaSplit: false },   // la marca del split sobre el teclado, no persiste
    logHistory: []
};

function getNoteStr(midi) {
    const pc = midi % 12;
    return { name: State.config.latino ? NOTES_ES[pc] : NOTES_EN[pc], oct: Math.floor(midi/12)-1, pc };
}

// --- PERSISTENCIA DE LA CONFIGURACIÓN ---
// Viven acá porque persisten State.config, y la persistencia vive con lo que persiste.
// La misma razón por la que saveLayout y loadLayout se mudaron junto a Layout.
function saveConfig() { localStorage.setItem('midiTrainerCfg', JSON.stringify(State.config)); }
function loadConfig() { const saved = localStorage.getItem('midiTrainerCfg'); if (saved) State.config = { ...State.config, ...JSON.parse(saved) }; }
