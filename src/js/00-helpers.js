/* 00-helpers.js — Tiny helpers shared by every module: $ / $$ selectors, Persian number formatting, reduced-motion flag. */

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fa = n => new Intl.NumberFormat('fa-IR').format(n).replace(/٬/g, ',');   // one thousands separator that looks the same in Peyda and Yekan
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = reduce ? 'auto' : 'smooth';
