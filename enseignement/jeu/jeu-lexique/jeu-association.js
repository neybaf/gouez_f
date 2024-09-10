// Gestion des boutons de sélection de semestre et de sous-niveau
document.querySelectorAll('.semestre-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.semestre-btn').forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');

        selectedSemestre = this.dataset.semestre;
        document.getElementById('semesters').classList.add('hidden');
        document.getElementById('sous-niveaux').classList.remove('hidden');
    });
});

document.querySelectorAll('.niveau-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.niveau-btn').forEach(btn => btn.classList.remove('selected'));
        this.classList.add('selected');

        selectedNiveau = this.dataset.niveau;
        document.getElementById('sous-niveaux').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        loadQuestions();
    });
});

let questions = [];
let currentSet = [];
let errors = 0;
let matchesMade = 0;
let selectedSemestre = null;
let selectedNiveau = null;

async function loadQuestions() {
    const response = await fetch(`data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
    const data = await response.text();
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    for (let i = 1; i < lines.length; i++) {
        const [text, audioFile, imageFile] = lines[i].split(',');  // Réordonnancement correct
        if (imageFile || audioFile || text) {
            questions.push({
                imageFile: imageFile || null,
                audioFile: audioFile || null,
                text: text || null
            });
        }
    }
    startGame();
}

function startGame() {
    errors = 0;
    matchesMade = 0;
    currentSet = getRandomSet(5);
    renderColumns();
}

function getRandomSet(number) {
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, number);
}

function renderColumns() {
    const leftColumn = document.getElementById('column-left');
    const rightColumn = document.getElementById('column-right');
    
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    currentSet.forEach((item, index) => {
        const leftItem = document.createElement('div');
        leftItem.classList.add('item');
        
        if (item.imageFile) {
            leftItem.innerHTML = `<img src="${item.imageFile}" alt="Image" width="100">`;
        }
        else if (item.audioFile) {
            leftItem.innerHTML = `<audio controls src="${item.audioFile}"></audio>`;
        }
        leftItem.dataset.index = index;
        leftColumn.appendChild(leftItem);

        const rightItem = document.createElement('div');
        rightItem.classList.add('item');
        rightItem.textContent = item.text || "Pas de texte disponible";
        rightItem.dataset.index = index;
        rightColumn.appendChild(rightItem);
    });

    addClickHandlers();
}

function addClickHandlers() {
    let selectedLeft = null;
    let selectedRight = null;

    document.querySelectorAll('#column-left .item').forEach(item => {
        item.addEventListener('click', function() {
            selectedLeft = item;
            checkMatch();
        });
    });

    document.querySelectorAll('#column-right .item').forEach(item => {
        item.addEventListener('click', function() {
            selectedRight = item;
            checkMatch();
        });
    });

    function checkMatch() {
        if (selectedLeft && selectedRight) {
            const leftIndex = selectedLeft.dataset.index;
            const rightIndex = selectedRight.dataset.index;

            if (leftIndex === rightIndex) {
                matchesMade++;
                selectedLeft.classList.add('hidden');
                selectedRight.classList.add('hidden');
            } else {
                errors++;
                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');
                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
            }

            selectedLeft = null;
            selectedRight = null;

            if (matchesMade === currentSet.length) {
                showScore();
            }
        }
    }
}

function showScore() {
    const scorePopup = document.getElementById('score-popup');
    const scoreResult = document.getElementById('score-result');
    scoreResult.textContent = `Erreurs: ${errors}. Score: ${currentSet.length - errors}`;
    scorePopup.style.display = 'block';
}

document.getElementById('replay-btn').addEventListener('click', function() {
    document.getElementById('score-popup').style.display = 'none';
    startGame();
});

document.getElementById('share-btn').addEventListener('click', function() {
    alert('Partage du score bientôt disponible!');
});
