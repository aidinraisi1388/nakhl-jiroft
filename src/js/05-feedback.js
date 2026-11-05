/* 05-feedback.js — Toast messages and the top loading bar shown on page changes. */

/* ── Toast ── */
let tt;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.remove('opacity-0', '-translate-y-2'); clearTimeout(tt); tt = setTimeout(() => t.classList.add('opacity-0', '-translate-y-2'), 2200); };
const lb = $('#loadBar');
let barQuietUntil = 0;
const finishBar = () => { lb.classList.remove('stall'); void lb.offsetWidth; lb.classList.add('finish'); clearTimeout(lb._t); lb._t = setTimeout(() => lb.classList.remove('finish'), 700); };
const loadBar = () => { if (reduce || Date.now() < barQuietUntil) return; if (lb.classList.contains('stall')) return finishBar(); lb.style.animation = ''; lb.classList.remove('run', 'done', 'finish'); void lb.offsetWidth; lb.classList.add('run'); };
const stallBar = () => { lb.style.animation = ''; lb.classList.remove('run', 'done', 'finish'); void lb.offsetWidth; lb.classList.add('stall'); };
/* fills the bar 0 → 100% over `ms`, then runs `cb` (used for the login transfer) */
const longBar = (ms, cb) => {
  const t = reduce ? 250 : ms;
  lb.classList.remove('run', 'done'); lb.style.animation = 'none'; void lb.offsetWidth;
  lb.style.animation = `loadLong ${t}ms linear forwards`;
  setTimeout(() => { barQuietUntil = Date.now() + 500; cb(); lb.style.animation = ''; lb.classList.add('done'); }, t);
};
const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
