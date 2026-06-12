// Campanita sintetizada con Web Audio API — sin assets ni red. Suena cuando
// entra un pedido nuevo al tablero. Los navegadores bloquean el audio hasta que
// hay un gesto del usuario, por eso el AudioContext se crea/reanuda al activar
// el toggle (que ya es un click).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Reanuda el contexto de audio dentro de un gesto del usuario. */
export function armChime(): void {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

/** Reproduce un "ding-dong" corto de dos notas. */
export function playChime(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime;
  const notes = [
    { freq: 880, start: 0 }, // A5
    { freq: 1175, start: 0.16 }, // D6
  ];
  for (const n of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = n.freq;
    const t = now + n.start;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }
}
