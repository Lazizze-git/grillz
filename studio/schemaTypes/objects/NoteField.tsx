import type { FieldProps } from "sanity";

/**
 * Rend un champ « note » comme un simple encadré d'explication : ni case à
 * remplir, ni valeur enregistrée. Seuls le titre et la description écrits
 * dans le schéma s'affichent.
 *
 * Les couleurs sont celles de l'espace d'édition — reprises de ses propres
 * variables, avec une valeur de repli si elles venaient à changer de nom.
 */
export function NoteField(props: FieldProps) {
  const { title, description } = props.schemaType;

  return (
    <div
      style={{
        borderLeft: "2px solid var(--card-accent-fg-color, #8b7355)",
        background: "var(--card-muted-bg-color, rgba(127, 127, 127, 0.08))",
        borderRadius: "3px",
        padding: "12px 14px",
        margin: "4px 0"
      }}
    >
      {title ? (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1.4,
            color: "var(--card-fg-color, inherit)"
          }}
        >
          {title}
        </div>
      ) : null}
      {description ? (
        <div
          style={{
            fontSize: "13px",
            lineHeight: 1.5,
            marginTop: title ? "6px" : 0,
            color: "var(--card-muted-fg-color, inherit)"
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
