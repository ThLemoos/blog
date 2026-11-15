// Post #8: charada -> convite. O convite (local, data, coordenadas) fica CRIPTOGRAFADO em js/noite-dados.js
// e só abre com a resposta certa. Gere o arquivo em gerar-noite.html.
(function () {
    'use strict';
    var C = window.NoiteCore, D = C.dados(), $ = function (id) { return document.getElementById(id); }, el = C.el;
    var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- ainda não abriu? ----
    if (!C.postAberto()) {
        $('p8-corpo').hidden = true; $('p8-cedo').hidden = false;
        return;
    }

    var erros = 0;
    $('p8-pergunta').textContent = D.charada ? D.charada.pergunta : '(gere o js/noite-dados.js em gerar-noite.html)';

    // ---------- convite ----------
    var timer = 0;
    function dataExtenso(d) {
        var s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    function horaFmt(d) { return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h'); }

    function ics(c) {
        var ini = new Date(c.quando), fim = new Date(ini.getTime() + 3 * 3600e3);
        var f = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
        var lin = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//nosso-blog//PT', 'BEGIN:VEVENT',
            'UID:noite-' + ini.getTime() + '@nosso-blog', 'DTSTAMP:' + f(new Date()),
            'DTSTART:' + f(ini), 'DTEND:' + f(fim),
            'SUMMARY:Jantar com o Thiago', 'LOCATION:' + (c.local + (c.endereco ? ', ' + c.endereco : '')).replace(/[,;]/g, '\\$&'),
            'DESCRIPTION:Fica bem bonita e me encontra la.',
            'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:Hoje tem jantar', 'END:VALARM',
            'END:VEVENT', 'END:VCALENDAR'];
        var a = el('a'); a.href = URL.createObjectURL(new Blob([lin.join('\r\n')], { type: 'text/calendar' }));
        a.download = 'jantar.ics'; document.body.appendChild(a); a.click(); a.remove();
    }

    function contagem(c, alvo) {
        var t = new Date(c.quando).getTime();
        function tick() {
            var ms = t - Date.now();
            if (ms <= 0) { alvo.textContent = 'É hoje. É agora.'; return; }
            var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
            alvo.textContent = 'faltam ' + (d ? d + (d === 1 ? ' dia, ' : ' dias, ') : '') + h + 'h ' + m + 'min';
        }
        tick(); clearInterval(timer); timer = setInterval(tick, 30000);
    }

    function mostrarConvite(c, animar) {
        $('p8-charada').hidden = true;
        var box = $('p8-convite'); box.replaceChildren();
        var q = new Date(c.quando);

        var tk = el('div', 'n-ticket');
        if (!animar) tk.style.animation = 'none';
        tk.appendChild(el('p', 'n-kicker', 'convite · só pra você'));
        tk.appendChild(el('h3', null, 'Você está convidada'));
        (c.convite || []).forEach(function (t) { tk.appendChild(el('p', null, t)); });

        var ul = el('ul', 'n-det');
        function item(rot, big, small) {
            var li = el('li'); li.appendChild(el('small', null, rot)); li.appendChild(el('b', null, big));
            if (small) li.appendChild(el('span', null, small)); ul.appendChild(li);
        }
        item('quando', dataExtenso(q), 'às ' + horaFmt(q));
        item('onde', c.local, c.endereco || '');
        if (c.traje) item('traje', c.traje);
        item('quem te espera', 'Eu.', 'e eu já estou ansioso');
        tk.appendChild(ul);

        var cont = el('p', 'n-cont'); tk.appendChild(cont); contagem(c, cont);

        var ac = el('div', 'n-acoes');
        if (c.mapsUrl) { var m = el('a', 'cta', 'Ver no mapa'); m.href = c.mapsUrl; m.target = '_blank'; m.rel = 'noopener'; ac.appendChild(m); }
        var cal = el('button', 'cta ghost', 'Salvar na agenda'); cal.type = 'button'; cal.onclick = function () { ics(c); }; ac.appendChild(cal);
        tk.appendChild(ac);
        box.appendChild(tk);

        // confirmar presença (cai no painel)
        var conf = el('section', 'n-card');
        if (C.ler('noite_aceite') === '1') {
            conf.appendChild(el('p', 'n-kicker', 'confirmado'));
            conf.appendChild(el('h3', null, 'Combinado. Te espero lá.'));
        } else {
            conf.appendChild(el('p', 'n-kicker', 'e então?'));
            conf.appendChild(el('h3', null, 'Me avisa que você vai.'));
            var ta = el('textarea', 'n-text'); ta.rows = 3; ta.maxLength = 500; ta.placeholder = 'Se quiser me dizer alguma coisa antes (opcional)';
            var b = el('button', 'cta', 'Eu vou'); b.type = 'button';
            var st = el('p', 'n-status'); st.setAttribute('role', 'status');
            var f = el('div', 'n-form'); f.append(ta, b); conf.append(f, st);
            b.onclick = async function () {
                b.disabled = true; st.textContent = 'Enviando…';
                try {
                    var r = ta.value.trim();
                    await C.enviar(8, [{ pergunta: 'Convite para o jantar: ' + dataExtenso(q) + ' às ' + horaFmt(q) + ' em ' + c.local, resposta: 'Aceitou ✔' + (r ? '\n' + r : '') }]);
                    C.gravar('noite_aceite', '1'); C.vibrar([30, 40, 60]);
                    conf.replaceChildren(el('p', 'n-kicker', 'confirmado'), el('h3', null, 'Combinado. Te espero lá.'),
                        el('p', null, C.DEMO ? '(prévia: nada foi enviado)' : 'Recebi aqui. Já estou contando as horas.'));
                } catch (e) {
                    console.error('Erro ao confirmar o convite:', e);
                    b.disabled = false; st.textContent = 'Não consegui enviar agora. Tenta de novo daqui a pouco.';
                }
            };
        }
        box.appendChild(conf);

        box.appendChild(el('p', 'n-prox', 'Quando você chegar no lugar, abra o Post #9. Ele vai estar esperando por você lá.'));
        box.hidden = false;
        if (animar) { box.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' }); C.vibrar([30, 50, 30]); }
    }

    // já resolveu antes (neste aparelho)?
    var salvo = C.convite();
    if (salvo && salvo.quando) mostrarConvite(salvo, false);

    // ---------- resposta da charada ----------
    $('p8-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        var inp = $('p8-resp'), st = $('p8-status'), go = $('p8-go'), v = inp.value.trim();
        if (!v) { st.textContent = 'Digite sua resposta.'; return; }
        if (!window.crypto || !crypto.subtle) { st.textContent = 'Abra o blog pelo link https para a charada funcionar.'; return; }
        if (!D.convite || !D.convite.length) { st.textContent = 'O convite ainda não foi gerado.'; return; }
        go.disabled = true; st.textContent = 'Verificando…';
        var txt = await C.tentar(D.convite, v);
        go.disabled = false;
        if (txt) {
            try {
                var c = JSON.parse(txt);
                C.gravar('noite_convite', txt);
                st.textContent = '';
                mostrarConvite(c, true);
            } catch (err) { st.textContent = 'Algo deu errado ao abrir. Fala comigo.'; }
        } else {
            erros++;
            inp.classList.remove('erro'); void inp.offsetWidth; inp.classList.add('erro');
            st.textContent = 'Ainda não é essa. Tenta de novo.' + (erros >= 2 && D.charada && D.charada.dica ? ' Dica: ' + D.charada.dica : '');
        }
    });
})();
