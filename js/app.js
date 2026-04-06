/**
 * Composes subsystems and runs a single requestAnimationFrame loop (ink + idle scale).
 */
import { GAME } from './constants.js';
import { getDomRefs } from './dom/refs.js';
import { createLocalCounter } from './counter/local.js';
import { initSupabase } from './counter/supabaseClient.js';
import { createGlobalCounterBackend, parseSupabaseNumber } from './counter/globalSupabase.js';
import { createInkSystem } from './ink/canvas.js';
import { createSquirtAudio } from './audio/squirtAudio.js';
import { createSquidController } from './squid/squidController.js';
import { createHints } from './ui/hints.js';
import { spawnSquidConfetti } from './fx/confetti.js';
import { spawnAmbientBubbles } from './fx/bubbles.js';
import { getMilestone, celebrateMilestone } from './fx/milestone.js';
import { createSoundToggle } from './ui/soundToggle.js';
import { createShareButton } from './ui/shareButton.js';
import { createAccessorySystem } from './ui/accessories.js';
import { createUnlockManager } from './unlocks/unlock-manager.js';
import { createUnlockPicker } from './ui/unlock-picker.js';
import { createPaymentSystem } from './ui/payments.js';
import { spawnUnlockBubbles } from './fx/unlock-bubble.js';
import { randomInt } from './util/random.js';
import { debounce } from './util/debounce.js';

async function loadJson(name) {
  const url = new URL(`../data/${name}`, import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  return res.json();
}

/** Compute palette index for a given squirt count. */
function paletteIdx(count, nPalettes) {
  return Math.floor(Math.max(0, count) / GAME.PALETTE_EVERY_N) % nPalettes;
}

async function main() {
  const cfg = window.SQUIDSQUIRT_CONFIG || {};
  initSupabase(cfg);
  const debug = Boolean(cfg.debug);

  let taunts;
  let thanks;
  let palettes;
  try {
    [taunts, thanks, palettes] = await Promise.all([
      loadJson('taunts.json'),
      loadJson('thanks.json'),
      loadJson('palettes.json'),
    ]);
  } catch (e) {
    if (debug) console.error(e);
    document.body.innerHTML = '<p style="color:#e9d5ff;font-family:sans-serif;padding:2rem;">Could not load data files. Serve the site over HTTP (e.g. <code>npm start</code>), not file://</p>';
    return;
  }

  const refs = getDomRefs();
  const ink = createInkSystem(refs.canvas);
  ink.resize();

  const audio = createSquirtAudio(debug);
  const squid = createSquidController(refs, palettes);
  const localCounter = createLocalCounter();
  const globalBackend = createGlobalCounterBackend(cfg);
  const hints = createHints(refs.hint, taunts, thanks);

  /* ── New subsystems ── */
  const soundToggle = createSoundToggle(refs.muteBtn);

  let count = localCounter.load();
  createShareButton(refs.shareBtn, () => count);

  const accessories = createAccessorySystem(refs.squidBody, count);

  const unlockManager = createUnlockManager(count);
  const paymentSystem = createPaymentSystem(refs, { triggerBlush: squid.triggerBlush });
  const unlockPicker = createUnlockPicker(
    refs, unlockManager, paymentSystem, (container) => accessories.buildHatsContent(container)
  );

  /* ── Init display ── */
  refs.counter.textContent = count.toLocaleString();
  squid.applySquidPalette(count);
  ink.setInkHue(palettes[paletteIdx(count, palettes.length)].inkHue);

  let squirtsUntilConfetti = randomInt(GAME.CONFETTI_MIN_SQUIRTS, GAME.CONFETTI_MAX_SQUIRTS);

  if (globalBackend) {
    globalBackend.fetchGlobalTotal().then((g) => {
      const n = parseSupabaseNumber(g);
      refs.globalCounter.textContent = Number.isNaN(n) ? '—' : n.toLocaleString();
    }).catch((e) => {
      if (debug) console.warn('global load', e);
      refs.globalCounter.textContent = '—';
    });
  }

  function bumpCounter() {
    count++;
    refs.counter.textContent = count.toLocaleString();
    squid.applySquidPalette(count);
    refs.counter.classList.remove('pop');
    void refs.counter.offsetWidth;
    refs.counter.classList.add('pop');

    /* Sync ink color with current palette */
    ink.setInkHue(palettes[paletteIdx(count, palettes.length)].inkHue);

    /* Milestone check */
    const milestone = getMilestone(count);
    if (milestone) {
      celebrateMilestone(unlockManager.pickConfettiShape());
      hints.showMilestoneMsg(milestone.msg);
    } else {
      squirtsUntilConfetti--;
      if (squirtsUntilConfetti <= 0) {
        spawnSquidConfetti(unlockManager.pickConfettiShape());
        squirtsUntilConfetti = randomInt(GAME.CONFETTI_MIN_SQUIRTS, GAME.CONFETTI_MAX_SQUIRTS);
      }
      hints.showThankYouPun();
    }

    /* Accessory unlock check */
    accessories.updateCount(count);

    /* Unlock check */
    const { milestoneUnlocks, easterEggUnlocks } = unlockManager.onSquirt(count);

    /* Spawn reveal bubbles for new unlocks */
    const allNewUnlocks = [...milestoneUnlocks, ...easterEggUnlocks];
    if (allNewUnlocks.length > 0) {
      const mouth = squid.getSiphonMouthRect();
      const bubbleX = mouth.left + mouth.width * 0.5;
      const bubbleY = mouth.top + mouth.height * 0.5;
      spawnUnlockBubbles(allNewUnlocks, bubbleX, bubbleY);
    }

    localCounter.save(count);

    if (globalBackend) {
      globalBackend.incrementGlobal().then((raw) => {
        const n = parseSupabaseNumber(raw);
        if (!Number.isNaN(n)) refs.globalCounter.textContent = n.toLocaleString();
      }).catch((e) => {
        if (debug) console.warn('global increment', e);
      });
    }
  }

  /* ── Game loop ── */
  function gameLoop() {
    ink.step();
    squid.idleTick();
    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);

  const onResizeDebounced = debounce(() => {
    squid.measureBaseSquidSize();
    squid.clampSquidIntoViewport();
  }, GAME.RESIZE_DEBOUNCE_MS);

  window.addEventListener('resize', () => {
    ink.resize();
    onResizeDebounced();
  });

  squid.measureBaseSquidSize();

  /* ── Squirt handler ── */
  let cooldown = false;

  function doSquirt() {
    if (cooldown) return;
    cooldown = true;

    squid.onSquirtShrinkScale();

    const power = Math.random();
    const isFart = Math.random() < GAME.FART_CHANCE;

    squid.triggerSquish();

    if (!soundToggle.isMuted()) {
      audio.playSound(power, isFart);
    }

    const mouth = squid.getSiphonMouthRect();
    const inkX = mouth.left + mouth.width * 0.5;
    const inkY = mouth.top + mouth.height * 0.5;

    /* Set ink render mode from unlock manager */
    const particleStyle = unlockManager.pickParticleStyle();
    if (particleStyle) {
      switch (particleStyle.type) {
        case 'ink':
          ink.setRenderMode({
            mode: 'ink',
            hue: particleStyle.item.hue === null
              ? () => Math.floor(Math.random() * 360)
              : particleStyle.item.hue,
            sat: particleStyle.item.sat,
            lt: particleStyle.item.lt,
          });
          break;
        case 'sprinkle':
          ink.setRenderMode({ mode: 'sprinkle', huePool: particleStyle.item.hues });
          break;
        case 'emoji':
          ink.setRenderMode({
            mode: 'emoji',
            emojis: particleStyle.item.emojis,
            physics: particleStyle.item.physics,
          });
          break;
      }
    } else {
      ink.setRenderMode(null);
    }

    ink.spawnInk(inkX, inkY, power, squid.getInflation());

    if (power > GAME.BLUSH_SQUIRT_MIN || (isFart && power > GAME.BLUSH_FART_MIN)) {
      squid.triggerBlush();
    }

    bumpCounter();

    /* Always swim away after squirt */
    squid.swimAway(power, ink.getInkDensityAt, () => accessories.onSurface());

    /* Haptic feedback (mobile) */
    if (navigator.vibrate) {
      if (power > GAME.INK_MEGA_THRESHOLD) {
        navigator.vibrate(GAME.HAPTIC_MEGA);
      } else if (isFart) {
        navigator.vibrate(GAME.HAPTIC_FART);
      } else {
        navigator.vibrate(GAME.HAPTIC_NORMAL);
      }
    }

    setTimeout(() => { cooldown = false; }, GAME.SQUIRT_COOLDOWN_MS);
  }

  hints.scheduleTauntAfterIdle();

  /* ── First-visit UX ── */
  const isFirstVisit = !localStorage.getItem(GAME.FIRST_VISIT_KEY);

  if (isFirstVisit) {
    /* Delay ambient bubbles so "squeeze me" hint lands against a still background */
    setTimeout(() => spawnAmbientBubbles(), GAME.FIRST_VISIT_BUBBLE_DELAY_MS);

    /* Show one-time save-state tooltip near the counter */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.fonts.ready.then(() => {
      const tooltip = document.createElement('div');
      tooltip.className = 'speech-bubble bubble--thanks';
      tooltip.textContent = 'Your progress saves automatically!';
      tooltip.style.position = 'fixed';
      tooltip.style.left = '50%';
      tooltip.style.top = `${refs.counter.getBoundingClientRect().bottom + 12}px`;
      tooltip.style.animation = 'none';
      tooltip.style.opacity = '1';
      if (!prefersReducedMotion) {
        tooltip.style.transition = 'opacity 0.6s';
      }
      document.body.appendChild(tooltip);

      setTimeout(() => {
        if (prefersReducedMotion) {
          tooltip.remove();
        } else {
          tooltip.style.opacity = '0';
          tooltip.addEventListener('transitionend', () => tooltip.remove());
        }
      }, GAME.SAVE_TOOLTIP_MS);
    });

    localStorage.setItem(GAME.FIRST_VISIT_KEY, '1');
  } else {
    spawnAmbientBubbles();
  }

  /* Guard prevents double-fire: mousedown already handles mouse users,
     so the click listener only fires for keyboard (Enter/Space) and
     iOS VoiceOver double-tap (which routes through click). */
  let mouseDidFire = false;

  refs.squidBtn.addEventListener('mousedown', () => {
    mouseDidFire = true;
    doSquirt();
  });

  refs.squidBtn.addEventListener('mouseleave', () => { mouseDidFire = false; });

  refs.squidBtn.addEventListener('click', () => {
    if (mouseDidFire) {
      mouseDidFire = false;
      return;
    }
    doSquirt();
  });

  refs.squidBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    doSquirt();
  }, { passive: false });
}

main();
