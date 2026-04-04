import { GAME } from '../constants.js';

/**
 * Unlock reveal bubble.  Floats up from the squid, wobbling gently.
 * Player clicks/taps to pop it and see the item name.
 * If ignored, settles near the top and bobs until clicked.
 */

/** Track active bubbles so we can stagger horizontally. */
const activeBubbles = new Set();

/**
 * Returns a preview element for the unlocked item.
 */
function buildPreview(item) {
  const el = document.createElement('span');
  el.className = 'unlock-bubble-preview';
  el.setAttribute('aria-hidden', 'true');

  if (item.emojis) {
    /* Emoji pack — show first emoji */
    el.textContent = item.emojis[0];
    el.style.fontSize = '1.8rem';
  } else if (item.hue !== undefined) {
    /* Ink color — colored circle */
    el.style.width = '28px';
    el.style.height = '28px';
    el.style.borderRadius = '50%';
    el.style.display = 'inline-block';
    if (item.hue === null) {
      /* Rainbow — conic gradient */
      el.style.background = 'conic-gradient(hsl(0,75%,55%),hsl(60,75%,55%),hsl(130,75%,55%),hsl(210,75%,55%),hsl(290,75%,55%),hsl(0,75%,55%))';
    } else {
      el.style.background = `hsl(${item.hue}, 70%, 52%)`;
    }
  } else if (item.hues) {
    /* Sprinkle — multi-dot row */
    el.style.display = 'flex';
    el.style.gap = '3px';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    const showHues = item.hues.length > 4 ? item.hues.slice(0, 5) : item.hues;
    for (const h of showHues) {
      const dot = document.createElement('span');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = `hsl(${h}, 70%, 52%)`;
      el.appendChild(dot);
    }
  } else if (item.svg) {
    /* Confetti shape — render mini SVG */
    const wrapper = document.createElement('span');
    wrapper.innerHTML = item.svg(260);
    const svg = wrapper.firstElementChild;
    if (svg) {
      svg.setAttribute('width', '28');
      svg.setAttribute('height', '28');
      svg.style.display = 'block';
    }
    el.appendChild(svg || wrapper);
  } else {
    el.textContent = '\u{2753}';
    el.style.fontSize = '1.6rem';
  }

  return el;
}

/**
 * Spawn a floating unlock bubble from the given origin.
 *
 * @param {object} item - the unlock definition (ink, sprinkle, emoji, or confetti)
 * @param {number} originX - spawn x (center)
 * @param {number} originY - spawn y (center)
 */
export function spawnUnlockBubble(item, originX, originY) {
  const bubble = document.createElement('button');
  bubble.className = 'unlock-bubble';
  bubble.setAttribute('aria-label', `Pop to reveal: ${item.name || item.revealName || 'mystery unlock'}`);

  /* Inner content wrapper */
  const inner = document.createElement('div');
  inner.className = 'unlock-bubble-inner';
  inner.appendChild(buildPreview(item));
  bubble.appendChild(inner);

  document.body.appendChild(bubble);
  activeBubbles.add(bubble);

  /* Position at origin */
  let x = originX;
  let y = originY;
  const size = GAME.BUBBLE_SIZE;
  let frame = 0;
  let settled = false;
  let popped = false;

  /* Offset horizontally if other bubbles are active */
  const idx = activeBubbles.size - 1;
  const offsetX = (idx % 2 === 0 ? 1 : -1) * Math.ceil(idx / 2) * (size * 0.8);

  bubble.style.width = size + 'px';
  bubble.style.height = size + 'px';

  function position() {
    bubble.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
  }

  position();

  /* Animation loop */
  function tick() {
    if (popped) return;
    frame++;

    if (!settled) {
      /* Float upward */
      y -= GAME.BUBBLE_FLOAT_SPEED;
      /* Wobble */
      x = originX + offsetX + Math.sin(frame * GAME.BUBBLE_WOBBLE_FREQ) * GAME.BUBBLE_WOBBLE_AMP;

      /* Settle near top */
      if (y <= GAME.BUBBLE_SETTLE_Y) {
        y = GAME.BUBBLE_SETTLE_Y;
        settled = true;
        bubble.classList.add('settled');
      }
    } else {
      /* Gentle bob when settled */
      y = GAME.BUBBLE_SETTLE_Y + Math.sin(frame * 0.03) * 5;
      x = originX + offsetX + Math.sin(frame * 0.015) * 8;
    }

    position();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  /* Pop handler */
  function pop() {
    if (popped) return;
    popped = true;
    activeBubbles.delete(bubble);

    bubble.classList.add('popping');

    /* Spawn burst particles */
    spawnPopParticles(x, y);

    /* Show item name */
    const nameEl = document.createElement('div');
    nameEl.className = 'unlock-bubble-name';
    nameEl.textContent = item.revealName || item.name;
    nameEl.style.left = x + 'px';
    nameEl.style.top = (y - size / 2 - 8) + 'px';
    document.body.appendChild(nameEl);

    setTimeout(() => nameEl.remove(), GAME.BUBBLE_NAME_DURATION_MS);

    /* Remove bubble after pop animation */
    bubble.addEventListener('animationend', () => bubble.remove());
  }

  bubble.addEventListener('click', pop);
  bubble.addEventListener('touchend', (e) => {
    e.preventDefault();
    pop();
  });
}

/**
 * Spawn staggered bubbles for an array of unlocked items.
 *
 * @param {Array} items - array of unlock definitions
 * @param {number} originX - spawn x
 * @param {number} originY - spawn y
 */
export function spawnUnlockBubbles(items, originX, originY) {
  items.forEach((item, i) => {
    setTimeout(() => spawnUnlockBubble(item, originX, originY), i * GAME.BUBBLE_STAGGER_MS);
  });
}

/** Small translucent circles that burst outward on pop. */
function spawnPopParticles(cx, cy) {
  const COUNT = 8;

  for (let i = 0; i < COUNT; i++) {
    const particle = document.createElement('div');
    particle.className = 'unlock-pop-particle';

    const angle = (Math.PI * 2 * i) / COUNT;
    const dist = 30 + Math.random() * 25;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    particle.style.left = cx + 'px';
    particle.style.top = cy + 'px';
    particle.style.setProperty('--dx', dx + 'px');
    particle.style.setProperty('--dy', dy + 'px');

    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}
