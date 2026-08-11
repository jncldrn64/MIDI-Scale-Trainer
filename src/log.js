// log.js: SysLog y los dos exportadores del historial. Cortado de index.html en la partición, sin mover nada.

// --- SISTEMA DE LOGS OPTIMIZADO ---
function SysLog(cat, msg, data = null) {
    const time = new Date().toISOString().split('T')[1].slice(0, -1);
    
    // Límite de retención en RAM
    if (State.logHistory.length >= 5000) State.logHistory.shift(); 
    State.logHistory.push({ time, cat, msg, data });

    const container = document.getElementById('logs-container');
    if (!container) return;

    // Creación eficiente en DOM
    const logDiv = document.createElement('div');
    logDiv.className = 'log-entry';
    logDiv.innerHTML = `<span style="color:#64748b">[${time}]</span> <span class="cat-${cat}"><b>${cat}</b></span>: ${msg} ${data ? '<br><small>'+JSON.stringify(data)+'</small>' : ''}`;
    container.appendChild(logDiv);

    if (container.children.length > 100) container.removeChild(container.firstChild);
    container.scrollTop = container.scrollHeight;
}

function exportLogsTxt() {
    const txt = State.logHistory.map(l => `[${l.time}] ${l.cat}: ${l.msg} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type: 'text/plain'}));
    a.download = `midi-logs-${Date.now()}.txt`; a.click();
    SysLog('LAYOUT', `Descarga .txt disparada (${State.logHistory.length} entradas)`);
}

// Fase 5: copiar el historial al portapapeles. Misma fuente que exportLogsTxt
// (State.logHistory). Es UI pura, no toca el motor.
function copyLogsClipboard() {
    const txt = State.logHistory.map(l => `[${l.time}] ${l.cat}: ${l.msg} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt)
            .then(() => SysLog('LAYOUT', `Logs copiados al portapapeles (${State.logHistory.length} entradas)`))
            .catch(err => SysLog('LAYOUT', '⚠️ No se pudo copiar al portapapeles: ' + err));
    } else {
        SysLog('LAYOUT', '⚠️ navigator.clipboard no disponible en este contexto');
    }
}

// --- MOTOR MATEMÁTICO ---
// MathEngine.detectChord / isDiatonic viven en src/engine.js (fuente única
// de verdad). Se referencian abajo como global MathEngine.
