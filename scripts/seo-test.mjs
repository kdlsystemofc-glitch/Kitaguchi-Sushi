// Testes de SEO local e semântica.  Uso: node scripts/seo-test.mjs
// - 1 <h1>, títulos sem pular nível, toda <img> com alt descritivo
// - title/description/lang/theme-color, OG/Twitter básicos, ícones
// - JSON-LD válido, tipo Restaurant, sem campos proibidos/incertos
// - file://: console limpo e sem <link rel=manifest>; http: manifest/robots/sitemap/ícones 200
import { chromium, webkit } from 'playwright';
// MOTOR=webkit roda no motor do Safari (padrão: chromium)
const MOTOR = { chromium, webkit }[process.env.MOTOR || 'chromium'];
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = resolve(import.meta.dirname, '..'), SITE = resolve(ROOT, 'site');
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) falhas++; };

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
const srv = createServer(async (req, res) => {
  const p = resolve(SITE, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  try { const b = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); } catch { res.writeHead(404); res.end(); }
}).listen(0);
const HTTP = `http://localhost:${srv.address().port}/`;

const b = await MOTOR.launch();
async function abrir(url) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', e => erros.push(e.message));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  return { p, erros };
}

// ── file:// ──
const f = await abrir(pathToFileURL(resolve(SITE, 'index.html')).href);
const d = await f.p.evaluate(() => {
  const q = s => document.querySelector(s);
  const niveis = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].map(h => +(h.getAttribute('aria-level') || h.tagName[1]));
  return {
    lang: document.documentElement.lang, title: document.title,
    desc: q('meta[name=description]')?.content || '', theme: q('meta[name=theme-color]')?.content,
    h1: document.querySelectorAll('h1').length, niveis,
    semAlt: [...document.images].filter(i => !i.hasAttribute('alt') || (!i.alt.trim() && !i.closest('[aria-hidden=true]'))).map(i => i.getAttribute('src')),
    og: ['og:title', 'og:description', 'og:type', 'og:locale', 'og:site_name'].filter(k => !q(`meta[property="${k}"]`)),
    tw: ['twitter:card', 'twitter:title', 'twitter:description'].filter(k => !q(`meta[name="${k}"]`)),
    icones: [...document.querySelectorAll('link[rel~=icon], link[rel=apple-touch-icon]')].map(l => l.getAttribute('href')),
    manifestFile: !!q('link[rel=manifest]'),
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent)
  };
});
ok(d.lang === 'pt-BR', `lang="${d.lang}"`);
ok(d.title.length >= 30 && d.title.length <= 65, `<title> ${d.title.length} caracteres: "${d.title}"`);
ok(d.desc.length >= 70 && d.desc.length <= 160, `meta description ${d.desc.length} caracteres`);
ok(!/4,8|R\$|\d{1,2}h\d{2}|\d{1,2}:\d{2}/.test(d.desc + d.title), 'title/description sem nota, preço ou horário (dados incertos)');
ok(!!d.theme, `theme-color ${d.theme}`);
ok(d.h1 === 1, `um único <h1> (${d.h1})`);
const pulo = d.niveis.some((n, i) => i > 0 && n > d.niveis[i - 1] + 1);
ok(d.niveis[0] === 1 && !pulo, `títulos em ordem, sem pular nível: ${d.niveis.join(' ')}`);
ok(d.semAlt.length === 0, `toda imagem informativa com alt (${d.semAlt.join(', ') || 'ok'})`);
ok(!d.og.length && !d.tw.length, `Open Graph/Twitter básicos (faltando: ${[...d.og, ...d.tw].join(', ') || 'nada'})`);
ok(d.icones.length >= 3, `ícones: ${d.icones.join(', ')}`);
ok(!d.manifestFile, 'file://: sem <link rel=manifest> (evita erro de CORS)');
ok(f.erros.length === 0, `file://: console limpo ${f.erros.join(' | ')}`);
ok(d.ld.length === 1, 'um bloco JSON-LD');
let ld = {}; try { ld = JSON.parse(d.ld[0]); ok(true, 'JSON-LD é JSON válido'); } catch (e) { ok(false, 'JSON-LD inválido: ' + e.message); }
ok(ld['@type'] === 'Restaurant', `@type ${ld['@type']}`);
const proibidos = ['aggregateRating', 'review', 'priceRange', 'openingHours', 'openingHoursSpecification', 'acceptsReservations'].filter(k => k in ld);
ok(proibidos.length === 0, `JSON-LD sem campos incertos/proibidos (${proibidos.join(', ') || 'ok'})`);
const cfg = JSON.parse(readFileSync(resolve(ROOT, 'cliente.config.json'), 'utf8'));
ok(cfg.dominio ? !!ld.url : !('url' in ld), `JSON-LD url ${cfg.dominio ? 'com' : 'sem'} domínio configurado`);
await f.p.close();

// ── http ──
const h = await abrir(HTTP);
ok(await h.p.evaluate(() => !!document.querySelector('link[rel=manifest]')), 'http: <link rel=manifest> presente');
ok(h.erros.length === 0, `http: console limpo ${h.erros.join(' | ')}`);
for (const u of ['site.webmanifest', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'icons/icon-32.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'assets/og-sushi-lm.jpg']) {
  const r = await h.p.request.get(HTTP + u);
  ok(r.status() === 200, `http: ${u} ${r.status()}`);
}
const man = await (await h.p.request.get(HTTP + 'site.webmanifest')).json();
ok(man.name && man.icons?.length >= 3 && man.icons.some(i => i.purpose === 'maskable'), `manifest: "${man.name}", ${man.icons.length} ícones (maskable incluso)`);
await h.p.close();
await b.close(); srv.close();
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo verde');
process.exitCode = falhas ? 1 : 0;
