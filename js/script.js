/* SCRIPT PRINCIPAL — KTN SHOES */

const CLE_PANIER = "ktn_panier";
const CLE_FAVORIS = "ktn_favoris";
const CLE_THEME = "ktn_theme";
const FRAIS_LIVRAISON = 1000;
const TELEPHONE_WHATSAPP = "2290153539873";

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

    navigation.querySelectorAll("a").forEach(lien => {
        lien.addEventListener("click", fermerMenu);
    });

    document.addEventListener("keydown", evenement => {
        if (evenement.key === "Escape" && navigation.classList.contains("navigation-ouverte")) {
            fermerMenu();
            bouton.focus();
        }
    });
}

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

        fetch(`http://localhost:3000/api/produits/${id}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && data.donnees && Array.isArray(data.donnees.stocks)) {
                    const stocks = data.donnees.stocks;
                    const boutonsTaille = selecteurTailles.querySelectorAll(".taille-option");
                    boutonsTaille.forEach(btn => {
                        const tailleNum = Number(btn.dataset.taille);
                        const infoStock = stocks.find(s => s.pointure === tailleNum);
                        if (infoStock && infoStock.quantite <= 0) {
                            btn.classList.add("taille-epuisee");
                            btn.disabled = true;
                            btn.title = "Pointure épuisée";
                        }
                    });
                }
            })
            .catch(() => {});
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

    let totalArticles = 0;
    const lignesHTML = panier.map(ligne => {
        const produit = obtenirProduitParId(ligne.id);
        if (!produit) return "";
        const sousTotal = produit.prix * ligne.quantite;
        totalArticles += sousTotal;
        return `
            <div class="modale-ligne">
                <span>${produit.nom} (Pt. ${ligne.taille}) <strong>x${ligne.quantite}</strong></span>
                <span>${formaterPrix(sousTotal)}</span>
            </div>
        `;
    }).join("");

    const totalFinal = totalArticles + FRAIS_LIVRAISON;

    modale.innerHTML = `
        <div class="modale-contenu" role="dialog" aria-modal="true" aria-labelledby="titre-commande">
            <h2 id="titre-commande" class="modale-titre">Finaliser votre commande</h2>
            <p class="modale-reference">Renseignez vos coordonnées pour la livraison à domicile.</p>

            <div class="modale-recapitulatif">
                ${lignesHTML}
                <div class="modale-ligne">
                    <span>Livraison standard</span>
                    <span>${formaterPrix(FRAIS_LIVRAISON)}</span>
                </div>
                <div class="modale-ligne total">
                    <strong>Total</strong>
                    <strong>${formaterPrix(totalFinal)}</strong>
                </div>
            </div>

            <form id="form-validation-commande" class="form-commande-client" novalidate>
                <div class="contact-champ-groupe" style="text-align: left; margin-bottom: 12px;">
                    <label for="cmd-nom" style="font-size: 0.82rem; font-weight: 600;">Nom complet <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="cmd-nom" required placeholder="Ex : Jean Dupont" style="padding: 10px 12px; border: 1px solid var(--bordure); border-radius: 8px; width: 100%; background: var(--fond-page); color: var(--texte);">
                </div>

                <div class="contact-champ-groupe" style="text-align: left; margin-bottom: 12px;">
                    <label for="cmd-tel" style="font-size: 0.82rem; font-weight: 600;">Numéro de téléphone (WhatsApp) <span style="color:#ef4444;">*</span></label>
                    <input type="tel" id="cmd-tel" required placeholder="+229 01..." style="padding: 10px 12px; border: 1px solid var(--bordure); border-radius: 8px; width: 100%; background: var(--fond-page); color: var(--texte);">
                </div>

                <div class="contact-champ-groupe" style="text-align: left; margin-bottom: 14px;">
                    <label for="cmd-adresse" style="font-size: 0.82rem; font-weight: 600;">Adresse de livraison & quartier <span style="color:#ef4444;">*</span></label>
                    <input type="text" id="cmd-adresse" required placeholder="Ex : Haie Vive, Rue 12, Cotonou" style="padding: 10px 12px; border: 1px solid var(--bordure); border-radius: 8px; width: 100%; background: var(--fond-page); color: var(--texte);">
                </div>

                <div id="cmd-feedback" class="feedback-box feedback-erreur" style="display: none; margin-bottom: 12px; font-size: 0.85rem;" role="alert"></div>

                <div class="modale-actions">
                    <button type="submit" id="btn-confirmer-commande" class="bouton bouton-primaire" style="width: 100%; justify-content: center; padding: 13px;">
                        Confirmer la commande
                    </button>
                    <button type="button" class="bouton bouton-secondaire modale-fermer" style="width: 100%; justify-content: center;">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    `;

    modale.classList.add("modale-ouverte");

    const formCmd = document.getElementById("form-validation-commande");
    const feedback = document.getElementById("cmd-feedback");
    const btnSubmit = document.getElementById("btn-confirmer-commande");

    const fermerModale = () => {
        modale.remove();
    };

    modale.querySelectorAll(".modale-fermer").forEach(b => b.addEventListener("click", fermerModale));

    formCmd.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nom = (document.getElementById("cmd-nom").value || "").trim();
        const telephone = (document.getElementById("cmd-tel").value || "").trim();
        const adresse = (document.getElementById("cmd-adresse").value || "").trim();

        if (!nom || !telephone || !adresse) {
            feedback.textContent = "Veuillez remplir tous les champs obligatoires.";
            feedback.style.display = "block";
            return;
        }

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = "<span>Enregistrement en cours...</span>";
        feedback.style.display = "none";

        const payload = {
            client: {
                nom,
                telephone,
                adresse,
                ville: "Cotonou"
            },
            articles: panier.map(ligne => ({
                produit_id: ligne.id,
                pointure: ligne.taille,
                quantite: ligne.quantite
            }))
        };

        try {
            const reponse = await fetch("http://localhost:3000/api/commandes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const resultat = await reponse.json();

            if (reponse.ok && resultat.statut === "succes") {
                afficherSuccesCommande(resultat.donnees.reference, resultat.donnees.total, resultat.donnees.lienWhatsApp);
            } else {
                feedback.textContent = resultat.message || "Une erreur est survenue lors de l'enregistrement de votre commande.";
                feedback.style.display = "block";
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = "Confirmer la commande";
            }
        } catch (errReseau) {
            console.warn("Backend non joignable, bascule sur la finalisation directe (fallback) :", errReseau);
            const fallbackRef = "KTN-" + Math.floor(100000 + Math.random() * 900000);
            let waText = `*Nouvelle commande KTN Shoes*\nRef: ${fallbackRef}\nClient: ${nom}\nTél: ${telephone}\nAdresse: ${adresse}\n--------------------------\n`;
            for (const item of panier) {
                const p = obtenirProduitParId(item.id);
                if (p) waText += `• ${p.nom} (Pt. ${item.taille}) x${item.quantite} : ${formaterPrix(p.prix * item.quantite)}\n`;
            }
            waText += `--------------------------\nTotal : ${formaterPrix(totalFinal)}\n\nJe souhaite confirmer ma commande. Merci !`;
            const waLink = `https://wa.me/${TELEPHONE_WHATSAPP}?text=${encodeURIComponent(waText)}`;

            afficherSuccesCommande(fallbackRef, totalFinal, waLink);
        }
    });

    function afficherSuccesCommande(reference, total, lienWhatsApp) {
        modale.innerHTML = `
            <div class="modale-contenu" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation">
                <div class="modale-icone">✓</div>
                <h2 id="titre-confirmation">Commande enregistrée !</h2>
                <p class="modale-reference">Référence officielle : <strong>${reference}</strong></p>
                <div class="modale-recapitulatif">
                    <div class="modale-ligne total">
                        <strong>Total à régler</strong>
                        <strong>${formaterPrix(total)}</strong>
                    </div>
                </div>
                <p class="modale-explication">
                    Votre commande est enregistrée dans notre système. Finalisez-la dès maintenant sur WhatsApp pour convenir de l'heure exacte de livraison !
                </p>
                <div class="modale-actions">
                    <a href="${lienWhatsApp}" target="_blank" rel="noopener noreferrer" class="bouton bouton-whatsapp" id="btn-final-whatsapp">
                        Finaliser sur WhatsApp
                    </a>
                    <button type="button" class="bouton bouton-secondaire modale-fermer-final">
                        Fermer
                    </button>
                </div>
            </div>
        `;

        localStorage.removeItem(CLE_PANIER);
        afficherPanier();
        mettreAJourPastillePanier();

        const fermerFinal = () => modale.remove();
        modale.querySelector(".modale-fermer-final").addEventListener("click", fermerFinal);
        modale.querySelector("#btn-final-whatsapp").addEventListener("click", () => setTimeout(fermerFinal, 500));
    }
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

function initFormulaireContact() {
    const form = document.getElementById("form-contact");
    if (!form) return;

    const feedback = document.getElementById("contact-feedback");
    const btnSubmit = document.getElementById("btn-envoyer-contact");

    function afficherFeedback(msg, type) {
        if (!feedback) return;
        feedback.textContent = msg;
        feedback.className = "contact-feedback feedback-" + type;
        feedback.style.display = "block";
        feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nom = (form.nom ? form.nom.value : "").trim();
        const email = (form.email ? form.email.value : "").trim();
        const telephone = (form.telephone ? form.telephone.value : "").trim();
        const sujet = (form.sujet ? form.sujet.value : "").trim();
        const message = (form.message ? form.message.value : "").trim();

        if (!nom) {
            afficherFeedback("Veuillez saisir votre nom complet.", "erreur");
            if (form.nom) form.nom.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            afficherFeedback("Veuillez saisir une adresse email valide.", "erreur");
            if (form.email) form.email.focus();
            return;
        }

        if (!sujet) {
            afficherFeedback("Veuillez sélectionner un sujet.", "erreur");
            if (form.sujet) form.sujet.focus();
            return;
        }

        if (!message || message.length < 5) {
            afficherFeedback("Veuillez saisir un message d'au moins 5 caractères.", "erreur");
            if (form.message) form.message.focus();
            return;
        }

        const htmlOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="btn-spinner"></span> <span>Envoi en cours...</span>';
        if (feedback) feedback.style.display = "none";

        try {
            const reponse = await fetch("http://localhost:3000/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nom,
                    email,
                    telephone,
                    sujet,
                    message
                })
            });

            const donnees = await reponse.json();

            if (reponse.ok && donnees.statut === "succes") {
                afficherFeedback(donnees.message || "Votre message a été envoyé avec succès !", "succes");
                form.reset();
            } else {
                afficherFeedback(donnees.message || "Une erreur est survenue lors de l'envoi de votre message.", "erreur");
            }

        } catch (erreurReseau) {
            console.warn("API locale non joignable :", erreurReseau);
            afficherFeedback(
                "Impossible de joindre le serveur API. Assurez-vous que le backend est démarré sur http://localhost:3000 (npm start).",
                "erreur"
            );
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = htmlOriginal;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    mettreAJourPastillePanier();
    initMenuMobile();
    initBoutonsFavoris();
    initFiltres();
    initAjoutRapidePanier();
    initPageProduit();
    initPagePanier();
    initBasculeTheme();
    initFormulaireContact();
});