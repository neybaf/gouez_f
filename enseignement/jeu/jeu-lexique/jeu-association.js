// Variables pour la gestion du jeu
let selectedSemestre = null;
let selectedNiveau = null;
let questions = [];
let currentSet = [];
let errors = 0;
let correctAnswers = 0;
let matchesMade = 0;
let timer = 30;
let timerInterval;
let score = 0;

// Sélection des constatntes
const semestreSelect = document.getElementById('semestre-select');
const niveauSelect = document.getElementById('niveau-select');
const gameContainer = document.getElementById('game-container');
const startButtonContainer = document.getElementById('start-game');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const replayButton = document.getElementById('replay-btn');
const shareButton = document.getElementById('share-btn');
const menuToggle = document.getElementById('menu-toggle');
const levelMenu = document.getElementById('level-menu');

// Gérer l'ouverture et la fermeture du menu
menuToggle.addEventListener('click', function() {
    levelMenu.classList.toggle('collapsed');  // Bascule entre afficher/masquer le contenu
});

// Partie 1 : Sélection du semestre et affichage des sous-niveaux
semestreSelect.addEventListener('change', function() {
    selectedSemestre = semestreSelect.value; // Prend la valeur sélectionnée dans le select semestre
    niveauSelect.classList.remove('hidden'); // Affiche les sous-niveaux
});

// Partie 2 : Sélection du sous-niveau et affichage du bouton "Démarrer"
niveauSelect.addEventListener('change', function() {
    selectedNiveau = niveauSelect.value; // Prend la valeur sélectionnée dans le select sous-niveau
    startButtonContainer.classList.remove('hidden'); // Montre le bouton "Démarrer" après la sélection du sous-niveau
});

// Partie 3 : Fonction pour démarrer le jeu
document.getElementById('start-btn').addEventListener('click', function() {
    console.log("Bouton 'Démarrer' cliqué"); // Vérifie que le bouton réagit au clic
    startButtonContainer.classList.add('hidden'); // Cacher le bouton "Démarrer"
    niveauSelect.classList.add('hidden'); // Cacher le menu sous-niveau
    document.getElementById('level-menu').classList.add('menu-hidden'); // Masque uniquement le contenu du menu // Cacher le menu semestre
    gameContainer.classList.remove('hidden'); // Affiche la zone de jeu
    loadQuestions(); // Charge et lance le jeu
});

// Partie 4 : Démarrage du timer du jeu
function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = `Temps restant : ${timer} sec`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame(); // Termine le jeu si le temps est écoulé
        }
    }, 1000);
}

// Partie 5 : Chargement des questions et démarrage du jeu
async function loadQuestions() {
    try {
        console.log(`Chargement du fichier: data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
        const response = await fetch(`data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
        if (!response.ok) {
            throw new Error(`Le fichier CSV n'a pas pu être chargé: data-lexique/lexique_S${selectedSemestre}_U${selectedNiveau}.csv`);
        }
        const data = await response.text();
        const lines = data.split('\n').filter(line => line.trim() !== '');

        questions = lines.slice(1).map(line => {
            const [text, audioFile, imageFile] = line.split(',');
            return {
                imageFile: imageFile || null,
                audioFile: audioFile || null,
                text: text || null
            };
        });

        console.log('Questions rechargées avec succès');  // Vérification supplémentaire
        startGame(); // Lancer le jeu après chargement des questions
    } catch (error) {
        console.error('Erreur lors du chargement du fichier CSV:', error);
        alert('Erreur lors du chargement des données. Veuillez vérifier le fichier CSV.');
    }
}
// Partie 6 : Initialisation et mise en place du jeu
function startGame() {
    errors = 0;
    matchesMade = 0;
    correctAnswers = 0;
    score = 0;
    timer = 30;
    scoreDisplay.textContent = `Score : ${score}`;
    currentSet = getRandomSet(5);
    renderColumns();
    startTimer(); // Démarre le timer du jeu
}

// Partie 7 : Fonction pour obtenir un set aléatoire de questions
function getRandomSet(number) {
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, number);
}

// Partie 8 : Affichage des colonnes de jeu
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
        } else if (item.audioFile) {
            leftItem.innerHTML = `<audio controls src="${item.audioFile}"></audio>`;
        }
        leftItem.dataset.index = index;
        leftColumn.appendChild(leftItem);
    });

    const shuffledAnswers = [...currentSet].sort(() => Math.random() - 0.5);
    shuffledAnswers.forEach((item, index) => {
        const rightItem = document.createElement('div');
        rightItem.classList.add('item');
        rightItem.textContent = item.text || "Ouuuups! Pas de texte disponible";
        rightItem.dataset.index = currentSet.indexOf(item);
        rightColumn.appendChild(rightItem);
    });

    addClickHandlers();
}

// Partie 9 : Gestion des clics dans le jeu
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
                correctAnswers++;
                score++;
                scoreDisplay.textContent = `Score : ${score}`;
                selectedLeft.classList.add('correct');
                selectedRight.classList.add('correct');
                selectedLeft.classList.add('disabled');
                selectedRight.classList.add('disabled');

                if (matchesMade === 5) {
                    currentSet = getRandomSet(5);
                    renderColumns();
                }
            } else {
                errors++;
                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');
               // Soustraction de 5 secondes si la réponse est incorrecte
            timer -= 5;
            if (timer < 0) timer = 0;  // Évite que le timer soit négatif
            timerDisplay.textContent = `Temps restant : ${timer} sec`;

                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
            }

            selectedLeft.classList.remove('selected');
            selectedRight.classList.remove('selected');
            selectedLeft = null;
            selectedRight = null;
        }
    }
}

// Partie 10 : Fin du jeu
function endGame() {
    clearInterval(timerInterval);  // Arrêter le timer

    console.log('Fin du jeu. Affichage du pop-up.');

    // Mettre à jour le score final dans le pop-up
    document.getElementById('final-score').textContent = score;

    // Mettre à jour le nombre d'erreurs dans le pop-up
    document.getElementById('errors').textContent = errors;
    // Afficher le pop-up
    const popup = document.getElementById('score-popup');
    if (popup) {
        popup.classList.remove('hidden');  // Afficher le pop-up
        popup.style.display = "block";  // Assurer que le pop-up s'affiche
        console.log('Pop-up affiché');
    } else {
        console.error('Pop-up introuvable');
    }
}
function resetGame() {
    console.log('Réinitialisation du jeu');  // Vérification supplémentaire

    // Réinitialiser les variables du jeu
    score = 0;
    timer = 30;
    correctAnswers = 0;
    matchesMade = 0;
    errors = 0;

    // Réinitialiser l'affichage
    scoreDisplay.textContent = `Score : ${score}`;
    timerDisplay.textContent = `Temps restant : ${timer} sec`;

    // Cacher le pop-up de score
    const popup = document.getElementById('score-popup');
    if (popup) {
        popup.classList.add('hidden');
        console.log('Le pop-up est maintenant caché');  // Vérification
    } else {
        console.log('Le pop-up n\'a pas été trouvé');  // Erreur potentielle si l'élément est manquant
    }

    // Ne pas réinitialiser les colonnes trop tôt, attendre que les questions soient rechargées
    document.getElementById('column-left').innerHTML = '';
    document.getElementById('column-right').innerHTML = '';

    // Relancer le jeu avec les mêmes questions
    loadQuestions();  // Recharge les questions du même niveau
}

document.getElementById('replay-btn').addEventListener('click', function() {
    console.log('Bouton Rejouer cliqué');  // Vérification
    resetGame();  // Réinitialiser et relancer le jeu au même niveau
});

document.getElementById('share-btn').addEventListener('click', function() {
    alert(`Mon score est de ${score} !`);
});
