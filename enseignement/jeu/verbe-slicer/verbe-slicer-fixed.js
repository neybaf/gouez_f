/**
 * Verbe Slicer - Version corrigée avec debug amélioré
 */

class VerbeSlicer {
    constructor() {
        console.log('🎮 Initialisation de VerbeSlicer...');
        
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu';
        this.difficulty = 'normal';
        
        // Données de jeu
        this.verbesData = null;
        this.currentVerbs = [];
        this.fallingWords = [];
        
        // Statistiques
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.verbsSliced = 0;
        this.totalClicks = 0;
        this.correctClicks = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Paramètres de jeu
        this.spawnRate = 0.02;
        this.wordSpeed = 1;
        this.maxWords = 8;
        
        // Niveaux
        this.levels = [
            { name: 'Infinitifs', threshold: 0, verbType: 'infinitif', color: '#3498db' },
            { name: 'Participes passés', threshold: 25, verbType: 'participe_passe', color: '#9b59b6' },
            { name: 'Futur', threshold: 50, verbType: 'futur', color: '#e67e22' },
            { name: 'Imparfait', threshold: 75, verbType: 'imparfait', color: '#e74c3c' },
            { name: 'Subjonctif', threshold: 100, verbType: 'subjonctif', color: '#f39c12' }
        ];
        
        // Effets visuels
        this.particles = [];
        this.floatingTexts = [];
        this.sliceEffects = [];
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        
        // Debug
        this.debug = true;
        this.animationId = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('📡 Chargement des composants...');
            
            // Attendre que le DOM soit prêt
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            this.setupEventListeners();
            this.setupAudio();
            await this.loadVerbsData();
            this.setupCanvas();
            this.showScreen('start-screen');
            
            console.log('✅ Verbe Slicer initialisé avec succès !');
        } catch (error) {
            console.error('❌ Erreur d\'initialisation:', error);
            this.showError('Erreur d\'initialisation: ' + error.message);
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>🚨 Erreur</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Recharger</button>
        `;
        document.body.appendChild(errorDiv);
    }
    
    setupEventListeners() {
        console.log('🔗 Configuration des événements...');
        
        try {
            // Boutons de démarrage
            const startBtn = document.getElementById('start-game-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startGame());
            } else {
                console.warn('Bouton start-game-btn non trouvé');
            }
            
            // Sélection de difficulté
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                    e.target.closest('.difficulty-btn').classList.add('active');
                    this.difficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
                    console.log('Difficulté sélectionnée:', this.difficulty);
                });
            });
            
            // Boutons de pause et contrôle
            const pauseBtn = document.getElementById('pause-btn');
            if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
            
            const resumeBtn = document.getElementById('resume-btn');
            if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());
            
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());
            
            const quitBtn = document.getElementById('quit-btn');
            if (quitBtn) quitBtn.addEventListener('click', () => this.quitToMenu());
            
            // Boutons de fin de jeu
            const playAgainBtn = document.getElementById('play-again-btn');
            if (playAgainBtn) playAgainBtn.addEventListener('click', () => this.startGame());
            
            const backToMenuBtn = document.getElementById('back-to-menu-btn');
            if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => this.quitToMenu());
            
            const shareBtn = document.getElementById('share-score-btn');
            if (shareBtn) shareBtn.addEventListener('click', () => this.shareScore());
            
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
                }
            });
            
            console.log('✅ Événements configurés');
        } catch (error) {
            console.error('❌ Erreur de configuration des événements:', error);
        }
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
            console.log('🔊 Audio initialisé');
        } catch (error) {
            console.warn('⚠️ Audio non disponible:', error);
        }
    }
    
    generateSounds() {
        try {
            this.sounds.success = this.createTone(800, 0.1, 'sine');
            this.sounds.error = this.createTone(200, 0.2, 'sawtooth');
            this.sounds.levelUp = this.createTone(1000, 0.3, 'triangle');
        } catch (error) {
            console.warn('⚠️ Erreur génération sons:', error);
        }
    }
    
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext) return;
            
            try {
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
            } catch (error) {
                console.warn('Erreur audio:', error);
            }
        };
    }
    
    async loadVerbsData() {
        console.log('📚 Chargement des données de verbes...');
        
        try {
            const response = await fetch('jeu-verbes.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.verbesData = await response.json();
            
            // Vérification de la structure
            if (!this.verbesData.verbesIrreguliers || !this.verbesData.motsDivers) {
                throw new Error('Structure JSON invalide');
            }
            
            const totalIrregular = Object.values(this.verbesData.verbesIrreguliers).flat().length;
            const totalRegular = this.verbesData.motsDivers.length;
            
            console.log(`✅ Données chargées: ${totalIrregular} verbes irréguliers, ${totalRegular} mots réguliers`);
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement JSON, utilisation des données de fallback:', error);
            
            // Données de fallback simplifiées
            this.verbesData = {
                verbesIrreguliers: {
                    infinitif: ['être', 'avoir', 'aller', 'faire', 'venir', 'prendre', 'voir', 'savoir'],
                    participe_passe: ['été', 'eu', 'allé', 'fait', 'venu', 'pris', 'vu', 'su'],
                    futur: ['serai', 'aurai', 'irai', 'ferai', 'viendrai', 'prendrai', 'verrai', 'saurai'],
                    imparfait: ['étais', 'avais', 'allais', 'faisais', 'venais', 'prenais', 'voyais', 'savais'],
                    subjonctif: ['sois', 'aie', 'aille', 'fasse', 'vienne', 'prenne', 'voie', 'sache']
                },
                motsDivers: ['parler', 'aimer', 'chanter', 'danser', 'jouer', 'regarder', 'écouter', 'travailler', 'manger', 'habiter']
            };
            
            console.log('✅ Données de fallback utilisées');
        }
    }
    
    setupCanvas() {
        console.log('🖼️ Configuration du canvas...');
        
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Élément canvas (game-canvas) non trouvé dans le DOM');
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Impossible d\'obtenir le contexte 2D du canvas');
        }
        
        // Configuration initiale
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Événements de clic
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Support tactile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const clickEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.handleClick(clickEvent);
        });
        
        // Test de dessin
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#333';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Canvas prêt !', this.canvas.width / 2, this.canvas.height / 2);
        
        console.log(`✅ Canvas configuré: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width || 800;
        this.canvas.height = rect.height || 600;
        
        // Sur mobile, utiliser la taille de la fenêtre
        if (window.innerWidth <= 768) {
            this.canvas.width = Math.min(window.innerWidth - 40, 800);
            this.canvas.height = Math.min(window.innerHeight - 200, 600);
        }
        
        if (this.debug) {
            console.log(`📐 Canvas redimensionné: ${this.canvas.width}x${this.canvas.height}`);
        }
    }
    
    startGame() {
        console.log('🚀 Démarrage du jeu...');
        
        try {
            this.gameState = 'playing';
            this.resetGameStats();
            this.updateCurrentVerbs();
            this.showScreen('game-screen');
            this.gameLoop();
            
            console.log('✅ Jeu démarré avec succès !');
        } catch (error) {
            console.error('❌ Erreur de démarrage:', error);
            this.showError('Impossible de démarrer le jeu: ' + error.message);
        }
    }
    
    resetGameStats() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.verbsSliced = 0;
        this.totalClicks = 0;
        this.correctClicks = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        
        this.fallingWords = [];
        this.particles = [];
        this.floatingTexts = [];
        this.sliceEffects = [];
        
        // Réinitialisation des paramètres selon la difficulté
        const settings = {
            facile: { speedMultiplier: 0.7, spawnMultiplier: 0.8, maxWords: 6 },
            normal: { speedMultiplier: 1.0, spawnMultiplier: 1.0, maxWords: 8 },
            difficile: { speedMultiplier: 1.4, spawnMultiplier: 1.3, maxWords: 10 }
        };
        
        const current = settings[this.difficulty] || settings.normal;
        this.wordSpeed = 1 * current.speedMultiplier;
        this.spawnRate = 0.02 * current.spawnMultiplier;
        this.maxWords = current.maxWords;
        
        console.log(`🎯 Jeu réinitialisé - Difficulté: ${this.difficulty}`);
    }
    
    updateCurrentVerbs() {
        const currentLevel = this.getCurrentLevel();
        if (this.verbesData && this.verbesData.verbesIrreguliers[currentLevel.verbType]) {
            this.currentVerbs = this.verbesData.verbesIrreguliers[currentLevel.verbType];
        } else {
            this.currentVerbs = ['être', 'avoir', 'aller']; // Fallback minimal
        }
        
        if (this.debug) {
            console.log(`📝 Verbes du niveau ${this.level} (${currentLevel.name}):`, this.currentVerbs.slice(0, 5), '...');
        }
    }
    
    getCurrentLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.score >= this.levels[i].threshold) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        try {
            this.update();
            this.render();
            this.updateUI();
            
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('❌ Erreur dans la boucle de jeu:', error);
            this.gameState = 'paused';
            this.showError('Erreur de jeu: ' + error.message);
        }
    }
    
    update() {
        this.gameTime = Date.now() - this.gameStartTime;
        
        // Spawning de nouveaux mots
        if (Math.random() < this.spawnRate && this.fallingWords.length < this.maxWords) {
            this.spawnWord();
        }
        
        // Mise à jour des mots qui tombent
        this.updateFallingWords();
        
        // Vérification du level up
        this.checkLevelUp();
        
        // Mise à jour des effets visuels
        this.updateParticles();
        this.updateFloatingTexts();
        this.updateSliceEffects();
    }
    
    checkLevelUp() {
        const newLevel = this.getCurrentLevel();
        if (newLevel !== this.levels[this.level - 1]) {
            this.level = this.levels.indexOf(newLevel) + 1;
            this.updateCurrentVerbs();
            this.showLevelUpEffect();
            this.playSound('levelUp');
            
            console.log(`🎉 Niveau ${this.level} atteint: ${newLevel.name}`);
        }
    }
    
    spawnWord() {
        // Mélange entre verbes irréguliers et mots réguliers
        const isIrregular = Math.random() < 0.4; // 40% de chance d'avoir un verbe irrégulier
        let word;
        
        if (isIrregular && this.currentVerbs.length > 0) {
            word = this.currentVerbs[Math.floor(Math.random() * this.currentVerbs.length)];
        } else if (this.verbesData.motsDivers.length > 0) {
            word = this.verbesData.motsDivers[Math.floor(Math.random() * this.verbesData.motsDivers.length)];
        } else {
            word = 'test'; // Fallback
        }
        
        this.fallingWords.push({
            text: word,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -50,
            speed: this.wordSpeed + Math.random() * 0.5,
            isIrregular: this.isIrregularVerb(word),
            color: this.isIrregularVerb(word) ? '#e74c3c' : '#34495e'
        });
    }
    
    isIrregularVerb(word) {
        if (!this.verbesData || !this.verbesData.verbesIrreguliers) return false;
        
        return Object.values(this.verbesData.verbesIrreguliers).some(verbs => 
            verbs.includes(word.toLowerCase())
        );
    }
    
    updateFallingWords() {
        this.fallingWords = this.fallingWords.filter(word => {
            word.y += word.speed;
            
            // Retirer les mots qui sortent de l'écran
            if (word.y > this.canvas.height + 50) {
                if (word.isIrregular) {
                    this.loseLife();
                }
                return false;
            }
            
            return true;
        });
    }
    
    handleClick(event) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Vérifier si on a cliqué sur un mot
        for (let i = this.fallingWords.length - 1; i >= 0; i--) {
            const word = this.fallingWords[i];
            if (this.isPointInWord(x, y, word)) {
                this.handleWordClick(word, i);
                return;
            }
        }
        
        // Clic dans le vide
        this.totalClicks++;
        this.currentStreak = 0;
    }
    
    isPointInWord(x, y, word) {
        this.ctx.font = '24px Arial';
        const metrics = this.ctx.measureText(word.text);
        const wordWidth = metrics.width;
        const wordHeight = 24;
        
        return x >= word.x - wordWidth/2 && 
               x <= word.x + wordWidth/2 && 
               y >= word.y - wordHeight/2 && 
               y <= word.y + wordHeight/2;
    }
    
    handleWordClick(word, index) {
        this.totalClicks++;
        this.fallingWords.splice(index, 1);
        
        if (word.isIrregular) {
            // Bon clic
            this.score++;
            this.verbsSliced++;
            this.correctClicks++;
            this.currentStreak++;
            this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
            
            this.createParticles(word.x, word.y, '#27ae60');
            this.createSliceEffect(word.x, word.y);
            this.addFloatingText(word.x, word.y, '+1', 'success');
            
            // Bonus de série
            if (this.currentStreak % 5 === 0) {
                this.score++;
                this.addFloatingText(word.x, word.y - 30, 'SÉRIE!', 'bonus');
            }
            
            this.playSound('success');
        } else {
            // Mauvais clic
            this.currentStreak = 0;
            this.loseLife();
            this.createParticles(word.x, word.y, '#e74c3c');
            this.addFloatingText(word.x, word.y, 'ERREUR', 'error');
            this.playSound('error');
        }
    }
    
    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                decay: 0.02,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    createSliceEffect(x, y) {
        this.sliceEffects.push({
            x: x,
            y: y,
            life: 1,
            decay: 0.05
        });
    }
    
    addFloatingText(x, y, text, type) {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            type: type,
            life: 1,
            decay: 0.02
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            return particle.life > 0;
        });
    }
    
    updateFloatingTexts() {
        this.floatingTexts = this.floatingTexts.filter(text => {
            text.y -= 2;
            text.life -= text.decay;
            return text.life > 0;
        });
    }
    
    updateSliceEffects() {
        this.sliceEffects = this.sliceEffects.filter(effect => {
            effect.life -= effect.decay;
            return effect.life > 0;
        });
    }
    
    render() {
        // Effacer le canvas
        this.ctx.fillStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rendu des éléments de jeu
        this.renderFallingWords();
        this.renderSliceEffects();
        this.renderParticles();
        this.renderFloatingTexts();
        
        // Debug info
        if (this.debug) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Mots: ${this.fallingWords.length}/${this.maxWords}`, 10, 30);
            this.ctx.fillText(`Particules: ${this.particles.length}`, 10, 50);
            this.ctx.fillText(`FPS: ${Math.round(60)}`, 10, 70);
        }
    }
    
    renderFallingWords() {
        this.fallingWords.forEach(word => {
            this.ctx.save();
            
            // Style du texte
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = word.color;
            
            // Ombre
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(word.text, word.x, word.y);
            
            // Texte principal
            this.ctx.fillText(word.text, word.x, word.y);
            
            // Indicateur visuel pour les verbes irréguliers
            if (word.isIrregular) {
                this.ctx.strokeStyle = '#f39c12';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                
                const metrics = this.ctx.measureText(word.text);
                this.ctx.strokeRect(
                    word.x - metrics.width/2 - 5,
                    word.y - 15,
                    metrics.width + 10,
                    25
                );
                
                this.ctx.setLineDash([]);
            }
            
            this.ctx.restore();
        });
    }
    
    renderSliceEffects() {
        this.sliceEffects.forEach(effect => {
            this.ctx.save();
            this.ctx.globalAlpha = effect.life;
            this.ctx.strokeStyle = '#f39c12';
            this.ctx.lineWidth = 3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(effect.x - 30, effect.y - 20);
            this.ctx.lineTo(effect.x + 30, effect.y + 20);
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    renderFloatingTexts() {
        this.floatingTexts.forEach(text => {
            this.ctx.save();
            this.ctx.globalAlpha = text.life;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            
            // Couleur selon le type
            switch(text.type) {
                case 'success':
                    this.ctx.fillStyle = '#27ae60';
                    break;
                case 'error':
                    this.ctx.fillStyle = '#e74c3c';
                    break;
                case 'bonus':
                    this.ctx.fillStyle = '#f39c12';
                    break;
                default:
                    this.ctx.fillStyle = 'white';
            }
            
            this.ctx.fillText(text.text, text.x, text.y);
            this.ctx.restore();
        });
    }
    
    updateUI() {
        try {
            const scoreEl = document.getElementById('score');
            if (scoreEl) scoreEl.textContent = this.score;
            
            const levelEl = document.getElementById('level');
            if (levelEl) levelEl.textContent = this.level;
            
            const levelNameEl = document.getElementById('level-name');
            if (levelNameEl) levelNameEl.textContent = this.getCurrentLevel().name;
            
            this.updateProgressBar();
            this.updateLivesDisplay();
        } catch (error) {
            console.warn('Erreur mise à jour UI:', error);
        }
    }
    
    updateProgressBar() {
        try {
            const currentLevel = this.getCurrentLevel();
            const nextLevel = this.levels[this.level] || this.levels[this.levels.length - 1];
            
            const progress = Math.min(100, ((this.score - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100);
            
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) progressFill.style.width = progress + '%';
            
            const progressText = document.getElementById('progress-text');
            if (progressText) {
                progressText.textContent = `${this.score - currentLevel.threshold} / ${nextLevel.threshold - currentLevel.threshold}`;
            }
        } catch (error) {
            console.warn('Erreur barre de progression:', error);
        }
    }
    
    updateLivesDisplay() {
        try {
            const hearts = document.querySelectorAll('.heart');
            hearts.forEach((heart, index) => {
                if (index < this.lives) {
                    heart.classList.remove('lost');
                } else {
                    heart.classList.add('lost');
                }
            });
        } catch (error) {
            console.warn('Erreur affichage vies:', error);
        }
    }
    
    showLevelUpEffect() {
        try {
            const effect = document.createElement('div');
            effect.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                padding: 20px 40px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                z-index: 1000;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                animation: levelUpAnimation 2s ease-out forwards;
            `;
            
            effect.innerHTML = `
                <div>🎉 NIVEAU ${this.level} 🎉</div>
                <div style="font-size: 18px; margin-top: 10px;">${this.getCurrentLevel().name}</div>
            `;
            
            // Ajouter l'animation CSS
            if (!document.getElementById('levelUpKeyframes')) {
                const style = document.createElement('style');
                style.id = 'levelUpKeyframes';
                style.textContent = `
                    @keyframes levelUpAnimation {
                        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(effect);
            
            setTimeout(() => {
                if (effect.parentNode) {
                    document.body.removeChild(effect);
                }
            }, 2000);
        } catch (error) {
            console.warn('Erreur effet level up:', error);
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.updatePauseStats();
            this.showScreen('pause-screen');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('game-screen');
            this.gameLoop();
        }
    }
    
    updatePauseStats() {
        try {
            const pauseScore = document.getElementById('pause-score');
            if (pauseScore) pauseScore.textContent = this.score;
            
            const pauseLevel = document.getElementById('pause-level');
            if (pauseLevel) pauseLevel.textContent = this.level;
            
            const pauseAccuracy = document.getElementById('pause-accuracy');
            if (pauseAccuracy) {
                const accuracy = this.totalClicks > 0 ? Math.round((this.correctClicks / this.totalClicks) * 100) : 100;
                pauseAccuracy.textContent = accuracy + '%';
            }
        } catch (error) {
            console.warn('Erreur stats pause:', error);
        }
    }
    
    restartGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.startGame();
    }
    
    quitToMenu() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameState = 'menu';
        this.showScreen('start-screen');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.updateFinalStats();
        this.showScreen('game-over-screen');
        
        console.log('🎯 Partie terminée - Score:', this.score);
    }
    
    updateFinalStats() {
        try {
            const accuracy = this.totalClicks > 0 ? Math.round((this.correctClicks / this.totalClicks) * 100) : 100;
            const gameTimeSeconds = Math.floor(this.gameTime / 1000);
            const minutes = Math.floor(gameTimeSeconds / 60);
            const seconds = gameTimeSeconds % 60;
            
            const finalScore = document.getElementById('final-score');
            if (finalScore) finalScore.textContent = this.score;
            
            const finalLevel = document.getElementById('final-level');
            if (finalLevel) finalLevel.textContent = this.level;
            
            const finalAccuracy = document.getElementById('final-accuracy');
            if (finalAccuracy) finalAccuracy.textContent = accuracy + '%';
            
            const verbsSliced = document.getElementById('verbs-sliced');
            if (verbsSliced) verbsSliced.textContent = this.verbsSliced;
            
            const gameTime = document.getElementById('game-time');
            if (gameTime) gameTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const bestStreak = document.getElementById('best-streak');
            if (bestStreak) bestStreak.textContent = this.bestStreak;
            
            // Message de performance
            const performanceMessage = this.getPerformanceMessage(accuracy, this.score);
            const messageEl = document.getElementById('performance-message');
            if (messageEl) messageEl.textContent = performanceMessage;
            
            // Titre selon la performance
            const title = this.score >= 100 ? '🏆 Maître des verbes !' : 
                         this.score >= 50 ? '🎯 Excellent travail !' : 
                         '💪 Continue tes efforts !';
            const titleEl = document.getElementById('game-over-title');
            if (titleEl) titleEl.textContent = title;
        } catch (error) {
            console.warn('Erreur stats finales:', error);
        }
    }
    
    getPerformanceMessage(accuracy, score) {
        if (accuracy >= 90 && score >= 100) {
            return "Incroyable ! Tu maîtrises parfaitement les verbes irréguliers !";
        } else if (accuracy >= 80 && score >= 50) {
            return "Très bien ! Tu progresses rapidement dans l'apprentissage des verbes.";
        } else if (accuracy >= 70) {
            return "Bon travail ! Continue à t'entraîner pour améliorer ta précision.";
        } else {
            return "N'abandonne pas ! Chaque partie t'aide à mieux mémoriser les verbes.";
        }
    }
    
    shareScore() {
        try {
            const accuracy = this.totalClicks > 0 ? Math.round((this.correctClicks / this.totalClicks) * 100) : 100;
            const text = `J'ai obtenu ${this.score} points au Verbe Slicer ! Niveau ${this.level} atteint avec ${accuracy}% de précision. 🎯⚔️`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Verbe Slicer - Mon Score',
                    text: text,
                    url: window.location.href
                });
            } else {
                // Fallback : copier dans le presse-papiers
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('Score copié dans le presse-papiers !');
                    }).catch(() => {
                        alert(`Mon score : ${text}`);
                    });
                } else {
                    alert(`Mon score : ${text}`);
                }
            }
        } catch (error) {
            console.warn('Erreur partage:', error);
        }
    }
    
    showScreen(screenId) {
        try {
            document.querySelectorAll('.game-screen').forEach(screen => {
                screen.classList.remove('active');
            });
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
            } else {
                console.warn(`Écran ${screenId} non trouvé`);
            }
        } catch (error) {
            console.warn('Erreur changement d\'écran:', error);
        }
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

// Initialisation sécurisée
console.log('🎮 Chargement de Verbe Slicer...');

// Fonction d'initialisation globale
function initVerbeSlicer() {
    try {
        window.verbeSlicer = new VerbeSlicer();
        console.log('✅ Verbe Slicer initialisé globalement');
    } catch (error) {
        console.error('❌ Erreur d\'initialisation globale:', error);
        
        // Affichage d'erreur utilisateur
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3>🚨 Impossible de charger le jeu</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #f44336;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Recharger la page</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialisation selon l'état du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVerbeSlicer);
} else {
    initVerbeSlicer();
} 