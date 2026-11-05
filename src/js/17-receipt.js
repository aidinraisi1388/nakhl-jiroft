/* 17-receipt.js — Order receipt page and printing. */

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
  const lines = [`سفارش ${o.id} · نخل و ماه`, `نام: ${o.name || custName(o.phone)}`, `موبایل: ${o.phone}`, `آدرس: ${o.addr || 'هماهنگی تلفنی'}`, '—'];
  o.items.forEach(([id, q, pr]) => { const p = byId[id]; lines.push(`${p.name} (${p.unit}) × ${fa(q)} = ${fa(q * (pr ?? p.price))}`); });
  if (o.disc) lines.push(`تخفیف: ${fa(o.disc)}`);
  lines.push(`مبلغ کل: ${fa(o.total)} تومان`, `کد رهگیری: ${trackCode(o)}`);
  return lines.join('\n');
};
$('#rcPrint').addEventListener('click', () => {
  document.body.classList.add('print-receipt'); window.print();
  setTimeout(() => document.body.classList.remove('print-receipt'), 500);
});
