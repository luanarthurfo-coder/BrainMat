/**
 * BrainMat - Controladora do Jogo
 * Gerencia ciclo de partida, cronômetro, combos, entrada de respostas e sincronização de estatísticas.
 */

import { mathEngine } from './math-engine.js';
import { soundManager } from '../audio/sound-manager.js';
import { dbService } from '../database/db-service.js';
import { authService } from '../auth/auth-service.js';

export class GameController {
    constructor() {
        this.currentOpMode = '';
        this.contaNum = 1;
        this.score = 0;
        this.combo = 1;
        this.bestSessionStreak = 0;
        this.currentInput = '';
        this.maxTime = 10000;
        this.timeLeft = 10000;
        this.timerInterval = null;
        this.currentProblem = null;
        this.isGameActive = false;

        // Estatísticas da sessão atual
        this.sessionStats = {
            questionsCount: 0,
            correctCount: 0,
            wrongCount: 0,
            xpGained: 0,
            bestSessionStreak: 0,
            opStats: { '+': 0, '-': 0, '*': 0, '/': 0 }
        };

        // Elementos DOM
        this.elements = {};
    }

    bindElements(elements) {
        this.elements = elements;
    }

    startGame(mode) {
        soundManager.playClick();
        soundManager.startBgMusic();

        this.currentOpMode = mode;
        this.resetSession();
        this.isGameActive = true;

        if (this.elements.menuScreen) this.elements.menuScreen.style.display = 'none';
        if (this.elements.gameScreen) this.elements.gameScreen.style.display = 'flex';

        this.nextProblem();
    }

    resetSession() {
        this.contaNum = 1;
        this.score = 0;
        this.combo = 1;
        this.bestSessionStreak = 0;
        this.currentInput = '';
        
        this.sessionStats = {
            questionsCount: 0,
            correctCount: 0,
            wrongCount: 0,
            xpGained: 0,
            bestSessionStreak: 0,
            opStats: { '+': 0, '-': 0, '*': 0, '/': 0 }
        };

        this.updateStatsUI();
    }

    nextProblem() {
        if (!this.isGameActive) return;

        this.currentInput = '';
        if (this.elements.inputText) this.elements.inputText.innerText = '';
        if (this.elements.inputDisplayBox) {
            this.elements.inputDisplayBox.classList.remove('error', 'success');
        }

        // Tempo reduz suavemente conforme o número da conta (mínimo 3000ms)
        this.maxTime = Math.max(3000, 10000 - (this.contaNum * 150));
        this.timeLeft = this.maxTime;

        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 30);

        // Gera novo problema na mathEngine
        this.currentProblem = mathEngine.generateProblem(this.currentOpMode, this.contaNum);

        if (this.elements.problemEl) {
            this.elements.problemEl.innerText = this.currentProblem.display;
        }

        if (this.elements.contaCounterEl) {
            const isMix = this.currentOpMode === 'mix';
            this.elements.contaCounterEl.innerText = isMix ? `☠️ CONTA #${this.contaNum}` : `CONTA #${this.contaNum}`;
        }
    }

    updateTimer() {
        this.timeLeft -= 30;
        const percentage = Math.max(0, (this.timeLeft / this.maxTime) * 100);

        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = `${percentage}%`;

            if (percentage < 30) {
                this.elements.progressBar.style.backgroundColor = '#f43f5e';
            } else if (percentage < 60) {
                this.elements.progressBar.style.backgroundColor = '#ffd13b';
            } else {
                this.elements.progressBar.style.backgroundColor = '#4ade80';
            }
        }

        if (this.timeLeft <= 0) {
            clearInterval(this.timerInterval);
            this.wrongAnswer();
        }
    }

    addNum(num) {
        if (!this.isGameActive) return;
        soundManager.playClick();
        if (this.currentInput.length < 7) {
            this.currentInput += num;
            if (this.elements.inputText) {
                this.elements.inputText.innerText = this.currentInput;
            }
        }
    }

    delNum() {
        if (!this.isGameActive) return;
        soundManager.playClick();
        this.currentInput = this.currentInput.slice(0, -1);
        if (this.elements.inputText) {
            this.elements.inputText.innerText = this.currentInput;
        }
    }

    checkAnswer() {
        if (!this.isGameActive || this.currentInput === '') return;

        const numAnswer = parseFloat(this.currentInput);
        if (numAnswer === this.currentProblem.answer) {
            this.rightAnswer();
        } else {
            this.wrongAnswer();
        }
    }

    async rightAnswer() {
        soundManager.playCorrect();
        if (this.elements.inputDisplayBox) {
            this.elements.inputDisplayBox.classList.add('success');
        }

        // Cálculo de XP Dinâmico
        const { xpGained, timeBonus } = mathEngine.calculateXP(
            this.currentProblem,
            this.contaNum,
            this.timeLeft,
            this.maxTime,
            this.combo
        );

        this.score += xpGained;
        this.sessionStats.xpGained += xpGained;
        this.sessionStats.questionsCount += 1;
        this.sessionStats.correctCount += 1;
        
        // Registra a operação resolvida
        if (this.currentProblem.opKey) {
            this.sessionStats.opStats[this.currentProblem.opKey] = (this.sessionStats.opStats[this.currentProblem.opKey] || 0) + 1;
        }

        // Atualização de Streak
        this.combo += 1;
        if (this.combo > this.bestSessionStreak) {
            this.bestSessionStreak = this.combo;
            this.sessionStats.bestSessionStreak = this.bestSessionStreak;
        }

        this.contaNum += 1;

        this.updateStatsUI();
        this.createFloatingText(`+${xpGained} XP`, '#ffd13b');
        if (timeBonus > 10) this.createFloatingText('RÁPIDO! ⚡', '#4ade80', -35);

        // Som especial se atingir combo alto
        if (this.combo % 5 === 0) {
            soundManager.playAchievement();
            this.createFloatingText(`COMBO ${this.combo}x! 🔥`, '#f43f5e', -60);
        }

        setTimeout(() => this.nextProblem(), 220);
    }

    wrongAnswer() {
        soundManager.playWrong();
        if (this.elements.inputDisplayBox) {
            this.elements.inputDisplayBox.classList.add('error');
        }

        this.sessionStats.questionsCount += 1;
        this.sessionStats.wrongCount += 1;

        this.createFloatingText('ERROU! ❌', '#f43f5e');

        // Reseta combo
        this.combo = 1;

        setTimeout(async () => {
            if (this.currentOpMode === 'mix') {
                // Modo sobrevivência: encerra a rodada e salva
                await this.endGameRun();
            } else {
                // Modo normal: continua para a próxima conta zerando o combo
                this.updateStatsUI();
                this.nextProblem();
            }
        }, 650);
    }

    async endGameRun() {
        clearInterval(this.timerInterval);
        this.isGameActive = false;

        // Salvar os dados acumulados no Firestore ou LocalStorage
        const user = authService.getUser();
        await dbService.recordGameResults(user, this.sessionStats);

        // Notifica o app para atualizar o perfil e ranking
        if (window.BrainMatApp && typeof window.BrainMatApp.refreshUserData === 'function') {
            window.BrainMatApp.refreshUserData();
        }

        this.showMenu();
    }

    showMenu() {
        clearInterval(this.timerInterval);
        this.isGameActive = false;

        // Salva qualquer resultado pendente
        if (this.sessionStats.questionsCount > 0) {
            const user = authService.getUser();
            dbService.recordGameResults(user, this.sessionStats);
            this.sessionStats.questionsCount = 0; // Evita salvar duplicado
        }

        if (this.elements.gameScreen) this.elements.gameScreen.style.display = 'none';
        if (this.elements.menuScreen) this.elements.menuScreen.style.display = 'flex';
    }

    updateStatsUI() {
        if (this.elements.scoreDisplay) this.elements.scoreDisplay.innerText = this.score;
        if (this.elements.comboDisplay) this.elements.comboDisplay.innerText = `x${this.combo} 🔥`;
    }

    createFloatingText(text, color, offsetY = 0) {
        if (!this.elements.problemContainer) return;

        const el = document.createElement('div');
        el.className = 'popup-text';
        el.innerText = text;
        el.style.color = color;
        el.style.left = `${Math.random() * 30 + 35}%`;
        el.style.top = `${offsetY}px`;

        this.elements.problemContainer.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 800);
    }
}

export const gameController = new GameController();
