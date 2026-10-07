# Regras do projeto

- Os arquivos em /design são REFERÊNCIA VISUAL. NUNCA usar como <img>,
  background-image, ou qualquer parte do site.
- Todo texto é HTML real. Nenhum texto dentro de imagem. Nenhum texto
  do mockup (placeholder, lorem ipsum, slogan inventado) vira texto
  final — sempre dado real do CLIENTE.md, ou marcado como pendência
  explícita e comentada no código.
- Toda imagem vem de /site/assets: fotos REAIS do cliente (de
  /IMAGENS) ou plates gerados de /design/plates.

REGRA DE OURO — o que é real e o que é gerado:
- Comida, fachada, salão, pessoas, produto, logo: SEMPRE fotos reais
  do cliente, nunca inventadas do zero por IA. Pode recortar, limpar
  texto/marca d'água sobreposta, ou ampliar resolução por IA a partir
  do arquivo real — nunca gerar um substituto novo.
- Elementos decorativos/abstratos (formas, texturas, brilhos,
  partículas, fumaça, faixas): podem ser CSS/SVG puro (preferível) ou
  gerados por IA, contanto que não representem algo específico do
  cliente que não existe de verdade.
- Toda imagem recriada/ampliada por IA a partir de um original real
  fica marcada em assets.md com a nota "recriada por IA — confirmar
  com o cliente antes de publicar".

- Cores, fontes, espaçamentos: só via variáveis CSS do DESIGN.md.
- Mobile-first, unidades fluidas (clamp), sem largura fixa em px.
- Proibido: fonte Inter/Roboto/Arial, sombras padrão, cards genéricos,
  gradiente roxo genérico. Se o mockup mostra outra coisa, seguir o
  mockup.
- Ambiguidade de conteúdo (preço, horário, inclusões, autorizações):
  nunca inventar. Resolver com dado real do CLIENTE.md, ou construir
  com placeholder comentado e listar como pendência do cliente.
- Ambiguidade de decisão técnica/criativa sem impacto factual (ex.:
  tamanho de um espaçamento, escolha entre 2 fontes candidatas): decidir
  sozinho, com justificativa registrada no DESIGN.md, sem parar para
  perguntar.
- Ao terminar cada seção: screenshot da SEÇÃO e da PÁGINA INTEIRA
  (checar a costura/transição com a seção anterior), comparar com a
  referência, corrigir em até 3 rodadas. Se não fechar em 3 rodadas,
  registrar o que falhou e seguir para a próxima seção, sem travar o
  restante do site.
- Qualquer elemento decorativo contínuo/caro (ex. uma faixa, textura
  ou filtro pesado que atravessa várias seções): ele NÃO se move na
  fase de motion, e nada nele pode ganhar transform/filter/opacity<1
  em nenhum ancestral. Só transform/opacity nas camadas-folha. Nada
  acima da dobra depende de JS para aparecer — motion carrega depois
  do load.
- PUSH: use somente a variável de ambiente do token (ex. GH_TOKEN). Se
  ela não existir, faça só o commit e avise. NUNCA procure token em
  logs de sessão e NUNCA use um token que tenha sido colado no chat.
  Se isso acontecer por engano, avise imediatamente para revogação.
- Mantenha PROGRESSO.md atualizado ao fim de cada etapa grande (o que
  foi feito, commit, o que falta), para permitir retomar de onde parou.