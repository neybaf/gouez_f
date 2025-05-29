// Verbe Slicer - Script Legacy
// Version simplifiée du jeu original

class VerbeSlicer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'stopped'; // stopped, running, paused
        
        // Statistiques
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // Mots qui tombent
        this.fallingWords = [];
        this.spawnRate = 0.02;
        this.wordSpeed = 2;
        
        // Données des verbes (version simplifiée)
        this.verbesIrreguliers = [
            'être', 'avoir', 'aller', 'faire', 'venir', 'prendre', 'mettre', 
            'voir', 'savoir', 'vouloir', 'pouvoir', 'devoir', 'falloir',
            'été', 'eu', 'allé', 'fait', 'venu', 'pris', 'mis', 'vu', 'su', 'voulu', 'pu', 'dû'
        ];
        
        this.motsDivers = [
            'parler', 'aimer', 'chanter', 'danser', 'jouer', 'regarder', 'écouter',
            'travailler', 'manger', 'habiter', 'étudier', 'marcher', 'penser'
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.render();
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    startGame() {
        this.gameState = 'running';
        this.gameLoop();
    }
    
    togglePause() {
        if (this.gameState === 'running') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.fallingWords = [];
        this.updateUI();
        this.gameState = 'stopped';
        this.render();
    }
    
    gameLoop() {
        if (this.gameState !== 'running') return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Générer nouveaux mots
        if (Math.random() < this.spawnRate) {
            this.spawnWord();
        }
        
        // Mettre à jour les mots qui tombent
        this.updateFallingWords();
        
        // Vérifier fin de jeu
        if (this.lives <= 0) {
            this.gameOver();
        }
        
        // Augmenter la difficulté
        this.level = Math.floor(this.score / 10) + 1;
        this.spawnRate = Math.min(0.05, 0.02 + (this.level - 1) * 0.005);
        this.wordSpeed = Math.min(4, 2 + (this.level - 1) * 0.2);
    }
    
    spawnWord() {
        const allWords = [...this.verbesIrreguliers, ...this.motsDivers];
        const word = allWords[Math.floor(Math.random() * allWords.length)];
        const isIrregular = this.verbesIrreguliers.includes(word);
        
        this.fallingWords.push({
            text: word,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: -30,
            speed: this.wordSpeed + Math.random() * 1,
            isIrregular: isIrregular
        });
    }
    
    updateFallingWords() {
        this.fallingWords.forEach((word, index) => {
            word.y += word.speed;
            
            // Supprimer les mots qui sortent de l'écran
            if (word.y > this.canvas.height + 30) {
                this.fallingWords.splice(index, 1);
                
                // Pénalité si c'était un verbe irrégulier
                if (word.isIrregular) {
                    this.lives--;
                    this.showFeedback(word.x, word.y, 'Raté!', 'error');
                }
            }
        });
    }
    
    handleClick(event) {
        if (this.gameState !== 'running') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.fallingWords.forEach((word, index) => {
            if (this.isPointInWord(x, y, word)) {
                this.fallingWords.splice(index, 1);
                
                if (word.isIrregular) {
                    // Bon clic
                    this.score++;
                    this.showFeedback(word.x, word.y, '+1', 'success');
                } else {
                    // Mauvais clic
                    this.lives--;
                    this.showFeedback(word.x, word.y, 'Erreur!', 'error');
                }
                
                this.updateUI();
                return;
            }
        });
    }
    
    isPointInWord(x, y, word) {
        this.ctx.font = '20px Arial';
        const metrics = this.ctx.measureText(word.text);
        const wordWidth = metrics.width;
        const wordHeight = 20;
        
        return x >= word.x - wordWidth/2 && 
               x <= word.x + wordWidth/2 && 
               y >= word.y - wordHeight/2 && 
               y <= word.y + wordHeight/2;
    }
    
    showFeedback(x, y, text, type) {
        // Animation simple de feedback (version basique)
        const feedbackElement = document.createElement('div');
        feedbackElement.textContent = text;
        feedbackElement.className = `feedback ${type}`;
        feedbackElement.style.left = x + 'px';
        feedbackElement.style.top = y + 'px';
        
        document.body.appendChild(feedbackElement);
        
        setTimeout(() => {
            if (feedbackElement.parentNode) {
                feedbackElement.parentNode.removeChild(feedbackElement);
            }
        }, 1000);
    }
    
    render() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les mots qui tombent
        this.fallingWords.forEach(word => {
            this.ctx.save();
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            
            if (word.isIrregular) {
                this.ctx.fillStyle = '#00b894';
                this.ctx.shadowColor = '#00b894';
                this.ctx.shadowBlur = 5;
            } else {
                this.ctx.fillStyle = '#636e72';
            }
            
            this.ctx.fillText(word.text, word.x, word.y);
            this.ctx.restore();
        });
        
        // Dessiner l'état du jeu
        if (this.gameState === 'paused') {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSE', this.canvas.width/2, this.canvas.height/2);
            this.ctx.restore();
        }
        
        if (this.gameState === 'stopped' && this.lives <= 0) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 30);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Score final: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 10);
            this.ctx.restore();
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.lives;
    }
    
    gameOver() {
        this.gameState = 'stopped';
        alert(`Game Over! Score final: ${this.score}`);
    }
}

// Initialiser le jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new VerbeSlicer();
}); 