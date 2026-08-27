import { defineField, defineType } from "sanity";

/** Le grand appel à l'action qui ferme une page. */
export const deployBlock = defineType({
  name: "deployBlock",
  title: "Appel à l'action",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "id",
      title: "Intitulé court",
      type: "string",
      description: "Ex. : 07 // Sur mesure"
    }),
    defineField({ name: "title", title: "Titre", type: "string" }),
    defineField({ name: "titleAccent", title: "Suite du titre (en gris)", type: "string" }),
    defineField({ name: "primaryLabel", title: "Bouton principal", type: "string" }),
    defineField({ name: "secondaryLabel", title: "Bouton secondaire", type: "string" }),

    defineField({ name: "idEn", title: "Intitulé court (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleAccentEn", title: "Suite du titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "primaryLabelEn", title: "Bouton principal (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "secondaryLabelEn", title: "Bouton secondaire (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "id" } }
});
