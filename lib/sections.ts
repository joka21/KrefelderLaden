/**
 * Kacheln der Startseite, Ratgeber, Pflichtseiten und Schwerpunktthema.
 * Menü und Reihenfolge der Kategorien stehen in lib/kategorien.ts.
 */

import { menueKategorien } from "@/lib/kategorien";

export type SectionColor = "green" | "orange" | "berry";

export interface Section {
  path: string;
  label: string;
  color: SectionColor;
}

/** Kachelfarben im Wechsel: #3F8146, #A21A45, #F06C2D. */
const TILE_COLORS: readonly SectionColor[] = ["green", "berry", "orange"];

/** Kacheln der Startseite: die Kategorien des Menüs in Menü-Reihenfolge. */
export function kategorieKacheln(): Section[] {
  return menueKategorien().map(({ path, label }, index) => ({
    path,
    label,
    color: TILE_COLORS[index % TILE_COLORS.length],
  }));
}

export const RATGEBER_PATH = "/ratgeber/";

export const LEGAL_LINKS = [
  { path: "/impressum/", label: "Impressum" },
  { path: "/datenschutz/", label: "Datenschutz" },
] as const;

/**
 * Schwerpunktthema: hervorgehobener Hinweis auf der Startseite zwischen
 * Einleitung und Kacheln. Erscheint nur, wenn der Pfad veröffentlicht ist
 * (/paths) oder eine Kategorie des Menüs ist. Für ein neues Thema nur diese
 * drei Werte ändern.
 */
export const FEATURE = {
  path: "/weihnachten/",
  heading: "Weihnachtsmärkte in Krefeld",
  text: "Termine, Orte und Öffnungszeiten der Märkte in der Stadt.",
} as const;

export function featureSichtbar(published: Set<string>): boolean {
  return published.has(FEATURE.path) || menueKategorien().some(({ path }) => path === FEATURE.path);
}
