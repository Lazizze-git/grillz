import { defineField, defineType } from "sanity";

/** Page d'accueil : la grande photo du haut et les textes qui l'entourent. */
export const homePage = defineType({
  name: "homePage",
  title: "Page d'accueil",
  type: "document",
  fieldsets: [
    {
      name: "en",
      title: "Traduction anglaise (facultatif)",
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: "heroImage",
      title: "Grande photo du haut",
      type: "image",
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
      description: "Ex. : Porté // Atelier Lausanne"
    }),
    defineField({
      name: "heroTitleTop",
      title: "Titre — première ligne",
      type: "string",
      description: "Ex. : Façonné pour"
    }),
    defineField({
      name: "heroTitleBottom",
      title: "Titre — seconde ligne",
      type: "string",
      description: "Ex. : une seule bouche."
    }),
    defineField({
      name: "heroSub",
      title: "Paragraphe d'introduction",
      type: "text",
      rows: 4
    }),
    defineField({
      name: "metrics",
      title: "Trois repères",
      type: "array",
      of: [{ type: "string" }],
      description: "Ex. : Dès 170 CHF · 2–4 semaines · Envoi international",
      validation: (rule) => rule.max(3)
    }),

    defineField({ name: "heroCaptionEn", title: "Légende (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "heroTitleTopEn", title: "Titre 1re ligne (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "heroTitleBottomEn", title: "Titre 2e ligne (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "heroSubEn", title: "Introduction (EN)", type: "text", rows: 4, fieldset: "en" }),
    defineField({
      name: "metricsEn",
      title: "Trois repères (EN)",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "en",
      validation: (rule) => rule.max(3)
    })
  ],
  preview: {
    prepare: () => ({ title: "Page d'accueil" })
  }
});
