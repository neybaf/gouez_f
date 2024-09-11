// Fonction générique pour gérer les clics sur les boutons semestre et niveau
function handleButtonClick(btnClass, targetElement, nextElement) {
    document.querySelectorAll(btnClass).forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll(btnClass).forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');  // Sélectionner le bouton cliqué
            targetElement.classList.add('hidden');  // Cacher la section actuelle
            nextElement.classList.remove('hidden'); // Afficher la section suivante
        });
    });
}

// Gestion des boutons "Semestre" et "Niveau"
handleButtonClick('.semestre-btn', document.getElementById('semesters'), document.getElementById('sous-niveaux'));
handleButtonClick('.niveau-btn', document.getElementById('sous-niveaux'), document.getElementById('game-container'));

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
            endGame();  // Appel de la fonction de fin de partie
        }
    }, 1000);  
}

// Fonction de fin de partie avec popup et options
function endGame() {
    clearInterval(timerInterval);
    
    // Créer un popup personnalisé
    const popup = document.createElement('div');
    popup.id = 'endgame-popup';
    popup.innerHTML = `
        <p>Temps écoulé !</p>
        <p>Votre score est de : ${score}, vous avez fait ${errors} erreur(s)</p>
        <button id="share-btn">Partager</button>
        <button id="replay-btn">Rejouer</button>
        <button id="change-level-btn">Changer de niveau</button>
    `;
    
    document.body.appendChild(popup);
    
    // Gestion du bouton "Partager" pour copier le score
    document.getElementById('share-btn').addEventListener('click', function() {
        const scoreMessage = `J'ai obtenu un score de ${score} points dans ce jeu !`;
        const textArea = document.createElement('textarea');
        textArea.value = scoreMessage;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Score copié ! Collez-le dans une conversation WeChat.');
    });
    
    // Gestion du bouton "Rejouer"
    document.getElementById('replay-btn').addEventListener('click', function() {
        document.getElementById('endgame-popup').remove(); // Supprimer le popup
        startGame(); // Relancer le jeu
    });
    
    // Gestion du bouton "Changer de niveau"
    document.getElementById('change-level-btn').addEventListener('click', function() {
        document.getElementById('endgame-popup').remove(); // Supprimer le popup
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('semesters').classList.remove('hidden'); // Retour à la sélection des niveaux
    });
}

// Fonction pour charger les questions depuis le fichier CSV
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
    startGame(); // Démarrer le jeu après avoir chargé les questions
}

// Fonction pour démarrer une nouvelle partie
function startGame() {
    errors = 0;
    matchesMade = 0;
    correctAnswers = 0;
    timer = 30;
    score = 0;
    document.getElementById('score').textContent = `Score : ${score}`;
    currentSet = getRandomSet(5);  // Obtenir 5 questions aléatoires
    renderColumns();  // Afficher les questions
    startTimer();  // Démarrer le timer
}

// Sélectionner un ensemble aléatoire de questions
function getRandomSet(number) {
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, number);
}

// Affichage des colonnes (gauche et droite) avec les questions mélangées
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
    
    addClickHandlers();  // Ajouter les gestionnaires de clic
}

// Fonction pour gérer les clics sur les questions et réponses
function addClickHandlers() {
    let selectedLeft = null, selectedRight = null;

    function handleClick(item, side) {
        if (side === 'left') {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = item;
        } else {
            if (selectedRight) selectedRight.classList.remove('selected');
            selectedRight = item;
        }
        item.classList.add('selected');
        checkMatch();  // Vérifier si les éléments sélectionnés correspondent
    }

    document.querySelectorAll('#column-left .item').forEach(item => {
        item.addEventListener('click', () => handleClick(item, 'left'));
    });

    document.querySelectorAll('#column-right .item').forEach(item => {
        item.addEventListener('click', () => handleClick(item, 'right'));
    });

    function checkMatch() {
        if (selectedLeft && selectedRight) {
            const leftIndex = selectedLeft.dataset.index;
            const rightIndex = selectedRight.dataset.index;

            if (leftIndex === rightIndex) {
                matchesMade++;
                correctAnswers++;
                score++;
                timer += 5;

                playSound('bonne_reponse.m4a'); // Jouer un son pour la bonne réponse

                selectedLeft.classList.add('correct');
                selectedRight.classList.add('correct');

                setTimeout(() => {
                    selectedLeft.classList.add('hidden');
                    selectedRight.classList.add('hidden');
                }, 500);  // Masquer après l'animation

                if (correctAnswers === 5) {
                    correctAnswers = 0;
                    currentSet = getRandomSet(5);  // Charger 5 nouvelles questions
                    renderColumns();
                }
            } else {
                errors++;
                timer -= 5;

                selectedLeft.classList.add('incorrect');
                selectedRight.classList.add('incorrect');

                setTimeout(() => {
                    selectedLeft.classList.remove('incorrect');
                    selectedRight.classList.remove('incorrect');
                }, 500);
            }

            selectedLeft = selectedRight = null;
            document.getElementById('score').textContent = `Score : ${score}`;
            if (timer <= 0) {
                clearInterval(timerInterval);
                endGame();  // Fin de la partie si le temps est écoulé
            }
        }
    }
}

// Fonction pour jouer un son
function playSound(audioFile) {
    const audio = new Audio(audioFile);
    audio.play();
}