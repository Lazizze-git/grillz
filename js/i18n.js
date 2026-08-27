/* Version anglaise du site.
   - Langue par défaut : celle du navigateur (français → FR, sinon → EN).
   - Choix manuel via le sélecteur FR/EN du footer, mémorisé (localStorage).
   - Les pages restent écrites en français (langue de référence) ; ce script
     remplace textes et attributs à partir du dictionnaire ci-dessous.
   - Un observateur traduit aussi les contenus insérés par les autres scripts
     (récapitulatif du formulaire, fiche de la galerie…). */
(function () {
  "use strict";

  var STORAGE_KEY = "ma-lang";

  /* ---------- Dictionnaire français → anglais ---------- */
  var EN = {
    /* Titres de pages & meta descriptions */
    "Grillz sur mesure en Suisse — Maison Alliani": "Custom Grillz in Switzerland — Maison Alliani",
    "Savoir-faire & Histoire — Maison Alliani": "Craft & History — Maison Alliani",
    "Le Processus de commande — Maison Alliani": "The Ordering Process — Maison Alliani",
    "Galerie des créations — Maison Alliani": "Gallery of Creations — Maison Alliani",
    "Contact & Devis — Maison Alliani": "Contact & Quote — Maison Alliani",
    "Grillz sur mesure façonnés à la main en Suisse. Pièces uniques de haute joaillerie dentaire : or, argent 925, chrome-cobalt, diamants. Dès 170 CHF, sur rendez-vous.":
      "Custom grillz crafted by hand in Switzerland. Unique dental high-jewellery pieces: gold, 925 silver, chrome-cobalt, diamonds. From CHF 170, by appointment.",
    "L'héritage d'une maison suisse née en 1978 dans la technique dentaire : fabrication artisanale, or 10K à 18K, argent 925, chrome-cobalt, diamants naturels et synthétiques.":
      "The heritage of a Swiss maison born in 1978 in dental technology: artisanal crafting, 10K to 18K gold, 925 silver, chrome-cobalt, natural and lab-grown diamonds.",
    "Du premier échange à la remise en main propre : consultation, prise d'empreinte dentaire, fabrication artisanale en Suisse et livraison avec certificat d'authenticité.":
      "From the first exchange to the in-person handover: consultation, dental impression, artisanal crafting in Switzerland and delivery with certificate of authenticity.",
    "Chaque pièce est une commande unique : grillz or et diamants, dents individuelles, créations custom. Découvrez la galerie de l'atelier.":
      "Each piece is a unique commission: gold and diamond grillz, individual teeth, custom creations. Discover the atelier's gallery.",
    "Démarrez votre projet de grillz sur mesure. Formulaire de co-création en quelques étapes ou réservez un appel de 20 minutes avec l'atelier suisse.":
      "Start your custom grillz project. A short co-creation form, or book a 20-minute call with the Swiss atelier.",

    /* Navigation & menu */
    "Maison Alliani — accueil": "Maison Alliani — home",
    "Atelier · CH": "Atelier · CH",
    "Navigation principale": "Main navigation",
    "Savoir-faire": "Craftsmanship",
    "Processus": "Process",
    "Galerie": "Gallery",
    "Rendez-vous": "Appointment",
    "Ouvrir le menu": "Open menu",
    "Fermer le menu": "Close menu",
    "Accueil": "Home",
    "Entrée en matière": "Where it begins",
    "Origine & matières": "Origin & materials",
    "De l'empreinte à la livraison": "From impression to delivery",
    "Les créations": "The creations",
    "Devis & rendez-vous": "Quotes & appointments",
    "Lausanne · Suisse": "Lausanne · Switzerland",

    /* Accueil — hero */
    "Carnet ouvert · sur rendez-vous": "Order book open · by appointment",
    "Façonné pour": "Crafted for",
    "une seule bouche.": "one mouth only.",
    "Grillz ajouré en métal précieux porté sur un sourire, photographie noir et blanc en lumière douce":
      "Openwork precious-metal grillz worn on a smile, black-and-white photograph in soft light",
    "Porté": "Worn",
    "Atelier Lausanne": "Lausanne atelier",
    "Grillz et pièces dentaires de haute joaillerie, ajustés au dixième de millimètre dans notre atelier lausannois. Empreinte, façonnage à la main, pièce unique — jamais de modèle standard, jamais de stock.":
      "High-jewellery grillz and dental pieces, fitted to a tenth of a millimetre in our Lausanne atelier. Impression, hand crafting, one-of-a-kind piece — never a standard model, never stock.",
    "Dès 170 CHF": "From CHF 170",
    "2–4 semaines": "2–4 weeks",
    "Envoi international": "Worldwide shipping",
    "Voir le catalogue": "View the catalogue",
    "Prendre rendez-vous": "Book an appointment",
    "Défiler pour inspecter": "Scroll to inspect",

    /* Accueil — catalogue */
    "Réalisations récentes.": "Recent works.",
    "Aperçu de nos dernières pièces. Chaque référence est une commande unique, façonnée sur la morphologie d'une seule personne.":
      "A glimpse of our latest pieces. Each reference is a unique commission, shaped to the morphology of a single person.",
    "09 modèles référencés": "09 referenced models",
    "Pièces uniques · sur commande": "Unique pieces · made to order",
    "Grillz pleine bouche en argent poli avec une dent en or 18 carats":
      "Full-mouth grillz in polished silver with one 18-carat gold tooth",
    "Grillz pleine bouche à la finition noire avec crocs sculptés":
      "Full-mouth grillz with a black finish and sculpted fangs",
    "Grillz en or blanc serti d'une pierre verte sur moulage dentaire":
      "White-gold grillz set with a green stone on a dental cast",
    "Grillz en argent sculpté de têtes de mort et d'ossements":
      "Silver grillz sculpted with skulls and bones",
    "Crocs en or rose sur moulage dentaire": "Rose-gold fangs on a dental cast",
    "Grillz pleine bouche argent avec accents or": "Full-mouth silver grillz with gold accents",
    "Matière": "Material",
    "Argent · Or 18K": "Silver · 18K gold",
    "Argent 925 · noir": "925 silver · black",
    "Or blanc · Pierre": "White gold · Stone",
    "Argent sculpté": "Sculpted silver",
    "Or rose 18K": "18K rose gold",
    "Argent · Or": "Silver · Gold",
    "Délai": "Lead time",
    "2 semaines": "2 weeks",
    "3 semaines": "3 weeks",
    "4 semaines": "4 weeks",
    "Prix": "Price",
    "Sur devis": "On quote",
    "Inspecter": "Inspect",
    "Parcourir les 9 modèles →": "Browse all 9 models →",

    /* Accueil — protocole */
    "01 // Protocole": "01 // Protocol",
    "Quatre gestes.": "Four gestures.",
    "Un seul protocole.": "One protocol.",
    "Consultation": "Consultation",
    "On part de votre style et de votre usage. Un échange sans engagement, entièrement centré sur vous.":
      "We start from your style and your use. A no-commitment conversation, entirely centred on you.",
    "Empreinte": "Impression",
    "À l'atelier, chez votre dentiste, ou chez vous grâce au model kit que nous vous envoyons. Précision au dixième de millimètre.":
      "At the atelier, at your dentist's, or at home with the model kit we send you. Precision to a tenth of a millimetre.",
    "Façonnage": "Crafting",
    "Fonte directement à l'atelier. Façonnage et sertissage à la main, par des professionnels dans le métier depuis plus de 40 ans.":
      "Casting done directly in the atelier. Shaping and stone-setting by hand, by professionals with over 40 years in the trade.",
    "Livraison": "Delivery",
    "De préférence en main propre, à l'atelier. Envoi par la poste possible pour les clients à l'étranger.":
      "Preferably in person, at the atelier. Postal shipping available for clients abroad.",
    "Sourire portant deux grillz sculptés en argent, portrait noir et blanc aux ombres douces":
      "Smile wearing two sculpted silver grillz, black-and-white portrait with soft shadows",
    "Empreinte → façonnage → livraison": "Impression → crafting → delivery",

    /* Accueil — voies */
    "02 // Voies": "02 // Paths",
    "Deux voies.": "Two paths.",
    "Un même sur-mesure.": "The same bespoke.",
    "Que vous soyez à Lausanne ou ailleurs, tout commence par une empreinte précise — à l'atelier, chez votre dentiste, ou chez vous grâce à notre model kit.":
      "Whether you are in Lausanne or elsewhere, everything starts with a precise impression — at the atelier, at your dentist's, or at home with our model kit.",
    "Voie A // À Lausanne": "Path A // In Lausanne",
    "À l'atelier": "At the atelier",
    "Empreinte prise sur place par notre équipe dentaire, dans le confort de l'atelier.":
      "Impression taken on site by our dental team, in the comfort of the atelier.",
    "Lieu": "Location",
    "Durée": "Duration",
    "Remise": "Handover",
    "En main propre": "In person",
    "Prendre rendez-vous →": "Book an appointment →",
    "Voie B // Ailleurs": "Path B // Elsewhere",
    "À distance": "From a distance",
    "Empreinte réalisée chez votre dentiste — recommandé pour une meilleure garantie de tenue — ou par vous-même avec le model kit que la maison vous envoie. La pièce finie est ensuite livrée par la poste.":
      "Impression taken at your dentist's — recommended for a better guarantee of fit — or by yourself with the model kit the maison sends you. The finished piece is then delivered by post.",
    "Dentiste · model kit": "Dentist · model kit",
    "Envoi": "Shipping",
    "Assuré": "Insured",
    "Suivi": "Follow-up",
    "Nous écrire →": "Write to us →",

    /* Accueil — matières */
    "03 // Matières": "03 // Materials",
    "Métaux, pierres, finitions.": "Metals, stones, finishes.",
    "Tarifs des métaux indexés sur le cours de l'or. Sélection arrêtée en atelier.":
      "Metal prices indexed to the price of gold. Final selection made at the atelier.",
    "Métaux": "Metals",
    "Or 10K à 18K": "10K to 18K gold",
    "Jaune · blanc · rose": "Yellow · white · rose",
    "Argent 925 · Chrome-cobalt": "925 silver · chrome-cobalt",
    "Standard atelier": "Atelier standard",
    "Finitions": "Finishes",
    "Poli miroir": "Mirror polish",
    "Éclat maximal": "Maximum shine",
    "Satiné": "Satin",
    "Mat doux": "Soft matte",
    "Brossé": "Brushed",
    "Texture linéaire": "Linear texture",
    "Pierres": "Stones",
    "Diamant naturel": "Natural diamond",
    "Serti main": "Hand-set",
    "Diamant synthétique": "Lab-grown diamond",
    "Pierres diverses": "Various stones",
    "Différents types · sur demande": "Different types · on request",

    /* Accueil — l'atelier */
    "04 // L'atelier": "04 // The atelier",
    "Un atelier à Lausanne.": "An atelier in Lausanne.",
    "Détail d'un grillz en argent façonné à la main à l'établi de l'atelier":
      "Detail of a silver grillz shaped by hand at the atelier workbench",
    "Nous ne fabriquons pas des bijoux. Nous façonnons une": "We do not make jewellery. We shape a",
    "seconde peau.": "second skin.",
    "Une maison héritière de la technique dentaire depuis 1978, élevée à l'exigence d'un atelier de joaillerie. Un seul lieu, où chaque pièce naît, vit et se finit — de l'empreinte à la remise en main propre.":
      "A maison heir to dental technology since 1978, raised to the standards of a jewellery atelier. One single place where each piece is born, lives and is finished — from impression to in-person handover.",
    "Lausanne, Suisse": "Lausanne, Switzerland",
    "Accès": "Access",
    "Sur rendez-vous": "By appointment",
    "Matériaux": "Materials",
    "Or · Argent 925 · Chrome-cobalt": "Gold · 925 silver · Chrome-cobalt",
    "2 à 4 semaines": "2 to 4 weeks",
    "Découvrir le savoir-faire": "Discover the craft",

    /* Accueil — entretien & garanties */
    "05 // Entretien & garanties": "05 // Care & guarantees",
    "Entretien.": "Care.",
    "Et garanties.": "And guarantees.",
    "Entretien": "Care",
    "Port — max 8 h / jour": "Wear — max 8 h / day",
    "Retirez la pièce pour dormir et pour manger.": "Remove the piece to sleep and to eat.",
    "Nettoyage — eau chaude & brosse à dents": "Cleaning — warm water & toothbrush",
    "Un brossage doux à l'eau chaude suffit à raviver l'éclat.":
      "A gentle brush with warm water is enough to revive the shine.",
    "Rangement — modèle en plâtre fourni": "Storage — plaster model included",
    "Reposez la pièce sur son modèle en plâtre, à l'abri des chocs.":
      "Rest the piece on its plaster model, away from knocks.",
    "Garanties": "Guarantees",
    "Fabrication — 30 jours": "Craftsmanship — 30 days",
    "Tout défaut d'atelier est pris en charge.": "Any atelier defect is taken care of.",
    "Sertissage — à vie": "Stone setting — for life",
    "Le resserrage des pierres est garanti à vie.": "Stone tightening is guaranteed for life.",
    "Atelier — toujours là": "Atelier — always there",
    "Nettoyage, repolissage, ajustements : passez quand vous voulez, c'est offert.":
      "Cleaning, repolishing, adjustments: drop by whenever you like, free of charge.",
    "La maison reste là en cas de besoin. Un polissage, un nettoyage ? Passez à l'atelier, c'est avec plaisir, et c'est gratuit.":
      "The maison remains at your side whenever needed. A polish, a clean? Drop by the atelier — with pleasure, and free of charge.",

    /* Accueil — FAQ */
    "Questions fréquentes.": "Frequently asked questions.",
    "Est-ce que ça fait mal ?": "Does it hurt?",
    "Non. La pièce se pose et se retire sans douleur et sans aucune intervention sur la dent.":
      "No. The piece goes on and comes off painlessly, with no work done on the tooth.",
    "Est-ce permanent ?": "Is it permanent?",
    "Non. Un grillz est amovible : vous le mettez et l'enlevez quand vous le souhaitez.":
      "No. A grillz is removable: you put it on and take it off whenever you wish.",
    "Peut-on manger avec ?": "Can you eat with it?",
    "Nous recommandons de le retirer pendant les repas afin de préserver la pièce et son éclat.":
      "We recommend removing it during meals to preserve the piece and its shine.",
    "Est-ce que ça abîme les dents ?": "Does it damage teeth?",
    "Non. L'ajustement sur mesure épouse la dent sans la contraindre ni la modifier.":
      "No. The bespoke fit hugs the tooth without constraining or altering it.",
    "Quels sont les délais ?": "How long does it take?",
    "Comptez 2 à 4 semaines selon la complexité de la pièce et les matériaux choisis.":
      "Allow 2 to 4 weeks depending on the complexity of the piece and the chosen materials.",
    "Et si je ne suis pas à Lausanne ?": "What if I am not in Lausanne?",
    "L'empreinte peut être réalisée chez votre dentiste — la meilleure garantie de tenue — ou chez vous grâce au model kit que nous vous envoyons. La pièce finie est ensuite livrée par la poste, où que vous soyez.":
      "The impression can be taken at your dentist's — the best guarantee of fit — or at home with the model kit we send you. The finished piece is then delivered by post, wherever you are.",

    /* Accueil — CTA final */
    "07 // Sur mesure": "07 // Bespoke",
    "Une pièce unique.": "A unique piece.",
    "Pour une seule personne.": "For one person only.",

    /* Footer */
    "Une pièce unique commence par une conversation.": "A unique piece begins with a conversation.",
    "Haute joaillerie dentaire sur mesure. Façonnée à la main, en Suisse, par un technicien-dentiste devenu joaillier.":
      "Bespoke dental high jewellery. Crafted by hand in Switzerland by a dental technician turned jeweller.",
    "01 // Explorer": "01 // Explore",
    "Contact & Devis": "Contact & Quote",
    "1004 Lausanne, Suisse": "1004 Lausanne, Switzerland",
    "03 // Statut": "03 // Status",
    "Carnet ouvert": "Order book open",
    "Sur rendez-vous uniquement": "By appointment only",
    "· heure de l'atelier": "· atelier time",
    "Maison Alliani — Mentions légales": "Maison Alliani — Legal notice",
    "Fabriqué en Suisse": "Made in Switzerland",
    "Choix de la langue": "Language",

    /* Savoir-faire */
    "Une carrière entière passée dans la technique dentaire, aujourd'hui au service du bijou. Voici notre origine, nos gestes et nos matières.":
      "A whole career spent in dental technology, today in the service of jewellery. Here are our origin, our gestures and our materials.",
    "01 // Origine": "01 // Origin",
    "02 // Transmission": "02 // Passing it on",
    "Former, examiner,": "Training, examining,",
    "présider.": "presiding.",
    "Formatrice d'apprentis": "Apprentice trainer",
    "Des générations de techniciens formées à l'établi : le geste, la mesure, la patience.":
      "Generations of technicians trained at the bench: the gesture, the measure, the patience.",
    "Experte aux examens": "Examination expert",
    "Juger le travail des autres oblige à connaître la frontière entre bien fait et irréprochable.":
      "Judging the work of others means knowing the line between well made and flawless.",
    "Présidente · section vaudoise": "President · Vaud section",
    "Trois ans à la tête de l'association des laboratoires dentaires du canton.":
      "Three years leading the canton's association of dental laboratories.",
    "03 // Aujourd'hui": "03 // Today",
    "À deux": "Together",
    "Mère & fils": "Mother & son",
    "Expérience": "Experience",
    "Plus de 40 années": "More than 40 years",
    "Artisanale, à l'atelier": "By hand, in the atelier",
    "Séries": "Series",
    "Aucune · pièces uniques": "None · unique pieces",
    "La même rigueur,": "The same rigour,",
    "appliquée au bijou.": "applied to jewellery.",
    "Une empreinte, une bouche : la pièce épouse les reliefs et les asymétries. Un maintien franc, sans compromis, sans douleur.":
      "One impression, one mouth: the piece follows every relief and asymmetry. A firm hold, without compromise, without pain.",
    "Savoir-faire & Histoire": "Craft & History",
    "L'art dentaire rencontre la": "Dental art meets",
    "haute joaillerie": "high jewellery",
    "Métier": "Trade",
    "Ajustement anatomique": "Anatomical fit",
    "Depuis 1978,": "Since 1978,",
    "la technicienne-dentiste.": "the dental technician.",
    "Grillz argent et or posé sur son modèle en plâtre, à l'atelier":
      "Silver and gold grillz resting on its plaster model, at the atelier",
    "Technique dentaire · depuis 1978": "Dental technology · since 1978",
    "Passion, précision,": "Passion, precision,",
    "exigence de qualité.": "uncompromising quality.",
    "Technicienne-dentiste depuis 1978, j'ai exercé mon métier avec passion, précision et exigence de qualité pour la satisfaction de ma clientèle. Au fil des décennies, j'ai acquis une solide expérience technique et esthétique en travaillant comme salariée, puis comme indépendante depuis 1993.":
      "A dental technician since 1978, I have practised my trade with passion, precision and an uncompromising demand for quality, for the satisfaction of my clients. Over the decades I built solid technical and aesthetic experience, working as an employee and then, since 1993, on my own account.",
    "Tout au long de ma carrière, je me suis investie dans la profession en tant que formatrice d'apprentis, experte aux examens et présidente de l'association des laboratoires dentaires pour la section vaudoise durant trois ans. Transmettre mon savoir-faire et contribuer à l'évolution de ma profession sont des valeurs essentielles pour moi.":
      "Throughout my career I have been deeply involved in the profession: as a trainer of apprentices, as an examination expert, and as president of the association of dental laboratories for the Vaud section for three years. Passing on my know-how and contributing to the evolution of my profession are essential values to me.",
    "Aujourd'hui, je mets cette expérience au service d'un domaine différent, qui allie technique et création artistique. Les grillz et bijoux dentaires sont créés avec la même rigueur et le même souci du détail : ces exigences de qualité ont guidé toute ma carrière.":
      "Today I bring that experience to a different field, one that combines technique and artistic creation. Grillz and dental jewellery are created with the same rigour and the same attention to detail: those standards of quality have guided my entire career.",
    "Travailler aux côtés de mon fils est une nouvelle aventure, qui me permet de conjuguer l'expérience de plus de quarante années avec une approche moderne et créative, enrichie par de belles rencontres avec une clientèle aux univers variés. Ensemble, nous avons une excellente collaboration, ainsi qu'une grande satisfaction de réaliser des pièces uniques, fabriquées artisanalement avec la même passion.":
      "Working alongside my son is a new adventure, one that lets me combine more than forty years of experience with a modern, creative approach, enriched by wonderful encounters with clients from all walks of life. Together we have an excellent collaboration, and a great satisfaction in creating unique pieces, made by hand with the same passion.",
    "« Parce qu'un sourire est une signature, chaque grillz mérite le plus haut niveau d'exigence. »":
      "“Because a smile is a signature, every grillz deserves the highest standard of all.”",
    "La technicienne-dentiste de la maison": "The maison's dental technician",
    "Technicienne-dentiste · depuis 1978": "Dental technician · since 1978",
    "Indépendante": "Self-employed",
    "Depuis 1993": "Since 1993",
    "04 // Trois piliers": "04 // Three pillars",
    "Pourquoi la Suisse": "Why Switzerland",
    "change tout.": "changes everything.",
    "La précision horlogère n'est pas un argument marketing : c'est une culture du dixième de millimètre, appliquée à votre sourire.":
      "Watchmaking precision is not a marketing claim: it is a culture of the tenth of a millimetre, applied to your smile.",
    "Précision horlogère appliquée à la joaillerie dentaire. Chaque pièce naît, vit et se finit dans notre atelier.":
      "Watchmaking precision applied to dental jewellery. Each piece is born, lives and is finished in our atelier.",
    "Matériaux certifiés": "Certified materials",
    "Or 10K à 18K, argent 925, chrome-cobalt, diamants naturels et synthétiques. Une traçabilité totale, consignée sur votre certificat d'authenticité.":
      "10K to 18K gold, 925 silver, chrome-cobalt, natural and lab-grown diamonds. Full traceability, recorded on your certificate of authenticity.",
    "Main gantée tenant un grillz en argent au-dessus d'un moulage dentaire":
      "Gloved hand holding a silver grillz above a dental cast",
    "Établi · Lausanne": "Bench · Lausanne",
    "Fonte → ciselure → sertissage → polissage": "Casting → chasing → setting → polishing",
    "05 // Matières": "05 // Materials",
    "Choisies comme": "Chosen the way",
    "on choisit une pierre.": "one chooses a stone.",
    "Faites défiler →": "Scroll →",
    "Macro d'une canine en argent poli révélant le grain du métal":
      "Macro of a polished silver canine revealing the grain of the metal",
    "Argent 925": "925 silver",
    "Poli miroir ou satiné. Le métal des premières pièces, accessible et noble.":
      "Mirror-polished or satin. The metal of first pieces, accessible and noble.",
    "Sterling certifié": "Certified sterling",
    "Détail or 18 carats sur un grillz pleine bouche": "18-carat gold detail on a full-mouth grillz",
    "Argent 925 & Or 18K": "925 silver & 18K gold",
    "Ici, une seule dent en or 18 carats sur une pièce en argent 925. L'or se décline du 10 aux 18 carats, jaune, blanc ou rose.":
      "Here, a single tooth in 18-carat gold on a 925 silver piece. Gold ranges from 10 to 18 carats — yellow, white or rose.",
    "Poinçon suisse": "Swiss hallmark",
    "Pierre verte sertie sur un grillz en or blanc": "Green stone set on a white-gold grillz",
    "Sertissage pierres & diamants": "Stone & diamond setting",
    "Diamants naturels ou synthétiques, pierres diverses — posées et serties à la main.":
      "Natural or lab-grown diamonds, various stones — placed and set by hand.",
    "Sertissage main": "Hand setting",
    "Grillz au design sculpté, finition sombre": "Grillz with a sculpted design, dark finish",
    "Designs spécifiques": "Custom designs",
    "Croix, crocs, motifs sculptés : tous les designs particuliers sont possibles, dessinés avec vous.":
      "Crosses, fangs, sculpted motifs: any specific design is possible, drawn with you.",
    "Sur demande": "On request",
    "06 // Le geste": "06 // The gesture",
    "Le métal,": "The metal,",
    "geste après geste.": "gesture after gesture.",
    "Chaque pièce traverse le même établi, entre les mêmes mains, du métal brut à l'éclat final.":
      "Every piece crosses the same bench, between the same hands, from raw metal to final shine.",
    "Fonte": "Casting",
    "Le métal précieux est fondu puis coulé sur le modèle issu de votre empreinte. La matière prend sa première forme.":
      "The precious metal is melted then cast on the model made from your impression. The material takes its first shape.",
    "Ciselure": "Chasing",
    "Motifs, reliefs et arêtes sont travaillés à la main, à la loupe. C'est ici que naît le caractère de la pièce.":
      "Motifs, reliefs and edges are worked by hand, under the loupe. This is where the character of the piece is born.",
    "Sertissage": "Setting",
    "Diamants et pierres sont posés un à un, chaque griffe resserrée à la main pour une tenue à toute épreuve.":
      "Diamonds and stones are placed one by one, each prong tightened by hand for an unshakeable hold.",
    "Polissage": "Polishing",
    "Poli miroir, satiné ou brossé : la finition révèle le métal et signe le rendu final.":
      "Mirror polish, satin or brushed: the finish reveals the metal and signs the final look.",
    "→ Étape suivante": "→ Next step",
    "De la première empreinte": "From the first impression",
    "à la remise en main propre.": "to the in-person handover.",
    "Découvrir le processus": "Discover the process",

    /* Processus */
    "Processus de commande": "Ordering process",
    "Votre pièce.": "Your piece.",
    "Étape par étape.": "Step by step.",
    "Du premier échange à la remise en main propre, chaque détail est pensé. Voici comment naît une pièce qui n'appartient qu'à vous.":
      "From the first exchange to the in-person handover, every detail is considered. Here is how a piece that belongs to you alone comes to be.",
    "Grillz en or rose présenté dans une lumière feutrée, ambiance confidentielle":
      "Rose-gold grillz presented in muted light, confidential mood",
    "Nous commençons par comprendre votre esthétique, votre style, votre usage. Un échange sans engagement, entièrement centré sur vous.":
      "We begin by understanding your aesthetics, your style, your use. A no-commitment conversation, entirely centred on you.",
    "Sans engagement · 20 min": "No commitment · 20 min",
    "Prise d'empreinte : main gantée manipulant un moulage dentaire":
      "Impression taking: gloved hand handling a dental cast",
    "L'empreinte": "The impression",
    "À l'atelier, chez vous grâce au model kit que la maison vous envoie, ou chez votre dentiste. Si vous n'êtes pas en Suisse et cherchez le meilleur résultat, privilégiez votre dentiste : une empreinte prise par un professionnel garantit toujours une plus grande tenue.":
      "At the atelier, at home with the model kit the maison sends you, or at your dentist's. If you are not in Switzerland and want the best result, choose your dentist: an impression taken by a professional always guarantees a better fit.",
    "Atelier · dentiste · model kit": "Atelier · dentist · model kit",
    "Détail sculpté d'un grillz argent, ciselure à la loupe":
      "Sculpted detail of a silver grillz, chasing under the loupe",
    "La fabrication": "The crafting",
    "La fonte se fait directement à l'atelier. Façonnage et sertissage à la main, par des professionnels dans le métier depuis plus de 40 ans.":
      "Casting is done directly in the atelier. Shaping and stone-setting by hand, by professionals with over 40 years in the trade.",
    "Atelier · Lausanne": "Atelier · Lausanne",
    "Grillz fini, argent et or, prêt à être remis en main propre":
      "Finished grillz, silver and gold, ready to be handed over in person",
    "Remise en main propre": "In-person handover",
    "De préférence en main propre, à l'atelier, certificat d'authenticité inclus. Envoi par la poste possible pour les clients à l'étranger.":
      "Preferably in person, at the atelier, certificate of authenticity included. Postal shipping available for clients abroad.",
    "Main propre · envoi postal": "In person · postal shipping",
    "Informations pratiques": "Practical information",
    "Délai moyen": "Average lead time",
    "Paiement": "Payment",
    "Cash uniquement": "Cash only",
    "Suisse & international · Assurée": "Switzerland & worldwide · Insured",
    "Garantie": "Guarantee",
    "Sertissage à vie": "Stone setting for life",
    "Prêt à façonner la vôtre ?": "Ready to craft yours?",
    "Tout démarre par un échange. Décrivez-nous votre projet, nous répondons sous 48 heures.":
      "It all starts with a conversation. Tell us about your project — we reply within 48 hours.",
    "Démarrer ma commande": "Start my order",

    /* Galerie */
    "Nos": "Our",
    "créations": "creations",
    "Chaque pièce est une commande unique. Cliquez pour découvrir matériaux, détails et histoire.":
      "Each piece is a unique commission. Click to discover materials, details and story.",
    "Galerie filtrable": "Filterable gallery",
    "Filtrer par style": "Filter by style",
    "Tout": "All",
    "Or": "Gold",
    "Diamants": "Diamonds",
    "Complet": "Full set",
    "Individuelles": "Individual",
    "12 vues": "12 views",
    "Grillz pleine bouche en argent poli avec une dent en or":
      "Full-mouth grillz in polished silver with one gold tooth",
    "Argent & Or 18K": "Silver & 18K gold",
    "Grillz pleine bouche à la finition noire avec crocs":
      "Full-mouth grillz with a black finish and fangs",
    "Finition noire": "Black finish",
    "Grillz en or blanc serti d'une pierre verte": "White-gold grillz set with a green stone",
    "Macro d'une canine en argent poli": "Macro of a polished silver canine",
    "Argent poli": "Polished silver",
    "Grillz en forme d'étoile ajourée en argent": "Openwork star-shaped silver grillz",
    "Argent ajouré": "Openwork silver",
    "Grillz en argent à motif de lettrage tenu en main gantée":
      "Silver grillz with a lettering motif held in a gloved hand",
    "Lettrage": "Lettering",
    "Argent & Or": "Silver & Gold",
    "Variation de grillz à la finition noire": "Variation of a black-finish grillz",
    "Détail de profil du grillz serti pierre verte": "Profile detail of the green-stone grillz",
    "Profil": "Profile",
    "Autre angle du grillz sculpté têtes de mort": "Another angle of the skull-sculpted grillz",
    "Revers": "Reverse",
    "Détail de la création": "Creation details",
    "Fermer": "Close",
    "Fiche": "Spec sheet",
    "Sur mesure": "Bespoke",
    "Commander une pièce similaire": "Commission a similar piece",
    /* Attributs data-* de la galerie (fiche technique) */
    "Argent 925 · finition noire": "925 silver · black finish",
    "Argent 925 sculpté": "Sculpted 925 silver",
    "Or blanc 18K": "18K white gold",
    "Argent 925 poli": "Polished 925 silver",
    "Argent 925 ajouré": "Openwork 925 silver",
    "Pleine bouche · 16 dents": "Full mouth · 16 teeth",
    "Pleine bouche · crocs": "Full mouth · fangs",
    "3 dents · crocs": "3 teeth · fangs",
    "Bandeau · 8 motifs": "Band · 8 motifs",
    "Dents individuelles": "Individual teeth",
    "1 dent · canine": "1 tooth · canine",
    "1 dent · motif": "1 tooth · motif",
    "Pleine bouche · lettrage": "Full mouth · lettering",
    "Pleine bouche · 12 dents": "Full mouth · 12 teeth",
    "Pleine bouche": "Full mouth",
    "Bandeau": "Band",
    "Poli miroir, dent en or": "Mirror polish, gold tooth",
    "Finition noire, anatomique": "Black finish, anatomical",
    "Crocs polis": "Polished fangs",
    "Têtes de mort & ossements": "Skulls & bones",
    "Sertissage pierre verte": "Green stone setting",
    "Croc anatomique": "Anatomical fang",
    "Étoile ajourée": "Openwork star",
    "Lettrage façonné main": "Hand-crafted lettering",
    "Accent or sur argent": "Gold accent on silver",
    "Crocs sombres": "Dark fangs",
    "Pierre sertie": "Set stone",
    "Ossements ciselés": "Chased bones",
    /* Libellés générés par gallery.js */
    "Pièces": "Pieces",
    "Fabrication": "Lead time",
    "Référence": "Reference",

    /* Contact */
    "Créons": "Let's create",
    "ensemble": "together",
    "Remplissez les quelques étapes ci-dessous pour démarrer votre projet. Nous vous répondons sous 48 heures.":
      "Fill in the few steps below to start your project. We reply within 48 hours.",
    "Étape 01// Qui êtes-vous ?": "Step 01// Who are you?",
    "Faisons connaissance.": "Let's get acquainted.",
    "Prénom": "First name",
    "Votre prénom": "Your first name",
    "Pays": "Country",
    "Suisse": "Switzerland",
    "vous@email.com": "you@email.com",
    "← Retour": "← Back",
    "Continuer": "Continue",
    "Étape 02// Votre projet": "Step 02// Your project",
    "Quelle pièce imaginez-vous ?": "Which piece do you have in mind?",
    "Type de pièce": "Type of piece",
    "Crocs": "Fangs",
    "Matériau souhaité": "Preferred material",
    "Or jaune": "Yellow gold",
    "Or blanc": "White gold",
    "Étape 03// Budget & timing": "Step 03// Budget & timing",
    "Cadrons votre projet.": "Let's frame your project.",
    "Budget envisagé": "Budget in mind",
    "Date souhaitée": "Preferred date",
    "Urgence": "Urgency",
    "Sous 1 mois": "Within 1 month",
    "Étape 04// Inspirations": "Step 04// Inspirations",
    "Montrez-nous votre vision.": "Show us your vision.",
    "Photos de référence": "Reference photos",
    "Glissez vos images ou cliquez pour parcourir": "Drag your images or click to browse",
    "Décrivez votre projet": "Describe your project",
    "Style recherché, inspirations, détails particuliers…":
      "Desired style, inspirations, particular details…",
    "Voir le récapitulatif": "See the summary",
    "Étape 05// Récapitulatif": "Step 05// Summary",
    "Votre projet en un coup d'œil.": "Your project at a glance.",
    "En envoyant, vous acceptez d'être recontacté par l'atelier. Aucune donnée n'est partagée avec des tiers.":
      "By sending, you agree to be contacted by the atelier. No data is shared with third parties.",
    "Envoyer mon projet": "Send my project",
    "Projet bien reçu.": "Project received.",
    "Merci. Notre atelier revient vers vous sous 48 heures pour planifier votre consultation.":
      "Thank you. Our atelier will get back to you within 48 hours to plan your consultation.",
    "Plus direct ?": "Something more direct?",
    "Réservez un appel de 20 minutes avec l'atelier, sans engagement.":
      "Book a 20-minute call with the atelier, no commitment.",
    "Réserver un appel": "Book a call",
    "L'atelier": "The atelier",
    "Écrire": "Write",
    /* Libellés générés par form.js */
    "Matériau": "Material",
    "Échéance": "Timeline"
  };

  /* Textes dynamiques avec nombre variable */
  var EN_PATTERNS = [
    [/^(\d+) vues$/, "$1 views"],
    [/^(\d+) fichier\(s\) ajouté\(s\)$/, "$1 file(s) added"]
  ];

  /* Attributs traduits (data-cat exclu : sert au filtrage) */
  var ATTRS = [
    "alt", "placeholder", "aria-label", "data-label",
    "data-material", "data-teeth", "data-duree", "data-style"
  ];

  function stored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  /**
   * Le français est la langue du site : c'est lui qui est écrit dans les
   * pages, indexé par Google et servi par défaut à tout le monde.
   *
   * La détection automatique par la langue du navigateur a été retirée :
   * les robots d'indexation explorent en anglais, et le site leur montrait
   * donc une traduction — titre et description compris. Un atelier lausannois
   * se retrouvait référencé en anglais sur des recherches francophones.
   *
   * L'anglais reste accessible, mais sur choix explicite du visiteur, via le
   * sélecteur FR/EN du pied de page. Ce choix est mémorisé.
   */
  function detect() {
    var s = stored();
    return s === "en" ? "en" : "fr";
  }

  function tr(value) {
    if (!value) return null;
    var key = value.replace(/\s+/g, " ").trim();
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(EN, key)) return EN[key];
    for (var i = 0; i < EN_PATTERNS.length; i++) {
      if (EN_PATTERNS[i][0].test(key)) return key.replace(EN_PATTERNS[i][0], EN_PATTERNS[i][1]);
    }
    return null;
  }

  function translateTextNode(node) {
    var t = tr(node.nodeValue);
    if (t === null) return;
    var lead = node.nodeValue.match(/^\s*/)[0];
    var tail = node.nodeValue.match(/\s*$/)[0];
    var next = lead + t + tail;
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function translateAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var name = ATTRS[i];
      if (!el.hasAttribute(name)) continue;
      var t = tr(el.getAttribute(name));
      if (t !== null && t !== el.getAttribute(name)) el.setAttribute(name, t);
    }
  }

  function translateTree(root) {
    if (root.nodeType === 3) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest("script, style")) return;
    translateAttrs(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || p.closest("script, style")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
    var els = root.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) translateAttrs(els[i]);
  }

  /* Traduit aussi ce que les autres scripts insèrent après coup */
  function observeDynamicContent() {
    var mo = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === "childList") {
          for (var j = 0; j < m.addedNodes.length; j++) translateTree(m.addedNodes[j]);
        } else if (m.type === "characterData") {
          translateTextNode(m.target);
        } else if (m.type === "attributes" && m.target.nodeType === 1) {
          translateAttrs(m.target);
        }
      }
    });
    mo.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label", "data-label"]
    });
  }

  function translatePage() {
    document.documentElement.setAttribute("lang", "en");
    var t = tr(document.title);
    if (t !== null) document.title = t;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      var d = tr(meta.getAttribute("content"));
      if (d !== null) meta.setAttribute("content", d);
    }
    translateTree(document.body);
    observeDynamicContent();
  }

  function initSwitcher(lang) {
    var buttons = document.querySelectorAll(".lang-switch [data-lang]");
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        if (btn.getAttribute("data-lang") === lang) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-current", "true");
        }
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-lang");
          if (target === lang) return;
          try {
            localStorage.setItem(STORAGE_KEY, target);
          } catch (e) {
            /* stockage indisponible : le rechargement retombera sur la détection */
          }
          location.reload();
        });
      })(buttons[i]);
    }
  }

  var lang = detect();
  window.MA_LANG = lang; /* lu par le CMS pour servir la bonne langue */
  initSwitcher(lang);
  if (lang === "en") translatePage();
})();
