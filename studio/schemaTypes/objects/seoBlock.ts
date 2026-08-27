import { defineField, defineType } from "sanity";

/**
 * Ce que Google et les réseaux sociaux affichent pour la page.
 * Laissé vide, le texte inscrit dans la page est conservé.
 */
export const seoBlock = defineType({
  name: "seoBlock",
  title: "Référencement (Google, partages)",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titre de l'onglet",
      type: "string",
      description: "Environ 60 caractères. Ex. : Galerie des créations — Maison Alliani",
      validation: (rule) => rule.max(70).warning("Au-delà de 70 caractères, Google coupe le titre.")
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Environ 155 caractères, la phrase affichée sous le titre dans Google.",
      validation: (rule) => rule.max(170).warning("Au-delà de 170 caractères, Google coupe la description.")
    }),

    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "descriptionEn", title: "Description (EN)", type: "text", rows: 3, fieldset: "en" })
  ],
  options: { collapsible: true, collapsed: true },
  preview: { select: { title: "title" } }
});
