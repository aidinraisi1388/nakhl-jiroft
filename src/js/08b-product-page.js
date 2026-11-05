/* 08b-product-page.js — Product page (#product/<id>).
   Opened by clicking a product's photo or name anywhere. Shows the photo, rating, price, size switch (box ⇄ carton),
   add-to-cart (the same control as the cards, so the cart stays in sync), description, specs, reviews and similar products.
   Reviews are kept in this browser (nakhl:reviews:v1) until a server exists — nothing is pre-filled or invented. */

const REV_KEY = 'nakhl:reviews:v1';
const reviews = store.get(REV_KEY, {}) || {};
const saveReviews = () => store.set(REV_KEY, reviews);
const revOf = id => (Array.isArray(reviews[id]) ? reviews[id] : []).filter(r => r && r.r >= 1 && r.r <= 5);
/* average and count for a product (used on the page and on the cards) */
const rating = id => { const l = revOf(id); return { n: l.length, avg: l.length ? l.reduce((s, r) => s + r.r, 0) / l.length : 0 }; };
const fa1 = v => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(v);
/* five stars filled to a fraction (CSS width), read out as text for screen readers */
const starsHTML = (avg, size = 16) => `<span class="stars" style="--s:${size}px" aria-hidden="true"><span class="stars-on" style="width:${avg / 5 * 100}%">★★★★★</span>★★★★★</span>`;

let pdId = null;
function renderProduct(id) {
  const p = byId[id]; if (!p) return false;
  pdId = id;
  const info = infoOf(p), isDate = DATE_CATS.includes(p.cat);
  document.title = `${p.name} | فروشگاه نخل و ماه`;
  $('#pdCatLink').textContent = isDate ? 'خرما' : 'خشکبار'; $('#pdCatLink').href = '#products/' + (isDate ? 'dates' : 'dried');
  $('#pdCrumb').textContent = p.name;
  $('#pdKind').textContent = `${isDate ? 'خرما' : 'خشکبار ممتاز'} · ${p.unit}`;
  $('#pdName').textContent = p.name;
  $('#pdShort').textContent = DESC[p.id] || '';
  $('#pdImg').innerHTML = p.img
    ? `<img src="${p.img}" srcset="${p.img.replace('.webp', '-400.webp')} 400w, ${p.img} 800w" sizes="(min-width:1024px) 560px, 92vw" width="800" height="800" alt="${p.name}" decoding="async" fetchpriority="high">`
    : renderArt(p);

  /* sizes of the same product (e.g. 2 kg box ⇄ 12 kg master carton) */
  const family = products.filter(x => x.cat !== 'dried' && x.cat === p.cat);
  $('#pdSizes').innerHTML = family.length > 1 ? family.map(x => `<a href="#product/${x.id}" class="pd-size"${x.id === p.id ? ' aria-current="true"' : ''}><b>${x.unit}</b><small>${fa(x.price)} تومان</small></a>`).join('') : '';
  $('#pdSizes').hidden = family.length < 2;

  $('#pdPrice').textContent = fa(p.price);
  $('#pdStock').textContent = p.stock > 0 ? (p.stock < 10 ? `فقط ${fa(p.stock)} عدد باقی مانده` : 'موجود در انبار سرد') : 'ناموجود';
  $('#pdStock').className = 'pd-stock' + (p.stock > 0 ? '' : ' out');
  const q = cart[p.id] || 0;
  $('#pdBuy').innerHTML = p.stock <= 0 ? `<div class="grid h-14 place-items-center rounded-2xl bg-sand font-display font-bold text-ink-soft">فعلاً ناموجود است</div>` : `
    <div class="buy pd-buy" data-id="${p.id}" data-state="${q ? 'open' : 'idle'}">
      <button class="add" aria-label="افزودن ${p.name} به سبد"><span class="lbl inline-flex items-center gap-1.5">${PLUS}افزودن به سبد خرید</span><span class="ok">${CHECK}افزوده شد</span></button>
      <div class="step stepper" role="group" aria-label="تعداد ${p.name} در سبد">
        <button class="dec" aria-label="کم کردن یکی">${MINUS}</button><span class="num" aria-live="polite">${fa(q)}</span><button class="inc" aria-label="افزودن یکی دیگر">${PLUS}</button>
      </div>
    </div>`;

  $('#pdAbout').textContent = info.about;
  $('#pdUse').textContent = info.use;
  $('#pdSpec').innerHTML = info.spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#pdGood').innerHTML = goodOf(p).map(g => `<li>${g}</li>`).join('');
  const n = nutriOf(p), g1 = v => fa1(v) + ' گرم';
  $('#pdNutri').innerHTML = n ? `
    <div class="pd-kcal"><b>${fa(n.kcal)}</b><span>کیلوکالری</span></div>
    <dl class="pd-spec">${[['کربوهیدرات', g1(n.carb)], ['قند', g1(n.sugar)], ['فیبر', g1(n.fiber)], ['پروتئین', g1(n.protein)], ['چربی', g1(n.fat)], ...n.extra].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : '';


  renderReviews();

  /* similar: same group first (dates ↔ dates, dried ↔ dried), then the rest; never the product itself or its other size */
  const group = c => DATE_CATS.includes(c) ? 'dates' : c;
  const sim = products.filter(x => x.id !== p.id && !(x.cat !== 'dried' && x.cat === p.cat))
    .sort((a, b) => (group(b.cat) === group(p.cat)) - (group(a.cat) === group(p.cat)) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 4);
  $('#pdSimilar').innerHTML = sim.map(cardHTML).join('');
  $('#pdSimAll').href = '#products/' + (DATE_CATS.includes(p.cat) ? 'dates' : p.cat);
  return true;
}

function renderReviews() {
  const id = pdId, list = revOf(id).slice().sort((a, b) => b.d - a.d), { n, avg } = rating(id);
  $('#pdRate').innerHTML = n ? `${starsHTML(avg)}<b>${fa1(avg)}</b><span>از ۵ · ${fa(n)} نظر</span>` : `${starsHTML(0)}<span>هنوز امتیازی ثبت نشده؛ اولین نظر را بنویسید</span>`;
  $('#pdRate').setAttribute('aria-label', n ? `امتیاز ${fa1(avg)} از ۵ از ${fa(n)} نظر` : 'هنوز امتیازی ثبت نشده');
  const bars = [5, 4, 3, 2, 1].map(s => { const c = list.filter(r => r.r === s).length; return `<li><span>${fa(s)}★</span><i><b style="width:${n ? c / n * 100 : 0}%"></b></i><em>${fa(c)}</em></li>`; }).join('');
  $('#pdRevSum').innerHTML = `<div class="pd-avg"><b>${n ? fa1(avg) : '–'}</b>${starsHTML(avg, 18)}<small>${n ? `از ${fa(n)} نظر` : 'بدون نظر'}</small></div><ul class="pd-bars" aria-label="تعداد هر امتیاز">${bars}</ul>`;
  $('#pdRevList').innerHTML = list.length ? list.map(r => `
    <li class="pd-rev-item">
      <div class="flex items-center justify-between gap-3"><b class="font-display text-ink">${esc(r.n)}</b>${starsHTML(r.r, 14)}</div>
      <p>${esc(r.t)}</p>
      <small>${dateFa(r.d)}${r.ph ? ' · خریدار' : ''}</small>
    </li>`).join('') : `<li class="pd-rev-empty">هنوز نظری برای این محصول ثبت نشده است.</li>`;
  /* signed-in customers: name filled in, and their own earlier review is loaded for editing */
  const mine = user && list.find(r => r.ph === user.phone);
  $('#pdRevName').value = mine ? mine.n : (user ? user.name : $('#pdRevName').value);
  $('#pdRevText').value = mine ? mine.t : '';
  $$('input[name="pdStar"]').forEach(i => { i.checked = !!mine && +i.value === mine.r; });
  $('#pdRevMsg').textContent = '';
}

$('#pdRevForm').addEventListener('submit', e => {
  e.preventDefault();
  const m = $('#pdRevMsg'), star = $('input[name="pdStar"]:checked'), name = $('#pdRevName').value.trim().replace(/\s+/g, ' '), text = $('#pdRevText').value.trim();
  const bad = !star ? 'با ستاره‌ها امتیاز بدهید.' : name.length < 2 ? 'نام خود را بنویسید.' : text.length < 5 ? 'نظرتان را کمی کامل‌تر بنویسید.' : '';
  if (bad) { m.textContent = bad; m.className = 'min-h-[1.25rem] text-sm font-bold text-red-700'; return; }
  // TODO (server): POST the review; the server stores it, checks the buyer and can moderate it before it shows
  const list = reviews[pdId] = revOf(pdId);
  const r = { n: name.slice(0, 40), r: +star.value, t: text.slice(0, 500), d: Date.now(), ph: user ? user.phone : null };
  const i = user ? list.findIndex(x => x.ph === user.phone) : -1;
  if (i >= 0) list[i] = r; else list.push(r);
  saveReviews(); renderReviews(); renderHome();
  m.textContent = i >= 0 ? 'نظر شما به‌روز شد. ممنون!' : 'نظر شما ثبت شد. ممنون!'; m.className = 'min-h-[1.25rem] text-sm font-bold text-cyprus';
});
$('#pdRate').addEventListener('click', () => $('#pdReviews').scrollIntoView({ behavior: smooth, block: 'start' }));
