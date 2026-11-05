/* 10b-hero-drag.js — Hero slider drag (mouse) / swipe (touch): follows the finger 1:1, snaps to the nearest slide. */

/* ════════ HERO: drag (mouse) / swipe (touch) ════════
   The track follows the finger 1:1 (you can stop and hold between two slides),
   one rAF-batched transform per frame, then snaps to the nearest slide (or the next one on a quick flick). */
{
  let sx = 0, sy = 0, dx = 0, base = 0, x = 0, vel = 0, lastX = 0, lastT = 0, raf = 0, axis = null, down = false, moved = false;
  const frame = () => { raf = 0; paintTrack(x, false); };
  /* shared by mouse (pointer events) and touch (touch events, so iOS can't take the gesture over mid-swipe) */
  const start = (cx, cy, t) => {
    measure(); down = true; moved = false; axis = null; dx = 0; vel = 0;
    sx = lastX = cx; sy = cy; lastT = t;
    base = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;   // catch a slide that is still moving
    track.style.transition = 'none'; paintTrack(base, false);
    clearInterval(timer);
  };
  const move = (cx, cy, t) => {        // returns true while the gesture is a horizontal drag
    if (!down) return false;
    dx = cx - sx;
    if (!axis) {
      const dy = cy - sy;
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return false;
      axis = Math.abs(dx) * 1.2 > Math.abs(dy) ? 'x' : 'y';              // slight bias to sideways: swipes start easily
      if (axis === 'y') { down = false; play(); return false; }           // vertical swipe = normal page scroll
      moved = true; hero.classList.add('grabbing');
    }
    const dtm = t - lastT || 16; vel = 0.7 * ((cx - lastX) / dtm) + 0.3 * vel; lastX = cx; lastT = t;
    const max = (slides.length - 1) * slideW();
    x = base + dx;
    if (x < 0) x *= 0.35; else if (x > max) x = max + (x - max) * 0.35;   // soft rubber-band at both ends
    if (!raf) raf = requestAnimationFrame(frame);
    return true;
  };
  const end = () => {
    if (!down) return;
    down = false; hero.classList.remove('grabbing');
    if (!moved) { play(); return; }
    cancelAnimationFrame(raf); raf = 0;
    const w = slideW(), from = Math.round(base / w);
    let target = Math.round((base + dx) / w);
    if (Math.abs(dx) > w * 0.16 || Math.abs(vel) > 0.25) target = from + ((Math.abs(vel) > 0.25 ? vel : dx) > 0 ? 1 : -1);   // a short swipe or a flick is enough
    go(Math.max(0, Math.min(slides.length - 1, target)));
    play();
    setTimeout(() => { moved = false; }, 0);              // the click right after a drag is ignored, the next one works
  };
  hero.addEventListener('touchstart', e => { if (e.touches.length > 1 || e.target.closest('.dot')) return; const p = e.touches[0]; start(p.clientX, p.clientY, e.timeStamp); }, { passive: true });
  hero.addEventListener('touchmove', e => { const p = e.touches[0]; if (move(p.clientX, p.clientY, e.timeStamp)) e.preventDefault(); }, { passive: false });
  hero.addEventListener('touchend', end); hero.addEventListener('touchcancel', end);
  hero.addEventListener('pointerdown', e => {
    moved = false;
    if (e.pointerType === 'touch' || e.button !== 0 || e.target.closest('.dot')) return;
    start(e.clientX, e.clientY, e.timeStamp);
  });
  hero.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || !down) return;
    const was = moved;
    if (move(e.clientX, e.clientY, e.timeStamp) && !was) hero.setPointerCapture(e.pointerId);
  });
  hero.addEventListener('pointerup', e => { if (e.pointerType !== 'touch') end(); });
  hero.addEventListener('pointercancel', e => { if (e.pointerType !== 'touch') end(); });
  hero.addEventListener('lostpointercapture', e => { if (e.pointerType !== 'touch') end(); });
  hero.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  hero.addEventListener('dragstart', e => e.preventDefault());
}
