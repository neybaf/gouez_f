let timer;
let timeLeft = 30;
let score = 0;
let selectedCause = null;
let selectedConnector = null;
let selectedConsequence = null;
let correctAssociations = [];

document.getElementById("start-button").addEventListener("click", startGame);

function startGame() {
    resetGame();
    loadCSV("jeu-phrases.csv", (data) => {
        populateGameBoard(data);
        startTimer();
    });
}

function startTimer() {
    document.getElementById("timer").innerText = `Temps restant: ${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Temps restant: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function resetGame() {
    timeLeft = 30;
    score = 0;
    selectedCause = null;
    selectedConnector = null;
    selectedConsequence = null;
    correctAssociations = [];
    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("causes").innerHTML = "";
    document.getElementById("connecteurs").innerHTML = "";
    document.getElementById("consequences").innerHTML = "";
}

function loadCSV(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(text => {
            const data = Papa.parse(text, { header: true }).data;
            callback(data);
        });
}

function populateGameBoard(data) {
    const causes = data.map(row => row.cause);
    const connectors = data.map(row => row.connecteur);
    const consequences = data.map(row => row.consequence);

    causes.forEach((cause, index) => {
        const div = document.createElement("div");
        div.innerText = cause;
        div.addEventListener("click", () => selectCause(index, div));
        document.getElementById("causes").appendChild(div);
    });

    connectors.forEach((connector, index) => {
        const div = document.createElement("div");
        div.innerText = connector;
        div.addEventListener("click", () => selectConnector(index, div));
        document.getElementById("connecteurs").appendChild(div);
    });

    consequences.forEach((consequence, index) => {
        const div = document.createElement("div");
        div.innerText = consequence;
        div.addEventListener("click", () => selectConsequence(index, div));
        document.getElementById("consequences").appendChild(div);
    });
}

function selectCause(index, element) {
    selectedCause = index;
    checkSelection();
}

function selectConnector(index, element) {
    selectedConnector = index;
    checkSelection();
}

function selectConsequence(index, element) {
    selectedConsequence = index;
    checkSelection();
}

function checkSelection() {
    if (selectedCause !== null && selectedConnector !== null && selectedConsequence !== null) {
        const isCorrect = checkCorrectAssociation(selectedCause, selectedConnector, selectedConsequence);
        if (isCorrect) {
            score += 10;
            timeLeft += 5;
            playSound("bonne_reponse.m4a");
            correctAssociations.push({ cause: selectedCause, connector: selectedConnector, consequence: selectedConsequence });
            markAsCorrect(selectedCause, selectedConnector, selectedConsequence);
        } else {
            playSound("mauvaise_reponse.m4a");
            flashRed(selectedCause, selectedConnector, selectedConsequence);
        }
        updateScore();
        resetSelection();
    }
}

function checkCorrectAssociation(cause, connector, consequence) {
    const correctRow = data[cause];  // On récupère la ligne correcte depuis le CSV
    const correctConnectors = correctRow.connecteur.split(';'); // On sépare les connecteurs possibles
    return correctConnectors.includes(data[connector]) && correctRow.consequence === data[consequence];
}
}

function markAsCorrect(cause, connector, consequence) {
    document.getElementById("causes").children[cause].classList.add("correct", "grayed");
    document.getElementById("connecteurs").children[connector].classList.add("correct", "grayed");
    document.getElementById("consequences").children[consequence].classList.add("correct", "grayed");
}

function flashRed(cause, connector, consequence) {
    document.getElementById("causes").children[cause].classList.add("incorrect");
    document.getElementById("connecteurs").children[connector].classList.add("incorrect");
    document.getElementById("consequences").children[consequence].classList.add("incorrect");
    setTimeout(() => {
        document.getElementById("causes").children[cause].classList.remove("incorrect");
        document.getElementById("connecteurs").children[connector].classList.remove("incorrect");
        document.getElementById("consequences").children[consequence].classList.remove("incorrect");
    }, 500);
}

function resetSelection() {
    selectedCause = null;
    selectedConnector = null;
    selectedConsequence = null;
}

function updateScore() {
    document.getElementById("score").innerText = `Score: ${score}`;
}

function endGame() {
    alert(`Fin du jeu! Votre score: ${score}`);
}

function playSound(file) {
    const audio = new Audio(file);
    audio.play();
}