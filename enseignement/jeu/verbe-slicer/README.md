# ⚔️ Verbe Slicer - Jeu FLE

Un jeu d'action pour apprendre les verbes irréguliers français en s'amusant !

## 🎯 Description

**Verbe Slicer** est un jeu éducatif interactif où les apprenants doivent cliquer rapidement sur les verbes irréguliers qui tombent du ciel, tout en évitant les verbes réguliers. Plus vous progressez, plus les défis deviennent intéressants avec différents temps et modes verbaux.

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

## 📁 Structure des Fichiers

- `index.html` - Interface principale du jeu
- `verbe-slicer-game.js` - Logique du jeu et gameplay  
- `verbe-slicer-styles.css` - Styles et animations
- `jeu-verbes.json` - Base de données des verbes
- `legacy/` - Fichiers de développement et tests

## 🎮 Niveaux de Jeu

1. **Infinitifs** (0-24 pts) - être, avoir, aller...
2. **Participes passés** (25-49 pts) - été, eu, allé...
3. **Futur** (50-74 pts) - serai, aurai, irai...
4. **Imparfait** (75-99 pts) - étais, avais, allais...
5. **Subjonctif** (100+ pts) - sois, aie, aille...

## ⚡ Contrôles

- **Clic gauche** : Trancher un verbe
- **Espace** : Pause/Reprendre
- **R** : Redémarrer la partie
- **Échap** : Mettre en pause

## 🏆 Fonctionnalités

- ✅ 5 niveaux progressifs
- ✅ 3 niveaux de difficulté (Facile, Normal, Difficile)
- ✅ Effets visuels et sonores
- ✅ Système de vies et de score
- ✅ Statistiques détaillées
- ✅ Interface responsive
- ✅ Sauvegarde automatique des performances

## 🔧 Développement

Pour les développeurs et contributeurs, consultez le dossier `legacy/` qui contient :
- Fichiers de test et de débogage
- Documentation technique détaillée
- Historique des corrections

---

**Créé pour l'apprentissage du français langue étrangère (FLE)** 