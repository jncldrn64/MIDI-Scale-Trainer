/*
 * engine.js — Núcleo puro de teoría musical de MIDI Scale Trainer Pro
 *
 * Fuente única de verdad para MathEngine y las reglas de evaluación armónica.
 * Sin DOM, sin State, sin timers: solo funciones puras que reciben argumentos y
 * devuelven datos. Esto es lo que corren las fixtures de regresión en Node
 * (ver tests/) y lo que usa index.html en el navegador vía <script src>.
 *
 * Regla del proyecto (ver docs/ARCHITECTURE.md §0): nada acá se documenta como
 * hecho sin estar verificado contra el comportamiento real del motor. Cada
 * función de este archivo fue extraída línea por línea de index.html v11.0.
 *
 * Funciona como global de navegador (define window.Engine) y como módulo de Node
 * (module.exports), sin build step ni ES Modules — coherente con la decisión de
 * "no framework" de docs/DECISIONS.md.
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;           // Node: const Engine = require('./engine.js')
    } else {
        root.Engine = api;              // Navegador: window.Engine
        // Compatibilidad con el código inline de index.html que referencia estos
        // nombres como globales sueltos.
        root.SCALES = api.SCALES;
        root.CHORD_TEMPLATES = api.CHORD_TEMPLATES;
        root.MathEngine = api.MathEngine;
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // --- Escalas: fórmula interválica (T-T-S...) por tipo de universo ---
    const SCALES = {
        'major':          { f: [2, 2, 1, 2, 2, 2, 1], n: 'Mayor' },
        'minor':          { f: [2, 1, 2, 2, 1, 2, 2], n: 'Menor Natural' },
        'harmonic_minor': { f: [2, 1, 2, 2, 1, 3, 1], n: 'Menor Armónica' }
    };

    // --- Plantillas de acordes: intervalos desde la raíz (pitch class 0) ---
    const CHORD_TEMPLATES = {
        'M': [0, 4, 7], 'm': [0, 3, 7], 'dim': [0, 3, 6], 'aug': [0, 4, 8],
        'sus4': [0, 5, 7], 'sus2': [0, 2, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10],
        'M7': [0, 4, 7, 11], 'm7b5': [0, 3, 6, 10], 'dim7': [0, 3, 6, 9],
        '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9], 'add9': [0, 2, 4, 7], 'madd9': [0, 2, 3, 7],
        '7(no5)': [0, 4, 10], 'm7(no5)': [0, 3, 10]
    };

    // --- Motor matemático (verbatim de index.html v11.0) ---
    const MathEngine = {
        detectChord(notesArray) {
            if (notesArray.length < 3) return null;
            const pitchClasses = [...new Set(notesArray.map(n => n % 12))].sort((a, b) => a - b);
            const bassPC = Math.min(...notesArray) % 12;
            for (let root of pitchClasses) {
                const intervals = pitchClasses.map(pc => (pc - root + 12) % 12).sort((a, b) => a - b);
                for (const [type, template] of Object.entries(CHORD_TEMPLATES)) {
                    if (template.length === intervals.length && template.every((v, i) => v === intervals[i])) {
                        const invIndex = template.indexOf((bassPC - root + 12) % 12);
                        const invNames = ['Fundamental', '1ª Inversión', '2ª Inversión', '3ª Inversión'];
                        return { rootPC: root, type, bassPC, inversion: invNames[invIndex] || 'Desc.', rawNotes: notesArray, template };
                    }
                }
            }
            return null;
        },
        isDiatonic(chordObj, universePitchesSet) {
            return chordObj.template.every(interval => universePitchesSet.has((chordObj.rootPC + interval) % 12));
        }
    };

    // --- Pitch classes de un universo (root + tipo de escala) ---
    // Espejo puro de UI.buildUniverse en index.html: mismo recorrido de la
    // fórmula interválica, sin construir el HTML. Único derivado que existe por
    // duplicado; se mantiene sincronizado leyendo SCALES (la fuente compartida).
    function scalePitches(root, type) {
        const scaleDef = SCALES[type];
        const set = new Set();
        let current = root;
        set.add(current % 12);
        scaleDef.f.forEach(step => {
            current += step;
            if (current - root < 12) set.add(current % 12);
        });
        return set;
    }

    // --- Relación del acorde con el universo activo ---
    // Espejo puro de UI.updateStatus (heurística de dominantes secundarias /
    // intercambio modal). Devuelve un código estable, no texto de UI.
    function classifyChordRelation(chordObj, universePitchesSet) {
        if (MathEngine.isDiatonic(chordObj, universePitchesSet)) {
            return { relation: 'diatonic', targetPC: null };
        }
        const isDominantType = ['M', '7', '7(no5)'].includes(chordObj.type);
        const targetPC = (chordObj.rootPC + 5) % 12;
        if (isDominantType && universePitchesSet.has(targetPC)) {
            return { relation: 'secondary_dominant', targetPC };
        }
        return { relation: 'modal_interchange', targetPC: null };
    }

    // --- Estado de una nota de melodía ---
    // Espejo puro de MIDI.evaluateMelody (parte determinística, sin timers).
    // chordObj puede ser null (sin contexto armónico activo).
    function evaluateMelodyStatus({ pc, universePitchesSet, chordObj, universeType, universeRoot }) {
        const inScale = universePitchesSet.has(pc);
        const inChord = !!chordObj && chordObj.template.some(i => (chordObj.rootPC + i) % 12 === pc);
        const isMinor = universeType === 'minor' || universeType === 'harmonic_minor';
        const sensiblePC = (universeRoot + 11) % 12;
        const isSensible = isMinor && pc === sensiblePC && !inScale && !inChord;

        if (inScale || inChord) return 'good';
        if (isSensible) return 'tension';
        return 'bad';
    }

    // --- Indulto por paso cromático ---
    // Espejo puro de MIDI.releaseNoteInternal: cualquier nota no-'good' que dure
    // menos de PASSING_TONE_MS al soltarse se reclasifica a 'passing'. Umbral
    // calibrado empíricamente contra Bad Apple (ver docs/DECISIONS.md).
    const PASSING_TONE_MS = 180;
    function applyPassingTone(status, durationMs) {
        if (status !== 'good' && durationMs < PASSING_TONE_MS) return 'passing';
        return status;
    }

    return {
        SCALES,
        CHORD_TEMPLATES,
        MathEngine,
        scalePitches,
        classifyChordRelation,
        evaluateMelodyStatus,
        applyPassingTone,
        PASSING_TONE_MS
    };
}));
