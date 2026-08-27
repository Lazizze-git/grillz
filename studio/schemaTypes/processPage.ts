import { defineField, defineType } from "sanity";

/** Page Processus : les quatre grandes étapes illustrées et les infos pratiques. */
export const processPage = defineType({
  name: "processPage",
  title: "Page Processus",
  type: "document",
  groups: [
    { name: "head", title: "Haut de page", default: true },
    { name: "steps", title: "Étapes" },
    { name: "practical", title: "Informations pratiques" },
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
    defineField({ name: "pageHead", title: "Titres du haut de page", type: "pageHead", group: "head" }),

    defineField({
      name: "steps",
      title: "Les étapes",
      type: "array",
      of: [{ type: "processStep" }],
      group: "steps",
      description: "La numérotation « 01// » est calculée automatiquement."
    }),

    defineField({
      name: "practicalLabel",
      title: "Titre du tableau",
      type: "string",
      group: "practical",
      description: "Ex. : Informations pratiques"
    }),
    defineField({
      name: "practicalRows",
      title: "Lignes du tableau",
      type: "array",
      of: [{ type: "specRow" }],
      group: "practical"
    }),
    defineField({ name: "ctaTitle", title: "Titre de l'encart final", type: "string", group: "practical" }),
    defineField({ name: "ctaText", title: "Texte de l'encart final", type: "text", rows: 3, group: "practical" }),
    defineField({ name: "ctaLabel", title: "Bouton de l'encart final", type: "string", group: "practical" }),

    defineField({ name: "seo", title: "Référencement", type: "seoBlock", group: "seo" }),

    defineField({ name: "practicalLabelEn", title: "Titre du tableau (EN)", type: "string", fieldset: "en", group: "practical" }),
    defineField({ name: "ctaTitleEn", title: "Titre de l'encart (EN)", type: "string", fieldset: "en", group: "practical" }),
    defineField({ name: "ctaTextEn", title: "Texte de l'encart (EN)", type: "text", rows: 3, fieldset: "en", group: "practical" }),
    defineField({ name: "ctaLabelEn", title: "Bouton de l'encart (EN)", type: "string", fieldset: "en", group: "practical" })
  ],
  preview: { prepare: () => ({ title: "Page Processus" }) }
});
