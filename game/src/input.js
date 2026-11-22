// Keyboard + mouse input. Tracks held keys and one-frame "pressed" edges so the
// game can react to taps (coin toss, hide, mute, restart) without repeats.

export const input = {
  keys: new Set(),
  pressed: new Set(),
  mouse: { x: 0, y: 0, down: false },

  init(canvas) {
    const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    addEventListener('keydown', (e) => {
      if (GAME_KEYS.includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this.keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    addEventListener('keyup', (e) => {
      this.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    addEventListener('blur', () => { this.keys.clear(); });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', () => { this.mouse.down = true; });
    addEventListener('mouseup', () => { this.mouse.down = false; });
  },

  down(...names) { return names.some((n) => this.keys.has(n)); },
  wasPressed(...names) { return names.some((n) => this.pressed.has(n)); },
  endFrame() { this.pressed.clear(); },

  // Normalised WASD / arrow movement vector.
  moveVector() {
    let x = 0, y = 0;
    if (this.down('a', 'ArrowLeft')) x -= 1;
    if (this.down('d', 'ArrowRight')) x += 1;
    if (this.down('w', 'ArrowUp')) y -= 1;
    if (this.down('s', 'ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  },
};
