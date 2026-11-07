import Link from "next/link";

import { TROEDEL_PATH } from "@/lib/troedelmaerkte";
import { MAERKTE_PATH } from "@/lib/weihnachtsmaerkte";

/** Feste Einstiege der Startseite (beide Fassungen) auf die Terminseiten; Linktexte = Suchbegriffe. */
const LINKS = [
  { path: MAERKTE_PATH, text: "Weihnachtsmärkte in Krefeld" },
  { path: TROEDEL_PATH, text: "Trödelmarkt Krefeld" },
] as const;

export function StartseiteLinks() {
  return (
    <nav aria-label="Termine in Krefeld" className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
      <ul className="flex flex-wrap gap-3">
        {LINKS.map(({ path, text }) => (
          <li key={path}>
            <Link
              href={path}
              className="inline-block rounded-md border-2 border-green px-4 py-2 text-lg font-bold text-green hover:bg-green hover:text-white"
            >
              {text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
