/**
 * Die drei Bereiche und die Navigation. Ein Eintrag erscheint nur, wenn sein
 * Zielpfad veröffentlicht ist (Prüfung über /paths, siehe lib/kls.ts).
 */

import { HILFE_PATH, hasEinrichtungen } from "@/lib/hilfe";
import { getPublishedPaths } from "@/lib/kls";

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
  path: "/weihnachtsmaerkte-in-krefeld/",
  heading: "Weihnachtsmärkte in Krefeld",
  text: "Termine, Orte und Öffnungszeiten der Märkte in der Stadt.",
} as const;

/** Bereiche, deren Zielpfad veröffentlicht ist. */
export function visibleSections(published: Set<string>): Section[] {
  return SECTIONS.filter((section) => published.has(section.path));
}

/**
 * Veröffentlichte Pfade (/paths) plus „Hilfe finden“ (/hilfe/), sobald es
 * mindestens eine veröffentlichte Einrichtung gibt – die Seite kommt aus dem
 * Frontend, nicht aus WordPress.
 */
export async function getPublishedSectionPaths(): Promise<Set<string>> {
  const [published, hilfe] = await Promise.all([getPublishedPaths(), hasEinrichtungen()]);
  if (hilfe) {
    published.add(HILFE_PATH);
  }
  return published;
}
