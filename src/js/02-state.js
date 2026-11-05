/* 02-state.js — Browser storage wrapper, the cart object, shared SVG icons, promo codes and cart totals. */

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
/* each customer may use a promo code only once: a paid order carrying the code marks it as used */
const promoUsed = (code, ph) => { try { return !!ph && orders.some(o => o.phone === ph && o.promo === code && o.status !== 'unpaid'); } catch (e) { return false; } };
const totals = () => {
  const sub = subtotal();
  const disc = !promo || !sub || (user && promoUsed(promo.code, user.phone)) ? 0 : Math.min(sub, promo.type === 'pct' ? Math.round(sub * promo.v / 100) : promo.v);
  return { sub, disc, total: sub - disc, free: sub >= FREE_SHIP };
};
