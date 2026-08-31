import { defineField, defineType } from "sanity";

/**
 * Page Galerie : seuls les textes d'habillage se règlent ici.
 * Les pièces affichées viennent de la rubrique « Créations ».
 */
export const galleryPage = defineType({
  name: "galleryPage",
  title: "Page Galerie",
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
      name: "photosNote",
      title: "Les photos de la galerie se changent dans « Créations »",
      description:
        "Chaque photo d'une création devient une vue de la grille. Ouvrez « Créations — photos du site » dans le menu de gauche : ajoutez, remplacez ou retirez une photo, et la galerie suit. Ici se règlent seulement les textes qui l'entourent.",
      type: "note"
    }),
    defineField({ name: "pageHead", title: "Titres du haut de page", type: "pageHead" }),
    defineField({
      name: "filters",
      title: "Libellés des filtres",
      type: "array",
      of: [{ type: "choiceOption" }],
      description:
        "Six filtres, dans l'ordre : Tout, Or, Diamants, Complet, Individuelles, Custom. Seul le texte affiché change ; le tri reste branché sur les catégories des créations.",
      validation: (rule) => rule.max(6)
    }),
    defineField({
      name: "countLabel",
      title: "Mot du compteur",
      type: "string",
      description: "Placé après le nombre. Ex. : vues"
    }),
    defineField({ name: "seo", title: "Référencement", type: "seoBlock" }),

    defineField({ name: "countLabelEn", title: "Mot du compteur (EN)", type: "string", fieldset: "en" })
  ],
  preview: { prepare: () => ({ title: "Page Galerie" }) }
});
