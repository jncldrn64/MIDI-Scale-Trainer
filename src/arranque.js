// arranque.js: el cuerpo de window.onload, la única sentencia ejecutable del script. Cortado de index.html en la partición, sin mover nada.

window.onload = () => {
    loadConfig();
    // Primero el cascarón: todo lo que se mide después depende de que el lienzo ya
    // esté escalado y ubicado.
    Lienzo.ajustar('carga');

    document.getElementById('cfg-accum').value = State.config.accumMs;
    document.getElementById('cfg-hold').value = State.config.holdMs;
    document.getElementById('cfg-err').value = State.config.errMs;
    document.getElementById('cfg-split').value = State.config.splitNote;
    
    const btnNom = document.getElementById('btn-toggle-nom');
    btnNom.innerText = State.config.latino ? "Nomenclatura: Silábica" : "Nomenclatura: Alfabética";

    const rs = document.getElementById('root-select');
    (State.config.latino ? NOTES_ES : NOTES_EN).forEach((n,i) => { 
        const o=document.createElement('option'); o.value=i; o.innerText=n; rs.appendChild(o); 
    });
    
    rs.onchange = () => UI.buildUniverse();
    document.getElementById('scale-select').onchange = () => UI.buildUniverse();
    
    document.getElementById('cfg-accum').onchange = (e) => { State.config.accumMs = parseInt(e.target.value); saveConfig(); };
    document.getElementById('cfg-hold').onchange = (e) => { State.config.holdMs = parseInt(e.target.value); saveConfig(); };
    document.getElementById('cfg-err').onchange = (e) => { State.config.errMs = parseInt(e.target.value); saveConfig(); };
    document.getElementById('cfg-split').onchange = (e) => { State.config.splitNote = parseInt(e.target.value); saveConfig(); };

    // Incremento 5.2: el preajuste escribe las tres ventanas de tiempo y persiste con
    // el saveConfig que ya existe. Editar cualquier campo a mano pasa el select a
    // Personalizado sin pisar lo escrito. Split nunca lo toca el preajuste.
    const presetSel = document.getElementById('cfg-preset');
    presetSel.value = detectPreset();
    SysLog('LAYOUT', `Preajuste inicial detectado desde la config guardada: "${presetSel.value}".`);
    presetSel.onchange = () => {
        const p = CFG_PRESETS[presetSel.value];
        if (!p) { SysLog('LAYOUT', 'Preajuste "Personalizado" elegido a mano: los campos no se tocan.'); return; }
        State.config.accumMs = p.accumMs; State.config.holdMs = p.holdMs; State.config.errMs = p.errMs;
        document.getElementById('cfg-accum').value = p.accumMs;
        document.getElementById('cfg-hold').value = p.holdMs;
        document.getElementById('cfg-err').value = p.errMs;
        saveConfig();
        SysLog('LAYOUT', `Preajuste "${presetSel.value}" aplicado: acumulación ${p.accumMs} ms, retención ${p.holdMs} ms, error visual ${p.errMs} ms. Split queda en ${State.config.splitNote}, fuera del preajuste.`);
    };
    ['cfg-accum', 'cfg-hold', 'cfg-err', 'cfg-split'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (presetSel.value !== 'personalizado') {
                presetSel.value = 'personalizado';
                SysLog('LAYOUT', `Campo ${id} editado a mano: el preajuste pasa a "Personalizado" sin pisar el valor.`);
            }
        });
    });

    // Incremento 5.2: apertura y cierre del menú de Opciones. Estado instantáneo vía
    // hidden; con el menú abierto el resto de la barra baja su opacidad (convención de
    // selección de la Fase 5). Clic afuera o Escape lo cierran.
    // El incremento 5.3 suma el menú de Widgets al lado de Opciones, así que la
    // apertura se generaliza a los dos: abrir uno cierra el otro, y la convención de
    // selección atenúa el resto de la barra igual que antes.
    const menubar = document.getElementById('menubar');
    const MENUS = [
        { nombre: 'Opciones', btn: document.getElementById('btn-menu-opciones'), panel: document.getElementById('menu-opciones') },
        { nombre: 'Widgets', btn: document.getElementById('btn-menu-widgets'), panel: document.getElementById('menu-widgets') }
    ];
    function setMenu(m, abierto) {
        if (abierto) MENUS.forEach(o => { if (o !== m) setMenu(o, false); });
        if (abierto) { m.panel.removeAttribute('hidden'); menubar.classList.add('menu-open'); }
        else m.panel.setAttribute('hidden', '');
        m.btn.setAttribute('aria-expanded', String(abierto));
        if (!MENUS.some(o => !o.panel.hasAttribute('hidden'))) menubar.classList.remove('menu-open');
        SysLog('LAYOUT', `Menú ${m.nombre} ${abierto ? 'abierto' : 'cerrado'}.`);
    }
    MENUS.forEach(m => {
        m.btn.onclick = (e) => { e.stopPropagation(); setMenu(m, m.panel.hasAttribute('hidden')); };
        m.panel.addEventListener('click', (e) => e.stopPropagation());
    });
    document.addEventListener('click', () => MENUS.forEach(m => { if (!m.panel.hasAttribute('hidden')) setMenu(m, false); }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') MENUS.forEach(m => { if (!m.panel.hasAttribute('hidden')) setMenu(m, false); }); });
    
    btnNom.onclick = (e) => {
        State.config.latino = !State.config.latino;
        e.target.innerText = State.config.latino ? "Nomenclatura: Silábica" : "Nomenclatura: Alfabética";
        SysLog('LAYOUT', `Nomenclatura: ${State.config.latino ? 'silábica (Do Re Mi), do fijo' : 'alfabética (C D E)'}.`);
        saveConfig(); 
        const v = rs.value; rs.innerHTML='';
        (State.config.latino ? NOTES_ES : NOTES_EN).forEach((n,i) => { const o=document.createElement('option'); o.value=i; o.innerText=n; rs.appendChild(o); });
        rs.value = v; UI.buildUniverse();
    };

    document.getElementById('btn-lock').onclick = () => UI.unlockChord();
    // Con 88 teclas que entran completas a lo ancho no hay desbordamiento, así que
    // desplazar el contenedor no hacía nada. El botón pasa a marcar la nota de split
    // sobre el teclado, encendiendo y apagando en cada clic. El split es una sola
    // nota MIDI, la 60 por defecto, que separa mano izquierda de derecha.
    document.getElementById('btn-c4').onclick = () => {
        State.ui.marcaSplit = !State.ui.marcaSplit;
        UI.renderKeyboard();
        SysLog('LAYOUT', `Marca del split ${State.ui.marcaSplit ? 'encendida' : 'apagada'} sobre la nota MIDI ${State.config.splitNote}.`);
    };
    const chkNombres = document.getElementById('cfg-nombres');
    chkNombres.checked = State.config.nombresTecla;
    chkNombres.onchange = (e) => {
        State.config.nombresTecla = e.target.checked;
        saveConfig(); UI.renderKeyboard();
        SysLog('LAYOUT', `Nombres de tecla ${State.config.nombresTecla ? 'encendidos' : 'apagados'} sobre las 52 blancas.`);
    };
    document.getElementById('btn-clear').onclick = () => document.getElementById('logs-container').innerHTML='';
    document.getElementById('btn-export').onclick = exportLogsTxt;
    document.getElementById('btn-copy').onclick = copyLogsClipboard;
    document.getElementById('btn-reset-layout').onclick = () => Layout.resetear(null, 'reset global desde el menú de Widgets');

    // Fase 5: consola colapsada por defecto detrás de un botón. Al abrir muestra el
    // log en vivo y las acciones (copiar, exportar, limpiar). Solo disposición, no motor.
    const consoleToggle = document.getElementById('btn-console-toggle');
    const consoleActions = document.getElementById('console-actions');
    const logsContainer = document.getElementById('logs-container');
    consoleToggle.onclick = () => {
        const opening = logsContainer.hasAttribute('hidden');
        if (opening) { logsContainer.removeAttribute('hidden'); consoleActions.removeAttribute('hidden'); }
        else { logsContainer.setAttribute('hidden',''); consoleActions.setAttribute('hidden',''); }
        consoleToggle.setAttribute('aria-expanded', String(opening));
        consoleToggle.innerText = opening ? 'Consola y Logs ▾' : 'Consola y Logs ▸';
        SysLog('LAYOUT', `Consola ${opening ? 'abierta' : 'colapsada'}`);
    };

    window.addEventListener('resize', () => { Lienzo.ajustar('resize'); UI.buildKeyboard(); });
    UI.buildUniverse(); UI.buildKeyboard(); MIDI.init();

    // El auto-clic de btn-c4 al cargar se retira. Existía para auto-centrar el
    // teclado desbordado; con 88 teclas que entran completas no hay nada que centrar,
    // y dejarlo encendería la marca del split sola, que es una decisión que nadie
    // tomó. El botón sigue en el menú de Opciones, con su id intacto.
    SysLog('LAYOUT', 'Auto-centrado retirado: el teclado entra completo a lo ancho, así que no hay desbordamiento que centrar. La marca del split arranca apagada.');

    // Fase 5, incrementos 5.1 y 5.2: rastro del layout al cargar. Muchos mensajes,
    // para verlo suceder en la consola. El motor y renderKeyboard no cambian.
    SysLog('LAYOUT', 'Incremento 5.1, fondo único activo: el teclado y la zona de notas que caen son una sola capa de fondo.');
    SysLog('LAYOUT', `Fondo debajo de la barra: ${LIENZO_ANCHO} x ${LIENZO_ALTO - 30} px de lienzo (la barra ocupa los 30 px de arriba).`);
    SysLog('LAYOUT', 'Incremento 5.2, barra de menús permanente montada: título y versión a la izquierda, menú Opciones al lado.');
    SysLog('LAYOUT', 'Menú Opciones armado, de arriba abajo: preajuste, los cuatro campos del motor, "Centrar en Split", y la consola completa.');
    SysLog('LAYOUT', 'Reubicados sin recrear, con sus id intactos: los cuatro cfg-* desde el overlay de ajustes, btn-c4 desde los controles del teclado, y btn-console-toggle mas console-actions mas logs-container desde el overlay de consola.');
    SysLog('LAYOUT', 'Los overlays de ajustes y de consola se retiraron del escenario: quedaron vacíos al mudarse su contenido.');
    SysLog('LAYOUT', 'El título dejó de flotar como overlay: se mudó a la barra y ya no se pisa con el readout.');
    SysLog('LAYOUT', 'Las cajas viven en el molde uniforme, se arrastran, se cierran y se restauran desde el menú de Widgets. El incremento 5.3 queda entregado en sus tres partes.');
    SysLog('LAYOUT', 'Zona de notas que caen: reservada y vacía sobre el teclado; el motor de notas que caen es backlog, no se crea acá.');
    SysLog('LAYOUT', 'renderKeyboard y el coloreo de teclas quedan intactos; el motor no cambia.');

    // Incremento 5.3, chasis completo. Restaura el estado por instancia, ubica cada
    // caja abierta, la vuelve arrastrable, mide la cobertura en dos cifras separadas
    // contra el tope de tres octavos, y arma el menú de widgets contra ese estado.
    Layout.init();
    Widgets.pintar();
};
