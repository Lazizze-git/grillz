import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "64jkc7yr",
    dataset: "production"
  },
  /* Adresse du Studio en ligne : https://maison-alliani.sanity.studio */
  studioHost: "maison-alliani",
  deployment: {
    appId: "matiwulqbe7emdz2juq4gwu4"
  },
  autoUpdates: true
});
