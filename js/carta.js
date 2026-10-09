// Carta surpresa compartilhada: usada no Post #2 (primeira leitura) e na seção "Cartas" da página inicial.
(function () {
    // ====== PERSONALIZE ======
    // Velocidade da escrita da carta (milissegundos por letra). Maior = mais devagar.
    const VELOCIDADE = 85;

    // A CARTA. Escreva do seu jeito. Linha em branco = parágrafo novo.
    // (Este texto é só um rascunho, troque pelo que você quer dizer a ela.)
    const CARTA = `Oi, minha branquinha.

Se você chegou até aqui, é porque o script gostou do que leu. E eu também.

Tenho observado você com atenção, e não só o que você escreve, mas também o que você sente e o que você é. E eu gosto de tudo isso.

Eu queria te dizer, sem código, sem algoritmo e sem fingir que é só uma brincadeira: você virou uma das melhores partes dos meus dias.

Não sei tudo o que vem pela frente, mas sei o quero construir com você, com calma, com cuidado, com respeito e com lealdade.

E eu gosto de tudo o que estamos construindo juntos, passo a passo e com a certeza de que o que vem pela frente vai ser ainda melhor.

Eu te vejo com futuro e não só por um momento.

Eu quero que a gente permanceça juntos também na presença de Deus porque ele tem coisas muito melhores pra gente do que a gente imagina.

O seu jeito de ser, de falar, de se expressar é algo que eu admiro bastante e que me faz querer estar cada vez mais perto de você.

Espero ter te arrancado aquele sorrisão, que só você tem, com essa carta. E espero que você guarde ela com respeito e admiração, porque eu guardei cada palavra que você me disse até agora.

Com admiração e respeito,
Thiago Lemos`;
    // =========================

    const CHAVE = 'carta-liberada';
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const esperar = ms => new Promise(r => setTimeout(r, reduz ? 0 : ms));

    // localStorage pode estar bloqueado (aba anônima etc.): nesse caso só vale até fechar a página
    let memoria = false;
    const liberada = () => { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return memoria; } };
    const liberar = () => { memoria = true; try { localStorage.setItem(CHAVE, '1'); } catch (e) { } document.dispatchEvent(new Event('carta-liberada')); };

    // ---- monta o modal (envelope + papel) ----
    const modal = document.createElement('div');
    modal.className = 'modal'; modal.id = 'surpresa'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Carta surpresa');
    modal.innerHTML = `
        <button type="button" class="modal-x" aria-label="Fechar">×</button>
        <div class="cena">
            <div class="env-back"></div>
            <div class="paper"><div class="paper-in"><p class="carta"><span class="txt"></span><span class="caret" hidden></span></p></div></div>
            <div class="env-front"></div>
            <div class="flap"></div>
        </div>
        <button type="button" class="cta ghost modal-fim" hidden>Fechar carta</button>`;
    document.body.appendChild(modal);

    const q = s => modal.querySelector(s);
    const cena = q('.cena'), cartaEl = q('.txt'), caret = q('.caret'), paperIn = q('.paper-in');
    const btnX = q('.modal-x'), btnFim = q('.modal-fim');
    let sessao = 0, voltarPara = null;

    function pausaDe(ch) {
        if (ch === '\n') return VELOCIDADE * 7;
        if ('.!?'.includes(ch)) return VELOCIDADE * 8;
        if (ch === ',') return VELOCIDADE * 4;
        return VELOCIDADE * (0.7 + Math.random() * 0.7);
    }

    async function abrir(origem) {
        const s = ++sessao;
        voltarPara = origem || null;
        cartaEl.textContent = ''; caret.hidden = true; caret.classList.remove('fim'); btnFim.hidden = true; btnFim.classList.remove('on');
        cena.className = 'cena';
        modal.hidden = false; void modal.offsetWidth; modal.classList.add('on');
        document.body.style.overflow = 'hidden';
        btnX.focus({ preventScroll: true });

        await esperar(1100); if (s !== sessao) return;
        cena.classList.add('abre');                       // aba abre
        await esperar(1300); if (s !== sessao) return;
        cena.classList.add('sobe');                       // papel sai de dentro
        await esperar(1900); if (s !== sessao) return;
        cena.classList.add('lendo');                      // envelope some, papel cresce
        await esperar(1900); if (s !== sessao) return;

        caret.hidden = false;
        if (reduz) { cartaEl.textContent = CARTA; }
        else {
            for (const ch of CARTA) {
                if (s !== sessao) return;
                cartaEl.textContent += ch;
                paperIn.scrollTop = paperIn.scrollHeight;
                await esperar(pausaDe(ch));
            }
        }
        if (s !== sessao) return;
        caret.classList.add('fim');
        await esperar(1500); if (s !== sessao) return;
        btnFim.hidden = false; void btnFim.offsetWidth; btnFim.classList.add('on');
    }

    function fechar() {
        sessao++;
        modal.classList.remove('on');
        document.body.style.overflow = '';
        setTimeout(() => { if (!modal.classList.contains('on')) modal.hidden = true; }, reduz ? 0 : 400);
        if (voltarPara) voltarPara.focus({ preventScroll: true });
    }

    btnX.addEventListener('click', fechar);
    btnFim.addEventListener('click', fechar);
    modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) fechar(); });

    window.Carta = { abrir, fechar, liberada, liberar };
})();