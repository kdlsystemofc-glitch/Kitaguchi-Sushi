# PROGRESSO — Kitaguchi Sushi

## Etapa 1 — Análise (2026-09-29) ✅
- Mockup fatiado por bloco de conteúdo em `design/secoes/` (8 fatias, 01-hero-noren → 08-rodape-cta).
- `DESIGN.md` criado: leitura mockup × realidade, paleta + WCAG, tipografia, camadas, decorativos em CSS/SVG, motion, plano de imagens, perguntas e pendências do cliente.
- Commit: nenhum (a pasta não é repositório git).

- (Na etapa 1 faltavam as fotos; a pasta `imagens/` chegou depois e foi usada na etapa 2.)

## Etapa 2 — Construção estática (2026-09-29) ✅
- Site em `site/` (index.html + css/tokens.css, base.css, secoes.css; fotos em site/assets). Sem JS; motion ainda não feito.
- Inventário em `assets.md`. Scripts: `scripts/assets.py` (WebP), `scripts/shot.mjs` (screenshots seção/página/costura; `--final`).
- Commits: design pronto → hero → rodizio → cozinha → mesa → avaliacoes → cardapio → convite → rodape.
- Push: não feito (GH_TOKEN ausente; repositório sem remote).

## Aberto
- Sem foto: shimeji (faixa só texto), hot roll (trocado por sobremesas), sushiman (usado close do maçaricado), fachada.
- Fotos ≤1080px (salão 640px, borrado): sem versões 1600px; candidatas ao prompt A2.
- Logo real diz "Sushi L&M Delivery" em 150px — confirmar nome/arquivo com o cliente.
- Pendências do cliente: DESIGN.md §i (preço, horário, WhatsApp/reserva, autorizações).
- Próximo: fase de motion (DESIGN.md §f).

## Etapa 3 — Passada responsiva (2026-09-29) ✅
- `scripts/audit.mjs`: 12 telas (2560→320 + 844x390), zoom de texto 200%, sem fontes, reduced-motion+dark. Todas passam.
- Corrigido: color-mix → rgb(var(--*-rgb)/a) (Safari < 16.2); fallbacks 100vh/overflow hidden; color-scheme: only light;
  texto a 200% vazava (grids minmax(0,1fr), versais com teto em vw/cqi); kanji das cortinas em telas largas; amarra redesenhada.
- Lighthouse mobile (servidor local): Perf 69 · A11y 100 · BP 100 · SEO 100. FCP 3,2s, LCP 4,4s, Speed Index 16,3s. Otimização pendente.

## Motion — Fase 1: base global ✅ (tag motion-base)
- `motion-baseline.md`: auditoria 17/17, Lighthouse mobile mediana 78 (LCP 4,35s).
- Núcleo: `site/js/motion-boot.js` (modo full/reduced, qualidade high/low, carrega após load+1ª pintura+ocioso ou 1ª interação) e `site/js/motion.js` (Lenis, data-reveal, data-parallax, data-loop, pausa por aba oculta/fora da tela, API __motion.pausar/retomar).
- GSAP 3.15.0, ScrollTrigger, Lenis 1.3.26 auto-hospedados em `site/js/vendor/`.
- Testes: `scripts/motion-test.mjs` (global | secao <id> | custo), `scripts/ref.mjs` (estático idêntico), `scripts/lh.mjs`.
- Lighthouse depois da fase: mediana 78 (LCP 4,44s). 1ª tentativa deu 74: motion rodava antes da 1ª pintura do noren; corrigido esperando pintura + ocioso.

## Motion — Fase 2: seções ✅
| Seção | Motion | Quadro final × estático (1440/390) | LH (mediana 5) |
|---|---|---|---|
| 01 Hero | parallax da foto (top). Sem entrada: está acima da dobra | 0,000 / 0,000 % | 78 |
| 02 Rodízio | foto fade + parallax; título/nota sobem | 0,000 / 0,000 % | 78 |
| 03 Cozinha | citação/autoria sobem; foto fade + parallax (desktop) | 0,111 / 0,000 % | 78 |
| 04 Mesa | título + 3 serviços sobem; foto parada (texto em cima) | 0,000 / 0,000 % | 78 |
| 05 Avaliações | nota, fonte e citação sobem; shibori parado | 0,000 / 0,000 % | 78 |
| 06 Cardápio | por faixa: nome sobe, foto fade + parallax 0,06 | 0,107 / 0,388 % | 78 |
| 07 Convite | endereço sobe; borlas: pouso + balanço (único loop) | 0,000 / 0,000 % | 77 |
- Rejeitados pelo critério visual: balanço do noren e abertura das cortinas (superfícies caras), contagem 0→4,8, estrela/CTA pulsando, vapor/brilho/partículas.
- Custo (rolagem de 3s por seção, 1440): p95 de quadro 16,7–16,8 ms com e sem motion; script +25–40 ms; estilo/layout +12–29 ms.

## Motion — Fase 3: rodapé, pausa, coerência ✅ (tag motion-pronto)
- Rodapé: CTA e endereço com entrada. Bug corrigido no núcleo: grupos no fim da página nunca chegavam a 65% (768x1024) → gatilho com clamp(); nada parcialmente visível na 1ª tela é escondido.
- Botão de pausa (full+high), lembrado no localStorage. Menu: o site não tem menu; não foi criado.
- `motion-inventario.md`; orçamento por rolagem dentro do teto; parallax do cardápio retirado (seção mais agitada).
- Vídeo: screenshots/motion/video/*.webm (gitignored).
- Lighthouse final: mediana 78 (= base), LCP 4,43s, TBT 0, CLS 0.
- Push: não feito (GH_TOKEN ausente, sem remote).

## Hero — abertura do noren (pedido do cliente) ✅
- CSS puro na 1ª pintura: noren fechado → abre ~55% com a barra arrastando → volta balançando; foto com avanço de câmera; vinheta alivia; 鮨 carimba; nome/local/CTA sobem. 2,5s. Exceção registrada no DESIGN.md.
- Bug corrigido: o GSAP lia a escala da animação CSS e congelava a foto em scale(1.14); parallax agora monta depois das animações da foto.
- Quadros-chave: `node scripts/hero-quadros.mjs` → screenshots/motion/hero-abertura/.
- Testes: global verde, hero 0,015%/0,052%, auditoria 17/17, estático idêntico. Lighthouse 77 (base 78), LCP 4,43s, SI 3,56s.

## Otimização ✅ (commit "otimizacao pronta")
- Lighthouse mobile (mediana de 5): **78 → 90** (FCP 3,25→1,19 s · LCP 4,38→3,61 s · SI 3,28→2,23 s · CLS 0 · TBT 0→72 ms). Peso total 795 → 569 KiB. `otimizacao-baseline.md`.
- Build: `node scripts/build.mjs` (src/ → site/). Fontes locais WOFF2 (Google removido), CSS crítico inline + resto async com noscript, minificação conservadora (fallbacks preservados), JS com terser, `?v=hash`.
- Imagens: degrau 400w, sizes por breakpoint, fetchpriority retirado do hero (não é o LCP).
- Shibori: WebP rejeitado (1,6% de pixels); ficou SVG + `content-visibility: auto` (geometria idêntica verificada em 13 larguras).
- Boot do motion: espera LCP + fim da abertura (animationend) + ocioso; detecção de qualidade adiada.
- Testes: ref 0,000/0,139 %, sem JS idêntico, abertura do hero idêntica quadro a quadro, auditoria 17/17, motion global e 8 seções verdes, orçamento ok.
- Não alcançado: 92. Limite = LCP simulado inflado pelas fotos lazy que o Chrome busca no 1º layout; baixar exigiria recomprimir fotos do cliente (visual). TBT 72 ms = 1º estilo/layout com as fontes já prontas (preload); sem preload o FCP sobe 0,9 s.
- `DEPLOY.md`: cabeçalhos por tipo, compressão, CSP (não configurado).

## SEO local ✅ (commit "seo pronto")
- `seo.config.json` → `"dominio": null`. Tudo que depende de domínio (canonical, og:url/og:image, twitter:image, url/image do JSON-LD, sitemap, linha Sitemap do robots) fica comentado e se ativa no build quando preenchido (testado com domínio de exemplo e revertido).
- JSON-LD `Restaurant`: nome, culinária, endereço, geo (derivado do plus code 8CWJ+4R → 588M8CWJ+4R, ±14 m), mapa, telefone, serviços (amenityFeature). Não publicados: priceRange, horário, reservas, cardápio, redes, logo/alternateName; aggregateRating omitido de propósito.
- Title (64) e description (148) sem nota/preço/horário. OG/Twitter com imagem 1200×630 do hero sem foto. Ícones do 鮨 (ico, png, apple, maskable), `site.webmanifest`, `robots.txt`, `sitemap.xml`. Manifest só em http(s) (evita erro de CORS em file://).
- Semântica: 1 h1, h2/h3 em ordem, h2 oculto "Contato" no rodapé, alt na foto do hero.
- Testes: `node scripts/seo-test.mjs` (30/30), visual 0,000/0,139 %, sem JS idêntico, auditoria 17/17, motion verde. Lighthouse: Perf 90 · A11y 100 · BP 100 · SEO 100.

## Entrega final ✅ (tag v1.0-entrega)
### Rodada completa
- `npm test` (Chromium): 112/112 — visual 0,000/0,139 %, sem JS idêntico, auditoria 20/20 (15 telas de 320 a 5120 px + zoom 200%, sem fontes, reduced+dark), motion global + 8 seções, orçamento, SEO 30/30, config de cliente preenchido.
- `npm run test:webkit`: 98/98 (auditoria 20/20, motion global, SEO).
- Lighthouse mobile (mediana de 5): Perf 90 (90·90·90·90·91) · A11y 100 · BP 100 · SEO 100 · FCP 1,16 s · LCP 3,61 s · TBT 38 ms · CLS 0 · SI 1,89 s. Com gzip: 90.
### Dados do cliente centralizados
- `cliente.config.json` (substitui `seo.config.json`): domínio, nome, WhatsApp/reserva, preço, horários, links, autorizações, pratos, logo. `scripts/cliente.mjs` aplica ao HTML e ao JSON-LD; com tudo null o HTML é idêntico ao anterior (fora comentários). Build lista as pendências. `PENDENCIAS-CLIENTE.md`.
### Polimento feito agora (baixo risco, medido)
- Pausa lembrada também dispensa a abertura do hero (8 → 0 animações; console limpo).
- `<meta name="color-scheme" content="only light">`.
- Telas > 2560 px: página limitada a 160rem e centralizada (fotos de 1080 px ficavam 4,7× ampliadas em 5120). 2560/1920/1440: 0,000 %.
- Horário (quando preenchido) em caixa baixa; `index.html` legado movido para `design/legado/`; `npm test`/`test:webkit`; auditoria devolve código de erro.
### Aguarda feedback do cliente/usuário
- Tempo até o nome aparecer no hero (~1,9 s) · abrir também as cortinas do Convite · shibori mais gráfico que o mockup (plate P1 opcional).
- Fotos: Mesa (1080 px) e Salão (640 px, desfocado) moles em telas grandes; triângulos escuros no Convite ≥ 1920; mesmo prato em Rodízio e Cozinha (falta foto de sushiman); shimeji sem foto.
- Favicon/ícones com 鮨 até chegar o logo em vetor; imagem de compartilhamento sem foto até a autorização.
- Lighthouse 90: subir exige recomprimir fotos do cliente (decisão visual).
### Aguarda aparelho real
- ROTEIRO-APARELHO-REAL.md.
