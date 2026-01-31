const examData = [
    {
        name: "INSS - Técnico do Seguro Social",
        id: "inss",
        focus: [
            "Legislação Previdenciária (Leis 8.212, 8.213, Lei 8.742/LOAS)",
            "Regime Geral de Previdência Social (RGPS) e benefícios",
            "Emenda Constitucional 103/2019",
            "Português, Ética e Direito Administrativo/Constitucional",
            "Informática e Raciocínio Lógico"
        ]
    },
    {
        name: "Banco do Brasil - Escriturário",
        id: "bb",
        focus: [
            "Conhecimentos Bancários e Mercado Financeiro",
            "Vendas e Negociação (Técnicas e gatilhos)",
            "Matemática Financeira e Probabilidade/Estatística",
            "Português e Redação",
            "Informática e Atendimento ao Cliente"
        ]
    },
    {
        name: "Caixa Econômica Federal",
        id: "caixa",
        focus: [
            "Conhecimentos Bancários e Atualidades do Mercado Financeiro",
            "Atendimento Bancário e Comportamento Organizacional",
            "Matemática Financeira",
            "Português, Informática e Raciocínio Lógico"
        ]
    },
    {
        name: "Correios - Agente de Correios",
        id: "correios",
        focus: [
            "Língua Portuguesa (Interpretação e Gramática)",
            "Matemática Básica e Raciocínio Lógico",
            "Informática (Windows, Office e Internet)",
            "Código de Conduta Ética e Integridade"
        ]
    },
    {
        name: "Polícia Federal - Agente",
        id: "pf",
        focus: [
            "Contabilidade Geral e Avançada",
            "Informática/TI (Redes, Banco de Dados, Python/R)",
            "Estatística e Raciocínio Lógico",
            "Direito Administrativo, Constitucional, Penal e Processo Penal",
            "Português e Legislação Especial"
        ]
    },
    {
        name: "Polícia Rodoviária Federal - Policial",
        id: "prf",
        focus: [
            "Legislação de Trânsito (CTB e Resoluções CONTRAN)",
            "Direito Penal e Processo Penal",
            "Direito Administrativo e Constitucional",
            "Física (Cinemática e Dinâmica)",
            "Informática, Raciocínio Lógico e Português"
        ]
    },
    {
        name: "Receita Federal - Auditor",
        id: "receitaf",
        focus: [
            "Direito Tributário e Legislação Tributária",
            "Contabilidade Geral e Avançada",
            "Auditoria e Comércio Internacional",
            "Direito Administrativo, Constitucional e Previdenciário",
            "Português, Inglês/Espanhol e Raciocínio Lógico"
        ]
    }
];

// Extend data if needed, but for now focus on flow
let selectedExam = null;
let selectedLevel = null;
let selectedHours = null;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('concurso-search');
    const examList = document.getElementById('exam-list');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const progressBar = document.getElementById('progress-bar');
    const focusList = document.getElementById('focus-list');
    const resultTitle = document.getElementById('result-title');
    const loadingStatus = document.getElementById('loading-status');
    const finalCta = document.getElementById('final-cta');

    function populateExams(filter = "") {
        examList.innerHTML = "";
        const filtered = examData.filter(exam =>
            exam.name.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(exam => {
            const btn = document.createElement('button');
            btn.className = "exam-btn";
            btn.innerHTML = `<i class="fas fa-file-alt"></i> ${exam.name}`;
            btn.onclick = () => {
                selectedExam = exam;
                examList.classList.remove('active');
                goToStep(2);
            };
            examList.appendChild(btn);
        });
    }

    function goToStep(num) {
        step1.style.display = "none";
        step2.style.display = "none";
        step3.style.display = "none";
        loading.style.display = "none";
        result.style.display = "none";

        const currentStep = document.getElementById(`step-${num}`);
        if (currentStep) {
            currentStep.style.display = "block";
            currentStep.classList.add('animate-in');
        } else if (num === 'loading') {
            startLoading();
        }
    }

    // Step 2 and 3 button listeners
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const step = this.getAttribute('data-step');
            const val = this.getAttribute('data-value');

            if (step == "2") {
                selectedLevel = val;
                goToStep(3);
            } else if (step == "3") {
                selectedHours = val;
                goToStep('loading');
            }
        });
    });

    function startLoading() {
        loading.style.display = "block";
        const statuses = [
            "Cruzando dados do edital...",
            "Analisando seu nível: " + selectedLevel + "...",
            "Calculando cronograma para " + selectedHours + "h diárias...",
            "Identificando padrões da banca...",
            "Gerando seu Mapa de Foco..."
        ];

        let progress = 0;
        let statusIdx = 0;
        const interval = setInterval(() => {
            progress += 1;
            progressBar.style.width = progress + "%";

            if (progress % 20 === 0 && statusIdx < statuses.length - 1) {
                statusIdx++;
                loadingStatus.textContent = statuses[statusIdx];
            }

            if (progress >= 100) {
                clearInterval(interval);
                displayFinalResult();
            }
        }, 40);
    }

    function displayFinalResult() {
        loading.style.display = "none";
        result.style.display = "block";
        resultTitle.textContent = `Plano de Foco: ${selectedExam.name}`;

        focusList.innerHTML = "";
        selectedExam.focus.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle"></i> <span>${item}</span>`;
            focusList.appendChild(li);
        });

        // Add a specialized tip based on level
        const li = document.createElement('li');
        li.style.marginTop = "20px";
        li.style.color = "var(--color-primary)";
        li.style.fontWeight = "700";
        let tip = "";
        if (selectedLevel === 'iniciante') tip = "Dica: Como iniciante, foque 70% do tempo em Teoria e 30% em Questões.";
        else if (selectedLevel === 'intermediario') tip = "Dica: Para o seu nível, foque 50% em Revisões Ativas e 50% em Questões de fixação.";
        else tip = "Dica: Nível avançado exige 80% de Questões e Simulados com 20% de Revisão pontual.";

        li.innerHTML = `<i class="fas fa-lightbulb"></i> <span>${tip}</span>`;
        focusList.appendChild(li);
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            populateExams(e.target.value);
            if (e.target.value.length > 0) examList.classList.add('active');
        });

        searchInput.addEventListener('focus', () => {
            examList.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !examList.contains(e.target)) {
                examList.classList.remove('active');
            }
        });
    }

    if (finalCta) {
        finalCta.addEventListener('click', function () {
            const redirectOverlay = document.getElementById('redirect-overlay');
            const btnText = this.querySelector('.btn-text');
            const btnLoader = this.querySelector('.btn-loader');

            btnText.style.opacity = "0.5";
            btnLoader.style.display = "inline-block";
            this.style.pointerEvents = "none";

            setTimeout(() => {
                if (redirectOverlay) {
                    redirectOverlay.style.display = "flex";
                }
                setTimeout(() => {
                    window.location.href = "https://pay.kirvano.com/cc8d8e08-c40e-4268-bb96-39391348e954";
                }, 2000);
            }, 800);
        });
    }

    populateExams();
});
