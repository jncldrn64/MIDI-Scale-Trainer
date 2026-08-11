// lienzo.js: el objeto Lienzo y las medidas del cascarón. Cortado de index.html en la partición, sin mover nada.

// --- EL CASCARÓN DEL LIENZO (incremento 5.6) ---
// Todo el contenido vive en un contenedor de 1280 x 720 px fijos. Este objeto es el
// único lugar de la app que lee el tamaño de la ventana: calcula la escala y los
// offsets, y se los escribe al cascarón. Todo lo demás mide en píxeles de lienzo.
const LIENZO_ANCHO = 1280, LIENZO_ALTO = 720;

const Lienzo = {
    escala: 1, offsetX: 0, offsetY: 0,

    ajustar(motivo) {
        const w = window.innerWidth, h = window.innerHeight;
        this.escala = Math.min(w / LIENZO_ANCHO, h / LIENZO_ALTO);
        this.offsetX = (w - LIENZO_ANCHO * this.escala) / 2;
        this.offsetY = (h - LIENZO_ALTO * this.escala) / 2;
        const el = document.getElementById('lienzo');
        el.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.escala})`;
        // Reescribir el transform de cada caja abierta con LAS MISMAS coordenadas. Una
        // capa de composición se rasteriza una vez, a la escala que había cuando se
        // creó, y cambiar el transform de un ancestro no la invalida: la estira. Escribir
        // el mismo valor la ensucia y la obliga a rasterizar a la escala nueva.
        // Esto NO es lógica de reubicación por resize, que sigue prohibida: no recalcula
        // ninguna posición, reescribe la que la caja ya tenía.
        if (typeof Layout !== 'undefined' && Layout.estado) {
            CAJAS.forEach(c => {
                const e = Layout.estado[c.id];
                if (e && e.abierto) document.getElementById(c.id).style.transform = `translate(${e.x}px, ${e.y}px)`;
            });
        }
        const franjaH = Math.round(this.offsetX), franjaV = Math.round(this.offsetY);
        SysLog('LAYOUT', `Lienzo (${motivo}): ventana ${w} x ${h}, escala min(${w}/${LIENZO_ANCHO}, ${h}/${LIENZO_ALTO}) = ${this.escala.toFixed(4)}, offset (${franjaH}, ${franjaV}).`);
        SysLog('LAYOUT', `Franjas negras: ${franjaH} px a cada lado, ${franjaV} px arriba y abajo. El lienzo dibujado mide ${Math.round(LIENZO_ANCHO * this.escala)} x ${Math.round(LIENZO_ALTO * this.escala)} px de pantalla.`);
    },

    // El puntero llega en coordenadas de pantalla y el transform de cada caja se
    // escribe en coordenadas de lienzo. Sin esta conversión, a escala 1.5 la caja se
    // movería un 50% más rápido que el puntero, y con franjas quedaría desplazada.
    aLienzo(clientX, clientY) {
        return { x: (clientX - this.offsetX) / this.escala, y: (clientY - this.offsetY) / this.escala };
    }
};
