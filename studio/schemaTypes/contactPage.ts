import { defineField, defineType } from "sanity";

/**
 * Page Contact. Les libellés du formulaire se modifient ici ; les valeurs
 * techniques envoyées à l'atelier restent inscrites dans la page, pour que le
 * formulaire continue de fonctionner quoi qu'il arrive.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Page Contact",
  type: "document",
  groups: [
    { name: "head", title: "Haut de page", default: true },
    { name: "form", title: "Formulaire" },
    { name: "choices", title: "Choix proposés" },
    { name: "aside", title: "Colonne de droite" },
    { name: "seo", title: "Référencement" }
  ],
  fieldsets: [
    {
      name: "en",
      title: "Traduction anglaise (facultatif)",
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({ name: "pageHead", title: "Titres du haut de page", type: "pageHead", group: "head" }),

    /* ---------- Formulaire ---------- */
    defineField({
      name: "steps",
      title: "Titres des cinq étapes",
      type: "array",
      of: [{ type: "formStep" }],
      group: "form",
      description:
        "Cinq étapes, dans l'ordre : identité, projet, budget, inspirations, récapitulatif.",
      validation: (rule) => rule.max(5)
    }),
    defineField({
      name: "labels",
      title: "Intitulés des champs",
      type: "array",
      of: [{ type: "specRow" }],
      group: "form",
      description:
        "Dans l'ordre d'apparition : Prénom, Pays, Email, Type de pièce, Matériau souhaité, Budget envisagé, Date souhaitée, Urgence, Photos de référence, Décrivez votre projet. La « valeur » sert de texte d'exemple à l'intérieur du champ, quand il y en a un."
    }),
    defineField({
      name: "nextLabel",
      title: "Bouton « Continuer »",
      type: "string",
      group: "form"
    }),
    defineField({
      name: "recapLabel",
      title: "Bouton « Voir le récapitulatif »",
      type: "string",
      group: "form"
    }),
    defineField({ name: "backLabel", title: "Lien « Retour »", type: "string", group: "form" }),
    defineField({ name: "submitLabel", title: "Bouton d'envoi", type: "string", group: "form" }),
    defineField({
      name: "uploadHint",
      title: "Texte de la zone de photos",
      type: "string",
      group: "form",
      description: "Ex. : Glissez vos images ou cliquez pour parcourir"
    }),
    defineField({
      name: "formNote",
      title: "Mention sous le récapitulatif",
      type: "text",
      rows: 2,
      group: "form"
    }),
    defineField({ name: "successTitle", title: "Titre du message de confirmation", type: "string", group: "form" }),
    defineField({ name: "successText", title: "Message de confirmation", type: "text", rows: 3, group: "form" }),

    defineField({
      name: "budgetMin",
      title: "Budget — minimum (CHF)",
      type: "number",
      group: "form",
      validation: (rule) => rule.min(0)
    }),
    defineField({
      name: "budgetMax",
      title: "Budget — maximum (CHF)",
      type: "number",
      group: "form",
      validation: (rule) => rule.min(0)
    }),
    defineField({
      name: "budgetStart",
      title: "Budget — valeur de départ (CHF)",
      type: "number",
      group: "form",
      description: "La position du curseur à l'ouverture du formulaire."
    }),

    /* ---------- Choix proposés ---------- */
    defineField({
      name: "pieceChoices",
      title: "Type de pièce",
      type: "array",
      of: [{ type: "choiceOption" }],
      group: "choices",
      description:
        "Quatre choix, dans l'ordre : Pleine bouche, Crocs, Individuelles, Custom. Chacun garde son pictogramme.",
      validation: (rule) => rule.max(4)
    }),
    defineField({
      name: "materialChoices",
      title: "Matériau souhaité",
      type: "array",
      of: [{ type: "choiceOption" }],
      group: "choices",
      description: "Quatre choix, dans l'ordre : Or jaune, Or blanc, Argent 925, Chrome-cobalt.",
      validation: (rule) => rule.max(4)
    }),
    defineField({
      name: "urgencyChoices",
      title: "Urgence",
      type: "array",
      of: [{ type: "choiceOption" }],
      group: "choices",
      description: "Trois choix, dans l'ordre : Flexible, Sous 1 mois, Urgent.",
      validation: (rule) => rule.max(3)
    }),

    /* ---------- Colonne de droite ---------- */
    defineField({ name: "callLabel", title: "Étiquette de l'encart appel", type: "string", group: "aside" }),
    defineField({ name: "callText", title: "Texte de l'encart appel", type: "text", rows: 2, group: "aside" }),
    defineField({ name: "callCta", title: "Bouton de l'encart appel", type: "string", group: "aside" }),
    defineField({ name: "atelierTitle", title: "Titre du bloc atelier", type: "string", group: "aside" }),
    defineField({
      name: "atelierNote",
      title: "Mention sous l'adresse",
      type: "string",
      group: "aside",
      description: "Ex. : Sur rendez-vous uniquement"
    }),
    defineField({ name: "writeTitle", title: "Titre du bloc contact", type: "string", group: "aside" }),

    defineField({ name: "seo", title: "Référencement", type: "seoBlock", group: "seo" }),

    /* ---------- Traductions ---------- */
    defineField({ name: "nextLabelEn", title: "Bouton « Continuer » (EN)", type: "string", fieldset: "en", group: "form" }),
    defineField({ name: "recapLabelEn", title: "Bouton « Récapitulatif » (EN)", type: "string", fieldset: "en", group: "form" }),
    defineField({ name: "backLabelEn", title: "Lien « Retour » (EN)", type: "string", fieldset: "en", group: "form" }),
    defineField({ name: "submitLabelEn", title: "Bouton d'envoi (EN)", type: "string", fieldset: "en", group: "form" }),
    defineField({ name: "uploadHintEn", title: "Zone de photos (EN)", type: "string", fieldset: "en", group: "form" }),
    defineField({ name: "formNoteEn", title: "Mention (EN)", type: "text", rows: 2, fieldset: "en", group: "form" }),
    defineField({ name: "successTitleEn", title: "Titre de confirmation (EN)", type: "string", fieldset: "en", group: "form" }),
    defineField({ name: "successTextEn", title: "Message de confirmation (EN)", type: "text", rows: 3, fieldset: "en", group: "form" }),
    defineField({ name: "callLabelEn", title: "Étiquette encart appel (EN)", type: "string", fieldset: "en", group: "aside" }),
    defineField({ name: "callTextEn", title: "Texte encart appel (EN)", type: "text", rows: 2, fieldset: "en", group: "aside" }),
    defineField({ name: "callCtaEn", title: "Bouton encart appel (EN)", type: "string", fieldset: "en", group: "aside" }),
    defineField({ name: "atelierTitleEn", title: "Titre bloc atelier (EN)", type: "string", fieldset: "en", group: "aside" }),
    defineField({ name: "atelierNoteEn", title: "Mention sous l'adresse (EN)", type: "string", fieldset: "en", group: "aside" }),
    defineField({ name: "writeTitleEn", title: "Titre bloc contact (EN)", type: "string", fieldset: "en", group: "aside" })
  ],
  preview: { prepare: () => ({ title: "Page Contact" }) }
});
