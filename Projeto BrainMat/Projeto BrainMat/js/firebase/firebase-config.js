/**
 * BrainMat - Configuração do Firebase v10 SDK (ES Modules via CDN)
 * 
 * IMPORTANTE: Substitua os valores abaixo pelas chaves do seu projeto Firebase Console.
 * Instruções passo a passo no arquivo README.md
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração do Firebase obtida no Console -> Configurações do Projeto
export const firebaseConfig = {
   apiKey: "AIzaSyD-TjngQlKFCFzRgLrpPsUl2eafwgQ6VmU",
    authDomain: "auronbooks.com.br",
    projectId: "brainmat-93baf",
    storageBucket: "brainmat-93baf.firebasestorage.app",
    messagingSenderId: "431699406839",
    appId: "1:431699406839:web:6e80dcf7a6e9c1058488f2"};

// Verifica se as chaves foram preenchidas
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("SUA_API_KEY");
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        console.log("🔥 BrainMat: Firebase inicializado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao inicializar o Firebase:", error);
    }
} else {
    console.warn("⚠️ BrainMat: Chaves do Firebase não configuradas. O jogo funcionará em modo Local/Visitante.");
}

export { app, auth, db, googleProvider };
