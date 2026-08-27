import { defineField, defineType } from "sanity";

/** Une colonne de la section « Entretien & garanties ». */
export const careColumn = defineType({
  name: "careColumn",
  title: "Colonne",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titre de la colonne",
      type: "string",
      description: "Ex. : Entretien",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "items", title: "Points", type: "array", of: [{ type: "careItem" }] }),

    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "title" } }
});
