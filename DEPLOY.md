# DEPLOY.md — publicação do Kitaguchi Sushi

Documenta **o que** a hospedagem precisa fazer, sem escolher qual. Nada aqui está configurado no repositório.

## O que publicar
A pasta **`site/`** inteira, como raiz do domínio. Ela é gerada: não edite `site/index.html`, `site/css/` nem `site/js/motion*.min.js` à mão.

```
node scripts/build.mjs      # src/ → site/ (CSS crítico inline, CSS/JS minificados, ?v=hash)
python scripts/assets.py    # só se mudar alguma foto em imagens/
```

Fontes de verdade: `src/index.html`, `src/css/*.css`, `src/js/*.js`, `imagens/`. Fontes em `site/fonts/` e bibliotecas em `site/js/vendor/` são arquivos fixos, versionados.

O site continua abrindo por `file://`, sem servidor.

## Cabeçalhos recomendados por tipo

| Arquivos | Cache-Control | Por quê |
|---|---|---|
| `/index.html` (e `/`) | `no-cache` | Sempre revalida (ETag/Last-Modified). É ele que aponta para as versões novas de CSS/JS. |
| `/css/site.min.css?v=…`, `/js/motion-boot.min.js?v=…` | `public, max-age=31536000, immutable` | O HTML referencia com `?v=<hash do conteúdo>`: mudou o arquivo, muda a URL. |
| `/js/motion.min.js?v=…`, `/js/vendor/*.js?v=…` | `public, max-age=31536000, immutable` | Carregados pelo motion-boot, também com `?v=<hash>`. |
| `/fonts/*.woff2` | `public, max-age=31536000, immutable` | Arquivos fixos. Se um dia mudar a fonte, **troque o nome do arquivo**. |
| `/assets/*.webp` | `public, max-age=2592000, stale-while-revalidate=86400` | 30 dias. Os nomes não têm hash: se uma foto for substituída mantendo o nome, o visitante pode ver a antiga até 30 dias. Ao trocar uma foto, prefira um nome novo. |

**Importante:** o cache de um ano só é seguro porque o `?v=` muda junto com o conteúdo. Se a hospedagem ignorar query string no cache (algumas CDNs fazem isso por padrão), habilite "cache key inclui query string", ou reduza para `max-age=86400` nesses arquivos.

## Compressão
Ative **Brotli** (ou gzip) para `text/html`, `text/css`, `text/javascript`, `image/svg+xml`. WOFF2 e WebP já são comprimidos: não recomprimir.

| Arquivo | Sem compressão | gzip |
|---|---|---|
| index.html (com CSS crítico) | 28,0 KiB | 7,4 KiB |
| css/site.min.css | 8,5 KiB | 2,2 KiB |
| js/motion.min.js + boot | 7,2 KiB | 3,2 KiB |
| js/vendor (gsap + ScrollTrigger + lenis) | 132,9 KiB | 50,7 KiB |

## Tipos MIME
`.woff2` → `font/woff2` · `.webp` → `image/webp` · `.js` → `text/javascript` · `.css` → `text/css`. Algumas hospedagens antigas servem `.woff2` como `application/octet-stream`, o que funciona mas impede a compressão correta de cabeçalhos. Confirme.

## Outros cabeçalhos (recomendados, independentes de desempenho)
```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```
**Content-Security-Policy:** o `index.html` tem um `<script>` inline pequeno (preload das fontes + fallback de CSS) e um `onload` inline no `<link rel="preload">`. Uma CSP estrita precisaria de `'unsafe-inline'` ou de hash/nonce para esses dois trechos. Se for usar CSP, gere os hashes a partir do `site/index.html` publicado.

## Antes de publicar
- Rodar `node scripts/build.mjs` e conferir que `git status` não mostra `site/` alterado sem commit.
- Pendências do cliente (DESIGN.md §i): preço, horário, WhatsApp/reserva, autorizações de fotos e avaliações. **O site não deve ir ao ar antes disso.**
- Fotos: nenhuma foi recriada por IA (assets.md).

## SEO: antes de publicar
1. Preencher `"dominio"` em **`cliente.config.json`** (ex.: `"https://www.exemplo.com.br"`, sem barra no fim).
2. `node scripts/build.mjs`: ativa sozinho `canonical`, `og:url`, `og:image` (absoluta), `twitter:image`, `url`/`image` no JSON-LD, a linha `Sitemap:` do `robots.txt` e a URL do `sitemap.xml`.
3. `node scripts/seo-test.mjs` precisa sair verde.
4. Validar com as ferramentas oficiais (Rich Results Test do Google, depurador de compartilhamento do Facebook/WhatsApp) já no domínio.
5. Google Business Profile: conferir que nome, endereço e telefone do site batem com o perfil (NAP).

Tipos MIME adicionais: `.webmanifest` → `application/manifest+json`, `.ico` → `image/x-icon`, `.xml` → `application/xml`. Cache: `robots.txt`, `sitemap.xml` e `site.webmanifest` com `max-age=3600`; `favicon.ico` e `icons/` com `max-age=2592000`.
