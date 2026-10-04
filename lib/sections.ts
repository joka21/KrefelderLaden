/**
 * Die drei Bereiche und die Navigation. Ein Eintrag erscheint nur, wenn sein
 * Zielpfad veröffentlicht ist (Prüfung über /paths, siehe lib/kls.ts).
 */

export type SectionColor = "green" | "orange" | "berry";

export interface Section {
  path: string;
  label: string;
  color: SectionColor;
}

export const SECTIONS: readonly Section[] = [
  { path: "/einkaufen/", label: "Einkaufen", color: "green" },
  { path: "/hilfe/", label: "Hilfe finden", color: "orange" },
  { path: "/krefeld-entdecken/", label: "Krefeld entdecken", color: "berry" },
];

export const RATGEBER_PATH = "/ratgeber/";

export const LEGAL_LINKS = [
  { path: "/impressum/", label: "Impressum" },
  { path: "/datenschutz/", label: "Datenschutz" },
] as const;

/**
 * Schwerpunktthema: hervorgehobener Hinweis auf der Startseite zwischen
 * Einleitung und Kacheln. Erscheint nur, wenn der Pfad veröffentlicht ist
 * (/paths). Für ein neues Thema nur diese drei Werte ändern.
 */
export const FEATURE = {
  path: "/weihnachten-in-krefeld/",
  heading: "Weihnachten in Krefeld",
  text: "Weihnachtsmärkte, Geschenke aus der Stadt und Aktionen der Vereine im Überblick.",
} as const;

/** Bereiche, deren Zielpfad veröffentlicht ist. */
export function visibleSections(published: Set<string>): Section[] {
  return SECTIONS.filter((section) => published.has(section.path));
}
