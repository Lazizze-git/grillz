import { defineField, defineType } from "sanity";

/** Le haut d'une page intérieure : petite étiquette, grand titre, chapeau. */
export const pageHead = defineType({
  name: "pageHead",
  title: "En-tête de page",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "label",
      title: "Étiquette",
      type: "string",
      description: "Petit texte au-dessus du titre. Ex. : Galerie"
    }),
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      description: "Première partie du titre. Ex. : Nos"
    }),
    defineField({
      name: "titleAccent",
      title: "Suite du titre (en relief)",
      type: "string",
      description: "Seconde partie, affichée différemment. Ex. : créations."
    }),
    defineField({ name: "lead", title: "Chapeau", type: "text", rows: 3 }),

    defineField({ name: "labelEn", title: "Étiquette (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleAccentEn", title: "Suite du titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "leadEn", title: "Chapeau (EN)", type: "text", rows: 3, fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "label" } }
});
