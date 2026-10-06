// ======================================================
// SCRIPT DE CRÉATION DES TABLES — KTN SHOES
// Exécute schema.sql pour créer la structure si inexistante
// ======================================================

const fs = require('fs');
const path = require('path');
const db = require('./db');

try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schemaSql);

    console.log('=========================================');
    console.log('🗄️  Base de données KTN Shoes initialisée !');
    console.log('✅ Tables créées avec succès :');
    console.log('   • produits');
    console.log('   • stocks');
    console.log('   • clients');
    console.log('   • commandes');
    console.log('   • lignes_commande');
    console.log('   • messages');
    console.log('   • administrateurs');
    console.log('📁 Fichier : backend/database/ktn_shoes.db');
    console.log('=========================================');
} catch (erreur) {
    console.error('❌ Erreur lors de l\'initialisation de la base :', erreur);
    process.exit(1);
}
