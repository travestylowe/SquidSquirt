/* ────────────────────────────────────────────
   squidsquirt.com — main.js
   ──────────────────────────────────────────── */

(function () {

  // ════════════════════════════════════════════
  //  COUNTER BACKEND (localStorage or Supabase via config.js)
  // ════════════════════════════════════════════

  const counter = (() => {
    const cfg = window.SQUIDSQUIRT_CONFIG || {};
    const url = String(cfg.supabaseUrl || '').trim();
    const key = String(cfg.supabaseAnonKey || '').trim();

    if (url && key) {
      return {
        async load() {
          const res = await fetch(
            `${url}/rest/v1/counters?id=eq.1&select=total`,
            { headers: { apikey: key, Authorization: `Bearer ${key}` } }
          );
          const data = await res.json();
          return data[0]?.total ?? 0;
        },
        async save(_n) {
          const res = await fetch(`${url}/rest/v1/rpc/increment_squirt`, {
            method: 'POST',
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
          if (!res.ok) throw new Error('increment failed');
          return res.json();
        },
      };
    }

    return {
      async load() {
        return parseInt(localStorage.getItem('sqc') || '0');
      },
      async save(n) {
        localStorage.setItem('sqc', String(n));
      },
    };
  })();


  // ════════════════════════════════════════════
  //  CANVAS / INK SYSTEM
  // ════════════════════════════════════════════

  const canvas = document.getElementById('ink-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let particles = [];   // airborne ink particles
  let drips     = [];   // ink blobs dripping down the screen
  let inkLevel  = 0;    // 0–1, full-screen ink overlay (mega squirts)

  /**
   * Spawn airborne particles + drip blobs based on squirt power (0–1).
   * power 0–0.05 : dry — nothing visible
   * power 0.05–0.3 : small
   * power 0.3–0.65 : medium
   * power 0.65–0.85 : large
   * power 0.85–1.0 : mega (all-direction spray, screen overlay)
   */
  function spawnInk(originX, originY, power) {
    if (power < 0.05) return;

    const mega = power > 0.85;

    // Airborne particles
    const particleCount = Math.floor(8 + power * 95);
    for (let i = 0; i < particleCount; i++) {
      const angle = mega
        ? Math.random() * Math.PI * 2
        : (215 + Math.random() * 110) * (Math.PI / 180); // downward cone
      const speed = (1.5 + Math.random() * 11) * Math.pow(power, 0.5);

      particles.push({
        x:     originX + (Math.random() - 0.5) * 28,
        y:     originY,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        r:     (2 + Math.random() * 11) * Math.pow(power, 0.42),
        life:  1,
        decay: 0.011 + Math.random() * 0.023,
        hue:   260 + Math.random() * 42,
        sat:   55  + Math.random() * 35,
        lt:    4   + Math.random() * 18,
      });
    }

    // Drip blobs (medium+ squirts)
    if (power > 0.28) {
      const dripCount = Math.floor((power - 0.28) * 30);
      const cx        = W * 0.5;
      const spreadX   = mega ? W * 0.46 : W * 0.24;

      for (let i = 0; i < dripCount; i++) {
        const dx = cx + (Math.random() - 0.5) * 2 * spreadX;
        const dy = mega
          ? Math.random() * H * 0.42
          : originY - 35 + Math.random() * 110;
        const r  = (4 + Math.random() * 15) * Math.pow(power - 0.2, 0.48);

        drips.push({
          x:     dx,
          blobY: dy,       // fixed splat point
          headY: dy,       // drip head, moves down each frame
          blobR: r,
          headR: r * 0.52,
          speed: 0.12 + Math.random() * power * 1.9,
          alpha: 0.65 + Math.random() * 0.35,
          w:     r * 0.28, // trail width
          hue:   263 + Math.random() * 32,
          sat:   48  + Math.random() * 32,
          lt:    4   + Math.random() * 17,
        });
      }
    }

    // Mega: dark ink overlay
    if (mega) {
      inkLevel = Math.min(1, inkLevel + (power - 0.82) * 5);
    }
  }

  // Animation loop
  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Full-screen ink overlay (drains slowly)
    if (inkLevel > 0) {
      ctx.save();
      ctx.globalAlpha = inkLevel * 0.9;
      ctx.fillStyle   = '#060115';
      ctx.fillRect(0, 0, W, H);
      inkLevel = Math.max(0, inkLevel - 0.00055);
      ctx.restore();
    }

    // Drips: blob at fixed point, head falls downward leaving a trail
    for (const d of drips) {
      d.headY += d.speed;
      if (d.headY > H + d.headR + 10) {
        d.alpha = Math.max(0, d.alpha - 0.018);
      }
      if (d.alpha < 0.01) continue;

      const col = `hsl(${d.hue},${d.sat}%,${d.lt}%)`;
      ctx.save();
      ctx.globalAlpha = d.alpha;

      // Trail line from blob down to drip head
      if (d.headY > d.blobY + 1) {
        ctx.strokeStyle = col;
        ctx.lineWidth   = d.w;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(d.x, d.blobY);
        ctx.lineTo(d.x, d.headY);
        ctx.stroke();
      }

      // Blob (splat)
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(d.x, d.blobY, d.blobR, 0, Math.PI * 2);
      ctx.fill();

      // Drip head (teardrop bottom)
      ctx.beginPath();
      ctx.arc(d.x, d.headY, d.headR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    drips = drips.filter(d => d.alpha > 0.01);

    // Airborne particles
    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.19;  // gravity
      p.vx *= 0.97;  // drag
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life) * 0.9;
      ctx.fillStyle   = `hsl(${p.hue},${p.sat}%,${p.lt}%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.r * p.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    particles = particles.filter(p => p.life > 0);

    requestAnimationFrame(drawFrame);
  }
  drawFrame();


  // ════════════════════════════════════════════
  //  AUDIO ENGINE
  //  All sounds are synthesized — no files.
  //
  //  Squirts: bandpass-filtered noise, frequency
  //           and duration scale with power.
  //  Farts:   sawtooth oscillator + AM flutter
  //           + noise mix. Lower freq = deeper.
  //  Giggles: series of scheduled bandpass bursts
  //           at rising pitch.
  // ════════════════════════════════════════════

  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function makeNoiseBuf(c, dur) {
    const buf  = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playSquirt(power) {
    const c   = getAudioCtx();
    const now = c.currentTime;
    // High freq = dry/small, low freq = wet/large
    const freq = 1800 - power * 1450;
    const dur  = 0.06  + power * 0.52;
    const vol  = 0.28  + power * 0.47;

    const src = c.createBufferSource();
    src.buffer = makeNoiseBuf(c, dur);

    const bpf = c.createBiquadFilter();
    bpf.type            = 'bandpass';
    bpf.frequency.value = freq;
    bpf.Q.value         = 0.7 + power * 0.6;

    // Wet wobble for medium+ squirts
    if (power > 0.38) {
      const lfo = c.createOscillator();
      const lg  = c.createGain();
      lfo.frequency.value = 18 + Math.random() * 22;
      lg.gain.value       = freq * 0.28;
      lfo.connect(lg);
      lg.connect(bpf.frequency);
      lfo.start(now);
      lfo.stop(now + dur);
    }

    const g = c.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(bpf);
    bpf.connect(g);
    g.connect(c.destination);
    src.start(now);
  }

  function playFart(power) {
    const c   = getAudioCtx();
    const now = c.currentTime;
    // High power = lower frequency, longer, louder
    const baseFreq = 380  - power * 300;
    const dur      = 0.15 + power * 0.78;
    const vol      = 0.28 + power * 0.47;
    const lfoFreq  = 36   - power * 24;   // fast flutter → slow rumble

    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq * 1.15, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.78, now + dur);

    // AM flutter LFO
    const lfo  = c.createOscillator();
    const lg   = c.createGain();
    const amG  = c.createGain();
    lfo.frequency.value = lfoFreq;
    lg.gain.value       = 0.45;
    amG.gain.value      = 0.5;
    lfo.connect(lg);
    lg.connect(amG.gain);

    // Noise layer (body + texture)
    const ns  = c.createBufferSource();
    ns.buffer = makeNoiseBuf(c, dur);
    const nf  = c.createBiquadFilter();
    nf.type            = 'lowpass';
    nf.frequency.value = baseFreq * 3.5;
    const ng = c.createGain();
    ng.gain.value = 0.18;
    ns.connect(nf);
    nf.connect(ng);

    const out = c.createGain();
    out.gain.setValueAtTime(vol, now);
    out.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(amG);
    amG.connect(out);
    ng.connect(out);
    out.connect(c.destination);

    osc.start(now); osc.stop(now + dur);
    lfo.start(now); lfo.stop(now + dur);
    ns.start(now);
  }

  function playGiggle() {
    const c   = getAudioCtx();
    const now = c.currentTime;
    const n   = 3 + Math.floor(Math.random() * 3); // 3–5 "heh"s

    for (let i = 0; i < n; i++) {
      const t   = now + 0.04 + i * 0.175;
      const dur = 0.07 + Math.random() * 0.05;

      const src = c.createBufferSource();
      src.buffer = makeNoiseBuf(c, dur);

      const bpf = c.createBiquadFilter();
      bpf.type            = 'bandpass';
      bpf.frequency.value = 1200 + i * 190 + Math.random() * 220; // rising pitch
      bpf.Q.value         = 2.8;

      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.018);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      src.connect(bpf);
      bpf.connect(g);
      g.connect(c.destination);
      src.start(t);
    }
  }

  /**
   * Pick and play a sound for a given power level.
   * Also schedules a giggle with probability based on type + power.
   */
  function playSound(power, isFart) {
    try {
      if (isFart) {
        playFart(power);
      } else {
        playSquirt(power);
      }

      const giggleChance = isFart       ? 0.72
                         : power < 0.15 ? 0.86  // tiny dry pffft = very funny
                         : power > 0.80 ? 0.42  // mega = embarrassed giggle
                         :                0.20;

      if (Math.random() < giggleChance) {
        // Delay giggle until after the squirt/fart sound finishes
        const soundDur = isFart
          ? (0.15 + power * 0.78) * 1000
          : (0.06 + power * 0.52) * 1000;
        setTimeout(() => { try { playGiggle(); } catch (_) {} }, soundDur * 0.5 + 110);
      }
    } catch (_) {
      // Audio can fail silently (e.g. blocked autoplay)
    }
  }


  // ════════════════════════════════════════════
  //  SQUID CONTROLLER
  // ════════════════════════════════════════════

  const squidSvg  = document.getElementById('squid-svg');
  const squidBody = document.getElementById('squid-body');
  const pupilL    = document.getElementById('pupil-left');
  const pupilR    = document.getElementById('pupil-right');
  const blushL    = document.getElementById('blush-left');
  const blushR    = document.getElementById('blush-right');

  // Pupils track the cursor within a bounded range
  const EYES = [
    { el: pupilL, baseX: 172, baseY: 116 },
    { el: pupilR, baseX: 228, baseY: 116 },
  ];
  const PUPIL_RANGE = 9; // max px offset in SVG coordinate space

  document.addEventListener('mousemove', (e) => {
    const rect = squidSvg.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) * (400 / rect.width);
    const my   = (e.clientY - rect.top)  * (380 / rect.height);

    for (const eye of EYES) {
      const dx   = mx - eye.baseX;
      const dy   = my - eye.baseY;
      const dist = Math.hypot(dx, dy) || 1;
      const r    = Math.min(dist / 15, PUPIL_RANGE);
      eye.el.setAttribute('cx', eye.baseX + (dx / dist) * r);
      eye.el.setAttribute('cy', eye.baseY + (dy / dist) * r);
    }
  });

  // Blush — fades in/out via CSS transition on opacity
  let blushTimer = null;

  function triggerBlush() {
    blushL.style.opacity = '0.62';
    blushR.style.opacity = '0.62';
    clearTimeout(blushTimer);
    blushTimer = setTimeout(() => {
      blushL.style.opacity = '0';
      blushR.style.opacity = '0';
    }, 2800);
  }

  // Squish animation (remove + reflow + re-add to restart)
  function triggerSquish() {
    squidBody.classList.remove('squish');
    void squidBody.offsetWidth; // force reflow
    squidBody.classList.add('squish');
  }


  // ════════════════════════════════════════════
  //  COUNTER
  // ════════════════════════════════════════════

  const counterEl = document.getElementById('counter');
  const hintEl    = document.getElementById('hint');
  let count       = 0;

  // Load count on startup
  counter.load().then((saved) => {
    count = typeof saved === 'number' ? saved : parseInt(saved, 10) || 0;
    counterEl.textContent = count.toLocaleString();
  }).catch(() => {});

  function bumpCounter() {
    count++;
    counterEl.textContent = count.toLocaleString();
    counterEl.classList.remove('pop');
    void counterEl.offsetWidth;
    counterEl.classList.add('pop');
    counter.save(count).then((rpcResult) => {
      if (rpcResult !== undefined && rpcResult !== null && typeof rpcResult === 'number') {
        count = rpcResult;
        counterEl.textContent = count.toLocaleString();
      }
    }).catch(() => {});
    if (count === 1) hintEl.style.opacity = '0';
  }


  // ════════════════════════════════════════════
  //  AMBIENT BUBBLES
  // ════════════════════════════════════════════

  for (let i = 0; i < 14; i++) {
    const b    = document.createElement('div');
    b.className = 'bubble';
    const size  = 4 + Math.random() * 18;
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


  // ════════════════════════════════════════════
  //  MAIN SQUIRT HANDLER
  // ════════════════════════════════════════════

  let cooldown = false;

  function doSquirt() {
    if (cooldown) return;
    cooldown = true;

    const power  = Math.random();          // 0–1 determines everything
    const isFart = Math.random() < 0.25;   // 25% chance of fart

    triggerSquish();
    playSound(power, isFart);

    // Ink origin: SVG siphon maps to screen coordinates
    const rect   = squidSvg.getBoundingClientRect();
    const inkX   = rect.left + rect.width  * (200 / 400);
    const inkY   = rect.top  + rect.height * (223 / 380);
    spawnInk(inkX, inkY, power);

    // Blush on big squirts (power > 0.75) or big farts (power > 0.65)
    if (power > 0.75 || (isFart && power > 0.65)) {
      triggerBlush();
    }

    bumpCounter();

    setTimeout(() => { cooldown = false; }, 320);
  }

  // Mouse + touch
  document.getElementById('squid-btn').addEventListener('mousedown', doSquirt);
  document.getElementById('squid-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    doSquirt();
  }, { passive: false });

})();
