/*
 * engine.js: núcleo puro de teoría musical de MIDI Scale Trainer Pro.
 *
 * Fuente única de verdad para MathEngine y las reglas de evaluación armónica.
 * Sin DOM, sin State, sin timers: funciones puras que reciben argumentos y
 * devuelven datos. Esto corre en Node contra las fixtures (ver tests/) y es lo
 * mismo que carga index.html en el navegador vía <script src>. Un solo motor,
 * dos entornos.
 *
 * Cada función de este archivo se extrajo línea por línea de index.html v11.0.
 * Regla del proyecto (docs/ARCHITECTURE.md §0): nada se documenta como hecho sin
 * estar verificado contra el comportamiento real del motor.
 *
 * Corre como global de navegador (define window.Engine) y como módulo de Node
 * (module.exports). Sin build step ni ES Modules, coherente con la decisión de
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

    // Escalas: fórmula interválica (T-T-S...) por tipo de universo.
    const SCALES = {
        'major':          { f: [2, 2, 1, 2, 2, 2, 1], n: 'Mayor' },
        'minor':          { f: [2, 1, 2, 2, 1, 2, 2], n: 'Menor Natural' },
        'harmonic_minor': { f: [2, 1, 2, 2, 1, 3, 1], n: 'Menor Armónica' }
    };

    // Plantillas de acordes: intervalos desde la raíz (pitch class 0).
    const CHORD_TEMPLATES = {
        'M': [0, 4, 7], 'm': [0, 3, 7], 'dim': [0, 3, 6], 'aug': [0, 4, 8],
        'sus4': [0, 5, 7], 'sus2': [0, 2, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10],
        'M7': [0, 4, 7, 11], 'm7b5': [0, 3, 6, 10], 'dim7': [0, 3, 6, 9],
        '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9], 'add9': [0, 2, 4, 7], 'madd9': [0, 2, 3, 7],
        '7(no5)': [0, 4, 10], 'm7(no5)': [0, 3, 10]
    };

    // Motor matemático. Copiado tal cual de index.html v11.0.
    const MathEngine = {
        detectChord(notesArray) {
            if (notesArray.length < 3) return null;
            const pitchClasses = [...new Set(notesArray.map(n => n % 12))].sort((a, b) => a - b);
            const bassPC = Math.min(...notesArray) % 12;
            // Fase 1: se prueba el bajo real como raíz candidata antes del orden
            // ascendente. Una tríada en fundamental o con bajo claro se identifica
            // con su raíz real; solo se cae al orden numérico cuando el bajo no arma
            // un template por sí solo (inversión real). La-Do-Mi-Sol con bajo en La
            // da La m7, no Do6. Ver docs/DECISIONS.md (2026-07-04).
            const candidateRoots = [bassPC, ...pitchClasses.filter(pc => pc !== bassPC)];
            for (const root of candidateRoots) {
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

    // Pitch classes de un universo (root más tipo de escala).
    // Espejo puro de UI.buildUniverse en index.html: mismo recorrido de la
    // fórmula interválica, sin armar el HTML. Es el único derivado que queda por
    // duplicado. Los dos leen la misma constante SCALES, así que si tocás uno,
    // tocás el otro.
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

    // Relación del acorde con el universo activo.
    // Espejo puro de UI.updateStatus (heurística de dominante secundaria e
    // intercambio modal). Devuelve un código estable, no el texto de la UI.
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

    // Estado de una nota de melodía.
    // Espejo puro de MIDI.evaluateMelody (la parte determinística, sin timers).
    // chordObj puede ser null cuando no hay contexto armónico activo.
    function evaluateMelodyStatus({ pc, universePitchesSet, chordObj, universeType, universeRoot }) {
        const inScale = universePitchesSet.has(pc);
        const inChord = !!chordObj && chordObj.template.some(i => (chordObj.rootPC + i) % 12 === pc);
        const isMinor = universeType === 'minor' || universeType === 'harmonic_minor';
        const sensiblePC = (universeRoot + 11) % 12;
        const isSensible = isMinor && pc === sensiblePC && !inScale && !inChord;

        if (inScale || inChord) return 'good';
        // Fase 3: el tono conductor de una dominante secundaria hacia un grado de tríada
        // mayor se acepta aunque el acorde no suene. Es lo que cierra el gap de Oda: Fa#
        // sobre Do Mayor empuja a Sol (V) y deja de marcar error. Derivado, no hardcodeado
        // (ver isSecondaryDominantLeadingTone); en Re menor Sol# empuja a La, tríada menor,
        // así que sigue 'bad'.
        if (isSecondaryDominantLeadingTone(pc, universePitchesSet)) return 'good';
        if (isSensible) return 'tension';
        return 'bad';
    }

    // Indulto por paso cromático.
    // Espejo puro de MIDI.releaseNoteInternal: cualquier nota no-'good' que dure
    // menos de PASSING_TONE_MS al soltarse pasa a 'passing'. El umbral de 180 ms
    // se calibró a mano contra Bad Apple, no se derivó de nada (docs/DECISIONS.md).
    const PASSING_TONE_MS = 180;
    function applyPassingTone(status, durationMs) {
        if (status !== 'good' && durationMs < PASSING_TONE_MS) return 'passing';
        return status;
    }

    // Grados de la escala activa en orden, uno por nota (7 pitch classes). Mismo recorrido
    // de la fórmula interválica que scalePitches, pero conservando el orden para ubicar un
    // acorde por su raíz y sacar su número de grado.
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    function scaleDegreesOrdered(root, type) {
        const scaleDef = SCALES[type];
        const degrees = [root % 12];
        let current = root;
        scaleDef.f.forEach(step => {
            current += step;
            if (current - root < 12) degrees.push(current % 12);
        });
        return degrees;
    }

    // Numeral romano del acorde contra la escala activa. Todo derivado: el grado sale de
    // ubicar chordObj.rootPC en la escala, la caja (mayúscula o minúscula) de la tercera del
    // acorde, y el sufijo de la quinta y el séptimo. No hay tabla fija de grados ni notas
    // escritas a mano. TRAMPA evitada (Fase 3): el objetivo de una dominante secundaria se
    // calcula como cualquier grado; pasándole una tríada mayor sale en mayúscula ('V'), no
    // se fuerza a minúscula.
    function getRomanNumeral(chordObj, universeRoot, universeType) {
        const order = scaleDegreesOrdered(universeRoot, universeType);
        let idx = order.indexOf(chordObj.rootPC);
        let accidental = '';
        for (let below = 1; below <= 11 && idx === -1; below++) {
            idx = order.indexOf((chordObj.rootPC - below + 12) % 12);
            if (idx !== -1) accidental = '#'.repeat(below);
        }
        if (idx === -1) return '?';

        const tpl = chordObj.template || CHORD_TEMPLATES[chordObj.type] || [];
        const has = i => tpl.includes(i);
        const minorThird = has(3) && !has(4);
        const dimFifth = has(6) && !has(7);
        const augFifth = has(8) && !has(7);

        let numeral = ROMAN[idx];
        if (minorThird) numeral = numeral.toLowerCase();
        numeral = accidental + numeral;

        let suffix = '';
        if (dimFifth && has(9) && !has(10)) suffix = '°7';
        else if (dimFifth && has(10)) suffix = 'ø7';
        else if (dimFifth) suffix = '°';
        else if (augFifth) suffix = '+';
        else if (has(11)) suffix = 'M7';
        else if (has(10)) suffix = '7';

        return numeral + suffix;
    }

    // Tono conductor de una dominante secundaria hacia un grado de tríada mayor. Derivado:
    // la nota es cromática (no está en la escala), resuelve un semitono arriba a una nota de
    // la escala, y ese destino tiene tercera mayor y quinta justa diatónicas, o sea arma una
    // V/grado real. Funciona en cualquier tono. Es lo que separa Fa# sobre Do Mayor (empuja
    // a Sol, tríada mayor: se acepta) de Sol# sobre Re menor (empuja a La, tríada menor: no).
    function isSecondaryDominantLeadingTone(pc, universePitchesSet) {
        if (universePitchesSet.has(pc)) return false;
        const target = (pc + 1) % 12;
        if (!universePitchesSet.has(target)) return false;
        return universePitchesSet.has((target + 4) % 12) && universePitchesSet.has((target + 7) % 12);
    }

    // Función tonal del acorde en la tonalidad activa (Fase 4). Salida del motor, no
    // característica: el buffer la consume, ningún panel la hardcodea. Deriva por índice de
    // grado vía scaleDegreesOrdered, así que V es dominante en cualquier tonalidad mayor; no
    // hay nombres de nota ni de tono en la lógica. La agrupación por grado es la teoría fija
    // escrita en el Track paralelo del ROADMAP, no un hardcode de tono:
    //   Tónica: I, iii, vi (índices 0, 2, 5)
    //   Subdominante: ii, IV (índices 1, 3)
    //   Dominante: V, vii° (índices 4, 6)
    // La menor todavía no tiene teoría escrita: devuelve 'por_definir', no se inventa. Un
    // acorde no diatónico no recibe función diatónica ('no_diatonica'): su carácter lo da la
    // relación de la Fase 3, no una función forzada.
    const TONAL_FUNCTION_BY_DEGREE = {
        0: 'tonica', 2: 'tonica', 5: 'tonica',
        1: 'subdominante', 3: 'subdominante',
        4: 'dominante', 6: 'dominante'
    };
    function getTonalFunction(chordObj, universeRoot, universeType) {
        if (universeType !== 'major') return 'por_definir';
        const pitches = scalePitches(universeRoot, universeType);
        if (!MathEngine.isDiatonic(chordObj, pitches)) return 'no_diatonica';
        const idx = scaleDegreesOrdered(universeRoot, universeType).indexOf(chordObj.rootPC);
        return TONAL_FUNCTION_BY_DEGREE[idx] || 'por_definir';
    }

    // El ROADMAP habla de MathEngine.getRomanNumeral; se cuelgan acá además de exportarse
    // sueltos, para las dos formas de llamarlos.
    MathEngine.getRomanNumeral = getRomanNumeral;
    MathEngine.isSecondaryDominantLeadingTone = isSecondaryDominantLeadingTone;
    MathEngine.getTonalFunction = getTonalFunction;

    return {
        SCALES,
        CHORD_TEMPLATES,
        MathEngine,
        scalePitches,
        classifyChordRelation,
        evaluateMelodyStatus,
        applyPassingTone,
        getRomanNumeral,
        isSecondaryDominantLeadingTone,
        getTonalFunction,
        scaleDegreesOrdered,
        PASSING_TONE_MS
    };
}));
