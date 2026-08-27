import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "eh6tu5mk",
    dataset: "production"
  },
  /* Adresse du Studio en ligne : https://maisonalliani.sanity.studio
     L'identifiant d'application a été attribué au premier déploiement. */
  studioHost: "maisonalliani",
  deployment: {
    appId: "i9dqd48iq4wrr31algpe7z02",
    /* Studio autonome : tout son code part au déploiement, rien n'est
       récupéré à l'ouverture. Un réseau qui filtre sanity-cdn.com laisserait
       sinon l'espace d'édition tourner sans fin sur « Loading document ».
       Contrepartie : les mises à jour de Sanity arrivent au prochain
       déploiement, plus toutes seules. */
    autoUpdates: false
  }
});
