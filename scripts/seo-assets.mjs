// Imagem de compartilhamento (Open Graph/Twitter, 1200x630) e ícones oficiais Kitaguchi Sushi.
// OG: o hero aprovado, renderizado na própria página a 1200x630.
// Ícones: gerados a partir do logo oficial do Kitaguchi Sushi (imagens/logo-150.png).
// Uso: node scripts/seo-assets.mjs   (depois de node scripts/build.mjs)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
const ROOT = resolve(import.meta.dirname, '..');
const SITE = resolve(ROOT, 'site');
const TMP = resolve(ROOT, 'scripts/.seo-tmp'); mkdirSync(TMP, { recursive: true });
mkdirSync(resolve(SITE, 'icons'), { recursive: true });
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
await b.close();

execFileSync('python', ['-c', `
import os
from PIL import Image

ROOT = r'${ROOT}'
SITE = r'${SITE}'
TMP = r'${TMP}'

# OG image
if os.path.exists(TMP + '/og.png'):
    og = Image.open(TMP + '/og.png').convert('RGB')
    assert og.size == (1200, 630), og.size
    og.save(SITE + '/assets/og-kitaguchi-sushi.jpg', 'JPEG', quality=88, optimize=True, progressive=True)

# Ícones oficiais Kitaguchi Sushi
logo_path = os.path.join(ROOT, 'imagens', 'logo-150.png')
logo_src = Image.open(logo_path)
bbox = (25, 38, 126, 110)
cropped = logo_src.crop(bbox)
w, h = cropped.size

def make_icon(size, content_scale=0.88):
    im = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    target_box = int(size * content_scale)
    scale = target_box / max(w, h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    cr = cropped.resize((nw, nh), Image.LANCZOS)
    im.paste(cr, ((size - nw) // 2, (size - nh) // 2), cr)
    return im

os.makedirs(SITE + '/icons', exist_ok=True)
for n in (16, 32, 48, 192, 512):
    ic = make_icon(n, content_scale=0.88 if n >= 48 else 0.94)
    ic.save(f'{SITE}/icons/icon-{n}.png', optimize=True)

apple = make_icon(180, content_scale=0.85)
apple.save(SITE + '/icons/apple-touch-icon.png', optimize=True)

maskable = make_icon(512, content_scale=0.70)
maskable.save(SITE + '/icons/maskable-512.png', optimize=True)

fav48 = make_icon(48, content_scale=0.88)
fav48.save(SITE + '/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print('og-kitaguchi-sushi.jpg, favicon.ico, icons/* gerados com sucesso')
`], { stdio: 'inherit' });
