/**
 * BrainMat - Engine de Desafios Matemáticos
 * Gera operações matematicas progressivas (+, -, *, /, sobrevivência) e calcula XP dinâmico.
 */

export class MathEngine {
    constructor() {
        this.currentProblem = null;
    }

    generateProblem(mode, contaNum) {
        let num1, num2, symbol, opKey;
        const op = mode === 'mix' ? ['+', '-', '*', '/'][Math.floor(Math.random() * 4)] : mode;
        opKey = op;

        // Dificuldade progressiva com base no número da conta
        const rangeMax = 5 + Math.floor(contaNum * 1.5);

        switch(op) {
            case '+':
                num1 = Math.floor(Math.random() * rangeMax) + 1;
                num2 = Math.floor(Math.random() * rangeMax) + 1;
                symbol = '+';
                this.currentProblem = {
                    num1,
                    num2,
                    symbol,
                    opKey,
                    answer: num1 + num2,
                    display: `${num1} + ${num2}`,
                    baseXP: 10
                };
                break;

            case '-':
                num1 = Math.floor(Math.random() * rangeMax) + 2;
                num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Garante resultado positivo
                symbol = '-';
                this.currentProblem = {
                    num1,
                    num2,
                    symbol,
                    opKey,
                    answer: num1 - num2,
                    display: `${num1} - ${num2}`,
                    baseXP: 10
                };
                break;

            case '*':
                const multMax = Math.min(12, 2 + Math.floor(contaNum / 2));
                num1 = Math.floor(Math.random() * multMax) + 1;
                num2 = Math.floor(Math.random() * multMax) + 1;
                symbol = '×';
                this.currentProblem = {
                    num1,
                    num2,
                    symbol,
                    opKey,
                    answer: num1 * num2,
                    display: `${num1} × ${num2}`,
                    baseXP: 15
                };
                break;

            case '/':
                const divMax = Math.min(10, 2 + Math.floor(contaNum / 3));
                num2 = Math.floor(Math.random() * divMax) + 1;
                const answer = Math.floor(Math.random() * divMax) + 1;
                num1 = answer * num2; // Divisão exata sem restos
                symbol = '÷';
                this.currentProblem = {
                    num1,
                    num2,
                    symbol,
                    opKey,
                    answer: answer,
                    display: `${num1} ÷ ${num2}`,
                    baseXP: 15
                };
                break;
        }

        if (mode === 'mix') {
            this.currentProblem.baseXP += 5; // Bônus adicional no modo Sobrevivência
        }

        return this.currentProblem;
    }

    /**
     * Calcula o XP ganho para a conta resolvida com base em:
     * - Dificuldade base da operação
     * - Número da conta (quanto mais avançado, mais XP)
     * - Bônus de tempo restante (%)
     * - Multiplicador de Combo Streak
     */
    calculateXP(problem, contaNum, timeLeft, maxTime, combo) {
        const difficultyBonus = Math.floor(contaNum / 3);
        const timeBonus = Math.floor((timeLeft / maxTime) * 15);
        const baseTotal = problem.baseXP + difficultyBonus + timeBonus;
        
        return {
            xpGained: Math.floor(baseTotal * combo),
            timeBonus: timeBonus
        };
    }
}

export const mathEngine = new MathEngine();
