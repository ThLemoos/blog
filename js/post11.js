// Post #9: só abre quando ela está no lugar (GPS) ou digita a palavra que você entrega lá.
// O conteúdo fica criptografado em js/noite-dados.js (duas cópias: uma com a chave do GPS, outra com a palavra).
(function () {
    'use strict';
    var C = window.NoiteCore, D = C.dados(), $ = function (id) { return document.getElementById(id); }, el = C.el;
    var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conv = C.convite();
    var watch = null;

    function dist(a, b, c, d) { // haversine, em metros
        var R = 6371000, r = Math.PI / 180, dLa = (c - a) * r, dLo = (d - b) * r;
        var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
        return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
    function fmt(m) { return m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' km' : Math.round(m) + ' m'; }

    // ---------- conteúdo liberado ----------
    function mostrar(txt, aviso) {
        var p;
        try { p = JSON.parse(txt); } catch (_) { return false; }
        if (watch !== null) { navigator.geolocation.clearWatch(watch); watch = null; }
        C.gravar('noite_p9', txt);
        $('p9-tranca').hidden = true;
        $('p9-titulo').textContent = p.titulo || '';
        $('p9-texto').textContent = p.intro || '';
        var menu = $('p9-menu'); menu.replaceChildren();
        (p.itens || []).forEach(function (it) {
            var d = el('div', 'n-prato');
            d.appendChild(el('small', null, it.rotulo || ''));
            d.appendChild(el('h4', null, it.titulo || ''));
            if (it.texto) d.appendChild(el('p', null, it.texto));
            menu.appendChild(d);
        });
        $('p9-fecho').textContent = p.fecho || '';
        $('p9-aberto').hidden = false;
        window.scrollTo({ top: 0, behavior: 'auto' });
        C.vibrar([60, 40, 120]);
        // os pratos aparecem um a um
        var ps = menu.children;
        Array.prototype.forEach.call(ps, function (d, i) { setTimeout(function () { d.classList.add('in'); }, reduz ? 0 : 900 + i * 1100); });
        setTimeout(function () { $('p9-prox').hidden = false; }, reduz ? 0 : 900 + ps.length * 1100 + 600);

        // avisa o painel que ela chegou (uma vez só)
        if (aviso && !C.ler('noite_p9_aviso')) {
            C.gravar('noite_p9_aviso', '1');
            C.enviar(9, [{ pergunta: 'Página da noite', resposta: 'Ela chegou e abriu o Post #9 📍 (' + aviso + ')' }]).catch(function () { });
        }
        return true;
    }

    // já abriu antes neste aparelho: dá pra reler depois da noite
    var guardado = C.ler('noite_p9');
    if (guardado && mostrar(guardado, null)) return;

    // ---------- GPS ----------
    var st = $('p9-gps-st'), dd = $('p9-dist'), radar = $('p9-radar'), btn = $('p9-loc');
    var temCoord = conv && typeof conv.lat === 'number' && typeof conv.lng === 'number' && conv.chaveGps;
    if (!temCoord) {
        $('p9-intro').textContent = 'Essa página só abre no lugar combinado. Abra o convite no Post #8 neste aparelho primeiro, ou use a palavra aqui embaixo.';
        if (!C.DEMO) btn.disabled = true;
    }
    if (C.DEMO) $('p9-sim').hidden = false;

    async function chegou(info) {
        var txt = await C.tentar(D.noiteGps || [], conv.chaveGps);
        if (!txt || !mostrar(txt, info)) { st.textContent = 'Você está no lugar, mas algo deu errado ao abrir. Usa a palavra aqui embaixo.'; }
    }
    function posicao(pos) {
        var raio = conv.raio || 150, acc = Math.min(pos.coords.accuracy || 0, 100);
        var d = dist(pos.coords.latitude, pos.coords.longitude, conv.lat, conv.lng);
        radar.classList.add('on');
        if (d - acc <= raio) { dd.textContent = 'Você chegou.'; chegou(Math.round(d) + ' m do ponto'); return; }
        dd.textContent = 'a ' + fmt(d) + ' de mim';
        st.textContent = d < 600 ? 'Pertinho. Continua.' : 'Ainda não chegou. Quando estiver perto, essa tela abre sozinha.';
    }
    function erroGps(e) {
        btn.disabled = false;
        if (e.code === 1) st.textContent = 'A localização foi negada. Libere nas configurações do navegador, ou use a palavra aqui embaixo.';
        else st.textContent = 'Não consegui te localizar agora. Vá pra um lugar aberto e tente de novo, ou use a palavra.';
    }
    btn.addEventListener('click', function () {
        if (!navigator.geolocation) { st.textContent = 'Esse aparelho não tem localização. Use a palavra aqui embaixo.'; return; }
        if (!temCoord) return;
        btn.disabled = true; st.textContent = 'Te procurando…';
        if (watch !== null) navigator.geolocation.clearWatch(watch);
        watch = navigator.geolocation.watchPosition(function (p) { btn.disabled = false; btn.textContent = 'Atualizar'; posicao(p); },
            erroGps, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    });
    $('p9-sim').addEventListener('click', function () { if (temCoord) chegou('prévia'); else st.textContent = 'Resolva a charada do Post #8 primeiro (com ?demo).'; });

    // ---------- palavra ----------
    $('p9-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        var inp = $('p9-palavra'), s = $('p9-cod-st'), v = inp.value.trim();
        if (!v) { s.textContent = 'Digite a palavra.'; return; }
        if (!window.crypto || !crypto.subtle) { s.textContent = 'Abra o blog pelo link https.'; return; }
        $('p9-go').disabled = true; s.textContent = 'Verificando…';
        var txt = D.noiteManual ? await C.tentar([D.noiteManual], v) : null;
        $('p9-go').disabled = false;
        if (txt && mostrar(txt, 'pela palavra')) return;
        inp.classList.remove('erro'); void inp.offsetWidth; inp.classList.add('erro');
        s.textContent = 'Essa não é a palavra.';
    });
})();
