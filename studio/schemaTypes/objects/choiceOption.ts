import { defineField, defineType } from "sanity";

/**
 * Un choix proposé dans le formulaire de contact.
 * Seul le libellé est modifiable : la valeur technique envoyée à l'atelier
 * reste inscrite dans la page, pour ne jamais casser le formulaire.
 */
export const choiceOption = defineType({
  name: "choiceOption",
  title: "Choix",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Libellé",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "full",
      title: "Libellé du récapitulatif",
      type: "string",
      description:
        "Facultatif. La forme longue reprise dans le récapitulatif et dans l'e-mail reçu par l'atelier. Laissé vide, le libellé affiché est utilisé. Ex. : « Dents individuelles » pour le choix affiché « Individuelles »."
    }),
    defineField({ name: "labelEn", title: "Libellé (EN)", type: "string" }),
    defineField({ name: "fullEn", title: "Libellé du récapitulatif (EN)", type: "string" })
  ],
  preview: { select: { title: "label" } }
});
