# Verbe Slicer - Jeu d'Action FLE

## Vue d'ensemble

Verbe Slicer est un jeu d'action moderne pour apprendre les verbes irréguliers français. Les joueurs doivent cliquer sur les verbes irréguliers qui tombent du ciel tout en évitant les verbes réguliers.

## Fonctionnalités

### 🎮 Gameplay
- **Objectif** : Cliquer uniquement sur les verbes irréguliers
- **Système de vies** : 3 vies, perdues en cliquant sur des verbes réguliers ou en ratant des irréguliers
- **Progression par niveaux** : 5 niveaux avec différents types de verbes
- **Système de séries** : Bonus pour les clics consécutifs corrects

### 📈 Niveaux de progression
1. **Niveau 1** - Infinitifs (0-24 points)
2. **Niveau 2** - Participes passés (25-49 points)
3. **Niveau 3** - Futur (50-74 points)
4. **Niveau 4** - Imparfait (75-99 points)
5. **Niveau 5** - Subjonctif (100+ points)

### ⚙️ Difficultés
- **Facile** : Vitesse réduite, moins de mots simultanés
- **Normal** : Paramètres équilibrés
- **Difficile** : Vitesse élevée, plus de mots simultanés

### 🎨 Effets visuels
- **Particules colorées** lors des succès
- **Effets de tranchage** avec lignes lumineuses
- **Textes flottants** pour le feedback
- **Animations de niveau** lors des progressions
- **Arrière-plan animé** avec dégradés dynamiques

### 🔊 Audio
- **Sons générés** via Web Audio API
- **Feedback sonore** pour succès, erreurs et montées de niveau
- **Pas de fichiers audio** requis

### 📊 Statistiques détaillées
- Score et niveau en temps réel
- Précision (pourcentage de clics corrects)
- Nombre de verbes tranchés
- Temps de jeu
- Meilleure série de succès consécutifs
- Barre de progression vers le niveau suivant

## Structure des fichiers

```
verbe-slicer/
├── index.html                 # Interface moderne du jeu
├── verbe-slicer-styles.css   # Styles spécifiques
├── verbe-slicer-game.js      # Logique de jeu complète
├── jeu-verbes.json           # Base de données des verbes
├── jeu-verbes.html           # Ancienne version (conservée)
├── jeu-verbes.js             # Ancien script (conservé)
├── jeu-verbes-style.css      # Anciens styles (conservés)
└── README.md                 # Cette documentation
```

## Technologies utilisées

### Frontend
- **HTML5 Canvas** pour le rendu du jeu
- **CSS3** avec variables personnalisées et animations
- **JavaScript ES6+** avec classes et async/await
- **Web Audio API** pour la génération de sons

### Fonctionnalités modernes
- **Responsive design** adaptatif mobile/tablette
- **Raccourcis clavier** (Espace, R, Échap)
- **Support tactile** pour appareils mobiles
- **API de partage** native ou fallback presse-papiers
- **Animations CSS** avec GPU acceleration

## Contrôles

### Souris/Tactile
- **Clic gauche / Tap** : Trancher un verbe
- **Boutons UI** : Navigation dans les menus

### Clavier
- **Espace** : Pause/Reprendre
- **R** : Redémarrer la partie
- **Échap** : Mettre en pause

## Données de jeu

### Structure JSON (`jeu-verbes.json`)
```json
{
  "verbesIrreguliers": {
    "infinitif": ["être", "avoir", "aller", ...],
    "participe_passe": ["été", "eu", "allé", ...],
    "futur": ["serai", "aurai", "irai", ...],
    "imparfait": ["étais", "avais", "allais", ...],
    "subjonctif": ["sois", "aie", "aille", ...]
  },
  "motsDivers": ["parler", "aimer", "chanter", ...]
}
```

### Logique de détection
- Les verbes irréguliers sont identifiés par recherche dans toutes les catégories
- Les mots réguliers servent de distracteurs
- Mélange aléatoire pour chaque niveau

## Système de scoring

### Points
- **+1 point** par verbe irrégulier tranché
- **Bonus de série** : +1 point supplémentaire tous les 5 succès consécutifs
- **Pénalités** : Perte de vie pour erreurs ou verbes ratés

### Métriques
- **Précision** : (Clics corrects / Total clics) × 100
- **Efficacité** : Verbes tranchés par minute
- **Constance** : Meilleure série de succès

## Responsive Design

### Breakpoints
- **Desktop** : > 768px - Interface complète
- **Tablette** : 481-768px - Adaptation des grilles
- **Mobile** : ≤ 480px - Interface simplifiée

### Adaptations mobiles
- Boutons plus grands pour le tactile
- Interface verticale optimisée
- Gestion des événements touch
- Canvas redimensionnable

## Performance

### Optimisations
- **RequestAnimationFrame** pour animations fluides
- **Object pooling** pour particules et effets
- **Canvas optimisé** avec transformations GPU
- **Gestion mémoire** avec nettoyage automatique

### Compatibilité
- **Navigateurs modernes** : Chrome 60+, Firefox 55+, Safari 12+
- **Appareils** : Desktop, tablette, smartphone
- **Fallbacks** : Audio optionnel, partage alternatif

## Pédagogie

### Objectifs d'apprentissage
- **Reconnaissance** des verbes irréguliers français
- **Mémorisation** par répétition espacée
- **Différenciation** verbes réguliers/irréguliers
- **Conjugaisons** à différents temps

### Progression adaptative
- **Difficulté croissante** avec les niveaux
- **Feedback immédiat** visuel et sonore
- **Statistiques motivantes** pour l'engagement
- **Récompenses** pour maintenir l'intérêt

## Installation et utilisation

### Prérequis
- Serveur web (pour éviter les restrictions CORS)
- Navigateur moderne avec support Canvas et Web Audio

### Lancement
1. Ouvrir `index.html` dans un navigateur
2. Choisir la difficulté souhaitée
3. Cliquer sur "Commencer l'aventure"
4. Suivre les instructions à l'écran

### Intégration
- Lien depuis la page principale des jeux
- Iframe possible pour intégration externe
- Compatible avec systèmes de gestion d'apprentissage

## Évolutions futures

### Fonctionnalités envisagées
- **Multijoueur** en temps réel
- **Classements** globaux
- **Personnalisation** des thèmes visuels
- **Mode entraînement** par catégorie
- **Analyse détaillée** des erreurs
- **Sauvegarde** des progressions

### Améliorations techniques
- **WebGL** pour effets 3D
- **Service Worker** pour mode hors ligne
- **Base de données** pour persistance
- **API REST** pour synchronisation 