(function () {
    'use strict';

    /* ====================== TEXTOS (edite à vontade) ====================== */
    var JANELAS = [
        {
            id: 'manha', ini: 5, fim: 11, nome: 'manhã', rotulo: 'manhã · 05h às 11h', cor: '#f6d9b0',
            titulo: 'Bom dia, Minha Branquinha!',
            paras: [
                'Se você abriu isso de manhã, bom dia, minha branquinha!',
                'Isso é uma forma de te mostrar que de manhã uma das coisas que eu já acordo pensando é em você. E que, mesmo que a gente não se fale, eu espero que o seu dia seja bom.',
                'Epero que você acorde bem, sorridente e sem estresse. Que seu dia seja incrível e o que você precisar eu estarei aqui.',
                'Então vai começar o seu dia, bebe bastante água e não se esqueça: TOMAR BANHO FAZ BEM PRA SAÚDE, PRA CABEÇA E PRA PELE. E EU TE AMO.'
            ]
        },
        {
            id: 'meio', ini: 11, fim: 15, nome: 'meio do dia', rotulo: 'meio do dia · 11h às 15h', cor: '#ffb3c9',
            titulo: 'Sempre vou estar aqui!',
            paras: [
                'Meio do dia é a hora em que a gente já está cansado do que fez e ainda falta muito pro que vem.',
                'Dependendo do horário que você está lendo isso aqui, você já pode ter feito bastante coisa no dia.',
                'Mas saiba que mesmo nesse meio tempo, eu continuo pensando em você. E que, mesmo que a gente não se fale por conta do trabalho, eu espero que você esteja bem.',
                'Quando eu não puder falar nesse horário durante a semana, volte aqui sempre que puder pra lembrar que eu estou pensando em você.'
            ]
        },
        {
            id: 'tarde', ini: 15, fim: 19, nome: 'tarde', rotulo: 'tarde · 15h às 19h', cor: '#ff9a6b',
            titulo: 'A hora de fazer conta',
            paras: [
                'A tarde é a hora mais difícil do dia. O sono bate, o trabalho pesa e parece que a noite nunca chega.',
                'Mas as vezes vem com surpresas boas. E se você está lendo isso, é uma delas.',
                'E no final do dia, quando o cansaço bate, uma das primeiras coisas que penso é de ter você por perto. Já que estamos um pouco longe, eu te mando uma mensagem.',
                'E quando a mensagem já não basta, eu te busco no trabalho só pra ter um momento contigo mesmo que seja pouco.',
                'Aproveite esse fim de tarde, minha branquinha. Um dia eu te busco no trabalho e ficaremos muito mais tempo juntos do que imaginamos.'

            ]
        },
        {
            id: 'noite', ini: 19, fim: 24, nome: 'noite', rotulo: 'noite · 19h às 00h', cor: '#b79cff',
            titulo: 'Agora o dia desliga',
            paras: [
                'A noite é a parte que eu mais gosto do dia, e agora ela tem um motivo pra eu gostar ainda mais. E o motivo é você.',
                'É o momento em que mais temos tempo juntos, seja pessoalmente ou por mensagem. E eu gosto de cada segundo que passo com você.',
                'Já cheguei em casa com o seu cheiro mais de uma vez e, sinceramente, não conheço jeito melhor de terminar um dia.',
                'Eu não sei como foi o seu hoje. Se foi ruim, descansa, porque já acabou. Se foi bom, me conta. E se foi só mais ou menos, eu estou aqui, e isso já ajuda, né?',
                'Espero que esse mesmo sentimento esteja acontecendo com você tanbém, porque é bom demais.'
            ]
        },
        {
            id: 'madrugada', ini: 0, fim: 5, nome: 'madrugada', rotulo: 'janela secreta · madrugada', cor: '#7c8cff', secreta: true,
            titulo: 'Você ainda está acordada?',
            paras: [
                'Está acordada essa hora porque?',
                'Isso não é hora de estar acordada, vai dormir agora!!!',
                'Mas já que está aqui, saiba de uma coisa:',
                'Eu realmente te amo, e pelo que você é e pelo que sua postura representa.',
                'AGORA VAI DORMIR!!!'
            ]
        }
    ];

    var FINAL_TITULO = 'Você passou pelo dia inteiro';
    var FINAL_PARAS = [
        'Manhã, meio do dia, tarde e noite. Você passou por todas.',
        'Eu fiz esse post assim de propósito. Não foi pra te dar trabalho, foi porque eu queria que você visse uma coisa: em todas essas horas eu penso em você. Muda o horário, muda o cansaço, muda até o meu humor, e você continua aparecendo.'
    ];
    var FINAL_SECRETA = 'E você ainda achou a janela que eu não contei, mas eu já sabia porque você é curiosa demais!';
    var FINAL_FECHO = 'Eu sou de poucas palavras, você sabe. Então, quando eu faço um post inteiro só pra dizer que você cabe em todas as horas do meu dia, entende que esse é o meu jeito de dizer muito.';
    var FINAL_PERGUNTA = 'Em que hora do dia eu mais apareço na sua cabeça? E por quê?';

    var ORDEM = ['manha', 'meio', 'tarde', 'noite'];   // as 4 que liberam o final
    /* ======================================================================= */

    var $ = function (id) { return document.getElementById(id); };
    var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var params = new URLSearchParams(location.search);
    var HORA = params.get('hora');
    var DEMO = HORA !== null || params.has('demo');
    var POR_ID = {};
    JANELAS.forEach(function (j) { POR_ID[j.id] = j; });

    /* ---------- armazenamento (com fallback em memória) ---------- */
    var mem = {};
    function ler(k) { try { var v = localStorage.getItem(k); return v === null ? (mem[k] || null) : v; } catch (_) { return mem[k] || null; } }
    function gravar(k, v) { mem[k] = v; if (DEMO) return; try { localStorage.setItem(k, v); } catch (_) { } }

    if (params.has('reset')) {
        try { ['post7_vistas', 'post7_enviado', 'post7_resposta'].forEach(function (k) { localStorage.removeItem(k); }); } catch (_) { }
    }

    var vistas = [];
    try { vistas = JSON.parse(ler('post7_vistas') || '[]'); } catch (_) { vistas = []; }
    if (!Array.isArray(vistas)) vistas = [];
    if (params.get('demo') === 'final') vistas = ORDEM.slice();
    var enviado = ler('post7_enviado') === '1';

    /* ---------- hora ---------- */
    function agora() {
        if (HORA !== null) {
            var p = HORA.split(':');
            var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
            return { h: isNaN(h) ? 0 : ((h % 24) + 24) % 24, m: isNaN(m) ? 0 : m % 60, s: 0 };
        }
        var d = new Date();
        return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
    }
    function pad(n) { return String(n).padStart(2, '0'); }
    function janelaDe(h) {
        for (var i = 0; i < JANELAS.length; i++) if (h >= JANELAS[i].ini && h < JANELAS[i].fim) return JANELAS[i];
        return JANELAS[0];
    }
    function minAte(j) {
        var t = agora();
        return ((j.ini * 60) - (t.h * 60 + t.m) + 1440) % 1440;
    }
    function falta(min) {
        var h = Math.floor(min / 60), m = min % 60;
        if (h && m) return h + 'h ' + m + 'min';
        if (h) return h + 'h';
        return m + 'min';
    }
    function hh(n) { return n === 24 ? '00h' : pad(n) + 'h'; }

    /* ---------- relógio (SVG) ---------- */
    var NS = 'http://www.w3.org/2000/svg';
    var svg = $('dial');
    function el(tag, attrs, pai) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        (pai || svg).appendChild(e);
        return e;
    }
    function polar(r, deg) { var a = (deg - 90) * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; }
    function arco(ini, fim, r) {
        var a0 = ini / 24 * 360 + 1.6, a1 = fim / 24 * 360 - 1.6;
        var p0 = polar(r, a0), p1 = polar(r, a1);
        return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + ((a1 - a0) > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
    }
    var R = 78;
    var arcos = {};
    var marcador, halo;

    function montarDial() {
        el('circle', { cx: 100, cy: 100, r: R, class: 'trilho' });
        [[0, '00'], [6, '06'], [12, '12'], [18, '18']].forEach(function (t) {
            var p = polar(R + 17, t[0] / 24 * 360);
            var tx = el('text', { x: p[0].toFixed(1), y: (p[1] + 2.6).toFixed(1), 'text-anchor': 'middle', class: 'tick' });
            tx.textContent = t[1];
        });
        JANELAS.forEach(function (j) {
            var a = el('path', { d: arco(j.ini, j.fim, R), class: 'arc', 'data-id': j.id });
            a.style.color = j.cor;
            arcos[j.id] = a;
        });
        halo = el('circle', { r: 11, class: 'halo' });
        marcador = el('circle', { r: 5.5, class: 'marcador' });
    }

    function posicionar() {
        var t = agora();
        var deg = (t.h + t.m / 60 + t.s / 3600) / 24 * 360;
        var p = polar(R, deg);
        [halo, marcador].forEach(function (c) { c.setAttribute('cx', p[0].toFixed(2)); c.setAttribute('cy', p[1].toFixed(2)); });
    }

    /* ---------- estado ---------- */
    var atual = janelaDe(agora().h);
    var mostrada = null;
    var achouSecreta = function () { return vistas.indexOf('madrugada') > -1; };
    var contaRegulares = function () { return ORDEM.filter(function (id) { return vistas.indexOf(id) > -1; }).length; };
    var foiVista = function (id) { return vistas.indexOf(id) > -1; };

    function desenharEstado() {
        var t = agora();
        $('rel').textContent = pad(t.h) + ':' + pad(t.m);
        atual = janelaDe(t.h);
        $('rel-j').textContent = atual.secreta && !foiVista(atual.id) ? 'shh' : atual.nome;
        posicionar();

        JANELAS.forEach(function (j) {
            var a = arcos[j.id];
            // a madrugada só aparece no relógio depois de achada (ou se ela estiver nela agora)
            var visivel = !j.secreta || foiVista(j.id) || atual.id === j.id;
            a.style.display = visivel ? '' : 'none';
            a.classList.toggle('visto', foiVista(j.id));
            a.classList.toggle('agora', atual.id === j.id && !foiVista(j.id));
            a.classList.toggle('sel', mostrada === j.id);
        });

        var n = contaRegulares();
        $('progresso').innerHTML = n >= ORDEM.length
            ? 'as 4 janelas do dia <b>já são suas</b>'
            : '<b>' + n + ' de ' + ORDEM.length + '</b> janelas do dia abertas';

        desenharHoras();
    }

    /* ---------- botões das outras horas ---------- */
    function desenharHoras() {
        var box = $('horas');
        box.replaceChildren();
        ORDEM.concat(['madrugada']).forEach(function (id) {
            var j = POR_ID[id];
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'hora';
            b.style.setProperty('--c', j.cor);
            var topo = document.createElement('span'); topo.className = 'h-nome';
            var sub = document.createElement('span'); sub.className = 'h-sub';
            var eAtual = atual.id === id;
            var vista = foiVista(id);

            if (j.secreta && !vista) {
                if (eAtual) { return; } // ela está nela agora: o cartão principal já mostra
                b.classList.add('misterio', 'trancada');
                b.setAttribute('aria-disabled', 'true');
                topo.textContent = '???';
                sub.textContent = 'uma quinta janela';
                b.addEventListener('click', function () {
                    aviso('Existe uma quinta janela. Eu não vou dizer quando ela abre. Só dou uma dica: não é de dia.', b);
                });
            } else if (vista || eAtual) {
                b.classList.add(vista ? 'vista' : 'agora');
                if (mostrada === id) b.classList.add('sel');
                topo.textContent = j.nome;
                sub.textContent = vista ? (mostrada === id ? 'lendo agora' : 'reler') : 'aberta agora';
                b.addEventListener('click', function () { mostrar(id, true); });
            } else {
                b.classList.add('trancada');
                b.setAttribute('aria-disabled', 'true');
                topo.textContent = j.nome;
                sub.textContent = '🔒 abre às ' + hh(j.ini) + ' · em ' + falta(minAte(j));
                b.addEventListener('click', function () {
                    aviso('Essa só abre às ' + hh(j.ini) + ', daqui a ' + falta(minAte(j)) + '. Volta lá, eu espero.', b);
                });
            }
            b.append(topo, sub);
            box.appendChild(b);
        });
    }

    function aviso(txt, btn) {
        var a = $('aviso-hora');
        a.textContent = txt;
        if (btn) { btn.classList.remove('treme'); void btn.offsetWidth; btn.classList.add('treme'); }
        try { navigator.vibrate && navigator.vibrate(25); } catch (_) { }
    }

    /* ---------- cartão da janela ---------- */
    var ioParas = null, ioUltimo = null;
    function observarRevelar(els) {
        if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
        if (!ioParas) ioParas = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ioParas.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -8% 0px', threshold: .15 });
        els.forEach(function (e) { ioParas.observe(e); });
    }

    function mostrar(id, rolar) {
        var j = POR_ID[id];
        mostrada = id;
        var card = $('janela');
        if (ioUltimo) { ioUltimo.disconnect(); ioUltimo = null; }
        card.replaceChildren();
        card.dataset.j = id;
        card.classList.toggle('secreta', !!j.secreta);

        var tag = document.createElement('p'); tag.className = 'tag'; tag.textContent = j.rotulo;
        var h = document.createElement('h3'); h.textContent = j.titulo;
        card.append(tag, h);

        var revelar = [];
        var ultimo = null;
        j.paras.forEach(function (t, i) {
            var p = document.createElement('p');
            p.className = 'rv' + (i === 0 ? '' : ' d1');
            p.textContent = t;
            card.appendChild(p);
            revelar.push(p);
            ultimo = p;
        });
        observarRevelar(revelar);

        // conta como "lida" quando ela chega no último parágrafo
        if (!foiVista(id) && ultimo) {
            var marcar = function () { marcarVista(id); };
            if ('IntersectionObserver' in window) {
                ioUltimo = new IntersectionObserver(function (es) {
                    if (es.some(function (e) { return e.isIntersecting; })) { ioUltimo.disconnect(); ioUltimo = null; marcar(); }
                }, { threshold: .6 });
                ioUltimo.observe(ultimo);
            } else { marcar(); }
        } else {
            $('nota').hidden = true;
        }

        desenharEstado();
        if (rolar) card.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
    }

    function marcarVista(id) {
        if (foiVista(id)) return;
        vistas.push(id);
        gravar('post7_vistas', JSON.stringify(vistas));
        desenharEstado();
        mostrarNota(id);
        if (contaRegulares() >= ORDEM.length) liberarFinal(true);
    }

    function mostrarNota(id) {
        var j = POR_ID[id], n = $('nota');
        n.replaceChildren();
        var p = document.createElement('p');
        if (j.secreta) {
            p.textContent = 'Você achou a janela que eu não contei. Ela ficou guardada aqui pra você reler quando quiser.';
        } else {
            var c = contaRegulares();
            if (c >= ORDEM.length) {
                p.textContent = 'Essa era a última. Apareceu uma coisa nova lá embaixo.';
            } else {
                var prox = ORDEM.map(function (x) { return POR_ID[x]; })
                    .filter(function (x) { return !foiVista(x.id); })
                    .sort(function (a, b) { return minAte(a) - minAte(b); })[0];
                p.textContent = 'Essa janela agora é sua, e você pode reler quando quiser. Faltam ' + (ORDEM.length - c) +
                    '. A próxima, a da ' + prox.nome + ', abre às ' + hh(prox.ini) + ' (em ' + falta(minAte(prox)) + ').';
            }
        }
        n.appendChild(p);
        if (!j.secreta && contaRegulares() >= ORDEM.length) {
            var b = document.createElement('button'); b.type = 'button'; b.className = 'cta peq'; b.textContent = 'Ir pro final ↓';
            b.addEventListener('click', function () { $('final').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' }); });
            n.appendChild(b);
        }
        n.hidden = false;
        n.classList.remove('on'); void n.offsetWidth; n.classList.add('on');
    }

    /* ---------- final ---------- */
    var finalMontado = false;
    function liberarFinal(animar) {
        var f = $('final');
        if (!finalMontado) {
            finalMontado = true;
            $('final-t').textContent = FINAL_TITULO;
            var box = $('final-txt');
            box.replaceChildren();
            var linhas = FINAL_PARAS.slice();
            if (achouSecreta()) linhas.push(FINAL_SECRETA);
            linhas.push(FINAL_FECHO);
            var els = linhas.map(function (t, i) {
                var p = document.createElement('p'); p.className = 'rv' + (i ? ' d1' : ''); p.textContent = t; box.appendChild(p); return p;
            });
            observarRevelar(els);
            $('final-form').querySelector('label').textContent = 'Agora é a sua vez: ' + FINAL_PERGUNTA.charAt(0).toLowerCase() + FINAL_PERGUNTA.slice(1);
            if (enviado) mostrarEnviado(ler('post7_resposta') || '');
        }
        f.hidden = false;
        if (animar && !reduz) { f.classList.remove('entra'); void f.offsetWidth; f.classList.add('entra'); }
    }

    function mostrarEnviado(txt) {
        $('final-form').hidden = true;
        $('final-ok').hidden = false;
        $('final-resp').textContent = txt;
    }

    // Integração com o Firestore (coleção "respostas", post 7) — mesmo formato dos posts 5 e 6.
    async function salvar(itens) {
        var G = 'https://www.gstatic.com/firebasejs/10.12.2/';
        var cfg = await import('./firebase-config.js');
        var app = await import(G + 'firebase-app.js');
        var fs = await import(G + 'firebase-firestore.js');
        var a = app.getApps()[0] || app.initializeApp(cfg.firebaseConfig);
        await fs.addDoc(fs.collection(fs.getFirestore(a), 'respostas'), { post: 7, itens: itens, criadoEm: fs.serverTimestamp() });
    }

    var enviando = false;
    async function enviar() {
        if (enviando) return;
        var ta = $('fr'), st = $('fstatus'), v = ta.value.trim();
        if (v.length < 3) {
            st.textContent = 'Escreve um pouquinho, do jeito que vier.';
            ta.classList.remove('erro'); void ta.offsetWidth; ta.classList.add('erro'); ta.focus();
            return;
        }
        enviando = true;
        var btn = $('fenviar'); btn.disabled = true; st.textContent = 'Enviando…';

        var nomes = ORDEM.concat(achouSecreta() ? ['madrugada'] : []).map(function (id) { return POR_ID[id].nome; }).join(', ');
        var itens = [
            { pergunta: FINAL_PERGUNTA, resposta: v },
            { pergunta: 'Janelas que ela abriu', resposta: nomes + (achouSecreta() ? ' (achou a secreta da madrugada)' : '') }
        ];

        if (DEMO) {
            st.textContent = 'Prévia: não enviei nada de verdade.';
            btn.disabled = false; enviando = false;
            mostrarEnviado(v);
            return;
        }
        try {
            await salvar(itens);
            gravar('post7_enviado', '1'); gravar('post7_resposta', v); enviado = true;
            st.textContent = '';
            mostrarEnviado(v);
            try { navigator.vibrate && navigator.vibrate([30, 40, 60]); } catch (_) { }
        } catch (e) {
            console.error('Erro ao enviar a resposta do post 7:', e);
            st.textContent = 'Não consegui enviar agora. Mantém essa página aberta e tenta de novo daqui a pouco.';
            btn.disabled = false;
        }
        enviando = false;
    }

    $('fenviar').addEventListener('click', enviar);
    $('fr').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); enviar(); }
    });
    $('fr').addEventListener('animationend', function () { $('fr').classList.remove('erro'); });

    /* ---------- saudação ---------- */
    function saudacao() {
        var t = agora(), j = atual, s = $('saudacao');
        var hora = '<b>' + pad(t.h) + ':' + pad(t.m) + '</b>';
        if (j.secreta) {
            s.innerHTML = 'Agora são ' + hora + '. Você não devia estar acordada, mas que bom que está. Uma coisa que eu não contei acabou de abrir.';
        } else {
            s.innerHTML = 'Agora são ' + hora + ', então o pedaço que abriu pra você é o da <b>' + j.nome + '</b>.';
        }
    }

    /* ---------- início ---------- */
    montarDial();
    desenharEstado();
    saudacao();
    mostrar(atual.id, false);
    if (contaRegulares() >= ORDEM.length) liberarFinal(false);

    // relógio andando (a cada segundo) e botões atualizados (a cada 20 s)
    if (HORA === null) {
        var ultimoMin = -1, ultimaJanela = atual.id;
        setInterval(function () {
            var t = agora();
            $('rel').textContent = pad(t.h) + ':' + pad(t.m);
            posicionar();
            if (t.m !== ultimoMin) {
                ultimoMin = t.m;
                var nova = janelaDe(t.h);
                var trocou = nova.id !== ultimaJanela;
                ultimaJanela = nova.id;
                desenharEstado();
                if (trocou) aviso('Mudou a hora: agora abriu a janela da ' + nova.nome + '.', null);
            }
        }, 1000);
    }

    /* ---------- revelar ao rolar (mesmo padrão dos outros posts) ---------- */
    // os elementos .rv fixos da página são tratados pelo main.js; aqui só garantimos o aviso/nota
})();
