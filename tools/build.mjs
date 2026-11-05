/* ════════════════════════════════════════════════════════════════════
   Build script — turns the readable sources in /src into the files the
   browser loads. No npm packages needed (Node 18+).

     node tools/build.mjs           build once
     node tools/build.mjs --watch   rebuild whenever a file in /src changes

   src/html/*.html  → index.html          (joined in file-name order)
   src/js/*.js      → js/app.js           (joined in order, wrapped in one private scope)
   src/css/*.css    → css/style.css       (joined in order, minified)
   src/css/vendor/tailwind.css → css/tailwind.css

   Both CSS files get every `:hover` rule wrapped in
   @media (hover:hover) and (pointer:fine) — so phones never show a
   "stuck" hover state after a tap (no flicker / noise between products).
   ═══════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const src = (...p) => path.join(ROOT, 'src', ...p);
const out = (...p) => path.join(ROOT, ...p);
const list = dir => fs.readdirSync(dir).filter(f => /\.(html|js|css)$/.test(f)).sort();
const read = f => fs.readFileSync(f, 'utf8');

/* ── optional: strip comments from the JS with TypeScript, if it is installed (npm i -g typescript) ── */
let ts = null;
try { ts = createRequire(import.meta.url)('typescript'); } catch {
  try { const g = process.env.NODE_PATH || ''; for (const d of g.split(path.delimiter)) { if (d && fs.existsSync(path.join(d, 'typescript'))) { ts = createRequire(path.join(d, 'x.js'))('typescript'); break; } } } catch {}
}

/* ── CSS: wrap hover rules, then minify ── */
function stripComments(css) {
  let o = '', i = 0, q = null;
  while (i < css.length) {
    const c = css[i];
    if (q) { o += c; if (c === '\\') { o += css[i + 1] || ''; i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'") { q = c; o += c; i++; continue; }
    if (c === '/' && css[i + 1] === '*') { const e = css.indexOf('*/', i + 2); i = e < 0 ? css.length : e + 2; continue; }
    o += c; i++;
  }
  return o;
}
/* split a block of CSS into top-level items: { pre: 'selector or @rule', body: '...' } or { raw: '@import …;' } */
function items(css) {
  const res = []; let i = 0, start = 0, q = null;
  while (i < css.length) {
    const c = css[i];
    if (q) { if (c === '\\') { i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '"' || c === "'") { q = c; i++; continue; }
    if (c === ';' ) { const raw = css.slice(start, i + 1).trim(); if (raw) res.push({ raw }); start = i + 1; i++; continue; }
    if (c === '{') {
      let d = 1, j = i + 1, qq = null;
      while (j < css.length && d) { const k = css[j]; if (qq) { if (k === '\\') { j += 2; continue; } if (k === qq) qq = null; j++; continue; } if (k === '"' || k === "'") qq = k; else if (k === '{') d++; else if (k === '}') d--; j++; }
      res.push({ pre: css.slice(start, i).trim(), body: css.slice(i + 1, j - 1) }); i = start = j; continue;
    }
    i++;
  }
  const tail = css.slice(start).trim(); if (tail) res.push({ raw: tail });
  return res;
}
const splitSel = s => { const r = []; let d = 0, cur = ''; for (const c of s) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && !d) { r.push(cur.trim()); cur = ''; } else cur += c; } if (cur.trim()) r.push(cur.trim()); return r; };
const HOVER_MQ = '@media (hover:hover) and (pointer:fine)';
function gateHover(css) {
  return items(css).map(it => {
    if (it.raw) return it.raw;
    if (it.pre.startsWith('@')) {
      return /^@(media|supports|layer|container)/.test(it.pre) ? `${it.pre}{${gateHover(it.body)}}` : `${it.pre}{${it.body}}`;
    }
    const sels = splitSel(it.pre), hov = sels.filter(s => s.includes(':hover')), rest = sels.filter(s => !s.includes(':hover'));
    if (!hov.length) return `${it.pre}{${it.body}}`;
    return (rest.length ? `${rest.join(',')}{${it.body}}` : '') + `${HOVER_MQ}{${hov.join(',')}{${it.body}}}`;
  }).join('\n');
}
const minCss = css => css.replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();   // keeps spaces inside values (e.g. calc(a + b))
const buildCss = css => minCss(gateHover(stripComments(css)));

/* ── build ── */
function build() {
  const t0 = Date.now();
  const cssDir = src('css'), jsDir = src('js'), htmlDir = src('html');
  const style = '/* built from src/css — edit the sources, then run: node tools/build.mjs */\n' + buildCss(list(cssDir).map(f => read(path.join(cssDir, f))).join('\n'));
  const tw = '/* Tailwind CSS v3.4.17 (compiled) — hover rules gated for touch screens by tools/build.mjs */\n' + buildCss(read(src('css', 'vendor', 'tailwind.css')));

  let js = list(jsDir).map(f => `/* ── ${f} ── */\n` + read(path.join(jsDir, f))).join('\n');
  js = `(() => {\n'use strict';\n${js}\n})();\n`;
  try { new Function(js); } catch (e) { throw new Error('JavaScript syntax error: ' + e.message); }
  if (ts) js = ts.transpileModule(js, { compilerOptions: { target: ts.ScriptTarget.ES2022, removeComments: true, module: ts.ModuleKind.None } }).outputText;
  js = '/* built from src/js — edit the sources, then run: node tools/build.mjs */\n' + js;

  const v = crypto.createHash('sha1').update(style + tw + js).digest('hex').slice(0, 8);   // cache-busting: changes whenever the code changes
  const html = list(htmlDir).map((f, i) => { let h = read(path.join(htmlDir, f)); if (i === 0) h = h.replace(/^<!-- ▸[^\n]*\n/, ''); return h; }).join('\n').replace(/\{\{V\}\}/g, v);

  fs.writeFileSync(out('css', 'style.css'), style);
  fs.writeFileSync(out('css', 'tailwind.css'), tw);
  fs.writeFileSync(out('js', 'app.js'), js);
  fs.writeFileSync(out('index.html'), html);
  console.log(`built ${v} in ${Date.now() - t0}ms · app.js ${(js.length / 1024).toFixed(0)}KB · style.css ${(style.length / 1024).toFixed(0)}KB${ts ? '' : ' (install typescript to strip JS comments)'}`);
}

build();
if (process.argv.includes('--watch')) {
  let t; fs.watch(path.join(ROOT, 'src'), { recursive: true }, () => { clearTimeout(t); t = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 120); });
  console.log('watching src/ …');
}
