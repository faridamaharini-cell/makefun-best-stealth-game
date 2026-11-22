// LANTERNTHIEF — level definitions.
// The festival is a 32 x 18 tile grid (tile 40px, world 1280 x 720). Walls, stalls and
// crates block movement and sight; bushes hide the thief; lanterns paint pools of
// dangerous light; jade charms are the loot; the shrine is the exit.
// Coordinates are tile units. A rect is {x, y, w, h} in tiles, a point is {x, y}.

export const TILE = 40;
export const COLS = 32;
export const ROWS = 18;
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;

export const LEVELS = [
  {
    name: 'Level 1 — Festival Gate',
    intro: 'Three guards walk the gate. Steal 3 jade charms, then slip out through the shrine.',
    player: { x: 2, y: 2 },
    exit: { x: 29, y: 16 },
    charms: [{ x: 28, y: 3 }, { x: 3, y: 16 }, { x: 18, y: 16 }],
    walls: [
      { x: 8, y: 3, w: 1, h: 5 },
      { x: 8, y: 11, w: 1, h: 4 },
      { x: 16, y: 2, w: 1, h: 6 },
      { x: 23, y: 9, w: 1, h: 6 },
      { x: 14, y: 12, w: 6, h: 1 },
    ],
    stalls: [{ x: 4, y: 5 }, { x: 20, y: 4 }, { x: 12, y: 14 }, { x: 26, y: 13 }],
    crates: [{ x: 6, y: 9 }, { x: 18, y: 10 }, { x: 24, y: 6 }, { x: 10, y: 15 }],
    bushes: [{ x: 3, y: 13 }, { x: 15, y: 6 }, { x: 27, y: 9 }, { x: 6, y: 2 }],
    lanterns: [{ x: 5, y: 7 }, { x: 13, y: 3 }, { x: 21, y: 8 }, { x: 27, y: 5 }, { x: 17, y: 14 }, { x: 9, y: 12 }],
    guards: [
      { path: [[5, 8], [5, 14], [12, 14], [12, 8]], speed: 62 },
      { path: [[18, 3], [18, 9], [26, 9], [26, 3]], speed: 62 },
      { path: [[14, 16], [24, 16], [24, 12]], speed: 70 },
    ],
  },
  {
    name: 'Level 2 — Lantern Market',
    intro: 'Five guards, twice the lanterns. The stalls are your friends — the light is not.',
    player: { x: 2, y: 16 },
    exit: { x: 29, y: 2 },
    charms: [{ x: 4, y: 3 }, { x: 16, y: 9 }, { x: 28, y: 15 }],
    walls: [
      { x: 6, y: 2, w: 1, h: 5 },
      { x: 6, y: 11, w: 1, h: 5 },
      { x: 13, y: 5, w: 1, h: 8 },
      { x: 20, y: 2, w: 1, h: 5 },
      { x: 20, y: 11, w: 1, h: 5 },
      { x: 25, y: 8, w: 1, h: 6 },
      { x: 10, y: 14, w: 5, h: 1 },
      { x: 17, y: 3, w: 5, h: 1 },
    ],
    stalls: [{ x: 3, y: 8 }, { x: 9, y: 9 }, { x: 16, y: 12 }, { x: 23, y: 5 }, { x: 27, y: 11 }],
    crates: [{ x: 4, y: 12 }, { x: 11, y: 3 }, { x: 18, y: 15 }, { x: 24, y: 14 }, { x: 29, y: 8 }],
    bushes: [{ x: 2, y: 5 }, { x: 15, y: 2 }, { x: 28, y: 6 }, { x: 8, y: 15 }, { x: 22, y: 16 }],
    lanterns: [
      { x: 5, y: 9 }, { x: 10, y: 6 }, { x: 15, y: 10 }, { x: 19, y: 7 },
      { x: 24, y: 10 }, { x: 28, y: 13 }, { x: 12, y: 15 }, { x: 7, y: 14 },
    ],
    guards: [
      { path: [[4, 6], [4, 13], [10, 13], [10, 6]], speed: 68 },
      { path: [[16, 4], [16, 10], [22, 10], [22, 4]], speed: 68 },
      { path: [[26, 3], [26, 9], [29, 9], [29, 15]], speed: 76 },
      { path: [[9, 16], [16, 16], [16, 13]], speed: 72 },
      { path: [[12, 8], [18, 8], [18, 14], [12, 14]], speed: 66 },
    ],
  },
  {
    name: 'Level 3 — Emperor\'s Plaza',
    intro: 'Ten guards guard the plaza — including two crimson ELITE guards with longer sight and faster chases. Every lantern is lit. Be a shadow.',
    player: { x: 16, y: 16 },
    exit: { x: 16, y: 1 },
    charms: [{ x: 2, y: 2 }, { x: 29, y: 2 }, { x: 2, y: 16 }],
    walls: [
      { x: 5, y: 4, w: 1, h: 6 },
      { x: 5, y: 12, w: 1, h: 4 },
      { x: 11, y: 2, w: 1, h: 6 },
      { x: 11, y: 11, w: 1, h: 5 },
      { x: 20, y: 2, w: 1, h: 6 },
      { x: 20, y: 11, w: 1, h: 5 },
      { x: 26, y: 4, w: 1, h: 6 },
      { x: 26, y: 12, w: 1, h: 4 },
      { x: 14, y: 8, w: 4, h: 1 },
    ],
    stalls: [{ x: 3, y: 8 }, { x: 8, y: 14 }, { x: 14, y: 4 }, { x: 18, y: 13 }, { x: 24, y: 8 }, { x: 28, y: 13 }],
    crates: [{ x: 7, y: 2 }, { x: 16, y: 6 }, { x: 23, y: 15 }, { x: 29, y: 9 }, { x: 3, y: 13 }, { x: 13, y: 15 }],
    bushes: [{ x: 2, y: 9 }, { x: 9, y: 9 }, { x: 16, y: 11 }, { x: 22, y: 9 }, { x: 29, y: 15 }, { x: 6, y: 16 }],
    lanterns: [
      { x: 4, y: 6 }, { x: 8, y: 11 }, { x: 13, y: 6 }, { x: 16, y: 9 },
      { x: 19, y: 6 }, { x: 23, y: 11 }, { x: 27, y: 6 }, { x: 10, y: 15 },
      { x: 21, y: 14 }, { x: 16, y: 3 },
    ],
    guards: [
      { path: [[3, 4], [3, 13], [8, 13], [8, 4]], speed: 74 },
      { path: [[13, 3], [13, 9], [18, 9], [18, 3]], speed: 74 },
      { path: [[23, 4], [23, 13], [28, 13], [28, 4]], speed: 74 },
      { path: [[7, 16], [15, 16], [15, 13]], speed: 82 },
      { path: [[16, 16], [24, 16], [24, 13]], speed: 82 },
      { path: [[10, 10], [10, 15], [21, 15], [21, 10]], speed: 70 },
      { path: [[16, 5], [16, 7], [13, 7], [19, 7]], speed: 78 },
      { path: [[5, 7], [5, 14], [10, 14], [10, 7]], speed: 76 },
      // ELITE guards: crimson, longer vision, faster chase.
      { path: [[14, 4], [18, 4], [18, 12], [14, 12]], speed: 88, elite: true },
      { path: [[8, 10], [24, 10], [24, 15], [8, 15]], speed: 84, elite: true },
    ],
  },
];

// Build a playable world from a level definition: a blocking grid, lookup sets,
// pixel-space positions for lanterns / charms / exit / player / guard paths.
export function buildWorld(def) {
  const blocked = new Uint8Array(COLS * ROWS); // 1 = blocks movement and sight
  const mark = (x, y) => { if (x >= 0 && y >= 0 && x < COLS && y < ROWS) blocked[y * COLS + x] = 1; };
  for (let x = 0; x < COLS; x++) { mark(x, 0); mark(x, ROWS - 1); }
  for (let y = 0; y < ROWS; y++) { mark(0, y); mark(COLS - 1, y); }
  const rects = (list) => list.forEach((r) => {
    for (let y = r.y; y < r.y + (r.h || 1); y++) for (let x = r.x; x < r.x + (r.w || 1); x++) mark(x, y);
  });
  rects(def.walls);
  rects(def.stalls.map((s) => ({ x: s.x, y: s.y, w: 2, h: 1 })));
  rects(def.crates);

  const px = (t) => (t.x + 0.5) * TILE;
  const py = (t) => (t.y + 0.5) * TILE;
  const bushSet = new Set(def.bushes.map((b) => `${b.x},${b.y}`));
  return {
    def,
    blocked,
    isBlockedTile(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
      return blocked[ty * COLS + tx] === 1;
    },
    isBushTile(tx, ty) { return bushSet.has(`${tx},${ty}`); },
    // Circle vs blocking tiles: returns the position pushed out of solid tiles.
    collide(x, y, r) {
      for (let pass = 0; pass < 2; pass++) {
        const minTx = Math.floor((x - r) / TILE), maxTx = Math.floor((x + r) / TILE);
        const minTy = Math.floor((y - r) / TILE), maxTy = Math.floor((y + r) / TILE);
        for (let ty = minTy; ty <= maxTy; ty++) for (let tx = minTx; tx <= maxTx; tx++) {
          if (!this.isBlockedTile(tx, ty)) continue;
          const cx = Math.max(tx * TILE, Math.min(x, tx * TILE + TILE));
          const cy = Math.max(ty * TILE, Math.min(y, ty * TILE + TILE));
          let dx = x - cx, dy = y - cy;
          let d2 = dx * dx + dy * dy;
          if (d2 >= r * r) continue;
          if (d2 === 0) { x += r; continue; }
          const d = Math.sqrt(d2), push = (r - d) / d;
          x += dx * push; y += dy * push;
        }
      }
      return { x, y };
    },
    // Line of sight between two pixel points, blocked by walls/stalls/crates.
    hasLineOfSight(x0, y0, x1, y1) {
      const dx = x1 - x0, dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 8));
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (this.isBlockedTile(Math.floor((x0 + dx * t) / TILE), Math.floor((y0 + dy * t) / TILE))) return false;
      }
      return true;
    },
    lanterns: def.lanterns.map((l) => ({ x: px(l), y: py(l), r: 120, doused: false })),
    charms: def.charms.map((c) => ({ x: px(c), y: py(c), taken: false, bob: Math.random() * 6 })),
    exit: { x: px(def.exit), y: py(def.exit), open: false },
    playerStart: { x: px(def.player), y: py(def.player) },
    guardDefs: def.guards.map((g) => ({
      path: g.path.map(([tx, ty]) => ({ x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE })),
      speed: g.speed,
      elite: !!g.elite,
    })),
    inLight(x, y) {
      for (const l of this.lanterns) {
        if (l.doused) continue; // a snuffed lantern paints no light
        const dx = x - l.x, dy = y - l.y;
        if (dx * dx + dy * dy < l.r * l.r) return true;
      }
      return false;
    },
    // True when standing inside a doused lantern's radius: a dark safe zone.
    inDousedZone(x, y) {
      for (const l of this.lanterns) {
        if (!l.doused) continue;
        const dx = x - l.x, dy = y - l.y;
        if (dx * dx + dy * dy < l.r * l.r) return true;
      }
      return false;
    },
  };
}
