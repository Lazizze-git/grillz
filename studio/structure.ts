/* Les icônes s'importent une par une : la racine du paquet n'en exporte
   aucune, et tout charger alourdirait l'espace d'édition pour rien. */
import { CogIcon } from "@sanity/icons/Cog";
import { DiamondIcon } from "@sanity/icons/Diamond";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { HomeIcon } from "@sanity/icons/Home";
import { ImagesIcon } from "@sanity/icons/Images";
import { ListIcon } from "@sanity/icons/List";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import type { StructureResolver } from "sanity/structure";

type Builder = Parameters<StructureResolver>[0];
type Icon = typeof HomeIcon;

/**
 * Une page du site : un document unique, qu'on ouvre directement.
 * L'identifiant du document est celui de son type — il n'y en a qu'un.
 */
const page = (S: Builder, id: string, title: string, icon: Icon) =>
  S.listItem()
    .id(id)
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(id).title(title));

/** Menu de gauche du Studio, dans l'ordre des pages du site. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenu du site")
    .items([
      page(S, "homePage", "Page d'accueil", HomeIcon),
      page(S, "craftPage", "Page Savoir-faire", SparklesIcon),
      page(S, "processPage", "Page Processus", ListIcon),
      page(S, "galleryPage", "Page Galerie", ImagesIcon),
      page(S, "contactPage", "Page Contact", EnvelopeIcon),
      S.divider(),
      S.documentTypeListItem("piece").title("Créations (galerie)").icon(DiamondIcon),
      S.divider(),
      page(S, "siteSettings", "Réglages du site", CogIcon)
    ]);
