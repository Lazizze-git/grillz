import { defineField, defineType } from "sanity";

/** Une des grandes étapes illustrées de la page Processus. */
export const processStep = defineType({
  name: "processStep",
  title: "Étape",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({ name: "image", title: "Photo", type: "siteImage" }),
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "text", title: "Texte", type: "text", rows: 5 }),
    defineField({
      name: "tag",
      title: "Étiquette",
      type: "string",
      description: "Petite mention sous le texte. Ex. : Sans engagement · 20 min"
    }),

    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "textEn", title: "Texte (EN)", type: "text", rows: 5, fieldset: "en" }),
    defineField({ name: "tagEn", title: "Étiquette (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "tag", media: "image" } }
});
