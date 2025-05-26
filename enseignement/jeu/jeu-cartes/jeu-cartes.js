class JeuCartes {
    constructor() {
        this.cards = [];
        this.currentFilter = 'all';
        this.currentLevel = null;
        this.currentSublevel = null;
        this.availableLevels = ['A1', 'A2', 'B1'];
        this.availableSublevels = {};
        this.stats = {
            cardsViewed: 0,
            correctAnswers: 0,
            totalCards: 0
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
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            const level = btn.dataset.level;
            const hasSublevels = this.availableSublevels[level] && this.availableSublevels[level].length > 0;
            
            if (!hasSublevels) {
                btn.disabled = true;
                btn.textContent += ' (Indisponible)';
                btn.style.opacity = '0.5';
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
            this.cards = [...cardsData];
            this.stats.totalCards = this.cards.length;
            this.shuffleCards();
            this.renderCards();
            this.updateStats();
            
            // Afficher un message de confirmation
            this.showLoadingMessage(`Niveau ${level} - Sous-niveau ${sublevel} chargé ! ${this.cards.length} cartes disponibles.`);
            
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.showErrorMessage(`Erreur: ${error.message}`);
        }
    }

    setupEventListeners() {
        // Sélection des niveaux CECR
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                
                this.selectLevel(e.target.dataset.level);
            });
        });

        // Filtres de catégories
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.category);
            });
        });

        // Contrôles de jeu
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.shuffleCards();
            this.renderCards();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
            this.hideResultPopup();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            window.location.href = '../index_jeu.html';
        });
    }

    selectLevel(level) {
        this.currentLevel = level;
        
        // Mettre à jour les boutons de niveau
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-level="${level}"]`).classList.add('active');
        
        // Afficher les sous-niveaux disponibles
        this.showSublevels(level);
    }

    showSublevels(level) {
        const sublevelSelection = document.getElementById('sublevel-selection');
        const sublevelButtons = document.getElementById('sublevel-buttons');
        
        sublevelButtons.innerHTML = '';
        
        const availableSublevels = this.availableSublevels[level] || [];
        
        if (availableSublevels.length > 0) {
            availableSublevels.forEach(sublevel => {
                const btn = document.createElement('button');
                btn.className = 'sublevel-btn';
                btn.dataset.sublevel = sublevel;
                btn.textContent = `Niveau ${sublevel}`;
                
                btn.addEventListener('click', () => {
                    this.selectSublevel(sublevel);
                });
                
                sublevelButtons.appendChild(btn);
            });
            
            sublevelSelection.style.display = 'block';
        } else {
            sublevelSelection.style.display = 'none';
        }
    }

    selectSublevel(sublevel) {
        this.currentSublevel = sublevel;
        
        // Mettre à jour les boutons de sous-niveau
        document.querySelectorAll('.sublevel-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-sublevel="${sublevel}"]`).classList.add('active');
        
        // Charger les cartes du niveau sélectionné
        this.loadCardsFromLevel(this.currentLevel, sublevel);
    }

    setFilter(category) {
        this.currentFilter = category;
        
        // Mettre à jour les boutons de filtre
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.renderCards();
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        if (this.cards.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Sélectionnez un niveau pour commencer à jouer !</div>';
            return;
        }

        const filteredCards = this.currentFilter === 'all' 
            ? this.cards 
            : this.cards.filter(card => card.category === this.currentFilter);

        if (filteredCards.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Aucune carte trouvée pour cette catégorie.</div>';
            return;
        }

        filteredCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            container.appendChild(cardElement);
        });

        // Animation d'apparition
        setTimeout(() => {
            document.querySelectorAll('.card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in');
                }, index * 100);
            });
        }, 50);
    }

    createCardElement(cardData, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.category = cardData.category;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="difficulty-indicator">
                        ${this.createDifficultyDots(cardData.difficulty)}
                    </div>
                    <div class="card-category">${this.getCategoryLabel(cardData.category)}</div>
                    <div class="card-question">${cardData.question}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
                        Cliquez pour révéler la réponse
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-answer">${cardData.answer}</div>
                    <div style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.9;">
                        ${cardData.explanation || ''}
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <button class="btn btn-success btn-sm" onclick="game.markCorrect(${index})">✓ Correct</button>
                        <button class="btn btn-danger btn-sm" onclick="game.markIncorrect(${index})">✗ Incorrect</button>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) {
                this.flipCard(card);
            }
        });

        return card;
    }

    createDifficultyDots(difficulty) {
        let dots = '';
        for (let i = 1; i <= 3; i++) {
            const activeClass = i <= difficulty ? 'active' : '';
            dots += `<div class="difficulty-dot ${activeClass}"></div>`;
        }
        return dots;
    }

    getCategoryLabel(category) {
        const labels = {
            'grammaire': 'Grammaire',
            'vocabulaire': 'Vocabulaire',
            'conjugaison': 'Conjugaison',
            'culture': 'Culture'
        };
        return labels[category] || category;
    }

    flipCard(cardElement) {
        cardElement.classList.toggle('flipped');
        if (cardElement.classList.contains('flipped')) {
            this.stats.cardsViewed++;
            this.updateStats();
        }
    }

    markCorrect(index) {
        this.stats.correctAnswers++;
        this.removeCard(index);
        this.updateStats();
        this.checkGameComplete();
    }

    markIncorrect(index) {
        this.removeCard(index);
        this.updateStats();
        this.checkGameComplete();
    }

    removeCard(index) {
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        if (cardElement) {
            cardElement.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                if (cardElement.parentNode) {
                    cardElement.parentNode.removeChild(cardElement);
                }
            }, 500);
        }
    }

    updateStats() {
        document.getElementById('cards-viewed').textContent = this.stats.cardsViewed;
        document.getElementById('correct-answers').textContent = this.stats.correctAnswers;
        
        const accuracy = this.stats.cardsViewed > 0 
            ? Math.round((this.stats.correctAnswers / this.stats.cardsViewed) * 100)
            : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
        
        // Mettre à jour la barre de progression
        const progress = this.stats.totalCards > 0 
            ? (this.stats.cardsViewed / this.stats.totalCards) * 100
            : 0;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-count').textContent = `${this.stats.cardsViewed}/${this.stats.totalCards}`;
    }

    checkGameComplete() {
        const remainingCards = document.querySelectorAll('.card:not([style*="fadeOut"])').length;
        if (remainingCards === 0 && this.stats.totalCards > 0) {
            setTimeout(() => {
                this.showResultPopup();
            }, 1000);
        }
    }

    showResultPopup() {
        const popup = document.getElementById('result-popup');
        const finalStats = document.getElementById('final-stats');
        
        const accuracy = this.stats.cardsViewed > 0 
            ? Math.round((this.stats.correctAnswers / this.stats.cardsViewed) * 100)
            : 0;
        
        finalStats.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${this.stats.cardsViewed}</div>
                    <div style="font-size: 0.9rem; color: #666;">Cartes vues</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--success-color);">${this.stats.correctAnswers}</div>
                    <div style="font-size: 0.9rem; color: #666;">Bonnes réponses</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--warning-color);">${accuracy}%</div>
                    <div style="font-size: 0.9rem; color: #666;">Précision</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem; padding: 1rem; background: var(--light-color); border-radius: 8px;">
                Niveau complété : <strong>${this.currentLevel} - Sous-niveau ${this.currentSublevel}</strong>
            </div>
        `;
        
        popup.classList.add('show');
    }

    hideResultPopup() {
        document.getElementById('result-popup').classList.remove('show');
    }

    resetGame() {
        this.stats = {
            cardsViewed: 0,
            correctAnswers: 0,
            totalCards: this.stats.totalCards
        };
        
        if (this.currentLevel && this.currentSublevel) {
            this.loadCardsFromLevel(this.currentLevel, this.currentSublevel);
        }
        
        this.updateStats();
    }

    newGame() {
        this.stats = {
            cardsViewed: 0,
            correctAnswers: 0,
            totalCards: 0
        };
        this.cards = [];
        this.currentLevel = null;
        this.currentSublevel = null;
        
        // Réinitialiser les sélections
        document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sublevel-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('sublevel-selection').style.display = 'none';
        
        this.renderCards();
        this.updateStats();
        this.showLevelSelection();
    }

    showLevelSelection() {
        this.showLoadingMessage('Sélectionnez un niveau CECR et un sous-niveau pour commencer !');
    }

    showLoadingMessage(message) {
        const container = document.getElementById('cards-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: var(--border-radius); box-shadow: var(--box-shadow);">
                <div style="font-size: 1.2rem; color: var(--primary-color); margin-bottom: 1rem;">
                    ${message}
                </div>
                <div style="font-size: 0.9rem; color: #666;">
                    Les niveaux indisponibles sont grisés.
                </div>
            </div>
        `;
    }

    showErrorMessage(message) {
        const container = document.getElementById('cards-container');
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

    playSound(type) {
        // Placeholder pour les effets sonores futurs
        console.log(`Son: ${type}`);
    }
}

// Initialiser le jeu
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new JeuCartes();
});

// Styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    .card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .card.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
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