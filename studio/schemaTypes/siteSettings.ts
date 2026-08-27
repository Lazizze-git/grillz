import { defineField, defineType } from "sanity";

/**
 * Réglages communs à toutes les pages : coordonnées, disponibilité,
 * menu et pied de page. Ce qui est modifié ici change partout.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Réglages du site",
  type: "document",
  groups: [
    { name: "contact", title: "Coordonnées", default: true },
    { name: "status", title: "Disponibilité" },
    { name: "nav", title: "Menu" },
    { name: "footer", title: "Pied de page" }
  ],
  fieldsets: [
    {
      name: "en",
      title: "Traduction anglaise (facultatif)",
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    /* ---------- Coordonnées ---------- */
    defineField({
      name: "email",
      title: "Adresse e-mail",
      type: "string",
      group: "contact",
      description: "Reçoit les demandes du formulaire et s'affiche sur tout le site.",
      validation: (rule) => rule.required().email()
    }),
    defineField({
      name: "phone",
      title: "Téléphone affiché",
      type: "string",
      group: "contact",
      description: "Ex. : 079 456 14 03"
    }),
    defineField({
      name: "phoneLink",
      title: "Téléphone au format international",
      type: "string",
      group: "contact",
      description: "Sert au clic depuis un mobile. Ex. : +41794561403"
    }),
    defineField({
      name: "addressLine1",
      title: "Adresse — ligne 1",
      type: "string",
      group: "contact",
      description: "Ex. : Av. de Sévelin 36"
    }),
    defineField({
      name: "addressLine2",
      title: "Adresse — ligne 2",
      type: "string",
      group: "contact",
      description: "Ex. : 1004 Lausanne, Suisse"
    }),
    defineField({ name: "instagram", title: "Lien Instagram", type: "url", group: "contact" }),
    defineField({
      name: "instagramHandle",
      title: "Pseudo Instagram affiché",
      type: "string",
      group: "contact",
      description: "Ex. : @maison_alliani"
    }),

    /* ---------- Disponibilité ---------- */
    defineField({
      name: "bookingOpen",
      title: "Carnet de commandes ouvert",
      type: "boolean",
      group: "status",
      description: "Décochez pour afficher que le carnet est fermé.",
      initialValue: true
    }),
    defineField({
      name: "bookingLabel",
      title: "Texte du statut",
      type: "string",
      group: "status",
      description: "Ex. : Carnet ouvert"
    }),
    defineField({
      name: "bookingDetail",
      title: "Précision du statut",
      type: "string",
      group: "status",
      description: "Affichée après le point médian, en haut de l'accueil. Ex. : sur rendez-vous"
    }),

    /* ---------- Menu ---------- */
    defineField({
      name: "navTagline",
      title: "Mention à côté du logo",
      type: "string",
      group: "nav",
      description: "Ex. : Atelier · CH"
    }),
    defineField({
      name: "navPlace",
      title: "Mention du bas du menu",
      type: "string",
      group: "nav",
      description: "Ex. : Lausanne · Suisse"
    }),

    /* ---------- Pied de page ---------- */
    defineField({
      name: "footerHook",
      title: "Phrase d'appel",
      type: "string",
      group: "footer",
      description: "Ex. : Une pièce unique commence par une conversation."
    }),
    defineField({
      name: "footerCta",
      title: "Bouton d'appel",
      type: "string",
      group: "footer",
      description: "Ex. : Prendre rendez-vous"
    }),
    defineField({
      name: "footerBrandText",
      title: "Présentation de la maison",
      type: "text",
      rows: 3,
      group: "footer"
    }),
    defineField({ name: "footerColExplore", title: "Titre — colonne Explorer", type: "string", group: "footer" }),
    defineField({ name: "footerColAtelier", title: "Titre — colonne Atelier", type: "string", group: "footer" }),
    defineField({ name: "footerColStatus", title: "Titre — colonne Statut", type: "string", group: "footer" }),
    defineField({
      name: "footerStatusNote",
      title: "Mention sous le statut",
      type: "string",
      group: "footer",
      description: "Ex. : Sur rendez-vous uniquement"
    }),
    defineField({
      name: "footerClockNote",
      title: "Mention à côté de l'heure",
      type: "string",
      group: "footer",
      description: "Ex. : heure de l'atelier"
    }),
    defineField({
      name: "footerLegal",
      title: "Mention légale",
      type: "string",
      group: "footer",
      description: "Placée après l'année et le nom. Ex. : Mentions légales"
    }),
    defineField({
      name: "footerCoords",
      title: "Coordonnées géographiques",
      type: "string",
      group: "footer",
      description: "Ex. : 46°31′N — 6°38′E"
    }),
    defineField({
      name: "footerMadeIn",
      title: "Mention d'origine",
      type: "string",
      group: "footer",
      description: "Ex. : Fabriqué en Suisse"
    }),

    /* ---------- Traductions ---------- */
    defineField({ name: "bookingLabelEn", title: "Texte du statut (EN)", type: "string", fieldset: "en", group: "status" }),
    defineField({ name: "bookingDetailEn", title: "Précision du statut (EN)", type: "string", fieldset: "en", group: "status" }),
    defineField({ name: "navTaglineEn", title: "Mention du logo (EN)", type: "string", fieldset: "en", group: "nav" }),
    defineField({ name: "navPlaceEn", title: "Mention du menu (EN)", type: "string", fieldset: "en", group: "nav" }),
    defineField({ name: "footerHookEn", title: "Phrase d'appel (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerCtaEn", title: "Bouton d'appel (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerBrandTextEn", title: "Présentation (EN)", type: "text", rows: 3, fieldset: "en", group: "footer" }),
    defineField({ name: "footerColExploreEn", title: "Colonne Explorer (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerColAtelierEn", title: "Colonne Atelier (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerColStatusEn", title: "Colonne Statut (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerStatusNoteEn", title: "Mention sous le statut (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerClockNoteEn", title: "Mention de l'heure (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerLegalEn", title: "Mention légale (EN)", type: "string", fieldset: "en", group: "footer" }),
    defineField({ name: "footerMadeInEn", title: "Mention d'origine (EN)", type: "string", fieldset: "en", group: "footer" })
  ],
  preview: {
    prepare: () => ({ title: "Réglages du site" })
  }
});
