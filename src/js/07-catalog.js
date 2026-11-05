/* 07-catalog.js — Products page: category chips, search filter and pagination. */

/* ── Catalog: category tabs + search + pagination ── */
let cat = 'dates', query = '', page = 1;
const norm = s => s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').trim();
const inCat = c => cat === 'all' || (cat === 'dates' ? DATE_CATS.includes(c) : c === cat);
const btnCls = on => 'ease-ui grid h-9 min-w-9 place-items-center rounded-full px-3 font-display text-sm font-black active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyprus '
  + (on ? 'bg-[#28622D] text-white shadow-[0_6px_14px_-4px_rgba(40,98,45,.55)]' : 'text-cyprus hover:bg-sand');

const renderCatalog = (animate = true) => {
  const svc = cat === 'storage';                     // cold-storage services: not a product list
  $('#storage').hidden = !svc; $('#grid').hidden = svc; $('.cat-search').hidden = svc;
  if (svc) { prefillInquiry(); $('#catalogTitle').textContent = 'خدمات سردخانه'; $('#empty').hidden = true; $('#pager').hidden = true; return; }
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
const syncPills = () => $$('#cats .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === (DATE_CATS.includes(cat) ? 'dates' : cat)));

let lastHash = location.hash;
const setHash = h => { if (location.hash !== h) history.pushState(null, '', h); lastHash = location.hash; };
$$('#cats .chip').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.cat === 'storage') { loadBar(); cat = 'storage'; query = ''; clearSearchFields(); history.replaceState(null, '', '#storage'); lastHash = location.hash; selectService('storage'); syncPills(); renderCatalog(); return; }
  loadBar(); cat = b.dataset.cat; page = 1; query = ''; clearSearchFields();
  history.replaceState(null, '', '#products/' + cat); lastHash = location.hash;
  syncPills(); renderCatalog();
}));
