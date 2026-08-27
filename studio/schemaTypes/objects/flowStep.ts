import { defineField, defineType } from "sanity";

/** Une étape numérotée : le numéro « 01// » est ajouté automatiquement. */
export const flowStep = defineType({
  name: "flowStep",
  title: "Étape",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "text", title: "Texte", type: "text", rows: 3 }),

    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "textEn", title: "Texte (EN)", type: "text", rows: 3, fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "text" } }
});
