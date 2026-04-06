// js/ui/leaderboard.js

import { GAME } from '../constants.js';
import { isSupabaseConfigured, supabaseRpc } from '../counter/supabaseClient.js';

/** Auto-generated fun names for anonymous players. */
const ADJECTIVES = [
  'Unhinged', 'Soggy', 'Feral', 'Suspiciously Moist', 'Chaotic',
  'Deeply Confused', 'Ominous', 'Slightly Damp', 'Rogue', 'Forbidden',
  'Sentient', 'Aggressively Calm', 'Haunted', 'Unsanctioned', 'Furtive',
  'Turbulent', 'Inexplicable', 'Boneless', 'Questionable', 'Eldritch',
];
const NOUNS = [
  'Tentacle Enthusiast', 'Ink Goblin', 'Sea Gremlin', 'Blob',
  'Bottom Feeder', 'Abyss Dweller', 'Kelp Hooligan', 'Barnacle',
  'Tide Pool Goon', 'Plankton Wrangler', 'Suction Cup', 'Sea Pudding',
  'Brine Shrimp', 'Coral Bandit', 'Siphon', 'Deep Sea Cryptid',
  'Mollusk', 'Trench Lurker', 'Sea Cucumber Stan', 'Algae Sommelier',
];

function generateFunName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  /* Append short random suffix to virtually eliminate collisions */
  const tag = Math.floor(Math.random() * 9000 + 1000); /* 1000–9999 */
  return `${adj} ${noun} #${tag}`;
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
  const trimmed = name.trim().slice(0, 50);
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

  /* ── Panel open / close (bind FIRST so they always work) ── */

  function show() {
    refs.leaderboardPanel.hidden = false;
    refresh(lastSyncCount);
    requestAnimationFrame(() => refs.leaderboardNameInput.focus());
  }

  function hide() {
    refs.leaderboardPanel.hidden = true;
  }

  refs.leaderboardBtn.addEventListener('click', show);
  refs.leaderboardClose.addEventListener('click', (e) => {
    e.stopPropagation();
    hide();
  });
  refs.leaderboardPanel.addEventListener('click', (e) => {
    if (e.target === refs.leaderboardPanel) hide();
  });
  refs.leaderboardPanel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  /* ── Name input ── */

  refs.leaderboardNameInput.value = getDisplayName();

  async function saveName() {
    const val = refs.leaderboardNameInput.value.trim();
    if (val.length === 0 || val === getDisplayName()) return;

    refs.leaderboardNameSave.disabled = true;
    refs.leaderboardNameSave.textContent = '...';

    try {
      const rank = await supabaseRpc('upsert_player_score', {
        p_player_id: playerId,
        p_display_name: val,
        p_squirt_count: lastSyncCount,
      });
      if (rank === -1) {
        refs.leaderboardRank.textContent = 'That name is taken!';
        refs.leaderboardNameInput.value = getDisplayName();
      } else {
        setDisplayName(val);
        refs.leaderboardRank.textContent = `Your rank: #${rank}`;
      }
    } catch (err) {
      console.warn('name change failed:', err.message);
      refs.leaderboardNameInput.value = getDisplayName();
    }

    refs.leaderboardNameSave.disabled = false;
    refs.leaderboardNameSave.textContent = 'Save';
  }

  refs.leaderboardNameSave.addEventListener('click', saveName);
  refs.leaderboardNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveName();
  });

  async function refresh(count) {
    try {
      const entries = await supabaseRpc('get_leaderboard', { n: 10 });
      let rank = await supabaseRpc('upsert_player_score', {
        p_player_id: playerId,
        p_display_name: getDisplayName(),
        p_squirt_count: count,
      });

      /* If auto-generated name collided, regenerate and retry */
      if (rank === -1) {
        const newName = generateFunName();
        localStorage.setItem(GAME.DISPLAY_NAME_KEY, newName);
        refs.leaderboardNameInput.value = newName;
        rank = await supabaseRpc('upsert_player_score', {
          p_player_id: playerId,
          p_display_name: newName,
          p_squirt_count: count,
        });
      }

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

      refs.leaderboardRank.textContent = rank > 0 ? `Your rank: #${rank}` : '';
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

  /* ── Recovery code UI ── */

  refs.recoveryToggle.addEventListener('click', () => {
    const showing = !refs.recoveryContent.hidden;
    refs.recoveryContent.hidden = showing;
    refs.recoveryToggle.textContent = showing ? 'Transfer Account' : 'Hide Transfer';
  });

  refs.recoveryShowBtn.addEventListener('click', () => {
    refs.recoveryCodeDisplay.textContent = uuidToCode(playerId);
    refs.recoveryShowBtn.hidden = true;
  });

  refs.recoveryInput.addEventListener('input', () => {
    refs.recoveryApplyBtn.disabled = refs.recoveryInput.value.trim().length < 10;
    refs.recoveryStatus.textContent = '';
    refs.recoveryStatus.className = 'recovery-status';
  });

  refs.recoveryApplyBtn.addEventListener('click', async () => {
    const code = refs.recoveryInput.value.trim();
    const recoveredId = codeToUuid(code);

    if (!recoveredId) {
      refs.recoveryStatus.textContent = 'Invalid code — check and try again';
      refs.recoveryStatus.className = 'recovery-status error';
      return;
    }

    refs.recoveryApplyBtn.disabled = true;
    refs.recoveryStatus.textContent = 'Recovering...';
    refs.recoveryStatus.className = 'recovery-status';

    /* Verify this player_id exists on the server */
    try {
      const rows = await supabaseRpc('get_player_by_id', { p_player_id: recoveredId });
      if (!rows || (Array.isArray(rows) && rows.length === 0) || rows.display_name == null) {
        refs.recoveryStatus.textContent = 'No account found for this code';
        refs.recoveryStatus.className = 'recovery-status error';
        refs.recoveryApplyBtn.disabled = false;
        return;
      }

      const recovered = Array.isArray(rows) ? rows[0] : rows;

      /* Adopt the recovered identity */
      localStorage.setItem(GAME.PLAYER_ID_KEY, recoveredId);
      localStorage.setItem(GAME.DISPLAY_NAME_KEY, recovered.display_name);
      localStorage.setItem(GAME.LOCAL_STORAGE_KEY, String(recovered.squirt_count));

      refs.recoveryStatus.textContent = `Welcome back, ${recovered.display_name}!`;
      refs.recoveryStatus.className = 'recovery-status success';
      refs.leaderboardNameInput.value = recovered.display_name;

      /* Reload to rebind everything with new identity */
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      console.warn('recovery failed:', err.message);
      refs.recoveryStatus.textContent = 'Recovery failed — try again';
      refs.recoveryStatus.className = 'recovery-status error';
      refs.recoveryApplyBtn.disabled = false;
    }
  });

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

/* ── Recovery code: word-encoded player UUID ── */

const CODE_WORDS = [
  'SQUID',  'INK',    'REEF',   'TIDE',   'KELP',   'PEARL',  'CORAL',  'WAVE',
  'SHELL',  'DRIFT',  'FOAM',   'SALT',   'DEEP',   'GLOW',   'FINS',   'ABYSS',
];

/**
 * Encode a UUID into a memorable word code.
 * Strips hyphens, splits hex into 4-bit nibbles, maps each to a word.
 * 32 hex chars = 32 words, grouped in blocks of 4 separated by dashes.
 */
function uuidToCode(uuid) {
  const hex = uuid.replace(/-/g, '');
  const words = [];
  for (let i = 0; i < hex.length; i++) {
    words.push(CODE_WORDS[parseInt(hex[i], 16)]);
  }
  /* Group into blocks of 4 for readability */
  const blocks = [];
  for (let i = 0; i < words.length; i += 4) {
    blocks.push(words.slice(i, i + 4).join('-'));
  }
  return blocks.join(' ');
}

/**
 * Decode a word code back into a UUID.
 * Returns null if the code is invalid.
 */
function codeToUuid(code) {
  const words = code.toUpperCase().replace(/[^A-Z]/g, ' ').trim().split(/\s+/);
  /* Flatten any dash-separated groups */
  const flat = [];
  for (const w of words) {
    for (const part of w.split('-')) {
      if (part) flat.push(part);
    }
  }
  if (flat.length !== 32) return null;

  let hex = '';
  for (const w of flat) {
    const idx = CODE_WORDS.indexOf(w);
    if (idx === -1) return null;
    hex += idx.toString(16);
  }
  /* Reconstruct UUID format: 8-4-4-4-12 */
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
