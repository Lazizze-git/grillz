import { defineField, defineType } from "sanity";

/** Une ligne « intitulé → valeur » des tableaux de caractéristiques. */
export const specRow = defineType({
  name: "specRow",
  title: "Ligne",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "label",
      title: "Intitulé",
      type: "string",
      description: "Ex. : Délai moyen",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "value",
      title: "Valeur",
      type: "string",
      description: "Ex. : 2 à 4 semaines"
    }),

    defineField({ name: "labelEn", title: "Intitulé (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "valueEn", title: "Valeur (EN)", type: "string", fieldset: "en" })
  ],
  preview: { select: { title: "label", subtitle: "value" } }
});
