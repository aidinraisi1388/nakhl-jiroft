/* ═══ Nakhl Jiroft — app logic (vanilla JS, no framework) ═══
   Sections: products · cart & drawer · catalog & router · hero slider · forms ·
   orders & receipt · accounts & auth · customer dashboard · admin panel */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fa = n => new Intl.NumberFormat('fa-IR').format(n).replace(/٬/g, ',');   // one thousands separator that looks the same in Peyda and Yekan
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth = reduce ? 'auto' : 'smooth';

  /* ── Products: set `img` to a PNG path when your photos are ready. Prices are samples.
        featured:true → shown in the 4 curated cards on the homepage ── */
  const products = [
    { id:'maz5',  cat:'mazafati', name:'خرمای مضافتی جیرفت',     unit:'بسته‌بندی ۵۰۰ گرمی',   price:140000,  badge:'۱۰۰٪ ارگانیک', tag:'مضافتی', featured:true },
    { id:'maz10', cat:'mazafati', name:'خرمای مضافتی درجه‌ی یک', unit:'جعبه‌ی ۱ کیلویی',      price:265000,  badge:'صادراتی',     tag:'مضافتی' },
    { id:'maz20', cat:'mazafati', name:'خرمای مضافتی خانواده',    unit:'جعبه‌ی ۲ کیلویی',      price:495000,  badge:'۱۰۰٪ ارگانیک', tag:'مضافتی' },
    { id:'mazr',  cat:'mazafati', name:'رطب تازه‌ی مضافتی',       unit:'بسته‌بندی ۷۵۰ گرمی',   price:210000,  badge:'برداشت تازه', tag:'رطب' },
    { id:'mazb',  cat:'mazafati', name:'خرمای مضافتی بی‌هسته',    unit:'بسته‌بندی ۵۰۰ گرمی',   price:185000,  badge:'۱۰۰٪ ارگانیک', tag:'بی‌هسته' },
    { id:'maz50', cat:'mazafati', name:'خرمای مضافتی کارتنی',     unit:'کارتن ۵ کیلویی',       price:1150000, badge:'عمده',        tag:'مضافتی' },
    { id:'pia5',  cat:'piarom',   name:'خرمای پیارم',             unit:'بسته‌بندی ۵۰۰ گرمی',   price:345000,  badge:'۱۰۰٪ ارگانیک', tag:'پیارم', featured:true },
    { id:'pia10', cat:'piarom',   name:'خرمای پیارم ممتاز',        unit:'جعبه‌ی ۱ کیلویی',      price:670000,  badge:'صادراتی',     tag:'پیارم' },
    { id:'pia20', cat:'piarom',   name:'خرمای پیارم کادویی',       unit:'جعبه‌ی هدیه ۸۰۰ گرمی', price:590000,  badge:'صادراتی',     tag:'پیارم' },
    { id:'pia2k', cat:'piarom',   name:'خرمای پیارم خانواده',      unit:'جعبه‌ی ۲ کیلویی',      price:1290000, badge:'۱۰۰٪ ارگانیک', tag:'پیارم' },
    { id:'kal5',  cat:'kaluteh',  name:'خرمای کلوته',             unit:'بسته‌بندی ۵۰۰ گرمی',   price:120000,  badge:'۱۰۰٪ ارگانیک', tag:'کلوته', featured:true },
    { id:'kal10', cat:'kaluteh',  name:'خرمای کلوته صادراتی',      unit:'جعبه‌ی ۱ کیلویی',      price:230000,  badge:'صادراتی',     tag:'کلوته' },
    { id:'kal20', cat:'kaluteh',  name:'خرمای کلوته خانواده',      unit:'جعبه‌ی ۲ کیلویی',      price:430000,  badge:'۱۰۰٪ ارگانیک', tag:'کلوته' },
    { id:'kalg',  cat:'kaluteh',  name:'خرمای کلوته کادویی',       unit:'جعبه‌ی هدیه ۸۰۰ گرمی', price:260000,  badge:'صادراتی',     tag:'کلوته' },
    { id:'pis',   cat:'dried',    name:'پسته‌ی اکبری',            unit:'بسته‌بندی ۵۰۰ گرمی',   price:975000,  badge:'صادراتی',     tag:'پسته', featured:true },
    { id:'pisa',  cat:'dried',    name:'پسته‌ی احمدآقایی',         unit:'بسته‌بندی ۵۰۰ گرمی',   price:1050000, badge:'صادراتی',     tag:'پسته' },
    { id:'fig',   cat:'dried',    name:'انجیر خشک استهبان',       unit:'بسته‌بندی ۵۰۰ گرمی',   price:490000,  badge:'۱۰۰٪ ارگانیک', tag:'انجیر' },
    { id:'alm',   cat:'dried',    name:'بادام درختی',             unit:'بسته‌بندی ۵۰۰ گرمی',   price:620000,  badge:'صادراتی',     tag:'بادام' },
    { id:'wal',   cat:'dried',    name:'مغز گردو',                unit:'بسته‌بندی ۵۰۰ گرمی',   price:540000,  badge:'۱۰۰٪ ارگانیک', tag:'گردو' },
    { id:'hzl',   cat:'dried',    name:'فندق ممتاز',              unit:'بسته‌بندی ۵۰۰ گرمی',   price:690000,  badge:'صادراتی',     tag:'فندق' },
    { id:'apr',   cat:'dried',    name:'برگه‌ی زردآلو',           unit:'بسته‌بندی ۵۰۰ گرمی',   price:380000,  badge:'۱۰۰٪ ارگانیک', tag:'زردآلو' },
    { id:'rai',   cat:'dried',    name:'کشمش سبز',                unit:'بسته‌بندی ۵۰۰ گرمی',   price:210000,  badge:'صادراتی',     tag:'کشمش' }
  ];
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  /* weight in kg (for the customer's "purchased weight") + sample stock; the admin panel overrides price/stock */
  const faDigits = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  products.forEach(p => { const m = faDigits(p.unit).match(/(\d+)\s*(گرمی|کیلویی)/); p.kg = m ? (m[2] === 'گرمی' ? +m[1] / 1000 : +m[1]) : 0.5; p.stock = p.id === 'hzl' ? 0 : 40; });
  const DATE_CATS = ['mazafati', 'piarom', 'kaluteh'];
  const PAGE_SIZE = 8;              // products per catalog page
  const FREE_SHIP = 2000000;        // free cold shipping threshold (Toman)
  const CATS = {
    dates:    ['خرمای جیرفت',   'مضافتی، پیارم و کلوته؛ مستقیم از نخلستان‌های هلیل.'],
    mazafati: ['خرمای مضافتی', 'نرم و شیرین، برداشت تازه‌ی جیرفت.'],
    piarom:   ['خرمای پیارم',  'خشک و اصیل، مناسب صادرات و هدیه.'],
    kaluteh:  ['خرمای کلوته',  'نیمه‌خشک، با طعم اصیل جنوب.'],
    dried:    ['خشکبار ممتاز', 'پسته، بادام، انجیر و گردوی دست‌چین.'],
    all:      ['همه محصولات',  'کل محصولات نخل جیرفت در یک نگاه.']
  };
  const TONE = {
    mazafati: '--hi:#DFECE0;--mid:#447448;--lo:#19431D;--glow:rgba(40,98,45,.18)',
    piarom:   '--hi:#F0F7F1;--mid:#325D36;--lo:#113213;--glow:rgba(25,67,29,.2)',
    kaluteh:  '--hi:#F0F7F1;--mid:#6EAA73;--lo:#377B3D;--glow:rgba(55,123,61,.16)',
    dried:    '--hi:#FFFFFF;--mid:#BCD2BE;--lo:#87C28C;--glow:rgba(135,194,140,.2)'
  };
  const renderArt = (p, extra = '') => `<div class="render${extra}" style="${TONE[p.cat]}"><span class="ground"></span>${p.cat === 'dried' ? '<span class="orb duo"></span><span class="orb"></span>' : '<span class="orb"></span>'}<span class="tag">${p.tag}</span></div>`;
  const thumb = (p, extra) => p.img ? `<img src="${p.img}" alt="" class="h-full w-full object-contain p-2" loading="lazy">` : renderArt(p, extra);

  /* per-browser demo storage (wrapped: private mode / blocked storage just falls back) */
  const store = {
    get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const cart = {};
  Object.entries(store.get('nakhl:cart', {}) || {}).forEach(([id, q]) => { if (byId[id] && q > 0) cart[id] = Math.min(99, q | 0); });
  let user = null, admin = null;            // set from the session in the accounts section
  Object.entries(store.get('nakhl:inv', {}) || {}).forEach(([id, v]) => { if (byId[id]) { byId[id].price = +v.price || byId[id].price; byId[id].stock = Math.max(0, v.stock | 0); } });
  const svg = (d, s = 18, w = 2.6) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const PLUS = svg('<path d="M12 5v14M5 12h14"/>'), MINUS = svg('<path d="M5 12h14"/>'), CHECK = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>');
  const PLUS_S = svg('<path d="M12 5v14M5 12h14"/>', 15), MINUS_S = svg('<path d="M5 12h14"/>', 15);
  const TRASH = svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>', 16, 2);
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(cart).reduce((s, [id, q]) => s + q * byId[id].price, 0);
  /* sample promo codes — validate real codes on the server */
  const PROMOS = { NAKHL10: { type: 'pct', v: 10, label: '۱۰٪ تخفیف' }, JIROFT: { type: 'off', v: 50000, label: '۵۰ هزار تومان تخفیف' } };
  let promo = null;
  const totals = () => {
    const sub = subtotal();
    const disc = !promo || !sub ? 0 : Math.min(sub, promo.type === 'pct' ? Math.round(sub * promo.v / 100) : promo.v);
    return { sub, disc, total: sub - disc, free: sub >= FREE_SHIP };
  };

  /* ── Product card ── */
  /* short line under each product name (edit freely) */
  const DESC = {
    maz5: 'نرم و شیرین، برداشت تازه‌ی جیرفت', maz10: 'دانه‌درشت و یکدست، مناسب پذیرایی', maz20: 'بسته‌ی اقتصادی برای مصرف خانواده',
    mazr: 'رطب آبدار، تازه از نخلستان', mazb: 'بی‌هسته و آماده‌ی مصرف', maz50: 'کارتن عمده با قیمت پلکانی',
    pia5: 'خشک و کم‌شیرین، ماندگاری بالا', pia10: 'دانه‌ممتاز با پوست براق', pia20: 'جعبه‌ی هدیه برای مناسبت‌ها', pia2k: 'بسته‌ی بزرگ برای مصرف خانواده',
    kal5: 'نیمه‌خشک با طعم اصیل جنوب', kal10: 'درجه‌ی صادراتی، دانه‌ی یکدست', kal20: 'بسته‌ی اقتصادی خانواده', kalg: 'جعبه‌ی هدیه‌ی شیک و سبک',
    pis: 'مغز درشت و خندان، تازه‌برشته', pisa: 'کشیده و خوش‌طعم، دست‌چین', fig: 'نرم و شیرین، خشک‌شده در آفتاب', alm: 'مغز کامل و ترد',
    wal: 'مغز روشن و تازه، بدون تلخی', hzl: 'برشته‌ی ملایم با عطر دلپذیر', apr: 'ترش و شیرین، بدون شکر افزوده', rai: 'دانه‌ی سبز و شیرین قزوین'
  };
  /* product card — floating 3D image: lifts, grows and tilts on hover with a soft green glow behind it.
     Real photos: set `img: 'img/products/<id>.webp'` on a product (transparent PNG/WebP looks best). */
  const cardHTML = p => {
    const q = cart[p.id] || 0;
    return `
    <article class="p-card group relative flex flex-col rounded-3xl border border-[#28622D]/10 p-4 sm:p-5" data-id="${p.id}">
      <div class="relative">
        <!-- IMAGE SLOT · ${p.name} -->
        <div class="relative grid aspect-square place-items-center overflow-hidden rounded-2xl">
          <div class="p-glow pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true"></div>
          <div class="p-img relative grid h-full w-full place-items-center" role="img" aria-label="${p.name}">${p.img ? `<img src="${p.img}" alt="${p.name}" class="max-h-full w-auto object-contain p-3 drop-shadow-xl" loading="lazy" decoding="async">` : renderArt(p)}</div>
        </div>
        <span class="absolute right-2 top-2 rounded-full ${p.badge.includes('ارگانیک') ? 'bg-cyprus-soft text-cyprus ring-1 ring-cyprus/15' : 'bg-white text-cyprus-mid ring-1 ring-cyprus/10'} px-2.5 py-1 font-display text-[11px] font-bold shadow-[0_2px_6px_-2px_rgba(40,98,45,0.18)]">${p.stock > 0 ? p.badge : 'ناموجود'}</span>
        <div class="p-tools absolute left-2 top-2 flex flex-col gap-1.5">
          <button class="quick ease-ui grid h-9 w-9 place-items-center rounded-full bg-white text-ink-soft shadow-sm hover:scale-110 hover:text-cyprus active:scale-90" aria-label="نمایش سریع ${p.name}">${svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', 17, 2)}</button>
        </div>
      </div>
      <div class="flex flex-1 flex-col pt-4 text-center">
        <h3 class="font-display text-[15px] font-extrabold leading-snug text-ink transition-colors duration-300 group-hover:text-cyprus-mid sm:text-[17px]">${p.name}</h3>
        <p class="mt-1 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-[13px]">${DESC[p.id] || ''}</p>
        <span class="unit-pill mx-auto mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-cyprus-mid">${svg('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/>', 12, 2.4)}${p.unit}</span>
        <div class="mt-auto flex flex-col items-stretch gap-3 pt-4 xl:flex-row xl:items-center xl:justify-between">
          <p class="flex items-baseline justify-center gap-1 xl:justify-start"><span class="font-display text-xl font-black tabular-nums text-cyprus sm:text-[21px]">${fa(p.price)}</span><span class="text-[11px] font-bold text-cyprus-mid">تومان</span></p>
          ${p.stock <= 0 ? `<div class="grid h-11 place-items-center rounded-xl bg-sand px-4 font-display text-sm font-bold text-ink-soft xl:w-32">ناموجود</div>` : `<div class="buy w-full xl:w-32" data-id="${p.id}" data-state="${q ? 'open' : 'idle'}">
            <button class="add" aria-label="افزودن ${p.name} به سبد"><span class="lbl inline-flex items-center gap-1.5">${PLUS}افزودن</span><span class="ok">${CHECK}افزوده شد</span></button>
            <div class="step stepper" role="group" aria-label="تعداد ${p.name} در سبد">
              <button class="dec" aria-label="کم کردن یکی">${MINUS}</button>
              <span class="num" aria-live="polite">${fa(q)}</span>
              <button class="inc" aria-label="افزودن یکی دیگر">${PLUS}</button>
            </div>
          </div>`}
        </div>
      </div>
    </article>`;
  };

  const renderHome = () => { $('#homeGrid').innerHTML = products.filter(p => p.featured).slice(0, 4).map(cardHTML).join(''); };
  renderHome();
  if (window.lucide) lucide.createIcons();

  /* ── Scroll reveal: blocks fade up as they enter the screen. One IntersectionObserver, transform/opacity only;
     each element animates once and is then released (classes removed) so hover effects keep working. ── */
  const RV_SEL = '#top > section:not(#hero) > *, #top > .orn-palm, #top > .orn-waves, #homeGrid > .p-card, #footer .grid > *, #catalogTop > *, #dashBody > *, #admBody > *, #authView section > div';
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

  /* ── Toast ── */
  let tt;
  const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.remove('opacity-0', '-translate-y-2'); clearTimeout(tt); tt = setTimeout(() => t.classList.add('opacity-0', '-translate-y-2'), 2200); };
  const lb = $('#loadBar');
  let barQuietUntil = 0;
  const finishBar = () => { lb.classList.remove('stall'); void lb.offsetWidth; lb.classList.add('finish'); clearTimeout(lb._t); lb._t = setTimeout(() => lb.classList.remove('finish'), 700); };
  const loadBar = () => { if (reduce || Date.now() < barQuietUntil) return; if (lb.classList.contains('stall')) return finishBar(); lb.style.animation = ''; lb.classList.remove('run', 'done', 'finish'); void lb.offsetWidth; lb.classList.add('run'); };
  const stallBar = () => { lb.style.animation = ''; lb.classList.remove('run', 'done', 'finish'); void lb.offsetWidth; lb.classList.add('stall'); };
  /* fills the bar 0 → 100% over `ms`, then runs `cb` (used for the login transfer) */
  const longBar = (ms, cb) => {
    const t = reduce ? 250 : ms;
    lb.classList.remove('run', 'done'); lb.style.animation = 'none'; void lb.offsetWidth;
    lb.style.animation = `loadLong ${t}ms linear forwards`;
    setTimeout(() => { barQuietUntil = Date.now() + 500; cb(); lb.style.animation = ''; lb.classList.add('done'); }, t);
  };
  const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

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

  /* one-shot flying dot: a single transform animation, no scroll/mouse listeners */
  const fly = (from, done) => {
    const to = $('#cartPill');
    if (reduce || !from.animate) { done(); return; }
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - 14, y0 = a.top + a.height / 2 - 14;
    const dx = b.left + b.width / 2 - 14 - x0, dy = b.top + b.height / 2 - 14 - y0;
    const dot = document.createElement('span'); dot.className = 'fly'; dot.style.left = x0 + 'px'; dot.style.top = y0 + 'px';
    document.body.appendChild(dot);
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .45}px,${dy * .45 - 90}px) scale(.85)`, opacity: 1, offset: .45 },
      { transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: .4 }
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
        fly(add, () => { bump($('#cartCount')); updateBar(true); });
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
    wantCheckout = true; dashTab = 'addresses';
    if (location.hash === '#dashboard') { renderDash(); scrollTo({ top: 0, behavior: smooth }); } else location.hash = '#dashboard';
    toast('برای ادامه‌ی خرید، اول آدرس تحویل را ثبت کنید');
  }
  $('#checkout').addEventListener('click', () => { if (!count()) return; closeCart(false); openLogin(goCheckout); });

  /* ── Catalog: category tabs + search + pagination ── */
  let cat = 'dates', query = '', page = 1;
  const norm = s => s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').trim();
  const inCat = c => cat === 'all' || (cat === 'dates' ? DATE_CATS.includes(c) : c === cat);
  const btnCls = on => 'ease-ui grid h-9 min-w-9 place-items-center rounded-full px-3 font-display text-sm font-black active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyprus '
    + (on ? 'bg-[#28622D] text-white shadow-[0_6px_14px_-4px_rgba(40,98,45,.55)]' : 'text-cyprus hover:bg-sand');

  const renderCatalog = (animate = true) => {
    const matches = products.filter(p => inCat(p.cat) && (!query || norm(p.name).includes(query) || norm(p.tag).includes(query)));
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    page = Math.min(Math.max(1, page), pages);
    const from = (page - 1) * PAGE_SIZE, slice = matches.slice(from, from + PAGE_SIZE);
    $('#grid').innerHTML = slice.map(cardHTML).join('');
    if (animate) $$('#grid .p-card').forEach((c, i) => { c.style.animationDelay = i * 30 + 'ms'; c.classList.add('enter'); });
    const [title, desc] = query ? [`نتیجه‌ی جستجو برای «${query}»`, 'در همه‌ی دسته‌ها جستجو شد.'] : CATS[cat];
    $('#catalogTitle').textContent = title;
    $('#empty').hidden = matches.length > 0;
    $('#emptyText').textContent = query ? `محصولی با «${query}» پیدا نشد` : 'فعلاً محصولی در این دسته نیست';
    $('#clearSearch').hidden = !query;
    $('#pager').hidden = pages < 2;
    $('#pageNums').innerHTML = Array.from({ length: pages }, (_, i) =>
      `<button class="${btnCls(i + 1 === page)}" data-page="${i + 1}" aria-label="صفحه‌ی ${fa(i + 1)}"${i + 1 === page ? ' aria-current="page"' : ''}>${fa(i + 1)}</button>`).join('');
    $('#prevPage').disabled = page === 1;
    $('#nextPage').disabled = page === pages;
  };
  const goPage = n => { loadBar(); page = n; renderCatalog(); $('#catalogTop').scrollIntoView({ behavior: smooth, block: 'start' }); };
  $('#pageNums').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) goPage(+b.dataset.page); });
  $('#prevPage').addEventListener('click', () => goPage(page - 1));
  $('#nextPage').addEventListener('click', () => goPage(page + 1));
  const syncPills = () => $$('#cats .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === cat));

  let lastHash = location.hash;
  const setHash = h => { if (location.hash !== h) history.pushState(null, '', h); lastHash = location.hash; };
  $$('#cats .chip').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.cat === 'storage') { location.hash = '#storage'; selectService('storage'); return; }
    loadBar(); cat = b.dataset.cat; page = 1; query = ''; clearSearchFields();
    history.replaceState(null, '', '#products/' + cat); lastHash = location.hash;
    syncPills(); renderCatalog();
  }));

  /* ── Views: Home ↔ Products catalog (hash based: #products, #products/piarom …) ── */
  const views = { home: $('#top'), catalog: $('#catalogView'), dashboard: $('#dashboardView'), admin: $('#adminView'), auth: $('#authView'), receipt: $('#receiptView'), checkout: $('#checkoutView'), pay: $('#payView') };
  let current = 'home';
  const show = name => {
    if (current === name) return false;
    Object.entries(views).forEach(([k, el]) => { el.hidden = k !== name; });
    $('#footer').hidden = name !== 'home'; document.body.dataset.view = name;   // footer on home only; per-page background
    const v = views[name]; v.classList.remove('view-in'); void v.offsetWidth; v.classList.add('view-in'); requestAnimationFrame(() => { reveal(v); blur(v); });
    current = name; loadBar();
    const key = { home: 'home', catalog: 'products' }[name];
    $$('[data-nav]').forEach(a => a.dataset.nav === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    name === 'home' ? play() : clearInterval(timer);
    return true;
  };
  const toTop = () => { const r = document.documentElement.style; r.scrollBehavior = 'auto'; window.scrollTo(0, 0); r.scrollBehavior = ''; };   // jump, not glide (works in every Safari)
  const route = () => {
    lastHash = location.hash;
    const h = decodeURIComponent(location.hash.slice(1));
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
      if (!hasAddr()) { wantCheckout = true; dashTab = 'addresses'; history.replaceState(null, '', '#dashboard'); toast('برای ادامه‌ی خرید، اول آدرس تحویل را ثبت کنید'); return route(); }
      const changed = show('checkout'); renderCheckout(); if (changed) toTop();
      return;
    }
    if (h.startsWith('pay/')) {                                       // payment: connecting / test gateway / result
      const [, a, b] = h.split('/'), test = a === 'test', o = orders.find(x => x.id === (test ? b : a));
      if (!o || !(admin || (user && user.phone === o.phone))) { history.replaceState(null, '', '#top'); return route(); }
      const changed = show('pay'); renderPay(o, test ? 'test' : null); if (changed) toTop();
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
      if (!isAdm && admin && !user) { admTab = 'customers'; return redirect('#admin'); }   // pick a customer first
      const changed = show(isAdm ? 'admin' : 'dashboard'); (isAdm ? renderAdmin : renderDash)(); if (changed) toTop();
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
  const viewOf = h => { h = decodeURIComponent(h.slice(1)); return h.startsWith('products') ? 'catalog' : h === 'checkout' ? 'checkout' : h.startsWith('pay/') ? 'pay' : h.startsWith('receipt/') ? 'receipt' : /^auth/.test(h) ? 'auth' : /^(dashboard|account)/.test(h) ? 'dashboard' : /^admin/.test(h) ? 'admin' : 'home'; };
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

  /* ── Navbar: expanding search, mobile menu ── */
  const header = $('#header'), ns = $('#navSearch'), st = $('#searchToggle'), si = $('#search');
  const openSearch = open => { ns.classList.toggle('open', open); header.classList.toggle('searching', open); st.setAttribute('aria-expanded', open); si.tabIndex = open ? 0 : -1; if (open) si.focus(); };
  st.addEventListener('click', () => openSearch(!ns.classList.contains('open')));
  si.addEventListener('blur', () => { if (!si.value) openSearch(false); });
  addEventListener('hashchange', () => { if (!location.hash.startsWith('#products') && ns.classList.contains('open')) { si.value = ''; query = ''; openSearch(false); si.blur(); } });   // leaving the catalog closes the search
  const menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  const shade = $('#menuShade');
  const setMenu = open => {
    document.documentElement.classList.toggle('menu-open', open); menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', open);
    if (open) $('#menuClose').focus({ preventScroll: true });
  };
  const closeMenu = () => { if (document.documentElement.classList.contains('menu-open')) { setMenu(false); menuBtn.focus({ preventScroll: true }); } };
  menuBtn.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('menu-open')));
  $('#menuClose').addEventListener('click', closeMenu); shade.addEventListener('click', closeMenu);
  shade.addEventListener('touchmove', e => e.preventDefault(), { passive: false });   // page behind stays still, without a reflow-heavy scroll lock
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (closeQV()) return; if (drawerOpen) closeCart(); else { openSearch(false); closeMenu(); } } });

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

  /* ── Service selection ── */
  function selectService(v) { $$('.svc').forEach(b => b.setAttribute('aria-checked', b.dataset.value === v)); }
  $$('.svc').forEach(b => b.addEventListener('click', () => selectService(b.dataset.value)));
  $$('[data-service]').forEach(a => a.addEventListener('click', () => selectService(a.dataset.service)));

  /* ── Forms (front-end only) ── */
  const toLatin = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s-]/g, '');   // Persian + Arabic digits
  const validPhone = v => /^09\d{9}$/.test(toLatin(v));
  /* ── No server yet: orders & inquiries reach the shop as a pre-filled SMS the customer just sends ── */
  const SHOP_SMS = '+989931934298';
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const smsHref = body => `sms:${SHOP_SMS}${isIOS ? '&' : '?'}body=${encodeURIComponent(body)}`;
  const canSMS = matchMedia('(pointer: coarse)').matches;          // desktops have no SMS app → copy the text instead
  const SHOP_SMS_FA = '۰۹۹۳۱۹۳۴۲۹۸';
  const copyText = async t => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };
  const SVC_FA = { bulk: 'سفارش عمده', storage: 'رزرو سالن سردخانه', shipping: 'استعلام حمل' };
  $('#inquiryForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#fName'), p = $('#fPhone'), msg = $('#formMsg');
    const bn = !n.value.trim(), bp = !validPhone(p.value);
    n.setAttribute('aria-invalid', bn); p.setAttribute('aria-invalid', bp);
    if (bn || bp) { msg.textContent = bn ? 'نام خود را وارد کنید.' : 'شماره‌ی موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'; msg.className = 'min-h-[1.25rem] text-sm font-bold text-red-700'; (bn ? n : p).focus(); return; }
    // TODO: send the form data to your backend / n8n webhook here
    const phone = toLatin(p.value), svc = $('.svc[aria-checked="true"]');
    requests.unshift({ id: 'SR-' + (Math.max(208, ...requests.map(r => +r.id.split('-')[1] || 0)) + 1), phone, name: n.value.trim(), type: svc ? svc.dataset.value : 'bulk', product: $('#fProduct').value, qty: $('#fQty').value.trim(), date: Date.now(), status: 'review' });
    saveRequests();
    const r0 = requests[0], note = $('#fMsg') ? $('#fMsg').value.trim() : '';
    const href = smsHref([`استعلام ${r0.id} · نخل جیرفت`, `نوع: ${SVC_FA[r0.type] || r0.type}`, `نام: ${r0.name}`, `موبایل: ${r0.phone}`, `محصول: ${r0.product}`, r0.qty && `مقدار: ${r0.qty}`, note && `توضیحات: ${note}`].filter(Boolean).join('\n'));
    const body = decodeURIComponent(href.split('body=')[1]);
    e.target.reset(); selectService('bulk'); msg.className = 'min-h-[1.25rem] text-sm font-bold text-cyprus';
    if (!canSMS) { copyText(body).then(ok => { msg.textContent = ok ? `متن استعلام کپی شد؛ آن را به ${SHOP_SMS_FA} پیامک کنید.` : `استعلام ثبت شد؛ لطفاً با ${SHOP_SMS_FA} تماس بگیرید.`; }); return; }
    msg.innerHTML = `متن استعلام در برنامه‌ی پیامک آماده شد؛ فقط «ارسال» را بزنید. <a href="${href}" class="underline underline-offset-4">باز نشد؟ اینجا بزنید</a>`;
    location.href = href;                                   // inside the submit gesture → mobile opens the SMS app
  });
  ['#fName', '#fPhone'].forEach(id => $(id).addEventListener('input', e => e.target.setAttribute('aria-invalid', 'false')));
  $('#newsForm') && $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validPhone($('#newsPhone').value)) { toast('شماره‌ی موبایل را درست وارد کنید (۱۱ رقم، با ۰۹)'); return; }
    e.target.reset(); toast('عضو شدید؛ کد تخفیف پیامک می‌شود');
  });

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
  $('#ckAddAddr').addEventListener('click', () => { wantCheckout = true; dashTab = 'addresses'; location.hash = '#dashboard'; });
  $('#ckForm').addEventListener('submit', e => {
    e.preventDefault();
    const t = totals(); if (!t.sub || !user) return;
    const err = (m, f) => { $('#ckErr').textContent = m; if (f) { f.focus(); f.classList.add('shake'); setTimeout(() => f.classList.remove('shake'), 500); } };
    const name = $('#ckName').value.trim(), rph = toLatinD($('#ckPhone').value).replace(/\D/g, '');
    const ship = $('input[name="ckShip"]:checked').value, book = addrBook[user.phone] || [];
    if (name.length < 3) return err('نام و نام خانوادگی گیرنده را بنویسید.', $('#ckName'));
    if (!/^09\d{9}$/.test(rph)) return err('شماره موبایل گیرنده درست نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹).', $('#ckPhone'));
    let addr = 'تحویل حضوری از سردخانه‌ی نخل، جیرفت';
    if (ship === 'cold') {
      const a = book[ckAddr];
      if (!a) { err('یک آدرس تحویل انتخاب کنید.'); return goCheckout(); }
      addr = `${a.city}، ${a.text}${a.postal ? ' · کد پستی ' + faD(a.postal) : ''}`;
    }
    // one unpaid order per customer: starting a new checkout replaces the unfinished one
    orders = orders.filter(o => !(o.phone === user.phone && o.status === 'unpaid'));
    const id = 'NKH-' + (Math.max(1046, ...orders.map(o => +o.id.split('-')[1] || 0)) + 1);
    const items = Object.entries(cart).map(([pid, q]) => [pid, q, byId[pid].price]);
    const o = { id, phone: user.phone, name, rphone: rph, addr, ship, note: $('#ckNote').value.trim(), items, sub: t.sub, disc: t.disc, promo: promo && promo.code, free: t.free || ship === 'pickup', total: t.total, date: Date.now(), status: 'unpaid', tries: 0 };
    orders.unshift(o); saveOrders(); store.set('nakhl:cartOrder', id);
    // TODO (server): save the order in your database here — the server must re-check prices, stock and the promo code
    startPay(o);
  });

  /* ── Zibal: request → bank page → callback → verify ── */
  const payBase = () => location.origin + location.pathname;          // Zibal adds ?success=&status=&trackId=&orderId= to this
  async function startPay(o) {
    o.tries = (o.tries || 0) + 1; saveOrders();
    location.hash = '#pay/' + o.id; renderPay(o, 'wait');
    const body = { amount: o.total * 10, callbackUrl: payBase(), orderId: `${o.id}_${o.tries}`, mobile: o.rphone || o.phone, description: `سفارش ${o.id} · نخل جیرفت` };   // amount in Rial
    try {
      const r = PAY.api
        ? await fetch(PAY.api + '/pay-request.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('https://gateway.zibal.ir/v1/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ merchant: PAY.merchant, ...body }) });
      const j = await r.json();
      if (!j.trackId || (j.result && j.result !== 100)) throw new Error(j.message || 'request failed');
      o.trackId = j.trackId; saveOrders();
      location.href = 'https://gateway.zibal.ir/start/' + j.trackId;                // off to the bank
    } catch (err) {
      if (!PAY.api) { history.replaceState(null, '', '#pay/test/' + o.id); lastHash = location.hash; route(); return; }                // test mode without network access → built-in test gateway
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

  /* ════════ ACCOUNTS & AUTH (standalone #auth page) ════════
     Demo only, no server: passwords are kept as salted SHA-256 hashes, never as plain text,
     but anything in front-end code can be read — real auth, roles and password resets belong on your backend. */
  const sha256 = str => {
    let ascii = String.fromCharCode(...new TextEncoder().encode(str));
    const rr = (v, a) => (v >>> a) | (v << (32 - a)), maxWord = 2 ** 32, bitLen = ascii.length * 8, words = [];
    let hash = [], k = [], n = 0; const comp = {};
    for (let c = 2; n < 64; c++) if (!comp[c]) { for (let i = 0; i < 313; i += c) comp[i] = c; hash[n] = (c ** .5 * maxWord) | 0; k[n++] = (c ** (1 / 3) * maxWord) | 0; }
    ascii += '\x80'; while (ascii.length % 64 - 56) ascii += '\x00';
    for (let i = 0; i < ascii.length; i++) words[i >> 2] |= ascii.charCodeAt(i) << ((3 - i) % 4) * 8;
    words[words.length] = (bitLen / maxWord) | 0; words[words.length] = bitLen;
    for (let j = 0; j < words.length;) {
      const w = words.slice(j, j += 16), old = hash; hash = hash.slice(0, 8);
      for (let i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        const t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
          + (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        const t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0;
      }
      for (let i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    let out = ''; for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; out += (b < 16 ? '0' : '') + b.toString(16); }
    return out;
  };
  const pwHash = (phone, pw) => sha256(phone + ':' + pw);
  const PRESET = {                        // pre-configured accounts (hash of phone:password)
    '09931934298': { name: 'آیدین رئیسی', role: 'admin', hash: '09cc6a6c8f4b54d2ebac5ffa1df3aa2ab5524686c96e35f7f9de3e5b2fb1d270' }
  };
  const users = Object.assign({}, PRESET, store.get('nakhl:users:v2', {}) || {});
  const saveUsers = () => store.set('nakhl:users:v2', users);
  let session = store.get('nakhl:session', null);
  if (session && !users[session.phone]) session = null;
  let actAs = store.get('nakhl:actAs:v2', null);          // manager → acting inside a customer's account
  const custName = ph => (users[ph] && users[ph].name) || (requests.find(r => r.phone === ph) || {}).name || 'مشتری بدون حساب';
  const syncSession = () => {
    if (session) Object.assign(session, { name: users[session.phone].name, role: users[session.phone].role });
    admin = session && session.role === 'admin' ? session : null;
    if (!admin) actAs = null;
    user = admin ? (actAs ? { phone: actAs, name: custName(actAs), role: 'customer', viaAdmin: true } : null)
                 : (session || null);
  };
  syncSession();
  let authReturn = null, pendingAfter = null, fpPhone = '';
  /* checkout & protected pages call this: send the visitor to the auth page and continue afterwards */
  function openLogin(after, mode = 'user') {
    if (mode === 'admin' ? admin : user) { after && after(); return; }
    if (mode === 'user' && admin) {                       // manager without a customer selected
      if (drawerOpen) closeCart(false);
      admTab = 'customers'; location.hash = '#admin';
      toast('برای ثبت سفارش به‌جای مشتری، اول حساب او را از «مشتریان و پشتیبانی» باز کنید'); return;
    }
    pendingAfter = after || null; authReturn = mode === 'admin' ? 'admin' : 'dashboard';
    if (drawerOpen) closeCart(false);
    location.hash = '#auth';
  }
  const note = m => { $('#authNote').hidden = !m; $('#authNote').textContent = m || ''; };
  function authScreen(scr) {
    $$('[data-screen]').forEach(el => { el.hidden = el.dataset.screen !== scr; });
    $('#authTabs').hidden = scr === 'forgot';
    $$('[data-auth-tab]').forEach(a => { const on = a.dataset.authTab === scr; a.classList.toggle('text-cyprus', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    const T = { signin: ['ورود به حساب', 'با شماره موبایل و رمز عبور وارد شوید.'], signup: ['ساخت حساب تازه', 'در کمتر از یک دقیقه عضو نخل جیرفت شوید.'], forgot: ['بازیابی رمز عبور', 'شماره‌ی حساب را وارد کنید و رمز تازه بسازید.'] }[scr];
    $('#authHeading').textContent = T[0]; $('#authLead').textContent = T[1];
    $('#authPill').style.transform = scr === 'signup' ? 'translateX(-100%)' : '';
    const B = { signup: ['به خانواده‌ی نخل<br>خوش آمدید', 'با یک حساب رایگان، سفارش‌ها را لحظه‌به‌لحظه در زنجیره‌ی سرد دنبال کنید.', 'به خانواده‌ی نخل خوش آمدید', 'خرمای تازه با زنجیره‌ی سرد'],
                signin: ['دوباره خوش آمدید<br>به نخل جیرفت', 'سفارش‌ها، کیف پول و درخواست‌های سردخانه‌تان منتظر شماست.', 'دوباره خوش آمدید', 'سفارش‌هایتان منتظر شماست'],
                forgot: ['نگران نباشید،<br>حسابتان امن است', 'در چند ثانیه برای حساب ذخیره‌شده روی همین دستگاه رمز تازه بسازید.', 'بازیابی رمز عبور', 'رمز تازه در چند ثانیه'] }[scr];
    $('#authBrandT').innerHTML = B[0]; $('#authBrandL').textContent = B[1]; $('#authBrandM').textContent = B[2]; $('#authBrandMs').textContent = B[3];
    [$('#authBrandT'), $('#authBrandL')].forEach(el => { el.classList.remove('a-in'); void el.offsetWidth; el.classList.add('a-in'); });
    const scrEl = $(`[data-screen="${scr}"]`), anim = scr === 'forgot' ? $('#fpPhoneForm') : scrEl;   /* replay the cascade on every switch */
    [scrEl, anim, $('#authHeading'), $('#authLead')].forEach(el => { el.classList.remove('a-in'); void el.offsetWidth; el.classList.add('a-in'); });
    if (scr === 'forgot') { $('#fpPhoneForm').hidden = false; $('#fpCodeForm').hidden = true; $('#fpNewForm').hidden = true; }
    $$('#authView [role="alert"]').forEach(p => { p.textContent = ''; });
    if (!$('#authNote').dataset.keep) note(scr === 'forgot' ? '' : authReturn === 'admin' ? 'برای ورود به پنل مدیریت، با حساب مدیر وارد شوید.' : pendingAfter ? 'برای تکمیل خرید وارد شوید یا ثبت‌نام کنید.' : '');
    delete $('#authNote').dataset.keep;
    if (!touchUI) setTimeout(() => { const f = $(`[data-screen="${scr}"] input`); f && f.focus({ preventScroll: true }); }, 60);   // phones: no auto-keyboard over the form
  }
  const touchUI = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const shake = el => { el.classList.remove('a-shake'); void el.offsetWidth; el.classList.add('a-shake'); };
  const fieldErr = (el, msgEl, m) => { const w = el.closest('.gap-1\\.5'); if (w && msgEl.parentElement !== w) { msgEl.classList.remove('min-h-[1.25rem]'); w.appendChild(msgEl); }   // message sits under the field that failed
    msgEl.textContent = m; el.setAttribute('aria-invalid', 'true'); shake(el); el.focus(); return false; };
  $$('#authView input').forEach(i => i.addEventListener('input', () => i.setAttribute('aria-invalid', 'false')));
  const EYE = svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 18, 2);
  const EYE_OFF = svg('<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>', 18, 2);
  $$('.pw-eye').forEach(b => { b.innerHTML = EYE; b.addEventListener('click', () => {
    const inp = b.previousElementSibling, show = inp.type === 'password';
    inp.type = show ? 'text' : 'password'; b.innerHTML = show ? EYE_OFF : EYE;
    b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور');
  }); });
  const strong = pw => pw.length >= 8 && /[A-Za-z؀-ۿ]/.test(pw) && /\d/.test(toLatin(pw));

  function startSession(phone) {
    session = { phone }; store.set('nakhl:session', session); syncSession(); updateUserUI();
    const isAdm = session.role === 'admin', wantAdm = authReturn === 'admin', after = pendingAfter;
    authReturn = null; pendingAfter = null;
    const w = $('#welcome'), btns = $$('#authView button');
    w.innerHTML = `${svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 16, 2.6)}خوش آمدید ${esc(session.name)} - در حال انتقال...`;
    w.classList.add('show'); btns.forEach(b => { b.disabled = true; });
    longBar(1500, () => {                                // banner + top bar run together for 1.5s, then redirect
      btns.forEach(b => { b.disabled = false; });
      if (wantAdm && !isAdm) toast('این حساب دسترسی مدیر ندارد؛ به داشبورد خودتان رفتید');
      if (!isAdm && after) { after(); if (location.hash.startsWith('#auth')) location.hash = '#dashboard'; }
      else location.hash = isAdm ? '#admin' : '#dashboard';   // admin → #adminView, customer → #dashboardView
      setTimeout(() => w.classList.remove('show'), 900);
    });
  }
  $('#signinForm').addEventListener('submit', e => {
    e.preventDefault();
    const ph = $('#siPhone'), pw = $('#siPass'), err = $('#siErr'), phone = toLatin(ph.value);
    if (!validPhone(phone)) return fieldErr(ph, err, phone ? 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.' : 'شماره موبایل را وارد کنید.');
    if (!pw.value) return fieldErr(pw, err, 'رمز عبور را وارد کنید.');
    // TODO: POST to your backend; it checks the password and returns a session token + role
    if (!users[phone] || users[phone].hash !== pwHash(phone, pw.value)) { pw.value = ''; return fieldErr(pw, err, 'شماره موبایل یا رمز عبور درست نیست.'); }
    e.target.reset(); startSession(phone);
  });
  $('#signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const nm = $('#suName'), ph = $('#suPhone'), pw = $('#suPass'), err = $('#suErr'), phone = toLatin(ph.value);
    if (nm.value.trim().length < 3) return fieldErr(nm, err, 'نام و نام خانوادگی را کامل وارد کنید.');
    if (!validPhone(phone)) return fieldErr(ph, err, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
    if (users[phone]) return fieldErr(ph, err, 'با این شماره قبلاً حساب ساخته شده؛ وارد شوید.');
    if (!strong(pw.value)) return fieldErr(pw, err, 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.');
    // TODO: create the account on your backend (verify the phone with an SMS code there)
    users[phone] = { name: nm.value.trim(), role: 'customer', hash: pwHash(phone, pw.value) }; saveUsers();
    e.target.reset(); startSession(phone);
  });
  /* forgot password: phone → code (demo 12345) → new password */
  const fpBoxes = $$('#fpCodeForm .otp');
  $('#fpPhoneForm').addEventListener('submit', e => {
    e.preventDefault();
    const ph = $('#fpPhone'), phone = toLatin(ph.value);
    if (!validPhone(phone)) return fieldErr(ph, $('#fpErr1'), 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
    if (!users[phone]) return fieldErr(ph, $('#fpErr1'), 'حسابی با این شماره پیدا نشد.');
    if (users[phone].role === 'admin') return fieldErr(ph, $('#fpErr1'), 'رمز حساب مدیر از این صفحه بازیابی نمی‌شود.');   // demo OTP must never unlock the manager account
    // No SMS gateway yet: accounts live on this device, so the reset goes straight to a new password.
    // TODO (with a backend): send a code by SMS and show #fpCodeForm here instead.
    fpPhone = phone; $('#fpTo').textContent = phone; fpBoxes.forEach(b => { b.value = ''; b.setAttribute('aria-invalid', 'false'); });
    $('#fpPhoneForm').hidden = true; $('#fpNewForm').hidden = false; $('#fpPass').focus();
  });
  const digits = v => toLatin(v).replace(/\D/g, '');
  const checkCode = () => {
    const code = fpBoxes.map(b => b.value).join('');
    if (code.length < 5) { $('#fpErr2').textContent = 'کد ۵ رقمی را کامل وارد کنید.'; return; }
    if (code !== '12345') { $('#fpErr2').textContent = 'کد واردشده درست نیست.'; fpBoxes.forEach(b => { b.setAttribute('aria-invalid', 'true'); shake(b); }); fpBoxes[4].focus(); return; }
    $('#fpCodeForm').hidden = true; $('#fpNewForm').hidden = false; $('#fpPass').focus();
  };
  fpBoxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      $('#fpErr2').textContent = ''; fpBoxes.forEach(x => x.setAttribute('aria-invalid', 'false'));
      const d = digits(b.value);
      if (d.length > 1) { d.slice(0, 5 - i).split('').forEach((c, k) => { fpBoxes[i + k].value = c; }); fpBoxes[Math.min(4, i + d.length)].focus(); }
      else { b.value = d; if (d && i < 4) fpBoxes[i + 1].focus(); }
      if (fpBoxes.every(x => x.value)) checkCode();
    });
    b.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !b.value && i) { e.preventDefault(); fpBoxes[i - 1].value = ''; fpBoxes[i - 1].focus(); }
      if (e.key === 'ArrowRight' && i < 4) fpBoxes[i + 1].focus();
      if (e.key === 'ArrowLeft' && i) fpBoxes[i - 1].focus();
    });
    b.addEventListener('focus', () => b.select());
  });
  $('#fpCodeForm').addEventListener('submit', e => { e.preventDefault(); checkCode(); });
  $('#fpNewForm').addEventListener('submit', e => {
    e.preventDefault();
    const a = $('#fpPass'), b = $('#fpPass2'), err = $('#fpErr3');
    if (!strong(a.value)) return fieldErr(a, err, 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.');
    if (a.value !== b.value) return fieldErr(b, err, 'تکرار رمز عبور یکسان نیست.');
    // TODO: your backend saves the new password after re-checking the code
    users[fpPhone].hash = pwHash(fpPhone, a.value); saveUsers(); e.target.reset();
    $('#siPhone').value = fpPhone; $('#authNote').dataset.keep = '1'; note('رمز عبور تغییر کرد؛ با رمز جدید وارد شوید.');
    location.hash = '#auth';
  });

  function updateUserUI() {
    const label = session ? session.name : 'ورود / ثبت‌نام', target = session ? (admin ? '#admin' : '#dashboard') : '#auth';
    $('#userBtn').setAttribute('aria-label', session ? `حساب ${session.name}` : 'ورود / ثبت‌نام');
    $('#userLabel').textContent = label;
    $('#loginHint').hidden = !!session;
  }
  $('#userBtn').addEventListener('click', () => { location.hash = session ? (admin ? '#admin' : '#dashboard') : '#auth'; });
  const startAct = ph => { actAs = ph; store.set('nakhl:actAs:v2', ph); syncSession(); dashTab = 'overview'; location.hash = '#dashboard'; toast(`حساب ${custName(ph)} باز شد`); };
  const endAct = () => { actAs = null; store.set('nakhl:actAs:v2', null); syncSession(); admTab = 'customers'; location.hash = '#admin'; };
  $$('[data-logout]').forEach(b => b.addEventListener('click', () => {
    if (user && user.viaAdmin && !b.closest('#adminView')) return endAct();   // the admin panel's own button always signs the manager out            // in support mode "exit" just leaves the customer's account
    // TODO: also invalidate the session on the server
    session = null; wantCheckout = false; store.set('nakhl:session', null); store.set('nakhl:actAs:v2', null); syncSession(); updateUserUI();
    toast('از حساب خارج شدید'); location.hash = '#top';
  }));
  $$('[data-endact]').forEach(b => b.addEventListener('click', endAct));
  $('#admSwitch').addEventListener('click', () => { session = null; store.set('nakhl:session', null); syncSession(); updateUserUI(); authReturn = 'admin'; location.hash = '#auth'; });

  const setTab = (nav, tab, scope) => {
    $$('[data-tab]', nav).forEach(b => b.dataset.tab === tab ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    const on = $(`[data-tab="${tab}"]`, nav); if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2, behavior: smooth });
    $$('[data-pane]', scope).forEach(p => { p.hidden = p.dataset.pane !== tab; });
  };
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'صبح بخیر' : h < 17 ? 'روز بخیر' : 'عصر بخیر'; };

  /* ════════ CUSTOMER DASHBOARD ════════ */
  let dashTab = 'overview';
  const TIERS = [['جوانه', 0], ['نهال', 300], ['نخل', 800], ['نخلستان', 1500]];
  const TRACK = [['ثبت سفارش', 0], ['تأیید سفارش', 1], ['بسته‌بندی در سالن سرد (۲ تا ۴ درجه)', 6], ['تحویل به کامیون یخچال‌دار', 20], ['در مسیر مقصد', 30], ['تحویل به مشتری', 48]];
  const TRACK_AT = { pending: 1, processing: 2, shipped: 4, delivered: 5 };
  const pm = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: 'numeric' }), mon = new Intl.DateTimeFormat('fa-IR', { month: 'short' });

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

    /* yearly analytics (kg per Persian month, last 12 months) */
    const months = [];
    for (let i = 0; months.length < 12 && i < 16; i++) { const d = now0 - i * 30.4 * DAY, key = pm.format(d); if (!months.some(m => m.key === key)) months.unshift({ key, label: mon.format(d), kg: 0 }); }
    mine.forEach(o => { const m = months.find(x => x.key === pm.format(o.date)); if (m) m.kg += kgOf(o); });
    const mx = Math.max(1, ...months.map(m => m.kg));
    $('#yTotal').textContent = kgFa(months.reduce((s, m) => s + m.kg, 0));
    $('#yChart').innerHTML = months.map((m, i) => `<div class="group flex min-w-0 flex-1 flex-col items-center gap-1.5">
        <span class="text-[10px] font-bold text-cyprus opacity-0 transition-opacity group-hover:opacity-100">${m.kg ? kgFa(m.kg) : ''}</span>
        <div class="flex h-28 w-full items-end"><span class="block w-full rounded-lg ${i === months.length - 1 ? 'bg-[#28622D]' : m.kg ? 'bg-cyprus/30 group-hover:bg-cyprus/60' : 'bg-cyprus/10'} transition-colors" style="height:${m.kg ? Math.max(8, m.kg / mx * 100) : 4}%" title="${kgFa(m.kg)} کیلوگرم"></span></div>
        <span class="whitespace-nowrap text-[9px] text-ink-soft sm:text-[10px] ${i % 2 ? 'max-sm:invisible' : ''}">${m.label}</span></div>`).join('');

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
          t: `${REQ_TYPES[r.type] || 'درخواست'} <span dir="ltr">${r.id}</span>`, s: r.status === 'approved' ? 'درخواست شما تایید شد.' : r.status === 'closed' ? 'این درخواست بسته شد.' : 'در حال بررسی است؛ به‌زودی تماس می‌گیریم.', k: r.id + r.status }))
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
  const goDashTab = t => { if (t !== dashTab) { loadBar(); dashTab = t; renderDash(); } };
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
    if (add) { const id = add.dataset.qadd; setQty(id, (cart[id] || 0) + 1); fly(add, () => { bump($('#cartCount')); updateBar(true); }); toast(`${byId[id].name} به سبد اضافه شد`); return; }
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

  /* ════════ ADMIN PANEL ════════ */
  const HALLS = [                        // sample hall data → 3,900 of 5,000 t = 78%
    { name: 'سالن ۱ · مضافتی', cap: 1500, used: 1260, temp: '+2.4', hum: 85 },
    { name: 'سالن ۲ · پیارم',  cap: 1200, used: 1010, temp: '+3.1', hum: 82 },
    { name: 'سالن ۳ · کلوته',  cap: 1300, used: 930,  temp: '+2.8', hum: 84 },
    { name: 'سالن ۴ · خشکبار', cap: 1000, used: 700,  temp: '+3.6', hum: 65 }
  ];
  const CAT_FA = { mazafati: 'مضافتی', piarom: 'پیارم', kaluteh: 'کلوته', dried: 'خشکبار' };
  const TITLES = { stats: 'آمار و داشبورد', orders: 'مدیریت سفارش‌ها', inventory: 'کنترل موجودی و قیمت', storage: 'وضعیت سردخانه', customers: 'مشتریان و پشتیبانی' };
  const saveWallet = () => store.set('nakhl:wallet:v2', wallet);
  let admTab = 'stats', admFilter = 'all';
  const ring = pct => `conic-gradient(#28622D 0 ${pct}%, #E3F2E5 ${pct}% 100%)`;
  const seg = (o) => `<div class="flex rounded-full bg-sand p-1" role="group" aria-label="وضعیت سفارش ${o.id}">${STATUS.filter(([v]) => v !== 'pending').map(([v, l]) =>
      `<button data-oid="${o.id}" data-st="${v}" aria-pressed="${v === o.status}" class="ease-ui h-8 flex-1 whitespace-nowrap rounded-full px-2 font-display text-[11px] font-bold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyprus ${v === o.status ? 'bg-[#28622D] text-white shadow-[0_6px_14px_-6px_rgba(40,98,45,.6)]' : 'text-cyprus-mid hover:bg-white'}">${l.replace('در حال ', '')}</button>`).join('')}</div>`;
  const orderRow = o => `
      <li class="card grid gap-4 p-5 lg:grid-cols-[1fr_1.4fr_1fr_300px] lg:items-center lg:gap-5">
        <div><p class="font-display font-black text-cyprus" dir="ltr" style="text-align:right">${o.id}</p><p class="mt-1 text-xs text-ink-soft">${dateFa(o.date)} · ${kgFa(kgOf(o))} کیلوگرم</p></div>
        <div class="min-w-0 text-sm"><p class="font-display font-bold text-ink">${esc(o.name || custName(o.phone))} <span class="tel text-xs font-normal text-ink-soft" dir="ltr">${o.rphone || o.phone}</span></p><p class="mt-1 line-clamp-2 text-xs leading-6 text-ink-soft">${o.items.map(([id, q]) => `<span class="whitespace-nowrap">${byId[id].name} × ${fa(q)}</span>`).join('، ')}</p></div>
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
            <div class="min-w-0"><p class="truncate font-display font-black text-cyprus">${esc(c.name)}</p><p class="text-xs text-ink-soft"><span dir="ltr">${c.ph}</span> · ${c.acc ? 'حساب فعال' : 'بدون رمز عبور'}</p></div></div>
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
          <div><p class="font-display font-black text-cyprus">${REQ_TYPES[r.type] || 'درخواست'} · <span dir="ltr">${r.id}</span></p><p class="mt-1 text-xs text-ink-soft">${esc(r.name)} · <span dir="ltr">${r.phone}</span> · ${dateFa(r.date)}</p></div>
          <p class="text-sm text-ink-muted">${esc(r.product)}${r.qty ? ' · ' + esc(r.qty) : ''}</p>
          <div class="flex rounded-full bg-sand p-1" role="group" aria-label="وضعیت ${r.id}">${REQ_STATUS.map(([v, l]) => `<button data-rid="${r.id}" data-rst="${v}" aria-pressed="${v === r.status}" class="ease-ui h-8 whitespace-nowrap rounded-full px-3 font-display text-[11px] font-bold active:scale-95 ${v === r.status ? 'bg-[#28622D] text-white' : 'text-cyprus-mid hover:bg-white'}">${l}</button>`).join('')}</div>
        </li>`).join('') : `<li class="card p-8 text-center text-sm text-ink-muted">درخواستی ثبت نشده است.</li>`;
    }
  }
  const goAdmTab = t => { if (t !== admTab) { loadBar(); admTab = t; renderAdmin(); } scrollTo({ top: 0, behavior: smooth }); };
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


  /* ════════ RECEIPT ════════ */
  const trackCode = o => `JRF-${o.id.split('-')[1]}-${o.phone.slice(-4)}`;
  function renderReceipt(o) {
    const d = new Date(o.date);
    const row = (k, v, ltr) => `<div class="flex items-start justify-between gap-4"><dt class="min-w-0 text-ink-muted">${k}:</dt><dd class="text-left font-bold leading-6 text-ink"${ltr ? ' dir="ltr"' : ''}>${v}</dd></div>`;
    $('#rcWhen').textContent = `${new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(d)} - ${new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)}`;
    $('#rcBuyer').innerHTML = row('نام و نام خانوادگی', esc(o.name || custName(o.phone)))
      + row('شماره تماس', o.phone, true)
      + (o.rphone && o.rphone !== o.phone ? row('موبایل گیرنده', o.rphone, true) : '')
      + row(o.ship === 'pickup' ? 'تحویل' : 'آدرس تحویل', esc(o.addr || 'هماهنگی تلفنی'))
      + (o.note ? row('توضیحات', esc(o.note)) : '');
    const sub = o.sub ?? o.items.reduce((s, [id, q, pr]) => s + q * (pr ?? byId[id].price), 0), disc = o.disc ?? Math.max(0, sub - o.total);
    $('#rcOrder').innerHTML = o.items.map(([id, q, pr]) => { const p = byId[id], u = pr ?? p.price;
        return `<div class="flex items-start justify-between gap-4"><dt class="min-w-0 text-ink"><b class="font-bold">${p.name}</b><span class="block text-xs text-ink-soft">${p.unit} · ${fa(q)} عدد، هر عدد ${fa(u)} تومان</span></dt><dd class="shrink-0 whitespace-nowrap text-left font-bold leading-6 text-ink">${fa(q * u)} تومان</dd></div>`; }).join('')
      + row('جمع کالاها', `${fa(sub)} تومان`)
      + (disc ? row('تخفیف', `− ${fa(disc)} تومان`) : '')
      + row('وزن کل', `${kgFa(o.items.reduce((s, [id, q]) => s + byId[id].kg * q, 0))} کیلوگرم`)
      + row('شماره سفارش', o.id, true)
      + row('کد رهگیری', trackCode(o), true)
      + row('ارسال', o.ship === 'pickup' ? 'تحویل حضوری (رایگان)' : (o.free ?? sub >= FREE_SHIP) ? 'رایگان (یخچال‌دار)' : 'پس‌کرایه (یخچال‌دار)');
    $('#rcTotal').textContent = fa(o.total);
    $('#rcToman').textContent = `معادل ${fa(o.total * 10)} ریال`;
    $('#rcDash').hidden = !(user && user.phone === o.phone);
    const paid = o.status !== 'unpaid'; rcOrder = o;
    $('#rcState').classList.toggle('unpaid', !paid);
    $('#rcIc').innerHTML = svg(paid ? '<path d="M5 12.5l4.5 4.5L19 7.5"/>' : '<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>', 20, 2.6);
    $('#rcStateT').textContent = paid ? 'پرداخت موفق؛ سفارش ثبت شد' : 'سفارش هنوز پرداخت نشده';
    $('#rcStateS').textContent = paid ? (o.ref ? `کد پیگیری بانک: ${o.ref}` : 'سفارش برای بسته‌بندی سرد به سردخانه رفت.') : 'برای ثبت نهایی، پرداخت آنلاین را کامل کنید.';
    $('#rcPay').hidden = paid || !(user && user.phone === o.phone);
  }
  let rcOrder = null;
  $('#rcPay').addEventListener('click', () => { if (rcOrder) startPay(rcOrder); });
  const orderSms = o => {
    const lines = [`سفارش ${o.id} · نخل جیرفت`, `نام: ${o.name || custName(o.phone)}`, `موبایل: ${o.phone}`, `آدرس: ${o.addr || 'هماهنگی تلفنی'}`, '—'];
    o.items.forEach(([id, q, pr]) => { const p = byId[id]; lines.push(`${p.name} (${p.unit}) × ${fa(q)} = ${fa(q * (pr ?? p.price))}`); });
    if (o.disc) lines.push(`تخفیف: ${fa(o.disc)}`);
    lines.push(`مبلغ کل: ${fa(o.total)} تومان`, `کد رهگیری: ${trackCode(o)}`);
    return lines.join('\n');
  };
  $('#rcPrint').addEventListener('click', () => {
    document.body.classList.add('print-receipt'); window.print();
    setTimeout(() => document.body.classList.remove('print-receipt'), 500);
  });

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

  /* ── «بازگشت»: goes to the page you came from inside the site; opened directly → the home page ── */
  const trail = [location.hash || '#top'];
  addEventListener('hashchange', () => {
    const hsh = location.hash || '#top';
    if (trail.length > 1 && trail[trail.length - 2] === hsh) trail.pop(); else if (trail[trail.length - 1] !== hsh) trail.push(hsh);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-back]')) return;
    if (trail.length > 1) history.back(); else location.hash = '#top';
  });

  /* ── Start ── */
  renderCatalog(false);
  $('#cartCount').textContent = fa(count());
  updateUserUI();
  updateBar();
  if (!handlePayReturn()) { if (/^#(products|dashboard|account|admin|auth|receipt|checkout|pay)/.test(location.hash)) route(); else play(); }
})();
