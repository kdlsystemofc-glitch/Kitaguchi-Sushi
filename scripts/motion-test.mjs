// Testes de motion.
//   node scripts/motion-test.mjs global            regressão global (modos, console, nada preso, regra dos decorativos, pausa)
//   node scripts/motion-test.mjs secao <id>        quadros-chave x estático, navegação rápida, custo da seção
//   node scripts/motion-test.mjs custo             custo da página inteira: motion x sem motion
import { chromium, webkit } from 'playwright';
// MOTOR=webkit roda no motor do Safari (padrão: chromium)
const MOTOR = { chromium, webkit }[process.env.MOTOR || 'chromium'];
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = pathToFileURL(resolve(ROOT, 'site/index.html')).href;
const [cmd = 'global', alvo] = process.argv.slice(2);
const browser = await MOTOR.launch();
let falhas = 0;
const ok = (c, msg) => { console.log(`${c ? '✓' : '✗'} ${msg}`); if (!c) falhas++; };

// Superfícies caras: não podem ter transform/filter/opacity<1 nelas nem em ancestrais.
const CAROS = '.noren__painel, .noren__kanji, .cortina, .cortina__kanji, .tecido, .tecido--linho, .shibori, .s-avaliacoes__tecido, .prato--indigo, .prato--linho';

async function abrir(query, [w, h] = [1440, 900], opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', recordVideo: opts.video });
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  page.on('pageerror', e => erros.push(e.message));
  await page.goto(BASE + query, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(i => i.loading !== 'lazy').map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  if (!/motion=off/.test(query)) await page.waitForFunction(() => window.__motion && window.__motion.pronto, null, { timeout: 8000 });
  // a regra dos decorativos caros vale depois da abertura do noren (exceção pedida pelo cliente, CSS, uma vez)
  await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => 0))));
  await page.waitForTimeout(300);
  return { ctx, page, erros };
}
const irPara = (page, y) => page.evaluate(y => window.__motion ? window.__motion.irPara(y) : window.scrollTo(0, y), y);
const presos = page => page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => {
  const b = e.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return false;
  const s = getComputedStyle(e); return +s.opacity < 0.99 || (s.transform !== 'none' && !e.hasAttribute('data-parallax'));
}).map(e => e.className || e.tagName));
const regraCaros = page => page.evaluate(sel => {
  const ruins = [];
  for (const el of document.querySelectorAll(sel)) for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
    const s = getComputedStyle(a);
    if (s.transform !== 'none' || s.filter !== 'none' || +s.opacity < 1) { ruins.push(`${el.className} ← ${a.tagName}.${a.className}`); break; }
  }
  return [...new Set(ruins)];
}, CAROS);

async function global() {
  for (const [nome, q, vp, o] of [
    ['full/high 1440', '?motion=full&quality=high', [1440, 900], {}],
    ['full/low 390', '?motion=full&quality=low', [390, 844], {}],
    ['reduced 1440', '', [1440, 900], { reduced: true }],
    ['auto 390', '', [390, 844], {}],
    ['full/high 768x1024', '?motion=full&quality=high', [768, 1024], {}],
    ['full/high 844x390', '?motion=full&quality=high', [844, 390], {}],
  ]) {
    const { ctx, page, erros } = await abrir(q, vp, o);
    const cfg = await page.evaluate(() => window.__motion.cfg);
    ok(true, `${nome}: modo=${cfg.mode} qualidade=${cfg.quality}`);
    ok((await presos(page)).length === 0, `${nome}: nada escondido acima da dobra no início`);
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const amostrasRuins = [];
    for (let y = 0; y <= H; y += Math.round(vp[1] * 0.6)) {
      await irPara(page, y); await page.waitForTimeout(120);
      amostrasRuins.push(...await regraCaros(page));
    }
    ok(amostrasRuins.length === 0, `${nome}: decorativos caros sem transform/filter/opacity (${[...new Set(amostrasRuins)].join(' | ') || 'ok'})`);
    // navegação rápida: fim → topo → meio → fim → meio, sem esperar
    for (const y of [H, 0, H / 2, H, H / 3]) { await irPara(page, Math.round(y)); await page.waitForTimeout(40); }
    await page.waitForTimeout(1600);
    const p1 = await presos(page);
    ok(p1.length === 0, `${nome}: navegação rápida sem nada preso na tela (${p1.join(', ') || 'ok'})`);
    // percorre tudo: ao fim, nenhum reveal pendente em lugar nenhum
    for (let y = 0; y <= H; y += 300) { await irPara(page, y); await page.waitForTimeout(60); }
    await page.waitForTimeout(1600);
    const pend = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => +getComputedStyle(e).opacity < 0.99).length);
    ok(pend === 0, `${nome}: após percorrer a página, 0 elementos invisíveis (${pend})`);
    // pausa e retomada
    await irPara(page, 0); await page.waitForTimeout(200);
    await page.evaluate(() => window.__motion.pausar());
    const vis = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => +getComputedStyle(e).opacity < 0.99).length);
    ok(vis === 0, `${nome}: pausado → todas as entradas visíveis (${vis} pendentes)`);
    const rodando = await page.evaluate(() => window.__motion.estado.loops.filter(l => l.tl.isActive()).length);
    ok(rodando === 0, `${nome}: pausado → 0 loops rodando`);
    await page.evaluate(() => window.__motion.retomar());
    ok(erros.length === 0, `${nome}: console limpo ${erros.join(' | ')}`);
    await ctx.close();
  }
}

function comparar(a, b, w, h) {
  const d = new PNG({ width: w, height: h });
  const n = pixelmatch(a.data, b.data, d.data, w, h, { threshold: 0.1 });
  return { pct: 100 * n / (w * h), diff: d };
}

async function secao(id) {
  const out = resolve(ROOT, 'screenshots/motion', id); mkdirSync(out, { recursive: true });
  for (const vp of [[1440, 900], [390, 844]]) {
    const w = vp[0];
    // posição: seção centrada (hero: topo)
    const est = await abrir('?motion=off', vp);
    const alvoY = await est.page.evaluate(id => { const e = document.getElementById(id); const b = e.getBoundingClientRect(); return id === 'hero' ? 0 : Math.max(0, Math.round(b.top + scrollY + b.height / 2 - innerHeight / 2)); }, id);
    const clip = async page => page.evaluate(id => { const b = document.getElementById(id).getBoundingClientRect(); const y = Math.max(0, b.top), y2 = Math.min(innerHeight, b.bottom); return { x: 0, y: Math.round(y), width: innerWidth, height: Math.round(y2 - y) }; }, id);
    await irPara(est.page, alvoY); await est.page.waitForTimeout(300);
    const c = await clip(est.page);
    const estatico = PNG.sync.read(await est.page.screenshot({ clip: c }));
    writeFileSync(`${out}/${w}-estatico.png`, PNG.sync.write(estatico));
    await est.ctx.close();

    const mot = await abrir('?motion=full&quality=high', vp);
    await irPara(mot.page, alvoY);
    const quadros = [[0, 'inicio'], [350, 'meio'], [1900, 'fim']];
    let t0 = 0;
    for (const [t, nome] of quadros) {
      await mot.page.waitForTimeout(t - t0); t0 = t;
      if (nome === 'fim') {
        // seções com vários grupos: rola até todos entrarem e volta (entradas são once)
        for (let y = alvoY; y <= alvoY + vp[1]; y += 150) { await irPara(mot.page, y); await mot.page.waitForTimeout(40); }
        await irPara(mot.page, alvoY); await mot.page.waitForTimeout(1500);
        await mot.page.evaluate(() => window.__motion.repousar());
      }
      await mot.page.screenshot({ path: `${out}/${w}-quadro-${nome}.png`, clip: c });
    }
    const final = PNG.sync.read(await mot.page.screenshot({ clip: c }));
    const { pct, diff } = comparar(estatico, final, c.width, c.height);
    if (pct > 0.5) writeFileSync(`${out}/${w}-diff.png`, PNG.sync.write(diff));
    ok(pct <= 0.5, `${id} ${w}: quadro final x estático = ${pct.toFixed(3)}% (limite 0,5%)`);
    ok((await regraCaros(mot.page)).length === 0, `${id} ${w}: decorativos caros intactos`);
    // navegação rápida em volta da seção
    const H = await mot.page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    await mot.ctx.close();
    const nav = await abrir('?motion=full&quality=high', vp);
    for (const y of [alvoY, H, 0, alvoY, H, alvoY]) { await irPara(nav.page, y); await nav.page.waitForTimeout(30); }
    await nav.page.waitForTimeout(1600);
    const p = await presos(nav.page);
    ok(p.length === 0, `${id} ${w}: pular/voltar sem nada preso (${p.join(', ') || 'ok'})`);
    ok(nav.erros.length === 0, `${id} ${w}: console limpo ${nav.erros.join(' | ')}`);
    await nav.ctx.close();
  }
  const cm = await medir('?motion=full&quality=high', id), cs = await medir('?motion=off', id);
  console.log(`  custo ${id} (rolagem de 3s pela seção, 1440): motion p95 ${cm.p95}ms / quadros>33ms ${cm.lentos} / script ${cm.script}ms / estilo+layout ${cm.estilo}ms  ·  sem motion p95 ${cs.p95}ms / ${cs.lentos} / ${cs.script}ms / ${cs.estilo}ms`);
}

async function medir(query, id) {
  const { ctx, page } = await abrir(query, [1440, 900]);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  const [y0, y1] = await page.evaluate(id => {
    if (!id) return [0, document.documentElement.scrollHeight - innerHeight];
    const b = document.getElementById(id).getBoundingClientRect(); const t = b.top + scrollY;
    return [Math.max(0, t - innerHeight), Math.min(document.documentElement.scrollHeight - innerHeight, t + b.height)];
  }, id);
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const deltas = await page.evaluate(([y0, y1]) => new Promise(res => {
    const dur = 3000, t0 = performance.now(), ds = []; let last = t0;
    const passo = now => {
      ds.push(now - last); last = now;
      const k = Math.min(1, (now - t0) / dur), y = y0 + (y1 - y0) * k;
      window.__motion ? window.__motion.irPara(y) : window.scrollTo(0, y);
      if (k < 1) requestAnimationFrame(passo); else res(ds.slice(1));
    };
    requestAnimationFrame(passo);
  }), [y0, y1]);
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  await ctx.close();
  const s = [...deltas].sort((a, b) => a - b);
  return { p95: s[Math.floor(s.length * 0.95)].toFixed(1), lentos: deltas.filter(d => d > 33).length,
    script: Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000), estilo: Math.round(((m1.RecalcStyleDuration - m0.RecalcStyleDuration) + (m1.LayoutDuration - m0.LayoutDuration)) * 1000) };
}

if (cmd === 'global') await global();
else if (cmd === 'secao') await secao(alvo);
else if (cmd === 'custo') {
  const a = await medir('?motion=full&quality=high'), b = await medir('?motion=off');
  console.log(`página inteira (1440, 3s): motion p95 ${a.p95}ms / >33ms ${a.lentos} / script ${a.script}ms / estilo+layout ${a.estilo}ms  ·  sem motion p95 ${b.p95}ms / ${b.lentos} / ${b.script}ms / ${b.estilo}ms`);
}
await browser.close();
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo verde');
process.exitCode = falhas ? 1 : 0;
