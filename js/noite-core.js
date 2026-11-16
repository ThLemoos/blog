// Núcleo compartilhado dos Posts #8, #9 e #10 (a noite do jantar).
// Cuida de: criptografia (mesma técnica da charada do início), armazenamento local,
// modo de prévia (?demo) e envio de avisos pro Firestore..
(function () {
    'use strict';

    var P = new URLSearchParams(location.search);
    var DEMO = P.has('demo') || P.has('preview');   // prévia: não grava nada de verdade
    var mem = {};

    function ler(k) { try { var v = localStorage.getItem(k); return v === null ? (mem[k] || null) : v; } catch (_) { return mem[k] || null; } }
    function gravar(k, v) { mem[k] = v; if (DEMO) return; try { localStorage.setItem(k, v); } catch (_) { } }
    function apagar(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (_) { } }
    if (P.has('reset')) { ['noite_convite', 'noite_aceite', 'noite_p9', 'noite_p9_aviso', 'noite_final', 'noite_recado'].forEach(apagar); }

    // "Prolar!", " prolar " e "PROLAR" valem o mesmo; acentos e pontuação são ignorados
    function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
    function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }

    async function decifrar(obj, senha) {
        var km = await crypto.subtle.importKey('raw', new TextEncoder().encode(norm(senha)), 'PBKDF2', false, ['deriveKey']);
        var key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: b64(obj.salt), iterations: 150000, hash: 'SHA-256' },
            km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        var buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(obj.iv) }, key, b64(obj.dados));
        return new TextDecoder().decode(buf);
    }
    // tenta a senha em cada cópia criptografada; devolve o texto ou null
    async function tentar(lista, senha) {
        if (!norm(senha)) return null;
        for (var i = 0; i < lista.length; i++) {
            try { return await decifrar(lista[i], senha); } catch (_) { }
        }
        return null;
    }
    async function sha256(senha) {
        var h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm(senha)));
        return Array.prototype.map.call(new Uint8Array(h), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    // Firebase carregado só quando precisa
    var fbCache = null;
    function fb() {
        if (fbCache) return fbCache;
        var G = 'https://www.gstatic.com/firebasejs/10.12.2/';
        fbCache = (async function () {
            var cfg = await import('./firebase-config.js');
            var app = await import(G + 'firebase-app.js');
            var fs = await import(G + 'firebase-firestore.js');
            var a = app.getApps()[0] || app.initializeApp(cfg.firebaseConfig);
            return { fs: fs, db: fs.getFirestore(a) };
        })();
        fbCache.catch(function () { fbCache = null; });
        return fbCache;
    }

    // grava em "respostas" (aparece no painel). Em prévia, não envia.
    async function enviar(post, itens) {
        if (DEMO) return { demo: true };
        var f = await fb();
        await f.fs.addDoc(f.fs.collection(f.db, 'respostas'), { post: post, itens: itens, criadoEm: f.fs.serverTimestamp() });
        return { ok: true };
    }

    function dados() { return window.NOITE || {}; }
    function postAberto() {
        if (DEMO) return true;
        var d = dados();
        if (!d.abreEm) return true;
        return Date.now() >= new Date(d.abreEm).getTime();
    }
    function convite() {
        try { return JSON.parse(ler('noite_convite') || 'null'); } catch (_) { return null; }
    }
    function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (_) { } }
    function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

    window.NoiteCore = {
        DEMO: DEMO, P: P, ler: ler, gravar: gravar, apagar: apagar, norm: norm,
        tentar: tentar, sha256: sha256, fb: fb, enviar: enviar, dados: dados,
        postAberto: postAberto, convite: convite, vibrar: vibrar, el: el
    };
})();
