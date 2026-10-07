# DESIGN.md — Kitaguchi Sushi

Etapa: **análise** (nenhuma linha do site escrita ainda).
Fonte de verdade de conteúdo: `CLIENTE.md`. Referência visual: `design/mockup-full.png.png` (941×1672 px), fatiado em `design/secoes/`.

---

## 0. Estado das fontes (ler primeiro)

| Fonte pedida | Situação |
|---|---|
| `CLIENTE.md` | OK — é um dump bruto do Google Maps (já contém o "bruto"). |
| `CLIENTE-bruto.md` | **Não existe.** Tratei o `CLIENTE.md` como fonte bruta única. |
| `IMAGENS/` | **Não existe no projeto.** Nenhuma foto real do cliente disponível. |
| `design/mockup-full.png` | Existe como `mockup-full.png.png` (extensão duplicada). |
| `index.html` (raiz) | Versão anterior ("v4 — Investigação"). Referencia `imagens/imgi_38_…webp`, `imgi_51_…webp`, `imgi_52_…webp`, que **não estão na pasta**. Não será reaproveitado: estética diferente e textos com afirmações não confirmadas ("R$80", "É real"). |

Consequência: todos os slots de foto abaixo ficam como **FOTO REAL — arquivo pendente**, com o critério de escolha descrito. Assim que a pasta `IMAGENS/` chegar, eu preencho a coluna "arquivo" e os prompts de ajuste com os nomes exatos. As pastas `imagens/` em `C:\padro\Butoh` e `C:\padro\Yukusue` são de **outros clientes** e não serão usadas.

### Fatos reais extraídos do CLIENTE.md

| Fato | Valor | Confiabilidade |
|---|---|---|
| Nome | Kitaguchi Sushi | oficial (Google) |
| Categoria | Restaurante japonês | oficial |
| Endereço | R. Afonsina, 244 — Rudge Ramos, São Bernardo do Campo — SP, 09633-000 | oficial |
| Plus code | 8CWJ+4R Rudge Ramos, São Bernardo do Campo - SP | oficial |
| Telefone | (11) 94032-0412 | oficial; **não está confirmado que é WhatsApp** |
| Link de cardápio | aponta para `wa.me` (link completo não veio no dump) | oficial, incompleto |
| Nota | 4,8 — 330 avaliações no Google | oficial (varia com o tempo) |
| Faixa de preço | R$ 80–100 por pessoa, "informado por 113 pessoas" | **informado por usuários, não é preço oficial** |
| Serviços | Refeição no local · Retirada na porta · Entrega sem contato · Pedir on-line | oficial |
| Horário | "Aberto · Fecha 15:30 · Reabre às 18:30" | **snapshot de um único dia**; hora de fechamento noturno e dias da semana desconhecidos |
| Mais pedidos | Rodízio Japonês, Shimeji | oficial (seção "Mais pedidos") |
| Avaliações citáveis | Karlen Franche: "A comida sempre é fresquinha / O atendimento é excelente"; Anderson Ferreira: "ótima opção de rodízio com ótimo custo benefício"; destaques: "É o rodízio mais barato do Estado de São Paulo", "Entrega no prazo e preços ótimos!!!" | avaliações de terceiros, não afirmações do cliente |
| Contradição/alerta | Anderson Ferreira: "o ambiente não é elaborado" | contradiz o salão luxuoso do mockup |
| Ignorado | Jozan Sushi, Torá Sushi, Konkai Sushi, Asami Sushi | concorrentes ("Lugares também pesquisados") |

---

## a) Leitura honesta: mockup × realidade

O mockup é **integralmente gerado por IA**. Serve para ritmo, paleta, tipografia e composição; quase nada nele é conteúdo real.

| # | Bloco | O que o mockup mostra | Realidade / decisão |
|---|---|---|---|
| 01 | Hero (noren) | Noren índigo com 鮨 abrindo para um salão de madeira com lanternas, bambu e plantas | **Inventado.** Não há evidência de que o restaurante tenha noren, lanternas ou esse salão. O noren vira **elemento gráfico CSS/SVG** (claramente ilustração, não foto); o que aparece "atrás" dele tem de ser foto real (salão ou fachada). |
| 01 | Texto "KITAGUCHI SUSHI" em serifa espaçada | Wordmark tipográfico | Logo oficial anexado pelo cliente (`site/assets/logo-150.png`). |
| 01 | "Rudge Ramos · São Bernardo · 18h30." | Localização + horário | Localização real. "18h30" é só o horário de reabertura num dia — não pode aparecer como horário de funcionamento. |
| 02 | Barca de sashimi/nigiri/uramaki numa tábua sobre linho | Prato de banco de imagem | **Inventado.** Substituir por foto real de combinado/rodízio do cliente. |
| 02 | "Rodízio Japonês · R$80 · Livre e Farto." | Preço e slogan | "Rodízio Japonês" é real. **"R$80" não é confirmado** (o Google diz R$ 80–100 por pessoa, informado por usuários). **"Livre e Farto" é slogan inventado** — descartado. |
| 03 | "A COZINHA FALA POR ELE." + mãos enrolando maki | Slogan + foto de chef | Slogan **inventado** — descartado. Foto **inventada**; só entra se houver foto real de preparo/sushiman. |
| 04 | Salão cheio, lanternas, painel 鮨 na parede, "Cada mesa, uma história." | Ambiente sofisticado + slogan | **Ambiente não bate** com a avaliação ("o ambiente não é elaborado"). Slogan **inventado**. Seção depende de foto real do salão (ver Pergunta 2). |
| 05 | Tecido shibori + "4,8★ 330 avaliações · Google" | Prova social | Número **real**. Shibori é decorativo → SVG. |
| 06 | Faixas: Salmão Nigiri, Temaki de Atum, Shimeji, Hot Roll | Pratos com fotos de banco | **Shimeji é real** ("Mais pedidos"). Salmão nigiri, temaki de atum e hot roll **não aparecem nos dados** — prováveis num rodízio, mas não confirmados. Todas as fotos são inventadas. |
| 07 | Cortinas índigo com 鮨 abertas para o salão + "Está pronto para entrar?" | Convite final | Cortinas → CSS/SVG. Salão **inventado**. Frase é copy de convite genérica — trato como texto provisório marcado (não é fato, mas também não é dado do cliente). |
| 08 | "Fale no WhatsApp →" + "Kitaguchi Sushi · Av. Itamarati, 1122 · Vila Curuçá · Santo André" | CTA + endereço | Endereço **real**. |
| — | Bambu, costela-de-adão, lanternas de papel nas bordas | Decoração de cena | **Descartados.** Sugerem um ambiente que não existe. |
| — | Kanji 鮨 (sushi) | Tipografia decorativa | Mantido como **texto HTML** decorativo (`aria-hidden`), palavra genérica, não é marca do cliente. |

---

## b) Paleta (amostrada do mockup) e contraste WCAG

Amostragem por mediana de regiões do PNG (script Python/PIL). Nomes são os tokens CSS que o site vai usar.

| Token | HEX | Origem da amostra |
|---|---|---|
| `--indigo-950` | `#061626` | faixa do rodapé |
| `--indigo-900` | `#0A1D31` | blocos lisos (cozinha, faixas do cardápio) |
| `--indigo-700` | `#122740` | tom médio do shibori / realce do tecido |
| `--papel` | `#F7E9CA` | texto "Kitaguchi Sushi" sobre o noren |
| `--linho` | `#E6D4BE` | fundo creme (avaliação, faixas claras) |
| `--linho-sombra` | `#CDB49E` | linho em sombra (legenda do rodízio) |
| `--kanji` | `#CDB198` | 鮨 pintado no noren |
| `--tinta` | `#14161B` | "4,8" |
| `--madeira` | `#633A13` | tábua / mesas |
| `--ambar` | `#FCEFCF` | brilho das luminárias (só para glows decorativos) |
| `--salmao` | `#D0500D` | salmão do nigiri (acento) |
| `--fio` | `#C7BDB3` | fios divisórios curtos sob os títulos |

### Contraste calculado (fórmula WCAG 2.x)

| Texto | Fundo | Razão | AA normal (4,5) | Ação |
|---|---|---|---|---|
| `--papel` | `--indigo-900` | 14,16 | ✅ | — |
| `--papel` | `--indigo-950` | 15,18 | ✅ | — |
| `--papel` | `--indigo-700` | 12,56 | ✅ | — |
| `--tinta` | `--linho` | 12,52 | ✅ | — |
| `--tinta` | `--linho-sombra` | 9,15 | ✅ | — |
| `--kanji` | `--indigo-900` | 8,38 | ✅ | — |
| `--madeira` | `--linho` | 6,77 | ✅ | — |
| `--fio` (não-texto) | `--indigo-900` | 9,21 | ✅ (≥3) | — |
| **`--salmao` `#D0500D`** | `--linho` | **3,00** | ❌ | só decorativo/≥24px; para texto usar **`--salmao-texto: #963808`** (5,07 ✅) |
| **`--salmao`** | `--indigo-900` | **3,92** | ❌ | para texto sobre índigo usar **`--salmao-claro: #E0662A`** (4,95 ✅) |
| `--papel` | `--salmao` (botão) | 3,61 | ❌ | botão usa fundo **`#963808`** com texto `--papel` (6,09 ✅) |
| `--papel` a 60 % sobre `--indigo-900` (= `#98978D`) | — | 5,80 | ✅ | pode usar, mas prefiro token sólido **`--papel-suave: #AFA99B`** (7,28 ✅) |
| `--tinta` a 60 % sobre `--linho` (= `#68625C`) | — | 4,16 | ❌ | usar **`--tinta-suave: #57514B`** (5,41 ✅) |

Regra: texto secundário sempre com os tokens sólidos `--papel-suave` / `--tinta-suave`, nunca com opacidade (também evita `opacity<1` em ancestrais, ver regra de motion).

---

## c) Tipografia (Google Fonts — nada de Inter/Roboto/Arial)

O mockup é 100 % serifado: caixa-alta espaçada tipo romana nos títulos, serifa de livro nas legendas, e o kanji em mincho de pincel.

| Papel | Candidata 1 | Candidata 2 | Decisão |
|---|---|---|---|
| **Display** (wordmark, "4,8", títulos em versal espaçada) | **Cormorant Garamond** (500/600, itálico disponível) | Marcellus (1 peso, versais tipo Trajano) | **Cormorant Garamond.** É a mais próxima das versais do mockup, tem vários pesos (Marcellus tem um só) e numerais de alto contraste para o "4,8" (`font-variant-numeric: lining-nums`). Uso só ≥ 20px, onde a serifa fina não some. |
| **Texto** (parágrafos, legendas, endereço, botão) | **Source Serif 4** (eixo óptico) | EB Garamond | **Source Serif 4.** EB Garamond é mais fiel às legendas do mockup, mas fica fina e clara demais a 16px em tela; a Source Serif 4 tem tamanho óptico e lê bem no celular, mantendo o tom de livro. |
| **Kanji decorativo** (鮨) | **Shippori Mincho** | Noto Serif JP | **Shippori Mincho**, carregada com `&text=鮨` (subset de 1 glifo, poucos KB). Tem terminais de pincel mais próximos do noren pintado; a Noto é mais seca/técnica. |

Escala fluida (tokens): `--fs-xs: clamp(.75rem, .7rem + .2vw, .85rem)`, `--fs-sm: clamp(.9rem, .85rem + .25vw, 1rem)`, `--fs-md: clamp(1.05rem, 1rem + .35vw, 1.25rem)`, `--fs-lg: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)`, `--fs-xl: clamp(2.25rem, 1.5rem + 3.5vw, 4.5rem)`, `--fs-hero: clamp(3.5rem, 2rem + 8vw, 9rem)` (para "4,8" e 鮨).
Versal espaçada: `letter-spacing: .32em` no wordmark e títulos (medido no mockup: o espaço entre letras ≈ 1/3 da altura da versal).

Espaçamento: `--space-1 … --space-8` em `clamp()` sobre base de 0,5rem → 6rem; margens laterais `--gutter: clamp(1rem, 5vw, 5.5rem)`.

---

## d) Tabela de camadas por seção

Legenda: **CSS** = cor/gradiente/forma CSS · **SVG** = inline/`data:` SVG · **FOTO** = foto real do cliente (`/site/assets`, vinda de `IMAGENS/`) · **PLATE** = imagem gerada decorativa (`/design/plates` → `/site/assets`).

| Seção (fatia) | Fundo | Decoração | Imagem | Texto (HTML) |
|---|---|---|---|---|
| 01 Hero — `01-hero-noren.png` | FOTO (salão ou fachada), escurecida por gradiente CSS | 2 painéis de noren: CSS (índigo) + SVG (trama de linho `feTurbulence`) + kanji 鮨 em texto | FOTO | wordmark, localização, nota 4,8 |
| 02 Rodízio — `02-rodizio-prato.png` | CSS `--linho` + SVG trama | — | FOTO (combinado/barca) | "Rodízio Japonês", faixa de preço (pendência) |
| 03 Cozinha — `03-cozinha.png` | CSS `--indigo-900` + SVG trama | fio divisório CSS | FOTO (preparo/sushiman) | citação real de avaliação |
| 04 Salão — `04-salao.png` | FOTO full-bleed + gradiente CSS | — | FOTO (salão) | legenda + serviços (local/retirada/entrega) |
| 05 Avaliação — `05-avaliacao.png` | metade SVG shibori / metade CSS `--linho` | shibori SVG | — | "4,8 ★", "330 avaliações no Google", 2–3 citações |
| 06 Cardápio — `06-cardapio.png` | faixas alternadas CSS `--indigo-900` / `--linho` | fio divisório | FOTO por prato (4) | nomes dos pratos |
| 07 Convite — `07-convite-entrar.png` | FOTO (salão/fachada) | 2 cortinas CSS+SVG com 鮨, amarradas (drapeado via `clip-path` + gradiente) | FOTO | frase de convite (provisória), endereço |
| 08 Rodapé — `08-rodape-cta.png` | CSS `--indigo-950` + SVG trama | — | — | CTA WhatsApp, endereço, telefone, horário (pendência) |

**PLATEs necessários: 0.** Tudo decorativo é resolvível em CSS/SVG. Há 1 plate **opcional** (shibori) só como plano B, ver seção g.

---

## e) Reinterpretação dos decorativos complexos em CSS/SVG

1. **Trama de linho índigo** (fundo dos blocos azuis e do noren)
   `background-color: var(--indigo-900)` + um SVG `data:` 240×240 com `<feTurbulence type="fractalNoise" baseFrequency="0.9 0.08">` (frequência anisotrópica = fios horizontais) + um segundo com `baseFrequency="0.08 0.9"` (fios verticais), ambos com `feColorMatrix` para alfa ≈ 6 %. Tileável, ~1 KB, escala com o elemento. Aplicado **por seção** (não em `body::after` fixo) para não virar camada contínua cara.

2. **Noren do hero** (dois painéis que caem do topo, com fenda central)
   Dois `<div>` absolutos, `width: 46%`, `height: clamp(38vh, 60vw, 70vh)` no mobile; `clip-path: polygon()` com borda inferior levemente irregular; sombra interna via `linear-gradient` vertical (mais escuro no topo = dobra da vara) — sem `box-shadow` padrão. Kanji 鮨 em Shippori Mincho, cor `--kanji`, com `mask` SVG de ruído para parecer tinta absorvida no tecido. Wordmark no painel direito. No mobile os painéis ocupam a largura toda e a fenda fica a 50 %.

3. **Cortinas amarradas** (seção 07)
   Cada cortina é um `<div>` com `clip-path: path()` gerado num SVG de 100×100 (`clipPathUnits="objectBoundingBox"`, responsivo), afunilando na altura da "amarração"; drapeado = `repeating-linear-gradient` vertical com 5–7 faixas de luz/sombra do índigo; amarra = elipse CSS. Kanji 鮨 como texto.

4. **Shibori** (seção 05)
   SVG `<pattern>` com um motivo "kumo/estrela": 12 elipses finas em raio (`<use>` rotacionado 30° em 30°) + círculo central, cor `--papel` sobre `--indigo-700`. O efeito de tinta que sangrou vem de `<feTurbulence baseFrequency="0.04" numOctaves="3">` + `<feDisplacementMap scale="6">` + `<feGaussianBlur stdDeviation="0.6">`. Filtro aplicado **uma vez** no `<pattern>` (a SVG não anima). Plano B: plate opcional (seção g).

5. **Fios divisórios** sob títulos: `::after` com `width: clamp(1.5rem, 4vw, 2.5rem); height: 1px; background: var(--fio)`.

6. **Faixas do cardápio que "atravessam" foto e cor**: grid de 2 colunas; a foto sangra para dentro da faixa colorida com `mask-image: linear-gradient(to right, transparent, #000 25%)` — igual à transição suave do mockup, sem bordas de card.

---

## f) Especificação de animação (fase de motion)

Regras gerais: tudo visível sem JS (estado final no CSS, animação só *de* um estado inicial aplicado por classe `.js-motion` adicionada após `load`). Só `transform`/`opacity` em **camadas-folha**. Tramas de linho e shibori **não se movem** e nenhum ancestral delas recebe transform/filter/opacity<1. `prefers-reduced-motion: reduce` → todas as animações desligadas (só fades de 150ms ou nada).

| Seção | Animação | Duração / easing | Gatilho |
|---|---|---|---|
| 01 Hero | Os painéis do noren já estão no lugar; após `load`, afastam-se lateralmente 3–4 % (`translateX`) e fazem um balanço de 1 ciclo (`rotate` ±0,6°, origem no topo). Foto de fundo: `scale(1.04 → 1)`. | 1,4s, `cubic-bezier(.16,1,.3,1)` | `load` |
| 02 Rodízio | Foto: `translateY(4% → 0)` + `opacity .0 → 1` só na foto (folha). Legenda: fade 200ms depois. | 0,9s | entra 20 % na viewport |
| 03 Cozinha | Fio divisório cresce `scaleX(0 → 1)`; citação sobe em 2 linhas (cada linha é um `span` folha). | 0,7s, stagger 80ms | viewport |
| 04 Salão | Parallax leve: `translateY` da `<img>` a −6 % ao longo do scroll (ScrollTrigger `scrub`). Desligado < 768px. | scrub | scroll |
| 05 Avaliação | "4,8" conta de 0,0 → 4,8 (texto final já no HTML; contagem só se JS carregar). Estrela `scale(.6 → 1)`. Shibori **parado**. | 1,2s | viewport |
| 06 Cardápio | Cada faixa: foto desliza 5 % a partir do lado do texto; nome faz fade. | 0,8s, stagger 120ms | viewport |
| 07 Convite | Cortinas abrem de `translateX(±12%)` para a posição amarrada (as cortinas são folhas; a foto atrás não é filha delas). | 1,6s | 40 % na viewport |
| 08 Rodapé | CTA: seta `translateX(0 → 4px)` no hover/focus. Nada ao entrar. | 200ms | hover/focus |

Biblioteca: GSAP + ScrollTrigger carregados com `defer` e iniciados em `window.addEventListener('load')`.

---

## g) PLANO DE IMAGENS

### g.1 Slots do site

| Slot | Tipo | Arquivo | Critério de escolha / observação |
|---|---|---|---|
| S1 Hero — fundo atrás do noren | FOTO REAL | **pendente** (IMAGENS/ ausente) | Foto do salão com mesas, ou fachada da R. Afonsina, 244, horizontal, ≥ 1600px de largura. Se o salão for simples, preferir a fachada à noite ou um balcão de preparo. |
| S2 Rodízio — prato principal | FOTO REAL | **pendente** | Combinado/barca do rodízio, vista de cima ou 3/4, horizontal. |
| S3 Cozinha — preparo | FOTO REAL | **pendente** | Sushiman montando peças / mãos no hashi ou makisu. Se não existir, a seção vira só texto (citação) sobre índigo — não inventar. |
| S4 Salão | FOTO REAL | **pendente** | Salão real, de preferência com clientes (com autorização de imagem) ou vazio e arrumado. |
| S5 Shimeji | FOTO REAL | **pendente** | Prato de shimeji (é um "mais pedido" oficial). |
| S6 Prato 2 (mockup: salmão nigiri) | FOTO REAL | **pendente** | Só entra se o prato for confirmado no cardápio. |
| S7 Prato 3 (mockup: temaki de atum) | FOTO REAL | **pendente** | Idem. |
| S8 Prato 4 (mockup: hot roll) | FOTO REAL | **pendente** | Idem. |
| S9 Convite — fundo atrás das cortinas | FOTO REAL | **pendente** | Pode repetir outro enquadramento do salão ou a fachada. Não pode ser a mesma foto do S1. |
| S10 Logo | FOTO/ARQUIVO REAL | **pendente** | Vetor (SVG/PDF/AI) ou PNG ≥ 1000px com fundo transparente. Até lá: wordmark em HTML. |
| S11 Og:image (compartilhamento) | FOTO REAL recortada 1200×630 | derivada de S2 | Recorte da foto do prato, sem texto sobreposto (regra: nenhum texto dentro de imagem). |
| D1 Trama de linho | CSS/SVG | — | seção e.1 |
| D2 Noren | CSS/SVG + texto | — | seção e.2 |
| D3 Cortinas | CSS/SVG + texto | — | seção e.3 |
| D4 Shibori | SVG | — | seção e.4 (plate opcional P1 como plano B) |

### g.2 PLATEs a gerar

**Nenhum é obrigatório.** Um opcional, a gerar somente se o shibori em SVG não convencer na revisão visual:

**P1 — Shibori (opcional, plano B da seção 05)** → salvar em `design/plates/shibori-indigo.png`
```
Seamless tileable textile texture, Japanese kumo/arashi shibori tie-dye on handwoven cotton linen, deep indigo #0A1D31 to #122740 dye with off-white #F7E9CA undyed starburst patterns, soft bleeding dye edges, visible linen weave, flat top-down scan, even diffuse lighting, no shadows, no folds, no perspective. Purely abstract pattern: no text, no letters, no kanji, no logos, no people, no objects, no figurative elements. Square 1:1, 2048×2048, seamless edges on all four sides.
```

### g.3 Fotos reais a ajustar

Não consigo apontar os arquivos exatos: `IMAGENS/` não existe. Abaixo, os prompts-modelo prontos para cada tipo de ajuste que estas fotos costumam precisar (dump do Google Maps/Instagram). Troque `<ARQUIVO>` pelo nome real ao anexar. Depois que eu receber a pasta, substituo pelos nomes. Toda saída de ajuste por IA será registrada em `assets.md` com a nota **"recriada por IA — confirmar com o cliente antes de publicar"**.

**A1 — Remover texto/marca-d'água sobreposto** (ex.: preço, @ do Instagram, selo "Google", legenda de story)
```
Anexo: IMAGENS/<ARQUIVO>
Mantenha tudo idêntico: mesmo enquadramento, mesma comida, mesmas peças, mesma quantidade, mesmas cores, mesma luz, mesmo fundo e mesma resolução. Só corrija isto: remova o texto/marca-d'água sobreposto em <posição, ex. canto inferior direito> e reconstrua apenas a área que estava por baixo, continuando a textura existente ao redor. Não adicione, não remova e não altere nenhum alimento, objeto ou pessoa. Não embeleze, não mude a saturação.
```

**A2 — Ampliar resolução (foto pequena ou comprimida)**
```
Anexo: IMAGENS/<ARQUIVO>
Mantenha tudo idêntico: mesma composição, mesmos alimentos, mesmas formas, cores, luz e fundo. Só corrija isto: aumente a resolução para <2400> px no lado maior, removendo artefatos de compressão JPEG e ruído, preservando detalhes reais (textura do arroz, fibras do peixe, gergelim). Não invente detalhes novos, não mude o formato dos cortes, não aplique filtro, não altere o enquadramento.
```

**A3 — Logo pequeno ou em baixa**
```
Anexo: IMAGENS/<ARQUIVO do logo>
Mantenha tudo idêntico: mesmo desenho, mesmas letras, mesma grafia "Kitaguchi Sushi", mesmas proporções, mesmas cores e mesmo espaçamento. Só corrija isto: reconstrua o logo em alta resolução (2000 px de largura) com bordas nítidas e fundo transparente, removendo pixelização e o fundo atual. Não redesenhe, não troque a fonte, não adicione elementos.
```
(Preferível: pedir o vetor original ao cliente — ver pendências. A3 só se ele não tiver.)

**A4 — Estender o fundo para caber no formato do slot** (ex.: foto vertical do celular num slot horizontal)
```
Anexo: IMAGENS/<ARQUIVO>
Mantenha tudo idêntico na área original da foto: mesmo prato, mesma mesa, mesma luz, mesma cor. Só corrija isto: estenda o fundo para a proporção 16:9, adicionando nas laterais apenas continuação da superfície/mesa/parede que já aparece na borda da foto. Não adicione pratos, objetos, pessoas, decoração ou texto na área nova.
```

---

## h) Perguntas para você (subjetivas)

1. **O noren do hero: gráfico ou realista?** (A) noren **gráfico** em CSS/SVG (liso, estilizado, claramente ilustração) sobre a foto real; ou (B) um plate de tecido **realista**, mais parecido com o mockup, mas que pode sugerir que o restaurante tem essa cortina na porta. Minha recomendação: A.
2. **Peso do salão.** O mockup dá 2 seções inteiras ao salão (04 e 07), mas uma avaliação diz que "o ambiente não é elaborado". Se as fotos reais confirmarem isso, prefere (A) manter as seções com a foto real como ela é, ou (B) reduzir o salão e dar esse espaço à comida e às avaliações? Recomendação: decidir ao ver as fotos; tendência B.
3. **Posicionamento do texto.** (A) sóbrio e elegante como o mockup, com o preço discreto; ou (B) assumir o custo-benefício como argumento principal ("rodízio com nota 4,8", citando a avaliação "o rodízio mais barato do Estado")? Recomendação: A no visual, com B como segunda linha do hero.
4. **O `index.html` antigo (conceito "Investigação")**: posso mover para `design/legado/` quando começar a construir? Proponho mover e não apagar.

---

## i) PENDÊNCIAS-CLIENTE (bloqueiam publicação, não construção)

| # | Pendência | Onde aparece no site | Placeholder até lá |
|---|---|---|---|
| 1 | **Fotos originais**: pratos, rodízio, salão, fachada, preparo; e **direito de uso** delas | todas as seções | bloco `--indigo-900` com comentário `<!-- PENDÊNCIA-CLIENTE: foto -->` |
| 2 | **Logo** em vetor ou PNG alta | hero, rodapé, favicon | logo oficial Kitaguchi Sushi (`site/assets/logo-150.png`) |
| 3 | **Preço oficial do rodízio** (almoço × jantar × fim de semana; criança?) | 02, 06 | "Consulte o valor no WhatsApp" + comentário |
| 4 | **O que o rodízio inclui** (sobremesa? bebida? pratos quentes? tempo limite?) | 02 | omitido |
| 5 | **Horário completo por dia da semana** (só sabemos: fecha 15h30, reabre 18h30 num dia) | 01, 08 | omitido + comentário |
| 6 | **O (11) 94032-0412 é WhatsApp?** Aceitam **reserva** por ele? Link completo do cardápio (`wa.me/...`) | 08 | botão "Fale no WhatsApp" → `https://wa.me/5511940320412` com comentário de pendência |
| 7 | **Confirmar pratos** do mockup: salmão nigiri, temaki de atum, hot roll (estão no rodízio/cardápio?) | 06 | só Rodízio e Shimeji entram confirmados |
| 8 | **Pedido on-line / delivery**: qual plataforma, link, área e taxa de entrega | 07/08 | "Retirada na porta e entrega" sem link |
| 9 | **Autorização** para citar avaliações com o nome dos autores e para usar fotos com clientes identificáveis | 03, 05 | citações sem sobrenome |
| 10 | Instagram / outras redes | 08 | omitido |

### Mensagem pronta para o cliente

> Oi! Tudo bem? Aqui é do site do Kitaguchi Sushi 🍣 Já estamos montando o layout e, para colocar no ar, preciso confirmar algumas coisas com vocês:
>
> 1. **Fotos**: podem me mandar as fotos originais (as do celular, sem filtro/legenda) dos pratos, do rodízio, do salão, da fachada e, se tiver, do sushiman preparando? Posso usar todas no site?
> 2. **Logo**: vocês têm o logo em arquivo de boa qualidade (PDF, SVG, AI ou PNG grande com fundo transparente)?
> 3. **Rodízio**: qual o valor hoje? Muda entre almoço, jantar e fim de semana? Criança paga diferente? O que está incluso (sobremesa, bebida, pratos quentes)?
> 4. **Horário**: quais dias e horários vocês abrem (almoço e jantar)?
> 5. **WhatsApp**: o (11) 94032-0412 é WhatsApp? Vocês aceitam reserva por ele?
> 6. **Cardápio**: salmão nigiri, temaki de atum e hot roll fazem parte do rodízio? Tem algum outro prato que vocês querem destacar além do shimeji?
> 7. **Delivery**: vocês usam iFood ou outra plataforma? Qual o link e até onde entregam?
> 8. **Avaliações**: podemos mostrar trechos de avaliações do Google com o primeiro nome de quem escreveu?
> 9. Têm Instagram?
>
> Não precisa responder tudo de uma vez. Vou montando o site com o que tiver e só publico depois da confirmação de vocês. Obrigado! 🙏

---

## Registro de decisões técnicas/criativas (sem impacto factual)

- **Fatias do mockup** cortadas por bloco de conteúdo, nas linhas de maior diferença entre pixels (y = 258, 460, 646, 840, 1006, 1289, 1549). As 4 faixas do cardápio formam **um** bloco (`06-cardapio.png`). A planta de bambu que atravessa 07/08 é decorativa e foi descartada, então o corte a ignora.
- **Tramas por seção, e não em overlay fixo global**: um `body::after` fixo com ruído (como no index antigo) seria elemento contínuo e caro. Por seção fica mais barato e não interfere no motion.
- **Sem sombras**: profundidade só por gradiente de cor dentro do próprio índigo, como no tecido do mockup.
- **Largura máxima do texto**: `max-width: 34ch` nas citações, `60ch` no corpo.

- **Exceção — abertura do noren no hero (pedido do cliente, 2026-09-29).** A regra "decorativo caro não se move" é mantida em todo o site, exceto aqui: os painéis do noren se movem uma única vez, na carga, só com `transform` (sem filter/opacity nos painéis), em ~2,5s, terminando no layout estático. É CSS puro (não depende de JS; `prefers-reduced-motion` mostra o hero já aberto). Custo medido: Lighthouse 77 (base 78), LCP inalterado.
