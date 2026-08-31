import { defineField, defineType } from "sanity";

/**
 * Une carte du catalogue de l'accueil. Sa photo lui appartient : la changer
 * ne touche à rien d'autre sur le site.
 */
export const catalogCard = defineType({
  name: "catalogCard",
  title: "Réalisation",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "siteImage",
      description: "Format vertical conseillé : la carte découpe en 4:5.",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "name",
      title: "Nom de la pièce",
      type: "string",
      description: "Ex. : Aurum",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "ref",
      title: "Référence",
      type: "string",
      description: "Affichée en haut de la carte. Ex. : MA-01"
    }),
    defineField({
      name: "material",
      title: "Matière",
      type: "string",
      description: "Ligne « Matière » de la carte. Ex. : Argent 925 & Or 18K"
    }),
    defineField({
      name: "duration",
      title: "Délai",
      type: "string",
      description: "Ligne « Délai » de la carte. Ex. : 3 semaines"
    }),

    defineField({ name: "materialEn", title: "Matière (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "durationEn", title: "Délai (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "name", subtitle: "ref", media: "image" } }
});
