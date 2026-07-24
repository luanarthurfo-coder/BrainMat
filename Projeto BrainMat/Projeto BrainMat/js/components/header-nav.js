/**
 * BrainMat - Módulo de Gerenciamento do Cabeçalho e Navegação
 */

import { authService } from '../auth/auth-service.js';
import { soundManager } from '../audio/sound-manager.js';
import { modalManager } from './modal-manager.js';
import { formatXP } from '../utils/formatters.js';

export class HeaderNav {
    constructor() {
        this.elements = {};
    }

    init(elements) {
        this.elements = elements;
        this.bindEvents();
    }

    bindEvents() {
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', async () => {
                soundManager.playClick();
                await authService.loginWithGoogle();
            });
        }

        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', async () => {
                soundManager.playClick();
                if (confirm('Deseja realmente sair da sua conta?')) {
                    await authService.logout();
                }
            });
        }

        if (this.elements.profileBtn) {
            this.elements.profileBtn.addEventListener('click', () => {
                modalManager.open('profile-modal');
            });
        }

        if (this.elements.rankingBtn) {
            this.elements.rankingBtn.addEventListener('click', () => {
                modalManager.open('ranking-modal');
            });
        }

        if (this.elements.soundToggleBtn) {
            this.elements.soundToggleBtn.addEventListener('click', () => {
                const currentMuted = soundManager.isMuted;
                soundManager.setMute(!currentMuted);
                this.updateSoundUI(!currentMuted);
                if (!currentMuted) {
                    soundManager.playClick();
                }
            });
        }

        // Estado inicial do botão de som
        this.updateSoundUI(soundManager.isMuted);
    }

    updateSoundUI(isMuted) {
        if (this.elements.soundToggleBtn) {
            this.elements.soundToggleBtn.innerText = isMuted ? '🔇 Som: Off' : '🔊 Som: On';
            this.elements.soundToggleBtn.classList.toggle('muted', isMuted);
        }
    }

    updateUserUI(user, profile) {
        const totalXP = profile ? (profile.totalXP || 0) : 0;
        
        if (this.elements.userXpDisplay) {
            this.elements.userXpDisplay.innerText = formatXP(totalXP);
        }

        if (user) {
            if (this.elements.loginBtn) this.elements.loginBtn.style.display = 'none';
            if (this.elements.userProfileWrapper) this.elements.userProfileWrapper.style.display = 'flex';
            if (this.elements.userAvatar) {
                this.elements.userAvatar.src = user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;
            }
            if (this.elements.userName) {
                this.elements.userName.innerText = user.displayName ? user.displayName.split(' ')[0] : 'Aluno';
            }
        } else {
            if (this.elements.loginBtn) this.elements.loginBtn.style.display = 'flex';
            if (this.elements.userProfileWrapper) this.elements.userProfileWrapper.style.display = 'none';
        }
    }
}

export const headerNav = new HeaderNav();
