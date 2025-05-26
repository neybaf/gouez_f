class JeuCartes {
    constructor() {
        this.cards = [];
        this.currentFilter = 'all';
        this.stats = {
            cardsViewed: 0,
            correctAnswers: 0,
            totalCards: 0
        };
        this.init();
    }

    init() {
        this.loadCards();
        this.setupEventListeners();
        this.updateStats();
    }

    loadCards() {
        // Données des cartes par catégorie
        this.cardsData = [
            // Grammaire
            {
                question: "Quel est l'auxiliaire du passé composé pour 'aller' ?",
                answer: "être",
                category: "grammaire",
                difficulty: 2,
                explanation: "Les verbes de mouvement utilisent l'auxiliaire 'être'"
            },
            {
                question: "Comment accorde-t-on l'adjectif avec un nom féminin pluriel ?",
                answer: "On ajoute -es",
                category: "grammaire",
                difficulty: 1,
                explanation: "Féminin + pluriel = -es (ex: grandes)"
            },
            {
                question: "Quelle est la forme négative de 'Je mange' ?",
                answer: "Je ne mange pas",
                category: "grammaire",
                difficulty: 1,
                explanation: "La négation se forme avec 'ne...pas'"
            },
            
            // Vocabulaire
            {
                question: "Comment dit-on 'library' en français ?",
                answer: "bibliothèque",
                category: "vocabulaire",
                difficulty: 2,
                explanation: "Attention à ne pas confondre avec 'librairie' (bookstore)"
            },
            {
                question: "Quel est le contraire de 'grand' ?",
                answer: "petit",
                category: "vocabulaire",
                difficulty: 1,
                explanation: "Antonyme de base en français"
            },
            {
                question: "Comment appelle-t-on le repas du matin ?",
                answer: "le petit-déjeuner",
                category: "vocabulaire",
                difficulty: 1,
                explanation: "Premier repas de la journée"
            },
            
            // Conjugaison
            {
                question: "Conjuguez 'être' à la 1ère personne du singulier au présent",
                answer: "je suis",
                category: "conjugaison",
                difficulty: 1,
                explanation: "Verbe irrégulier fondamental"
            },
            {
                question: "Conjuguez 'finir' à la 3ème personne du pluriel au futur",
                answer: "ils finiront",
                category: "conjugaison",
                difficulty: 3,
                explanation: "Verbe du 2ème groupe au futur simple"
            },
            {
                question: "Quelle est la forme du subjonctif présent de 'avoir' (que j'...) ?",
                answer: "que j'aie",
                category: "conjugaison",
                difficulty: 3,
                explanation: "Forme irrégulière du subjonctif"
            },
            
            // Culture
            {
                question: "Quelle est la capitale de la France ?",
                answer: "Paris",
                category: "culture",
                difficulty: 1,
                explanation: "Ville lumière et capitale française"
            },
            {
                question: "Quel fromage français est surnommé 'le roi des fromages' ?",
                answer: "le roquefort",
                category: "culture",
                difficulty: 2,
                explanation: "Fromage à pâte persillée de l'Aveyron"
            },
            {
                question: "Qui a écrit 'Les Misérables' ?",
                answer: "Victor Hugo",
                category: "culture",
                difficulty: 2,
                explanation: "Grand écrivain français du 19ème siècle"
            }
        ];

        this.cards = [...this.cardsData];
        this.stats.totalCards = this.cards.length;
        this.shuffleCards();
        this.renderCards();
    }

    setupEventListeners() {
        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.category);
            });
        });

        // Contrôles
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

    setFilter(category) {
        this.currentFilter = category;
        
        // Mettre à jour les boutons
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

        const filteredCards = this.currentFilter === 'all' 
            ? this.cards 
            : this.cards.filter(card => card.category === this.currentFilter);

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

        const difficultyDots = Array.from({length: 3}, (_, i) => 
            `<div class="difficulty-dot ${i < cardData.difficulty ? 'active' : ''}"></div>`
        ).join('');

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="difficulty-indicator">
                        ${difficultyDots}
                    </div>
                    <div class="card-category">${this.getCategoryLabel(cardData.category)}</div>
                    <div class="card-question">${cardData.question}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: auto;">
                        Cliquez pour révéler la réponse
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-answer">${cardData.answer}</div>
                    ${cardData.explanation ? `<div style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.9;">${cardData.explanation}</div>` : ''}
                    <div style="margin-top: auto;">
                        <button class="btn btn-success" onclick="gameInstance.markCorrect(${index})" style="margin: 0.5rem;">✓ Correct</button>
                        <button class="btn btn-danger" onclick="gameInstance.markIncorrect(${index})" style="margin: 0.5rem;">✗ Incorrect</button>
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

    getCategoryLabel(category) {
        const labels = {
            grammaire: 'Grammaire',
            vocabulaire: 'Vocabulaire',
            conjugaison: 'Conjugaison',
            culture: 'Culture'
        };
        return labels[category] || category;
    }

    flipCard(cardElement) {
        if (!cardElement.classList.contains('viewed')) {
            cardElement.classList.add('viewed');
            this.stats.cardsViewed++;
        }
        
        cardElement.classList.toggle('flipped');
        this.updateStats();
    }

    markCorrect(index) {
        this.stats.correctAnswers++;
        this.updateStats();
        this.removeCard(index);
        this.playSound('correct');
    }

    markIncorrect(index) {
        this.updateStats();
        this.removeCard(index);
        this.playSound('incorrect');
    }

    removeCard(index) {
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.style.transform = 'scale(0)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                this.checkGameComplete();
            }, 300);
        }
    }

    updateStats() {
        document.getElementById('cards-viewed').textContent = this.stats.cardsViewed;
        document.getElementById('correct-answers').textContent = this.stats.correctAnswers;
        
        const accuracy = this.stats.cardsViewed > 0 
            ? Math.round((this.stats.correctAnswers / this.stats.cardsViewed) * 100)
            : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;

        // Mettre à jour la barre de progression
        const progress = (this.stats.cardsViewed / this.stats.totalCards) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-count').textContent = `${this.stats.cardsViewed}/${this.stats.totalCards}`;
    }

    checkGameComplete() {
        const remainingCards = document.querySelectorAll('.card').length;
        if (remainingCards === 0) {
            setTimeout(() => {
                this.showResultPopup();
            }, 500);
        }
    }

    showResultPopup() {
        const popup = document.getElementById('result-popup');
        const finalStats = document.getElementById('final-stats');
        
        const accuracy = this.stats.cardsViewed > 0 
            ? Math.round((this.stats.correctAnswers / this.stats.cardsViewed) * 100)
            : 0;

        finalStats.innerHTML = `
            <div style="margin: 1rem 0;">
                <div><strong>Cartes vues:</strong> ${this.stats.cardsViewed}</div>
                <div><strong>Bonnes réponses:</strong> ${this.stats.correctAnswers}</div>
                <div><strong>Précision:</strong> ${accuracy}%</div>
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
            totalCards: this.cardsData.length
        };
        this.cards = [...this.cardsData];
        this.shuffleCards();
        this.renderCards();
        this.updateStats();
    }

    newGame() {
        this.resetGame();
        // Ici on pourrait charger de nouvelles cartes ou changer de niveau
    }

    playSound(type) {
        // Créer un son simple avec Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Do
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi
        } else {
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // La grave
        }

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

// Initialiser le jeu
let gameInstance;
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new JeuCartes();
}); 