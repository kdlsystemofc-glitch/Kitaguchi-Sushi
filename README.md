# Kitaguchi Sushi — site

Site de uma página do **Kitaguchi Sushi**, restaurante japonês na Av. Itamarati, 1122, Vila Curuçá, Santo André (SP).

> **Não publicar ainda.** Faltam dados e autorizações do cliente: veja **[PENDENCIAS-CLIENTE.md](PENDENCIAS-CLIENTE.md)**.

## Ver o site

- **Sem instalar nada:** abra `site/index.html` no navegador (funciona por `file://`).
- **Como em produção:** sirva a pasta `site/` com qualquer servidor estático, por exemplo `npx serve site`.

## Desenvolver

Requisitos: Node 20+ e Python 3 com Pillow (só para regenerar fotos).

```bash
npm install
npx playwright install chromium webkit   # navegadores dos testes
npm run build                            # src/ → site/  (lista as pendências do cliente no fim)
npm test                                 # regressão completa (Chromium)
npm run test:webkit                      # auditoria, motion e SEO no motor do Safari
npm run lighthouse                       # Lighthouse mobile, mediana de 5
```

**Nunca edite `site/` à mão**: `site/index.html`, `site/css/` e `site/js/motion*.min.js` são gerados. Edite `src/` e rode `npm run build`.

| Tarefa | Comando |
|---|---|
| Fotos mudaram em `imagens/` | `python scripts/assets.py` (recorte + WebP 400/800/original) → `npm run build` |
| Dados do cliente chegaram | editar `cliente.config.json` → `npm run build` → `npm test` |
| Nome/visual do hero mudou | `node scripts/seo-assets.mjs` (imagem de compartilhamento e ícones) |
| Quadros da abertura do hero | `node scripts/hero-quadros.mjs` |
| Screenshots de uma seção | `node scripts/shot.mjs <id-da-secao>` · página inteira: `node scripts/shot.mjs --final` |

### O que `npm test` verifica
1. `ref.mjs`: página inteira com motion desligado contra a referência aprovada (≤ 0,5% de pixels, 1440 e 390).
2. `sem-js.mjs`: com JavaScript desligado o site sai igual à referência.
3. `audit.mjs`: 15 telas (320 a 5120 px, incluindo celular deitado), texto a 200%, sem fontes, movimento reduzido + modo escuro: rolagem horizontal, texto cortado/sobreposto, alvo de toque ≥ 44 px, console.
4. `motion-test.mjs global`: modos full/low/reduced, nada preso invisível, decorativos caros intactos, pausa. Por seção: `node scripts/motion-test.mjs secao <id>`.
5. `seo-test.mjs`: 1 h1, títulos em ordem, alt, metas, JSON-LD válido e sem dado incerto, arquivos de SEO em http.
6. `cliente-teste.mjs`: build com um config de exemplo **fictício** (tudo preenchido), confere cada campo e roda a auditoria; depois reconstrói com o config real.

## Estrutura

```
cliente.config.json   ÚNICO arquivo com os dados que faltam do cliente (+ domínio)
src/                  fontes de verdade
  index.html          HTML com marcadores de build ({{nome}}, <!-- cliente:… -->, <!-- build:… -->)
  css/                fontes.css, tokens.css (cores/tipo/espaço), base.css, secoes.css
  js/                 motion-boot.js (decide e carrega), motion.js (núcleo de animação)
site/                 GERADO — é isto que se publica
  assets/             fotos WebP, imagem de compartilhamento
  fonts/  icons/  js/vendor/   arquivos fixos (versionados)
imagens/              fotos originais do cliente
design/               referência visual (mockup e fatias). NUNCA usado no site
  legado/             versão anterior do site ("Investigação"), guardada só para histórico
scripts/              build, testes, geração de assets, Lighthouse
screenshots/          saída dos testes (não versionada)
```

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [DESIGN.md](DESIGN.md) | Decisões de design: leitura do mockup × realidade, paleta com contraste WCAG, tipografia, camadas, motion, plano de imagens, exceções aprovadas |
| [PENDENCIAS-CLIENTE.md](PENDENCIAS-CLIENTE.md) | O que falta do cliente, como preencher, efeito de cada item, mensagem pronta |
| [DEPLOY.md](DEPLOY.md) | Publicação: cabeçalhos de cache por tipo, compressão, MIME, CSP, passos de SEO |
| [ROTEIRO-APARELHO-REAL.md](ROTEIRO-APARELHO-REAL.md) | Checklist de teste em iPhone e Android |
| [motion-inventario.md](motion-inventario.md) | Todas as animações, modos, orçamento, o que foi rejeitado e por quê |
| [assets.md](assets.md) | Cada imagem do site, de qual original veio e como foi tratada |
| [PROGRESSO.md](PROGRESSO.md) | Histórico por etapa, com medições |
| `motion-baseline.md`, `otimizacao-baseline.md` | Medições de referência antes do motion e da otimização |

## Imagens

- **Fotos:** todas são fotos reais do cliente (Google/Instagram), só recortadas e redimensionadas. **Direito de uso ainda não autorizado** (pendência nº 1).
- **Nenhuma imagem foi recriada, ampliada ou editada por IA.** Se isso acontecer no futuro, a imagem deve ser registrada em `assets.md` com a nota **"recriada por IA — confirmar com o cliente antes de publicar"**.
- Imagem de compartilhamento e ícones: gerados a partir do próprio CSS do site (noren e kanji 鮨), sem foto e sem IA.
- Decorativos (trama de linho, noren, cortinas, shibori): CSS/SVG.

## Licenças

| Componente | Uso | Licença |
|---|---|---|
| GSAP 3.15.0 + ScrollTrigger | animação (em `site/js/vendor/`) | GreenSock Standard "no charge" License, gratuita inclusive para uso comercial: <https://gsap.com/standard-license> |
| Lenis 1.3.26 | rolagem suave (em `site/js/vendor/`) | MIT |
| Cormorant Garamond | fonte (títulos) | SIL Open Font License 1.1 |
| Source Serif 4 | fonte (texto) | SIL Open Font License 1.1 |
| Shippori Mincho (só o glifo 鮨) | fonte (kanji) | SIL Open Font License 1.1 |
| Playwright · Lighthouse | testes (dev) | Apache-2.0 |
| terser | minificação (dev) | BSD-2-Clause |
| pixelmatch · pngjs | comparação de imagens (dev) | ISC · MIT |

Os arquivos de fonte vêm do Google Fonts (subconjunto latin; o 鮨 com `text=`) e estão auto-hospedados em `site/fonts/`.
