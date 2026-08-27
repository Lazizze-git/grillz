import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { defineLocations, presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const SITE = "https://maison-alliani.com";

/** L'adresse de la page que chaque rubrique alimente. */
const PAGE_OF: Record<string, { title: string; href: string }> = {
  homePage: { title: "Page d'accueil", href: "/index.html" },
  craftPage: { title: "Page Savoir-faire", href: "/savoir-faire.html" },
  processPage: { title: "Page Processus", href: "/processus.html" },
  galleryPage: { title: "Page Galerie", href: "/galerie.html" },
  contactPage: { title: "Page Contact", href: "/contact.html" }
};

const pageLocations = Object.fromEntries(
  Object.entries(PAGE_OF).map(([type, page]) => [
    type,
    defineLocations({ locations: [page] })
  ])
);

/**
 * Les pages du site n'ont qu'un seul document chacune : elles se modifient,
 * jamais ne se créent ni ne se suppriment.
 */
const PAGES = [
  "homePage",
  "craftPage",
  "processPage",
  "galleryPage",
  "contactPage",
  "siteSettings"
];

export default defineConfig({
  name: "maison-alliani",
  title: "Maison Alliani",

  projectId: "eh6tu5mk",
  dataset: "production",

  plugins: [
    structureTool({ structure }),
    /* Le site s'affiche à côté des champs, brouillons compris : on voit ce
       qu'on modifie, et cliquer dans la page mène au champ correspondant. */
    presentationTool({
      title: "Aperçu",
      previewUrl: SITE,
      resolve: {
        locations: {
          ...pageLocations,
          /* Une création apparaît dans la galerie et sur l'accueil. */
          piece: defineLocations({
            select: { name: "name" },
            resolve: (doc) => ({
              locations: [
                { title: `Galerie — ${doc?.name ?? "création"}`, href: "/galerie.html" },
                { title: "Page d'accueil", href: "/index.html" }
              ]
            })
          }),
          /* Les réglages se retrouvent sur toutes les pages. */
          siteSettings: defineLocations({
            locations: Object.values(PAGE_OF)
          })
        }
      }
    }),
    visionTool()
  ],

  document: {
    /* Supprimer ou dupliquer la page d'accueil n'a aucun sens et la ferait
       disparaître du site : ces actions sont retirées pour ces documents. */
    actions: (prev, context) =>
      PAGES.includes(context.schemaType)
        ? prev.filter(
            (action) => !["delete", "duplicate", "unpublish"].includes(action.action ?? "")
          )
        : prev
  },

  schema: {
    types: schemaTypes,
    /* Ces mêmes pages ne doivent pas apparaître dans « créer un document ». */
    templates: (prev) => prev.filter((t) => !PAGES.includes(t.schemaType))
  }
});
