/* 01-products.js — Product catalogue (name, price, unit, photo, category), category titles and the photo/placeholder renderer.
   To add or edit a product: change the `products` array; prices/stock can also be edited live in the admin panel. */

/* ── Products: set `img` to a PNG path when your photos are ready. Prices are samples.
      featured:true → shown in the 4 curated cards on the homepage ── */
const products = [
  { id:'maz20', cat:'mazafati', img:'img/p/maz-box.webp', name:'خرمای مضافتی',    unit:'جعبه‌ی ۲ کیلویی',      price:495000,  badge:'۱۰۰٪ ارگانیک', tag:'مضافتی', featured:true },
  { id:'mazc',  cat:'mazafati', img:'img/p/maz-carton.webp', name:'کارتن مادر مضافتی',  unit:'کارتن مادر ۱۲ کیلویی', price:2970000, badge:'', tag:'مضافتی' },
  { id:'pia2k', cat:'piarom', img:'img/p/pia-box.webp',   name:'خرمای پیارم',      unit:'جعبه‌ی ۲ کیلویی',      price:1290000, badge:'۱۰۰٪ ارگانیک', tag:'پیارم', featured:true },
  { id:'piac',  cat:'piarom', img:'img/p/pia-carton.webp',   name:'کارتن مادر پیارم',   unit:'کارتن مادر ۱۲ کیلویی', price:7740000, badge:'', tag:'پیارم' },
  { id:'kal20', cat:'kaluteh', img:'img/p/kal-box.webp',  name:'خرمای کلوته',      unit:'جعبه‌ی ۲ کیلویی',      price:430000,  badge:'۱۰۰٪ ارگانیک', tag:'کلوته', featured:true },
  { id:'kalc',  cat:'kaluteh', img:'img/p/kal-carton.webp',  name:'کارتن مادر کلوته',   unit:'کارتن مادر ۱۲ کیلویی', price:2580000, badge:'', tag:'کلوته' },
  { id:'khk20', cat:'khoshk', img:'img/p/khk-box.webp', name:'خرمای خشک',              unit:'جعبه‌ی ۲ کیلویی',      price:380000,  badge:'', tag:'خرمای خشک' },
  { id:'khkc',  cat:'khoshk', img:'img/p/khk-carton.webp', name:'کارتن مادر خرمای خشک',   unit:'کارتن مادر ۱۲ کیلویی', price:2280000, badge:'', tag:'خرمای خشک' },
  { id:'mrd20', cat:'mordasang', img:'img/p/mrd-box.webp', name:'خرمای مرداسنگ',        unit:'جعبه‌ی ۲ کیلویی',      price:460000,  badge:'', tag:'مرداسنگ' },
  { id:'mrdc',  cat:'mordasang', img:'img/p/mrd-carton.webp', name:'کارتن مادر مرداسنگ',  unit:'کارتن مادر ۱۲ کیلویی', price:2760000, badge:'', tag:'مرداسنگ' },
  { id:'pis',   cat:'dried', img:'img/p/pis.webp',    name:'پسته‌ی اکبری',            unit:'بسته‌بندی ۵۰۰ گرمی',   price:975000,  badge:'صادراتی',     tag:'پسته', featured:true },
  { id:'fig',   cat:'dried', img:'img/p/fig.webp',    name:'انجیر خشک استهبان',       unit:'بسته‌بندی ۵۰۰ گرمی',   price:490000,  badge:'۱۰۰٪ ارگانیک', tag:'انجیر' },
  { id:'alm',   cat:'dried', img:'img/p/alm.webp',    name:'بادام درختی',             unit:'بسته‌بندی ۵۰۰ گرمی',   price:620000,  badge:'صادراتی',     tag:'بادام' },
  { id:'wal',   cat:'dried', img:'img/p/wal.webp',    name:'مغز گردو',                unit:'بسته‌بندی ۵۰۰ گرمی',   price:540000,  badge:'۱۰۰٪ ارگانیک', tag:'گردو' },
  { id:'hzl',   cat:'dried', img:'img/p/hzl.webp',    name:'فندق',              unit:'بسته‌بندی ۵۰۰ گرمی',   price:690000,  badge:'صادراتی',     tag:'فندق' },
  { id:'apr',   cat:'dried', img:'img/p/apr.webp',    name:'برگه‌ی زردآلو',           unit:'بسته‌بندی ۵۰۰ گرمی',   price:380000,  badge:'۱۰۰٪ ارگانیک', tag:'زردآلو' },
  { id:'rai',   cat:'dried', img:'img/p/rai.webp',    name:'کشمش سبز',                unit:'بسته‌بندی ۵۰۰ گرمی',   price:210000,  badge:'صادراتی',     tag:'کشمش' }
];
const IMG_V = '11';                // bump when product photos change, so phones don't keep old cached copies
products.forEach(p => { if (p.img) p.img += '?v=' + IMG_V; });
const byId = Object.fromEntries(products.map(p => [p.id, p]));
/* weight in kg (for the customer's "purchased weight") + sample stock; the admin panel overrides price/stock */
const faDigits = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
products.forEach(p => { const m = faDigits(p.unit).match(/(\d+)\s*(گرمی|کیلویی)/); p.kg = m ? (m[2] === 'گرمی' ? +m[1] / 1000 : +m[1]) : 0.5; p.stock = p.id === 'hzl' ? 0 : 40; });
const DATE_CATS = ['mazafati', 'piarom', 'kaluteh', 'khoshk', 'mordasang'];
const PAGE_SIZE = 8;              // products per catalog page
const FREE_SHIP = 2000000;        // free cold shipping threshold (Toman)
const CATS = {
  dates:    ['خرمای جنوب',    'مضافتی، پیارم، کلوته، مرداسنگ و خرمای خشک؛ مستقیم از نخلستان‌ها.'],
  mazafati: ['خرمای مضافتی', 'نرم و شیرین، برداشت تازه‌ی جنوب.'],
  piarom:   ['خرمای پیارم',  'خشک و اصیل، مناسب صادرات و هدیه.'],
  kaluteh:  ['خرمای کلوته',  'نیمه‌خشک، با طعم اصیل جنوب.'],
  khoshk:   ['خرمای خشک',   'خشک و ماندگار، مناسب سفر و مصرف روزانه.'],
  mordasang:['خرمای مرداسنگ', 'نیمه‌خشک و خوش‌طعم، از نخلستان‌های جنوب.'],
  dried:    ['خشکبار ممتاز', 'پسته، بادام، انجیر و گردوی دست‌چین.'],
  all:      ['همه محصولات',  'کل محصولات نخل و ماه در یک نگاه.']
};
const TONE = {
  mazafati: '--hi:#DFECE0;--mid:#447448;--lo:#19431D;--glow:rgba(40,98,45,.18)',
  piarom:   '--hi:#F0F7F1;--mid:#325D36;--lo:#113213;--glow:rgba(25,67,29,.2)',
  kaluteh:  '--hi:#F0F7F1;--mid:#6EAA73;--lo:#377B3D;--glow:rgba(55,123,61,.16)',
  mordasang:'--hi:#F0F7F1;--mid:#5E9663;--lo:#1D4A22;--glow:rgba(40,98,45,.16)',
  khoshk:   '--hi:#F0F7F1;--mid:#8FB592;--lo:#28622D;--glow:rgba(40,98,45,.16)',
  dried:    '--hi:#FFFFFF;--mid:#BCD2BE;--lo:#87C28C;--glow:rgba(135,194,140,.2)'
};
const renderArt = (p, extra = '') => `<div class="render${extra}" style="${TONE[p.cat]}"><span class="ground"></span>${p.cat === 'dried' ? '<span class="orb duo"></span><span class="orb"></span>' : '<span class="orb"></span>'}</div>`;
const thumb = (p, extra) => p.img ? `<img src="${p.img.replace('.webp', '-400.webp')}" alt="" class="ph h-full w-full object-contain p-2" loading="lazy" decoding="async">` : renderArt(p, extra);
