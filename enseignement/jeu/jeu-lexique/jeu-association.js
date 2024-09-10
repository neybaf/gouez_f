// Gestion des boutons de sélection de semestre et de sous-niveau
document.querySelectorAll('.semestre-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Enlever la classe 'selected' de tous les boutons de semestre
        document.querySelectorAll('.semestre-btn').forEach(btn => btn.classList.remove('selected'));
        // Ajouter la classe 'selected' au bouton cliqué
        this.classList.add('selected');

        selectedSemestre = this.dataset.semestre;
        document.getElementById('semesters').classList.add('hidden');
        document.getElementById('sous-niveaux').classList.remove('hidden');
    });
});

document.querySelectorAll('.niveau-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Enlever la classe 'selected' de tous les boutons de sous-niveau
        document.querySelectorAll('.niveau-btn').forEach(btn => btn.classList.remove('selected'));
        // Ajouter la classe 'selected' au bouton cliqué
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
    
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
        const [imageFile, audioFile, text] = lines[i].split(',');
        if (imageFile || audioFile || text) {
            questions.push({
                imageFile: headers.includes('image') ? imageFile || null : null,
                audioFile: headers.includes('audio') ? audioFile || null : null,
                text: headers.includes('text') ? text || null : null
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
function renderColumns() {
    const leftColumn = document.getElementById('column-left');
    const rightColumn = document.getElementById('column-right');
    
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    currentSet.forEach((item, index) => {
        // Colonne gauche : Image ou son
        const leftItem = document.createElement('div');
        leftItem.classList.add('item');
        
        if (item.imageFile) {
            leftItem.innerHTML = `<img src="${item.imageFile}" alt="Image" width="100">`;
        } else if (item.audioFile) {
            leftItem.innerHTML = `<audio controls src="${item.audioFile}"></audio>`;
        }
        leftItem.dataset.index = index;
        leftColumn.appendChild(leftItem);

        // Colonne droite : Texte
        const rightItem = document.createElement('div');
        rightItem.classList.add('item');
        rightItem.textContent = item.text || "Pas de texte disponible";
        rightItem.dataset.index = index;
        rightColumn.appendChild(rightItem);
    });

    addClickHandlers();
}

function addClickHandlers() {
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
}

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

loadQuestions();