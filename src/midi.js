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
            }).catch(e => {
                SysLog('ERROR', `⚠ MIDI denegado: ${e}. Ningún puerto se va a enumerar en esta carga.`);
                Feedback.avisar('El navegador negó el acceso MIDI, así que no se puede leer ningún teclado. Recargá y aceptá el permiso. Mientras tanto, podés tocar con el ratón encendiendo "Teclas clicables" en Opciones.');
            });
        } else {
            SysLog('ERROR', '⚠ Este navegador no expone navigator.requestMIDIAccess, así que no hay Web MIDI.');
            Feedback.avisar('Este navegador no soporta Web MIDI, así que no puede leer un teclado. Podés tocar con el ratón encendiendo "Teclas clicables" en Opciones.');
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
        const reales = [], virtuales = [];
        for (let input of State.midi.access.inputs.values()) {
            vistos++;
            // Los siete campos que `MIDIPort` expone son id, name, manufacturer, version, type,
            // state y connection, comprobado enumerando su prototipo en Chromium. Ninguno dice si
            // el puerto es un dispositivo o un puerto virtual del sistema, así que no hay un dato
            // que lo declare y hay que inferirlo. El único que separa los dos casos observados es
            // el fabricante: un teclado real lo trae y un puerto virtual lo deja vacío. Es una
            // heurística sobre una observación, no una garantía de la interfaz, así que la línea
            // imprime también version y name para que la clasificación se pueda auditar y
            // desmentir con una corrida.
            const esReal = !!(input.manufacturer && input.manufacturer.trim());
            (esReal ? reales : virtuales).push(input.name);
            SysLog('MIDI', `Puerto de entrada "${input.name}" (id ${input.id}): estado ${input.state}, conexión ${input.connection}, fabricante ${input.manufacturer || 'sin declarar'}, versión ${input.version || 'sin declarar'}. Se cuenta como ${esReal ? 'dispositivo real, porque declara fabricante' : 'puerto virtual del sistema, porque no declara fabricante'}.`);
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
        // El resumen al terminar de enganchar. Sin esto, no encontrar ningún teclado se veía
        // exactamente igual que encontrarlo: se toca y no pasa nada, sin ninguna pista de por qué.
        SysLog('MIDI', `Resumen de puertos de entrada: ${vistos} enumerado(s), ${reales.length} dispositivo(s) real(es)${reales.length ? ' (' + reales.join(', ') + ')' : ''} y ${virtuales.length} puerto(s) virtual(es) del sistema${virtuales.length ? ' (' + virtuales.join(', ') + ')' : ''}.`);
        if (reales.length === 0) {
            // El consejo es el único que se comprobó que funciona contra este síntoma. No se
            // agrega ningún reintento ni reenumeración: la causa está sin resolver y programar un
            // mecanismo contra una causa desconocida es prescribir sin evidencia.
            Feedback.avisar('No se detectó ningún teclado MIDI. Apagalo y encendelo con esta página abierta, que suele alcanzar. Mientras tanto, podés tocar con el ratón encendiendo "Teclas clicables" en Opciones.');
        } else if (this.avisoSinTeclado) {
            // `bindDevices` vuelve a correr con cada onstatechange, así que un teclado que aparece
            // después deja el aviso anterior en pantalla diciendo algo que ya es falso. El aviso se
            // levanta con la misma llamada que lo puso. Solo se escribe si hubo aviso: pisar la
            // caja de feedback cuando nadie avisó nada le robaría el lugar a otro mensaje.
            Feedback.avisar(`Teclado detectado: ${reales.join(', ')}.`);
        }
        this.avisoSinTeclado = reales.length === 0;
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
        if(note < State.config.splitNote) { State.midi.activeBasses.add(note); this.triggerAccumulation(); this.triggerContextTimeout('se apretó un bajo'); }
        else { State.midi.activeMelodies.add(note); this.evaluateMelody(note); }
        Teclado.renderKeyboard(); Readout.updateStatus();
    },
    noteOff(note) {
        State.midi.keysDown.delete(note); 
        SysLog('MIDI', `UP: ${getNoteStr(note).name} (${note})`);
        if (State.midi.sustainActive) return; 
        // La clasificación no se recalcula: se lee de dónde quedó la nota al apretarla. El
        // conjunto es el registro de esa decisión, así que no hace falta guardar nada aparte.
        // Recalcular `note < State.config.splitNote` acá era el defecto: si el split cambiaba
        // con la tecla apretada, la nota entraba por una puerta y salía por la otra, se
        // intentaba borrar de un conjunto donde no estaba y quedaba encendida para siempre en
        // el otro. Un bajo fantasma bloquea la liberación del contexto, que exige cero bajos.
        // Ver DECISIONS, 2026-08-20, "Nada que decida el destino de un evento se recalcula
        // después de que el evento ocurrió".
        this.releaseNoteInternal(note, State.midi.activeBasses.has(note));
        Teclado.renderKeyboard(); Readout.updateStatus();
    },
    releaseNoteInternal(note, isBass) {
        const ev = State.evaluations.get(note);

        // El aviso que habría cazado el defecto el primer día. `isBass` viene de dónde está la
        // nota; esta comparación dice de qué lado caería hoy. Cuando difieren, el split se movió
        // con la tecla apretada, y la nota sale por donde entró.
        const caeriaBajoAhora = note < State.config.splitNote;
        if (isBass !== caeriaBajoAhora) {
            SysLog('MIDI', `⚠ El split se movió mientras ${getNoteStr(note).name} (${note}) estaba apretada: entró como ${isBass ? 'bajo' : 'melodía'} y con el split en ${State.config.splitNote} caería como ${caeriaBajoAhora ? 'bajo' : 'melodía'}. Sale por donde entró.`);
        }

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
            this.triggerContextTimeout('se soltó un bajo');
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
    // La retención se re-arma con cualquier movimiento de bajos, apretar o soltar, así que mide el
    // tiempo desde que la mano izquierda se quedó quieta y no desde el último bajo soltado. Antes se
    // armaba solo al soltar: quien soltaba unos bajos y apretaba otros dejaba el reloj corriendo
    // desde el soltado viejo, y al vencer encontraba bajos apretados y no liberaba nada.
    //
    // Y libera con menos de tres bajos apretados, no con cero. Ese número no es un umbral nuevo: es
    // el mismo mínimo y por el mismo motivo que `Engine.detectChord`, que abre con
    // `if (notesArray.length < 3) return null`. Con dos notas no hay acorde que sostener, así que un
    // acorde que sigue vigente con dos bajos apretados está vigente por inercia.
    //
    // Las dos mitades se necesitan y por eso van juntas. Re-armar sin bajar el umbral deja el acorde
    // pegado igual, medido: con dos bajos nuevos apretados sobrevivía 4800 ms. Y bajar el umbral sin
    // re-armar rompería el reacomodo de dedos, porque soltar una nota de tres arrancaría un reloj
    // que nadie reinicia al volver a apretarla. Re-armando, ese gesto tiene la ventana entera para
    // volver a tres. Ver DECISIONS, 2026-08-20, "La retención se re-arma con cualquier movimiento de
    // bajos, y libera por debajo de tres".
    triggerContextTimeout(motivo) {
        if(State.timers.contextHold) clearTimeout(State.timers.contextHold);
        SysLog('MATH', `Retención re-armada porque ${motivo}: el contexto se libera en ${State.config.holdMs} ms si para entonces quedan menos de 3 bajos apretados. Bajos activos ahora: ${State.midi.activeBasses.size}.`);
        State.timers.contextHold = setTimeout(() => {
            if(!State.harmony.isLocked && State.midi.activeBasses.size < 3) {
                const c = State.harmony.chord;
                const bajos = State.midi.activeBasses.size;
                State.harmony.chord = null; Armonia.clearEvaluations(); Teclado.renderKeyboard(); Readout.updateStatus();
                SysLog('MATH', `Contexto liberado tras ${State.config.holdMs} ms sin movimiento: ${c ? getNoteStr(c.rootPC).name + c.type : 'no había acorde'}. Quedaban ${bajos} bajo(s) apretado(s), menos de los 3 que hacen falta para formar un acorde. El motor vuelve a evaluar solo contra el universo.`);
            } else {
                SysLog('MATH', `Retención vencida y el contexto se queda: ${State.harmony.isLocked ? 'el acorde está fijado a mano' : `todavía hay ${State.midi.activeBasses.size} bajo(s) apretado(s), suficientes para sostener un acorde`}.`);
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
