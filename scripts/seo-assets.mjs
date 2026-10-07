// Imagem de compartilhamento (Open Graph/Twitter, 1200x630) e ícones.
// OG: o hero aprovado, renderizado na própria página a 1200x630, SEM a foto (todas as fotos têm
// direito de uso pendente) e sem o CTA; o texto de localização é ampliado para continuar legível
// quando a prévia aparece com ~500 px de largura. Ícones: o 鮨 (Shippori Mincho) sobre índigo,
// em vez do logo (150 px, ilegível a 16–32 px, e o nome "L&M" do logo ainda está pendente).
// Uso: node scripts/seo-assets.mjs   (depois de node scripts/build.mjs)
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const ROOT = resolve(import.meta.dirname, '..');
const SITE = resolve(ROOT, 'site');
const TMP = resolve(ROOT, 'scripts/.seo-tmp'); mkdirSync(TMP, { recursive: true });
mkdirSync(resolve(SITE, 'icons'), { recursive: true });
const tokens = readFileSync(resolve(ROOT, 'src/css/tokens.css'), 'utf8');
const cor = n => tokens.match(new RegExp(`--${n}:[ ]*(#[0-9A-Fa-f]{6})`))[1];
const b = await chromium.launch();

// ── Open Graph 1200x630 ──
const og = await b.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(pathToFileURL(resolve(SITE, 'index.html')).href + '?motion=off', { waitUntil: 'networkidle' });
await og.addStyleTag({ content: `.s-hero__foto{visibility:hidden}.noren__cta{display:none}
  .noren__nome{font-size:50px!important;white-space:nowrap}
  .noren__local{font-size:32px!important;letter-spacing:.02em!important;line-height:1.45!important}
  .noren__local span{display:block!important}.noren__local span+span::before{content:none!important}` });
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: resolve(TMP, 'og.png'), clip: { x: 0, y: 0, width: 1200, height: 630 }, animations: 'disabled' });
await og.close();

// ── Ícones: 鮨 sobre índigo ──
const fonte = pathToFileURL(resolve(SITE, 'fonts/shippori-mincho-sushi.woff2')).href;
async function icone(nome, lado, escala, raio) {
  const p = await b.newPage({ viewport: { width: lado, height: lado } });
  await p.setContent(`<!doctype html><style>
    @font-face{font-family:K;src:url(${fonte}) format('woff2');font-weight:700}
    html,body{margin:0;width:${lado}px;height:${lado}px;overflow:hidden;background:transparent}
    div{width:100%;height:100%;display:grid;place-items:center;background:${cor('indigo-900')};border-radius:${raio}}
    span{font:700 ${Math.round(lado * escala)}px/1 K;color:${cor('kanji')};transform:translateY(2%)}</style>
    <div><span>鮨</span></div>`, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: resolve(TMP, nome), omitBackground: true });
  await p.close();
}
await icone('icone-512.png', 512, 0.78, '0');          // quadrado cheio (favicon, apple, manifest "any")
await icone('maskable-512.png', 512, 0.52, '0');       // zona segura de 80%: glifo menor
await b.close();

execFileSync('python', ['-c', `
from PIL import Image
T, S = r'${TMP}', r'${SITE}'
og = Image.open(T + '/og.png').convert('RGB'); assert og.size == (1200, 630), og.size
og.save(S + '/assets/og-sushi-lm.jpg', 'JPEG', quality=88, optimize=True, progressive=True)
ic = Image.open(T + '/icone-512.png').convert('RGBA')
for n in (16, 32, 48, 180, 192, 512):
    o = ic.resize((n, n), Image.LANCZOS)
    o.save(S + ('/icons/apple-touch-icon.png' if n == 180 else '/icons/icon-%d.png' % n), optimize=True)
ic.resize((48, 48), Image.LANCZOS).save(S + '/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
Image.open(T + '/maskable-512.png').convert('RGBA').save(S + '/icons/maskable-512.png', optimize=True)
print('og-sushi-lm.jpg, favicon.ico, icons/*')
`], { stdio: 'inherit' });
