(function () {
    // ====== PERSONALIZE ======
    const WHATSAPP = "5521975930204"; // seu número com DDI e DDD, só dígitos. Vazio = esconde o botão.

    // Suspense da "análise": 1 = ~50 segundos | 0.5 = metade | 2 = o dobro
    const RITMO = 1;

    // t = a sua pergunta pra ela | analise = o que o script "conclui" depois de ler a resposta dela
    const PERGUNTAS = [
        {
            t: "O que você mais gosta no que estamos construindo juntos?",
            analise: "O script registrou isso e tentou fingir que não ficou feliz. Não conseguiu."
        },
        {
            t: "Gosto do seu sonho de querer construir uma família. O quanto você gostaria de viver isso e o quanto tem se preparado pra isso?",
            analise: "Pergunta séria. O script ficou em silêncio por uns segundos e anotou tudo."
        },
        {
            t: "O quão disposta você está a se comprometer de verdade e abrir mão de algumas coisas pra gente dar certo?",
            analise: "Resposta salva. O script não tem comentários, só respeito e uma xícara de café."
        },
        {
            t: "O que faz um dia ser bom pra você?",
            analise: "O script comparou com o do criador dele: café, boa conversa e nenhum bug em produção."
        },
        {
            t: "Se a gente pudesse repetir um dia desde que nos conhecemos, qual seria?",
            analise: "O script encontrou esse dia nos logs e pediu para repetir."
        },
        {
            t: "O que você mudaria ou acrescentaria nesse tempo que estamos nos conhecendo?",
            analise: "Sinceridade é o tipo de dado preferido do script. Nenhum erro encontrado."
        }
    ];

    // O que o script "está fazendo" a cada resposta (rotaciona se tiver mais perguntas que frases)
    const FASES = [
        "verificando sinceridade",
        "medindo nível de carinho",
        "procurando entrelinhas",
        "checando coerência com as outras respostas",
        "cruzando com os meus dados",
        "calculando compatibilidade parcial"
    ];

    // =========================

    const $ = id => document.getElementById(id);
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const caixa = $('resp');
    let i = 0, resp = [], trava = false, texto = '';
    let sessao = 0; // cancela a análise, se preciso

    const esperar = ms => new Promise(r => setTimeout(r, reduz ? 0 : ms));

    function mostrar() {
        $('qn').textContent = 'Pergunta ' + (i + 1) + ' de ' + PERGUNTAS.length;
        $('barra').style.width = (i / PERGUNTAS.length * 100) + '%';
        $('qt').textContent = PERGUNTAS[i].t;
        $('prox').textContent = i === PERGUNTAS.length - 1 ? 'Compilar' : 'Próxima';
        caixa.value = ''; caixa.focus({ preventScroll: true });
    }

    function proxima() {
        if (trava) return;
        const v = caixa.value.trim();
        if (!v) { caixa.classList.remove('erro'); void caixa.offsetWidth; caixa.classList.add('erro'); caixa.focus(); return; }
        trava = true; resp.push(v);
        $('qbox').classList.add('out');
        setTimeout(() => {
            i++;
            if (i < PERGUNTAS.length) { mostrar(); $('qbox').classList.remove('out'); trava = false; }
            else finalizar();
        }, reduz ? 0 : 230);
    }

    function finalizar() {
        $('barra').style.width = '100%';
        setTimeout(() => {
            $('quiz').hidden = true; $('res').hidden = false; $('perfil').hidden = true; $('log').textContent = '';
            analisar();
        }, reduz ? 0 : 400);
    }

    // Suspense: o script "lê" e "analisa" cada resposta, uma por uma
    async function analisar() {
        const s = sessao;
        const log = $('log');
        const N = PERGUNTAS.length;
        const linhas = [
            ['> iniciando leitura das respostas...', 2200],
            ['> lendo suas respostas...', 3200]
        ];
        PERGUNTAS.forEach((_, n) => {
            linhas.push(['> [' + (n + 1) + '/' + N + '] lendo resposta ' + (n + 1) + '...', 2600]);
            linhas.push(['> [' + (n + 1) + '/' + N + '] ' + FASES[n % FASES.length] + '...', 3000]);
        });
        linhas.push(['> cruzando tudo com o algoritmo de compatibilidade...', 3800]);
        linhas.push(['> compilando...', 3400]);
        linhas.push(['> 0 erros, 0 warnings.', 2400]);
        linhas.push(['> análise concluída.', 1800]);

        log.classList.add('rodando');
        for (const [linha, ms] of linhas) {
            if (s !== sessao) return;
            log.textContent += linha + '\n';
            await esperar(ms * RITMO);
        }
        if (s !== sessao) return;
        log.classList.remove('rodando');
        revelar();
    }

    function revelar() {
        const ul = $('troca'); ul.textContent = '';
        PERGUNTAS.forEach((q, n) => {
            const li = document.createElement('li');
            li.className = 'surge'; li.style.animationDelay = (reduz ? 0 : n * 0.5) + 's';
            const h = document.createElement('span'); h.className = 'q'; h.textContent = (n + 1) + '. ' + q.t;
            const a = document.createElement('p'); const sa = document.createElement('small'); sa.textContent = 'Você'; a.append(sa, resp[n]);
            li.append(h, a);
            if (q.analise) { const b = document.createElement('p'); b.className = 'eu'; const sb = document.createElement('small'); sb.textContent = 'Script'; b.append(sb, q.analise); li.append(b); }
            ul.appendChild(li);
        });
        texto = 'Respondi o Post #2 do blog 💜\n\n' + PERGUNTAS.map((q, n) => (n + 1) + ') ' + q.t + '\n' + resp[n]).join('\n\n');
        $('perfil').hidden = false;
        enviar();
        aprovar((PERGUNTAS.length - 1) * 500 + 1400); // espera as respostas aparecerem
    }

    // Depois que ela leu as respostas: texto de aprovação e, só então, o botão da surpresa
    async function aprovar(atraso) {
        const s = sessao, box = $('aprovada'), acoes = $('acoes');
        await esperar(atraso); if (s !== sessao) return;
        box.hidden = false; void box.offsetWidth; box.classList.add('on');
        box.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' });
        Carta.liberar(); // a carta fica guardada na seção "Cartas" da página inicial
        await esperar(3800); if (s !== sessao) return;
        acoes.hidden = false; void acoes.offsetWidth; acoes.classList.add('on');
    }

    async function enviar() {
        const itens = PERGUNTAS.map((q, n) => ({ pergunta: q.t, resposta: resp[n] }));
        $('aviso').textContent = 'Enviando suas respostas...';
        try {
            const V = '10.12.2', G = 'https://www.gstatic.com/firebasejs/' + V + '/';
            const { firebaseConfig } = await import('./firebase-config.js');
            const { initializeApp, getApps } = await import(G + 'firebase-app.js');
            const { getFirestore, collection, addDoc, serverTimestamp } = await import(G + 'firebase-firestore.js');
            const app = getApps()[0] || initializeApp(firebaseConfig);
            await addDoc(collection(getFirestore(app), 'respostas'), { post: 2, itens, criadoEm: serverTimestamp() });
            $('aviso').textContent = 'Suas respostas foram enviadas pra mim!';
        } catch (e) {
            console.error('Erro ao enviar respostas:', e);
            $('aviso').textContent = 'Não consegui enviar (' + (e.code || e.message || e) + ')' + (WHATSAPP ? '. Use o botão abaixo pra me mandar as respostas pelo WhatsApp.' : '.');
            if (WHATSAPP) { const z = $('zap'); z.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto); z.hidden = false; }
        }
    }

    $('prox').addEventListener('click', proxima);
    caixa.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); proxima(); } });
    $('surpresa-btn').addEventListener('click', () => Carta.abrir($('surpresa-btn')));
    mostrar();
    caixa.blur(); // não abrir o teclado do celular logo ao carregar a página
})();