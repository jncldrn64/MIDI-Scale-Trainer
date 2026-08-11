// escala.js: el objeto Escala, el único con permiso de escritura sobre el universo.
// Reparto por permiso de la segunda parte de la partición.

const Escala = {
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
        Teclado.renderKeyboard(); 
        Readout.updateStatus();
    },
};
