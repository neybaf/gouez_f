# 🔧 Guide de Diagnostic - Verbe Slicer

## 🚨 Problème : Le jeu ne se lance pas

Si la version actuelle du jeu Verbe Slicer ne fonctionne pas, suivez ce guide étape par étape.

## 📋 Étapes de diagnostic

### 1. **Tests automatiques**
Ouvrez les pages de test dans l'ordre suivant :

1. **`debug.html`** - Page de diagnostic complète avec tests interactifs
2. **`diagnostic.html`** - Tests automatiques au chargement
3. **`test-simple.html`** - Version simplifiée qui fonctionne toujours

### 2. **Vérifications rapides**

#### ✅ Fichiers requis
- `index.html` - Interface principale
- `verbe-slicer-game.js` - Logique de jeu
- `verbe-slicer-styles.css` - Styles spécifiques
- `jeu-verbes.json` - Données des verbes

#### ✅ Éléments HTML requis
- `#start-game-btn` - Bouton de démarrage
- `#game-canvas` - Canvas de jeu
- `.game-screen` - Écrans de jeu
- `.difficulty-btn` - Boutons de difficulté

### 3. **Problèmes courants**

#### 🔴 Erreur CORS (Cross-Origin)
**Symptôme :** Erreur lors du chargement du JSON
**Solution :** Utiliser un serveur HTTP local
```bash
# Dans le dossier verbe-slicer
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000
```

#### 🔴 Canvas non trouvé
**Symptôme :** "Canvas element not found!"
**Solution :** Vérifier que l'élément `#game-canvas` existe dans le HTML

#### 🔴 Script non chargé
**Symptôme :** "VerbeSlicer is not defined"
**Solution :** Vérifier le chemin vers `verbe-slicer-game.js`

#### 🔴 CSS manquant
**Symptôme :** Interface non stylée
**Solution :** Vérifier le chemin vers `../../../css/game-styles.css`

### 4. **Version de secours**

Si rien ne fonctionne, utilisez la **version legacy** :
- Ouvrir `legacy/jeu-verbes.html`
- Version simplifiée mais fonctionnelle
- Données intégrées dans le script

## 🛠️ Solutions spécifiques

### Solution 1 : Serveur local
```bash
cd enseignement/jeu/verbe-slicer
python3 -m http.server 8000
```

### Solution 2 : Version autonome
Utiliser `test-simple.html` qui ne dépend d'aucun fichier externe.

### Solution 3 : Debugging
1. Ouvrir `debug.html`
2. Lancer tous les tests
3. Identifier l'élément défaillant
4. Appliquer la correction correspondante

## 📊 Logs de débogage

La version corrigée inclut des logs détaillés :
- 🎮 Initialisation
- 📡 Configuration des événements
- 🔊 Audio
- 📊 Chargement des données
- 🎨 Canvas
- 🚀 Écran de démarrage

## 🔄 Versions disponibles

| Version | Fichier | État | Description |
|---------|---------|------|-------------|
| **Principale** | `index.html` | ⚠️ À corriger | Version complète moderne |
| **Simple** | `test-simple.html` | ✅ Fonctionne | Version test simplifiée |
| **Legacy** | `legacy/jeu-verbes.html` | ✅ Fonctionne | Ancienne version préservée |
| **Debug** | `debug.html` | ✅ Fonctionne | Page de diagnostic |

## 🎯 Actions recommandées

1. **Immédiat :** Tester `test-simple.html` pour vérifier que le concept fonctionne
2. **Debug :** Utiliser `debug.html` pour identifier le problème exact
3. **Correction :** Appliquer les corrections basées sur les logs
4. **Validation :** Retester la version principale

## 📞 Indicateurs de succès

✅ Le jeu se charge sans erreur  
✅ L'écran de démarrage s'affiche  
✅ Le bouton "Commencer" répond  
✅ Le canvas s'affiche et accepte les clics  
✅ Les verbes tombent du ciel  
✅ Le score se met à jour  

## 🔧 Modifications appliquées

### Dans `index.html` :
- Ajout de scripts de débogage
- Vérification des éléments DOM

### Dans `verbe-slicer-game.js` :
- Logs détaillés à chaque étape
- Gestion d'erreurs robuste
- Données de fallback étendues
- Validation des éléments DOM

### Nouveaux fichiers :
- `test-simple.html` - Version test garantie
- `debug.html` - Suite de tests complète
- `DIAGNOSTIC.md` - Ce guide 