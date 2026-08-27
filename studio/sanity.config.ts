import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

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

  plugins: [structureTool({ structure }), visionTool()],

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
