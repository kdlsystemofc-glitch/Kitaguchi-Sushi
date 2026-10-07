# motion-inventario.md — todas as animações do site

Arquivos: `site/js/motion-boot.js` (decide e carrega), `site/js/motion.js` (núcleo), `site/js/vendor/` (GSAP 3.15.0, ScrollTrigger, Lenis 1.3.26, auto-hospedados).
Carregamento: depois do `load` + LCP pintado + momento ocioso (teto de 4s), ou na 1ª interação. Sem JS, o site é o estático aprovado.

## Modos e qualidade

| | full + high | full + low | reduced | pausado (botão) |
|---|---|---|---|---|
| Quando | desktop/tablet capaz | saveData, ≤4 GB, ≤4 núcleos ou tela < 768px | `prefers-reduced-motion: reduce` | clique no botão (lembrado no navegador) |
| Entradas | translateY 24px + fade, 0,8s, `power3.out`, defasagem 0,09s | igual | só fade, 0,2s | concluídas na hora |
| Parallax | sim | não | não | congelado na posição |
| Loops | sim, só na tela | não | não | parados |
| Lenis | sim (toque continua nativo) | não | não | desligado (rolagem nativa) |
| Botão de pausa | sim | não (só entradas < 5s) | não | — |

Gatilho das entradas: topo do grupo a 65% da viewport (35% visível), com `clamp()` para o fim da página. Nada com alguma parte na 1ª tela é escondido. Foco do teclado dentro de um grupo pendente revela na hora. Aba oculta e seção fora da tela pausam os loops.

## Inventário

| # | Seção | Elemento | Tipo | Detalhe | Qualidade |
|---|---|---|---|---|---|
| 0 | 01 Hero | **abertura do noren** (CSS, 1ª pintura) | entrada única, 2,5s | fechado no centro → abre ~55% com a barra arrastando → volta balançando até o repouso; foto surge com avanço de câmera (scale 1,14→1); vinheta alivia enquanto aberto; 鮨 carimba (1,75s); nome, local e CTA sobem (1,85–2,15s) | todas, menos reduced |
| 1 | 01 Hero | `.s-hero__foto` | parallax | 0 no topo → +24px no fim do hero; montado só depois da abertura | high |
| 2 | 02 Rodízio | foto | entrada fade + parallax | ±24px, 0 com a caixa centrada | fade: todas · parallax: high |
| 3 | 02 Rodízio | título, nota | entrada | sobe 24px | todas |
| 4 | 03 Cozinha | citação, autoria | entrada | sobe 24px | todas |
| 5 | 03 Cozinha | foto | entrada fade + parallax | só onde a foto é absoluta (≥ 48rem) | fade: todas · parallax: high |
| 6 | 04 Mesa | título + 3 serviços | entrada | sobe 24px, 4 em sequência | todas |
| 7 | 05 Avaliações | nota, fonte, citação | entrada | sobe 24px | todas |
| 8 | 06 Cardápio | nome (e nota do shimeji) por faixa | entrada | cada faixa é um grupo | todas |
| 9 | 06 Cardápio | fotos das faixas | entrada fade | parallax retirado na passada de coerência | todas |
| 10 | 07 Convite | endereço, bairro, link do mapa | entrada | sobe 24px | todas |
| 11 | 07 Convite | 2 borlas das amarras | loop | pouso −10px→0 (`back.out`), balanço ±2,5° de 2,6s e 2,95s (fora de fase) | high, só na tela |
| 12 | 08 Rodapé | CTA WhatsApp, endereço | entrada | sobe 24px | todas |
| 13 | global | botão de pausa | — | fixo, 44px, `aria-pressed` | high |
| 14 | global | links (CSS, já existia) | hover | cor/borda | todas |

## Parado de propósito (regra: superfície cara ou texto por cima)
Painéis do noren (fora a abertura única do hero), cortinas, kanji mascarado, trama de linho, shibori, fundo das faixas; foto da Mesa e foto do salão (texto em cima).

## Rejeitado pelo critério visual
| Efeito | Por quê |
|---|---|
| Balanço contínuo do noren / abertura das cortinas do Convite | superfícies caras: regra do projeto. A abertura do hero é uma **exceção pedida pelo cliente** (uma vez, só transform) |
| Entrada do hero via JS | exigiria esconder conteúdo acima da dobra até o JS; por isso a abertura é CSS puro |
| Contagem 0,0 → 4,8 | recurso de painel genérico; reescreve o texto durante a animação |
| Estrela ou seta do CTA pulsando | chamariz de template, sem correspondente na cena |
| Vapor, brilho, partículas sobre a comida | inventaria algo que as fotos reais não têm |
| Parallax das fotos do cardápio | deixava o Cardápio mais agitado que o resto (3 parallax + loops no mesmo quadro) |

## Orçamento por posição de rolagem (`scripts/motion-orcamento.mjs`)
Teto: 2 loops · 3 parallax · 8 entradas simultâneas.
| Tela | Loops | Parallax | Entradas |
|---|---|---|---|
| 1440x900 | 2 (cardápio→convite) | 2 | 7 (mesa) |
| 2560x1440 | 2 | 3 (hero+rodízio+cozinha) | 7 |
| 1024x768 | 2 | 2 | 8 (mesa) |
