// Post #12: a página final. Abre quando você libera pelo painel (admin) ou por uma palavra opcional.
// Mostra o texto de depois da noite + as fotos e vídeos (do painel e/ou da pasta memorias/).
(function () {
    'use strict';

    /* ====================== TEXTOS (edite à vontade) ====================== */
    var TEXTO = [
        'Chegou até aqui. Então a noite foi do jeito que eu queria: com você do meu lado.',
        'Esse blog começou como uma desculpa pra dizer o que eu não sabia dizer em voz alta. Hoje eu consegui dizer em voz alta, olhando nos seus olhos.',
        'Guardei aqui o que a gente viveu hoje, pra você poder voltar sempre que quiser.'
    ];
    var PERGUNTA = 'Qual foi o momento dessa noite que você quer guardar pra sempre?';
    /* ======================================================================= */

    var C = window.NoiteCore, D = C.dados(), $ = function (id) { return document.getElementById(id); }, el = C.el;
    var aberto = false;
    var lista = { locais: [], nuvem: [] };

    // ---------- liberar ----------
    function abrir() {
        if (aberto) return; aberto = true;
        C.gravar('noite_final', '1');
        $('p10-tranca').hidden = true; $('p10-aberto').hidden = false;
        var t = $('p10-texto'); t.replaceChildren();
        TEXTO.forEach(function (x) { t.appendChild(el('p', null, x)); });
        $('p10-pergunta').textContent = PERGUNTA;
        window.scrollTo({ top: 0, behavior: 'auto' });
        C.vibrar([60, 40, 120]);
        galeria();
        if (C.ler('noite_recado')) mostrarRecado(C.ler('noite_recado'));
    }

    if (C.DEMO && C.P.get('demo') === 'final' || C.ler('noite_final') === '1') abrir();

    if (!aberto) {
        // escuta o painel: quando você clicar em "Liberar", abre sozinha na tela dela
        if (!C.DEMO) {
            C.fb().then(function (f) {
                f.fs.onSnapshot(f.fs.doc(f.db, 'noite', 'estado'), function (s) { if (s.exists() && s.data().final === true) abrir(); }, function () { });
            }).catch(function () { $('p10-st').textContent = 'Sem conexão agora. Quando a internet voltar, essa página abre sozinha.'; });
        } else { $('p10-st').textContent = 'Prévia: abra com ?demo=final para ver a página liberada.'; }
        // palavra opcional (plano B)
        if (D.finalHash) {
            $('p10-form').hidden = false;
            $('p10-form').addEventListener('submit', async function (e) {
                e.preventDefault();
                var v = $('p10-cod').value.trim(); if (!v) return;
                if ((await C.sha256(v)) === D.finalHash) abrir();
                else { $('p10-st').textContent = 'Essa não é a palavra.'; }
            });
        }
    }

    // ---------- recado dela ----------
    function mostrarRecado(txt) {
        $('p10-form-r').hidden = true; $('p10-rst').textContent = '';
        var q = $('p10-ok'); q.textContent = txt; q.hidden = false;
    }
    $('p10-env').addEventListener('click', async function () {
        var v = $('p10-recado').value.trim(), st = $('p10-rst'), b = $('p10-env');
        if (v.length < 3) { st.textContent = 'Escreve um pouquinho, do jeito que vier.'; return; }
        b.disabled = true; st.textContent = 'Guardando…';
        try {
            await C.enviar(12, [{ pergunta: PERGUNTA, resposta: v }]);
            C.gravar('noite_recado', v); mostrarRecado(v); C.vibrar([30, 40, 60]);
        } catch (e) {
            console.error('Erro ao enviar o recado do Post 12:', e);
            b.disabled = false; st.textContent = 'Não consegui enviar agora. Tenta de novo daqui a pouco.';
        }
    });

    // ---------- galeria ----------
    function desenhar() {
        var g = $('p10-gal'); g.replaceChildren();
        var tudo = lista.locais.concat(lista.nuvem);
        $('p10-vazio').hidden = tudo.length > 0;
        tudo.forEach(function (m) {
            var b = el('button', 'n-item'); b.type = 'button';
            var fig = el('figure'); fig.style.cssText = 'margin:0;width:100%;height:100%';
            if (m.tipo === 'video') {
                var v = el('video'); v.src = m.url + '#t=0.1'; v.preload = 'metadata'; v.muted = true; v.playsInline = true;
                fig.append(v, el('span', 'play', '▶'));
            } else {
                var i = el('img'); i.src = m.url; i.loading = 'lazy'; i.alt = m.legenda || 'Memória da noite';
                fig.appendChild(i);
            }
            if (m.legenda) fig.appendChild(el('figcaption', null, m.legenda));
            b.appendChild(fig); b.onclick = function () { ampliar(m); }; g.appendChild(b);
        });
    }
    function ampliar(m) {
        var lb = $('p10-lb'), c = $('p10-lbc'); c.replaceChildren();
        var x;
        if (m.tipo === 'video') { x = el('video'); x.src = m.url; x.controls = true; x.autoplay = true; x.playsInline = true; }
        else { x = el('img'); x.src = m.url; x.alt = m.legenda || ''; }
        c.appendChild(x); if (m.legenda) c.appendChild(el('p', null, m.legenda));
        if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    }
    $('p10-lbx').addEventListener('click', function () { $('p10-lb').close(); });
    $('p10-lb').addEventListener('click', function (e) { if (e.target === $('p10-lb')) $('p10-lb').close(); });
    $('p10-lb').addEventListener('close', function () { $('p10-lbc').replaceChildren(); });

    function galeria() {
        lista.locais = (window.MEMORIAS_LOCAIS || []).map(function (m) {
            return { url: '../' + m.arquivo, tipo: m.tipo === 'video' ? 'video' : 'imagem', legenda: m.legenda || '' };
        });
        desenhar();
        if (C.DEMO) return;
        C.fb().then(function (f) {
            var q = f.fs.query(f.fs.collection(f.db, 'memorias'), f.fs.orderBy('criadoEm', 'asc'));
            f.fs.onSnapshot(q, function (snap) {
                lista.nuvem = snap.docs.map(function (d) { var r = d.data(); return { url: r.url, tipo: r.tipo, legenda: r.legenda || '' }; });
                desenhar();
            }, function () { });
        }).catch(function () { });
    }
})();