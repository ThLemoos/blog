// Post #5: cortinas, vídeo de fundo, créditos subindo e a resposta dela (salva no painel de adm).
(() => {
    const $ = id => document.getElementById(id);
    const reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;

    /* =====================================================================
       AJUSTES (mexa aqui se quiser)
       INICIO     = segundos do vídeo "limpo" (sem texto) antes de escurecer e os créditos começarem
       VELOCIDADE = velocidade dos créditos, em pixels por segundo (menor = mais devagar)
       O vídeo fica em loop, então ele continua tocando até ela terminar de ler.
       O quanto o vídeo escurece é a variável --escuro no começo do css/post5.css.
       ===================================================================== */
    const INICIO = 6;
    const VELOCIDADE = reduz ? 0 : 42;

    const video = $('video'), roll = $('roll'), creditos = $('creditos'), fim = $('fim');
    const cortinas = $('cortinas'), playBtn = $('play'), ctrl = $('ctrl'), pausaBtn = $('pausa');
    const body = document.body;

    let semVideo = false;     // arquivo do vídeo não encontrado: só o texto roda
    let pausadoSemVideo = false;
    let comecou = false;      // clicou no play
    let creditosOn = false;   // créditos já começaram
    let fimOn = false;
    let pos = 0, H = 0, VH = 0, ultimo = 0;

    function semArquivo() { semVideo = true; }
    video.querySelector('source').addEventListener('error', semArquivo);
    video.addEventListener('error', semArquivo);

    /* ---------- medidas ---------- */
    function medir() { VH = innerHeight; H = roll.offsetHeight; }
    const fimPos = () => VH * 0.72 + H; // quando a assinatura chega na parte de cima
    function aplicar() { roll.style.transform = `translate3d(0,${(VH - pos).toFixed(1)}px,0)`; }
    addEventListener('resize', () => { medir(); aplicar(); });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { medir(); aplicar(); });
    medir(); aplicar();

    /* ---------- cortinas ---------- */
    $('abrir').addEventListener('click', () => {
        cortinas.classList.add('aberta');
        $('voltar').hidden = false;
        setTimeout(() => { playBtn.hidden = false; }, reduz ? 0 : 1300);
    });

    /* ---------- play ---------- */
    function rodando() {
        if (!comecou) return false;
        return semVideo ? !pausadoSemVideo : (!video.paused && !video.ended);
    }
    function icone() { pausaBtn.textContent = rodando() ? '⏸' : '▶'; pausaBtn.setAttribute('aria-label', rodando() ? 'Pausar' : 'Continuar'); }

    playBtn.addEventListener('click', async () => {
        playBtn.hidden = true;
        comecou = true;
        ctrl.hidden = false;
        if (!semVideo) {
            try { await video.play(); } catch (e) { console.warn('Não consegui tocar o vídeo:', e); semVideo = true; }
        }
        icone();
        ultimo = performance.now();
        requestAnimationFrame(quadro);
    });
    video.addEventListener('play', icone);
    video.addEventListener('pause', icone);

    pausaBtn.addEventListener('click', () => {
        if (semVideo) { pausadoSemVideo = !pausadoSemVideo; icone(); return; }
        video.paused ? video.play() : video.pause();
    });
    $('pular').addEventListener('click', () => { if (!creditosOn) iniciarCreditos(); pos = fimPos(); });

    /* ---------- créditos ---------- */
    function iniciarCreditos() { creditosOn = true; body.classList.add('creditos-on'); }

    function mostrarFim() {
        fimOn = true;
        creditos.classList.add('sai');
        fim.hidden = false;
        void fim.offsetWidth;
        fim.classList.add('on');
    }
    $('rever').addEventListener('click', () => {
        fimOn = false; pos = 0;
        fim.classList.remove('on');
        setTimeout(() => { if (!fimOn) fim.hidden = true; }, 700);
        creditos.classList.remove('sai');
        aplicar();
    });

    function quadro(t) {
        requestAnimationFrame(quadro);
        const dt = Math.min(0.1, (t - ultimo) / 1000); ultimo = t;
        const vai = rodando();
        if (!creditosOn && comecou) {
            const inicio = semVideo ? 0 : Math.min(INICIO, (video.duration || INICIO) * 0.5);
            if (vai && (semVideo || video.currentTime >= inicio)) iniciarCreditos();
        }
        if (creditosOn && vai && !fimOn) pos += VELOCIDADE * dt;
        if (creditosOn && !fimOn && pos >= fimPos()) mostrarFim();
        aplicar();
    }

    /* arrastar / rolar com o dedo ou mouse pra ler no seu ritmo */
    let arrasto = null;
    creditos.addEventListener('pointerdown', e => { arrasto = e.clientY; });
    addEventListener('pointerup', () => { arrasto = null; });
    addEventListener('pointercancel', () => { arrasto = null; });
    creditos.addEventListener('pointermove', e => {
        if (arrasto == null || !creditosOn || fimOn) return;
        pos = Math.max(0, pos + (arrasto - e.clientY));
        arrasto = e.clientY;
    });
    creditos.addEventListener('wheel', e => {
        if (!creditosOn || fimOn) return;
        e.preventDefault();
        pos = Math.max(0, pos + e.deltaY);
    }, { passive: false });

    /* ---------- resposta dela ---------- */
    const enviar = $('enviar'), status = $('status');
    let enviou = false;
    enviar.addEventListener('click', async () => {
        if (enviou) return;
        const r1 = $('r1').value.trim(), r2 = $('r2').value.trim();
        if (!r1 && !r2) { status.textContent = 'Escreve pelo menos uma resposta, do jeito que vier.'; $('r1').focus(); return; }
        const itens = [];
        if (r1) itens.push({ pergunta: 'O que você sente quando está cantando e dançando assim?', resposta: r1 });
        if (r2) itens.push({ pergunta: 'Tem alguma música que sempre te deixa assim? Por quê?', resposta: r2 });
        enviar.disabled = true;
        status.textContent = 'Enviando…';
        try {
            const G = 'https://www.gstatic.com/firebasejs/10.12.2/';
            const { firebaseConfig } = await import('./firebase-config.js');
            const { initializeApp, getApps } = await import(G + 'firebase-app.js');
            const { getFirestore, collection, addDoc, serverTimestamp } = await import(G + 'firebase-firestore.js');
            const app = getApps()[0] || initializeApp(firebaseConfig);
            await addDoc(collection(getFirestore(app), 'respostas'), { post: 5, itens, criadoEm: serverTimestamp() });
            enviou = true;
            status.textContent = 'Recebi. Vou ler com calma. Obrigado por me contar.';
            enviar.textContent = '✓ Enviado';
        } catch (e) {
            console.error('Erro ao enviar resposta do post 5:', e);
            enviar.disabled = false;
            status.textContent = 'Não consegui enviar agora (' + (e.code || e.message || e) + '). Tenta de novo?';
        }
    });
})();