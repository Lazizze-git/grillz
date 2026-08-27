import type { StructureResolver } from "sanity/structure";

/**
 * Menu de gauche du Studio, pensé pour le client : une entrée par page du
 * site, les créations en liste, les réglages communs à part.
 */
const singleton = (S: Parameters<StructureResolver>[0], id: string, title: string) =>
  S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType(id).documentId(id).title(title));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenu du site")
    .items([
      singleton(S, "homePage", "Page d'accueil"),
      singleton(S, "craftPage", "Page Savoir-faire"),
      singleton(S, "processPage", "Page Processus"),
      singleton(S, "galleryPage", "Page Galerie"),
      singleton(S, "contactPage", "Page Contact"),
      S.divider(),
      S.documentTypeListItem("piece").title("Créations (galerie)"),
      S.divider(),
      singleton(S, "siteSettings", "Réglages du site")
    ]);
