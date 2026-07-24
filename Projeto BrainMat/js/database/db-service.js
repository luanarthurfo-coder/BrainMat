/**
 * BrainMat - Módulo de Banco de Dados (Cloud Firestore)
 * Gerencia persistência de dados, perfil, estatísticas e Ranking Global em tempo real.
 */

import { db, isFirebaseConfigured } from '../firebase/firebase-config.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment, 
    serverTimestamp,
    collection, 
    query, 
    orderBy, 
    limit, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const LOCAL_STORAGE_KEY = 'brainmat_guest_stats';

class DBService {
    constructor() {
        this.unsubscribeRanking = null;
    }

    // Garante que o documento do usuário existe e atualiza o último login
    async ensureUserProfile(user) {
        if (!isFirebaseConfigured() || !db || !user) {
            return this.getGuestProfile();
        }

        const userRef = doc(db, 'users', user.uid);
        try {
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                // Recupera dados salvos localmente no modo convidado, se houver
                const guestStats = this.getGuestProfile().stats;

                const newUserProfile = {
                    uid: user.uid,
                    displayName: user.displayName || 'Jogador BrainMat',
                    photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
                    email: user.email || '',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    totalXP: guestStats.totalXP || 0,
                    stats: {
                        gamesPlayed: guestStats.gamesPlayed || 0,
                        totalQuestions: guestStats.totalQuestions || 0,
                        correctAnswers: guestStats.correctAnswers || 0,
                        wrongAnswers: guestStats.wrongAnswers || 0,
                        bestStreak: guestStats.bestStreak || 0,
                        additionSolved: guestStats.additionSolved || 0,
                        subtractionSolved: guestStats.subtractionSolved || 0,
                        multiplicationSolved: guestStats.multiplicationSolved || 0,
                        divisionSolved: guestStats.divisionSolved || 0
                    },
                    // Estrutura preparada para expansões futuras (Scalability Hooks)
                    system: {
                        level: 1,
                        schoolId: null,
                        classId: null,
                        coins: 0,
                        badges: [],
                        equippedSkin: 'default'
                    }
                };

                await setDoc(userRef, newUserProfile);
                return newUserProfile;
            } else {
                // Atualiza o último login
                await updateDoc(userRef, {
                    lastLogin: new Date().toISOString()
                });
                return docSnap.data();
            }
        } catch (error) {
            console.error("Erro ao obter/criar perfil no Firestore:", error);
            return this.getGuestProfile();
        }
    }

    // Salva o resultado de uma partida no banco de dados com incrementos atômicos
    async recordGameResults(user, sessionData) {
        // sessionData: { xpGained, questionsCount, correctCount, wrongCount, bestSessionStreak, opStats: { '+': n, '-': n, '*': n, '/': n } }
        
        if (!isFirebaseConfigured() || !db || !user) {
            return this.saveGuestGameResults(sessionData);
        }

        const userRef = doc(db, 'users', user.uid);

        try {
            // Busca perfil atual para conferir se quebrou o recorde de melhor sequência
            const docSnap = await getDoc(userRef);
            const currentData = docSnap.exists() ? docSnap.data() : null;
            const currentBestStreak = currentData?.stats?.bestStreak || 0;
            const newBestStreak = Math.max(currentBestStreak, sessionData.bestSessionStreak || 0);

            const updatePayload = {
                totalXP: increment(sessionData.xpGained || 0),
                'stats.gamesPlayed': increment(1),
                'stats.totalQuestions': increment(sessionData.questionsCount || 0),
                'stats.correctAnswers': increment(sessionData.correctCount || 0),
                'stats.wrongAnswers': increment(sessionData.wrongCount || 0),
                'stats.bestStreak': newBestStreak,
                'stats.additionSolved': increment(sessionData.opStats['+'] || 0),
                'stats.subtractionSolved': increment(sessionData.opStats['-'] || 0),
                'stats.multiplicationSolved': increment(sessionData.opStats['*'] || 0),
                'stats.divisionSolved': increment(sessionData.opStats['/'] || 0)
            };

            await updateDoc(userRef, updatePayload);
            
            // Retorna o perfil atualizado
            const updatedSnap = await getDoc(userRef);
            return updatedSnap.data();
        } catch (error) {
            console.error("Erro ao registrar estatísticas da partida:", error);
            return this.saveGuestGameResults(sessionData);
        }
    }

    // Listener em tempo real do Ranking Global (TOP 100 por totalXP)
    listenGlobalRanking(callback) {
        if (!isFirebaseConfigured() || !db) {
            console.warn("Firestore não configurado. Retornando ranking local fictício.");
            callback(this.getMockRanking());
            return () => {};
        }

        if (this.unsubscribeRanking) {
            this.unsubscribeRanking();
        }

        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('totalXP', 'desc'), limit(100));

            this.unsubscribeRanking = onSnapshot(q, (snapshot) => {
                const rankingList = [];
                let rank = 1;
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    rankingList.push({
                        position: rank++,
                        uid: data.uid,
                        displayName: data.displayName || 'Aluno BrainMat',
                        photoURL: data.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
                        totalXP: data.totalXP || 0,
                        school: data.system?.schoolName || 'Escola BrainMat'
                    });
                });
                callback(rankingList);
            }, (error) => {
                console.error("Erro ao escutar ranking no Firestore:", error);
                callback(this.getMockRanking());
            });

            return this.unsubscribeRanking;
        } catch (e) {
            console.error("Erro no listener de ranking:", e);
            callback(this.getMockRanking());
            return () => {};
        }
    }

    // --- MODO VISITANTE / LOCALSTORAGE FALLBACK ---
    getGuestProfile() {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let parsed = localData ? JSON.parse(localData) : null;
        
        if (!parsed) {
            parsed = {
                uid: 'guest_local',
                displayName: 'Convidado (Entrar para Salvar)',
                photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
                email: '',
                createdAt: new Date().toISOString(),
                totalXP: 0,
                stats: {
                    gamesPlayed: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    bestStreak: 0,
                    additionSolved: 0,
                    subtractionSolved: 0,
                    multiplicationSolved: 0,
                    divisionSolved: 0
                }
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
    }

    saveGuestGameResults(sessionData) {
        const guest = this.getGuestProfile();
        guest.totalXP += (sessionData.xpGained || 0);
        guest.stats.gamesPlayed += 1;
        guest.stats.totalQuestions += (sessionData.questionsCount || 0);
        guest.stats.correctAnswers += (sessionData.correctCount || 0);
        guest.stats.wrongAnswers += (sessionData.wrongCount || 0);
        guest.stats.bestStreak = Math.max(guest.stats.bestStreak || 0, sessionData.bestSessionStreak || 0);
        
        guest.stats.additionSolved += (sessionData.opStats['+'] || 0);
        guest.stats.subtractionSolved += (sessionData.opStats['-'] || 0);
        guest.stats.multiplicationSolved += (sessionData.opStats['*'] || 0);
        guest.stats.divisionSolved += (sessionData.opStats['/'] || 0);

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(guest));
        return guest;
    }

    getMockRanking() {
        const guest = this.getGuestProfile();
        return [
            { position: 1, uid: 'mock1', displayName: 'Ana Clara Math', photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=ana', totalXP: 4850, school: 'Colégio Futuro' },
            { position: 2, uid: 'mock2', displayName: 'Pedro Henrique', photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=pedro', totalXP: 3420, school: 'Escola Modelo' },
            { position: 3, uid: 'mock3', displayName: 'Mariana Silva', photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=mari', totalXP: 2900, school: 'Instituto Avançar' },
            { position: 4, uid: guest.uid, displayName: guest.displayName, photoURL: guest.photoURL, totalXP: guest.totalXP, school: 'Você (Convidado)' }
        ];
    }
}

export const dbService = new DBService();
