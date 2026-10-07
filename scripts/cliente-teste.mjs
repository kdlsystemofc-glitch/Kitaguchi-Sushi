// Testa o caminho "cliente preencheu tudo": build com scripts/cliente-exemplo.json (dados
// FICTÍCIOS), confere HTML + JSON-LD, roda a auditoria responsiva, fotografa as áreas novas e
// SEMPRE reconstrói com o cliente.config.json real no fim.
// Uso: node scripts/cliente-teste.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
const ROOT = resolve(import.meta.dirname, '..');
const node = (args, env = {}) => execFileSync(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8' });
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) falhas++; };
try {
  node(['scripts/build.mjs'], { CLIENTE_CONFIG: 'scripts/cliente-exemplo.json' });
  const html = readFileSync(resolve(ROOT, 'site/index.html'), 'utf8');
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  ok(html.includes('<title>Kitaguchi Sushi — '), 'nome oficial no <title>');
  ok(html.includes('<span>Kitaguchi</span> <span>Sushi</span>'), 'nome oficial no <h1>');
  ok(html.includes('class="s-rodizio__preco" data-reveal>R$ 00,00 por pessoa · EXEMPLO</p>'), 'preço sob "Rodízio japonês"');
  ok(html.includes('Ter a Sáb · 11h–15h e 18h30–23h<br>Dom · 11h–16h'), 'horário agrupado no rodapé');
  ok(/Reserve pelo WhatsApp/.test(html), 'CTA do rodapé vira "Reserve pelo WhatsApp"');
  ok(!/Temaki de salmão<\/h3>/.test(html), 'prato marcado false sai do site');
  ok(!/Karlen F\.|Anderson F\./.test(html) && /Avaliação no Google/.test(html), 'citações sem nome quando não autorizado');
  ok(ld.priceRange === 'R$ 00–00' && ld.acceptsReservations === true && ld.hasMenu && ld.sameAs?.length === 1 && ld.openingHoursSpecification?.length === 3 && ld.url === 'https://exemplo.invalid/',
    'JSON-LD com priceRange, reservas, cardápio, Instagram, horários e url');
  ok(html.includes('<link rel="canonical" href="https://exemplo.invalid/">'), 'canonical ativo com domínio');
  const audit = node(['scripts/audit.mjs']);
  const total = (audit.match(/^[✓✗]/gm) || []).length, verdes = (audit.match(/^✓/gm) || []).length;
  ok(total > 0 && verdes === total, `auditoria responsiva com todos os campos preenchidos: ${verdes}/${total}`);
  if (verdes !== total) console.log(audit);
  // fotos das áreas novas
  const out = resolve(ROOT, 'screenshots/cliente-exemplo'); mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(resolve(ROOT, 'site/index.html')).href + '?motion=off', { waitUntil: 'networkidle' });
    await p.locator('#rodizio').screenshot({ path: `${out}/${w}-rodizio.png`, animations: 'disabled' });
    await p.locator('#rodape').screenshot({ path: `${out}/${w}-rodape.png`, animations: 'disabled' });
    await p.close();
  }
  await b.close();
} finally {
  node(['scripts/build.mjs']);   // volta ao site real
  console.log('site reconstruído com cliente.config.json real');
}
console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo verde');
process.exitCode = falhas ? 1 : 0;
