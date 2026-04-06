import { GAME } from '../constants.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Library of hats.  Every hat is always available for random rotation.
 * The unlock system lets the player PIN a favourite; otherwise a random
 * hat is chosen each time the squid surfaces.
 */
const HATS = [
  /* ── Always available for random ── */
  {
    id: 'party-hat', name: 'Party Hat', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <polygon points="0,-45 -18,0 18,0" fill="#f43f5e" stroke="#be123c" stroke-width="1.5"/>
      <line x1="-12" y1="-15" x2="12" y2="-15" stroke="#fbbf24" stroke-width="2"/>
      <line x1="-8" y1="-30" x2="8" y2="-30" stroke="#34d399" stroke-width="2"/>
      <circle cx="0" cy="-45" r="5" fill="#fbbf24"/>
    </g>`,
  },
  {
    id: 'beanie', name: 'Beanie', unlock: 0,
    svg: `<g transform="translate(200,20)">
      <path d="M-28,0 Q-30,-22 0,-28 Q30,-22 28,0" fill="#3b82f6"/>
      <rect x="-30" y="-4" width="60" height="8" rx="4" fill="#1d4ed8"/>
      <circle cx="0" cy="-28" r="5" fill="#ef4444"/>
    </g>`,
  },
  {
    id: 'baseball-cap', name: 'Baseball Cap', unlock: 0,
    svg: `<g transform="translate(200,20)">
      <path d="M-26,0 Q-26,-20 0,-24 Q26,-20 26,0" fill="#dc2626"/>
      <rect x="-28" y="-3" width="56" height="6" rx="3" fill="#b91c1c"/>
      <ellipse cx="22" cy="2" rx="18" ry="5" fill="#b91c1c"/>
    </g>`,
  },
  {
    id: 'flower-crown', name: 'Flower Crown', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <path d="M-30,0 Q-20,-12 0,-14 Q20,-12 30,0" fill="none" stroke="#16a34a" stroke-width="3"/>
      <circle cx="-20" cy="-8" r="6" fill="#f472b6"/>
      <circle cx="-8"  cy="-13" r="5" fill="#fbbf24"/>
      <circle cx="5"   cy="-14" r="6" fill="#a78bfa"/>
      <circle cx="17"  cy="-10" r="5" fill="#fb923c"/>
    </g>`,
  },
  {
    id: 'chef-hat', name: 'Chef Hat', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <rect x="-22" y="-8" width="44" height="10" rx="2" fill="#e2e8f0"/>
      <path d="M-20,-8 Q-24,-40 0,-44 Q24,-40 20,-8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>
    </g>`,
  },
  {
    id: 'cowboy-hat', name: 'Cowboy Hat', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <ellipse cx="0" cy="2" rx="42" ry="8" fill="#92400e"/>
      <path d="M-24,0 Q-18,-30 0,-34 Q18,-30 24,0" fill="#b45309" stroke="#78350f" stroke-width="1"/>
      <rect x="-20" y="-6" width="40" height="4" rx="1" fill="#fbbf24"/>
    </g>`,
  },
  {
    id: 'beret', name: 'Beret', unlock: 0,
    svg: `<g transform="translate(200,20)">
      <ellipse cx="0" cy="0" rx="30" ry="8" fill="#1e293b"/>
      <path d="M-28,0 Q-32,-18 -5,-22 Q18,-20 28,-2" fill="#1e293b"/>
      <circle cx="-2" cy="-22" r="4" fill="#1e293b"/>
    </g>`,
  },
  {
    id: 'propeller-hat', name: 'Propeller Hat', unlock: 0,
    svg: `<g transform="translate(200,20)">
      <path d="M-26,0 Q-26,-18 0,-22 Q26,-18 26,0" fill="#f59e0b"/>
      <rect x="-28" y="-3" width="56" height="6" rx="3" fill="#d97706"/>
      <line x1="-14" y1="-25" x2="14" y2="-25" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
      <circle cx="0" cy="-25" r="3" fill="#ef4444"/>
    </g>`,
  },
  {
    id: 'santa-hat', name: 'Santa Hat', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <rect x="-28" y="-4" width="56" height="8" rx="4" fill="#fef3c7"/>
      <path d="M-24,0 Q-10,-38 20,-44" fill="#dc2626" stroke="#b91c1c" stroke-width="0.8"/>
      <path d="M24,0 Q10,-30 20,-44" fill="#dc2626"/>
      <circle cx="20" cy="-44" r="7" fill="#fef3c7"/>
    </g>`,
  },
  {
    id: 'hard-hat', name: 'Hard Hat', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <path d="M-30,0 Q-30,-26 0,-30 Q30,-26 30,0" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
      <rect x="-32" y="-2" width="64" height="5" rx="2.5" fill="#d97706"/>
    </g>`,
  },
  {
    id: 'headband', name: 'Headband', unlock: 0,
    svg: `<g transform="translate(200,22)">
      <path d="M-30,2 Q-28,-8 0,-12 Q28,-8 30,2" fill="none" stroke="#e11d48" stroke-width="5" stroke-linecap="round"/>
    </g>`,
  },
  {
    id: 'viking-helmet', name: 'Viking Helmet', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <path d="M-28,0 Q-28,-22 0,-26 Q28,-22 28,0" fill="#6b7280" stroke="#4b5563" stroke-width="1"/>
      <rect x="-30" y="-3" width="60" height="6" rx="3" fill="#9ca3af"/>
      <path d="M-28,-8 Q-38,-28 -30,-42" fill="none" stroke="#fef3c7" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M28,-8 Q38,-28 30,-42" fill="none" stroke="#fef3c7" stroke-width="3.5" stroke-linecap="round"/>
    </g>`,
  },
  {
    id: 'fez', name: 'Fez', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <path d="M-18,0 L-14,-28 L14,-28 L18,0" fill="#dc2626"/>
      <rect x="-20" y="-2" width="40" height="5" rx="2" fill="#b91c1c"/>
      <line x1="0" y1="-28" x2="6" y2="-20" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="6" cy="-18" r="3" fill="#1e293b"/>
    </g>`,
  },
  {
    id: 'bucket-hat', name: 'Bucket Hat', unlock: 0,
    svg: `<g transform="translate(200,18)">
      <path d="M-20,0 L-16,-24 L16,-24 L20,0" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
      <ellipse cx="0" cy="2" rx="34" ry="6" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
    </g>`,
  },
  {
    id: 'tiny-bow', name: 'Tiny Bow', unlock: 0,
    svg: `<g transform="translate(200,16)">
      <polygon points="-16,-7 0,0 -16,7" fill="#f472b6"/>
      <polygon points="16,-7 0,0 16,7"   fill="#f472b6"/>
      <circle cx="0" cy="0" r="3.5" fill="#ec4899"/>
    </g>`,
  },

  /* ── Unlockable specials (still appear in random rotation once unlocked) ── */
  {
    id: 'crown', name: 'Crown', unlock: 200,
    svg: `<g transform="translate(200,20)">
      <polygon points="-24,0 -24,-20 -15,-11 -7,-24 0,-9 7,-24 15,-11 24,-20 24,0"
               fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
      <circle cx="-10" cy="-6" r="2.5" fill="#e11d48"/>
      <circle cx="0"   cy="-6" r="2.5" fill="#2563eb"/>
      <circle cx="10"  cy="-6" r="2.5" fill="#16a34a"/>
    </g>`,
  },
  {
    id: 'pirate-hat', name: 'Pirate Hat', unlock: 1000,
    svg: `<g transform="translate(200,18)">
      <ellipse cx="0" cy="0" rx="40" ry="9" fill="#1e293b"/>
      <path d="M-34,-5 Q-22,-42 0,-46 Q22,-42 34,-5" fill="#1e293b" stroke="#475569" stroke-width="1"/>
      <circle cx="0" cy="-24" r="7" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>
      <line x1="-4" y1="-28" x2="4" y2="-20" stroke="#e2e8f0" stroke-width="1.5"/>
      <line x1="4"  y1="-28" x2="-4" y2="-20" stroke="#e2e8f0" stroke-width="1.5"/>
    </g>`,
  },
  {
    id: 'top-hat', name: 'Top Hat', unlock: 2500,
    svg: `<g transform="translate(200,18)">
      <rect x="-22" y="-48" width="44" height="48" rx="4" fill="#0f172a" stroke="#475569" stroke-width="0.8"/>
      <ellipse cx="0" cy="0" rx="34" ry="8" fill="#0f172a" stroke="#475569" stroke-width="0.8"/>
      <rect x="-22" y="-14" width="44" height="5" rx="1" fill="#7c3aed"/>
    </g>`,
  },
  {
    id: 'wizard-hat', name: 'Wizard Hat', unlock: 5000,
    svg: `<g transform="translate(200,18)">
      <!-- Glow aura -->
      <ellipse cx="0" cy="-20" rx="50" ry="55" fill="url(#wizardGlow)" class="wizard-glow"/>
      <!-- Brim — wide storybook style -->
      <ellipse cx="0" cy="0" rx="42" ry="10" fill="#4c1d95" stroke="#7c3aed" stroke-width="0.8"/>
      <!-- Cone — slightly curved with gentle tip curl -->
      <path d="M-30,0 Q-18,-40 -4,-68 Q0,-72 4,-68 Q18,-40 30,0 Z" fill="#5b21b6" stroke="#7c3aed" stroke-width="1"/>
      <!-- Buckle band -->
      <rect x="-30" y="-4" width="60" height="7" rx="2" fill="#7c3aed" opacity="0.6"/>
      <rect x="-5" y="-5" width="10" height="9" rx="1.5" fill="#fbbf24" stroke="#f59e0b" stroke-width="0.6"/>
      <!-- Crescent moon (left side) -->
      <g transform="translate(-12,-36)">
        <circle cx="0" cy="0" r="5" fill="#fbbf24"/>
        <circle cx="2" cy="-1" r="4" fill="#5b21b6"/>
      </g>
      <!-- Shooting star (right side) -->
      <g transform="translate(12,-48)">
        <polygon points="0,-3 1.5,0 4,0 2,2 3,5 0,3 -3,5 -2,2 -4,0 -1.5,0" fill="#fbbf24" transform="scale(0.8)"/>
        <line x1="4" y1="0" x2="14" y2="4" stroke="#fbbf24" stroke-width="0.8" opacity="0.7" stroke-linecap="round"/>
        <line x1="4" y1="-1" x2="12" y2="1" stroke="#fbbf24" stroke-width="0.6" opacity="0.5" stroke-linecap="round"/>
        <line x1="3" y1="1" x2="11" y2="5" stroke="#fbbf24" stroke-width="0.5" opacity="0.4" stroke-linecap="round"/>
      </g>
    </g>`,
  },
];

/** Hats available for random rotation (unlocked ones only). */
function availableHats(count) {
  return HATS.filter(h => h.svg && count >= h.unlock);
}

/**
 * Manages the hat overlay inside the squid SVG and the random rotation on
 * each surface.  Panel building is delegated to the tabbed unlock picker.
 */
export function createAccessorySystem(svgBodyEl, totalCount) {
  let pinned = localStorage.getItem(GAME.ACCESSORY_KEY) || 'random';
  let currentCount = totalCount;
  let lastRandomIdx = -1;

  const accGroup = document.createElementNS(SVG_NS, 'g');
  accGroup.id = 'squid-accessories';
  const kids = svgBodyEl.children;
  if (kids.length > 4) {
    svgBodyEl.insertBefore(accGroup, kids[4]);
  } else {
    svgBodyEl.appendChild(accGroup);
  }

  function renderHat(hat) {
    accGroup.innerHTML = '';
    if (hat && hat.svg) accGroup.innerHTML = hat.svg;
  }

  function pickRandomHat() {
    const pool = availableHats(currentCount);
    if (pool.length === 0) return null;
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); }
    while (idx === lastRandomIdx && pool.length > 1);
    lastRandomIdx = idx;
    return pool[idx];
  }

  function applyHat() {
    if (pinned === 'random') {
      renderHat(pickRandomHat());
    } else {
      const hat = HATS.find(h => h.id === pinned);
      if (hat && currentCount >= hat.unlock) {
        renderHat(hat);
      } else {
        renderHat(pickRandomHat());
      }
    }
  }

  /**
   * Build hat options into an external container (called by unlock-picker).
   */
  function buildHatsContent(container) {
    container.innerHTML = '';

    /* "Random" option */
    const randBtn = document.createElement('button');
    randBtn.className = 'accessory-option';
    randBtn.classList.toggle('selected', pinned === 'random');
    randBtn.textContent = 'Random (surprise me)';
    randBtn.addEventListener('click', () => {
      pinned = 'random';
      localStorage.setItem(GAME.ACCESSORY_KEY, pinned);
      applyHat();
      buildHatsContent(container);
    });
    container.appendChild(randBtn);

    for (const hat of HATS) {
      if (!hat.svg) continue;
      const btn = document.createElement('button');
      btn.className = 'accessory-option';
      const locked = currentCount < hat.unlock;
      btn.disabled = locked;
      btn.classList.toggle('locked', locked);
      btn.classList.toggle('selected', pinned === hat.id);

      btn.textContent = locked
        ? `${hat.name} (${hat.unlock.toLocaleString()} squirts)`
        : hat.name;

      btn.addEventListener('click', () => {
        pinned = hat.id;
        localStorage.setItem(GAME.ACCESSORY_KEY, pinned);
        applyHat();
        container.innerHTML = '';
        buildHatsContent(container);
      });
      container.appendChild(btn);
    }
  }

  applyHat();

  return {
    updateCount(n) { currentCount = n; },
    onSurface() { applyHat(); },
    buildHatsContent,
  };
}
