import { defineField, defineType } from "sanity";

/**
 * Une vue de la galerie. Photo, textes et caractéristiques lui appartiennent :
 * elle ne dépend d'aucune autre page, et rien ne la suit ailleurs.
 */
export const galleryTile = defineType({
  name: "galleryTile",
  title: "Vue",
  type: "object",
  fieldsets: [
    { name: "specs", title: "Fiche détaillée", options: { collapsible: true, collapsed: false } },
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "image",
      title: "Photo",
      type: "siteImage",
      description: "Format vertical conseillé : la tuile découpe en 4:5.",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "name",
      title: "Nom affiché",
      type: "string",
      description: "Sous la photo. Ex. : Aurum, ou « Onyx · Profil » pour un autre angle.",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "ref",
      title: "Référence",
      type: "string",
      description: "Affichée sur la photo. Ex. : MA-01"
    }),
    defineField({
      name: "tag",
      title: "Étiquette",
      type: "string",
      description: "Petite mention à droite du nom. Ex. : Argent & Or 18K"
    }),
    defineField({
      name: "categories",
      title: "Catégories",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Décide sous quels filtres la vue apparaît. Sans catégorie, elle ne se voit que sous « Tout ».",
      options: {
        list: [
          { title: "Or", value: "or" },
          { title: "Diamants", value: "diamants" },
          { title: "Pleine bouche", value: "complet" },
          { title: "Dents individuelles", value: "individuelles" },
          { title: "Custom", value: "custom" }
        ]
      }
    }),

    /* Ce qui s'affiche quand on ouvre la vue en grand. */
    defineField({
      name: "material",
      title: "Matériau",
      type: "string",
      fieldset: "specs",
      description: "Ex. : Argent 925 & Or 18K"
    }),
    defineField({
      name: "teeth",
      title: "Pièces",
      type: "string",
      fieldset: "specs",
      description: "Ex. : Pleine bouche · 16 dents"
    }),
    defineField({
      name: "duration",
      title: "Fabrication",
      type: "string",
      fieldset: "specs",
      description: "Ex. : 3 semaines"
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      fieldset: "specs",
      description: "Ex. : Poli miroir, dent en or"
    }),

    defineField({ name: "tagEn", title: "Étiquette (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "materialEn", title: "Matériau (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "teethEn", title: "Pièces (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "durationEn", title: "Fabrication (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "styleEn", title: "Style (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "name", subtitle: "ref", media: "image" } }
});
