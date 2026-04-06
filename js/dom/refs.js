/**
 * Single place for DOM lookups (IDs used by index.html).
 */
export function getDomRefs() {
  return {
    canvas: document.getElementById('ink-canvas'),
    counter: document.getElementById('counter'),
    globalCounter: document.getElementById('global-counter'),
    hint: document.getElementById('hint'),
    squidBtn: document.getElementById('squid-btn'),
    squidWrap: document.getElementById('squid-wrap'),
    squidSvg: document.getElementById('squid-svg'),
    squidBody: document.getElementById('squid-body'),
    pupilL: document.getElementById('pupil-left'),
    pupilR: document.getElementById('pupil-right'),
    blushL: document.getElementById('blush-left'),
    blushR: document.getElementById('blush-right'),
    squidCollar: document.getElementById('squid-collar'),
    squidArms: document.getElementById('squid-arms'),
    squidFeeders: document.getElementById('squid-feeders'),
    squidClubDots: document.getElementById('squid-club-dots'),
    squidSiphon: document.getElementById('squid-siphon'),
    squidSiphonMouth: document.getElementById('squid-siphon-mouth'),
    bodyGradStops: document.querySelectorAll('#bodyGrad stop'),
    eyeGradStops: document.querySelectorAll('#eyeGrad stop'),
    finGradStops: document.querySelectorAll('#finGrad stop'),
    squidEyeOutlines: document.querySelectorAll('.squid-eye-outline'),
    squidClubs: document.querySelectorAll('.squid-club'),
    muteBtn: document.getElementById('mute-btn'),
    shareBtn: document.getElementById('share-btn'),
    accessoryBtn: document.getElementById('accessory-btn'),
    /* Unlock picker (tabbed panel) */
    unlockPanel: document.getElementById('unlock-panel'),
    unlockTabs: document.getElementById('unlock-tabs'),
    unlockTabContent: document.getElementById('unlock-tab-content'),
    /* Payment modal */
    paymentModal: document.getElementById('payment-modal'),
    paymentClose: document.getElementById('payment-close'),
    paymentTitle: document.getElementById('payment-title'),
    paymentBody: document.getElementById('payment-body'),
    paymentActions: document.getElementById('payment-actions'),
    /* Feedback modal */
    feedbackBtn: document.getElementById('feedback-btn'),
    feedbackModal: document.getElementById('feedback-modal'),
    feedbackClose: document.getElementById('feedback-close'),
    feedbackType: document.getElementById('feedback-type'),
    feedbackText: document.getElementById('feedback-text'),
    feedbackSubmit: document.getElementById('feedback-submit'),
    /* Leaderboard */
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    leaderboardPanel: document.getElementById('leaderboard-panel'),
    leaderboardClose: document.getElementById('leaderboard-close'),
    leaderboardNameInput: document.getElementById('leaderboard-name-input'),
    leaderboardList: document.getElementById('leaderboard-list'),
    leaderboardRank: document.getElementById('leaderboard-rank'),
  };
}
