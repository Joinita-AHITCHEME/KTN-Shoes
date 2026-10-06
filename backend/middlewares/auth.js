// ======================================================
// MIDDLEWARE D'AUTHENTIFICATION JWT — KTN SHOES
// Protège les routes privées réservées à l'administrateur
// ======================================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ktn-shoes-cle-secrete-jwt-production-2026-tres-securisee';

function authMiddleware(req, res, next) {
    try {
        const enTeteAuth = req.headers['authorization'];

        if (!enTeteAuth) {
            return res.status(401).json({
                statut: 'erreur',
                message: 'Accès non autorisé. Aucun jeton (token) d\'authentification fourni.'
            });
        }

        const morceaux = enTeteAuth.split(' ');
        if (morceaux.length !== 2 || morceaux[0] !== 'Bearer') {
            return res.status(401).json({
                statut: 'erreur',
                message: 'Format du jeton invalide. Format attendu : "Bearer <token>".'
            });
        }

        const token = morceaux[1];

        jwt.verify(token, JWT_SECRET, (erreur, adminDecouvert) => {
            if (erreur) {
                if (erreur.name === 'TokenExpiredError') {
                    return res.status(403).json({
                        statut: 'erreur',
                        message: 'Session expirée. Veuillez vous reconnecter.'
                    });
                }
                return res.status(403).json({
                    statut: 'erreur',
                    message: 'Jeton d\'authentification invalide.'
                });
            }

            req.admin = adminDecouvert;
            next();
        });

    } catch (erreur) {
        console.error('Erreur dans authMiddleware :', erreur);
        res.status(500).json({
            statut: 'erreur',
            message: 'Erreur interne lors de la vérification de l\'authentification.'
        });
    }
}

module.exports = {
    authMiddleware,
    JWT_SECRET
};
