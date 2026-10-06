// ======================================================
// SCRIPT DE REMPLISSAGE (SEED) — KTN SHOES
// Importe les 12 produits du frontend dans la base SQLite
// ======================================================

const path = require('path');
const db = require('./db');

const { PRODUITS } = require('../../js/produits');

console.log('--- DÉBUT DE L\'IMPORTATION DES PRODUITS ---');

const insererProduit = db.prepare(`
    INSERT INTO produits (
        id, nom, categorie, categorie_label, type, prix, note,
        badge, image, images, tailles, description, details, actif
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, 1
    )
`);

const insererStock = db.prepare(`
    INSERT INTO stocks (
        produit_id, pointure, quantite
    ) VALUES (
        ?, ?, ?
    )
`);

db.exec('DELETE FROM lignes_commande;');
db.exec('DELETE FROM commandes;');
db.exec('DELETE FROM stocks;');
db.exec('DELETE FROM produits;');

let totalProduits = 0;
let totalPointures = 0;

for (const p of PRODUITS) {
    insererProduit.run(
        p.id,
        p.nom,
        p.categorie,
        p.categorieLabel,
        p.type,
        p.prix,
        p.note,
        p.badge || null,
        p.image,
        JSON.stringify(p.images),
        JSON.stringify(p.tailles),
        p.description,
        JSON.stringify(p.details)
    );
    totalProduits++;

    for (const pointure of p.tailles) {
        insererStock.run(p.id, pointure, 10);
        totalPointures++;
    }
}

console.log(`✅ ${totalProduits} produits importés dans la table 'produits' !`);
console.log(`✅ ${totalPointures} lignes de stock créées dans la table 'stocks' !`);
console.log('--- IMPORTATION TERMINÉE AVEC SUCCÈS ---');
