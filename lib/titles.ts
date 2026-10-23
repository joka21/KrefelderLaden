/** Höchstlänge eines Seitentitels (Zeichen), ab der Suchmaschinen kürzen. */
export const MAX_TITLE_LENGTH = 60;

/** Ort für den kurzen Zusatz („Name – Krefeld“), wenn der Site-Name nicht mehr passt. */
const CITY = "Krefeld";

/** Mindestlänge einer gekürzten Form; kürzere (z. B. nur „SKM“) sind zu nichtssagend. */
const MIN_SHORT_LENGTH = 15;

/** Rechtsformen, die im Title wegfallen dürfen (auch mitten im Namen). */
const LEGAL_FORM = /(^|\s)(e\.\s?V\.|gGmbH|GmbH)(?=\s|,|\)|$)/gu;

const tidy = (text: string) => text.replace(/\s{2,}/gu, " ").replace(/\s+([,)])/gu, "$1").trim();

/**
 * Kürzere Formen des Namens, von der längsten zur kürzesten. Schritte nacheinander:
 * Rechtsformen (überall im Namen), Klammerzusatz am Ende, Zusatz nach „, “, „ - “,
 * „/“ oder „: “, nochmals Klammerzusatz am Ende, „Krefeld“ am Ende. Formen unter
 * MIN_SHORT_LENGTH Zeichen werden übersprungen.
 */
export function titleVariants(name: string): string[] {
  const steps = [
    (text: string) => text.replace(LEGAL_FORM, "$1"),
    (text: string) => text.replace(/\s*\([^()]*\)$/u, ""),
    (text: string) => text.replace(/(,\s|\s-\s|\/|:\s).*$/u, ""),
    (text: string) => text.replace(/\s*\([^()]*\)$/u, ""),
    (text: string) => text.replace(new RegExp(`\\s+(in\\s+)?${CITY}$`, "u"), ""),
  ];

  const variants: string[] = [];
  let current = tidy(name);
  for (const step of steps) {
    const next = tidy(step(current));
    if (next !== current && next.length >= MIN_SHORT_LENGTH) {
      current = next;
      variants.push(current);
    }
  }
  return variants;
}

/** Text am Wortende auf höchstens max Zeichen gekürzt, ohne offene Klammer und Satzzeichen am Ende. */
function cutAtWord(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  const head = text.slice(0, max + 1);
  const space = head.lastIndexOf(" ");
  let short = space > 0 ? head.slice(0, space) : text.slice(0, max);

  const open = short.lastIndexOf("(");
  if (open > 0 && !short.slice(open).includes(")")) {
    short = short.slice(0, open);
  }
  return short.replace(/[\s,;:/&(–-]+$/u, "");
}

/**
 * Seitentitel mit höchstens max Zeichen, nie gleich dem Namen (der H1).
 * Die erste passende Stufe gilt:
 * 1. „{Name} – {Site}“
 * 2. gekürzte Form des Namens (titleVariants) + „ – {Site}“
 * 3. „{Name} – Krefeld“ bzw. gekürzte Form + „ – Krefeld“ (nur ohne „Krefeld“ im Namen)
 * 4. kürzeste Form am Wortende gekürzt + „ – {Site}“
 */
export function fitTitle(
  name: string,
  site: string,
  { separator = "–", max = MAX_TITLE_LENGTH }: { separator?: string; max?: number } = {},
): string {
  const full = tidy(name);
  const siteSuffix = ` ${separator} ${site}`;
  const citySuffix = ` ${separator} ${CITY}`;
  const variants = titleVariants(full);
  const fits = (title: string) => title.length <= max;

  for (const candidate of [full, ...variants]) {
    if (fits(candidate + siteSuffix)) return candidate + siteSuffix;
  }
  for (const candidate of [full, ...variants]) {
    if (!candidate.includes(CITY) && fits(candidate + citySuffix)) return candidate + citySuffix;
  }
  return cutAtWord(variants.at(-1) ?? full, max - siteSuffix.length) + siteSuffix;
}
