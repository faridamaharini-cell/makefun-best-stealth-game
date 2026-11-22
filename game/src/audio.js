// Synthesised WebAudio sounds only — no audio files. Everything is a short
// oscillator / noise burst so the game ships silent files and still feels alive.

export const audio = {
  ctx: null,
  muted: false,
  _stepAcc: 0,
  _guardStepAlt: false,
  _drone: null, // {gain, oscillators[]} ambient bed, started once

  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this._drone) this._drone.gain.gain.value = this.muted ? 0 : 0.028;
    return this.muted;
  },

  // A quiet festival-night drone: two detuned low oscillators through a
  // lowpass, breathing slowly. Starts once, on first user gesture.
  startAmbientDrone() {
    const ctx = this.ensure();
    if (!ctx || this._drone) return;
    const gain = ctx.createGain();
    gain.gain.value = this.muted ? 0 : 0.028;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 320;
    filter.connect(gain).connect(ctx.destination);
    const oscs = [55, 82.5, 110.3].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = i === 0 ? -4 : 3;
      o.connect(filter); o.start();
      return o;
    });
    // Slow breathing LFO on the drone gain.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();
    this._drone = { gain, oscillators: [...oscs, lfo] };
  },

  stopAmbientDrone() {
    if (!this._drone) return;
    for (const o of this._drone.oscillators) { try { o.stop(); } catch { /* already stopped */ } }
    this._drone = null;
  },

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

  // Tone placed left/right in the stereo field (pan -1..1).
  _pannedTone(freq, dur, type = 'sine', vol = 0.12, pan = 0, slideTo = null, delay = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) panner.pan.value = Math.max(-1, Math.min(1, pan));
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (panner) osc.connect(gain).connect(panner).connect(ctx.destination);
    else osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  // Filtered noise burst placed left/right (pan -1..1).
  _pannedNoise(dur, vol = 0.05, freq = 800, pan = 0) {
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
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      src.connect(filter).connect(gain).connect(panner).connect(ctx.destination);
    } else src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  },

  // Plain centred noise burst (thief steps, douse hiss, alarm wash).
  _noise(dur, vol = 0.05, freq = 800) {
    this._pannedNoise(dur, vol, freq, 0);
  },

  // Soft footstep tick, throttled by the caller.
  step(running) {
    this._stepAcc += 1;
    if (this._stepAcc % (running ? 2 : 3) !== 0) return;
    this._noise(0.05, running ? 0.06 : 0.035, running ? 1400 : 700);
  },

  // A GUARD's footstep, heard in stereo: louder and brighter the closer the
  // guard is, panned left/right by where the guard stands relative to the
  // thief — footsteps that tell you where a guard is.
  guardFootstep(distance, pan) {
    if (distance > 560) return; // too far to hear
    const closeness = 1 - distance / 560;
    const vol = 0.03 + closeness * 0.13;
    const freq = 320 + closeness * 900; // near steps are sharper
    this._guardStepAlt = !this._guardStepAlt;
    this._pannedNoise(0.07, vol, freq, pan);
    if (this._guardStepAlt) this._pannedTone(95, 0.06, 'sine', vol * 0.7, pan);
    else this._pannedTone(80, 0.06, 'sine', vol * 0.7, pan);
  },

  // Alarm stinger: a dissonant brass-like hit when a guard starts the chase.
  alertStinger() {
    this._tone(220, 0.3, 'sawtooth', 0.15, 110);
    this._tone(233, 0.3, 'sawtooth', 0.13, 116); // semitone clash
    this._tone(330, 0.22, 'sawtooth', 0.1, 165, 0.05);
    this._noise(0.28, 0.09, 500);
    this._tone(440, 0.18, 'square', 0.05, 220, 0.12);
  },

  coin() { this._tone(1900, 0.09, 'triangle', 0.14); this._tone(2500, 0.12, 'triangle', 0.1, null, 0.07); },
  douse() { this._noise(0.35, 0.09, 400); this._tone(520, 0.25, 'sine', 0.08, 180); },
  coinLand() { this._tone(1250, 0.06, 'square', 0.05); this._tone(950, 0.08, 'square', 0.04, null, 0.05); },
  // Jade charm pickup chime: a bright pentatonic sparkle, panned centre.
  pickupChime() {
    [660, 880, 990, 1320, 1760].forEach((f, i) => this._pannedTone(f, 0.2, 'sine', 0.11, 0, null, i * 0.05));
    this._pannedTone(330, 0.3, 'triangle', 0.06, 0);
  },
  pickup() { this.pickupChime(); },
  suspicious() { this._tone(392, 0.16, 'triangle', 0.12, 466); },
  alert() { this.alertStinger(); },
  caught() {
    this._tone(311, 0.35, 'sawtooth', 0.16, 155);
    this._tone(233, 0.5, 'sawtooth', 0.14, 116, 0.18);
  },
  // Exit fanfare: a rising festival melody over a low drum swell.
  exitFanfare() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this._pannedTone(f, 0.34, 'triangle', 0.13, 0, null, i * 0.13));
    this._pannedTone(262, 0.8, 'sine', 0.1, 0);
    this._pannedTone(131, 0.9, 'sine', 0.09, 0, null, 0.05);
    this._pannedNoise(0.5, 0.04, 600, 0);
  },
  win() { this.exitFanfare(); },
  levelClear() {
    [784, 988, 1175].forEach((f, i) => this._tone(f, 0.22, 'triangle', 0.12, null, i * 0.1));
  },
};
