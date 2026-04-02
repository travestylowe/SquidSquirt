import { GAME } from '../constants.js';

/**
 * SVG squid: palette, pupils, blush, squish, random placement, idle growth scale.
 */
export function createSquidController(refs, palettes) {
  const {
    squidBtn,
    squidWrap,
    squidSvg,
    squidBody,
    pupilL,
    pupilR,
    blushL,
    blushR,
    squidCollar,
    squidArms,
    squidFeeders,
    squidClubDots,
    squidSiphon,
    squidSiphonMouth,
    bodyGradStops,
    eyeGradStops,
    finGradStops,
    squidEyeOutlines,
    squidClubs,
  } = refs;

  const nPalettes = palettes.length;
  const pageLoadTime = performance.now();
  let lastSquirtTime = null;
  let baseSquidBtnW = 260;
  let baseSquidBtnH = 280;
  let squidScale = 1;

  const EYES = [
    { el: pupilL, baseX: 172, baseY: 116 },
    { el: pupilR, baseX: 228, baseY: 116 },
  ];
  const PUPIL_RANGE = 9;

  function squidPaletteIndex(total) {
    return Math.floor(Math.max(0, total) / GAME.PALETTE_EVERY_N) % nPalettes;
  }

  function applySquidPalette(total) {
    const t = palettes[squidPaletteIndex(total)];
    bodyGradStops.forEach((el, i) => { el.setAttribute('stop-color', t.body[i]); });
    eyeGradStops.forEach((el, i) => { el.setAttribute('stop-color', t.eye[i]); });
    finGradStops.forEach((el, i) => { el.setAttribute('stop-color', t.fin[i]); });
    squidEyeOutlines.forEach((el) => { el.setAttribute('stroke', t.eyeRing); });
    pupilL.setAttribute('fill', t.pupil);
    pupilR.setAttribute('fill', t.pupil);
    blushL.setAttribute('fill', t.blush);
    blushR.setAttribute('fill', t.blush);
    squidCollar.setAttribute('fill', t.collar);
    squidArms.setAttribute('stroke', t.arm);
    squidFeeders.setAttribute('stroke', t.feeder);
    squidClubs.forEach((el) => { el.setAttribute('fill', t.club); });
    squidClubDots.setAttribute('fill', t.clubDot);
    squidSiphon.setAttribute('fill', t.siphon);
    squidSiphonMouth.setAttribute('fill', t.siphonMouth);
  }

  /** Current rotation angle in radians (updated when the squid moves). */
  let currentRotRad = 0;

  document.addEventListener('mousemove', (e) => {
    const rect = squidSvg.getBoundingClientRect();
    /* Screen-space centre of the SVG bounding box */
    const cxScreen = rect.left + rect.width * 0.5;
    const cyScreen = rect.top + rect.height * 0.5;

    /* Mouse offset from centre in screen pixels */
    let dx = e.clientX - cxScreen;
    let dy = e.clientY - cyScreen;

    /* Undo the CSS rotation so we get coordinates in the squid's local frame */
    const cos = Math.cos(-currentRotRad);
    const sin = Math.sin(-currentRotRad);
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;

    /* Map from local pixel offset to SVG viewBox coordinates (centre is 200, ~140) */
    const svgScale = 400 / rect.width;
    const mx = 200 + lx * svgScale;
    const my = 140 + ly * svgScale;

    for (const eye of EYES) {
      const ex = mx - eye.baseX;
      const ey = my - eye.baseY;
      const dist = Math.hypot(ex, ey) || 1;
      const r = Math.min(dist / 15, PUPIL_RANGE);
      eye.el.setAttribute('cx', eye.baseX + (ex / dist) * r);
      eye.el.setAttribute('cy', eye.baseY + (ey / dist) * r);
    }
  });

  let blushTimer = null;

  function triggerBlush() {
    blushL.style.opacity = GAME.BLUSH_OPACITY;
    blushR.style.opacity = GAME.BLUSH_OPACITY;
    clearTimeout(blushTimer);
    blushTimer = setTimeout(() => {
      blushL.style.opacity = '0';
      blushR.style.opacity = '0';
    }, GAME.BLUSH_MS);
  }

  function clearSquidPressAxis() {
    squidBtn.classList.remove('squid-press-v', 'squid-press-h');
  }

  function triggerSquish() {
    const vertical = Math.random() < 0.5;
    squidBody.classList.remove('squish-v', 'squish-h');
    clearSquidPressAxis();
    void squidBody.offsetWidth;
    squidBtn.classList.add(vertical ? 'squid-press-v' : 'squid-press-h');
    squidBody.classList.add(vertical ? 'squish-v' : 'squish-h');
  }

  squidBtn.addEventListener('mouseup', clearSquidPressAxis);
  squidBtn.addEventListener('mouseleave', clearSquidPressAxis);
  squidBtn.addEventListener('touchend', clearSquidPressAxis);
  squidBtn.addEventListener('touchcancel', clearSquidPressAxis);

  const m = GAME.SQUID_VIEW_MARGIN_PX;

  /** Dive duration (ms). */
  const DIVE_MS = 280;
  /** Surface duration (ms). */
  const SURFACE_MS = 380;

  /** Cancel any in-progress swim animation. */
  function cancelSwim() {
    squidWrap.classList.remove('squid-dive', 'squid-surface');
    squidWrap.style.opacity = '';
  }

  /** Number of random candidates to evaluate when picking a landing spot. */
  const SPOT_CANDIDATES = 12;

  /**
   * Swim-away sequence:
   *  1. Squid shrinks into the background (dive) at current position
   *  2. While invisible → reposition + rotate toward destination
   *  3. Squid grows back to full size (surface) at the new spot
   *
   * Distance is proportional to `power`.
   * If `inkScoreFn(x,y)` is provided, the squid picks the candidate spot
   * with the least ink coverage.
   */
  function swimAway(power, inkScoreFn, onSurfaceCb) {
    const w = squidWrap.offsetWidth;
    const h = squidWrap.offsetHeight;
    const minX = m + w * 0.5;
    const maxX = window.innerWidth - m - w * 0.5;
    const minY = m + h * 0.5;
    const maxY = window.innerHeight - m - h * 0.5;
    if (maxX <= minX || maxY <= minY) return;

    const oldX = parseFloat(squidWrap.style.left) || window.innerWidth * 0.5;
    const oldY = parseFloat(squidWrap.style.top) || window.innerHeight * 0.5;

    const maxDist = Math.hypot(maxX - minX, maxY - minY);
    const p = power == null ? Math.random() : power;
    const dist = maxDist * (0.10 + 0.90 * p);

    /* Generate candidates and pick the clearest spot */
    let cx, cy;
    let bestScore = Infinity;

    for (let i = 0; i < SPOT_CANDIDATES; i++) {
      const angle = Math.random() * Math.PI * 2;
      let tx = oldX + Math.cos(angle) * dist;
      let ty = oldY + Math.sin(angle) * dist;
      tx = Math.min(maxX, Math.max(minX, tx));
      ty = Math.min(maxY, Math.max(minY, ty));

      const score = inkScoreFn ? inkScoreFn(tx, ty) : Math.random();
      if (score < bestScore) {
        bestScore = score;
        cx = tx;
        cy = ty;
      }
    }

    /* Rotation toward destination */
    const dx = cx - oldX;
    const dy = cy - oldY;
    const rad = Math.atan2(dx, -dy);
    const deg = rad * (180 / Math.PI);

    /* Cancel any ongoing swim */
    cancelSwim();
    void squidWrap.offsetWidth; /* reflow so class re-add triggers animation */

    /* ── Phase 1: Dive ── */
    squidWrap.classList.add('squid-dive');

    /* Point head in travel direction immediately (visible during dive) */
    currentRotRad = rad;
    squidBtn.style.transform = `rotate(${deg}deg)`;

    setTimeout(() => {
      /* ── Phase 2: Reposition (squid is invisible) ── */
      squidWrap.classList.remove('squid-dive');
      squidWrap.style.left = `${cx}px`;
      squidWrap.style.top = `${cy}px`;

      /* ── Phase 3: Surface ── */
      if (onSurfaceCb) onSurfaceCb();
      void squidWrap.offsetWidth;
      squidWrap.classList.add('squid-surface');

      setTimeout(() => {
        squidWrap.classList.remove('squid-surface');
        squidWrap.style.opacity = '';
      }, SURFACE_MS);
    }, DIVE_MS);
  }

  function measureBaseSquidSize() {
    const prev = squidScale;
    squidBtn.style.setProperty('--squid-idle-scale', '1');
    squidScale = 1;
    baseSquidBtnW = Math.max(1, squidBtn.offsetWidth);
    baseSquidBtnH = Math.max(1, squidBtn.offsetHeight);
    squidScale = prev;
    squidBtn.style.setProperty('--squid-idle-scale', String(squidScale));
  }

  function computeMaxSquidScale() {
    const inset = GAME.SQUID_SCALE_INSET_PX;
    const vw = Math.max(0, window.innerWidth - inset * 2);
    const vh = Math.max(0, window.innerHeight - inset * 2);
    return Math.max(1, Math.min(vw / baseSquidBtnW, vh / baseSquidBtnH));
  }

  function clampSquidIntoViewport() {
    if (!squidWrap.style.left || !squidWrap.style.top) return;
    const w = squidWrap.offsetWidth;
    const h = squidWrap.offsetHeight;
    const minX = m + w * 0.5;
    const maxX = window.innerWidth - m - w * 0.5;
    const minY = m + h * 0.5;
    const maxY = window.innerHeight - m - h * 0.5;
    if (maxX <= minX || maxY <= minY) return;
    let cx = parseFloat(squidWrap.style.left);
    let cy = parseFloat(squidWrap.style.top);
    if (Number.isNaN(cx) || Number.isNaN(cy)) return;
    cx = Math.min(maxX, Math.max(minX, cx));
    cy = Math.min(maxY, Math.max(minY, cy));
    squidWrap.style.left = `${cx}px`;
    squidWrap.style.top = `${cy}px`;
  }

  function idleTick() {
    const tNow = performance.now();
    const idle = lastSquirtTime == null ? tNow - pageLoadTime : tNow - lastSquirtTime;
    const maxS = computeMaxSquidScale();
    const u = Math.min(1, idle / GAME.IDLE_TO_MAX_MS);
    const smooth = u * u * (3 - 2 * u);
    const target = 1 + (maxS - 1) * smooth;

    if (squidScale < target) {
      const d = target - squidScale;
      squidScale += Math.min(d, Math.max(0.0008, d * 0.028));
    } else if (squidScale > target) {
      const d = squidScale - target;
      squidScale -= Math.min(d, Math.max(0.0012, d * 0.045));
    }
    squidScale = Math.min(Math.max(1, squidScale), maxS);
    squidBtn.style.setProperty('--squid-idle-scale', String(squidScale));
    clampSquidIntoViewport();
  }

  /**
   * Maximum clicks to bring the squid from max size back to base.
   * Actual clicks needed = ceil(lerp(1, MAX, how-big-the-squid-is)).
   */
  const MAX_SHRINK_CLICKS = 5;
  /** Threshold: squid is "back to normal" when scale is within this of 1. */
  const SHRINK_DONE_THRESHOLD = 1.08;

  /**
   * Shrink the squid toward base size.
   * Returns `true` if the squid is now at (or near) base size and ready to swim.
   */
  function onSquirtShrinkScale() {
    lastSquirtTime = performance.now();

    const maxS = computeMaxSquidScale();
    const excess = squidScale - 1;

    if (excess <= SHRINK_DONE_THRESHOLD - 1) {
      /* Already at base size */
      squidScale = 1;
      squidBtn.style.setProperty('--squid-idle-scale', '1');
      return true;
    }

    /* How many clicks would it take from here?  Scale excess → 1..MAX_SHRINK_CLICKS */
    const ratio = Math.min(1, excess / Math.max(0.01, maxS - 1));
    const clicksNeeded = Math.ceil(1 + (MAX_SHRINK_CLICKS - 1) * ratio);
    const shrinkStep = excess / clicksNeeded;

    squidScale = Math.max(1, squidScale - shrinkStep);
    squidBtn.style.setProperty('--squid-idle-scale', String(squidScale));

    return squidScale <= SHRINK_DONE_THRESHOLD;
  }

  return {
    applySquidPalette,
    triggerBlush,
    triggerSquish,
    swimAway,
    measureBaseSquidSize,
    clampSquidIntoViewport,
    idleTick,
    onSquirtShrinkScale,
    getSiphonMouthRect: () => squidSiphonMouth.getBoundingClientRect(),
    /** How inflated the squid is: 0 = base size, 1 = max size. */
    getInflation() {
      const maxS = computeMaxSquidScale();
      return maxS <= 1 ? 0 : Math.min(1, (squidScale - 1) / (maxS - 1));
    },
  };
}
