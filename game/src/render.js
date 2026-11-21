// Canvas rendering for The Lantern Thief.
// Everything is drawn with canvas shapes — no image files. The scene is
// drawn fully lit first, then a darkness layer is laid over it with holes
// punched out around the player's lantern, the guards, the relic and the
// exit, so light itself shows where it is safe to stand.

import { GUARD_VIEW_RANGE, GUARD_HALF_ANGLE } from './guards.js';
import { TILE, WORLD_WIDTH, WORLD_HEIGHT } from './levels.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const darkLayer = document.createElement('canvas');
  darkLayer.width = WORLD_WIDTH;
  darkLayer.height = WORLD_HEIGHT;
  const darkCtx = darkLayer.getContext('2d');

  function drawFloor() {
    ctx.fillStyle = '#17152b';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    for (let ty = 0; ty < WORLD_HEIGHT / TILE; ty++) {
      for (let tx = 0; tx < WORLD_WIDTH / TILE; tx++) {
        if ((tx + ty) % 2 === 0) {
          ctx.fillStyle = '#1a1830';
          ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
        }
      }
    }
    ctx.strokeStyle = 'rgba(70, 60, 120, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= WORLD_WIDTH; x += TILE) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += TILE) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(WORLD_WIDTH, y + 0.5);
    }
    ctx.stroke();
  }

  function drawWalls(walls) {
    for (const wall of walls) {
      ctx.fillStyle = '#2e2a4a';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = '#453f6e';
      ctx.fillRect(wall.x, wall.y, wall.w, 5);
      ctx.strokeStyle = '#17152b';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x + 1, wall.y + 1, wall.w - 2, wall.h - 2);
    }
  }

  function drawCover(piece) {
    if (piece.kind === 'shelf') {
      ctx.fillStyle = '#4a2f1d';
      ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
      ctx.fillStyle = '#5d3d24';
      ctx.fillRect(piece.x, piece.y, piece.w, 6);
      const bookColors = ['#7a4a3a', '#4a6a7a', '#6a7a4a', '#7a6a3a', '#5a4a7a'];
      let bx = piece.x + 6;
      while (bx < piece.x + piece.w - 10) {
        const bw = 8 + ((bx * 7) % 7);
        ctx.fillStyle = bookColors[Math.floor(bx / 13) % bookColors.length];
        ctx.fillRect(bx, piece.y + 8, bw, piece.h - 14);
        bx += bw + 2;
      }
    } else if (piece.kind === 'chest') {
      ctx.fillStyle = '#5a3d22';
      ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
      ctx.fillStyle = '#7a5a30';
      ctx.fillRect(piece.x, piece.y, piece.w, 10);
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(piece.x + piece.w / 2 - 5, piece.y + 6, 10, 14);
      ctx.strokeStyle = '#3a2812';
      ctx.lineWidth = 2;
      ctx.strokeRect(piece.x + 1, piece.y + 1, piece.w - 2, piece.h - 2);
    } else {
      // pillar
      ctx.fillStyle = '#3a3558';
      ctx.beginPath();
      ctx.arc(piece.x + piece.w / 2, piece.y + piece.h / 2, piece.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#565082';
      ctx.beginPath();
      ctx.arc(piece.x + piece.w / 2, piece.y + piece.h / 2, piece.w / 2 - 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawExit(exit, open) {
    ctx.fillStyle = open ? '#1f5a34' : '#3a2030';
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.strokeStyle = open ? '#4ade80' : '#8a3a4a';
    ctx.lineWidth = 4;
    ctx.strokeRect(exit.x + 2, exit.y + 2, exit.w - 4, exit.h - 4);
    ctx.fillStyle = open ? '#86efac' : '#d9a441';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (open) {
      ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2);
    } else {
      ctx.fillText('LOCKED', exit.x + exit.w / 2, exit.y + exit.h / 2 - 14);
      // Drawn padlock: shackle arc over a small body.
      const px = exit.x + exit.w / 2;
      const py = exit.y + exit.h / 2 + 14;
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px, py - 2, 7, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(px - 9, py - 2, 18, 13);
      ctx.fillStyle = '#3a2030';
      ctx.beginPath();
      ctx.arc(px, py + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRelic(relic, time) {
    const pulse = 1 + Math.sin(time * 3) * 0.15;
    const glow = ctx.createRadialGradient(relic.x, relic.y, 4, relic.x, relic.y, 60 * pulse);
    glow.addColorStop(0, 'rgba(255, 210, 110, 0.55)');
    glow.addColorStop(1, 'rgba(255, 210, 110, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(relic.x, relic.y, 60 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(relic.x, relic.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffd76a';
    const size = 13 * pulse;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawVisionCone(guard, player) {
    const range = GUARD_VIEW_RANGE * (player.lanternOn ? 1.45 : 0.78);
    const suspicious = guard.suspicion >= 55 || guard.state === 'chase';
    const chasing = guard.state === 'chase';
    // Warm yellow while calm, orange while suspicious, red while chasing:
    // the cone's colour is the guard's mood, readable at a glance.
    const rgb = chasing ? '255, 60, 40' : suspicious ? '255, 110, 50' : '255, 214, 90';
    const coreAlpha = chasing ? 0.5 : suspicious ? 0.4 : 0.3;
    const edgeAlpha = chasing ? 0.75 : suspicious ? 0.6 : 0.42;
    const gradient = ctx.createRadialGradient(guard.x, guard.y, 12, guard.x, guard.y, range);
    gradient.addColorStop(0, `rgba(${rgb}, ${coreAlpha})`);
    gradient.addColorStop(0.65, `rgba(${rgb}, ${coreAlpha * 0.55})`);
    gradient.addColorStop(1, `rgba(${rgb}, 0.04)`);
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.arc(guard.x, guard.y, range, guard.facing - GUARD_HALF_ANGLE, guard.facing + GUARD_HALF_ANGLE);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    // Crisp rim so the cone's edge reads even where the floor is dark.
    ctx.strokeStyle = `rgba(${rgb}, ${edgeAlpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawGuard(guard) {
    // Warm halo lifts the guard off the dark floor before the body is drawn.
    const halo = ctx.createRadialGradient(guard.x, guard.y, 8, guard.x, guard.y, 52);
    halo.addColorStop(0, 'rgba(245, 166, 35, 0.28)');
    halo.addColorStop(1, 'rgba(245, 166, 35, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 52, 0, Math.PI * 2);
    ctx.fill();
    // Soft shadow under the body for depth.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(guard.x, guard.y + guard.radius - 2, guard.radius + 3, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, guard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a5a10';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Bright rim on the body's lit edge.
    ctx.strokeStyle = '#ffe1a0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, guard.radius - 2, 0, Math.PI * 2);
    ctx.stroke();
    // Cap brim shows which way the guard faces.
    const bx = guard.x + Math.cos(guard.facing) * 10;
    const by = guard.y + Math.sin(guard.facing) * 10;
    ctx.fillStyle = '#e08a1a';
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe1a0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd9a0';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 6, 0, Math.PI * 2);
    ctx.fill();
    // Suspicion ticks above the head.
    if (guard.suspicion > 5) {
      const width = 34;
      const x = guard.x - width / 2;
      const y = guard.y - guard.radius - 14;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x - 1, y - 1, width + 2, 7);
      ctx.fillStyle = guard.suspicion >= 55 ? '#ff5030' : '#ffd65a';
      ctx.fillRect(x, y, width * (guard.suspicion / 100), 5);
    }
    if (guard.state === 'chase') {
      ctx.fillStyle = '#ff5030';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - guard.radius - 20);
    } else if (guard.suspicion >= 55) {
      ctx.fillStyle = '#ffd65a';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', guard.x, guard.y - guard.radius - 20);
    }
  }

  function drawPlayer(player, time) {
    if (player.lanternOn) {
      // Two-layer lantern glow: a hot core and a wide warm pool on the floor.
      const flicker = 1 + Math.sin(time * 9) * 0.1 + Math.sin(time * 23) * 0.05;
      const pool = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 200 * flicker);
      pool.addColorStop(0, 'rgba(255, 205, 115, 0.34)');
      pool.addColorStop(0.55, 'rgba(255, 190, 90, 0.16)');
      pool.addColorStop(1, 'rgba(255, 190, 90, 0)');
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 200 * flicker, 0, Math.PI * 2);
      ctx.fill();
      const core = ctx.createRadialGradient(player.x, player.y, 4, player.x, player.y, 80);
      core.addColorStop(0, 'rgba(255, 220, 140, 0.4)');
      core.addColorStop(1, 'rgba(255, 220, 140, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 80, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hooded cloak — lighter than the floor, with a warm rim on the lantern
    // side so Wick never melts into the dark.
    ctx.fillStyle = '#3a4066';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#14162a';
    ctx.lineWidth = 3;
    ctx.stroke();
    const rimAngle = Math.atan2(player.facingY, player.facingX);
    ctx.strokeStyle = player.lanternOn ? 'rgba(255, 205, 120, 0.95)' : 'rgba(160, 170, 230, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius - 1.5, rimAngle - 1.1, rimAngle + 1.1);
    ctx.stroke();
    // Face shadow and the lantern flame.
    ctx.fillStyle = '#e8d9b0';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (player.lanternOn) {
      const flicker = 1 + Math.sin(time * 9) * 0.12;
      const lx = player.x + player.facingX * 18;
      const ly = player.y + player.facingY * 18;
      const flameHalo = ctx.createRadialGradient(lx, ly, 1, lx, ly, 20);
      flameHalo.addColorStop(0, 'rgba(255, 215, 106, 0.85)');
      flameHalo.addColorStop(1, 'rgba(255, 215, 106, 0)');
      ctx.fillStyle = flameHalo;
      ctx.beginPath();
      ctx.arc(lx, ly, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath();
      ctx.arc(lx, ly, 6 * flicker, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5 * flicker, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function punchLightHole(x, y, radius) {
    const gradient = darkCtx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.85)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    darkCtx.fillStyle = gradient;
    darkCtx.beginPath();
    darkCtx.arc(x, y, radius, 0, Math.PI * 2);
    darkCtx.fill();
  }

  function drawDarkness(state) {
    const { level, player, guards, time } = state;
    darkCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    darkCtx.globalCompositeOperation = 'source-over';
    darkCtx.fillStyle = `rgba(3, 5, 16, ${level.darkness})`;
    darkCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    darkCtx.globalCompositeOperation = 'destination-out';
    punchLightHole(player.x, player.y, player.sightRadius || 200);
    for (const guard of guards) {
      punchLightHole(guard.x, guard.y, 105);
    }
    if (!state.relicTaken) {
      punchLightHole(level.relic.x, level.relic.y, 80 + Math.sin(time * 3) * 8);
    }
    punchLightHole(level.exit.x + level.exit.w / 2, level.exit.y + level.exit.h / 2, 90);
    ctx.drawImage(darkLayer, 0, 0);
  }

  // Faint dotted patrol routes: a guard's loop can be learned before it is
  // risked, which is what makes a patient route rewarding.
  function drawPatrolRoutes(guards) {
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 190, 255, 0.10)';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 10]);
    ctx.lineCap = 'round';
    for (const guard of guards) {
      const points = guard.waypoints;
      if (!points || points.length < 2) continue;
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(state) {
    const { level, player, guards, time } = state;
    drawFloor();
    drawPatrolRoutes(guards);
    drawWalls(level.walls);
    for (const piece of level.cover) drawCover(piece);
    drawExit(level.exit, state.exitOpen);
    if (!state.relicTaken) drawRelic(level.relic, time);
    for (const guard of guards) drawVisionCone(guard, player);
    for (const guard of guards) drawGuard(guard);
    drawPlayer(player, time);
    drawDarkness(state);
  }

  return { draw, ctx };
}
