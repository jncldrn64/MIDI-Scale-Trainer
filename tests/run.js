#!/usr/bin/env node
/*
 * tests/run.js: runner de fixtures de regresión (Fase 0 del roadmap).
 *
 * Sin framework de testing. Node más assert, como pide docs/ROADMAP.md. Corre el
 * motor puro real (src/engine.js) contra los casos ya resueltos grabados en
 * tests/fixtures/*.json. Si una regla nueva rompe un caso viejo, este script lo
 * grita en vez de dejarlo pasar en silencio.
 *
 * Uso:
 *   node tests/run.js            # todas las fixtures
 *   node tests/run.js blues      # solo las fixtures cuyo archivo matchee
 *
 * Exit code 0 si pasa todo, 1 si algo falla. Sirve para CI más adelante.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Engine = require('../src/engine.js');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const filter = process.argv[2] || '';

const NOTE_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const pcName = pc => (pc === null || pc === undefined ? 'null' : NOTE_ES[pc]);

let passed = 0;
let failed = 0;
const failures = [];

function record(fixtureName, label, fn) {
    try {
        fn();
        passed++;
    } catch (err) {
        failed++;
        failures.push({ fixtureName, label, message: err.message });
    }
}

// Arma un chordObj (con template) a partir de notas MIDI, como lo haría el motor
// en vivo. Devuelve null si no hay notas o si el acorde no se reconoce.
function chordFromNotes(notes) {
    if (!notes) return null;
    return Engine.MathEngine.detectChord(notes);
}

function runChordCase(fx, universePitches, c) {
    const exp = c.expected;
    const chord = Engine.MathEngine.detectChord(c.notesPlayed);

    if (exp.detected === false) {
        assert.strictEqual(chord, null, `esperaba acorde no reconocido, obtuve ${JSON.stringify(chord)}`);
        return;
    }

    assert.ok(chord, 'esperaba un acorde reconocido, obtuve null');
    assert.strictEqual(chord.rootPC, exp.rootPC,
        `rootPC: esperaba ${pcName(exp.rootPC)}(${exp.rootPC}), obtuve ${pcName(chord.rootPC)}(${chord.rootPC})`);
    assert.strictEqual(chord.type, exp.type,
        `type: esperaba '${exp.type}', obtuve '${chord.type}'`);

    if ('isDiatonic' in exp) {
        const isDia = Engine.MathEngine.isDiatonic(chord, universePitches);
        assert.strictEqual(isDia, exp.isDiatonic,
            `isDiatonic: esperaba ${exp.isDiatonic}, obtuve ${isDia}`);
    }

    if ('relation' in exp) {
        const rel = Engine.classifyChordRelation(chord, universePitches);
        assert.strictEqual(rel.relation, exp.relation,
            `relation: esperaba '${exp.relation}', obtuve '${rel.relation}'`);
        if ('targetPC' in exp) {
            assert.strictEqual(rel.targetPC, exp.targetPC,
                `targetPC: esperaba ${pcName(exp.targetPC)}, obtuve ${pcName(rel.targetPC)}`);
        }
    }

    // Fase 3: numeral romano del acorde, derivado contra la tonalidad de la fixture.
    if ('numeral' in exp) {
        const num = Engine.getRomanNumeral(chord, fx.universe.root, fx.universe.type);
        assert.strictEqual(num, exp.numeral,
            `numeral: esperaba '${exp.numeral}', obtuve '${num}'`);
    }

    // Fase 3: el objetivo de la dominante secundaria, también por getRomanNumeral, y la
    // trampa de que nunca se fuerza a minúscula.
    if ('targetNumeral' in exp) {
        const rel = Engine.classifyChordRelation(chord, universePitches);
        const targetChord = { rootPC: rel.targetPC, type: 'M', template: Engine.CHORD_TEMPLATES.M };
        const tnum = Engine.getRomanNumeral(targetChord, fx.universe.root, fx.universe.type);
        assert.strictEqual(tnum, exp.targetNumeral,
            `targetNumeral: esperaba '${exp.targetNumeral}', obtuve '${tnum}'`);
        assert.strictEqual(tnum, tnum.toUpperCase(),
            `el objetivo de la dominante secundaria debe ir en mayúscula, obtuve '${tnum}'`);
    }

    // Fase 4: función tonal del acorde, derivada contra la tonalidad de la fixture.
    if ('function' in exp) {
        const fn = Engine.getTonalFunction(chord, fx.universe.root, fx.universe.type);
        assert.strictEqual(fn, exp.function,
            `function: esperaba '${exp.function}', obtuve '${fn}'`);
    }
}

function runMelodyCase(fx, universePitches, c) {
    // Un caso puede fijar su propia tonalidad (c.universe) para probar la misma regla en
    // otro tono; si no, usa la de la fixture.
    const uni = c.universe || fx.universe;
    const pitches = c.universe ? Engine.scalePitches(uni.root, uni.type) : universePitches;
    const chord = chordFromNotes(c.chordNotes);
    const status = Engine.evaluateMelodyStatus({
        pc: c.melodyNote % 12,
        universePitchesSet: pitches,
        chordObj: chord,
        universeType: uni.type,
        universeRoot: uni.root
    });
    assert.strictEqual(status, c.expected.status,
        `status: esperaba '${c.expected.status}', obtuve '${status}'`);
}

// Fase 3: numeral romano directo. El caso arma un acorde por rootPC y tipo, y afirma el
// numeral que getRomanNumeral deriva contra la tonalidad (propia del caso o de la fixture).
function runRomanCase(fx, c) {
    const uni = c.universe || fx.universe;
    const chord = {
        rootPC: c.chord.rootPC,
        type: c.chord.type,
        template: Engine.CHORD_TEMPLATES[c.chord.type]
    };
    const num = Engine.getRomanNumeral(chord, uni.root, uni.type);
    assert.strictEqual(num, c.expected.numeral,
        `numeral: esperaba '${c.expected.numeral}', obtuve '${num}'`);
}

// Fase 4: función tonal directa. Arma el acorde por rootPC y tipo, y afirma la función que
// getTonalFunction deriva contra la tonalidad (propia del caso o de la fixture).
function runFunctionCase(fx, c) {
    const uni = c.universe || fx.universe;
    const chord = {
        rootPC: c.chord.rootPC,
        type: c.chord.type,
        template: Engine.CHORD_TEMPLATES[c.chord.type]
    };
    const fn = Engine.getTonalFunction(chord, uni.root, uni.type);
    assert.strictEqual(fn, c.expected.function,
        `function: esperaba '${c.expected.function}', obtuve '${fn}'`);
}

function runPassingCase(fx, universePitches, c) {
    const status = Engine.applyPassingTone(c.status, c.durationMs);
    assert.strictEqual(status, c.expected.status,
        `status: esperaba '${c.expected.status}', obtuve '${status}'`);
}

// Resolución: un acorde se vuelve dominante secundaria por dónde resuelve, y hasta ahora ninguna
// fixture probaba el vínculo. Se probaban el Re7 y el Sol por separado, cada uno correcto por su
// cuenta, y nada decía que uno lleva al otro. Este caso toma los dos acordes y afirma que el
// objetivo que el motor le deriva al primero es la raíz del segundo.
//
// Es puro y barato: dos llamadas a detectChord y una a classifyChordRelation, sin tiempo ni DOM.
// No prueba que la secuencia haya ocurrido en el tiempo, que es otra cosa y pediría el arnés de
// eventos que el BACKLOG tiene anotado. Prueba la relación armónica entre los dos acordes.
function runResolutionCase(fx, universePitches, c) {
    const exp = c.expected;
    const desde = Engine.MathEngine.detectChord(c.fromNotes);
    const hacia = Engine.MathEngine.detectChord(c.toNotes);
    assert.ok(desde, `el acorde de partida no se reconoció: ${JSON.stringify(c.fromNotes)}`);
    assert.ok(hacia, `el acorde de llegada no se reconoció: ${JSON.stringify(c.toNotes)}`);

    assert.strictEqual(desde.type, exp.fromType,
        `tipo del acorde de partida: esperaba '${exp.fromType}', obtuve '${desde.type}'`);
    assert.strictEqual(hacia.rootPC, exp.toRootPC,
        `raíz del acorde de llegada: esperaba ${pcName(exp.toRootPC)}, obtuve ${pcName(hacia.rootPC)}`);

    const rel = Engine.classifyChordRelation(desde, universePitches);
    assert.strictEqual(rel.relation, exp.fromRelation,
        `relación del acorde de partida: esperaba '${exp.fromRelation}', obtuve '${rel.relation}'`);

    // Lo que este tipo de caso existe para probar: el objetivo derivado del primero es la raíz
    // del segundo. Si el motor cambia cómo deriva el objetivo, esto se cae acá y no en la UI.
    assert.strictEqual(rel.targetPC, hacia.rootPC,
        `el objetivo de la dominante secundaria debería ser la raíz del acorde de llegada: ` +
        `esperaba ${pcName(hacia.rootPC)}, el motor derivó ${pcName(rel.targetPC)}`);
}

function runFixture(file) {
    const fx = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8'));
    const universePitches = Engine.scalePitches(fx.universe.root, fx.universe.type);

    console.log(`\n▸ ${fx.title || fx.name}  (${file})`);
    console.log(`  universo: ${pcName(fx.universe.root)} ${fx.universe.type} -> {${[...universePitches].sort((a, b) => a - b).map(pcName).join(', ')}}`);

    fx.cases.forEach(c => {
        record(fx.name, c.label, () => {
            if (c.kind === 'chord') runChordCase(fx, universePitches, c);
            else if (c.kind === 'melody') runMelodyCase(fx, universePitches, c);
            else if (c.kind === 'passing') runPassingCase(fx, universePitches, c);
            else if (c.kind === 'roman') runRomanCase(fx, c);
            else if (c.kind === 'function') runFunctionCase(fx, c);
            else if (c.kind === 'resolution') runResolutionCase(fx, universePitches, c);
            else throw new Error(`kind desconocido: '${c.kind}'`);
        });
        const last = failures.length && failures[failures.length - 1].label === c.label;
        console.log(`    ${last ? '✗' : '✓'} ${c.label}`);
    });
}

const files = fs.readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => f.includes(filter))
    .sort();

if (files.length === 0) {
    console.error(`No hay fixtures que matcheen '${filter}' en ${FIXTURES_DIR}`);
    process.exit(1);
}

files.forEach(runFixture);

console.log(`\n${'─'.repeat(60)}`);
if (failed === 0) {
    console.log(`✓ Todas las fixtures pasan: ${passed} casos.`);
    process.exit(0);
} else {
    console.log(`✗ ${failed} caso(s) fallan, ${passed} pasan.\n`);
    failures.forEach(f => console.log(`  ✗ [${f.fixtureName}] ${f.label}\n      ${f.message}`));
    process.exit(1);
}
