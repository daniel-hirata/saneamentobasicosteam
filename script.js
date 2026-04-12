let stars = 0;
let currentLevel = null;
let currentQuestionIndex = 0;
let score = 0;
let etaData = [];

// Elementos do DOM
const starCountEl = document.getElementById('star-count');
const levelsContainer = document.getElementById('levels-container');
const worldMapScreen = document.getElementById('world-map');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const levelTitleEl = document.getElementById('level-title');
const levelDescEl = document.getElementById('level-desc');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const currentQEl = document.getElementById('current-q');

const resultTitleEl = document.getElementById('result-title');
const resultTextEl = document.getElementById('result-text');
const resultStarEl = document.getElementById('result-star');
const backToMapBtn = document.getElementById('back-to-map');

// Inicialização
async function init() {
    try {
        const response = await fetch('eta_content.json');
        etaData = await response.json();
        renderMap();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

// Renderizar o Mapa de Fases
function renderMap() {
    levelsContainer.innerHTML = '';
    starCountEl.textContent = stars;

    etaData.forEach((level, index) => {
        const levelNode = document.createElement('div');
        levelNode.className = 'level-node';
        
        // Lógica de Disponibilidade: 
        // estrelas = 0 -> nível 1 (index 0) disponível
        // estrelas = 1 -> nível 2 (index 1) disponível
        // ... e assim por diante
        const isAvailable = stars >= index;
        const isCompleted = stars > index;

        if (!isAvailable) {
            levelNode.classList.add('locked');
            levelNode.innerHTML = `<span class="locked-icon">🔒</span>`;
        } else {
            if (isCompleted) levelNode.classList.add('completed');
            levelNode.innerHTML = `<span class="level-number">${level.id}</span>`;
        }

        const label = document.createElement('div');
        label.className = 'level-label';
        label.textContent = level.name;
        levelNode.appendChild(label);

        levelNode.onclick = () => {
            console.log("Clicou na fase:", level.id, "Estrelas atuais:", stars, "Disponível:", isAvailable);
    if (isAvailable) {
        startLevel(level);
    } else {
        alert(`Estrelas insuficientes! Você precisa de ${index} estrelas.`);
    }
};
        levelsContainer.appendChild(levelNode);
    });
}

// Iniciar uma Fase
function startLevel(level) {
    currentLevel = level;
    currentQuestionIndex = 0;
    score = 0;
    
    worldMapScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    showQuestion();
}


// Mostrar Pergunta
function showQuestion() {
    const question = currentLevel.questions[currentQuestionIndex];
    levelTitleEl.textContent = `Fase ${currentLevel.id}: ${currentLevel.name}`;
    levelDescEl.textContent = currentLevel.description;
    questionTextEl.textContent = question.q;
    currentQEl.textContent = currentQuestionIndex + 1;
    
    optionsContainerEl.innerHTML = '';
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => handleAnswer(index);
        optionsContainerEl.appendChild(btn);
    });
}

// Lidar com Resposta
function handleAnswer(selectedIndex) {
    const question = currentLevel.questions[currentQuestionIndex];
    
    if (selectedIndex === question.answer) {
        score++;
        // Feedback visual simples
        optionsContainerEl.children[selectedIndex].style.backgroundColor = 'var(--mario-green)';
    } else {
        optionsContainerEl.children[selectedIndex].style.backgroundColor = 'var(--mario-red)';
    }

    // Pequeno delay para ver a resposta antes de passar
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentLevel.questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 500);
}

// Mostrar Resultado da Fase
function showResult() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const passed = score >= 2; 
    const isNewStar = stars === (currentLevel.id - 1);

    if (passed) {
        resultTitleEl.textContent = "FASE CONCLUÍDA!";
        resultTextEl.textContent = `Parabéns! Você acertou ${score} de 4 questões.`;
        
        if (isNewStar) {
            stars++;
            resultStarEl.classList.remove('hidden');
        }

        // VERIFICAÇÃO DE VITÓRIA TOTAL
        // Se o número de estrelas for igual ao total de fases no JSON
        if (stars === etaData.length) {
            setTimeout(() => {
                resultScreen.classList.add('hidden');
                document.getElementById('final-win-screen').classList.remove('hidden');
                document.getElementById('game-container').classList.add('hidden');
                document.getElementById('final-win-screen').style.display = 'flex';
                
            }, 2000); // Espera 2 segundos para o jogador ver que ganhou a última estrela
        }

    } else {
        resultTitleEl.textContent = "TENTE NOVAMENTE";
        resultTextEl.textContent = `Você acertou apenas ${score} de 4 questões. São necessários 2 acertos para passar.`;
        resultStarEl.classList.add('hidden');
    }
}




// Voltar ao Mapa
backToMapBtn.onclick = () => {
    resultScreen.classList.add('hidden');
    worldMapScreen.classList.remove('hidden');
    renderMap();
};

// Iniciar
init();