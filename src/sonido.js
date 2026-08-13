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

const Sonido = {
    ctx: null,
    // El contexto de audio arranca suspendido hasta el primer gesto del usuario. Se crea y se
    // reanuda con el primer clic o la primera tecla, no al cargar: creado al cargar queda
    // suspendido y el primer veredicto no sale, sin que nadie entienda por qué.
    despertar(motivo) {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            SysLog('SYS', `Contexto de audio creado por ${motivo}. Estado: ${this.ctx.state}.`);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => SysLog('SYS', `Contexto de audio reanudado por ${motivo}. Estado: ${this.ctx.state}.`));
        }
    },
    veredicto(estado) {
        if (!State.config.sonido) return;
        const s = SONIDOS[estado];
        // `passing` no suena: solo existe al soltar la tecla, y el feedback suena al apretar.
        if (!s) { SysLog('SYS', `Sin sonido para el veredicto "${estado}": no está en la tabla.`); return; }
        this.despertar('un veredicto');
        if (this.ctx.state !== 'running') {
            SysLog('SYS', `⚠️ Sonido "${s.nombre}" pedido con el contexto en "${this.ctx.state}". El navegador no deja sonar nada antes del primer clic sobre la página.`);
            return;
        }
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
