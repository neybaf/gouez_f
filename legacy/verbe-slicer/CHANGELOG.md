# 📝 Changelog - Verbe Slicer

## Version 2.1.1 - Version Simple Promue (31 mai 2025)

### 🚀 **Changement Principal**
- **`index.html` est maintenant la version simple autonome** 
- Version précédente sauvegardée dans `index-original.html`
- **Interface uniformisée** sans émojis indicateurs pour plus de challenge
- **Base autonome** de 88 verbes intégrés (30 irréguliers + 58 réguliers par niveau)

### 🎯 **Avantages de la Version Simple Promue**
- ✅ **Fonctionne sans serveur** (CSS intégré)
- ✅ **Données fallback garanties** (pas de dépendance JSON externe)  
- ✅ **Challenge augmenté** - pas d'aide visuelle
- ✅ **Progression rapide** (seuils optimisés)
- ✅ **Stabilité maximale** (pas de chargement externe)

---

## Version 2.1.0 - Progression Plus Rapide (31 mai 2025)

### ✨ **Nouveautés**
- **Seuils de niveau ajustés** pour une progression plus rapide et motivante
- **Version simple autonome** (`index-simple.html`) avec CSS intégré
- **Couleurs distinctes** pour différencier verbes irréguliers vs réguliers
- **Effets visuels améliorés** avec halos et icônes d'aide

### 🎯 **Niveaux Réajustés**
- **Niveau 1 - Infinitifs** : 0-9 points (au lieu de 0-24)
- **Niveau 2 - Participes passés** : 10-24 points (au lieu de 25-49)  
- **Niveau 3 - Futur** : 25-44 points (au lieu de 50-74)
- **Niveau 4 - Imparfait** : 45-69 points (au lieu de 75-99)
- **Niveau 5 - Subjonctif** : 70+ points (au lieu de 100+)

### 🎨 **Améliorations Visuelles**
- **Verbes irréguliers** : Couleurs vives + bordure lumineuse + icône cible 🎯
- **Verbes réguliers** : Couleurs neutres + icône d'avertissement ⚠️  
- **Design noir élégant** avec gradients et animations
- **Interface responsive** adaptée mobile et desktop

### 🔧 **Corrections Techniques**
- **Clics sur verbes réguliers** maintenant fonctionnels (perte de vie)
- **Gestion d'erreurs robuste** avec fallback automatique
- **Debugging amélioré** avec logs détaillés
- **Organisation des fichiers** : legacy déplacés vers dossier racine

### 📁 **Organisation Finale**
```
enseignement/jeu/verbe-slicer/
├── index.html                 # VERSION PRINCIPALE (autonome)
├── index-simple.html          # Version identique (tests)
├── index-original.html        # Version avec CSS/JS externes
├── verbe-slicer-game.js       # Logique de jeu (legacy)
├── verbe-slicer-styles.css    # Styles (legacy)
├── jeu-verbes.json           # Base de données verbes
├── README.md                 # Documentation
└── CHANGELOG.md              # Ce fichier

legacy/verbe-slicer/          # Fichiers de développement
├── debug.html                # Tests et diagnostic
├── test-*.html              # Suites de tests
├── *.md                     # Documentation technique
└── verbe-slicer-fixed.js    # Version de référence
```

---

## Version 2.0.0 - Refonte Majeure (30 mai 2025)

### ✨ **Nouvelles Fonctionnalités**
- Interface moderne multi-écrans
- Système de progression par niveaux
- 3 niveaux de difficulté
- Effets visuels et sonores avancés
- Statistiques détaillées
- Mode responsive complet

### 🔧 **Améliorations Techniques**
- Architecture modulaire
- Chargement JSON externe
- Gestion d'états robuste
- Audio générée dynamiquement
- Canvas adaptatif

---

## Version 1.0.0 - Version Initiale

### 🎮 **Fonctionnalités de Base**
- Jeu de verbes irréguliers
- Interface simple
- Canvas fixe 800x600
- Données intégrées
- Score et vies basiques 