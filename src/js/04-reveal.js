/* 04-reveal.js — Scroll reveal: blocks fade up and text un-blurs as it enters the screen (IntersectionObserver, GPU-only). */

/* ── Scroll reveal: blocks fade up as they enter the screen. One IntersectionObserver, transform/opacity only;
   each element animates once and is then released (classes removed) so hover effects keep working. ── */
const RV_SEL = '#top > section:not(#hero) > *, #homeGrid > .p-card, #footer .grid > *, #catalogTop > *, #dashBody > *, #admBody > *, #authView section > div';
const rvIO = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; rvIO.unobserve(el); el.classList.add('rv-in');
  const done = ev => { if (ev.target !== el) return; el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--rv-d'); el.removeEventListener('animationend', done); };
  el.addEventListener('animationend', done);
}), matchMedia('(max-width: 1023px)').matches ? { rootMargin: '0px 0px 12% 0px', threshold: 0 } : { rootMargin: '0px 0px -6% 0px', threshold: .06 }) : null;
const reveal = (root = document) => {
  if (!rvIO) return;
  const seen = new Map();
  $$(RV_SEL).forEach(el => {
    if (el.dataset.rv || !root.contains(el)) return;
    el.dataset.rv = 1;
    const i = seen.get(el.parentNode) || 0; seen.set(el.parentNode, i + 1);   /* stagger siblings */
    el.style.setProperty('--rv-d', Math.min(i, 5) * 80 + 'ms');
    el.classList.add('rv'); rvIO.observe(el);
  });
};
/* text (titles, lines, labels) wakes up from a light blur as it enters the screen; released afterwards so nothing stays on the GPU */
const BL_SEL = 'main h1, main h2, main h3, main p, main .eyebrow, #footer h2, #footer h3, #footer p';
const blIO = rvIO ? new IntersectionObserver(es => {
  let n = 0;
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; blIO.unobserve(el);
    el.style.setProperty('--bl-d', Math.min(n++, 6) * 70 + 'ms');
    requestAnimationFrame(() => el.classList.add('bl-in'));
    const done = ev => { if (ev.target !== el || ev.propertyName !== 'filter') return; el.classList.remove('bl', 'bl-in'); el.style.removeProperty('--bl-d'); el.removeEventListener('transitionend', done); };
    el.addEventListener('transitionend', done);
    setTimeout(() => el.classList.remove('bl', 'bl-in'), 1800);           // safety net if transitionend never fires
  });
}, { rootMargin: '0px 0px -4% 0px', threshold: 0 }) : null;
const blur = (root = document) => {
  if (!blIO) return;
  $$(BL_SEL, root).forEach(el => {
    if (el.dataset.bl || el.closest('#mobileMenu,#cartDrawer,#qv,.db-notes,[aria-hidden="true"],.slide:not([data-slide="0"])') || !el.textContent.trim()) return;
    el.dataset.bl = 1; el.classList.add('bl'); blIO.observe(el);
  });
};
reveal(); blur();
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => document.documentElement.classList.toggle('at-foot', e.isIntersecting && !$('#footer').hidden), { rootMargin: '0px 0px 0px 0px' }).observe($('#footer'));
