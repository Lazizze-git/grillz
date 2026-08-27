import { defineField, defineType } from "sanity";

/** Le titre d'une des cinq étapes du formulaire de contact. */
export const formStep = defineType({
  name: "formStep",
  title: "Étape du formulaire",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "num",
      title: "Intitulé de l'étape",
      type: "string",
      description: "Ex. : Étape 01// Qui êtes-vous ?"
    }),
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      description: "Ex. : Faisons connaissance."
    }),

    defineField({ name: "numEn", title: "Intitulé (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "num" } }
});
