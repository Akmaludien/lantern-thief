// HUD, menus and end screens for The Lantern Thief.
// All interface is drawn on the canvas itself: title, pause, caught and
// victory screens, plus the in-game HUD (relics, suspicion, level, timer).

export function createUi(canvas) {
  const ctx = canvas.getContext('2d');

  function button(label, x, y, w, h, clicks) {
    const hovered = clicks.some((c) => c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h);
    ctx.fillStyle = hovered ? '#3a2a12' : '#241c0e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + 1);
    const clicked = clicks.some((c) => c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h);
    return clicked;
  }

  function dimBackground(alpha) {
    ctx.fillStyle = `rgba(5, 6, 18, ${alpha})`;
    ctx.fillRect(0, 0, 1280, 800);
  }

  function centredTitle(text, y, size, color) {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 640, y);
  }

  function centredLine(text, y, size, color) {
    ctx.fillStyle = color;
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 640, y);
  }

  function drawHud(state, clicks) {
    const { level, relicTaken, guards, levelTime } = state;
    // Top bar.
    ctx.fillStyle = 'rgba(5, 6, 18, 0.72)';
    ctx.fillRect(0, 0, 1280, 52);
    ctx.fillStyle = '#e8e4ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${level.id}. ${level.name}`, 20, 27);
    // Relic indicator.
    ctx.fillStyle = relicTaken ? '#ffd76a' : '#6a6486';
    ctx.save();
    ctx.translate(330, 26);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
    ctx.fillStyle = '#e8e4ff';
    ctx.font = '16px sans-serif';
    ctx.fillText(relicTaken ? level.relicName : `Find the ${level.relicName}`, 348, 27);
    // Suspicion meter: the highest across all guards.
    const suspicion = Math.max(0, ...guards.map((g) => g.suspicion));
    ctx.fillStyle = '#2a2745';
    ctx.fillRect(640, 17, 220, 18);
    ctx.fillStyle = suspicion >= 100 ? '#ff5030' : suspicion >= 55 ? '#ff9a3a' : '#ffd65a';
    ctx.fillRect(642, 19, 216 * (suspicion / 100), 14);
    ctx.strokeStyle = '#8a86b0';
    ctx.lineWidth = 1;
    ctx.strokeRect(640, 17, 220, 18);
    ctx.fillStyle = '#e8e4ff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(suspicion >= 100 ? 'ALARM!' : 'Suspicion', 868, 27);
    // Timer and lantern state, kept clear of the pause button at x 1216.
    const minutes = Math.floor(levelTime / 60);
    const seconds = Math.floor(levelTime % 60);
    ctx.textAlign = 'right';
    ctx.fillText(`${minutes}:${String(seconds).padStart(2, '0')}`, 1000, 27);
    ctx.fillStyle = state.player.lanternOn ? '#ffd76a' : '#6a6486';
    ctx.fillText(state.player.lanternOn ? 'Lantern: ON  [F]' : 'Lantern: OFF  [F]', 1200, 27);
    ctx.textAlign = 'left';
    // Exit hint once the relic is taken.
    if (relicTaken) {
      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Relic stolen — reach the green EXIT!', 640, 76);
    }
    return button('II', 1216, 8, 36, 36, clicks);
  }

  function drawTitle(state, clicks) {
    dimBackground(0.82);
    centredTitle('THE LANTERN THIEF', 210, 64, '#ffd76a');
    centredLine('A stealth game in the Ember Archive', 268, 22, '#c9c3ea');
    centredLine('Steal the three relics. Reach the exit. Do not get caught.', 306, 18, '#9a94c2');
    centredLine('WASD / Arrows — move      Shift — sneak quietly', 380, 18, '#e8e4ff');
    centredLine('F — toggle lantern (lit: see far, seen far · unlit: the reverse)', 412, 18, '#e8e4ff');
    centredLine('Hide behind shelves, chests and pillars — they block a guard’s sight.', 444, 18, '#e8e4ff');
    centredLine('A full suspicion meter means a chase. Break line of sight to calm it.', 476, 18, '#e8e4ff');
    const start = button('BEGIN THE HEIST', 490, 540, 300, 56, clicks);
    return { start };
  }

  function drawCaught(state, clicks) {
    dimBackground(0.72);
    centredTitle('CAUGHT!', 300, 64, '#ff5030');
    centredLine(`A guard of the ${state.level.name} caught Wick.`, 370, 20, '#e8e4ff');
    centredLine('The level restarts — the relic is back where it was.', 404, 18, '#9a94c2');
    const retry = button('TRY AGAIN  [R]', 490, 480, 300, 56, clicks);
    const menu = button('TITLE SCREEN', 490, 556, 300, 48, clicks);
    return { retry, menu };
  }

  function drawVictory(state, clicks) {
    dimBackground(0.85);
    centredTitle('ALL THREE RELICS STOLEN', 210, 52, '#ffd76a');
    centredLine('Wick slips out of the Ember Archive into the night.', 272, 20, '#c9c3ea');
    const total = state.totalTime;
    const minutes = Math.floor(total / 60);
    const seconds = Math.floor(total % 60);
    centredLine(`Total time: ${minutes}:${String(seconds).padStart(2, '0')}`, 350, 22, '#e8e4ff');
    centredLine(`Alarms raised: ${state.alarms}`, 392, 22, '#e8e4ff');
    centredLine(`Relics stolen: ${state.relicsStolen} / 3`, 434, 22, '#e8e4ff');
    centredLine('Ember Idol  ·  Moon Pearl  ·  Gilded Key', 490, 18, '#ffd76a');
    const again = button('PLAY AGAIN', 490, 560, 300, 56, clicks);
    return { again };
  }

  function drawPaused(state, clicks) {
    dimBackground(0.6);
    centredTitle('PAUSED', 300, 56, '#e8e4ff');
    centredLine(`${state.level.name} — press P or Esc to keep sneaking.`, 372, 18, '#9a94c2');
    const resume = button('RESUME  [P]', 490, 440, 300, 56, clicks);
    const restart = button('RESTART LEVEL', 490, 512, 300, 48, clicks);
    const menu = button('TITLE SCREEN', 490, 576, 300, 48, clicks);
    return { resume, restart, menu };
  }

  return { button, drawHud, drawTitle, drawCaught, drawVictory, drawPaused };
}
