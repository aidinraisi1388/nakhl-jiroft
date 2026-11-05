/* 18-back-nav.js — «بازگشت» buttons: go back exactly one step (or to the parent page when opened from a link). */

/* ── «بازگشت»: exactly one step back (page or section). Opened straight from a link → the page one level up ── */
const trail = (() => { try { const t = JSON.parse(sessionStorage.getItem('nakhl:trail')); if (Array.isArray(t) && t.length && t[t.length - 1] === (location.hash || '#top')) return t; } catch {} return [location.hash || '#top']; })();
const saveTrail = () => { try { sessionStorage.setItem('nakhl:trail', JSON.stringify(trail.slice(-40))); } catch {} };
addEventListener('hashchange', () => {
  const hsh = location.hash || '#top';
  if (trail.length > 1 && trail[trail.length - 2] === hsh) trail.pop(); else if (trail[trail.length - 1] !== hsh) trail.push(hsh);
  saveTrail();
});
const parentOf = hsh => {
  const h = decodeURIComponent(hsh.slice(1));
  if (/^(dashboard|account)\/./.test(h)) return '#dashboard';
  if (/^admin\/./.test(h)) return '#admin';
  if (/^products\/./.test(h) || /^product\//.test(h)) return '#products';
  if (h === 'checkout') return '#products';
  if (/^(pay|receipt)\//.test(h)) return user ? '#dashboard/orders' : '#top';
  return '#top';
};
document.addEventListener('click', e => {
  if (!e.target.closest('[data-back]')) return;
  if (trail.length > 1) history.back();
  else { const p = parentOf(location.hash || '#top'); trail.splice(0, trail.length, p); history.replaceState(null, '', p); lastHash = ''; saveTrail(); onNav(); }
});
