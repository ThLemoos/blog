// Post #4: uma história em capítulos, com a boneca dançando no final.
(() => {
    const $ = id => document.getElementById(id);
    const reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const CORES = ['#ff5d8f', '#f6d9b0', '#b79cff', '#ffb3c9', '#8be9d0', '#ffd166'];
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ---------- barra de leitura ---------- */
    const barra = $('carrega-barra'), txt = $('carrega-txt');
    function progresso() {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
        const pct = Math.round(p * 100);
        barra.style.transform = `scaleX(${p})`;
        if (pct >= 99) { txt.textContent = 'Sandy: 100% ✓'; txt.classList.add('ok'); }
        else { txt.textContent = `lendo… ${pct}%`; txt.classList.remove('ok'); }
    }
    addEventListener('scroll', progresso, { passive: true });
    addEventListener('resize', progresso);
    progresso();

    /* ---------- capítulo 3: manhã, tarde, noite ---------- */
    const TEXTOS = {
        manha: 'O dia começa melhor só de saber que você existe nele. Nem precisa acontecer nada: saber já ajuda.',
        tarde: 'Quando o dia aperta, basta lembrar de você e a respiração desacelera. Os problemas continuam do mesmo tamanho, mas eu fica maior que eles.',
        noite: 'E no fim do dia, o melhor lugar pra chegar é perto de você. O dia acaba, mas a tranquilidade fica. Por isso que as vezes eu vou te ver nem que seja por 10 minutos ou sem que seja apenas uma carona até em casa depois do trabalho.'
    };
    const dia = $('dia'), painel = $('painel-dia');
    const abas = [...dia.querySelectorAll('[role="tab"]')];
    function periodo(p, foco) {
        dia.dataset.periodo = p;
        abas.forEach(a => {
            const on = a.dataset.p === p;
            a.setAttribute('aria-selected', on);
            a.tabIndex = on ? 0 : -1;
            if (on) { painel.setAttribute('aria-labelledby', a.id); if (foco) a.focus(); }
        });
        painel.textContent = TEXTOS[p];
        painel.classList.remove('troca'); void painel.offsetWidth; painel.classList.add('troca');
    }
    abas.forEach((a, i) => {
        a.addEventListener('click', () => periodo(a.dataset.p));
        a.addEventListener('keydown', e => {
            const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (d) { e.preventDefault(); periodo(abas[(i + d + abas.length) % abas.length].dataset.p, true); }
        });
    });
    periodo('manha');
    painel.classList.remove('troca');

    /* ---------- capítulo 5: anel 100% ---------- */
    const anel = $('anel-box'), num = $('anel-num');
    let contou = false;
    function contar() {
        if (contou) return; contou = true;
        anel.classList.add('on');
        if (reduz) { num.textContent = '100'; return; }
        const t0 = performance.now(), dur = 2000;
        (function passo(t) {
            const k = Math.min(1, (t - t0) / dur);
            num.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(passo);
        })(t0);
    }
    new IntersectionObserver((es, io) => {
        if (es.some(e => e.isIntersecting)) { contar(); io.disconnect(); }
    }, { threshold: .6 }).observe(anel);

    let aoTocar = () => { }; // o que acontece quando ela toca a musiquinha (muda conforme o final usado)

    /* ---------- final antigo: boneca dançando (só roda se o HTML dela estiver na página) ---------- */
    if ($('palco')) {
    const palco = $('palco'), boneca = $('boneca'), luzes = $('luzes'), notasV = $('notas-voando');

    // varal de luzes
    const N = 13;
    for (let i = 0; i < N; i++) {
        const l = document.createElement('i');
        l.className = 'luz';
        const x = 2 + (96 * i) / (N - 1);
        l.style.left = x + '%';
        l.style.top = (Math.sin(Math.PI * i / (N - 1)) * 18 + 2) + 'px';
        l.style.setProperty('--cor', CORES[i % CORES.length]);
        l.style.setProperty('--d', (i * 0.17).toFixed(2) + 's');
        luzes.appendChild(l);
    }

    // só anima enquanto está na tela
    let visivel = false, timerNotas = 0;
    function notaVoando() {
        if (reduz || !visivel || document.hidden) return;
        const n = document.createElement('span');
        n.className = 'nota-v';
        n.textContent = ['♪', '♫', '♬', '✦'][Math.floor(rnd(0, 4))];
        n.style.setProperty('--x', rnd(18, 80).toFixed(0) + '%');
        n.style.setProperty('--s', rnd(1.1, 2).toFixed(2) + 'rem');
        n.style.setProperty('--cor', CORES[Math.floor(rnd(0, CORES.length))]);
        n.style.setProperty('--dx', rnd(-40, 40).toFixed(0) + 'px');
        n.style.setProperty('--r', rnd(-25, 25).toFixed(0) + 'deg');
        n.addEventListener('animationend', () => n.remove());
        notasV.appendChild(n);
    }
    new IntersectionObserver(es => {
        visivel = es[0].isIntersecting;
        palco.classList.toggle('on', visivel);
        if (visivel && !timerNotas) timerNotas = setInterval(notaVoando, 650);
        if (!visivel) { clearInterval(timerNotas); timerNotas = 0; }
    }, { threshold: .25 }).observe(palco);

    // confete ao tocar
    let rapido = 0;
    function confete() {
        const r = palco.getBoundingClientRect();
        const cx = r.width / 2, cy = r.height * .38;
        const qtd = reduz ? 0 : 46;
        for (let i = 0; i < qtd; i++) {
            const c = document.createElement('i');
            c.className = 'confete';
            c.style.background = CORES[Math.floor(rnd(0, CORES.length))];
            if (Math.random() < .35) c.style.borderRadius = '50%';
            palco.appendChild(c);
            const dx = rnd(-170, 170), alto = rnd(-190, -80), queda = rnd(110, 260), rot = rnd(-720, 720);
            const a = c.animate([
                { transform: `translate(${cx}px,${cy}px) rotate(0)`, opacity: 1 },
                { transform: `translate(${cx + dx * .6}px,${cy + alto}px) rotate(${rot * .5}deg)`, opacity: 1, offset: .38 },
                { transform: `translate(${cx + dx}px,${cy + queda}px) rotate(${rot}deg)`, opacity: 0 }
            ], { duration: rnd(1500, 2400), easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
            a.onfinish = () => c.remove();
        }
        // dança mais rápido por um instante
        palco.style.setProperty('--b', '.8s');
        clearTimeout(rapido);
        rapido = setTimeout(() => palco.style.setProperty('--b', '1.2s'), 3200);
        for (let i = 0; i < 4; i++) setTimeout(notaVoando, i * 120);
        try { navigator.vibrate && navigator.vibrate(25); } catch (_) { }
    }
    boneca.addEventListener('click', confete);

    aoTocar = confete;
    }

    /* ---------- final: fogos de artifício que escrevem "Sandy" ---------- */
    const cv = $('fogos');
    if (cv) {
        const cx = cv.getContext('2d');
        const NOME_FINAL = 'Sandy';            // linha de cima (grande)
        const SUBTITULO_FINAL = 'a curiosinha'; // linha de baixo (menor); deixe '' pra não aparecer
        let W = 0, H = 0, dpr = 1, raf = 0, noAr = false, escreveu = false, proximo = 0, ligado = false;
        const foguetes = [], fagulhas = [], letras = [];
        const ROSA = [255, 93, 143], OURO = [246, 217, 176];
        const fundo = a => `rgba(14,7,24,${a})`;

        // pontos que formam o nome (lidos de um texto desenhado fora da tela)
        function alvos() {
            const o = document.createElement('canvas'); o.width = W; o.height = H;
            const c = o.getContext('2d');
            const fs = Math.min(W * .36, 140);
            c.font = `italic 600 ${fs}px Fraunces, Georgia, serif`;
            c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
            const duas = !!SUBTITULO_FINAL;
            c.fillText(NOME_FINAL, W / 2, H * (duas ? .38 : .45));
            if (duas) {
                c.font = `italic 500 ${Math.min(W * .13, fs * .4)}px Fraunces, Georgia, serif`;
                c.fillText(SUBTITULO_FINAL, W / 2, H * .66);
            }
            const d = c.getImageData(0, 0, W, H).data, passo = W < 420 ? 2 : 3, out = [];
            for (let y = 0; y < H; y += passo)
                for (let x = 0; x < W; x += passo)
                    if (d[(y * W + x) * 4 + 3] > 140) out.push([x, y]);
            return out;
        }
        function corX(x) {
            const t = Math.max(0, Math.min(1, x / W));
            return ROSA.map((v, i) => Math.round(v + (OURO[i] - v) * t));
        }
        function montaLetras(voando) {
            letras.length = 0;
            for (const [tx, ty] of alvos()) {
                letras.push({
                    tx, ty, x: voando ? W / 2 + rnd(-30, 30) : tx, y: voando ? H + rnd(0, 40) : ty,
                    c: corX(tx), f: rnd(0, 6.28), at: voando ? performance.now() + rnd(0, 900) : 0
                });
            }
        }
        function ajusta() {
            dpr = Math.min(devicePixelRatio || 1, 2);
            W = cv.clientWidth; H = cv.clientHeight;
            if (!W || !H) return;
            cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
            cx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cx.globalCompositeOperation = 'source-over';
            cx.fillStyle = fundo(1); cx.fillRect(0, 0, W, H);
            if (escreveu) { montaLetras(false); if (reduz) desenhaParado(); }
        }

        function lanca(x, alvoY) {
            foguetes.push({ x, y: H, vy: -(H - alvoY) / 38, alvoY, cor: Math.floor(rnd(0, 360)) });
        }
        function estoura(x, y, cor) {
            const n = 70, dois = Math.random() < .4;
            for (let i = 0; i < n; i++) {
                const a = rnd(0, 6.283), v = Math.sqrt(Math.random()) * 4.2 + .6;
                fagulhas.push({
                    x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                    vida: 1, d: rnd(.011, .02),
                    h: dois && i % 2 ? (cor + 150) % 360 : cor + rnd(-12, 12)
                });
            }
        }
        function escrever() {
            if (escreveu) return;
            escreveu = true; montaLetras(!reduz);
            estoura(W / 2, H * .4, 340);
        }

        function desenhaParado() {
            cx.globalCompositeOperation = 'source-over';
            for (const p of letras) {
                cx.fillStyle = `rgb(${p.c[0]},${p.c[1]},${p.c[2]})`;
                cx.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
            }
        }

        function quadro(agora) {
            raf = requestAnimationFrame(quadro);
            cx.globalCompositeOperation = 'source-over';
            cx.fillStyle = fundo(.22); cx.fillRect(0, 0, W, H);
            cx.globalCompositeOperation = 'lighter';

            if (escreveu && agora > proximo) {
                lanca(rnd(.12, .88) * W, rnd(.12, .38) * H);
                proximo = agora + rnd(1100, 2000);
            }
            for (let i = foguetes.length - 1; i >= 0; i--) {
                const f = foguetes[i];
                f.y += f.vy; f.vy *= .985;
                cx.fillStyle = `hsl(${f.cor},100%,80%)`;
                cx.beginPath(); cx.arc(f.x, f.y, 1.8, 0, 6.283); cx.fill();
                if (f.y <= f.alvoY || Math.abs(f.vy) < .6) { estoura(f.x, f.y, f.cor); foguetes.splice(i, 1); }
            }
            for (let i = fagulhas.length - 1; i >= 0; i--) {
                const p = fagulhas[i];
                p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy = p.vy * .985 + .035; p.vida -= p.d;
                if (p.vida <= 0) { fagulhas.splice(i, 1); continue; }
                cx.fillStyle = `hsla(${p.h},100%,70%,${p.vida})`;
                cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 6.283); cx.fill();
            }
            cx.globalCompositeOperation = 'source-over'; // letras sem somar brilho, pra manter rosa e dourado
            for (const p of letras) {
                if (agora > p.at) { p.x += (p.tx - p.x) * .075; p.y += (p.ty - p.y) * .075; }
                const br = .65 + .35 * Math.sin(agora * .004 + p.f);
                cx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${br})`;
                cx.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
            }
        }

        function comecar() {
            if (ligado) return; ligado = true;
            if (reduz) { escrever(); return; }
            const t = [[.28, .28, 0], [.72, .24, 700], [.5, .32, 1400]];
            t.forEach(([x, y, ms]) => setTimeout(() => lanca(x * W, y * H), ms));
            setTimeout(escrever, 2300);
        }
        function liga() { if (!raf && !reduz) raf = requestAnimationFrame(quadro); }
        function desliga() { cancelAnimationFrame(raf); raf = 0; }

        cv.addEventListener('pointerdown', e => {
            if (reduz) return;
            const r = cv.getBoundingClientRect();
            lanca(e.clientX - r.left, Math.max(30, e.clientY - r.top));
            try { navigator.vibrate && navigator.vibrate(15); } catch (_) { }
        });
        new ResizeObserver(() => { const w = cv.clientWidth; if (w && w !== W) ajusta(); }).observe(cv);
        ajusta();
        new IntersectionObserver(es => {
            noAr = es[0].isIntersecting;
            if (noAr) { liga(); (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(comecar); }
            else desliga();
        }, { threshold: .5 }).observe(cv);
        document.addEventListener('visibilitychange', () => { if (document.hidden) desliga(); else if (noAr) liga(); });
        aoTocar = () => { for (let i = 0; i < 3; i++) setTimeout(() => lanca(rnd(.15, .85) * W, rnd(.15, .35) * H), i * 250); };
    }

    /* ---------- musiquinha (opcional, só toca se ela clicar) ---------- */
    const btn = $('btn-musica');
    if (btn) {
    let ctx = null, passoMus = 0, timerMus = 0;
    const melodia = [12, 9, 7, 9, 12, 9, 7, 4, 7, 9, 7, 4, 2, 4, 7, 0];
    const baixo = [0, -5, -3, -7];
    const hz = s => 261.63 * Math.pow(2, s / 12);
    function toca(freq, t, dur, tipo, vol) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = tipo; o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + dur + .05);
    }
    function tick() {
        const t = ctx.currentTime + .03;
        toca(hz(melodia[passoMus % 16]), t, .28, 'triangle', .12);
        if (passoMus % 4 === 0) toca(hz(baixo[(passoMus / 4) % 4] - 12), t, .55, 'sine', .16);
        passoMus++;
    }
    function parar() {
        clearInterval(timerMus); timerMus = 0;
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = '🎵 Tocar uma musiquinha';
    }
    btn.addEventListener('click', () => {
        if (timerMus) return parar();
        try {
            ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
        } catch (_) { btn.textContent = 'Seu navegador não deixou tocar 😕'; return; }
        passoMus = 0; tick(); timerMus = setInterval(tick, 300); // 100 bpm
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = '⏸ Pausar a musiquinha';
        aoTocar();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && timerMus) parar(); });
    addEventListener('pagehide', () => { if (timerMus) parar(); });
    }
})();
