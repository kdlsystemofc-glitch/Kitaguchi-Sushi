// Captura/compara a página inteira estática (motion desligado) contra a referência aprovada.
// Uso: node scripts/ref.mjs capturar | comparar
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const ROOT = resolve(import.meta.dirname, '..');
const URL = pathToFileURL(resolve(ROOT, 'site/index.html')).href + '?motion=off';
const dir = resolve(ROOT, 'screenshots/ref'); mkdirSync(dir, { recursive: true });
const modo = process.argv[2] || 'comparar';
const b = await chromium.launch();
let falhou = false;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager'); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
  // content-visibility: auto não pinta o que está fora da viewport, e a captura de página inteira
  // não rola. 1º prova que a propriedade não mexe no layout; depois desliga só para pintar.
  const geo = () => p.evaluate(() => JSON.stringify([document.documentElement.scrollHeight, ...[...document.querySelectorAll('[style*="content-visibility"], .s-avaliacoes__tecido')].map(e => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.height, r.width].map(Math.round); })]));
  const g1 = await geo();
  await p.addStyleTag({ content: '*{content-visibility:visible!important}' });
  const g2 = await geo();
  if (g1 !== g2) { console.log(`✗ ${w}: content-visibility muda o layout ${g1} → ${g2}`); falhou = true; }
  const buf = await p.screenshot({ fullPage: true, animations: 'disabled' });  // abertura do hero: compara o estado final
  const f = resolve(dir, `aprovado-${w}.png`);
  if (modo === 'capturar' || !existsSync(f)) { writeFileSync(f, buf); console.log('capturado', w); }
  else {
    const a = PNG.sync.read(readFileSync(f)), c = PNG.sync.read(buf);
    if (a.width !== c.width || a.height !== c.height) { console.log(`✗ ${w}: tamanho mudou ${a.width}x${a.height} → ${c.width}x${c.height}`); falhou = true; }
    else { const d = new PNG({ width: a.width, height: a.height }); const n = pixelmatch(a.data, c.data, d.data, a.width, a.height, { threshold: 0.1 });
      const pct = 100 * n / (a.width * a.height); console.log(`${pct <= 0.5 ? '✓' : '✗'} ${w}: ${pct.toFixed(3)}% pixels diferentes`); if (pct > 0.5) { falhou = true; writeFileSync(resolve(dir, `diff-${w}.png`), PNG.sync.write(d)); } }
  }
  await p.close();
}
await b.close();
process.exitCode = falhou ? 1 : 0;
