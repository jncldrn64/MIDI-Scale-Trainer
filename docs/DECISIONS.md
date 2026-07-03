# DECISIONS.md — MIDI Scale Trainer Pro

> Registro append-only. No se borran entradas viejas aunque queden obsoletas — se agrega
> una entrada nueva que referencia y reemplaza a la anterior. El objetivo es que nunca
> más se pierda el "por qué" de una decisión, como pasó con v11.5.

---

### 2026-07-03 — Base de reconstrucción: v11.0, no v11.5

**Contexto:** el proyecto llegó a una v11.5 (interfaz responsive líquida, según chats de
Gemini) pero el archivo se perdió y no hay repositorio.

**Decisión:** se reconstruye hacia adelante desde `v11.0` (604 líneas, archivo real
disponible y verificado), no se intenta recuperar v11.5 de memoria/chats.

**Razón:** todo lo que se sabe de v11.5 es narrativa de IA sobre logs de chat, nunca
confirmada contra código real. Reconstruir de memoria una versión no verificada arriesga
fijar como "hecho" algo que puede estar inflado o mal atribuido (ver hallazgos de
`ARCHITECTURE.md` §0).

**Estado:** vigente.

---

### 2026-07-03 — No migrar a framework (React/Vue/etc.) por ahora

**Contexto:** se consideró migrar a un framework para "ordenar" la arquitectura y evitar
futuros parches hardcodeados.

**Decisión:** se mantiene JavaScript vanilla con el patrón de objetos-módulo actual
(`State`/`MathEngine`/`MIDI`/`UI`). Se reconsidera solo si el archivo supera ~1000 líneas
o aparece necesidad real de UI reactiva compleja.

**Razón:** los colapsos históricos documentados (freeze en V6, fuga de memoria por
`innerHTML`) fueron problemas de patrones DOM/async, no límites del lenguaje. El problema
real de fondo es la falta de una jerarquía formal de reglas de teoría musical (ver Fase 2
del roadmap), y eso no lo resuelve ningún framework. Sumar una curva de aprendizaje de
framework ahora compite con la curva de aprendizaje de teoría musical, que es la prioridad.

**Estado:** vigente.

---

### 2026-07-03 — Repositorio privado + PII fuera del código

**Contexto:** se encontró un nombre real hardcodeado en `<div class="credits">` de v11.0.

**Decisión:** se quita esa información antes de cualquier commit. El repositorio se
mantiene privado independientemente de eso.

**Razón:** información personal en código fuente no debería depender de que el repo sea
público o privado para estar protegida — un repo privado puede volverse público por error,
puede tener colaboradores futuros, etc.

**Estado:** vigente.

---

### (Histórico, no verificado en código — solo referencia) Heurísticas de v11.0

Estas reglas SÍ están confirmadas leyendo el archivo real (a diferencia de la narrativa de
versiones V10.x/V11.x de Gemini, que no se pudo verificar):

- **Sensible en escala menor:** `(root + 11) % 12`. Se marca `tension` si esa nota suena
  y no está en la escala ni en el acorde activo, solo en universos `minor`/`harmonic_minor`.
  Pendiente (no resuelto): la sensible también existe en escalas mayores y no se detecta
  ahí — queda para cuando se formalice la Fase 2 del roadmap.
- **Paso cromático:** cualquier nota no-`good` que dure menos de 180ms al soltarse se
  reclasifica a `passing`. Umbral elegido empíricamentemente contra el caso Bad Apple, no
  matemáticamente derivado — es la heurística más "hardcodeada" que sigue viva en el motor.
- **Dominante secundaria:** target a `+5` semitones (cuarta justa ascendente) desde la raíz
  del acorde. Confirmado que hoy **solo actualiza texto en la UI**, no afecta
  `evaluateMelody`. Corrección planeada en Fase 3 del roadmap.

---

### Plantilla para nuevas entradas

```
### YYYY-MM-DD — Título corto de la decisión

**Contexto:** qué problema o pregunta motivó esto.

**Decisión:** qué se decidió, en una o dos frases.

**Razón:** por qué esta opción y no otra (mencionar alternativas descartadas si aplica).

**Estado:** vigente / reemplazada por [fecha] / obsoleta
```
