// Guard patrol AI. States: patrol -> suspicious -> chase -> search -> return.
// A guard's suspicion (0..1) rises while the thief is inside its vision cone with
// line of sight, faster in lantern light, and decays otherwise. Noise and coins
// pull a guard to investigate a point. A chasing guard that touches the thief
// catches them.

import { TILE } from './levels.js';

export const CONE_RANGE = 230;
export const ELITE_CONE_RANGE = 310;
export const CONE_HALF_ANGLE = 0.61; // ~35 degrees each side
export const ELITE_CONE_HALF_ANGLE = 0.68;

export class Guard {
  constructor(def) {
    this.path = def.path;
    this.speed = def.speed;
    this.elite = !!def.elite;
    this.coneRange = this.elite ? ELITE_CONE_RANGE : CONE_RANGE;
    this.coneHalfAngle = this.elite ? ELITE_CONE_HALF_ANGLE : CONE_HALF_ANGLE;
    this.x = def.path[0].x;
    this.y = def.path[0].y;
    this.wp = 1 % def.path.length;
    this.dir = 0; // facing angle, radians
    this.state = 'patrol';
    this.suspicion = 0;
    this.pause = 0;
    this.lastKnown = { x: this.x, y: this.y };
    this.searchTime = 0;
    this.lookTime = 0;
    this.lookDir = 0;
    this.investigate = null; // {x, y} point to check out (noise / coin)
    this.alerted = false; // rose to chase at least once since last decay
  }

  get coneColor() {
    if (this.state === 'chase') return 'red';
    if (this.state === 'suspicious' || this.state === 'search') return 'orange';
    return this.elite ? 'crimson' : 'gold';
  }

  // True when the player is inside the cone and visible (line of sight, not hidden).
  sees(world, player) {
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.coneRange) return false;
    if (player.hidden && dist > 55) return false;
    let ang = Math.atan2(dy, dx) - this.dir;
    while (ang > Math.PI) ang -= Math.PI * 2;
    while (ang < -Math.PI) ang += Math.PI * 2;
    if (Math.abs(ang) > this.coneHalfAngle) return false;
    return world.hasLineOfSight(this.x, this.y, player.x, player.y);
  }

  hearNoise(x, y, radius) {
    const d = Math.hypot(x - this.x, y - this.y);
    if (d > radius + 40) return;
    if (this.state === 'chase') return;
    this.investigate = { x, y };
    if (this.state === 'patrol') { this.state = 'suspicious'; this.suspicion = Math.max(this.suspicion, 0.4); }
  }

  _moveToward(tx, ty, speed, dt, world) {
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) return true;
    const step = Math.min(d, speed * dt);
    this.dir = Math.atan2(dy, dx);
    const nx = this.x + (dx / d) * step;
    const ny = this.y + (dy / d) * step;
    const fixed = world.collide(nx, ny, 13);
    this.x = fixed.x; this.y = fixed.y;
    return d <= step + 1;
  }

  update(dt, world, player, events) {
    const seen = this.sees(world, player);
    const inLight = world.inLight(player.x, player.y);
    const prevState = this.state;

    if (seen) {
      this.lastKnown = { x: player.x, y: player.y };
      // In lantern light the eye fills fast; in shadow — or inside a doused
      // lantern's dark zone — it only creeps.
      const doused = world.inDousedZone ? world.inDousedZone(player.x, player.y) : false;
      const rate = (inLight && !doused) ? 1.25 : (player.crouched || doused ? 0.10 : 0.22);
      this.suspicion = Math.min(1, this.suspicion + rate * dt);
      if (this.state === 'patrol' || this.state === 'return') this.state = 'suspicious';
    } else {
      this.suspicion = Math.max(0, this.suspicion - 0.30 * dt);
    }

    if (this.suspicion >= 0.78) this.state = 'chase';
    else if (this.suspicion >= 0.32 && this.state !== 'chase') {
      if (this.state === 'patrol' || this.state === 'return') this.state = 'suspicious';
    } else if (this.suspicion < 0.12 && (this.state === 'suspicious' || this.state === 'search')) {
      this.state = 'return';
    }

    if (this.state === 'chase' && !seen && this.suspicion < 0.45) this.state = 'search';

    if (prevState !== 'suspicious' && this.state === 'suspicious') events.push('suspicious');
    if (prevState !== 'chase' && this.state === 'chase') { events.push('alert'); this.alerted = true; }
    if (prevState === 'chase' && this.state !== 'chase') events.push('lost');

    switch (this.state) {
      case 'patrol': {
        if (this.investigate) { this.state = 'search'; break; }
        if (this.pause > 0) {
          this.pause -= dt;
          this.dir += Math.sin(performance.now() / 900 + this.x) * 0.002;
          break;
        }
        const target = this.path[this.wp];
        if (this._moveToward(target.x, target.y, this.speed, dt, world)) {
          this.wp = (this.wp + 1) % this.path.length;
          this.pause = 0.9;
        }
        break;
      }
      case 'suspicious': {
        // Stop, stare toward the last glimpse, then creep toward it.
        if (seen) {
          this.dir = Math.atan2(player.y - this.y, player.x - this.x);
        } else if (this.investigate) {
          this._moveToward(this.investigate.x, this.investigate.y, this.speed * 0.75, dt, world);
          if (Math.hypot(this.investigate.x - this.x, this.investigate.y - this.y) < 24) this.investigate = null;
        } else {
          this._moveToward(this.lastKnown.x, this.lastKnown.y, this.speed * 0.55, dt, world);
        }
        break;
      }
      case 'chase': {
        const tx = seen ? player.x : this.lastKnown.x;
        const ty = seen ? player.y : this.lastKnown.y;
        // Elites run the thief down faster.
        this._moveToward(tx, ty, this.speed * (this.elite ? 2.25 : 1.9), dt, world);
        break;
      }
      case 'search': {
        if (this.investigate) {
          if (this._moveToward(this.investigate.x, this.investigate.y, this.speed * 0.9, dt, world)) {
            this.investigate = null;
            this.searchTime = 2.6;
            this.lookDir = this.dir;
          }
          break;
        }
        if (Math.hypot(this.lastKnown.x - this.x, this.lastKnown.y - this.y) > 20) {
          this._moveToward(this.lastKnown.x, this.lastKnown.y, this.speed * 0.9, dt, world);
          break;
        }
        this.searchTime -= dt;
        this.dir = this.lookDir + Math.sin(this.searchTime * 2.2) * 1.1;
        if (this.searchTime <= 0) this.state = 'return';
        break;
      }
      case 'return': {
        // Walk back to the nearest patrol waypoint, then resume the route.
        let best = 0, bestD = Infinity;
        this.path.forEach((p, i) => {
          const d = Math.hypot(p.x - this.x, p.y - this.y);
          if (d < bestD) { bestD = d; best = i; }
        });
        if (this._moveToward(this.path[best].x, this.path[best].y, this.speed, dt, world)) {
          this.wp = (best + 1) % this.path.length;
          this.state = 'patrol';
        }
        break;
      }
    }

    // A chasing guard that reaches the thief catches them.
    if (this.state === 'chase' && Math.hypot(player.x - this.x, player.y - this.y) < 26) {
      events.push('caught');
    }
    // Fully spotted at close range is also a catch.
    if (this.suspicion >= 1) events.push('caught');
  }
}

// Distance from a point to the nearest guard (for the HUD "nearest eye" readout).
export function nearestGuardDistance(guards, x, y) {
  let best = Infinity;
  for (const g of guards) best = Math.min(best, Math.hypot(g.x - x, g.y - y));
  return best;
}

export { TILE };
