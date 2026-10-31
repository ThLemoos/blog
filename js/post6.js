// Post #6: Cápsula do tempo (contagem, selar a mensagem dela, abrir no dia marcado).
(() => {
    const $ = id => document.getElementById(id);
    const reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const rnd = (a, b) => a + Math.random() * (b - a);

    const ABRE_EM = new Date('2027-01-01T09:00:00-03:00');
    const MENSAGEM_THIAGO = [
        'Chegou o grande dia!',
        'E eu espero que tenha dado tudo certo.',
        'Se tudo correu como o planejado, hoje estamos namorando e você com sua tão sonhada aliança de compromisso.',
        'E sinceramente? Espero que você esteja feliz e realizada.',
        'Hoje a sensação que eu tenho é de que vai dar tudo certo, e que a gente vai ser um casal que se admira e se respeita muito!',
        'Gostou do seu pedido de namoro? Eu já planejava ele desde a data de hoje: 31/10/2026.',
        'Enquanto eu escrevo isso aqui eu já estou planejando como tudo vai ser, o blog com atualizações apontando para o dia pedido, o restaurante que você me encontrou...',
        'A sensação de como vai ser a sua reação no dia e como você vai se sentir.',
        'Para a Sandy do futuro: espero que você sinta a mesma sensação que você sentia no dia 31/10/2026 e antes dele, e que você esteja feliz com a nossa relação.',
        'E eu tenho certeza que vou estar bem ao seu lado na abertura dessa "cápsula do tempo".',
        'Saiba que eu gosto de você de verdade, e que na abertura dessa carta você é realmente minha mulher com aliança e com pensamentos de futuro juntos.',
        'É muito bom ter você, Sandy do futuro!',
        'Obrigado por ser essa mulher que soma na minha vida.',
    ];

    const params = new URLSearchParams(location.search);
    const demo = params.get('demo');           // trancada | selada | aberta | (vazio = modo real)
    const body = document.body;

    /* ---------- estado ---------- */
    const guarda = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) { } };
    const le = k => { try { return localStorage.getItem(k); } catch (_) { return null; } };
    let selou = le('capsula6') === '1';
    if (demo === 'selada' || demo === 'surpresa') selou = true;
    if (demo === 'trancada') selou = false;
    const estaAberta = () => demo === 'aberta' || (!demo && Date.now() >= ABRE_EM.getTime());

    $('data-abre').textContent = ABRE_EM.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    /* ---------- prévia: barra com os três momentos ---------- */
    if (demo) {
        const nav = $('demo'); nav.hidden = false;
        nav.querySelectorAll('a').forEach(a => { if (a.getAttribute('href') === '?demo=' + demo) a.classList.add('on'); });
    }

    /* ---------- brilhos que sobem da cápsula ---------- */
    const brilhos = $('brilhos');
    function brilho(forte) {
        if (reduz || document.hidden) return;
        const b = document.createElement('i');
        b.className = 'p6-brilho';
        brilhos.appendChild(b);
        const dx = rnd(-120, 120), dy = rnd(-170, -60);
        const a = b.animate([
            { transform: `translate(${rnd(-50, 50)}px,${rnd(-10, 30)}px) scale(${rnd(.6, 1.2)})`, opacity: 0 },
            { opacity: 1, offset: .25 },
            { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0 }
        ], { duration: rnd(forte ? 1800 : 2600, forte ? 3000 : 4200), easing: 'ease-out' });
        a.onfinish = () => b.remove();
    }
    setInterval(() => brilho(body.classList.contains('aberta')), 520);

    /* ---------- campo de estrelas ---------- */
    (function estrelas() {
        const cv = $('estrelas'), cx = cv.getContext('2d');
        let W = 0, H = 0, dpr = 1, lista = [];
        function ajusta() {
            dpr = Math.min(devicePixelRatio || 1, 2);
            W = cv.clientWidth; H = cv.clientHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            cx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.round(W * H / 5500);
            lista = Array.from({ length: n }, () => ({
                x: Math.random() * W, y: Math.random() * H, r: rnd(.4, 1.5),
                f: rnd(0, 6.28), v: rnd(.6, 2), d: rnd(.01, .05), g: Math.random() < .12
            }));
        }
        function quadro(t) {
            cx.clearRect(0, 0, W, H);
            for (const s of lista) {
                const br = .35 + .65 * Math.abs(Math.sin(t * .001 * s.v + s.f));
                cx.fillStyle = s.g ? `rgba(246,217,176,${br})` : `rgba(235,225,255,${br * .8})`;
                cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill();
                if (!reduz) { s.y -= s.d; if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; } }
            }
            if (!reduz) requestAnimationFrame(quadro);
        }
        addEventListener('resize', ajusta);
        ajusta();
        requestAnimationFrame(quadro);
    })();

    /* ---------- contagem regressiva ---------- */
    const pad = n => String(n).padStart(2, '0');
    function contagem() {
        let ms = ABRE_EM.getTime() - Date.now();
        if (demo === 'trancada' || demo === 'selada') ms = Math.max(ms, 1000 * 60 * 60 * 24 * 92 + 1000 * 60 * 14); // dá um valor fixo na prévia
        if (ms <= 0) { if (!body.classList.contains('aberta')) render(true); return; }
        const s = Math.floor(ms / 1000);
        $('c-d').textContent = Math.floor(s / 86400);
        $('c-h').textContent = pad(Math.floor(s % 86400 / 3600));
        $('c-m').textContent = pad(Math.floor(s % 3600 / 60));
        $('c-s').textContent = pad(s % 60);
    }
    setInterval(contagem, 1000);
    contagem();

    /* ---------- mostrar o estado certo ---------- */
    function paragrafos(alvo, textos) {
        alvo.replaceChildren(...textos.map(t => { const p = document.createElement('p'); p.textContent = t; return p; }));
    }
    function render(animar) {
        const aberta = estaAberta() || animar;
        body.classList.toggle('aberta', !!aberta);
        body.classList.toggle('selada', !aberta && selou);
        $('fechada').hidden = !!aberta;
        $('aberta').hidden = !aberta;
        $('sub').innerHTML = aberta ? 'A cápsula <b>está aberta</b>.' : 'Fechada até <b id="data-abre">' +
            ABRE_EM.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) + '</b>.';

        if (aberta) {
            paragrafos($('texto-thiago'), MENSAGEM_THIAGO);
            let itens = null;
            try { itens = JSON.parse(le('capsula6_itens') || 'null'); } catch (_) { }
            if (demo === 'aberta') itens = [
                { pergunta: 'Como você está hoje?', resposta: '[aqui aparece o que a Sandy escreveu]' },
                { pergunta: 'O que você espera que tenha acontecido até lá?', resposta: '[a resposta dela, do jeito que ela escreveu]' },
                { pergunta: 'Uma coisa que você quer que eu lembre desse momento.', resposta: '[a terceira resposta dela]' }
            ];
            const alvo = $('texto-ela'); alvo.replaceChildren();
            if (itens && itens.length) {
                itens.forEach(it => {
                    const q = document.createElement('p'); q.className = 'p6-pergunta'; q.textContent = it.pergunta;
                    const r = document.createElement('p'); r.textContent = it.resposta;
                    alvo.append(q, r);
                });
            } else {
                const p = document.createElement('p');
                p.textContent = 'A sua mensagem ficou guardada comigo. Eu vou te mostrar.';
                alvo.append(p);
            }
        } else {
            const ela = $('slot-ela');
            ela.classList.toggle('cheio', selou);
            $('slot-ela-txt').textContent = selou ? 'mensagem selada' : 'esperando a sua';
            $('form').classList.toggle('some', selou);
            $('form').hidden = selou;
            $('pos').hidden = !selou;
        }
    }
    render();

    /* ---------- selar a mensagem dela ---------- */
    const status = $('status'), btn = $('selar');
    const PERGUNTAS = [
        ['q1', 'Como você está hoje?'],
        ['q2', 'O que você espera que tenha acontecido até lá?'],
        ['q3', 'Uma coisa que você quer que eu lembre desse momento.']
    ];
    btn.addEventListener('click', async () => {
        const itens = PERGUNTAS.map(([id, pergunta]) => ({ pergunta, resposta: $(id).value.trim() })).filter(i => i.resposta);
        if (!itens.length) { status.textContent = 'Escreve pelo menos um pouquinho, do jeito que vier.'; $('q1').focus(); return; }
        btn.disabled = true;
        status.textContent = 'Selando…';

        let salvou = true;
        if (!demo) {
            try {
                const G = 'https://www.gstatic.com/firebasejs/10.12.2/';
                const { firebaseConfig } = await import('./firebase-config.js');
                const { initializeApp, getApps } = await import(G + 'firebase-app.js');
                const { getFirestore, collection, addDoc, serverTimestamp } = await import(G + 'firebase-firestore.js');
                const app = getApps()[0] || initializeApp(firebaseConfig);
                await addDoc(collection(getFirestore(app), 'respostas'), { post: 6, itens, criadoEm: serverTimestamp() });
            } catch (e) {
                console.error('Erro ao selar a cápsula:', e);
                salvou = false;
                btn.disabled = false;
                status.textContent = 'Não consegui selar agora (' + (e.code || e.message || e) + '). Tenta de novo?';
            }
        }
        if (!salvou) return;

        guarda('capsula6', '1'); guarda('capsula6_itens', JSON.stringify(itens));
        selou = true;
        if (!demo) Surpresa3.liberar();   // destranca a Surpresa #3 na página inicial
        status.textContent = '';
        window.scrollTo({ top: 0, behavior: reduz ? 'auto' : 'smooth' });
        body.classList.add('selando');
        for (let i = 0; i < 14; i++) setTimeout(() => brilho(true), 1300 + i * 90);
        setTimeout(() => {
            body.classList.remove('selando'); render();
            // a Surpresa #3 abre sozinha, logo depois da cápsula fechar
            setTimeout(() => Surpresa3.abrir(btn), reduz ? 0 : 1400);
        }, reduz ? 0 : 2400);
    });

    /* ---------- Surpresa #3: reabrir e prévia ---------- */
    const reabrir = $('reabrir');
    if (reabrir) reabrir.addEventListener('click', () => Surpresa3.abrir(reabrir));
    if (demo === 'surpresa') setTimeout(() => Surpresa3.abrir(), 600);

    /* ---------- quando abre ao vivo ---------- */
    if (estaAberta() && !reduz) for (let i = 0; i < 24; i++) setTimeout(() => brilho(true), i * 120);
})();