import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const status = $("status"), box = $("recado"), btn = $("enviar");
let humor = "";

document.querySelectorAll(".mood").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".mood").forEach(x => x.classList.remove("on"));
  b.classList.add("on"); humor = b.dataset.m;
}));

const configurado = !Object.values(firebaseConfig).some(v => String(v).includes("COLE_AQUI"));
const db = configurado ? getFirestore(initializeApp(firebaseConfig)) : null;

btn.addEventListener("click", async () => {
  const mensagem = box.value.trim();
  if (!db) { status.textContent = "O Firebase ainda não foi configurado (veja js/firebase-config.js)."; return; }
  if (!mensagem) { status.textContent = "Escreva algo antes de enviar."; return; }
  btn.disabled = true; status.textContent = "Enviando...";
  try {
    await addDoc(collection(db, "recados"), { mensagem, humor: humor || "💜", criadoEm: serverTimestamp() });
    box.value = ""; status.textContent = "Recebi! Obrigado por responder.";
  } catch (e) {
    console.error(e); status.textContent = "Não consegui enviar. Tente de novo em instantes.";
  } finally { btn.disabled = false; }
});
