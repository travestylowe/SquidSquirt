import { GAME } from '../constants.js';

/**
 * Full-screen ink cloud system.
 *
 * All ink is drawn to an offscreen canvas, then composited onto the visible
 * canvas with a blur filter.  The blur merges nearby shapes into a single
 * connected cloud — like ink diffusing through water.
 *
 * A second pass draws the same offscreen image at low opacity WITHOUT blur,
 * adding a touch of internal definition so the cloud isn't pure mush.
 */
export function createInkSystem(canvasEl) {
  const ctx = canvasEl.getContext('2d');

  /* Offscreen canvas — ink shapes are drawn here unblurred, then composited */
  const off = document.createElement('canvas');
  const oCtx = off.getContext('2d');

  let W = 0;
  let H = 0;
  let blobs = [];     /* active expanding blobs (in-flight) */
  let stains = [];    /* pooled blobs (stuck on screen) */
  let inkHue = 272;

  /**
   * Render mode for the next spawnInk call.
   * Set externally by the unlock manager before each squirt.
   *   - { mode: 'ink', hue: number|function }
   *   - { mode: 'sprinkle', huePool: number[] }
   *   - { mode: 'emoji', emojis: string[] }
   * Default (null) = use current inkHue from palette.
   */
  let renderMode = null;

  const MAX_STAINS = 600;
  const POOL_SPEED = 1.4;
  /** Blur radius for the cloud composite (px). */
  const BLUR_R = 14;

  function resize() {
    W = canvasEl.width = window.innerWidth;
    H = canvasEl.height = window.innerHeight;
    off.width = W;
    off.height = H;
  }

  /* ────────────────────────────────────────────
     Spawn
     ──────────────────────────────────────────── */

  function spawnInk(originX, originY, power, inflation) {
    const inf = inflation || 0;

    /* Fewer blobs than before — the blur makes them merge so we don't
       need as many to fill the cloud.  Still scales heavily with inflation. */
    /* Blur merges blobs visually so we need far fewer than before. */
    const infBonus = inf * inf * 200;
    let count = Math.floor(
      GAME.PARTICLE_BASE + power * GAME.PARTICLE_PER_POWER + infBonus
    );
    count = Math.min(count, 350);

    const maxSpread = Math.hypot(W, H) * 0.6;
    const spread = 120 + maxSpread * inf;

    /* Emoji mode uses a separate lightweight emitter — skip blob physics */
    if (renderMode && renderMode.mode === 'emoji') {
      spawnEmojiScatter(originX, originY, power, inflation, count);
      return;
    }

    /* Sprinkle mode: smaller, discrete, bright particles (no blur merge) */
    const isSprinkle = renderMode && renderMode.mode === 'sprinkle';
    const sprinkleCount = isSprinkle ? Math.min(Math.floor(count * 1.6), 500) : count;

    for (let i = 0; i < sprinkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isSprinkle
        ? (4 + Math.random() * 12) * Math.pow(power, 0.5) + inf * (5 + Math.random() * 10)
        : (2.5 + Math.random() * 8) * Math.pow(power, 0.5) + inf * (4 + Math.random() * 12);

      const sizeBoost = 1 + inf * 5;
      const r = isSprinkle
        ? (3 + Math.random() * 5) * Math.pow(power, 0.3) * sizeBoost
        : (12 + Math.random() * 22) * Math.pow(power, 0.42) * sizeBoost;

      /* Determine hue / sat / lt for this particle based on render mode */
      let blobHue, blobSat, blobLt;
      if (isSprinkle) {
        const pool = renderMode.huePool;
        blobHue = pool[Math.floor(Math.random() * pool.length)] + (Math.random() - 0.5) * 30; /* spread hue ±15 */
        blobSat = 80 + Math.random() * 20;   /* vivid, sparkly */
        blobLt = 55 + Math.random() * 20;    /* bright — the twinkle adds more */
      } else if (renderMode && renderMode.mode === 'ink' && typeof renderMode.hue === 'function') {
        blobHue = renderMode.hue();
        blobSat = (renderMode.sat || 55) + Math.random() * 15;
        blobLt = (renderMode.lt || 18) + Math.random() * 8;
      } else if (renderMode && renderMode.mode === 'ink') {
        blobHue = renderMode.hue;
        blobSat = (renderMode.sat || 55) + Math.random() * 15;
        blobLt = (renderMode.lt || 18) + Math.random() * 8;
      } else {
        blobHue = inkHue;
        blobSat = 25 + Math.random() * 25;
        blobLt = 1 + Math.random() * 6;
      }

      blobs.push({
        x: originX + (Math.random() - 0.5) * spread * 0.2,
        y: originY + (Math.random() - 0.5) * spread * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        maxR: isSprinkle ? r * (1.1 + Math.random() * 0.3) : r * (2.0 + Math.random() * 1.5),
        hue: blobHue - 8 + Math.random() * 20,
        sat: blobSat,
        lt: blobLt,
        alpha: isSprinkle ? 0.85 + Math.random() * 0.15 : 0.6 + Math.random() * 0.3,
        sprinkle: isSprinkle,
        alive: true,
      });
    }

    /* Extra large stain patches for mega / inflated squirts */
    if (power > GAME.INK_MEGA_THRESHOLD || inf > 0.5) {
      const megaCount = Math.floor(8 + inf * 40 + power * 8);
      const megaSpread = spread * 1.3;
      for (let i = 0; i < megaCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * megaSpread;
        const sr = (25 + Math.random() * 45) * (1 + inf * 2);

        let stainHue, stainSat, stainLt;
        if (renderMode && renderMode.mode === 'sprinkle') {
          /* Sprinkles don't produce mega stains — skip */
          continue;
        } else if (renderMode && renderMode.mode === 'ink' && typeof renderMode.hue === 'function') {
          stainHue = renderMode.hue();
          stainSat = (renderMode.sat || 55) + Math.random() * 12;
          stainLt = (renderMode.lt || 18) + Math.random() * 6;
        } else if (renderMode && renderMode.mode === 'ink') {
          stainHue = renderMode.hue;
          stainSat = (renderMode.sat || 55) + Math.random() * 12;
          stainLt = (renderMode.lt || 18) + Math.random() * 6;
        } else {
          stainHue = inkHue;
          stainSat = 25 + Math.random() * 20;
          stainLt = 1 + Math.random() * 5;
        }

        stains.push({
          x: originX + Math.cos(ang) * dist,
          y: originY + Math.sin(ang) * dist,
          r: sr,
          alpha: 0.4 + Math.random() * 0.3,
          hue: stainHue - 5 + Math.random() * 12,
          sat: stainSat,
          lt: stainLt,
        });
      }
    }
  }

  /* ────────────────────────────────────────────
     Frame step
     ──────────────────────────────────────────── */

  function step() {
    ctx.clearRect(0, 0, W, H);
    oCtx.clearRect(0, 0, W, H);

    /* ── Update blobs ── */
    for (const b of blobs) {
      const drag = b.sprinkle ? 0.96 : 0.90; /* sprinkles drift further */
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= drag;
      b.vy *= drag;

      /* Grow as velocity drops — diffusion accelerates when movement stops */
      const spd = Math.hypot(b.vx, b.vy);
      const growFactor = 1 - Math.min(spd / 10, 1);   /* 0 when fast, 1 when stopped */
      if (b.r < b.maxR) {
        b.r = Math.min(b.maxR, b.r + growFactor * b.maxR * 0.04);
      }

      /* Pool into a stain once nearly stopped */
      if (b.sprinkle) {
        /* Sprinkle particles: slow fade-out instead of instant death */
        if (spd < POOL_SPEED) {
          b.alpha -= 0.0015; /* very slow fade — lingers ~10s */
          if (b.alpha <= 0) b.alive = false;
        }
      } else if (spd < POOL_SPEED) {
        if (stains.length < MAX_STAINS) {
          stains.push({
            x: b.x, y: b.y,
            r: b.r,
            alpha: b.alpha,
            hue: b.hue, sat: b.sat, lt: b.lt,
          });
        }
        b.alive = false;
      }
    }
    blobs = blobs.filter(b => b.alive);

    /* ── Fade stains very slowly ── */
    for (const s of stains) {
      s.alpha -= 0.0003;
    }
    stains = stains.filter(s => s.alpha > 0);

    /* ── Draw everything to the offscreen canvas ── */

    /* Stains first (underneath) */
    for (const s of stains) {
      oCtx.globalAlpha = s.alpha;
      oCtx.fillStyle = `hsl(${s.hue},${s.sat}%,${s.lt}%)`;
      oCtx.beginPath();
      oCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      oCtx.fill();
    }

    /* Active blobs on top (non-sprinkle only — sprinkles drawn separately) */
    for (const b of blobs) {
      if (b.sprinkle) continue;
      oCtx.globalAlpha = b.alpha;
      oCtx.fillStyle = `hsl(${b.hue},${b.sat}%,${b.lt}%)`;
      oCtx.beginPath();
      oCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      oCtx.fill();
    }

    oCtx.globalAlpha = 1;

    /* ── Composite onto the visible canvas ── */

    /* Single blurred pass — merges shapes into a connected cloud */
    ctx.filter = `blur(${BLUR_R}px)`;
    ctx.drawImage(off, 0, 0);
    ctx.filter = 'none';

    /* Sharp pass at low opacity — adds core density + definition */
    ctx.globalAlpha = 0.25;
    ctx.drawImage(off, 0, 0);
    ctx.globalAlpha = 1;

    /* Sprinkle particles: drawn directly on visible canvas — no blur.
       Sparkle effect: oscillate lightness + add a soft glow ring. */
    for (const b of blobs) {
      if (!b.sprinkle) continue;
      /* Twinkle: oscillate lightness for a sparkle effect */
      const twinkle = Math.sin((b.x + b.y) * 0.05 + performance.now() * 0.008) * 0.5 + 0.5;
      const lt = b.lt + twinkle * 20; /* pulse between base and base+20 */
      const sat = b.sat + twinkle * 10;

      /* Outer glow */
      ctx.globalAlpha = b.alpha * 0.3;
      ctx.fillStyle = `hsl(${b.hue},${sat}%,${lt + 15}%)`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      /* Bright core */
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = `hsl(${b.hue},${sat}%,${lt}%)`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Sample how much ink covers a screen position by reading the offscreen
   * canvas alpha channel in a small patch.  Returns 0 (clear) – 255 (solid ink).
   */
  function getInkDensityAt(x, y) {
    const r = 18; /* half-size of the sample patch */
    const x0 = Math.max(0, Math.floor(x - r));
    const y0 = Math.max(0, Math.floor(y - r));
    const w = Math.min(Math.floor(W - x0), r * 2);
    const h = Math.min(Math.floor(H - y0), r * 2);
    if (w <= 0 || h <= 0) return 0;

    let data;
    try { data = oCtx.getImageData(x0, y0, w, h).data; }
    catch (_) { return 0; }

    let total = 0;
    for (let i = 3; i < data.length; i += 4) total += data[i];
    return total / (w * h);
  }

  /**
   * Lightweight scatter for emoji mode — no drips, stains, or blur.
   * Each emoji pack has unique physics for a distinct feel.
   */
  function spawnEmojiScatter(originX, originY, power, inflation, count) {
    const inf = inflation || 0;
    const emojis = renderMode.emojis;
    const phys = renderMode.physics || {};

    const gravity   = phys.gravity   ?? 0.15;
    const drag      = phys.drag      ?? 0.96;
    const fadeRate   = phys.fadeRate  ?? 0.012;
    const sizeMin   = phys.sizeMin   ?? 16;
    const sizeRange  = phys.sizeRange ?? 18;
    const speedMul   = phys.speedMul ?? 1;
    const doTwinkle  = phys.twinkle  || false;
    const doSway     = phys.sway     || false;
    const doSpin     = phys.spin     || false;

    /* Fewer particles than ink for a cleaner look */
    const emojiCount = Math.min(Math.floor(count * 0.35), 60);
    const maxSpread = Math.hypot(W, H) * 0.6;
    const spread = 120 + maxSpread * inf;

    const pieces = [];
    let frame = 0;

    for (let i = 0; i < emojiCount; i++) {
      const glyph = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = ((3 + Math.random() * 7) * Math.pow(power, 0.5)
                  + inf * (3 + Math.random() * 8)) * speedMul;
      const size = sizeMin + Math.random() * sizeRange;

      const el = document.createElement('div');
      el.className = 'emoji-particle';
      el.textContent = glyph;
      el.style.fontSize = size + 'px';
      el.style.left = '0px';
      el.style.top = '0px';
      document.body.appendChild(el);

      pieces.push({
        el,
        x: originX + (Math.random() - 0.5) * spread * 0.15,
        y: originY + (Math.random() - 0.5) * spread * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        rot: 0,
        spinRate: doSpin ? (Math.random() - 0.5) * 16 : 0,
        swayPhase: Math.random() * Math.PI * 2,
        alive: true,
      });
    }

    function tick() {
      frame++;
      let active = 0;
      for (const p of pieces) {
        if (!p.alive) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.alpha -= fadeRate;

        /* Sway: gentle horizontal sine wave (hearts) */
        if (doSway) {
          p.x += Math.sin(frame * 0.04 + p.swayPhase) * 1.2;
        }

        /* Spin: rotation (skulls) */
        if (doSpin) {
          p.rot += p.spinRate;
        }

        if (p.alpha <= 0 || p.y > H + 40 || p.y < -80 || p.x < -40 || p.x > W + 40) {
          p.alive = false;
          p.el.remove();
          continue;
        }

        /* Twinkle: oscillate opacity (stars) */
        const displayAlpha = doTwinkle
          ? p.alpha * (0.55 + 0.45 * Math.sin(frame * 0.12 + p.swayPhase))
          : p.alpha;

        const rotStr = p.rot ? ` rotate(${p.rot}deg)` : '';
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)${rotStr}`;
        p.el.style.opacity = displayAlpha;
        active++;
      }
      if (active > 0) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  return {
    resize,
    spawnInk,
    step,
    setInkHue(h) { inkHue = h; },
    setRenderMode(mode) { renderMode = mode; },
    getInkDensityAt,
  };
}
