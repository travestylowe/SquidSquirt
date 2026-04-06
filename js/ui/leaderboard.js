// js/ui/leaderboard.js

import { GAME } from '../constants.js';
import { isSupabaseConfigured, supabaseRpc } from '../counter/supabaseClient.js';

/** Auto-generated fun names for anonymous players. */
const ADJECTIVES = [
  'Sneaky', 'Bubbly', 'Wobbly', 'Sparkly', 'Grumpy',
  'Squishy', 'Fizzy', 'Sleepy', 'Bouncy', 'Cheeky',
  'Salty', 'Inky', 'Dizzy', 'Fluffy', 'Jazzy',
];
const NOUNS = [
  'Squid', 'Octopus', 'Narwhal', 'Jellyfish', 'Seahorse',
  'Starfish', 'Pufferfish', 'Lobster', 'Crab', 'Shrimp',
  'Dolphin', 'Manatee', 'Clam', 'Urchin', 'Anglerfish',
];

function generateFunName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

function getPlayerId() {
  let id = localStorage.getItem(GAME.PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GAME.PLAYER_ID_KEY, id);
  }
  return id;
}

function getDisplayName() {
  let name = localStorage.getItem(GAME.DISPLAY_NAME_KEY);
  if (!name) {
    name = generateFunName();
    localStorage.setItem(GAME.DISPLAY_NAME_KEY, name);
  }
  return name;
}

function setDisplayName(name) {
  const trimmed = name.trim().slice(0, 20);
  if (trimmed.length > 0) {
    localStorage.setItem(GAME.DISPLAY_NAME_KEY, trimmed);
  }
}

/**
 * Creates the leaderboard system.
 * @param {object} refs - DOM refs
 * @returns {{ sync(count: number): void }}
 */
export function createLeaderboard(refs) {
  if (!isSupabaseConfigured()) return { sync() {} };

  refs.leaderboardBtn.hidden = false;
  const playerId = getPlayerId();
  let squirtsSinceSync = 0;
  let lastSyncCount = 0;

  /* Populate name input */
  refs.leaderboardNameInput.value = getDisplayName();
  refs.leaderboardNameInput.addEventListener('change', () => {
    const val = refs.leaderboardNameInput.value.trim();
    if (val.length > 0) setDisplayName(val);
  });

  /* Toggle panel */
  function show() {
    refs.leaderboardPanel.hidden = false;
    refresh(lastSyncCount);
    requestAnimationFrame(() => refs.leaderboardNameInput.focus());
  }

  function hide() {
    refs.leaderboardPanel.hidden = true;
  }

  refs.leaderboardBtn.addEventListener('click', show);
  refs.leaderboardClose.addEventListener('click', hide);
  refs.leaderboardPanel.addEventListener('click', (e) => {
    if (e.target === refs.leaderboardPanel) hide();
  });
  refs.leaderboardPanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  async function refresh(count) {
    try {
      const [entries, rank] = await Promise.all([
        supabaseRpc('get_leaderboard', { n: 10 }),
        supabaseRpc('upsert_player_score', {
          p_player_id: playerId,
          p_display_name: getDisplayName(),
          p_squirt_count: count,
        }),
      ]);

      /* Render entries */
      refs.leaderboardList.innerHTML = '';
      for (const entry of entries) {
        const row = document.createElement('div');
        row.className = 'leaderboard-entry';
        row.innerHTML = `
          <span class="leaderboard-entry-rank">#${entry.rank}</span>
          <span class="leaderboard-entry-name">${escapeHtml(entry.display_name)}</span>
          <span class="leaderboard-entry-count">${entry.squirt_count.toLocaleString()}</span>
        `;
        refs.leaderboardList.appendChild(row);
      }

      refs.leaderboardRank.textContent = `Your rank: #${rank}`;
    } catch (err) {
      console.warn('leaderboard refresh failed:', err.message);
      refs.leaderboardList.innerHTML = '<div style="text-align:center;color:#64748b">Could not load leaderboard</div>';
      refs.leaderboardRank.textContent = '';
    }
  }

  /** Called on each squirt — syncs periodically, not every squirt. */
  function sync(count) {
    lastSyncCount = count;
    squirtsSinceSync++;
    if (squirtsSinceSync >= GAME.LEADERBOARD_SYNC_INTERVAL) {
      squirtsSinceSync = 0;
      /* Fire-and-forget background sync */
      supabaseRpc('upsert_player_score', {
        p_player_id: playerId,
        p_display_name: getDisplayName(),
        p_squirt_count: count,
      }).catch(err => { console.warn('leaderboard sync failed:', err.message); });
    }
  }

  /* Initial sync on load */
  const initialCount = parseInt(localStorage.getItem(GAME.LOCAL_STORAGE_KEY) || '0', 10);
  refresh(initialCount);

  return { sync };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
