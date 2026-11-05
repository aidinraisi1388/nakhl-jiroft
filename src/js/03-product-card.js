/* 03-product-card.js — Product card markup (used on home, catalog, product page) + short descriptions under each product name. */

/* ── Product card ── */
/* short line under each product name (edit freely) */
const DESC = {
  maz20: 'نرم و شیرین، برداشت تازه‌ی جنوب', mazc: 'شش جعبه‌ی ۲ کیلویی، مناسب خرید عمده',
  pia2k: 'خشک و کم‌شیرین، ماندگاری بالا', piac: 'شش جعبه‌ی ۲ کیلویی، مناسب خرید عمده',
  kal20: 'نیمه‌خشک با طعم اصیل جنوب', kalc: 'شش جعبه‌ی ۲ کیلویی، مناسب خرید عمده',
  khk20: 'خشک و ترد، ماندگاری بسیار بالا', khkc: 'شش جعبه‌ی ۲ کیلویی، مناسب خرید عمده',
  mrd20: 'نیمه‌خشک، شیرین و خوش‌دست', mrdc: 'شش جعبه‌ی ۲ کیلویی، مناسب خرید عمده',
  pis: 'مغز درشت و خندان، تازه‌برشته', fig: 'نرم و شیرین، خشک‌شده در آفتاب', alm: 'مغز کامل و ترد',
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
      <a href="#product/${p.id}" class="p-link relative grid aspect-square place-items-center overflow-hidden rounded-2xl" aria-label="${p.name} — مشاهده‌ی محصول" tabindex="-1">
        <div class="p-glow pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true"></div>
        <div class="p-img relative grid h-full w-full place-items-center">${p.img ? `<img src="${p.img}" srcset="${p.img.replace('.webp', '-400.webp')} 400w, ${p.img} 800w" sizes="(min-width:1024px) 290px, 46vw" width="800" height="800" alt="${p.name}" class="ph max-h-full w-auto object-contain p-3" loading="lazy" decoding="async">` : renderArt(p)}</div>
      </a>
      ${p.stock > 0 ? '' : `<span class="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 font-display text-[11px] font-bold text-cyprus-mid shadow-[0_2px_6px_-2px_rgba(40,98,45,0.18)] ring-1 ring-cyprus/10">ناموجود</span>`}
    </div>
    <div class="flex flex-1 flex-col pt-4 text-center">
      <h3 class="font-display text-[15px] font-extrabold leading-snug text-ink transition-colors duration-300 group-hover:text-cyprus-mid sm:text-[17px]"><a href="#product/${p.id}" class="p-title">${p.name}</a></h3>
      ${(() => { const r = rating(p.id); return r.n ? `<p class="p-rate" aria-label="امتیاز ${fa1(r.avg)} از ۵">${starsHTML(r.avg, 12)}<span>${fa1(r.avg)} · ${fa(r.n)} نظر</span></p>` : ''; })()}
      <p class="mt-1 line-clamp-2 min-h-12 text-xs leading-6 text-ink-muted sm:text-[13px]">${DESC[p.id] || ''}</p>
      <span class="unit-pill mx-auto mt-2 inline-flex w-fit max-w-full items-center whitespace-nowrap gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-cyprus-mid">${svg('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/>', 12, 2.4)}${p.unit}</span>
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
if (window.lucide) lucide.createIcons();
