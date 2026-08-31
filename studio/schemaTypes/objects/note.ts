import { defineType } from "sanity";
import { NoteField } from "./NoteField";

/**
 * Un mode d'emploi posé au milieu des champs : il explique où se trouve
 * une chose qui ne se modifie pas à cet endroit-là. Rien n'y est saisi et
 * rien n'est enregistré — le champ n'existe que pour être lu.
 */
export const note = defineType({
  name: "note",
  title: "Note",
  type: "string",
  readOnly: true,
  components: { field: NoteField }
});
