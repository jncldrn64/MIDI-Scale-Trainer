// midi.js: el objeto MIDI. Cortado de index.html en la partición, sin mover nada.

// --- CONTROLADOR MIDI ---
const MIDI = {
    init() {
        if(navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(access => {
                State.midi.access = access;
                this.bindDevices();
                access.onstatechange = (e) => { SysLog('SYS', `Puerto MIDI: ${e.port.name} ${e.port.state}`); this.bindDevices(); };
            }).catch(e => SysLog('ERROR', 'MIDI denegado'));
        }
    },
    bindDevices() {
        for (let input of State.midi.access.inputs.values()) {
            if (!input.onmidimessage) {
                SysLog('MIDI', `Listo: ${input.name}`);
                input.onmidimessage = (msg) => this.processMsg(msg);
            }
        }
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
            UI.renderKeyboard(); UI.updateStatus();
        }
    },
    noteOn(note, vel) {
        State.midi.keysDown.add(note); 
        SysLog('MIDI', `DOWN: ${getNoteStr(note).name} (${note})`);
        if(note < State.config.splitNote) { State.midi.activeBasses.add(note); this.triggerAccumulation(); }
        else { State.midi.activeMelodies.add(note); this.evaluateMelody(note); }
        UI.renderKeyboard(); UI.updateStatus();
    },
    noteOff(note) {
        State.midi.keysDown.delete(note); 
        SysLog('MIDI', `UP: ${getNoteStr(note).name} (${note})`);
        if (State.midi.sustainActive) return; 
        this.releaseNoteInternal(note, note < State.config.splitNote);
        UI.renderKeyboard(); UI.updateStatus();
    },
    releaseNoteInternal(note, isBass) {
        const ev = State.evaluations.get(note);
        
        if (ev) {
            // Indulto Heurístico: Pasos Cromáticos (lógica en src/engine.js)
            const duration = Date.now() - ev.startTime;
            const indultado = applyPassingTone(ev.status, duration);
            if (indultado !== ev.status) {
                ev.status = indultado;
                SysLog('EVAL', `PASO CROMÁTICO: ${getNoteStr(note).name} (${duration}ms)`);
            }

            if (isBass) {
                State.midi.activeBasses.delete(note);
                this.triggerContextTimeout();
            } else {
                State.midi.activeMelodies.delete(note);
                if (ev.status === 'good') {
                    clearTimeout(ev.timeout);
                    State.evaluations.delete(note);
                }
            }
        } else {
            if (isBass) State.midi.activeBasses.delete(note);
            else State.midi.activeMelodies.delete(note);
        }
    },
    triggerAccumulation() {
        if(State.timers.accumulation) clearTimeout(State.timers.accumulation);
        if(State.midi.activeBasses.size >= 3 && !State.harmony.isLocked) {
            State.timers.accumulation = setTimeout(() => {
                const chord = MathEngine.detectChord(Array.from(State.midi.activeBasses));
                if(chord) { State.harmony.chord = chord; UI.clearEvaluations(); SysLog('MATH', 'Contexto: ' + getNoteStr(chord.rootPC).name + chord.type); }
                else { SysLog('MATH', '⚠️ Acorde no reconocido'); }
                UI.renderKeyboard(); UI.updateStatus();
            }, State.config.accumMs); 
        }
    },
    triggerContextTimeout() {
        if(State.timers.contextHold) clearTimeout(State.timers.contextHold);
        State.timers.contextHold = setTimeout(() => {
            if(!State.harmony.isLocked && State.midi.activeBasses.size === 0) {
                State.harmony.chord = null; UI.clearEvaluations(); UI.renderKeyboard(); UI.updateStatus();
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
        const timeoutId = setTimeout(() => { State.evaluations.delete(note); UI.renderKeyboard(); }, timeoutTime);
        
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
    }
};
