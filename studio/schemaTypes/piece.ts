import { defineField, defineType } from "sanity";

/** Une création : ce qui alimente la galerie et le catalogue de l'accueil. */
export const piece = defineType({
  name: "piece",
  title: "Création",
  type: "document",
  fieldsets: [
    {
      name: "en",
      title: "Traduction anglaise (facultatif)",
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({
      name: "name",
      title: "Nom de la pièce",
      type: "string",
      description: "Ex. : Aurum, Onyx, Le Croc",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "ref",
      title: "Référence",
      type: "string",
      description: "Ex. : MA-01",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      description:
        "La première photo représente la pièce sur l'accueil. Chaque photo apparaît comme une vue dans la galerie.",
      of: [{ type: "pieceImage" }],
      validation: (rule) => rule.min(1)
    }),
    defineField({
      name: "categories",
      title: "Catégories",
      type: "array",
      description: "Sert aux filtres de la galerie.",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Or", value: "or" },
          { title: "Diamants", value: "diamants" },
          { title: "Pleine bouche", value: "complet" },
          { title: "Dents individuelles", value: "individuelles" },
          { title: "Custom", value: "custom" }
        ]
      },
      validation: (rule) => rule.min(1)
    }),
    defineField({
      name: "tag",
      title: "Étiquette courte",
      type: "string",
      description: "Affichée sous la photo dans la galerie. Ex. : Argent & Or 18K"
    }),
    defineField({
      name: "material",
      title: "Matériau",
      type: "string",
      description: "Ex. : Argent 925 & Or 18K"
    }),
    defineField({
      name: "teeth",
      title: "Pièces",
      type: "string",
      description: "Ex. : Pleine bouche · 16 dents"
    }),
    defineField({
      name: "duration",
      title: "Fabrication",
      type: "string",
      description: "Ex. : 3 semaines"
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      description: "Ex. : Poli miroir, dent en or"
    }),
    defineField({
      name: "featured",
      title: "Afficher dans le catalogue de l'accueil",
      type: "boolean",
      initialValue: true
    }),
    defineField({
      name: "order",
      title: "Ordre d'affichage",
      type: "number",
      description: "Les plus petits nombres apparaissent en premier."
    }),

    defineField({ name: "tagEn", title: "Étiquette (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "materialEn", title: "Matériau (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "teethEn", title: "Pièces (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "durationEn", title: "Fabrication (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "styleEn", title: "Style (EN)", type: "string", fieldset: "en" })
  ],
  orderings: [
    {
      title: "Ordre d'affichage",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }]
    }
  ],
  preview: {
    select: { title: "name", subtitle: "ref", media: "images.0.asset" }
  }
});
