/* 11-inquiry.js — «استعلام سریع» (bulk order / cold-storage booking / shipping quote).
   The form checks each field in place; on send the request is saved (dashboard + admin «وضعیت سردخانه»)
   and the form turns into a confirmation ticket with a message from the shop.
   Real SMS to the customer: set INQUIRY.api to your server's inquiry endpoint (see server/README.md). */

/* ── Service selection (also set by links that carry data-service="bulk|storage") ── */
function selectService(v) { $$('.svc').forEach(b => b.setAttribute('aria-checked', b.dataset.value === v)); }
$$('.svc').forEach(b => b.addEventListener('click', () => selectService(b.dataset.value)));
$$('[data-service]').forEach(a => a.addEventListener('click', () => selectService(a.dataset.service)));

/* ── shared form helpers ── */
const toLatin = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s-]/g, '');   // Persian + Arabic digits
const validPhone = v => /^09\d{9}$/.test(toLatin(v));
const copyText = async t => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };
const SVC_FA = { bulk: 'سفارش عمده', storage: 'رزرو سالن سردخانه', shipping: 'استعلام حمل' };
const INQUIRY = {
  api: ''          // e.g. 'https://your-domain.ir/api/inquiry.php' — the server stores the request and SMSes the customer. Empty = browser only
};

const inqForm = $('#inquiryForm'), inqDone = $('#inqDone');
const inqErr = (input, box, m) => { box.textContent = m; input.setAttribute('aria-invalid', !!m); return !m; };
/* signed-in customers don't retype their name and phone */
const prefillInquiry = () => { if (user) { if (!$('#fName').value) $('#fName').value = user.name || ''; if (!$('#fPhone').value) $('#fPhone').value = user.phone || ''; } };

inqForm.addEventListener('submit', async e => {
  e.preventDefault();
  if ($('#fWeb').value) return;                                    // spam trap filled → silently ignore
  const n = $('#fName'), p = $('#fPhone'), msg = $('#formMsg');
  const name = n.value.trim().replace(/\s+/g, ' '), phone = toLatin(p.value);
  const okN = inqErr(n, $('#fNameErr'), name.length < 3 ? 'نام و نام خانوادگی را کامل بنویسید.' : '');
  const okP = inqErr(p, $('#fPhoneErr'), !phone ? 'شماره موبایل را وارد کنید.' : !validPhone(phone) ? 'شماره باید ۱۱ رقم و با ۰۹ شروع شود.' : '');
  if (!okN || !okP) { (okN ? p : n).focus(); msg.textContent = ''; return; }
  const btn = $('button[type="submit"]', inqForm); btn.disabled = true;
  const svc = $('.svc[aria-checked="true"]');
  const r = { id: 'SR-' + (Math.max(208, ...requests.map(x => +x.id.split('-')[1] || 0)) + 1), phone, name, type: svc ? svc.dataset.value : 'bulk',
    product: $('#fProduct').value, qty: $('#fQty').value.trim().slice(0, 40), note: $('#fMsg').value.trim().slice(0, 400), date: Date.now(), status: 'review' };
  if (INQUIRY.api) {                                               // server: saves the request and sends the confirmation SMS
    try { const res = await fetch(INQUIRY.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }); if (!res.ok) throw 0; }
    catch { btn.disabled = false; msg.textContent = 'ارسال نشد؛ اینترنت را بررسی کنید و دوباره بزنید.'; msg.className = 'min-h-[1.25rem] text-sm font-bold text-red-700'; return; }
  }
  requests.unshift(r); saveRequests();
  btn.disabled = false;
  showInquiryDone(r);
});
['#fName', '#fPhone'].forEach(id => $(id).addEventListener('input', e => { e.target.setAttribute('aria-invalid', 'false'); $(id + 'Err').textContent = ''; }));

/* confirmation ticket: the shop's message, the tracking code, a summary and the next steps */
function showInquiryDone(r) {
  const first = r.name.split(' ')[0];
  $('#inqCode').textContent = r.id;
  $('#inqText').textContent = `سلام ${first} عزیز، ${SVC_FA[r.type]} شما برای «${r.product}» با کد ${r.id} ثبت شد. کارشناس نخل و ماه تا ۲ ساعت کاری با شماره‌ی ${faD(r.phone)} تماس می‌گیرد.`;
  $('#inqTime').textContent = timeFa(r.date);
  const row = (k, v) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`;
  $('#inqSum').innerHTML = row('نوع درخواست', SVC_FA[r.type]) + row('محصول', r.product) + (r.qty ? row('مقدار', r.qty) : '') + (r.note ? row('توضیحات', r.note) : '');
  const mine = user && user.phone === r.phone;
  $('#inqTrack').textContent = mine ? 'پیگیری در حساب کاربری' : 'ساخت حساب برای پیگیری';
  $('#inqTrack').setAttribute('href', mine ? '#dashboard/storage' : '#auth/signup');
  inqForm.hidden = true; inqDone.hidden = false;
  inqDone.classList.remove('in'); void inqDone.offsetWidth; inqDone.classList.add('in');
  inqDone.focus({ preventScroll: true });
  inqDone.scrollIntoView({ behavior: smooth, block: 'nearest' });
}
$('#inqCopy').addEventListener('click', () => copyText($('#inqCode').textContent).then(ok => toast(ok ? 'کد پیگیری کپی شد' : $('#inqCode').textContent)));
$('#inqNew').addEventListener('click', () => {
  inqForm.reset(); selectService('bulk'); $('#formMsg').textContent = ''; prefillInquiry();
  inqDone.hidden = true; inqForm.hidden = false; $('#fName').focus({ preventScroll: true });
});

$('#newsForm') && $('#newsForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!validPhone($('#newsPhone').value)) { toast('شماره‌ی موبایل را درست وارد کنید (۱۱ رقم، با ۰۹)'); return; }
  e.target.reset(); toast('عضو شدید؛ کد تخفیف پیامک می‌شود');
});
