// ================= CONFIGURE AQUI =================
const PERGUNTA = "Em JavaScript, qual é o resultado de typeof NaN?\nSe acertar, você vai liberar uma mensagem secreta que talvez você goste de saber";
const DICA = "Tem a ver com vermelho e preto.";
// A mensagem secreta fica criptografada. Gere a sua em ferramentas/gerar-segredo.html
// e cole aqui no lugar deste bloco. (Exemplo atual: resposta "flamengo")
const SEGREDO = {
    "salt": "4cZOAy9NX8uOuocSx3zygA==",
    "iv": "EMNcLmcoTOV0ogrC",
    "dados": "hh66WmRf05LnlOfwJgKADIOQO12/frk5y0U0r4gEU+dl3V9CYBkX4UDqSV4EwZO4LwHmEfo+Vo9tiZaO0Ok5d1YlcJXg9AOsLPjNTw32fyS/GfQj/0A4+y9qEaBaMrGGiJs0OYa2g1PRJRTuGjRBskL6ZHSKDeTsvqgkIWdXM931rcE9NGBUz4Q4Ur63lMQhvzgGStZB2Ck="
};
// ==================================================

(function () {
    const $ = id => document.getElementById(id);
    const dlg = $('charada'), btn = $('btn'), form = $('ch-form'), inp = $('ch-resposta'),
        go = $('ch-go'), fb = $('ch-feedback');
    if (!dlg || !btn || typeof dlg.showModal !== 'function') return;

    let erros = 0, liberado = null;
    $('ch-pergunta').textContent = PERGUNTA;

    // "Flamengo!", " flamengo " e "FLAMENGO" valem o mesmo; acentos e pontuação são ignorados
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

    async function decifrar(resp) {
        const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(norm(resp)), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: b64(SEGREDO.salt), iterations: 150000, hash: 'SHA-256' },
            km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(SEGREDO.iv) }, key, b64(SEGREDO.dados));
        return new TextDecoder().decode(buf);
    }

    function coracoes() {
        const r = $('ch-segredo').getBoundingClientRect();
        for (let i = 0; i < 16; i++) {
            const s = document.createElement('span'); s.className = 'pop'; s.textContent = ['💖', '✨', '💜', '🌹'][i % 4];
            s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px';
            s.style.setProperty('--x', (Math.random() * 320 - 160) + 'px');
            s.style.setProperty('--y', (-80 - Math.random() * 240) + 'px');
            dlg.appendChild(s); setTimeout(() => s.remove(), 1700);
        }
    }

    function mostrar() {
        $('ch-titulo').textContent = 'Você acertou';
        $('ch-pergunta').hidden = true; form.hidden = true; fb.textContent = '';
        $('ch-segredo').textContent = liberado; $('ch-segredo').hidden = false;
        coracoes();
    }

    btn.addEventListener('click', () => {
        dlg.showModal();
        if (liberado) mostrar(); else inp.focus();
    });
    $('ch-fechar').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // clicar fora fecha

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const v = inp.value.trim();
        if (!v) { fb.textContent = 'Digite sua resposta.'; return; }
        if (!window.crypto || !crypto.subtle) { fb.textContent = 'Abra o blog pelo link https para a charada funcionar.'; return; }
        go.disabled = true; fb.textContent = 'Verificando...';
        try {
            liberado = await decifrar(v);
            mostrar();
        } catch (err) {
            erros++;
            inp.classList.remove('erro'); void inp.offsetWidth; inp.classList.add('erro');
            fb.textContent = 'Ainda não é essa. Tenta de novo.' + (erros >= 2 && DICA ? ' Dica: ' + DICA : '');
        } finally { go.disabled = false; }
    });
})();