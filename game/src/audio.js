// Synthesised sound for The Lantern Thief.
// Every sound is built with WebAudio oscillators and noise — no audio files.
// The context is created lazily and resumed on the first user gesture, so a
// page that has not been interacted with yet never throws.

export function createAudio() {
  let context = null;
  let master = null;
  let ambientNodes = null;

  function ensureContext() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0.5;
      master.connect(context.destination);
    } catch (err) {
      context = null;
    }
    return context;
  }

  // Call from any user gesture so later sounds are allowed to play.
  function unlock() {
    const ctx = ensureContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    startAmbient();
  }

  function noiseBuffer(seconds) {
    const ctx = ensureContext();
    if (!ctx) return null;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function playNoise({ duration, frequency, gainValue, type }) {
    const ctx = ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(duration);
    const filter = ctx.createBiquadFilter();
    filter.type = type || 'lowpass';
    filter.frequency.value = frequency;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(now);
    source.stop(now + duration);
  }

  function playTone({ frequency, endFrequency, duration, gainValue, type, delay }) {
    const ctx = ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const startAt = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) {
      osc.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
    }
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
  }

  function startAmbient() {
    const ctx = ensureContext();
    if (!ctx || ambientNodes || ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const gain = ctx.createGain();
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    lfo.start();
    ambientNodes = { osc, lfo, gain };
  }

  return {
    unlock,
    // Soft thud; quieter and lower when sneaking.
    footstep(sneaking) {
      playNoise({
        duration: 0.09,
        frequency: sneaking ? 320 : 620,
        gainValue: sneaking ? 0.05 : 0.14,
      });
    },
    // Rising two-note warning when a guard raises the alarm.
    alarm() {
      playTone({ frequency: 392, duration: 0.22, gainValue: 0.22, type: 'square' });
      playTone({ frequency: 523, duration: 0.3, gainValue: 0.22, type: 'square', delay: 0.2 });
    },
    // Bright chime when a relic is picked up.
    pickup() {
      playTone({ frequency: 880, duration: 0.18, gainValue: 0.2, type: 'triangle' });
      playTone({ frequency: 1318, duration: 0.28, gainValue: 0.18, type: 'triangle', delay: 0.09 });
    },
    // Short click for the lantern and menu buttons.
    click() {
      playTone({ frequency: 660, endFrequency: 440, duration: 0.07, gainValue: 0.12, type: 'sine' });
    },
    // Low sting when the player is caught.
    caught() {
      playTone({ frequency: 220, endFrequency: 55, duration: 0.7, gainValue: 0.25, type: 'sawtooth' });
    },
    // Gentle major arpeggio on victory.
    victory() {
      [523, 659, 784, 1046].forEach((frequency, index) => {
        playTone({ frequency, duration: 0.4, gainValue: 0.16, type: 'triangle', delay: index * 0.13 });
      });
    },
    // Quiet wooden creak when the exit unlocks.
    unlockDoor() {
      playNoise({ duration: 0.25, frequency: 240, gainValue: 0.1, type: 'bandpass' });
    },
  };
}
