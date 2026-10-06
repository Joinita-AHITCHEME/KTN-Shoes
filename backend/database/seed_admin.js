// ======================================================
// SCRIPT DE CRÉATION DU COMPTE ADMINISTRATEUR PAR DÉFAUT
// ======================================================

const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('--- INITIALISATION DU COMPTE ADMINISTRATEUR ---');

const IDENTIFIANT_ADMIN = 'admin';
const EMAIL_ADMIN = 'silverktn407@gmail.com';
const MOT_DE_PASSE_ADMIN = 'KtnShoes@2026!';
const NOM_COMPLET_ADMIN = 'Joinita AHITCHEME (Gérante)';

const adminExistant = db.prepare('SELECT id, identifiant FROM administrateurs WHERE identifiant = ? OR email = ?').get(IDENTIFIANT_ADMIN, EMAIL_ADMIN);

const salt = bcrypt.genSaltSync(10);
const motDePasseHache = bcrypt.hashSync(MOT_DE_PASSE_ADMIN, salt);

if (adminExistant) {
    db.prepare('UPDATE administrateurs SET mot_de_passe = ?, email = ?, nom_complet = ? WHERE id = ?')
        .run(motDePasseHache, EMAIL_ADMIN, NOM_COMPLET_ADMIN, adminExistant.id);
    console.log(`✅ Compte administrateur existant mis à jour (ID #${adminExistant.id})`);
} else {
    const res = db.prepare(`
        INSERT INTO administrateurs (identifiant, email, mot_de_passe, nom_complet)
        VALUES (?, ?, ?, ?)
    `).run(IDENTIFIANT_ADMIN, EMAIL_ADMIN, motDePasseHache, NOM_COMPLET_ADMIN);
    console.log(`✅ Nouveau compte administrateur créé avec succès (ID #${res.lastInsertRowid})`);
}

console.log('==================================================');
console.log('👤 Identifiant   : ' + IDENTIFIANT_ADMIN);
console.log('📧 Email         : ' + EMAIL_ADMIN);
console.log('🔑 Mot de passe  : ' + MOT_DE_PASSE_ADMIN);
console.log('🔒 Hash stocké   : ' + motDePasseHache.substring(0, 25) + '...');
console.log('==================================================');
