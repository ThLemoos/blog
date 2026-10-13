// Surpresa #2: "segredo.log". Liberada ao abrir os 4 cartões do Post #3 (js/post3.js grava a chave abaixo).
// Fluxo: terminal "descriptografando" -> trava em 97% -> ela precisa SEGURAR o dedo na digital -> glitch -> texto revelado aos poucos.
// Depende de css/carta.css (.modal, .modal-x) e css/segredo.css.
(function () {
    // ====== PERSONALIZE ======
    const CHAVE = 'historia-liberada';
    const SEGURAR_MS = 2800;
    const NOME = 'branquinha';

    const TEXTO = [
        { t: 'Eu escrevi isso umas dez vezes e apaguei todas.', espera: 1800 },
        { t: 'Tem coisa que código não resolve. Eu tentei. Tentei transformar em função, em comentário, em piada. Não coube em nenhum.', espera: 1600, toque: true },
        { t: 'Então vou dizer do jeito mais simples que eu sei.', espera: 2200 },
        { t: 'Lembra do aniversário que nós fomos e você disse que me viu te olhar algumas vezes?', espera: 1800 },
        { t: 'Então, eu já estava te observando dali. Sua postura, seu sorriso, seu olhar, seu jeito de falar.', espera: 2600 },
        { t: 'E a partir desse momento, meu interesse por você aumentou um pouco, porque já existia.', espera: 2000, toque: true },
        { t: 'Desde a primeira mensagem até agora, o seu jeito de ser não mudou e só tem aumentado a intensidade, e eu valorizo isso demais.', espera: 2200 },
        { t: 'Valeu e tem valido a pena te conhecer melhor a cada dia, e eu não esperava que teria você da forma que tenho hoje.', espera: 2200, toque: true },
        { t: 'Ter você por completa, ter o seu sorriso, ter a sua forma de cuidar(me dando esporro), ter todo o seu jeito de ser e tudo o que você é. E sim, é algo que eu gosto no meu dia.', espera: 2600 },
        { t: 'Então sem segurar qualquer palavra porque não precisamos mais disso', espera: 3200 },
        { t: '.....', espera: 3200, toque: true },
        { t: 'Eu realmente gosto de ter sua atenção, sua presença e tudo o que você representa, Sandy de Vilar', espera: 3200 },
        { t: 'Aos poucos você está me fazendo se expressar de formas que eu nem imaginava fazer.', espera: 1200 },
        { t: 'E mais uma vez, vê se coloca um sorrisão no rosto, porque você merece isso!', espera: 1200 }
    ];
    const ASSINATURA = '— Thiago Lemos';
    // =========================

    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let memoria = false;
    const liberada = () => { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return memoria; } };
    const esperar = ms => new Promise(r => setTimeout(r, reduz ? Math.min(ms, 50) : ms));
    const vibrar = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) { } };

    const DIGITAL = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
        <path d="M10 40V29a22 22 0 0 1 44 0v4"/>
        <path d="M17 46V29a15 15 0 0 1 30 0v9" stroke-dasharray="26 4 40 4 100"/>
        <path d="M24 52V29a8 8 0 0 1 16 0v15" stroke-dasharray="30 4 100"/>
        <path d="M32 31v24"/>
        <path d="M47 46v8"/>
        <path d="M54 40v6"/>
        <path d="M10 46v4"/>
    </svg>`;

    const modal = document.createElement('div');
    modal.className = 'modal seg'; modal.id = 'segredo-modal'; modal.hidden = true;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Surpresa: segredo.log');
    modal.innerHTML = `
        <button type="button" class="modal-x" aria-label="Fechar">×</button>
        <div class="seg-pulso" aria-hidden="true"></div>
        <div class="seg-box" id="seg-box">
            <div class="seg-term" id="seg-term" aria-live="polite"></div>
            <div class="seg-bar" id="seg-bar" hidden><div class="seg-fill" id="seg-fill"></div><span id="seg-pct">0%</span></div>
            <div class="seg-hold" id="seg-hold" hidden>
                <button type="button" class="seg-hold-btn" id="seg-hold-btn" aria-label="Segure o dedo na digital para continuar"><span class="seg-dedo">${DIGITAL}</span></button>
                <p id="seg-hold-txt">segure o dedo aqui</p>
            </div>
            <div class="seg-msg" id="seg-msg"></div>
            <div class="seg-toque" id="seg-toque" hidden>toque pra continuar</div>
            <button type="button" class="cta ghost seg-fechar" id="seg-fechar" hidden>Fechar</button>
        </div>`;
    document.body.appendChild(modal);

    const q = s => modal.querySelector(s);
    const box = q('#seg-box'), term = q('#seg-term'), bar = q('#seg-bar'), fill = q('#seg-fill'), pct = q('#seg-pct');
    const hold = q('#seg-hold'), holdBtn = q('#seg-hold-btn'), holdTxt = q('#seg-hold-txt');
    const msg = q('#seg-msg'), toque = q('#seg-toque'), btnFim = q('#seg-fechar'), btnX = q('.modal-x');
    let sessao = 0, voltarPara = null;
    const rolar = () => { box.scrollTop = box.scrollHeight; };

    // linha de terminal digitada letra a letra
    async function linha(s, texto, cls) {
        const p = document.createElement('p');
        if (cls) p.className = cls;
        term.appendChild(p);
        for (const ch of texto) {
            if (s !== sessao) return false;
            p.textContent += ch; rolar();
            await esperar(ch === ' ' ? 18 : 24 + Math.random() * 22);
        }
        return true;
    }

    // letras embaralhadas que se resolvem uma a uma
    function decodificar(s, el, texto, ms) {
        return new Promise(res => {
            if (reduz) { el.textContent = texto; return res(); }
            const SIM = '01{}<>/#$%&*+=?';
            const ini = performance.now();
            (function passo(now) {
                if (s !== sessao) return res();
                const f = Math.min(1, (now - ini) / ms);
                const fixo = Math.floor(f * texto.length);
                let out = texto.slice(0, fixo);
                for (let i = fixo; i < texto.length; i++) out += texto[i] === ' ' ? ' ' : SIM[(Math.random() * SIM.length) | 0];
                el.textContent = out; rolar();
                if (f < 1) requestAnimationFrame(passo); else { el.textContent = texto; res(); }
            })(ini);
        });
    }

    const tocar = s => new Promise(res => {
        toque.hidden = false; rolar();
        const ir = () => { modal.removeEventListener('click', ir); toque.hidden = true; res(); };
        setTimeout(() => { if (s === sessao) modal.addEventListener('click', ir); else res(); }, 300);
    });

    // barra que trava em 97%
    async function barra(s) {
        bar.hidden = false;
        const alvo = 97, dur = reduz ? 0 : 4200, ini = performance.now();
        await new Promise(res => (function passo(now) {
            if (s !== sessao) return res();
            const f = dur ? Math.min(1, (now - ini) / dur) : 1;
            const v = Math.round(alvo * (1 - Math.pow(1 - f, 2.2)));
            fill.style.width = v + '%'; pct.textContent = v + '%';
            if (f < 1) requestAnimationFrame(passo); else res();
        })(ini));
    }

    // exige segurar o dedo na digital
    function segurar(s) {
        return new Promise(res => {
            hold.hidden = false; rolar();
            let ini = 0, raf = 0, ativo = false;
            const set = p => holdBtn.style.setProperty('--p', p);
            function passo(now) {
                if (!ativo) return;
                const p = Math.min(1, (now - ini) / SEGURAR_MS);
                set(p);
                if (p >= 1) return fim();
                raf = requestAnimationFrame(passo);
            }
            function comecar(e) {
                if (ativo || s !== sessao) return;
                if (e && e.preventDefault) e.preventDefault();
                ativo = true; ini = performance.now(); holdBtn.classList.add('on');
                holdTxt.textContent = 'lendo digital... não solta';
                vibrar([20, 60, 20, 60, 20]);
                raf = requestAnimationFrame(passo);
            }
            function soltar() {
                if (!ativo) return;
                ativo = false; cancelAnimationFrame(raf); set(0); holdBtn.classList.remove('on');
                holdTxt.textContent = 'leitura incompleta. tenta de novo e segura mais um pouco.';
            }
            function fim() {
                ativo = false; cancelAnimationFrame(raf);
                holdBtn.removeEventListener('pointerdown', comecar);
                holdBtn.removeEventListener('keydown', kd); holdBtn.removeEventListener('keyup', soltar);
                removeEventListener('pointerup', soltar); removeEventListener('pointercancel', soltar);
                holdBtn.disabled = true; holdBtn.classList.remove('on'); holdBtn.classList.add('ok');
                holdTxt.textContent = 'digital reconhecida ✔';
                vibrar([60, 40, 120]);
                res();
            }
            const kd = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) comecar(e); };
            holdBtn.addEventListener('pointerdown', comecar);
            holdBtn.addEventListener('keydown', kd); holdBtn.addEventListener('keyup', soltar);
            addEventListener('pointerup', soltar); addEventListener('pointercancel', soltar);
            holdBtn.addEventListener('contextmenu', e => e.preventDefault());
        });
    }

    async function glitch(s) {
        await esperar(900); if (s !== sessao) return;
        modal.classList.add('glitch'); vibrar([40, 30, 40, 30, 90]);
        await esperar(900); if (s !== sessao) return;
        modal.classList.remove('glitch');
        term.innerHTML = ''; bar.hidden = true; hold.hidden = true;
        modal.classList.add('lendo');
        await esperar(1600);
    }

    async function sequencia(s) {
        await esperar(900); if (s !== sessao) return;
        if (!await linha(s, '> abrindo segredo.log')) return; await esperar(500);
        if (!await linha(s, '> verificando permissão... ok')) return; await esperar(500);
        if (!await linha(s, '> verificando quem está lendo...')) return; await esperar(1300);
        if (!await linha(s, '> usuário: ' + NOME + ' ✔', 'ok')) return; await esperar(700);
        if (!await linha(s, '> aviso: este arquivo foi escrito para uma única pessoa.', 'av')) return; await esperar(1100);
        if (!await linha(s, '> descriptografando...')) return;
        await barra(s); if (s !== sessao) return;
        await esperar(1400);
        if (!await linha(s, '> erro: preciso confirmar que é você. coloque a sua digital.', 'er')) return;
        await esperar(600);
        await segurar(s); if (s !== sessao) return;
        await glitch(s); if (s !== sessao) return;

        for (let i = 0; i < TEXTO.length; i++) {
            const it = TEXTO[i];
            const p = document.createElement('p');
            p.className = 'seg-p' + (it.forte ? ' forte' : '');
            msg.appendChild(p);
            if (it.forte) modal.classList.add('clima');
            vibrar(it.forte ? [30, 80, 30, 80, 60] : 20);
            await decodificar(s, p, it.t, Math.min(2400, 500 + it.t.length * 28)); if (s !== sessao) return;
            await esperar(it.espera); if (s !== sessao) return;
            if (it.toque) { await tocar(s); if (s !== sessao) return; }
        }
        const sig = document.createElement('p'); sig.className = 'seg-sig'; sig.textContent = ASSINATURA; msg.appendChild(sig); rolar();
        await esperar(1800); if (s !== sessao) return;
        btnFim.hidden = false; rolar();
        try { localStorage.setItem(CHAVE + '-lida', '1'); } catch (_) { }
    }

    function reiniciar() {
        term.innerHTML = ''; msg.innerHTML = ''; bar.hidden = true; fill.style.width = '0'; pct.textContent = '0%';
        toque.hidden = true; btnFim.hidden = true; hold.hidden = true;
        holdBtn.disabled = false; holdBtn.style.setProperty('--p', 0); holdBtn.classList.remove('on', 'ok');
        holdTxt.textContent = 'segure o dedo aqui';
        modal.classList.remove('glitch', 'lendo', 'clima');
    }

    function abrir(origem) {
        const s = ++sessao; voltarPara = origem || null;
        reiniciar();
        modal.hidden = false; void modal.offsetWidth; modal.classList.add('on');
        document.body.style.overflow = 'hidden';
        btnX.focus({ preventScroll: true });
        sequencia(s);
    }
    function fechar() {
        sessao++;
        modal.classList.remove('on'); document.body.style.overflow = '';
        setTimeout(() => { if (!modal.classList.contains('on')) { modal.hidden = true; reiniciar(); } }, reduz ? 0 : 400);
        if (voltarPara) voltarPara.focus({ preventScroll: true });
    }

    btnX.addEventListener('click', e => { e.stopPropagation(); fechar(); });
    btnFim.addEventListener('click', e => { e.stopPropagation(); fechar(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) fechar(); });

    window.Segredo = { abrir, fechar, liberada };
})();