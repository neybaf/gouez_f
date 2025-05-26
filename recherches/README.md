# Section Recherches - Documentation

## Vue d'ensemble

La section recherches a été entièrement refondée avec un design moderne et un ton académique approprié. Elle présente les travaux de recherche en didactique du FLE, géolinguistique et sinofrancophonie.

## Structure des fichiers

```
recherches/
├── index.html              # Page principale (nouvelle interface)
├── research.html           # Ancienne page (redirection automatique)
├── methodologie.html       # Page dédiée à la méthodologie
├── mymap.html             # Carte interactive Zhejiang
├── carte-population-enseignante.html  # Carte démographique
├── data/                  # Données de recherche
└── README.md              # Cette documentation
```

## Fonctionnalités

### Page principale (`index.html`)
- **Design moderne** : Interface responsive avec animations fluides
- **Navigation par onglets** : 4 sections principales
  - Projets de recherche
  - Publications
  - Ressources et outils
  - Équipe de recherche
- **Statistiques visuelles** : Indicateurs de performance
- **Ton académique** : Vocabulaire et présentation scientifiques

### Sections principales

#### 1. Projets de recherche
- Cartographie de la sinofrancophonie du Zhejiang
- Population enseignante du delta du Yangtsé
- Gamification en didactique du FLE
- Statuts de progression avec badges visuels

#### 2. Publications
- Format académique standard
- Résumés détaillés
- Statuts de publication (soumis, en préparation, publié)
- Citations et références

#### 3. Ressources
- Bibliothèque Zotero collaborative
- Plateforme de jeux FLE
- Données géolinguistiques
- Méthodologie de recherche

#### 4. Équipe
- Profils des chercheurs
- Rôles et spécialisations
- Biographies académiques

### Page méthodologie (`methodologie.html`)
- **Approches quantitatives** : Géolinguistique, statistiques
- **Outils techniques** : R, QGIS, Python, LimeSurvey
- **Protocoles d'enquête** : Phases détaillées
- **Considérations éthiques** : Consentement, anonymisation
- **Indicateurs de qualité** : Métriques de validation

## Styles CSS

Le fichier `/css/research-styles.css` définit :
- **Variables CSS** : Couleurs académiques (bleu marine, gris)
- **Typographie** : Police serif pour le ton académique
- **Composants** : Cartes, badges, citations, statistiques
- **Animations** : Transitions fluides, effets de survol
- **Responsive** : Adaptation mobile et tablette

## Caractéristiques techniques

### Accessibilité
- Navigation au clavier
- Contrastes respectés
- Textes alternatifs
- Structure sémantique

### Performance
- CSS optimisé
- Images compressées
- Chargement progressif
- Animations GPU

### SEO
- Métadonnées complètes
- Structure HTML5 sémantique
- URLs descriptives
- Contenu structuré

## Intégration avec le site

### Liens entrants
- Navigation principale du site
- Références croisées depuis la section enseignement
- Liens depuis les jeux FLE

### Liens sortants
- Bibliothèque Zotero externe
- Cartes interactives R/Leaflet
- Plateforme de jeux éducatifs

## Maintenance

### Mise à jour du contenu
1. **Nouveaux projets** : Ajouter dans la grille `projects-grid`
2. **Publications** : Mettre à jour la liste `publication-list`
3. **Équipe** : Modifier la grille `team-grid`
4. **Statistiques** : Actualiser les compteurs dans `stats-grid`

### Évolutions techniques
- Ajouter de nouvelles sections via les onglets
- Intégrer des visualisations de données
- Connecter avec des APIs de recherche
- Implémenter un système de filtrage

## Compatibilité

- **Navigateurs** : Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Appareils** : Desktop, tablette, mobile
- **Résolutions** : 320px à 1920px+
- **Technologies** : HTML5, CSS3, JavaScript ES6+

## Notes de développement

### Choix de design
- **Couleurs** : Palette académique sobre et professionnelle
- **Typographie** : Georgia pour la lisibilité et le sérieux
- **Espacement** : Grille cohérente avec le reste du site
- **Animations** : Subtiles pour ne pas distraire du contenu

### Optimisations futures
- Système de recherche dans les publications
- Filtres par année, type, statut
- Intégration avec ORCID
- Export des références bibliographiques
- Tableau de bord analytique 