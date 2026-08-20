// sonido.js: el objeto Sonido, feedback de veredicto. Es una superficie del sistema: los tres
// sonidos los ofrece el sistema y cada widget decide cuál usar. No manda nada por MIDI y no
// carga ningún archivo; los genera con osciladores al vuelo. Ver DECISIONS, 2026-08-11,
// "Feedback de veredicto y música son dos cosas, y el sonido es una superficie del sistema".

// Los tres veredictos que existen en el momento de apretar la tecla, derivados de una tabla y
// no escritos a mano en tres lugares. Agregar una variante es agregar una fila.
const SONIDOS = {
    good:    { hz: 880, tipo: 'sine',     ms: 90,  pico: 0.12, nombre: 'acierto' },
    tension: { hz: 587, tipo: 'triangle', ms: 130, pico: 0.12, nombre: 'sensible' },
    bad:     { hz: 196, tipo: 'square',   ms: 160, pico: 0.10, nombre: 'error' }
};

// Crear el contexto y reanudarlo son dos cosas distintas y por eso son dos funciones. Crear
// cuesta caro y no necesita permiso del usuario; reanudar es barato y sí lo necesita, porque el
// navegador deja el contexto suspendido hasta el primer gesto sobre la página.
//
// Hasta la v11.88 las dos vivían en `despertar`, y la primera llamada caía adentro del manejador
// de apretar la tecla, que es el que estampa el momento de inicio del que después se resta la
// duración. Resultado medido: la primera nota de la sesión se leía más larga de lo que duró y
// perdía el indulto por paso cromático. Ver el ítem del BACKLOG "El contexto de audio se crea
// dentro del camino de la nota y se come el indulto".
const Sonido = {
    ctx: null,
    // Se llama al cargar si el sonido viene encendido, y al encender el interruptor. Los dos
    // momentos están fuera del camino de la nota. No se crea al cargar con el sonido apagado:
    // quien nunca lo enciende no paga un contexto de audio que no pidió.
    crear(motivo) {
        if (this.ctx) return;
        const t0 = performance.now();
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        SysLog('SYS', `Contexto de audio creado por ${motivo} en ${(performance.now() - t0).toFixed(1)} ms. Estado: ${this.ctx.state}. Se crea acá y no al apretar una tecla para que ese costo no infle la duración de la primera nota.`);
    },
    // Reanudar sí necesita un gesto del usuario. Si todavía no hay contexto no hace nada: el
    // interruptor está apagado y no hay nada que reanudar.
    reanudar(motivo) {
        if (!this.ctx) return;
        if (this.ctx.state !== 'suspended') return;
        this.ctx.resume().then(() => SysLog('SYS', `Contexto de audio reanudado por ${motivo}. Estado: ${this.ctx.state}.`));
    },
    veredicto(estado) {
        if (!State.config.sonido) return;
        const s = SONIDOS[estado];
        // `passing` no suena: solo existe al soltar la tecla, y el feedback suena al apretar.
        if (!s) { SysLog('SYS', `Sin sonido para el veredicto "${estado}": no está en la tabla.`); return; }
        // Red por si el contexto no existe todavía. No debería pasar: el interruptor lo crea al
        // encenderse y el arranque lo crea si viene encendido. Si pasa, se registra, porque
        // significa que un camino nuevo enciende el sonido sin avisarle a nadie.
        if (!this.ctx) {
            SysLog('SYS', '⚠ El contexto de audio no existía al pedir un veredicto: se crea acá, que es el camino que la v11.89 sacó. La primera nota va a leerse más larga de lo que duró.');
            this.crear('un veredicto, fuera del camino previsto');
        }
        if (this.ctx.state === 'running') { this.emitir(s, estado); return; }
        // Contexto suspendido. Pasa en el primer veredicto de la sesión: crear fuera de un gesto
        // del usuario deja el contexto suspendido, y `resume` devuelve una promesa que no resuelve
        // en el acto. Se emite cuando resuelve en vez de perder el sonido. Hasta la v11.88 esto no
        // hacía falta porque el contexto se creaba adentro del gesto y nacía corriendo, pero se
        // creaba adentro del camino de la nota, que es el defecto que este arreglo saca.
        this.ctx.resume().then(
            () => {
                SysLog('SYS', `Contexto de audio reanudado por un veredicto. Estado: ${this.ctx.state}.`);
                this.emitir(s, estado);
            },
            (e) => SysLog('SYS', `⚠️ Sonido "${s.nombre}" no salió: el contexto quedó en "${this.ctx.state}" y el navegador no lo reanudó (${e}). No deja sonar nada antes del primer clic sobre la página.`)
        );
    },
    emitir(s, estado) {
        const t = this.ctx.currentTime, dur = s.ms / 1000;
        const osc = this.ctx.createOscillator(), gan = this.ctx.createGain();
        osc.type = s.tipo; osc.frequency.value = s.hz;
        gan.gain.setValueAtTime(s.pico, t);
        gan.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gan); gan.connect(this.ctx.destination);
        osc.start(t); osc.stop(t + dur);
        SysLog('SYS', `Sonido "${s.nombre}" (${estado}): ${s.tipo} a ${s.hz} Hz, ${s.ms} ms, pico ${s.pico}.`);
    }
};
