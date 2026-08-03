import type { StructureResolver } from "sanity/structure";

/**
 * Menu de gauche du Studio, pensé pour le client : les trois pages à réglage
 * unique sont des entrées directes, les créations une liste classique.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenu du site")
    .items([
      S.listItem()
        .title("Page d'accueil")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("Page Savoir-faire")
        .id("craftPage")
        .child(S.document().schemaType("craftPage").documentId("craftPage")),
      S.divider(),
      S.documentTypeListItem("piece").title("Créations (galerie)"),
      S.divider(),
      S.listItem()
        .title("Réglages du site")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings"))
    ]);
