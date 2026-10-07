// Captura estática de página inteira (motion desligado, lazy forçado, content-visibility pintado).
// Uso: node scripts/captura-estatica.mjs <saida.png> <largura> <altura>
import { chromium } from 'playwright';
const [out, w, h] = [process.argv[2], +process.argv[3], +process.argv[4]];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('file:///C:/padro/Sushi%20LM/site/index.html?motion=off', { waitUntil: 'networkidle' });
await p.evaluate(async () => { document.querySelectorAll('img').forEach(i => i.loading = 'eager'); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => i.onload = r))); });
await p.addStyleTag({ content: '*{content-visibility:visible!important}' });
await p.screenshot({ path: out, fullPage: true, animations: 'disabled' }); await b.close();
