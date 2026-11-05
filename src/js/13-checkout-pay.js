/* 13-checkout-pay.js — Checkout page (receiver, delivery, address) and Zibal payment: request → bank → verify → order registered. */

/* ════════ CHECKOUT → PAYMENT ════════
   Flow: cart → #checkout (receiver, delivery, address) → order saved as «unpaid» → Zibal gateway →
   bank sends the buyer back here → payment verified → order becomes «در حال بسته‌بندی» by itself (no manager approval). */
const PAY = {
  api: '',            // your own server, e.g. 'https://nakhljiroft.ir/api' (pay-request.php / pay-verify.php). Empty = Zibal test mode
  merchant: 'zibal'   // Zibal's public test merchant. The REAL merchant code lives only on your server, never in this file
};
const toLatinD = s => String(s || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const faD = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);   // digits only, no thousands separator (postal codes)
const shipCost = (ship, t) => ship === 'pickup' || t.free ? 'رایگان' : 'پس‌کرایه (هنگام تحویل)';
let ckAddr = 0;                                 // index of the chosen saved address, -1 = new address
function renderCheckout() {
  const t = totals(), book = addrBook[user.phone] || [], ship = ($('input[name="ckShip"]:checked') || {}).value || 'cold';
  if (!$('#ckName').value) $('#ckName').value = user.name || '';
  if (!$('#ckPhone').value) $('#ckPhone').value = user.phone || '';
  if (ckAddr < 0 || ckAddr >= book.length) ckAddr = 0;
  $('#ckAddrList').innerHTML = book.map((a, i) => `
    <label class="ck-opt"><input type="radio" name="ckAddr" value="${i}" ${i === ckAddr ? 'checked' : ''}><span class="min-w-0 flex-1"><b>${esc(a.title || 'آدرس ' + fa(i + 1))}</b><small>${esc(a.city)}، ${esc(a.text)}${a.postal ? ' · کد پستی ' + faD(a.postal) : ''}</small></span></label>`).join('')
    ;
  $('#ckAddrBox').hidden = ship === 'pickup';
  $('#ckShipCost').textContent = t.free ? 'رایگان' : 'پس‌کرایه';
  $('#ckCount').textContent = fa(count());
  $('#ckItems').innerHTML = Object.entries(cart).map(([id, q]) => { const p = byId[id]; return `
    <li><span class="ck-thumb">${thumb(p, ' mini')}</span><span class="min-w-0 flex-1"><b>${p.name}</b><small>${p.unit} · ${fa(q)} عدد</small></span><span class="ck-pr">${fa(p.price * q)}</span></li>`; }).join('');
  $('#ckSub').textContent = fa(t.sub) + ' تومان';
  $('#ckDiscRow').hidden = !t.disc; $('#ckDisc').textContent = '− ' + fa(t.disc) + ' تومان'; $('#ckDiscL').textContent = promo ? `تخفیف (${promo.code})` : 'تخفیف';
  $('#ckShipSum').textContent = shipCost(ship, t);
  $('#ckTotal').textContent = fa(t.total);
  $('#ckPay span').textContent = `پرداخت ${fa(t.total)} تومان`;
  $('#ckErr').textContent = '';
}
$('#ckForm').addEventListener('change', e => {
  if (e.target.name === 'ckAddr') { ckAddr = +e.target.value; renderCheckout(); }
  if (e.target.name === 'ckShip') renderCheckout();
});
$('#ckAddAddr').addEventListener('click', () => { wantCheckout = true; location.hash = '#dashboard/addresses'; });
$('#ckForm').addEventListener('submit', e => {
  e.preventDefault();
  const t = totals(); if (!t.sub || !user) return;
  const err = (m, f) => { $('#ckErr').textContent = m; if (f) { f.focus(); f.classList.add('shake'); setTimeout(() => f.classList.remove('shake'), 500); } };
  const name = $('#ckName').value.trim(), rph = toLatinD($('#ckPhone').value).replace(/\D/g, '');
  const ship = $('input[name="ckShip"]:checked').value, book = addrBook[user.phone] || [];
  if (name.length < 3) return err('نام و نام خانوادگی گیرنده را بنویسید.', $('#ckName'));
  if (!/^09\d{9}$/.test(rph)) return err('شماره موبایل گیرنده درست نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹).', $('#ckPhone'));
  let addr = 'تحویل حضوری از سردخانه‌ی نخل و ماه، بندرعباس';
  if (ship === 'cold') {
    const a = book[ckAddr];
    if (!a) { err('یک آدرس تحویل انتخاب کنید.'); return goCheckout(); }
    addr = `${a.city}، ${a.text}${a.postal ? ' · کد پستی ' + faD(a.postal) : ''}`;
  }
  // one unpaid order per customer: starting a new checkout replaces the unfinished one
  orders = orders.filter(o => !(o.phone === user.phone && o.status === 'unpaid'));
  const id = 'NKH-' + (Math.max(1046, ...orders.map(o => +o.id.split('-')[1] || 0)) + 1);
  const items = Object.entries(cart).map(([pid, q]) => [pid, q, byId[pid].price]);
  const o = { id, phone: user.phone, name, rphone: rph, addr, ship, note: $('#ckNote').value.trim(), items, sub: t.sub, disc: t.disc, promo: t.disc && promo ? promo.code : null, free: t.free || ship === 'pickup', total: t.total, date: Date.now(), status: 'unpaid', tries: 0 };
  orders.unshift(o); saveOrders(); store.set('nakhl:cartOrder', id);
  // TODO (server): save the order in your database here — the server must re-check prices, stock and the promo code
  startPay(o);
});

/* ── Zibal: request → bank page → callback → verify ── */
const payBase = () => location.origin + location.pathname;          // Zibal adds ?success=&status=&trackId=&orderId= to this
let paying = null;                                                  // id of the order whose payment is in flight → its pay screen shows «در حال اتصال», never «ناموفق»
async function startPay(o) {
  o.tries = (o.tries || 0) + 1; saveOrders();
  if (!PAY.api) {                                                   // no server yet → straight to the built-in test gateway, no flash, no network call
    paying = null;
    if (location.hash === '#pay/test/' + o.id) renderPay(o, 'test'); else location.hash = '#pay/test/' + o.id;
    return;
  }
  paying = o.id;
  if (location.hash === '#pay/' + o.id) renderPay(o, 'wait'); else location.hash = '#pay/' + o.id;   // the router renders 'wait' too while paying === o.id
  const body = { amount: o.total * 10, callbackUrl: payBase(), orderId: o.id, attempt: o.tries, mobile: o.rphone || o.phone, items: o.items, addr: o.addr, name: o.name, description: `سفارش ${o.id} · نخل و ماه` };   // amount in Rial; orderId is the stable id, attempt makes Zibal's id unique per try
  try {
    const r = await fetch(PAY.api + '/pay-request.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!j.trackId || (j.result && j.result !== 100)) throw new Error(j.message || 'request failed');
    o.trackId = j.trackId; saveOrders();
    location.href = j.startUrl || ('https://gateway.zibal.ir/start/' + j.trackId);                // off to the bank's own secure page
  } catch (err) {
    paying = null;
    renderPay(o, 'fail', 'اتصال به درگاه برقرار نشد. اینترنت را بررسی کنید و دوباره تلاش کنید.');
  }
}
/* the bank sends the buyer back to payBase()?success=1&status=2&trackId=…&orderId=NKH-1047_1 */
function handlePayReturn() {
  const q = new URLSearchParams(location.search); if (!q.has('trackId')) return false;
  const oid = (q.get('orderId') || '').split('_')[0], o = orders.find(x => x.id === oid), track = q.get('trackId');
  history.replaceState(null, '', payBase() + (o ? '#pay/' + o.id : '#top'));
  if (!o) { route(); return true; }
  route(); renderPay(o, 'wait', 'در حال تأیید پرداخت با بانک…');
  if (o.status !== 'unpaid') { renderPay(o); return true; }                      // already verified (page refreshed)
  if (q.get('success') !== '1') { renderPay(o, 'fail', 'پرداخت انجام نشد یا لغو شد. مبلغی از حساب شما کم نشده؛ اگر کم شده باشد تا ۷۲ ساعت به حساب برمی‌گردد.'); return true; }
  verifyPay(o, track);
  return true;
}
async function verifyPay(o, trackId) {
  try {
    const r = PAY.api
      ? await fetch(PAY.api + '/pay-verify.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId, orderId: o.id }) })
      : await fetch('https://gateway.zibal.ir/v1/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ merchant: PAY.merchant, trackId: +trackId }) });
    const j = await r.json();
    const ok = PAY.api ? j.paid : (j.result === 100 || j.result === 201) && (!j.amount || j.amount === o.total * 10);
    if (!ok) throw new Error(j.message || 'not verified');
    markPaid(o, j.refNumber || j.refId || trackId);
  } catch (err) { renderPay(o, 'fail', 'بانک پرداخت را تأیید نکرد. اگر مبلغ از حسابتان کم شده، تا ۷۲ ساعت برمی‌گردد.'); }
}
function markPaid(o, ref) {
  if (o.status !== 'unpaid') return renderPay(o);
  Object.assign(o, { status: 'processing', paid: true, paidAt: Date.now(), ref: String(ref) });   // ← registered automatically, straight to cold packing
  o.items.forEach(([pid, q]) => { if (byId[pid]) byId[pid].stock = Math.max(0, byId[pid].stock - q); });
  saveOrders(); saveInv();
  if (store.get('nakhl:cartOrder', null) === o.id) {                            // empty the cart this order came from
    Object.keys(cart).forEach(k => setQty(k, 0)); store.set('nakhl:cartOrder', null);
    promo = null; $('#promoInput').value = ''; $('#promoMsg').textContent = '';
  }
  renderHome(); dashTab = 'overview';
  renderPay(o);
}
function renderPay(o, state, msg) {
  state = state || (o.status === 'unpaid' ? 'fail' : 'ok');
  const IC = { ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', fail: '<path d="M18 6 6 18M6 6l12 12"/>', wait: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>', test: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>' };
  $('#payIc').className = 'pay-ic ' + state; $('#payIc').innerHTML = svg(IC[state], 30, 2.4);
  const row = (k, v, ltr) => `<div><dt>${k}</dt><dd${ltr ? ' dir="ltr"' : ''}>${v}</dd></div>`;
  $('#payInfo').innerHTML = row('شماره سفارش', o.id, true) + row('مبلغ', `${fa(o.total)} تومان`) + (o.ref ? row('کد پیگیری بانک', esc(o.ref), true) : '');
  const T = {
    wait: ['در حال اتصال به درگاه…', msg || 'چند لحظه صبر کنید؛ به صفحه‌ی امن بانک منتقل می‌شوید.'],
    ok:   ['پرداخت موفق بود', 'سفارش شما ثبت شد و برای بسته‌بندی سرد به سردخانه رفت. وضعیت ارسال را از داشبورد ببینید.'],
    fail: ['پرداخت انجام نشد', msg || 'سفارش هنوز پرداخت نشده است. می‌توانید دوباره تلاش کنید.'],
    test: ['درگاه پرداخت آزمایشی', 'این صفحه جای درگاه بانک را در حالت آزمایشی می‌گیرد و هیچ پولی جابه‌جا نمی‌شود. بعد از وصل شدن سرور و مرچنت واقعی زیبال، خریدار به درگاه بانک می‌رود.']
  }[state];
  $('#payTitle').textContent = T[0]; $('#payText').textContent = T[1];
  $('#payActions').innerHTML = {
    wait: '',
    ok: `<a href="#receipt/${o.id}" class="btn-cyprus h-14 w-full text-base">مشاهده‌ی رسید</a><a href="#dashboard" class="btn-ghost h-12 w-full text-sm">پیگیری در داشبورد</a>`,
    fail: `<button data-pay-again="${o.id}" class="btn-cyprus h-14 w-full text-base">تلاش دوباره برای پرداخت</button><a href="#checkout" class="btn-ghost h-12 w-full text-sm">بازگشت و ویرایش سفارش</a>`,
    test: `<button data-pay-test="ok" data-oid="${o.id}" class="btn-cyprus h-14 w-full text-base">پرداخت موفق (آزمایشی)</button><button data-pay-test="no" data-oid="${o.id}" class="btn-ghost h-12 w-full text-sm">انصراف از پرداخت</button>`
  }[state];
}
$('#payActions').addEventListener('click', e => {
  const again = e.target.closest('[data-pay-again]'); if (again) { const o = orders.find(x => x.id === again.dataset.payAgain); if (o) startPay(o); return; }
  const t = e.target.closest('[data-pay-test]'); if (!t) return;
  const o = orders.find(x => x.id === t.dataset.oid); if (!o) return;
  history.replaceState(null, '', '#pay/' + o.id); lastHash = location.hash;
  t.dataset.payTest === 'ok' ? markPaid(o, 'TEST-' + Date.now().toString().slice(-8)) : renderPay(o, 'fail', 'پرداخت را لغو کردید. سفارش هنوز پرداخت نشده است.');
});
