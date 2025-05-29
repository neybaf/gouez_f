class MemoryMots {
    constructor() {
        this.cards = [];
        this.currentLevel = null;
        this.currentSublevel = null;
        this.availableLevels = ['A1', 'A2', 'B1'];
        this.availableSublevels = {};
        this.difficulty = 'facile';
        this.difficultySettings = {
            facile: { pairs: 6, timeLimit: null },
            moyen: { pairs: 8, timeLimit: 120 },
            difficile: { pairs: 12, timeLimit: 90 }
        };
        
        // État du jeu
        this.gameState = 'menu'; // menu, playing, paused, finished
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.hintsRemaining = 3;
        
        // Statistiques
        this.stats = {
            totalPairs: 0,
            correctMatches: 0,
            mistakes: 0,
            bestTime: null
        };
        
        this.init();
    }

    async init() {
        await this.scanAvailableLevels();
        this.setupEventListeners();
        this.updateStats();
        this.showLevelSelection();
    }

    async scanAvailableLevels() {
        // Scanner les niveaux disponibles
        for (const level of this.availableLevels) {
            this.availableSublevels[level] = await this.scanSublevels(level);
        }
        this.updateLevelButtons();
    }

    async scanSublevels(level) {
        const sublevels = [];
        // Tenter de charger les sous-niveaux de 1 à 9
        for (let i = 1; i <= 9; i++) {
            try {
                const response = await fetch(`data/${level}/niveau_${i}.json`);
                if (response.ok) {
                    sublevels.push(i);
                }
            } catch (error) {
                // Fichier non trouvé, on continue
            }
        }
        return sublevels;
    }

    updateLevelButtons() {
        const levelButtons = document.querySelectorAll('.difficulty-btn');
        levelButtons.forEach(btn => {
            const level = btn.dataset.level;
            if (level && this.availableSublevels[level]) {
                const hasSublevels = this.availableSublevels[level].length > 0;
                
                if (!hasSublevels) {
                    btn.disabled = true;
                    btn.textContent += ' (Indisponible)';
                    btn.style.opacity = '0.5';
                }
            }
        });
    }

    async loadCardsFromLevel(level, sublevel) {
        try {
            const response = await fetch(`data/${level}/niveau_${sublevel}.json`);
            if (!response.ok) {
                throw new Error(`Impossible de charger le niveau ${level} - ${sublevel}`);
            }
            
            const cardsData = await response.json();
            
            // Créer les paires pour le memory (français + chinois)
            this.createMemoryPairs(cardsData);
            this.shuffleCards();
            this.renderCards();
            this.updateStats();
            
            // Afficher un message de confirmation
            this.showLoadingMessage(`Niveau ${level} - Sous-niveau ${sublevel} chargé ! ${this.stats.totalPairs} paires disponibles.`);
            
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.showErrorMessage(`Erreur: ${error.message}`);
        }
    }

    createMemoryPairs(wordsData) {
        const settings = this.difficultySettings[this.difficulty];
        const selectedWords = this.selectRandomWords(wordsData, settings.pairs);
        
        this.cards = [];
        this.stats.totalPairs = selectedWords.length;
        
        // Créer les cartes (une française, une chinoise pour chaque paire)
        selectedWords.forEach((word, index) => {
            // Carte française
            this.cards.push({
                id: `fr_${index}`,
                pairId: index,
                type: 'french',
                text: word.french,
                language: 'Français',
                isMatched: false,
                isFlipped: false
            });
            
            // Carte chinoise
            this.cards.push({
                id: `zh_${index}`,
                pairId: index,
                type: 'chinese',
                text: word.chinese,
                language: '中文',
                isMatched: false,
                isFlipped: false
            });
        });
    }

    selectRandomWords(wordsData, count) {
        // Mélanger et prendre le nombre demandé
        const shuffled = [...wordsData].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    setupEventListeners() {
        // Sélection de difficulté
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                
                // Gérer les niveaux et la difficulté
                if (e.target.dataset.level) {
                    this.selectLevel(e.target.dataset.level);
                } else if (e.target.dataset.difficulty) {
                    this.selectDifficulty(e.target.dataset.difficulty);
                }
            });
        });

        // Contrôles de jeu
        document.getElementById('new-game-btn')?.addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('menu-btn')?.addEventListener('click', () => {
            window.location.href = '../index_jeu.html';
        });

        document.getElementById('hint-btn')?.addEventListener('click', () => {
            this.useHint();
        });

        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            this.resetGame();
            this.hideResultPopup();
        });

        document.getElementById('next-level-btn')?.addEventListener('click', () => {
            this.nextLevel();
        });
    }

    selectLevel(level) {
        this.currentLevel = level;
        
        // Mettre à jour les boutons de niveau
        document.querySelectorAll('.difficulty-btn[data-level]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-level="${level}"]`)?.classList.add('active');
        
        // Pour simplifier, on prend le premier sous-niveau disponible
        const availableSublevels = this.availableSublevels[level] || [];
        if (availableSublevels.length > 0) {
            this.currentSublevel = availableSublevels[0];
            this.loadCardsFromLevel(level, this.currentSublevel);
        }
    }

    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // Mettre à jour les boutons de difficulté
        document.querySelectorAll('.difficulty-btn[data-difficulty]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`)?.classList.add('active');
        
        // Recharger avec la nouvelle difficulté si un niveau est sélectionné
        if (this.currentLevel && this.currentSublevel) {
            this.loadCardsFromLevel(this.currentLevel, this.currentSublevel);
        }
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        const container = document.getElementById('memory-grid');
        container.innerHTML = '';

        if (this.cards.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Sélectionnez un niveau pour commencer à jouer !</div>';
            return;
        }

        // Ajuster le grid selon le nombre de cartes
        const totalCards = this.cards.length;
        const columns = Math.ceil(Math.sqrt(totalCards));
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            container.appendChild(cardElement);
        });

        // Démarrer le timer si nécessaire
        this.startTimer();
        this.gameState = 'playing';

        // Animation d'apparition
        setTimeout(() => {
            document.querySelectorAll('.memory-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in');
                }, index * 100);
            });
        }, 50);
    }

    createCardElement(cardData, index) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.pairId = cardData.pairId;
        card.dataset.type = cardData.type;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div style="font-size: 2rem;">🎴</div>
                </div>
                <div class="card-back ${cardData.type}">
                    <div class="card-language">${cardData.language}</div>
                    <div class="card-text">${cardData.text}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.handleCardClick(card, cardData, index);
        });

        return card;
    }

    handleCardClick(cardElement, cardData, index) {
        if (this.gameState !== 'playing') return;
        if (cardData.isFlipped || cardData.isMatched) return;
        if (this.flippedCards.length >= 2) return;

        // Retourner la carte
        this.flipCard(cardElement, cardData);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            
            // Vérifier si c'est une paire
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }

    flipCard(cardElement, cardData) {
        cardElement.classList.add('flipped');
        cardData.isFlipped = true;
        this.flippedCards.push({ element: cardElement, data: cardData });
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.data.pairId === card2.data.pairId) {
            // C'est une paire !
            this.handleMatch(card1, card2);
        } else {
            // Pas une paire
            this.handleMismatch(card1, card2);
        }
        
        this.flippedCards = [];
    }

    handleMatch(card1, card2) {
        card1.data.isMatched = true;
        card2.data.isMatched = true;
        
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        this.matchedPairs++;
        this.stats.correctMatches++;
        
        // Effet de succès
        this.createSuccessEffect(card1.element);
        this.createSuccessEffect(card2.element);
        
        // Vérifier si le jeu est terminé
        if (this.matchedPairs === this.stats.totalPairs) {
            this.endGame();
        }
    }

    handleMismatch(card1, card2) {
        this.stats.mistakes++;
        
        // Retourner les cartes
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            card1.data.isFlipped = false;
            card2.data.isFlipped = false;
        }, 500);
    }

    createSuccessEffect(cardElement) {
        // Créer des particules de célébration
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
            particle.style.animationDelay = Math.random() * 3 + 's';
            
            const celebration = document.getElementById('celebration');
            if (celebration) {
                celebration.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }
        }
    }

    startTimer() {
        const settings = this.difficultySettings[this.difficulty];
        if (!settings.timeLimit) return;
        
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
            
            if (this.timer >= settings.timeLimit) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimer() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerElement.textContent = `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateStats() {
        document.getElementById('moves').textContent = `Coups: ${this.moves}`;
        
        // Mettre à jour les indices restants
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.textContent = `💡 Indice (${this.hintsRemaining})`;
            hintBtn.disabled = this.hintsRemaining <= 0;
        }
    }

    useHint() {
        if (this.hintsRemaining <= 0 || this.gameState !== 'playing') return;
        
        // Trouver une paire non découverte et la révéler brièvement
        const unmatchedCards = this.cards.filter(card => !card.isMatched);
        if (unmatchedCards.length >= 2) {
            const pairId = unmatchedCards[0].pairId;
            const pairCards = unmatchedCards.filter(card => card.pairId === pairId);
            
            if (pairCards.length === 2) {
                // Révéler la paire pendant 2 secondes
                pairCards.forEach(cardData => {
                    const cardElement = document.querySelector(`[data-index="${this.cards.indexOf(cardData)}"]`);
                    if (cardElement) {
                        cardElement.classList.add('flipped');
                        setTimeout(() => {
                            cardElement.classList.remove('flipped');
                        }, 2000);
                    }
                });
                
                this.hintsRemaining--;
                this.updateStats();
            }
        }
    }

    endGame() {
        this.gameState = 'finished';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        setTimeout(() => {
            this.showResultPopup();
        }, 1000);
    }

    showResultPopup() {
        const popup = document.getElementById('result-popup');
        const finalResults = document.getElementById('final-results');
        
        const timeSpent = this.timer;
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const accuracy = this.moves > 0 ? Math.round((this.stats.correctMatches / this.moves) * 100) : 100;
        
        finalResults.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.stats.totalPairs}</div>
                    <div style="font-size: 0.9rem; color: #666;">Paires trouvées</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--warning-color);">${this.moves}</div>
                    <div style="font-size: 0.9rem; color: #666;">Coups joués</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--success-color);">${timeText}</div>
                    <div style="font-size: 0.9rem; color: #666;">Temps</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--secondary-color);">${accuracy}%</div>
                    <div style="font-size: 0.9rem; color: #666;">Efficacité</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem; padding: 1rem; background: var(--light-color); border-radius: 8px;">
                Niveau complété : <strong>${this.currentLevel} - Difficulté ${this.difficulty}</strong>
            </div>
        `;
        
        popup.classList.add('show');
    }

    hideResultPopup() {
        document.getElementById('result-popup').classList.remove('show');
    }

    resetGame() {
        this.gameState = 'menu';
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.hintsRemaining = 3;
        this.stats.mistakes = 0;
        this.stats.correctMatches = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.currentLevel && this.currentSublevel) {
            this.loadCardsFromLevel(this.currentLevel, this.currentSublevel);
        }
    }

    newGame() {
        this.resetGame();
        
        // Réinitialiser les sélections
        document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
        
        this.currentLevel = null;
        this.currentSublevel = null;
        this.cards = [];
        
        this.renderCards();
        this.showLevelSelection();
    }

    nextLevel() {
        // Essayer de passer au sous-niveau suivant
        const availableSublevels = this.availableSublevels[this.currentLevel] || [];
        const currentIndex = availableSublevels.indexOf(this.currentSublevel);
        
        if (currentIndex < availableSublevels.length - 1) {
            // Sous-niveau suivant du même niveau
            this.currentSublevel = availableSublevels[currentIndex + 1];
            this.hideResultPopup();
            this.resetGame();
        } else {
            // Passer au niveau suivant
            const levelIndex = this.availableLevels.indexOf(this.currentLevel);
            if (levelIndex < this.availableLevels.length - 1) {
                const nextLevel = this.availableLevels[levelIndex + 1];
                const nextSublevels = this.availableSublevels[nextLevel] || [];
                if (nextSublevels.length > 0) {
                    this.currentLevel = nextLevel;
                    this.currentSublevel = nextSublevels[0];
                    this.hideResultPopup();
                    this.resetGame();
                } else {
                    alert('Félicitations ! Vous avez terminé tous les niveaux disponibles !');
                }
            } else {
                alert('Félicitations ! Vous avez terminé tous les niveaux disponibles !');
            }
        }
    }

    showLevelSelection() {
        this.showLoadingMessage('Sélectionnez un niveau et une difficulté pour commencer !');
    }

    showLoadingMessage(message) {
        const container = document.getElementById('memory-grid');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--border-radius); box-shadow: var(--box-shadow);">
                <div style="font-size: 1.2rem; color: var(--primary-color); margin-bottom: 1rem;">
                    ${message}
                </div>
                <div style="font-size: 0.9rem; color: #666;">
                    Choisissez votre niveau CECR et votre difficulté.
                </div>
            </div>
        `;
    }

    showErrorMessage(message) {
        const container = document.getElementById('memory-grid');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--border-radius); box-shadow: var(--box-shadow); border-left: 4px solid var(--danger-color);">
                <div style="font-size: 1.2rem; color: var(--danger-color); margin-bottom: 1rem;">
                    ${message}
                </div>
                <div style="font-size: 0.9rem; color: #666;">
                    Veuillez sélectionner un autre niveau.
                </div>
            </div>
        `;
    }
}

// Initialiser le jeu
let memoryGame;
document.addEventListener('DOMContentLoaded', () => {
    memoryGame = new MemoryMots();
});

// Styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    .memory-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .memory-card.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .result-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .result-popup.show {
        opacity: 1;
        visibility: visible;
    }
    
    .popup-content {
        background: white;
        padding: 2rem;
        border-radius: var(--border-radius);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        text-align: center;
    }
`;
document.head.appendChild(style); 