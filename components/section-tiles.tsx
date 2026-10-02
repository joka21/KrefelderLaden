import Link from "next/link";

import type { Section, SectionColor } from "@/lib/sections";

/*
 * Kontrastregeln: auf Grün und Beere weiße Schrift, auf Orange schwarze Schrift.
 */
const TILE_CLASSES: Record<SectionColor, string> = {
  green: "bg-green text-white hover:bg-green-dark",
  orange: "bg-orange text-ink",
  berry: "bg-berry text-white",
};

/** Kacheln der Bereiche; nur veröffentlichte Bereiche werden übergeben. */
export function SectionTiles({ sections, heading }: { sections: Section[]; heading: string }) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="bereiche" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h2 id="bereiche" className="sr-only">
        {heading}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <li key={section.path}>
            <Link
              href={section.path}
              className={`flex min-h-32 items-end rounded-lg p-6 font-heading text-2xl font-bold underline-offset-4 hover:underline ${TILE_CLASSES[section.color]}`}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
