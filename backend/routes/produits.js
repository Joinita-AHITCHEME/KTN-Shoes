// ======================================================
// ROUTES API PRODUITS — KTN SHOES
// Endpoints :
//   GET /api/produits        -> Liste avec filtres, recherche et tri
//   GET /api/produits/:id    -> Détail d'un produit avec ses stocks par pointure
// ======================================================

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middlewares/auth');

function formaterProduit(p) {
    if (!p) return null;
    return {
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        tailles: typeof p.tailles === 'string' ? JSON.parse(p.tailles) : p.tailles,
        details: typeof p.details === 'string' ? JSON.parse(p.details) : p.details,
        categorieLabel: p.categorie_label
    };
}

router.get('/', (req, res) => {
    try {
        const { categorie, search, recherche, tri } = req.query;
        const termeRecherche = search || recherche;

        let sql = `SELECT * FROM produits WHERE actif = 1`;
        const params = [];

        if (categorie && categorie !== 'tous') {
            sql += ` AND categorie = ?`;
            params.push(categorie.toLowerCase());
        }

        if (termeRecherche && termeRecherche.trim() !== '') {
            sql += ` AND (nom LIKE ? OR description LIKE ? OR type LIKE ?)`;
            const motif = `%${termeRecherche.trim()}%`;
            params.push(motif, motif, motif);
        }

        switch (tri) {
            case 'prix_asc':
            case 'prix-croissant':
                sql += ` ORDER BY prix ASC`;
                break;
            case 'prix_desc':
            case 'prix-decroissant':
                sql += ` ORDER BY prix DESC`;
                break;
            case 'nom_asc':
            case 'nom':
                sql += ` ORDER BY nom ASC`;
                break;
            case 'note_desc':
            case 'note':
                sql += ` ORDER BY note DESC, id ASC`;
                break;
            default:
                sql += ` ORDER BY id ASC`;
                break;
        }

        const lignes = db.prepare(sql).all(...params);
        const produits = lignes.map(formaterProduit);

        res.json({
            statut: 'succes',
            total: produits.length,
            donnees: produits
        });
    } catch (erreur) {
        console.error('Erreur récupération produits :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de la récupération des produits'
        });
    }
});

router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                statut: 'erreur',
                message: "L'identifiant du produit doit être un nombre valide."
            });
        }

        const produit = db.prepare('SELECT * FROM produits WHERE id = ? AND actif = 1').get(id);

        if (!produit) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Aucun produit trouvé avec l'identifiant ${id}.`
            });
        }

        const stocks = db.prepare(`
            SELECT pointure, quantite 
            FROM stocks 
            WHERE produit_id = ? 
            ORDER BY pointure ASC
        `).all(id);

        res.json({
            statut: 'succes',
            donnees: {
                ...formaterProduit(produit),
                stocks
            }
        });
    } catch (erreur) {
        console.error('Erreur récupération produit id :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur'
        });
    }
});

router.get('/stocks/complet', authMiddleware, (req, res) => {
    try {
        const produits = db.prepare('SELECT id, nom, categorie, prix, image, actif FROM produits ORDER BY id ASC').all();
        const tousLesStocks = db.prepare('SELECT produit_id, pointure, quantite FROM stocks ORDER BY produit_id, pointure ASC').all();

        const stocksParProduit = {};
        for (const s of tousLesStocks) {
            if (!stocksParProduit[s.produit_id]) {
                stocksParProduit[s.produit_id] = [];
            }
            stocksParProduit[s.produit_id].push({ pointure: s.pointure, quantite: s.quantite });
        }

        const donnees = produits.map(p => ({
            ...p,
            stocks: stocksParProduit[p.id] || []
        }));

        res.json({
            statut: 'succes',
            total: donnees.length,
            donnees
        });
    } catch (erreur) {
        console.error('Erreur stocks complets :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne lors de la récupération des stocks.'
        });
    }
});

router.patch('/:id/stocks', authMiddleware, (req, res) => {
    try {
        const produitId = parseInt(req.params.id, 10);
        const { pointure, quantite } = req.body;

        const pt = parseInt(pointure, 10);
        const qte = parseInt(quantite, 10);

        if (isNaN(produitId) || isNaN(pt) || isNaN(qte) || qte < 0) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Pointure ou quantité invalide.'
            });
        }

        const ligne = db.prepare('SELECT id FROM stocks WHERE produit_id = ? AND pointure = ?').get(produitId, pt);
        if (!ligne) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Pointure ${pt} non trouvée pour le produit #${produitId}.`
            });
        }

        db.prepare('UPDATE stocks SET quantite = ? WHERE produit_id = ? AND pointure = ?').run(qte, produitId, pt);

        res.json({
            statut: 'succes',
            message: `Stock mis à jour : Produit #${produitId}, Pointure ${pt} = ${qte} paire(s).`,
            donnees: { produitId, pointure: pt, nouvelleQuantite: qte }
        });
    } catch (erreur) {
        console.error('Erreur mise à jour stock :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne lors de la mise à jour du stock.'
        });
    }
});

module.exports = router;
