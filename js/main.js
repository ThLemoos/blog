// ====== PERSONALIZE AQUI ======
const NOME = "branquinha";            // o nome dela
const EU = "Thiago Lemos";        // o seu nome
// ==============================
document.querySelectorAll('[data-nome]').forEach(e => e.textContent = NOME);
document.querySelectorAll('[data-eu]').forEach(e => e.textContent = EU);

// revelar ao rolar: entra e sai, funcionando subindo e descendo
// Um observador só ADICIONA (quando entra na tela) e outro só REMOVE (quando já está bem longe).
// Antes, o mesmo observador fazia os dois e, ao parar a rolagem em certos pontos, o elemento
// ficava entrando e saindo sem parar (era isso que "pulava").
const ioIn = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { rootMargin: '0px 0px -12% 0px' });
const ioOut = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) e.target.classList.remove('in'); }), { rootMargin: '300px 0px 300px 0px' });
document.querySelectorAll('.rv').forEach(el => { ioIn.observe(el); ioOut.observe(el); });

// ====== THREE.JS: coração de partículas ======
(function () {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('bg');
    const mobile = innerWidth < 760;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 200); camera.position.z = 44;

    // coração: pontos dentro do volume
    const N = mobile ? 1100 : 2200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const c1 = new THREE.Color('#ff5d8f'), c2 = new THREE.Color('#b79cff'), c3 = new THREE.Color('#f6d9b0');
    for (let i = 0; i < N; i++) {
        const t = Math.random() * Math.PI * 2, k = Math.random() < .8 ? .9 + Math.random() * .1 : Math.pow(Math.random(), .6) * .9;
        const x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        pos[i * 3] = x * k * .9 + (Math.random() - .5) * .8;
        pos[i * 3 + 1] = y * k * .9 + (Math.random() - .5) * .8;
        pos[i * 3 + 2] = (Math.random() - .5) * 5;
        const c = c1.clone().lerp(Math.random() < .2 ? c3 : c2, Math.random() * .55);
        col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size: .2, vertexColors: true, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false });
    const heart = new THREE.Points(g, m);
    const group = new THREE.Group(); group.add(heart); scene.add(group);

    // estrelas ao fundo
    const S = mobile ? 350 : 800, sp = new Float32Array(S * 3);
    for (let i = 0; i < S; i++) { sp[i * 3] = (Math.random() - .5) * 160; sp[i * 3 + 1] = (Math.random() - .5) * 160; sp[i * 3 + 2] = -Math.random() * 90; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .28, color: 0xf6d9b0, transparent: true, opacity: .35, depthWrite: false }));
    scene.add(stars);

    let mx = 0, my = 0, sx = 0, sy = 0, lw = 0, lh = 0, scroll = 0, target = 0, t0 = performance.now(), spin = 0, last = t0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
    addEventListener('deviceorientation', e => { if (e.gamma != null) { mx = Math.max(-.5, Math.min(.5, e.gamma / 60)); my = Math.max(-.5, Math.min(.5, (e.beta - 45) / 90)); } });
    function size() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (w === lw && h === lh) return; lw = w; lh = h;
        renderer.setSize(w, h, false); camera.aspect = w / h;
        camera.position.z = w < 760 ? 62 : 44; camera.updateProjectionMatrix();
    }
    addEventListener('resize', size); size();
    function onScroll() { const max = document.documentElement.scrollHeight - (canvas.clientHeight || innerHeight); target = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0; }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function loop(now) {
        requestAnimationFrame(loop);
        const t = (now - t0) / 1000;
        const dt = Math.min((now - last) / 1000, .1); last = now;
        if (!still) spin += dt * .9; // giro contínuo (rad/s): mude o .4 para girar mais rápido ou mais devagar
        scroll += (target - scroll) * .06;
        const beat = 1 + Math.sin(t * .9) * .015; // respiração suave
        const s = still ? 1 : beat;
        const vh = Math.max(0, scrollY) / (canvas.clientHeight || innerHeight);
        sx += (mx - sx) * .05; sy += (my - sy) * .05;
        // ao rolar: coração gira, sobe, diminui e fica mais suave; ao subir, volta
        group.rotation.y = spin + scroll * Math.PI * 2 + sx * .4;
        group.rotation.x = sy * .2;
        group.position.y = Math.min(vh, 3) * 5;
        const sc = s * .75 * Math.max(.4, 1 - scroll * .8);
        group.scale.setScalar(sc);
        m.opacity = Math.max(.1, .5 - vh * .25);
        stars.rotation.y = scroll * .6 + t * .005;
        stars.position.y = scroll * 30;
        camera.position.x += ((sx * 5) - camera.position.x) * .04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);
})();

// posts bloqueados: balançam e avisam
document.querySelectorAll('.post.locked').forEach(c => {
    const go = () => {
        c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        const m = document.getElementById(c.dataset.msg || 'postmsg');
        if (m) m.textContent = c.dataset.msg ? 'Essa carta só abre depois que você terminar o Post #2.' : 'Esse ainda está sendo escrito. Volta daqui uns dias.';
    };
    c.addEventListener('click', go);
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
});