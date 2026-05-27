class AssociationLexicale {
    constructor() {
        this.currentLevel = null;
        this.currentSublevel = null;
        this.currentDifficulty = null;
        this.availableLevels = {};
        this.lexiqueData = [];
        this.currentSet = [];
        this.selectedMedia = null;
        this.selectedText = null;
        this.gameState = 'menu'; // menu, playing, paused, ended
        this.stats = {
            score: 0,
            matches: 0,
            errors: 0,
            totalItems: 0,
            startTime: null,
            endTime: null
        };
        this.timer = 30;
        this.timerInterval = null;
        this.difficultySettings = {
            easy: { items: 5, time: 45, points: 10 },
            medium: { items: 7, time: 35, points: 15 },
            hard: { items: 10, time: 25, points: 20 }
        };
        this.audioContext = null;
        this.init();
    }

    async init() {
        await this.initAudio();
        await this.scanAvailableLevels();
        this.setupEventListeners();
        this.showScreen('start-screen');
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio context non disponible');
        }
    }

    async scanAvailableLevels() {
        // Scanner les niveaux disponibles
        const levelMappings = {
            'FG1': 'S1', 'FG2': 'S2', 'FG3': 'S3', 'FG4': 'S4',
            'FOS1': 'FOS1', 'FOS2': 'FOS2',
            'INS2': 'INS2'
        };

        for (const [displayLevel, fileLevel] of Object.entries(levelMappings)) {
            this.availableLevels[displayLevel] = await this.scanSublevels(fileLevel);
        }
        
        this.updateLevelButtons();
    }

    async scanSublevels(level) {
        const sublevels = [];
        
        if (level === 'INS2') {
            // Pour INS2, scanner le dossier data-lexique/INS2/
            try {
                // Tenter de charger U9 qui existe
                const response = await fetch(`data-lexique/lexique_S2_U9.csv`);
                if (response.ok) {
                    sublevels.push(9);
                }
            } catch (error) {
                console.log(`Niveau ${level} non disponible`);
            }
        } else {
            // Pour les autres niveaux, tenter de charger les unités 1-9
            for (let i = 1; i <= 9; i++) {
                try {
                    const response = await fetch(`data-lexique/lexique_${level}_U${i}.csv`);
                    if (response.ok) {
                        sublevels.push(i);
                    }
                } catch (error) {
                    // Fichier non trouvé, continuer
                }
            }
        }
        
        return sublevels;
    }

    updateLevelButtons() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            const level = btn.dataset.level;
            const hasSublevels = this.availableLevels[level] && this.availableLevels[level].length > 0;
            
            if (!hasSublevels) {
                btn.disabled = true;
                btn.textContent += ' (Indisponible)';
                btn.style.opacity = '0.5';
            }
        });
    }

    setupEventListeners() {
        // Sélection des niveaux
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                this.selectLevel(e.target.dataset.level);
            });
        });

        // Sélection de la difficulté
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDifficulty(e.target.dataset.difficulty);
            });
        });

        // Bouton de démarrage
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Contrôles de jeu
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseGame();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('quit-btn').addEventListener('click', () => {
            this.quitGame();
        });

        // Contrôles de pause
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.backToMenu();
        });

        // Contrôles de fin
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('share-score-btn').addEventListener('click', () => {
            this.shareScore();
        });

        document.getElementById('back-menu-btn').addEventListener('click', () => {
            this.backToMenu();
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === ' ' || e.key === 'Escape') {
                    e.preventDefault();
                    this.pauseGame();
                }
            }
        });
    }

    selectLevel(level) {
        this.currentLevel = level;
        
        // Mettre à jour les boutons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-level="${level}"]`).classList.add('active');
        
        // Afficher les sous-niveaux
        this.showSublevels(level);
    }

    showSublevels(level) {
        const sublevelSelection = document.getElementById('sublevel-selection');
        const sublevelButtons = document.getElementById('sublevel-buttons');
        
        sublevelButtons.innerHTML = '';
        
        const availableSublevels = this.availableLevels[level] || [];
        
        if (availableSublevels.length > 0) {
            availableSublevels.forEach(sublevel => {
                const btn = document.createElement('button');
                btn.className = 'sublevel-btn';
                btn.dataset.sublevel = sublevel;
                btn.textContent = `U${sublevel}`;
                
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
        
        // Mettre à jour les boutons
        document.querySelectorAll('.sublevel-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-sublevel="${sublevel}"]`).classList.add('active');
        
        // Afficher la sélection de difficulté
        document.getElementById('difficulty-selection').style.display = 'block';
    }

    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        
        // Mettre à jour les boutons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // Afficher le bouton de démarrage
        document.getElementById('start-game-btn').style.display = 'block';
    }

    async loadLexiqueData() {
        try {
            const levelMapping = {
                'FG1': 'S1', 'FG2': 'S2', 'FG3': 'S3', 'FG4': 'S4',
                'FOS1': 'FOS1', 'FOS2': 'FOS2', 'INS2': 'S2'
            };
            
            const fileLevel = levelMapping[this.currentLevel];
            const response = await fetch(`data-lexique/lexique_${fileLevel}_U${this.currentSublevel}.csv`);
            
            if (!response.ok) {
                throw new Error(`Impossible de charger les données pour ${this.currentLevel} U${this.currentSublevel}`);
            }
            
            const csvText = await response.text();
            const lines = csvText.split('\n').filter(line => line.trim() !== '');
            
            this.lexiqueData = lines.slice(1).map(line => {
                const [text, audio, image] = this.parseCSVLine(line);
                return {
                    text: text?.trim().replace(/"/g, '') || '',
                    audio: audio?.trim() || null,
                    image: image?.trim() || null
                };
            }).filter(item => item.text); // Filtrer les entrées vides
            
            console.log(`${this.lexiqueData.length} éléments chargés pour ${this.currentLevel} U${this.currentSublevel}`);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showFeedback('❌', 'Erreur de chargement des données');
            throw error;
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    async startGame() {
        try {
            await this.loadLexiqueData();
            
            this.gameState = 'playing';
            this.stats = {
                score: 0,
                matches: 0,
                errors: 0,
                totalItems: this.difficultySettings[this.currentDifficulty].items,
                startTime: Date.now(),
                endTime: null
            };
            
            this.timer = this.difficultySettings[this.currentDifficulty].time;
            this.generateCurrentSet();
            this.showScreen('game-screen');
            this.renderGameElements();
            this.startTimer();
            this.updateStats();
            
        } catch (error) {
            console.error('Erreur lors du démarrage du jeu:', error);
        }
    }

    generateCurrentSet() {
        const settings = this.difficultySettings[this.currentDifficulty];
        const shuffled = [...this.lexiqueData].sort(() => Math.random() - 0.5);
        this.currentSet = shuffled.slice(0, settings.items);
    }

    renderGameElements() {
        const mediaContainer = document.getElementById('media-items');
        const textContainer = document.getElementById('text-items');
        
        mediaContainer.innerHTML = '';
        textContainer.innerHTML = '';
        
        // Créer les éléments média (mélangés)
        const shuffledMedia = [...this.currentSet].sort(() => Math.random() - 0.5);
        shuffledMedia.forEach((item, index) => {
            const mediaElement = this.createMediaElement(item, index);
            mediaContainer.appendChild(mediaElement);
        });
        
        // Créer les éléments texte (mélangés)
        const shuffledText = [...this.currentSet].sort(() => Math.random() - 0.5);
        shuffledText.forEach((item, index) => {
            const textElement = this.createTextElement(item, index);
            textContainer.appendChild(textElement);
        });
    }

    createMediaElement(item, index) {
        const element = document.createElement('div');
        element.className = 'association-item media-item';
        element.dataset.originalIndex = this.currentSet.indexOf(item);
        
        if (item.image) {
            element.innerHTML = `<img src="${item.image}" alt="${item.text}" onerror="this.style.display='none'">`;
        } else if (item.audio) {
            element.innerHTML = `
                <div class="audio-placeholder">🎵</div>
                <audio preload="metadata">
                    <source src="${item.audio}" type="audio/mpeg">
                    <source src="${item.audio}" type="audio/mp4">
                </audio>
            `;
            
            // Ajouter un gestionnaire de clic pour jouer l'audio
            element.addEventListener('click', (e) => {
                if (!element.classList.contains('matched')) {
                    const audio = element.querySelector('audio');
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch(console.error);
                    }
                }
            });
        } else {
            element.innerHTML = `<div class="audio-placeholder">📝</div>`;
        }
        
        element.addEventListener('click', () => {
            if (!element.classList.contains('matched')) {
                this.selectMediaElement(element);
            }
        });
        
        return element;
    }

    createTextElement(item, index) {
        const element = document.createElement('div');
        element.className = 'association-item text-item';
        element.dataset.originalIndex = this.currentSet.indexOf(item);
        element.textContent = item.text;
        
        element.addEventListener('click', () => {
            if (!element.classList.contains('matched')) {
                this.selectTextElement(element);
            }
        });
        
        return element;
    }

    selectMediaElement(element) {
        // Désélectionner l'élément précédent
        if (this.selectedMedia) {
            this.selectedMedia.classList.remove('selected');
        }
        
        this.selectedMedia = element;
        element.classList.add('selected');
        
        this.checkMatch();
    }

    selectTextElement(element) {
        // Désélectionner l'élément précédent
        if (this.selectedText) {
            this.selectedText.classList.remove('selected');
        }
        
        this.selectedText = element;
        element.classList.add('selected');
        
        this.checkMatch();
    }

    checkMatch() {
        if (this.selectedMedia && this.selectedText) {
            const mediaIndex = parseInt(this.selectedMedia.dataset.originalIndex);
            const textIndex = parseInt(this.selectedText.dataset.originalIndex);
            
            if (mediaIndex === textIndex) {
                // Correspondance correcte
                this.handleCorrectMatch();
            } else {
                // Correspondance incorrecte
                this.handleIncorrectMatch();
            }
        }
    }

    handleCorrectMatch() {
        const points = this.difficultySettings[this.currentDifficulty].points;
        
        this.stats.score += points;
        this.stats.matches++;
        
        this.selectedMedia.classList.add('correct', 'matched');
        this.selectedText.classList.add('correct', 'matched');
        
        this.playSound('success');
        this.showFeedback('✅', `+${points} points !`);
        
        // Réinitialiser les sélections
        this.selectedMedia = null;
        this.selectedText = null;
        
        this.updateStats();
        
        // Vérifier si le jeu est terminé
        if (this.stats.matches >= this.stats.totalItems) {
            setTimeout(() => {
                this.endGame(true);
            }, 1000);
        }
    }

    handleIncorrectMatch() {
        this.stats.errors++;
        
        this.selectedMedia.classList.add('incorrect');
        this.selectedText.classList.add('incorrect');
        
        this.playSound('error');
        this.showFeedback('❌', 'Essayez encore !');
        
        // Pénalité de temps
        this.timer = Math.max(0, this.timer - 3);
        
        setTimeout(() => {
            if (this.selectedMedia) {
                this.selectedMedia.classList.remove('incorrect', 'selected');
            }
            if (this.selectedText) {
                this.selectedText.classList.remove('incorrect', 'selected');
            }
            this.selectedMedia = null;
            this.selectedText = null;
        }, 800);
        
        this.updateStats();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimer();
            
            if (this.timer <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    updateTimer() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timer;
        
        // Changer la couleur selon l'urgence
        if (this.timer <= 10) {
            timerElement.style.color = 'var(--lexique-danger)';
        } else if (this.timer <= 20) {
            timerElement.style.color = 'var(--lexique-warning)';
        } else {
            timerElement.style.color = 'var(--lexique-primary)';
        }
    }

    updateStats() {
        document.getElementById('score').textContent = this.stats.score;
        document.getElementById('matches').textContent = this.stats.matches;
        document.getElementById('errors').textContent = this.stats.errors;
        
        // Mettre à jour la progression
        const progress = (this.stats.matches / this.stats.totalItems) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = `${this.stats.matches}/${this.stats.totalItems}`;
    }

    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        clearInterval(this.timerInterval);
        
        // Mettre à jour les stats de pause
        document.getElementById('pause-score').textContent = this.stats.score;
        document.getElementById('pause-matches').textContent = this.stats.matches;
        
        this.showScreen('pause-screen');
    }

    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.startTimer();
        this.showScreen('game-screen');
    }

    resetGame() {
        this.gameState = 'menu';
        clearInterval(this.timerInterval);
        this.selectedMedia = null;
        this.selectedText = null;
        this.startGame();
    }

    quitGame() {
        this.gameState = 'menu';
        clearInterval(this.timerInterval);
        this.backToMenu();
    }

    endGame(completed) {
        this.gameState = 'ended';
        this.stats.endTime = Date.now();
        clearInterval(this.timerInterval);
        
        // Calculer les statistiques finales
        const duration = (this.stats.endTime - this.stats.startTime) / 1000;
        const accuracy = this.stats.matches > 0 ? Math.round((this.stats.matches / (this.stats.matches + this.stats.errors)) * 100) : 0;
        const speed = this.stats.matches > 0 ? Math.round(this.stats.matches / duration * 60) : 0; // associations par minute
        
        // Mettre à jour l'écran de fin
        document.getElementById('end-title').textContent = completed ? '🎉 Félicitations !' : '⏰ Temps écoulé !';
        document.getElementById('final-score').textContent = this.stats.score;
        document.getElementById('final-matches').textContent = this.stats.matches;
        document.getElementById('final-accuracy').textContent = accuracy + '%';
        document.getElementById('final-speed').textContent = speed;
        document.getElementById('completed-level').textContent = `${this.currentLevel} - U${this.currentSublevel} (${this.currentDifficulty})`;
        
        // Vérifier s'il y a un niveau suivant
        this.checkNextLevel();
        
        this.showScreen('end-screen');
        
        if (completed) {
            this.playSound('victory');
        }
    }

    checkNextLevel() {
        const nextLevelBtn = document.getElementById('next-level-btn');
        const availableSublevels = this.availableLevels[this.currentLevel] || [];
        const currentIndex = availableSublevels.indexOf(this.currentSublevel);
        
        if (currentIndex >= 0 && currentIndex < availableSublevels.length - 1) {
            nextLevelBtn.style.display = 'block';
        } else {
            nextLevelBtn.style.display = 'none';
        }
    }

    nextLevel() {
        const availableSublevels = this.availableLevels[this.currentLevel] || [];
        const currentIndex = availableSublevels.indexOf(this.currentSublevel);
        
        if (currentIndex >= 0 && currentIndex < availableSublevels.length - 1) {
            this.currentSublevel = availableSublevels[currentIndex + 1];
            this.startGame();
        }
    }

    shareScore() {
        const text = `🎯 Association Lexicale FLE\n` +
                    `Niveau: ${this.currentLevel} - U${this.currentSublevel}\n` +
                    `Score: ${this.stats.score} points\n` +
                    `Associations: ${this.stats.matches}/${this.stats.totalItems}\n` +
                    `Précision: ${Math.round((this.stats.matches / (this.stats.matches + this.stats.errors)) * 100)}%`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Mon score - Association Lexicale FLE',
                text: text
            }).catch(console.error);
        } else {
            // Fallback: copier dans le presse-papiers
            navigator.clipboard.writeText(text).then(() => {
                this.showFeedback('📋', 'Score copié !');
            }).catch(() => {
                alert(text);
            });
        }
    }

    backToMenu() {
        this.gameState = 'menu';
        clearInterval(this.timerInterval);
        this.selectedMedia = null;
        this.selectedText = null;
        
        // Réinitialiser les sélections
        document.querySelectorAll('.level-btn, .sublevel-btn, .difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById('sublevel-selection').style.display = 'none';
        document.getElementById('difficulty-selection').style.display = 'none';
        document.getElementById('start-game-btn').style.display = 'none';
        
        this.showScreen('start-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    showFeedback(icon, message) {
        const popup = document.getElementById('feedback-popup');
        const iconElement = document.getElementById('feedback-icon');
        const messageElement = document.getElementById('feedback-message');
        
        iconElement.textContent = icon;
        messageElement.textContent = message;
        
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 2000);
    }

    playSound(type) {
        if (!this.audioContext) return;
        
        const frequencies = {
            success: [523.25, 659.25, 783.99], // Do, Mi, Sol
            error: [220, 196], // La, Sol
            victory: [523.25, 659.25, 783.99, 1046.5] // Do, Mi, Sol, Do
        };
        
        const freq = frequencies[type] || [440];
        
        freq.forEach((f, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(f, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 150);
        });
    }
}

// Initialiser le jeu
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new AssociationLexicale();
});

// Gestion de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    if (game && game.gameState === 'playing' && document.hidden) {
        game.pauseGame();
    }
}); 