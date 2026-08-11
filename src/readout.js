// readout.js: el objeto Readout, el widget de salida del motor. Solo lee y presenta:
// no cambia ningún valor del sistema salvo el buffer de función tonal que el motor deriva.

const Readout = {
    _lastAnalysisSig: null,
    updateStatus() {
        document.getElementById('bass-count').innerText = State.midi.activeBasses.size;
        document.getElementById('mel-count').innerText = State.midi.activeMelodies.size;
        if(State.harmony.chord) {
            const c = State.harmony.chord;
            document.getElementById('chord-display').innerText = `${getNoteStr(c.rootPC).name}${c.type==='M'?'':c.type}`;
            document.getElementById('chord-inversion').innerText = c.inversion;

            // Relación acorde/universo (diatónico / dom. secundaria / intercambio
            // modal) y numeral romano: lógica en src/engine.js, acá el texto de la UI
            // y el log. Fase 3: el numeral sale de getRomanNumeral, derivado. El
            // objetivo de la V/V también sale de getRomanNumeral, en mayúscula.
            const rel = classifyChordRelation(c, State.universe.validPitches);
            const numeral = MathEngine.getRomanNumeral(c, State.universe.root, State.universe.type);
            const targetNumeral = rel.targetPC !== null
                ? MathEngine.getRomanNumeral({ rootPC: rel.targetPC, type: 'M', template: CHORD_TEMPLATES.M }, State.universe.root, State.universe.type)
                : null;

            // Fase 4: la función tonal es salida del motor y se guarda en el buffer.
            // El incremento 5.5.1 la muestra, con los cinco valores que el motor puede
            // devolver, incluidos los dos que admiten que no sabe. Maquillarlos sería la
            // misma clase de mentira que el rótulo que el 5.5.2 corrige.
            const funcion = MathEngine.getTonalFunction(c, State.universe.root, State.universe.type);
            State.harmony.function = funcion;
            const funEl = document.getElementById('chord-function');
            funEl.innerText = TEXTO_FUNCION[funcion] || funcion;
            funEl.style.color = COLOR_FUNCION[funcion] || 'var(--text-muted)';

            // Decisión del log (2026-07-25): la relación, el numeral y la función van
            // al log, no solo al buffer. Se loguea al cambiar el análisis, para no
            // repetir la misma línea por nota.
            const sig = `${numeral}|${rel.relation}|${rel.targetPC}|${funcion}`;
            if (sig !== Readout._lastAnalysisSig) {
                Readout._lastAnalysisSig = sig;
                const objetivo = (rel.relation === 'secondary_dominant' && targetNumeral)
                    ? `${targetNumeral} (${getNoteStr(rel.targetPC).name})` : 'ninguno';
                SysLog('MATH', `Análisis: ${getNoteStr(c.rootPC).name}${c.type==='M'?'':c.type} = ${numeral} · relación ${rel.relation} · objetivo ${objetivo} · función ${funcion}`);
            }

            // "Intercambio Modal" prometía un análisis que el motor nunca hizo: ese valor
            // era el return final de la cascada, o sea el cajón de todo lo que no se supo
            // clasificar. "Sin clasificar" dice el estado del análisis y no juzga el acorde.
            // Es la segunda aplicación del principio del incremento 5.5.1: lo que el motor
            // admite no saber no se oculta ni se maquilla.
            const relEl = document.getElementById('chord-relation');
            if (rel.relation === 'diatonic') {
                relEl.innerText = `Diatónico · ${numeral}`;
                relEl.style.color = 'var(--text-main)';
            } else if (rel.relation === 'secondary_dominant') {
                relEl.innerText = `${numeral} (V del ${targetNumeral}) empuja a ${getNoteStr(rel.targetPC).name}`;
                relEl.style.color = 'var(--text-main)';
            } else {
                relEl.innerText = `Sin clasificar · ${numeral}`;
                relEl.style.color = 'var(--text-muted)';
            }
        } else {
            document.getElementById('chord-display').innerText = '-';
            document.getElementById('chord-inversion').innerText = '-';
            // El color vuelve al primario junto con el guion. Sin esto, un acorde que
            // el motor no supo clasificar dejaba las dos lecturas en secundario después
            // de soltarlo, así que el mismo guion se veía de dos colores según lo que
            // hubiera sonado antes. El secundario dice "el motor admite no saber", no
            // "acá no hay nada".
            const relVacio = document.getElementById('chord-relation');
            const funVacio = document.getElementById('chord-function');
            relVacio.innerText = '-'; relVacio.style.color = 'var(--text-main)';
            funVacio.innerText = '-'; funVacio.style.color = 'var(--text-main)';
            State.harmony.function = null;
            Readout._lastAnalysisSig = null;
        }
    },
};
