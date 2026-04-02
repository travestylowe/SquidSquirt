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

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2.5 + Math.random() * 8) * Math.pow(power, 0.5)
                  + inf * (4 + Math.random() * 12);

      const sizeBoost = 1 + inf * 5;
      const r = (12 + Math.random() * 22) * Math.pow(power, 0.42) * sizeBoost;

      blobs.push({
        x: originX + (Math.random() - 0.5) * spread * 0.2,
        y: originY + (Math.random() - 0.5) * spread * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        /* Each blob grows as it slows — simulates diffusion */
        maxR: r * (2.0 + Math.random() * 1.5),
        hue: inkHue - 8 + Math.random() * 20,
        sat: 25 + Math.random() * 25,
        lt: 1 + Math.random() * 6,
        alpha: 0.6 + Math.random() * 0.3,
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
        stains.push({
          x: originX + Math.cos(ang) * dist,
          y: originY + Math.sin(ang) * dist,
          r: sr,
          alpha: 0.4 + Math.random() * 0.3,
          hue: inkHue - 5 + Math.random() * 12,
          sat: 25 + Math.random() * 20,
          lt: 1 + Math.random() * 5,
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
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.90;
      b.vy *= 0.90;

      /* Grow as velocity drops — diffusion accelerates when movement stops */
      const spd = Math.hypot(b.vx, b.vy);
      const growFactor = 1 - Math.min(spd / 10, 1);   /* 0 when fast, 1 when stopped */
      if (b.r < b.maxR) {
        b.r = Math.min(b.maxR, b.r + growFactor * b.maxR * 0.04);
      }

      /* Pool into a stain once nearly stopped */
      if (spd < POOL_SPEED) {
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

    /* Active blobs on top */
    for (const b of blobs) {
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

  return {
    resize,
    spawnInk,
    step,
    setInkHue(h) { inkHue = h; },
    getInkDensityAt,
  };
}
