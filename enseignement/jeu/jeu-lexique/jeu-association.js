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
let correctAnswers = 0;
let matchesMade = 0;
let selectedSemestre = null;
let selectedNiveau = null;
let timer = 30;
let timerInterval;
let score = 0;

// Fonction pour démarrer le timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').textContent = `Temps restant : ${timer} sec`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);  
}

// Fonction de fin de partie
function endGame() {
    clearInterval(timerInterval);
    
    // Créer un popup personnalisé
    const popup = document.createElement('div');
    popup.id = 'endgame-popup';
    popup.innerHTML = `
        <p>Temps écoulé !</p>
        <p>Votre score est de : ${score}, vous avez fait ${errors} erreur(s)</p>
        <button id="share-btn">Partager</button>
        <button id="change-level-btn">Encore ! </button>
    `;
    
    document.body.appendChild(popup);
    
    // Gestion du bouton "Partager"

    // Gestion du bouton "Rejouer"
    
    // Gestion du bouton "Changer de niveau"
    document.getElementById('change-level-btn').addEventListener('click', function() {
        document.getElementById('endgame-popup').remove(); // Supprimer le popup
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('semesters').classList.remove('hidden'); // Retour à la sélection des niveaux
    });
}
async function loadQuestions() {
    const response = await fetch(`data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
    const data = await response.text();
    const lines = data.split('\n').filter(line => line.trim() !== '');

    for (let i = 1; i < lines.length; i++) {
        const [text, audioFile, imageFile] = lines[i].split(',');
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
    correctAnswers = 0;
    timer = 30;
    score = 0;
    document.getElementById('score').textContent = `Score : ${score}`;
    currentSet = getRandomSet(5);
    renderColumns();
    startTimer();
}
function resetGame() {
    errors = 0;
    correctAnswers = 0;
    matchesMade = 0;
    score = 0;
    timer = 30;
    questions = [];  // Recharger les questions
    loadQuestions(); // Recharger les questions depuis le CSV
    document.getElementById('score').textContent = `Score : ${score}`;
    document.getElementById('timer').textContent = `Temps restant : ${timer} sec`;
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
    
    // Colonne gauche : les questions sont dans l'ordre du CSV
    currentSet.forEach((item, index) => {
        const leftItem = document.createElement('div');
        leftItem.classList.add('item');
        
        if (item.imageFile) {
            leftItem.innerHTML = `<img src="${item.imageFile}" alt="Image" width="100">`;
        } else if (item.audioFile) {
            leftItem.innerHTML = `<audio controls src="${item.audioFile}"></audio>`;
        }
        leftItem.dataset.index = index;  // Conserver l'index pour la correspondance
        leftColumn.appendChild(leftItem);
    });
    
    // Colonne droite : les réponses mélangées
    const shuffledAnswers = [...currentSet].sort(() => Math.random() - 0.5);
    shuffledAnswers.forEach((item, index) => {
        const rightItem = document.createElement('div');
        rightItem.classList.add('item');
        rightItem.textContent = item.text || "Ouuuups! Pas de texte disponible";
        rightItem.dataset.index = currentSet.indexOf(item);  // L'index doit correspondre à la position correcte
        rightColumn.appendChild(rightItem);
    });
    
    addClickHandlers();
}

function addClickHandlers() {
    let selectedLeft = null;
    let selectedRight = null;

// Gestion colonne de gauche - médias// 
    document.querySelectorAll('#column-left .item').forEach(item => {
        item.addEventListener('click', function() {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = item;
            selectedLeft.classList.add('selected');
            checkMatch();
        });
        const audioElement = item.querySelector('audio');
        if (audioElement) {
            audioElement.addEventListener('play', function() {
                // Désélectionner tout autre élément
                if (selectedLeft) selectedLeft.classList.remove('selected');
                // Sélectionner l'élément contenant l'audio joué
                selectedLeft = item;
                selectedLeft.classList.add('selected');
                checkMatch(); // Vérifier si une correspondance est faite
            });
        }
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
                correctAnswers++;
                score += 1;
                timer += 5;
                
                // Jouer le son pour la bonne réponse
                const audio = new Audio('bonne_reponse.m4a');
                audio.play();
                
                // animation de bonne réponse
                selectedLeft.classList.add('correct');
                selectedRight.classList.add('correct');

            
                // Désactive les éléments pour éviter de gagner plus de points en cliquant à nouveau (you smart ass)
                selectedLeft.classList.add('disabled');
                selectedRight.classList.add('disabled');

                //  Tempo anim
                selectedLeft.style.animation = 'correct-answer 0.5s ease';
                selectedRight.style.animation = 'correct-answer 0.5s ease';
                setTimeout(() => {
                    selectedLeft.style.animation = '';
                    selectedRight.style.animation = '';
                }, 500);  // Masquer anim
                
                if (correctAnswers === 5) {
                    correctAnswers = 0;
                    currentSet = getRandomSet(5);  // Obtenir 5 nouvelles questions
                    renderColumns();  // Réafficher les colonnes avec  nouvelles questions
                }
            } else {
                errors++;
                timer -= 5;
                const audio = new Audio('mauvaise_reponse.m4a');
                audio.play();
                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');
                
                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
            }
            
        // Après chaque tentative, désélectionner les cases
        selectedLeft.classList.remove('selected');
        selectedRight.classList.remove('selected');
            selectedLeft = null;
            selectedRight = null;
            document.getElementById('score').textContent = `Score : ${score}`;
            
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
    scoreResult.textContent = `Erreurs: ${errors}. Score: ${score}`;
    scorePopup.style.display = 'block';
}


document.getElementById('replay-btn').addEventListener('click', function() {
    document.getElementById('score-popup').style.display = 'none';
    startGame();
})
