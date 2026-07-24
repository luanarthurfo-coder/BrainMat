/**
 * BrainMat - Módulo de Formatadores e Auxiliares
 */

export function formatXP(xp) {
    if (xp === undefined || xp === null) return '0 XP';
    return Number(xp).toLocaleString('pt-BR') + ' XP';
}

export function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('pt-BR');
}

export function calculateAccuracy(correct, total) {
    if (!total || total === 0) return '0%';
    const pct = ((correct / total) * 100).toFixed(1);
    return `${pct}%`;
}

export function formatDate(dateInput) {
    if (!dateInput) return 'Data não informada';
    let date;
    if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return 'Data inválida';

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

export function getRankBadge(position) {
    if (position === 1) return { label: '🥇 1º Lugar', class: 'rank-gold' };
    if (position === 2) return { label: '🥈 2º Lugar', class: 'rank-silver' };
    if (position === 3) return { label: '🥉 3º Lugar', class: 'rank-bronze' };
    return { label: `#${position}`, class: 'rank-default' };
}
