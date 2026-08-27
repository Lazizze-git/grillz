import { careColumn } from "./careColumn";
import { careItem } from "./careItem";
import { choiceOption } from "./choiceOption";
import { deployBlock } from "./deployBlock";
import { faqItem } from "./faqItem";
import { flowStep } from "./flowStep";
import { formStep } from "./formStep";
import { interlude } from "./interlude";
import { materialCard } from "./materialCard";
import { pageHead } from "./pageHead";
import { pathway } from "./pathway";
import { processStep } from "./processStep";
import { sectionHead } from "./sectionHead";
import { seoBlock } from "./seoBlock";
import { siteImage } from "./siteImage";
import { specGroup } from "./specGroup";
import { specRow } from "./specRow";

/** Briques réutilisées par plusieurs pages. */
export const objectTypes = [
  siteImage,
  seoBlock,
  pageHead,
  sectionHead,
  deployBlock,
  flowStep,
  specRow,
  careItem,
  careColumn,
  specGroup,
  faqItem,
  pathway,
  interlude,
  materialCard,
  processStep,
  choiceOption,
  formStep
];
