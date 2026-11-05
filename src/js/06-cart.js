/* 06-cart.js — Cart: quantities, add-to-cart flight animation, floating cart capsule, cart drawer, promo code form, checkout start. */

/* ── Cart state ── */
const timers = new WeakMap();
const setQty = (id, q) => {
  q = Math.max(0, Math.min(99, byId[id].stock, q));
  if (q) cart[id] = q; else delete cart[id];
  $$(`.buy[data-id="${id}"]`).forEach(b => { if (b.dataset.state !== 'added' || !q) b.dataset.state = q ? 'open' : 'idle'; $('.num', b).textContent = fa(q); });
  $('#cartCount').textContent = fa(count()); $('#cartPill').classList.toggle('has-items', count() > 0);
  store.set('nakhl:cart', cart);
  updateBar();
  if (drawerOpen) renderCart();
};

/* one-shot flying product: the product photo (or the sphere when it has none) flies into the cart pill — a single transform animation */
const fly = (from, done, id) => {
  const to = $('#cartPill');
  if (reduce || !from.animate) { done(); return; }
  const p = byId[id], img = p && p.img, S = img ? 64 : 28, h = S / 2;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const x0 = a.left + a.width / 2 - h, y0 = a.top + a.height / 2 - h;
  const dx = b.left + b.width / 2 - h - x0, dy = b.top + b.height / 2 - h - y0;
  const dot = document.createElement(img ? 'img' : 'span'); dot.className = img ? 'fly im ph' : 'fly';
  if (img) { dot.src = img.replace('.webp', '-400.webp'); dot.alt = ''; dot.decoding = 'async'; }
  dot.style.left = x0 + 'px'; dot.style.top = y0 + 'px';
  document.body.appendChild(dot);
  dot.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
    { transform: `translate(${dx * .45}px,${dy * .45 - 90}px) scale(.9) rotate(-8deg)`, opacity: 1, offset: .45 },
    { transform: `translate(${dx}px,${dy}px) scale(.3) rotate(-14deg)`, opacity: .5 }
  ], { duration: 700, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' }).onfinish = () => { dot.remove(); done(); };
};

document.addEventListener('click', e => {
  const buy = e.target.closest('.buy');
  if (buy) {
    const id = buy.dataset.id, q = cart[id] || 0;
    const add = e.target.closest('.add'), inc = e.target.closest('.inc'), dec = e.target.closest('.dec');
    if (add && buy.dataset.state === 'idle') {
      buy.dataset.state = 'added';               // instant feedback: "افزوده شد ✓"
      setQty(id, q + 1);
      fly(add, () => { bump($('#cartCount')); updateBar(true); }, id);
      clearTimeout(timers.get(buy));
      timers.set(buy, setTimeout(() => { if (cart[id]) { buy.dataset.state = 'open'; $('.inc', buy).focus({ preventScroll: true }); } else buy.dataset.state = 'idle'; }, 900));
    }
    if (inc) { setQty(id, q + 1); bump($('#cartCount')); }
    if (dec) { setQty(id, q - 1); if (q - 1 === 0) $('.add', buy).focus({ preventScroll: true }); }
    return;
  }
  const quick = e.target.closest('.quick');
  if (quick) openQV(quick.closest('.p-card').dataset.id, quick);
  if (e.target.closest('#qvOverlay, #qvClose')) closeQV();
});

/* ── Quick view: bottom sheet on phones, centered card on desktop (same card → add keeps working) ── */
let qvFrom = null;
function openQV(id, from) {
  qvFrom = from; $('#qvBody').innerHTML = cardHTML(byId[id]);
  $('#qv').hidden = false; $('#qvOverlay').hidden = false; document.documentElement.classList.add('qv-lock');
  setTimeout(() => $('#qvClose').focus({ preventScroll: true }), 30);
}
function closeQV() {
  if ($('#qv').hidden) return false;
  $('#qv').hidden = true; $('#qvOverlay').hidden = true; document.documentElement.classList.remove('qv-lock');
  qvFrom && document.contains(qvFrom) && qvFrom.focus({ preventScroll: true }); return true;
}

/* ── Floating cart capsule ── */
const bar = $('#cartBar');
function updateBar(animate) {
  const n = count();
  $('#barCount').textContent = fa(n);
  $('#barTotal').textContent = fa(totals().total);
  bar.classList.toggle('show', n > 0 && !drawerOpen); document.body.classList.toggle('cart-on', n > 0);
  bar.tabIndex = n > 0 && !drawerOpen ? 0 : -1;
  bar.setAttribute('aria-hidden', !(n > 0 && !drawerOpen));
  if (animate) bump($('#cartBarIcon'));
}

/* ── Cart drawer ── */
const drawer = $('#cartDrawer'), overlay = $('#cartOverlay');
let drawerOpen = false, lastFocus = null;
function renderCart() {
  const items = Object.entries(cart), n = count(), t = totals();
  $('#cartItems').innerHTML = items.map(([id, q]) => { const p = byId[id]; return `
    <li class="flex items-center gap-3 rounded-3xl bg-white/80 p-3 ring-1 ring-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_rgba(40,98,45,0.06)]">
      <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sand-light">${thumb(p, ' mini')}</div>
      <div class="min-w-0 flex-1">
        <p class="truncate font-display text-sm font-extrabold text-cyprus">${p.name}</p>
        <p class="mt-0.5 text-[11px] leading-5 text-ink-soft">${p.unit}<span class="block whitespace-nowrap">هر عدد ${fa(p.price)} تومان</span></p>
        <p class="mt-1.5 font-display text-[15px] font-black tabular-nums text-cyprus">${fa(p.price * q)} <span class="text-[10px] font-bold text-cyprus-mid">تومان</span></p>
      </div>
      <div class="flex shrink-0 flex-col items-end gap-2">
        <button class="ease-ui grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-sand hover:text-cyprus active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyprus" data-act="del" data-id="${id}" aria-label="حذف ${p.name} از سبد">${TRASH}</button>
        <div class="stepper sm flex items-center gap-1 rounded-full bg-cyprus-soft p-1" role="group" aria-label="تعداد ${p.name}">
          <button data-act="dec" data-id="${id}" aria-label="کم کردن یکی">${MINUS_S}</button>
          <span class="num">${fa(q)}</span>
          <button data-act="inc" data-id="${id}" aria-label="افزودن یکی دیگر">${PLUS_S}</button>
        </div>
      </div>
    </li>`; }).join('');
  $('#cartItems').hidden = !items.length;
  $('#cartFoot').hidden = !items.length;
  $('#cartEmpty').hidden = !!items.length;
  $('#drawerCount').textContent = fa(n);
  const pct = Math.min(1, t.sub / FREE_SHIP);
  $('#shipBar').style.transform = `scaleX(${pct})`;
  $('#shipProgress').setAttribute('aria-valuenow', Math.round(pct * 100));
  $('#shipText').innerHTML = !t.sub ? 'برای ارسال رایگان محصول اضافه کنید'
    : t.free ? 'ارسال سرد سفارش شما <b class="font-display text-cyprus">رایگان</b> شد'
    : `فقط <b class="font-display text-cyprus">${fa(FREE_SHIP - t.sub)} تومان</b> تا ارسال رایگان`;
  $('#cartSubtotal').textContent = fa(t.sub);
  $('#discRow').hidden = !t.disc;
  $('#cartDisc').textContent = fa(t.disc);
  $('#discLabel').textContent = promo ? `تخفیف (${promo.code})` : 'تخفیف';
  $('#cartShipping').textContent = t.free ? 'رایگان' : 'بر اساس نشانی';
  $('#cartShipping').className = 'font-display font-bold ' + (t.free ? 'text-cyprus' : 'text-ink-muted');
  $('#cartTotal').textContent = fa(t.total);
}
const focusables = (root = drawer) => $$('button:not([disabled]), a[href], input, select', root).filter(el => !el.closest('[hidden]'));
const trapTab = root => e => {          // keep Tab inside a dialog
  if (e.key !== 'Tab') return;
  const f = focusables(root); if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
};
const openCart = () => {
  lastFocus = document.activeElement; drawerOpen = true; renderCart();
  drawer.inert = false; drawer.classList.add('open'); overlay.classList.add('open');
  document.documentElement.classList.add('lock'); updateBar();
  setTimeout(() => $('#closeCart').focus({ preventScroll: true }), 60);
};
const closeCart = (restore = true) => {
  if (!drawerOpen) return;
  drawerOpen = false; drawer.classList.remove('open'); overlay.classList.remove('open'); drawer.inert = true;
  document.documentElement.classList.remove('lock'); updateBar();
  if (restore && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
};
$('#cartPill').addEventListener('click', openCart);
bar.addEventListener('click', openCart);
$('#closeCart').addEventListener('click', () => closeCart());
overlay.addEventListener('click', () => closeCart());
/* iPhone: the page behind an open sheet must not scroll, and a tap on the dark backdrop must always close it */
[overlay, $('#qvOverlay')].forEach(o => o.addEventListener('touchmove', e => e.preventDefault(), { passive: false }));
$('#qvOverlay').addEventListener('click', () => closeQV());
drawer.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (b) {
    const id = b.dataset.id, q = cart[id] || 0, act = b.dataset.act;
    setQty(id, act === 'inc' ? q + 1 : act === 'dec' ? q - 1 : 0);
    if (!cart[id]) { const first = focusables()[0]; first && first.focus(); }
    else { const again = $(`[data-act="${act}"][data-id="${id}"]`, drawer); again && again.focus(); }
  }
  if (e.target.closest('[data-close-cart]')) closeCart(false);
});
drawer.addEventListener('keydown', trapTab(drawer));
$('#promoForm').addEventListener('submit', e => {
  e.preventDefault();
  const code = toLatin($('#promoInput').value).toUpperCase(), m = $('#promoMsg');
  if (!code) { promo = null; m.textContent = ''; }
  else if (PROMOS[code] && user && promoUsed(code, user.phone)) { promo = null; m.textContent = `شما قبلاً از کد ${code} استفاده کرده‌اید؛ هر کد فقط یک بار.`; m.className = 'mt-2 min-h-[1rem] text-xs font-bold text-red-700'; }
  else if (PROMOS[code]) { promo = { code, ...PROMOS[code] }; m.textContent = `کد ${code} اعمال شد: ${PROMOS[code].label}`; m.className = 'mt-2 min-h-[1rem] text-xs font-bold text-cyprus'; }
  else { promo = null; m.textContent = 'این کد تخفیف معتبر نیست.'; m.className = 'mt-2 min-h-[1rem] text-xs font-bold text-red-700'; }
  renderCart(); updateBar();
});
/* checkout: log in with OTP first (if needed), then the order is registered */
/* checkout needs: 1) signed in  2) at least one saved address — only then the checkout page (and the gateway) */
let wantCheckout = false;
const hasAddr = () => user && (addrBook[user.phone] || []).length > 0;
function goCheckout() {
  if (hasAddr()) { location.hash = '#checkout'; return; }
  wantCheckout = true;
  if (location.hash === '#dashboard/addresses') { renderDash(); scrollTo({ top: 0, behavior: smooth }); } else location.hash = '#dashboard/addresses';
  toast('برای ادامه‌ی خرید، اول آدرس تحویل را ثبت کنید');
}
$('#checkout').addEventListener('click', () => { if (!count()) return; closeCart(false); openLogin(goCheckout); });
