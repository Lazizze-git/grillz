import { defineField, defineType } from "sanity";

/** Photo pleine largeur qui coupe la page, avec ses deux mentions en bas. */
export const interlude = defineType({
  name: "interlude",
  title: "Photo de respiration",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({ name: "image", title: "Photo", type: "siteImage" }),
    defineField({
      name: "left",
      title: "Mention de gauche",
      type: "string",
      description: "Ex. : Atelier · Lausanne"
    }),
    defineField({
      name: "right",
      title: "Mention de droite",
      type: "string",
      description: "Ex. : Empreinte → façonnage → livraison"
    }),

    defineField({ name: "leftEn", title: "Mention de gauche (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "rightEn", title: "Mention de droite (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "left", subtitle: "right", media: "image" } }
});
