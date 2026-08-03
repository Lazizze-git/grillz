import { defineField, defineType } from "sanity";

/** Page Savoir-faire : photo d'en-tête et portrait de la technicienne-dentiste. */
export const craftPage = defineType({
  name: "craftPage",
  title: "Page Savoir-faire",
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
      name: "headImage",
      title: "Photo d'en-tête",
      type: "image",
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
    defineField({
      name: "portraitImage",
      title: "Photo du portrait",
      type: "image",
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
      description: "Ex. : Technique dentaire · depuis 1978"
    }),
    defineField({
      name: "portraitParagraphs",
      title: "Texte du portrait",
      type: "array",
      of: [{ type: "text", rows: 5 }],
      description: "Un bloc par paragraphe."
    }),
    defineField({
      name: "portraitQuote",
      title: "Phrase mise en avant",
      type: "text",
      rows: 3,
      description: "Sans les guillemets : ils sont ajoutés automatiquement."
    }),
    defineField({
      name: "portraitQuoteAuthor",
      title: "Signature de la phrase",
      type: "string"
    }),

    defineField({ name: "portraitCaptionEn", title: "Légende (EN)", type: "string", fieldset: "en" }),
    defineField({
      name: "portraitParagraphsEn",
      title: "Texte du portrait (EN)",
      type: "array",
      of: [{ type: "text", rows: 5 }],
      fieldset: "en"
    }),
    defineField({ name: "portraitQuoteEn", title: "Phrase mise en avant (EN)", type: "text", rows: 3, fieldset: "en" }),
    defineField({ name: "portraitQuoteAuthorEn", title: "Signature (EN)", type: "string", fieldset: "en" })
  ],
  preview: {
    prepare: () => ({ title: "Page Savoir-faire" })
  }
});
