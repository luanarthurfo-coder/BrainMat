/**
 * BrainMat - Aplicação Principal
 * Ponto de entrada modular da plataforma de competição matemática.
 */

import { authService } from './auth/auth-service.js';
import { dbService } from './database/db-service.js';
import { soundManager } from './audio/sound-manager.js';
import { modalManager } from './components/modal-manager.js';
import { headerNav } from './components/header-nav.js';
import { gameController } from './game/game-controller.js';
import { ProfileView } from './profile/profile-view.js';
import { RankingView } from './ranking/ranking-view.js';

class BrainMatApp {
    constructor() {
        this.profileView = null;
        this.rankingView = null;
        this.currentRankingList = [];
    }

    async init() {
        console.log("🚀 BrainMat App Inicializando...");

        // Binds de Modais
        modalManager.bindCloseEvents();

        // Módulos de Visualização
        this.profileView = new ProfileView(document.getElementById('profile-view-container'));
        this.rankingView = new RankingView(document.getElementById('ranking-view-container'));

        // Cabeçalho e Ações
        headerNav.init({
            loginBtn: document.getElementById('btn-google-login'),
            logoutBtn: document.getElementById('btn-logout'),
            userProfileWrapper: document.getElementById('user-profile-wrapper'),
            userAvatar: document.getElementById('user-avatar-img'),
            userXpDisplay: document.getElementById('user-xp-header'),
            soundToggleBtn: document.getElementById('btn-sound-toggle'),
            profileBtn: document.getElementById('user-profile-wrapper'),
            rankingBtn: document.getElementById('btn-open-ranking')
        });

        // Binds da Controladora de Jogo
        gameController.bindElements({
            menuScreen: document.getElementById('menu-screen'),
            gameScreen: document.getElementById('game-screen'),
            problemEl: document.getElementById('problem'),
            inputText: document.getElementById('input-text'),
            inputDisplayBox: document.getElementById('user-input'),
            scoreDisplay: document.getElementById('score-display'),
            comboDisplay: document.getElementById('combo-display'),
            contaCounterEl: document.getElementById('conta-counter'),
            progressBar: document.getElementById('progress-bar'),
            problemContainer: document.querySelector('.problem-container')
        });

        // Eventos Globais de Navegação e Teclado
        this.bindEvents();

        // Inicializa Autenticação
        authService.onAuthChange((user, profile) => this.handleAuthChange(user, profile));
        authService.init();

        // Escuta o Ranking Global em Tempo Real
        dbService.listenGlobalRanking((rankingList) => {
            this.currentRankingList = rankingList;
            const currentUser = authService.getUser();
            this.rankingView.render(rankingList, currentUser ? currentUser.uid : 'guest_local');
            this.refreshUserData();
        });

        // Carrega dados iniciais do convidado se não houver login ativo rápido
        if (!authService.getUser()) {
            const guestProfile = dbService.getGuestProfile();
            this.updateProfileUI(guestProfile);
            this.updateCategoryBadges(guestProfile);
            headerNav.updateUserUI(null, guestProfile);
        }
    }

    bindEvents() {
        // Seleção dos Cards de Categoria Matemática
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.getAttribute('data-mode');
                gameController.startGame(mode);
            });
        });

        // Botão Voltar ao Menu
        const btnBack = document.getElementById('btn-back-menu');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                soundManager.playClick();
                gameController.showMenu();
            });
        }

        // Teclado Virtual (Numpad)
        document.querySelectorAll('.num-btn[data-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                gameController.addNum(key);
            });
        });

        const btnDel = document.getElementById('btn-del');
        if (btnDel) btnDel.addEventListener('click', () => gameController.delNum());

        const btnGo = document.getElementById('btn-go');
        if (btnGo) btnGo.addEventListener('click', () => gameController.checkAnswer());

        // Aba "Meu Perfil" no Menu
        const tabProfileTrigger = document.getElementById('tab-profile-trigger');
        if (tabProfileTrigger) {
            tabProfileTrigger.addEventListener('click', () => {
                modalManager.open('profile-modal');
            });
        }

        // Suporte a Teclado Físico do PC
        document.addEventListener('keydown', (e) => {
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen && gameScreen.style.display === 'flex') {
                if (e.key >= '0' && e.key <= '9') gameController.addNum(e.key);
                if (e.key === 'Backspace') gameController.delNum();
                if (e.key === 'Enter') gameController.checkAnswer();
                if (e.key === '.' || e.key === ',') gameController.addNum('.');
            }
        });
    }

    handleAuthChange(user, profile) {
        headerNav.updateUserUI(user, profile);
        this.updateProfileUI(profile);
        this.updateCategoryBadges(profile);

        // Exibe ou esconde o botão de logout no modal de perfil
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.style.display = user ? 'block' : 'none';
        }

        if (this.rankingView && this.currentRankingList) {
            this.rankingView.render(this.currentRankingList, user ? user.uid : 'guest_local');
        }
    }

    updateProfileUI(profile) {
        if (!profile) return;
        
        // Calcula a posição estimada no ranking
        let userPos = '-';
        if (this.currentRankingList && this.currentRankingList.length > 0) {
            const index = this.currentRankingList.findIndex(item => item.uid === profile.uid);
            if (index !== -1) {
                userPos = `#${index + 1}`;
            }
        }

        if (this.profileView) {
            this.profileView.render(profile, userPos);
        }
    }

    updateCategoryBadges(profile) {
        if (!profile || !profile.stats) return;

        const stats = profile.stats;
        const modeMap = {
            '+': stats.additionSolved || 0,
            '-': stats.subtractionSolved || 0,
            '*': stats.multiplicationSolved || 0,
            '/': stats.divisionSolved || 0,
            'mix': stats.correctAnswers || 0
        };

        document.querySelectorAll('.category-card').forEach(card => {
            const mode = card.getAttribute('data-mode');
            const solvedCount = modeMap[mode] || 0;
            const badgeEl = card.querySelector('.level-badge');
            
            if (badgeEl) {
                if (solvedCount >= 100) {
                    badgeEl.innerText = '👑 Nível 100/100 (Mestre)';
                    badgeEl.classList.add('master-level');
                } else {
                    const level = Math.min(100, solvedCount + 1);
                    badgeEl.innerText = `Nível ${level}/100`;
                    badgeEl.classList.remove('master-level');
                }
            }
        });
    }

    async refreshUserData() {
        const user = authService.getUser();
        let profile;
        if (user) {
            profile = await dbService.ensureUserProfile(user);
        } else {
            profile = dbService.getGuestProfile();
        }
        headerNav.updateUserUI(user, profile);
        this.updateProfileUI(profile);
        this.updateCategoryBadges(profile);
    }
}

// Inicializa a aplicação ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    const app = new BrainMatApp();
    window.BrainMatApp = app;
    app.init();
});
