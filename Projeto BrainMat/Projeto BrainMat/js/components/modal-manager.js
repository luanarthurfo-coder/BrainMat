/**
 * BrainMat - Gerenciador de Janelas Modais
 */

import { soundManager } from '../audio/sound-manager.js';

export class ModalManager {
    constructor() {
        this.activeModal = null;
    }

    open(modalId) {
        soundManager.playClick();
        const modal = document.getElementById(modalId);
        if (modal) {
            this.closeAll();
            modal.style.display = 'flex';
            this.activeModal = modal;
            document.body.style.overflow = 'hidden';
        }
    }

    closeAll() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.style.display = 'none');
        this.activeModal = null;
        document.body.style.overflow = '';
    }

    bindCloseEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close-btn')) {
                soundManager.playClick();
                this.closeAll();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    }
}

export const modalManager = new ModalManager();
