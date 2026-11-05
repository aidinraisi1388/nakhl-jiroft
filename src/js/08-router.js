/* 08-router.js — Hash router: shows one view at a time (#products, #product/<id>, #dashboard, #admin …) + navbar/catalog search. */

/* ── Views: Home ↔ Products catalog (hash based: #products, #products/piarom …) ── */
const views = { home: $('#top'), catalog: $('#catalogView'), product: $('#productView'), dashboard: $('#dashboardView'), admin: $('#adminView'), auth: $('#authView'), receipt: $('#receiptView'), checkout: $('#checkoutView'), pay: $('#payView') };
let current = 'home';
const BASE_TITLE = document.title;
const show = name => {
  if (current === name) return false;
  Object.entries(views).forEach(([k, el]) => { el.hidden = k !== name; });
  $('#footer').hidden = name !== 'home'; document.body.dataset.view = name;   // footer on home only; per-page background
  const v = views[name]; v.classList.remove('view-in'); void v.offsetWidth; v.classList.add('view-in'); requestAnimationFrame(() => { reveal(v); blur(v); });
  current = name; loadBar();
  if (name !== 'product') document.title = BASE_TITLE;
  name === 'home' ? play() : clearInterval(timer);
  return true;
};
const toTop = () => { const r = document.documentElement.style; r.scrollBehavior = 'auto'; window.scrollTo(0, 0); r.scrollBehavior = ''; };   // jump, not glide (works in every Safari)
const route = () => {
  lastHash = location.hash;
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('product/')) {                                   // one product's own page
    const id = h.split('/')[1];
    if (!byId[id]) { history.replaceState(null, '', '#products'); return route(); }
    const changed = show('product'); renderProduct(id); toTop();
    return;
  }
  if (h === 'storage') {                                         // cold-storage services live in the catalog's «خدمات سردخانه» tab
    const changed = show('catalog'); cat = 'storage'; query = ''; clearSearchFields(); syncPills(); renderCatalog();
    if (changed) toTop();
    return;
  }
  if (h.startsWith('products')) {
    const c = h.split('/')[1];
    const changed = show('catalog');
    cat = CATS[c] ? c : 'dates'; page = 1; query = ''; clearSearchFields();
    syncPills(); renderCatalog();
    if (changed) toTop(); else { loadBar(); $('#catalogTop').scrollIntoView({ behavior: smooth }); }
    return;
  }
  if (h === 'checkout') {                                          // address · delivery · pay
    if (!user) { openLogin(goCheckout); if (!location.hash.startsWith('#auth') && !location.hash.startsWith('#admin')) history.replaceState(null, '', '#top'); return; }
    if (!count()) { history.replaceState(null, '', '#products'); return route(); }
    if (!hasAddr()) { wantCheckout = true; history.replaceState(null, '', '#dashboard/addresses'); toast('برای ادامه‌ی خرید، اول آدرس تحویل را ثبت کنید'); return route(); }
    const changed = show('checkout'); renderCheckout(); if (changed) toTop();
    return;
  }
  if (h.startsWith('pay/')) {                                       // payment: connecting / test gateway / result
    const [, a, b] = h.split('/'), test = a === 'test', o = orders.find(x => x.id === (test ? b : a));
    if (!o || !(admin || (user && user.phone === o.phone))) { history.replaceState(null, '', '#top'); return route(); }
    const changed = show('pay'); renderPay(o, test ? 'test' : (paying === o.id ? 'wait' : null)); if (changed) toTop();
    return;
  }
  if (h.startsWith('receipt/')) {                                   // order receipt (owner or manager only)
    const o = orders.find(x => x.id === h.split('/')[1]);
    if (!o || !(admin || (user && user.phone === o.phone))) { history.replaceState(null, '', '#top'); return route(); }
    const changed = show('receipt'); renderReceipt(o); if (changed) toTop();
    return;
  }
  if (/^(auth|dashboard|account|admin)/.test(h)) {                  // auth page + two fully separate panels
    const redirect = to => { history.replaceState(null, '', to); route(); };
    const [base, sub] = h.split('/');
    if (base === 'auth') {
      if (session) return redirect(admin ? '#admin' : '#dashboard');
      const changed = show('auth'); authScreen(sub === 'signup' || sub === 'forgot' ? sub : 'signin'); if (changed) toTop();
      return;
    }
    const isAdm = base === 'admin';
    if (!session) { authReturn = isAdm ? 'admin' : 'dashboard'; return redirect('#auth'); }
    if (!isAdm && admin && !user) return redirect('#admin/customers');   // pick a customer first
    if (isAdm) admTab = TITLES[sub] ? sub : 'stats'; else dashTab = DASH_TABS.includes(sub) ? sub : 'overview';
    const changed = show(isAdm ? 'admin' : 'dashboard'); (isAdm ? renderAdmin : renderDash)();
    if (changed) toTop(); else { loadBar(); scrollTo({ top: 0, behavior: smooth }); }
    return;
  }
  const el = h && document.getElementById(h);
  if (el && !el.closest('[data-view]')) { el.scrollIntoView({ behavior: smooth }); return; }   // shared footer
  const changed = show('home');
  if (el && el !== views.home) requestAnimationFrame(() => { if (changed) { const r = document.documentElement.style; r.scrollBehavior = 'auto'; el.scrollIntoView(); r.scrollBehavior = ''; } else el.scrollIntoView({ behavior: smooth }); });
  else if (changed) toTop();
};
/* switching to another page: the bar runs and pauses, the old page dims, ~0.45s later the new page shows */
const NAV_DELAY = 450;
const viewOf = h => { h = decodeURIComponent(h.slice(1)); return h.startsWith('product/') ? 'product' : h.startsWith('products') || h === 'storage' ? 'catalog' : h === 'checkout' ? 'checkout' : h.startsWith('pay/') ? 'pay' : h.startsWith('receipt/') ? 'receipt' : /^auth/.test(h) ? 'auth' : /^(dashboard|account)/.test(h) ? 'dashboard' : /^admin/.test(h) ? 'admin' : 'home'; };
let navT;
const onNav = () => {
  if (location.hash === lastHash) return;
  clearTimeout(navT);
  if (reduce || viewOf(location.hash) === current) return route();
  stallBar(); views[current].classList.add('leaving');
  navT = setTimeout(() => { Object.values(views).forEach(v => v.classList.remove('leaving')); route(); if (lb.classList.contains('stall')) finishBar(); }, NAV_DELAY);
};
$('#skipLink').addEventListener('click', e => { e.preventDefault(); const v = views[current]; v.setAttribute('tabindex', '-1'); v.focus(); });
addEventListener('hashchange', onNav);
addEventListener('popstate', onNav);

/* search lives in the navbar and always shows results in the catalog */
const clearSearchFields = () => $$('#search, #catSearch, #dbSearch').forEach(f => { f.value = ''; });
$$('#search, #catSearch, #dbSearch').forEach(f => f.addEventListener('input', e => {
  query = norm(e.target.value); page = 1;
  if (current !== 'catalog') {                   // jump to the catalog and keep typing in its own field (keyboard stays up)
    setHash('#products'); show('catalog'); toTop();
    const cs = $('#catSearch'); cs.value = e.target.value; e.target.value = ''; cs.focus({ preventScroll: true });
    if (e.target.id === 'search') e.target.blur();
  }
  if (query) cat = 'all';
  syncPills(); renderCatalog(false);
}));
$('#catSearch').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
$('#clearSearch').addEventListener('click', () => { query = ''; clearSearchFields(); cat = 'dates'; history.replaceState(null, '', '#products'); lastHash = location.hash; syncPills(); renderCatalog(); });
