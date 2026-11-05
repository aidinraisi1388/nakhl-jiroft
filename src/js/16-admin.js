/* 16-admin.js — Admin panel: stats, orders, inventory & prices, cold-storage halls & requests, customers & support. */

/* ════════ ADMIN PANEL ════════ */
const HALLS = [                        // sample hall data → 3,900 of 5,000 t = 78%
  { name: 'سالن ۱ · مضافتی', cap: 1500, used: 1260, temp: '+2.4', hum: 85 },
  { name: 'سالن ۲ · پیارم',  cap: 1200, used: 1010, temp: '+3.1', hum: 82 },
  { name: 'سالن ۳ · کلوته',  cap: 1300, used: 930,  temp: '+2.8', hum: 84 },
  { name: 'سالن ۴ · خشکبار', cap: 1000, used: 700,  temp: '+3.6', hum: 65 }
];
const CAT_FA = { mazafati: 'مضافتی', piarom: 'پیارم', kaluteh: 'کلوته', khoshk: 'خرمای خشک', dried: 'خشکبار' };
const TITLES = { stats: 'آمار و داشبورد', orders: 'مدیریت سفارش‌ها', inventory: 'کنترل موجودی و قیمت', storage: 'وضعیت سردخانه', customers: 'مشتریان و پشتیبانی' };
const saveWallet = () => store.set('nakhl:wallet:v2', wallet);
let admTab = 'stats', admFilter = 'all';
const ring = pct => `conic-gradient(#28622D 0 ${pct}%, #E3F2E5 ${pct}% 100%)`;
const seg = (o) => `<div class="flex rounded-full bg-sand p-1" role="group" aria-label="وضعیت سفارش ${o.id}">${STATUS.filter(([v]) => v !== 'pending').map(([v, l]) =>
    `<button data-oid="${o.id}" data-st="${v}" aria-pressed="${v === o.status}" class="ease-ui h-8 flex-1 whitespace-nowrap rounded-full px-2 font-display text-[11px] font-bold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyprus ${v === o.status ? 'bg-[#28622D] text-white shadow-[0_6px_14px_-6px_rgba(40,98,45,.6)]' : 'text-cyprus-mid hover:bg-white'}">${l.replace('در حال ', '')}</button>`).join('')}</div>`;
const orderRow = o => `
    <li class="card grid gap-4 p-5 lg:grid-cols-[1fr_1.4fr_1fr_300px] lg:items-center lg:gap-5">
      <div><p class="font-display font-black text-cyprus" dir="ltr" style="text-align:right">${o.id}</p><p class="mt-1 text-xs text-ink-soft">${dateFa(o.date)} · ${kgFa(kgOf(o))} کیلوگرم</p></div>
      <div class="min-w-0 text-sm"><p class="font-display font-bold text-ink">${esc(o.name || custName(o.phone))} <span class="tel text-xs font-normal text-ink-soft" dir="ltr">${esc(o.rphone || o.phone)}</span></p><p class="mt-1 line-clamp-2 text-xs leading-6 text-ink-soft">${o.items.map(([id, q]) => `<span class="whitespace-nowrap">${byId[id].name} × ${fa(q)}</span>`).join('، ')}</p></div>
      <div class="flex items-center gap-2"><p class="font-display text-lg font-black tabular-nums text-cyprus">${fa(o.total)} <span class="text-[11px] font-bold text-cyprus-mid">تومان</span></p>
        <button data-print="${o.id}" class="ease-ui ms-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-cyprus/15 bg-white px-3 text-xs font-bold text-cyprus hover:border-cyprus hover:bg-cyprus hover:text-white active:scale-95 lg:ms-0" aria-label="چاپ فاکتور ${o.id}">${svg('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>', 15, 2)}فاکتور</button></div>
      ${seg(o)}
      <div class="adm-ship lg:col-span-4">${svg(o.ship === 'pickup' ? '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>' : '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', 15, 2)}<span class="min-w-0"><b>${o.ship === 'pickup' ? 'تحویل حضوری' : 'ارسال به'}:</b> ${esc(o.addr || 'هماهنگی تلفنی')}${o.note ? `<br><b>توضیح مشتری:</b> ${esc(o.note)}` : ''}${o.ref ? `<br><b>کد پیگیری بانک:</b> <span dir="ltr">${esc(o.ref)}</span>` : ''}</span></div>
    </li>`;

const clock = d => new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(d));
function renderAdmin() {
  $('#admGuest').hidden = !!admin; $('#admBody').hidden = !admin; $('#admDock').hidden = !admin;
  if (!admin) return;
  setTab($('#admTabs'), admTab, $('#admBody')); $('#admBody').dataset.tab = admTab;
  $('#admSecTitle').textContent = TITLES[admTab];
  $$('#admDock [data-tab]').forEach(b => b.dataset.tab === admTab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  $('#admTitle').textContent = TITLES[admTab];
  $('#admPhone').textContent = admin.phone;
  $('#admName').textContent = admin.name;
  const k = s => orders.filter(o => o.status === s).length;
  $('#admNewBadge').textContent = fa(k('processing')); $('#admNewBadge').hidden = !k('processing');
  $('#admDockBadge').textContent = fa(k('processing')); $('#admDockBadge').hidden = !k('processing');
  /* bell: newly paid orders (ready to pack) and cold-storage requests still under review */
  {
    const seen = new Set(store.get('nakhl:admSeen', []) || []);
    const notes = [
      ...orders.filter(o => o.status === 'processing').map(o => ({ d: o.paidAt || o.date, go: 'orders', k: o.id, ic: '<path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
        t: `سفارش پرداخت‌شده <span dir="ltr">${o.id}</span>`, s: `${esc(o.name || custName(o.phone))} · ${fa(o.total)} تومان — آماده‌ی بسته‌بندی` })),
      ...requests.filter(r => r.status === 'review').map(r => ({ d: r.date, go: 'storage', k: r.id, ic: '<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/>',
        t: `${REQ_TYPES[r.type] || 'درخواست'} <span dir="ltr">${r.id}</span>`, s: `${esc(r.name)} — در انتظار بررسی` }))
    ].sort((a, b) => b.d - a.d).slice(0, 10);
    const fresh = notes.filter(n => !seen.has(n.k)).length;
    $('#admDot').hidden = !fresh;
    $('#admNotesN').textContent = fresh ? fa(fresh) + ' تازه' : '';
    $('#admNotesList').innerHTML = notes.length ? notes.map(n => `
      <li><button type="button" data-goto-n="${n.go}" class="db-note${seen.has(n.k) ? '' : ' new'}"><i>${svg(n.ic, 16, 2)}</i><span class="min-w-0 flex-1"><b>${n.t}</b><small>${n.s}</small><em>${dateFa(n.d)} · ${clock(n.d)}</em></span></button></li>`).join('')
      : `<li class="db-note-empty">سفارش تازه‌ای نیست ✓</li>`;
    $('#admBell').dataset.keys = JSON.stringify(notes.map(n => n.k));
  }

  const used = HALLS.reduce((s, h) => s + h.used, 0), cap = HALLS.reduce((s, h) => s + h.cap, 0), occ = Math.round(used / cap * 100);

  if (admTab === 'stats') {
    const sold = orders.filter(o => o.status !== 'unpaid');             // only paid orders count as sales
    const now = Date.now(), sum = (a, b) => sold.filter(o => now - o.date >= a * DAY && now - o.date < b * DAY).reduce((s, o) => s + o.total, 0);
    const last = sum(0, 7), prev = sum(7, 14), g = prev ? (last - prev) / prev * 100 : null;
    $('#kRevenue').textContent = fa(sold.reduce((s, o) => s + o.total, 0));
    const d00 = new Date(); d00.setHours(0, 0, 0, 0); const today = sold.filter(o => (o.paidAt || o.date) >= d00.getTime()).reduce((s, o) => s + o.total, 0);
    $('#kPending').textContent = today ? `امروز ${fa(today)} تومان` : 'امروز هنوز فروشی ثبت نشده';
    $('#kGrowth').innerHTML = g === null ? 'بدون مقایسه' : `${svg(g >= 0 ? '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>' : '<path d="m3 7 6 6 4-4 8 8"/><path d="M14 17h7v-7"/>', 14, 2.4)}${g >= 0 ? '+' : '−'}${fa(Math.abs(Math.round(g * 10) / 10))}٪`;
    $('#kGrowthL').textContent = g === null ? 'هفته‌ی قبل فروشی نبوده' : 'نسبت به ۷ روز قبل';
    const d0 = new Date(); d0.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => { const st = d0.getTime() - (6 - i) * DAY; return { l: new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(st), v: sold.filter(o => o.date >= st && o.date < st + DAY).reduce((s, o) => s + o.total, 0) }; });
    const max = Math.max(1, ...days.map(d => d.v));
    $('#kChart').innerHTML = days.map((d, i) => `<div class="flex flex-1 flex-col items-center gap-1.5"><div class="flex h-24 w-full items-end"><span class="block w-full rounded-lg ${i === 6 ? 'bg-white' : 'bg-white/35'}" style="height:${Math.max(6, d.v / max * 100)}%" title="${fa(d.v)} تومان"></span></div><span class="text-[10px] text-white/60">${d.l}</span></div>`).join('');
    $('#kNew').textContent = fa(k('processing')); $('#kProc').textContent = fa(k('shipped'));
    $('#kRing').style.background = ring(occ); $('#kOcc').textContent = fa(occ) + '٪';
    $('#kOccText').textContent = `${fa(used)} از ${fa(cap)} تن`;
    $('#admHalls').innerHTML = HALLS.map(h => { const pc = Math.round(h.used / h.cap * 100); return `
      <li class="adm-hall">
        <p class="truncate font-display text-sm font-black text-ink">${h.name}</p>
        <p class="mt-2 font-display text-2xl font-black tabular-nums text-cyprus">${fa(pc)}<small class="text-sm">٪</small></p>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-cyprus-soft"><div class="h-full w-full origin-right rounded-full bg-[#28622D]" style="transform:scaleX(${pc / 100})"></div></div>
        <div class="mt-3 flex justify-between text-[11px] text-ink-soft"><span dir="ltr">${h.temp}°C</span><span>رطوبت ${fa(h.hum)}٪</span></div>
      </li>`; }).join('');
  }
  if (admTab === 'orders') {
    $$('#admFilters .chip').forEach(b => { b.setAttribute('aria-pressed', b.dataset.f === admFilter); $('.c', b).textContent = fa(b.dataset.f === 'all' ? orders.filter(o => o.status !== 'unpaid').length : k(b.dataset.f)); });
    const list = orders.filter(o => o.status !== 'unpaid' && (admFilter === 'all' || o.status === admFilter));
    $('#admOrders').innerHTML = list.length ? list.map(orderRow).join('') : `<li class="card p-10 text-center font-display font-bold text-cyprus">${orders.some(o => o.status !== 'unpaid') ? 'سفارشی با این وضعیت نیست' : 'هنوز سفارش پرداخت‌شده‌ای نیست؛ هر پرداخت موفق خودکار اینجا می‌آید.'}</li>`;
  }
  if (admTab === 'inventory') {
    $('#invList').innerHTML = products.map(p => `
      <li class="card grid grid-cols-2 items-center gap-3 p-4 md:grid-cols-[1.6fr_1fr_1fr_110px] md:gap-5">
        <div class="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1"><span class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand-light">${thumb(p, ' mini')}</span>
          <div class="min-w-0"><p class="truncate font-display text-sm font-black text-cyprus">${p.name}</p><p class="text-xs text-ink-soft">${CAT_FA[p.cat]} · ${p.unit}</p></div></div>
        <label class="flex flex-col gap-1 text-[11px] font-bold text-ink-soft"><span class="md:sr-only">قیمت (تومان)</span><input data-inv="price" data-id="${p.id}" type="text" inputmode="numeric" autocomplete="off" value="${fa(p.price)}" dir="ltr" class="field h-10 text-right font-display text-sm font-bold" aria-label="قیمت ${p.name}"></label>
        <label class="flex flex-col gap-1 text-[11px] font-bold text-ink-soft"><span class="md:sr-only">موجودی (عدد)</span><input data-inv="stock" data-id="${p.id}" type="text" inputmode="numeric" autocomplete="off" value="${fa(p.stock)}" dir="ltr" class="field h-10 text-right font-display text-sm font-bold" aria-label="موجودی ${p.name}"></label>
        ${p.stock > 0 ? pill(['', p.stock < 10 ? 'رو به اتمام' : 'موجود', p.stock < 10 ? 'bg-sand text-cyprus-mid' : 'bg-cyprus-soft text-cyprus']) : pill(['', 'ناموجود', 'bg-cyprus/10 text-ink-soft'])}
      </li>`).join('');
  }
  if (admTab === 'customers') {
    const qy = norm($('#custSearch').value || ''), qd = toLatin(qy);
    const phones = [...new Set([...Object.keys(users).filter(ph => users[ph].role !== 'admin'), ...orders.map(o => o.phone), ...requests.map(r => r.phone)])];
    const list = phones.map(ph => { const mine = orders.filter(o => o.phone === ph); return { ph, name: custName(ph), acc: !!(users[ph] && users[ph].hash), n: mine.length, sum: mine.reduce((s, o) => s + o.total, 0), act: mine.filter(o => o.status !== 'delivered').length }; })
      .filter(c => !qy || norm(c.name).includes(qy) || (qd && c.ph.includes(qd))).sort((a, b) => b.sum - a.sum);
    $('#custList').innerHTML = list.length ? list.map(c => `
      <li class="card grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
        <div class="flex min-w-0 items-center gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#28622D] font-display font-black text-white">${esc(c.name.trim()[0] || 'م')}</span>
          <div class="min-w-0"><p class="truncate font-display font-black text-cyprus">${esc(c.name)}</p><p class="text-xs text-ink-soft"><span dir="ltr">${esc(c.ph)}</span> · ${c.acc ? 'حساب فعال' : 'بدون رمز عبور'}</p></div></div>
        <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted"><span>${fa(c.n)} سفارش${c.act ? ` · ${fa(c.act)} فعال` : ''}</span><span>${fa(c.sum)} تومان خرید</span><span>کیف پول: ${fa(wallet[c.ph] || 0)} تومان</span></div>
        <div class="flex flex-wrap gap-2">
          <button data-act-as="${c.ph}" class="btn-cyprus h-10 px-4 text-xs">${svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>', 14, 2.2)}مدیریت حساب</button>
          <button data-credit="${c.ph}" class="btn-ghost h-10 px-4 text-xs">شارژ کیف پول</button>
          <button data-temp-pw="${c.ph}" class="btn-ghost h-10 px-4 text-xs">رمز موقت</button>
        </div>
        <form data-credit-form="${c.ph}" hidden novalidate class="flex flex-wrap items-center gap-2 lg:col-span-3">
          <label class="sr-only" for="cr-${c.ph}">مبلغ شارژ برای ${esc(c.name)}</label>
          <input id="cr-${c.ph}" data-money type="text" inputmode="numeric" autocomplete="off" dir="ltr" placeholder="مبلغ به تومان" class="field h-10 w-48 text-right text-sm">
          <button class="btn-cyprus h-10 px-4 text-xs">افزودن به کیف پول</button>
        </form>
        <p data-cust-msg="${c.ph}" hidden class="rounded-2xl bg-cyprus-soft px-4 py-2.5 text-xs font-bold leading-6 text-cyprus lg:col-span-3"></p>
      </li>`).join('') : `<li class="card p-8 text-center text-sm text-ink-muted">مشتری‌ای پیدا نشد.</li>`;
  }
  if (admTab === 'storage') {
    $('#sRing').style.background = `conic-gradient(#FFFFFF 0 ${occ}%, rgba(255,255,255,.15) ${occ}% 100%)`;
    $('#sPct').textContent = fa(occ) + '٪';
    $('#sUsed').textContent = fa(used) + ' تن'; $('#sFree').textContent = fa(cap - used) + ' تن';
    $('#hallList').innerHTML = HALLS.map(h => { const pc = Math.round(h.used / h.cap * 100); return `
      <li class="card p-5">
        <div class="flex items-center justify-between"><p class="font-display font-black text-cyprus">${h.name}</p><span class="font-display text-sm font-black text-cyprus">${fa(pc)}٪</span></div>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-cyprus-soft"><div class="h-full w-full origin-right rounded-full bg-[#28622D]" style="transform:scaleX(${pc / 100})"></div></div>
        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted"><span>${fa(h.used)} از ${fa(h.cap)} تن</span><span dir="ltr">${h.temp}°C</span><span>رطوبت ${fa(h.hum)}٪</span></div>
      </li>`; }).join('');
    $('#admRequests').innerHTML = requests.length ? requests.map(r => `
      <li class="card grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
        <div><p class="font-display font-black text-cyprus">${REQ_TYPES[r.type] || 'درخواست'} · <span dir="ltr">${r.id}</span></p><p class="mt-1 text-xs text-ink-soft">${esc(r.name)} · <span dir="ltr">${esc(r.phone)}</span> · ${dateFa(r.date)}</p></div>
        <p class="text-sm text-ink-muted">${esc(r.product)}${r.qty ? ' · ' + esc(r.qty) : ''}${r.note ? `<span class="mt-1 block text-xs text-ink-soft">${esc(r.note)}</span>` : ''}</p>
        <div class="flex rounded-full bg-sand p-1" role="group" aria-label="وضعیت ${r.id}">${REQ_STATUS.map(([v, l]) => `<button data-rid="${r.id}" data-rst="${v}" aria-pressed="${v === r.status}" class="ease-ui h-8 whitespace-nowrap rounded-full px-3 font-display text-[11px] font-bold active:scale-95 ${v === r.status ? 'bg-[#28622D] text-white' : 'text-cyprus-mid hover:bg-white'}">${l}</button>`).join('')}</div>
      </li>`).join('') : `<li class="card p-8 text-center text-sm text-ink-muted">درخواستی ثبت نشده است.</li>`;
  }
}
const goAdmTab = t => { const to = t === 'stats' ? '#admin' : '#admin/' + t; if (location.hash !== to) location.hash = to; else scrollTo({ top: 0, behavior: smooth }); };
$('#admTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) goAdmTab(b.dataset.tab); });
$('#admDock').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) goAdmTab(b.dataset.tab); });
$$('[data-goto]').forEach(b => b.addEventListener('click', () => goAdmTab(b.dataset.goto)));
/* bell panel in the admin top bar */
{
  const pops = [[$('#admBell'), $('#admNotes')]];
  const close = () => pops.forEach(([b, p]) => { p.hidden = true; p.classList.remove('on'); b.setAttribute('aria-expanded', false); });
  pops.forEach(([b, p]) => b.addEventListener('click', e => {
    e.stopPropagation(); const open = p.hidden; close();
    if (open) { p.hidden = false; b.setAttribute('aria-expanded', true); requestAnimationFrame(() => p.classList.add('on'));
      if (p.id === 'admNotes') { store.set('nakhl:admSeen', JSON.parse(b.dataset.keys || '[]')); $('#admDot').hidden = true; $('#admNotesN').textContent = ''; } }
  }));
  $('#admNotes').addEventListener('click', e => { const n = e.target.closest('[data-goto-n]'); if (n) { close(); goAdmTab(n.dataset.gotoN); } });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#admNotes, #admBell')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('hashchange', close);
}
$('#admFilters').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { loadBar(); admFilter = b.dataset.f; renderAdmin(); } });
$('#admBody').addEventListener('click', e => {
  const s = e.target.closest('[data-st]');
  if (s) {
    const o = orders.find(x => x.id === s.dataset.oid); if (!o || o.status === s.dataset.st) return;
    // TODO: PATCH the status on your backend (admin role checked server-side)
    o.status = s.dataset.st; saveOrders(); renderAdmin(); toast(`وضعیت ${o.id}: ${STATUS[sIdx(o.status)][1]}`); return;
  }
  const r = e.target.closest('[data-rst]');
  if (r) { const q = requests.find(x => x.id === r.dataset.rid); if (q) { q.status = r.dataset.rst; saveRequests(); renderAdmin(); toast(`درخواست ${q.id}: ${REQ_STATUS.find(x => x[0] === q.status)[1]}`); } return; }
  const pr = e.target.closest('[data-print]');
  if (pr) printInvoice(orders.find(x => x.id === pr.dataset.print));
});
$('#invList').addEventListener('input', e => {
  const inp = e.target.closest('[data-inv="price"]'); if (!inp) return;
  const d = toLatin(inp.value).replace(/\D/g, ''); inp.value = d ? fa(+d) : '';
});
$('#invList').addEventListener('change', e => {
  const inp = e.target.closest('[data-inv]'); if (!inp) return;
  const p = byId[inp.dataset.id], v = Math.max(0, +toLatin(inp.value).replace(/\D/g, '') || 0);   // accepts ۱۲۵٬۰۰۰ / 125,000 / 125000
  // TODO: save price/stock on your backend
  p[inp.dataset.inv] = v; saveInv(); renderHome(); renderAdmin();
  toast(`${p.name}: ${inp.dataset.inv === 'price' ? 'قیمت ' + fa(v) + ' تومان' : 'موجودی ' + fa(v) + ' عدد'}`);
});
$('#custSearch').addEventListener('input', () => renderAdmin());
$('#custList').addEventListener('click', e => {
  const a = e.target.closest('[data-act-as]'); if (a) return startAct(a.dataset.actAs);
  const c = e.target.closest('[data-credit]');
  if (c) { const f = $(`[data-credit-form="${c.dataset.credit}"]`); f.hidden = !f.hidden; if (!f.hidden) $('input', f).focus(); return; }
  const t = e.target.closest('[data-temp-pw]');
  if (t) {
    const ph = t.dataset.tempPw, rnd = new Uint32Array(1); crypto.getRandomValues(rnd);
    const tmp = 'Nk' + String(rnd[0] % 1e6).padStart(6, '0');
    // TODO: on a real server, send the temporary password to the customer by SMS instead of showing it
    users[ph] = Object.assign({ name: custName(ph), role: 'customer' }, users[ph], { hash: pwHash(ph, tmp) }); saveUsers();
    const m = $(`[data-cust-msg="${ph}"]`); m.hidden = false;
    m.innerHTML = `رمز موقت: <b dir="ltr" class="latin text-sm">${tmp}</b> — به مشتری بدهید تا وارد شود و از «فراموشی رمز» رمز تازه بسازد.`;
  }
});
$('#custList').addEventListener('input', e => {            // live thousands separators in the wallet amount
  const i = e.target.closest('[data-money]'); if (!i) return; const d = toLatin(i.value).replace(/\D/g, ''); i.value = d ? fa(+d) : '';
});
$('#custList').addEventListener('submit', e => {
  const f = e.target.closest('[data-credit-form]'); if (!f) return;
  e.preventDefault();
  const ph = f.dataset.creditForm, v = +toLatin($('input', f).value).replace(/\D/g, '') || 0;   // accepts ۵۰,۰۰۰ / 50000
  if (v < 1000) { toast('مبلغ را درست وارد کنید (حداقل ۱,۰۰۰ تومان)'); return; }
  // TODO: record the wallet transaction on your backend
  wallet[ph] = (wallet[ph] || 0) + v; saveWallet(); renderAdmin(); toast(`${fa(v)} تومان به کیف پول ${custName(ph)} اضافه شد`);
});
$('#admReset').addEventListener('click', e => {
  const b = e.currentTarget, t = $('span', b);
  if (b.dataset.sure !== '1') { b.dataset.sure = '1'; t.textContent = 'مطمئنید؟'; return; }
  b.dataset.sure = ''; t.textContent = 'پاک کردن همه‌ی سفارش‌ها';
  orders = seed(); saveOrders(); requests = seedReq(); saveRequests(); admFilter = 'all'; renderAdmin(); toast('همه‌ی سفارش‌ها و درخواست‌ها پاک شد'); });

/* admin "فاکتور" prints the same receipt card customers get */
function printInvoice(o) {
  if (!o) return;
  renderReceipt(o);
  document.body.classList.add('print-receipt'); window.print();
  setTimeout(() => document.body.classList.remove('print-receipt'), 500);
}
