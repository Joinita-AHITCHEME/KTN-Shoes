// ======================================================
// SCRIPT DE CONFIGURATION GLOBALE — KTN SHOES
// Initialise les tables, importe les produits et crée l'administrateur
// Usage : npm run setup
// ======================================================

console.log('==================================================');
console.log('🚀 INITIALISATION GLOBALE DE LA BASE KTN SHOES');
console.log('==================================================\n');

try {
    require('./init');
    console.log('');

    require('./seed');
    console.log('');

    require('./seed_admin');

    console.log('\n==================================================');
    console.log('✨ CONFIGURATION TERMINÉE AVEC SUCCÈS !');
    console.log('👉 Vous pouvez maintenant lancer l\'API avec : npm start');
    console.log('==================================================');
} catch (erreur) {
    console.error('\n❌ Échec de la configuration globale :', erreur);
    process.exit(1);
}
