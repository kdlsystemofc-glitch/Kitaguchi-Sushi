// Quadros-chave da abertura do hero (animações CSS congeladas em tempos exatos).
// Uso: node scripts/hero-quadros.mjs [ms,ms,...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = resolve(import.meta.dirname, '..');
const URL = pathToFileURL(resolve(ROOT, 'site/index.html')).href + '?motion=off';
const tempos = (process.argv[2] || '0,500,900,1200,1500,1900,2300,2800').split(',').map(Number);
const out = resolve(ROOT, 'screenshots/motion/hero-abertura'); mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const t of tempos) {
    await p.evaluate(t => new Promise(r => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }); requestAnimationFrame(() => requestAnimationFrame(r)); }), t);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${out}/${w}-${String(t).padStart(4, '0')}.png` });
  }
  await p.close();
}
await b.close();
console.log('ok', tempos.join(' '));
