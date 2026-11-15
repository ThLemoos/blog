// Selo "NOVO": todo card com data-novo="post-8" ganha o selo até ela abrir esse post.
// Pra tirar o selo de um post antigo, é só apagar o atributo data-novo do card no index.html.
(function () {
    'use strict';
    var KEY = 'blog_vistos';
    function ler() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } }
    function gravar(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (_) { } }
    function marcar(id) { var v = ler(); if (v.indexOf(id) < 0) { v.push(id); gravar(v); } }

    // dentro de um post: marca como visto (vale também se ela chegou por link direto)
    var m = location.pathname.match(/\/posts\/([\w-]+)\.html$/);
    if (m) { marcar(m[1]); return; }

    // na página inicial: põe o selo nos cards ainda não vistos
    var vistos = ler();
    document.querySelectorAll('[data-novo]').forEach(function (card) {
        var id = card.getAttribute('data-novo');
        if (vistos.indexOf(id) >= 0) return;
        var s = document.createElement('span'); s.className = 'novo'; s.textContent = 'NOVO'; s.setAttribute('aria-label', 'novo');
        card.appendChild(s);
        card.addEventListener('click', function () { marcar(id); });
    });
})();
