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
}

function runMelodyCase(fx, universePitches, c) {
    const chord = chordFromNotes(c.chordNotes);
    const status = Engine.evaluateMelodyStatus({
        pc: c.melodyNote % 12,
        universePitchesSet: universePitches,
        chordObj: chord,
        universeType: fx.universe.type,
        universeRoot: fx.universe.root
    });
    assert.strictEqual(status, c.expected.status,
        `status: esperaba '${c.expected.status}', obtuve '${status}'`);
}

function runPassingCase(fx, universePitches, c) {
    const status = Engine.applyPassingTone(c.status, c.durationMs);
    assert.strictEqual(status, c.expected.status,
        `status: esperaba '${c.expected.status}', obtuve '${status}'`);
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
