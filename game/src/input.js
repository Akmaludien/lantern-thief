// Keyboard and mouse input for The Lantern Thief.
// Tracks held keys, one-frame key presses, and mouse clicks on the canvas.

export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  const clicks = [];

  function keyName(event) {
    if (event.key === ' ') return 'Space';
    if (event.key.length === 1) return event.key.toLowerCase();
    return event.key;
  }

  function onKeyDown(event) {
    const name = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(name);
    held.add(name);
  }

  function onKeyUp(event) {
    held.delete(keyName(event));
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    clicks.push({
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    });
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    // True while the named key is held down.
    isDown(name) {
      return held.has(name);
    },
    // True only on the frame the key went down.
    wasPressed(name) {
      return pressed.has(name);
    },
    // Movement vector from WASD / arrow keys, normalised.
    moveVector() {
      let x = 0;
      let y = 0;
      if (held.has('a') || held.has('ArrowLeft')) x -= 1;
      if (held.has('d') || held.has('ArrowRight')) x += 1;
      if (held.has('w') || held.has('ArrowUp')) y -= 1;
      if (held.has('s') || held.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.hypot(x, y);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    // Mouse clicks since the last frame, in canvas coordinates.
    takeClicks() {
      const out = clicks.splice(0, clicks.length);
      return out;
    },
    // Call at the end of each frame to clear one-frame presses.
    endFrame() {
      pressed.clear();
    },
  };
}
