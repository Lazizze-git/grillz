import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "maison-alliani",
  title: "Maison Alliani",

  projectId: "64jkc7yr",
  dataset: "production",

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
    /* Les réglages uniques (accueil, réglages, savoir-faire) ne doivent pas
       apparaître dans le menu « créer un document ». */
    templates: (prev) =>
      prev.filter(
        (t) => !["homePage", "siteSettings", "craftPage"].includes(t.schemaType)
      )
  }
});
