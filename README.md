# KTN Shoes

Boutique e-commerce de chaussures pour homme, femme et enfant. Projet réalisé en **HTML, CSS et JavaScript pur** — sans framework, sans backend. Les données produits sont stockées dans un fichier JavaScript local, et le panier, les favoris et le thème sont gérés côté client via `localStorage`.

## Aperçu

KTN Shoes permet de parcourir un catalogue de 12 modèles, filtrables par catégorie (homme / femme / enfant), de consulter chaque produit en détail (tailles, quantité, produits similaires), d'ajouter des articles à un panier persistant, et de basculer entre un thème clair et un thème sombre.

## Fonctionnalités

- **Catalogue filtrable** — filtre par catégorie en JavaScript pur, sans rechargement de page
- **Page produit dynamique** — une seule page (`produit.html`) qui se construit selon l'`id` passé dans l'URL, avec galerie d'images, sélecteur de taille, sélecteur de quantité et suggestions de produits similaires
- **Panier persistant** — ajout, modification de quantité, suppression, calcul du sous-total/livraison/total, sauvegardé en `localStorage` (survit à la fermeture du navigateur)
- **Favoris** — système de favoris (♡ / ♥) également persistant
- **Mode sombre** — bascule clair/sombre, détecte la préférence système au premier chargement, mémorise le choix de l'utilisateur
- **Responsive** — adapté du mobile au desktop (breakpoints à 600px, 850px et 1050px)
- **Aucune dépendance externe** — aucun framework, aucune librairie, aucun backend

## Structure du projet

```
KTN-Shoes/
├── index.html              # Page d'accueil
├── catalogue.html           # Catalogue complet (12 produits, filtrable)
├── produit.html              # Page produit dynamique (lit ?id= dans l'URL)
├── panier.html               # Page panier
├── css/
│   ├── style.css              # Styles principaux (variables, layout, composants)
│   └── ajouts.css             # Styles additionnels (page produit, panier, toast)
├── js/
│   ├── produits.js            # Base de données des 12 produits (source de vérité unique)
│   └── script.js              # Logique : panier, favoris, filtres, thème, rendu dynamique
└── images/                     # Visuels produits et illustrations
```

## Technologies

- HTML5 sémantique
- CSS3 (variables custom properties, Grid, Flexbox, animations)
- JavaScript (ES6+, aucune dépendance)
- `localStorage` pour la persistance des données (panier, favoris, thème)

## Lancer le projet

Aucune installation nécessaire. Ouvrez simplement `index.html` dans un navigateur, ou servez le dossier avec un petit serveur local (recommandé pour éviter les soucis de chemins relatifs) :

```bash
# avec Python
python -m http.server 8000

# ou avec l'extension Live Server de VS Code
```
Puis rendez-vous sur `http://localhost:8000`.

## Limitations connues

- Projet de démonstration sans backend réel : aucune commande n'est réellement traitée (le bouton "Valider la commande" vide simplement le panier)
- Les données produits sont statiques (modifiables dans `js/produits.js`)
- Pas de système de compte utilisateur / authentification

## Auteur
AHITCHEME Joinita