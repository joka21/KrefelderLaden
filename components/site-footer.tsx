import Link from "next/link";

import { getContent, getPosts } from "@/lib/kls";
import { LEGAL_LINKS, RATGEBER_PATH } from "@/lib/sections";

/**
 * Impressum und Datenschutz – nur verlinkt, wenn veröffentlicht. Geprüft über
 * /content statt /paths, weil /paths Seiten mit noindex auslässt und die
 * Pflichtseiten sonst verschwinden könnten.
 */
async function legalLinks() {
  const results = await Promise.all(
    LEGAL_LINKS.map(async (link) => {
      try {
        return (await getContent(link.path)).found ? link : null;
      } catch (error) {
        console.error("Fußzeile:", error);
        return null;
      }
    }),
  );
  return results.filter((link) => link !== null);
}

/** „Alle Beiträge“ (Ratgeber), sobald es mindestens einen Beitrag gibt. */
async function hasPosts(): Promise<boolean> {
  try {
    return (await getPosts(1)).total > 0;
  } catch (error) {
    console.error("Fußzeile:", error);
    return false;
  }
}

export async function SiteFooter() {
  const [links, posts] = await Promise.all([legalLinks(), hasPosts()]);

  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm sm:px-8">
        <p>© Krefelder Laden</p>
        {posts ? (
          <p>
            <Link href={RATGEBER_PATH} className="text-green underline underline-offset-4 hover:text-green-dark">
              Alle Beiträge
            </Link>
          </p>
        ) : null}
        {links.length > 0 ? (
          <nav aria-label="Rechtliches">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-green underline underline-offset-4 hover:text-green-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
