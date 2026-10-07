# Gera os WebP do site a partir de imagens/ (fotos reais do cliente).
# Só recorte e redimensionamento — nenhuma edição generativa.
from PIL import Image
import os
SRC = 'imagens/'
OUT = 'site/assets/'
# slug: (arquivo, caixa de recorte (x0,y0,x1,y1) ou None)
JOBS = {
  'hero-barca':        ('imgi_52_620906544_18081635108258427_8652807392985228295_n.webp', None),
  'rodizio-combinado': ('imgi_39_627131120_18082742420258427_616791787464466542_n.webp', (0, 180, 1080, 900)),
  'cozinha-macaricado':('imgi_40_627267597_18082742084258427_8721984227119165049_n.webp', None),
  'mesa-drink':        ('imgi_51_622258745_18081635171258427_3924805418943956712_n.webp', (0, 150, 1080, 1080)),
  'prato-nigiri':      ('imgi_48_621444433_18081637847258427_4339693769679083255_n.webp', None),
  'prato-temaki':      ('imgi_56_620913433_18081339719258427_7178080884564385026_n.webp', None),
  'prato-sobremesa':   ('imgi_50_621667266_18081637721258427_5474182699686806730_n.webp', (0, 135, 810, 1080)),
  'salao':             ('imgi_35_627217937_885143564416399_5105713595733235477_n.jpg', None),
  'logo':              ('imgi_2_124437197_1029577584208432_5557183287504664921_n.jpg', None),
}
for slug, (f, box) in JOBS.items():
    im = Image.open(SRC + f).convert('RGB')
    if box: im = im.crop(box)
    w, h = im.size
    # degraus: 400 (celular), 800 e a largura original
    for tw in sorted({min(400, w), min(800, w), w}):
        out = im if tw == w else im.resize((tw, round(h * tw / w)), Image.LANCZOS)
        name = f'{OUT}{slug}-{tw}.webp'
        out.save(name, 'WEBP', quality=80, method=6)
        print(name, out.size, os.path.getsize(name) // 1024, 'KB')
