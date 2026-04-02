import { GAME } from '../constants.js';

export function createLocalCounter() {
  const key = GAME.LOCAL_STORAGE_KEY;
  return {
    load() {
      return parseInt(localStorage.getItem(key) || '0', 10) || 0;
    },
    save(n) {
      localStorage.setItem(key, String(n));
    },
  };
}
