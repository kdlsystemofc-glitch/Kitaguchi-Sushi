# motion-baseline.md — medição antes de qualquer motion

Data: 2026-09-29 · commit de referência: `3e36693` ("responsivo pronto") · site 100% estático, sem JS.

## Auditoria responsiva (`node scripts/audit.mjs`)
17/17 verdes: 2560x1440, 1920x1080, 1440x900, 1366x768, 1280x720, 1024x768, 768x1024, 430x932, 390x844, 360x740, 320x568, 844x390, zoom de texto 200% (1280 e 390), sem fontes (1440 e 390), reduced-motion + dark (390).

## Lighthouse mobile (`node scripts/lh.mjs baseline 3`, servidor Node local, mediana de 3)

| Métrica | Valor |
|---|---|
| Performance | **78** (execuções: 76, 78, 78) |
| Acessibilidade / Boas práticas / SEO | 100 / 100 / 100 |
| FCP | 3,30 s |
| LCP | 4,35 s |
| TBT | 0 ms |
| CLS | 0 |
| Speed Index | 3,30 s |

Observação: o Speed Index de 16,3 s relatado na passada responsiva era artefato do `python -m http.server`. Com o servidor Node do `lh.mjs` ele fica em 3,3 s. Todas as comparações de motion usam o `lh.mjs`.

**Orçamento de motion:** Performance mediana ≥ 75 em cada fase (queda máxima de 3 pontos); TBT e CLS continuam 0.

## Referência visual estática
`node scripts/ref.mjs` compara a página inteira com `?motion=off` contra `screenshots/ref/aprovado-{1440,390}.png` (capturadas neste commit). Limite: 0,5 % de pixels diferentes.
