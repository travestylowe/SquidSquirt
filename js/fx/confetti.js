import { GAME } from '../constants.js';
import { randomInt } from '../util/random.js';

function miniSquidSvg(hue) {
  const h = Math.round(hue);
  return `<svg viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg" width="32" height="35" aria-hidden="true">
      <ellipse cx="24" cy="20" rx="18" ry="20" fill="hsl(${h},62%,48%)"/>
      <ellipse cx="24" cy="17" rx="11" ry="13" fill="hsl(${h},52%,40%)"/>
      <circle cx="16" cy="15" r="5.5" fill="#f5eeff"/><circle cx="16" cy="15" r="2.8" fill="#160030"/>
      <circle cx="32" cy="15" r="5.5" fill="#f5eeff"/><circle cx="32" cy="15" r="2.8" fill="#160030"/>
      <path d="M10 30 Q24 42 38 30" stroke="hsl(${h},58%,34%)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M14 36 L11 48 M24 38 L24 50 M34 36 L37 48" stroke="hsl(${h},55%,38%)" stroke-width="3.2" stroke-linecap="round"/>
    </svg>`;
}

/** Cone half-angle for the confetti spray (radians). */
const CONE_HALF = Math.PI * 0.35;

/** Gravity per frame (px/frame²) — randomized per piece for varied parabolas. */
const GRAVITY_MIN = 0.12;
const GRAVITY_RANGE = 0.18;

/** Initial launch speed range (px/frame). */
const SPEED_MIN = 6;
const SPEED_RANGE = 10;

/**
 * Pick a random point along the viewport edge and return the inward-facing
 * angle so confetti sprays into the screen.
 *
 * Screen-space angles: 0 = right, PI/2 = down, PI = left, -PI/2 = up.
 */
function pickEdgeOrigin(vw, vh) {
  const perimeter = 2 * (vw + vh);
  let t = Math.random() * perimeter;
  let x, y, inwardAngle;

  if (t < vw) {
    /* Top edge → spray downward */
    x = t; y = -8;
    inwardAngle = Math.PI * 0.5;
  } else if (t < vw + vh) {
    /* Right edge → spray left */
    x = vw + 8; y = t - vw;
    inwardAngle = Math.PI;
  } else if (t < 2 * vw + vh) {
    /* Bottom edge → spray upward */
    x = 2 * vw + vh - t; y = vh + 8;
    inwardAngle = -Math.PI * 0.5;
  } else {
    /* Left edge → spray right */
    x = -8; y = perimeter - t;
    inwardAngle = 0;
  }
  return { x, y, angle: inwardAngle };
}

/**
 * Spawn confetti from both left and right sides simultaneously.
 * Each side fires 3x the base particle count for a big celebration.
 *
 * @param {object|null} shape - confetti shape from confetti-unlocks, or null for default
 */
export function spawnSquidConfetti(shape) {
  const baseN = randomInt(GAME.CONFETTI_PIECES_MIN, GAME.CONFETTI_PIECES_MAX);
  const perSide = baseN * 3;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  /* Two origins: left and right edges, spread vertically across middle third */
  const leftY = vh * 0.25 + Math.random() * vh * 0.5;
  const rightY = vh * 0.25 + Math.random() * vh * 0.5;
  const origins = [
    { x: 0, y: leftY, angle: 0 },          /* left edge → spray right */
    { x: vw, y: rightY, angle: Math.PI },   /* right edge → spray left */
  ];

  const pieces = [];

  for (const origin of origins) {
    for (let i = 0; i < perSide; i++) {
      const el = document.createElement('div');
      el.className = 'squid-confetti-piece';

      const hue = 250 + Math.random() * 80;
      el.innerHTML = shape ? shape.svg(hue) : miniSquidSvg(hue);

      if (!shape) {
        const w = 26 + Math.floor(Math.random() * 14);
        const svg = el.firstElementChild;
        if (svg) {
          svg.setAttribute('width', String(w));
          svg.setAttribute('height', String(Math.round(w * 35 / 32)));
        }
      }

      document.body.appendChild(el);

      const angle = origin.angle + (Math.random() - 0.5) * 2 * CONE_HALF;
      const speed = SPEED_MIN + Math.random() * SPEED_RANGE;

      pieces.push({
        el,
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: GRAVITY_MIN + Math.random() * GRAVITY_RANGE,
        rot: Math.random() * 360,
        spin: (Math.random() - 0.5) * 14,
        delay: Math.floor(Math.random() * 8),
        alive: true,
      });
    }
  }

  function tick() {
    let active = 0;

    for (const p of pieces) {
      if (!p.alive) continue;

      if (p.delay > 0) { p.delay--; active++; continue; }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.spin;

      if (p.y > vh + 60 || p.y < -80 || p.x < -80 || p.x > vw + 80) {
        p.alive = false;
        p.el.remove();
        continue;
      }

      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
      active++;
    }

    if (active > 0) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
