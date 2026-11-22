// LANTERNTHIEF — bootstrap + game loop + state machine.
// States: title -> intro -> playing -> (caught | levelclear) -> intro ... -> win.
// A ?scene=cover|alarm|level3|win hook stages exact states for screenshots.

import { LEVELS, buildWorld, WORLD_W, WORLD_H } from './levels.js';
import { Guard } from './guard.js';
import { Player } from './player.js';
import { createRenderer } from './render.js';
import { createUI } from './ui.js';
import { input } from './input.js';
import { audio } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = WORLD_W;
canvas.height = WORLD_H;
const renderer = createRenderer(canvas);
const ui = createUI();
input.init(canvas);

const game = {
  state: 'title', // title | intro | playing | caught | win
  levelIndex: 0,
  world: null,
  player: null,
  guards: [],
  coins: [], // landed coin pings {x, y, t}
  levelTime: 0,
  totalTime: 0,
  detection: 0,
  levelName: '',
  time: 0, // global render clock
  frozen: false, // staged ?scene= states: render but never simulate, so the shot stays exact
};

function startLevel(index) {
  const def = LEVELS[index];
  game.levelIndex = index;
  game.world = buildWorld(def);
  game.player = new Player(game.world.playerStart.x, game.world.playerStart.y);
  game.guards = game.world.guardDefs.map((d) => new Guard(d));
  game.coins = [];
  game.levelTime = 0;
  game.detection = 0;
  game.levelName = def.name;
  game.state = 'intro';
  ui.showIntro(def);
}

function beginPlay() {
  game.state = 'playing';
  ui.hideScreens();
  audio.ensure();
  audio.startAmbientDrone(); // quiet festival-night bed under the whole level
}

function caught() {
  game.state = 'caught';
  audio.caught();
  ui.showCaught(game.levelName);
}

function levelClear() {
  audio.levelClear();
  if (game.levelIndex + 1 >= LEVELS.length) {
    game.state = 'win';
    audio.win();
    ui.showWin(game.totalTime + game.levelTime, true);
  } else {
    game.totalTime += game.levelTime;
    startLevel(game.levelIndex + 1);
  }
}

function handleEvents(events) {
  for (const ev of events) {
    if (typeof ev === 'string') {
      if (ev === 'step') audio.step(false);
      else if (ev === 'step-run') audio.step(true);
      else if (ev === 'coin-throw') audio.coin();
      else if (ev === 'douse') audio.douse();
      else if (ev === 'suspicious') audio.suspicious();
      else if (ev === 'alert') audio.alert();
      else if (ev === 'caught') { caught(); return; }
      continue;
    }
    if (ev.type === 'noise') {
      for (const g of game.guards) g.hearNoise(ev.x, ev.y, ev.radius);
    } else if (ev.type === 'guard-step') {
      // Stereo footstep: pan by the guard's horizontal offset from the thief,
      // volume by distance — footsteps that tell you where a guard is.
      const dx = ev.guard.x - game.player.x;
      const dist = Math.hypot(dx, ev.guard.y - game.player.y);
      audio.guardFootstep(dist, Math.max(-1, Math.min(1, dx / 500)));
    } else if (ev.type === 'coin-land') {
      audio.coinLand();
      game.coins.push({ x: ev.x, y: ev.y, t: game.time });
      for (const g of game.guards) g.hearNoise(ev.x, ev.y, 240);
    }
  }
}

function update(dt) {
  if (game.state !== 'playing') return;
  game.levelTime += dt;
  const events = [];
  game.player.update(dt, game.world, input, events);
  for (const g of game.guards) g.update(dt, game.world, game.player, events);
  handleEvents(events);

  // Global detection meter = the most suspicious guard.
  game.detection = game.guards.reduce((m, g) => Math.max(m, g.suspicion), 0);
  if (game.detection >= 1) { caught(); return; }

  // Charm pickup.
  for (const c of game.world.charms) {
    if (c.taken) continue;
    if (Math.hypot(c.x - game.player.x, c.y - game.player.y) < 26) {
      c.taken = true;
      game.player.charms++;
      audio.pickup();
      if (game.player.charms >= 3) game.world.exit.open = true;
    }
  }
  // Shrine exit, open once all 3 charms are stolen.
  if (game.world.exit.open &&
      Math.hypot(game.world.exit.x - game.player.x, game.world.exit.y - game.player.y) < 30) {
    levelClear();
  }
  game.coins = game.coins.filter((p) => game.time - p.t < 1.3);
}

// ---- deterministic screenshot scenes (?scene=...) ----
function applyScene(scene) {
  if (!scene) return;
  if (scene === 'win') {
    // Win screen over a real, frozen level-3 plaza backdrop (all charms stolen).
    startLevel(LEVELS.length - 1);
    game.state = 'playing';
    game.frozen = true;
    game.player.charms = 3;
    game.world.charms.forEach((c) => { c.taken = true; });
    game.world.exit.open = true;
    game.player.x = 16 * 40 + 20; game.player.y = 5 * 40 + 20;
    game.totalTime = 487;
    game.state = 'win';
    ui.showWin(487, true);
    ui.update(game);
    return;
  }
  const levelIndex = scene === 'level3' ? 2 : 0;
  startLevel(levelIndex);
  game.state = 'playing';
  game.frozen = true; // staged shot: the simulation must not resolve before the shutter
  ui.hideScreens();
  const p = game.player;
  const w = game.world;
  if (scene === 'cover') {
    // V3 cover: thief crouched by a crate with all 3 charms, the shrine OPEN
    // and its gold EXIT BEACON rising in-frame — level, cones, cover, exit.
    // A landed coin ping glints beside the thief: a distraction just thrown.
    p.x = 25 * 40 + 20; p.y = 13 * 40 + 20; p.crouched = true;
    p.charms = 3; w.charms.forEach((c) => { c.taken = true; }); w.exit.open = true;
    game.coins.push({ x: 23 * 40 + 20, y: 11 * 40 + 20, t: game.time });
    game.guards[0].x = 21 * 40 + 20; game.guards[0].y = 11 * 40 + 20; game.guards[0].dir = Math.PI / 4;
    game.guards[1].x = 22 * 40 + 20; game.guards[1].y = 7 * 40 + 20; game.guards[1].dir = Math.PI / 2;
    game.guards[2].x = 27 * 40 + 20; game.guards[2].y = 10 * 40 + 20; game.guards[2].dir = -Math.PI / 2;
  } else if (scene === 'alarm') {
    // V3 alarm: an ELITE-speed chase past a DOUSED lantern — its teal dark
    // zone and smoke wisp sit between thief and guard, a second guard
    // suspicious behind. The thief runs for the shadow, not the light.
    p.x = 11 * 40 + 20; p.y = 12 * 40 + 20; p.dir = Math.PI;
    w.lanterns[5].doused = true; // lantern at (9,12), smoke right in-frame
    p.oil = 1; // one oil spent dousing it
    const g = game.guards[0];
    g.x = 7 * 40 + 20; g.y = 12 * 40 + 20; g.dir = 0;
    g.state = 'chase'; g.suspicion = 0.92; g.lastKnown = { x: p.x, y: p.y };
    game.guards[1].x = 22 * 40 + 20; game.guards[1].y = 4 * 40 + 20; game.guards[1].dir = Math.PI / 2;
    game.guards[1].state = 'suspicious'; game.guards[1].suspicion = 0.5;
    game.detection = 0.92;
    p.charms = 2; w.charms[0].taken = true; w.charms[1].taken = true;
    game.levelTime = 74;
  } else if (scene === 'level3') {
    // V2 plaza: 10 guards incl. 2 crimson ELITEs, one lantern DOUSED (dark
    // zone + smoke) beside the thief hidden in a bush, beacon at the top.
    p.x = 16 * 40 + 20; p.y = 11 * 40 + 20; p.hidden = true;
    p.oil = 1; // one oil spent dousing the plaza lantern
    w.lanterns[3].doused = true; // lantern at (16,9), right above the bush
    game.guards.forEach((g, i) => {
      g.dir = [0.4, 2.2, -0.9, 1.6, 3.0, -2.4, 0.9, 1.2, -1.4, 2.6][i % 10];
      g.suspicion = i === 3 ? 0.45 : 0.05;
      if (i === 3) g.state = 'suspicious';
    });
    // An ELITE guard (index 8) sweeps the plaza toward the thief.
    game.guards[8].x = 20 * 40 + 20; game.guards[8].y = 8 * 40 + 20;
    game.guards[8].dir = Math.PI * 0.75; game.guards[8].suspicion = 0.55;
    game.guards[8].state = 'suspicious';
    game.guards[9].x = 10 * 40 + 20; game.guards[9].y = 13 * 40 + 20;
    game.guards[9].dir = -0.6;
    p.charms = 1; w.charms[0].taken = true;
    game.levelTime = 132;
  }
  ui.update(game);
}

// ---- main loop ----
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.time += dt;

  if (input.wasPressed('m')) {
    const muted = audio.toggleMute();
    document.getElementById('hud-hint').textContent = muted ? 'Muted (M to unmute)' : '';
  }

  if (game.state === 'title' && (input.wasPressed('Enter') || input.mouse.down)) {
    startLevel(0);
  } else if (game.state === 'intro' && (input.wasPressed('Enter') || input.wasPressed(' ') || input.mouse.down)) {
    beginPlay();
  } else if (game.state === 'caught' && input.wasPressed('r')) {
    startLevel(game.levelIndex);
  } else if (game.state === 'win' && (input.wasPressed('r') || input.wasPressed('Enter'))) {
    game.totalTime = 0;
    startLevel(0);
  }

  if (game.state === 'playing' && !game.frozen) update(dt);
  if (game.world) {
    renderer.draw(game, game.time);
    if (game.state === 'playing') ui.update(game);
  }
  input.endFrame();
  requestAnimationFrame(frame);
}

// ---- boot ----
// Debug / playtest handle: lets automated keyboard playtests read live state.
window.__game = game;

const scene = new URLSearchParams(location.search).get('scene');
if (scene) {
  applyScene(scene);
} else {
  ui.showTitle();
}
requestAnimationFrame(frame);
