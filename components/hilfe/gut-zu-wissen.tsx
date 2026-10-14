import Link from "next/link";

import type { FaqEintrag } from "@/lib/hilfe-faq";

/**
 * „Gut zu wissen“: Fragen als H3 mit Antwort. Genannte Einrichtungen sind
 * Links auf ihre Detailseite, sofern sie veröffentlicht ist (sonst Text).
 */
export function GutZuWissen({ eintraege, veroeffentlicht }: { eintraege: FaqEintrag[]; veroeffentlicht: Set<string> }) {
  if (eintraege.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="gut-zu-wissen" className="mt-10 max-w-prose rounded-lg bg-wash p-6 sm:p-8">
      <h2 id="gut-zu-wissen" className="text-2xl">
        Gut zu wissen
      </h2>
      {eintraege.map((eintrag) => (
        <div key={eintrag.frage} className="mt-6">
          <h3 className="text-lg">{eintrag.frage}</h3>
          <p className="mt-2 leading-relaxed">
            {eintrag.antwort.map((teil, index) => {
              if (typeof teil === "string") {
                return teil;
              }
              const path = `/hilfe/einrichtung/${teil.slug}/`;
              return veroeffentlicht.has(path) ? (
                <Link key={index} href={path} className="text-green underline underline-offset-4 hover:text-green-dark">
                  {teil.text}
                </Link>
              ) : (
                teil.text
              );
            })}
          </p>
        </div>
      ))}
    </section>
  );
}
