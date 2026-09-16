/* SCRIPT PRINCIPAL — KTN SHOES */

const CLE_PANIER = "ktn_panier";
const CLE_FAVORIS = "ktn_favoris";
const CLE_THEME = "ktn_theme";
const FRAIS_LIVRAISON = 1500;
const TELEPHONE_WHATSAPP = "2290153539873";


/* 1. STOCKAGE — PANIER */

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

    const ligneExistante = panier.find(
        item => item.id === id && item.taille === taille
    );

    if (ligneExistante) {
        ligneExistante.quantite += quantite;
    } else {
        panier.push({ id, taille, quantite });
    }

    ecrirePanier(panier);
    mettreAJourPastillePanier();
}

function retirerDuPanier(id, taille) {
    let panier = lirePanier();
    panier = panier.filter(item => !(item.id === id && item.taille === taille));
    ecrirePanier(panier);
    mettreAJourPastillePanier();
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
    mettreAJourPastillePanier();
}

function nombreArticlesPanier() {
    return lirePanier().reduce((total, item) => total + item.quantite, 0);
}

function mettreAJourPastillePanier() {
    document
        .querySelectorAll(".pastille-panier")
        .forEach(pastille => {
            pastille.textContent = nombreArticlesPanier();
        });
}


/* 2. STOCKAGE — FAVORIS */

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


/* 3. MENU MOBILE */

function initMenuMobile() {
    const bouton = document.querySelector(".menu-mobile");
    const navigation = document.querySelector(".navigation");

    if (!bouton || !navigation) return;

    function fermerMenu() {
        navigation.classList.remove("navigation-ouverte");
        bouton.setAttribute("aria-expanded", "false");
    }

    bouton.addEventListener("click", () => {
        const ouvert = navigation.classList.toggle("navigation-ouverte");
        bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });

    // Fermeture lors du clic sur n'importe quel lien du menu
    navigation.querySelectorAll("a").forEach(lien => {
        lien.addEventListener("click", fermerMenu);
    });

    // Fermeture avec la touche Échap
    document.addEventListener("keydown", evenement => {
        if (evenement.key === "Escape" && navigation.classList.contains("navigation-ouverte")) {
            fermerMenu();
            bouton.focus();
        }
    });
}


/* 4. BOUTONS FAVORIS (cartes produit) */

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


/* 5. RECHERCHE, TRI ET FILTRES CATALOGUE */

function initFiltres() {
    const boutonsFiltre = document.querySelectorAll(".filtre[data-filtre]");
    const conteneurGrille = document.querySelector(".grille-produits2") || document.querySelector(".grille-produits");
    const champRecherche = document.getElementById("recherche-catalogue");
    const selectTri = document.getElementById("tri-catalogue");
    const compteur = document.querySelector(".catalogue-compteur");

    if (!conteneurGrille) return;

    let categorieActive = "tous";
    let rechercheTexte = "";
    let triActif = "defaut";

    function appliquerFiltresEtTri() {
        const cartes = Array.from(conteneurGrille.querySelectorAll(".carte-produit"));
        let visibles = 0;

        cartes.forEach(carte => {
            const categorie = carte.dataset.categorie || "";
            const titre = (carte.querySelector("h3")?.textContent || "").toLowerCase();
            const categorieTexte = (carte.querySelector(".categorie-produit")?.textContent || "").toLowerCase();

            const correspondCategorie = (categorieActive === "tous" || categorie === categorieActive);
            const correspondRecherche = !rechercheTexte || titre.includes(rechercheTexte) || categorieTexte.includes(rechercheTexte);

            if (correspondCategorie && correspondRecherche) {
                carte.style.display = "";
                visibles++;
            } else {
                carte.style.display = "none";
            }
        });

        // Tri des cartes visibles
        if (triActif !== "defaut") {
            cartes.sort((a, b) => {
                const prixA = extrairePrix(a);
                const prixB = extrairePrix(b);
                const nomA = (a.querySelector("h3")?.textContent || "").trim();
                const nomB = (b.querySelector("h3")?.textContent || "").trim();
                const noteA = (a.querySelector(".note-produit")?.textContent.match(/★/g) || []).length;
                const noteB = (b.querySelector(".note-produit")?.textContent.match(/★/g) || []).length;

                switch (triActif) {
                    case "prix-asc":
                        return prixA - prixB;
                    case "prix-desc":
                        return prixB - prixA;
                    case "nom-asc":
                        return nomA.localeCompare(nomB);
                    case "note-desc":
                        return noteB - noteA;
                    default:
                        return 0;
                }
            });

            cartes.forEach(carte => conteneurGrille.appendChild(carte));
        }

        if (compteur) {
            compteur.textContent = `${visibles} modèle${visibles > 1 ? "s" : ""}`;
        }
    }

    function extrairePrix(carte) {
        const texte = carte.querySelector(".prix")?.textContent || "";
        const nombre = parseInt(texte.replace(/[^\d]/g, ""), 10);
        return isNaN(nombre) ? 0 : nombre;
    }

    if (boutonsFiltre.length) {
        boutonsFiltre.forEach(bouton => {
            bouton.addEventListener("click", () => {
                boutonsFiltre.forEach(b => b.classList.remove("actif"));
                bouton.classList.add("actif");
                categorieActive = bouton.dataset.filtre;
                appliquerFiltresEtTri();
            });
        });
    }

    if (champRecherche) {
        champRecherche.addEventListener("input", () => {
            rechercheTexte = champRecherche.value.trim().toLowerCase();
            appliquerFiltresEtTri();
        });
    }

    if (selectTri) {
        selectTri.addEventListener("change", () => {
            triActif = selectTri.value;
            appliquerFiltresEtTri();
        });
    }
}


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


/* PETITE NOTIFICATION "TOAST" */

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
    }, 2400);
}


/* 6. PAGE PRODUIT — RENDU DYNAMIQUE */

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

    // Fil d'Ariane
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
                    <img src="${src}" alt="Miniature ${index + 1} de ${produit.nom}" loading="lazy">
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

    remplirTexte(".product-categorie", `${produit.categorieLabel} · ${produit.type}`);
    remplirTexte(".product-titre", produit.nom);
    remplirTexte(".product-prix", formaterPrix(produit.prix));
    remplirTexte(".product-description", produit.description);

    const note = document.querySelector(".product-note");
    if (note) {
        note.setAttribute("role", "img");
        note.setAttribute("aria-label", `Note : ${produit.note} sur 5 étoiles`);
        note.innerHTML = `<span aria-hidden="true">${"★".repeat(produit.note)}${"☆".repeat(5 - produit.note)}</span>`;
    }

    if (produit.badge) {
        const badge = document.querySelector(".product-badge");
        if (badge) {
            badge.textContent = produit.badge;
            badge.style.display = "";
        }
    }

    const listeDetails = document.querySelector(".product-details-liste");
    if (listeDetails) {
        listeDetails.innerHTML = produit.details
            .map(detail => `<li>${detail}</li>`)
            .join("");
    }

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

    const boutonAjouter = document.querySelector(".product-ajouter-panier");
    if (boutonAjouter) {
        boutonAjouter.addEventListener("click", () => {
            ajouterAuPanier(produit.id, tailleChoisie, quantiteChoisie);
            afficherToast(`${produit.nom} (taille ${tailleChoisie}) ajouté au panier`);
        });
    }

    const conteneurSimilaires = document.querySelector(".produits-similaires-grille");
    if (conteneurSimilaires) {
        const similaires = produitsSimilaires(produit.categorie, produit.id, 4);
        conteneurSimilaires.innerHTML = similaires.map(carteProduitHTML).join("");
        initBoutonsFavoris();
        initAjoutRapidePanier();
    }

    // Données structurées Schema.org Produit
    injecterSchemaProduit(produit);
}

function injecterSchemaProduit(produit) {
    const existant = document.getElementById("schema-produit");
    if (existant) existant.remove();

    const script = document.createElement("script");
    script.id = "schema-produit";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": produit.nom,
        "image": window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + produit.image,
        "description": produit.description,
        "category": produit.categorieLabel,
        "brand": {
            "@type": "Brand",
            "name": "KTN Shoes"
        },
        "offers": {
            "@type": "Offer",
            "price": produit.prix,
            "priceCurrency": "XOF",
            "availability": "https://schema.org/InStock",
            "url": window.location.href
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": produit.note,
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": "12"
        }
    });
    document.head.appendChild(script);
}

function remplirTexte(selecteur, texte) {
    const element = document.querySelector(selecteur);
    if (element) element.textContent = texte;
}

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
                <img src="${produit.image}" alt="${produit.nom}" loading="lazy">
                <span class="voir-produit">Voir le produit →</span>
            </a>

            <div class="infos-produit">
                <span class="categorie-produit">${produit.categorieLabel} · ${produit.type}</span>
                <h3>${produit.nom}</h3>
                <div class="note-produit" role="img" aria-label="Note : ${produit.note} sur 5 étoiles">
                    <span aria-hidden="true">${"★".repeat(produit.note)}${"☆".repeat(5 - produit.note)}</span>
                </div>

                <div class="produit-bas">
                    <strong class="prix">${formaterPrix(produit.prix)}</strong>
                    <a href="produit.html?id=${produit.id}" class="ajouter-produit" aria-label="Voir ${produit.nom}">+</a>
                </div>
            </div>

        </article>
    `;
}


/* 7. PAGE PANIER & COMMANDE WHATSAPP */

function initPagePanier() {
    const conteneur = document.querySelector("[data-page='panier']");
    if (!conteneur) return;

    afficherPanier();

    const boutonValider = document.querySelector(".panier-valider");
    if (boutonValider) {
        boutonValider.addEventListener("click", () => {
            const panier = lirePanier();
            if (panier.length === 0) return;

            afficherModaleConfirmation(panier);
        });
    }
}

function afficherModaleConfirmation(panier) {
    let modale = document.getElementById("modale-commande");
    if (!modale) {
        modale = document.createElement("div");
        modale.id = "modale-commande";
        modale.className = "modale-overlay";
        document.body.appendChild(modale);
    }

    const numeroCommande = "KTN-" + Math.floor(100000 + Math.random() * 900000);
    let totalArticles = 0;

    let texteWhatsApp = `*Nouvelle commande KTN Shoes*\nRef: ${numeroCommande}\n--------------------------\n`;

    const lignesHTML = panier.map(ligne => {
        const produit = obtenirProduitParId(ligne.id);
        if (!produit) return "";
        const sousTotal = produit.prix * ligne.quantite;
        totalArticles += sousTotal;

        texteWhatsApp += `• ${produit.nom} (Taille ${ligne.taille}) x${ligne.quantite} : ${formaterPrix(sousTotal)}\n`;

        return `
            <div class="modale-ligne">
                <span>${produit.nom} (Taille ${ligne.taille}) <strong>x${ligne.quantite}</strong></span>
                <span>${formaterPrix(sousTotal)}</span>
            </div>
        `;
    }).join("");

    const totalFinal = totalArticles + FRAIS_LIVRAISON;
    texteWhatsApp += `--------------------------\nSous-total : ${formaterPrix(totalArticles)}\nLivraison : ${formaterPrix(FRAIS_LIVRAISON)}\n*Total : ${formaterPrix(totalFinal)}*\n\nJe souhaite confirmer ma commande. Merci !`;

    const lienWhatsApp = `https://wa.me/${TELEPHONE_WHATSAPP}?text=${encodeURIComponent(texteWhatsApp)}`;

    modale.innerHTML = `
        <div class="modale-contenu" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation">
            <div class="modale-icone">✓</div>
            <h2 id="titre-confirmation">Commande enregistrée !</h2>
            <p class="modale-ref">Référence : <strong>${numeroCommande}</strong></p>
            <div class="modale-recapitulatif">
                ${lignesHTML}
                <div class="modale-ligne modale-livraison">
                    <span>Livraison standard</span>
                    <span>${formaterPrix(FRAIS_LIVRAISON)}</span>
                </div>
                <div class="modale-ligne modale-total">
                    <strong>Total à régler</strong>
                    <strong>${formaterPrix(totalFinal)}</strong>
                </div>
            </div>
            <p class="modale-instruction">
                Finalisez dès maintenant votre commande directement avec nous sur WhatsApp pour convenir de la livraison.
            </p>
            <div class="modale-actions">
                <a href="${lienWhatsApp}" target="_blank" rel="noopener noreferrer" class="bouton bouton-whatsapp">
                    Finaliser sur WhatsApp
                </a>
                <button type="button" class="bouton bouton-secondaire modale-fermer">
                    Fermer
                </button>
            </div>
        </div>
    `;

    modale.classList.add("modale-ouverte");

    const fermer = () => {
        modale.remove();
        localStorage.removeItem(CLE_PANIER);
        afficherPanier();
        mettreAJourPastillePanier();
    };

    const boutonFermer = modale.querySelector(".modale-fermer");
    if (boutonFermer) {
        boutonFermer.addEventListener("click", (e) => {
            e.preventDefault();
            fermer();
        });
    }

    const boutonWhatsApp = modale.querySelector(".bouton-whatsapp");
    if (boutonWhatsApp) {
        boutonWhatsApp.addEventListener("click", () => {
            setTimeout(fermer, 400);
        });
    }

    modale.addEventListener("click", (e) => {
        if (e.target === modale) {
            fermer();
        }
    });

    const gestionToucheEchap = (e) => {
        if (e.key === "Escape") {
            fermer();
            document.removeEventListener("keydown", gestionToucheEchap);
        }
    };
    document.addEventListener("keydown", gestionToucheEchap);
}

function afficherPanier() {
    const contenuConteneur = document.querySelector(".panier-contenu");
    const listeConteneur = document.querySelector(".panier-liste");
    const panierVideConteneur = document.querySelector(".panier-vide");
    const resumeConteneur = document.querySelector(".panier-resume");

    const panier = lirePanier();

    if (panier.length === 0) {
        if (contenuConteneur) contenuConteneur.style.display = "none";
        if (listeConteneur) listeConteneur.style.display = "none";
        if (resumeConteneur) resumeConteneur.style.display = "none";
        if (panierVideConteneur) panierVideConteneur.style.display = "block";
        return;
    }

    if (contenuConteneur) contenuConteneur.style.display = "grid";
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

    const elementSousTotal = document.querySelector(".resume-sous-total");
    const elementLivraison = document.querySelector(".resume-livraison");
    const elementTotal = document.querySelector(".resume-total");

    if (elementSousTotal) elementSousTotal.textContent = formaterPrix(sousTotal);
    if (elementLivraison) elementLivraison.textContent = formaterPrix(FRAIS_LIVRAISON);
    if (elementTotal) elementTotal.textContent = formaterPrix(sousTotal + FRAIS_LIVRAISON);
}


/* 8. BASCULE THÈME (clair / sombre) */

function themeActuel() {
    return document.documentElement.getAttribute("data-theme") === "sombre"
        ? "sombre"
        : "clair";
}

function appliquerTheme(theme) {
    if (theme === "sombre") {
        document.documentElement.setAttribute("data-theme", "sombre");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
}

function majIconeTheme(bouton) {
    const sombre = themeActuel() === "sombre";
    bouton.textContent = sombre ? "☀" : "☾";
    bouton.setAttribute(
        "aria-label",
        sombre ? "Activer le mode clair" : "Activer le mode sombre"
    );
}

function initBasculeTheme() {
    const bouton = document.querySelector(".theme-toggle");
    if (!bouton) return;

    majIconeTheme(bouton);

    bouton.addEventListener("click", () => {
        const nouveauTheme = themeActuel() === "sombre" ? "clair" : "sombre";
        appliquerTheme(nouveauTheme);
        localStorage.setItem(CLE_THEME, nouveauTheme);
        majIconeTheme(bouton);
    });
}


/* 9. INITIALISATION GLOBALE */

document.addEventListener("DOMContentLoaded", () => {
    mettreAJourPastillePanier();
    initMenuMobile();
    initBoutonsFavoris();
    initFiltres();
    initAjoutRapidePanier();
    initPageProduit();
    initPagePanier();
    initBasculeTheme();
});