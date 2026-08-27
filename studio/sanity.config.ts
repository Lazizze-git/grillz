import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "maison-alliani",
  title: "Maison Alliani",

  projectId: "eh6tu5mk",
  dataset: "production",

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
    /* Les pages à réglage unique n'ont qu'un seul document : elles ne doivent
       pas apparaître dans le menu « créer un document ». */
    templates: (prev) =>
      prev.filter(
        (t) =>
          ![
            "homePage",
            "craftPage",
            "processPage",
            "galleryPage",
            "contactPage",
            "siteSettings"
          ].includes(t.schemaType)
      )
  }
});
