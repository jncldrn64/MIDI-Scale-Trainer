// layout.js: el objeto Layout, su persistencia y la superficie de avisos.

// Persistencia del layout. Vive acá, junto a Layout, y no en cajas.js: persiste
// Layout.estado, no el registro de cajas. Quedó allá porque en index.html estas dos
// funciones vivían físicamente entre el registro y el cascarón, y el corte puro de la
// primera parte no podía moverlas.
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

const Layout = {
    GAP: 16,       // separación uniforme entre cajas, la misma contra la que nacen
    FRANJA: 56,    // franja de nacimiento libre debajo de la barra
    estado: {},    // identidad de caja -> {x, y, abierto, opacidad, punto}

    reg(id) { return CAJAS.find(c => c.id === id); },
    el(id) { return document.getElementById(id); },
    cajas() { return CAJAS.map(c => this.el(c.id)).filter(Boolean); },

    // Todo lo que sigue está en coordenadas de lienzo, nunca de pantalla. Por eso no
    // se usa getBoundingClientRect, que bajo el cascarón escalado devuelve píxeles ya
    // multiplicados por la escala, sino offsetWidth y offsetHeight, que son previos a
    // la transformación.
    //
    // El área de arrastre es todo el lienzo debajo de la barra. El piano dejó de ser
    // el límite de abajo: los widgets flotan sobre el fondo entero, y el fondo no se
    // reordena para hacerles lugar (DECISIONS, 2026-08-09).
    area() {
        return { top: this.el('menubar').offsetHeight, bottom: LIENZO_ALTO, left: 0, right: LIENZO_ANCHO };
    },

    // La zona de notas es otra cosa que el área: va de la barra al piano, y es contra
    // ella que se mide el presupuesto de superposición. El piano está pegado al borde
    // inferior del lienzo, así que su tope sale de restar su alto.
    zonaNotas() {
        return { top: this.el('menubar').offsetHeight, bottom: LIENZO_ALTO - this.el('keyboard-wrapper').offsetHeight };
    },

    clamp(el, x, y) {
        const a = this.area(), r = { width: el.offsetWidth, height: el.offsetHeight };
        const maxX = Math.max(a.left, a.right - r.width);
        const maxY = Math.max(a.top, a.bottom - r.height);
        const cx = Math.min(Math.max(x, a.left), maxX);
        const cy = Math.min(Math.max(y, a.top), maxY);
        return { x: cx, y: cy, frenado: (Math.round(cx) !== Math.round(x) || Math.round(cy) !== Math.round(y)) };
    },

    colocar(el, x, y) {
        const p = { x: Math.round(x), y: Math.round(y) };
        el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        const e = this.estado[el.id];
        e.x = p.x; e.y = p.y;
        return p;
    },

    // Los tres puntos de nacimiento son coordenadas de arranque, no celdas: nada se
    // dibuja, y una vez movida la caja queda donde el usuario la dejó. Devuelve un
    // array de tres, indexado igual que el campo "punto" del estado.
    puntosCompeten() {
        const a = this.area();
        const w = this.el('widget-escala').offsetWidth;
        const total = w * CAP + this.GAP * (CAP - 1);
        const x0 = Math.max(a.left, (LIENZO_ANCHO - total) / 2);
        const y = a.top + this.FRANJA;
        return Array.from({ length: CAP }, (_, i) => ({ x: x0 + i * (w + this.GAP), y, w }));
    },

    // Los nacimientos de las cajas de sistema: subtítulos y feedback centrados, uno
    // debajo del otro, como fija el estándar espacial. La guía nace bajo el tercer
    // punto de nacimiento, alineada con el widget de la derecha.
    nacimientoSistema(id) {
        const el = this.el(id), r = { width: el.offsetWidth, height: el.offsetHeight };
        // La guía deja de nacer alineada con el tercer punto de nacimiento. Esa
        // alineación la hacía leer como cuarta caja de la fila, y no lo es: es algo
        // que se aprende y se apaga. Nace anclada al borde derecho, con 16 px de
        // margen, y a la mitad vertical de la zona de notas.
        if (id === 'sys-guia') {
            const z = this.zonaNotas();
            return { x: LIENZO_ANCHO - this.GAP - r.width, y: z.top + (z.bottom - z.top) / 2 };
        }
        const fila = id === 'sys-subtitles' ? 0.46 : 0.51;
        return { x: (LIENZO_ANCHO - r.width) / 2, y: LIENZO_ALTO * fila };
    },

    nacimiento(id) {
        const c = this.reg(id);
        if (!c.compite) return this.nacimientoSistema(id);
        const punto = this.estado[id].punto;
        return this.puntosCompeten()[punto === null ? 0 : punto];
    },

    // Un punto está ocupado si hay un widget abierto que lo tiene asignado, no por
    // dónde quedó en pantalla: el usuario pudo haberlo arrastrado a cualquier parte.
    puntoLibre() {
        const tomados = CAJAS.filter(c => c.compite && this.estado[c.id].abierto)
                             .map(c => this.estado[c.id].punto);
        for (let i = 0; i < CAP; i++) if (!tomados.includes(i)) return i;
        return null;
    },

    abrir(id, motivo) {
        const c = this.reg(id), e = this.estado[id];
        if (e.abierto) return true;
        let punto = null;
        if (c.compite) {
            punto = this.puntoLibre();
            if (punto === null) {
                const ocupados = CAJAS.filter(x => x.compite && this.estado[x.id].abierto).map(x => x.nombre);
                Feedback.avisar(`No entra "${c.nombre}": el límite de ${CAP} widgets a la vez está completo. Cerrá uno para abrirlo.`);
                SysLog('LAYOUT', `⚠️ Apertura bloqueada por el cap: "${id}" no se abre, hay ${ocupados.length} de ${CAP} ocupados (${ocupados.join(', ')}).`);
                return false;
            }
            e.punto = punto;
        }
        e.abierto = true;
        this.el(id).hidden = false;
        const n = this.nacimiento(id);
        const cl = this.clamp(this.el(id), n.x, n.y);
        this.colocar(this.el(id), cl.x, cl.y);
        this.aplicarOpacidad(id);
        const libres = c.compite ? CAP - CAJAS.filter(x => x.compite && this.estado[x.id].abierto).length : null;
        SysLog('LAYOUT', `Apertura de "${id}" (${motivo}): ${c.compite ? `punto de nacimiento ${punto} en (${Math.round(cl.x)}, ${Math.round(cl.y)}), ${libres === 1 ? "queda 1 libre" : `quedan ${libres} libres`} de ${CAP}` : `caja de sistema, fuera del cap, en (${Math.round(cl.x)}, ${Math.round(cl.y)})`}.`);
        return true;
    },

    cerrar(id, motivo) {
        const c = this.reg(id), e = this.estado[id];
        if (!e.abierto) return;
        e.abierto = false;
        this.el(id).hidden = true;
        Feedback.avisar(`Se cerró "${c.nombre}". Se restaura desde el menú de Widgets.`);
        SysLog('LAYOUT', `Cierre de "${id}" (${motivo}): oculta, no destruida. Conserva posición (${e.x}, ${e.y}), opacidad ${e.opacidad} y punto ${e.punto}.`);
    },

    aplicarOpacidad(id) { this.el(id).style.opacity = this.estado[id].opacidad; },

    setOpacidad(id, v) {
        this.estado[id].opacidad = v;
        this.aplicarOpacidad(id);
        SysLog('LAYOUT', `Opacidad de "${id}": ${v}.`);
    },

    resetear(id, motivo) {
        const ids = id ? [id] : CAJAS.map(c => c.id);
        ids.forEach(x => {
            if (!this.estado[x].abierto) return;
            const n = this.nacimiento(x);
            const c = this.clamp(this.el(x), n.x, n.y);
            this.colocar(this.el(x), c.x, c.y);
        });
        saveLayout();
        SysLog('LAYOUT', `Posiciones restablecidas a los puntos de nacimiento (${motivo}): ${ids.join(', ')}.`);
    },

    // Cobertura de la zona de notas, en dos cifras separadas: la de los widgets que
    // compiten, que es la que se mide contra el tope de tres octavos, y el total de
    // todo lo que tapa, que es informativo. Las cajas de sistema no cuentan contra
    // el tope (ver DECISIONS, 2026-08-01).
    cobertura() {
        const z = this.zonaNotas(), zona = z.bottom - z.top;
        // Las bandas salen del estado, que ya está en coordenadas de lienzo, y del alto
        // sin transformar de cada caja. Medirlas con getBoundingClientRect daría
        // píxeles de pantalla y la cifra cambiaría con el tamaño de la ventana.
        const union = sel => {
            const bandas = Array.from(document.querySelectorAll(sel))
                .filter(el => !el.hidden && this.estado[el.id])
                .map(el => { const t = this.estado[el.id].y; return [Math.max(t, z.top), Math.min(t + el.offsetHeight, z.bottom)]; })
                .filter(([s, e]) => e > s).sort((p, q) => p[0] - q[0]);
            let total = 0, s = null, e = null;
            for (const [bs, be] of bandas) {
                if (e === null) { s = bs; e = be; }
                else if (bs <= e) { e = Math.max(e, be); }
                else { total += e - s; s = bs; e = be; }
            }
            if (e !== null) total += e - s;
            return total;
        };
        return { zona, compiten: union('.widget'), todo: union('.box') };
    },

    arrastrable(el) {
        el.addEventListener('pointerdown', e => {
            // Un clic sobre un control opera el control y no mueve la caja.
            if (e.target.closest('select, button, input, option, textarea, a')) return;
            e.preventDefault();
            const desde = { x: this.estado[el.id].x, y: this.estado[el.id].y };
            const p0 = Lienzo.aLienzo(e.clientX, e.clientY);
            const offX = p0.x - desde.x, offY = p0.y - desde.y;
            let frenado = false;
            el.setPointerCapture(e.pointerId);
            el.classList.add('dragging');

            const mover = ev => {
                const pm = Lienzo.aLienzo(ev.clientX, ev.clientY);
                const c = this.clamp(el, pm.x - offX, pm.y - offY);
                if (c.frenado) frenado = true;
                this.colocar(el, c.x, c.y);
            };
            const soltar = ev => {
                el.releasePointerCapture(ev.pointerId);
                el.classList.remove('dragging');
                el.removeEventListener('pointermove', mover);
                el.removeEventListener('pointerup', soltar);
                el.removeEventListener('pointercancel', soltar);
                const hasta = this.estado[el.id];
                saveLayout();
                SysLog('LAYOUT', `Arrastre de "${el.id}": de (${desde.x}, ${desde.y}) a (${hasta.x}, ${hasta.y})${frenado ? ', frenado contra un límite del área' : ''}.`);
            };
            el.addEventListener('pointermove', mover);
            el.addEventListener('pointerup', soltar);
            el.addEventListener('pointercancel', soltar);
        });
    },

    init() {
        const guardado = loadLayout() || {};
        // Estado por defecto, después lo pisa lo guardado si es coherente.
        let puntoDefecto = 0;
        CAJAS.forEach(c => {
            const g = guardado[c.id] || {};
            const abierto = typeof g.abierto === 'boolean' ? g.abierto : c.abierto;
            let punto = null;
            if (c.compite) {
                punto = Number.isInteger(g.punto) && g.punto >= 0 && g.punto < CAP ? g.punto
                      : (abierto ? puntoDefecto++ : null);
            }
            this.estado[c.id] = {
                x: Number.isFinite(g.x) ? g.x : 0,
                y: Number.isFinite(g.y) ? g.y : 0,
                abierto, punto,
                opacidad: Number.isFinite(g.opacidad) ? g.opacidad : 1
            };
            this.el(c.id).hidden = !abierto;
        });

        const a = this.area(), z = this.zonaNotas();
        const molde = { width: this.el('widget-escala').offsetWidth, height: this.el('widget-escala').offsetHeight };
        SysLog('LAYOUT', `Incremento 5.3 (chasis): molde de ${Math.round(molde.width)} x ${Math.round(molde.height)} px por widget, tope de ancho dos octavos = ${Math.round(LIENZO_ANCHO / 4)} px.`);
        SysLog('LAYOUT', `Área de arrastre: de y=${Math.round(a.top)} (barra) a y=${Math.round(a.bottom)} (borde de la ventana). El piano dejó de ser límite: los widgets flotan sobre el fondo entero.`);
        SysLog('LAYOUT', `Zona de notas, contra la que se mide el presupuesto: de y=${Math.round(z.top)} a y=${Math.round(z.bottom)}, ${Math.round(z.bottom - z.top)} px.`);
        this.puntosCompeten().forEach((p, i) => SysLog('LAYOUT', `  punto de nacimiento ${i}: (${Math.round(p.x)}, ${Math.round(p.y)}).`));

        CAJAS.forEach(c => {
            const el = this.el(c.id), e = this.estado[c.id];
            this.aplicarOpacidad(c.id);
            if (!e.abierto) {
                SysLog('LAYOUT', `  "${c.id}": cerrada al cargar. Se restaura desde el menú de Widgets.`);
                this.arrastrable(el);
                return;
            }
            const tenia = guardado[c.id] && Number.isFinite(guardado[c.id].x);
            const base = tenia ? { x: e.x, y: e.y } : this.nacimiento(c.id);
            const cl = this.clamp(el, base.x, base.y);
            this.colocar(el, cl.x, cl.y);
            if (tenia && cl.frenado) SysLog('LAYOUT', `  "${c.id}": abierta, la posición guardada (${base.x}, ${base.y}) caía fuera del área y se reubicó en (${Math.round(cl.x)}, ${Math.round(cl.y)}), opacidad ${e.opacidad}.`);
            else if (tenia) SysLog('LAYOUT', `  "${c.id}": abierta, posición restaurada en (${Math.round(cl.x)}, ${Math.round(cl.y)}), opacidad ${e.opacidad}${c.compite ? `, punto ${e.punto}` : ''}.`);
            else SysLog('LAYOUT', `  "${c.id}": abierta, nace en (${Math.round(cl.x)}, ${Math.round(cl.y)}), opacidad ${e.opacidad}${c.compite ? `, punto ${e.punto}` : ''}.`);
            this.arrastrable(el);
        });

        const ocupados = CAJAS.filter(c => c.compite && this.estado[c.id].abierto).length;
        SysLog('LAYOUT', `Cap de widgets que compiten: ${ocupados} de ${CAP} ocupados, ${CAP - ocupados === 1 ? "1 libre" : `${CAP - ocupados} libres`}. Las cajas de sistema no cuentan.`);

        const cob = this.cobertura();
        const pct = v => ((v / cob.zona) * 100).toFixed(1) + '%';
        // El tope de tres octavos es una restricción del molde por defecto. Si el
        // usuario movió las cajas, tapar más es decisión suya y no un defecto, así
        // que el reporte dice contra cuál de los dos layouts se está midiendo.
        const puntos = this.puntosCompeten();
        const porDefecto = CAJAS.every(c => {
            const e = this.estado[c.id];
            if (!e.abierto) return true;
            const n = c.compite ? puntos[e.punto] : this.nacimientoSistema(c.id);
            return Math.abs(e.x - Math.round(n.x)) <= 1 && Math.abs(e.y - Math.round(n.y)) <= 1;
        });
        const veredicto = cob.compiten / cob.zona <= 0.375 ? 'Entra.' : (porDefecto ? '⚠️ El molde por defecto se pasó del tope.' : 'Por encima del tope, con las cajas movidas por el usuario: es su decisión, no un defecto del molde.');
        SysLog('LAYOUT', `Cobertura de los widgets que compiten: ${Math.round(cob.compiten)} px de ${Math.round(cob.zona)} = ${pct(cob.compiten)}. Tope: tres octavos, 37.5%. Layout ${porDefecto ? 'por defecto' : 'movido por el usuario'}. ${veredicto}`);
        SysLog('LAYOUT', `Cobertura total incluyendo las cajas de sistema: ${Math.round(cob.todo)} px = ${pct(cob.todo)}. Cifra informativa: las de sistema no cuentan contra el tope.`);
    }
};

// El feedback del sistema muestra los avisos que genera el chasis. No viene del
// motor: cablearlo a la salida del motor es trabajo posterior. Si la propia caja de
// feedback está cerrada, el aviso igual queda en el log.
const Feedback = {
    avisar(texto) {
        const el = document.getElementById('sys-feedback');
        if (el) el.textContent = texto;
        SysLog('LAYOUT', `Feedback: ${texto}`);
    }
};
