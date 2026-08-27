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
    autoUpdates: true
  }
});
