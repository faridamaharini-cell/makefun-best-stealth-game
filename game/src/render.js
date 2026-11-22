// Canvas rendering: indigo night, warm lantern light, jade charms, vermilion guards.
// Everything is drawn in code — no images. Light pools and vision cones are
// translucent layers; fireflies and embers drift for life.

import { TILE, COLS, ROWS, WORLD_W, WORLD_H } from './levels.js';
import { CONE_RANGE, CONE_HALF_ANGLE } from './guard.js';

const CONE_FILL = {
  gold: 'rgba(255, 205, 90, 0.20)',
  orange: 'rgba(255, 140, 40, 0.30)',
  red: 'rgba(255, 60, 50, 0.38)',
  crimson: 'rgba(255, 45, 90, 0.22)',
};
const CONE_EDGE = {
  gold: 'rgba(255, 205, 90, 0.55)',
  orange: 'rgba(255, 140, 40, 0.7)',
  red: 'rgba(255, 60, 50, 0.85)',
  crimson: 'rgba(255, 45, 90, 0.7)',
};

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const embers = [];
  for (let i = 0; i < 70; i++) {
    embers.push({
      x: Math.random() * WORLD_W, y: Math.random() * WORLD_H,
      r: 1 + Math.random() * 2.2, s: 6 + Math.random() * 14,
      ph: Math.random() * Math.PI * 2, gold: Math.random() < 0.6,
    });
  }

  function drawCone(g, t) {
    const color = g.coneColor;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.arc(g.x, g.y, g.coneRange || CONE_RANGE, g.dir - (g.coneHalfAngle || CONE_HALF_ANGLE), g.dir + (g.coneHalfAngle || CONE_HALF_ANGLE));
    ctx.closePath();
    ctx.fillStyle = CONE_FILL[color];
    ctx.fill();
    ctx.strokeStyle = CONE_EDGE[color];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Alert "!" or "?" above a guard that has noticed something.
    if (g.state === 'chase' || g.state === 'suspicious' || g.state === 'search') {
      const mark = g.state === 'chase' ? '!' : '?';
      const bob = Math.sin(t * 6) * 2;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = g.state === 'chase' ? '#ff5040' : '#ffb020';
      ctx.fillText(mark, g.x, g.y - 26 + bob);
    }
    ctx.restore();
  }

  function drawLantern(l, t) {
    if (l.doused) {
      // Snuffed lantern: no light pool, dark cold body, a wisp of smoke.
      const g = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, l.r);
      g.addColorStop(0, 'rgba(40, 50, 90, 0.30)');
      g.addColorStop(1, 'rgba(40, 50, 90, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1a2e';
      ctx.fillRect(l.x - 1.5, l.y - 2, 3, 22);
      ctx.fillStyle = '#3a2a30';
      ctx.beginPath(); ctx.ellipse(l.x, l.y - 6, 11, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c1418';
      ctx.beginPath(); ctx.ellipse(l.x, l.y - 6, 6, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5a4a3a';
      ctx.fillRect(l.x - 7, l.y - 20, 14, 3);
      ctx.fillRect(l.x - 7, l.y + 5, 14, 3);
      // Rising smoke wisp.
      const sway = Math.sin(t * 1.6 + l.x) * 6;
      ctx.strokeStyle = 'rgba(210, 210, 220, 0.65)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y - 20);
      ctx.quadraticCurveTo(l.x + sway, l.y - 38, l.x - sway * 0.5, l.y - 54);
      ctx.stroke();
      ctx.fillStyle = 'rgba(210, 210, 220, 0.65)';
      ctx.beginPath(); ctx.arc(l.x - sway * 0.5, l.y - 56, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(210, 210, 220, 0.4)';
      ctx.beginPath(); ctx.arc(l.x + sway * 0.6, l.y - 44, 3, 0, Math.PI * 2); ctx.fill();
      // "DOUSED" tag so the dark zone reads clearly.
      ctx.fillStyle = '#9fb3ff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DOUSED', l.x, l.y + 36);
      return;
    }
    const flick = 0.85 + Math.sin(t * 5 + l.x) * 0.08 + Math.sin(t * 11 + l.y) * 0.05;
    const grad = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, l.r);
    grad.addColorStop(0, `rgba(255, 190, 90, ${0.34 * flick})`);
    grad.addColorStop(0.55, `rgba(255, 160, 60, ${0.14 * flick})`);
    grad.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill();
    // Paper lantern body on a post.
    ctx.fillStyle = '#2a1a2e';
    ctx.fillRect(l.x - 1.5, l.y - 2, 3, 22);
    ctx.fillStyle = '#ff5a3c';
    ctx.beginPath(); ctx.ellipse(l.x, l.y - 6, 11, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255, 220, 130, ${0.95 * flick})`;
    ctx.beginPath(); ctx.ellipse(l.x, l.y - 6, 6, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(l.x - 7, l.y - 20, 14, 3);
    ctx.fillRect(l.x - 7, l.y + 5, 14, 3);
  }

  function drawGuard(g, t) {
    // Vermilion robe, dark belt, pale face, helmet crest.
    // ELITE guards wear crimson with a gold crest and a red plume.
    const robe = g.elite ? '#a31226' : '#c22e1e';
    const belt = g.elite ? '#4a0510' : '#7d1a10';
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.dir);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 4, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = belt;
    ctx.fillRect(-4, -8, 8, 16);
    ctx.fillStyle = '#f2d8a0';
    ctx.beginPath(); ctx.arc(15, 0, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1c1c28';
    ctx.beginPath(); ctx.arc(16, 0, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = g.elite ? '#ff2d5a' : '#ffd76a';
    ctx.beginPath(); ctx.moveTo(10, -7); ctx.lineTo(16, 0); ctx.lineTo(10, 7); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (g.elite) {
      ctx.fillStyle = '#ff2d5a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ELITE', g.x, g.y - 34);
    }
    // Suspicion arc above the guard.
    if (g.suspicion > 0.05) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(g.x, g.y - 24, 9, -Math.PI / 2, Math.PI * 1.5); ctx.stroke();
      ctx.strokeStyle = g.suspicion > 0.7 ? '#ff4030' : '#ffb020';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(g.x, g.y - 24, 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.suspicion); ctx.stroke();
      ctx.restore();
    }
  }

  function drawPlayer(p, t) {
    const bob = p.moving ? Math.sin(t * (p.running ? 16 : 10)) * 1.5 : 0;
    ctx.save();
    ctx.translate(p.x, p.y + bob * 0.3);
    ctx.globalAlpha = p.hidden ? 0.55 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 5, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
    // Indigo hooded cloak.
    ctx.fillStyle = '#2b3a8f';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1d2766';
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(0, -16); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
    // Face + gold trim.
    ctx.fillStyle = '#f2d8a0';
    ctx.beginPath(); ctx.arc(Math.cos(p.dir) * 5, Math.sin(p.dir) * 5, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 13, p.dir - 1.2, p.dir + 1.2); ctx.stroke();
    if (p.crouched) {
      ctx.fillStyle = '#7ee787';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CROUCH', 0, -22);
    }
    ctx.restore();
    // Noise ring while running loud.
    if (p.running && p.moving) {
      const pulse = (t * 2) % 1;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * (1 - pulse)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 30 + pulse * 100, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  function drawCharm(c, t) {
    if (c.taken) return;
    const bob = Math.sin(t * 3 + c.bob) * 3;
    const glow = ctx.createRadialGradient(c.x, c.y + bob, 2, c.x, c.y + bob, 26);
    glow.addColorStop(0, 'rgba(80, 230, 150, 0.5)');
    glow.addColorStop(1, 'rgba(80, 230, 150, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(c.x, c.y + bob, 26, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(c.x, c.y + bob);
    ctx.rotate(Math.PI / 4 + Math.sin(t * 2 + c.bob) * 0.15);
    ctx.fillStyle = '#2fd67e';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = '#a8f5c9';
    ctx.fillRect(-8, -8, 16, 6);
    ctx.strokeStyle = '#0e7a44';
    ctx.lineWidth = 2;
    ctx.strokeRect(-8, -8, 16, 16);
    ctx.restore();
  }

  function drawExit(exit, t, player) {
    const open = exit.open;
    const pulse = 0.6 + Math.sin(t * 3) * 0.25;
    // EXIT BEACON: a tall pillar of gold light rising from the shrine to the
    // top of the screen, visible across the whole level.
    const beamW = open ? 44 : 30;
    const beamGrad = ctx.createLinearGradient(exit.x - beamW, 0, exit.x + beamW, 0);
    const beamA = open ? 0.34 * pulse + 0.12 : 0.16;
    beamGrad.addColorStop(0, 'rgba(255, 215, 106, 0)');
    beamGrad.addColorStop(0.5, `rgba(255, 215, 106, ${beamA})`);
    beamGrad.addColorStop(1, 'rgba(255, 215, 106, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(exit.x - beamW, 0, beamW * 2, exit.y);
    ctx.fillStyle = `rgba(255, 230, 150, ${open ? 0.55 * pulse : 0.25})`;
    ctx.fillRect(exit.x - 3, 0, 6, exit.y);
    const glow = ctx.createRadialGradient(exit.x, exit.y, 4, exit.x, exit.y, open ? 90 : 55);
    glow.addColorStop(0, open ? `rgba(255, 215, 106, ${0.7 * pulse})` : 'rgba(255, 215, 106, 0.25)');
    glow.addColorStop(1, 'rgba(255, 215, 106, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(exit.x, exit.y, open ? 90 : 55, 0, Math.PI * 2); ctx.fill();
    // Torii-style shrine gate.
    ctx.save();
    ctx.translate(exit.x, exit.y);
    ctx.fillStyle = open ? '#ff5a3c' : '#5a3a34';
    ctx.fillRect(-26, -22, 52, 7);
    ctx.fillRect(-20, -12, 40, 5);
    ctx.fillRect(-22, -18, 6, 34);
    ctx.fillRect(16, -18, 6, 34);
    ctx.fillStyle = open ? '#ffd76a' : '#8a6a5a';
    ctx.beginPath(); ctx.arc(0, 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (open) {
      // When the EXIT label is up, move this line below the shrine so the
      // two labels never overlap.
      const labelUp = player && (Math.hypot(player.x - exit.x, player.y - exit.y) < 320);
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHRINE OPEN', exit.x, labelUp ? exit.y + 40 : exit.y - 32);
    }
    // "EXIT" label when the thief is close enough to read it (or it is open).
    const nearExit = player && Math.hypot(player.x - exit.x, player.y - exit.y) < 320;
    if (nearExit || open) {
      // Clamp so the label never clips off the top (level 3 exit sits high).
      const ly = Math.max(22, exit.y - 48);
      ctx.save();
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      const tw = ctx.measureText('⬆ EXIT').width + 18;
      ctx.fillStyle = 'rgba(7, 8, 26, 0.85)';
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(exit.x - tw / 2, ly - 17, tw, 24, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd76a';
      ctx.fillText('⬆ EXIT', exit.x, ly);
      ctx.restore();
    }
  }

  function drawWorld(world, t) {
    // Night floor: indigo stone with a subtle checker and scattered petals.
    ctx.fillStyle = '#12142e';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
      if ((tx + ty) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * TILE, 0); ctx.lineTo(x * TILE, WORLD_H); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * TILE); ctx.lineTo(WORLD_W, y * TILE); ctx.stroke(); }

    const def = world.def;
    // Walls.
    for (const w of def.walls) {
      ctx.fillStyle = '#23264a';
      ctx.fillRect(w.x * TILE, w.y * TILE, w.w * TILE, w.h * TILE);
      ctx.fillStyle = '#31356b';
      ctx.fillRect(w.x * TILE, w.y * TILE, w.w * TILE, 5);
      ctx.strokeStyle = '#10122a';
      ctx.strokeRect(w.x * TILE + 1, w.y * TILE + 1, w.w * TILE - 2, w.h * TILE - 2);
    }
    // Stalls: striped awnings over a counter.
    for (const s of def.stalls) {
      const x = s.x * TILE, y = s.y * TILE;
      ctx.fillStyle = '#3a2418';
      ctx.fillRect(x, y + 22, 80, 16);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#c22e1e' : '#f2e3c8';
        ctx.fillRect(x + i * 20, y + 4, 20, 18);
      }
      ctx.fillStyle = '#ffd76a';
      ctx.fillRect(x + 8, y + 26, 6, 6);
      ctx.fillRect(x + 38, y + 26, 6, 6);
      ctx.fillRect(x + 66, y + 26, 6, 6);
    }
    // Crates.
    for (const c of def.crates) {
      const x = c.x * TILE, y = c.y * TILE;
      ctx.fillStyle = '#6b4a26';
      ctx.fillRect(x + 3, y + 3, 34, 34);
      ctx.strokeStyle = '#4a3016';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, 34, 34);
      ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + 37, y + 37); ctx.moveTo(x + 37, y + 3); ctx.lineTo(x + 3, y + 37); ctx.stroke();
    }
    // Bushes: leafy hiding spots with a soft green halo.
    for (const b of def.bushes) {
      const cx = (b.x + 0.5) * TILE, cy = (b.y + 0.5) * TILE;
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 30);
      g.addColorStop(0, 'rgba(60, 180, 110, 0.30)');
      g.addColorStop(1, 'rgba(60, 180, 110, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e6b3a';
      for (const [ox, oy, r] of [[-8, 4, 11], [6, -6, 12], [8, 7, 10], [-4, -9, 9]]) {
        ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#2fae5e';
      for (const [ox, oy, r] of [[-5, 1, 6], [7, -3, 6], [2, 8, 5]]) {
        ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function draw(state, t) {
    const { world, player, guards, coins } = state;
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    drawWorld(world, t);
    // Vision cones under the actors.
    for (const g of guards) drawCone(g, t);
    for (const l of world.lanterns) drawLantern(l, t);
    for (const c of world.charms) drawCharm(c, t);
    drawExit(world.exit, t, player);
    for (const g of guards) drawGuard(g, t);
    drawPlayer(player, t);
    // Thrown coin in flight.
    const cp = player.coinPos();
    if (cp) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(cp.x, cp.y, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath(); ctx.arc(cp.x, cp.y - cp.height, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a8842a';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cp.x, cp.y - cp.height, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // Landed coin ping.
    for (const ping of coins) {
      const age = (t - ping.t) / 1.2;
      if (age > 1) continue;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 215, 106, ${0.8 * (1 - age)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ping.x, ping.y, 8 + age * 46, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath(); ctx.arc(ping.x, ping.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Fireflies and embers drifting over everything.
    for (const e of embers) {
      const x = (e.x + Math.sin(t * 0.4 + e.ph) * 12 + t * e.s * 0.2) % WORLD_W;
      const y = (e.y + Math.cos(t * 0.3 + e.ph) * 10) % WORLD_H;
      const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 1.5 + e.ph));
      ctx.fillStyle = e.gold ? `rgba(255, 210, 110, ${a})` : `rgba(140, 230, 160, ${a * 0.8})`;
      ctx.beginPath(); ctx.arc(x < 0 ? x + WORLD_W : x, y < 0 ? y + WORLD_H : y, e.r, 0, Math.PI * 2); ctx.fill();
    }
    // Darkness vignette: the night presses in at the edges.
    const vg = ctx.createRadialGradient(WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.42, WORLD_W / 2, WORLD_H / 2, WORLD_H * 0.95);
    vg.addColorStop(0, 'rgba(6, 8, 24, 0)');
    vg.addColorStop(1, 'rgba(6, 8, 24, 0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  }

  return { draw };
}
