# 🔧 Guide de Dépannage - Verbe Slicer

## Problèmes HTML5 et Solutions

### ✅ Vérifications Préliminaires

1. **Ouvrir `test.html`** pour diagnostiquer les problèmes
2. **Vérifier la console du navigateur** (F12) pour les erreurs
3. **S'assurer que tous les fichiers sont présents** :
   - `index.html`
   - `verbe-slicer-game.js`
   - `verbe-slicer-styles.css`
   - `jeu-verbes.json`

### 🚨 Problèmes Courants et Solutions

#### 1. Canvas ne s'affiche pas
**Symptômes :** Écran noir ou vide
**Solutions :**
- Vérifier que l'élément `<canvas id="game-canvas">` existe dans le HTML
- S'assurer que le CSS ne masque pas le canvas
- Vérifier la console pour l'erreur "Canvas element not found!"

#### 2. Erreur de chargement CSS
**Symptômes :** Interface non stylée
**Solutions :**
- Vérifier le chemin vers `game-styles.css` : `../../../css/game-styles.css`
- S'assurer que le fichier CSS global existe
- Vérifier les permissions de fichier

#### 3. Données JSON non chargées
**Symptômes :** Pas de mots qui tombent
**Solutions :**
- Vérifier que `jeu-verbes.json` est dans le même dossier
- Tester le chargement avec `test.html`
- Vérifier la syntaxe JSON (pas de virgules en trop)

#### 4. Audio ne fonctionne pas
**Symptômes :** Pas de sons
**Solutions :**
- Les sons sont générés par Web Audio API (pas de fichiers requis)
- Certains navigateurs bloquent l'audio sans interaction utilisateur
- Cliquer d'abord sur "Commencer l'aventure" pour activer l'audio

#### 5. Jeu ne démarre pas
**Symptômes :** Bouton "Commencer" ne répond pas
**Solutions :**
- Vérifier la console pour les erreurs JavaScript
- S'assurer que la classe `VerbeSlicer` est définie
- Vérifier que `DOMContentLoaded` s'exécute correctement

### 🔍 Tests de Diagnostic

#### Test Canvas HTML5
```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 100);
```

#### Test Chargement JSON
```javascript
fetch('jeu-verbes.json')
  .then(response => response.json())
  .then(data => console.log('JSON chargé:', data))
  .catch(error => console.error('Erreur JSON:', error));
```

#### Test Audio Web API
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.connect(audioContext.destination);
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.1);
```

### 🌐 Compatibilité Navigateur

#### Navigateurs Supportés
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

#### Fonctionnalités Requises
- Canvas 2D Context
- Web Audio API
- ES6 Classes
- Fetch API
- RequestAnimationFrame

### 📱 Problèmes Mobile

#### Touch Events
- Les événements tactiles sont convertis en clics
- `preventDefault()` empêche le scroll pendant le jeu
- Tester sur différentes tailles d'écran

#### Performance
- Le jeu s'adapte automatiquement à la taille d'écran
- Réduction automatique du nombre de particules sur mobile
- Optimisation du framerate

### 🔧 Modifications Rapides

#### Désactiver l'Audio
```javascript
// Dans setupAudio(), commenter :
// this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
```

#### Mode Debug
```javascript
// Ajouter dans la classe VerbeSlicer :
this.debug = true;

// Dans render(), ajouter :
if (this.debug) {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`FPS: ${Math.round(1000/16)}`, 10, 30);
    this.ctx.fillText(`Words: ${this.fallingWords.length}`, 10, 50);
}
```

#### Réduire la Difficulté
```javascript
// Dans resetGameStats(), modifier :
this.spawnRate = 0.01; // Plus lent
this.wordSpeed = 0.5;  // Plus lent
this.maxWords = 5;     // Moins de mots
```

### 📋 Checklist de Dépannage

- [ ] Fichier `test.html` fonctionne
- [ ] Console sans erreurs
- [ ] Canvas s'affiche
- [ ] CSS chargé correctement
- [ ] JSON chargé sans erreur
- [ ] Audio fonctionne (optionnel)
- [ ] Clics détectés sur le canvas
- [ ] Mots apparaissent et tombent
- [ ] Interface utilisateur responsive

### 🆘 Si Rien ne Fonctionne

1. **Redémarrer le serveur web** (si utilisé)
2. **Vider le cache du navigateur** (Ctrl+F5)
3. **Tester dans un autre navigateur**
4. **Vérifier les permissions de fichier**
5. **Utiliser la version de fallback** (données intégrées dans le JS)

### 📞 Support

Si le problème persiste :
1. Ouvrir la console (F12)
2. Copier les messages d'erreur
3. Noter le navigateur et la version
4. Tester avec `test.html` et noter les résultats 