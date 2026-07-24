/**
 * BrainMat - Módulo de Visualização de Perfil do Jogador
 */

import { formatXP, formatNumber, calculateAccuracy, formatDate } from '../utils/formatters.js';

export class ProfileView {
    constructor(containerElement) {
        this.container = containerElement;
    }

    render(userProfile, rankingPosition = '-') {
        if (!this.container || !userProfile) return;

        const stats = userProfile.stats || {};
        const accuracy = calculateAccuracy(stats.correctAnswers, stats.totalQuestions);
        const createdDateFormatted = formatDate(userProfile.createdAt);

        this.container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar-wrapper">
                    <img class="profile-avatar-img" src="${userProfile.photoURL}" alt="${userProfile.displayName}">
                    <span class="profile-badge-icon">🎓</span>
                </div>
                <h2 class="profile-name">${userProfile.displayName}</h2>
                <p class="profile-email">${userProfile.email || 'Conta Convidado'}</p>
                <div class="profile-xp-pill">
                    ⚡ ${formatXP(userProfile.totalXP)}
                </div>
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
    }
}
