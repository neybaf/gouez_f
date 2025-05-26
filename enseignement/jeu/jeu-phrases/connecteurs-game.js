/**
 * Connecteurs Logiques - Jeu pour apprendre les connecteurs français
 * Version moderne avec interface intuitive et statistiques détaillées
 */

class ConnecteursLogiques {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.difficulty = 'intermediaire';
        
        // Données de jeu
        this.phrasesData = [];
        this.currentPhrase = null;
        this.currentPhraseIndex = 0;
        this.usedPhrases = [];
        
        // Statistiques de jeu
        this.score = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.timeLeft = 60;
        this.gameStartTime = 0;
        this.gameTime = 0;
        this.connectorsLearned = new Set();
        
        // Paramètres de jeu
        this.maxTime = 60;
        this.pointsPerCorrect = 10;
        this.timeBonus = 5;
        this.streakBonus = 5;
        this.totalQuestions = 10;
        
        // Timer
        this.gameTimer = null;
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.setupAudio();
        await this.loadPhrasesData();
        this.showScreen('start-screen');
    }
    
    setupEventListeners() {
        // Boutons de démarrage
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        
        // Sélection de difficulté
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.difficulty-btn').classList.add('active');
                this.difficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
            });
        });
        
        // Boutons de pause
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitToMenu());
        
        // Boutons de fin de jeu
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('share-score-btn').addEventListener('click', () => this.shareScore());
        
        // Bouton suivant
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.gameState === 'playing' || this.gameState === 'paused') {
                        this.togglePause();
                    }
                    break;
                case 'KeyR':
                    if (this.gameState === 'playing' || this.gameState === 'paused') {
                        this.restartGame();
                    }
                    break;
                case 'Escape':
                    if (this.gameState === 'playing') {
                        this.togglePause();
                    }
                    break;
                case 'Enter':
                    if (this.gameState === 'playing' && document.getElementById('next-btn').style.display !== 'none') {
                        this.nextQuestion();
                    }
                    break;
            }
        });
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
        } catch (error) {
            console.warn('Audio non disponible:', error);
        }
    }
    
    generateSounds() {
        // Son de succès
        this.sounds.success = this.createTone(600, 0.2, 'sine');
        // Son d'erreur
        this.sounds.error = this.createTone(200, 0.3, 'sawtooth');
        // Son de bonus
        this.sounds.bonus = this.createTone(800, 0.4, 'triangle');
    }
    
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    async loadPhrasesData() {
        try {
            const response = await fetch('jeu-phrases.csv');
            const csvText = await response.text();
            this.phrasesData = this.parseCSV(csvText);
        } catch (error) {
            console.error('Erreur lors du chargement des phrases:', error);
            // Données de fallback
            this.phrasesData = [
                {
                    cause: "Il pleut beaucoup",
                    connecteur: "donc;alors;par conséquent",
                    consequence: "nous restons à la maison"
                },
                {
                    cause: "Elle étudie le français",
                    connecteur: "parce qu';car;puisqu'",
                    consequence: "elle veut travailler en France"
                }
            ];
        }
    }
    
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= 3) {
                data.push({
                    cause: values[0].trim(),
                    connecteur: values[1].trim(),
                    consequence: values[2].trim()
                });
            }
        }
        
        return data;
    }
    
    startGame() {
        this.resetGameStats();
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.showScreen('game-screen');
        this.startTimer();
        this.loadNextQuestion();
    }
    
    resetGameStats() {
        this.score = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.timeLeft = this.maxTime;
        this.currentPhraseIndex = 0;
        this.usedPhrases = [];
        this.connectorsLearned.clear();
        
        // Ajuster selon la difficulté
        switch(this.difficulty) {
            case 'debutant':
                this.maxTime = 90;
                this.timeLeft = 90;
                this.totalQuestions = 8;
                break;
            case 'intermediaire':
                this.maxTime = 60;
                this.timeLeft = 60;
                this.totalQuestions = 10;
                break;
            case 'avance':
                this.maxTime = 45;
                this.timeLeft = 45;
                this.totalQuestions = 12;
                break;
        }
        
        this.updateUI();
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    updateTimer() {
        document.getElementById('timer').textContent = this.timeLeft;
        
        // Changer la couleur selon le temps restant
        const timerElement = document.querySelector('.timer-display');
        if (this.timeLeft <= 10) {
            timerElement.style.background = 'rgba(231, 76, 60, 0.95)';
            timerElement.style.color = 'white';
        } else if (this.timeLeft <= 20) {
            timerElement.style.background = 'rgba(243, 156, 18, 0.95)';
            timerElement.style.color = 'white';
        } else {
            timerElement.style.background = 'rgba(255, 255, 255, 0.95)';
            timerElement.style.color = '';
        }
    }
    
    loadNextQuestion() {
        if (this.correctAnswers >= this.totalQuestions) {
            this.gameOver();
            return;
        }
        
        // Sélectionner une phrase non utilisée
        const availablePhrases = this.phrasesData.filter((_, index) => !this.usedPhrases.includes(index));
        
        if (availablePhrases.length === 0) {
            // Réinitialiser si toutes les phrases ont été utilisées
            this.usedPhrases = [];
        }
        
        const randomIndex = Math.floor(Math.random() * availablePhrases.length);
        this.currentPhrase = availablePhrases[randomIndex];
        this.currentPhraseIndex = this.phrasesData.indexOf(this.currentPhrase);
        this.usedPhrases.push(this.currentPhraseIndex);
        
        this.displayQuestion();
        this.hideFeedback();
    }
    
    displayQuestion() {
        // Afficher la cause
        document.getElementById('cause-text').textContent = this.currentPhrase.cause;
        
        // Afficher la conséquence
        document.getElementById('consequence-text').textContent = this.currentPhrase.consequence;
        
        // Générer les options de connecteurs
        this.generateConnectorOptions();
        
        // Mettre à jour la progression
        this.updateProgress();
    }
    
    generateConnectorOptions() {
        const correctConnectors = this.currentPhrase.connecteur.split(';').map(c => c.trim());
        const allConnectors = this.getAllConnectors();
        
        // Sélectionner des distracteurs
        const distractors = allConnectors.filter(c => !correctConnectors.includes(c));
        const shuffledDistractors = this.shuffleArray(distractors);
        
        // Créer les options (1 correct + 3 distracteurs)
        const options = [
            correctConnectors[0], // Premier connecteur correct
            ...shuffledDistractors.slice(0, 3)
        ];
        
        // Mélanger les options
        const shuffledOptions = this.shuffleArray(options);
        
        // Afficher les boutons
        const container = document.getElementById('connectors-container');
        container.innerHTML = '';
        
        shuffledOptions.forEach((connector, index) => {
            const button = document.createElement('button');
            button.className = 'connector-btn';
            button.textContent = connector;
            button.addEventListener('click', () => this.selectConnector(connector, button));
            container.appendChild(button);
        });
    }
    
    getAllConnectors() {
        // Liste de connecteurs logiques français
        return [
            'donc', 'alors', 'par conséquent', 'c\'est pourquoi', 'du coup',
            'parce que', 'car', 'puisque', 'étant donné que', 'vu que',
            'mais', 'cependant', 'néanmoins', 'pourtant', 'toutefois',
            'de plus', 'en outre', 'aussi', 'également', 'par ailleurs',
            'en effet', 'effectivement', 'd\'ailleurs', 'en fait',
            'grâce à', 'en raison de', 'à cause de', 'suite à'
        ];
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    selectConnector(selectedConnector, buttonElement) {
        // Désactiver tous les boutons
        document.querySelectorAll('.connector-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Marquer le bouton sélectionné
        buttonElement.classList.add('selected');
        
        // Vérifier la réponse
        this.checkAnswer(selectedConnector, buttonElement);
    }
    
    checkAnswer(selectedConnector, buttonElement) {
        const correctConnectors = this.currentPhrase.connecteur.split(';').map(c => c.trim());
        const isCorrect = correctConnectors.includes(selectedConnector);
        
        this.totalAnswers++;
        
        if (isCorrect) {
            this.handleCorrectAnswer(selectedConnector, buttonElement);
        } else {
            this.handleIncorrectAnswer(selectedConnector, buttonElement, correctConnectors[0]);
        }
        
        this.updateUI();
        
        // Afficher le bouton suivant après un délai
        setTimeout(() => {
            document.getElementById('next-btn').style.display = 'inline-flex';
        }, 1500);
    }
    
    handleCorrectAnswer(selectedConnector, buttonElement) {
        this.correctAnswers++;
        this.currentStreak++;
        this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
        this.connectorsLearned.add(selectedConnector);
        
        // Calculer les points
        let points = this.pointsPerCorrect;
        
        // Bonus de série
        if (this.currentStreak >= 3) {
            points += this.streakBonus;
            this.showBonusEffect(`Série de ${this.currentStreak} ! +${this.streakBonus} points`);
            this.playSound('bonus');
        } else {
            this.playSound('success');
        }
        
        // Bonus de temps
        this.timeLeft += this.timeBonus;
        
        this.score += points;
        
        // Effets visuels
        buttonElement.classList.add('correct');
        this.showFeedback(`Excellent ! "${selectedConnector}" est le bon connecteur.`, 'success');
        
        // Mettre en évidence les phrases
        document.getElementById('cause-text').classList.add('highlight');
        document.getElementById('consequence-text').classList.add('highlight');
    }
    
    handleIncorrectAnswer(selectedConnector, buttonElement, correctConnector) {
        this.currentStreak = 0;
        
        // Effets visuels
        buttonElement.classList.add('incorrect');
        this.showFeedback(`Incorrect. Le bon connecteur était "${correctConnector}".`, 'error');
        this.playSound('error');
        
        // Montrer la bonne réponse
        document.querySelectorAll('.connector-btn').forEach(btn => {
            if (btn.textContent === correctConnector) {
                btn.classList.add('correct');
            }
        });
    }
    
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback-message');
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message ${type} show`;
    }
    
    hideFeedback() {
        const feedbackElement = document.getElementById('feedback-message');
        feedbackElement.classList.remove('show');
        document.getElementById('next-btn').style.display = 'none';
        
        // Réinitialiser les highlights
        document.getElementById('cause-text').classList.remove('highlight');
        document.getElementById('consequence-text').classList.remove('highlight');
    }
    
    showBonusEffect(message) {
        const effect = document.createElement('div');
        effect.className = 'bonus-effect';
        effect.textContent = message;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 1500);
    }
    
    nextQuestion() {
        this.loadNextQuestion();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.currentStreak;
        
        // Mettre à jour l'icône de série
        const streakIcon = document.querySelector('.streak-icon');
        if (this.currentStreak >= 5) {
            streakIcon.textContent = '🔥🔥';
        } else if (this.currentStreak >= 3) {
            streakIcon.textContent = '🔥';
        } else {
            streakIcon.textContent = '💫';
        }
    }
    
    updateProgress() {
        const progress = (this.correctAnswers / this.totalQuestions) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = `${this.correctAnswers} / ${this.totalQuestions}`;
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameTimer);
            this.updatePauseStats();
            this.showScreen('pause-screen');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('game-screen');
            this.startTimer();
        }
    }
    
    updatePauseStats() {
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-correct').textContent = this.correctAnswers;
        document.getElementById('pause-accuracy').textContent = 
            this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) + '%' : '100%';
    }
    
    restartGame() {
        clearInterval(this.gameTimer);
        this.startGame();
    }
    
    quitToMenu() {
        clearInterval(this.gameTimer);
        this.gameState = 'menu';
        this.showScreen('start-screen');
    }
    
    gameOver() {
        clearInterval(this.gameTimer);
        this.gameState = 'gameOver';
        this.updateFinalStats();
        this.showScreen('game-over-screen');
    }
    
    updateFinalStats() {
        this.gameTime = Date.now() - this.gameStartTime;
        const accuracy = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 100;
        const gameTimeSeconds = Math.floor(this.gameTime / 1000);
        const minutes = Math.floor(gameTimeSeconds / 60);
        const seconds = gameTimeSeconds % 60;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-correct').textContent = this.correctAnswers;
        document.getElementById('final-accuracy').textContent = accuracy + '%';
        document.getElementById('game-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('best-streak').textContent = this.bestStreak;
        document.getElementById('connectors-learned').textContent = this.connectorsLearned.size;
        
        // Message de performance
        const performanceMessage = this.getPerformanceMessage(accuracy, this.correctAnswers);
        document.getElementById('performance-message').textContent = performanceMessage;
        
        // Titre selon la performance
        const title = this.correctAnswers >= this.totalQuestions ? '🏆 Parfait ! Tous les connecteurs maîtrisés !' : 
                     accuracy >= 80 ? '🎯 Excellent travail !' : 
                     '💪 Continue tes efforts !';
        document.getElementById('game-over-title').textContent = title;
    }
    
    getPerformanceMessage(accuracy, correct) {
        if (accuracy >= 90 && correct >= this.totalQuestions * 0.8) {
            return "Incroyable ! Tu maîtrises parfaitement les connecteurs logiques !";
        } else if (accuracy >= 80) {
            return "Très bien ! Tu progresses rapidement dans l'usage des connecteurs.";
        } else if (accuracy >= 70) {
            return "Bon travail ! Continue à t'entraîner pour améliorer ta précision.";
        } else {
            return "N'abandonne pas ! Chaque partie t'aide à mieux comprendre les connecteurs.";
        }
    }
    
    shareScore() {
        const accuracy = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 100;
        const text = `J'ai obtenu ${this.score} points au jeu Connecteurs Logiques ! ${this.correctAnswers} bonnes réponses avec ${accuracy}% de précision. 🔗📚`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Connecteurs Logiques - Mon Score',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback : copier dans le presse-papiers
            navigator.clipboard.writeText(text).then(() => {
                alert('Score copié dans le presse-papiers !');
            }).catch(() => {
                alert(`Mon score : ${text}`);
            });
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.game-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn('Erreur audio:', error);
            }
        }
    }
}

// Initialiser le jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new ConnecteursLogiques();
}); 