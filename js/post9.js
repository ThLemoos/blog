// Post #9: "Sem filtro". A foto passa por um visor de câmera (foco automático + clique) e o texto vai se formando
// palavra por palavra; cada linha dispara um efeito na foto.
(function () {
    'use strict';

    /* ============================ CONFIGURAÇÃO ============================ */
    // Foto: salve em img/foto-juntos.jpg (de preferência ~1200 px de altura, menos de 500 KB).
    var FOTO = {
        src: '../img/foto-juntos.jpeg',
        rostoX: '50%', rostoY: '40%',  // onde estão os rostos (o foco, o zoom e o brilho vão pra esse ponto)
        enquadra: '50% 40%'            // parte da foto que aparece quando ela não é 4:5
    };
    // Cada linha: t = texto; *palavras* ficam douradas; fx = efeito da foto quando a linha começa:
    //   clique (flash), riso (a foto "ri": balança + brilhos), calor (luz quente), sorriso (aproxima nos rostos),
    //   luz (brilhos), final (corações + a foto bate como um coração)
    var LINHAS = [
        { t: 'essa foto me pegou *desprevenido*.' },
        { t: 'eu não imaginava que aquela moça teria tirado uma foto espontânea da gente, mas aí está!', fx: 'clique' },
        { t: 'eu e você *rindo de verdade*, sem filtro e sem riso forçado pra uma simples foto', fx: 'riso' },
        { t: 'é assim que eu fico com você, ao seu lado você me tira as *melhores risadas* e me faz se sentir bem', fx: 'calor' },
        { t: 'quando você abre esse *sorriso* que você tem é impossível não ficar feliz', fx: 'sorriso' },
        { t: 'obrigado por me entregar o seu melhor lado e sua *melhor versão*', fx: 'luz' },
        { t: 'eu te amo ❤️', fx: 'final', amo: true }
    ];
    var MS_PALAVRA = 150;    // ms entre uma palavra e outra
    var PAUSA_LINHA = 1500;  // ms de pausa depois de cada linha
    /* ===================================================================== */

    /* ============================ SENHA ============================ */
    // A senha não fica escrita aqui, só o "hash" dela. Pra trocar, abra o console do navegador (F12) em qualquer página e rode:
    //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('fj:' + 'minhasenha')).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')))
    // (troque minhasenha; use minúsculas e sem acento) e cole o resultado em SENHA_HASH. Maiúsculas/acentos que ela digitar não importam.
    var SENHA_HASH = 'd154ed5469fd474149a586fd301473124138f4b22b9a288fb8f24546e7d8d0c8'; // senha atual: branquinha
    var TENTATIVAS = 3;                                        // erros permitidos
    var BLOQUEIO_ATE = new Date('2026-11-22T01:30:00-03:00');  // se errar tudo, fica bloqueada até esse horário (Brasília)
    var BLOQUEIO_MIN = 15;                                     // se esse horário já tiver passado, bloqueia por tantos minutos
    var LEMBRAR = true;                                        // true: depois de acertar, esse aparelho não pede de novo
    var DICA = 'Só você sabe. Digite pra abrir.';              // frase embaixo do título (pode virar uma dica da senha)
    /* ===================================================================== */

    var $ = function (id) { return document.getElementById(id); };
    var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = $('fj'), palco = $('palco'), foto = $('foto'), box = $('fj-foto'), T = $('texto');
    var sessao = 0, rapido = false, acordar = null, mexeu = false;

    root.style.setProperty('--fx', FOTO.rostoX); root.style.setProperty('--fy', FOTO.rostoY); root.style.setProperty('--pos', FOTO.enquadra);
    function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (_) { } }
    function espera(ms) { return new Promise(function (r) { var t = setTimeout(r, rapido ? 0 : ms); acordar = function () { clearTimeout(t); r(); }; }); }

    foto.src = FOTO.src;
    if (foto.complete && !foto.naturalWidth) box.classList.add('sem');
    foto.addEventListener('error', function () { box.classList.add('sem'); });

    // ---------- partículas ----------
    var cv = $('fj-fx'), g = cv.getContext && cv.getContext('2d'), W = 0, H = 0, parts = [], rodando = false;
    function ajusta() { var d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); }
    function coracao(x, y, s, rot) {
        g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath();
        g.moveTo(0, .35); g.bezierCurveTo(-1, -.4, -.55, -1, 0, -.45); g.bezierCurveTo(.55, -1, 1, -.4, 0, .35); g.closePath(); g.fill(); g.restore();
    }
    function estrela(x, y, s, rot) {
        g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
        for (var i = 0; i < 8; i++) { var r = i % 2 ? s * .22 : s; var a = i * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        g.closePath(); g.fill(); g.restore();
    }
    function centro() { var r = $('quadro').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .45, w: r.width, h: r.height }; }
    function solta(tipo, n) {
        if (reduz || !g) return;
        var c = centro();
        for (var i = 0; i < n; i++) {
            var a = Math.random() * 6.283, v = 1.5 + Math.random() * 4;
            if (tipo === 'h') parts.push({ k: 'h', x: c.x + (Math.random() - .5) * c.w * .7, y: c.y + c.h * .25, vx: Math.cos(a) * v * .7, vy: -Math.abs(Math.sin(a)) * v - 1.3, s: 6 + Math.random() * 12, rot: (Math.random() - .5) * .8, vr: (Math.random() - .5) * .05, vida: 0, max: 150 + Math.random() * 90, cor: Math.random() < .6 ? '255,93,143' : '255,190,205' });
            else if (tipo === 'r') parts.push({ k: 's', x: c.x + (Math.random() - .5) * c.w * 1.1, y: c.y + (Math.random() - .5) * c.h * .5, vx: Math.cos(a) * v * .6, vy: -1 - Math.random() * 2.6, s: 3 + Math.random() * 6, rot: Math.random() * 3, vr: .08, vida: 0, max: 70 + Math.random() * 50, cor: Math.random() < .5 ? '255,226,150' : '255,255,255', grav: .06 });
            else parts.push({ k: 's', x: c.x + (Math.random() - .5) * c.w * 1.2, y: c.y + (Math.random() - .5) * c.h, vx: (Math.random() - .5) * .5, vy: -.2 - Math.random() * .5, s: 3 + Math.random() * 6, rot: Math.random() * 3, vr: .03, vida: 0, max: 90 + Math.random() * 70, cor: Math.random() < .6 ? '255,236,190' : '255,255,255' });
        }
    }
    function ambiente() { for (var i = 0; i < 22; i++) parts.push({ k: 'b', x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3.2, vy: -(.1 + Math.random() * .3), a: .1 + Math.random() * .25, ph: Math.random() * 6, cor: Math.random() < .5 ? '255,214,160' : '255,140,180' }); }
    function quadro() {
        if (!rodando) return;
        g.clearRect(0, 0, W, H);
        for (var i = parts.length - 1; i >= 0; i--) {
            var p = parts[i];
            if (p.k === 'b') {
                p.y += p.vy; p.ph += .02; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
                g.fillStyle = 'rgba(' + p.cor + ',' + (p.a * (.6 + .4 * Math.sin(p.ph))) + ')'; g.beginPath(); g.arc(p.x + Math.sin(p.ph) * 8, p.y, p.r, 0, 6.283); g.fill(); continue;
            }
            p.vida++; p.x += p.vx; p.y += p.vy; if (p.k === 'h') p.vy += .02; if (p.grav) p.vy += p.grav; p.rot += p.vr;
            var t = p.vida / p.max; if (t >= 1) { parts.splice(i, 1); continue; }
            g.fillStyle = 'rgba(' + p.cor + ',' + (t < .15 ? t / .15 : 1 - (t - .15) / .85) * .9 + ')';
            p.k === 'h' ? coracao(p.x, p.y, p.s, p.rot) : estrela(p.x, p.y, p.s, p.rot);
        }
        requestAnimationFrame(quadro);
    }
    if (g) {
        ajusta(); ambiente(); rodando = true; requestAnimationFrame(quadro);
        addEventListener('resize', ajusta);
        document.addEventListener('visibilitychange', function () { if (!document.hidden && !rodando) { rodando = true; requestAnimationFrame(quadro); } else if (document.hidden) rodando = false; });
    }

    // ---------- efeitos ----------
    var CLASSES = ['rindo', 'calor', 'sorriso', 'final'];
    function limpa() { CLASSES.forEach(function (c) { root.classList.remove(c); }); }
    function efeito(fx) {
        if (!fx) return;
        if (fx === 'clique') { var f = $('flash'); f.classList.remove('vai'); void f.offsetWidth; f.classList.add('vai'); vibrar(25); return; }
        limpa();
        if (fx === 'riso') { root.classList.add('rindo'); solta('r', reduz ? 0 : 44); vibrar([30, 60, 30, 60, 30]); setTimeout(function () { root.classList.remove('rindo'); }, 3200); }
        else if (fx === 'calor') { root.classList.add('calor'); solta('s', 18); }
        else if (fx === 'sorriso') { root.classList.add('sorriso'); solta('s', 22); }
        else if (fx === 'luz') { solta('s', 40); }
        else if (fx === 'final') { root.classList.add('final'); solta('h', 46); vibrar([60, 80, 60, 80, 120]); setTimeout(function () { solta('h', 30); }, 1100); }
    }

    // ---------- texto ----------
    function monta(l) {
        var p = document.createElement('p'); p.className = 'fj-l' + (l.amo ? ' amo' : ''); var ws = [];
        l.t.split(/(\*[^*]+\*)/).forEach(function (parte) {
            if (!parte) return;
            var dest = parte.charAt(0) === '*';
            var txt = dest ? parte.slice(1, -1) : parte;
            txt.split(/(\s+)/).forEach(function (w) {
                if (!w) return;
                var s = document.createElement('span'); s.className = 'fj-w' + (dest ? ' e' : ''); s.textContent = w;
                p.appendChild(s); if (!/^\s+$/.test(w)) ws.push(s);
            });
        });
        return { p: p, ws: ws };
    }
    function seguir(el) {
        if (mexeu) return;
        var r = el.getBoundingClientRect();
        if (r.bottom > innerHeight - 60) scrollBy({ top: r.bottom - innerHeight + 140, behavior: reduz ? 'auto' : 'smooth' });
    }
    ['wheel', 'touchmove'].forEach(function (e) { addEventListener(e, function () { mexeu = true; }, { passive: true }); });

    async function conta() {
        var eu = ++sessao; rapido = reduz; mexeu = false;
        T.innerHTML = ''; $('fim').hidden = true; $('dica').style.opacity = ''; limpa(); parts = parts.filter(function (p) { return p.k === 'b'; });
        // 1) o visor: foco automático e clique
        palco.classList.remove('pronto'); var af = $('af'); af.classList.remove('vai'); void af.offsetWidth; af.classList.add('vai');
        var img = foto; img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
        await espera(4600); if (eu !== sessao) return;
        efeito('clique'); palco.classList.add('pronto'); await espera(1500); if (eu !== sessao) return;
        // 2) as linhas
        for (var i = 0; i < LINHAS.length; i++) {
            var l = LINHAS[i], m = monta(l);
            var anteriores = T.querySelectorAll('.fj-l'); if (anteriores.length) anteriores[anteriores.length - 1].classList.add('velha');
            T.appendChild(m.p); seguir(m.p);
            efeito(l.fx);
            for (var k = 0; k < m.ws.length; k++) {
                m.ws[k].classList.add('on');
                await espera(MS_PALAVRA + (/[,.!?]$/.test(m.ws[k].textContent) ? 380 : 0)); if (eu !== sessao) return;
            }
            // espaços não animam: garante que tudo apareça
            Array.prototype.forEach.call(m.p.children, function (c) { c.classList.add('on'); });
            seguir(m.p);
            if (i < LINHAS.length - 1) { await espera(PAUSA_LINHA); if (eu !== sessao) return; }
        }
        $('dica').style.opacity = 0; await espera(1200); if (eu !== sessao) return;
        $('fim').hidden = false; seguir($('fim'));
    }
    // toque no texto = acelera o que falta
    T.addEventListener('click', function () { rapido = true; acordar && acordar(); });
    $('de-novo').addEventListener('click', function () { rapido = reduz; scrollTo({ top: 0, behavior: reduz ? 'auto' : 'smooth' }); setTimeout(conta, reduz ? 0 : 500); });

    // ---------- porta com senha ----------
    var K_ERROS = 'fj_erros', K_BLOQ = 'fj_bloq', K_OK = 'fj_ok';
    function lg(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
    function sv(k, v) { try { localStorage.setItem(k, v); } catch (_) { } }
    function rm(k) { try { localStorage.removeItem(k); } catch (_) { } }
    function norm(t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
    async function hash(t) {
        var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fj:' + norm(t)));
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    }
    function hhmm(d) { return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); s = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); }
    var porta = $('porta'), inp = $('psenha'), ok = $('pok'), msgE = $('perro'), cad = $('cadeado'), tick = null;
    $('pdica').textContent = DICA;

    function bloqueadoAte() { var t = +lg(K_BLOQ) || 0; return t > Date.now() ? t : 0; }
    function mostraBloqueio(t) {
        inp.disabled = ok.disabled = true; inp.value = '';
        clearInterval(tick);
        function pinta() {
            var falta = t - Date.now();
            if (falta <= 0) { clearInterval(tick); rm(K_BLOQ); rm(K_ERROS); inp.disabled = ok.disabled = false; msgE.textContent = 'Pode tentar de novo.'; inp.focus(); return; }
            msgE.innerHTML = 'Muitas tentativas. 🔒 Bloqueado até <b>' + hhmm(new Date(t)) + '</b><br>faltam <b>' + mmss(falta) + '</b>';
        }
        pinta(); tick = setInterval(pinta, 1000);
    }
    function abre() {
        if (LEMBRAR) sv(K_OK, '1');
        clearInterval(tick); rm(K_ERROS); rm(K_BLOQ);
        cad.classList.add('abre'); vibrar([40, 50, 80]);
        setTimeout(function () { porta.classList.add('some'); }, reduz ? 0 : 500);
        setTimeout(function () { porta.hidden = true; root.hidden = false; ajusta(); conta(); }, reduz ? 0 : 1400);
    }
    $('pform').addEventListener('submit', async function (e) {
        e.preventDefault();
        if (bloqueadoAte()) return mostraBloqueio(bloqueadoAte());
        var v = inp.value; if (!v.trim()) return;
        var h = ''; try { h = await hash(v); } catch (_) { msgE.textContent = 'Seu navegador não conseguiu verificar. Abra pelo link https do site.'; return; }
        if (h === SENHA_HASH) return abre();
        var erros = (+lg(K_ERROS) || 0) + 1; sv(K_ERROS, String(erros));
        cad.classList.remove('erra'); void cad.offsetWidth; cad.classList.add('erra'); vibrar([80, 60, 80]); inp.value = ''; inp.focus();
        if (erros >= TENTATIVAS) {
            var fim = BLOQUEIO_ATE.getTime(); if (fim <= Date.now()) fim = Date.now() + BLOQUEIO_MIN * 60000;
            sv(K_BLOQ, String(fim)); mostraBloqueio(fim);
        } else { var resta = TENTATIVAS - erros; msgE.textContent = 'Senha errada. Resta' + (resta > 1 ? 'm ' : ' ') + resta + ' tentativa' + (resta > 1 ? 's' : '') + '.'; }
    });
    if (LEMBRAR && lg(K_OK) === '1') { porta.hidden = true; root.hidden = false; ajusta(); conta(); }
    else { var b0 = bloqueadoAte(); if (b0) mostraBloqueio(b0); else setTimeout(function () { inp.focus({ preventScroll: true }); }, 300); }
})();
