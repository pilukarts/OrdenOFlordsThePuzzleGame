let context: AudioContext | null = null;
let muted = false;
let lastLanding = 0;

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) context = new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(frequency: number, duration: number, volume: number, delay = 0, type: OscillatorType = 'sine'): void {
  if (muted) return;
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, frequency * 0.72), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function unlockAudio(): void { audioContext(); }
export function setEffectsMuted(value: boolean): void { muted = value; }
export function toggleEffects(): boolean { muted = !muted; return !muted; }
export function areEffectsEnabled(): boolean { return !muted; }

export function playGemLand(column: number): void {
  const now = performance.now();
  if (now - lastLanding < 45) return;
  lastLanding = now;
  tone(250 + column * 24, 0.09, 0.025, 0, 'triangle');
}

export function playMatchSound(clusterCount: number): void {
  const notes = [392, 494, 587, 784];
  notes.forEach((note, index) => tone(note * Math.min(1.35, 1 + clusterCount * 0.04), 0.2, 0.055, index * 0.055, 'sine'));
}

export function playMeterSound(): void {
  tone(660, 0.12, 0.045, 0, 'triangle');
  tone(880, 0.18, 0.04, 0.08, 'triangle');
}

export function playBonusSound(): void {
  [262, 330, 392, 523].forEach((note, index) => tone(note, 0.8, 0.075, index * 0.1, 'sawtooth'));
}

export function playStartSound(): void {
  [196, 294, 392].forEach((note, index) => tone(note, 0.55, 0.05, index * 0.09, 'triangle'));
}
