// ======================================================
// ROUTES API AUTHENTIFICATION — KTN SHOES
// Endpoints :
//   POST /api/auth/login                -> Connexion administrateur & génération du token
//   GET  /api/auth/profil               -> Profil de l'administrateur connecté (protégé)
//   POST /api/auth/changer-mot-de-passe -> Modification du mot de passe admin (protégé)
// ======================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authMiddleware, JWT_SECRET } = require('../middlewares/auth');

router.post('/login', (req, res) => {
    try {
        const { identifiant, mot_de_passe } = req.body;

        const login = (identifiant || '').trim();
        const mdp = (mot_de_passe || '').trim();

        if (!login || !mdp) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'L\'identifiant et le mot de passe sont obligatoires.'
            });
        }

        const admin = db.prepare('SELECT * FROM administrateurs WHERE identifiant = ? OR email = ?').get(login, login);

        if (!admin) {
            return res.status(401).json({
                statut: 'erreur',
                message: 'Identifiant ou mot de passe incorrect.'
            });
        }

        const motDePasseValide = bcrypt.compareSync(mdp, admin.mot_de_passe);

        if (!motDePasseValide) {
            return res.status(401).json({
                statut: 'erreur',
                message: 'Identifiant ou mot de passe incorrect.'
            });
        }

        const payload = {
            id: admin.id,
            identifiant: admin.identifiant,
            email: admin.email,
            nomComplet: admin.nom_complet
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        console.log(`🔐 [AUTH] Connexion réussie pour l'administrateur "${admin.identifiant}" à ${new Date().toLocaleTimeString()}`);

        res.json({
            statut: 'succes',
            message: 'Connexion réussie ! Bienvenue sur l\'espace vendeur KTN Shoes.',
            token,
            admin: {
                id: admin.id,
                identifiant: admin.identifiant,
                email: admin.email,
                nomComplet: admin.nom_complet
            }
        });

    } catch (erreur) {
        console.error('Erreur lors de la connexion :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne du serveur lors de la tentative de connexion.'
        });
    }
});

router.get('/profil', authMiddleware, (req, res) => {
    try {
        const admin = db.prepare('SELECT id, identifiant, email, nom_complet, date_creation FROM administrateurs WHERE id = ?').get(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                statut: 'erreur',
                message: 'Compte administrateur introuvable.'
            });
        }

        res.json({
            statut: 'succes',
            admin: {
                id: admin.id,
                identifiant: admin.identifiant,
                email: admin.email,
                nomComplet: admin.nom_complet,
                dateCreation: admin.date_creation
            }
        });

    } catch (erreur) {
        console.error('Erreur profil :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne lors de la récupération du profil.'
        });
    }
});

router.post('/changer-mot-de-passe', authMiddleware, (req, res) => {
    try {
        const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

        if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'L\'ancien et le nouveau mot de passe sont obligatoires.'
            });
        }

        if (nouveau_mot_de_passe.length < 8) {
            return res.status(400).json({
                statut: 'erreur',
                message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.'
            });
        }

        const admin = db.prepare('SELECT id, mot_de_passe FROM administrateurs WHERE id = ?').get(req.admin.id);

        const ancienValide = bcrypt.compareSync(ancien_mot_de_passe, admin.mot_de_passe);
        if (!ancienValide) {
            return res.status(401).json({
                statut: 'erreur',
                message: 'L\'ancien mot de passe est incorrect.'
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const nouveauHash = bcrypt.hashSync(nouveau_mot_de_passe, salt);

        db.prepare('UPDATE administrateurs SET mot_de_passe = ? WHERE id = ?').run(nouveauHash, req.admin.id);

        console.log(`🔑 [AUTH] Mot de passe mis à jour pour l'administrateur #${req.admin.id}`);

        res.json({
            statut: 'succes',
            message: 'Votre mot de passe a été modifié avec succès.'
        });

    } catch (erreur) {
        console.error('Erreur changement mot de passe :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne lors de la mise à jour du mot de passe.'
        });
    }
});

module.exports = router;
