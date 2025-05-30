/**
 * Verbe Slicer - Jeu d'action pour apprendre les verbes irréguliers français
 * Version moderne avec effets visuels et statistiques détaillées
 */

class VerbeSlicer {
    constructor() {
        console.log('🎮 Initialisation de Verbe Slicer...');
        
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.difficulty = 'normal';
        
        // Données de jeu
        this.verbesData = null;
        this.currentVerbs = [];
        this.fallingWords = [];
        this.isDataLoaded = false; // Flag pour vérifier si les données sont chargées
        
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
        
        // Paramètres de jeu avec timestamps pour debugging
        this.gameSpeed = 60; // FPS
        this.spawnRate = 0.03; // Augmenté pour plus d'action
        this.wordSpeed = 1;
        this.maxWords = 8;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // Spawn toutes les 1 seconde
        
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
        try {
            console.log('📡 Configuration des événements...');
            this.setupEventListeners();
            
            console.log('🔊 Configuration audio...');
            this.setupAudio();
            
            console.log('📊 Chargement des données...');
            await this.loadVerbsData();
            
            // CORRECTION CRITIQUE : Initialiser les verbes immédiatement après le chargement des données
            if (this.isDataLoaded) {
                console.log('🎲 Initialisation immédiate des verbes...');
                this.initializeCurrentVerbs();
                console.log('✅ Verbes initialisés:', this.currentVerbs ? this.currentVerbs.length : 0, 'mots disponibles');
            }
            
            console.log('🎨 Configuration du canvas...');
            this.setupCanvas();
            
            console.log('🖥️ Initialisation des écrans...');
            this.initializeScreens();
            
            console.log('🚀 Affichage de l\'écran de démarrage...');
            this.showScreen('start-screen');
            
            console.log('✅ Verbe Slicer initialisé avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            alert('Erreur lors du chargement du jeu. Vérifiez la console pour plus de détails.');
        }
    }
    
    initializeScreens() {
        console.log('🔧 Initialisation des écrans de jeu...');
        
        // S'assurer que tous les écrans sont masqués au départ
        const screens = document.querySelectorAll('.game-screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            // Réinitialiser les styles inline
            screen.style.display = '';
            console.log(`🚫 Écran ${screen.id} masqué et réinitialisé`);
        });
        
        // Afficher explicitement l'écran de démarrage
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.add('active');
            console.log('✅ Écran de démarrage activé');
        } else {
            console.warn('⚠️ Écran de démarrage non trouvé');
        }
        
        console.log('✅ Initialisation des écrans terminée');
    }
    
    setupEventListeners() {
        try {
            // Boutons de démarrage - rendre optionnel pour les tests
            const startBtn = document.getElementById('start-game-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startGame());
                console.log('✅ Bouton de démarrage configuré');
            } else {
                console.warn('⚠️ Bouton de démarrage non trouvé - Mode test détecté');
            }
            
            // Bouton de test avec données fallback
            const testBtn = document.getElementById('test-fallback-btn');
            if (testBtn) {
                testBtn.addEventListener('click', () => {
                    console.log('🧪 Mode test activé - Utilisation des données intégrées');
                    this.useEmbeddedData();
                    this.startGame();
                });
                console.log('✅ Bouton de test configuré');
            }
            
            // Sélection de difficulté - rendre optionnel
            const difficultyBtns = document.querySelectorAll('.difficulty-btn');
            if (difficultyBtns.length > 0) {
                difficultyBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                        e.target.closest('.difficulty-btn').classList.add('active');
                        this.difficulty = e.target.closest('.difficulty-btn').dataset.difficulty;
                        console.log('🎚️ Difficulté sélectionnée:', this.difficulty);
                    });
                });
                console.log('✅ Boutons de difficulté configurés');
            } else {
                console.warn('⚠️ Boutons de difficulté non trouvés - Mode test détecté');
            }
            
            // Boutons de pause - rendre optionnels
            const pauseBtn = document.getElementById('pause-btn');
            const resumeBtn = document.getElementById('resume-btn');
            const restartBtn = document.getElementById('restart-btn');
            const quitBtn = document.getElementById('quit-btn');
            
            if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
            if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());
            if (restartBtn) restartBtn.addEventListener('click', () => this.restartGame());
            if (quitBtn) quitBtn.addEventListener('click', () => this.quitToMenu());
            
            // Boutons de fin de jeu - rendre optionnels
            const playAgainBtn = document.getElementById('play-again-btn');
            const backToMenuBtn = document.getElementById('back-to-menu-btn');
            const shareScoreBtn = document.getElementById('share-score-btn');
            
            if (playAgainBtn) playAgainBtn.addEventListener('click', () => this.startGame());
            if (backToMenuBtn) backToMenuBtn.addEventListener('click', () => this.quitToMenu());
            if (shareScoreBtn) shareScoreBtn.addEventListener('click', () => this.shareScore());
            
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
            
            console.log('✅ Événements configurés (mode:', startBtn ? 'complet' : 'test', ')');
        } catch (error) {
            console.error('❌ Erreur lors de la configuration des événements:', error);
            throw error;
        }
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateSounds();
            console.log('✅ Audio configuré');
        } catch (error) {
            console.warn('⚠️ Audio non disponible:', error);
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
        try {
            console.log('📡 Tentative de chargement du fichier JSON...');
            console.log('🌐 URL actuelle:', window.location.href);
            console.log('🗂️ Chemin JSON: ./jeu-verbes.json');
            
            // Essayer de charger le fichier JSON depuis le serveur
            const response = await fetch('./jeu-verbes.json');
            console.log('📥 Réponse reçue:', response.status, response.statusText);
            
            if (!response.ok) {
                console.warn(`⚠️ Erreur HTTP: ${response.status} - ${response.statusText}`);
                console.log('🔄 Basculement vers les données de fallback...');
                this.useEmbeddedData();
                return;
            }
            
            const data = await response.json();
            console.log('✅ Données JSON chargées avec succès');
            console.log('📊 Structure des données:', Object.keys(data));
            
            // Valider les données
            if (!data.verbesIrreguliers || !data.motsDivers) {
                console.warn('⚠️ Structure de données invalide:', data);
                console.log('🔄 Basculement vers les données de fallback...');
                this.useEmbeddedData();
                return;
            }
            
            // Vérifier le contenu des données
            const totalIrregular = Object.values(data.verbesIrreguliers).flat().length;
            const totalRegular = data.motsDivers.length;
            
            if (totalIrregular === 0 || totalRegular === 0) {
                console.warn('⚠️ Données vides détectées');
                console.log('🔄 Basculement vers les données de fallback...');
                this.useEmbeddedData();
                return;
            }
            
            this.verbesData = data;
            this.isDataLoaded = true;
            
            console.log(`📈 Total verbes irréguliers: ${totalIrregular}`);
            console.log(`📈 Total mots réguliers: ${totalRegular}`);
            console.log('✅ Données JSON validées et prêtes à l'utilisation');
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement JSON:', error.message);
            console.log('💡 Cela peut être dû à:');
            console.log('   - Restriction CORS en mode fichier local');
            console.log('   - Serveur non démarré');
            console.log('   - Fichier JSON manquant ou corrompu');
            console.log('🔄 Basculement automatique vers les données de fallback...');
            this.useEmbeddedData();
        }
    }
    
    useEmbeddedData() {
        console.log('🔧 Activation des données de fallback intégrées...');
        console.log('💡 Ces données permettront au jeu de fonctionner même sans serveur');
        
        // Données de secours plus complètes
        this.verbesData = {
            verbesIrreguliers: {
                infinitif: [
                    'être', 'avoir', 'aller', 'faire', 'dire', 'pouvoir', 'voir', 'savoir', 
                    'vouloir', 'venir', 'prendre', 'mettre', 'devoir', 'partir', 'tenir', 
                    'sortir', 'sentir', 'vivre', 'mourir', 'ouvrir', 'suivre', 'courir',
                    'servir', 'dormir', 'mentir', 'croire', 'boire', 'lire', 'écrire', 'connaître'
                ],
                participe_passe: [
                    'été', 'eu', 'allé', 'fait', 'dit', 'pu', 'vu', 'su', 
                    'voulu', 'venu', 'pris', 'mis', 'dû', 'parti', 'tenu', 
                    'sorti', 'senti', 'vécu', 'mort', 'ouvert', 'suivi', 'couru',
                    'servi', 'dormi', 'menti', 'cru', 'bu', 'lu', 'écrit', 'connu'
                ],
                futur: [
                    'serai', 'aurai', 'irai', 'ferai', 'dirai', 'pourrai', 'verrai', 'saurai', 
                    'voudrai', 'viendrai', 'prendrai', 'mettrai', 'devrai', 'partirai', 'tiendrai', 
                    'sortirai', 'sentirai', 'vivrai', 'mourrai', 'ouvrirai', 'suivrai', 'courrai',
                    'servirai', 'dormirai', 'mentirai', 'croirai', 'boirai', 'lirai', 'écrirai', 'connaîtrai'
                ],
                imparfait: [
                    'étais', 'avais', 'allais', 'faisais', 'disais', 'pouvais', 'voyais', 'savais', 
                    'voulais', 'venais', 'prenais', 'mettais', 'devais', 'partais', 'tenais', 
                    'sortais', 'sentais', 'vivais', 'mourais', 'ouvrais', 'suivais', 'courais',
                    'servais', 'dormais', 'mentais', 'croyais', 'buvais', 'lisais', 'écrivais', 'connaissais'
                ],
                subjonctif: [
                    'sois', 'aies', 'ailles', 'fasses', 'dises', 'puisses', 'voies', 'saches', 
                    'veuilles', 'viennes', 'prennes', 'mettes', 'doives', 'partes', 'tiennes', 
                    'sortes', 'sentes', 'vives', 'meures', 'ouvres', 'suives', 'coures',
                    'serves', 'dormes', 'mentes', 'croies', 'boives', 'lises', 'écrives', 'connaisses'
                ]
            },
            motsDivers: [
                'parler', 'aimer', 'donner', 'porter', 'arriver', 'rester', 'entrer', 'montrer', 
                'passer', 'regarder', 'trouver', 'rendre', 'appeler', 'demander', 'garder', 'attendre',
                'chanter', 'danser', 'jouer', 'manger', 'travailler', 'étudier', 'marcher', 'penser',
                'chercher', 'écouter', 'habiter', 'finir', 'choisir', 'réussir', 'grandir', 'réfléchir',
                'parlé', 'aimé', 'donné', 'porté', 'arrivé', 'resté', 'entré', 'montré',
                'passé', 'regardé', 'trouvé', 'rendu', 'appelé', 'demandé', 'gardé', 'attendu',
                'chanté', 'dansé', 'joué', 'mangé', 'travaillé', 'étudié', 'marché', 'pensé',
                'cherché', 'écouté', 'habité', 'fini', 'choisi', 'réussi', 'grandi', 'réfléchi'
            ]
        };
        
        this.isDataLoaded = true;
        console.log('✅ Données de fallback chargées avec succès');
        
        // CRITIQUE : Initialiser les verbes immédiatement
        this.initializeCurrentVerbs();
        
        const totalIrregular = Object.values(this.verbesData.verbesIrreguliers).flat().length;
        const totalRegular = this.verbesData.motsDivers.length;
        console.log(`📊 Fallback - Verbes irréguliers: ${totalIrregular}, mots réguliers: ${totalRegular}`);
        console.log('🎮 Le jeu est maintenant prêt à fonctionner avec les données de fallback');
    }
    
    setupCanvas() {
        try {
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                console.warn('⚠️ Canvas non trouvé - Mode test détecté');
                // Créer un canvas virtuel pour les tests
                this.canvas = document.createElement('canvas');
                this.canvas.width = 800;
                this.canvas.height = 600;
                console.log('📊 Canvas virtuel créé pour les tests');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Canvas context not available!');
            }
            
            // Test du canvas
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(0, 0, 1, 1);
            
            // Redimensionner seulement si le canvas est dans le DOM
            if (this.canvas.parentNode) {
                this.resizeCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
                
                // Événements de clic seulement si le canvas est dans le DOM
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
            
            console.log('✅ Canvas configuré:', this.canvas.width, 'x', this.canvas.height);
            
        } catch (error) {
            console.error('❌ Erreur lors de la configuration du canvas:', error);
            throw error;
        }
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
        console.log('🚀 Tentative de démarrage du jeu...');
        console.log('📊 État actuel:', {
            isDataLoaded: this.isDataLoaded,
            gameState: this.gameState,
            verbesData: this.verbesData ? 'chargé' : 'null',
            canvas: this.canvas ? 'trouvé' : 'null'
        });
        
        // Vérifier que les données sont chargées
        if (!this.isDataLoaded) {
            console.error('❌ Impossible de démarrer : données non chargées');
            console.log('🔄 Tentative de rechargement des données...');
            this.loadVerbsData().then(() => {
                if (this.isDataLoaded) {
                    console.log('✅ Données rechargées, nouvelle tentative de démarrage');
                    this.startGame();
                } else {
                    alert('Les données du jeu ne peuvent pas être chargées. Vérifiez votre connexion.');
                }
            });
            return;
        }
        
        console.log('🎯 Démarrage du jeu confirmé');
        this.resetGameStats();
        this.initializeCurrentVerbs(); // CRITIQUE : Initialiser les verbes actuels
        
        // CORRECTION CRITIQUE : S'assurer que le gameState est bien défini AVANT gameLoop
        this.gameState = 'playing';
        console.log('✅ GameState défini sur "playing"');
        
        this.gameStartTime = Date.now();
        this.lastSpawnTime = Date.now(); // Initialiser le timer de spawn
        
        console.log('🖥️ Affichage de l\'écran de jeu...');
        this.showScreen('game-screen');
        
        console.log('🔄 Lancement de la GameLoop...');
        this.gameLoop();
        
        console.log('🎮 Jeu démarré avec succès !');
    }
    
    // NOUVELLE FONCTION CRITIQUE : Initialise correctement la liste des verbes
    initializeCurrentVerbs() {
        console.log('🎲 Début initialisation des verbes...');
        
        // Vérifier que les données sont disponibles
        if (!this.verbesData) {
            console.error('❌ verbesData non disponible lors de l\'initialisation');
            return;
        }
        
        if (!this.verbesData.verbesIrreguliers || !this.verbesData.motsDivers) {
            console.error('❌ Structure de données incomplète:', this.verbesData);
            return;
        }
        
        const currentLevel = this.getCurrentLevel();
        console.log('📊 Niveau actuel:', currentLevel);
        
        // Récupérer les verbes irréguliers pour le niveau actuel
        const irregularVerbs = this.verbesData.verbesIrreguliers[currentLevel.verbType] || [];
        console.log(`📚 Verbes irréguliers trouvés pour ${currentLevel.verbType}:`, irregularVerbs.length);
        
        // Récupérer les mots réguliers
        const regularWords = this.verbesData.motsDivers || [];
        console.log('📝 Mots réguliers trouvés:', regularWords.length);
        
        // Mélanger les verbes irréguliers avec des mots réguliers
        this.currentVerbs = [...irregularVerbs, ...regularWords];
        
        console.log(`🎲 Verbes initialisés pour niveau ${this.level} (${currentLevel.name}):`, 
                   `${irregularVerbs.length} irréguliers + ${regularWords.length} réguliers = ${this.currentVerbs.length} total`);
        
        // Vérification finale
        if (this.currentVerbs.length === 0) {
            console.error('❌ ERREUR CRITIQUE: Aucun verbe initialisé !');
        } else {
            console.log('✅ Initialisation des verbes réussie:', this.currentVerbs.slice(0, 5), '...');
        }
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
        this.spawnInterval = 1000 / settings.spawnMultiplier; // Ajuster l'intervalle selon la difficulté
        
        console.log('🔄 Stats réinitialisées, difficulté:', this.difficulty, 'paramètres:', settings);
        this.updateUI();
    }
    
    updateCurrentVerbs() {
        const currentLevel = this.getCurrentLevel();
        const irregularVerbs = this.verbesData.verbesIrreguliers[currentLevel.verbType] || [];
        const regularWords = this.verbesData.motsDivers || [];
        
        // Mélanger les verbes irréguliers avec des mots réguliers
        this.currentVerbs = [...irregularVerbs, ...regularWords];
        
        console.log(`📚 Verbes mis à jour pour niveau ${this.level}:`, 
                   `${irregularVerbs.length} irréguliers + ${regularWords.length} réguliers`);
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
        console.log('🔄 GameLoop appelée, état actuel:', this.gameState);
        
        if (this.gameState !== 'playing') {
            console.log('🛑 GameLoop arrêtée, état:', this.gameState);
            return;
        }
        
        // Log périodique pour confirmer que la boucle tourne
        if (Date.now() % 5000 < 16) { // Log toutes les 5 secondes environ
            console.log('🔄 GameLoop active, mots à l\'écran:', this.fallingWords.length);
        }
        
        try {
            this.update();
            this.render();
        } catch (error) {
            console.error('❌ Erreur dans GameLoop:', error);
            // Continue quand même pour éviter que le jeu plante complètement
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.gameTime = Date.now() - this.gameStartTime;
        
        // Vérifier le changement de niveau
        this.checkLevelUp();
        
        // Générer de nouveaux mots avec contrôle temporel
        const now = Date.now();
        if (now - this.lastSpawnTime > this.spawnInterval && this.fallingWords.length < this.maxWords) {
            this.spawnWord();
            this.lastSpawnTime = now;
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
            this.updateCurrentVerbs(); // Mettre à jour les verbes pour le nouveau niveau
            this.showLevelUpEffect();
            this.playSound('levelUp');
            console.log('🆙 Niveau supérieur atteint:', this.level, newLevel.name);
        }
    }
    
    spawnWord() {
        if (!this.currentVerbs || this.currentVerbs.length === 0) {
            console.warn('⚠️ spawnWord appelée mais currentVerbs est vide');
            this.initializeCurrentVerbs(); // Réinitialiser si vide
            if (this.currentVerbs.length === 0) {
                console.error('❌ Impossible de spawn : aucun verbe disponible');
                return;
            }
        }
        
        const word = this.currentVerbs[Math.floor(Math.random() * this.currentVerbs.length)];
        const currentLevel = this.getCurrentLevel();
        const isIrregular = this.isIrregularVerb(word);
        
        const newWord = {
            text: word,
            x: Math.random() * (this.canvas.width - 200) + 100,
            y: -50,
            speed: this.wordSpeed + Math.random() * 0.5,
            isIrregular: isIrregular,
            color: currentLevel.color,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            scale: 1,
            opacity: 1
        };
        
        this.fallingWords.push(newWord);
        
        console.log(`✨ Mot spawné: "${word}" (${isIrregular ? 'irrégulier' : 'régulier'}), total à l'écran: ${this.fallingWords.length}`);
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
                    console.log('❌ Verbe irrégulier raté:', word.text);
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
            console.log('🎯 Clic dans le vide');
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
            
            console.log('✅ Verbe irrégulier tranché:', word.text, 'Score:', this.score);
            
            // Bonus pour les séries
            if (this.currentStreak > 0 && this.currentStreak % 5 === 0) {
                const bonus = Math.floor(this.currentStreak / 5);
                this.score += bonus;
                this.addFloatingText(word.x, word.y - 30, `Série +${bonus}!`, 'bonus');
                console.log('🔥 Bonus série:', bonus);
            }
        } else {
            // Mauvais clic sur un mot régulier
            this.currentStreak = 0;
            this.loseLife();
            this.addFloatingText(word.x, word.y, 'Erreur !', 'error');
            this.playSound('error');
            console.log('❌ Mot régulier cliqué:', word.text);
        }
        
        this.updateUI();
    }
    
    loseLife() {
        this.lives--;
        this.updateLivesDisplay();
        console.log('💔 Vie perdue, vies restantes:', this.lives);
        
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
        // Mise à jour seulement si les éléments existent
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        const levelNameElement = document.getElementById('level-name');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (levelElement) levelElement.textContent = this.level;
        if (levelNameElement) levelNameElement.textContent = this.getCurrentLevel().name;
        
        this.updateProgressBar();
        this.updateLivesDisplay();
    }
    
    updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (!progressFill || !progressText) {
            // Mode test - pas d'interface
            return;
        }
        
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.levels[this.level] || this.levels[this.levels.length - 1];
        
        const progress = Math.min(100, ((this.score - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100);
        
        progressFill.style.width = progress + '%';
        progressText.textContent = 
            `${this.score - currentLevel.threshold} / ${nextLevel.threshold - currentLevel.threshold}`;
    }
    
    updateLivesDisplay() {
        const hearts = document.querySelectorAll('.heart');
        if (hearts.length === 0) {
            // Mode test - pas d'interface
            return;
        }
        
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
            console.log('⏸️ Jeu en pause');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('game-screen');
            this.gameLoop();
            console.log('▶️ Jeu repris');
        }
    }
    
    updatePauseStats() {
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-level').textContent = this.level;
        document.getElementById('pause-accuracy').textContent = 
            this.totalClicks > 0 ? Math.round((this.correctClicks / this.totalClicks) * 100) + '%' : '100%';
    }
    
    restartGame() {
        console.log('🔄 Redémarrage du jeu...');
        this.startGame();
    }
    
    quitToMenu() {
        this.gameState = 'menu';
        this.showScreen('start-screen');
        console.log('🏠 Retour au menu');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.updateFinalStats();
        this.showScreen('game-over-screen');
        console.log('💀 Game Over ! Score final:', this.score);
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
        
        console.log('📊 Stats finales:', {
            score: this.score,
            level: this.level,
            accuracy: accuracy + '%',
            verbesSliced: this.verbsSliced,
            gameTime: `${minutes}:${seconds}`,
            bestStreak: this.bestStreak
        });
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
        console.log('🖥️ Changement d\'écran vers:', screenId);
        
        const screens = document.querySelectorAll('.game-screen');
        if (screens.length > 0) {
            // Masquer tous les écrans
            screens.forEach(screen => {
                screen.classList.remove('active');
                console.log(`📺 Masquage de l'écran: ${screen.id}`);
            });
            
            // Afficher l'écran cible
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                console.log('✅ Écran affiché:', screenId);
                
                // Vérification supplémentaire pour les écrans overlay
                if (targetScreen.classList.contains('overlay')) {
                    console.log('🔍 Écran overlay détecté, vérification CSS...');
                    // Forcer le display pour les overlays
                    setTimeout(() => {
                        const computedStyle = window.getComputedStyle(targetScreen);
                        console.log('🎨 Display calculé:', computedStyle.display);
                        if (computedStyle.display === 'none') {
                            console.warn('⚠️ Overlay mal affiché, correction...');
                            targetScreen.style.display = 'flex';
                        }
                    }, 10);
                }
            } else {
                console.warn('⚠️ Écran non trouvé:', screenId, '- Mode test détecté');
            }
        } else {
            console.warn('⚠️ Aucun écran de jeu trouvé - Mode test détecté');
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
    
    // Méthode utilitaire pour détecter le mode test
    isTestMode() {
        return !document.getElementById('start-game-btn') || !document.getElementById('game-canvas');
    }
    
    // Méthode publique pour les tests
    runTestSequence() {
        console.log('🧪 Démarrage de la séquence de test...');
        
        if (!this.isDataLoaded) {
            console.error('❌ Données non chargées');
            return false;
        }
        
        if (!this.currentVerbs || this.currentVerbs.length === 0) {
            console.error('❌ Verbes non initialisés');
            return false;
        }
        
        console.log('✅ Test réussi - Jeu prêt à fonctionner');
        console.log('📊 Résumé:');
        console.log(`  - Données chargées: ${this.isDataLoaded}`);
        console.log(`  - Verbes disponibles: ${this.currentVerbs.length}`);
        console.log(`  - Mode test: ${this.isTestMode()}`);
        console.log(`  - État du jeu: ${this.gameState}`);
        
        return true;
    }
}

// Initialiser le jeu quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM chargé, initialisation de Verbe Slicer...');
    const game = new VerbeSlicer();
    
    // Exposer le jeu globalement pour le debugging
    window.game = game;
    console.log('🎮 Jeu exposé globalement dans window.game pour debugging');
}); 