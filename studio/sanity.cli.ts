import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "eh6tu5mk",
    dataset: "production"
  },
  /* Adresse du Studio en ligne : https://maison-alliani.sanity.studio
     L'identifiant d'application est écrit ici par le CLI au premier déploiement. */
  studioHost: "maison-alliani",
  deployment: {
    autoUpdates: true
  }
});
