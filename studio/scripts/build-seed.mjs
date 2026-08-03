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

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, "../..");
const IMG = (file) => "image@file://" + resolve(SITE, "assets/img", file);

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

const pieceDoc = (p, i) => ({
  _id: "piece-" + p.ref.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  _type: "piece",
  name: p.name,
  ref: p.ref,
  categories: p.categories,
  tag: p.tag, tagEn: en(p.tag),
  material: p.material, materialEn: en(p.material),
  teeth: p.teeth, teethEn: en(p.teeth),
  duration: p.duration, durationEn: en(p.duration),
  style: p.style, styleEn: en(p.style),
  featured: true,
  order: i + 1,
  images: p.images.map(([file, alt, label], k) => ({
    _type: "pieceImage",
    _key: "img" + k,
    _sanityAsset: IMG(file),
    alt,
    altEn: en(alt),
    ...(label ? { label, labelEn: en(label) } : {})
  }))
});

const HERO_SUB =
  "Grillz et pièces dentaires de haute joaillerie, ajustés au dixième de millimètre dans notre atelier lausannois. Empreinte, façonnage à la main, pièce unique — jamais de modèle standard, jamais de stock.";

const PORTRAIT = [
  "Technicienne-dentiste depuis 1978, j'ai exercé mon métier avec passion, précision et exigence de qualité pour la satisfaction de ma clientèle. Au fil des décennies, j'ai acquis une solide expérience technique et esthétique en travaillant comme salariée, puis comme indépendante depuis 1993.",
  "Tout au long de ma carrière, je me suis investie dans la profession en tant que formatrice d'apprentis, experte aux examens et présidente de l'association des laboratoires dentaires pour la section vaudoise durant trois ans. Transmettre mon savoir-faire et contribuer à l'évolution de ma profession sont des valeurs essentielles pour moi.",
  "Aujourd'hui, je mets cette expérience au service d'un domaine différent, qui allie technique et création artistique. Les grillz et bijoux dentaires sont créés avec la même rigueur et le même souci du détail : ces exigences de qualité ont guidé toute ma carrière.",
  "Travailler aux côtés de mon fils est une nouvelle aventure, qui me permet de conjuguer l'expérience de plus de quarante années avec une approche moderne et créative, enrichie par de belles rencontres avec une clientèle aux univers variés. Ensemble, nous avons une excellente collaboration, ainsi qu'une grande satisfaction de réaliser des pièces uniques, fabriquées artisanalement avec la même passion."
];

const QUOTE =
  "Parce qu'un sourire est une signature, chaque grillz mérite le plus haut niveau d'exigence.";

const docs = [
  {
    _id: "homePage",
    _type: "homePage",
    heroImage: {
      _type: "image",
      _sanityAsset: IMG("porte-01.jpg"),
      alt: "Grillz ajouré en métal précieux porté sur un sourire, photographie noir et blanc en lumière douce",
      altEn: en("Grillz ajouré en métal précieux porté sur un sourire, photographie noir et blanc en lumière douce")
    },
    heroCaption: "Porté // Atelier Lausanne",
    heroCaptionEn: "Worn // Lausanne atelier",
    heroTitleTop: "Façonné pour", heroTitleTopEn: en("Façonné pour"),
    heroTitleBottom: "une seule bouche.", heroTitleBottomEn: en("une seule bouche."),
    heroSub: HERO_SUB, heroSubEn: en(HERO_SUB),
    metrics: ["Dès 170 CHF", "2–4 semaines", "Envoi international"],
    metricsEn: ["From CHF 170", "2–4 weeks", "Worldwide shipping"]
  },
  {
    _id: "craftPage",
    _type: "craftPage",
    headImage: {
      _type: "image",
      _sanityAsset: IMG("porte-02.jpg"),
      alt: "Sourire portant deux grillz sculptés en argent, portrait noir et blanc aux ombres douces",
      altEn: en("Sourire portant deux grillz sculptés en argent, portrait noir et blanc aux ombres douces")
    },
    portraitImage: {
      _type: "image",
      _sanityAsset: IMG("portrait-technicienne.jpg"),
      alt: "Grillz argent et or posé sur son modèle en plâtre, à l'atelier",
      altEn: en("Grillz argent et or posé sur son modèle en plâtre, à l'atelier")
    },
    portraitCaption: "Technique dentaire · depuis 1978",
    portraitCaptionEn: en("Technique dentaire · depuis 1978"),
    portraitParagraphs: PORTRAIT,
    portraitParagraphsEn: PORTRAIT.map((p) => en(p)).filter(Boolean),
    portraitQuote: QUOTE,
    portraitQuoteEn: "Because a smile is a signature, every grillz deserves the highest standard of all.",
    portraitQuoteAuthor: "La technicienne-dentiste de la maison",
    portraitQuoteAuthorEn: en("La technicienne-dentiste de la maison")
  },
  {
    _id: "siteSettings",
    _type: "siteSettings",
    email: "alan.alliani2503@gmail.com",
    phone: "079 456 14 03",
    phoneLink: "+41794561403",
    addressLine1: "Av. de Sévelin 36",
    addressLine2: "1004 Lausanne, Suisse",
    instagram: "https://www.instagram.com/maison_alliani/",
    bookingOpen: true,
    bookingLabel: "Carnet ouvert",
    bookingLabelEn: en("Carnet ouvert")
  },
  ...PIECES.map(pieceDoc)
];

const out = resolve(here, "seed.ndjson");
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n", "utf8");
console.log("Écrit : " + out + " (" + docs.length + " documents)");
