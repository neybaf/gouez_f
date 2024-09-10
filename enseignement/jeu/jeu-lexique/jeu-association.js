let questions = [];
let currentSet = [];
let errors = 0;
let matchesMade = 0;
let selectedSemestre = null;
let selectedNiveau = null;

async function loadQuestions() {
    // gestion du CSV basé sur le semestre et le sous-niveau sélectionnés ex:lexique_S1_U1
    const response = await fetch(`data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
    const data = await response.text();
    const lines = data.split('\n').filter(line => line.trim() !== ''); // Ignore les lignes vides
    
    const headers = lines[0].split(','); // Ignorer la première ligne des titres
    for (let i = 1; i < lines.length; i++) {
        const [imageFile, audioFile, text] = lines[i].split(',');
        // S'assurer qu'au moins un élément (image, audio ou texte) existe avant de l'ajouter
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
    currentSet = getRandomSet(5);  // Nous sélectionnons 5 éléments aléatoirement
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
        // Gérer les éléments dans la colonne de gauche (images ou sons)
        const leftItem = document.createElement('div');
        leftItem.classList.add('item');
        
        if (item.imageFile) {
            leftItem.innerHTML = `<img src="${item.imageFile}" alt="Image" width="100">`;
        } else if (item.audioFile) {
            leftItem.innerHTML = `<audio controls src="${item.audioFile}"></audio>`;
        }
        leftItem.dataset.index = index;
        leftColumn.appendChild(leftItem);

        // Gérer les éléments dans la colonne de droite (texte)
        const rightItem = document.createElement('div');
        rightItem.classList.add('item');
        if (item.text) {
            rightItem.textContent = item.text;
        } else {
            rightItem.textContent = "Pas de texte disponible";
        }
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

// Gestion du popup de sélection de niveau
document.querySelectorAll('.semestre-btn').forEach(button => {
    button.addEventListener('click', function() {
        selectedSemestre = this.dataset.semestre;
        document.getElementById('semesters').classList.add('hidden');
        document.getElementById('sous-niveaux').classList.remove('hidden');
    });
});

document.querySelectorAll('.niveau-btn').forEach(button => {
    button.addEventListener('click', function() {
        selectedNiveau = this.dataset.niveau;
        document.getElementById('level-popup').style.display = 'none';
        document.getElementById('game-container').classList.remove('hidden');
        loadQuestions();
    });
});