/**
 * BrainMat - Módulo de Autenticação com Google (Firebase Auth)
 */

import { auth, googleProvider, isFirebaseConfigured } from '../firebase/firebase-config.js';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { dbService } from '../database/db-service.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.listeners = [];
    }

    async init() {
        if (!isFirebaseConfigured() || !auth) {
            console.warn("AuthService: Firebase não configurado. Modo convidado ativo.");
            return;
        }

        // Captura resultado do redirect (login via mobile/iOS)
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                this.currentUser = result.user;
                this.userProfile = await dbService.ensureUserProfile(result.user);
                this.notifyListeners();
            }
        } catch (error) {
            console.error("Erro ao obter resultado do redirect:", error);
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                this.userProfile = await dbService.ensureUserProfile(user);
            } else {
                this.currentUser = null;
                this.userProfile = null;
            }
            this.notifyListeners();
        });
    }

    async loginWithGoogle() {
        if (!isFirebaseConfigured() || !auth || !googleProvider) {
            alert("O Firebase ainda não foi configurado com as chaves do projeto. Veja o arquivo README.md para o passo a passo!");
            return null;
        }

        // Detecta mobile para usar redirect (evita bloqueio de popup no iOS/Safari)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        try {
            if (isMobile) {
                // No mobile usamos redirect — a página recarrega e getRedirectResult captura no init()
                await signInWithRedirect(auth, googleProvider);
                return null;
            } else {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                this.currentUser = user;
                this.userProfile = await dbService.ensureUserProfile(user);
                this.notifyListeners();
                return this.userProfile;
            }
        } catch (error) {
            console.error("Erro ao realizar login com o Google:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert(`Erro no login: ${error.message}`);
            }
            return null;
        }
    }

    async logout() {
        if (!isFirebaseConfigured() || !auth) return;
        try {
            await firebaseSignOut(auth);
            this.currentUser = null;
            this.userProfile = null;
            this.notifyListeners();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    }

    onAuthChange(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentUser, this.userProfile));
    }

    getUser() {
        return this.currentUser;
    }

    getProfile() {
        return this.userProfile;
    }
}

export const authService = new AuthService();
