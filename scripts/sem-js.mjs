// Progressive enhancement: com JavaScript desligado o site tem que sair igual à referência
// aprovada (o CSS não crítico chega pelo <noscript>). Com JS desligado o Playwright não
// executa evaluate, então as adaptações de captura (imagens eager, content-visibility pintado)
// vão no HTML servido.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const ROOT = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(ROOT, 'site/index.html'), 'utf8')
  .replaceAll('loading="lazy"', 'loading="eager"')
  .replace('</head>', '<style>*{content-visibility:visible!important}</style></head>');
const b = await chromium.launch();
let falhou = false;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  const erros = [];
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.route(/index\.html/, r => r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' }));
  await p.goto(pathToFileURL(resolve(ROOT, 'site/index.html')).href, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);   // abertura do hero (CSS) termina
  const a = PNG.sync.read(readFileSync(resolve(ROOT, `screenshots/ref/aprovado-${w}.png`)));
  const n = PNG.sync.read(await p.screenshot({ fullPage: true, animations: 'disabled' }));
  let msg;
  if (a.height !== n.height) { msg = `tamanho ${a.height} → ${n.height}`; falhou = true; }
  else { const pct = 100 * pixelmatch(a.data, n.data, null, a.width, a.height, { threshold: 0.1 }) / (a.width * a.height); msg = `${pct.toFixed(3)}%`; if (pct > 0.5) falhou = true; }
  console.log(`${falhou ? '✗' : '✓'} sem JS ${w}: ${msg} · console ${erros.length ? erros.join(' | ') : 'limpo'}`);
  await ctx.close();
}
await b.close();
process.exitCode = falhou ? 1 : 0;
