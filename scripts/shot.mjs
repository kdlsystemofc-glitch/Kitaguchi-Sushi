// Screenshots: seção isolada + página inteira + costura com a seção anterior.
// Uso: node scripts/shot.mjs <id-da-secao> [larguras=1440,390]
//      node scripts/shot.mjs --final            (página inteira em 1440, 768, 390)
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const URL = pathToFileURL(resolve(ROOT, 'site/index.html')).href;
const args = process.argv.slice(2);
const final = args[0] === '--final';
const id = final ? 'final' : args[0];
const widths = (final ? '1440,768,390' : (args[1] || '1440,390')).split(',').map(Number);
const out = resolve(ROOT, 'screenshots', id);
mkdirSync(out, { recursive: true });

// Regra do projeto: nada de /design dentro do site.
const html = readFileSync(resolve(ROOT, 'site/index.html'), 'utf8');
// CSS crítico está inline no index.html; o resto em site.min.css (gerado por scripts/build.mjs)
const css = (() => { try { return readFileSync(resolve(ROOT, 'site/css/site.min.css'), 'utf8'); } catch { return ''; } })();
if (/design\//i.test(html + css)) { console.error('ERRO: referência a /design no site'); process.exitCode = 1; }

const browser = await chromium.launch();
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: w >= 1000 ? 900 : w >= 700 ? 1024 : 844 } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // força imagens lazy a carregar para a página inteira
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) console.warn(`AVISO ${w}px: rolagem horizontal de ${overflow}px`);
  // captura de página inteira não rola: pinta o que usa content-visibility: auto (layout idêntico, ver ref.mjs)
  await page.addStyleTag({ content: '*{content-visibility:visible!important}' });
  await page.screenshot({ path: `${out}/${w}-pagina.png`, fullPage: true, animations: 'disabled' });
  if (!final) {
    const el = page.locator(`#${id}`);
    await el.screenshot({ path: `${out}/${w}-secao.png` });
    const box = await page.evaluate((sid) => {
      const e = document.getElementById(sid);
      const all = [...document.querySelectorAll('#hero, main > section, #rodape')];
      const i = all.indexOf(e);
      if (i <= 0) return null;
      const top = e.getBoundingClientRect().top + scrollY;
      return { y: Math.max(0, top - 350), h: 700 };
    }, id);
    if (box) await page.screenshot({ path: `${out}/${w}-costura.png`, fullPage: true, clip: { x: 0, y: box.y, width: w, height: box.h } });
  }
  await page.close();
  console.log(`ok ${w}px → screenshots/${id}/`);
}
await browser.close();
