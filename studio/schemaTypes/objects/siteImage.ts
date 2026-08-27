import { defineField, defineType } from "sanity";

/**
 * Une photo du site, avec sa description obligatoire.
 * Le point de recadrage se règle en cliquant sur l'image dans le Studio.
 */
export const siteImage = defineType({
  name: "siteImage",
  title: "Photo",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Description de la photo",
      type: "string",
      description: "Lue par Google et par les lecteurs d'écran.",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "altEn", title: "Description (EN)", type: "string" })
  ],
  preview: { select: { title: "alt", media: "asset" } }
});
