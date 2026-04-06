import { GAME } from '../constants.js';

/**
 * Floating speech-bubble hints that drift upward like real bubbles.
 *
 * Taunts appear after idle; thank-you puns appear after each squirt.
 * The static #hint element is only used for the initial "squeeze me" prompt.
 */
export function createHints(hintEl, taunts, thanks) {
  let tauntIdleTimer = null;
  let tauntRotateTimer = null;
  let lastPunIndex = -1;
  let lastThankYouIndex = -1;
  let ariaLiveTimer = null;
  const ARIA_LIVE_DEBOUNCE_MS = 800; /* prevent screen reader flooding on rapid clicks */

  /** Returns the squid's current screen-centre position. */
  function squidPos() {
    const wrap = document.getElementById('squid-wrap');
    if (!wrap) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    const x = parseFloat(wrap.style.left) || window.innerWidth * 0.5;
    const y = parseFloat(wrap.style.top) || window.innerHeight * 0.5;
    return { x, y };
  }

  /**
   * Spawn a floating speech bubble near the squid that drifts upward and fades.
   * `extraClass` adds styling variants (e.g. 'bubble--taunt', 'bubble--thanks').
   * Also pipes the text into the aria-live #hint region for screen readers.
   */
  function spawnBubble(text, extraClass) {
    const bubble = document.createElement('div');
    bubble.className = `speech-bubble ${extraClass || ''}`;
    bubble.textContent = text;
    document.body.appendChild(bubble);

    const pos = squidPos();
    /* Offset slightly above and randomly left/right of the squid */
    const offsetX = (Math.random() - 0.5) * 80;
    bubble.style.left = `${pos.x + offsetX}px`;
    bubble.style.top = `${pos.y - 60}px`;

    bubble.addEventListener('animationend', () => bubble.remove());

    /* Announce to screen readers via the existing aria-live region.
       Debounced so rapid clicks don't flood the announcement queue.
       Milestone messages bypass debounce (set via priority flag). */
    if (ariaLiveTimer) clearTimeout(ariaLiveTimer);
    if (extraClass === 'bubble--milestone') {
      hintEl.textContent = text;
    } else {
      ariaLiveTimer = setTimeout(() => { hintEl.textContent = text; }, ARIA_LIVE_DEBOUNCE_MS);
    }
  }

  function clearTauntTimers() {
    if (tauntIdleTimer) { clearTimeout(tauntIdleTimer); tauntIdleTimer = null; }
    if (tauntRotateTimer) { clearInterval(tauntRotateTimer); tauntRotateTimer = null; }
  }

  function pickTauntPun() {
    let i;
    do { i = Math.floor(Math.random() * taunts.length); }
    while (i === lastPunIndex && taunts.length > 1);
    lastPunIndex = i;
    return taunts[i];
  }

  function pickThankYouPun() {
    let i;
    do { i = Math.floor(Math.random() * thanks.length); }
    while (i === lastThankYouIndex && thanks.length > 1);
    lastThankYouIndex = i;
    return thanks[i];
  }

  function showTauntPun() {
    hideStaticHint();
    spawnBubble(pickTauntPun(), 'bubble--taunt');
  }

  function scheduleTauntAfterIdle() {
    clearTauntTimers();
    tauntIdleTimer = setTimeout(() => {
      showTauntPun();
      tauntRotateTimer = setInterval(showTauntPun, GAME.TAUNT_ROTATE_MS);
    }, GAME.TAUNT_IDLE_MS);
  }

  function showThankYouPun() {
    clearTauntTimers();
    spawnBubble(pickThankYouPun(), 'bubble--thanks');
    scheduleTauntAfterIdle();
  }

  function showMilestoneMsg(msg) {
    clearTauntTimers();
    spawnBubble(msg, 'bubble--milestone');
    scheduleTauntAfterIdle();
  }

  /* Visually hide the static hint after the first squirt, but keep it in the
     accessibility tree so the aria-live region continues to announce updates. */
  function hideStaticHint() {
    hintEl.classList.add('visually-hidden');
  }

  return {
    scheduleTauntAfterIdle,
    showThankYouPun() {
      hideStaticHint();
      showThankYouPun();
    },
    showMilestoneMsg(msg) {
      hideStaticHint();
      showMilestoneMsg(msg);
    },
  };
}
