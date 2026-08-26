/* =========================================================
   KTN SHOES — SCRIPT PRINCIPAL
   Panier (localStorage), favoris, filtres, menu mobile,
   rendu dynamique des pages produit et panier.
========================================================= */

const CLE_PANIER = "ktn_panier";
const CLE_FAVORIS = "ktn_favoris";


/* =========================================================
   1. STOCKAGE — PANIER
========================================================= */

// Le panier est un tableau d'objets : { id, taille, quantite }
function lirePanier() {
    try {
        const donnees = localStorage.getItem(CLE_PANIER);
        return donnees ? JSON.parse(donnees) : [];
    } catch (erreur) {
        console.error("Erreur de lecture du panier :", erreur);
        return [];
    }
}

function ecrirePanier(panier) {
    try {
        localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
    } catch (erreur) {
        console.error("Erreur d'écriture du panier :", erreur);
    }
}

function ajouterAuPanier(id, taille, quantite = 1) {
    const panier = lirePanier();

    // Une même ligne = même produit + même taille
    const ligneExistante = panier.find(
        item => item.id === id && item.taille === taille
    );

    if (ligneExistante) {
        ligneExistante.quantite += quantite;
    } else {
        panier.push({ id, taille, quantite });
    }

    ecrirePanier(panier);
    mettreAJourPastilleCartier();
}

function retirerDuPanier(id, taille) {
    let panier = lirePanier();
    panier = panier.filter(item => !(item.id === id && item.taille === taille));
    ecrirePanier(panier);
    mettreAJourPastilleCartier();
}

function modifierQuantitePanier(id, taille, nouvelleQuantite) {
    const panier = lirePanier();
    const ligne = panier.find(item => item.id === id && item.taille === taille);

    if (!ligne) return;

    if (nouvelleQuantite <= 0) {
        retirerDuPanier(id, taille);
        return;
    }

    ligne.quantite = nouvelleQuantite;
    ecrirePanier(panier);
    mettreAJourPastilleCartier();
}

function nombreArticlesPanier() {
    return lirePanier().reduce((total, item) => total + item.quantite, 0);
}

// Met à jour le petit chiffre bleu sur l'icône panier, sur TOUTES les pages
function mettreAJourPastilleCartier() {
    document
        .querySelectorAll(".pastille-panier")
        .forEach(pastille => {
            pastille.textContent = nombreArticlesPanier();
        });
}


/* =========================================================
   2. STOCKAGE — FAVORIS
========================================================= */

function lireFavoris() {
    try {
        const donnees = localStorage.getItem(CLE_FAVORIS);
        return donnees ? JSON.parse(donnees) : [];
    } catch (erreur) {
        console.error("Erreur de lecture des favoris :", erreur);
        return [];
    }
}

function ecrireFavoris(favoris) {
    localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
}

function estFavori(id) {
    return lireFavoris().includes(id);
}

function basculerFavori(id) {
    let favoris = lireFavoris();

    if (favoris.includes(id)) {
        favoris = favoris.filter(favId => favId !== id);
    } else {
        favoris.push(id);
    }

    ecrireFavoris(favoris);
    return favoris.includes(id);
}


/* =========================================================
   3. MENU MOBILE
========================================================= */

function initMenuMobile() {
    const bouton = document.querySelector(".menu-mobile");
    const navigation = document.querySelector(".navigation");

    if (!bouton || !navigation) return;

    bouton.addEventListener("click", () => {
        const ouvert = navigation.classList.toggle("navigation-ouverte");
        bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
}


/* =========================================================
   4. BOUTONS FAVORIS (cartes produit)
========================================================= */

function initBoutonsFavoris() {
    document.querySelectorAll(".favori-produit[data-id]").forEach(bouton => {
        const id = Number(bouton.dataset.id);

        if (estFavori(id)) {
            bouton.classList.add("selectionne");
            bouton.textContent = "♥";
        }

        bouton.addEventListener("click", evenement => {
            evenement.preventDefault();
            const actif = basculerFavori(id);

            bouton.classList.toggle("selectionne", actif);
            bouton.textContent = actif ? "♥" : "♡";
        });
    });
}


/* =========================================================
   5. FILTRES CATALOGUE
========================================================= */

function initFiltres() {
    const boutonsFiltre = document.querySelectorAll(".filtre[data-filtre]");
    const cartes = document.querySelectorAll(".carte-produit[data-categorie]");

    if (!boutonsFiltre.length) return;

    boutonsFiltre.forEach(bouton => {
        bouton.addEventListener("click", () => {

            boutonsFiltre.forEach(b => b.classList.remove("actif"));
            bouton.classList.add("actif");

            const filtre = bouton.dataset.filtre;

            cartes.forEach(carte => {
                const correspond =
                    filtre === "tous" || carte.dataset.categorie === filtre;

                carte.style.display = correspond ? "" : "none";
            });
        });
    });
}


/* =========================================================
   6. AJOUT AU PANIER DEPUIS UNE CARTE PRODUIT
   (accueil / catalogue : ajoute la taille par défaut)
========================================================= */

function initAjoutRapidePanier() {
    document.querySelectorAll(".ajouter-produit[data-id]").forEach(bouton => {
        bouton.addEventListener("click", evenement => {
            evenement.preventDefault();

            const id = Number(bouton.dataset.id);
            const produit = obtenirProduitParId(id);
            if (!produit) return;

            const tailleParDefaut = produit.tailles[Math.floor(produit.tailles.length / 2)];
            ajouterAuPanier(id, tailleParDefaut, 1);

            afficherToast(`${produit.nom} ajouté au panier`);
        });
    });
}


/* =========================================================
   7. PETITE NOTIFICATION "TOAST"
========================================================= */

function afficherToast(message) {
    let toast = document.querySelector(".toast-ktn");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast-ktn";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("toast-visible");

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove("toast-visible");
    }, 2200);
}


/* =========================================================
   8. PAGE PRODUIT — RENDU DYNAMIQUE
========================================================= */

function initPageProduit() {
    const conteneur = document.querySelector("[data-page='produit']");
    if (!conteneur) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const produit = obtenirProduitParId(id);

    if (!produit) {
        conteneur.innerHTML = `
            <div class="produit-introuvable">
                <h2>Produit introuvable</h2>
                <p>Ce produit n'existe pas ou n'est plus disponible.</p>
                <a href="catalogue.html" class="bouton bouton-primaire">
                    Retour au catalogue
                </a>
            </div>
        `;
        return;
    }

    document.title = `KTN Shoes | ${produit.nom}`;

    // -- Fil d'ariane
    const filDariane = document.querySelector(".fil-ariane-produit");
    if (filDariane) {
        filDariane.innerHTML = `
            <a href="index.html">Accueil</a>
            <span>/</span>
            <a href="catalogue.html">Catalogue</a>
            <span>/</span>
            <span>${produit.nom}</span>
        `;
    }

    // -- Image principale + miniatures
    const imagePrincipale = document.querySelector(".product-main-image");
    const miniaturesConteneur = document.querySelector(".product-thumbnails");

    if (imagePrincipale) {
        imagePrincipale.src = produit.image;
        imagePrincipale.alt = produit.nom;
    }

    if (miniaturesConteneur) {
        miniaturesConteneur.innerHTML = produit.images
            .map((src, index) => `
                <button
                    class="product-thumbnail ${index === 0 ? "actif" : ""}"
                    type="button"
                    data-src="${src}"
                    aria-label="Voir l'image ${index + 1} de ${produit.nom}"
                >
                    <img src="${src}" alt="">
                </button>
            `)
            .join("");

        miniaturesConteneur.querySelectorAll(".product-thumbnail").forEach(miniature => {
            miniature.addEventListener("click", () => {
                miniaturesConteneur
                    .querySelectorAll(".product-thumbnail")
                    .forEach(m => m.classList.remove("actif"));

                miniature.classList.add("actif");
                if (imagePrincipale) imagePrincipale.src = miniature.dataset.src;
            });
        });
    }

    // -- Badge favoris de la page produit
    const boutonFavori = document.querySelector(".product-favori");
    if (boutonFavori) {
        boutonFavori.dataset.id = produit.id;

        if (estFavori(produit.id)) {
            boutonFavori.classList.add("selectionne");
            boutonFavori.textContent = "♥ Dans vos favoris";
        }

        boutonFavori.addEventListener("click", () => {
            const actif = basculerFavori(produit.id);
            boutonFavori.classList.toggle("selectionne", actif);
            boutonFavori.textContent = actif ? "♥ Dans vos favoris" : "♡ Ajouter aux favoris";
        });
    }

    // -- Infos texte
    remplirTexte(".product-categorie", `${produit.categorieLabel} · ${produit.type}`);
    remplirTexte(".product-titre", produit.nom);
    remplirTexte(".product-prix", formaterPrix(produit.prix));
    remplirTexte(".product-description", produit.description);

    const note = document.querySelector(".product-note");
    if (note) {
        note.innerHTML = "★".repeat(produit.note) + "☆".repeat(5 - produit.note);
    }

    if (produit.badge) {
        const badge = document.querySelector(".product-badge");
        if (badge) {
            badge.textContent = produit.badge;
            badge.style.display = "";
        }
    }

    // -- Liste de détails
    const listeDetails = document.querySelector(".product-details-liste");
    if (listeDetails) {
        listeDetails.innerHTML = produit.details
            .map(detail => `<li>${detail}</li>`)
            .join("");
    }

    // -- Sélecteur de taille
    const selecteurTailles = document.querySelector(".product-tailles");
    let tailleChoisie = produit.tailles[0];

    if (selecteurTailles) {
        selecteurTailles.innerHTML = produit.tailles
            .map((taille, index) => `
                <button
                    class="taille-option ${index === 0 ? "actif" : ""}"
                    type="button"
                    data-taille="${taille}"
                >
                    ${taille}
                </button>
            `)
            .join("");

        selecteurTailles.querySelectorAll(".taille-option").forEach(option => {
            option.addEventListener("click", () => {
                selecteurTailles
                    .querySelectorAll(".taille-option")
                    .forEach(o => o.classList.remove("actif"));

                option.classList.add("actif");
                tailleChoisie = Number(option.dataset.taille);
            });
        });
    }

    // -- Sélecteur de quantité
    const champQuantite = document.querySelector(".quantite-valeur");
    const boutonMoins = document.querySelector(".quantite-moins");
    const boutonPlus = document.querySelector(".quantite-plus");
    let quantiteChoisie = 1;

    function majQuantite() {
        if (champQuantite) champQuantite.textContent = quantiteChoisie;
    }

    if (boutonMoins) {
        boutonMoins.addEventListener("click", () => {
            if (quantiteChoisie > 1) quantiteChoisie--;
            majQuantite();
        });
    }

    if (boutonPlus) {
        boutonPlus.addEventListener("click", () => {
            if (quantiteChoisie < 10) quantiteChoisie++;
            majQuantite();
        });
    }

    // -- Bouton "Ajouter au panier"
    const boutonAjouter = document.querySelector(".product-ajouter-panier");
    if (boutonAjouter) {
        boutonAjouter.addEventListener("click", () => {
            ajouterAuPanier(produit.id, tailleChoisie, quantiteChoisie);
            afficherToast(`${produit.nom} (taille ${tailleChoisie}) ajouté au panier`);
        });
    }

    // -- Produits similaires
    const conteneurSimilaires = document.querySelector(".produits-similaires-grille");
    if (conteneurSimilaires) {
        const similaires = produitsSimilaires(produit.categorie, produit.id, 4);
        conteneurSimilaires.innerHTML = similaires.map(carteProduitHTML).join("");
        initBoutonsFavoris();
        initAjoutRapidePanier();
    }
}

function remplirTexte(selecteur, texte) {
    const element = document.querySelector(selecteur);
    if (element) element.textContent = texte;
}

// Génère le HTML d'une carte produit (réutilisé pour "produits similaires")
function carteProduitHTML(produit) {
    return `
        <article class="carte-produit" data-categorie="${produit.categorie}">

            ${produit.badge
                ? `<div class="badge-produit ${produit.badge === "Nouveau" ? "nouveau" : ""}">${produit.badge}</div>`
                : ""
            }

            <button
                class="favori-produit"
                type="button"
                data-id="${produit.id}"
                aria-label="Ajouter ${produit.nom} aux favoris"
            >♡</button>

            <a href="produit.html?id=${produit.id}" class="image-produit">
                <img src="${produit.image}" alt="${produit.nom}">
                <span class="voir-produit">Voir le produit →</span>
            </a>

            <div class="infos-produit">
                <span class="categorie-produit">${produit.categorieLabel} · ${produit.type}</span>
                <h3>${produit.nom}</h3>
                <div class="note-produit">${"★".repeat(produit.note)}${"☆".repeat(5 - produit.note)}</div>

                <div class="produit-bas">
                    <strong class="prix">${formaterPrix(produit.prix)}</strong>
                    <a href="produit.html?id=${produit.id}" class="ajouter-produit" aria-label="Voir ${produit.nom}">+</a>
                </div>
            </div>

        </article>
    `;
}


/* =========================================================
   9. PAGE PANIER — RENDU DYNAMIQUE
========================================================= */

const FRAIS_LIVRAISON = 1500;

function initPagePanier() {
    const conteneur = document.querySelector("[data-page='panier']");
    if (!conteneur) return;

    afficherPanier();

    const boutonValider = document.querySelector(".panier-valider");
    if (boutonValider) {
        boutonValider.addEventListener("click", () => {
            if (lirePanier().length === 0) return;

            // Pas de backend : on simule la validation de commande.
            afficherToast("Commande validée — merci pour votre achat !");
            localStorage.removeItem(CLE_PANIER);
            afficherPanier();
            mettreAJourPastilleCartier();
        });
    }
}

function afficherPanier() {
    const listeConteneur = document.querySelector(".panier-liste");
    const panierVideConteneur = document.querySelector(".panier-vide");
    const resumeConteneur = document.querySelector(".panier-resume");

    const panier = lirePanier();

    if (panier.length === 0) {
        if (listeConteneur) listeConteneur.style.display = "none";
        if (resumeConteneur) resumeConteneur.style.display = "none";
        if (panierVideConteneur) panierVideConteneur.style.display = "block";
        return;
    }

    if (listeConteneur) listeConteneur.style.display = "grid";
    if (resumeConteneur) resumeConteneur.style.display = "block";
    if (panierVideConteneur) panierVideConteneur.style.display = "none";

    if (!listeConteneur) return;

    let sousTotal = 0;

    listeConteneur.innerHTML = panier.map(ligne => {
        const produit = obtenirProduitParId(ligne.id);
        if (!produit) return "";

        const sousTotalLigne = produit.prix * ligne.quantite;
        sousTotal += sousTotalLigne;

        return `
            <article class="ligne-panier" data-id="${produit.id}" data-taille="${ligne.taille}">

                <a href="produit.html?id=${produit.id}" class="ligne-panier-image">
                    <img src="${produit.image}" alt="${produit.nom}">
                </a>

                <div class="ligne-panier-infos">
                    <span class="ligne-panier-categorie">${produit.categorieLabel} · ${produit.type}</span>
                    <a href="produit.html?id=${produit.id}" class="ligne-panier-nom">${produit.nom}</a>
                    <span class="ligne-panier-taille">Taille : ${ligne.taille}</span>

                    <button class="ligne-panier-supprimer" type="button">
                        Supprimer
                    </button>
                </div>

                <div class="ligne-panier-quantite">
                    <button class="ligne-quantite-moins" type="button" aria-label="Diminuer la quantité">−</button>
                    <span class="ligne-quantite-valeur">${ligne.quantite}</span>
                    <button class="ligne-quantite-plus" type="button" aria-label="Augmenter la quantité">+</button>
                </div>

                <strong class="ligne-panier-prix">${formaterPrix(sousTotalLigne)}</strong>

            </article>
        `;
    }).join("");

    // -- Écouteurs sur chaque ligne
    listeConteneur.querySelectorAll(".ligne-panier").forEach(ligneElement => {
        const id = Number(ligneElement.dataset.id);
        const taille = Number(ligneElement.dataset.taille);

        ligneElement.querySelector(".ligne-panier-supprimer").addEventListener("click", () => {
            retirerDuPanier(id, taille);
            afficherPanier();
        });

        ligneElement.querySelector(".ligne-quantite-moins").addEventListener("click", () => {
            const ligne = lirePanier().find(l => l.id === id && l.taille === taille);
            if (ligne) modifierQuantitePanier(id, taille, ligne.quantite - 1);
            afficherPanier();
        });

        ligneElement.querySelector(".ligne-quantite-plus").addEventListener("click", () => {
            const ligne = lirePanier().find(l => l.id === id && l.taille === taille);
            if (ligne) modifierQuantitePanier(id, taille, ligne.quantite + 1);
            afficherPanier();
        });
    });

    // -- Résumé (sous-total, livraison, total)
    const elementSousTotal = document.querySelector(".resume-sous-total");
    const elementLivraison = document.querySelector(".resume-livraison");
    const elementTotal = document.querySelector(".resume-total");

    if (elementSousTotal) elementSousTotal.textContent = formaterPrix(sousTotal);
    if (elementLivraison) elementLivraison.textContent = formaterPrix(FRAIS_LIVRAISON);
    if (elementTotal) elementTotal.textContent = formaterPrix(sousTotal + FRAIS_LIVRAISON);
}


/* =========================================================
   10. INITIALISATION GLOBALE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    mettreAJourPastilleCartier();
    initMenuMobile();
    initBoutonsFavoris();
    initFiltres();
    initAjoutRapidePanier();
    initPageProduit();
    initPagePanier();
});