// armonia.js: el objeto Armonia, sistema. Manda sobre el buffer de armonía y el de
// evaluaciones: los fija, los libera y los limpia.

const Armonia = {
    clearEvaluations() { State.evaluations.forEach(v => clearTimeout(v.timeout)); State.evaluations.clear(); },
    // Sin llamadores desde la v11.76, que retiró el panel "Fijar Acordes". Se queda anotada y
    // no se borra: es el caso más simple del widget de acompañamiento que el BACKLOG pide, y
    // borrarla obligaría a reescribirla igual. Mientras nadie la llame, `State.harmony.isLocked`
    // no puede volverse verdadero, así que la detección automática de MIDI nunca se pausa.
    lockChord(notes, type) {
        const root = notes[0]%12;
        State.harmony.chord = { rootPC: root, type, bassPC: root, inversion: 'Fijado', rawNotes: notes, template: CHORD_TEMPLATES[type] };
        State.harmony.isLocked = true;
        const btn = document.getElementById('btn-lock'); btn.innerText = "Motor Pausado"; btn.className = "btn btn-success";
        this.clearEvaluations(); Teclado.renderKeyboard(); Readout.updateStatus();
    },
    unlockChord() {
        State.harmony.isLocked = false; State.harmony.chord = null;
        const btn = document.getElementById('btn-lock'); btn.innerText = "Motor Automático"; btn.className = "btn btn-warning";
        this.clearEvaluations(); Teclado.renderKeyboard(); Readout.updateStatus();
    }
};
