import { defineField, defineType } from "sanity";

/** Une photo de création, avec sa description et sa légende de vue. */
export const pieceImage = defineType({
  name: "pieceImage",
  title: "Photo",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Description de la photo",
      type: "string",
      description:
        "Lue par les malvoyants et par Google. Ex. : Grillz pleine bouche en argent poli avec une dent en or.",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "label",
      title: "Nom de la vue",
      type: "string",
      description:
        "Facultatif. Précise l'angle quand la pièce a plusieurs photos. Ex. : Profil, Revers."
    }),
    defineField({ name: "altEn", title: "Description (EN)", type: "string" }),
    defineField({ name: "labelEn", title: "Nom de la vue (EN)", type: "string" })
  ],
  preview: {
    select: { title: "alt", subtitle: "label", media: "asset" }
  }
});
