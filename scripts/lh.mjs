// Lighthouse mobile: N execuções, mediana. Uso: node scripts/lh.mjs [rotulo] [n=3] [query] [--gzip]
// --gzip: o servidor de teste comprime texto (HTML/CSS/JS/SVG), como qualquer hospedagem real (ver DEPLOY.md).
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { execFile } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { promisify } from 'node:util';
const run = promisify(execFile);
import { chromium } from 'playwright';

const ROOT = resolve(import.meta.dirname, '..');
const SITE = resolve(ROOT, 'site');
const GZIP = process.argv.includes('--gzip');
const [rotulo = 'lh', n = '3', query = ''] = process.argv.slice(2).filter(a => a !== '--gzip');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, res) => {
  const p = resolve(SITE, '.' + decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  try {
    let b = await readFile(p); const h = { 'content-type': TYPES[extname(p)] || 'application/octet-stream' };
    if (GZIP && /^(text\/|image\/svg)/.test(h['content-type']) && /gzip/.test(req.headers['accept-encoding'] || '')) { b = gzipSync(b); h['content-encoding'] = 'gzip'; }
    res.writeHead(200, h); res.end(b);
  }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = srv.address().port;
const out = resolve(ROOT, 'screenshots/lighthouse'); await mkdir(out, { recursive: true });
const runs = [];
for (let i = 0; i < +n; i++) {
  const file = resolve(out, `${rotulo}-${i}.json`);
  try {
    await run(process.execPath, [resolve(ROOT, 'node_modules/lighthouse/cli/index.js'), `http://localhost:${port}/${query}`, '--form-factor=mobile', '--output=json', `--output-path=${file}`, '--chrome-flags=--headless=new', '--quiet'],
      { env: { ...process.env, CHROME_PATH: chromium.executablePath() }, timeout: 240000 });
  } catch { /* no Windows o lighthouse falha só ao apagar a pasta temporária; o JSON já foi salvo */ }
  const r = JSON.parse(await readFile(file, 'utf8'));
  const a = r.audits;
  runs.push({ perf: Math.round(r.categories.performance.score * 100), a11y: Math.round(r.categories.accessibility.score * 100), bp: Math.round(r.categories['best-practices'].score * 100), seo: Math.round(r.categories.seo.score * 100),
    fcp: a['first-contentful-paint'].numericValue, lcp: a['largest-contentful-paint'].numericValue, tbt: a['total-blocking-time'].numericValue, cls: a['cumulative-layout-shift'].numericValue, si: a['speed-index'].numericValue });
}
srv.close();
const med = k => { const v = runs.map(r => r[k]).sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; };
const res = { rotulo, gzip: GZIP, runs: runs.length, perf: med('perf'), perfs: runs.map(r => r.perf), a11y: med('a11y'), bp: med('bp'), seo: med('seo'), fcp: Math.round(med('fcp')), lcp: Math.round(med('lcp')), tbt: Math.round(med('tbt')), cls: +med('cls').toFixed(3), si: Math.round(med('si')) };
console.log(JSON.stringify(res));
const log = resolve(ROOT, 'screenshots/lighthouse/log.jsonl');
await writeFile(log, JSON.stringify(res) + '\n', { flag: 'a' });
