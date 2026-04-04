import { spawnSquidConfetti } from './confetti.js';

/** Squirt-count milestones that trigger special celebrations. */
const MILESTONES = [
  { at: 100,    msg: 'Century squirt!' },
  { at: 500,    msg: 'Ink-credible!' },
  { at: 1000,   msg: 'A THOUSAND squirts!' },
  { at: 5000,   msg: 'Legendary squidder!' },
  { at: 10000,  msg: 'TEN THOUSAND!' },
  { at: 50000,  msg: 'Absolutely unhinged.' },
  { at: 100000, msg: 'You need a hobby. Oh wait\u2026' },
];

/**
 * Returns the milestone object if `count` matches a threshold, else null.
 */
export function getMilestone(count) {
  return MILESTONES.find(m => m.at === count) || null;
}

/**
 * Triple confetti burst + screen flash.
 */
export function celebrateMilestone(confettiShape) {
  /* Three staggered confetti waves */
  spawnSquidConfetti(confettiShape);
  setTimeout(() => spawnSquidConfetti(confettiShape), 300);
  setTimeout(() => spawnSquidConfetti(confettiShape), 600);

  /* Purple radial flash overlay */
  const flash = document.createElement('div');
  flash.className = 'milestone-flash';
  document.body.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());
}
