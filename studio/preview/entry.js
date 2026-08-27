/**
 * Aperçu côte à côte dans l'espace d'édition.
 *
 * Chargé uniquement quand la page est affichée dans un cadre — jamais chez
 * un visiteur. Il fait deux choses :
 *   - il rejoue le contenu à chaque frappe, brouillons compris, à partir de
 *     ce que le Studio lui envoie. Aucune clé n'est nécessaire : les données
 *     transitent par le canal du Studio, pas par une requête authentifiée ;
 *   - il active les repères cliquables, qui mènent au champ correspondant.
 *
 * En cas de problème, la page garde le contenu publié déjà posé par
 * js/cms-content.js : l'aperçu se dégrade, il ne casse pas.
 */
import { createQueryStore } from "@sanity/core-loader";
import { createClient } from "@sanity/client";
import { enableVisualEditing } from "@sanity/visual-editing";

const config = window.CMS_CONFIG;
const query = window.CMS_QUERY;
const apply = window.cmsApplyAll;

if (!config || !query || typeof apply !== "function") {
  console.warn("[aperçu] le moteur de contenu du site n'est pas chargé");
} else {
  try {
    const client = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion.replace(/^v/, ""),
      useCdn: false,
      /* Marque invisible dans les textes : elle relie un mot affiché au
         champ qui le produit, et rend le clic-vers-le-champ possible. */
      stega: { enabled: true, studioUrl: window.SANITY_STUDIO_URL }
    });

    const store = createQueryStore({ client });
    /* Le Studio prend la main sur la récupération : c'est lui qui pousse le
       contenu, perspective comprise (brouillon ou publié). */
    store.enableLiveMode({ client });

    store.createFetcherStore(query, {}).subscribe((state) => {
      if (state.error) {
        console.warn("[aperçu] contenu indisponible :", state.error);
        return;
      }
      if (state.data) apply(state.data);
    });

    enableVisualEditing();
  } catch (err) {
    console.warn("[aperçu] désactivé :", err);
  }
}
