# Accessibilité du site depuis la Chine

## 🚫 Problèmes identifiés

### **1. CDN unpkg.com (CRITIQUE)**
- **Localisation** : `recherches/mymap.html` et `recherches/carte-population-enseignante.html`
- **Problème** : `https://unpkg.com/leaflet@1.3.1/dist/images/`
- **Impact** : Les icônes des cartes Leaflet ne se chargent pas
- **Status** : unpkg.com est souvent bloqué en Chine

### **2. Serveurs de tuiles cartographiques**
- **OpenStreetMap** : `https://tile.openstreetmap.org/`
- **CartoDb** : `https://basemaps.cartocdn.com/`
- **Autres** : StadiaMap, Mapbox, TomTom, etc.
- **Impact** : Les cartes peuvent ne pas s'afficher ou être très lentes

### **3. Services tiers**
- **Zotero.org** : `https://www.zotero.org/groups/5560949/sinofrancophonie`
- **Impact** : Liens vers bibliothèque Zotero inaccessibles

## ✅ Solutions mises en place

### **1. Images Leaflet locales**
- ✅ Téléchargé `marker-icon.png`, `marker-shadow.png`, `marker-icon-2x.png`
- ✅ Stockées dans `css/leaflet-images/`
- 🔧 **À faire** : Modifier les fichiers HTML pour pointer vers ces ressources locales

### **2. Serveurs de tuiles alternatifs**
- 🔧 **À faire** : Configurer des serveurs de tuiles accessibles depuis la Chine
- **Options** :
  - Amap (高德地图) - Serveur chinois
  - Baidu Maps - Serveur chinois
  - Serveurs OSM en cache local

## 🔧 Actions recommandées

### **Priorité 1 - Fixes critiques**
1. **Remplacer unpkg.com** dans les cartes Leaflet
2. **Tester serveurs de tuiles alternatifs**
3. **Ajouter détection géolocalisation** pour servir différents contenus

### **Priorité 2 - Améliorations**
1. **Version allégée du site** sans cartes pour la Chine
2. **Serveur miroir** hébergé en Asie
3. **CDN géographique** avec serveurs en Chine

### **Priorité 3 - Monitoring**
1. **Tests d'accessibilité** réguliers depuis la Chine
2. **Page de statut** pour informer les utilisateurs
3. **Liens de secours** vers versions alternatives

## 📋 Fichiers à modifier

### **Cartes Leaflet**
- `recherches/mymap.html` (ligne 1639)
- `recherches/carte-population-enseignante.html` (ligne 1861)

### **Changement requis**
```javascript
// Remplacer
_leaflet2["default"].Icon.Default.imagePath = "https://unpkg.com/leaflet@1.3.1/dist/images/";

// Par
_leaflet2["default"].Icon.Default.imagePath = "../css/leaflet-images/";
```

## 🌍 Alternatives pour l'hébergement

### **CDN compatibles Chine**
- **JSDelivr** (avec serveurs en Chine)
- **BootCDN** (hébergé en Chine)
- **75CDN** (spécifique Chine)

### **Serveurs de cartes**
- **AutoNavi/Amap** pour les cartes chinoises
- **Baidu Maps** alternative
- **Serveur local** avec tuiles en cache

## 📊 Tests recommandés

1. **VPN chinois** pour simuler l'accès
2. **Outils de test** : 
   - chinafirewalltest.com
   - comparitech.com/privacy-security-tools/blockedinchina/
3. **Monitoring continu** de l'accessibilité

## 🚀 Déploiement

Une fois les modifications effectuées :
1. Tester depuis la Chine
2. Vérifier les performances
3. Documenter les changements
4. Mettre en place monitoring

---
*Dernière mise à jour : Décembre 2024* 