# ROTEIRO-APARELHO-REAL.md — teste em iPhone e Android

Os testes automáticos rodam em Chromium e WebKit emulados (`npm test`, `npm run test:webkit`). O WebKit do Playwright é o motor do Safari, mas não é o Safari do iPhone. Este roteiro cobre o que só um aparelho confirma.

**Como abrir no celular:** publicar numa URL de teste (qualquer hospedagem estática, pasta `site/`) ou servir na rede local (`npx serve site`, abrir `http://IP-DO-PC:3000` no celular). Por `file://` no celular não funciona bem.

**Aparelhos mínimos:** 1 iPhone com iOS atual (Safari) · 1 Android intermediário (Chrome) · se possível, 1 Samsung com Samsung Internet e 1 iPad.

Marque ✅/❌ e anote modelo, sistema e navegador.

## 1. Abertura do hero (noren)
- [ ] Ao carregar, o noren abre com fluidez (sem travadas), a foto surge atrás e o noren volta balançando até parar.
- [ ] O 鮨 "carimba" e o nome, o endereço e o WhatsApp aparecem (~2s).
- [ ] Recarregar 3×: a abertura é igual em todas.
- [ ] iPhone: a altura do hero não pula quando a barra de endereço aparece/some ao rolar (`svh`).
- [ ] Celular deitado: hero legível, nada cortado.

## 2. Rolagem e movimento
- [ ] Rolar a página inteira devagar e rápido: textos entram de baixo para cima, sem sumir nem ficar invisível.
- [ ] Pular direto para o fim (arrastar a barra) e voltar: nenhum texto fica invisível.
- [ ] Android intermediário: rolagem sem engasgos, principalmente em Avaliações (shibori) e Convite (cortinas).
- [ ] Borlas das cortinas: no celular elas **não** balançam (qualidade "low"); num iPad/tablet grande podem balançar.
- [ ] **Movimento reduzido** (iOS: Ajustes › Acessibilidade › Movimento › Reduzir Movimento; Android: Acessibilidade › Remover animações): o hero já aparece aberto, sem abertura, e os textos só fazem fade curto.

## 3. Texto e toque
- [ ] **Texto grande** (iOS: Ajustes › Tela e Brilho › Tamanho do Texto no máximo; Android: Fonte no máximo): nada cortado, nada sobreposto, sem rolagem lateral.
- [ ] Zoom com pinça até 200%: dá para ler tudo.
- [ ] Todos os links e botões são fáceis de tocar (WhatsApp do hero, "Abrir no mapa", "Fale no WhatsApp", telefone).
- [ ] Fontes: títulos em serifa elegante (Cormorant) e texto em serifa de livro (Source Serif). Se aparecer Times/Georgia, anotar.

## 4. Links
- [ ] WhatsApp (hero e rodapé): abre o app na conversa com (11) 96151-5506.
- [ ] Telefone do rodapé: abre o discador.
- [ ] "Abrir no mapa": abre o Google Maps (ou Apple Maps) no Kitaguchi Sushi, Av. Itamarati, 1122.
- [ ] Se preenchidos: Cardápio, Pedir on-line e Instagram abrem os endereços certos.

## 5. Cores e aparência
- [ ] **Modo escuro do sistema** ligado: o site mantém as cores (índigo e linho), sem inversão.
- [ ] Samsung Internet com modo escuro: idem (é o navegador que mais força inversão).
- [ ] Brilho no mínimo: textos claros sobre índigo continuam legíveis.
- [ ] Celular com notch deitado: conteúdo não fica escondido atrás do recorte.

## 6. Compartilhamento e ícones (depois de ter domínio)
- [ ] Enviar o link no WhatsApp: aparece a prévia com o noren, "Kitaguchi Sushi" e o endereço.
- [ ] iPhone: "Adicionar à Tela de Início" mostra o ícone oficial Kitaguchi Sushi.
- [ ] Android Chrome: o ícone no menu e na tela inicial é o ícone do Kitaguchi Sushi.
- [ ] Aba do navegador mostra o favicon do Kitaguchi Sushi.

## 7. Rede lenta
- [ ] Chrome desktop apontado para o celular (DevTools › Remote devices) ou o próprio celular em 3G: o hero aparece rápido; as fontes podem trocar de fallback para a final, mas o texto do hero só surge aos ~2s, então a troca não deve ser visível.
- [ ] Modo avião no meio da navegação: nada quebra (o que já carregou continua).

## 8. Pausa das animações (tablet/desktop)
- [ ] Botão redondo no canto inferior direito pausa e retoma (ícone muda).
- [ ] Recarregar com a pausa ligada: o hero já aparece aberto.

## Registro
| Aparelho | Sistema / navegador | Itens com ❌ | Observação |
|---|---|---|---|
| | | | |
