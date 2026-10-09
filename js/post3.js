// Post #3: "Nosso primeiro mês" em formato de stories (estilo Wrapped).
(() => {
    // ====== PERSONALIZE AQUI ======
    const INICIO = '2026-09-01';   // ✏️ data em que vocês se conheceram (AAAA-MM-DD). O contador usa isso.
    const FOTO = '../img/foto.jpg'; // ✏️ foto do último slide
    // Coisas que você aprendeu sobre ela. Adicione as suas, uma por linha (ficam antes das fixas).
    const APRENDI_EXTRA = [
        // 'Você ri com o corpo inteiro quando...',
    ];
    // ==============================

    const NOME = (document.querySelector('[data-nome]') || {}).textContent || 'branquinha';
    const EU = (document.querySelector('[data-eu]') || {}).textContent || 'Thiago Lemos';
    const dias = Math.max(0, Math.floor((Date.now() - new Date(INICIO + 'T00:00:00-03:00')) / 864e5));

    const slides = [
        () => `<div class="st-kicker">$ git log --since="1 mês"</div>
               <div class="st-txt">processando o nosso primeiro ciclo...</div>
               <div class="st-num" id="cont">0</div>
               <div class="st-big">dias desde o <em>primeiro commit</em></div>`,

        () => `<div class="st-kicker">// origem</div>
               <div class="st-big">Onde tudo <em>começou</em></div>
               <div class="st-linha"><small>local do primeiro encontro</small>a prolar</div>
               <div class="st-linha"><small>merge de verdade</small>a festa do Nicolas</div>
               <div class="st-txt" style="margin-top:1.2rem">Nenhum dos dois estava procurando nada.<br>O melhor commit foi sem querer.</div>`,

        () => `<div class="st-kicker">// estatísticas</div>
               <div class="st-big">Os números<br>do <em>mês</em></div>
               <div class="st-stat"><span>Vezes que você me fez sorrir</span><strong>∞</strong></div>
               <div class="st-stat"><span>Vezes que fiquei sério perto de você</span><strong>0<small>bug conhecido</small></strong></div>
               <div class="st-stat"><span>Nível de tranquilidade</span><strong>100%</strong></div>`,

        () => `<div class="st-kicker">// momento do mês</div>
               <div class="st-big">O jantar no dia do <em>jogo do Flamengo</em></div>
               <div class="st-txt">Eu devia estar prestando atenção no jogo.<br><b>Spoiler: não estava.</b></div>
               <div class="st-txt" style="margin-top:1rem">Fiquei olhando o seu sorriso, que é o único que quebra o meu jeito sério.</div>`,

        () => {
            const itens = [...APRENDI_EXTRA,
                'Você é romântica. Foi você mesma que me contou.',
                'O seu sorriso faz o meu jeito sério ir embora.',
                'Perto de você eu fico tranquilo, e eu quase nunca fico.'];
            return `<div class="st-kicker">// o que o script aprendeu</div>
               <div class="st-big">Sobre <em>você</em></div>` + itens.map(t => `<div class="st-card">${t}</div>`).join('');
        },

        () => `<div class="st-kicker">// CHANGELOG.md</div>
               <div class="st-big">Notas da <em>versão</em></div>
               <div class="st-log">
                 <div style="animation-delay:.3s"><b>feat:</b> sorriso que quebra meu jeito sério</div>
                 <div style="animation-delay:.6s"><b>feat:</b> jantar em dia de jogo do Flamengo</div>
                 <div style="animation-delay:.9s"><b>fix:</b> tranquilidade</div>
                 <div style="animation-delay:1.2s"><b>fix:</b> dias sem graça</div>
                 <div style="animation-delay:1.5s"><b>perf:</b> o tempo passa mais rápido com você</div>
                 <div style="animation-delay:1.8s"><b>docs:</b> este blog</div>
                 <div class="ok" style="animation-delay:2.2s">✔ build concluído, 0 erros graves</div>
               </div>`,

        () => `<div class="st-kicker">// roadmap</div>
               <div class="st-big">Próxima <em>release</em></div>
               <div class="st-linha"><small>versão</small>1.1, em desenvolvimento</div>
               <div class="st-linha"><small>data prevista</small>sem data, sem pressa</div>
               <div class="st-linha"><small>quem escolhe as features</small>${NOME}</div>
               <div class="st-txt" style="margin-top:1.2rem">Tudo em aberto, do jeito que eu gosto.</div>`,

        () => `<figure class="st-polaroid"><img src="${FOTO}" alt="Nós dois" onerror="this.closest('figure').style.display='none'"></figure>
               <div class="st-big">Obrigado pelo primeiro mês, <em>${NOME}</em>.</div>
               <div class="st-txt">Que venham os próximos commits.</div>
               <div class="st-txt" style="margin-top:.8rem">— ${EU}</div>
               <div class="st-botoes"><button type="button" class="cta" id="st-again">Ver de novo ↺</button><button type="button" class="cta" id="st-fim" style="background:rgba(255,255,255,.1);color:var(--ink)">Fechar</button></div>`
    ];

    const $ = id => document.getElementById(id);
    const box = $('stories'), slide = $('st-slide'), bars = $('st-bars'), dica = $('st-dica');
    let i = 0, timer;
    const reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;

    bars.innerHTML = slides.map(() => '<i></i>').join('');

    function contar() {
        const el = $('cont'); if (!el) return;
        if (reduz || dias < 2) { el.textContent = dias; return; }
        const t0 = performance.now(), dur = 1400;
        (function f(t) {
            const p = Math.min(1, (t - t0) / dur);
            el.textContent = Math.round(dias * (1 - Math.pow(1 - p, 3)));
            if (p < 1) timer = requestAnimationFrame(f);
        })(t0);
    }

    function ir(n) {
        cancelAnimationFrame(timer);
        i = Math.max(0, Math.min(slides.length - 1, n));
        slide.innerHTML = slides[i]();
        [...bars.children].forEach((b, k) => b.classList.toggle('on', k <= i));
        dica.hidden = i !== 0;
        const again = $('st-again'), fim = $('st-fim');
        if (again) again.addEventListener('click', e => { e.stopPropagation(); ir(0); });
        if (fim) fim.addEventListener('click', e => { e.stopPropagation(); fechar(); });
        if (i === 0) contar();
        try { navigator.vibrate && navigator.vibrate(8); } catch (e) { }
    }
    const prox = () => { if (i < slides.length - 1) ir(i + 1); };
    const ant = () => ir(i - 1);

    function abrir() {
        box.hidden = false; document.body.classList.add('st-aberto'); ir(0);
        $('st-x').focus({ preventScroll: true });
    }
    function fechar() {
        cancelAnimationFrame(timer);
        box.hidden = true; document.body.classList.remove('st-aberto');
        $('comecar').focus({ preventScroll: true });
    }

    $('comecar').addEventListener('click', abrir);
    $('st-x').addEventListener('click', fechar);
    $('st-next').addEventListener('click', prox);
    $('st-prev').addEventListener('click', ant);
    document.addEventListener('keydown', e => {
        if (box.hidden) return;
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { if (document.activeElement && document.activeElement.tagName === 'BUTTON' && document.activeElement.classList.contains('cta')) return; e.preventDefault(); prox(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); ant(); }
        else if (e.key === 'Escape') fechar();
    });
    // arrastar o dedo
    let x0 = null;
    box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
        if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 60) { dx < 0 ? prox() : ant(); e.preventDefault(); }
    });
})();
