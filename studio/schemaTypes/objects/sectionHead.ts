import { defineField, defineType } from "sanity";

/**
 * En-tête de section : le petit numéro, le titre en deux teintes et
 * l'éventuel paragraphe d'introduction. Réutilisé dans toutes les pages.
 */
export const sectionHead = defineType({
  name: "sectionHead",
  title: "En-tête de section",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "id",
      title: "Numéro de section",
      type: "string",
      description: "Ex. : 01 // Protocole"
    }),
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      description: "Première partie du titre, en blanc. Ex. : Quatre gestes."
    }),
    defineField({
      name: "titleAccent",
      title: "Suite du titre (en gris)",
      type: "string",
      description: "Seconde partie, affichée en gris. Ex. : Un seul protocole."
    }),
    defineField({
      name: "lead",
      title: "Paragraphe d'introduction",
      type: "text",
      rows: 3
    }),

    defineField({ name: "idEn", title: "Numéro (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleEn", title: "Titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "titleAccentEn", title: "Suite du titre (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "leadEn", title: "Introduction (EN)", type: "text", rows: 3, fieldset: "en" })
  ],
  preview: {
    select: { title: "title", subtitle: "id" }
  }
});
