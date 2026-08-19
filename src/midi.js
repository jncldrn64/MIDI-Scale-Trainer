// midi.js: el objeto MIDI. Cortado de index.html en la partición, sin mover nada.

// --- CONTROLADOR MIDI ---
const MIDI = {
    init() {
        if(navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(access => {
                State.midi.access = access;
                this.bindDevices();
                access.onstatechange = (e) => {
                    // Tipo e identificador van en la línea porque un dispositivo expone
                    // puertos de entrada y de salida por separado, cada uno con su evento.
                    // Sin ellos, tres líneas con el mismo nombre pueden ser tres puertos
                    // distintos o el mismo evento tres veces, y no había forma de saberlo.
                    SysLog('SYS', `Puerto MIDI ${e.port.type} "${e.port.name}" (id ${e.port.id}): ${e.port.state}`);
                    this.bindDevices();
                };
            }).catch(e => SysLog('ERROR', 'MIDI denegado'));
        }
    },
    bindDevices() {
        // Hasta la v11.79 esta función solo enganchaba `onmidimessage` y nunca llamaba a
        // `input.open()`. La apertura implícita del navegador puede fallar con un puerto que
        // quedó de una sesión anterior sin cerrar, y `onstatechange` no rescata el caso porque
        // solo se dispara cuando algo cambia: un puerto que ya figura como conectado no lo
        // dispara nunca. Eso explicaría el ritual de apagar y encender el teclado tras recargar,
        // que fuerza una desconexión seguida de una conexión. Es hipótesis, no hecho: no está
        // reproducida en una corrida, y la corroboración pide el dispositivo físico.
        //
        // Lo que sí cambia acá y no depende de la hipótesis: el estado de cada puerto al arrancar
        // se registra. Sin esa línea el defecto era invisible, porque el log solo hablaba de
        // puertos cuando ya habían cambiado de estado.
        let vistos = 0;
        for (let input of State.midi.access.inputs.values()) {
            vistos++;
            SysLog('MIDI', `Puerto de entrada "${input.name}" (id ${input.id}): estado ${input.state}, conexión ${input.connection}, fabricante ${input.manufacturer || 'sin declarar'}.`);
            if (!input.onmidimessage) {
                input.onmidimessage = (msg) => this.processMsg(msg);
                SysLog('MIDI', `Listo: ${input.name}`);
            } else {
                SysLog('MIDI', `Ya enganchado, no se vuelve a enganchar: ${input.name}.`);
            }
            // Apertura explícita, y se espera la promesa antes de darlo por listo. Un puerto ya
            // abierto la resuelve igual, así que llamar de más no cuesta nada.
            if (input.connection !== 'open') {
                input.open().then(
                    (p) => SysLog('MIDI', `Puerto "${p.name}" abierto explícitamente: conexión ${p.connection}.`),
                    (e) => SysLog('ERROR', `⚠ El puerto "${input.name}" no abrió: ${e}. El teclado no va a responder hasta apagarlo y encenderlo.`)
                );
            } else {
                SysLog('MIDI', `Puerto "${input.name}" ya venía abierto, no se vuelve a abrir.`);
            }
        }
        if (vistos === 0) SysLog('MIDI', '⚠ Ningún puerto de entrada MIDI enumerado. Sin dispositivo, las teclas clicables de Opciones son la única entrada.');
    },
    // Entrada sustituta del teclado de pantalla. Fabrica los tres bytes y los mete por
    // `processMsg`, que es la misma puerta por la que entra el dispositivo físico y que no
    // pregunta de dónde vino el mensaje. Entrar por acá y no por `evaluateMelody` es lo que
    // hace que el clic ejercite el corrimiento de estado, el split, la acumulación de bajos y
    // la retención del contexto. Un clic que fuera directo a la evaluación probaría el motor y
    // dejaría el camino de eventos sin probar, que es donde vivió el defecto del acorde pegado.
    // Ver DECISIONS, 2026-08-19, "El clic entra por el camino MIDI, no por el motor".
    VELOCIDAD_CLIC: 100,
    entradaSintetica(note, encendido) {
        const bytes = encendido
            ? [0x90, note, this.VELOCIDAD_CLIC]
            : [0x80, note, 0];
        SysLog('MIDI', `Entrada sustituta: ${encendido ? 'NOTE ON' : 'NOTE OFF'} ${getNoteStr(note).name} (${note}), velocidad ${bytes[2]}, bytes [${bytes.join(', ')}]. Entra por processMsg, igual que el dispositivo.`);
        this.processMsg({ data: bytes });
    },
    processMsg(msg) {
        const [cmd, data1, data2] = msg.data; 
        const status = cmd >> 4;
        
        // Soporte nativo para Pedal Sustain (CC 64)
        if (status === 11 && data1 === 64) { 
            this.handleSustain(data2 >= 64);
            return;
        }

        if(status === 9 && data2 > 0) this.noteOn(data1, data2);
        else if(status === 8 || (status === 9 && data2 === 0)) this.noteOff(data1);
    },
    handleSustain(isOn) {
        State.midi.sustainActive = isOn;
        SysLog('MIDI', `Pedal Sustain: ${isOn ? 'ON' : 'OFF'}`);
        
        if (!isOn) {
            for (let note of State.midi.activeBasses) {
                if (!State.midi.keysDown.has(note)) this.releaseNoteInternal(note, true);
            }
            for (let note of State.midi.activeMelodies) {
                if (!State.midi.keysDown.has(note)) this.releaseNoteInternal(note, false);
            }
            Teclado.renderKeyboard(); Readout.updateStatus();
        }
    },
    noteOn(note, vel) {
        State.midi.keysDown.add(note); 
        SysLog('MIDI', `DOWN: ${getNoteStr(note).name} (${note})`);
        if(note < State.config.splitNote) { State.midi.activeBasses.add(note); this.triggerAccumulation(); }
        else { State.midi.activeMelodies.add(note); this.evaluateMelody(note); }
        Teclado.renderKeyboard(); Readout.updateStatus();
    },
    noteOff(note) {
        State.midi.keysDown.delete(note); 
        SysLog('MIDI', `UP: ${getNoteStr(note).name} (${note})`);
        if (State.midi.sustainActive) return; 
        this.releaseNoteInternal(note, note < State.config.splitNote);
        Teclado.renderKeyboard(); Readout.updateStatus();
    },
    releaseNoteInternal(note, isBass) {
        const ev = State.evaluations.get(note);

        // El indulto solo aplica a la melodía, que es lo único que tiene evaluación. Un bajo
        // nunca crea una, porque noteOn solo llama a evaluateMelody para las notas de arriba.
        if (ev) {
            // Indulto Heurístico: Pasos Cromáticos (lógica en src/engine.js)
            const duration = Date.now() - ev.startTime;
            const indultado = applyPassingTone(ev.status, duration);
            if (indultado !== ev.status) {
                ev.status = indultado;
                SysLog('EVAL', `PASO CROMÁTICO: ${getNoteStr(note).name} (${duration}ms)`);
            }
        }

        // El retiro de la nota de su conjunto aplica siempre, haya evaluación o no. Hasta la
        // v11.79 esto vivía adentro del `if (ev)` de arriba, así que soltar un bajo nunca armaba
        // el temporizador de liberación y el acorde detectado se quedaba pegado para siempre.
        if (isBass) {
            State.midi.activeBasses.delete(note);
            this.triggerContextTimeout();
        } else {
            State.midi.activeMelodies.delete(note);
            if (ev && ev.status === 'good') {
                clearTimeout(ev.timeout);
                State.evaluations.delete(note);
            }
        }
    },
    triggerAccumulation() {
        if(State.timers.accumulation) clearTimeout(State.timers.accumulation);
        if(State.midi.activeBasses.size >= 3 && !State.harmony.isLocked) {
            State.timers.accumulation = setTimeout(() => {
                const chord = MathEngine.detectChord(Array.from(State.midi.activeBasses));
                if(chord) { State.harmony.chord = chord; Armonia.clearEvaluations(); SysLog('MATH', 'Contexto: ' + getNoteStr(chord.rootPC).name + chord.type); }
                else { SysLog('MATH', '⚠️ Acorde no reconocido'); }
                Teclado.renderKeyboard(); Readout.updateStatus();
            }, State.config.accumMs); 
        }
    },
    triggerContextTimeout() {
        if(State.timers.contextHold) clearTimeout(State.timers.contextHold);
        SysLog('MATH', `Retención armada: el contexto se libera en ${State.config.holdMs} ms si no queda ningún bajo apretado. Bajos activos ahora: ${State.midi.activeBasses.size}.`);
        State.timers.contextHold = setTimeout(() => {
            if(!State.harmony.isLocked && State.midi.activeBasses.size === 0) {
                const c = State.harmony.chord;
                State.harmony.chord = null; Armonia.clearEvaluations(); Teclado.renderKeyboard(); Readout.updateStatus();
                SysLog('MATH', `Contexto liberado tras ${State.config.holdMs} ms: ${c ? getNoteStr(c.rootPC).name + c.type : 'no había acorde'}. El motor vuelve a evaluar solo contra el universo.`);
            } else {
                SysLog('MATH', `Retención vencida y el contexto se queda: ${State.harmony.isLocked ? 'el acorde está fijado a mano' : `todavía hay ${State.midi.activeBasses.size} bajo(s) apretado(s)`}.`);
            }
        }, State.config.holdMs); 
    },
    evaluateMelody(note) {
        // Lógica de clasificación (escala / acorde / sensible menor) en src/engine.js
        const evalStatus = evaluateMelodyStatus({
            pc: note % 12,
            universePitchesSet: State.universe.validPitches,
            chordObj: State.harmony.chord,
            universeType: State.universe.type,
            universeRoot: State.universe.root
        });

        if(State.evaluations.has(note)) clearTimeout(State.evaluations.get(note).timeout);
        
        const timeoutTime = evalStatus === 'good' ? 0 : State.config.errMs;
        const timeoutId = setTimeout(() => { State.evaluations.delete(note); Teclado.renderKeyboard(); }, timeoutTime);
        
        State.evaluations.set(note, { status: evalStatus, timeout: timeoutId, startTime: Date.now() });
        
        // Fase 3 / decisión del log (2026-07-25): el veredicto va al log con el
        // porqué, para que una sesión quede auditable. La razón se deriva igual que
        // en el motor: escala, acorde, tono conductor de dominante secundaria, sensible.
        const pc = note % 12;
        const c = State.harmony.chord;
        const inChord = !!c && c.template.some(i => (c.rootPC + i) % 12 === pc);
        let razon;
        if (State.universe.validPitches.has(pc)) razon = 'en la escala';
        else if (inChord) razon = 'en el acorde activo';
        else if (MathEngine.isSecondaryDominantLeadingTone(pc, State.universe.validPitches)) razon = 'tono conductor de dominante secundaria';
        else if (evalStatus === 'tension') razon = 'sensible menor';
        else razon = 'fuera de escala, acorde y tonicización';
        const etiqueta = evalStatus === 'good' ? 'OK' : (evalStatus === 'tension' ? 'TENSIÓN' : (evalStatus === 'passing' ? 'PASO' : 'ERROR'));
        SysLog('EVAL', `${etiqueta} ${getNoteStr(note).name} (${razon}) -> ${evalStatus}`);
        // El feedback suena acá, al apretar, y no al soltar: un sonido que llega cuando la nota
        // ya terminó no sirve para tocar. El indulto por paso cromático puede reclasificar esta
        // misma nota al soltarla, así que un error corto ya sonó como error. Es un falso positivo
        // declarado, no un descuido: ver DECISIONS, 2026-08-11, "El feedback de veredicto suena al
        // apretar, y el indulto no lo corrige".
        Sonido.veredicto(evalStatus);
    }
};
