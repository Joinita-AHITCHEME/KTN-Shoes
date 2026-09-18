# 👟 KTN Shoes — Boutique E-commerce

[![Demo GitHub Pages](https://img.shields.io/badge/Demo-En_Ligne-25d366?style=for-the-badge&logo=github)](https://joinita-ahitcheme.github.io/KTN-Shoes/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

> Boutique e-commerce moderne de chaussures pour homme, femme et enfant. Projet conçu en **Vanilla HTML5, CSS3 et JavaScript ES6** — sans framework, sans dépendance externe et sans serveur backend.

🌐 **Démo en ligne** : [https://joinita-ahitcheme.github.io/KTN-Shoes/](https://joinita-ahitcheme.github.io/KTN-Shoes/)

---

## 📌 Aperçu

**KTN Shoes** propose une expérience d'achat fluide et interactive : exploration d'un catalogue de 12 modèles de chaussures, recherche instantanée, tri multicritère, filtrage par catégorie (Homme, Femme, Enfant), consultation détaillée avec galerie photos multi-angles, sélection des pointures et gestion d'un panier persistant avec finalisation directe sur WhatsApp.

---

## ✨ Fonctionnalités clés

- 🔍 **Recherche instantanée & Tri multicritère** :
  - Recherche textuelle en temps réel (par nom, description ou catégorie).
  - Tri par prix (croissant / décroissant), ordre alphabétique (A-Z) et meilleures notes.
  - Filtres par catégorie sans rechargement de page.

- 👟 **Fiche produit dynamique (`produit.html`)** :
  - Génération dynamique via le paramètre d'URL `?id=`.
  - Galerie d'images interactive avec 3 vues distinctes par modèle.
  - Sélecteur interactif de pointures et de quantité.
  - Suggestions de produits similaires de la même catégorie.

- 🛒 **Panier d'achat persistant (`panier.html`)** :
  - Ajout, ajustement des quantités et suppression d'articles.
  - Calcul automatique du sous-total, des frais de livraison et du montant total.
  - Persistance complète dans le `localStorage` (survit au rechargement et à la fermeture du navigateur).
  - Pastille d'articles mise à jour en temps réel dans l'en-tête sur toutes les pages.

- 💬 **Confirmation de commande & Checkout WhatsApp** :
  - Génération d'une référence unique de commande (`KTN-XXXXXX`).
  - Boîte modale récapitulative détaillée (articles, pointures, total à régler).
  - Bouton interactif pour transmettre et finaliser la commande directement sur WhatsApp avec message préformaté (`wa.me`).
  - Fermeture intuitive de la modale (bouton dédié, clic hors du cadre ou touche <kbd>Échap</kbd>).

- 💖 **Système de favoris persistant** :
  - Ajout/retrait des paires favorites (♡ / ♥) sauvegardé dans le navigateur.

- 🌓 **Thème Clair / Sombre (Dark Mode)** :
  - Détection automatique de la préférence système (`prefers-color-scheme`).
  - Bascule manuelle instantanée avec mémorisation du choix utilisateur.
  - Contrastes de couleurs optimisés selon les normes d'accessibilité WCAG AA.

- 📱 **Responsive & Ergonomie mobile** :
  - Mise en page adaptative fluide du mobile au grand écran (CSS Grid & Flexbox).
  - Menu hamburger avec fermeture automatique lors du clic sur un lien de navigation ou par la touche <kbd>Échap</kbd>.

- 🚀 **SEO & Données Structurées** :
  - Métadonnées Open Graph (Facebook, WhatsApp) et Twitter Cards sur chaque page.
  - Balises `<link rel="canonical">` et métadonnées d'indexation.
  - Intégration de données structurées Schema.org JSON-LD (`ShoeStore`, `ItemList`, `Product`).

- ♿ **Accessibilité (a11y)** :
  - Rôles et attributs ARIA (`role="dialog"`, `aria-label`, etc.).
  - Vocalisation pour lecteurs d'écran (notes par étoiles avec descriptif clair).

---

## 📁 Structure du projet

```
KTN-Shoes/
├── index.html              # Page d'accueil (vitrine, collections phares, contact, avis)
├── catalogue.html          # Catalogue complet (12 produits, recherche, tri et filtres)
├── produit.html            # Fiche produit dynamique (lit ?id= dans l'URL)
├── panier.html             # Panier interactif et checkout WhatsApp
├── css/
│   └── style.css           # Feuilles de styles (variables CSS, responsive, thème sombre, modale)
├── js/
│   ├── produits.js         # Base de données locale des 12 produits (source unique)
│   └── script.js           # Moteur JS (panier, filtres, tri, recherche, thème, modale)
├── images/                 # Photographies des modèles et assets visuels
└── README.md               # Documentation du projet
```

---

## 🛠️ Technologies utilisées

- **HTML5 sémantique**
- **CSS3** (Variables custom properties, Grid, Flexbox, Animations & transitions fluides)
- **JavaScript (ES6+)** pur (Vanilla JS, 0 dépendance, 0 framework)
- **Web Storage API (`localStorage`)** pour la persistance locale

---

## 🚀 Lancer le projet en local

Aucune installation complexe ni commande de build n'est nécessaire.

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/Joinita-AHITCHEME/KTN-Shoes.git
   cd KTN-Shoes
   ```

2. **Ouvrir le projet :**
   - Double-cliquez simplement sur `index.html` pour l'ouvrir dans votre navigateur.
   - Ou lancez un serveur local léger :
     ```bash
     # Avec Python 3
     python -m http.server 8000

     # Ou via l'extension VS Code "Live Server"
     ```
   - Rendez-vous sur `http://localhost:8000`.

---

## ℹ️ Choix de conception & Spécifications

- **100% Client-Side** : Conformément aux consignes pédagogiques du projet, aucun serveur backend ou base de données SQL/NoSQL n'est utilisé.
- **Gestion des commandes** : La validation de commande est simulée en mémoire locale et propose une passerelle directe vers WhatsApp pour la finalisation avec le service client.
- **Données produits** : Les données sont centralisées dans `js/produits.js`, permettant d'ajouter ou modifier aisément des paires sans toucher au code HTML.

---

## 👤 Auteur

**AHITCHEME Joinita**  
- GitHub : [@Joinita-AHITCHEME](https://github.com/Joinita-AHITCHEME)  
- Contact : joinita.ahitcheme@gmail.com
