/* 99-start.js — Start-up: first render, header state, payment return handling. */

/* ── Start ── */
renderHome();
renderCatalog(false);
$('#cartCount').textContent = fa(count());
updateUserUI();
updateBar();
/* deep links (#products, #product/<id>, #storage, #dashboard …) open their page straight away */
if (!handlePayReturn()) { if (viewOf(location.hash) !== 'home') route(); else { play(); markNav(); } }
