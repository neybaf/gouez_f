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
let errors = 0; // erreurs comptés
let matchesMade = 0; // bonnes réponses
let selectedSemestre = null;
let selectedNiveau = null;
let timer = 30; // Temps de départ
let timerInterval;
let score = 0

// Fonction pour démarrer le timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').textContent = `Temps restant : ${timer} sec`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);  // Décrémenter chaque seconde
}

// Fonction de fin de partie
function endGame() {
    clearInterval(timerInterval);
    alert(`Temps écoulé ! Votre score est de : ${score}, vous avez fait ${errors} erreurs`);
    // Réinitialiser ou redémarrer le jeu
    startGame();  // Recommencer la partie
}


async function loadQuestions() {
    const response = await fetch(`data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
    const data = await response.text();
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    for (let i = 1; i < lines.length; i++) {
        const [text, audioFile, imageFile] = lines[i].split(',');  // Ordre des colonnes
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
    timer = 30;  // Réinitialiser le timer à 30 secondes
    score = 0;   // Réinitialiser le score
    currentSet = getRandomSet(5);
    renderColumns();
    startTimer();  // Démarrer le timer
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
        rightItem.textContent = item.text || "Oups! Pas de texte disponible";
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
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = item;
            selectedLeft.classList.add('selected');
            checkMatch();
        });
    });

    document.querySelectorAll('#column-right .item').forEach(item => {
        item.addEventListener('click', function() {
            if (selectedRight) selectedRight.classList.remove('selected');
            selectedRight = item;
            selectedRight.classList.add('selected');
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
                score += 1;  // Ajouter 10 points pour une bonne réponse
                timer += 5;   // Ajouter 5 secondes pour une bonne réponse
            } else {
                errors++;
                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');
                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
                timer -= 5;   // Retirer 5 secondes pour une mauvaise réponse
            }

            selectedLeft = null;
            selectedRight = null;
            document.getElementById('score').textContent = `Score : ${score}`;
            
        // Si 3 bonnes correspondances sont faites, charger 3 nouvelles questions
        if (matchesMade % 3 === 0) {
            currentSet = getRandomSet(3);  // Charger 3 nouvelles questions
            renderColumns();  // Recharger les colonnes avec les nouvelles questions
        }

            if (matchesMade === currentSet.length) {
                showScore();
            }
            if (timer <= 0) {
                clearInterval(timerInterval);
                endGame();
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
function addClickHandlers() {
    let selectedLeft = null;
    let selectedRight = null;

    // Écouteurs d'événements pour les éléments de la colonne de gauche
    document.querySelectorAll('#column-left .item').forEach(item => {
        item.addEventListener('click', function() {
            // Si un élément gauche est déjà sélectionné, on l'annule pour permettre la sélection d'un nouveau
            if (selectedLeft) {
                selectedLeft.classList.remove('selected');
            }
            selectedLeft = item;
            selectedLeft.classList.add('selected');
            checkMatch();
        });
    });

    // Écouteurs d'événements pour les éléments de la colonne de droite
    document.querySelectorAll('#column-right .item').forEach(item => {
        item.addEventListener('click', function() {
            // Si un élément droit est déjà sélectionné, on l'annule pour permettre la sélection d'un nouveau
            if (selectedRight) {
                selectedRight.classList.remove('selected');
            }
            selectedRight = item;
            selectedRight.classList.add('selected');
            checkMatch();
        });
    });

    // Fonction pour vérifier la correspondance entre l'élément sélectionné à gauche et celui à droite
    function checkMatch() {
        if (selectedLeft && selectedRight) {
            const leftIndex = selectedLeft.dataset.index;
            const rightIndex = selectedRight.dataset.index;

            // Si les index correspondent, les éléments sont masqués
            if (leftIndex === rightIndex) {
                matchesMade++;
                selectedLeft.classList.add('hidden');
                selectedRight.classList.add('hidden');
            } else {
                // En cas d'erreur, on ajoute la classe "incorrect" temporairement
                errors++;
                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');
                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
            }

            // Réinitialisation des sélections
            selectedLeft = null;
            selectedRight = null;

            // Affichage du score si toutes les correspondances sont faites
            if (matchesMade === currentSet.length) {
                showScore();
            }
        }
    }
}
