let canvas, ctx, score, verbesPremierGroupe, motsDivers;
let fallingWords = [];
let gameInterval;
let isGameRunning = false;

function startGame() {
    document.getElementById('popup').style.display = 'none';
    score = 0;
    initGame();
    isGameRunning = true;
    gameInterval = setInterval(updateGame, 50);
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Charger les verbes depuis le fichier JSON
    fetch('verbes.json')
        .then(response => response.json())
        .then(data => {
            verbesPremierGroupe = data.verbesPremierGroupe;
            motsDivers = data.motsDivers;
            words = [...verbesPremierGroupe, ...motsDivers]; // Fusionner les deux listes
            spawnWord();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des verbes :', error);
        });
}

function spawnWord() {
    const word = words[Math.floor(Math.random() * words.length)];
    fallingWords.push({
        text: word,
        x: Math.random() * canvas.width,
        y: -20,
        speed: Math.random() * 2 + 1
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            // Si c'est un verbe du premier groupe
            if (verbesPremierGroupe.includes(wordObj.text)) {
                score++;
                updateScore();
                fallingWords.splice(index, 1);
                spawnWord();
            } else {
                // Penalité si ce n'est pas un verbe du premier groupe
                score--;
                updateScore();
            }
        }
    });
}

function updateScore() {
    document.getElementById('score').textContent = 'Score: ' + score;
}