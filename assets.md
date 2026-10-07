# assets.md — inventário de imagens do site

Gerado por `scripts/assets.py` (recorte + redimensionamento + WebP q80). **Nenhuma imagem foi editada ou gerada por IA**: nenhuma recebe a nota "recriada por IA".
Plates gerados: **nenhum** (`design/plates/` não existe; todo o decorativo é CSS/SVG, conforme o DESIGN.md §d/e).

## Limite de resolução
As fotos originais têm no máximo **1080 px** (a do salão, 640 px). **Não existe versão de 1600 px**: ampliar sem IA não acrescenta detalhe. Por isso cada foto sai em **400 px (degrau de celular, acrescentado na otimização)**, 800 px e na largura original. A versão de 1600 px depende do prompt A2 do DESIGN.md (ampliação por IA) **ou** do envio dos originais pelo cliente. Se for ampliada por IA, tem que entrar aqui com a nota "recriada por IA — confirmar com o cliente antes de publicar".

## Mapa slot → arquivo

| Slot (DESIGN.md §g) | Seção | Asset em site/assets | Original (imagens/) | Tratamento | Observação |
|---|---|---|---|---|---|
| S1 Hero — atrás do noren | 01 | `hero-barca-800.webp`, `hero-barca-810.webp` | `imgi_52_620906544_…_n.webp` (810×1080) | nenhum | Barca do rodízio. O salão real não serve de hero (ver S4). |
| S2 Rodízio | 02 | `rodizio-combinado-800.webp`, `-1080.webp` | `imgi_39_627131120_…_n.webp` (1080²) | recorte 3:2 (y 180–900) | Salmão maçaricado, sashimi e joe. |
| S3 Cozinha / preparo | 03 | `cozinha-macaricado-800.webp`, `-810.webp` | `imgi_40_627267597_…_n.webp` (810×1080) | nenhum | **Não há foto de sushiman.** Fallback: close do maçaricado (é o trabalho da cozinha, mesmo prato do S2). |
| S4 Salão | 04 | `mesa-drink-800.webp`, `-1080.webp` | `imgi_51_622258745_…_n.webp` (1080²) | recorte y 150–1080 | **Recorte remove garrafa com logo Heineken** (marca de terceiro). Mostra a mesa real (jogo americano vermelho, pratos). |
| S5 Shimeji | 06 | — | **sem arquivo** | — | **Fallback: faixa só com texto** sobre índigo, com comentário de pendência no HTML. |
| S6 Prato 2 | 06 | `prato-nigiri-800.webp`, `-1080.webp` | `imgi_48_621444433_…_n.webp` (1080²) | nenhum | Nigiri de salmão no hashi. |
| S7 Prato 3 | 06 | `prato-temaki-800.webp`, `-1080.webp` | `imgi_56_620913433_…_n.webp` (1080²) | nenhum | É temaki de **salmão**, não de atum como no mockup. |
| S8 Prato 4 (mockup: hot roll) | 06 | `prato-sobremesa-800.webp`, `-810.webp` | `imgi_50_621667266_…_n.webp` (810×1080) | recorte y 135–1080 | **Não há foto de hot roll.** Troquei por sobremesa (sorvete com calda de morango), tema citado em 17 avaliações. |
| S9 Convite — atrás das cortinas | 07 | `salao-640.webp` | `imgi_35_627217937_…_n.jpg` (640×1138) | nenhum | Único registro do salão (frame de vídeo, **baixa resolução e desfocado**). Usado estreito, entre as cortinas. Candidato ao prompt A2. |
| S10 Logo | 08 | `logo-150.webp` | `imgi_2_124437197_…_n.jpg` (150²) | nenhum | **150 px, pequeno demais**: usado só até 72 px. O logo diz "SUSHI L & M Delivery" (ver pendências). |
| S11 og:image | head | `rodizio-combinado-1080.webp` | idem S2 | — | Sem texto sobreposto. |

## Não usados
- `imgi_38_630043211_…_n.webp`: quase duplicata de `imgi_52` (mesma barca, enquadramento parecido).
- `imgi_57_619256448_…_n.jpg`: montagem de duas fotos (sushi doce); fica de reserva para uma futura faixa de sobremesas.

## Otimização (2026-09-30)
- Degrau de 400 px gerado para todas as fotos (mesmo recorte, só redimensionamento) e `sizes` ajustado por breakpoint no `src/index.html`.
- `fetchpriority="high"` retirado da foto do hero: o candidato a LCP medido é o painel do noren (texto 鮨), e a foto começa invisível na abertura.
- Shibori: foi testada uma pré-renderização em WebP (400/800/1600) para tirar o filtro SVG da 1ª pintura. **Rejeitada**: 1,6% de diferença de pixels (o filtro do Chrome depende da resolução). O shibori continua SVG inline, com `content-visibility: auto`. Nenhum plate foi adicionado.

## Fontes (site/fonts, auto-hospedadas)
| Arquivo | Família | Origem | Licença |
|---|---|---|---|
| `cormorant-garamond-latin.woff2` | Cormorant Garamond (variável, pesos 500 e 600 usados) | Google Fonts, subconjunto latin | SIL Open Font License 1.1 |
| `source-serif-4-latin.woff2` | Source Serif 4 (variável: wght + opsz) | Google Fonts, subconjunto latin | SIL Open Font License 1.1 |
| `shippori-mincho-sushi.woff2` | Shippori Mincho 700, só o glifo 鮨 | Google Fonts (`text=鮨`) | SIL Open Font License 1.1 |

## SEO (gerados por scripts/seo-assets.mjs, depois do build)
| Arquivo | O que é | Origem |
|---|---|---|
| `assets/og-sushi-lm.jpg` (1200×630) | Prévia de compartilhamento (Open Graph/Twitter) | O hero aprovado renderizado a 1200×630 **sem a foto** (todas as fotos têm direito de uso pendente) e sem o CTA; nome e localização ampliados para ler na prévia de ~500 px. Contém texto em imagem só por ser prévia de rede social; o texto do site continua HTML. |
| `favicon.ico` (16/32/48), `icons/icon-{16,32,48,192,512}.png`, `icons/apple-touch-icon.png`, `icons/maskable-512.png` | Ícones | O 鮨 (Shippori Mincho) sobre índigo. **Não** é o logo: o logo real tem 150 px (ilegível a 16–32 px) e diz "L&M" (nome pendente). Trocar quando chegar o logo em vetor. |
