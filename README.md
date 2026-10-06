# 👟 KTN Shoes — Boutique E-commerce Full-Stack

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-API_REST-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-node:sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT_&_Bcrypt-D63AFF?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS_ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Demo GitHub](https://img.shields.io/badge/GitHub_Pages-En_Ligne-25d366?style=for-the-badge&logo=github)](https://joinita-ahitcheme.github.io/KTN-Shoes/)

> **KTN Shoes** est une application web e-commerce moderne et complète conçue pour la vente de chaussures (Homme, Femme, Enfant).  
> Le projet allie un **frontend Vanilla réactif et accessible** à une **architecture backend robuste en Node.js, Express et SQLite**, dotée d'une authentification sécurisée par **JWT**, d'une gestion transactionnelle des stocks et d'un **espace vendeur (Dashboard administrateur)** dédié.

---

## 🏗️ Architecture Globale du Projet

L'application repose sur un découpage clair et modulaire entre l'interface utilisateur et le serveur d'API :

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│   • index.html (Accueil & Formulaire Contact)               │
│   • catalogue.html (Recherche, Tri, Filtres)                │
│   • produit.html (Fiche détaillée & Stocks par pointure)    │
│   • panier.html (Panier persistant & Formulaire commande)   │
│   • admin.html (Dashboard Gérant SPA)                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Requêtes HTTP / Fetch (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API BACKEND (Express)                    │
│   • /api/produits     : Catalogue, recherche, tri, stocks   │
│   • /api/commandes    : Transactions SQL, décrémentation    │
│   • /api/messages     : Formulaire contact & notifications  │
│   • /api/auth         : Login JWT & hachage bcrypt          │
│   • /api/statistiques : Indicateurs KPI pour le gérant      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Requêtes SQL Préparées
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BASE DE DONNÉES (SQLite)                    │
│   produits │ stocks │ clients │ commandes │ lignes_commande │
│                     messages │ administrateurs              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Démarrage Rapide (En 2 minutes)

### Prérequis
* [Node.js](https://nodejs.org/) (version 20+ ou 24 recommandée)

### 1. Cloner le projet
```bash
git clone git@github.com:Joinita-AHITCHEME/KTN-Shoes.git
cd KTN-Shoes
```

### 2. Configurer et lancer le backend
```bash
cd backend
npm install
npm run setup     # Crée les 7 tables SQL, importe les 12 produits et l'administrateur
npm start         # Démarre l'API sur http://localhost:3000
```

### 3. Ouvrir l'application
* **Boutique client** : Ouvrez simplement `index.html` dans votre navigateur (ou via une extension Live Server).
* **Espace d'administration (Gérante)** : Ouvrez `admin.html` dans votre navigateur.

---

## 🔐 Identifiants Administrateur par Défaut

Pour vous connecter au **Dashboard Vendeur** (`admin.html`) :
* **Identifiant** : `admin` *(ou `silverktn407@gmail.com`)*
* **Mot de passe** : `KtnShoes@2026!`

---

## 📦 Les 8 Étapes du Développement Backend

| Étape | Intitulé | Fonctionnalités clés |
|---|---|---|
| **1** | **Environnement & Serveur** | Initialisation Node.js, framework Express, CORS, parseur JSON, endpoint santé `GET /api/status`. |
| **2** | **Base de données SQLite** | Utilisation du moteur natif haute performance `node:sqlite`. Création des 7 tables relationnelles avec contraintes et clés étrangères. |
| **3** | **API Catalogue & Seed** | Importation initiale des 12 produits et de 71 lignes de stocks. Routes `GET /api/produits` (recherche SQL LIKE, tri, filtres) et `GET /api/produits/:id`. |
| **4** | **API Commandes & Stocks** | Calcul sécurisé des montants côté serveur, transaction SQL atomique (`BEGIN`/`COMMIT`/`ROLLBACK`), décrémentation des stocks par pointure, lien WhatsApp certifié, annulation avec restitution automatique du stock. |
| **5** | **Contact & Messages** | Route `POST /api/messages` avec validation stricte, notification console vendeur en temps réel, formulaire interactif sur `index.html` avec feedbacks visuels et spinner. |
| **6** | **Sécurité & JWT** | Hachage irréversible des mots de passe avec `bcryptjs`, génération de tokens de session signés `jsonwebtoken` (24h), middleware protecteur `authMiddleware`. |
| **7** | **Dashboard Vendeur** | Interface de gestion complète (`admin.html`) : KPIs en direct, suivi et changement de statut des commandes, mise à jour des stocks par pointure en direct, boîte de réception client. |
| **8** | **Connexion Frontend** | Intégration des requêtes `fetch()` sur l'ensemble du site avec **fallback gracieux** (l'application fonctionne toujours même si le serveur backend n'est pas démarré). |

---

## 📡 Documentation des Endpoints de l'API REST

Toutes les URLs sont préfixées par `http://localhost:3000/api`.

### 👟 Produits & Stocks
| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/produits` | Public | Liste des produits avec filtres (`?categorie=`), recherche (`?search=`) et tri (`?tri=`). |
| `GET` | `/produits/:id` | Public | Détail complet d'un modèle avec ses stocks par pointure. |
| `GET` | `/produits/stocks/complet` | 🔒 Admin | Vue inventaire complète des 12 produits et de tous leurs stocks. |
| `PATCH` | `/produits/:id/stocks` | 🔒 Admin | Modifie la quantité d'une pointure (`{ pointure: 42, quantite: 15 }`). |

### 📦 Commandes
| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/commandes` | Public | Enregistre une commande, vérifie et décrémente les stocks en transaction SQL atomique. |
| `GET` | `/commandes` | 🔒 Admin | Liste des commandes clients (filtrable par statut `?statut=`). |
| `GET` | `/commandes/:id` | 🔒 Admin | Consultation détaillée d'une commande et de ses articles. |
| `PATCH` | `/commandes/:id/statut` | 🔒 Admin | Met à jour le statut (`en_attente`, `confirmee`, `en_livraison`, `livree`, `annulee`). |

### 📬 Messages de Contact
| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/messages` | Public | Envoie un message depuis le formulaire de contact du site. |
| `GET` | `/messages` | 🔒 Admin | Consulte la boîte de réception (filtrable par `?lu=0` ou `?lu=1`). |
| `PATCH` | `/messages/:id/lu` | 🔒 Admin | Marque un message comme lu ou non lu. |
| `DELETE` | `/messages/:id` | 🔒 Admin | Supprime un message traité. |

### 🔑 Authentification & Sécurité
| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Connexion administrateur et génération du token JWT. |
| `GET` | `/auth/profil` | 🔒 Admin | Récupère les données du compte connecté via le token. |
| `POST` | `/auth/changer-mot-de-passe` | 🔒 Admin | Modifie le mot de passe de l'administrateur. |

### 📊 Statistiques Dashboard
| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/statistiques` | 🔒 Admin | Chiffre d'affaires cumulé, compteurs de commandes, stocks et messages non lus. |

---

## 🗄️ Structure de la Base de Données (`ktn_shoes.db`)

La base de données relationnelle SQLite est composée de 7 tables :

1. **`produits`** : Informations des modèles (nom, catégorie, type, prix, note, images, description, actif).
2. **`stocks`** : Quantité disponible par couple (produit_id, pointure).
3. **`clients`** : Coordonnées des acheteurs (nom, prénom, téléphone, adresse, ville).
4. **`commandes`** : Commandes globales (référence unique `KTN-XXXXXX`, client_id, montants, statut).
5. **`lignes_commande`** : Détail de chaque paire commandée (commande_id, produit_id, pointure, quantite, prix).
6. **`messages`** : Messages du formulaire de contact (nom, email, téléphone, sujet, message, état de lecture).
7. **`administrateurs`** : Comptes d'accès au dashboard (identifiant, email, hash bcrypt).

---

## 🛡️ Résilience & Dégradation Gracieuse (Offline-first)

L'application a été conçue pour être **100% robuste** :
* Si le serveur backend est démarré (`npm start`), le frontend tire parti de toute la puissance de l'API (validation de commande certifiée en base, vérification des stocks, synchronisation en direct).
* Si le backend n'est pas encore démarré par l'évaluateur, le frontend bascule automatiquement sur les données locales du fichier `js/produits.js` et sur la simulation de commande WhatsApp. **Le site ne plante jamais et reste toujours présentable !**

---

## 👥 Auteur & Crédits

* **Créatrice du projet** : Joinita AHITCHEME
* **Boutique** : KTN Shoes
* **Année** : 2026
* **Localisation** : Cotonou, Bénin
