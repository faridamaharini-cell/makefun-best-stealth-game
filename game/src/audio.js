// Synthesised WebAudio sounds only — no audio files. Everything is a short
// oscillator / noise burst so the game ships silent files and still feels alive.

export const audio = {
  ctx: null,
  muted: false,
  _stepAcc: 0,

  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  toggleMute() { this.muted = !this.muted; return this.muted; },

  _tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  _noise(dur, vol = 0.05, freq = 800) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  },

  // Soft footstep tick, throttled by the caller.
  step(running) {
    this._stepAcc += 1;
    if (this._stepAcc % (running ? 2 : 3) !== 0) return;
    this._noise(0.05, running ? 0.06 : 0.035, running ? 1400 : 700);
  },

  coin() { this._tone(1900, 0.09, 'triangle', 0.14); this._tone(2500, 0.12, 'triangle', 0.1, null, 0.07); },
  coinLand() { this._tone(1250, 0.06, 'square', 0.05); this._tone(950, 0.08, 'square', 0.04, null, 0.05); },
  pickup() { this._tone(660, 0.1, 'sine', 0.12); this._tone(990, 0.14, 'sine', 0.12, null, 0.08); this._tone(1320, 0.18, 'sine', 0.1, null, 0.16); },
  suspicious() { this._tone(392, 0.16, 'triangle', 0.12, 466); },
  alert() {
    this._tone(220, 0.28, 'sawtooth', 0.14, 110);
    this._tone(330, 0.2, 'sawtooth', 0.1, 165, 0.05);
    this._noise(0.25, 0.08, 500);
  },
  caught() {
    this._tone(311, 0.35, 'sawtooth', 0.16, 155);
    this._tone(233, 0.5, 'sawtooth', 0.14, 116, 0.18);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => this._tone(f, 0.32, 'triangle', 0.13, null, i * 0.13));
  },
  levelClear() {
    [784, 988, 1175].forEach((f, i) => this._tone(f, 0.22, 'triangle', 0.12, null, i * 0.1));
  },
};
