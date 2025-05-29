class JeuDragDropAmeliore {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 30;
        this.streak = 0;
        this.maxStreak = 0;
        this.totalQuestions = 0;
        this.gameStartTime = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGameFromURL();
    }

    setupEventListeners() {
        document.getElementById('replay-button')?.addEventListener('click', () => this.replay());
        document.getElementById('menu-button')?.addEventListener('click', () => this.returnToMenu());
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.nextQuestion();
            if (e.key === 'Escape') this.returnToMenu();
        });
    }

    loadGameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const game = urlParams.get('game');

        let csvFile, gameTitle;

        if (game === 'villes-de-france') {
            csvFile = 'questions-villes-de-france.csv';
            gameTitle = '🏛️ Quiz culturel : les villes de France';
        } else if (game === 'passe-compose') {
            csvFile = 'questions-passe-compose.csv';
            gameTitle = '📚 Quiz de grammaire : Le passé composé';
        } else {
            window.location.href = 'index_jeu.html';
            return;
        }

        document.getElementById('game-title').textContent = gameTitle;
        this.loadQuestions(csvFile);
    }

    async loadQuestions(csvFile) {
        try {
            const response = await fetch(csvFile);
            const data = await response.text();
            const lines = data.trim().split('\n');
            
            this.questions = lines.slice(1).map(line => {
                const [text, options, answers] = line.split('","');
                return {
                    text: text.replace(/"/g, ''),
                    options: options.split(','),
                    answers: answers.replace(/"/g, '').split(',')
                };
            });

            this.totalQuestions = this.questions.length;
            this.shuffle(this.questions);
            this.gameStartTime = Date.now();
            this.loadQuestion();
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
            this.showError('Impossible de charger les questions');
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const questionData = this.questions[this.currentQuestionIndex];
        
        // Mettre à jour l'interface
        this.updateQuestionDisplay(questionData);
        this.createDragItems(questionData);
        this.createDropZones(questionData);
        this.updateProgress();
        this.resetTimer();
        this.startTimer();

        // Animation d'entrée
        this.animateQuestionEntry();
    }

    updateQuestionDisplay(questionData) {
        const questionElement = document.getElementById('question');
        questionElement.textContent = questionData.text;
        questionElement.classList.add('fade-in');
        
        setTimeout(() => {
            questionElement.classList.remove('fade-in');
        }, 500);
    }

    createDragItems(questionData) {
        const dragContainer = document.getElementById('drag-container');
        dragContainer.innerHTML = '';

        // Mélanger les options
        const shuffledOptions = [...questionData.options];
        this.shuffle(shuffledOptions);

        shuffledOptions.forEach((option, index) => {
            const dragItem = document.createElement('div');
            dragItem.id = `item-${option}`;
            dragItem.className = 'draggable';
            dragItem.draggable = true;
            dragItem.textContent = option;
            
            // Événements drag & drop améliorés
            dragItem.addEventListener('dragstart', (e) => this.handleDragStart(e));
            dragItem.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            // Animation d'apparition échelonnée
            dragItem.style.opacity = '0';
            dragItem.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                dragItem.style.transition = 'all 0.3s ease';
                dragItem.style.opacity = '1';
                dragItem.style.transform = 'translateY(0)';
            }, index * 100);

            dragContainer.appendChild(dragItem);
        });
    }

    createDropZones(questionData) {
        const dropContainer = document.getElementById('drop-container');
        dropContainer.innerHTML = '';

        questionData.answers.forEach((answer, index) => {
            const dropZone = document.createElement('div');
            dropZone.className = 'droppable';
            dropZone.dataset.expectedAnswer = answer;
            
            // Événements drop améliorés
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
            dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));

            const placeholder = document.createElement('div');
            placeholder.className = 'drop-placeholder';
            placeholder.textContent = `Zone ${index + 1}`;
            dropZone.appendChild(placeholder);

            // Animation d'apparition
            dropZone.style.opacity = '0';
            dropZone.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                dropZone.style.transition = 'all 0.3s ease';
                dropZone.style.opacity = '1';
                dropZone.style.transform = 'scale(1)';
            }, (index + questionData.options.length) * 100);

            dropContainer.appendChild(dropZone);
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
        
        // Effet visuel sur les zones de drop
        document.querySelectorAll('.droppable').forEach(zone => {
            zone.classList.add('drag-active');
        });
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        
        // Retirer l'effet visuel
        document.querySelectorAll('.droppable').forEach(zone => {
            zone.classList.remove('drag-active', 'drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('droppable') && !e.target.hasChildNodes()) {
            e.target.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        if (!e.target.contains(e.relatedTarget)) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedId);
        const dropZone = e.target.closest('.droppable');

        if (dropZone && !dropZone.querySelector('.draggable')) {
            // Déplacer l'élément
            dropZone.innerHTML = '';
            dropZone.appendChild(draggedElement);
            
            // Vérifier la réponse
            this.checkAnswer(dropZone, draggedElement);
            
            // Vérifier si toutes les zones sont remplies
            this.checkAllAnswered();
        }

        dropZone.classList.remove('drag-over');
    }

    checkAnswer(dropZone, draggedElement) {
        const expectedAnswer = dropZone.dataset.expectedAnswer;
        const userAnswer = draggedElement.textContent;

        if (expectedAnswer === userAnswer) {
            this.handleCorrectAnswer(dropZone, draggedElement);
        } else {
            this.handleIncorrectAnswer(dropZone, draggedElement);
        }
    }

    handleCorrectAnswer(dropZone, draggedElement) {
        dropZone.classList.add('correct');
        draggedElement.classList.add('correct');
        
        // Animation de succès
        this.createSuccessParticles(dropZone);
        this.playSound('correct');
        
        this.score++;
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        
        // Bonus de temps pour bonne réponse
        this.timeLeft += 2;
    }

    handleIncorrectAnswer(dropZone, draggedElement) {
        dropZone.classList.add('incorrect');
        draggedElement.classList.add('incorrect');
        
        // Animation d'erreur
        this.shakeElement(dropZone);
        this.playSound('incorrect');
        
        this.streak = 0;
        
        // Pénalité de temps
        this.timeLeft = Math.max(0, this.timeLeft - 3);
    }

    checkAllAnswered() {
        const emptyZones = document.querySelectorAll('.droppable:not(:has(.draggable))');
        if (emptyZones.length === 0) {
            // Toutes les zones sont remplies, passer à la question suivante
            setTimeout(() => {
                this.nextQuestion();
            }, 1500);
        }
    }

    createSuccessParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 6px;
                height: 6px;
                background: #4CAF50;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
            `;

            document.body.appendChild(particle);

            // Animation des particules
            const angle = (i / 10) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }

    shakeElement(element) {
        element.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });
    }

    animateQuestionEntry() {
        const container = document.getElementById('question-container');
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.5s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Mettre à jour le compteur
        const counter = document.getElementById('question-counter');
        if (counter) {
            counter.textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.nextQuestion();
            } else {
                this.updateTimerDisplay();
            }
            this.timeLeft -= 1;
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `Temps restant: ${this.timeLeft} s`;
            
            // Changer la couleur selon le temps restant
            if (this.timeLeft <= 5) {
                timerElement.style.color = '#f44336';
                timerElement.style.animation = 'pulse 1s infinite';
            } else if (this.timeLeft <= 10) {
                timerElement.style.color = '#FF9800';
            } else {
                timerElement.style.color = '#4CAF50';
                timerElement.style.animation = 'none';
            }
        }
    }

    resetTimer() {
        clearInterval(this.timer);
        this.timeLeft = 30;
        this.updateTimerDisplay();
    }

    nextQuestion() {
        clearInterval(this.timer);
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            // Animation de sortie
            const container = document.getElementById('question-container');
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '0';
            container.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                this.loadQuestion();
            }, 300);
        } else {
            this.endGame();
        }
    }

    endGame() {
        clearInterval(this.timer);
        const gameTime = Math.round((Date.now() - this.gameStartTime) / 1000);
        const accuracy = Math.round((this.score / this.totalQuestions) * 100);

        // Afficher les résultats
        this.showResults({
            score: this.score,
            total: this.totalQuestions,
            accuracy: accuracy,
            maxStreak: this.maxStreak,
            gameTime: gameTime
        });
    }

    showResults(results) {
        const container = document.getElementById('question-container');
        container.innerHTML = `
            <div class="results-container fade-in">
                <h2>🎉 Résultats</h2>
                <div class="result-stats">
                    <div class="stat-card">
                        <div class="stat-value">${results.score}/${results.total}</div>
                        <div class="stat-label">Score</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${results.accuracy}%</div>
                        <div class="stat-label">Précision</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${results.maxStreak}</div>
                        <div class="stat-label">Meilleure série</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${results.gameTime}s</div>
                        <div class="stat-label">Temps total</div>
                    </div>
                </div>
                <div class="result-message">
                    ${this.getResultMessage(results.accuracy)}
                </div>
            </div>
        `;

        document.getElementById('end-buttons').style.display = 'block';
    }

    getResultMessage(accuracy) {
        if (accuracy >= 90) return "🌟 Excellent ! Vous maîtrisez parfaitement !";
        if (accuracy >= 75) return "👏 Très bien ! Continuez comme ça !";
        if (accuracy >= 60) return "👍 Bien joué ! Encore un petit effort !";
        return "💪 Courage ! La pratique rend parfait !";
    }

    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'correct') {
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            } else {
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            }

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio non supporté');
        }
    }

    showError(message) {
        const container = document.getElementById('question-container');
        container.innerHTML = `
            <div class="error-message">
                <h2>❌ Erreur</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Réessayer</button>
            </div>
        `;
    }

    replay() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.shuffle(this.questions);
        this.gameStartTime = Date.now();
        document.getElementById('end-buttons').style.display = 'none';
        this.loadQuestion();
    }

    returnToMenu() {
        window.location.href = 'index_jeu.html';
    }
}

// Initialiser le jeu amélioré
document.addEventListener('DOMContentLoaded', () => {
    new JeuDragDropAmeliore();
}); 