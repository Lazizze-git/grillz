import { defineField, defineType } from "sanity";

/**
 * Page d'accueil, section par section, dans l'ordre où elles apparaissent.
 * Les champs du héros gardent leurs noms d'origine : le contenu déjà publié
 * reste en place.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Page d'accueil",
  type: "document",
  groups: [
    { name: "hero", title: "Haut de page", default: true },
    { name: "catalog", title: "Catalogue" },
    { name: "protocol", title: "Protocole" },
    { name: "pathways", title: "Voies" },
    { name: "materials", title: "Matières" },
    { name: "atelier", title: "Atelier" },
    { name: "care", title: "Entretien" },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "Référencement" }
  ],
  fieldsets: [
    {
      name: "en",
      title: "Traduction anglaise (facultatif)",
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    /* ---------- Haut de page ---------- */
    defineField({
      name: "heroImage",
      title: "Grande photo du haut",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      description:
        "Format vertical conseillé. Le point de recadrage se règle en cliquant sur l'image.",
      fields: [
        defineField({
          name: "alt",
          title: "Description de la photo",
          type: "string",
          validation: (rule) => rule.required()
        }),
        defineField({ name: "altEn", title: "Description (EN)", type: "string" })
      ]
    }),
    defineField({
      name: "heroCaption",
      title: "Légende sur la photo",
      type: "string",
      group: "hero",
      description: "Ex. : Porté // Atelier Lausanne"
    }),
    defineField({
      name: "heroTitleTop",
      title: "Titre — première ligne",
      type: "string",
      group: "hero",
      description: "Ex. : Façonné pour"
    }),
    defineField({
      name: "heroTitleBottom",
      title: "Titre — seconde ligne",
      type: "string",
      group: "hero",
      description: "Ex. : une seule bouche."
    }),
    defineField({
      name: "heroSub",
      title: "Paragraphe d'introduction",
      type: "text",
      rows: 4,
      group: "hero"
    }),
    defineField({
      name: "metrics",
      title: "Trois repères",
      type: "array",
      of: [{ type: "string" }],
      group: "hero",
      description: "Ex. : Dès 170 CHF · 2–4 semaines · Envoi international",
      validation: (rule) => rule.max(3)
    }),
    defineField({
      name: "heroCtaPrimary",
      title: "Bouton principal",
      type: "string",
      group: "hero",
      description: "Mène à la galerie. Ex. : Voir le catalogue"
    }),
    defineField({
      name: "heroCtaSecondary",
      title: "Bouton secondaire",
      type: "string",
      group: "hero",
      description: "Mène au contact. Ex. : Prendre rendez-vous"
    }),
    defineField({
      name: "heroScrollHint",
      title: "Invitation à faire défiler",
      type: "string",
      group: "hero",
      description: "Ex. : Défiler pour inspecter"
    }),

    /* ---------- Catalogue ---------- */
    defineField({ name: "catalogHead", title: "En-tête", type: "sectionHead", group: "catalog" }),
    defineField({
      name: "catalogNote",
      title: "Mention de droite",
      type: "string",
      group: "catalog",
      description: "Ex. : Pièces uniques · sur commande"
    }),
    defineField({
      name: "catalogFootLabel",
      title: "Lien du bas",
      type: "string",
      group: "catalog",
      description:
        "Le nombre de modèles est ajouté automatiquement si le texte contient « 9 ». Ex. : Parcourir les 9 modèles →"
    }),

    /* ---------- Protocole ---------- */
    defineField({ name: "protocolHead", title: "En-tête", type: "sectionHead", group: "protocol" }),
    defineField({
      name: "protocolSteps",
      title: "Étapes",
      type: "array",
      of: [{ type: "flowStep" }],
      group: "protocol",
      description: "La numérotation « 01// » est calculée automatiquement."
    }),
    defineField({
      name: "interlude",
      title: "Photo de respiration",
      type: "interlude",
      group: "protocol",
      description: "La grande photo pleine largeur qui suit les quatre étapes."
    }),

    /* ---------- Voies ---------- */
    defineField({ name: "pathwaysHead", title: "En-tête", type: "sectionHead", group: "pathways" }),
    defineField({
      name: "pathways",
      title: "Les deux voies",
      type: "array",
      of: [{ type: "pathway" }],
      group: "pathways",
      validation: (rule) => rule.max(2)
    }),

    /* ---------- Matières ---------- */
    defineField({ name: "materialsHead", title: "En-tête", type: "sectionHead", group: "materials" }),
    defineField({
      name: "materialGroups",
      title: "Groupes",
      type: "array",
      of: [{ type: "specGroup" }],
      group: "materials",
      description: "Métaux, finitions, pierres — trois colonnes conseillées."
    }),

    /* ---------- Atelier ---------- */
    defineField({ name: "atelierHead", title: "En-tête", type: "sectionHead", group: "atelier" }),
    defineField({ name: "atelierImage", title: "Photo", type: "siteImage", group: "atelier" }),
    defineField({
      name: "atelierStatement",
      title: "Phrase forte",
      type: "string",
      group: "atelier",
      description: "Première partie, en gris. Ex. : Nous ne fabriquons pas des bijoux. Nous façonnons une"
    }),
    defineField({
      name: "atelierStatementAccent",
      title: "Fin de la phrase forte",
      type: "string",
      group: "atelier",
      description: "Affichée en blanc. Ex. : seconde peau."
    }),
    defineField({ name: "atelierText", title: "Paragraphe", type: "text", rows: 4, group: "atelier" }),
    defineField({
      name: "atelierRows",
      title: "Caractéristiques",
      type: "array",
      of: [{ type: "specRow" }],
      group: "atelier"
    }),
    defineField({
      name: "atelierCtaLabel",
      title: "Bouton",
      type: "string",
      group: "atelier",
      description: "Mène au savoir-faire. Ex. : Découvrir le savoir-faire"
    }),

    /* ---------- Entretien & garanties ---------- */
    defineField({ name: "careHead", title: "En-tête", type: "sectionHead", group: "care" }),
    defineField({
      name: "careColumns",
      title: "Colonnes",
      type: "array",
      of: [{ type: "careColumn" }],
      group: "care",
      validation: (rule) => rule.max(2)
    }),
    defineField({ name: "careNote", title: "Mot de la fin", type: "text", rows: 3, group: "care" }),

    /* ---------- FAQ ---------- */
    defineField({ name: "faqHead", title: "En-tête", type: "sectionHead", group: "faq" }),
    defineField({
      name: "faqItems",
      title: "Questions",
      type: "array",
      of: [{ type: "faqItem" }],
      group: "faq"
    }),

    /* ---------- Appel à l'action ---------- */
    defineField({ name: "deploy", title: "Appel à l'action final", type: "deployBlock", group: "faq" }),

    /* ---------- Référencement ---------- */
    defineField({ name: "seo", title: "Référencement", type: "seoBlock", group: "seo" }),

    /* ---------- Traductions des champs du héros ---------- */
    defineField({ name: "heroCaptionEn", title: "Légende (EN)", type: "string", fieldset: "en", group: "hero" }),
    defineField({ name: "heroTitleTopEn", title: "Titre 1re ligne (EN)", type: "string", fieldset: "en", group: "hero" }),
    defineField({ name: "heroTitleBottomEn", title: "Titre 2e ligne (EN)", type: "string", fieldset: "en", group: "hero" }),
    defineField({ name: "heroSubEn", title: "Introduction (EN)", type: "text", rows: 4, fieldset: "en", group: "hero" }),
    defineField({
      name: "metricsEn",
      title: "Trois repères (EN)",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "en",
      group: "hero",
      validation: (rule) => rule.max(3)
    }),
    defineField({ name: "heroCtaPrimaryEn", title: "Bouton principal (EN)", type: "string", fieldset: "en", group: "hero" }),
    defineField({ name: "heroCtaSecondaryEn", title: "Bouton secondaire (EN)", type: "string", fieldset: "en", group: "hero" }),
    defineField({ name: "heroScrollHintEn", title: "Invitation à défiler (EN)", type: "string", fieldset: "en", group: "hero" }),
    defineField({ name: "catalogNoteEn", title: "Mention de droite (EN)", type: "string", fieldset: "en", group: "catalog" }),
    defineField({ name: "catalogFootLabelEn", title: "Lien du bas (EN)", type: "string", fieldset: "en", group: "catalog" }),
    defineField({ name: "atelierStatementEn", title: "Phrase forte (EN)", type: "string", fieldset: "en", group: "atelier" }),
    defineField({ name: "atelierStatementAccentEn", title: "Fin de la phrase forte (EN)", type: "string", fieldset: "en", group: "atelier" }),
    defineField({ name: "atelierTextEn", title: "Paragraphe (EN)", type: "text", rows: 4, fieldset: "en", group: "atelier" }),
    defineField({ name: "atelierCtaLabelEn", title: "Bouton (EN)", type: "string", fieldset: "en", group: "atelier" }),
    defineField({ name: "careNoteEn", title: "Mot de la fin (EN)", type: "text", rows: 3, fieldset: "en", group: "care" })
  ],
  preview: {
    prepare: () => ({ title: "Page d'accueil" })
  }
});
