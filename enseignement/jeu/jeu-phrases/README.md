# Connecteurs Logiques - Jeu FLE

## Vue d'ensemble

Connecteurs Logiques est un jeu moderne pour apprendre et maîtriser les connecteurs logiques français. Les joueurs doivent identifier le bon connecteur qui relie une cause à sa conséquence.

## Fonctionnalités

### 🎯 Gameplay
- **Objectif** : Trouver le connecteur logique approprié entre cause et conséquence
- **Format QCM** : 4 choix de connecteurs par question
- **Système de progression** : 8-12 questions selon la difficulté
- **Timer dynamique** : Temps limité avec bonus pour bonnes réponses
- **Système de séries** : Bonus pour les réponses consécutives correctes

### 📚 Types de connecteurs
- **Cause** : parce que, car, puisque, étant donné que...
- **Conséquence** : donc, alors, par conséquent, c'est pourquoi...
- **Opposition** : mais, cependant, néanmoins, pourtant...
- **Addition** : de plus, en outre, aussi, également...

### ⚙️ Niveaux de difficulté
- **Débutant** : 90 secondes, 8 questions, connecteurs simples
- **Intermédiaire** : 60 secondes, 10 questions, variété de connecteurs
- **Avancé** : 45 secondes, 12 questions, connecteurs complexes

### 🎨 Interface moderne
- **Design responsive** adaptatif mobile/tablette
- **Animations fluides** avec transitions CSS3
- **Feedback visuel** immédiat pour chaque réponse
- **Effets de bonus** pour les séries de succès
- **Timer coloré** selon l'urgence

### 🔊 Audio
- **Sons générés** via Web Audio API
- **Feedback sonore** pour succès, erreurs et bonus
- **Pas de fichiers audio** requis

### 📊 Statistiques détaillées
- Score en temps réel avec bonus
- Précision (pourcentage de bonnes réponses)
- Série actuelle et meilleure série
- Temps de jeu total
- Nombre de connecteurs maîtrisés
- Barre de progression visuelle

## Structure des fichiers

```
jeu-phrases/
├── index.html                # Interface moderne du jeu
├── connecteurs-styles.css    # Styles spécifiques
├── connecteurs-game.js       # Logique de jeu complète
├── jeu-phrases.csv          # Base de données des phrases
├── jeu-phrases.html         # Ancienne version (conservée)
├── jeu-phrases.js           # Ancien script (conservé)
├── jeu-phrases.css          # Anciens styles (conservés)
└── README.md                # Cette documentation
```

## Technologies utilisées

### Frontend
- **HTML5** sémantique avec structure moderne
- **CSS3** avec variables personnalisées et animations
- **JavaScript ES6+** avec classes et async/await
- **Web Audio API** pour la génération de sons

### Fonctionnalités modernes
- **Responsive design** adaptatif
- **Raccourcis clavier** (Espace, R, Échap, Entrée)
- **Support tactile** pour appareils mobiles
- **API de partage** native ou fallback presse-papiers
- **Animations CSS** avec GPU acceleration

## Contrôles

### Souris/Tactile
- **Clic / Tap** : Sélectionner un connecteur
- **Boutons UI** : Navigation dans les menus

### Clavier
- **Espace** : Pause/Reprendre
- **R** : Redémarrer la partie
- **Échap** : Mettre en pause
- **Entrée** : Passer à la question suivante

## Données de jeu

### Structure CSV (`jeu-phrases.csv`)
```csv
cause,connecteur,consequence
Il pleut beaucoup,donc;alors;par conséquent,nous restons à la maison
Elle étudie le français,parce qu';car;puisqu',elle veut travailler en France
```

### Format des connecteurs
- **Multiples acceptés** : séparés par des points-virgules
- **Variations** : avec/sans apostrophes, espaces
- **Exemples** : "donc;alors;par conséquent"

## Système de scoring

### Points
- **+10 points** par bonne réponse
- **+5 points bonus** pour séries de 3+ réponses correctes
- **+5 secondes** de temps bonus par bonne réponse

### Métriques
- **Précision** : (Bonnes réponses / Total réponses) × 100
- **Série** : Nombre de bonnes réponses consécutives
- **Connecteurs maîtrisés** : Nombre unique de connecteurs utilisés correctement

## Responsive Design

### Breakpoints
- **Desktop** : > 768px - Interface complète
- **Tablette** : 481-768px - Adaptation des grilles
- **Mobile** : ≤ 480px - Interface simplifiée

### Adaptations mobiles
- Boutons plus grands pour le tactile
- Grille de connecteurs en colonne unique
- Interface verticale optimisée
- Texte adapté aux petits écrans

## Performance

### Optimisations
- **CSS Variables** pour thème cohérent
- **Transitions GPU** pour animations fluides
- **Gestion mémoire** avec nettoyage automatique
- **Chargement asynchrone** des données

### Compatibilité
- **Navigateurs modernes** : Chrome 60+, Firefox 55+, Safari 12+
- **Appareils** : Desktop, tablette, smartphone
- **Fallbacks** : Audio optionnel, partage alternatif

## Pédagogie

### Objectifs d'apprentissage
- **Reconnaissance** des connecteurs logiques français
- **Compréhension** des relations cause-conséquence
- **Mémorisation** par répétition espacée
- **Application** en contexte authentique

### Progression adaptative
- **Difficulté croissante** avec les niveaux
- **Feedback immédiat** visuel et sonore
- **Statistiques motivantes** pour l'engagement
- **Variété** pour maintenir l'intérêt

## Installation et utilisation

### Prérequis
- Serveur web (pour éviter les restrictions CORS)
- Navigateur moderne avec support ES6+

### Lancement
1. Ouvrir `index.html` dans un navigateur
2. Choisir le niveau de difficulté
3. Cliquer sur "Commencer l'entraînement"
4. Suivre les instructions à l'écran

### Intégration
- Lien depuis la page principale des jeux
- Iframe possible pour intégration externe
- Compatible avec systèmes de gestion d'apprentissage

## Évolutions futures

### Fonctionnalités envisagées
- **Mode libre** sans timer
- **Catégories spécialisées** (opposition, temps, etc.)
- **Exercices de création** de phrases
- **Mode collaboratif** en temps réel
- **Analyse détaillée** des erreurs
- **Sauvegarde** des progressions

### Améliorations techniques
- **Base de données** pour plus de phrases
- **API REST** pour synchronisation
- **Mode hors ligne** avec Service Worker
- **Personnalisation** des thèmes visuels 