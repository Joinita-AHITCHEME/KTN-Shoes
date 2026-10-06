-- ======================================================
-- SCHÉMA DE LA BASE DE DONNÉES — KTN SHOES
-- Système : SQLite
-- ======================================================

PRAGMA foreign_keys = ON;

-- 1. TABLE PRODUITS
CREATE TABLE IF NOT EXISTS produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    categorie TEXT NOT NULL CHECK(categorie IN ('homme', 'femme', 'enfant')),
    categorie_label TEXT NOT NULL,
    type TEXT NOT NULL,
    prix INTEGER NOT NULL CHECK(prix > 0),
    note INTEGER DEFAULT 5,
    badge TEXT,
    image TEXT NOT NULL,
    images TEXT NOT NULL,       -- Tableau JSON : ["images/ktn-runner1.jpg", ...]
    tailles TEXT NOT NULL,      -- Tableau JSON : [40, 41, 42, 43, 44, 45]
    description TEXT NOT NULL,
    details TEXT NOT NULL,      -- Tableau JSON : ["Tige textile...", ...]
    actif INTEGER DEFAULT 1,    -- 1 = actif (en vente), 0 = archivé
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE STOCKS (Quantité disponible par pointure)
CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produit_id INTEGER NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    pointure INTEGER NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 10 CHECK(quantite >= 0),
    UNIQUE(produit_id, pointure)
);

-- 3. TABLE CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT,
    email TEXT,
    telephone TEXT NOT NULL,
    adresse TEXT NOT NULL,
    ville TEXT DEFAULT 'Cotonou',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE COMMANDES
CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT UNIQUE NOT NULL, -- Ex: "KTN-784512"
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    sous_total INTEGER NOT NULL,
    frais_livraison INTEGER NOT NULL DEFAULT 1000,
    total INTEGER NOT NULL,
    statut TEXT NOT NULL DEFAULT 'en_attente' CHECK(statut IN ('en_attente', 'confirmee', 'en_livraison', 'livree', 'annulee')),
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE LIGNES_COMMANDE (Détail de chaque article acheté)
CREATE TABLE IF NOT EXISTS lignes_commande (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commande_id INTEGER NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
    produit_id INTEGER NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
    pointure INTEGER NOT NULL,
    quantite INTEGER NOT NULL CHECK(quantite > 0),
    prix_unitaire INTEGER NOT NULL CHECK(prix_unitaire > 0),
    sous_total INTEGER NOT NULL
);

-- 6. TABLE MESSAGES (Formulaire de contact)
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    sujet TEXT NOT NULL,
    message TEXT NOT NULL,
    lu INTEGER DEFAULT 0, -- 0 = non lu, 1 = lu
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE ADMINISTRATEURS (Accès espace vendeur)
CREATE TABLE IF NOT EXISTS administrateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifiant TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL, -- Haché avec bcrypt
    nom_complet TEXT DEFAULT 'Administrateur KTN',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);
