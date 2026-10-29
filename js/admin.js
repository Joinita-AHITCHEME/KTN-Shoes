// ======================================================
// LOGIQUE DU DASHBOARD ADMINISTRATEUR — KTN SHOES
// Gestion sécurisée via Token JWT, API REST & DOM dynamique
// ======================================================

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3000/api'
    : 'https://ktn-shoes-backend.onrender.com/api';
const CLE_TOKEN = 'ktn_admin_token';
const CLE_USER = 'ktn_admin_user';

let tokenAdmin = localStorage.getItem(CLE_TOKEN);
let adminActuel = null;

try {
    adminActuel = JSON.parse(localStorage.getItem(CLE_USER) || 'null');
} catch (e) {
    adminActuel = null;
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    verifierSession();
    initFormulaireConnexion();
    initOnglets();
    initDeconnexion();
    initChangementMotDePasse();
    initModales();
});

function initTheme() {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function majIcone() {
        const sombre = document.documentElement.getAttribute('data-theme') === 'sombre';
        btn.textContent = sombre ? '☀' : '☾';
    }

    majIcone();

    btn.addEventListener('click', () => {
        const estSombre = document.documentElement.getAttribute('data-theme') === 'sombre';
        if (estSombre) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('ktn_theme', 'clair');
        } else {
            document.documentElement.setAttribute('data-theme', 'sombre');
            localStorage.setItem('ktn_theme', 'sombre');
        }
        majIcone();
    });
}

async function verifierSession() {
    const vueLogin = document.getElementById('vue-login');
    const vueDashboard = document.getElementById('vue-dashboard');

    if (!tokenAdmin) {
        vueLogin.style.display = 'flex';
        vueDashboard.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/profil`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });

        if (res.ok) {
            const data = await res.json();
            adminActuel = data.admin;
            localStorage.setItem(CLE_USER, JSON.stringify(adminActuel));

            document.getElementById('nom-admin-affiche').textContent = adminActuel.nomComplet || adminActuel.identifiant;

            vueLogin.style.display = 'none';
            vueDashboard.style.display = 'flex';

            chargerStatistiques();
            chargerToutesCommandes();
            chargerStocksProduits();
            chargerTousMessages();
        } else {
            deconnecter();
        }
    } catch (err) {
        console.warn('Impossible de contacter le backend :', err);
        vueLogin.style.display = 'flex';
        vueDashboard.style.display = 'none';
    }
}

function initFormulaireConnexion() {
    const form = document.getElementById('form-login');
    if (!form) return;

    const feedback = document.getElementById('login-feedback');
    const btn = document.getElementById('btn-login');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const identifiant = (form.identifiant.value || '').trim();
        const mot_de_passe = (form.mot_de_passe.value || '').trim();

        if (!identifiant || !mot_de_passe) {
            afficherFeedback(feedback, 'Veuillez saisir votre identifiant et votre mot de passe.', 'erreur');
            return;
        }

        const texteOriginal = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>Connexion en cours...</span>';
        feedback.style.display = 'none';

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifiant, mot_de_passe })
            });

            const data = await res.json();

            if (res.ok && data.statut === 'succes') {
                tokenAdmin = data.token;
                adminActuel = data.admin;
                localStorage.setItem(CLE_TOKEN, tokenAdmin);
                localStorage.setItem(CLE_USER, JSON.stringify(adminActuel));

                form.reset();
                verifierSession();
            } else {
                afficherFeedback(feedback, data.message || 'Identifiants invalides.', 'erreur');
            }
        } catch (err) {
            console.error('Erreur login :', err);
            afficherFeedback(feedback, 'Impossible de joindre le serveur API. Veuillez vérifier votre connexion ou vous assurer que le backend est accessible.', 'erreur');
        } finally {
            btn.disabled = false;
            btn.innerHTML = texteOriginal;
        }
    });
}

function initDeconnexion() {
    const btn = document.getElementById('btn-deconnexion');
    if (btn) {
        btn.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                deconnecter();
            }
        });
    }
}

function deconnecter() {
    tokenAdmin = null;
    adminActuel = null;
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_USER);
    document.getElementById('vue-dashboard').style.display = 'none';
    document.getElementById('vue-login').style.display = 'flex';
}

function initOnglets() {
    const boutons = document.querySelectorAll('.nav-onglet');
    const sections = document.querySelectorAll('.section-dashboard');

    boutons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cible = btn.dataset.section;
            basculerSection(cible);
        });
    });

    document.querySelectorAll('[data-aller-a]').forEach(lien => {
        lien.addEventListener('click', () => {
            basculerSection(lien.dataset.allerA);
        });
    });

    function basculerSection(nomSection) {
        boutons.forEach(b => b.classList.toggle('actif', b.dataset.section === nomSection));
        sections.forEach(sec => {
            sec.style.display = (sec.id === `section-${nomSection}`) ? 'block' : 'none';
        });
    }
}

async function chargerStatistiques() {
    try {
        const res = await fetch(`${API_BASE}/statistiques`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) return;

        const { donnees } = await res.json();

        document.getElementById('kpi-chiffre-affaires').textContent = `${donnees.commandes.chiffreAffaires.toLocaleString('fr-FR')} FCFA`;

        document.getElementById('kpi-total-commandes').textContent = donnees.commandes.total;
        document.getElementById('kpi-commandes-en-attente').textContent = `${donnees.commandes.enAttente} en attente`;

        const badgeCmd = document.getElementById('badge-nb-commandes');
        if (donnees.commandes.enAttente > 0) {
            badgeCmd.textContent = donnees.commandes.enAttente;
            badgeCmd.style.display = 'inline-block';
        } else {
            badgeCmd.style.display = 'none';
        }

        document.getElementById('kpi-total-stock').textContent = `${donnees.produits.totalPairesEnStock} paires`;
        document.getElementById('kpi-alertes-stock').textContent = `${donnees.produits.alertesStockBas} alerte(s) stock bas (≤3)`;

        document.getElementById('kpi-total-messages').textContent = donnees.messages.total;
        document.getElementById('kpi-messages-non-lus').textContent = `${donnees.messages.nonLus} non lu(s)`;

        const badgeMsg = document.getElementById('badge-nb-messages');
        if (donnees.messages.nonLus > 0) {
            badgeMsg.textContent = donnees.messages.nonLus;
            badgeMsg.style.display = 'inline-block';
        } else {
            badgeMsg.style.display = 'none';
        }

        const tbody = document.getElementById('tbody-dernieres-commandes');
        if (donnees.dernieresCommandes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="cellule-vide">Aucune commande enregistrée pour le moment.</td></tr>';
        } else {
            tbody.innerHTML = donnees.dernieresCommandes.map(cmd => `
                <tr>
                    <td><strong>${cmd.reference}</strong></td>
                    <td>${cmd.client_nom} ${cmd.client_prenom || ''}</td>
                    <td>${new Date(cmd.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>${cmd.total.toLocaleString('fr-FR')} FCFA</strong></td>
                    <td><span class="badge-statut statut-${cmd.statut}">${formaterStatut(cmd.statut)}</span></td>
                    <td><button type="button" class="btn-detail" onclick="ouvrirDetailCommande(${cmd.id})">Voir</button></td>
                </tr>
            `).join('');
        }

    } catch (err) {
        console.error('Erreur chargement statistiques :', err);
    }
}

let statutCommandeFiltre = '';

function chargerToutesCommandes() {
    initFiltresCommandes();
    recupererCommandes();
    document.getElementById('btn-rafraichir-commandes').addEventListener('click', () => {
        recupererCommandes();
        chargerStatistiques();
    });
}

function initFiltresCommandes() {
    const boutons = document.querySelectorAll('.filtre-btn');
    boutons.forEach(btn => {
        btn.addEventListener('click', () => {
            boutons.forEach(b => b.classList.remove('actif'));
            btn.classList.add('actif');
            statutCommandeFiltre = btn.dataset.statut;
            recupererCommandes();
        });
    });
}

async function recupererCommandes() {
    const tbody = document.getElementById('tbody-toutes-commandes');
    try {
        let url = `${API_BASE}/commandes`;
        if (statutCommandeFiltre) {
            url += `?statut=${statutCommandeFiltre}`;
        }

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) return;

        const { donnees } = await res.json();

        if (donnees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="cellule-vide">Aucune commande trouvée.</td></tr>';
            return;
        }

        tbody.innerHTML = donnees.map(cmd => {
            const nbArticles = cmd.articles.reduce((acc, a) => acc + a.quantite, 0);
            return `
                <tr>
                    <td><strong>${cmd.reference}</strong></td>
                    <td>${cmd.client.nom} ${cmd.client.prenom || ''}</td>
                    <td>
                        <a href="tel:${cmd.client.telephone}">${cmd.client.telephone}</a><br>
                        <small style="color:var(--gris)">${cmd.client.ville}</small>
                    </td>
                    <td>${new Date(cmd.dateCommande).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${nbArticles} paire(s)</td>
                    <td><strong>${cmd.total.toLocaleString('fr-FR')} FCFA</strong></td>
                    <td>
                        <select class="select-statut-commande" onchange="changerStatutCommande(${cmd.id}, this.value)">
                            <option value="en_attente" ${cmd.statut === 'en_attente' ? 'selected' : ''}>⏳ En attente</option>
                            <option value="confirmee" ${cmd.statut === 'confirmee' ? 'selected' : ''}>✓ Confirmée</option>
                            <option value="en_livraison" ${cmd.statut === 'en_livraison' ? 'selected' : ''}>🚚 En livraison</option>
                            <option value="livree" ${cmd.statut === 'livree' ? 'selected' : ''}>★ Livrée</option>
                            <option value="annulee" ${cmd.statut === 'annulee' ? 'selected' : ''}>✕ Annulée</option>
                        </select>
                    </td>
                    <td>
                        <button type="button" class="btn-detail" onclick="ouvrirDetailCommande(${cmd.id})">Détail</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error('Erreur récupération commandes :', err);
    }
}

window.changerStatutCommande = async function(id, nouveauStatut) {
    try {
        const res = await fetch(`${API_BASE}/commandes/${id}/statut`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ statut: nouveauStatut })
        });

        const data = await res.json();

        if (res.ok) {
            chargerStatistiques();
            chargerStocksProduits();
        } else {
            alert('Erreur : ' + (data.message || 'Impossible de mettre à jour le statut.'));
            recupererCommandes();
        }
    } catch (err) {
        console.error('Erreur changement statut :', err);
        alert('Erreur de connexion au serveur.');
    }
};

async function chargerStocksProduits() {
    const conteneur = document.getElementById('grille-stocks-produits');
    try {
        const res = await fetch(`${API_BASE}/produits/stocks/complet`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) return;

        const { donnees } = await res.json();

        conteneur.innerHTML = donnees.map(p => `
            <div class="carte-stock-produit">
                <div class="stock-produit-entete">
                    <img src="${p.image}" alt="${p.nom}" class="stock-produit-img">
                    <div class="stock-produit-infos">
                        <h4>${p.nom}</h4>
                        <span>${p.prix.toLocaleString('fr-FR')} FCFA</span> • <small style="text-transform: capitalize;">${p.categorie}</small>
                    </div>
                </div>

                <div class="stock-pointures-liste">
                    ${p.stocks.map(s => `
                        <div class="item-pointure-stock ${s.quantite <= 3 ? 'stock-bas' : ''}">
                            <strong>Pt. ${s.pointure}</strong>
                            <input 
                                type="number" 
                                class="input-qte-stock" 
                                min="0" 
                                value="${s.quantite}" 
                                title="Modifier la quantité"
                                onchange="modifierStockProduit(${p.id}, ${s.pointure}, this.value)"
                            >
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Erreur chargement stocks :', err);
    }
}

window.modifierStockProduit = async function(produitId, pointure, quantite) {
    const qteNum = parseInt(quantite, 10);
    if (isNaN(qteNum) || qteNum < 0) {
        alert('Quantité invalide.');
        chargerStocksProduits();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/produits/${produitId}/stocks`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ pointure, quantite: qteNum })
        });

        if (res.ok) {
            chargerStatistiques();
        } else {
            const data = await res.json();
            alert(data.message || 'Erreur lors de la mise à jour du stock.');
            chargerStocksProduits();
        }
    } catch (err) {
        console.error('Erreur stock update :', err);
        alert('Erreur serveur.');
    }
};

let filtreMessageLu = '';

function chargerTousMessages() {
    const boutons = document.querySelectorAll('.filtre-msg-btn');
    boutons.forEach(btn => {
        btn.addEventListener('click', () => {
            boutons.forEach(b => b.classList.remove('actif'));
            btn.classList.add('actif');
            filtreMessageLu = btn.dataset.lu;
            recupererMessages();
        });
    });

    recupererMessages();
}

async function recupererMessages() {
    const tbody = document.getElementById('tbody-messages');
    try {
        let url = `${API_BASE}/messages`;
        if (filtreMessageLu !== '') {
            url += `?lu=${filtreMessageLu}`;
        }

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) return;

        const { donnees } = await res.json();

        if (donnees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="cellule-vide">Aucun message trouvé.</td></tr>';
            return;
        }

        tbody.innerHTML = donnees.map(msg => `
            <tr style="${msg.lu === 0 ? 'font-weight: 600;' : ''}">
                <td>${msg.nom}</td>
                <td>
                    <a href="mailto:${msg.email}">${msg.email}</a><br>
                    <small style="color:var(--gris)">${msg.telephone || 'Non renseigné'}</small>
                </td>
                <td>${msg.sujet}</td>
                <td>${new Date(msg.date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                    <button type="button" class="btn-detail" onclick="basculerLuMessage(${msg.id}, ${msg.lu === 1 ? 0 : 1})">
                        ${msg.lu === 1 ? '✓ Lu' : '● Nouveau'}
                    </button>
                </td>
                <td style="display:flex; gap:6px;">
                    <button type="button" class="btn-detail" onclick="ouvrirMessageModal(${msg.id})">Lire</button>
                    <button type="button" class="btn-deconnexion" onclick="supprimerMessage(${msg.id})" title="Supprimer">🗑</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Erreur récupération messages :', err);
    }
}

window.basculerLuMessage = async function(id, nouveauLu) {
    try {
        const res = await fetch(`${API_BASE}/messages/${id}/lu`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ lu: nouveauLu })
        });
        if (res.ok) {
            recupererMessages();
            chargerStatistiques();
        }
    } catch (err) {
        console.error('Erreur toggle lu :', err);
    }
};

window.supprimerMessage = async function(id) {
    if (!confirm('Voulez-vous vraiment supprimer définitivement ce message ?')) return;

    try {
        const res = await fetch(`${API_BASE}/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (res.ok) {
            recupererMessages();
            chargerStatistiques();
        }
    } catch (err) {
        console.error('Erreur suppression message :', err);
    }
};

function initModales() {
    document.querySelectorAll('.modale-fermer, .modale-arriere-plan').forEach(elem => {
        elem.addEventListener('click', () => {
            document.getElementById('modale-commande').style.display = 'none';
            document.getElementById('modale-message').style.display = 'none';
        });
    });
}

window.ouvrirDetailCommande = async function(id) {
    const modale = document.getElementById('modale-commande');
    const corps = document.getElementById('modale-cmd-corps');
    const titre = document.getElementById('modale-cmd-ref');

    corps.innerHTML = '<p class="cellule-vide">Chargement du détail...</p>';
    modale.style.display = 'flex';

    try {
        const res = await fetch(`${API_BASE}/commandes/${id}`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) return;

        const { donnees: cmd } = await res.json();
        titre.textContent = `Commande ${cmd.reference}`;

        const waText = encodeURIComponent(`Bonjour ${cmd.client.nom}, suite à votre commande ${cmd.reference} sur KTN Shoes...`);
        const waLink = `https://wa.me/${cmd.client.telephone.replace(/[^0-9]/g, '')}?text=${waText}`;

        corps.innerHTML = `
            <div class="bloc-detail-client">
                <strong>Client :</strong> ${cmd.client.nom} ${cmd.client.prenom || ''}<br>
                <strong>Téléphone :</strong> ${cmd.client.telephone}<br>
                <strong>Adresse de livraison :</strong> ${cmd.client.adresse}, ${cmd.client.ville}<br>
                <strong>Date de commande :</strong> ${new Date(cmd.dateCommande).toLocaleString('fr-FR')}<br>
                <strong>Statut actuel :</strong> <span class="badge-statut statut-${cmd.statut}">${formaterStatut(cmd.statut)}</span><br>
                <a href="${waLink}" target="_blank" class="btn-whatsapp-client">
                    💬 Contacter le client sur WhatsApp
                </a>
            </div>

            <h4>Articles commandés :</h4>
            <div class="liste-articles-detail">
                ${cmd.articles.map(art => `
                    <div class="item-article-detail">
                        <img src="${art.produit_image}" alt="${art.produit_nom}">
                        <div class="article-detail-infos">
                            <strong>${art.produit_nom}</strong><br>
                            <small>Pointure : ${art.pointure} | Quantité : ${art.quantite}</small>
                        </div>
                        <div style="text-align:right;">
                            <strong>${art.sous_total.toLocaleString('fr-FR')} FCFA</strong><br>
                            <small>(${art.prix_unitaire.toLocaleString('fr-FR')} / u)</small>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="border-top:1px solid var(--bordure); padding-top:14px; text-align:right;">
                <p>Sous-total : ${cmd.sousTotal.toLocaleString('fr-FR')} FCFA</p>
                <p>Livraison : ${cmd.fraisLivraison.toLocaleString('fr-FR')} FCFA</p>
                <h3 style="color:var(--bleu); margin-top:4px;">Total : ${cmd.total.toLocaleString('fr-FR')} FCFA</h3>
            </div>
        `;

    } catch (err) {
        corps.innerHTML = '<p class="feedback-erreur">Erreur lors de la récupération des détails.</p>';
    }
};

window.ouvrirMessageModal = async function(id) {
    const modale = document.getElementById('modale-message');
    const corps = document.getElementById('modale-msg-corps');
    const titre = document.getElementById('modale-msg-sujet');

    corps.innerHTML = '<p class="cellule-vide">Chargement...</p>';
    modale.style.display = 'flex';

    try {
        const res = await fetch(`${API_BASE}/messages/${id}`, {
            headers: { 'Authorization': `Bearer ${tokenAdmin}` }
        });
        if (!res.ok) return;

        const { donnees: msg } = await res.json();
        titre.textContent = msg.sujet;

        corps.innerHTML = `
            <div class="bloc-detail-client">
                <strong>De :</strong> ${msg.nom} (&lt;${msg.email}&gt;)<br>
                <strong>Téléphone :</strong> ${msg.telephone || 'Non renseigné'}<br>
                <strong>Date :</strong> ${new Date(msg.date_envoi).toLocaleString('fr-FR')}
            </div>
            <h4>Message du client :</h4>
            <p style="white-space: pre-wrap; line-height: 1.6; background: var(--fond-alterne); padding: 16px; border-radius: 8px; margin: 12px 0;">${msg.message}</p>
            <div style="display: flex; gap: 10px; margin-top: 16px;">
                <a href="mailto:${msg.email}?subject=RE: ${encodeURIComponent(msg.sujet)}" class="btn-detail" style="text-decoration:none; padding:10px 16px;">
                    ✉ Répondre par Email
                </a>
            </div>
        `;

        if (msg.lu === 0) {
            basculerLuMessage(msg.id, 1);
        }

    } catch (err) {
        corps.innerHTML = '<p class="feedback-erreur">Erreur chargement message.</p>';
    }
};

function initChangementMotDePasse() {
    const form = document.getElementById('form-changer-mdp');
    if (!form) return;

    const feedback = document.getElementById('mdp-feedback');
    const btn = document.getElementById('btn-changer-mdp');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ancien_mot_de_passe = document.getElementById('ancien-mdp').value;
        const nouveau_mot_de_passe = document.getElementById('nouveau-mdp').value;
        const confirmation = document.getElementById('confirmer-mdp').value;

        if (nouveau_mot_de_passe !== confirmation) {
            afficherFeedback(feedback, 'Le nouveau mot de passe et la confirmation ne correspondent pas.', 'erreur');
            return;
        }

        if (nouveau_mot_de_passe.length < 8) {
            afficherFeedback(feedback, 'Le nouveau mot de passe doit contenir au moins 8 caractères.', 'erreur');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Modification en cours...';

        try {
            const res = await fetch(`${API_BASE}/auth/changer-mot-de-passe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenAdmin}`
                },
                body: JSON.stringify({ ancien_mot_de_passe, nouveau_mot_de_passe })
            });

            const data = await res.json();

            if (res.ok && data.statut === 'succes') {
                afficherFeedback(feedback, data.message, 'succes');
                form.reset();
            } else {
                afficherFeedback(feedback, data.message || 'Erreur lors du changement.', 'erreur');
            }
        } catch (err) {
            afficherFeedback(feedback, 'Erreur de connexion au serveur.', 'erreur');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Valider le nouveau mot de passe';
        }
    });
}

function formaterStatut(st) {
    const map = {
        'en_attente': 'En attente',
        'confirmee': 'Confirmée',
        'en_livraison': 'En livraison',
        'livree': 'Livrée',
        'annulee': 'Annulée'
    };
    return map[st] || st;
}

function afficherFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `feedback-box feedback-${type}`;
    el.style.display = 'block';
}
