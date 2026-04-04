import { GAME } from '../constants.js';

/**
 * 10 silly payment types.  Each has a `run` function that takes over the
 * payment modal and resolves a promise when the player "pays."
 * The promise resolves `true` on success, `false` if cancelled.
 */

const PAYMENT_TYPES = [
  {
    id: 'compliment',
    label: 'Pay with a Compliment',
    description: 'Say something nice to the squid!',
    run: runCompliment,
  },
  {
    id: 'confession',
    label: 'Pay with a Confession',
    description: 'Tell the squid an embarrassing secret.',
    run: runConfession,
  },
  {
    id: 'dance',
    label: 'Pay with a Dance',
    description: 'Shake your device (or wiggle your mouse) for 5 seconds!',
    run: runDance,
  },
  {
    id: 'patience',
    label: 'Pay with Patience',
    description: 'Processing your payment...',
    run: runPatience,
  },
  {
    id: 'trivia',
    label: 'Pay with Knowledge',
    description: 'Answer this squid trivia question correctly!',
    run: runTrivia,
  },
  {
    id: 'pun',
    label: 'Pay with a Bad Pun',
    description: 'Submit your worst pun. The squid will judge you.',
    run: runPun,
  },
  {
    id: 'promise',
    label: 'Pay with Promises',
    description: 'Solemnly swear to uphold these sacred vows:',
    run: runPromise,
  },
  {
    id: 'highfive',
    label: 'Pay with a High Five',
    description: 'Tap the screen exactly 5 times!',
    run: runHighFive,
  },
  {
    id: 'serenade',
    label: 'Pay with a Serenade',
    description: 'Sing, hum, or yell for 3 seconds. The squid is listening.',
    run: runSerenade,
  },
  {
    id: 'queue',
    label: 'Wait in Line',
    description: 'Please wait. Your position in line:',
    run: runQueue,
  },
];

/** Deterministic payment assignment seeded by item ID string. */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPaymentForItem(itemId) {
  const idx = hashCode(itemId) % PAYMENT_TYPES.length;
  return PAYMENT_TYPES[idx];
}

/** Trivia questions — loaded once from data/trivia.json */
let triviaQuestions = null;

async function loadTrivia() {
  if (triviaQuestions) return triviaQuestions;
  const url = new URL('../../data/trivia.json', import.meta.url);
  const res = await fetch(url);
  if (!res.ok) return [];
  triviaQuestions = await res.json();
  return triviaQuestions;
}

/**
 * Creates the payment system.
 * @param {object} refs - DOM refs (paymentModal, paymentClose, paymentTitle, paymentBody, paymentActions)
 * @returns {{ requestPayment(itemId): Promise<boolean> }}
 */
export function createPaymentSystem(refs, { triggerBlush } = {}) {
  let activeReject = null;
  let previousFocus = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(e) {
    const inner = refs.paymentModal.querySelector('.payment-modal-inner');
    const focusable = [...inner.querySelectorAll(FOCUSABLE)];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'Escape') {
      hideModal();
    }
  }

  function showModal() {
    previousFocus = document.activeElement;
    refs.paymentModal.hidden = false;
    refs.paymentModal.addEventListener('keydown', trapFocus);
    /* Focus the close button as a safe initial target */
    requestAnimationFrame(() => refs.paymentClose.focus());
  }

  function hideModal() {
    refs.paymentModal.hidden = true;
    refs.paymentModal.removeEventListener('keydown', trapFocus);
    refs.paymentTitle.textContent = '';
    refs.paymentBody.textContent = '';
    refs.paymentActions.innerHTML = '';
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
    if (activeReject) {
      activeReject(false);
      activeReject = null;
    }
  }

  refs.paymentClose.addEventListener('click', hideModal);
  refs.paymentModal.addEventListener('click', (e) => {
    if (e.target === refs.paymentModal) hideModal();
  });

  /**
   * Open the payment modal for a given item.
   * Resolves true if payment completed, false if cancelled.
   */
  async function requestPayment(itemId) {
    const payment = getPaymentForItem(itemId);

    refs.paymentTitle.textContent = payment.label;
    refs.paymentBody.textContent = payment.description;
    refs.paymentActions.innerHTML = '';
    showModal();

    return new Promise((resolve) => {
      activeReject = resolve;
      payment.run(refs, resolve, { triggerBlush });
    });
  }

  return { requestPayment };
}

/* ── Payment implementations ── */

function runCompliment(refs, resolve, { triggerBlush } = {}) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'You have beautiful tentacles...';
  input.maxLength = 140;

  const btn = makeSubmitBtn('Compliment!');
  btn.disabled = true;
  input.addEventListener('input', () => { btn.disabled = input.value.trim().length < 3; });
  btn.addEventListener('click', () => {
    refs.paymentBody.textContent = 'The squid is blushing! \u{1F97A}';
    refs.paymentActions.innerHTML = '';
    if (triggerBlush) triggerBlush();
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
  });

  refs.paymentActions.appendChild(input);
  refs.paymentActions.appendChild(btn);
  input.focus();
}

function runConfession(refs, resolve) {
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'I once pretended to understand Git rebasing...';
  textarea.maxLength = 280;

  const btn = makeSubmitBtn('Confess!');
  btn.disabled = true;
  textarea.addEventListener('input', () => { btn.disabled = textarea.value.trim().length < 5; });
  btn.addEventListener('click', () => {
    refs.paymentBody.textContent = 'Your secret is safe with the squid. Probably. \u{1F92B}';
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
  });

  refs.paymentActions.appendChild(textarea);
  refs.paymentActions.appendChild(btn);
  textarea.focus();
}

function runDance(refs, resolve) {
  let motion = 0;
  const THRESHOLD = 50; /* arbitrary motion accumulation target */
  const duration = GAME.PAYMENT_DANCE_MS;

  const bar = makeProgressBar();
  refs.paymentActions.appendChild(bar.container);

  let lastX = null;
  let lastY = null;

  function onMouseMove(e) {
    if (lastX !== null) {
      motion += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
    }
    lastX = e.clientX;
    lastY = e.clientY;
    bar.update(Math.min(motion / (THRESHOLD * 30), 1));
  }

  function onDeviceMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (a) motion += Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    bar.update(Math.min(motion / (THRESHOLD * 30), 1));
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('devicemotion', onDeviceMotion);

  setTimeout(() => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('devicemotion', onDeviceMotion);

    if (motion > THRESHOLD) {
      refs.paymentBody.textContent = 'Sick moves! The squid approves. \u{1F57A}';
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
    } else {
      refs.paymentBody.textContent = 'The squid was not impressed. Try again!';
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { runDance(refs, resolve); }, 1000);
    }
  }, duration);
}

function runPatience(refs, resolve) {
  const bar = makeProgressBar();
  refs.paymentActions.appendChild(bar.container);

  const cancelHint = document.createElement('p');
  cancelHint.style.fontSize = '0.78rem';
  cancelHint.style.color = '#475569';
  cancelHint.style.marginTop = '8px';
  cancelHint.style.textAlign = 'center';
  cancelHint.textContent = 'You can close this at any time \u2014 you won\u2019t lose anything.';
  refs.paymentActions.appendChild(cancelHint);

  const total = GAME.PAYMENT_PATIENCE_MS;
  const start = Date.now();
  const messages = [
    'Contacting squid bank...',
    'Verifying tentacle print...',
    'Counting ink droplets...',
    'Almost there...',
    'Just kidding, halfway there...',
    'The squid is thinking...',
    'Processing...',
    'Done!',
  ];

  let msgIdx = 0;
  const interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(elapsed / total, 1);
    bar.update(pct);

    const newIdx = Math.min(Math.floor(pct * messages.length), messages.length - 1);
    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      refs.paymentBody.textContent = messages[msgIdx];
    }

    if (pct >= 1) {
      clearInterval(interval);
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 800);
    }
  }, 200);
}

async function runTrivia(refs, resolve) {
  const questions = await loadTrivia();
  if (questions.length === 0) {
    refs.paymentBody.textContent = 'No trivia available. Have this one free!';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1000);
    return;
  }

  const q = questions[Math.floor(Math.random() * questions.length)];
  refs.paymentBody.textContent = q.question;

  const choicesDiv = document.createElement('div');
  choicesDiv.className = 'payment-trivia-choices';

  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'payment-trivia-choice';
    btn.textContent = choice;
    btn.addEventListener('click', () => {
      /* Disable all choices */
      choicesDiv.querySelectorAll('button').forEach(b => { b.disabled = true; });

      if (i === q.answer) {
        btn.classList.add('correct');
        refs.paymentBody.textContent = 'Correct! The squid is impressed. \u{1F929}';
        setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
      } else {
        btn.classList.add('wrong');
        choicesDiv.children[q.answer].classList.add('correct');
        refs.paymentBody.textContent = 'Wrong! Try again next time. \u{1F614}';
        setTimeout(() => {
          refs.paymentBody.textContent = q.question;
          choicesDiv.querySelectorAll('button').forEach(b => {
            b.disabled = false;
            b.classList.remove('correct', 'wrong');
          });
        }, 1500);
      }
    });
    choicesDiv.appendChild(btn);
  });

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(choicesDiv);
}

function runPun(refs, resolve) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = "What do you call a lazy squid? A sluggish squid...";
  input.maxLength = 200;

  const btn = makeSubmitBtn('Submit Pun');
  btn.disabled = true;
  input.addEventListener('input', () => { btn.disabled = input.value.trim().length < 3; });

  const judgments = [
    'The squid groaned so hard it squirted. Approved!',
    'Terrible. Absolutely terrible. ...the squid loved it.',
    'The squid rolled all its eyes. That means you pass!',
    'Even the ink turned a little. Well done.',
    'The tentacles curled in agony. Payment accepted!',
  ];

  btn.addEventListener('click', () => {
    const judgment = judgments[Math.floor(Math.random() * judgments.length)];
    refs.paymentBody.textContent = judgment;
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1800);
  });

  refs.paymentActions.appendChild(input);
  refs.paymentActions.appendChild(btn);
  input.focus();
}

function runPromise(refs, resolve) {
  const promises = [
    'I promise to think about squids at least once today',
    'I solemnly swear to never eat calamari again (starting tomorrow)',
    'I will tell one person about this squid game',
    'I accept that squids are superior to octopuses (sorry not sorry)',
    'I will do my best impression of a squid in the next 24 hours',
  ];

  const list = document.createElement('ul');
  list.className = 'payment-promise-list';

  const checkboxes = [];
  for (const text of promises) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    checkboxes.push(cb);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(text));
    li.appendChild(label);
    list.appendChild(li);
  }

  const btn = makeSubmitBtn('I Solemnly Swear');
  btn.disabled = true;

  function updateBtn() {
    btn.disabled = !checkboxes.every(cb => cb.checked);
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateBtn));

  btn.addEventListener('click', () => {
    refs.paymentBody.textContent = 'The squid trusts you. Don\'t let it down. \u{1F91D}';
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
  });

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(list);
  refs.paymentActions.appendChild(btn);
}

function runHighFive(refs, resolve) {
  let taps = 0;
  const TARGET = 5;
  const display = document.createElement('div');
  display.style.fontSize = '3rem';
  display.style.textAlign = 'center';
  display.style.color = '#7c3aed';
  display.style.fontFamily = "'VT323', monospace";
  display.textContent = `${taps} / ${TARGET}`;

  const tapZone = document.createElement('button');
  tapZone.className = 'payment-submit-btn';
  tapZone.style.width = '100%';
  tapZone.style.padding = '20px';
  tapZone.style.fontSize = '1.1rem';
  tapZone.textContent = '\u{270B} Tap here!';

  tapZone.addEventListener('click', () => {
    taps++;
    display.textContent = `${taps} / ${TARGET}`;
    if (taps >= TARGET) {
      refs.paymentBody.textContent = 'High five received! \u{1F64F}';
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1000);
    }
  });

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(display);
  refs.paymentActions.appendChild(tapZone);
}

function runSerenade(refs, resolve) {
  const duration = GAME.PAYMENT_SERENADE_MS;
  const bar = makeProgressBar();

  const startBtn = makeSubmitBtn('\u{1F3A4} Start Singing');

  startBtn.addEventListener('click', async () => {
    refs.paymentActions.innerHTML = '';
    refs.paymentActions.appendChild(bar.container);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (_) {
      /* No mic access — just accept it anyway */
      refs.paymentBody.textContent = 'No mic? The squid appreciates the effort anyway!';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
      return;
    }

    refs.paymentBody.textContent = 'The squid is listening... keep going!';
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      bar.update(pct);

      if (pct >= 1) {
        clearInterval(interval);
        stream.getTracks().forEach(t => t.stop());
        refs.paymentBody.textContent = 'Beautiful! The squid has tears in its eyes. \u{1F3B6}';
        refs.paymentActions.innerHTML = '';
        setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
      }
    }, 100);
  });

  refs.paymentActions.appendChild(startBtn);
}

function runQueue(refs, resolve) {
  let position = 30 + Math.floor(Math.random() * 40);

  const display = document.createElement('div');
  display.className = 'payment-queue-number';
  display.textContent = `#${position}`;

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(display);

  function tick() {
    position--;
    display.textContent = position > 0 ? `#${position}` : 'You\'re up!';

    const messages = [
      'Please hold...',
      'Your squirt is important to us.',
      'Estimated wait: forever.',
      'Did you know? Squids can fly.',
      'Still waiting...',
      'The squid thanks you for your patience.',
      'Almost there... probably.',
    ];
    refs.paymentBody.textContent = messages[Math.floor(Math.random() * messages.length)];

    if (position <= 0) {
      refs.paymentBody.textContent = 'Welcome! Transaction complete. \u{1F389}';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1000);
      return;
    }

    /* Random delay — sometimes fast, sometimes slow */
    const delay = GAME.PAYMENT_QUEUE_BASE_MS + Math.random() * GAME.PAYMENT_QUEUE_BASE_MS * 2;
    setTimeout(tick, delay);
  }

  setTimeout(tick, GAME.PAYMENT_QUEUE_BASE_MS);
}

/* ── Helpers ── */

function makeSubmitBtn(label) {
  const btn = document.createElement('button');
  btn.className = 'payment-submit-btn';
  btn.textContent = label;
  return btn;
}

function makeProgressBar() {
  const container = document.createElement('div');
  container.className = 'payment-progress';
  const bar = document.createElement('div');
  bar.className = 'payment-progress-bar';
  container.appendChild(bar);
  return {
    container,
    update(pct) { bar.style.width = `${Math.round(pct * 100)}%`; },
  };
}
