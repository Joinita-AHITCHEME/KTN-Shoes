// ======================================================
// SERVEUR BACKEND — KTN SHOES
// Point d'entrée principal de l'API
// ======================================================
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

const produitsRoutes = require('./routes/produits');
app.use('/api/produits', produitsRoutes);
const commandesRoutes = require('./routes/commandes');
app.use('/api/commandes', commandesRoutes);
const messagesRoutes = require('./routes/messages');
app.use('/api/messages', messagesRoutes);
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const statsRoutes = require('./routes/statistiques');
app.use('/api/statistiques', statsRoutes);

app.get('/api/status', (req, res) => {
    res.json({
        statut: 'succes',
        message: "Bienvenue sur l'API KTN Shoes ! Le serveur fonctionne parfaitement.",
        horodatage: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send("Serveur API KTN Shoes actif. Rendez-vous sur /api/status pour tester l'API.");
});

app.listen(PORT, () => {
    console.log('=========================================');
    console.log('🚀 Serveur KTN Shoes démarré avec succès !');
    console.log(`📍 URL locale    : http://localhost:${PORT}`);
    console.log(`🧪 Test statut   : http://localhost:${PORT}/api/status`);
    console.log(`👟 Test produits : http://localhost:${PORT}/api/produits`);
    console.log(`📦 Test commandes: http://localhost:${PORT}/api/commandes`);
    console.log(`📬 Test messages : http://localhost:${PORT}/api/messages`);
    console.log(`🔑 Test auth     : http://localhost:${PORT}/api/auth/login`);
    console.log(`📊 Test stats    : http://localhost:${PORT}/api/statistiques`);
    console.log('=========================================');
});
