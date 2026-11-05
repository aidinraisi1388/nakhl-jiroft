/* 14-auth.js — Accounts: sign in, sign up, forgot password, session, support mode (manager acting for a customer). */

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
function openLogin(after, mode = 'user', scr = 'signin') {
  if (mode === 'admin' ? admin : user) { after && after(); return; }
  if (mode === 'user' && admin) {                       // manager without a customer selected
    if (drawerOpen) closeCart(false);
    location.hash = '#admin/customers';
    toast('برای ثبت سفارش به‌جای مشتری، اول حساب او را از «مشتریان و پشتیبانی» باز کنید'); return;
  }
  pendingAfter = after || null; authReturn = mode === 'admin' ? 'admin' : 'dashboard';
  if (drawerOpen) closeCart(false);
  location.hash = scr === 'signup' ? '#auth/signup' : '#auth';
}
/* «۱۰٪ تخفیف با کد NAKHL10» card: not signed in → sign in (or sign up if this browser never had an account) → then
   empty cart → products page (code kept for later) · items in cart → cart drawer with the code already applied */
const offerPromo = code => {
  const go = () => {
    const m = $('#promoMsg');
    if (promoUsed(code, user.phone)) { promo = null; toast(`شما قبلاً از کد ${code} استفاده کرده‌اید؛ هر کد فقط یک بار`); }
    else { promo = { code, ...PROMOS[code] }; $('#promoInput').value = code; m.textContent = `کد ${code} اعمال شد: ${PROMOS[code].label}`; m.className = 'mt-2 min-h-[1rem] text-xs font-bold text-cyprus'; }
    if (!count()) { location.hash = '#products'; if (promo) toast(`کد ${code} برای شما فعال شد؛ محصول‌تان را انتخاب کنید`); }
    else { if (location.hash.startsWith('#auth')) location.hash = '#products'; setTimeout(openCart, 120); }
    updateBar();
  };
  if (user) return go();
  const known = store.get('nakhl:known', false) || Object.keys(users).some(ph => !PRESET[ph]);
  openLogin(go, 'user', known ? 'signin' : 'signup');
};
$('#toTop') && $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: smooth }));
$$('[data-promo]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); offerPromo(a.dataset.promo); }));
const note = m => { $('#authNote').hidden = !m; $('#authNote').textContent = m || ''; };
function authScreen(scr) {
  $$('[data-screen]').forEach(el => { el.hidden = el.dataset.screen !== scr; });
  $('#authTabs').hidden = scr === 'forgot';
  $$('[data-auth-tab]').forEach(a => { const on = a.dataset.authTab === scr; a.classList.toggle('text-cyprus', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const T = { signin: ['ورود به حساب', 'با شماره موبایل و رمز عبور وارد شوید.'], signup: ['ساخت حساب تازه', 'در کمتر از یک دقیقه عضو نخل و ماه شوید.'], forgot: ['بازیابی رمز عبور', 'شماره‌ی حساب را وارد کنید و رمز تازه بسازید.'] }[scr];
  $('#authHeading').textContent = T[0]; $('#authLead').textContent = T[1];
  $('#authPill').style.transform = scr === 'signup' ? 'translateX(-100%)' : '';
  const B = { signup: ['به خانواده‌ی نخل<br>خوش آمدید', 'با یک حساب رایگان، سفارش‌ها را لحظه‌به‌لحظه در زنجیره‌ی سرد دنبال کنید.', 'به خانواده‌ی نخل خوش آمدید', 'خرمای تازه با زنجیره‌ی سرد'],
              signin: ['دوباره خوش آمدید<br>به نخل و ماه', 'سفارش‌ها، کیف پول و درخواست‌های سردخانه‌تان منتظر شماست.', 'دوباره خوش آمدید', 'سفارش‌هایتان منتظر شماست'],
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
  session = { phone }; store.set('nakhl:session', session); store.set('nakhl:known', true); syncSession(); updateUserUI();
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
const endAct = () => { actAs = null; store.set('nakhl:actAs:v2', null); syncSession(); location.hash = '#admin/customers'; };
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
