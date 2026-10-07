// Orçamento de movimento por posição de rolagem + vídeo da página inteira.
// Uso: node scripts/motion-orcamento.mjs [--video]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = resolve(import.meta.dirname, '..');
const URL = pathToFileURL(resolve(ROOT, 'site/index.html')).href + '?motion=full&quality=high';
const ORC = { loops: 2, parallax: 3, entradas: 8 };
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [2560, 1440], [1024, 768]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(URL); await p.waitForFunction(() => window.__motion && __motion.pronto);
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const max = { loops: 0, parallax: 0, entradas: 0 }, onde = {};
  for (let y = 0; y <= H + 99; y += 100) {
    await p.evaluate(y => __motion.irPara(y), Math.min(y, H));
    await p.waitForTimeout(90);
    const c = await p.evaluate(() => {
      const e = __motion.estado;
      const secao = [...document.querySelectorAll('#hero, main > section, #rodape')].find(s => { const r = s.getBoundingClientRect(); return r.top <= innerHeight / 2 && r.bottom > innerHeight / 2; });
      return { secao: secao && secao.id,
        loops: e.loops.filter(l => l.tl.isActive()).length,
        parallax: e.parallax.filter(x => x.tween && x.tween.scrollTrigger && x.tween.scrollTrigger.isActive).length,
        entradas: [...document.querySelectorAll('[data-reveal]')].filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && (gsap.isTweening(el)); }).length };
    });
    for (const k of Object.keys(max)) if (c[k] > max[k]) { max[k] = c[k]; onde[k] = `${c.secao}@${y}`; }
  }
  const linha = Object.keys(max).map(k => `${k} ${max[k]}/${ORC[k]}${max[k] > ORC[k] ? ' ✗' : ''} (${onde[k] || '-'})`).join(' · ');
  console.log(`${w}x${h}: ${linha}`);
  await p.close();
}
if (process.argv.includes('--video')) {
  const dir = resolve(ROOT, 'screenshots/motion/video'); mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir, size: { width: 1440, height: 900 } } });
  const p = await ctx.newPage();
  await p.goto(URL); await p.waitForFunction(() => window.__motion && __motion.pronto);
  await p.mouse.move(700, 450);
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  // rolagem com roda (passa pelo Lenis), ~ritmo de leitura, pausando 1,2s por seção
  const quadros = [];
  let y = 0, t0 = Date.now();
  while (y < H) {
    await p.mouse.wheel(0, 120); await p.waitForTimeout(110);
    y = await p.evaluate(() => scrollY);
    if (quadros.length === 0 || y - quadros[quadros.length - 1].y > 450) { quadros.push({ y, t: Date.now() - t0 }); await p.waitForTimeout(1200); await p.screenshot({ path: `${dir}/q${String(quadros.length).padStart(2, '0')}.png` }); }
  }
  await p.waitForTimeout(3000);
  await ctx.close();
  console.log(`vídeo salvo em screenshots/motion/video/ (${quadros.length} paradas, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
await b.close();
