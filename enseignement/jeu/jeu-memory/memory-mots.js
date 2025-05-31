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
        console.log('🚀 Initialisation du Memory des Mots...');
        console.log('🌐 URL de base:', window.location.href);
        
        await this.scanAvailableLevels();
        this.setupEventListeners();
        this.updateStats();
        
        // Vérifier si des niveaux sont disponibles
        const hasAvailableLevels = Object.values(this.availableSublevels).some(sublevels => sublevels.length > 0);
        
        if (!hasAvailableLevels) {
            console.log('⚠️ Aucun niveau JSON disponible');
            this.showLoadingMessage('Aucun fichier de données trouvé. Veuillez vérifier la configuration.');
        } else {
            this.showLevelSelection();
        }
        
        console.log('✅ Initialisation terminée');
        console.log('📊 Niveaux disponibles:', this.availableSublevels);
    }

    async scanAvailableLevels() {
        console.log('🔍 Scan des niveaux disponibles...');
        
        // Scanner les niveaux disponibles
        for (const level of this.availableLevels) {
            console.log(`📁 Scanning niveau ${level}...`);
            this.availableSublevels[level] = await this.scanSublevels(level);
            console.log(`✅ Niveau ${level}: ${this.availableSublevels[level].length} sous-niveaux trouvés`);
        }
        this.updateLevelButtons();
    }

    async scanSublevels(level) {
        const sublevels = [];
        console.log(`🔎 Recherche des sous-niveaux pour ${level}...`);
        
        // Tenter de charger les sous-niveaux de 1 à 9
        for (let i = 1; i <= 9; i++) {
            try {
                const url = `data/${level}/niveau_${i}.json`;
                console.log(`📡 Test de chargement: ${url}`);
                
                const response = await fetch(url);
                console.log(`📥 Réponse pour ${url}:`, response.status, response.statusText);
                
                if (response.ok) {
                    // Tester aussi si le JSON est valide
                    const testData = await response.json();
                    console.log(`✅ JSON valide pour ${url}, ${testData.length} éléments`);
                    sublevels.push(i);
                } else {
                    console.log(`❌ Échec de chargement ${url}: ${response.status}`);
                }
            } catch (error) {
                console.log(`⚠️ Erreur lors du test ${level}/niveau_${i}.json:`, error.message);
            }
        }
        
        console.log(`📋 Sous-niveaux trouvés pour ${level}:`, sublevels);
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
            const url = `data/${level}/niveau_${sublevel}.json`;
            console.log(`📡 Chargement des cartes depuis: ${url}`);
            
            const response = await fetch(url);
            console.log(`📥 Réponse HTTP:`, response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const cardsData = await response.json();
            console.log(`📊 Données chargées: ${cardsData.length} mots`);
            console.log(`🔍 Premier élément:`, cardsData[0]);
            
            // Vérifier que les données ont la bonne structure
            if (!Array.isArray(cardsData) || cardsData.length === 0) {
                throw new Error('Données JSON invalides ou vides');
            }
            
            // Vérifier que chaque élément a les propriétés nécessaires
            const firstItem = cardsData[0];
            if (!firstItem.french || !firstItem.chinese) {
                throw new Error('Structure de données incorrecte: propriétés french/chinese manquantes');
            }
            
            // Créer les paires pour le memory (français + chinois)
            console.log(`🔄 Création des paires de cartes...`);
            this.createMemoryPairs(cardsData);
            console.log(`✅ ${this.cards.length} cartes créées`);
            
            this.shuffleCards();
            console.log(`🔀 Cartes mélangées`);
            
            // Afficher les cartes
            console.log(`🎮 Rendu des cartes sur l'écran...`);
            this.renderCards();
            
            this.updateStats();
            
            // Afficher un message de confirmation dans la console
            console.log(`🎉 Niveau chargé avec succès: ${this.stats.totalPairs} paires créées et affichées`);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            console.log('🔄 Tentative avec données de fallback...');
            
            // Utiliser des données de fallback
            this.loadFallbackData(level);
        }
    }
    
    loadFallbackData(level) {
        console.log('🆘 Chargement des données de fallback pour', level);
        
        // Données de démonstration basées sur le niveau
        const fallbackData = this.getFallbackDataForLevel(level);
        
        console.log(`📊 Données de fallback: ${fallbackData.length} mots`);
        
        console.log(`🔄 Création des paires de cartes avec données de fallback...`);
        this.createMemoryPairs(fallbackData);
        console.log(`✅ ${this.cards.length} cartes créées`);
        
        this.shuffleCards();
        console.log(`🔀 Cartes mélangées`);
        
        // Afficher les cartes
        console.log(`🎮 Rendu des cartes sur l'écran (mode fallback)...`);
        this.renderCards();
        
        this.updateStats();
        
        console.log(`🎉 Mode test chargé avec succès: ${this.stats.totalPairs} paires affichées`);
    }
    
    getFallbackDataForLevel(level) {
        const fallbackData = {
            A1: [
                {"french": "bonjour", "chinese": "你好", "pinyin": "nǐ hǎo", "category": "salutations", "difficulty": 1},
                {"french": "au revoir", "chinese": "再见", "pinyin": "zài jiàn", "category": "salutations", "difficulty": 1},
                {"french": "merci", "chinese": "谢谢", "pinyin": "xiè xiè", "category": "politesse", "difficulty": 1},
                {"french": "oui", "chinese": "是", "pinyin": "shì", "category": "réponses", "difficulty": 1},
                {"french": "non", "chinese": "不是", "pinyin": "bù shì", "category": "réponses", "difficulty": 1},
                {"french": "chat", "chinese": "猫", "pinyin": "māo", "category": "animaux", "difficulty": 1},
                {"french": "chien", "chinese": "狗", "pinyin": "gǒu", "category": "animaux", "difficulty": 1},
                {"french": "eau", "chinese": "水", "pinyin": "shuǐ", "category": "nourriture", "difficulty": 1},
                {"french": "pain", "chinese": "面包", "pinyin": "miàn bāo", "category": "nourriture", "difficulty": 1},
                {"french": "maison", "chinese": "房子", "pinyin": "fáng zi", "category": "lieux", "difficulty": 1},
                {"french": "école", "chinese": "学校", "pinyin": "xué xiào", "category": "lieux", "difficulty": 1},
                {"french": "rouge", "chinese": "红色", "pinyin": "hóng sè", "category": "couleurs", "difficulty": 1}
            ],
            A2: [
                {"french": "voyage", "chinese": "旅行", "pinyin": "lǚ xíng", "category": "voyage", "difficulty": 2},
                {"french": "restaurant", "chinese": "餐厅", "pinyin": "cān tīng", "category": "lieux", "difficulty": 2},
                {"french": "travail", "chinese": "工作", "pinyin": "gōng zuò", "category": "profession", "difficulty": 2},
                {"french": "médecin", "chinese": "医生", "pinyin": "yī shēng", "category": "profession", "difficulty": 2},
                {"french": "temps", "chinese": "时间", "pinyin": "shí jiān", "category": "temps", "difficulty": 2},
                {"french": "aujourd'hui", "chinese": "今天", "pinyin": "jīn tiān", "category": "temps", "difficulty": 2},
                {"french": "argent", "chinese": "钱", "pinyin": "qián", "category": "économie", "difficulty": 2},
                {"french": "acheter", "chinese": "买", "pinyin": "mǎi", "category": "verbes", "difficulty": 2},
                {"french": "comprendre", "chinese": "理解", "pinyin": "lǐ jiě", "category": "verbes", "difficulty": 2}
            ],
            B1: [
                {"french": "expérience", "chinese": "经验", "pinyin": "jīng yàn", "category": "abstrait", "difficulty": 3},
                {"french": "développement", "chinese": "发展", "pinyin": "fā zhǎn", "category": "abstrait", "difficulty": 3},
                {"french": "environnement", "chinese": "环境", "pinyin": "huán jìng", "category": "nature", "difficulty": 3},
                {"french": "technologie", "chinese": "技术", "pinyin": "jì shù", "category": "technologie", "difficulty": 3},
                {"french": "gouvernement", "chinese": "政府", "pinyin": "zhèng fǔ", "category": "politique", "difficulty": 3},
                {"french": "culture", "chinese": "文化", "pinyin": "wén huà", "category": "culture", "difficulty": 3},
                {"french": "communication", "chinese": "交流", "pinyin": "jiāo liú", "category": "communication", "difficulty": 3},
                {"french": "réussir", "chinese": "成功", "pinyin": "chéng gōng", "category": "verbes", "difficulty": 3}
            ]
        };
        
        return fallbackData[level] || fallbackData.A1;
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
        
        // Mélange immédiat après création
        console.log('🔀 Premier mélange après création des paires...');
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
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
                } else if (e.target.dataset.sublevel) {
                    this.selectSublevel(parseInt(e.target.dataset.sublevel));
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
        
        // Bouton de démarrage du jeu
        document.getElementById('start-game-btn')?.addEventListener('click', () => {
            if (this.currentLevel && this.currentSublevel) {
                console.log(`🎮 Démarrage du jeu: ${this.currentLevel} - Niveau ${this.currentSublevel}`);
                this.loadCardsFromLevel(this.currentLevel, this.currentSublevel);
            }
        });
    }

    selectLevel(level) {
        this.currentLevel = level;
        this.currentSublevel = null; // Reset sublevel selection
        
        // Mettre à jour les boutons de niveau
        document.querySelectorAll('.difficulty-btn[data-level]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-level="${level}"]`)?.classList.add('active');
        
        // Afficher les sous-niveaux disponibles
        const availableSublevels = this.availableSublevels[level] || [];
        this.showSublevels(availableSublevels);
        
        // Désactiver le bouton de démarrage jusqu'à ce qu'un sous-niveau soit sélectionné
        this.updateStartButton();
    }

    showSublevels(sublevels) {
        const sublevelSection = document.getElementById('sublevel-section');
        const sublevelButtons = document.getElementById('sublevel-buttons');
        
        if (sublevels.length > 0) {
            sublevelSection.style.display = 'block';
            sublevelButtons.innerHTML = '';
            
            sublevels.forEach(sublevel => {
                const button = document.createElement('button');
                button.className = 'difficulty-btn';
                button.dataset.sublevel = sublevel;
                button.textContent = `Niveau ${sublevel}`;
                button.addEventListener('click', () => {
                    this.selectSublevel(sublevel);
                });
                sublevelButtons.appendChild(button);
            });
        } else {
            sublevelSection.style.display = 'none';
        }
    }
    
    selectSublevel(sublevel) {
        this.currentSublevel = sublevel;
        
        // Mettre à jour les boutons de sous-niveau
        document.querySelectorAll('.difficulty-btn[data-sublevel]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-sublevel="${sublevel}"]`)?.classList.add('active');
        
        // Activer le bouton de démarrage
        this.updateStartButton();
        
        console.log(`📋 Sélection: ${this.currentLevel} - Niveau ${sublevel}`);
    }
    
    updateStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            const canStart = this.currentLevel && this.currentSublevel;
            startBtn.disabled = !canStart;
            
            if (canStart) {
                startBtn.textContent = `🚀 Commencer ${this.currentLevel} - Niveau ${this.currentSublevel}`;
                startBtn.style.background = '#28a745';
            } else {
                startBtn.textContent = '🚀 Commencer le jeu';
                startBtn.style.background = '#6c757d';
            }
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
        console.log('🔀 Mélange des cartes...');
        
        // Utiliser l'algorithme Fisher-Yates pour un mélange parfait
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        // Double mélange pour être sûr
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        
        console.log('✅ Cartes mélangées:', this.cards.map(c => `${c.type}:${c.text}`).slice(0, 8), '...');
    }

    renderCards() {
        console.log('🎨 Rendu des cartes...', this.cards.length);
        const container = document.getElementById('memory-grid');
        
        // Vider complètement le conteneur
        container.innerHTML = '';
        container.style.display = 'grid';

        if (this.cards.length === 0) {
            console.log('⚠️ Aucune carte à afficher');
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666; grid-column: 1 / -1;">Sélectionnez un niveau pour commencer à jouer !</div>';
            return;
        }

        console.log(`🃏 Affichage de ${this.cards.length} cartes`);

        // Ajouter l'attribut data pour le CSS responsive
        container.setAttribute('data-card-count', this.cards.length);

        // Configuration de la grille selon le nombre de cartes
        const totalCards = this.cards.length;
        if (totalCards <= 12) {
            container.style.gridTemplateColumns = 'repeat(4, 1fr)';
            container.style.maxWidth = '800px';
        } else if (totalCards <= 16) {
            container.style.gridTemplateColumns = 'repeat(4, 1fr)';
            container.style.maxWidth = '900px';
        } else if (totalCards <= 24) {
            container.style.gridTemplateColumns = 'repeat(6, 1fr)';
            container.style.maxWidth = '1100px';
        } else {
            container.style.gridTemplateColumns = 'repeat(6, 1fr)';
            container.style.maxWidth = '1200px';
        }

        // Créer et ajouter chaque carte
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            container.appendChild(cardElement);
        });

        console.log(`✅ ${this.cards.length} cartes ajoutées au DOM`);
        console.log(`🔍 Grid columns: ${container.style.gridTemplateColumns}`);

        // Démarrer le timer si nécessaire
        this.startTimer();
        this.gameState = 'playing';

        // Animation d'apparition avec délai
        setTimeout(() => {
            const cardElements = document.querySelectorAll('.memory-card');
            console.log(`🎭 Animation pour ${cardElements.length} cartes`);
            
            cardElements.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in');
                }, index * 50);
            });
        }, 100);
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
        
        // Masquer la section des sous-niveaux
        document.getElementById('sublevel-section').style.display = 'none';
        
        // Réinitialiser le bouton de démarrage
        this.updateStartButton();
        
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
        const hasAvailableLevels = Object.values(this.availableSublevels).some(sublevels => sublevels.length > 0);
        
        if (hasAvailableLevels) {
            // Compter les niveaux disponibles
            let levelInfo = '';
            Object.entries(this.availableSublevels).forEach(([level, sublevels]) => {
                if (sublevels.length > 0) {
                    levelInfo += `<div style="margin: 5px 0;"><strong>${level}:</strong> ${sublevels.length} sous-niveau(s)</div>`;
                }
            });
            
            this.showLoadingMessage(`
                <div>Sélectionnez un niveau et une difficulté pour commencer !</div>
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: left;">
                    <div style="font-weight: bold; margin-bottom: 10px;">📋 Niveaux disponibles :</div>
                    ${levelInfo}
                </div>
            `);
        } else {
            this.showLoadingMessage('Chargement en cours...');
        }
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