// teclado.js: el objeto Teclado, capa 0. Construye las 88 teclas y las pinta con la
// cascada de precedencia. Es sistema: ningún widget tiene permiso sobre él.

const Teclado = {
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
        kb.innerHTML = '';
        const whites = [];
        for(let i=KEYBOARD_START; i<=KEYBOARD_END; i++) {
            if(!BLACK_KEYS.includes(i%12)) whites.push(i);
        }

        // El ancho sale de la constante del lienzo, no de medir el contenedor. Medirlo daba
        // el mismo número porque el contenedor ocupa el lienzo entero, pero era una medición
        // indirecta de una constante que ya existe: un relleno o un borde lateral en ese
        // contenedor cambiaría el ancho de la tecla en silencio y nadie lo ataría a su causa.
        const anchoBlanca = LIENZO_ANCHO / whites.length;
        // El alto son 140 px de lienzo planos. La fórmula de escala que había acá se
        // borró: era el lienzo aplicado por adelantado a este único número, y ahora el
        // cascarón escala todo. Dejar las dos cosas aplicaría la escala dos veces.
        const altoBlanca = 140;
        // La negra conserva su proporción: 0.62 del ancho y del alto de la blanca. A
        // 0.80 el blanco visible entre dos negras cae de 9.4 px a 4.9 px y el teclado
        // deja de leerse como teclado. Un piano real va en 0.58.
        const anchoNegra = anchoBlanca * 0.62, altoNegra = altoBlanca * 0.62;
        const fuente = Math.max(6, Math.round(anchoBlanca * 0.34));

        kb.style.width = `${LIENZO_ANCHO}px`;
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
        SysLog('LAYOUT', `Teclado de ${KEYBOARD_END - KEYBOARD_START + 1} teclas (MIDI ${KEYBOARD_START} a ${KEYBOARD_END}), ${whites.length} blancas, de borde a borde en ${LIENZO_ANCHO} px.`);
        SysLog('LAYOUT', `Ancho de blanca ${anchoBlanca.toFixed(2)} px; negra ${anchoNegra.toFixed(2)} px al 0.62, deja ${(anchoBlanca - anchoNegra).toFixed(1)} px de blanco visible entre negras.`);
        SysLog('LAYOUT', `Alto de blanca ${altoBlanca} px de lienzo, negra ${Math.round(altoNegra)} px. Planos: el cascarón del lienzo aplica la escala una sola vez.`);
        this.armarClic();
        this.renderKeyboard();
    },

    // Teclas clicables. Se arma acá porque `buildKeyboard` recrea los 88 div en cada resize y
    // un manejador enganchado antes se iría con el div viejo. El interruptor se lee adentro del
    // manejador, no acá: así encenderlo y apagarlo no obliga a reconstruir el teclado.
    //
    // El clic no llama al motor. Llama a `MIDI.entradaSintetica`, que fabrica el mensaje y lo
    // mete por `MIDI.processMsg`. Apretar enciende, soltar apaga, y sostener dura lo que dure
    // el botón apretado, que es lo que hace comprobables el indulto de 180 ms y la retención
    // del contexto sin dispositivo.
    armarClic() {
        let sonando = null;
        const soltar = (origen) => {
            if (sonando === null) return;
            const n = sonando; sonando = null;
            SysLog('MIDI', `Clic soltado sobre ${getNoteStr(n).name} (${n}) por ${origen}.`);
            MIDI.entradaSintetica(n, false);
        };
        for (let m = KEYBOARD_START; m <= KEYBOARD_END; m++) {
            const key = document.getElementById(`k-${m}`); if (!key) continue;
            key.addEventListener('pointerdown', (e) => {
                if (!State.config.clicTeclas) return;
                e.preventDefault();
                // La captura del puntero es lo que hace que soltar afuera de la tecla apague
                // igual: el `pointerup` vuelve al elemento que capturó, no al que está debajo
                // del cursor. Sin esto la nota quedaba encendida, que es el defecto que la
                // v11.79 acaba de corregir del otro lado del camino.
                // La captura va en try porque puede tirar, y si tira sin red se lleva puesta la
                // nota entera: el manejador aborta antes de fabricar el mensaje y la tecla no
                // suena. Medido en Chromium con un pointerdown sintético, que es como se prueba
                // esto sin ratón. Sin captura, soltar afuera deja de apagar; con la nota muda no
                // hay nada que apagar. Se registra para que la degradación no sea silenciosa.
                let capturado = false;
                try { key.setPointerCapture(e.pointerId); capturado = true; }
                catch (err) { SysLog('MIDI', `⚠ La tecla no pudo capturar el puntero ${e.pointerId}: ${err.message}. La nota suena igual; soltar fuera de la tecla puede no apagarla.`); }
                if (sonando !== null) soltar('un segundo clic sin soltar el primero');
                sonando = m;
                SysLog('MIDI', `Clic apretado sobre ${getNoteStr(m).name} (${m}), puntero ${e.pointerId}${capturado ? ' capturado por la tecla' : ' sin capturar'}.`);
                MIDI.entradaSintetica(m, true);
            });
            key.addEventListener('pointerup', () => soltar('soltar el botón'));
            key.addEventListener('pointercancel', () => soltar('cancelación del puntero'));
        }
        this.marcarClicable();
        SysLog('LAYOUT', `Teclas clicables armadas sobre las ${KEYBOARD_END - KEYBOARD_START + 1} teclas, con velocidad fija ${MIDI.VELOCIDAD_CLIC}. Responden solo con el interruptor de Opciones encendido, que ahora está ${State.config.clicTeclas ? 'encendido' : 'apagado'}.`);
    },

    // La clase del contenedor solo cambia el cursor y el touch-action. No toca ninguna de las
    // seis clases de veredicto ni agrega una séptima: el estado del interruptor no es feedback
    // sobre la nota y no se pinta sobre la tecla.
    marcarClicable() {
        const kb = document.getElementById('keyboard');
        kb.classList.toggle('clicable', !!State.config.clicTeclas);
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
};
