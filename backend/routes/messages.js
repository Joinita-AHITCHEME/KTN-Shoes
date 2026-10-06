// ======================================================
// ROUTES API MESSAGES (CONTACT) — KTN SHOES
// Endpoints :
//   POST   /api/messages           -> Enregistrer un nouveau message de contact
//   GET    /api/messages           -> Lister tous les messages (vendeur)
//   GET    /api/messages/:id       -> Consulter un message spécifique
//   PATCH  /api/messages/:id/lu    -> Marquer un message comme lu / non lu
//   DELETE /api/messages/:id       -> Supprimer un message
// ======================================================

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middlewares/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', (req, res) => {
    try {
        const { nom, email, telephone, sujet, message } = req.body;

        const nomPropre = (nom || '').trim();
        const emailPropre = (email || '').trim().toLowerCase();
        const telephonePropre = (telephone || '').trim();
        const sujetPropre = (sujet || '').trim();
        const messagePropre = (message || '').trim();

        if (!nomPropre) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Le nom est obligatoire.'
            });
        }

        if (!emailPropre || !EMAIL_REGEX.test(emailPropre)) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Une adresse email valide est obligatoire.'
            });
        }

        if (!sujetPropre) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Le sujet du message est obligatoire.'
            });
        }

        if (!messagePropre || messagePropre.length < 5) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Le message doit contenir au moins 5 caractères.'
            });
        }

        const stmt = db.prepare(`
            INSERT INTO messages (nom, email, telephone, sujet, message, lu)
            VALUES (?, ?, ?, ?, ?, 0)
        `);
        const resultat = stmt.run(nomPropre, emailPropre, telephonePropre || null, sujetPropre, messagePropre);
        const messageId = resultat.lastInsertRowid;

        const messageCree = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);

        console.log('----------------------------------------------------');
        console.log(`📩 [NOTIFICATION VENDEUR] Nouveau message reçu #${messageId} !`);
        console.log(`👤 De        : ${nomPropre} <${emailPropre}>`);
        console.log(`📞 Tél       : ${telephonePropre || 'Non renseigné'}`);
        console.log(`📋 Sujet     : ${sujetPropre}`);
        console.log(`💬 Message   : ${messagePropre.substring(0, 100)}${messagePropre.length > 100 ? '...' : ''}`);
        console.log('----------------------------------------------------');

        res.status(201).json({
            statut: 'succes',
            message: 'Votre message a été envoyé avec succès ! Notre équipe vous répondra dans les plus brefs délais.',
            donnees: messageCree
        });

    } catch (erreur) {
        console.error('Erreur lors de l\'enregistrement du message :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de l\'envoi de votre message.'
        });
    }
});

router.get('/', authMiddleware, (req, res) => {
    try {
        const { lu } = req.query;

        let sql = 'SELECT * FROM messages';
        const params = [];

        if (lu !== undefined && (lu === '0' || lu === '1')) {
            sql += ' WHERE lu = ?';
            params.push(parseInt(lu, 10));
        }

        sql += ' ORDER BY date_envoi DESC';

        const messages = db.prepare(sql).all(...params);

        const stats = db.prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN lu = 0 THEN 1 ELSE 0 END) AS nonLus FROM messages').get();

        res.json({
            statut: 'succes',
            total: messages.length,
            totalGlobal: stats.total,
            nonLus: stats.nonLus || 0,
            donnees: messages
        });

    } catch (erreur) {
        console.error('Erreur liste messages :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de la récupération des messages.'
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

        const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
        if (!msg) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Message #${id} introuvable.`
            });
        }

        res.json({
            statut: 'succes',
            donnees: msg
        });

    } catch (erreur) {
        console.error('Erreur détail message :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur.'
        });
    }
});

router.patch('/:id/lu', authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Identifiant invalide.'
            });
        }

        const nouveauLu = (req.body.lu === 0 || req.body.lu === false) ? 0 : 1;

        const msg = db.prepare('SELECT id FROM messages WHERE id = ?').get(id);
        if (!msg) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Message #${id} introuvable.`
            });
        }

        db.prepare('UPDATE messages SET lu = ? WHERE id = ?').run(nouveauLu, id);

        res.json({
            statut: 'succes',
            message: nouveauLu === 1 ? 'Message marqué comme lu.' : 'Message marqué comme non lu.',
            donnees: { id, lu: nouveauLu }
        });

    } catch (erreur) {
        console.error('Erreur mise à jour statut lu :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur.'
        });
    }
});

router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Identifiant invalide.'
            });
        }

        const msg = db.prepare('SELECT id FROM messages WHERE id = ?').get(id);
        if (!msg) {
            return res.status(404).json({
                statut: 'erreur',
                message: `Message #${id} introuvable.`
            });
        }

        db.prepare('DELETE FROM messages WHERE id = ?').run(id);

        res.json({
            statut: 'succes',
            message: `Message #${id} supprimé avec succès.`
        });

    } catch (erreur) {
        console.error('Erreur suppression message :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur.'
        });
    }
});

module.exports = router;
