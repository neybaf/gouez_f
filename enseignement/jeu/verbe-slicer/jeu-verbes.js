let canvas, ctx, score, verbesIrreguliers, motsDivers, currentVerbes;
let fallingWords = [];
let gameInterval;
let isGameRunning = false;
let gameSpeed = 80; // Vitesse initiale

function startGame() {
    document.getElementById('popup').style.display = 'none';
    score = 0;
    initGame();
    isGameRunning = true;
    gameInterval = setInterval(updateGame, gameSpeed);
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Charger les verbes depuis le fichier JSON
    fetch('jeu-verbes.json')
        .then(response => response.json())
        .then(data => {
            verbesIrreguliers = data.verbesIrreguliers;
            motsDivers = data.motsDivers;
            currentVerbes = [...verbesIrreguliers.infinitif, ...motsDivers]; // Commencer par l'infinitif
            // Appeler spawnWord plusieurs fois pour générer plusieurs mots au début
            for (let i = 0; i < 10; i++) {
                spawnWord();
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des verbes :', error);
        });
}

function spawnWord() {
    const word = currentVerbes[Math.floor(Math.random() * currentVerbes.length)];
    fallingWords.push({
        text: word,
        x: Math.random() * canvas.width,
        y: -20,
        speed: Math.random() * 2 + 1
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Met à jour la vitesse et le niveau de difficulté en fonction du score
    adjustDifficulty();
    // Ajouter un mot de manière régulière si moins de 10 mots sont à l'écran
    if (fallingWords.length < 10) {
        spawnWord();
    }
    // Dessiner les mots tombants
    fallingWords.forEach((wordObj, index) => {
        ctx.font = '30px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(wordObj.text, wordObj.x, wordObj.y);

        wordObj.y += wordObj.speed;

        // Si le mot sort de l'écran, l'enlever
        if (wordObj.y > canvas.height) {
            fallingWords.splice(index, 1);
            spawnWord();
        }
    });

    canvas.addEventListener('click', (event) => {
        checkWordClick(event.clientX, event.clientY);
    });
}

function checkWordClick(x, y) {
    fallingWords.forEach((wordObj, index) => {
        if (x > wordObj.x && x < wordObj.x + ctx.measureText(wordObj.text).width && y > wordObj.y - 30 && y < wordObj.y) {
            // Vérifier si c'est un verbe irrégulier à n'importe quel temps
            if (Object.values(verbesIrreguliers).flat().includes(wordObj.text)) {
                score++;
                updateScore();
                fallingWords.splice(index, 1);
                spawnWord();
            } else {
                // Penalité si ce n'est pas un verbesIrreguliers
                score--;
                updateScore();
            }
        }
    });
}

function adjustDifficulty() {
    // Augmenter progressivement la vitesse et changer la liste des verbes
    if (score >= 25 && score < 50) {
        currentVerbes = [...verbesIrreguliers.participe_passe, ...motsDivers];
        gameSpeed = 45;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
    } else if (score >= 50 && score < 75) {
        currentVerbes = [...verbesIrreguliers.futur, ...motsDivers];
        gameSpeed = 40;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
    } else if (score >= 75 && score < 100) {
        currentVerbes = [...verbesIrreguliers.imparfait, ...motsDivers];
        gameSpeed = 35;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
    } else if (score >= 100) {
        currentVerbes = [...verbesIrreguliers.subjonctif, ...motsDivers];
        gameSpeed = 30;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
    }
}

function updateScore() {
    document.getElementById('score').textContent = 'Score: ' + score;
}
