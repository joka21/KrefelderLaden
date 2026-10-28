import Link from "next/link";

import type { ListEintrag } from "@/components/hilfe/einrichtung-liste";

/**
 * Einrichtungen als orange Kacheln (Übersicht „Hilfe finden“): Name, Thema,
 * Stadtteil; die ganze Kachel führt zur Detailseite.
 *
 * Weiß auf Orange hat nur 3,05:1 – das reicht nach WCAG AA nur für große
 * Schrift (fett ab 18,66 px). Deshalb ist aller Text fett und mindestens 19 px.
 */
export function EinrichtungKacheln({ eintraege }: { eintraege: ListEintrag[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {eintraege.map((eintrag) => (
        <li key={eintrag.id}>
          <article className="group relative flex h-full flex-col rounded-lg bg-orange p-5 text-white shadow-md transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-bold text-white">
              <Link
                href={eintrag.path}
                className="underline-offset-4 after:absolute after:inset-0 after:rounded-lg group-hover:underline"
              >
                {eintrag.name}
              </Link>
            </h3>
            <p className="mt-3 text-[1.1875rem] font-bold">{eintrag.bereich.name}</p>
            <p className="mt-1 text-[1.1875rem] font-bold">Krefeld-{eintrag.bezirk.name}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
