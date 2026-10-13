// Post #3: "Coisas simples". Quatro cartões; ao abrir todos, a Surpresa #2 (Nossa história, duas versões) é liberada na página inicial.
(() => {
    const CHAVE_HISTORIA = 'historia-liberada'; // mesma chave usada em js/historia.js
    const $ = id => document.getElementById(id);
    const botoes = [...document.querySelectorAll('.nota')];
    const abertos = new Set();
    const reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;

    // memória local pode estar bloqueada (aba anônima): nesse caso, vale só até fechar a página
    const liberar = () => { try { localStorage.setItem(CHAVE_HISTORIA, '1'); } catch (_) { } };

    function terminar() {
        liberar();
        const fim = $('fim');
        fim.hidden = false; void fim.offsetWidth; fim.classList.add('on');
        setTimeout(() => fim.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' }), 350);
        try { navigator.vibrate && navigator.vibrate([20, 40, 20]); } catch (_) { }
    }

    botoes.forEach((b, k) => b.addEventListener('click', () => {
        const painel = $(b.getAttribute('aria-controls'));
        const abrir = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', abrir);
        painel.classList.toggle('on', abrir);
        b.classList.toggle('on', abrir);
        if (abrir) abertos.add(k);
        $('nota-cont').textContent = `Abertos: ${abertos.size} de ${botoes.length}`;
        if (abertos.size === botoes.length && $('fim').hidden) terminar();
    }));
})();