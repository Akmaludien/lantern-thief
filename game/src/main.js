// Game loop and state machine for The Lantern Thief.
// States: title, play, paused, caught, victory. The loop loads one floor at
// a time, counts alarms and time, and restarts the floor when Wick is
// caught. The ?shot= parameter freezes the game in a staged scene so
// screenshots of the same moment can be taken again and again.

import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { LEVELS, solidRects } from './levels.js';
import { createGuard, updateGuard, alertGuardsToNoise } from './guards.js';
import { createPlayer, updatePlayer } from './player.js';
import { createRenderer } from './render.js';
import { createUi } from './ui.js';

const canvas = document.getElementById('game');
const input = createInput(canvas);
const audio = createAudio();
const renderer = createRenderer(canvas);
const ui = createUi(canvas);

const state = {
  screen: 'title', // title | play | paused | caught | victory
  levelIndex: 0,
  level: LEVELS[0],
  solids: [],
  player: null,
  guards: [],
  relicTaken: false,
  exitOpen: false,
  levelTime: 0,
  totalTime: 0,
  alarms: 0,
  relicsStolen: 0,
  time: 0,
  frozen: false,
};

function loadLevel(index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.level = level;
  state.solids = solidRects(level);
  state.player = createPlayer(level.spawn);
  state.guards = level.guards.map((definition, i) => createGuard(definition, i));
  state.relicTaken = false;
  state.exitOpen = false;
  state.levelTime = 0;
  state.screen = 'play';
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function startHeist() {
  state.totalTime = 0;
  state.alarms = 0;
  state.relicsStolen = 0;
  loadLevel(0);
  audio.unlock();
  audio.click();
}

function onAlarm() {
  state.alarms += 1;
  audio.alarm();
}

function onCaught() {
  if (state.screen !== 'play') return;
  state.screen = 'caught';
  audio.caught();
}

function updatePlaying(seconds) {
  const { player, level } = state;
  state.levelTime += seconds;
  state.totalTime += seconds;

  updatePlayer(player, seconds, input, audio, state.solids, (x, y, radius) => {
    alertGuardsToNoise(state.guards, x, y, radius);
  });

  const world = {
    player,
    solids: state.solids,
    onAlarm,
    onCaught,
  };
  for (const guard of state.guards) {
    updateGuard(guard, seconds, world);
    if (state.screen !== 'play') return;
  }

  // Pick up the relic.
  if (!state.relicTaken) {
    const distance = Math.hypot(player.x - level.relic.x, player.y - level.relic.y);
    if (distance < 42) {
      state.relicTaken = true;
      state.relicsStolen += 1;
      state.exitOpen = true;
      audio.pickup();
      audio.unlockDoor();
    }
  }

  // Reach the open exit to clear the floor.
  if (state.exitOpen && pointInRect(player.x, player.y, level.exit)) {
    if (state.levelIndex + 1 < LEVELS.length) {
      loadLevel(state.levelIndex + 1);
    } else {
      state.screen = 'victory';
      audio.victory();
    }
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const seconds = Math.min(0.05, (now - (frame.last || now)) / 1000);
  frame.last = now;
  state.time += seconds;

  const clicks = input.takeClicks();
  for (const click of clicks) audio.unlock();

  if (!state.frozen) {
    if (state.screen === 'play') {
      if (input.wasPressed('p') || input.wasPressed('Escape')) {
        state.screen = 'paused';
      } else {
        updatePlaying(seconds);
      }
    } else if (state.screen === 'paused') {
      if (input.wasPressed('p') || input.wasPressed('Escape')) {
        state.screen = 'play';
      }
    } else if (state.screen === 'title') {
      if (input.wasPressed('Enter')) startHeist();
    } else if (state.screen === 'caught') {
      if (input.wasPressed('r')) loadLevel(state.levelIndex);
    } else if (state.screen === 'victory') {
      if (input.wasPressed('Enter')) startHeist();
    }
  }

  // Draw the world behind every screen so menus sit over the archive.
  if (state.player) renderer.draw(state);

  if (state.screen === 'play') {
    const pauseClicked = ui.drawHud(state, clicks);
    if (pauseClicked) state.screen = 'paused';
  } else if (state.screen === 'title') {
    const actions = ui.drawTitle(state, clicks);
    if (actions.start) startHeist();
  } else if (state.screen === 'caught') {
    const actions = ui.drawCaught(state, clicks);
    if (actions.retry) loadLevel(state.levelIndex);
    if (actions.menu) state.screen = 'title';
  } else if (state.screen === 'victory') {
    const actions = ui.drawVictory(state, clicks);
    if (actions.again) startHeist();
  } else if (state.screen === 'paused') {
    const actions = ui.drawPaused(state, clicks);
    if (actions.resume) state.screen = 'play';
    if (actions.restart) loadLevel(state.levelIndex);
    if (actions.menu) state.screen = 'title';
  }

  input.endFrame();
}

// --- staged scenes for deterministic screenshots (?shot=...) ---------------

function stageShot(kind) {
  state.frozen = true;
  if (kind === 'cover') {
    loadLevel(1);
    state.player.x = 620;
    state.player.y = 250;
    state.player.lanternOn = true;
    state.player.facingX = 0;
    state.player.facingY = 1;
    const guard = state.guards[0];
    guard.x = 620;
    guard.y = 430;
    guard.facing = -Math.PI / 2;
    guard.suspicion = 30;
    const second = state.guards[1];
    second.x = 980;
    second.y = 620;
    second.facing = Math.PI;
    state.screen = 'play';
  } else if (kind === 'detect') {
    loadLevel(1);
    state.player.x = 700;
    state.player.y = 420;
    state.player.lanternOn = true;
    const guard = state.guards[2];
    guard.x = 700;
    guard.y = 290;
    guard.facing = Math.PI / 2;
    guard.suspicion = 88;
    guard.state = 'chase';
    state.guards[0].x = 300;
    state.guards[0].y = 200;
    state.guards[0].facing = 0;
    state.screen = 'play';
  } else if (kind === 'vault') {
    loadLevel(2);
    state.player.x = 560;
    state.player.y = 470;
    state.player.lanternOn = true;
    state.player.facingX = 0;
    state.player.facingY = -1;
    const guard = state.guards[2];
    guard.x = 640;
    guard.y = 320;
    guard.facing = Math.PI / 2;
    guard.suspicion = 20;
    state.screen = 'play';
  } else if (kind === 'win') {
    loadLevel(2);
    state.relicTaken = true;
    state.exitOpen = true;
    state.relicsStolen = 3;
    state.totalTime = 347;
    state.alarms = 2;
    state.player.x = 1120;
    state.player.y = 400;
    state.screen = 'victory';
  }
}

function boot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    stageShot(shot);
  } else {
    loadLevel(0);
    state.screen = 'title';
  }
  window.__lanternThief = state;
  requestAnimationFrame(frame);
}

boot();
