(function () {
    // ====== PERSONALIZE ======
    const CHAVE = 'surpresa3-liberada';       // marca que destranca o cartão na página inicial
    const CHAVE_RESP = 'surpresa3-resposta';  // guarda o que ela respondeu (pra mostrar ao reabrir)

    const TITULO = 'Uma coisa pra hoje';

    // A CARTA. Cada item é um parágrafo que aparece depois do anterior (ela pode tocar pra acelerar).
    // (Este texto é um rascunho, troque pelo que você quer dizer a ela.)
    const TEXTO = [
        'A cápsula guarda o que é pra janeiro. Isso aqui é pra hoje.',
        'Eu quis que você tivesse algo pra ler agora.',
        'É bom ter alguém pra contar como eu tenho você. E sim, você é onde eu me sinto tranquilo e em paz.',
        'Depois de uma semana de trabalho cansativa demais, ter você pra convesar tomando um mineirinho e comendo 3 salgados foi uma sensação boa demais kkk.',
        'Eu gosto de você e esse sentimento tem aumentado conforme o tempo vai passando e vamos vivendo coisas juntos.',
        'Você trouxe uma alegria que eu não sabia que me faltava, e uma calma que eu não sabia que precisava. As duas ao mesmo tempo.',
        'Então hoje eu só queria te dizer isso: é bom ter você na minha vida e eu gosto de estar com você.'
    ];
    const ASSINATURA = '— Thiago Lemos';

    // O que ela responde no final
    const PERGUNTA = 'Agora é sua vez!!!';
    const PLACEHOLDER = 'Dá seu jeito e INSPIRE-SE!';
    // =========================

    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const demo = new URLSearchParams(location.search).has('demo'); // na prévia não grava nada de verdade
    let memoria = false, memResp = '';
    const esperar = ms => new Promise(r => setTimeout(r, reduz ? Math.min(ms, 40) : ms));
    const vibrar = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) { } };

    const liberada = () => { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return memoria; } };
    const liberar = () => { memoria = true; try { localStorage.setItem(CHAVE, '1'); } catch (e) { } document.dispatchEvent(new Event('surpresa3-liberada')); };
    const respondida = () => { try { return localStorage.getItem(CHAVE_RESP) || ''; } catch (e) { return memResp; } };
    const guardaResp = t => { memResp = t; try { localStorage.setItem(CHAVE_RESP, t); } catch (e) { } };

    let modal = null, ultimoFoco = null, rodada = 0;

    function construir() {
        modal = document.createElement('div');
        modal.className = 's3'; modal.hidden = true;
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Surpresa #3: ' + TITULO);
        modal.innerHTML = `
            <button type="button" class="s3-x" aria-label="Fechar">×</button>
            <div class="s3-brilho" aria-hidden="true"></div>
            <div class="s3-palco">
                <!-- 1) envelope -->
                <div class="s3-env" id="s3-env">
                    <span class="s3-tag">Surpresa #3</span>
                    <button type="button" class="s3-envelope" id="s3-lacre" aria-label="Quebrar o lacre e abrir a surpresa">
                        <span class="s3-aba" aria-hidden="true"></span>
                        <span class="s3-corpo" aria-hidden="true"></span>
                        <span class="s3-lacre" aria-hidden="true">S</span>
                    </button>
                    <p class="s3-dica">toque no lacre</p>
                </div>

                <!-- 2) carta -->
                <div class="s3-carta" id="s3-carta" hidden>
                    <span class="s3-tag">${TITULO}</span>
                    <div class="s3-texto" id="s3-texto" aria-live="polite"></div>
                    <p class="s3-continua" id="s3-continua" hidden>toque pra continuar</p>

                    <!-- 3) a vez dela -->
                    <div class="s3-vez" id="s3-vez" hidden>
                        <p class="s3-ass">${ASSINATURA}</p>
                        <label class="s3-pergunta" for="s3-resp">${PERGUNTA}</label>
                        <textarea id="s3-resp" rows="4" maxlength="800" placeholder="${PLACEHOLDER}"></textarea>
                        <button type="button" class="cta" id="s3-enviar">Enviar pra mim</button>
                        <p class="s3-status" id="s3-status" role="status"></p>
                    </div>

                    <div class="s3-ja" id="s3-ja" hidden>
                        <span class="s3-tag">você me disse</span>
                        <p class="s3-ja-txt" id="s3-ja-txt"></p>
                        <p class="s3-obrigado">Guardei com cuidado. Obrigado por me dizer.</p>
                    </div>

                    <button type="button" class="cta ghost s3-fechar" id="s3-fechar" hidden>Fechar</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('.s3-x').addEventListener('click', fechar);
        modal.querySelector('#s3-fechar').addEventListener('click', fechar);
        document.addEventListener('keydown', e => { if (modal && !modal.hidden && e.key === 'Escape') fechar(); });
    }

    const $ = id => modal.querySelector('#' + id);

    function fechar() {
        if (!modal || modal.hidden) return;
        rodada++;                      // cancela qualquer leitura em andamento
        modal.classList.remove('on');
        document.body.classList.remove('s3-aberto');
        document.documentElement.classList.remove('s3-aberto');
        setTimeout(() => { modal.hidden = true; }, reduz ? 0 : 450);
        if (ultimoFoco && ultimoFoco.focus) try { ultimoFoco.focus(); } catch (_) { }
    }

    // espera um tempo OU um toque (pra ela acelerar)
    function esperaToque(ms, minha) {
        return new Promise(res => {
            let ok = false;
            const fim = () => { if (ok) return; ok = true; clearTimeout(t); modal.removeEventListener('pointerdown', toque); res(); };
            const toque = e => { if (e.target.closest('button,textarea,label')) return; fim(); };
            const t = setTimeout(fim, reduz ? 40 : ms);
            modal.addEventListener('pointerdown', toque);
        });
    }

    async function ler(minha) {
        const alvo = $('s3-texto');
        alvo.replaceChildren();
        for (let i = 0; i < TEXTO.length; i++) {
            if (minha !== rodada) return;
            const p = document.createElement('p');
            p.textContent = TEXTO[i];
            alvo.appendChild(p);
            requestAnimationFrame(() => p.classList.add('on'));
            p.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' });
            if (i < TEXTO.length - 1) {
                $('s3-continua').hidden = false;
                await esperaToque(Math.max(2200, TEXTO[i].length * 55), minha);
                $('s3-continua').hidden = true;
            }
        }
        if (minha !== rodada) return;
        await esperar(900);
        mostrarFim();
    }

    function mostrarFim() {
        const resp = respondida();
        if (resp) {
            $('s3-ja-txt').textContent = resp;
            $('s3-ja').hidden = false;
            $('s3-fechar').hidden = false;
        } else {
            $('s3-vez').hidden = false;
        }
        const alvo = resp ? $('s3-ja') : $('s3-vez');
        alvo.classList.add('on');
        alvo.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' });
    }

    // envio da resposta dela (mesmo formato do post2/post5/post6: coleção "respostas", post 6)
    async function enviar() {
        const txt = $('s3-resp').value.trim(), status = $('s3-status'), btn = $('s3-enviar');
        if (!txt) { status.textContent = 'Escreve pelo menos uma frase, do jeito que vier.'; $('s3-resp').focus(); return; }
        btn.disabled = true; status.textContent = 'Enviando…';
        if (!demo) {
            try {
                const G = 'https://www.gstatic.com/firebasejs/10.12.2/';
                const { firebaseConfig } = await import('./firebase-config.js');
                const { initializeApp, getApps } = await import(G + 'firebase-app.js');
                const { getFirestore, collection, addDoc, serverTimestamp } = await import(G + 'firebase-firestore.js');
                const app = getApps()[0] || initializeApp(firebaseConfig);
                await addDoc(collection(getFirestore(app), 'respostas'), {
                    post: 6,
                    itens: [{ pergunta: 'Surpresa #3 · ' + PERGUNTA, resposta: txt }],
                    criadoEm: serverTimestamp()
                });
            } catch (e) {
                console.error('Erro ao enviar a resposta da Surpresa #3:', e);
                btn.disabled = false;
                status.textContent = 'Não consegui enviar agora (' + (e.code || e.message || e) + '). Tenta de novo?';
                return;
            }
        }
        if (!demo) guardaResp(txt);
        vibrar(30);
        $('s3-vez').hidden = true;
        $('s3-ja-txt').textContent = txt;
        $('s3-ja').hidden = false; $('s3-ja').classList.add('on');
        $('s3-fechar').hidden = false;
        $('s3-ja').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' });
    }

    function abrir(origem) {
        if (!modal) { construir(); $('s3-enviar').addEventListener('click', enviar); }
        ultimoFoco = origem || document.activeElement;
        rodada++;
        const minha = rodada;

        // volta tudo ao começo
        $('s3-env').hidden = false; $('s3-env').classList.remove('abre');
        $('s3-carta').hidden = true; $('s3-carta').classList.remove('on');
        $('s3-vez').hidden = true; $('s3-vez').classList.remove('on');
        $('s3-ja').hidden = true; $('s3-ja').classList.remove('on');
        $('s3-fechar').hidden = true; $('s3-continua').hidden = true;
        $('s3-texto').replaceChildren();
        $('s3-status').textContent = ''; $('s3-enviar').disabled = false;

        modal.hidden = false;
        document.body.classList.add('s3-aberto');
        document.documentElement.classList.add('s3-aberto');
        requestAnimationFrame(() => modal.classList.add('on'));

        const lacre = $('s3-lacre');
        lacre.onclick = async () => {
            if ($('s3-env').classList.contains('abre')) return;
            $('s3-env').classList.add('abre');
            vibrar([20, 40, 20]);
            await esperar(1500);
            if (minha !== rodada) return;
            $('s3-env').hidden = true;
            $('s3-carta').hidden = false;
            requestAnimationFrame(() => $('s3-carta').classList.add('on'));
            await esperar(700);
            ler(minha);
        };
        try { lacre.focus({ preventScroll: true }); } catch (_) { }
    }

    window.Surpresa3 = { abrir, liberada, liberar, respondida };
})();