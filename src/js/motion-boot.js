/* Motion — inicialização.
   Decide modo (full | reduced) e qualidade (high | low) e só então carrega GSAP,
   ScrollTrigger, Lenis e motion.js: depois do `load` + LCP + fim da abertura do hero +
   ocioso, ou na primeira interação, o que vier primeiro. Scripts clássicos, auto-hospedados (funciona em file://).
   Nada da página depende disto para aparecer.
   Testes: ?motion=off | reduced | full   ?quality=high | low */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var forcado = q.get('motion');
  if (forcado === 'off') return;

  var base = document.currentScript.src.replace(/[^/]*$/, '');

  // Detecção de modo/qualidade só dentro de iniciar(): ler innerWidth/matchMedia aqui (script
  // defer, antes da 1ª pintura) forçava o 1º estilo+layout da página dentro desta tarefa.
  function configurar() {
    var reduzido = forcado === 'reduced' ||
      (forcado !== 'full' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var qualidade = q.get('quality');
    if (qualidade !== 'high' && qualidade !== 'low') {
      var con = navigator.connection || {};
      var fraco = !!con.saveData ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        Math.min(screen.width || innerWidth, innerWidth) < 768;
      qualidade = fraco ? 'low' : 'high';
    }
    window.__MOTION_CFG = { mode: reduzido ? 'reduced' : 'full', quality: qualidade };
    var lista = ['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js'];
    if (!reduzido && qualidade === 'high') lista.push('vendor/lenis.min.js');
    lista.push('motion.js');
    return lista;
  }

  var eventos = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  var iniciado = false;
  function iniciar() {
    if (iniciado) return;
    iniciado = true;
    eventos.forEach(function (e) { removeEventListener(e, iniciar, true); });
    var lista = configurar();
    (function proximo(i) {
      if (i >= lista.length) return;
      var s = document.createElement('script');
      s.src = base + lista[i];
      s.onload = function () { proximo(i + 1); };
      s.onerror = function () { /* sem motion: a página continua estática e completa */ };
      document.head.appendChild(s);
    })(0);
  }
  // Depois do load, espera o LCP de fato pintado (a textura do noren é rasterizada fora da
  // thread principal e termina depois do load) e um momento ocioso: o motion nunca atrasa
  // o LCP. Sem suporte a LCP: 2 quadros + ocioso. Teto de 4s. Interação antecipa.
  var lcpVisto = false, esperandoLcp = null;
  try {
    new PerformanceObserver(function () {
      lcpVisto = true;
      if (esperandoLcp) { var f = esperandoLcp; esperandoLcp = null; f(); }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) { lcpVisto = true; }
  // Também espera a abertura do noren (CSS, ~3s) terminar: o LCP é o 鮨, que só aparece
  // no meio da abertura, e nada do motion (JS) mexe acima da dobra antes disso.
  // (evento do último elemento da abertura, o CTA; getAnimations() forçaria um recálculo de
  // estilo síncrono da página inteira). Teto de 3,5s para movimento reduzido/sem animação.
  function aposAbertura(fn) {
    var feito = false;
    function ok() { if (!feito) { feito = true; fn(); } }
    var cta = document.querySelector('.noren__cta');
    if (cta) cta.addEventListener('animationend', ok, { once: true });
    setTimeout(ok, 3500);
  }
  function ocioso() {
    aposAbertura(function () {
      if (window.requestIdleCallback) requestIdleCallback(iniciar, { timeout: 2500 });
      else setTimeout(iniciar, 300);
    });
  }
  function aposPintura() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (lcpVisto) return ocioso();
        esperandoLcp = ocioso;
        setTimeout(function () { if (esperandoLcp) { esperandoLcp = null; ocioso(); } }, 4000);
      });
    });
  }
  eventos.forEach(function (e) { addEventListener(e, iniciar, { capture: true, passive: true, once: true }); });
  if (document.readyState === 'complete') aposPintura();
  else addEventListener('load', aposPintura, { once: true });
})();
