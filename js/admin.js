// Painel de admin: telas separadas (Início, Respostas, Posts dela, Recados, Noite, Ajustes).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, deleteDoc, doc, setDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
let storage = null; try { storage = getStorage(app); } catch (_) { }
const $ = i => document.getElementById(i);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

/* ====================== Cápsula do tempo (Post #6) ======================
   A mensagem dela fica ESCONDIDA aqui até a data. Mantenha igual à ABRE_EM do js/post6.js. */
const CAPSULA_ABRE = new Date("2027-01-01T09:00:00-03:00");
const ehSurpresa3 = r => r.post === 6 && r.itens && r.itens[0] && String(r.itens[0].pergunta).startsWith("Surpresa #3");
const ehCapsula = r => r.post === 6 && Array.isArray(r.itens) && !ehSurpresa3(r);
const capsulaSelada = r => ehCapsula(r) && Date.now() < CAPSULA_ABRE.getTime();

/* ====================== login ====================== */
$("login-form").addEventListener("submit", async e => {
    e.preventDefault(); $("go").disabled = true; $("err").textContent = "";
    try { await signInWithEmailAndPassword(auth, $("em").value, $("pw").value); }
    catch { $("err").textContent = "E-mail ou senha incorretos."; }
    $("go").disabled = false;
});
$("out").onclick = () => signOut(auth);

/* ====================== estado ====================== */
const D = { respostas: [], posts_dela: [], recados: [], memorias: [] };
const ERRO = {};
let estadoFinal = false;
const ABA = { respostas: "respostas", posts_dela: "posts", recados: "recados" }; // coleção -> tela
const F = { respostas: { chip: "todos", q: "" }, posts: { q: "" }, recados: { q: "" } };

// "visto": o que ela escreveu depois da última vez que você abriu cada tela vira "novo"
let visto; try { visto = JSON.parse(localStorage.getItem("adm_visto") || "null"); } catch { visto = null; }
if (!visto) { visto = { respostas: Date.now(), posts: Date.now(), recados: Date.now() }; salvaVisto(); }
let vistoAntes = { ...visto };
function salvaVisto() { try { localStorage.setItem("adm_visto", JSON.stringify(visto)); } catch { } }

const ts = r => (r.criadoEm && r.criadoEm.toMillis) ? r.criadoEm.toMillis() : Date.now();
function quando(ms) {
    const d = new Date(ms), min = Math.floor((Date.now() - ms) / 6e4), hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (min < 1) return "agora";
    if (min < 60) return `há ${min} min`;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    if (ms >= hoje.getTime()) return `hoje, ${hora}`;
    if (ms >= hoje.getTime() - 864e5) return `ontem, ${hora}`;
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) + ", " + hora;
}
const cheio = ms => new Date(ms).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" });

function rotulo(r) {
    switch (r.post) {
        case 10: return ["🌙", "Lembrança da noite"]; case 9: return ["📍", "Chegada ao local"]; case 8: return ["💌", "Convite aceito"];
        case 7: return ["🕰️", "Que horas são aí? (Post #7)"];
        case 6: return ehSurpresa3(r) ? ["🎁", "Surpresa #3"] : ["⏳", "Cápsula do tempo (Post #6)"];
        case 5: return ["🎥", "Resposta ao vídeo (Post #5)"]; case 4: return ["📖", "Passando a limpo (Post #4)"];
        case 3: return ["📖", "Versão dela (Post #3)"]; case 2: return ["✅", "Vamos jogar (Post #2)"];
        default: return ["💬", r.post ? "Post #" + r.post : "Resposta"];
    }
}
function textoDe(r) {
    if (capsulaSelada(r)) return "";
    if (Array.isArray(r.itens)) return r.itens.map(i => i.pergunta + "\n" + i.resposta).join("\n\n");
    return r.mensagem || "";
}

/* ====================== navegação ====================== */
const TELAS = ["inicio", "respostas", "posts", "recados", "noite", "ajustes"];
let atual = "inicio", timerVisto = 0;
function ir(v, empurra = true) {
    if (!TELAS.includes(v)) v = "inicio";
    const saiu = atual; atual = v;
    if (ABA_VISTO.includes(saiu) && saiu !== v) { vistoAntes[saiu] = visto[saiu]; renderLista(saiu); }
    TELAS.forEach(t => $("v-" + t).hidden = t !== v);
    qsa("#nav [data-ir]").forEach(b => { if (b.dataset.ir === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (empurra) history.replaceState(null, "", "#" + v);
    window.scrollTo({ top: 0 });
    clearTimeout(timerVisto);
    if (ABA_VISTO.includes(v)) {
        vistoAntes[v] = visto[v];
        timerVisto = setTimeout(() => { visto[v] = Date.now(); salvaVisto(); badges(); }, 1500);
    }
    badges();
}
const ABA_VISTO = ["respostas", "posts", "recados"];
document.addEventListener("click", e => { const b = e.target.closest("[data-ir]"); if (b) ir(b.dataset.ir); });
addEventListener("hashchange", () => ir(location.hash.slice(1), false));

function novosDe(tela) {
    const col = Object.keys(ABA).find(c => ABA[c] === tela);
    return D[col].filter(r => ts(r) > (tela === atual ? vistoAntes[tela] : visto[tela])).length;
}
function totalNovos() { return ABA_VISTO.reduce((s, t) => s + (t === atual ? 0 : novosDe(t)), 0); }
function badges() {
    qsa("#nav [data-ir]").forEach(b => {
        const t = b.dataset.ir, bd = b.querySelector(".bd"); if (!bd) return;
        const n = t === atual ? 0 : (ABA_VISTO.includes(t) ? novosDe(t) : 0);
        bd.hidden = !n; bd.textContent = n > 9 ? "9+" : n;
    });
    const n = totalNovos();
    document.title = n ? `(${n}) Painel` : "Painel";
    try { n ? navigator.setAppBadge && navigator.setAppBadge(n) : navigator.clearAppBadge && navigator.clearAppBadge(); } catch { }
}

/* ====================== avisos ====================== */
let toastT = 0;
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3500); }
function textoAviso(nome, d) {
    if (nome === "posts_dela") return "Ela publicou um post novo ✍️";
    if (nome === "recados") return "Tem um recado novo 💌";
    switch (d && d.post) {
        case 10: return "Ela deixou uma lembrança da noite 🌙"; case 9: return "Ela chegou no lugar! 📍"; case 8: return "Ela aceitou o convite 💌";
        case 7: return "Ela respondeu o Post #7 (Que horas são aí?) 🕰️";
        case 6: return ehSurpresa3(d) ? "Ela respondeu a Surpresa #3 🎁" : "Ela selou a cápsula do tempo ⏳";
        case 5: return "Ela respondeu o Post #5 (o vídeo) 🎥"; case 4: return "Ela respondeu o Post #4 (passando a limpo)";
        case 3: return "Ela escreveu a versão dela de um momento 📖"; default: return "Ela terminou o Post #2. Tem resposta nova!";
    }
}
async function avisar(nome, dados) {
    const msg = textoAviso(nome, dados);
    if (!document.hidden) { toast(msg); return; }
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try { const reg = await navigator.serviceWorker.ready; reg.showNotification("Blog", { body: msg, icon: "img/icons/admin-192.png", badge: "img/icons/admin-192.png", tag: "blog-" + nome }); }
    catch { try { new Notification("Blog", { body: msg, icon: "img/icons/admin-192.png" }); } catch { } }
}
function estadoAvisos() {
    const ok = "Notification" in window, p = ok ? Notification.permission : "indisponivel";
    $("avisos").hidden = p !== "default";
    $("avisos-st").textContent = !ok ? "Este navegador não suporta avisos." : p === "granted" ? "✅ Avisos ativados." : p === "denied" ? "🚫 Bloqueados. Libere nas configurações do navegador." : "Ainda não ativados.";
}
$("avisos").onclick = async () => { await Notification.requestPermission(); estadoAvisos(); };
document.addEventListener("visibilitychange", () => { if (!document.hidden) badges(); });

/* ====================== cartões ====================== */
function cartao({ emoji, titulo, ms, humor, corpo, texto, novo, onApagar }) {
    const c = el("article", "card" + (novo ? " novo" : ""));
    const h = el("div", "card-h"); h.append(el("span", "em", emoji));
    const t = el("div"); t.append(el("h3", null, titulo));
    const d = el("small", null, quando(ms)); d.title = cheio(ms); t.append(d);
    if (humor) { t.append(document.createElement("br")); t.append(el("span", "humor", humor)); }
    h.append(t); c.append(h);
    const b = el("div", "corpo"); corpo(b); c.append(b);
    const f = el("div", "card-f");
    const longo = texto.length > 220 || texto.split("\n").length > 5;
    if (longo) {
        b.classList.add("clamp");
        const ler = el("button", null, "Ler tudo"); ler.type = "button";
        ler.onclick = () => { const aberto = b.classList.toggle("clamp"); ler.textContent = aberto ? "Ler tudo" : "Recolher"; };
        f.append(ler);
    }
    if (texto) {
        const cp = el("button", null, "Copiar"); cp.type = "button";
        cp.onclick = async () => { try { await navigator.clipboard.writeText(texto); toast("Copiado ✓"); } catch { toast("Não consegui copiar"); } };
        f.append(cp);
    }
    const ap = el("button", "apagar", "Apagar"); ap.type = "button";
    ap.onclick = async () => { if (!confirm("Apagar de vez?")) return; try { await onApagar(); toast("Apagado"); } catch { toast("Não consegui apagar"); } };
    f.append(ap); c.append(f);
    c.dataset.txt = (titulo + " " + texto + " " + (humor || "")).toLowerCase();
    return c;
}
function aplicaBusca(tela) {
    const q = (F[tela].q || "").trim().toLowerCase(), box = $("lista-" + tela);
    let vis = 0;
    qsa(".card", box).forEach(c => { const ok = !q || c.dataset.txt.includes(q); c.hidden = !ok; if (ok) vis++; });
    let m = box.querySelector(".vazio.busca"); if (m) m.remove();
    if (q && !vis && box.querySelector(".card")) box.append(Object.assign(el("p", "vazio busca", "Nada encontrado pra “" + q + "”."), {}));
}

function renderLista(tela) {
    const box = $("lista-" + tela); if (!box) return;
    const antes = vistoAntes[tela];
    box.replaceChildren();
    const col = Object.keys(ABA).find(c => ABA[c] === tela), itens = D[col];
    if (ERRO[col]) { box.append(el("p", "vazio", "Sem permissão pra ler essa lista. Confira as regras do Firestore (coleção " + col + ").")); return; }
    if (tela === "respostas") {
        // filtros por tipo
        const cont = new Map(); itens.forEach(r => { const k = rotulo(r)[1]; cont.set(k, (cont.get(k) || 0) + 1); });
        const ch = $("chips-respostas"); ch.replaceChildren();
        const add = (k, txt) => { const b = el("button", "chip", txt); b.type = "button"; b.setAttribute("aria-pressed", String(F.respostas.chip === k)); b.onclick = () => { F.respostas.chip = k; renderLista("respostas"); }; ch.append(b); };
        add("todos", "Todas (" + itens.length + ")"); cont.forEach((n, k) => add(k, k + " · " + n));
        if (F.respostas.chip !== "todos" && !cont.has(F.respostas.chip)) F.respostas.chip = "todos";
    }
    const lista = tela === "respostas" && F.respostas.chip !== "todos" ? itens.filter(r => rotulo(r)[1] === F.respostas.chip) : itens;
    if (!lista.length) { box.append(el("p", "vazio", "Nada por aqui ainda. 💜")); return; }
    lista.forEach(r => {
        const novo = ts(r) > antes;
        if (tela === "respostas") {
            const [em, tt] = rotulo(r), sel = capsulaSelada(r);
            box.append(cartao({
                emoji: em, titulo: tt, ms: ts(r), humor: r.humor, novo, texto: textoDe(r),
                corpo: b => {
                    if (sel) { b.classList.add("selada"); b.textContent = "🔒 Mensagem selada. Ela só aparece aqui depois de " + CAPSULA_ABRE.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) + "."; }
                    else if (Array.isArray(r.itens)) r.itens.forEach(i => { const q = el("div", "qa"); q.append(el("small", null, i.pergunta), el("p", null, i.resposta)); b.append(q); });
                    else b.textContent = r.mensagem || "";
                },
                onApagar: () => deleteDoc(doc(db, "respostas", r.id))
            }));
        } else if (tela === "posts") {
            const n = itens.length - itens.indexOf(r);
            box.append(cartao({
                emoji: "📝", titulo: "Post #" + n + (r.titulo ? ": " + r.titulo : ""), ms: ts(r), humor: r.humor, novo, texto: r.mensagem || "",
                corpo: b => { b.textContent = r.mensagem || ""; }, onApagar: () => deleteDoc(doc(db, "posts_dela", r.id))
            }));
        } else {
            box.append(cartao({
                emoji: "💌", titulo: "Recado", ms: ts(r), humor: r.humor, novo, texto: r.mensagem || "",
                corpo: b => { b.textContent = r.mensagem || ""; }, onApagar: () => deleteDoc(doc(db, "recados", r.id))
            }));
        }
    });
    aplicaBusca(tela);
}

/* ====================== início ====================== */
function renderInicio() {
    const tiles = $("tiles"); tiles.replaceChildren();
    [["respostas", "Respostas", D.respostas.length], ["posts", "Posts dela", D.posts_dela.length], ["recados", "Recados", D.recados.length], ["noite", "Fotos e vídeos", D.memorias.length]].forEach(([t, nome, n]) => {
        const b = el("button", "tile"); b.type = "button"; b.dataset.ir = t;
        b.append(el("span", "n", String(n)), el("span", "t", nome));
        const nv = ABA_VISTO.includes(t) ? novosDe(t) : 0; if (nv) b.append(el("span", "novos", nv + " novo" + (nv > 1 ? "s" : "")));
        tiles.append(b);
    });
    const todos = [];
    D.respostas.forEach(r => { const [em, tt] = rotulo(r); todos.push({ t: ts(r), em, tt, p: capsulaSelada(r) ? "🔒 selada" : textoDe(r), tela: "respostas" }); });
    D.posts_dela.forEach((r, i) => todos.push({ t: ts(r), em: "📝", tt: "Post #" + (D.posts_dela.length - i) + (r.titulo ? ": " + r.titulo : ""), p: r.mensagem || "", tela: "posts" }));
    D.recados.forEach(r => todos.push({ t: ts(r), em: "💌", tt: "Recado", p: r.mensagem || "", tela: "recados" }));
    todos.sort((a, b) => b.t - a.t);
    const feed = $("feed"); feed.replaceChildren();
    if (!todos.length) feed.append(el("p", "vazio", "Quando ela escrever algo, aparece aqui. 💜"));
    todos.slice(0, 6).forEach(x => {
        const b = el("button", "feed-i"); b.type = "button"; b.dataset.ir = x.tela;
        const m = el("div"); m.append(el("b", null, x.tt), el("small", null, x.p.replace(/\s+/g, " ").slice(0, 120)));
        b.append(el("span", "em", x.em), m, el("span", "qd", quando(x.t))); feed.append(b);
    });
    const h = new Date().getHours();
    $("saudacao").textContent = (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite") + ". Aqui está o que aconteceu no blog.";
}

/* ====================== noite ====================== */
function renderNoite() {
    const ultimo = p => D.respostas.find(r => r.post === p);
    const passos = $("passos"); passos.replaceChildren();
    [[8, "Aceitou o convite", "💌"], [9, "Chegou no lugar", "📍"], [10, "Deixou uma lembrança da noite", "🌙"]].forEach(([p, txt]) => {
        const r = ultimo(p), li = el("li", r ? "ok" : ""); li.append(el("span", "bola", r ? "✓" : "·"));
        const d = el("div"); d.append(txt); if (r) d.append(el("small", null, quando(ts(r)))); li.append(d); passos.append(li);
    });
    const fim = estadoFinal;
    $("fin-tg").setAttribute("aria-checked", String(fim)); $("fin-tg").disabled = false;
    $("fin-st").textContent = fim ? "✅ Liberada: ela já consegue abrir." : "🔒 Trancada.";
    const g = $("galeria"); g.replaceChildren();
    D.memorias.forEach(r => {
        const i = el("div", "gal-i"), m = el(r.tipo === "video" ? "video" : "img"); m.src = r.url; if (r.tipo === "video") { m.muted = true; m.preload = "metadata"; } else { m.loading = "lazy"; m.alt = r.legenda || "memória"; }
        const x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "Apagar");
        x.onclick = async () => { if (!confirm("Apagar esse arquivo?")) return; await deleteDoc(doc(db, "memorias", r.id)); try { await deleteObject(sref(storage, r.caminho)); } catch { } toast("Apagado"); };
        i.append(m, x); if (r.tipo === "video") i.append(el("span", "tp", "🎥")); g.append(i);
    });
}
$("fin-tg").onclick = async () => {
    $("fin-tg").disabled = true;
    try { await setDoc(doc(db, "noite", "estado"), { final: !estadoFinal, atualizadoEm: serverTimestamp() }, { merge: true }); toast(!estadoFinal ? "Página final liberada ✨" : "Página final trancada"); }
    catch (e) { $("fin-st").textContent = "Não consegui salvar (" + (e.code || e.message) + "). Confira as regras do Firestore (coleção noite)."; $("fin-tg").disabled = false; }
};

// upload: fila, arrastar e soltar
let fila = [];
function desenhaFila() {
    const box = $("fila"); box.replaceChildren();
    fila.forEach((f, i) => {
        const li = el("div", "fila-i"), prev = el("div", "mini");
        if (f.type.startsWith("image")) { const im = el("img", "mini"); im.src = URL.createObjectURL(f); im.alt = ""; li.append(im); } else { prev.textContent = "🎥"; li.append(prev); }
        const d = el("div"); d.append(el("div", "nm", f.name), el("small", "mute", (f.size / 1048576).toFixed(1) + " MB")); const b = el("div", "bar"); b.append(el("i")); d.append(b); li.append(d);
        const x = el("button", null, "×"); x.type = "button"; x.setAttribute("aria-label", "Tirar da fila"); x.onclick = () => { fila.splice(i, 1); desenhaFila(); }; li.append(x);
        box.append(li);
    });
    $("up-go").disabled = !fila.length; $("up-go").textContent = fila.length ? "Enviar " + fila.length + " arquivo" + (fila.length > 1 ? "s" : "") : "Enviar";
}
const addArquivos = lst => { fila.push(...[...lst].filter(f => /^(image|video)\//.test(f.type))); desenhaFila(); };
$("up-f").addEventListener("change", e => { addArquivos(e.target.files); e.target.value = ""; });
["dragenter", "dragover"].forEach(ev => $("drop").addEventListener(ev, e => { e.preventDefault(); $("drop").classList.add("sobre"); }));
["dragleave", "drop"].forEach(ev => $("drop").addEventListener(ev, e => { e.preventDefault(); $("drop").classList.remove("sobre"); }));
$("drop").addEventListener("drop", e => addArquivos(e.dataTransfer.files));
$("up-go").onclick = async () => {
    if (!storage) { $("up-st").textContent = "O Storage não está configurado no projeto."; return; }
    $("up-go").disabled = true; let ok = 0; const total = fila.length, barras = qsa("#fila .bar i");
    for (let i = 0; i < total; i++) {
        const f = fila[i], tipo = f.type.startsWith("video") ? "video" : "imagem", caminho = "memorias/" + Date.now() + "-" + f.name.replace(/[^\w.\-]+/g, "_");
        try {
            const task = uploadBytesResumable(sref(storage, caminho), f);
            await new Promise((res, rej) => task.on("state_changed", s => { const p = s.bytesTransferred / s.totalBytes; barras[i].style.width = Math.round(p * 100) + "%"; $("up-st").textContent = "Enviando " + (i + 1) + " de " + total + "…"; }, rej, res));
            const url = await getDownloadURL(task.snapshot.ref);
            await addDoc(collection(db, "memorias"), { url, tipo, caminho, legenda: $("up-l").value.trim(), criadoEm: serverTimestamp() });
            ok++;
        } catch (e) { $("up-st").textContent = "Erro em " + f.name + ": " + (e.code || e.message) + ". Veja as regras do Storage e se ele está ativo no projeto."; break; }
    }
    if (ok === total) { $("up-st").textContent = "Pronto: " + ok + " arquivo(s) enviado(s). Já aparecem no Post #10."; toast("Enviado ✓"); fila = []; $("up-l").value = ""; }
    else fila = fila.slice(ok);
    desenhaFila();
};

/* ====================== buscas ====================== */
[["respostas", "q-respostas"], ["posts", "q-posts"], ["recados", "q-recados"]].forEach(([t, id]) => $(id).addEventListener("input", e => { F[t].q = e.target.value; aplicaBusca(t); }));

/* ====================== dados ao vivo ====================== */
function escuta(nome, notifica) {
    let primeira = true;
    return onSnapshot(query(collection(db, nome), orderBy("criadoEm", "desc")), snap => {
        if (notifica && !primeira) snap.docChanges().forEach(c => { if (c.type === "added" && !c.doc.metadata.hasPendingWrites) avisar(nome, c.doc.data()); });
        primeira = false; ERRO[nome] = false;
        D[nome] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        desenhaTudo(nome);
    }, () => { ERRO[nome] = true; desenhaTudo(nome); });
}
function desenhaTudo(nome) {
    if (ABA[nome]) renderLista(ABA[nome]);
    renderInicio(); renderNoite(); badges();
    $("capsula-st").textContent = "Abre em " + CAPSULA_ABRE.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) + ". Até lá a resposta dela fica selada aqui também.";
}

let subs = [];
onAuthStateChanged(auth, u => {
    $("login").hidden = !!u; $("app").hidden = !u;
    subs.forEach(f => f()); subs = [];
    if (!u) return;
    $("conta").textContent = "Você entrou como " + u.email + ".";
    estadoAvisos();
    subs = [
        escuta("respostas", true), escuta("posts_dela", true), escuta("recados", true), escuta("memorias", false),
        onSnapshot(doc(db, "noite", "estado"), s => { estadoFinal = !!(s.exists() && s.data().final); renderNoite(); },
            () => { $("fin-st").textContent = "Sem permissão. Adicione a regra da coleção noite no Firestore."; })
    ];
    ir(location.hash.slice(1) || "inicio", false);
});
