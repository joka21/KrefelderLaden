import Link from "next/link";

/** Listeneintrag (serialisierbar, auch für den Filter im Browser). */
export interface ListEintrag {
  id: number;
  path: string;
  name: string;
  kategorie: { slug: string; name: string } | null;
  bezirk: { slug: string; name: string };
  bezirkBis2025: string;
  adresse: string;
  plz: string;
}

/**
 * Liste von Einrichtungen: Name (Link auf die Detailseite), Kategorie, Adresse,
 * Stadtbezirk mit früherem Bezirk. Die ganze Karte ist klickbar.
 */
export function EinrichtungListe({ eintraege, headingLevel = 2 }: { eintraege: ListEintrag[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {eintraege.map((eintrag) => (
        <li key={eintrag.id}>
          <article className="group relative h-full rounded-lg border border-line p-5 hover:border-green">
            <Heading className="text-lg">
              <Link
                href={eintrag.path}
                className="text-ink underline decoration-green decoration-2 underline-offset-4 after:absolute after:inset-0 group-hover:text-green"
              >
                {eintrag.name}
              </Link>
            </Heading>
            {eintrag.kategorie ? <p className="mt-1 text-sm text-muted">{eintrag.kategorie.name}</p> : null}
            <p className="mt-3">
              {eintrag.adresse}, {eintrag.plz} Krefeld
            </p>
            <p className="mt-1 text-sm">
              Stadtbezirk Krefeld-{eintrag.bezirk.name}
              {eintrag.bezirkBis2025 ? ` (bis 2025: Bezirk ${eintrag.bezirkBis2025})` : ""}
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
