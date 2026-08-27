import { defineField, defineType } from "sanity";

/** Un groupe du tableau des matières : Métaux, Finitions, Pierres. */
export const specGroup = defineType({
  name: "specGroup",
  title: "Groupe",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "label",
      title: "Nom du groupe",
      type: "string",
      description: "Ex. : Métaux",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "items",
      title: "Entrées",
      type: "array",
      of: [{ type: "careItem" }],
      description: "L'intitulé s'affiche en gras, la précision en gris à côté."
    }),

    defineField({ name: "labelEn", title: "Nom du groupe (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "label" } }
});
