// HUD and screens: the DOM overlay around the canvas — title, level intro,
// win and caught screens, plus the live HUD (charms, coins, detection eye, alert).

export function createUI() {
  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $('hud'), levelName: $('hud-level'), charms: $('hud-charms'), objective: $('hud-objective'), coins: $('hud-coins'), oil: $('hud-oil'),
    eyeFill: $('eye-fill'), eyeLabel: $('eye-label'), alert: $('hud-alert'), timer: $('hud-timer'),
    hint: $('hud-hint'),
    title: $('screen-title'), intro: $('screen-intro'), win: $('screen-win'), caught: $('screen-caught'),
    introName: $('intro-name'), introText: $('intro-text'),
    winJob: $('win-job'), winRouteSub: $('win-route-sub'), winDone: $('win-done'),
    winStamp: $('win-stamp'), winSub: $('win-sub'), winStats: $('win-stats'),
    winMedals: $('win-medals'), routeMap: $('route-map'),
    caughtText: $('caught-text'),
    alarmBanner: $('alarm-banner'), alarmText: $('alarm-text'),
    fieldNotes: $('field-notes'),
  };
  let notesVisible = false;

  function showOnly(screen) {
    for (const s of [el.title, el.intro, el.win, el.caught]) s.classList.add('hidden');
    if (screen) screen.classList.remove('hidden');
    el.hud.classList.toggle('hidden', screen === el.title);
    el.alarmBanner.classList.add('hidden');
    if (screen) el.fieldNotes.classList.add('hidden');
    else el.fieldNotes.classList.toggle('hidden', !notesVisible);
  }

  // Draw the thief's recorded route as a dashed line over a mini-map of the
  // level: walls, the shrine, and where the wardens stood at the end.
  function drawRouteMap(canvas, stats, world, guards) {
    if (!canvas || !world) return;
    const c = canvas.getContext('2d');
    const sx = canvas.width / 1280, sy = canvas.height / 720;
    c.fillStyle = '#12142e';
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#4a5094';
    for (const w of world.def.walls) c.fillRect(w.x * 40 * sx, w.y * 40 * sy, w.w * 40 * sx, w.h * 40 * sy);
    c.fillStyle = '#6b4a26';
    for (const cr of world.def.crates) c.fillRect(cr.x * 40 * sx, cr.y * 40 * sy, 40 * sx, 40 * sy);
    c.fillStyle = '#2a8a4e';
    for (const b of world.def.bushes) {
      c.beginPath(); c.arc((b.x + 0.5) * 40 * sx, (b.y + 0.5) * 40 * sy, 12, 0, Math.PI * 2); c.fill();
    }
    // The route, dashed teal.
    const route = stats && stats.route ? stats.route : [];
    if (route.length > 1) {
      c.strokeStyle = '#5fe8c0';
      c.lineWidth = 2.5;
      c.setLineDash([7, 5]);
      c.beginPath();
      c.moveTo(route[0].x * sx, route[0].y * sy);
      for (let i = 1; i < route.length; i++) c.lineTo(route[i].x * sx, route[i].y * sy);
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = '#5fe8c0';
      c.beginPath(); c.arc(route[0].x * sx, route[0].y * sy, 5, 0, Math.PI * 2); c.fill();
    }
    // The shrine, gold.
    c.fillStyle = '#ffd76a';
    c.beginPath(); c.arc(world.exit.x * sx, world.exit.y * sy, 7, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#ffd76a';
    c.beginPath(); c.arc(world.exit.x * sx, world.exit.y * sy, 11, 0, Math.PI * 2); c.stroke();
    // Where the wardens stood at the end, amber diamonds.
    c.fillStyle = '#ffb020';
    for (const g of guards || []) {
      const gx = g.x * sx, gy = g.y * sy;
      c.beginPath();
      c.moveTo(gx, gy - 5); c.lineTo(gx + 5, gy); c.lineTo(gx, gy + 5); c.lineTo(gx - 5, gy);
      c.closePath(); c.fill();
    }
  }

  return {
    showTitle() { showOnly(el.title); },
    showIntro(level) {
      el.introName.textContent = level.name;
      el.introText.textContent = level.intro;
      showOnly(el.intro);
    },
    showWin(totalSeconds, isFinal, stats, world, guards, levelName) {
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
      const s = stats || { spotted: 0, closeCalls: 0, coinsThrown: 0, oilUsed: 0, charms: 3 };
      // Rank stamp: never spotted is a GHOST; spotted once, a SHADOW; more, SEEN.
      const rank = s.spotted === 0 ? 'GHOST' : s.spotted <= 1 ? 'SHADOW' : 'SEEN';
      el.winStamp.textContent = rank;
      el.winStamp.className = rank === 'GHOST' ? '' : rank === 'SHADOW' ? 'amber' : 'red';
      el.winDone.textContent = isFinal ? 'ALL JOBS DONE' : `${(levelName || 'JOB').toUpperCase()} DONE`;
      el.winJob.textContent = `THE ROUTE YOU TOOK THROUGH ${((levelName || 'the festival').replace(/^JOB \d+ — /, '')).toUpperCase()}`;
      el.winRouteSub.textContent = 'Every step of the way, drawn.';
      el.winSub.textContent = rank === 'GHOST'
        ? 'Nobody will ever know you were there.'
        : rank === 'SHADOW'
          ? 'One warden saw a shadow — and lost it.'
          : 'They saw you — but you still slipped away.';
      const statRow = (label, value) => `<div class="row"><span>${label}</span><b>${value}</b></div>`;
      el.winStats.innerHTML =
        statRow('Time', `${mm}:${ss}`) +
        statRow('Times spotted', s.spotted) +
        statRow('Close calls', s.closeCalls) +
        statRow('Coins thrown', s.coinsThrown) +
        statRow('Oil used', s.oilUsed) +
        statRow('Charms', `${s.charms}/3`);
      const medal = (earned, label) => `<div class="medal${earned ? '' : ' off'}"><span class="dot">${earned ? '✓' : '·'}</span>${label}</div>`;
      el.winMedals.innerHTML =
        medal(s.spotted === 0, 'Never spotted') +
        medal(s.charms >= 3, 'Every charm') +
        medal(totalSeconds < 480, 'Under 8 min');
      drawRouteMap(el.routeMap, s, world, guards);
      showOnly(el.win);
    },
    showCaught(levelName) {
      el.caughtText.textContent = `Spotted in ${levelName}. The lanterns betrayed you.`;
      showOnly(el.caught);
    },
    hideScreens() { showOnly(null); },
    // FIELD NOTES legend: H toggles it; staged screenshots show it.
    toggleFieldNotes() {
      notesVisible = !notesVisible;
      el.fieldNotes.classList.toggle('hidden', !notesVisible);
    },
    showFieldNotes(show) {
      notesVisible = !!show;
      el.fieldNotes.classList.toggle('hidden', !notesVisible);
    },

    update(state) {
      const { player, guards, levelIndex, levelTime, detection } = state;
      el.levelName.textContent = state.levelName;
      el.charms.textContent = `◆ ${player.charms}/3`;
      // Objective flow, always visible: steal 3 charms, then the shrine opens.
      el.objective.textContent = state.world.exit.open
        ? '⬆ SHRINE OPEN — run to the EXIT!'
        : `Steal ◆ ${player.charms}/3 → then reach the Shrine`;
      el.objective.style.color = state.world.exit.open ? '#7ee787' : '#ffd76a';
      el.coins.textContent = `◉ ${player.coins}`;
      el.oil.textContent = `🕯 ${player.oil}`;
      el.eyeFill.style.width = `${Math.round(detection * 100)}%`;
      el.eyeFill.style.background = detection > 0.7 ? '#ff4030' : detection > 0.32 ? '#ffb020' : '#ffd76a';
      // VISIBILITY meter: SHADOW (unseen) / HIDDEN (in a bush) / SEEN (spotted).
      el.eyeLabel.textContent = detection > 0.7 ? 'SEEN' : player.hidden ? 'HIDDEN' : detection > 0.32 ? 'SUSPICIOUS' : 'SHADOW';
      const worst = guards.reduce((w, g) => (g.suspicion > w.suspicion ? g : w), guards[0]);
      // Big alarm banner naming the warden who spotted you.
      const chaser = guards.find((g) => g.state === 'chase');
      if (chaser) {
        el.alarmBanner.classList.remove('hidden');
        el.alarmText.textContent = `SPOTTED BY WARDEN ${chaser.name.toUpperCase()}`;
      } else {
        el.alarmBanner.classList.add('hidden');
      }
      el.alert.textContent = worst
        ? (worst.state === 'chase' ? '⚠ CHASE' : worst.state === 'suspicious' ? '? SUSPICIOUS' : worst.state === 'search' ? '? SEARCHING' : '— CALM')
        : '— CALM';
      el.alert.style.color = worst && worst.state === 'chase' ? '#ff5040' : worst && worst.state !== 'patrol' && worst.state !== 'return' ? '#ffb020' : '#9fb3ff';
      const mm = String(Math.floor(levelTime / 60)).padStart(2, '0');
      const ss = String(Math.floor(levelTime % 60)).padStart(2, '0');
      el.timer.textContent = `${mm}:${ss}`;
      el.hint.textContent = player.hidden
        ? 'Hidden in the bush — guards cannot see you'
        : player.crouched ? 'Crouched — slow, hard to spot' : 'WASD move · Shift sneak · F coin · Q douse lantern · E crouch · M mute';
    },
  };
}
