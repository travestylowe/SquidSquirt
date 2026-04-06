import { GAME } from '../constants.js';

/**
 * Confetti shape definitions.  Each provides an SVG-generating function
 * that replaces the default mini-squid confetti.  The function receives
 * a random hue for color variation.
 */

const CONFETTI_SHAPES = [
  {
    id: 'conf-stars',
    name: 'Stars',
    unlock: GAME.CONFETTI_THRESHOLDS[0],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
        <polygon points="16,2 20,12 30,12 22,19 25,30 16,23 7,30 10,19 2,12 12,12"
                 fill="hsl(${h},75%,55%)" stroke="hsl(${h},60%,40%)" stroke-width="1"/>
      </svg>`;
    },
  },
  {
    id: 'conf-hearts',
    name: 'Hearts',
    unlock: GAME.CONFETTI_THRESHOLDS[1],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
        <path d="M16 28 C10 22 2 17 2 10 C2 5 6 2 10 2 C13 2 15 4 16 6 C17 4 19 2 22 2 C26 2 30 5 30 10 C30 17 22 22 16 28Z"
              fill="hsl(${h},70%,55%)" stroke="hsl(${h},55%,40%)" stroke-width="1"/>
      </svg>`;
    },
  },
  {
    id: 'conf-fish',
    name: 'Fish',
    unlock: GAME.CONFETTI_THRESHOLDS[2],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg" width="34" height="24" aria-hidden="true">
        <ellipse cx="22" cy="14" rx="14" ry="10" fill="hsl(${h},65%,50%)"/>
        <polygon points="8,14 0,4 0,24" fill="hsl(${h},60%,45%)"/>
        <circle cx="28" cy="11" r="2.5" fill="#fff"/>
        <circle cx="29" cy="11" r="1.2" fill="#160030"/>
      </svg>`;
    },
  },
  {
    id: 'conf-anchors',
    name: 'Anchors',
    unlock: GAME.CONFETTI_THRESHOLDS[3],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 28 34" xmlns="http://www.w3.org/2000/svg" width="24" height="30" aria-hidden="true">
        <circle cx="14" cy="5" r="4" fill="none" stroke="hsl(${h},55%,45%)" stroke-width="2.5"/>
        <line x1="14" y1="9" x2="14" y2="30" stroke="hsl(${h},55%,45%)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="6" y1="20" x2="22" y2="20" stroke="hsl(${h},55%,45%)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M6 28 Q6 24 14 24 Q22 24 22 28" fill="none" stroke="hsl(${h},55%,45%)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
    },
  },
  {
    id: 'conf-bow',
    name: 'Bow & Arrow',
    unlock: GAME.CONFETTI_THRESHOLDS[4],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
        <path d="M8 4 Q2 16 8 28" fill="none" stroke="hsl(${h},65%,45%)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="8" y1="4" x2="8" y2="28" stroke="hsl(${h},55%,38%)" stroke-width="1.5"/>
        <line x1="8" y1="16" x2="30" y2="6" stroke="hsl(${h},60%,42%)" stroke-width="2" stroke-linecap="round"/>
        <polygon points="30,6 24,5 26,10" fill="hsl(${h},70%,50%)"/>
        <line x1="10" y1="15" x2="13" y2="17" stroke="hsl(${h},50%,38%)" stroke-width="1"/>
        <line x1="10" y1="17" x2="13" y2="15" stroke="hsl(${h},50%,38%)" stroke-width="1"/>
      </svg>`;
    },
  },
  {
    id: 'conf-tentacles',
    name: 'Tentacles',
    unlock: GAME.CONFETTI_THRESHOLDS[5],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 36" xmlns="http://www.w3.org/2000/svg" width="28" height="32" aria-hidden="true">
        <path d="M8 4 Q6 16 10 28 Q12 34 8 36" stroke="hsl(${h},62%,48%)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M16 2 Q14 14 16 26 Q18 34 14 36" stroke="hsl(${h},58%,42%)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M24 4 Q26 16 22 28 Q20 34 24 36" stroke="hsl(${h},62%,48%)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="10" cy="30" r="2" fill="hsl(${h},55%,38%)"/>
        <circle cx="16" cy="28" r="2" fill="hsl(${h},55%,38%)"/>
        <circle cx="22" cy="30" r="2" fill="hsl(${h},55%,38%)"/>
      </svg>`;
    },
  },
];

export function getConfettiUnlocks() {
  return CONFETTI_SHAPES;
}
