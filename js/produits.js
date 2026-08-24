/* =========================================================
   KTN SHOES — BASE DE DONNÉES PRODUITS
   Toutes les pages (accueil, catalogue, produit, panier)
   lisent ce même tableau : une seule source de vérité.
========================================================= */

const PRODUITS = [

    {
        id: 1,
        nom: "KTN Runner",
        categorie: "homme",
        categorieLabel: "Homme",
        type: "Sneakers",
        prix: 25000,
        note: 5,
        badge: "Bestseller",
        image: "images/ktn-runner1.jpg",
        images: [
            "images/ktn-runner1.jpg",
            "images/ktn-runner1.jpg",
            "images/ktn-runner1.jpg"
        ],
        tailles: [40, 41, 42, 43, 44, 45],
        description: "La KTN Runner est notre modèle signature : une sneaker de tous les jours pensée pour le confort urbain. Semelle légère à absorption de choc, tige respirante et accroche fiable sur tous les terrains de la ville.",
        details: [
            "Tige textile respirante",
            "Semelle intermédiaire amortissante",
            "Doublure douce anti-frottement",
            "Entretien : nettoyage à sec recommandé"
        ]
    },

    {
        id: 2,
        nom: "KTN Classic",
        categorie: "homme",
        categorieLabel: "Homme",
        type: "Sneakers",
        prix: 23000,
        note: 5,
        badge: "Tendance",
        image: "images/ktn-classic.jpg",
        images: [
            "images/ktn-classic.jpg",
            "images/ktn-classic.jpg",
            "images/ktn-classic.jpg"
        ],
        tailles: [39, 40, 41, 42, 43, 44],
        description: "Un intemporel revisité. La KTN Classic reprend les codes de la sneaker basse traditionnelle avec une finition premium et une palette sobre qui s'accorde à toutes les tenues.",
        details: [
            "Empeigne cuir synthétique",
            "Semelle en caoutchouc antidérapant",
            "Coupe basse polyvalente",
            "Entretien : chiffon humide"
        ]
    },

    {
        id: 3,
        nom: "KTN Sandale",
        categorie: "femme",
        categorieLabel: "Femme",
        type: "Sandales",
        prix: 18000,
        note: 4,
        badge: "",
        image: "images/ktn-sandale2.png",
        images: [
            "images/ktn-sandale2.png",
            "images/ktn-sandale2.png",
            "images/ktn-sandale2.png"
        ],
        tailles: [36, 37, 38, 39, 40],
        description: "Légère et aérée, la KTN Sandale accompagne les journées chaudes avec des brides ajustables et une semelle souple qui épouse la démarche sans jamais glisser.",
        details: [
            "Brides ajustables",
            "Semelle souple antidérapante",
            "Matière résistante à l'humidité",
            "Entretien : essuyer avec un chiffon sec"
        ]
    },

    {
        id: 4,
        nom: "KTN Court",
        categorie: "femme",
        categorieLabel: "Femme",
        type: "Sneakers",
        prix: 22000,
        note: 4,
        badge: "",
        image: "images/ktn-urban.jpg",
        images: [
            "images/ktn-urban.jpg",
            "images/ktn-urban.jpg",
            "images/ktn-urban.jpg"
        ],
        tailles: [36, 37, 38, 39, 40, 41],
        description: "La KTN Court associe une silhouette sport-chic à un amorti confortable, pensée pour suivre le rythme de vos journées les plus actives.",
        details: [
            "Tige souple et légère",
            "Semelle amortissante",
            "Laçage ajustable",
            "Entretien : nettoyage à sec recommandé"
        ]
    },

    {
        id: 5,
        nom: "KTN Mini Runner",
        categorie: "enfant",
        categorieLabel: "Enfant",
        type: "Sneakers",
        prix: 15000,
        note: 4,
        badge: "Nouveau",
        image: "images/ktn-junior4.jpg",
        images: [
            "images/ktn-junior4.jpg",
            "images/ktn-junior4.jpg",
            "images/ktn-junior4.jpg"
        ],
        tailles: [28, 29, 30, 31, 32, 33],
        description: "Une version miniature de nos sneakers phares, taillée pour les petits pieds pleins d'énergie. Fermeture simple et matière résistante pour tenir toute la journée.",
        details: [
            "Fermeture scratch facile",
            "Semelle flexible et légère",
            "Renforts aux zones d'usure",
            "Entretien : chiffon humide"
        ]
    },

    {
        id: 6,
        nom: "KTN Loafer",
        categorie: "homme",
        categorieLabel: "Homme",
        type: "Mocassins",
        prix: 26000,
        note: 5,
        badge: "",
        image: "images/ktn-loafer3.jpg",
        images: [
            "images/ktn-loafer3.jpg",
            "images/ktn-loafer3.jpg",
            "images/ktn-loafer3.jpg"
        ],
        tailles: [40, 41, 42, 43, 44, 45],
        description: "Le mocassin KTN Loafer apporte une touche d'élégance décontractée à toute tenue de bureau ou de sortie, sans sacrifier le confort de la marche quotidienne.",
        details: [
            "Cuir synthétique lisse",
            "Semelle de marche confortable",
            "Sans lacets, enfilage rapide",
            "Entretien : produit cirage adapté"
        ]
    },

    {
        id: 7,
        nom: "KTN Elegance",
        categorie: "femme",
        categorieLabel: "Femme",
        type: "Talons",
        prix: 28000,
        note: 5,
        badge: "Nouveau",
        image: "images/ktn-elegance1.jpg",
        images: [
            "images/ktn-elegance1.jpg",
            "images/ktn-elegance1.jpg",
            "images/ktn-elegance1.jpg"
        ],
        tailles: [36, 37, 38, 39, 40],
        description: "KTN Elegance sublime chaque silhouette avec un talon stable et une ligne raffinée, pensée pour les soirées comme pour le bureau.",
        details: [
            "Talon stable de hauteur moyenne",
            "Semelle intérieure rembourrée",
            "Finition satinée",
            "Entretien : chiffon doux uniquement"
        ]
    },

    {
        id: 8,
        nom: "KTN Comfort",
        categorie: "femme",
        categorieLabel: "Femme",
        type: "Compensés",
        prix: 24000,
        note: 5,
        badge: "Nouveau",
        image: "images/ktn-comfort1.jpg",
        images: [
            "images/ktn-comfort1.jpg",
            "images/ktn-comfort1.jpg",
            "images/ktn-comfort1.jpg"
        ],
        tailles: [36, 37, 38, 39, 40, 41],
        description: "Pensée pour celles qui veulent de la hauteur sans compromis, la KTN Comfort combine semelle compensée stable et matière souple pour un confort qui dure toute la journée.",
        details: [
            "Semelle compensée stable",
            "Empeigne souple et respirante",
            "Doublure rembourrée",
            "Entretien : nettoyage à sec recommandé"
        ]
    },

    {
        id: 9,
        nom: "KTN Urban",
        categorie: "homme",
        categorieLabel: "Homme",
        type: "Sneakers",
        prix: 25000,
        note: 4,
        badge: "",
        image: "images/ktn-urban5.jpg",
        images: [
            "images/ktn-urban5.jpg",
            "images/ktn-urban5.jpg",
            "images/ktn-urban5.jpg"
        ],
        tailles: [39, 40, 41, 42, 43, 44, 45],
        description: "Conçue pour la ville, la KTN Urban mise sur une silhouette robuste et une accroche renforcée pour affronter n'importe quel trottoir avec style.",
        details: [
            "Semelle crantée renforcée",
            "Tige résistante à l'abrasion",
            "Col rembourré pour le maintien",
            "Entretien : brosse douce"
        ]
    },

    {
        id: 10,
        nom: "KTN Summer",
        categorie: "femme",
        categorieLabel: "Femme",
        type: "Sandales",
        prix: 17000,
        note: 4,
        badge: "",
        image: "images/ktn-summer1.jpg",
        images: [
            "images/ktn-summer1.jpg",
            "images/ktn-summer1.jpg",
            "images/ktn-summer1.jpg"
        ],
        tailles: [36, 37, 38, 39, 40],
        description: "Fraîche et minimaliste, la KTN Summer est la sandale des beaux jours : légère, aérée, et prête à accompagner chaque escapade estivale.",
        details: [
            "Design ouvert et aéré",
            "Semelle ultra-légère",
            "Séchage rapide",
            "Entretien : rincer à l'eau claire"
        ]
    },

    {
        id: 11,
        nom: "KTN Kids Flex",
        categorie: "enfant",
        categorieLabel: "Enfant",
        type: "Sandales",
        prix: 13000,
        note: 4,
        badge: "",
        image: "images/Kids Flex1.jpg",
        images: [
            "images/Kids Flex1.jpg",
            "images/Kids Flex1.jpg",
            "images/Kids Flex1.jpg"
        ],
        tailles: [27, 28, 29, 30, 31, 32],
        description: "Souple et facile à enfiler, la KTN Kids Flex est pensée pour suivre les enfants dans tous leurs jeux, avec une semelle flexible qui accompagne chaque pas.",
        details: [
            "Semelle flexible antidérapante",
            "Enfilage facile sans lacets",
            "Matière lavable",
            "Entretien : chiffon humide"
        ]
    },

    {
        id: 12,
        nom: "KTN Junior",
        categorie: "enfant",
        categorieLabel: "Enfant",
        type: "Sneakers",
        prix: 16000,
        note: 4,
        badge: "",
        image: "images/ktn-junior01.jpg",
        images: [
            "images/ktn-junior01.jpg",
            "images/ktn-junior01.jpg",
            "images/ktn-junior01.jpg"
        ],
        tailles: [28, 29, 30, 31, 32, 33, 34],
        description: "La KTN Junior offre à votre enfant une sneaker robuste et confortable, taillée pour la cour de récré comme pour les balades du week-end.",
        details: [
            "Renforts au niveau des orteils",
            "Semelle amortissante légère",
            "Fermeture scratch réglable",
            "Entretien : nettoyage à sec recommandé"
        ]
    }

];


/* =========================================================
   FONCTIONS UTILITAIRES PRODUITS
========================================================= */

// Retourne un produit à partir de son id (id venant de l'URL = texte, d'où le Number())
function obtenirProduitParId(id) {
    return PRODUITS.find(p => p.id === Number(id)) || null;
}

// Formate un nombre en "25 000 FCFA"
function formaterPrix(nombre) {
    return nombre.toLocaleString("fr-FR").replace(/,/g, " ") + " FCFA";
}

// Retourne jusqu'à `limite` produits de la même catégorie, en excluant idExclu
function produitsSimilaires(categorie, idExclu, limite = 4) {
    return PRODUITS
        .filter(p => p.categorie === categorie && p.id !== idExclu)
        .slice(0, limite);
}