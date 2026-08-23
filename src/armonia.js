// armonia.js: el objeto Armonia, sistema. Manda sobre el buffer de armonía y el de
// evaluaciones: los fija, los libera y los limpia.

const Armonia = {
    // El motivo llega de afuera y no se recalcula acá. Es la regla 2 de "Verbosidad del
    // registro" de CLAUDE.md: quien decide borrar los veredictos sabe por qué, y esta
    // función solo sabe que la llamaron. Los cuatro llamadores lo pasan.
    //
    // Por qué esta línea existe: borrar los veredictos vivos no rompe nada a la vista, solo
    // apaga símbolos y colores del teclado antes de tiempo. Sin rastro, ese síntoma se
    // atribuyó al rediseño visual durante semanas. Ver CLAUDE.md, "Verbosidad del registro".
    clearEvaluations(motivo) {
        const cuantas = State.evaluations.size;
        State.evaluations.forEach(v => clearTimeout(v.timeout));
        State.evaluations.clear();
        SysLog('EVAL', cuantas === 0
            ? `Sin veredictos vivos que borrar (${motivo}).`
            : `Veredictos borrados: ${cuantas} tecla(s) pierden su símbolo y su color, porque ${motivo}.`);
    },
    // Sin llamadores desde la v11.76, que retiró el panel "Fijar Acordes". Se queda anotada y
    // no se borra: es el caso más simple del widget de acompañamiento que el BACKLOG pide, y
    // borrarla obligaría a reescribirla igual. Mientras nadie la llame, `State.harmony.isLocked`
    // no puede volverse verdadero, así que la detección automática de MIDI nunca se pausa.
    lockChord(notes, type) {
        const root = notes[0]%12;
        State.harmony.chord = { rootPC: root, type, bassPC: root, inversion: 'Fijado', rawNotes: notes, template: CHORD_TEMPLATES[type] };
        State.harmony.isLocked = true;
        SysLog('MATH', `Acorde fijado a mano: ${getNoteStr(root).name}${type} sobre las notas [${notes}]. La detección automática queda pausada hasta que se libere, así que el motor evalúa la melodía contra este acorde y no contra lo que se toque con la izquierda.`);
        const btn = document.getElementById('btn-lock'); btn.innerText = "Motor Pausado"; btn.className = "btn btn-success";
        this.clearEvaluations('se fijó un acorde a mano y el contexto cambió');
        Teclado.renderKeyboard(); Readout.updateStatus();
    },
    unlockChord() {
        const c = State.harmony.chord;
        const estaba = State.harmony.isLocked;
        State.harmony.isLocked = false; State.harmony.chord = null;
        SysLog('MATH', estaba
            ? `Acorde fijado liberado: ${c ? getNoteStr(c.rootPC).name + c.type : 'no había acorde'}. La detección automática vuelve a correr sobre los bajos que se toquen.`
            : `Motor ya estaba en automático, así que liberar no cambió el bloqueo. Se borró el contexto igual: ${c ? getNoteStr(c.rootPC).name + c.type : 'no había acorde'}.`);
        const btn = document.getElementById('btn-lock'); btn.innerText = "Motor Automático"; btn.className = "btn btn-warning";
        this.clearEvaluations('se liberó el acorde fijado y el contexto cambió');
        Teclado.renderKeyboard(); Readout.updateStatus();
    }
};
