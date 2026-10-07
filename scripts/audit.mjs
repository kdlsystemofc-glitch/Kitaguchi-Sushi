// Auditoria responsiva: rolagem horizontal, texto cortado/sobreposto, alvos de toque,
// console, zoom de texto 200%, fallback de fontes, reduced-motion, dark scheme.
// Uso: node scripts/audit.mjs [--shots]
import { chromium, webkit } from 'playwright';
// MOTOR=webkit roda no motor do Safari (padrão: chromium)
const MOTOR = { chromium, webkit }[process.env.MOTOR || 'chromium'];
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const URL = pathToFileURL(resolve(ROOT, 'site/index.html')).href;
const SHOTS = process.argv.includes('--shots');
const TELAS = [[5120,1440],[3840,2160],[2560,1080],[2560,1440],[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[768,1024],[430,932],[390,844],[360,740],[320,568],[844,390]];
const out = resolve(ROOT, 'screenshots/responsivo'); mkdirSync(out, { recursive: true });

const inspect = (W) => {
  const innerWidth = W; // largura pedida; na emulação mobile o innerWidth real cresce com o conteúdo
  const r = { overflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, ...[...document.querySelectorAll('body *:not(svg *)')].map(e => Math.ceil(e.getBoundingClientRect().right))) - innerWidth, cortado: [], sobreposto: [], toque: [], foraDaTela: [] };
  const vis = e => { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || e.closest('.sr-only')) return false; for (let a = e; a; a = a.parentElement) if (+getComputedStyle(a).opacity < 0.05) return false; return true; }; // invisível (entrada pendente) não sobrepõe nada
  const nome = e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + '"' + e.textContent.trim().slice(0, 18) + '"';
  const textos = [...document.querySelectorAll('h1,h2,h3,p,li,a,figcaption,blockquote p,span')].filter(e => vis(e) && e.textContent.trim() && e.getClientRects().length);
  for (const e of textos) {
    if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') r.cortado.push(nome(e));
    const b = e.getBoundingClientRect();
    if (b.right > innerWidth + 1 || b.left < -1) r.foraDaTela.push(`${nome(e)} [${Math.round(b.left)}–${Math.round(b.right)}]`);
    // ancestral recortando (overflow hidden/clip) o texto
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/hidden|clip/.test(s.overflow + s.overflowX + s.overflowY)) {
        const ab = a.getBoundingClientRect();
        if (b.bottom > ab.bottom + 1 || b.top < ab.top - 1 || b.right > ab.right + 1 || b.left < ab.left - 1) r.cortado.push(`${nome(e)} recortado por ${nome(a)}`);
        break;
      }
    }
  }
  // sobreposição entre blocos de texto folha (sem relação de ancestralidade)
  const folhas = textos.filter(e => !['SPAN','A'].includes(e.tagName) || !e.querySelector('*'));
  // compara linha a linha (getClientRects), para não acusar inline que quebra de linha
  const rects = folhas.map(e => [e, [...e.getClientRects()]]);
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const [a, la] = rects[i], [b, lb] = rects[j];
    if (a.contains(b) || b.contains(a)) continue;
    const bate = la.some(ra => lb.some(rb => (Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)) > 2 && (Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)) > 2));
    if (bate) r.sobreposto.push(`${nome(a)} × ${nome(b)}`);
  }
  for (const e of document.querySelectorAll('a[href], button')) {
    if (!vis(e) || e.classList.contains('skip')) continue;
    const b = e.getBoundingClientRect();
    if (b.height < 44 || b.width < 44) r.toque.push(`${nome(e)} ${Math.round(b.width)}×${Math.round(b.height)}`);
  }
  for (const k of ['cortado','sobreposto','toque','foraDaTela']) r[k] = [...new Set(r[k])];
  return r;
};

const browser = await MOTOR.launch();
async function rodar(label, [w, h], opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', colorScheme: opts.dark ? 'dark' : 'light', isMobile: w < 900, hasTouch: w < 900, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', m => { if (m.type() === 'error' && !(opts.semFontes && /ERR_FAILED/.test(m.text()))) erros.push(m.text()); });
  page.on('pageerror', e => erros.push(e.message));
  page.on('requestfailed', r => { if (!opts.semFontes) erros.push('falhou: ' + r.url()); });
  if (opts.semFontes) await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(URL, { waitUntil: 'networkidle' });
  if (opts.zoom) await page.addStyleTag({ content: 'html{font-size:200%}' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => 0))));  // espera a abertura do hero
  const r = await page.evaluate(inspect, w);
  if (SHOTS) await page.addStyleTag({ content: '*{content-visibility:visible!important}' });  // só para a captura
  if (SHOTS) await page.screenshot({ path: `${out}/${label}.png`, fullPage: true, animations: 'disabled' });
  const problemas = [r.overflowX > 0 && `rolagem-x ${r.overflowX}px`, r.cortado.length && `cortado: ${r.cortado.join(' | ')}`, r.sobreposto.length && `sobreposto: ${r.sobreposto.join(' | ')}`, r.toque.length && `toque<44: ${r.toque.join(' | ')}`, r.foraDaTela.length && `fora: ${r.foraDaTela.join(' | ')}`, erros.length && `console: ${erros.join(' | ')}`].filter(Boolean);
  if (problemas.length) process.exitCode = 1;
  console.log(`${problemas.length ? '✗' : '✓'} ${label}${problemas.length ? '\n    ' + problemas.join('\n    ') : ''}`);
  await ctx.close();
}
for (const t of TELAS) await rodar(`${t[0]}x${t[1]}`, t);
for (const t of [[1280,720],[390,844]]) await rodar(`${t[0]}x${t[1]}-zoom200`, t, { zoom: true });
for (const t of [[1440,900],[390,844]]) await rodar(`${t[0]}x${t[1]}-sem-fontes`, t, { semFontes: true });
await rodar('390x844-reduced-dark', [390, 844], { reduced: true, dark: true });
await browser.close();
