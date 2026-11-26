// Página inicial: destranca o Post #10 na data certa e, depois que ela resolve a charada,
// libera os cards dos Posts #11 e #12 (que ficam trancados antes disso pra não estragar a surpresa).
(function () {
    'use strict';
    var C = window.NoiteCore; if (!C) return;
    var q = C.DEMO ? '?preview' : '';

    function card(href, pn, titulo, texto, marca) {
        var a = document.createElement('a');
        a.className = 'post rv in'; a.href = href;
        var s = document.createElement('span'); s.className = 'pn'; s.textContent = pn;
        var h = document.createElement('h3'); h.textContent = titulo;
        var p = document.createElement('p'); p.textContent = texto;
        var m = document.createElement('span'); m.className = 'mark'; m.setAttribute('aria-hidden', 'true'); m.textContent = marca || 'Abrir';
        a.append(s, h, p, m); return a;
    }
    function liberar(id, href, pn, titulo, texto, marca) {
        var velho = document.getElementById(id);
        if (velho) velho.replaceWith(card(href, pn, titulo, texto, marca));
    }

    // cards ainda trancados: balançam ao tocar
    ['post10-card', 'post11-card', 'post12-card'].forEach(function (id) {
        var c = document.getElementById(id); if (!c) return;
        function avisar() {
            c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
            var m = document.getElementById('postmsg');
            if (m) m.textContent = 'Esse post ainda não está disponível. Volte mais tarde.';
        }
        c.addEventListener('click', avisar);
        c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avisar(); } });
    });

    if (!C.postAberto()) return;
    liberar('post10-card', 'posts/post-10.html' + q, 'Post #10', 'Uma charada', 'Dessa vez tem resposta certa. E uma surpresa.');
    if (C.convite()) {
        liberar('post11-card', 'posts/post-11.html' + q, 'Post #11', 'Hoje à noite', 'Só abre no lugar combinado.', 'Abrir');
        liberar('post12-card', 'posts/post-12.html' + q, 'Post #12', 'Pra guardar', 'Só abre quando a noite terminar.', 'Abrir');
    }
})();