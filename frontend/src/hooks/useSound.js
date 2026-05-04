/**
 * useSound
 * ─────────────────────────────────────────────────────────────
 * Synthesizes all UI sounds programmatically using the Web Audio API.
 * No audio files are needed — every sound is generated from scratch
 * using oscillators and gain nodes. This means the app works fully
 * offline and has zero asset overhead.
 *
 * The AudioContext is lazy-initialized on first use, which satisfies
 * browser autoplay policies (audio can only start after a user gesture).
 *
 * Sound inventory:
 *   playNav        — soft descending tick  (navigation / back buttons)
 *   playClick      — crisp mid tick        (RippleButton, generic CTAs)
 *   playQtyUp      — bright ascending tick (+ quantity button)
 *   playQtyDown    — soft descending tick  (− quantity button)
 *   playAddToCart  — warm double-pop       (add item to cart)
 *   playRemove     — low descending thud   (remove item from cart)
 *   playSuccess    — C major arpeggio      (order confirmed)
 *   playSelect     — triangle mid-pop      (category filter pills)
 *
 * All functions are wrapped in try/catch so a browser that blocks
 * audio never breaks the UI.
 *
 * Usage:
 *   const { playAddToCart } = useSound();
 *   playAddToCart();
 */

// Singleton AudioContext — shared across all sound calls
let ctx = null;

/**
 * getCtx — returns (or creates) the shared AudioContext.
 * Resumes it if the browser suspended it due to autoplay policy.
 */
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * gain — helper that creates a GainNode with an initial value.
 * @param {AudioContext} ac
 * @param {number} value  - Initial gain (0–1)
 * @param {number} time   - AudioContext time to set the value at
 */
function gain(ac, value, time) {
  const g = ac.createGain();
  g.gain.setValueAtTime(value, time);
  return g;
}

// ── Individual sound functions ────────────────────────────────

/** Soft descending sine — navigation / back buttons */
function playNav() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.08, t);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.08);
  } catch (_) {}
}

/** Short crisp sine — generic button / RippleButton */
function playClick() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.12, t);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.07);
  } catch (_) {}
}

/** Bright ascending sine — quantity increment (+) */
function playQtyUp() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.1, t);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.09);
  } catch (_) {}
}

/** Soft descending sine — quantity decrement (−) */
function playQtyDown() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.09, t);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.09);
  } catch (_) {}
}

/**
 * Warm double-pop — add item to cart.
 * Two overlapping sine tones with a 100ms offset create a
 * satisfying "bloop bloop" feel.
 */
function playAddToCart() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // First pop: 520 → 780 Hz
    const o1 = ac.createOscillator();
    const g1 = gain(ac, 0.18, t);
    o1.type = 'sine';
    o1.frequency.setValueAtTime(520, t);
    o1.frequency.exponentialRampToValueAtTime(780, t + 0.08);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o1.connect(g1); g1.connect(ac.destination);
    o1.start(t); o1.stop(t + 0.12);

    // Second pop: 680 → 960 Hz (delayed 100ms)
    const o2 = ac.createOscillator();
    const g2 = gain(ac, 0.14, t + 0.1);
    o2.type = 'sine';
    o2.frequency.setValueAtTime(680, t + 0.1);
    o2.frequency.exponentialRampToValueAtTime(960, t + 0.18);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o2.connect(g2); g2.connect(ac.destination);
    o2.start(t + 0.1); o2.stop(t + 0.22);
  } catch (_) {}
}

/** Soft descending thud — remove item from cart */
function playRemove() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.1, t);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.14);
  } catch (_) {}
}

/**
 * Ascending C major arpeggio — order confirmed.
 * Plays C5 → E5 → G5 → C6 with 100ms spacing between notes.
 * Frequencies: 523.25, 659.25, 783.99, 1046.5 Hz
 */
function playSuccess() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const delay = i * 0.1 + (i === 3 ? 0.04 : 0); // slight extra gap before final note
      const osc = ac.createOscillator();
      const g = gain(ac, 0, t + delay);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      g.gain.linearRampToValueAtTime(0.16, t + delay + 0.02);  // fast attack
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.55); // slow decay
      osc.connect(g); g.connect(ac.destination);
      osc.start(t + delay); osc.stop(t + delay + 0.6);
    });
  } catch (_) {}
}

/** Triangle wave mid-pop — category filter / select actions */
function playSelect() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g = gain(ac, 0.1, t);
    osc.type = 'triangle'; // warmer than sine, less harsh than square
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.1);
  } catch (_) {}
}

/**
 * Returns all sound functions as a plain object.
 * Not a stateful hook — just a stable API surface so components
 * can import sounds the same way they import other hooks.
 */
export function useSound() {
  return { playClick, playNav, playQtyUp, playQtyDown, playAddToCart, playRemove, playSuccess, playSelect };
}
