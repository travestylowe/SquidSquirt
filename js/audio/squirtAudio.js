import { GAME } from '../constants.js';

export function createSquirtAudio(debug) {
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function makeNoiseBuf(c, dur) {
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playSquirt(power) {
    const c = getAudioCtx();
    const now = c.currentTime;
    const freq = 1800 - power * 1450;
    const dur = 0.06 + power * 0.52;
    const vol = 0.28 + power * 0.47;

    const src = c.createBufferSource();
    src.buffer = makeNoiseBuf(c, dur);

    const bpf = c.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = freq;
    bpf.Q.value = 0.7 + power * 0.6;

    if (power > 0.38) {
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 18 + Math.random() * 22;
      lg.gain.value = freq * 0.28;
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
    const c = getAudioCtx();
    const now = c.currentTime;
    const baseFreq = 380 - power * 300;
    const dur = 0.15 + power * 0.78;
    const vol = 0.28 + power * 0.47;
    const lfoFreq = 36 - power * 24;

    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq * 1.15, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.78, now + dur);

    const lfo = c.createOscillator();
    const lg = c.createGain();
    const amG = c.createGain();
    lfo.frequency.value = lfoFreq;
    lg.gain.value = 0.45;
    amG.gain.value = 0.5;
    lfo.connect(lg);
    lg.connect(amG.gain);

    const ns = c.createBufferSource();
    ns.buffer = makeNoiseBuf(c, dur);
    const nf = c.createBiquadFilter();
    nf.type = 'lowpass';
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
    const c = getAudioCtx();
    const now = c.currentTime;
    const n = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < n; i++) {
      const t = now + 0.04 + i * 0.175;
      const dur = 0.07 + Math.random() * 0.05;

      const src = c.createBufferSource();
      src.buffer = makeNoiseBuf(c, dur);

      const bpf = c.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 1200 + i * 190 + Math.random() * 220;
      bpf.Q.value = 2.8;

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

  function playSound(power, isFart) {
    try {
      if (isFart) {
        playFart(power);
      } else {
        playSquirt(power);
      }

      const giggleChance = isFart
        ? GAME.GIGGLE_FART
        : power < GAME.TINY_SQUIRT_POWER
          ? GAME.GIGGLE_TINY_SQUIRT
          : power > GAME.MEGA_SQUIRT_POWER
            ? GAME.GIGGLE_MEGA_SQUIRT
            : GAME.GIGGLE_DEFAULT;

      if (Math.random() < giggleChance) {
        const soundDur = isFart
          ? (0.15 + power * 0.78) * 1000
          : (0.06 + power * 0.52) * 1000;
        setTimeout(() => {
          try {
            playGiggle();
          } catch (e) {
            if (debug) console.warn('giggle', e);
          }
        }, soundDur * 0.5 + 110);
      }
    } catch (e) {
      if (debug) console.warn('playSound', e);
    }
  }

  return { playSound };
}
