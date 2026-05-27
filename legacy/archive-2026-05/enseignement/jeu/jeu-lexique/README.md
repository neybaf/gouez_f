# 🎯 Jeu d'Association Lexicale FLE

## Description

Le jeu d'association lexicale est un outil pédagogique interactif conçu pour l'apprentissage du français langue étrangère (FLE). Les apprenants doivent associer des éléments visuels ou sonores avec leur équivalent textuel en français.

## Fonctionnalités

### 🎮 Interface de jeu moderne
- **Écrans multiples** : Démarrage, jeu, pause, fin de partie
- **Design responsive** : Compatible desktop, tablette et mobile
- **Animations fluides** : Transitions et effets visuels engageants
- **Feedback visuel** : Indications claires pour les bonnes/mauvaises réponses

### 📚 Système de niveaux dynamique
- **Niveaux CECR** : Français Général (FG1-4), Français sur Objectifs spécifiques (FOS1-2), Institut (INS2)
- **Sous-niveaux** : Unités U1 à U9 selon disponibilité
- **Détection automatique** : Scan des fichiers disponibles
- **Progression adaptative** : Passage au niveau suivant

### 🎯 Modes de difficulté
- **Facile** : 5 associations, 45 secondes, 10 points par réussite
- **Moyen** : 7 associations, 35 secondes, 15 points par réussite
- **Difficile** : 10 associations, 25 secondes, 20 points par réussite

### 🔊 Support multimédia
- **Images** : Affichage optimisé avec gestion d'erreur
- **Audio** : Lecture automatique au clic avec formats multiples (MP3, M4A)
- **Effets sonores** : Audio généré via Web Audio API

### 📊 Statistiques complètes
- **Score en temps réel** : Points, associations, erreurs
- **Progression visuelle** : Barre de progression animée
- **Statistiques finales** : Précision, vitesse, temps de jeu
- **Partage de score** : Natif ou copie dans le presse-papiers

## Structure des fichiers

```
jeu-lexique/
├── index.html              # Interface principale moderne
├── lexique-styles.css      # Styles CSS spécifiques
├── lexique-game.js         # Logique de jeu ES6
├── README.md              # Documentation
├── data-lexique/          # Données organisées
│   ├── lexique_S2_U9.csv # Exemple de données
│   └── INS2/             # Dossier par niveau
│       └── U9/           # Médias par unité
└── [anciens fichiers]    # Versions précédentes
```

### Format des données CSV

```csv
text,audio,image
"à bord",data-lexique/INS2/U9/a_bord.m4a,
"un capitaine",data-lexique/INS2/U9/un_capitaine.m4a,data-lexique/INS2/U9/capitaine_bateau.jpeg
```

**Colonnes :**
- `text` : Texte français à associer (obligatoire)
- `audio` : Chemin vers fichier audio (optionnel)
- `image` : Chemin vers image (optionnel)

## Technologies utilisées

### Frontend
- **HTML5** : Structure sémantique moderne
- **CSS3** : Variables CSS, Grid, Flexbox, animations
- **JavaScript ES6+** : Classes, async/await, modules

### APIs Web
- **Web Audio API** : Génération d'effets sonores
- **Fetch API** : Chargement dynamique des données
- **Navigator API** : Partage natif et presse-papiers

### Fonctionnalités avancées
- **Responsive Design** : Adaptation automatique aux écrans
- **Gestion d'état** : Machine d'état pour les écrans
- **Gestion d'erreur** : Fallbacks et messages informatifs
- **Accessibilité** : Support clavier et navigation

## Utilisation

### Pour les enseignants

1. **Préparation des données** :
   - Créer un fichier CSV au format requis
   - Placer les médias dans le dossier approprié
   - Nommer le fichier : `lexique_[NIVEAU]_U[UNITE].csv`

2. **Ajout d'un nouveau niveau** :
   - Créer le dossier de niveau dans `data-lexique/`
   - Ajouter les fichiers CSV et médias
   - Le système détectera automatiquement les nouveaux niveaux

### Pour les apprenants

1. **Sélection** : Choisir niveau, unité et difficulté
2. **Jeu** : Cliquer sur un élément média puis sur le texte correspondant
3. **Audio** : Cliquer sur les éléments audio pour les écouter
4. **Contrôles** : Utiliser les boutons ou raccourcis clavier (Espace/Échap pour pause)

## Objectifs pédagogiques

### Compétences développées
- **Compréhension orale** : Association son-sens
- **Reconnaissance visuelle** : Association image-mot
- **Mémorisation** : Renforcement lexical par répétition
- **Rapidité** : Automatisation des associations

### Progression adaptative
- **Évaluation continue** : Statistiques de performance
- **Difficulté croissante** : Augmentation du nombre d'éléments et réduction du temps
- **Feedback immédiat** : Correction en temps réel

## Installation

1. **Téléchargement** : Récupérer tous les fichiers du jeu
2. **Serveur web** : Placer dans un serveur HTTP (requis pour le chargement des fichiers)
3. **Données** : Vérifier la présence des fichiers CSV et médias
4. **Test** : Ouvrir `index.html` dans un navigateur moderne

## Évolutions futures

### Fonctionnalités envisagées
- **Mode hors ligne** : Cache des données pour utilisation sans internet
- **Personnalisation** : Thèmes visuels et paramètres utilisateur
- **Analytiques** : Suivi détaillé des performances d'apprentissage
- **Gamification** : Système de badges et récompenses
- **Collaboration** : Mode multijoueur et partage de scores

### Améliorations techniques
- **PWA** : Application web progressive installable
- **Optimisation** : Compression des médias et lazy loading
- **Accessibilité** : Support lecteurs d'écran et navigation clavier avancée
- **Internationalisation** : Support multilingue de l'interface

## Support

### Navigateurs compatibles
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile : iOS Safari 13+, Chrome Mobile 80+

### Résolution de problèmes
- **Audio ne fonctionne pas** : Vérifier l'activation du son et les permissions
- **Images manquantes** : Contrôler les chemins dans le CSV
- **Chargement lent** : Optimiser la taille des fichiers média
- **Erreurs de niveau** : Vérifier la nomenclature des fichiers CSV

---

*Développé pour l'apprentissage du français langue étrangère - 2024-2025*