import { load } from "cheerio";

/**
 * Gibt es im HTML etwas zu sehen? Leere Hüllen wie „<p></p>“ oder „<p>&nbsp;</p>“
 * und Kommentare (z. B. Block-Editor) zählen nicht als Inhalt.
 */
export function hatSichtbarenInhalt(html: string): boolean {
  if (!html.trim()) {
    return false;
  }
  const $ = load(html, null, false);
  return $.root().text().trim() !== "" || $("img, picture, video, audio, iframe, svg, embed, object").length > 0;
}
