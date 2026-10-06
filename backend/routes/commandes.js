// ======================================================
// ROUTES API COMMANDES — KTN SHOES
// Endpoints :
//   POST  /api/commandes            -> Enregistrer une commande avec vérification de stock
//   GET   /api/commandes            -> Liste de toutes les commandes (vendeur)
//   GET   /api/commandes/:id        -> Détail d'une commande par son ID
//   PATCH /api/commandes/:id/statut -> Modifier le statut d'une commande
// ======================================================

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middlewares/auth');

const FRAIS_LIVRAISON_DEFAUT = 1000;
const TELEPHONE_VENDEUR = "2290153539873";
const STATUTS_VALIDES = ['en_attente', 'confirmee', 'en_livraison', 'livree', 'annulee'];

function genererReference() {
    const chiffres = Math.floor(100000 + Math.random() * 900000);
    return `KTN-${chiffres}`;
}

router.post('/', (req, res) => {
    try {
        const { client, articles } = req.body;

        if (!client || typeof client !== 'object') {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Les informations du client sont requises.'
            });
        }

        const nom = (client.nom || '').trim();
        const prenom = (client.prenom || '').trim();
        const telephone = (client.telephone || '').trim();
        const adresse = (client.adresse || '').trim();
        const ville = (client.ville || 'Cotonou').trim();
        const email = (client.email || '').trim();

        if (!nom || !telephone || !adresse) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Le nom, le numéro de téléphone et l\'adresse de livraison sont obligatoires.'
            });
        }

        if (!Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Le panier est vide. Veuillez ajouter au moins un article.'
            });
        }

        const articlesVerifies = [];
        let sousTotalCalcule = 0;

        for (const item of articles) {
            const produitId = parseInt(item.produit_id || item.id, 10);
            const pointure = parseInt(item.pointure || item.taille, 10);
            const quantite = parseInt(item.quantite, 10);

            if (isNaN(produitId) || isNaN(pointure) || isNaN(quantite) || quantite <= 0) {
                return res.status(400).json({
                    statut: 'erreur',
                    message: 'Format d\'article invalide dans le panier.'
                });
            }

            const produit = db.prepare('SELECT id, nom, prix, actif FROM produits WHERE id = ?').get(produitId);
            if (!produit || produit.actif !== 1) {
                return res.status(404).json({
                    statut: 'erreur',
                    message: `Le produit #${produitId} n'est pas disponible à la vente.`
                });
            }

            const ligneStock = db.prepare('SELECT quantite FROM stocks WHERE produit_id = ? AND pointure = ?').get(produitId, pointure);
            const stockDisponible = ligneStock ? ligneStock.quantite : 0;

            if (stockDisponible < quantite) {
                return res.status(400).json({
                    statut: 'erreur',
                    message: `Stock insuffisant pour ${produit.nom} (Pointure ${pointure}). Quantité demandée : ${quantite}, stock restant : ${stockDisponible}.`
                });
            }

            const sousTotalLigne = produit.prix * quantite;
            sousTotalCalcule += sousTotalLigne;

            articlesVerifies.push({
                produitId,
                nom: produit.nom,
                pointure,
                quantite,
                prixUnitaire: produit.prix,
                sousTotalLigne
            });
        }

        const totalFinal = sousTotalCalcule + FRAIS_LIVRAISON_DEFAUT;

        db.exec('BEGIN TRANSACTION;');

        try {
            let clientId;
            const clientExistant = db.prepare('SELECT id FROM clients WHERE telephone = ?').get(telephone);
            if (clientExistant) {
                clientId = clientExistant.id;
                db.prepare('UPDATE clients SET nom = ?, prenom = ?, adresse = ?, ville = ?, email = ? WHERE id = ?')
                    .run(nom, prenom, adresse, ville, email, clientId);
            } else {
                const resClient = db.prepare(`
                    INSERT INTO clients (nom, prenom, email, telephone, adresse, ville)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(nom, prenom, email, telephone, adresse, ville);
                clientId = resClient.lastInsertRowid;
            }

            let reference = genererReference();
            while (db.prepare('SELECT id FROM commandes WHERE reference = ?').get(reference)) {
                reference = genererReference();
            }

            const resCommande = db.prepare(`
                INSERT INTO commandes (reference, client_id, sous_total, frais_livraison, total, statut)
                VALUES (?, ?, ?, ?, ?, 'en_attente')
            `).run(reference, clientId, sousTotalCalcule, FRAIS_LIVRAISON_DEFAUT, totalFinal);
            const commandeId = resCommande.lastInsertRowid;

            const insererLigne = db.prepare(`
                INSERT INTO lignes_commande (commande_id, produit_id, pointure, quantite, prix_unitaire, sous_total)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const reduireStock = db.prepare(`
                UPDATE stocks
                SET quantite = quantite - ?
                WHERE produit_id = ? AND pointure = ?
            `);

            for (const item of articlesVerifies) {
                insererLigne.run(
                    commandeId,
                    item.produitId,
                    item.pointure,
                    item.quantite,
                    item.prixUnitaire,
                    item.sousTotalLigne
                );
                reduireStock.run(item.quantite, item.produitId, item.pointure);
            }

            db.exec('COMMIT;');

            let texteWhatsApp = `*Nouvelle commande KTN Shoes*\nRef: ${reference}\nClient: ${nom} ${prenom}\nTél: ${telephone}\nAdresse: ${adresse}, ${ville}\n--------------------------\n`;
            for (const item of articlesVerifies) {
                texteWhatsApp += `• ${item.nom} (Pointure ${item.pointure}) x${item.quantite} : ${item.sousTotalLigne.toLocaleString('fr-FR')} FCFA\n`;
            }
            texteWhatsApp += `--------------------------\nSous-total : ${sousTotalCalcule.toLocaleString('fr-FR')} FCFA\nLivraison : ${FRAIS_LIVRAISON_DEFAUT.toLocaleString('fr-FR')} FCFA\n*Total : ${totalFinal.toLocaleString('fr-FR')} FCFA*\n\nJe souhaite confirmer ma commande. Merci !`;
            const lienWhatsApp = `https://wa.me/${TELEPHONE_VENDEUR}?text=${encodeURIComponent(texteWhatsApp)}`;

            res.status(201).json({
                statut: 'succes',
                message: 'Commande enregistrée avec succès !',
                donnees: {
                    id: commandeId,
                    reference,
                    client: { id: clientId, nom, prenom, telephone, adresse, ville },
                    articles: articlesVerifies,
                    sousTotal: sousTotalCalcule,
                    fraisLivraison: FRAIS_LIVRAISON_DEFAUT,
                    total: totalFinal,
                    statut: 'en_attente',
                    lienWhatsApp
                }
            });

        } catch (erreurTransaction) {
            db.exec('ROLLBACK;');
            throw erreurTransaction;
        }

    } catch (erreur) {
        console.error('Erreur lors de la création de la commande :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de l\'enregistrement de la commande.'
        });
    }
});

router.get('/', authMiddleware, (req, res) => {
    try {
        const { statut } = req.query;

        let sql = `
            SELECT 
                c.id, c.reference, c.sous_total, c.frais_livraison, c.total, c.statut, c.date_commande,
                cl.id AS client_id, cl.nom AS client_nom, cl.prenom AS client_prenom,
                cl.telephone AS client_telephone, cl.adresse AS client_adresse, cl.ville AS client_ville
            FROM commandes c
            JOIN clients cl ON c.client_id = cl.id
        `;
        const params = [];

        if (statut && STATUTS_VALIDES.includes(statut)) {
            sql += ` WHERE c.statut = ?`;
            params.push(statut);
        }

        sql += ` ORDER BY c.date_commande DESC`;

        const commandes = db.prepare(sql).all(...params);

        const requeteLignes = db.prepare(`
            SELECT lc.id, lc.pointure, lc.quantite, lc.prix_unitaire, lc.sous_total,
                   p.id AS produit_id, p.nom AS produit_nom, p.image AS produit_image
            FROM lignes_commande lc
            JOIN produits p ON lc.produit_id = p.id
            WHERE lc.commande_id = ?
        `);

        const resultat = commandes.map(cmd => ({
            id: cmd.id,
            reference: cmd.reference,
            dateCommande: cmd.date_commande,
            statut: cmd.statut,
            sousTotal: cmd.sous_total,
            fraisLivraison: cmd.frais_livraison,
            total: cmd.total,
            client: {
                id: cmd.client_id,
                nom: cmd.client_nom,
                prenom: cmd.client_prenom,
                telephone: cmd.client_telephone,
                adresse: cmd.client_adresse,
                ville: cmd.client_ville
            },
            articles: requeteLignes.all(cmd.id)
        }));

        res.json({
            statut: 'succes',
            total: resultat.length,
            donnees: resultat
        });

    } catch (erreur) {
        console.error('Erreur liste commandes :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de la récupération des commandes.'
        });
    }
});

router.get('/:id', authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Identifiant invalide.'
            });
        }

        const cmd = db.prepare(`
            SELECT 
                c.id, c.reference, c.sous_total, c.frais_livraison, c.total, c.statut, c.date_commande,
                cl.id AS client_id, cl.nom AS client_nom, cl.prenom AS client_prenom,
                cl.telephone AS client_telephone, cl.adresse AS client_adresse, cl.ville AS client_ville
            FROM commandes c
            JOIN clients cl ON c.client_id = cl.id
            WHERE c.id = ?
        `).get(id);

        if (!cmd) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Commande #${id} introuvable.`
            });
        }

        const articles = db.prepare(`
            SELECT lc.id, lc.pointure, lc.quantite, lc.prix_unitaire, lc.sous_total,
                   p.id AS produit_id, p.nom AS produit_nom, p.image AS produit_image
            FROM lignes_commande lc
            JOIN produits p ON lc.produit_id = p.id
            WHERE lc.commande_id = ?
        `).all(id);

        res.json({
            statut: 'succes',
            donnees: {
                id: cmd.id,
                reference: cmd.reference,
                dateCommande: cmd.date_commande,
                statut: cmd.statut,
                sousTotal: cmd.sous_total,
                fraisLivraison: cmd.frais_livraison,
                total: cmd.total,
                client: {
                    id: cmd.client_id,
                    nom: cmd.client_nom,
                    prenom: cmd.client_prenom,
                    telephone: cmd.client_telephone,
                    adresse: cmd.client_adresse,
                    ville: cmd.client_ville
                },
                articles
            }
        });

    } catch (erreur) {
        console.error('Erreur détail commande :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur.'
        });
    }
});

router.patch('/:id/statut', authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { statut } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Identifiant invalide.'
            });
        }

        if (!statut || !STATUTS_VALIDES.includes(statut)) {
            return res.status(400).json({
                statut: 'erreur',
                message: `Statut invalide. Statuts autorisés : ${STATUTS_VALIDES.join(', ')}.`
            });
        }

        const cmd = db.prepare('SELECT id, statut FROM commandes WHERE id = ?').get(id);
        if (!cmd) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Commande #${id} introuvable.`
            });
        }

        if (statut === 'annulee' && cmd.statut !== 'annulee') {
            const articles = db.prepare('SELECT produit_id, pointure, quantite FROM lignes_commande WHERE commande_id = ?').all(id);
            const restituerStock = db.prepare('UPDATE stocks SET quantite = quantite + ? WHERE produit_id = ? AND pointure = ?');
            for (const a of articles) {
                restituerStock.run(a.quantite, a.produit_id, a.pointure);
            }
        }

        db.prepare('UPDATE commandes SET statut = ? WHERE id = ?').run(statut, id);

        res.json({
            statut: 'succes',
            message: `Le statut de la commande #${id} a été mis à jour vers "${statut}".`,
            donnees: { id, nouveauStatut: statut }
        });

    } catch (erreur) {
        console.error('Erreur mise à jour statut commande :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de la mise à jour du statut.'
        });
    }
});

module.exports = router;
