// The player: Wick, the lantern thief.
// Walks with WASD / arrows, sneaks slowly and quietly while Shift is held,
// and toggles the lantern with F — lit means seeing far and being seen far,
// unlit means seeing little and being hard to spot.

import { slideMove } from './guards.js';

export const PLAYER_WALK_SPEED = 175;
export const PLAYER_SNEAK_SPEED = 88;
export const PLAYER_RADIUS = 14;

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: PLAYER_RADIUS,
    lanternOn: true,
    sneaking: false,
    moving: false,
    stepTimer: 0,
    noiseRadius: 0,
    facingX: 1,
    facingY: 0,
  };
}

export function updatePlayer(player, seconds, input, audio, solids, onNoise) {
  const move = input.moveVector();
  player.sneaking = input.isDown('Shift');
  player.moving = move.x !== 0 || move.y !== 0;

  if (input.wasPressed('f')) {
    player.lanternOn = !player.lanternOn;
    audio.click();
  }

  if (player.moving) {
    player.facingX = move.x;
    player.facingY = move.y;
    const speed = player.sneaking ? PLAYER_SNEAK_SPEED : PLAYER_WALK_SPEED;
    slideMove(player, move.x * speed * seconds, move.y * speed * seconds, solids);
    // Footsteps: regular while walking, sparse and soft while sneaking.
    player.stepTimer -= seconds;
    if (player.stepTimer <= 0) {
      audio.footstep(player.sneaking);
      player.stepTimer = player.sneaking ? 0.62 : 0.38;
      player.noiseRadius = player.sneaking ? 30 : 95;
      onNoise(player.x, player.y, player.noiseRadius);
    }
  } else {
    player.noiseRadius = 0;
    player.stepTimer = 0;
  }

  // How far the player can see: a wide warm pool with the lantern lit, a
  // narrow one with it out.
  player.sightRadius = player.lanternOn ? 265 : 135;
}
