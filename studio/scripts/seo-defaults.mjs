/**
 * Titre d'onglet et description Google de chaque page.
 *
 * Source unique : le contenu de départ (build-seed.mjs) et le correctif
 * appliqué au projet en ligne (patch-seo.mjs) lisent tous deux ce fichier.
 * Deux listes qui divergent, c'est un site qui se référence sur d'anciens
 * textes sans que personne ne s'en aperçoive.
 *
 * Repères : environ 60 caractères pour le titre, 155 pour la description.
 * Au-delà, Google coupe.
 */
export const SEO = {
  homePage: {
    title: "Grillz sur mesure à Lausanne — Maison Alliani",
    description:
      "Atelier de grillz sur mesure à Lausanne. Pièces uniques façonnées à la main : or 10K à 18K, argent 925, diamants. Dès 170 CHF, sur rendez-vous.",
    titleEn: "Custom Grillz in Lausanne — Maison Alliani",
    descriptionEn:
      "Custom grillz atelier in Lausanne, Switzerland. Unique pieces crafted by hand: 10K to 18K gold, 925 silver, diamonds. From CHF 170, by appointment."
  },
  craftPage: {
    title: "Savoir-faire — Atelier de grillz à Lausanne",
    description:
      "Depuis 1978, la technique dentaire au service du bijou. Grillz façonnés à la main dans notre atelier lausannois : or, argent 925, chrome-cobalt, diamants.",
    titleEn: "Craft — Grillz Atelier in Lausanne",
    descriptionEn:
      "Since 1978, dental technique in the service of jewellery. Grillz crafted by hand in our Lausanne atelier: gold, 925 silver, chrome-cobalt, diamonds."
  },
  processPage: {
    title: "Commander des grillz à Lausanne — le processus",
    description:
      "De la consultation à la remise en main propre : empreinte dentaire, façonnage à la main à Lausanne, livraison en Suisse et à l'international sous 2 à 4 semaines.",
    titleEn: "Ordering Grillz in Lausanne — the Process",
    descriptionEn:
      "From consultation to in-person handover: dental impression, hand crafting in Lausanne, delivery across Switzerland and worldwide within 2 to 4 weeks."
  },
  galleryPage: {
    title: "Galerie de grillz sur mesure — Lausanne",
    description:
      "Nos créations façonnées à Lausanne : grillz or et diamants, pleine bouche, dents individuelles, crocs et pièces custom. Chaque pièce est unique.",
    titleEn: "Custom Grillz Gallery — Lausanne",
    descriptionEn:
      "Our creations crafted in Lausanne: gold and diamond grillz, full mouth, individual teeth, fangs and custom pieces. Every piece is one of a kind."
  },
  contactPage: {
    title: "Rendez-vous grillz à Lausanne — Maison Alliani",
    description:
      "Prenez rendez-vous à notre atelier de Lausanne, av. de Sévelin 36, ou demandez un devis en ligne. Réponse sous 48 heures.",
    titleEn: "Grillz Appointment in Lausanne — Maison Alliani",
    descriptionEn:
      "Book an appointment at our Lausanne atelier, av. de Sévelin 36, or request a quote online. We reply within 48 hours."
  }
};
