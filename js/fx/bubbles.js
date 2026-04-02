import { GAME } from '../constants.js';

export function spawnAmbientBubbles() {
  for (let i = 0; i < GAME.BUBBLE_COUNT; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 4 + Math.random() * 18;
    b.style.cssText = [
      `width: ${size}px`,
      `height: ${size}px`,
      `left: ${Math.random() * 100}%`,
      `bottom: -${size}px`,
      `animation-duration: ${9 + Math.random() * 14}s`,
      `animation-delay: ${Math.random() * -22}s`,
    ].join('; ');
    document.body.appendChild(b);
  }
}
