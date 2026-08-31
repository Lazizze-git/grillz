/**
 * Prépare le contenu de départ du CMS à partir du site actuel.
 * Produit un fichier NDJSON prêt pour « sanity dataset import » : les photos
 * sont référencées par leur chemin local et téléversées par l'import.
 *
 *   node scripts/build-seed.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO } from "./seo-defaults.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, "../..");

/**
 * Les photos sont désignées relativement au fichier NDJSON : l'import les
 * résout depuis son dossier. Un chemin absolu enfermerait le contenu de
 * départ dans la machine qui l'a produit — il doit rester importable
 * de n'importe où, y compris depuis une intégration continue.
 */
const IMG = (file) => "image@file://./../../assets/img/" + file;

/* Le dictionnaire du site sert de source pour les traductions anglaises. */
const dict = (() => {
  const src = readFileSync(resolve(SITE, "js/i18n.js"), "utf8");
  const body = src.slice(src.indexOf("var EN = {"), src.indexOf("\n  };"));
  const pairs = {};
  const re = /"((?:[^"\\]|\\.)*)":\s*\n?\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(body))) pairs[unescape(m[1])] = unescape(m[2]);
  return pairs;
})();

function unescape(s) {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

/** Traduction connue du site, sinon rien (le champ reste vide dans le Studio). */
const en = (fr) => (fr && dict[fr]) || undefined;

const PIECES = [
  {
    ref: "MA-01", name: "Aurum", categories: ["complet", "or"],
    tag: "Argent & Or 18K", material: "Argent 925 & Or 18K",
    teeth: "Pleine bouche · 16 dents", duration: "3 semaines",
    style: "Poli miroir, dent en or",
    images: [["aurum-01.jpg", "Grillz pleine bouche en argent poli avec une dent en or"]]
  },
  {
    ref: "MA-02", name: "Onyx", categories: ["complet", "custom"],
    tag: "Finition noire", material: "Argent 925 · finition noire",
    teeth: "Pleine bouche · crocs", duration: "4 semaines",
    style: "Finition noire, anatomique",
    images: [
      ["onyx-01.jpg", "Grillz pleine bouche à la finition noire avec crocs"],
      ["onyx-02.jpg", "Variation de grillz à la finition noire", "Variation"]
    ]
  },
  {
    ref: "MA-03", name: "Émeraude", categories: ["diamants", "individuelles", "or"],
    tag: "Or blanc · Pierre", material: "Or blanc 18K",
    teeth: "Dents individuelles", duration: "3 semaines",
    style: "Sertissage pierre verte",
    images: [
      ["emeraude-01.jpg", "Grillz en or blanc serti d'une pierre verte"],
      ["emeraude-02.jpg", "Détail de profil du grillz serti pierre verte", "Profil"]
    ]
  },
  {
    ref: "MA-04", name: "Memento", categories: ["custom", "complet"],
    tag: "Argent sculpté", material: "Argent 925 sculpté",
    teeth: "Bandeau · 8 motifs", duration: "4 semaines",
    style: "Têtes de mort & ossements",
    images: [
      ["memento-01.jpg", "Grillz en argent sculpté de têtes de mort et d'ossements"],
      ["memento-03.jpg", "Autre angle du grillz sculpté têtes de mort", "Revers"]
    ]
  },
  {
    ref: "MA-05", name: "Solaire", categories: ["individuelles", "or"],
    tag: "Or rose 18K", material: "Or rose 18K",
    teeth: "3 dents · crocs", duration: "4 semaines", style: "Crocs polis",
    images: [["solaire-01.jpg", "Crocs en or rose sur moulage dentaire"]]
  },
  {
    ref: "MA-06", name: "Bicolore", categories: ["complet", "or"],
    tag: "Argent & Or", material: "Argent 925 & Or",
    teeth: "Pleine bouche · 12 dents", duration: "3 semaines",
    style: "Accent or sur argent",
    images: [["bicolore-01.jpg", "Grillz pleine bouche argent avec accents or"]]
  },
  {
    ref: "MA-07", name: "Le Croc", categories: ["individuelles", "custom"],
    tag: "Argent poli", material: "Argent 925 poli",
    teeth: "1 dent · canine", duration: "3 semaines", style: "Croc anatomique",
    images: [["croc-01.jpg", "Macro d'une canine en argent poli"]]
  },
  {
    ref: "MA-08", name: "Astre", categories: ["custom", "individuelles"],
    tag: "Argent ajouré", material: "Argent 925 ajouré",
    teeth: "1 dent · motif", duration: "4 semaines", style: "Étoile ajourée",
    images: [["astre-01.jpg", "Grillz en forme d'étoile ajourée en argent"]]
  },
  {
    ref: "MA-09", name: "L'Écriture", categories: ["custom"],
    tag: "Lettrage", material: "Argent 925",
    teeth: "Pleine bouche · lettrage", duration: "4 semaines",
    style: "Lettrage façonné main",
    images: [["ecriture-01.jpg", "Grillz en argent à motif de lettrage tenu en main gantée"]]
  }
];

/* ------------------------------------------------------------------------ *
 *  Outils de mise en forme des documents
 * ------------------------------------------------------------------------ */

/** Une entrée de tableau Sanity : type et clé stable, pour un import rejouable. */
const list = (type, items) =>
  items.map((item, i) => ({ _type: type, _key: type + "-" + i, ...item }));

/** Une photo du site, téléversée par l'import depuis assets/img. */
const img = (file, alt) => ({ _type: "siteImage", _sanityAsset: IMG(file), alt });

/** En-tête de section : numéro, titre en deux teintes, introduction. */
const head = (id, title, titleAccent, lead) => ({
  _type: "sectionHead",
  id,
  ...(title ? { title } : {}),
  ...(titleAccent ? { titleAccent } : {}),
  ...(lead ? { lead } : {})
});

/** Haut de page : étiquette, titre en deux temps, chapeau. */
const intro = (label, title, titleAccent, lead) => ({
  _type: "pageHead",
  label,
  title,
  titleAccent,
  lead
});

/* Les textes de référencement viennent d'un fichier partagé : le contenu de
   départ et le correctif appliqué au projet en ligne ne peuvent pas diverger. */
const seo = (id) => ({ _type: "seoBlock", ...SEO[id] });

const step = (title, text) => ({ title, text });
const row = (label, value) => ({ label, value });

/**
 * Complète l'arbre avec les traductions connues du site : pour chaque texte
 * français reconnu, le champ « …En » correspondant est ajouté. Un texte
 * inconnu reste sans traduction — la version anglaise affichera le français.
 */
function autoEn(node) {
  if (Array.isArray(node)) return node.map(autoEn);
  if (!node || typeof node !== "object") return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    out[key] = autoEn(value);
    if (key.startsWith("_") || key.endsWith("En")) continue;
    if (typeof value === "string") {
      const t = en(value);
      if (t) out[key + "En"] = t;
    } else if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      const t = value.map(en);
      if (t.every(Boolean)) out[key + "En"] = t;
    }
  }
  return out;
}

/* ------------------------------------------------------------------------ *
 *  Textes du site
 * ------------------------------------------------------------------------ */

const PORTRAIT = [
  "Technicienne-dentiste depuis 1978, j'ai exercé mon métier avec passion, précision et exigence de qualité pour la satisfaction de ma clientèle. Au fil des décennies, j'ai acquis une solide expérience technique et esthétique en travaillant comme salariée, puis comme indépendante depuis 1993.",
  "Tout au long de ma carrière, je me suis investie dans la profession en tant que formatrice d'apprentis, experte aux examens et présidente de l'association des laboratoires dentaires pour la section vaudoise durant trois ans. Transmettre mon savoir-faire et contribuer à l'évolution de ma profession sont des valeurs essentielles pour moi.",
  "Aujourd'hui, je mets cette expérience au service d'un domaine différent, qui allie technique et création artistique. Les grillz et bijoux dentaires sont créés avec la même rigueur et le même souci du détail : ces exigences de qualité ont guidé toute ma carrière.",
  "Travailler aux côtés de mon fils est une nouvelle aventure, qui me permet de conjuguer l'expérience de plus de quarante années avec une approche moderne et créative, enrichie par de belles rencontres avec une clientèle aux univers variés. Ensemble, nous avons une excellente collaboration, ainsi qu'une grande satisfaction de réaliser des pièces uniques, fabriquées artisanalement avec la même passion."
];

const QUOTE =
  "Parce qu'un sourire est une signature, chaque grillz mérite le plus haut niveau d'exigence.";

/* ------------------------------------------------------------------------ *
 *  Documents
 * ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ *
 *  Les réalisations, réparties entre les deux pages qui les montrent
 *
 *  Chaque page porte ses propres photos : la carte de l'accueil et la vue de
 *  la galerie sont deux entrées distinctes, même quand elles partent du même
 *  fichier. Changer l'une n'entraîne pas l'autre.
 * ------------------------------------------------------------------------ */

/** Une photo de page, avec sa description et sa traduction. */
const photo = (file, alt) => ({ ...img(file, alt), altEn: en(alt) });

/** Les cartes du catalogue de l'accueil : la première photo de chaque pièce. */
const catalogCards = PIECES.map((p, i) => ({
  _type: "catalogCard",
  _key: "card-" + i,
  image: photo(p.images[0][0], p.images[0][1]),
  name: p.name,
  ref: p.ref,
  material: p.material,
  materialEn: en(p.material),
  duration: p.duration,
  durationEn: en(p.duration)
}));

/** Les vues de la galerie : chaque photo de chaque pièce, référencée MA-02·B. */
const galleryTiles = PIECES.flatMap((p, i) =>
  p.images.map(([file, alt, label], k) => ({
    _type: "galleryTile",
    _key: "tile-" + i + "-" + k,
    image: photo(file, alt),
    name: k === 0 || !label ? p.name : p.name + " · " + label,
    ref: k === 0 ? p.ref : p.ref + "·" + String.fromCharCode(65 + k),
    tag: p.tag,
    tagEn: en(p.tag),
    categories: p.categories,
    material: p.material,
    materialEn: en(p.material),
    teeth: p.teeth,
    teethEn: en(p.teeth),
    duration: p.duration,
    durationEn: en(p.duration),
    style: p.style,
    styleEn: en(p.style)
  }))
);

const homePage = {
  _id: "homePage",
  _type: "homePage",

  heroImage: {
    _type: "image",
    _sanityAsset: IMG("porte-01.jpg"),
    alt: "Grillz ajouré en métal précieux porté sur un sourire, photographie noir et blanc en lumière douce"
  },
  heroCaption: "Porté // Atelier Lausanne",
  heroCaptionEn: "Worn // Lausanne atelier",
  heroTitleTop: "Façonné pour",
  heroTitleBottom: "une seule bouche.",
  heroSub:
    "Grillz et pièces dentaires de haute joaillerie, ajustés au dixième de millimètre dans notre atelier lausannois. Empreinte, façonnage à la main, pièce unique — jamais de modèle standard, jamais de stock.",
  metrics: ["Dès 170 CHF", "2–4 semaines", "Envoi international"],
  heroCtaPrimary: "Voir le catalogue",
  heroCtaSecondary: "Prendre rendez-vous",
  heroScrollHint: "Défiler pour inspecter",

  catalogHead: head(
    "00 // Catalogue",
    "Réalisations récentes.",
    "",
    "Aperçu de nos dernières pièces. Chaque référence est une commande unique, façonnée sur la morphologie d'une seule personne."
  ),
  catalogCards,
  catalogNote: "Pièces uniques · sur commande",
  catalogFootLabel: "Parcourir les 9 modèles →",

  protocolHead: head("01 // Protocole", "Quatre gestes.", "Un seul protocole."),
  protocolSteps: list("flowStep", [
    step("Consultation", "On part de votre style et de votre usage. Un échange sans engagement, entièrement centré sur vous."),
    step("Empreinte", "À l'atelier, chez votre dentiste, ou chez vous grâce au model kit que nous vous envoyons. Précision au dixième de millimètre."),
    step("Façonnage", "Fonte directement à l'atelier. Façonnage et sertissage à la main, par des professionnels dans le métier depuis plus de 40 ans."),
    step("Livraison", "De préférence en main propre, à l'atelier. Envoi par la poste possible pour les clients à l'étranger.")
  ]),

  interlude: {
    _type: "interlude",
    image: img("porte-02.jpg", "Sourire portant deux grillz sculptés en argent, portrait noir et blanc aux ombres douces"),
    left: "Atelier · Lausanne",
    right: "Empreinte → façonnage → livraison"
  },

  pathwaysHead: head(
    "02 // Voies",
    "Deux voies.",
    "Un même sur-mesure.",
    "Que vous soyez à Lausanne ou ailleurs, tout commence par une empreinte précise — à l'atelier, chez votre dentiste, ou chez vous grâce à notre model kit."
  ),
  pathways: list("pathway", [
    {
      id: "Voie A // À Lausanne",
      title: "À l'atelier",
      text: "Empreinte prise sur place par notre équipe dentaire, dans le confort de l'atelier.",
      specs: list("specRow", [
        row("Lieu", "Av. de Sévelin 36"),
        row("Durée", "30–45 min"),
        row("Remise", "En main propre")
      ]),
      linkLabel: "Prendre rendez-vous →"
    },
    {
      id: "Voie B // Ailleurs",
      title: "À distance",
      text: "Empreinte réalisée chez votre dentiste — recommandé pour une meilleure garantie de tenue — ou par vous-même avec le model kit que la maison vous envoie. La pièce finie est ensuite livrée par la poste.",
      specs: list("specRow", [
        row("Empreinte", "Dentiste · model kit"),
        row("Envoi", "Assuré"),
        row("Suivi", "WhatsApp · e-mail")
      ]),
      linkLabel: "Nous écrire →"
    }
  ]),

  materialsHead: head(
    "03 // Matières",
    "Métaux, pierres, finitions.",
    "",
    "Tarifs des métaux indexés sur le cours de l'or. Sélection arrêtée en atelier."
  ),
  materialGroups: list("specGroup", [
    {
      label: "Métaux",
      items: list("careItem", [
        step("Or 10K à 18K", "Jaune · blanc · rose"),
        step("Argent 925 · Chrome-cobalt", "Standard atelier")
      ])
    },
    {
      label: "Finitions",
      items: list("careItem", [
        step("Poli miroir", "Éclat maximal"),
        step("Satiné", "Mat doux"),
        step("Brossé", "Texture linéaire")
      ])
    },
    {
      label: "Pierres",
      items: list("careItem", [
        step("Diamant naturel", "Serti main"),
        step("Diamant synthétique", "Serti main"),
        step("Pierres diverses", "Différents types · sur demande")
      ])
    }
  ]),

  atelierHead: head("04 // L'atelier", "Un atelier à Lausanne."),
  atelierImage: img("ecriture-03.jpg", "Détail d'un grillz en argent façonné à la main à l'établi de l'atelier"),
  atelierStatement: "Nous ne fabriquons pas des bijoux. Nous façonnons une",
  atelierStatementAccent: "seconde peau.",
  atelierText:
    "Une maison héritière de la technique dentaire depuis 1978, élevée à l'exigence d'un atelier de joaillerie. Un seul lieu, où chaque pièce naît, vit et se finit — de l'empreinte à la remise en main propre.",
  atelierRows: list("specRow", [
    row("Lieu", "Lausanne, Suisse"),
    row("Accès", "Sur rendez-vous"),
    row("Matériaux", "Or · Argent 925 · Chrome-cobalt"),
    row("Délai", "2 à 4 semaines")
  ]),
  atelierCtaLabel: "Découvrir le savoir-faire",

  careHead: head("05 // Entretien & garanties", "Entretien.", "Et garanties."),
  careColumns: list("careColumn", [
    {
      title: "Entretien",
      items: list("careItem", [
        step("Port — max 8 h / jour", "Retirez la pièce pour dormir et pour manger."),
        step("Nettoyage — eau chaude & brosse à dents", "Un brossage doux à l'eau chaude suffit à raviver l'éclat."),
        step("Rangement — modèle en plâtre fourni", "Reposez la pièce sur son modèle en plâtre, à l'abri des chocs.")
      ])
    },
    {
      title: "Garanties",
      items: list("careItem", [
        step("Fabrication — 30 jours", "Tout défaut d'atelier est pris en charge."),
        step("Sertissage — à vie", "Le resserrage des pierres est garanti à vie."),
        step("Atelier — toujours là", "Nettoyage, repolissage, ajustements : passez quand vous voulez, c'est offert.")
      ])
    }
  ]),
  careNote:
    "La maison reste là en cas de besoin. Un polissage, un nettoyage ? Passez à l'atelier, c'est avec plaisir, et c'est gratuit.",

  faqHead: head("06 // FAQ", "Questions fréquentes."),
  faqItems: list("faqItem", [
    { question: "Est-ce que ça fait mal ?", answer: "Non. La pièce se pose et se retire sans douleur et sans aucune intervention sur la dent." },
    { question: "Est-ce permanent ?", answer: "Non. Un grillz est amovible : vous le mettez et l'enlevez quand vous le souhaitez." },
    { question: "Peut-on manger avec ?", answer: "Nous recommandons de le retirer pendant les repas afin de préserver la pièce et son éclat." },
    { question: "Est-ce que ça abîme les dents ?", answer: "Non. L'ajustement sur mesure épouse la dent sans la contraindre ni la modifier." },
    { question: "Quels sont les délais ?", answer: "Comptez 2 à 4 semaines selon la complexité de la pièce et les matériaux choisis." },
    { question: "Et si je ne suis pas à Lausanne ?", answer: "L'empreinte peut être réalisée chez votre dentiste — la meilleure garantie de tenue — ou chez vous grâce au model kit que nous vous envoyons. La pièce finie est ensuite livrée par la poste, où que vous soyez." }
  ]),

  deploy: {
    _type: "deployBlock",
    id: "07 // Sur mesure",
    title: "Une pièce unique.",
    titleAccent: "Pour une seule personne.",
    primaryLabel: "Prendre rendez-vous",
    secondaryLabel: "Voir le catalogue"
  },

  seo: seo("homePage")
};

const craftPage = {
  _id: "craftPage",
  _type: "craftPage",

  pageHead: intro(
    "Savoir-faire & Histoire",
    "L'art dentaire rencontre la",
    "haute joaillerie",
    "Une carrière entière passée dans la technique dentaire, aujourd'hui au service du bijou. Voici notre origine, nos gestes et nos matières."
  ),
  headImage: {
    _type: "image",
    _sanityAsset: IMG("porte-02.jpg"),
    alt: "Sourire portant deux grillz sculptés en argent, portrait noir et blanc aux ombres douces"
  },

  originHead: head("01 // Origine", "Depuis 1978,", "la technicienne-dentiste."),
  portraitImage: {
    _type: "image",
    _sanityAsset: IMG("portrait-technicienne.jpg"),
    alt: "Grillz argent et or posé sur son modèle en plâtre, à l'atelier"
  },
  portraitCaption: "Technique dentaire · depuis 1978",
  profileIntro: "Passion, précision,",
  profileIntroAccent: "exigence de qualité.",
  portraitParagraphs: PORTRAIT,
  portraitParagraphsEn: PORTRAIT.map((p) => en(p)).filter(Boolean),
  creds: list("specRow", [
    row("Métier", "Technicienne-dentiste · depuis 1978"),
    row("Indépendante", "Depuis 1993"),
    row("Atelier", "Av. de Sévelin 36, Lausanne"),
    row("Signature", "Ajustement anatomique")
  ]),

  transmissionHead: head("02 // Transmission", "Former, examiner,", "présider."),
  transmissionSteps: list("flowStep", [
    step("Formatrice d'apprentis", "Des générations de techniciens formées à l'établi : le geste, la mesure, la patience."),
    step("Experte aux examens", "Juger le travail des autres oblige à connaître la frontière entre bien fait et irréprochable."),
    step("Présidente · section vaudoise", "Trois ans à la tête de l'association des laboratoires dentaires du canton.")
  ]),
  portraitQuote: QUOTE,
  portraitQuoteEn:
    "Because a smile is a signature, every grillz deserves the highest standard of all.",
  portraitQuoteAuthor: "La technicienne-dentiste de la maison",

  todayHead: head("03 // Aujourd'hui", "La même rigueur,", "appliquée au bijou."),
  todayImage: img("ecriture-03.jpg", "Détail d'un grillz en argent façonné à la main à l'établi de l'atelier"),
  todayRows: list("specRow", [
    row("À deux", "Mère & fils"),
    row("Expérience", "Plus de 40 années"),
    row("Fabrication", "Artisanale, à l'atelier"),
    row("Séries", "Aucune · pièces uniques")
  ]),

  pillarsHead: head(
    "04 // Trois piliers",
    "Pourquoi la Suisse",
    "change tout.",
    "La précision horlogère n'est pas un argument marketing : c'est une culture du dixième de millimètre, appliquée à votre sourire."
  ),
  pillars: list("flowStep", [
    step("Fabriqué en Suisse", "Précision horlogère appliquée à la joaillerie dentaire. Chaque pièce naît, vit et se finit dans notre atelier."),
    step("Ajustement anatomique", "Une empreinte, une bouche : la pièce épouse les reliefs et les asymétries. Un maintien franc, sans compromis, sans douleur."),
    step("Matériaux certifiés", "Or 10K à 18K, argent 925, chrome-cobalt, diamants naturels et synthétiques. Une traçabilité totale, consignée sur votre certificat d'authenticité.")
  ]),

  interlude: {
    _type: "interlude",
    image: img("ecriture-01.jpg", "Main gantée tenant un grillz en argent au-dessus d'un moulage dentaire"),
    left: "Établi · Lausanne",
    right: "Fonte → ciselure → sertissage → polissage"
  },

  materialsHead: head("05 // Matières", "Choisies comme", "on choisit une pierre.", "Faites défiler →"),
  materials: list("materialCard", [
    {
      image: img("croc-01.jpg", "Macro d'une canine en argent poli révélant le grain du métal"),
      title: "Argent 925",
      text: "Poli miroir ou satiné. Le métal des premières pièces, accessible et noble.",
      cert: "Sterling certifié"
    },
    {
      image: img("aurum-02.jpg", "Détail or 18 carats sur un grillz pleine bouche"),
      title: "Argent 925 & Or 18K",
      text: "Ici, une seule dent en or 18 carats sur une pièce en argent 925. L'or se décline du 10 aux 18 carats, jaune, blanc ou rose.",
      cert: "Poinçon suisse"
    },
    {
      image: img("emeraude-01.jpg", "Pierre verte sertie sur un grillz en or blanc"),
      title: "Sertissage pierres & diamants",
      text: "Diamants naturels ou synthétiques, pierres diverses — posées et serties à la main.",
      cert: "Sertissage main"
    },
    {
      image: img("onyx-02.jpg", "Grillz au design sculpté, finition sombre"),
      title: "Designs spécifiques",
      text: "Croix, crocs, motifs sculptés : tous les designs particuliers sont possibles, dessinés avec vous.",
      cert: "Sur demande"
    }
  ]),

  gestureHead: head(
    "06 // Le geste",
    "Le métal,",
    "geste après geste.",
    "Chaque pièce traverse le même établi, entre les mêmes mains, du métal brut à l'éclat final."
  ),
  gestureSteps: list("flowStep", [
    step("Fonte", "Le métal précieux est fondu puis coulé sur le modèle issu de votre empreinte. La matière prend sa première forme."),
    step("Ciselure", "Motifs, reliefs et arêtes sont travaillés à la main, à la loupe. C'est ici que naît le caractère de la pièce."),
    step("Sertissage", "Diamants et pierres sont posés un à un, chaque griffe resserrée à la main pour une tenue à toute épreuve."),
    step("Polissage", "Poli miroir, satiné ou brossé : la finition révèle le métal et signe le rendu final.")
  ]),

  deploy: {
    _type: "deployBlock",
    id: "→ Étape suivante",
    title: "De la première empreinte",
    titleAccent: "à la remise en main propre.",
    primaryLabel: "Découvrir le processus",
    secondaryLabel: "Prendre rendez-vous"
  },

  seo: seo("craftPage")
};

const processPage = {
  _id: "processPage",
  _type: "processPage",

  pageHead: intro(
    "Processus de commande",
    "Votre pièce.",
    "Étape par étape.",
    "Du premier échange à la remise en main propre, chaque détail est pensé. Voici comment naît une pièce qui n'appartient qu'à vous."
  ),

  steps: list("processStep", [
    {
      image: img("solaire-01.jpg", "Grillz en or rose présenté dans une lumière feutrée, ambiance confidentielle"),
      title: "Consultation",
      text: "Nous commençons par comprendre votre esthétique, votre style, votre usage. Un échange sans engagement, entièrement centré sur vous.",
      tag: "Sans engagement · 20 min"
    },
    {
      image: img("ecriture-01.jpg", "Prise d'empreinte : main gantée manipulant un moulage dentaire"),
      title: "L'empreinte",
      text: "À l'atelier, chez vous grâce au model kit que la maison vous envoie, ou chez votre dentiste. Si vous n'êtes pas en Suisse et cherchez le meilleur résultat, privilégiez votre dentiste : une empreinte prise par un professionnel garantit toujours une plus grande tenue.",
      tag: "Atelier · dentiste · model kit"
    },
    {
      image: img("memento-02.jpg", "Détail sculpté d'un grillz argent, ciselure à la loupe"),
      title: "La fabrication",
      text: "La fonte se fait directement à l'atelier. Façonnage et sertissage à la main, par des professionnels dans le métier depuis plus de 40 ans.",
      tag: "Atelier · Lausanne"
    },
    {
      image: img("aurum-01.jpg", "Grillz fini, argent et or, prêt à être remis en main propre"),
      title: "Remise en main propre",
      text: "De préférence en main propre, à l'atelier, certificat d'authenticité inclus. Envoi par la poste possible pour les clients à l'étranger.",
      tag: "Main propre · envoi postal"
    }
  ]),

  practicalLabel: "Informations pratiques",
  practicalRows: list("specRow", [
    row("Délai moyen", "2 à 4 semaines"),
    row("Paiement", "Cash uniquement"),
    row("Livraison", "Suisse & international · Assurée"),
    row("Garantie", "Sertissage à vie")
  ]),
  ctaTitle: "Prêt à façonner la vôtre ?",
  ctaText: "Tout démarre par un échange. Décrivez-nous votre projet, nous répondons sous 48 heures.",
  ctaLabel: "Démarrer ma commande",

  seo: seo("processPage")
};

const galleryPage = {
  _id: "galleryPage",
  _type: "galleryPage",

  pageHead: intro(
    "Galerie",
    "Nos",
    "créations",
    "Chaque pièce est une commande unique. Cliquez pour découvrir matériaux, détails et histoire."
  ),
  filters: list("choiceOption", [
    { label: "Tout" },
    { label: "Or" },
    { label: "Diamants" },
    { label: "Complet" },
    { label: "Individuelles" },
    { label: "Custom" }
  ]),
  countLabel: "vues",
  tiles: galleryTiles,

  seo: seo("galleryPage")
};

const contactPage = {
  _id: "contactPage",
  _type: "contactPage",

  pageHead: intro(
    "Contact & Devis",
    "Créons",
    "ensemble",
    "Remplissez les quelques étapes ci-dessous pour démarrer votre projet. Nous vous répondons sous 48 heures."
  ),

  steps: list("formStep", [
    { num: "Étape 01// Qui êtes-vous ?", title: "Faisons connaissance." },
    { num: "Étape 02// Votre projet", title: "Quelle pièce imaginez-vous ?" },
    { num: "Étape 03// Budget & timing", title: "Cadrons votre projet." },
    { num: "Étape 04// Inspirations", title: "Montrez-nous votre vision." },
    { num: "Étape 05// Récapitulatif", title: "Votre projet en un coup d'œil." }
  ]),

  /* « Valeur » = le texte d'exemple affiché à l'intérieur du champ. */
  labels: list("specRow", [
    row("Prénom", "Votre prénom"),
    row("Pays", "Suisse"),
    row("Email", "vous@email.com"),
    { label: "Type de pièce" },
    { label: "Matériau souhaité" },
    { label: "Budget envisagé" },
    { label: "Date souhaitée" },
    { label: "Urgence" },
    { label: "Photos de référence" },
    row("Décrivez votre projet", "Style recherché, inspirations, détails particuliers…")
  ]),

  nextLabel: "Continuer",
  recapLabel: "Voir le récapitulatif",
  backLabel: "← Retour",
  submitLabel: "Envoyer mon projet",
  uploadHint: "Glissez vos images ou cliquez pour parcourir",
  formNote:
    "En envoyant, vous acceptez d'être recontacté par l'atelier. Aucune donnée n'est partagée avec des tiers.",
  successTitle: "Projet bien reçu.",
  successText:
    "Merci. Notre atelier revient vers vous sous 48 heures pour planifier votre consultation.",

  budgetMin: 170,
  budgetMax: 25000,
  budgetStart: 2000,

  pieceChoices: list("choiceOption", [
    { label: "Pleine bouche" },
    { label: "Crocs" },
    { label: "Individuelles", full: "Dents individuelles" },
    { label: "Custom" }
  ]),
  materialChoices: list("choiceOption", [
    { label: "Or jaune" },
    { label: "Or blanc" },
    { label: "Argent 925" },
    { label: "Chrome-cobalt" }
  ]),
  urgencyChoices: list("choiceOption", [
    { label: "Flexible" },
    { label: "Sous 1 mois" },
    { label: "Urgent" }
  ]),

  callLabel: "Plus direct ?",
  callText: "Réservez un appel de 20 minutes avec l'atelier, sans engagement.",
  callCta: "Réserver un appel",
  atelierTitle: "L'atelier",
  atelierNote: "Sur rendez-vous uniquement",
  writeTitle: "Écrire",

  seo: seo("contactPage")
};

const siteSettings = {
  _id: "siteSettings",
  _type: "siteSettings",

  email: "alan.alliani2503@gmail.com",
  phone: "079 456 14 03",
  phoneLink: "+41794561403",
  addressLine1: "Av. de Sévelin 36",
  addressLine2: "1004 Lausanne, Suisse",
  instagram: "https://www.instagram.com/maison_alliani/",
  instagramHandle: "@maison_alliani",

  bookingOpen: true,
  bookingLabel: "Carnet ouvert",
  bookingDetail: "sur rendez-vous",

  navTagline: "Atelier · CH",
  navPlace: "Lausanne · Suisse",

  footerHook: "Une pièce unique commence par une conversation.",
  footerCta: "Prendre rendez-vous",
  footerBrandText:
    "Haute joaillerie dentaire sur mesure. Façonnée à la main, en Suisse, par un technicien-dentiste devenu joaillier.",
  footerColExplore: "01 // Explorer",
  footerColAtelier: "02 // Atelier",
  footerColStatus: "03 // Statut",
  footerStatusNote: "Sur rendez-vous uniquement",
  footerClockNote: "heure de l'atelier",
  footerLegal: "Mentions légales",
  footerCoords: "46°31′N — 6°38′E",
  footerMadeIn: "Fabriqué en Suisse"
};

const docs = [
  homePage,
  craftPage,
  processPage,
  galleryPage,
  contactPage,
  siteSettings
].map(autoEn);

const out = resolve(here, "seed.ndjson");
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n", "utf8");
console.log("Écrit : " + out + " (" + docs.length + " documents)");
