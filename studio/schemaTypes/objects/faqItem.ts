import { defineField, defineType } from "sanity";

/** Une question fréquente et sa réponse. */
export const faqItem = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  fieldsets: [
    { name: "en", title: "Traduction anglaise (facultatif)", options: { collapsible: true, collapsed: true } }
  ],
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "answer", title: "Réponse", type: "text", rows: 4 }),

    defineField({ name: "questionEn", title: "Question (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "answerEn", title: "Réponse (EN)", type: "text", rows: 4, fieldset: "en" })
  ],
  preview: { select: { title: "question", subtitle: "answer" } }
});
