// Caixa de recados: ela escreve quando quiser e o recado cai na coleção "recados" (aparece no painel de admin).
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id) || document.createElement("div"); // se faltar algum elemento, não quebra a página
const HUMORES = [
    ["💜", "Com saudade"], ["😊", "Feliz"], ["🥰", "Carinhosa"], ["😴", "Cansada"],
    ["😔", "Meio pra baixo"], ["🤔", "Pensativa"], ["💬", "Quero conversar"], ["😤", "Estressada"]
];
const PERGUNTAS = [
    "Me conta um momento de hoje que te fez sorrir.",
    "Do que você sente saudade hoje?",
    "Tem algo que você queria me dizer e ainda não disse?",
    "O que eu fiz esses dias que te deixou feliz?",
    "Como foi o seu dia, de verdade?",
    "Escreve como você se sente quando está comigo.",
    "Me conta uma coisa que você ainda não me contou.",
    "Se você pudesse me pedir qualquer coisa agora, o que seria?",
    "O que você mais gosta de fazer comigo?",
    "O que você espera pra gente?"
];
const CHAVE_RASCUNHO = "recado_rascunho", CHAVE_HIST = "recados_enviados";
const msg = $("msg"), tit = $("titulo"), st = $("st"), btn = $("enviar");
let humor = "", ultimaPergunta = -1;
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

const ler = (k, v) => { try { return JSON.parse(localStorage.getItem(k) || v); } catch (_) { return JSON.parse(v); } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { } };
const tira = k => { try { localStorage.removeItem(k); } catch (_) { } };

// data no topo do papel
$("rc-data").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

// humores
HUMORES.forEach(([e, t]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = e + " " + t; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
        const on = b.getAttribute("aria-pressed") === "true";
        document.querySelectorAll("#humores button").forEach(x => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", String(!on)); humor = on ? "" : e + " " + t;
        salvaRascunho();
    });
    $("humores").appendChild(b);
});

// pergunta sorteada
$("sorteia").addEventListener("click", () => {
    let i; do { i = Math.floor(Math.random() * PERGUNTAS.length); } while (i === ultimaPergunta && PERGUNTAS.length > 1);
    ultimaPergunta = i;
    const p = $("ideia"); p.hidden = false; p.textContent = "“" + PERGUNTAS[i] + "”";
    p.style.animation = "none"; void p.offsetWidth; p.style.animation = "";
    msg.focus({ preventScroll: true });
});

// caixa de texto cresce junto + contador + rascunho
function cresce() { msg.style.height = "auto"; msg.style.height = Math.max(msg.scrollHeight, 200) + "px"; }
function contador() { const n = msg.value.length; $("cont").textContent = n > 2500 ? n + " / 3000" : ""; }
function salvaRascunho() { gravar(CHAVE_RASCUNHO, { m: msg.value, h: humor, t: tit.value }); }
msg.addEventListener("input", () => { cresce(); contador(); salvaRascunho(); });
tit.addEventListener("input", salvaRascunho);
// número do próximo post (conta os que ela já publicou neste aparelho)
const proximo = () => ler(CHAVE_HIST, "[]").length + 1;
const numeroNaTela = () => { $("rc-num").textContent = "Post #" + proximo(); };
numeroNaTela();
const r = ler(CHAVE_RASCUNHO, "null");
if (r) {
    msg.value = r.m || ""; tit.value = r.t || "";
    if (r.h) { humor = r.h; document.querySelectorAll("#humores button").forEach(b => b.setAttribute("aria-pressed", String(b.textContent === r.h))); }
}
cresce(); contador();

// histórico (só neste aparelho)
function desenhaHist() {
    const h = ler(CHAVE_HIST, "[]"), box = $("hist-lista"); box.replaceChildren();
    $("hist").hidden = !h.length;
    h.slice().reverse().forEach((it, i) => {
        if (!it.n) it.n = h.length - i;
        const d = document.createElement("div"); d.className = "rc-item";
        const s = document.createElement("small"); s.textContent = (it.h ? it.h + " · " : "") + new Date(it.d).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
        const h4 = document.createElement("h4"); h4.textContent = "Post #" + it.n + (it.ti ? ": " + it.ti : "");
        const p = document.createElement("p"); p.textContent = it.t;
        d.append(s, h4, p); box.appendChild(d);
    });
}
desenhaHist();

// Firebase
const configurado = !Object.values(firebaseConfig).some(v => String(v).includes("COLE_AQUI"));
const db = configurado ? getFirestore(getApps()[0] || initializeApp(firebaseConfig)) : null;

function coracoes() {
    if (reduz) return;
    for (let i = 0; i < 12; i++) {
        const c = document.createElement("span"); c.className = "rc-coracao"; c.textContent = ["💖", "💜", "💗", "✨"][i % 4];
        c.style.setProperty("--dx", (Math.random() * 220 - 110) + "px"); c.style.setProperty("--r", (Math.random() * 60 - 30) + "deg");
        c.style.animationDelay = (i * 0.09) + "s"; $("mesa").appendChild(c); setTimeout(() => c.remove(), 3200);
    }
}

btn.addEventListener("click", async () => {
    const mensagem = msg.value.trim(), titulo = tit.value.trim(), n = proximo();
    if (mensagem.length < 2) { st.textContent = "Escreve um pouquinho antes de publicar."; msg.focus(); return; }
    if (!db) { st.textContent = "O Firebase ainda não foi configurado."; return; }
    btn.disabled = true; st.textContent = "Publicando…";
    try {
        const dados = { titulo, mensagem, humor: humor || "💜", criadoEm: serverTimestamp() };
        try {
            await addDoc(collection(db, "posts_dela"), dados);
        } catch (e) {
            // se as regras de "posts_dela" ainda não existem, guarda como recado (com o título no texto) pra não perder nada
            if (e && e.code === "permission-denied") {
                await addDoc(collection(db, "recados"), { mensagem: "📝 Post #" + n + (titulo ? ": " + titulo : "") + "\n\n" + mensagem, humor: dados.humor, criadoEm: serverTimestamp() });
            } else throw e;
        }
        const h = ler(CHAVE_HIST, "[]"); h.push({ n, ti: titulo, t: mensagem, h: humor, d: Date.now() }); gravar(CHAVE_HIST, h);
        tira(CHAVE_RASCUNHO);
        $("ok-titulo").textContent = "Post #" + n + " publicado.";
        try { navigator.vibrate && navigator.vibrate([30, 40, 80]); } catch (_) { }
        $("papel").classList.add("enviando"); coracoes();
        setTimeout(() => { $("papel").hidden = true; $("ok").hidden = false; desenhaHist(); window.scrollTo({ top: $("mesa").offsetTop - 80, behavior: "smooth" }); }, reduz ? 0 : 850);
    } catch (e) {
        console.error("Erro ao publicar o post:", e);
        st.textContent = "Não consegui publicar agora. Seu texto continua aqui, tenta de novo daqui a pouco.";
        btn.disabled = false;
    }
});

$("outro").addEventListener("click", () => {
    msg.value = ""; tit.value = ""; humor = ""; numeroNaTela(); $("ideia").hidden = true; st.textContent = ""; btn.disabled = false; cresce(); contador();
    document.querySelectorAll("#humores button").forEach(b => b.setAttribute("aria-pressed", "false"));
    $("ok").hidden = true; const p = $("papel"); p.hidden = false; p.classList.remove("enviando"); msg.focus();
});
