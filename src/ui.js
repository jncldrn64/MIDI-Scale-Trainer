// ui.js: el objeto UI y las dos funciones de configuración persistida. Cortado de index.html en la partición, sin mover nada.

// --- INTERFAZ DE USUARIO ---
const UI = {
    _lastAnalysisSig: null,
    buildUniverse() {
        State.universe.root = parseInt(document.getElementById('root-select').value);
        State.universe.type = document.getElementById('scale-select').value;
        const scaleDef = SCALES[State.universe.type];
        State.universe.validPitches.clear();
        
        let current = State.universe.root; 
        State.universe.validPitches.add(current % 12);
        
        // Grilla de dos filas: la etiqueta del paso va arriba, en la misma columna que
        // la barra que separa los dos grados a los que se refiere. `T+S` nombra el salto
        // de tres semitonos de la menor armónica y no se abrevia: colapsarlo a `T` lo
        // volvería indistinguible de un tono, y esa distinción es la que le da su sonido.
        // La columna va explícita en cada elemento. Sin ella, el autoposicionamiento de
        // CSS Grid usa un cursor que no retrocede: pone los seis rótulos en las columnas
        // 1 a 6 de la fila de arriba mientras las notas y las barras ocupan las trece de
        // abajo, y el rótulo deja de caer sobre su barra. El grado con índice i va a la
        // columna 2i+1, y su etiqueta y su barra a la 2i+2.
        let i = 0;
        let html = `<span class="f-note" style="grid-column:1">${getNoteStr(current).name}</span>`;

        scaleDef.f.forEach(step => {
            current += step;
            if(current - State.universe.root < 12) {
                State.universe.validPitches.add(current % 12);
                let label = step === 1 ? 'S' : (step === 2 ? 'T' : 'T+S');
                const colSep = 2 * i + 2, colNota = 2 * i + 3;
                html += `<span class="f-step" style="grid-column:${colSep}">${label}</span>`
                      + `<span class="f-bar" style="grid-column:${colSep}">|</span>`
                      + `<span class="f-note" style="grid-column:${colNota}">${getNoteStr(current).name}</span>`;
                i++;
            }
        });
        
        document.getElementById('formula-display').innerHTML = html;
        this.renderKeyboard(); 
        this.updateStatus();
    },
    // El teclado de 88 teclas, de borde a borde. El ancho de la blanca se deriva del
    // ancho disponible dividido las 52 blancas, así que no hay medida fija ni
    // transform: scale(), que dibujaba más chico sin achicar la caja de layout y
    // dejaba una franja muerta debajo.
    //
    // El alto sale de la fórmula del lienzo aplicada a un solo número, los 140 px de
    // lienzo que fija la entrada de decisiones del 2026-08-10 "Alto de la tecla
    // blanca". Esto NO es la migración al lienzo, que es el primer trabajo declarado
    // de la Fase 5B: es la fórmula usada por adelantado para el único número que hoy
    // la necesita. El resto de las medidas sigue como está.
    buildKeyboard() {
        const kb = document.getElementById('keyboard');
        const wrapper = document.getElementById('keyboard-wrapper');
        kb.innerHTML = '';
        const whites = [];
        for(let i=KEYBOARD_START; i<=KEYBOARD_END; i++) {
            if(!BLACK_KEYS.includes(i%12)) whites.push(i);
        }

        const anchoBlanca = wrapper.clientWidth / whites.length;   // el contenedor mide el lienzo entero
        // El alto son 140 px de lienzo planos. La fórmula de escala que había acá se
        // borró: era el lienzo aplicado por adelantado a este único número, y ahora el
        // cascarón escala todo. Dejar las dos cosas aplicaría la escala dos veces.
        const altoBlanca = 140;
        // La negra conserva su proporción: 0.62 del ancho y del alto de la blanca. A
        // 0.80 el blanco visible entre dos negras cae de 9.4 px a 4.9 px y el teclado
        // deja de leerse como teclado. Un piano real va en 0.58.
        const anchoNegra = anchoBlanca * 0.62, altoNegra = altoBlanca * 0.62;
        const fuente = Math.max(6, Math.round(anchoBlanca * 0.34));

        kb.style.width = `${wrapper.clientWidth}px`;
        kb.style.height = `${altoBlanca}px`;
        kb.style.setProperty('--sym', `${Math.round(anchoBlanca * 0.72)}px`);

        whites.forEach((m, idx) => {
            const d = document.createElement('div'); d.className='key white'; d.id=`k-${m}`;
            d.style.width=`${anchoBlanca}px`; d.style.height=`${altoBlanca}px`;
            d.style.left=`${idx*anchoBlanca}px`; d.style.fontSize=`${fuente}px`;
            kb.appendChild(d);
        });
        for(let m=KEYBOARD_START; m<=KEYBOARD_END; m++) {
            if(BLACK_KEYS.includes(m%12)) {
                const d = document.createElement('div'); d.className='key black'; d.id=`k-${m}`;
                d.style.width=`${anchoNegra}px`; d.style.height=`${altoNegra}px`;
                const prevW = whites.filter(w=>w<m).length;
                d.style.left=`${(prevW*anchoBlanca)-(anchoNegra/2)}px`; kb.appendChild(d);
            }
        }
        SysLog('LAYOUT', `Teclado de ${KEYBOARD_END - KEYBOARD_START + 1} teclas (MIDI ${KEYBOARD_START} a ${KEYBOARD_END}), ${whites.length} blancas, de borde a borde en ${Math.round(wrapper.clientWidth)} px.`);
        SysLog('LAYOUT', `Ancho de blanca ${anchoBlanca.toFixed(2)} px; negra ${anchoNegra.toFixed(2)} px al 0.62, deja ${(anchoBlanca - anchoNegra).toFixed(1)} px de blanco visible entre negras.`);
        SysLog('LAYOUT', `Alto de blanca ${altoBlanca} px de lienzo, negra ${Math.round(altoNegra)} px. Planos: el cascarón del lienzo aplica la escala una sola vez.`);
        this.renderKeyboard();
    },
    renderKeyboard() {
        for(let i=KEYBOARD_START; i<=KEYBOARD_END; i++) {
            const key = document.getElementById(`k-${i}`); if(!key) continue;
            const pc = i % 12; let color = 'color-inactive';
            
            if(State.harmony.chord && State.harmony.chord.rawNotes.includes(i)) {
                color = 'color-chord';
            } else if(State.evaluations.has(i)) {
                const status = State.evaluations.get(i).status;
                color = status === 'good' ? 'color-good' : (status === 'tension' ? 'color-tension' : (status === 'passing' ? 'color-passing' : 'color-bad'));
            } else if(State.midi.activeBasses.has(i) || State.midi.activeMelodies.has(i)) {
                color = State.universe.validPitches.has(pc) ? 'color-good' : 'color-inactive';
            } else if(State.universe.validPitches.has(pc)) {
                color = 'color-scale';
            }
            
            // Las negras dejan de llevar nombre: a 24.6 px de blanca la negra mide
            // 15.3 px y ningún texto de tres caracteres entra ahí legible. Conservan
            // color y símbolo de veredicto, que es la información que importa. El
            // interruptor para apagar los nombres es del incremento 5.4.
            const esNegra = BLACK_KEYS.includes(pc);
            const marca = (State.ui.marcaSplit && i === State.config.splitNote) ? ' split-mark' : '';
            key.className = `key ${esNegra?'black':'white'} ${color}${marca}`;
            key.innerHTML = (esNegra || !State.config.nombresTecla) ? '' : `<span>${getNoteStr(i).name}</span>`;
        }
    },
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
            if (sig !== UI._lastAnalysisSig) {
                UI._lastAnalysisSig = sig;
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
            document.getElementById('chord-relation').innerText = '-';
            document.getElementById('chord-function').innerText = '-';
            State.harmony.function = null;
            UI._lastAnalysisSig = null;
        }
    },
    clearEvaluations() { State.evaluations.forEach(v => clearTimeout(v.timeout)); State.evaluations.clear(); },
    lockChord(notes, type) {
        const root = notes[0]%12;
        State.harmony.chord = { rootPC: root, type, bassPC: root, inversion: 'Fijado', rawNotes: notes, template: CHORD_TEMPLATES[type] };
        State.harmony.isLocked = true;
        const btn = document.getElementById('btn-lock'); btn.innerText = "Motor Pausado"; btn.className = "btn btn-success";
        this.clearEvaluations(); this.renderKeyboard(); this.updateStatus();
    },
    unlockChord() {
        State.harmony.isLocked = false; State.harmony.chord = null;
        const btn = document.getElementById('btn-lock'); btn.innerText = "Motor Automático"; btn.className = "btn btn-warning";
        this.clearEvaluations(); this.renderKeyboard(); this.updateStatus();
    }
};

// --- INICIALIZACIÓN Y PERSISTENCIA ---
function saveConfig() { localStorage.setItem('midiTrainerCfg', JSON.stringify(State.config)); }
function loadConfig() { const saved = localStorage.getItem('midiTrainerCfg'); if (saved) State.config = { ...State.config, ...JSON.parse(saved) }; }
