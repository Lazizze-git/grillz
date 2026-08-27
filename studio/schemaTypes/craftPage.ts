import { defineField, defineType } from "sanity";

/**
 * Page Savoir-faire. Les champs du portrait gardent leurs noms d'origine :
 * les quatre paragraphes se répartissent à quatre endroits distincts de la
 * page (origine, transmission, puis deux dans « Aujourd'hui »), dans cet ordre.
 */
export const craftPage = defineType({
  name: "craftPage",
  title: "Page Savoir-faire",
  type: "document",
  groups: [
    { name: "head", title: "Haut de page", default: true },
    { name: "origin", title: "Origine" },
    { name: "transmission", title: "Transmission" },
    { name: "today", title: "Aujourd'hui" },
    { name: "pillars", title: "Trois piliers" },
    { name: "materials", title: "Matières" },
    { name: "gesture", title: "Le geste" },
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
    defineField({ name: "pageHead", title: "Titres du haut de page", type: "pageHead", group: "head" }),
    defineField({
      name: "headImage",
      title: "Photo d'en-tête",
      type: "image",
      group: "head",
      options: { hotspot: true },
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

    /* ---------- Origine ---------- */
    defineField({ name: "originHead", title: "En-tête", type: "sectionHead", group: "origin" }),
    defineField({
      name: "portraitImage",
      title: "Photo du portrait",
      type: "image",
      group: "origin",
      options: { hotspot: true },
      description: "Le portrait de la technicienne-dentiste, format vertical.",
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
      name: "portraitCaption",
      title: "Légende sur le portrait",
      type: "string",
      group: "origin",
      description: "Ex. : Technique dentaire · depuis 1978"
    }),
    defineField({
      name: "profileIntro",
      title: "Phrase d'accroche",
      type: "string",
      group: "origin",
      description: "Première partie, en gris. Ex. : Passion, précision,"
    }),
    defineField({
      name: "profileIntroAccent",
      title: "Fin de la phrase d'accroche",
      type: "string",
      group: "origin",
      description: "Affichée en blanc. Ex. : exigence de qualité."
    }),
    defineField({
      name: "portraitParagraphs",
      title: "Texte du portrait",
      type: "array",
      of: [{ type: "text", rows: 5 }],
      group: "origin",
      description:
        "Quatre paragraphes, dans cet ordre : origine, transmission, puis deux dans « Aujourd'hui ». Garder cet ordre."
    }),
    defineField({
      name: "creds",
      title: "Repères du portrait",
      type: "array",
      of: [{ type: "specRow" }],
      group: "origin",
      description: "Ex. : Métier → Technicienne-dentiste · depuis 1978"
    }),

    /* ---------- Transmission ---------- */
    defineField({ name: "transmissionHead", title: "En-tête", type: "sectionHead", group: "transmission" }),
    defineField({
      name: "transmissionSteps",
      title: "Rôles",
      type: "array",
      of: [{ type: "flowStep" }],
      group: "transmission"
    }),
    defineField({
      name: "portraitQuote",
      title: "Phrase mise en avant",
      type: "text",
      rows: 3,
      group: "transmission",
      description: "Sans les guillemets : ils sont ajoutés automatiquement."
    }),
    defineField({
      name: "portraitQuoteAuthor",
      title: "Signature de la phrase",
      type: "string",
      group: "transmission"
    }),

    /* ---------- Aujourd'hui ---------- */
    defineField({ name: "todayHead", title: "En-tête", type: "sectionHead", group: "today" }),
    defineField({ name: "todayImage", title: "Photo", type: "siteImage", group: "today" }),
    defineField({
      name: "todayRows",
      title: "Repères",
      type: "array",
      of: [{ type: "specRow" }],
      group: "today"
    }),

    /* ---------- Trois piliers ---------- */
    defineField({ name: "pillarsHead", title: "En-tête", type: "sectionHead", group: "pillars" }),
    defineField({
      name: "pillars",
      title: "Les trois piliers",
      type: "array",
      of: [{ type: "flowStep" }],
      group: "pillars",
      description:
        "Exactement trois : chacun garde le pictogramme dessiné dans la page (Suisse, ajustement, matériaux).",
      validation: (rule) => rule.max(3)
    }),
    defineField({
      name: "interlude",
      title: "Photo de respiration",
      type: "interlude",
      group: "pillars"
    }),

    /* ---------- Matières ---------- */
    defineField({ name: "materialsHead", title: "En-tête", type: "sectionHead", group: "materials" }),
    defineField({
      name: "materials",
      title: "Matières",
      type: "array",
      of: [{ type: "materialCard" }],
      group: "materials"
    }),

    /* ---------- Le geste ---------- */
    defineField({ name: "gestureHead", title: "En-tête", type: "sectionHead", group: "gesture" }),
    defineField({
      name: "gestureSteps",
      title: "Gestes",
      type: "array",
      of: [{ type: "flowStep" }],
      group: "gesture",
      description: "La numérotation « 01// » est calculée automatiquement."
    }),
    defineField({ name: "deploy", title: "Appel à l'action final", type: "deployBlock", group: "gesture" }),

    /* ---------- Référencement ---------- */
    defineField({ name: "seo", title: "Référencement", type: "seoBlock", group: "seo" }),

    /* ---------- Traductions ---------- */
    defineField({ name: "portraitCaptionEn", title: "Légende (EN)", type: "string", fieldset: "en", group: "origin" }),
    defineField({ name: "profileIntroEn", title: "Phrase d'accroche (EN)", type: "string", fieldset: "en", group: "origin" }),
    defineField({ name: "profileIntroAccentEn", title: "Fin de l'accroche (EN)", type: "string", fieldset: "en", group: "origin" }),
    defineField({
      name: "portraitParagraphsEn",
      title: "Texte du portrait (EN)",
      type: "array",
      of: [{ type: "text", rows: 5 }],
      fieldset: "en",
      group: "origin"
    }),
    defineField({ name: "portraitQuoteEn", title: "Phrase mise en avant (EN)", type: "text", rows: 3, fieldset: "en", group: "transmission" }),
    defineField({ name: "portraitQuoteAuthorEn", title: "Signature (EN)", type: "string", fieldset: "en", group: "transmission" })
  ],
  preview: {
    select: { media: "headImage" },
    prepare: ({ media }) => ({ title: "Page Savoir-faire", media })
  }
});
