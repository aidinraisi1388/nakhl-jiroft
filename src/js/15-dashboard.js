/* 15-dashboard.js — Customer dashboard: overview, live order card, notifications, purchase chart, orders, requests, addresses. */

/* ════════ CUSTOMER DASHBOARD ════════ */
let dashTab = 'overview';
const DASH_TABS = ['overview', 'orders', 'storage', 'addresses'];
const TIERS = [['جوانه', 0], ['نهال', 300], ['نخل', 800], ['نخلستان', 1500]];
const TRACK = [['ثبت سفارش', 0], ['تأیید سفارش', 1], ['بسته‌بندی در سالن سرد (۲ تا ۴ درجه)', 6], ['تحویل به کامیون یخچال‌دار', 20], ['در مسیر مقصد', 30], ['تحویل به مشتری', 48]];
const TRACK_AT = { pending: 1, processing: 2, shipped: 4, delivered: 5 };
const pm = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: 'numeric' }), mon = new Intl.DateTimeFormat('fa-IR', { month: 'long' }), yrFmt = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' });

function renderDash() {
  $('#dashBody').hidden = !user;
  if (!user) { $('#dashDock').hidden = true; return; }
  $('#actBanner').hidden = !user.viaAdmin;
  $('#actText').textContent = `حالت پشتیبانی: شما به‌عنوان مدیر، حساب «${user.name}» (${user.phone}) را مدیریت می‌کنید.`;
  setTab($('#dashTabs'), dashTab, $('#dashBody')); $('#dashBody').dataset.tab = dashTab;
  $$('#dashDock [data-tab]').forEach(b => b.dataset.tab === dashTab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  $('#dashDock').hidden = false;
  const ini = (user.name || 'م').trim()[0];
  $('#dbPAvatar').textContent = ini;
  $('#dbPName').textContent = user.name; $('#dbPPhone').textContent = user.phone;
  const mine = orders.filter(o => o.phone === user.phone), active = mine.filter(o => o.status !== 'delivered' && o.status !== 'unpaid');
  $('#dashTitle').textContent = user.name;
  $('#addrNeed').hidden = !(wantCheckout && dashTab === 'addresses');
  if (wantCheckout && dashTab === 'addresses' && matchMedia('(pointer:fine)').matches) setTimeout(() => $('#addrTitle').focus({ preventScroll: true }), 400);
  $('#dashName').textContent = user.name; $('#dashPhone').textContent = user.phone;
  $('#mActive').textContent = fa(active.length);
  $('#mKg').textContent = kgFa(mine.reduce((s, o) => s + kgOf(o), 0));
  $('#mDone').textContent = fa(mine.length - active.length);
  $('#dashBadge').textContent = fa(active.length); $('#dashBadge').hidden = !active.length;

  /* wallet & loyalty */
  const pts = Math.floor(mine.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0) / 10000);
  const ti = TIERS.reduce((a, t, i) => pts >= t[1] ? i : a, 0), next = TIERS[ti + 1];
  $('#wCredit').textContent = fa(wallet[user.phone] || 0); $('#wPoints').textContent = fa(pts);
  $('#wTierNow').textContent = 'سطح ' + TIERS[ti][0];
  $('#wTierNext').textContent = next ? `${fa(next[1] - pts)} امتیاز تا ${next[0]}` : 'بالاترین سطح';
  $('#wTierBar').style.transform = `scaleX(${next ? (pts - TIERS[ti][1]) / (next[1] - TIERS[ti][1]) : 1})`;
  $('#dashTier').innerHTML = `${svg('<path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17l-5.9 3 1.2-6.5L2.5 8.9 9.1 8z"/>', 13, 2)}عضو سطح ${TIERS[ti][0]}`;

  /* yearly analytics: kg per Persian month for the last 12 calendar months (current month included).
     Months are walked by the Persian calendar itself (not «30 days back»), so none is skipped or repeated. */
  const SHORT = { 'فروردین': 'فرو', 'اردیبهشت': 'ارد', 'خرداد': 'خرد', 'تیر': 'تیر', 'مرداد': 'مرد', 'شهریور': 'شهر', 'مهر': 'مهر', 'آبان': 'آبا', 'آذر': 'آذر', 'دی': 'دی', 'بهمن': 'بهم', 'اسفند': 'اسف' };
  const months = [];
  for (let d = new Date(now0); months.length < 12; d = new Date(d.getTime() - 5 * DAY)) {      // step back a few days at a time, keep each new month once
    const key = pm.format(d);
    if (!months.some(m => m.key === key)) months.unshift({ key, label: mon.format(d), yr: yrFmt.format(d), kg: 0 });
  }
  mine.filter(o => o.status !== 'unpaid').forEach(o => { const m = months.find(x => x.key === pm.format(o.date)); if (m) m.kg += kgOf(o); });
  const mx = Math.max(1, ...months.map(m => m.kg));
  $('#yTotal').textContent = kgFa(months.reduce((s, m) => s + m.kg, 0));
  $('#yChart').innerHTML = months.map((m, i) => {
    const now = i === months.length - 1, newYr = i > 0 && months[i - 1].yr !== m.yr;
    return `<div class="m-col${now ? ' now' : ''}" title="${m.label} ${m.yr}: ${kgFa(m.kg)} کیلوگرم">
      <span class="m-kg">${m.kg ? kgFa(m.kg) : ''}</span>
      <div class="m-bar"><i class="${m.kg ? 'has' : ''}" style="height:${m.kg ? Math.max(8, m.kg / mx * 100) : 4}%"></i></div>
      <span class="m-name"><span class="f">${m.label}</span><span class="s">${SHORT[m.label] || m.label}</span></span>
      <span class="m-yr">${newYr || i === 0 ? m.yr : '&nbsp;'}</span></div>`;
  }).join('');

  /* green "order on the way" card (latest active order) */
  const live = active[0];
  const STEP4 = ['پرداخت', 'بسته‌بندی سرد', 'ارسال', 'تحویل'], AT4 = { unpaid: 0, pending: 0, processing: 1, shipped: 2, delivered: 3 };
  const stName = s => (s === 'unpaid' ? UNPAID : STATUS[sIdx(s)])[1];
  if (live) {
    const at = AT4[live.status] ?? 0, code = `JRF-${live.id.split('-')[1]}-${live.phone.slice(-4)}`;
    $('#trackCard').innerHTML = `
      <div class="db-hero-top">
        <span class="db-hero-ic">${svg('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>', 20, 2)}</span>
        <div class="min-w-0 flex-1"><p class="db-hero-t">سفارش <span dir="ltr">${live.id}</span></p><p class="db-hero-s">${dateFa(live.date)} · ${fa(nItems(live))} کالا · ${kgFa(kgOf(live))} کیلوگرم</p></div>
        <span class="db-pill">${stName(live.status)}</span>
      </div>
      <ol class="db-steps" style="--p:${at / 3}">${STEP4.map((l, i) => `<li class="${i <= at ? 'on' : ''}${i === at ? ' cur' : ''}"><i></i><span>${l}</span></li>`).join('')}</ol>
      <div class="db-hero-foot">
        <span class="db-code"><small>کد رهگیری</small><b dir="ltr" class="latin">${code}</b></span>
        <button data-copy="${code}" class="db-ghost">${svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 14, 2)}کپی</button>
        <a href="#receipt/${live.id}" class="db-ghost db-ghost-w">رسید</a>
      </div>`;
  } else $('#trackCard').innerHTML = `
      <div class="db-hero-top"><span class="db-hero-ic">${svg('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>', 20, 2)}</span>
        <div class="min-w-0 flex-1"><p class="db-hero-t">الان سفارشی در راه ندارید</p><p class="db-hero-s">سفارش بعدی‌تان اینجا مرحله‌به‌مرحله دیده می‌شود.</p></div></div>
      <div class="db-hero-foot"><a href="#products" class="db-ghost db-ghost-w">${svg('<path d="m15 18-6-6 6-6"/>', 14, 2.4)}شروع خرید</a></div>`;


  /* cold storage / bulk inquiry status */
  const reqs = requests.filter(r => r.phone === user.phone), lastReq = reqs[0];
  {
    const NOTE = {
      unpaid:     ['پرداخت نشده', 'پرداخت را کامل کنید تا سفارش ثبت شود.'],
      pending:    ['پرداخت شد', 'به‌زودی بسته‌بندی می‌شود.'],
      processing: ['پرداخت و ثبت شد', 'در سالن سرد بسته‌بندی و آماده‌ی ارسال می‌شود.'],
      shipped:    ['ارسال شد', 'با کامیون یخچال‌دار در راه شماست.'],
      delivered:  ['تحویل داده شد', 'امیدواریم از خرمای تازه لذت ببرید.']
    };
    const notes = [
      ...mine.map(o => ({ d: o.date, href: `#receipt/${o.id}`, ic: o.status === 'shipped' ? 'truck' : o.status === 'delivered' ? 'home' : 'box',
        t: `سفارش <span dir="ltr">${o.id}</span> ${(NOTE[o.status] || NOTE.pending)[0]}`, s: (NOTE[o.status] || NOTE.pending)[1], k: o.id + o.status })),
      ...reqs.map(r => ({ d: r.date, dtab: 'storage', ic: 'snow',
        t: `${REQ_TYPES[r.type] || 'درخواست'} <span dir="ltr">${r.id}</span>`, s: r.status === 'approved' ? 'پیام نخل و ماه: درخواست شما تأیید شد؛ برای هماهنگی تماس می‌گیریم.' : r.status === 'closed' ? 'این درخواست بسته شد.' : 'پیام نخل و ماه: ثبت شد؛ تا ۲ ساعت کاری تماس می‌گیریم.', k: r.id + r.status }))
    ].sort((a, b) => b.d - a.d).slice(0, 8);
    const IC = { box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>', truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>', home: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>', snow: '<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/>' };
    const seenKey = 'nakhl:seen:' + user.phone, seen = new Set(store.get(seenKey, []) || []);
    const fresh = notes.filter(n => !seen.has(n.k)).length;
    $('#liveDot').hidden = !fresh;
    $('#dbNotesN').textContent = fresh ? fa(fresh) + ' تازه' : '';
    $('#dbNotesList').innerHTML = notes.length ? notes.map(n => `
      <li><${n.href ? `a href="${n.href}"` : `button type="button" data-dtab="${n.dtab}"`} class="db-note${seen.has(n.k) ? '' : ' new'}">
        <i>${svg(IC[n.ic], 16, 2)}</i><span class="min-w-0 flex-1"><b>${n.t}</b><small>${n.s}</small><em>${dateFa(n.d)}</em></span>
      </${n.href ? 'a' : 'button'}></li>`).join('') : `<li class="db-note-empty">اعلان تازه‌ای ندارید.</li>`;
    $('#dbBell').dataset.keys = JSON.stringify(notes.map(n => n.k)); $('#dbBell').dataset.phone = user.phone;
  }
  $('#reqCard').innerHTML = lastReq ? (() => { const step = lastReq.status === 'review' ? 1 : 2; return `
      <div class="flex items-center justify-between"><p class="font-display font-black text-cyprus">آخرین درخواست سردخانه</p><span class="grid h-10 w-10 place-items-center rounded-2xl bg-cyprus-soft text-cyprus">${svg('<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/>', 18, 2.2)}</span></div>
      <p class="mt-3 font-display text-lg font-black text-ink">${REQ_TYPES[lastReq.type] || 'درخواست'}</p>
      <p class="mt-1 text-xs text-ink-soft">${esc(lastReq.product)}${lastReq.qty ? ' · ' + esc(lastReq.qty) : ''} · ${dateFa(lastReq.date)}</p>
      <div class="mt-4">${reqPill(lastReq)}</div>
      <div class="mt-4 grid grid-cols-3 gap-1.5" aria-hidden="true">${['ثبت', 'بررسی', 'نتیجه'].map((l, i) => `<div><span class="block h-1.5 rounded-full ${i <= step ? 'bg-[#28622D]' : 'bg-cyprus/10'}"></span><span class="mt-1 block text-center text-[10px] ${i <= step ? 'text-cyprus' : 'text-ink-soft'}">${l}</span></div>`).join('')}</div>
      <button data-dtab="storage" class="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-bold text-cyprus hover:-translate-x-0.5">${fa(reqs.length)} درخواست · مشاهده‌ی همه ${svg('<path d="m15 18-6-6 6-6"/>', 13, 2.4)}</button>`; })()
    : `<p class="font-display font-black text-cyprus">درخواست سردخانه</p><p class="mt-3 text-sm text-ink-muted">هنوز درخواستی برای رزرو سالن یا خرید عمده ثبت نکرده‌اید.</p><a href="#storage" data-service="storage" class="btn-ghost mt-4 h-11 px-5 text-sm">ثبت درخواست</a>`;

  /* wishlist */

  $('#dashOrders').innerHTML = mine.length ? mine.map(o => `
    <li class="card p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div><p class="font-display font-black text-cyprus">سفارش <span dir="ltr">${o.id}</span></p><p class="mt-1 text-xs text-ink-soft">${dateFa(o.date)} · ${fa(nItems(o))} کالا · ${kgFa(kgOf(o))} کیلوگرم</p></div>
        <div class="flex items-center gap-3">${statusPill(o.status)}<p class="font-display text-lg font-black tabular-nums text-cyprus">${fa(o.total)} <span class="text-[11px] font-bold text-cyprus-mid">تومان</span></p></div>
      </div>
      <div class="mt-3 flex items-center gap-1.5">${thumbs(o.items)}${o.status === 'unpaid' ? `<button data-pay="${o.id}" class="btn-cyprus ms-auto h-9 px-4 text-xs">پرداخت</button>` : ''}<a href="#receipt/${o.id}" class="ease-ui ${o.status === 'unpaid' ? '' : 'ms-auto '} inline-flex h-9 items-center gap-1 rounded-full border border-cyprus/15 px-3 text-xs font-bold text-cyprus hover:border-cyprus hover:bg-cyprus hover:text-white active:scale-95">${svg('<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6"/>', 14, 2)}رسید</a></div>
      ${chain(o.status)}
    </li>`).join('') : empty('هنوز سفارشی ثبت نکرده‌اید', '#products', 'شروع خرید');

  $('#dashRequests').innerHTML = reqs.length ? reqs.map(r => `
    <li class="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyprus-soft text-cyprus">${svg('<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/>', 18, 2.2)}</span>
        <div><p class="font-display font-black text-cyprus">${REQ_TYPES[r.type] || 'درخواست'} · <span dir="ltr">${r.id}</span></p><p class="mt-1 text-xs text-ink-soft">${esc(r.product)}${r.qty ? ' · ' + esc(r.qty) : ''} · ${dateFa(r.date)}</p></div></div>
      ${reqPill(r)}
    </li>`).join('') : empty('هنوز درخواستی برای سردخانه ثبت نکرده‌اید', '#storage', 'ثبت درخواست');

  const book = addrBook[user.phone] || [];
  $('#addrList').innerHTML = book.length ? book.map((a, i) => `
    <li class="card flex items-start gap-3 p-5">
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand text-cyprus">${svg('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 18, 2.2)}</span>
      <div class="min-w-0 flex-1"><p class="font-display font-black text-cyprus">${esc(a.title)} <span class="text-xs font-bold text-ink-soft">· ${esc(a.city)}</span></p><p class="mt-1 text-sm leading-7 text-ink-muted">${esc(a.text)}</p>${a.postal ? `<p class="text-xs text-ink-soft">کد پستی: <span dir="ltr">${esc(a.postal)}</span></p>` : ''}</div>
      <button data-del-addr="${i}" class="ease-ui grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-sand hover:text-cyprus active:scale-90" aria-label="حذف آدرس ${esc(a.title)}">${TRASH}</button>
    </li>`).join('') : `<li class="rounded-3xl border border-dashed border-cyprus/20 p-6 text-center text-sm text-ink-muted sm:col-span-2">هنوز آدرسی ذخیره نکرده‌اید.</li>`;

}
const goDashTab = t => { const to = t === 'overview' ? '#dashboard' : '#dashboard/' + t; if (location.hash !== to) location.hash = to; else scrollTo({ top: 0, behavior: smooth }); };
$('#dashTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) goDashTab(b.dataset.tab); });
$('#dashDock').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; goDashTab(b.dataset.tab); scrollTo({ top: 0, behavior: smooth }); });
{
  const bell = $('#dbBell'), box = $('#dbNotes');
  const setNotes = open => {
    box.hidden = !open; bell.setAttribute('aria-expanded', open);
    if (open) {           // opening the panel marks everything in it as seen
      if (bell.dataset.phone) store.set('nakhl:seen:' + bell.dataset.phone, JSON.parse(bell.dataset.keys || '[]'));
      $('#liveDot').hidden = true; $('#dbNotesN').textContent = '';
      requestAnimationFrame(() => box.classList.add('on'));
    } else box.classList.remove('on');
  };
  bell.addEventListener('click', e => { e.stopPropagation(); setNotes(box.hidden); });
  box.addEventListener('click', e => { if (e.target.closest('a,button')) { $$('.db-note.new', box).forEach(n => n.classList.remove('new')); setNotes(false); } });
  document.addEventListener('pointerdown', e => { if (!box.hidden && !e.target.closest('#dbNotes, #dbBell')) setNotes(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) setNotes(false); });
  addEventListener('hashchange', () => { if (!box.hidden) setNotes(false); });
}
/* phones: hide the bottom bars while the keyboard is up */
if (matchMedia('(pointer:coarse)').matches) {
  const typing = el => el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]),textarea,select');
  document.addEventListener('focusin', e => { if (typing(e.target)) document.documentElement.classList.add('typing'); });
  document.addEventListener('focusout', () => setTimeout(() => { if (!typing(document.activeElement)) document.documentElement.classList.remove('typing'); }, 60));
}
$('#dashBody').addEventListener('click', e => {
  const pz = e.target.closest('[data-pay]'); if (pz) { const o = orders.find(x => x.id === pz.dataset.pay); if (o) startPay(o); return; }
  const t = e.target.closest('[data-dtab]'); if (t) { goDashTab(t.dataset.dtab); scrollTo({ top: 0, behavior: smooth }); return; }
  const add = e.target.closest('[data-qadd]');
  if (add) { const id = add.dataset.qadd; setQty(id, (cart[id] || 0) + 1); fly(add, () => { bump($('#cartCount')); updateBar(true); }, id); toast(`${byId[id].name} به سبد اضافه شد`); return; }
  const cp = e.target.closest('[data-copy]');
  if (cp) { try { navigator.clipboard.writeText(cp.dataset.copy).then(() => toast('کد رهگیری کپی شد'), () => toast(cp.dataset.copy)); } catch { toast(cp.dataset.copy); } }
});
$('#addrForm').addEventListener('submit', e => {
  e.preventDefault();
  const t = $('#addrTitle').value.trim(), c = $('#addrCity').value.trim(), x = $('#addrText').value.trim(), pc = toLatin($('#addrPostal').value), m = $('#addrMsg');
  const bad = !t ? 'عنوان آدرس را وارد کنید.' : !c ? 'شهر را وارد کنید.' : !x ? 'نشانی کامل را وارد کنید.' : pc && !/^\d{10}$/.test(pc) ? 'کد پستی باید ۱۰ رقم باشد.' : '';
  if (bad) { m.textContent = bad; m.className = 'min-h-[1.25rem] text-sm font-bold text-red-700'; return; }
  (addrBook[user.phone] = addrBook[user.phone] || []).push({ title: t, city: c, text: x, postal: pc });
  store.set('nakhl:addr:v2', addrBook); e.target.reset();
  m.textContent = 'آدرس ذخیره شد.'; m.className = 'min-h-[1.25rem] text-sm font-bold text-cyprus'; renderDash();
  if (wantCheckout && count()) { wantCheckout = false; toast('آدرس ذخیره شد؛ برویم برای پرداخت'); setTimeout(() => { location.hash = '#checkout'; }, 350); }
});
$('#addrList').addEventListener('click', e => {
  const b = e.target.closest('[data-del-addr]'); if (!b) return;
  addrBook[user.phone].splice(+b.dataset.delAddr, 1); store.set('nakhl:addr:v2', addrBook); renderDash(); toast('آدرس حذف شد');
});
