/**
 * BrainMat - Módulo de Visualização e Edição do Perfil do Jogador
 */

import { formatXP, formatNumber, calculateAccuracy, formatDate } from '../utils/formatters.js';
import { dbService } from '../database/db-service.js';
import { authService } from '../auth/auth-service.js';
import { soundManager } from '../audio/sound-manager.js';

export class ProfileView {
    constructor(containerElement) {
        this.container = containerElement;
        this.currentProfile = null;
        this.selectedAvatarURL = '';
    }

    render(userProfile, rankingPosition = '-') {
        if (!this.container || !userProfile) return;

        this.currentProfile = userProfile;
        this.selectedAvatarURL = userProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.uid}`;

        const stats = userProfile.stats || {};
        const accuracy = calculateAccuracy(stats.correctAnswers, stats.totalQuestions);
        const createdDateFormatted = formatDate(userProfile.createdAt);

        const avatarPresets = [
            `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.uid}`,
            'https://api.dicebear.com/7.x/bottts/svg?seed=robot1',
            'https://api.dicebear.com/7.x/bottts/svg?seed=wizard',
            'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
            'https://api.dicebear.com/7.x/bottts/svg?seed=hero',
            'https://api.dicebear.com/7.x/bottts/svg?seed=einstein',
            'https://api.dicebear.com/7.x/bottts/svg?seed=ninja'
        ];

        this.container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar-wrapper">
                    <img class="profile-avatar-img" id="profile-main-avatar" src="${this.selectedAvatarURL}" alt="${userProfile.displayName}">
                    <span class="profile-badge-icon">🎓</span>
                </div>
                <h2 class="profile-name" id="profile-display-name">${userProfile.displayName}</h2>
                <p class="profile-email">${userProfile.email || 'Conta Convidado'}</p>
                <div class="profile-xp-pill">
                    ⚡ ${formatXP(userProfile.totalXP)}
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn-header-action" id="btn-toggle-edit-profile" style="margin: 0 auto; background: var(--btn-bg);">✏️ Editar Nome e Foto</button>
                </div>
            </div>

            <!-- SEÇÃO DE EDIÇÃO DO PERFIL -->
            <div id="profile-edit-box" class="profile-edit-drawer" style="display: none;">
                <div class="profile-section-title">✏️ Personalizar Perfil</div>
                
                <div class="edit-group">
                    <label class="edit-label">Nome de Exibição:</label>
                    <input type="text" id="edit-name-input" class="edit-input" value="${userProfile.displayName}" maxlength="24" placeholder="Digite seu nome">
                </div>

                <div class="edit-group">
                    <label class="edit-label">Escolha seu Avatar:</label>
                    <div class="avatar-presets-grid">
                        ${avatarPresets.map((url, idx) => `
                            <img class="avatar-preset-item ${url === this.selectedAvatarURL ? 'selected' : ''}" data-url="${url}" src="${url}" alt="Avatar ${idx}">
                        `).join('')}
                    </div>
                </div>

                <div class="edit-group">
                    <label class="edit-label">Ou cole a URL da sua Foto:</label>
                    <input type="url" id="edit-custom-avatar-url" class="edit-input" placeholder="https://exemplo.com/sua-foto.jpg">
                </div>

                <button class="btn-go" id="btn-save-profile" style="width: 100%; border-radius: 12px; margin-top: 10px; font-size: 1rem; padding: 10px;">💾 Salvar Alterações</button>
            </div>

            <div class="profile-grid">
                <div class="profile-card">
                    <span class="card-icon">🏆</span>
                    <div class="card-val">${rankingPosition}</div>
                    <div class="card-lbl">Posição Ranking</div>
                </div>

                <div class="profile-card">
                    <span class="card-icon">🎮</span>
                    <div class="card-val">${formatNumber(stats.gamesPlayed)}</div>
                    <div class="card-lbl">Partidas Jogadas</div>
                </div>

                <div class="profile-card">
                    <span class="card-icon">🎯</span>
                    <div class="card-val">${accuracy}</div>
                    <div class="card-lbl">Taxa de Acerto</div>
                </div>

                <div class="profile-card">
                    <span class="card-icon">🔥</span>
                    <div class="card-val">${formatNumber(stats.bestStreak)}</div>
                    <div class="card-lbl">Melhor Sequência</div>
                </div>
            </div>

            <div class="profile-section-title">📊 Estatísticas Detalhadas</div>
            
            <div class="profile-stats-list">
                <div class="stat-row">
                    <span>Total de Questões Respondidas</span>
                    <strong>${formatNumber(stats.totalQuestions)}</strong>
                </div>
                <div class="stat-row">
                    <span>Acertos Confirmados</span>
                    <strong style="color: var(--green);">${formatNumber(stats.correctAnswers)}</strong>
                </div>
                <div class="stat-row">
                    <span>Erros cometidos</span>
                    <strong style="color: var(--red);">${formatNumber(stats.wrongAnswers)}</strong>
                </div>
            </div>

            <div class="profile-section-title">➕ Operações Resolvidas</div>

            <div class="ops-grid">
                <div class="op-box">
                    <span class="op-sym">➕</span>
                    <span class="op-count">${formatNumber(stats.additionSolved)}</span>
                    <span class="op-name">Soma</span>
                </div>
                <div class="op-box">
                    <span class="op-sym">➖</span>
                    <span class="op-count">${formatNumber(stats.subtractionSolved)}</span>
                    <span class="op-name">Subtração</span>
                </div>
                <div class="op-box">
                    <span class="op-sym">✖️</span>
                    <span class="op-count">${formatNumber(stats.multiplicationSolved)}</span>
                    <span class="op-name">Multiplicação</span>
                </div>
                <div class="op-box">
                    <span class="op-sym">➗</span>
                    <span class="op-count">${formatNumber(stats.divisionSolved)}</span>
                    <span class="op-name">Divisão</span>
                </div>
            </div>

            <div class="profile-footer-info">
                📅 Conta criada em: <strong>${createdDateFormatted}</strong>
            </div>
        `;

        this.bindProfileEvents();
    }

    bindProfileEvents() {
        const btnToggle = this.container.querySelector('#btn-toggle-edit-profile');
        const editBox = this.container.querySelector('#profile-edit-box');

        if (btnToggle && editBox) {
            btnToggle.addEventListener('click', () => {
                soundManager.playClick();
                const isHidden = editBox.style.display === 'none';
                editBox.style.display = isHidden ? 'block' : 'none';
                btnToggle.innerText = isHidden ? '❌ Cancelar Edição' : '✏️ Editar Nome e Foto';
            });
        }

        // Seleção de preset de avatar
        const presetItems = this.container.querySelectorAll('.avatar-preset-item');
        const customUrlInput = this.container.querySelector('#edit-custom-avatar-url');
        const mainAvatarImg = this.container.querySelector('#profile-main-avatar');

        presetItems.forEach(item => {
            item.addEventListener('click', () => {
                soundManager.playClick();
                presetItems.forEach(p => p.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedAvatarURL = item.getAttribute('data-url');
                if (mainAvatarImg) mainAvatarImg.src = this.selectedAvatarURL;
                if (customUrlInput) customUrlInput.value = '';
            });
        });

        if (customUrlInput) {
            customUrlInput.addEventListener('input', () => {
                if (customUrlInput.value.trim().length > 5) {
                    presetItems.forEach(p => p.classList.remove('selected'));
                    this.selectedAvatarURL = customUrlInput.value.trim();
                    if (mainAvatarImg) mainAvatarImg.src = this.selectedAvatarURL;
                }
            });
        }

        // Botão Salvar Perfil
        const btnSave = this.container.querySelector('#btn-save-profile');
        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                soundManager.playClick();
                const nameInput = this.container.querySelector('#edit-name-input');
                const newName = nameInput ? nameInput.value.trim() : '';

                if (!newName) {
                    alert('Por favor, digite um nome válido!');
                    return;
                }

                btnSave.innerText = '⏳ Salvando...';
                btnSave.disabled = true;

                const user = authService.getUser();
                const updatedProfile = await dbService.updateUserProfile(user, newName, this.selectedAvatarURL);

                soundManager.playAchievement();

                if (window.BrainMatApp) {
                    await window.BrainMatApp.refreshUserData();
                }

                btnSave.innerText = '✅ Salvo com Sucesso!';
                setTimeout(() => {
                    if (editBox) editBox.style.display = 'none';
                    if (btnToggle) btnToggle.innerText = '✏️ Editar Nome e Foto';
                    btnSave.innerText = '💾 Salvar Alterações';
                    btnSave.disabled = false;
                }, 1000);
            });
        }
    }
}
