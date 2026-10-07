# otimizacao-baseline.md — antes da otimização

Data: 2026-09-30 · commit `c8a5611` (motion pronto + abertura do noren) · `node scripts/lh.mjs otim-base 5` (Lighthouse 12 mobile, servidor Node local sem compressão, mediana de 5).

| Métrica | Valor |
|---|---|
| Performance | **78** (73, 78, 76, 78, 78) |
| Acessibilidade / Boas práticas / SEO | 100 / 100 / 100 |
| FCP | 3,25 s |
| LCP | 4,38 s (elemento: painel esquerdo do noren; 88% é "render delay") |
| TBT / CLS | 0 ms / 0 |
| Speed Index | 3,28 s |
| Peso total | 795 KiB |

## Oportunidades apontadas
| Item | Economia estimada |
|---|---|
| Recursos que bloqueiam a renderização: 2 CSS do Google Fonts (845 + 154 ms, outra origem) + tokens.css, base.css, secoes.css (158 + 308 + 608 ms) | ~2.080 ms |
| Imagens maiores que o exibido no celular: sobremesa 69 KiB, temaki 45, cozinha 36, nigiri 24, rodízio 14 | 188 KiB |
| CSS sem minificar (secoes.css) | 5 KiB |
| JS sem minificar (motion.js) | 5 KiB |

## Maiores arquivos
Source Serif 4 variável (Google, woff2) 119 KiB · hero-barca 79 · sobremesa 78 · mesa 72 · gsap 71 · cozinha 67 · temaki 52 · ScrollTrigger 44 · rodízio 42 · salão 40.

## O que não pode mudar
Nada visual (referência `screenshots/ref/aprovado-*.png`, tolerância 0,5%), tempos de motion, file://, progressive enhancement, fallbacks para navegador antigo, auditoria 17/17, testes de motion.
