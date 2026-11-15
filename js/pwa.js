// Registra o service worker e recarrega quando sai uma versão nova.
(() => {
    if (!('serviceWorker' in navigator)) return;
    const raiz = new URL('../', document.currentScript.src).href; // pasta raiz do site
    let recarregando = false;
    const tinhaSW = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!tinhaSW || recarregando) return; // não recarrega na 1ª instalação
        recarregando = true; location.reload();
    });
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(raiz + 'sw.js', { scope: raiz }).then(reg => {
            reg.update();
            // confere atualização ao voltar pro app e a cada 30 min
            document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update(); });
            setInterval(() => reg.update(), 30 * 60 * 1000);
        }).catch(() => { });
    });
})();

// Selo "NOVO": ao abrir um post (inclusive por link direto), marca como visto
(() => {
    const m = location.pathname.match(/\/posts\/([\w-]+)\.html$/);
    if (!m) return;
    try {
        const v = JSON.parse(localStorage.getItem('blog_vistos') || '[]');
        if (!v.includes(m[1])) { v.push(m[1]); localStorage.setItem('blog_vistos', JSON.stringify(v)); }
    } catch (_) { }
})();
