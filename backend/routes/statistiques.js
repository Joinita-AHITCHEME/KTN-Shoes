// ======================================================
// ROUTES API STATISTIQUES — DASHBOARD VENDEUR
// ======================================================

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, (req, res) => {
    try {
        const statsCommandes = db.prepare(`
            SELECT 
                COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN statut != 'annulee' THEN total ELSE 0 END), 0) AS chiffreAffaires,
                COALESCE(SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END), 0) AS enAttente,
                COALESCE(SUM(CASE WHEN statut = 'confirmee' THEN 1 ELSE 0 END), 0) AS confirmees,
                COALESCE(SUM(CASE WHEN statut = 'en_livraison' THEN 1 ELSE 0 END), 0) AS enLivraison,
                COALESCE(SUM(CASE WHEN statut = 'livree' THEN 1 ELSE 0 END), 0) AS livrees,
                COALESCE(SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END), 0) AS annulees
            FROM commandes
        `).get();

        const statsMessages = db.prepare(`
            SELECT 
                COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN lu = 0 THEN 1 ELSE 0 END), 0) AS nonLus
            FROM messages
        `).get();

        const statsProduits = db.prepare(`
            SELECT 
                COUNT(*) AS total,
                (SELECT COALESCE(SUM(quantite), 0) FROM stocks) AS totalPairesEnStock,
                (SELECT COUNT(*) FROM stocks WHERE quantite <= 3) AS alertesStockBas
            FROM produits WHERE actif = 1
        `).get();

        const dernieresCommandes = db.prepare(`
            SELECT c.id, c.reference, c.total, c.statut, c.date_commande,
                   cl.nom AS client_nom, cl.prenom AS client_prenom, cl.telephone AS client_telephone
            FROM commandes c
            JOIN clients cl ON c.client_id = cl.id
            ORDER BY c.date_commande DESC
            LIMIT 5
        `).all();

        res.json({
            statut: 'succes',
            donnees: {
                commandes: statsCommandes,
                messages: statsMessages,
                produits: statsProduits,
                dernieresCommandes
            }
        });
    } catch (erreur) {
        console.error('Erreur statistiques :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur lors de la récupération des statistiques.'
        });
    }
});

module.exports = router;
