// cajas.js: el registro de cajas, el cap y las dos funciones de layout persistido. Cortado de index.html en la partición, sin mover nada.

// --- LAYOUT Y CHASIS DE CAJAS (incremento 5.3, partes segunda y tercera) ---
// Cada caja se ubica por transform: translate(), así que mover no dispara reflow.
// El estado se guarda por identidad de caja, nunca por índice ni por posición: el
// orden en que queden ubicadas no cambia a quién le corresponde cada estado.
// Cerrar oculta, no destruye: la caja conserva su posición, su opacidad y su punto.

// Registro de instancias. El menú lista esto, no tipos. "compite" es lo único que
// decide el cap de tres: las cajas de sistema quedan fuera (DECISIONS, 2026-08-01).
const CAJAS = [
    { id: 'widget-escala',    nombre: 'Escala',                compite: true,  abierto: true  },
    { id: 'widget-readout',   nombre: 'Readout del motor',     compite: true,  abierto: true  },
    { id: 'widget-reservado', nombre: 'Tercer widget · andamiaje', compite: true, abierto: false },
    { id: 'widget-prueba',    nombre: 'Widget de prueba · andamiaje', compite: true, abierto: false },
    { id: 'sys-subtitles',    nombre: 'Subtítulos',            compite: false, abierto: true  },
    { id: 'sys-feedback',     nombre: 'Feedback del sistema',  compite: false, abierto: true  },
    { id: 'sys-guia',         nombre: 'Guía',                  compite: false, abierto: true  }
];
const CAP = 3;   // widgets que compiten, abiertos a la vez

function saveLayout() { localStorage.setItem('midiTrainerLayout', JSON.stringify(Layout.estado)); }
function loadLayout() {
    const guardado = localStorage.getItem('midiTrainerLayout');
    if (!guardado) return null;
    let dato;
    try { dato = JSON.parse(guardado); }
    catch (e) { SysLog('LAYOUT', '⚠️ Layout guardado ilegible, se descarta y se vuelve al estado por defecto: ' + e); return null; }
    // Coherencia: más de CAP widgets que compiten marcados como abiertos deja un
    // estado que el propio cap prohíbe, así que no se restaura a medias.
    const abiertos = CAJAS.filter(c => c.compite && dato[c.id] && dato[c.id].abierto).length;
    if (abiertos > CAP) {
        SysLog('LAYOUT', `⚠️ Layout guardado inconsistente: ${abiertos} widgets que compiten marcados como abiertos, y el cap es ${CAP}. Se descarta entero y se vuelve al estado por defecto.`);
        return null;
    }
    return dato;
}
