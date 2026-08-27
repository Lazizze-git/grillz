import { defineField, defineType } from "sanity";

/** Une matière du carrousel de la page Savoir-faire. */
export const materialCard = defineType({
  name: "materialCard",
  title: "Matière",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({ name: "image", title: "Photo", type: "siteImage" }),
    defineField({
      name: "title",
      title: "Nom de la matière",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "text", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "cert",
      title: "Mention du bas",
      type: "string",
      description: "Ex. : Poinçon suisse"
    }),

    defineField({ name: "titleEn", title: "Nom (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "textEn", title: "Description (EN)", type: "text", rows: 3, fieldset: "en" }),
    defineField({ name: "certEn", title: "Mention du bas (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "cert", media: "image" } }
});
