/**
 * BrainMat - Módulo de Autenticação com Google (Firebase Auth)
 */

import { auth, googleProvider, isFirebaseConfigured } from '../firebase/firebase-config.js';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { dbService } from '../database/db-service.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.listeners = [];
    }

    init() {
        if (!isFirebaseConfigured() || !auth) {
            console.warn("AuthService: Firebase não configurado. Modo convidado ativo.");
            return;
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                // Busca ou cria o perfil no Firestore
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

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            this.currentUser = user;
            this.userProfile = await dbService.ensureUserProfile(user);
            this.notifyListeners();
            return this.userProfile;
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
