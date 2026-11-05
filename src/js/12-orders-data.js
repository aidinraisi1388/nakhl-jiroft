/* 12-orders-data.js — Orders, cold-storage requests, addresses and wallet (stored in the browser until a server exists) + shared status pills. */

/* ════════ Orders · storage requests · addresses · wallet (front-end demo data — replace with your API) ════════ */
const STATUS = [
  ['pending',    'ثبت شده',          'bg-sand text-cyprus-mid'],
  ['processing', 'در حال بسته‌بندی', 'bg-cyprus-soft text-cyprus'],
  ['shipped',    'ارسال‌شده',        'bg-cyprus/15 text-cyprus'],
  ['delivered',  'تحویل شده',        'bg-[#28622D] text-white']
];
const STEPS = [                         // cold-chain tracking steps shown to customers
  ['ثبت',           '<path d="M5 12.5l4.5 4.5L19 7.5"/>'],
  ['بسته‌بندی سرد', '<path d="M12 2v20M4.9 7l14.2 10M4.9 17 19.1 7"/>'],
  ['باربری',        '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'],
  ['تحویل',         '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>']
];
const sIdx = s => Math.max(0, STATUS.findIndex(x => x[0] === s));
const UNPAID = ['unpaid', 'در انتظار پرداخت', 'bg-sand text-cyprus-mid ring-1 ring-cyprus/15'];   // created at checkout, becomes «در حال بسته‌بندی» the moment the bank confirms payment
const dateFa = d => new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
const timeFa = d => new Intl.DateTimeFormat('fa-IR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
const DAY = 864e5, now0 = Date.now();
const mk = (id, phone, items, daysAgo, status) => ({ id, phone, items, total: items.reduce((s, [p, q]) => s + q * byId[p].price, 0), date: now0 - DAY * daysAgo, status });
const seed = () => [];                 // real orders start from zero
let orders = store.get('nakhl:orders:v5', null);
if (!Array.isArray(orders)) { orders = seed(); store.set('nakhl:orders:v5', orders); }
orders.forEach(o => { if (o.status === 'awaiting') o.status = 'unpaid'; });
orders = orders.filter(o => o.items.every(([id]) => byId[id]));
const saveOrders = () => store.set('nakhl:orders:v5', orders);

const REQ_TYPES = { bulk: 'سفارش عمده', storage: 'رزرو سالن سرد', shipping: 'استعلام حمل' };
const REQ_STATUS = [['review', 'در حال بررسی', 'bg-sand text-cyprus-mid'], ['approved', 'تأیید شده', 'bg-[#28622D] text-white'], ['closed', 'بسته شده', 'bg-cyprus/10 text-ink-soft']];
const seedReq = () => [];              // no storage / bulk requests yet
let requests = store.get('nakhl:requests:v3', null);
if (!Array.isArray(requests)) { requests = seedReq(); store.set('nakhl:requests:v3', requests); }
const saveRequests = () => store.set('nakhl:requests:v3', requests);
const addrBook = store.get('nakhl:addr:v2', {}) || {};
const wallet = store.get('nakhl:wallet:v2', {}) || {};
const saveInv = () => store.set('nakhl:inv', Object.fromEntries(products.map(p => [p.id, { price: p.price, stock: p.stock }])));

const nItems = o => o.items.reduce((s, [, q]) => s + q, 0);
const kgOf = o => o.items.reduce((s, [id, q]) => s + q * (byId[id].kg || 0), 0);
const kgFa = v => fa(Math.round(v * 10) / 10);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pill = ([, l, c]) => `<span class="inline-flex h-7 w-fit shrink-0 items-center rounded-full px-3 font-display text-[11px] font-bold ${c}">${l}</span>`;
const statusPill = s => pill(s === 'unpaid' ? UNPAID : STATUS[sIdx(s)]);
const reqPill = r => pill(REQ_STATUS.find(x => x[0] === r.status) || REQ_STATUS[0]);
const thumbs = items => items.slice(0, 3).map(([id]) => `<span class="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-sand-light ring-2 ring-white">${thumb(byId[id], ' mini')}</span>`).join('');
const chain = s => { const i = s === 'unpaid' ? -1 : sIdx(s); return `
  <ol class="relative mt-5 grid grid-cols-4" aria-label="مراحل زنجیره‌ی سرد">
    <span class="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 rounded-full bg-cyprus/10" aria-hidden="true"></span>
    <span class="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 origin-right rounded-full bg-[#28622D] transition-transform duration-500" style="transform:scaleX(${Math.max(0, i) / 3})" aria-hidden="true"></span>
    ${STEPS.map(([l, d], k) => `<li class="relative flex flex-col items-center gap-2 text-center"${k === i ? ' aria-current="step"' : ''}>
      <span class="grid h-8 w-8 place-items-center rounded-full ${k < i ? 'bg-[#28622D] text-white' : k === i ? 'bg-[#28622D] text-white ring-4 ring-cyprus/15' : 'border border-cyprus/15 bg-white text-ink-soft'}">${svg(d, 15, 2.2)}</span>
      <span class="text-[11px] font-bold ${k <= i ? 'text-cyprus' : 'text-ink-soft'}">${l}</span></li>`).join('')}
  </ol>`; };
const empty = (msg, href, cta) => `<li class="card flex flex-col items-center gap-3 p-10 text-center sm:col-span-2 md:col-span-full"><p class="font-display font-bold text-cyprus">${msg}</p>${href ? `<a href="${href}" class="btn-cyprus h-11 px-6 text-sm">${cta}</a>` : ''}</li>`;
