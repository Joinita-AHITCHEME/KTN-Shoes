// ======================================================
// CONNEXION À LA BASE DE DONNÉES — KTN SHOES
// Utilise le module natif node:sqlite de Node.js 22+
// ======================================================

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, 'ktn_shoes.db');

const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;
