# ⚔️ Verbe Slicer - Jeu FLE

Un jeu d'action pour apprendre les verbes irréguliers français en s'amusant !

## 🎯 Description

**Verbe Slicer** est un jeu éducatif interactif où les apprenants doivent cliquer rapidement sur les verbes irréguliers qui tombent du ciel, tout en évitant les verbes réguliers. Plus vous progressez, plus les défis deviennent intéressants avec différents temps et modes verbaux.

## 🎯 Comment jouer

1. **Objectif** : Cliquez uniquement sur les verbes irréguliers qui tombent
2. **Évitez** : Ne cliquez pas sur les mots réguliers (vous perdrez une vie ❤️)
3. **Progression** : Plus vous réussissez, plus le niveau augmente et de nouveaux types de verbes apparaissent

## 📱 Optimisations tactiles et mobiles

### Zones cliquables agrandies
- **Surface cliquable élargie** : +40px en largeur et +25px en hauteur autour de chaque mot
- **Taille minimale garantie** : 80px × 60px minimum par zone cliquable
- **Optimisé pour les doigts** : Plus facile de cliquer précisément sur mobile

### Contrôles tactiles améliorés
- **Gestion multi-touch** : Support complet des événements tactiles
- **Prévention des gestes indésirables** : Pas de zoom accidentel ou de sélection de texte
- **Feedback immédiat** : Effet visuel à chaque clic pour confirmer l'interaction

### Interface adaptative
- **Responsive design** : Interface qui s'adapte automatiquement à la taille d'écran
- **Boutons agrandis** : Taille minimale de 44px pour l'accessibilité tactile
- **Zone de sécurité** : Respect des bordures d'écran (safe areas) sur mobile

## 🔧 Raccourcis clavier (ordinateur)

- **Espace** : Pause/Reprendre
- **R** : Redémarrer la partie
- **Échap** : Pause
- **D** : Mode debug (affiche les zones cliquables)
- **Z** : Afficher/masquer les zones cliquables uniquement

## 🎮 Niveaux de difficulté

- **Facile** : Mots plus lents, moins nombreux
- **Normal** : Équilibré pour la plupart des joueurs  
- **Difficile** : Plus rapide et plus de mots simultanés

## 📊 Types de verbes par niveau

1. **Infinitifs** (Score 0+)
2. **Participes passés** (Score 10+)
3. **Futur** (Score 25+)
4. **Imparfait** (Score 45+)
5. **Subjonctif** (Score 70+)

## 🎨 Conseils pour bien jouer

### Sur mobile
- **Tenez votre appareil fermement** pour éviter les mouvements involontaires
- **Utilisez votre pouce ou index** pour plus de précision
- **Mode paysage recommandé** sur petits écrans pour plus d'espace
- **Ajustez la luminosité** pour bien voir les couleurs des verbes

### Sur ordinateur
- **Utilisez la souris** pour plus de précision qu'un trackpad
- **Mode debug (touche D)** pour visualiser les zones cliquables pendant l'apprentissage
- **Raccourcis clavier** pour une navigation rapide

## 🚀 Fonctionnalités techniques

- **Canvas HTML5** pour des performances optimales
- **Touch events natifs** pour la réactivité mobile
- **Système de particules** pour les effets visuels
- **Audio contextuel** pour le feedback sonore
- **Sauvegarde locale** des statistiques

## 🎯 Accessibilité

- **Contraste élevé** : Support du mode de contraste élevé système
- **Mouvement réduit** : Respect des préférences de mouvement réduit
- **Dark mode** : Adaptation automatique au thème système
- **Tailles minimales** : Respect des guidelines d'accessibilité tactile (44px minimum)

## 🔧 Mode développeur

Activez le mode debug avec la touche **D** pour :
- Visualiser les zones cliquables en temps réel
- Zones vertes pour les verbes irréguliers (à cliquer)
- Zones rouges pour les mots réguliers (à éviter)
- Point central de chaque zone pour le debugging

## 🚀 Démarrage Rapide

### Lancement Local
```bash
cd enseignement/jeu/verbe-slicer
python3 -m http.server 8000
```

Puis ouvrir : `http://localhost:8000`

### Utilisation
1. Choisissez votre niveau de difficulté
2. Cliquez sur "Commencer l'aventure" 
3. Cliquez sur les **verbes irréguliers** uniquement
4. Évitez les verbes réguliers (sinon vous perdez une vie)
5. Progressez à travers 5 niveaux de difficulté croissante

## 📁 Fichiers Principaux

- `index.html` - **Jeu principal autonome** (version optimisée avec CSS intégré)
- `index-simple.html` - Version identique (pour tests)
- `index-original.html` - Version avec CSS/JS externes (legacy)
- `verbe-slicer-game.js` - Logique de jeu (utilisée par la version legacy)  
- `verbe-slicer-styles.css` - Styles (utilisés par la version legacy)
- `jeu-verbes.json` - Base de données des verbes (fallback disponible)

## 🎮 Niveaux de Jeu

1. **Infinitifs** (0-9 pts) - être, avoir, aller...
2. **Participes passés** (10-24 pts) - été, eu, allé...
3. **Futur** (25-44 pts) - serai, aurai, irai...
4. **Imparfait** (45-69 pts) - étais, avais, allais...
5. **Subjonctif** (70+ pts) - sois, aie, aille...

## ⚡ Contrôles

- **Clic gauche** : Trancher un verbe
- **Espace** : Pause/Reprendre
- **R** : Redémarrer la partie
- **Échap** : Mettre en pause

## 🏆 Fonctionnalités

- ✅ 5 niveaux progressifs avec seuils rapides
- ✅ 3 niveaux de difficulté (Facile, Normal, Difficile)
- ✅ **Interface unifiée** sans distinction visuelle (challenging !)
- ✅ **Base de données autonome** (88 verbes intégrés)
- ✅ Système de vies et de score
- ✅ Statistiques détaillées
- ✅ Interface responsive
- ✅ **Version autonome** - fonctionne sans serveur

## 🔧 Développement

Pour les développeurs et contributeurs, consultez le dossier `legacy/verbe-slicer/` qui contient :
- Fichiers de test et de débogage
- Documentation technique détaillée
- Historique des corrections

---

**Créé pour l'apprentissage du français langue étrangère (FLE)** 

*Version optimisée - Progression rapide - Design challenging* 