// HUD and screens: the DOM overlay around the canvas — title, level intro,
// win and caught screens, plus the live HUD (charms, coins, detection eye, alert).

export function createUI() {
  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $('hud'), levelName: $('hud-level'), charms: $('hud-charms'), coins: $('hud-coins'), oil: $('hud-oil'),
    eyeFill: $('eye-fill'), eyeLabel: $('eye-label'), alert: $('hud-alert'), timer: $('hud-timer'),
    hint: $('hud-hint'),
    title: $('screen-title'), intro: $('screen-intro'), win: $('screen-win'), caught: $('screen-caught'),
    introName: $('intro-name'), introText: $('intro-text'),
    winTime: $('win-time'), winSub: $('win-sub'), caughtText: $('caught-text'),
  };

  function showOnly(screen) {
    for (const s of [el.title, el.intro, el.win, el.caught]) s.classList.add('hidden');
    if (screen) screen.classList.remove('hidden');
    el.hud.classList.toggle('hidden', screen === el.title);
  }

  return {
    showTitle() { showOnly(el.title); },
    showIntro(level) {
      el.introName.textContent = level.name;
      el.introText.textContent = level.intro;
      showOnly(el.intro);
    },
    showWin(totalSeconds, isFinal) {
      const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
      el.winTime.textContent = `${mm}:${ss}`;
      el.winSub.textContent = isFinal
        ? 'All three shrines robbed. The festival never saw you.'
        : 'Level clear — the next shrine awaits.';
      showOnly(el.win);
    },
    showCaught(levelName) {
      el.caughtText.textContent = `Spotted in ${levelName}. The lanterns betrayed you.`;
      showOnly(el.caught);
    },
    hideScreens() { showOnly(null); },

    update(state) {
      const { player, guards, levelIndex, levelTime, detection } = state;
      el.levelName.textContent = state.levelName;
      el.charms.textContent = `◆ ${player.charms}/3`;
      el.coins.textContent = `◉ ${player.coins}`;
      el.oil.textContent = `🕯 ${player.oil}`;
      el.eyeFill.style.width = `${Math.round(detection * 100)}%`;
      el.eyeFill.style.background = detection > 0.7 ? '#ff4030' : detection > 0.32 ? '#ffb020' : '#ffd76a';
      el.eyeLabel.textContent = player.hidden ? 'HIDDEN' : detection > 0.7 ? 'SEEN!' : detection > 0.32 ? 'SUSPICIOUS' : 'UNSEEN';
      const worst = guards.reduce((w, g) => (g.suspicion > w.suspicion ? g : w), guards[0]);
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
