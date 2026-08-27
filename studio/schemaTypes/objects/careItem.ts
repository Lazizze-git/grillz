import { defineField, defineType } from "sanity";

/** Un conseil d'entretien ou une garantie : un intitulé fort, une précision. */
export const careItem = defineType({
  name: "careItem",
  title: "Point",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "title",
      title: "Intitulé",
      type: "string",
      description: "Ex. : Port — max 8 h / jour",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "text", title: "Précision", type: "text", rows: 2 }),

    defineField({ name: "titleEn", title: "Intitulé (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "textEn", title: "Précision (EN)", type: "text", rows: 2, fieldset: "en" })
  ],
  preview: { select: { title: "title", subtitle: "text" } }
});
