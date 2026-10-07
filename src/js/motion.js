/* Motion — núcleo. Carregado por motion-boot.js depois do load / 1ª interação.

   Atributos:
   data-reveal            entrada: translateY(24px) + fade (full) | só fade 200ms (reduced)
   data-reveal="fade"     entrada só com fade (fotos com parallax)
   data-reveal-group      agrupa e defasa as entradas; sem ele o grupo é a <section>/<header>/<footer>
   data-parallax="0.08"   parallax de foto (img absoluta, object-fit: cover). Máx. 24px. Só full+high.
   data-parallax-mode="top"  deslocamento 0 no topo da página (hero); padrão: 0 com a caixa centrada
   data-loop="balanco"    loop contínuo sutil. Só full+high, só na tela, pausa com aba oculta.

   Regras: só transform/opacity, só em camadas-folha. Superfícies texturizadas (noren,
   cortinas, trama, shibori, kanji mascarado) nunca recebem atributo de motion.
   Nada é escondido se já estiver na tela ou acima dela quando o motion inicia. */
(function () {
  'use strict';
  var cfg = window.__MOTION_CFG;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!cfg || !gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var full = cfg.mode === 'full';
  var high = cfg.quality === 'high';
  var html = document.documentElement;
  html.classList.add('motion-on', 'motion-' + cfg.mode, 'q-' + cfg.quality);

  var LIMIAR = 0.65;          // grupo entra quando seu topo passa 65% da viewport (35% visível)
  var PARALLAX_MAX = 24;      // px
  var estado = { pausado: false, oculto: false, reveals: [], parallax: [], loops: [] };

  /* ── Lenis (só full + high; toque continua nativo) ─────────────── */
  var lenis = null;
  function criarLenis() {
    if (!(full && high && window.Lenis)) return;
    lenis = new window.Lenis({ lerp: 0.12, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.add(function (t) { if (lenis) lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  criarLenis();

  /* ── Entradas ──────────────────────────────────────────────────── */
  var grupos = new Map();
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var g = el.closest('[data-reveal-group]') || el.closest('section, header, footer') || document.body;
    if (!grupos.has(g)) grupos.set(g, []);
    grupos.get(g).push(el);
  });

  function estadoInicial(el) {
    return (full && el.dataset.reveal !== 'fade') ? { opacity: 0, y: 24 } : { opacity: 0 };
  }
  function concluir(r, animar) {
    if (r.feito) return;
    r.feito = true;
    if (r.st) r.st.kill();
    if (!animar) { gsap.killTweensOf(r.els); gsap.set(r.els, { clearProps: 'opacity,transform' }); return; }
    r.tween = gsap.to(r.els, {
      opacity: 1, y: 0,
      duration: full ? 0.8 : 0.2,
      ease: full ? 'power3.out' : 'none',
      stagger: full ? 0.09 : 0,
      clearProps: 'opacity,transform'   // estado final = página estática aprovada
    });
  }

  var vh = window.innerHeight;
  grupos.forEach(function (els, g) {
    var topo = g.getBoundingClientRect().top;
    if (topo < vh * LIMIAR) return;           // grupo já na tela ou acima: nunca esconder
    // e, dentro do grupo, nada que já tenha alguma parte visível na 1ª tela
    els = els.filter(function (el) { return el.getBoundingClientRect().top >= vh; });
    if (!els.length) return;
    els.forEach(function (el) { gsap.set(el, estadoInicial(el)); });
    var r = { els: els, grupo: g, feito: false };
    r.st = ScrollTrigger.create({
      // clamp(): grupos no fim da página (rodapé) que nunca chegam a 65% disparam no fim da rolagem
      trigger: g, start: 'clamp(top ' + (LIMIAR * 100) + '%)', once: true,
      onEnter: function () { concluir(r, !estado.pausado); }
    });
    estado.reveals.push(r);
  });

  // teclado: foco dentro de um grupo ainda escondido revela na hora
  document.addEventListener('focusin', function (e) {
    estado.reveals.forEach(function (r) { if (!r.feito && r.grupo.contains(e.target)) concluir(r, false); });
  });

  /* ── Parallax (só full + high) ─────────────────────────────────── */
  function montarParallax(img) {
    var p = { img: img, st: null, tween: null };
    p.montar = function () {
      if (p.tween) { p.tween.scrollTrigger && p.tween.scrollTrigger.kill(); p.tween.kill(); }
      img.style.removeProperty('inset'); img.style.removeProperty('height'); img.style.removeProperty('object-position');
      gsap.set(img, { clearProps: 'transform' });
      var cs = getComputedStyle(img);
      if (cs.position !== 'absolute' || cs.objectFit !== 'cover' || !img.naturalWidth) return;
      var box = img.offsetParent || img.parentElement;
      var W = img.clientWidth, H = img.clientHeight;
      var topo = img.dataset.parallaxMode === 'top';
      var fator = parseFloat(img.dataset.parallax) || 0.08;
      var r = Math.min(PARALLAX_MAX, Math.round(fator * (window.innerHeight + H) / 2));
      var nw = img.naturalWidth, nh = img.naturalHeight;
      var extra = topo ? r : 2 * r;
      var s = Math.max(W / nw, H / nh), s2 = Math.max(W / nw, (H + extra) / nh);
      if (s2 > s + 1e-6 || r < 2) return;     // aumentar a caixa mudaria a escala: sem parallax aqui
      // Mantém o recorte idêntico ao estático: compensa a caixa maior no object-position (px).
      var pos = cs.objectPosition.split(' ');
      var py = parseFloat(pos[1]) / 100;
      var T = -(nh * s - H) * py;
      img.style.inset = (-r) + 'px 0 auto 0';
      img.style.height = (H + extra) + 'px';
      img.style.objectPosition = pos[0] + ' ' + (T + r) + 'px';
      p.tween = gsap.fromTo(img, { y: topo ? 0 : -r }, {
        y: r, ease: 'none',
        scrollTrigger: { trigger: box, start: topo ? 'top top' : 'top bottom', end: 'bottom top', scrub: true }
      });
    };
    p.montar();
    estado.parallax.push(p);
  }
  // Espera a imagem carregar E as animações CSS dela terminarem (abertura do hero): senão o GSAP
  // lê a escala do meio da animação como transform "base" e a congela no estilo inline.
  function esperarImg(img, fn) {
    var css = function () {
      var an = img.getAnimations ? img.getAnimations() : [];
      if (!an.length) return fn();
      Promise.all(an.map(function (a) { return a.finished.catch(function () {}); })).then(fn);
    };
    if (img.complete && img.naturalWidth) css(); else img.addEventListener('load', css, { once: true });
  }
  if (full && high) {
    document.querySelectorAll('[data-parallax]').forEach(function (img) {
      if (img.loading === 'lazy' && !img.complete) img.loading = 'eager';
      esperarImg(img, function () { montarParallax(img); ScrollTrigger.refresh(); });
    });
  }

  /* ── Loops (só full + high, só na tela) ────────────────────────── */
  var LOOPS = {
    // borla pendurada: pouso curto e balanço de pêndulo
    balanco: function (el, i) {
      gsap.set(el, { transformOrigin: '50% 0%' });
      var tl = gsap.timeline({ paused: true });
      tl.fromTo(el, { y: -10, rotation: 0 }, { y: 0, duration: 0.9, ease: 'back.out(2.2)' })     // pouso
        .to(el, { rotation: 2.5, duration: 1.3, ease: 'sine.out' })
        .add(gsap.fromTo(el, { rotation: 2.5 }, { rotation: -2.5, duration: 2.6 + (i % 2) * 0.35, ease: 'sine.inOut', repeat: -1, yoyo: true, immediateRender: false }));
      return { tl: tl, repouso: { rotation: 0, y: 0 } };
    }
  };
  if (full && high) {
    document.querySelectorAll('[data-loop]').forEach(function (el, i) {
      var f = LOOPS[el.dataset.loop]; if (!f) return;
      var l = f(el, i); l.el = el;   // períodos levemente diferentes: nada balança em fase perfeita
      var area = el.closest('section, header, footer') || el;
      l.st = ScrollTrigger.create({
        trigger: area, start: 'top bottom', end: 'bottom top',
        onToggle: function (self) { l.naTela = self.isActive; atualizarLoop(l); }
      });
      estado.loops.push(l);
    });
  }
  function atualizarLoop(l) {
    if (l.naTela && !estado.pausado && !estado.oculto) l.tl.play(); else l.tl.pause();
  }

  /* ── Aba oculta ────────────────────────────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    estado.oculto = document.hidden;
    estado.loops.forEach(atualizarLoop);
  });

  /* ── Modo pausado (botão) ──────────────────────────────────────── */
  function pausar() {
    if (estado.pausado) return;
    estado.pausado = true;
    html.classList.add('motion-paused');
    estado.reveals.forEach(function (r) { concluir(r, false); if (r.tween) { r.tween.progress(1); } });
    estado.parallax.forEach(function (p) { if (p.tween && p.tween.scrollTrigger) p.tween.scrollTrigger.disable(false); });
    estado.loops.forEach(atualizarLoop);
    if (lenis) { lenis.destroy(); lenis = null; }
  }
  function retomar() {
    if (!estado.pausado) return;
    estado.pausado = false;
    html.classList.remove('motion-paused');
    estado.parallax.forEach(function (p) { if (p.tween && p.tween.scrollTrigger) p.tween.scrollTrigger.enable(); });
    estado.loops.forEach(atualizarLoop);
    criarLenis();
    ScrollTrigger.refresh();
  }

  /* ── Redimensionamento ─────────────────────────────────────────── */
  var tResize;
  window.addEventListener('resize', function () {
    clearTimeout(tResize);
    tResize = setTimeout(function () { estado.parallax.forEach(function (p) { p.montar(); }); ScrollTrigger.refresh(); }, 200);
  });

  /* ── Botão de pausa: só quando há movimento contínuo (full + high: loop e parallax).
        No reduced e no low só existem entradas curtas (< 5s, WCAG 2.2.2 não exige pausa). ── */
  var botao = null;
  function sincronizarBotao() {
    if (!botao) return;
    botao.setAttribute('aria-pressed', String(estado.pausado));
    botao.querySelector('.sr-only').textContent = estado.pausado ? 'Retomar animações' : 'Pausar animações';
  }
  function lembrar(v) { try { localStorage.setItem('kitaguchi-motion-pausado', v ? '1' : '0'); } catch (e) {} }
  if (full && high) {
    botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'motion-pausa';
    botao.innerHTML = '<span class="motion-pausa__icone" aria-hidden="true"></span><span class="sr-only"></span>';
    botao.addEventListener('click', function () {
      estado.pausado ? retomar() : pausar();
      lembrar(estado.pausado);
      sincronizarBotao();
    });
    document.body.appendChild(botao);
    var salvo = null;
    try { salvo = localStorage.getItem('kitaguchi-motion-pausado'); } catch (e) {}
    if (salvo === '1') pausar();
    sincronizarBotao();
  }

  /* ── API (botão de pausa e testes) ─────────────────────────────── */
  window.__motion = {
    cfg: cfg, estado: estado, pronto: true,
    pausar: function () { pausar(); sincronizarBotao(); }, retomar: function () { retomar(); sincronizarBotao(); },
    alternar: function () { estado.pausado ? retomar() : pausar(); sincronizarBotao(); return estado.pausado; },
    // testes: loops e parallax em repouso até a próxima rolagem
    repousar: function () {
      estado.loops.forEach(function (l) { l.tl.pause(); gsap.set(l.el, l.repouso); });
      estado.parallax.forEach(function (p) { if (p.tween) gsap.set(p.img, { y: 0 }); });   // parallax em repouso (recorte = estático)
    },
    irPara: function (y) { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); ScrollTrigger.update(); }
  };
  document.dispatchEvent(new CustomEvent('motion:pronto'));
})();
