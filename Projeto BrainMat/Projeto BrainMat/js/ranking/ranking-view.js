/**
 * BrainMat - Módulo de Visualização de Ranking Global em Tempo Real
 */

import { formatXP, getRankBadge } from '../utils/formatters.js';

export class RankingView {
    constructor(containerElement) {
        this.container = containerElement;
    }

    render(rankingList, currentUserId = null) {
        if (!this.container) return;

        if (!rankingList || rankingList.length === 0) {
            this.container.innerHTML = `
                <div class="ranking-empty">
                    <p>🏆 Nenhum jogador registrado no ranking ainda.</p>
                    <p class="subtitle">Seja o primeiro a jogar e conquistar o topo!</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="ranking-header">
                <h3>🏆 Ranking Global dos Alunos</h3>
                <p class="subtitle">Top 100 maiores pontuadores em tempo real</p>
            </div>
            <div class="ranking-list">
        `;

        rankingList.forEach((item, index) => {
            const pos = item.position || (index + 1);
            const badge = getRankBadge(pos);
            const isCurrentUser = currentUserId && (item.uid === currentUserId);
            const highlightClass = isCurrentUser ? 'ranking-item-me' : '';

            html += `
                <div class="ranking-item ${badge.class} ${highlightClass}">
                    <div class="rank-num">${badge.label}</div>
                    <img class="rank-avatar" src="${item.photoURL}" alt="${item.displayName}">
                    <div class="rank-info">
                        <span class="rank-name">${item.displayName} ${isCurrentUser ? ' <span>(Você)</span>' : ''}</span>
                        <span class="rank-school">${item.school || 'Escola BrainMat'}</span>
                    </div>
                    <div class="rank-xp">${formatXP(item.totalXP)}</div>
                </div>
            `;
        });

        html += `</div>`;
        this.container.innerHTML = html;
    }
}
