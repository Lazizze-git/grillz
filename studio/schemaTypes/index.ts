import { objectTypes } from "./objects";
import { contactPage } from "./contactPage";
import { craftPage } from "./craftPage";
import { galleryPage } from "./galleryPage";
import { homePage } from "./homePage";
import { processPage } from "./processPage";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [
  homePage,
  craftPage,
  processPage,
  galleryPage,
  contactPage,
  siteSettings,
  ...objectTypes
];
