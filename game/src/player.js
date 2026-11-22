// The thief: movement, stealth, noise, hiding, coin toss.
// Speeds: run 265 (loud), walk 170, sneak (Shift) 95 (silent), crouch (E) 70.
// Running paints a noise ring guards can hear; sneaking and crouching do not.

import { TILE } from './levels.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.r = 13;
    this.dir = -Math.PI / 2; // facing angle
    this.moving = false;
    this.running = false;
    this.sneaking = false;
    this.crouched = false;
    this.hidden = false; // inside a bush
    this.coins = 3;
    this.charms = 0;
    this.coin = null; // flying coin {x, y, sx, sy, tx, ty, t}
    this.stepAcc = 0;
  }

  reset(x, y) {
    this.x = x; this.y = y;
    this.dir = -Math.PI / 2;
    this.coins = 3; this.charms = 0;
    this.coin = null; this.crouched = false; this.hidden = false;
  }

  update(dt, world, input, events) {
    const mv = input.moveVector();
    this.sneaking = input.down('Shift');
    this.moving = mv.x !== 0 || mv.y !== 0;
    if (this.moving) this.dir = Math.atan2(mv.y, mv.x);

    if (input.wasPressed('e')) this.crouched = !this.crouched;

    let speed = 170;
    this.running = false;
    if (this.sneaking) speed = 95;
    else if (!this.sneaking && this.moving && !this.crouched) {
      // Hold nothing to walk; running is the default pace and it is loud.
      speed = 265; this.running = true;
    }
    if (this.crouched) { speed = 70; this.running = false; }

    if (this.moving) {
      const nx = this.x + mv.x * speed * dt;
      const ny = this.y + mv.y * speed * dt;
      const fixed = world.collide(nx, ny, this.r);
      this.x = fixed.x; this.y = fixed.y;
      this.stepAcc += speed * dt;
      if (this.stepAcc > 34) { this.stepAcc = 0; events.push(this.running ? 'step-run' : 'step'); }
    }

    // Hidden while standing in a bush (crouching in one hides completely).
    const tx = Math.floor(this.x / TILE), ty = Math.floor(this.y / TILE);
    this.hidden = world.isBushTile(tx, ty);

    // Running makes noise: guards nearby turn to look.
    if (this.running && this.moving) {
      events.push({ type: 'noise', x: this.x, y: this.y, radius: 130 });
    }

    // Coin toss: F or Space throws toward the facing direction.
    if (input.wasPressed('f', ' ') && this.coins > 0 && !this.coin) {
      this.coins--;
      const range = 230;
      const tx2 = this.x + Math.cos(this.dir) * range;
      const ty2 = this.y + Math.sin(this.dir) * range;
      const fixed = world.collide(tx2, ty2, 6);
      this.coin = { sx: this.x, sy: this.y, tx: fixed.x, ty: fixed.y, t: 0 };
      events.push('coin-throw');
    }

    if (this.coin) {
      this.coin.t += dt / 0.45;
      if (this.coin.t >= 1) {
        events.push({ type: 'coin-land', x: this.coin.tx, y: this.coin.ty });
        this.coin = null;
      }
    }
  }

  coinPos() {
    if (!this.coin) return null;
    const t = Math.min(1, this.coin.t);
    const ease = t * (2 - t);
    return {
      x: this.coin.sx + (this.coin.tx - this.coin.sx) * ease,
      y: this.coin.sy + (this.coin.ty - this.coin.sy) * ease,
      height: Math.sin(t * Math.PI) * 34,
    };
  }
}
