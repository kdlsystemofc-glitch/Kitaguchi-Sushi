// Build: src/ → site/
//   - CSS: fontes + tokens + base + seções. Crítico (fontes, tokens, base, hero, rodízio) inline
//     no <head>; o resto em css/site.min.css, carregado sem bloquear a renderização.
//   - Minificação CONSERVADORA: tira comentários e espaços, nada mais. Não funde nem reescreve
//     declarações, então os fallbacks duplicados (100vh→100svh, hidden→clip, font-size→min())
//     continuam lá para navegador antigo.
//   - JS próprio minificado com terser; referências com ?v=<hash> para cache longo.
//   - Preload de fontes só em http(s) (em file:// o preload com crossorigin dá erro de CORS).
// Uso: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { minify } from 'terser';
import { aplicarCliente } from './cliente.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'src'), SITE = resolve(ROOT, 'site');
const ler = f => readFileSync(resolve(SRC, f), 'utf8');
const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 8);
const hashArq = f => hash(readFileSync(resolve(SITE, f)));

function minCSS(css) {
  let out = '', i = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '"' || c === "'") {                       // strings (inclui data: URIs) intocadas
      let j = i + 1;
      while (j < css.length && css[j] !== c) j += css[j] === '\\' ? 2 : 1;
      out += css.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '/' && css[i + 1] === '*') { const j = css.indexOf('*/', i + 2); i = j < 0 ? css.length : j + 2; continue; }
    if (/\s/.test(c)) {
      let j = i; while (j < css.length && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1], next = css[j];
      if (!(prev === undefined || '{};,:>'.includes(prev) || '{};,>'.includes(next))) out += ' ';
      i = j; continue;
    }
    out += c; i++;
  }
  return out.replace(/;}/g, '}');
}

// ── CSS ───────────────────────────────────────────────────────────────
const secoes = ler('css/secoes.css');
const CORTE = secoes.indexOf('/* ═══ 03 · COZINHA');
if (CORTE < 0) throw new Error('marcador da seção 03 não encontrado em secoes.css');
const critico = minCSS(ler('css/fontes.css') + ler('css/tokens.css') + ler('css/base.css') + secoes.slice(0, CORTE));
const resto = minCSS(secoes.slice(CORTE));
mkdirSync(resolve(SITE, 'css'), { recursive: true });
writeFileSync(resolve(SITE, 'css/site.min.css'), resto);

// ── JS ────────────────────────────────────────────────────────────────
mkdirSync(resolve(SITE, 'js'), { recursive: true });
const opts = { compress: { passes: 2 }, mangle: true, format: { comments: false } };
const motion = (await minify(ler('js/motion.js'), opts)).code;
writeFileSync(resolve(SITE, 'js/motion.min.js'), motion);
let boot = ler('js/motion-boot.js');
for (const v of ['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/lenis.min.js'])
  boot = boot.replace(`'${v}'`, `'${v}?v=${hashArq('js/' + v)}'`);
boot = boot.replace("'motion.js'", `'motion.min.js?v=${hash(motion)}'`);
if (!boot.includes('motion.min.js?v=')) throw new Error('referência a motion.js não encontrada no boot');
const bootMin = (await minify(boot, opts)).code;
writeFileSync(resolve(SITE, 'js/motion-boot.min.js'), bootMin);

// ── HTML ──────────────────────────────────────────────────────────────
// Preload das 3 fontes acima da dobra (Cormorant: nome; Source Serif: local e CTA; Shippori: 鮨).
// Medido: sem preload elas entram numa cadeia HTML → CSS → layout → fonte e o FCP simulado
// sobe de 1,2 s para 2,1 s. Só em http(s): em file:// o preload com crossorigin dá erro de CORS.
const FONTES_PRELOAD = ['fonts/cormorant-garamond-latin.woff2', 'fonts/source-serif-4-latin.woff2', 'fonts/shippori-mincho-sushi.woff2'];
const FONTES = ['fonts/cormorant-garamond-latin.woff2', 'fonts/source-serif-4-latin.woff2', 'fonts/shippori-mincho-sushi.woff2'];
const cssHref = `css/site.min.css?v=${hash(resto)}`;
const inlineJS = (await minify(`(function(){
  var d=document,h=d.head;
  // preload de fontes só em http(s)
  if(location.protocol!=='file:'){${JSON.stringify(FONTES_PRELOAD)}.forEach(function(f){var l=d.createElement('link');l.rel='preload';l.as='font';l.type='font/woff2';l.crossOrigin='anonymous';l.href=f;h.appendChild(l);});}
  // navegador sem suporte a rel=preload: carrega o CSS restante do jeito clássico
  var t=d.createElement('link');if(!(t.relList&&t.relList.supports&&t.relList.supports('preload'))){t.rel='stylesheet';t.href=${JSON.stringify(cssHref)};h.appendChild(t);}
  // quem pausou as animações (botão, lembrado no navegador) não revê a abertura do noren ao recarregar
  try{if(localStorage.getItem('kitaguchi-motion-pausado')==='1')d.documentElement.classList.add('sem-abertura');}catch(e){}
  // manifest só em http(s): em file:// o Chrome bloqueia o fetch (CORS) e registra erro no console
  if(location.protocol!=='file:'){var m=d.createElement('link');m.rel='manifest';m.href='site.webmanifest';h.appendChild(m);}
})();`, opts)).code;

// ── Dados do cliente (cliente.config.json) + SEO local ──────────────────
// CLIENTE_CONFIG=outro.json permite testar o build com dados de exemplo sem tocar no arquivo real.
const cliCfgPath = resolve(ROOT, process.env.CLIENTE_CONFIG || 'cliente.config.json');
const cliCfg = JSON.parse(readFileSync(cliCfgPath, 'utf8'));
const DOM = cliCfg.dominio ? String(cliCfg.dominio).replace(/\/+$/, '') : null;
if (DOM && !/^https:\/\/[^/]+$/.test(DOM)) throw new Error('cliente.config.json: "dominio" deve ser https://host, sem caminho');
const cli = aplicarCliente(ler('index.html'), cliCfg, { ROOT, SITE });
if (!DOM) cli.pend.unshift('dominio (canonical, og:url/og:image, sitemap, robots)');
const abs = p => `${DOM}/${p}`;
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const SEO = {
  nome: cli.nome,
  titulo: `${cli.nome} — Restaurante japonês em Santo André`,
  descricao: 'Restaurante japonês na Av. Itamarati, 1122, Vila Curuçá, Santo André - SP. Sushi fresco, temaki recheado, refeição no local, retirada e entrega.',
  ogImagem: 'assets/og-kitaguchi-sushi.jpg',
  ogAlt: `Noren índigo com o kanji 鮨 e o nome ${cli.nome}, Vila Curuçá, Santo André - SP`,
  lat: -23.6338, lng: -46.5162,
  mapa: 'https://www.google.com/maps/search/?api=1&query=Kitaguchi%20Sushi%2C%20Av.%20Itamarati%2C%201122%20-%20Vila%20Curu%C3%A7%C3%A1%2C%20Santo%20Andr%C3%A9%20-%20SP'
};
const jsonld = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: SEO.nome,
  servesCuisine: 'Japonesa',
  address: { '@type': 'PostalAddress', streetAddress: 'Av. Itamarati, 1122 - Vila Curuçá', addressLocality: 'Santo André', addressRegion: 'SP', postalCode: '09290-730', addressCountry: 'BR' },
  geo: { '@type': 'GeoCoordinates', latitude: SEO.lat, longitude: SEO.lng },
  hasMap: SEO.mapa,
  telephone: '+55 11 96151-5506',
  amenityFeature: ['Refeição no local', 'Retirada na porta', 'Entrega sem contato'].map(n => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
  ...cli.ld,
  ...(DOM ? { url: abs(''), image: abs(SEO.ogImagem), ...(cli.logoLD ? { logo: abs(cli.logoLD) } : {}) } : {})
};
const ldFalta = [
  !cli.ld.priceRange && 'priceRange (Google: "R$ 80–100 por pessoa", informado por usuários, não é preço oficial)',
  !cli.ld.openingHoursSpecification && 'openingHoursSpecification (só "fecha 15:30 · reabre 18:30" de um único dia)',
  !('acceptsReservations' in cli.ld) && 'acceptsReservations',
  !cli.ld.hasMenu && 'hasMenu',
  !cli.ld.sameAs && 'sameAs (Instagram)',
  !cli.logoLD && 'logo',
  !cliCfg.nome?.oficial && 'nome.oficial'
].filter(Boolean);
const seoDependeDominio = [
  `<link rel="canonical" href="${DOM ? abs('') : 'https://SEU-DOMINIO/'}">`,
  `<meta property="og:url" content="${DOM ? abs('') : 'https://SEU-DOMINIO/'}">`,
  `<meta property="og:image" content="${DOM ? abs(SEO.ogImagem) : 'https://SEU-DOMINIO/' + SEO.ogImagem}">`,
  `<meta property="og:image:width" content="1200">`,
  `<meta property="og:image:height" content="630">`,
  `<meta property="og:image:type" content="image/jpeg">`,
  `<meta property="og:image:alt" content="${esc(SEO.ogAlt)}">`,
  `<meta name="twitter:image" content="${DOM ? abs(SEO.ogImagem) : 'https://SEU-DOMINIO/' + SEO.ogImagem}">`,
  `<meta name="twitter:image:alt" content="${esc(SEO.ogAlt)}">`
];
const seoHead = [
  ...(DOM ? seoDependeDominio : [`<!-- Aguardando o domínio (cliente.config.json → "dominio"). Rodar node scripts/build.mjs depois de preencher:\n${seoDependeDominio.map(l => '  ' + l.replace(/--/g, '&#45;&#45;')).join('\n')}\n-->`]),
  `<meta property="og:type" content="website">`,
  `<meta property="og:locale" content="pt_BR">`,
  `<meta property="og:site_name" content="${esc(SEO.nome)}">`,
  `<meta property="og:title" content="${esc(SEO.titulo)}">`,
  `<meta property="og:description" content="${esc(SEO.descricao)}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="${esc(SEO.titulo)}">`,
  `<meta name="twitter:description" content="${esc(SEO.descricao)}">`,
  `<meta name="geo.region" content="BR-SP">`,
  `<meta name="geo.placename" content="Santo André">`,
  `<meta name="geo.position" content="${SEO.lat};${SEO.lng}">`,
  `<meta name="ICBM" content="${SEO.lat}, ${SEO.lng}">`,
  `<link rel="icon" href="favicon.ico" sizes="48x48">`,
  `<link rel="icon" type="image/png" sizes="32x32" href="icons/icon-32.png">`,
  `<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">`,
  `<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">`,
  `<!-- JSON-LD: só dado confirmado (CLIENTE.md + cliente.config.json).${ldFalta.length ? `
  Ainda NÃO publicados (preencher cliente.config.json): ${ldFalta.join(' · ')}.` : ''}
  aggregateRating: omitido de propósito (avaliações de terceiros não se marcam no próprio site). -->`,
  `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`
].join('\n');

// robots, sitemap, manifest
writeFileSync(resolve(SITE, 'robots.txt'), `User-agent: *\nAllow: /\n\n${DOM ? `Sitemap: ${abs('sitemap.xml')}` : '# Sitemap: https://SEU-DOMINIO/sitemap.xml   (ativa sozinho quando cliente.config.json tiver o domínio)'}\n`);
writeFileSync(resolve(SITE, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${DOM
  ? `  <url>\n    <loc>${abs('')}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n  </url>\n`
  : '  <!-- Sem URL até existir o domínio (cliente.config.json). O sitemap exige endereço absoluto. -->\n'}</urlset>\n`);
writeFileSync(resolve(SITE, 'site.webmanifest'), JSON.stringify({
  name: `${cli.nome} — Restaurante japonês`, short_name: cli.nome, lang: 'pt-BR',
  start_url: './', scope: './', display: 'browser',
  background_color: '#061626', theme_color: '#0A1D31',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');
const head = [
  `<script>${inlineJS}</script>`,
  `<style>${critico}</style>`,
  `<link rel="preload" href="${cssHref}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
  `<noscript><link rel="stylesheet" href="${cssHref}"></noscript>`,
  `<script src="js/motion-boot.min.js?v=${hash(bootMin)}" defer></script>`
].join('\n');
const html = cli.html.replace(/<!-- build:head[^>]*-->/, () => head).replace(/<!-- build:seo[^>]*-->/, () => seoHead);
if (/build:(head|seo)/.test(html)) throw new Error('marcador build:head/build:seo não substituído');
writeFileSync(resolve(SITE, 'index.html'), html);

// ── Relatório de peso ─────────────────────────────────────────────────
const kb = n => (n / 1024).toFixed(1) + ' KiB';
const linha = (nome, s, orig) => console.log(`${nome.padEnd(34)} ${kb(Buffer.byteLength(s)).padStart(10)}  gzip ${kb(gzipSync(s).length).padStart(9)}${orig ? `   (fonte ${kb(Buffer.byteLength(orig))})` : ''}`);
linha('index.html (com CSS crítico inline)', html);
linha('  └ CSS crítico inline', critico);
linha('css/site.min.css', resto, secoes.slice(CORTE));
linha('js/motion-boot.min.js', bootMin, ler('js/motion-boot.js'));
linha('js/motion.min.js', motion, ler('js/motion.js'));
for (const v of ['gsap.min.js', 'ScrollTrigger.min.js', 'lenis.min.js']) linha(`js/vendor/${v}`, readFileSync(resolve(SITE, 'js/vendor', v)));
for (const f of FONTES) console.log(`${f.padEnd(34)} ${kb(statSync(resolve(SITE, f)).size).padStart(10)}  (woff2, já comprimido)`);

// ── Pendências do cliente ─────────────────────────────────────────────
const lista = cli.pend.map(p => `  - ${p}`).join('\n');
console.log(cli.pend.length
  ? `\nPENDÊNCIAS DO CLIENTE (${cli.pend.length}) — NÃO publicar enquanto houver itens que bloqueiam:\n${lista}`
  : '\nSem pendências do cliente.');
