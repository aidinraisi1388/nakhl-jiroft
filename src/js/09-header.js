/* 09-header.js — Header: expanding search field and the ☰ side menu. */

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

/* desktop nav: the underline («nav-ink») follows the hovered link and returns to the current page on leave */
const mainNav = $('#mainNav'), ink = $('.nav-ink', mainNav);
const inkTo = a => {
  if (!a) { ink.style.setProperty('--o', 0); return; }
  const n = mainNav.getBoundingClientRect(), r = a.getBoundingClientRect(), pad = 12;
  ink.style.setProperty('--x', (r.left - n.left + pad) + 'px'); ink.style.setProperty('--w', (r.width - pad * 2) + 'px'); ink.style.setProperty('--o', 1);
};
const inkHome = () => { mainNav.classList.remove('inking'); $$('.nav-link', mainNav).forEach(l => l.classList.remove('ink-on')); inkTo($('.nav-link[aria-current="page"]', mainNav)); };
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  $$('.nav-link', mainNav).forEach(a => a.addEventListener('mouseenter', () => {
    mainNav.classList.add('inking'); $$('.nav-link', mainNav).forEach(l => l.classList.toggle('ink-on', l === a)); inkTo(a);
  }));
  mainNav.addEventListener('mouseleave', inkHome);
}
/* which top-menu item is «current» comes from the address (#products → محصولات, #storage → سردخانه …) */
const markNav = () => {
  const h = decodeURIComponent(location.hash.slice(1)), key = !h || h === 'top' ? 'home' : /^(products|product\/)/.test(h) ? 'products' : h === 'storage' ? 'storage' : h === 'contact' ? 'contact' : '';
  $$('[data-nav]').forEach(a => a.dataset.nav === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  if (!mainNav.classList.contains('inking')) inkHome();
};
addEventListener('hashchange', markNav);
addEventListener('resize', () => requestAnimationFrame(inkHome));
markNav();
document.fonts && document.fonts.ready.then(inkHome);
