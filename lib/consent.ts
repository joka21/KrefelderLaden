/**
 * Zentrale Stelle für einwilligungspflichtige Skripte.
 *
 * STAND: noch ohne Funktion. In dieser Phase gibt es kein Einwilligungsbanner
 * und keine einwilligungspflichtigen Skripte. Matomo läuft ohne Cookies
 * (disableCookies) und wird nicht hierüber geladen (components/matomo.tsx).
 *
 * Später gilt: Jedes Skript, das eine Einwilligung braucht (z. B. Google Ads,
 * eingebettete Karten oder Videos), wird ausschließlich über diese Datei
 * registriert und erst nach Einwilligung geladen. Komponenten binden solche
 * Skripte nie direkt ein.
 *
 * Geplanter Ablauf:
 * 1. Ein Einwilligungsbanner speichert die Auswahl je Kategorie
 *    (z. B. in localStorage, ohne Drittanbieter).
 * 2. `hasConsent(category)` liefert die gespeicherte Auswahl.
 * 3. `registerConsentScript()` lädt das Skript, sobald die Einwilligung für
 *    seine Kategorie vorliegt – sofort oder nach späterer Zustimmung.
 * 4. Ein Widerruf entfernt die Skripte bzw. lädt die Seite neu.
 */

export type ConsentCategory = "statistics" | "marketing" | "external-media";

export interface ConsentScript {
  /** Eindeutiger Name, z. B. „google-ads“. */
  id: string;
  category: ConsentCategory;
  /** Lädt das Skript (wird erst nach Einwilligung aufgerufen). */
  load: () => void;
}

/** Liegt eine Einwilligung für die Kategorie vor? Noch ohne Funktion: immer false. */
export function hasConsent(category: ConsentCategory): boolean {
  void category;
  return false;
}

/** Registriert ein einwilligungspflichtiges Skript. Noch ohne Funktion: lädt nichts. */
export function registerConsentScript(script: ConsentScript): void {
  void script;
}
