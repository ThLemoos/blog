(function () {
    'use strict';

    var FOTO = {
        src: '../img/sandy.jpeg',
        sorrisoX: '50%',  
        sorrisoY: '42%',   
        enquadra: '50% 30%' 
    };

    var TEXTOS = [
        { t: 'Eu ia fazer esse post falando sobre como foi boa a nossa primeira noite assistindo filme juntos. Mas eu quero dizer o quão linda você está nessa foto, e o que mais ela transmite pra mim.' },
        { t: 'Começando pelo seu [[sorriso|zoom]], que é algo que me impacta e me cativa a cada dia que passa. Ele é tão lindo e real que tranmite paz, eu esqueço de todos os problemas quando o vejo.' },
        { ini: 'sai', t: 'E o que mais me chama atenção é que, além da sua beleza exterior, a sua [[beleza interior|alma]] me ganha a cada dia que passa, me mostrando lealdade, companheirismo e responsabilidade com as suas decisões.' },
        { t: 'Obrigado por ser simplesmente quem você é, e não tenha medo de continuar se entregando e me mostrando como funciona o mundo de [[Sandy|sandy]], porque é uma das melhores coisas que me aconteceu este ano.' },
        { t: 'Eu te valorizo nos detalhes e te amo por tudo isso. [[❤️|final]]' }
    ];
    var VELOCIDADE = 50;      
    var PAUSA_ENTRE = 5000;   
    /* ===================================================================== */

    var $ = function (id) { return document.getElementById(id); };
    var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.querySelector('.p12'), palco = $('palco'), foto = $('foto'), wrap = $('foto-wrap');
    var P = $('p12-p'), dots = $('dots'), dica = $('dica'), fim = $('fim'), tudo = $('tudo');
    var sessao = 0, pular = false, avancar = null;

    root.style.setProperty('--fx', FOTO.sorrisoX); root.style.setProperty('--fy', FOTO.sorrisoY); root.style.setProperty('--pos', FOTO.enquadra);
    function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (_) { } }

    // ---------- foto (e fundo desfocado) ----------
    foto.src = FOTO.src;
    function fotoOk() { $('p12-bg').style.backgroundImage = 'url("' + FOTO.src + '")'; $('p12-bg').classList.add('on'); }
    function fotoErro() { wrap.classList.add('sem'); }
    if (foto.complete) { foto.naturalWidth ? fotoOk() : fotoErro(); }
    foto.addEventListener('load', fotoOk); foto.addEventListener('error', fotoErro);

    // inclinação suave com o mouse (computador)
    if (!reduz && matchMedia('(hover:hover)').matches) {
        palco.addEventListener('pointermove', function (e) {
            var r = palco.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            wrap.style.transform = 'perspective(800px) rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg)';
        });
        palco.addEventListener('pointerleave', function () { wrap.style.transform = ''; });
        wrap.style.transition = 'transform .25s ease-out';
    }

    // ---------- partículas ----------
    var cv = $('p12-fx'), g = cv.getContext && cv.getContext('2d'), W = 0, H = 0, dpr = 1, parts = [], rodando = false;
    function ajusta() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function coracao(x, y, s, rot) {
        g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath();
        g.moveTo(0, .35); g.bezierCurveTo(-1, -.4, -.55, -1, 0, -.45); g.bezierCurveTo(.55, -1, 1, -.4, 0, .35);
        g.closePath(); g.fill(); g.restore();
    }
    function estrela(x, y, s, rot) {
        g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
        for (var i = 0; i < 8; i++) { var r = i % 2 ? s * .22 : s; var a = i * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        g.closePath(); g.fill(); g.restore();
    }
    function ambiente() {
        for (var i = 0; i < 26; i++) parts.push({ k: 'b', x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3.5, vy: -(.1 + Math.random() * .3), a: .1 + Math.random() * .3, ph: Math.random() * 6, cor: Math.random() < .5 ? '255,214,160' : '255,140,180' });
    }
    function centro() { var r = $('polaroid').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }
    function explode(tipo, n) {
        if (reduz || !g) return;
        var c = centro();
        for (var i = 0; i < n; i++) {
            var a = Math.random() * Math.PI * 2, v = 1.2 + Math.random() * 3.6;
            if (tipo === 'h') parts.push({ k: 'h', x: c.x + (Math.random() - .5) * c.w * .6, y: c.y + c.h * .1, vx: Math.cos(a) * v * .8, vy: -Math.abs(Math.sin(a)) * v - 1.2, s: 6 + Math.random() * 12, rot: (Math.random() - .5) * .8, vr: (Math.random() - .5) * .04, vida: 0, max: 150 + Math.random() * 90, cor: Math.random() < .6 ? '255,93,143' : '255,190,205' });
            else parts.push({ k: 's', x: c.x + (Math.random() - .5) * c.w * 1.25, y: c.y + (Math.random() - .5) * c.h * 1.15, vx: (Math.random() - .5) * .5, vy: -.2 - Math.random() * .5, s: 3 + Math.random() * 7, rot: Math.random() * 3, vr: .03, vida: 0, max: 90 + Math.random() * 70, cor: Math.random() < .6 ? '255,236,190' : '255,255,255' });
        }
    }
    var chuva = 0;
    function quadro() {
        if (!rodando) return;
        g.clearRect(0, 0, W, H);
        if (chuva > 0) { chuva--; if (chuva % 5 === 0) explode('h', 1); }
        for (var i = parts.length - 1; i >= 0; i--) {
            var p = parts[i];
            if (p.k === 'b') {
                p.y += p.vy; p.ph += .01; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
                g.fillStyle = 'rgba(' + p.cor + ',' + (p.a * (.6 + .4 * Math.sin(p.ph * 3))) + ')'; g.beginPath(); g.arc(p.x + Math.sin(p.ph) * 14, p.y, p.r, 0, 6.283); g.fill(); continue;
            }
            p.vida++; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
            if (p.k === 'h') { p.vy += -.004; p.vx *= .985; }
            var t = p.vida / p.max, al = t < .12 ? t / .12 : 1 - Math.max(0, (t - .55) / .45);
            if (t >= 1) { parts.splice(i, 1); continue; }
            g.fillStyle = 'rgba(' + p.cor + ',' + Math.max(0, al * (p.k === 's' ? (.5 + .5 * Math.sin(p.vida * .3)) : .95)) + ')';
            p.k === 'h' ? coracao(p.x, p.y, p.s, p.rot) : estrela(p.x, p.y, p.s, p.rot);
        }
        requestAnimationFrame(quadro);
    }
    if (!reduz && g) {
        ajusta(); ambiente(); rodando = true; requestAnimationFrame(quadro);
        addEventListener('resize', ajusta);
        document.addEventListener('visibilitychange', function () { var v = !document.hidden; if (v && !rodando) { rodando = true; requestAnimationFrame(quadro); } else if (!v) rodando = false; });
    }

    // ---------- efeitos na foto ----------
    function efeito(nome) {
        if (nome === 'zoom') { palco.classList.add('zoom'); explode('s', 10); vibrar(20); }
        else if (nome === 'sai') { palco.classList.remove('zoom'); }
        else if (nome === 'alma') { palco.classList.remove('zoom'); palco.classList.add('alma'); explode('s', 16); vibrar(20); }
        else if (nome === 'sandy') { palco.classList.remove('zoom'); palco.classList.add('alma'); explode('s', 46); vibrar([20, 30, 20]); }
        else if (nome === 'final') { palco.classList.remove('zoom'); palco.classList.add('final'); explode('h', 34); chuva = 420; vibrar([60, 40, 140]); }
    }

    // ---------- texto ----------
    var seg = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('pt', { granularity: 'grapheme' }) : null;
    function letras(s) { return seg ? Array.from(seg.segment(s), function (x) { return x.segment; }) : Array.from(s); }
    // "texto [[x|fx]] mais" -> [{c, em, fx}]
    function tokeniza(t) {
        var out = [], re = /\[\[(.+?)\|(\w+)\]\]/g, i = 0, m;
        function add(str, em, fx) { letras(str).forEach(function (c, k) { out.push({ c: c, em: em, fx: k === 0 ? fx : null }); }); }
        while ((m = re.exec(t))) { add(t.slice(i, m.index), false, null); add(m[1], true, m[2]); i = re.lastIndex; }
        add(t.slice(i), false, null);
        return out;
    }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    function html(un, n) {
        var h = '', em = false;
        for (var i = 0; i < n; i++) {
            if (un[i].em !== em) { h += em ? '</span>' : '<span class="e">'; em = un[i].em; }
            h += esc(un[i].c);
        }
        return h + (em ? '</span>' : '');
    }
    var tokens = TEXTOS.map(function (x) { return tokeniza(x.t); });

    function esperar(ms, s) {
        return new Promise(function (res) {
            var t = setTimeout(done, ms); avancar = done;
            function done() { clearTimeout(t); avancar = null; res(); }
        });
    }
    function garanteVisivel() {
        var r = P.getBoundingClientRect(), extra = r.bottom - (innerHeight - 24);
        if (extra > 0) window.scrollBy({ top: extra, behavior: 'smooth' });
    }

    async function digita(s, i) {
        var un = tokens[i], tx = TEXTOS[i];
        if (tx.ini) efeito(tx.ini);
        P.classList.remove('vai'); void P.offsetWidth; P.classList.add('vai');
        P.innerHTML = ''; garanteVisivel();
        [].forEach.call(dots.children, function (d, k) { d.className = k < i ? 'ok' : k === i ? 'on' : ''; });
        pular = false;
        for (var n = 1; n <= un.length; n++) {
            if (s !== sessao) return false;
            if (un[n - 1].fx) efeito(un[n - 1].fx);
            P.innerHTML = html(un, n) + '<span class="cur"></span>';
            if (n % 40 === 0) garanteVisivel();
            if (pular) { // completa o parágrafo (os efeitos que faltam ainda disparam)
                for (var k = n; k < un.length; k++) if (un[k].fx) efeito(un[k].fx);
                break;
            }
            var c = un[n - 1].c;
            await new Promise(function (r) { setTimeout(r, c === '.' || c === '?' ? 320 : c === ',' ? 170 : VELOCIDADE + Math.random() * 16); });
        }
        P.innerHTML = html(un, un.length);
        pular = false;
        return s === sessao;
    }

    async function roda() {
        var s = ++sessao;
        fim.hidden = true; tudo.hidden = true; $('ler-tudo').setAttribute('aria-expanded', 'false');
        dica.style.opacity = 1; P.innerHTML = '';
        palco.classList.remove('zoom', 'alma', 'final');
        await new Promise(function (r) { setTimeout(r, 3600); }); if (s !== sessao) return;
        for (var i = 0; i < TEXTOS.length; i++) {
            if (!await digita(s, i)) return;
            if (i < TEXTOS.length - 1) { await esperar(PAUSA_ENTRE); if (s !== sessao) return; }
        }
        [].forEach.call(dots.children, function (d) { d.className = 'ok'; });
        dica.style.opacity = 0;
        await esperar(2200); if (s !== sessao) return;
        fim.hidden = false;
        fim.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // dots e "ler tudo"
    TEXTOS.forEach(function () { dots.appendChild(document.createElement('i')); });
    tokens.forEach(function (un) { var p = document.createElement('p'); p.innerHTML = html(un, un.length); tudo.appendChild(p); });
    $('ler-tudo').addEventListener('click', function () { tudo.hidden = !tudo.hidden; this.setAttribute('aria-expanded', String(!tudo.hidden)); this.textContent = tudo.hidden ? 'Ler tudo de uma vez' : 'Esconder o texto'; });
    $('de-novo').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); roda(); });
    $('texto').addEventListener('click', function () { if (avancar) avancar(); else pular = true; });

    if (reduz) { // sem animações: mostra tudo
        $('texto').hidden = true; palco.classList.add('alma'); fim.hidden = false; tudo.hidden = false;
        $('ler-tudo').hidden = true; $('de-novo').hidden = true;
    } else { roda(); }
})();
