import { GAME } from '../constants.js';

/**
 * Mute/unmute button wired to localStorage.
 * Returns { isMuted } so the squirt handler can skip audio.
 */
export function createSoundToggle(btnEl) {
  let muted = localStorage.getItem(GAME.SOUND_MUTED_KEY) === '1';

  function updateBtn() {
    btnEl.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    btnEl.classList.toggle('muted', muted);
  }

  updateBtn();

  btnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    muted = !muted;
    localStorage.setItem(GAME.SOUND_MUTED_KEY, muted ? '1' : '0');
    updateBtn();
  });

  return { isMuted: () => muted };
}
