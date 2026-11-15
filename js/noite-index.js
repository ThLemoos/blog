// Página inicial: destranca o Post #8 na data certa e, depois que ela resolve a charada,
// mostra os Posts #9 e #10 (que ficam escondidos antes disso pra não estragar a surpresa).
(function () {
    'use strict';
    var C = window.NoiteCore; if (!C) return;
    var grid = document.querySelector('.next .post-grid');
    var velho = document.getElementById('post8-card');
    if (!grid || !velho || !C.postAberto()) return;

    function card(href, pn, titulo, texto, extra) {
        var a = document.createElement('a');
        a.className = 'post rv in'; a.href = href;
        var s1 = document.createElement('span'); s1.className = 'pn'; s1.textContent = pn;
        var h = document.createElement('h3'); h.textContent = titulo;
        var p = document.createElement('p'); p.textContent = texto;
        var m = document.createElement('span'); m.className = 'mark'; m.setAttribute('aria-hidden', 'true'); m.textContent = extra || 'Abrir';
        a.append(s1, h, p, m); return a;
    }
    var q = C.DEMO ? '?preview' : '';
    velho.replaceWith(card('posts/post-8.html' + q, 'Post #8', 'Uma charada', 'Dessa vez tem resposta certa. E uma surpresa.'));

    if (C.convite()) {
        grid.appendChild(card('posts/post-9.html' + q, 'Post #9', 'Hoje à noite', 'Só abre no lugar combinado.', '📍'));
        grid.appendChild(card('posts/post-10.html' + q, 'Post #10', 'Pra guardar', 'Só abre quando a noite terminar.', '🌙'));
    }
})();
