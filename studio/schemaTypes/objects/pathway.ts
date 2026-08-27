import { defineField, defineType } from "sanity";

/** Une des deux voies : à l'atelier ou à distance. */
export const pathway = defineType({
  name: "pathway",
  title: "Voie",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "id",
      title: "Intitulé court",
      type: "string",
      description: "Ex. : Voie A // À Lausanne"
    }),
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "text", title: "Texte", type: "text", rows: 4 }),
    defineField({ name: "specs", title: "Caractéristiques", type: "array", of: [{ type: "specRow" }] }),
    defineField({
      name: "linkLabel",
      title: "Texte du lien",
      type: "string",
      description: "Mène à la page Contact. Ex. : Prendre rendez-vous →"
    }),

    defineField({ name: "idEn", title: "Intitulé court (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "textEn", title: "Texte (EN)", type: "text", rows: 4, fieldset: "en" }),
    defineField({ name: "linkLabelEn", title: "Texte du lien (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "id" } }
});
