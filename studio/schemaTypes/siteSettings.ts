import { defineField, defineType } from "sanity";

/** Réglages communs à toutes les pages : coordonnées et disponibilité. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Réglages du site",
  type: "document",
  fieldsets: [
    {
      name: "en",
      title: "Traduction anglaise (facultatif)",
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    defineField({ name: "email", title: "Adresse e-mail", type: "string" }),
    defineField({
      name: "phone",
      title: "Téléphone affiché",
      type: "string",
      description: "Ex. : 079 456 14 03"
    }),
    defineField({
      name: "phoneLink",
      title: "Téléphone au format international",
      type: "string",
      description: "Sert au clic depuis un mobile. Ex. : +41794561403"
    }),
    defineField({
      name: "addressLine1",
      title: "Adresse — ligne 1",
      type: "string",
      description: "Ex. : Av. de Sévelin 36"
    }),
    defineField({
      name: "addressLine2",
      title: "Adresse — ligne 2",
      type: "string",
      description: "Ex. : 1004 Lausanne, Suisse"
    }),
    defineField({ name: "instagram", title: "Lien Instagram", type: "url" }),
    defineField({
      name: "bookingOpen",
      title: "Carnet de commandes ouvert",
      type: "boolean",
      description: "Décochez pour afficher que le carnet est fermé.",
      initialValue: true
    }),
    defineField({
      name: "bookingLabel",
      title: "Texte du statut",
      type: "string",
      description: "Ex. : Carnet ouvert"
    }),

    defineField({ name: "bookingLabelEn", title: "Texte du statut (EN)", type: "string", fieldset: "en" })
  ],
  preview: {
    prepare: () => ({ title: "Réglages du site" })
  }
});
