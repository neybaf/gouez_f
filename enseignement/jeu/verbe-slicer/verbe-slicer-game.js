/**
 * Verbe Slicer - Jeu d'action pour apprendre les verbes irréguliers français
 * Version moderne avec effets visuels et statistiques détaillées
 */

class VerbeSlicer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.difficulty = 'normal';
        
        // Données de jeu
        this.verbesData = null;
        this.currentVerbs = [];
        this.fallingWords = [];
        
        // Statistiques de jeu
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.maxLives = 3;
        this.verbsSliced = 0;
        this.totalClicks = 0;
        this.correctClicks = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Paramètres de jeu
        this.gameSpeed = 60; // FPS
        this.spawnRate = 0.02; // Probabilité de spawn par frame
        this.wordSpeed = 1;
        this.maxWords = 8;
        
        // Niveaux et progression
        this.levels = [
            { name: 'Infinitifs', threshold: 0, verbType: 'infinitif', color: '#3498db' },
            { name: 'Participes passés', threshold: 25, verbType: 'participe_passe', color: '#9b59b6' },
            { name: 'Futur', threshold: 50, verbType: 'futur', color: '#e67e22' },
            { name: 'Imparfait', threshold: 75, verbType: 'imparfait', color: '#e74c3c' },
            { name: 'Subjonctif', threshold: 100, verbType: 'subjonctif', color: '#f39c12' }
        ];
        
        // Multiplicateurs de difficulté
        this.difficultySettings = {
            facile: { speedMultiplier: 0.7, spawnMultiplier: 0.8, maxWords: 6 },
            normal: { speedMultiplier: 1.0, spawnMultiplier: 1.0, maxWords: 8 },
            difficile: { speedMultiplier: 1.4, spawnMultiplier: 1.3, maxWords: 10 }
        };
        
        // Effets visuels
        this.particles = [];
        this.floatingTexts = [];
        this.sliceEffects = [];
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.setupAudio();
        await this.loadVerbsData();
        this.setupCanvas();
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
        this.sounds.success = this.createTone(800, 0.1, 'sine');
        // Son d'erreur
        this.sounds.error = this.createTone(200, 0.2, 'sawtooth');
        // Son de niveau
        this.sounds.levelUp = this.createTone(1000, 0.3, 'triangle');
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
    
    async loadVerbsData() {
        try {
            const response = await fetch('jeu-verbes.json');
            this.verbesData = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des verbes:', error);
            // Données de fallback
            this.verbesData = {
                verbesIrreguliers: {
                    infinitif: ['être', 'avoir', 'aller', 'faire', 'venir'],
                    participe_passe: ['été', 'eu', 'allé', 'fait', 'venu'],
                    futur: ['serai', 'aurai', 'irai', 'ferai', 'viendrai'],
                    imparfait: ['étais', 'avais', 'allais', 'faisais', 'venais'],
                    subjonctif: ['sois', 'aie', 'aille', 'fasse', 'vienne']
                },
                motsDivers: ['parler', 'aimer', 'chanter', 'danser', 'jouer']
            };
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Canvas context not available!');
            return;
        }
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Événements de clic
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.handleClick({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Redessiner si le jeu est en cours
        if (this.gameState === 'playing') {
            this.render();
        }
    }
    
    startGame() {
        this.resetGameStats();
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.updateCurrentVerbs();
        this.showScreen('game-screen');
        this.gameLoop();
    }
    
    resetGameStats() {
        this.score = 0;
        this.level = 1;
        this.lives = this.maxLives;
        this.verbsSliced = 0;
        this.totalClicks = 0;
        this.correctClicks = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.fallingWords = [];
        this.particles = [];
        this.floatingTexts = [];
        this.sliceEffects = [];
        
        // Appliquer les paramètres de difficulté
        const settings = this.difficultySettings[this.difficulty];
        this.wordSpeed = 1 * settings.speedMultiplier;
        this.spawnRate = 0.02 * settings.spawnMultiplier;
        this.maxWords = settings.maxWords;
        
        this.updateUI();
    }
    
    updateCurrentVerbs() {
        const currentLevel = this.getCurrentLevel();
        const irregularVerbs = this.verbesData.verbesIrreguliers[currentLevel.verbType] || [];
        const regularWords = this.verbesData.motsDivers || [];
        
        // Mélanger les verbes irréguliers avec des mots réguliers
        this.currentVerbs = [...irregularVerbs, ...regularWords];
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
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.gameTime = Date.now() - this.gameStartTime;
        
        // Vérifier le changement de niveau
        this.checkLevelUp();
        
        // Générer de nouveaux mots
        if (Math.random() < this.spawnRate && this.fallingWords.length < this.maxWords) {
            this.spawnWord();
        }
        
        // Mettre à jour les mots qui tombent
        this.updateFallingWords();
        
        // Mettre à jour les effets visuels
        this.updateParticles();
        this.updateFloatingTexts();
        this.updateSliceEffects();
        
        // Vérifier la fin de jeu
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    checkLevelUp() {
        const newLevel = this.getCurrentLevel();
        if (newLevel !== this.levels[this.level - 1]) {
            this.level = this.levels.indexOf(newLevel) + 1;
            this.updateCurrentVerbs();
            this.showLevelUpEffect();
            this.playSound('levelUp');
        }
    }
    
    spawnWord() {
        const word = this.currentVerbs[Math.floor(Math.random() * this.currentVerbs.length)];
        const currentLevel = this.getCurrentLevel();
        
        this.fallingWords.push({
            text: word,
            x: Math.random() * (this.canvas.width - 200) + 100,
            y: -50,
            speed: this.wordSpeed + Math.random() * 0.5,
            isIrregular: this.isIrregularVerb(word),
            color: currentLevel.color,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            scale: 1,
            opacity: 1
        });
    }
    
    isIrregularVerb(word) {
        return Object.values(this.verbesData.verbesIrreguliers).some(verbs => 
            verbs.includes(word)
        );
    }
    
    updateFallingWords() {
        this.fallingWords.forEach((word, index) => {
            word.y += word.speed;
            word.rotation += word.rotationSpeed;
            
            // Supprimer les mots qui sortent de l'écran
            if (word.y > this.canvas.height + 50) {
                this.fallingWords.splice(index, 1);
                
                // Pénalité si c'était un verbe irrégulier
                if (word.isIrregular) {
                    this.loseLife();
                    this.addFloatingText(word.x, word.y - 50, 'Raté !', 'error');
                }
            }
        });
    }
    
    handleClick(event) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.totalClicks++;
        let hit = false;
        
        this.fallingWords.forEach((word, index) => {
            if (this.isPointInWord(x, y, word)) {
                hit = true;
                this.handleWordClick(word, index);
                return;
            }
        });
        
        if (!hit) {
            // Clic dans le vide
            this.addFloatingText(x, y, 'Raté !', 'error');
        }
    }
    
    isPointInWord(x, y, word) {
        this.ctx.font = '30px Arial';
        const metrics = this.ctx.measureText(word.text);
        const wordWidth = metrics.width;
        const wordHeight = 30;
        
        return x >= word.x - wordWidth/2 && 
               x <= word.x + wordWidth/2 && 
               y >= word.y - wordHeight/2 && 
               y <= word.y + wordHeight/2;
    }
    
    handleWordClick(word, index) {
        this.fallingWords.splice(index, 1);
        
        if (word.isIrregular) {
            // Bon clic sur un verbe irrégulier
            this.score++;
            this.verbsSliced++;
            this.correctClicks++;
            this.currentStreak++;
            this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
            
            this.addFloatingText(word.x, word.y, '+1', 'success');
            this.createParticles(word.x, word.y, word.color);
            this.createSliceEffect(word.x, word.y);
            this.playSound('success');
            
            // Bonus pour les séries
            if (this.currentStreak > 0 && this.currentStreak % 5 === 0) {
                const bonus = Math.floor(this.currentStreak / 5);
                this.score += bonus;
                this.addFloatingText(word.x, word.y - 30, `Série +${bonus}!`, 'bonus');
            }
        } else {
            // Mauvais clic sur un mot régulier
            this.currentStreak = 0;
            this.loseLife();
            this.addFloatingText(word.x, word.y, 'Erreur !', 'error');
            this.playSound('error');
        }
        
        this.updateUI();
    }
    
    loseLife() {
        this.lives--;
        this.updateLivesDisplay();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                color: color,
                life: 1,
                decay: 0.02,
                size: Math.random() * 6 + 2
            });
        }
    }
    
    createSliceEffect(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const length = 100;
        
        this.sliceEffects.push({
            x1: x - Math.cos(angle) * length / 2,
            y1: y - Math.sin(angle) * length / 2,
            x2: x + Math.cos(angle) * length / 2,
            y2: y + Math.sin(angle) * length / 2,
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
            decay: 0.015,
            vy: -2
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravité
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateFloatingTexts() {
        this.floatingTexts.forEach((text, index) => {
            text.y += text.vy;
            text.life -= text.decay;
            
            if (text.life <= 0) {
                this.floatingTexts.splice(index, 1);
            }
        });
    }
    
    updateSliceEffects() {
        this.sliceEffects.forEach((effect, index) => {
            effect.life -= effect.decay;
            
            if (effect.life <= 0) {
                this.sliceEffects.splice(index, 1);
            }
        });
    }
    
    render() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les mots qui tombent
        this.renderFallingWords();
        
        // Dessiner les effets visuels
        this.renderSliceEffects();
        this.renderParticles();
        this.renderFloatingTexts();
    }
    
    renderFallingWords() {
        this.fallingWords.forEach(word => {
            this.ctx.save();
            this.ctx.translate(word.x, word.y);
            this.ctx.rotate(word.rotation);
            this.ctx.scale(word.scale, word.scale);
            this.ctx.globalAlpha = word.opacity;
            
            // Ombre
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.font = 'bold 30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(word.text, 2, 2);
            
            // Texte principal
            this.ctx.fillStyle = word.isIrregular ? word.color : '#666';
            this.ctx.fillText(word.text, 0, 0);
            
            // Bordure pour les verbes irréguliers
            if (word.isIrregular) {
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.strokeText(word.text, 0, 0);
            }
            
            this.ctx.restore();
        });
    }
    
    renderSliceEffects() {
        this.sliceEffects.forEach(effect => {
            this.ctx.save();
            this.ctx.globalAlpha = effect.life;
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = 'white';
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(effect.x1, effect.y1);
            this.ctx.lineTo(effect.x2, effect.y2);
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
            this.ctx.font = 'bold 24px Arial';
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
            
            // Ombre
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(text.text, text.x, text.y);
            
            // Texte
            this.ctx.fillText(text.text, text.x, text.y);
            
            this.ctx.restore();
        });
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('level-name').textContent = this.getCurrentLevel().name;
        
        this.updateProgressBar();
        this.updateLivesDisplay();
    }
    
    updateProgressBar() {
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.levels[this.level] || this.levels[this.levels.length - 1];
        
        const progress = Math.min(100, ((this.score - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100);
        
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = 
            `${this.score - currentLevel.threshold} / ${nextLevel.threshold - currentLevel.threshold}`;
    }
    
    updateLivesDisplay() {
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < this.lives) {
                heart.classList.remove('lost');
            } else {
                heart.classList.add('lost');
            }
        });
    }
    
    showLevelUpEffect() {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.innerHTML = `
            <div>🎉 NIVEAU ${this.level} 🎉</div>
            <div style="font-size: 1.2rem; margin-top: 0.5rem;">${this.getCurrentLevel().name}</div>
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            document.body.removeChild(effect);
        }, 2000);
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.updatePauseStats();
            this.showScreen('pause-screen');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('game-screen');
            this.gameLoop();
        }
    }
    
    updatePauseStats() {
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-level').textContent = this.level;
        document.getElementById('pause-accuracy').textContent = 
            this.totalClicks > 0 ? Math.round((this.correctClicks / this.totalClicks) * 100) + '%' : '100%';
    }
    
    restartGame() {
        this.startGame();
    }
    
    quitToMenu() {
        this.gameState = 'menu';
        this.showScreen('start-screen');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.updateFinalStats();
        this.showScreen('game-over-screen');
    }
    
    updateFinalStats() {
        const accuracy = this.totalClicks > 0 ? Math.round((this.correctClicks / this.totalClicks) * 100) : 100;
        const gameTimeSeconds = Math.floor(this.gameTime / 1000);
        const minutes = Math.floor(gameTimeSeconds / 60);
        const seconds = gameTimeSeconds % 60;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-accuracy').textContent = accuracy + '%';
        document.getElementById('verbs-sliced').textContent = this.verbsSliced;
        document.getElementById('game-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('best-streak').textContent = this.bestStreak;
        
        // Message de performance
        const performanceMessage = this.getPerformanceMessage(accuracy, this.score);
        document.getElementById('performance-message').textContent = performanceMessage;
        
        // Titre selon la performance
        const title = this.score >= 100 ? '🏆 Maître des verbes !' : 
                     this.score >= 50 ? '🎯 Excellent travail !' : 
                     '💪 Continue tes efforts !';
        document.getElementById('game-over-title').textContent = title;
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
        const text = `J'ai obtenu ${this.score} points au Verbe Slicer ! Niveau ${this.level} atteint avec ${Math.round((this.correctClicks / this.totalClicks) * 100)}% de précision. 🎯⚔️`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Verbe Slicer - Mon Score',
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
    new VerbeSlicer();
}); 