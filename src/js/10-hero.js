/* 10-hero.js — Hero slider on the home page: auto-play every 6s, dots. */

/* ── Hero slider: one timer every 6s, pauses on hover/focus and while the catalog is open ── */
const slides = $$('.slide'), dots = $$('.dot'), track = $('#heroTrack'); let cur = 0, timer;
let step = 0;
const measure = () => { step = track.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0); };
const slideW = () => step || (measure(), step);
/* the whole slider is ONE element moved with translate3d → GPU only, no layout or repaint per frame */
const paintTrack = (x, anim) => { track.style.transition = anim ? 'transform .55s cubic-bezier(.22,1,.36,1)' : 'none'; track.style.transform = `translate3d(${x}px,0,0)`; };
const go = (i, anim = true) => {
  cur = (i + slides.length) % slides.length;
  measure(); paintTrack(cur * step, anim && !reduce);           // RTL: slide n sits n widths to the left
  slides.forEach((s, k) => { s.setAttribute('aria-hidden', k !== cur); s.inert = k !== cur; });
  dots.forEach((d, k) => { const on = k === cur; d.setAttribute('aria-selected', on); d.classList.toggle('w-7', on); d.classList.toggle('w-2', !on); d.classList.toggle('bg-cyprus', on); d.classList.toggle('bg-cyprus/25', !on); });
};
function play() { clearInterval(timer); if (!reduce && current === 'home') timer = setInterval(() => go(cur + 1), 6000); }
dots.forEach(d => d.addEventListener('click', () => { go(+d.dataset.to); play(); }));
const hero = slides[0].closest('section');
if (matchMedia('(hover:hover)').matches) { hero.addEventListener('mouseenter', () => clearInterval(timer)); hero.addEventListener('mouseleave', play); }   // iPhone fires mouseenter on tap and never mouseleave → autoplay would stop for good
hero.addEventListener('focusin', () => clearInterval(timer));
let rz = 0; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); paintTrack(cur * step, false); }); });
go(0, false);
