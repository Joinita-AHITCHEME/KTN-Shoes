const db = require('./db');

console.log('--- VÉRIFICATION DE LA BASE DE DONNÉES ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;").all();

console.log('Nombre de tables créées :', tables.length);
tables.forEach(t => {
    const colonnes = db.prepare(`PRAGMA table_info(${t.name});`).all();
    console.log(`\n📋 Table [${t.name}] (${colonnes.length} colonnes) :`);
    console.log('   Colonnes :', colonnes.map(c => `${c.name} (${c.type})`).join(', '));
});
