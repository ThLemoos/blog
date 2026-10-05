(function () {
    // ====== PERSONALIZE ======
    const WHATSAPP = ""; // seu número com DDI e DDD, só dígitos. Ex.: "5521999999999". Vazio = esconde o botão.
    // t = a sua pergunta pra ela | eu = a SUA resposta, que aparece no final (reescreva com as suas palavras!)
    const PERGUNTAS = [
        {
            t: "Qual foi a sua primeira impressão de mim?",
            eu: "Que o seu sorriso ia dar trabalho pro meu jeito sério. Eu estava certo."
        },
        {
            t: "O que te faz rir mais fácil?",
            eu: "Piada ruim de programador. Eu sei que você vai ter que aguentar."
        },
        {
            t: "Um lugar que você sonha em conhecer?",
            eu: "Ainda estou decidindo, mas aceito sugestões. E companhia."
        },
        {
            t: "O que faz um dia ser bom pra você?",
            eu: "Café, uma boa conversa e nenhum bug em produção."
        },
        {
            t: "Se a gente pudesse repetir um dia desde que nos conhecemos, qual seria?",
            eu: "O jantar em dia de jogo do Flamengo. Repetiria até o placar."
        }
    ];
    // =========================

    const $ = id => document.getElementById(id);
    const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const caixa = $('resp');
    let i = 0, resp = [], trava = false, texto = '';

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
            const linhas = ['> lendo as suas respostas...', '> buscando as minhas...', '> compilando...', '> 0 erros, 0 warnings.'];
            let n = 0;
            (function passo() {
                if (n < linhas.length) { $('log').textContent += linhas[n++] + '\n'; setTimeout(passo, reduz ? 0 : 650); }
                else revelar();
            })();
        }, reduz ? 0 : 400);
    }

    function revelar() {
        const ul = $('troca'); ul.textContent = '';
        PERGUNTAS.forEach((q, n) => {
            const li = document.createElement('li');
            const h = document.createElement('span'); h.className = 'q'; h.textContent = (n + 1) + '. ' + q.t;
            const a = document.createElement('p'); const sa = document.createElement('small'); sa.textContent = 'Você'; a.append(sa, resp[n]);
            const b = document.createElement('p'); b.className = 'eu'; const sb = document.createElement('small'); sb.textContent = 'Eu'; b.append(sb, q.eu);
            li.append(h, a, b); ul.appendChild(li);
        });
        texto = 'Respondi o Post #2 do blog 💜\n\n' + PERGUNTAS.map((q, n) => (n + 1) + ') ' + q.t + '\n' + resp[n]).join('\n\n');
        if (WHATSAPP) { const z = $('zap'); z.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto); z.hidden = false; }
        $('perfil').hidden = false;
        enviar();
    }

    async function enviar() {
        if (!window.salvarRespostas) return;
        const itens = PERGUNTAS.map((q, n) => ({ pergunta: q.t, resposta: resp[n] }));
        try { await window.salvarRespostas(itens); $('aviso').textContent = 'Suas respostas foram enviadas pra mim 💜'; }
        catch (e) { console.error(e); $('aviso').textContent = 'Não consegui enviar. Use o botão de copiar e me mande.'; }
    }

    async function copiar() {
        let ok = false;
        try { await navigator.clipboard.writeText(texto); ok = true; }
        catch (e) {
            const t = document.createElement('textarea'); t.value = texto; t.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(t); t.select();
            try { ok = document.execCommand('copy'); } catch (_) { }
            t.remove();
        }
        $('aviso').textContent = ok ? 'Copiado! É só colar na nossa conversa.' : 'Não consegui copiar. Me conta o que respondeu por aqui mesmo.';
    }

    function refazer() {
        i = 0; resp = []; trava = false; $('aviso').textContent = '';
        $('res').hidden = true; $('quiz').hidden = false; $('barra').style.width = '0';
        $('qbox').classList.remove('out'); mostrar();
    }

    $('prox').addEventListener('click', proxima);
    caixa.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); proxima(); } });
    $('copiar').addEventListener('click', copiar);
    $('refazer').addEventListener('click', refazer);
    mostrar();
    caixa.blur(); // não abrir o teclado do celular logo ao carregar a página
})();