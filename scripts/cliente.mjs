// Aplica cliente.config.json ao HTML e ao JSON-LD. Com todos os campos null o resultado é o
// site atual (pendências viram comentários <!-- PENDÊNCIA-CLIENTE --> no HTML gerado).
// Usado por scripts/build.mjs.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const TEL = '+5511961515506', TEL_TXT = '(11) 96151-5506', WA = 'https://wa.me/5511961515506';
const DIAS = { Mo: 'Seg', Tu: 'Ter', We: 'Qua', Th: 'Qui', Fr: 'Sex', Sa: 'Sáb', Su: 'Dom' };
const ORDEM = Object.keys(DIAS);
const DIAS_SCHEMA = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hora = h => h.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');

function faixaDias(dias) {
  const idx = [...new Set(dias)].map(d => { if (!(d in DIAS)) throw new Error(`horarios: dia inválido "${d}" (use ${ORDEM.join(' ')})`); return ORDEM.indexOf(d); }).sort((a, b) => a - b);
  const grupos = []; let ini = idx[0], ant = idx[0];
  for (const i of idx.slice(1).concat(99)) { if (i !== ant + 1) { grupos.push(ini === ant ? DIAS[ORDEM[ini]] : `${DIAS[ORDEM[ini]]} a ${DIAS[ORDEM[ant]]}`); ini = i; } ant = i; }
  return grupos.join(', ');
}
function textoHorarios(hs) {
  const porDias = new Map();
  for (const h of hs) {
    if (!/^\d{2}:\d{2}$/.test(h.abre) || !/^\d{2}:\d{2}$/.test(h.fecha)) throw new Error('horarios: use "HH:MM" em abre/fecha');
    const k = faixaDias(h.dias); porDias.set(k, [...(porDias.get(k) || []), `${hora(h.abre)}–${hora(h.fecha)}`]);
  }
  return [...porDias].map(([d, t]) => `${d} · ${t.join(' e ')}`);
}

export function aplicarCliente(html, cfg, { ROOT, SITE }) {
  const pend = [];
  const nome = cfg.nome?.oficial || 'Kitaguchi Sushi';
  if (!cfg.nome?.oficial) pend.push('nome.oficial — usando "Kitaguchi Sushi"');
  const [n1, ...nResto] = nome.split(' ');
  const r = (a, b) => { if (!html.includes(a)) throw new Error(`marcador ausente no src/index.html: ${a}`); html = html.split(a).join(b); };

  r('{{nome-h1}}', `<span>${esc(n1)}</span> <span>${esc(nResto.join(' '))}</span>`);
  r('{{nome}}', esc(nome));

  // WhatsApp / telefone
  const ehWa = cfg.whatsapp?.numeroEhWhatsapp, reserva = cfg.whatsapp?.aceitaReserva;
  if (ehWa == null) pend.push('whatsapp.numeroEhWhatsapp — botões apontam para wa.me sem confirmação');
  if (reserva == null) pend.push('whatsapp.aceitaReserva');
  const hrefCTA = ehWa === false ? `tel:${TEL}` : WA;
  const avisoWa = ehWa == null ? `<!-- PENDÊNCIA-CLIENTE: confirmar que ${TEL_TXT} é WhatsApp (cliente.config.json → whatsapp). -->\n        ` : '';
  r('<!-- cliente:cta-hero -->', `${avisoWa}<a class="rotulo noren__cta" href="${hrefCTA}">${ehWa === false ? 'Ligar' : 'WhatsApp'} <span aria-hidden="true">→</span></a>`);
  const txtRodape = ehWa === false ? `Ligue ${TEL_TXT}` : reserva === true ? 'Reserve pelo WhatsApp' : 'Fale no WhatsApp';
  const avisoRes = (ehWa == null || reserva == null) ? `<!-- PENDÊNCIA-CLIENTE: WhatsApp e reserva (o mockup dizia "Reserve"); cliente.config.json → whatsapp. -->\n    ` : '';
  r('<!-- cliente:cta-rodape -->', `${avisoRes}<a class="s-rodape__cta" data-reveal href="${hrefCTA}">${txtRodape} <span aria-hidden="true">→</span></a>`);

  // Preço do rodízio
  const preco = cfg.rodizio?.precoTexto;
  if (!preco) pend.push('rodizio.precoTexto (e o que inclui)');
  if (!cfg.rodizio?.priceRange) pend.push('rodizio.priceRange (JSON-LD)');
  r('<!-- cliente:preco -->', preco
    ? `<p class="s-rodizio__preco" data-reveal>${esc(preco)}</p>`
    : `<!-- PENDÊNCIA-CLIENTE: valor oficial do rodízio (almoço/jantar/fim de semana) e o que inclui.
             O Google mostra "R$ 80–100 por pessoa" informado por usuários: não é preço oficial, não publicar. -->`);

  // Avaliações
  const comNome = cfg.autorizacoes?.citarAvaliacoesComNome;
  if (comNome == null) pend.push('autorizacoes.citarAvaliacoesComNome — citações mostram o primeiro nome sem autorização');
  html = html.replace(/\{\{autoria:([^}]+)\}\}/g, (_, n) => comNome === false ? 'Avaliação no Google' : `${esc(n)}, avaliação no Google`);
  r('<!-- cliente:aviso-avaliacoes -->', comNome == null ? '<!-- PENDÊNCIA-CLIENTE: autorização para citar avaliações do Google com o primeiro nome do autor. -->' : '');
  if (cfg.autorizacoes?.fotos !== true) pend.push('autorizacoes.fotos — direito de uso das fotos (BLOQUEIA a publicação)');

  // Pratos
  const pratos = cfg.pratos || {};
  const pratoPend = Object.entries(pratos).filter(([k, v]) => !k.startsWith('_') && v == null).map(([k]) => k);
  for (const [prato, v] of Object.entries(pratos)) {
    if (prato.startsWith('_') || v !== false) continue;
    const re = new RegExp(`\\s*<li class="prato[^"]*"[^>]*>(?:(?!</li>)[\\s\\S])*?>${prato.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h3>[\\s\\S]*?</li>`);
    if (!re.test(html)) throw new Error(`pratos: faixa "${prato}" não encontrada`);
    html = html.replace(re, '');
  }
  if (pratoPend.length) pend.push(`pratos a confirmar: ${pratoPend.join(', ')}`);
  r('<!-- cliente:aviso-pratos -->', pratoPend.length ? '<!-- PENDÊNCIA-CLIENTE: confirmar nomes dos pratos e se fazem parte do rodízio (cliente.config.json → pratos). -->' : '');
  if (html.includes('prato--sem-foto')) pend.push('foto do shimeji (faixa só com texto)');

  // Logo
  let logoLD = null;
  if (cfg.logoVetor) {
    const src = resolve(ROOT, cfg.logoVetor);
    if (!existsSync(src) || extname(src).toLowerCase() !== '.svg') throw new Error(`logoVetor: ${cfg.logoVetor} não existe ou não é .svg`);
    mkdirSync(resolve(SITE, 'assets'), { recursive: true });
    copyFileSync(src, resolve(SITE, 'assets/logo.svg'));
    r('{{logo-rodape}}', `<img class="s-rodape__logo" src="assets/logo.svg" width="150" height="150" loading="lazy" alt="Logo ${esc(nome)}">`);
    logoLD = 'assets/logo.svg';
  } else {
    r('{{logo-rodape}}', '<img class="s-rodape__logo" src="assets/logo-150.png" width="150" height="150" loading="lazy" alt="Logo Kitaguchi Sushi">');
  }

  // Rodapé: horário e links
  const hs = cfg.horarios;
  if (!hs) pend.push('horarios (por dia da semana)');
  const L = cfg.links || {};
  for (const k of ['cardapio', 'pedidoOnline', 'instagram']) {
    if (!L[k]) pend.push(`links.${k}`);
    else if (!/^https:\/\//.test(L[k])) throw new Error(`links.${k} deve começar com https://`);
  }
  const extra = [];
  if (hs) extra.push(`<p class="rotulo s-rodape__horario" data-reveal>${textoHorarios(hs).map(esc).join('<br>')}</p>`);
  const links = [[L.cardapio, 'Cardápio'], [L.pedidoOnline, 'Pedir on-line'], [L.instagram, 'Instagram']].filter(([u]) => u);
  if (links.length) extra.push(`<ul class="rotulo s-rodape__links" role="list" data-reveal>${links.map(([u, t]) => `<li><a href="${esc(u)}" rel="noopener">${t}</a></li>`).join('')}</ul>`);
  const faltaRodape = [!hs && 'horário de funcionamento', !L.instagram && 'Instagram', !L.pedidoOnline && 'link do pedido on-line', !L.cardapio && 'link do cardápio'].filter(Boolean);
  r('<!-- cliente:rodape-extra -->', [
    ...extra,
    ...(faltaRodape.length ? [`<!-- PENDÊNCIA-CLIENTE: ${faltaRodape.join(', ')} (cliente.config.json). -->`] : [])
  ].join('\n    '));

  if (/\{\{[^}]*\}\}|cliente:/.test(html)) throw new Error('marcador de cliente não substituído: ' + html.match(/\{\{[^}]*\}\}|<!-- cliente:[^>]*-->/)[0]);

  // JSON-LD
  const ld = {};
  if (cfg.nome?.oficial && cfg.nome.oficial !== 'Kitaguchi Sushi') ld.alternateName = 'Kitaguchi Sushi';
  if (cfg.rodizio?.priceRange) ld.priceRange = cfg.rodizio.priceRange;
  if (reserva != null) ld.acceptsReservations = reserva;
  if (L.cardapio) ld.hasMenu = L.cardapio;
  if (L.instagram) ld.sameAs = [L.instagram];
  if (hs) ld.openingHoursSpecification = hs.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.dias.map(d => DIAS_SCHEMA[d]), opens: h.abre, closes: h.fecha }));
  return { html, nome, ld, logoLD, pend };
}
