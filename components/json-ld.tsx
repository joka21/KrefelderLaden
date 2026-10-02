/**
 * Genau ein JSON-LD-Block pro Seite. Das Schema der API wird unverändert
 * ausgegeben; „<“ wird maskiert, damit der Inhalt das Script-Element nicht
 * beenden kann.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
