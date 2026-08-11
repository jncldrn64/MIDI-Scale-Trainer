// widgets.js: el menú de widgets y los preajustes de configuración. Cortado de index.html en la partición, sin mover nada.

// Menú de widgets: una fila por instancia, abiertas y cerradas. Se repinta entero
// después de cada acción, así que el menú no se puede desincronizar del estado.
const Widgets = {
    fila(c) {
        const e = Layout.estado[c.id];
        const f = document.createElement('div');
        f.className = 'wm-fila' + (e.abierto ? '' : ' wm-cerrada');
        const nombre = document.createElement('span');
        nombre.className = 'wm-nombre';
        nombre.textContent = (e.abierto ? '' : '· ') + c.nombre;
        f.appendChild(nombre);

        const toggle = document.createElement('button');
        toggle.className = 'btn';
        toggle.textContent = e.abierto ? 'Cerrar' : 'Abrir';
        toggle.onclick = () => {
            if (e.abierto) Layout.cerrar(c.id, 'menú de widgets');
            else Layout.abrir(c.id, 'menú de widgets');
            saveLayout();
            this.pintar();
        };
        f.appendChild(toggle);

        const op = document.createElement('input');
        op.type = 'range'; op.min = '0.2'; op.max = '1'; op.step = '0.05';
        op.value = e.opacidad; op.title = 'Opacidad';
        op.oninput = () => { Layout.setOpacidad(c.id, parseFloat(op.value)); saveLayout(); };
        f.appendChild(op);

        const reset = document.createElement('button');
        reset.className = 'btn';
        reset.textContent = '↺';
        reset.title = 'Reset de posición de esta instancia';
        reset.onclick = () => Layout.resetear(c.id, 'reset por instancia');
        f.appendChild(reset);
        return f;
    },
    pintar() {
        const compiten = document.getElementById('wm-compiten');
        const sistema = document.getElementById('wm-sistema');
        if (!compiten || !sistema) return;
        compiten.textContent = ''; sistema.textContent = '';
        const ocupados = CAJAS.filter(c => c.compite && Layout.estado[c.id].abierto).length;
        const cab = document.createElement('div');
        cab.className = 'widget-tag';
        cab.textContent = `Widgets · ${ocupados} de ${CAP} lugares`;
        compiten.appendChild(cab);
        CAJAS.filter(c => c.compite).forEach(c => compiten.appendChild(this.fila(c)));
        const cab2 = document.createElement('div');
        cab2.className = 'widget-tag';
        cab2.textContent = 'Sistema · fuera del cap';
        sistema.appendChild(cab2);
        CAJAS.filter(c => !c.compite).forEach(c => sistema.appendChild(this.fila(c)));
    }
};

// Incremento 5.2: preajustes de las tres ventanas de tiempo. "Normal" son los valores
// de arranque de State.config. "Aprendizaje" las abre para leer despacio: 400 ms de
// acumulación junta las notas de un acorde arpegiado lento sin fusionar acordes
// distintos, 5000 ms de retención sostiene el contexto mientras se lee el análisis, y
// 2500 ms de error visual deja ver qué tecla quedó marcada antes de que se borre.
// Split no está acá a propósito: es la nota donde se separan las manos, no una ventana.
const CFG_PRESETS = {
    aprendizaje: { accumMs: 400, holdMs: 5000, errMs: 2500 },
    normal:      { accumMs: 120, holdMs: 2000, errMs: 1000 }
};
function detectPreset() {
    for (const [nombre, p] of Object.entries(CFG_PRESETS)) {
        if (State.config.accumMs === p.accumMs && State.config.holdMs === p.holdMs && State.config.errMs === p.errMs) return nombre;
    }
    return 'personalizado';
}
