import "server-only";

import { load } from "cheerio";

import { relativeSrcset, relativeUpload } from "@/lib/urls";

/**
 * Bereitet das HTML aus dem Block-Editor für die Ausgabe vor (HTML-Parser,
 * keine regulären Ausdrücke auf HTML):
 *
 * - absolute Upload-URLs der WordPress-Domain (src, srcset, Links auf Dateien)
 *   werden zu relativen Pfaden /wp-content/uploads/…
 * - Bilder erhalten loading="lazy" und decoding="async"; width und height
 *   bleiben, soweit geliefert, erhalten
 * - Überschriften der Ebene 1 im Inhalt werden zu Ebene 2 (die Seite hat genau
 *   eine H1: den Titel)
 */
export function prepareContent(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const $ = load(html, null, false);

  $("img").each((_, element) => {
    const img = $(element);
    const src = img.attr("src");
    const srcset = img.attr("srcset");

    if (src) img.attr("src", relativeUpload(src));
    if (srcset) img.attr("srcset", relativeSrcset(srcset));
    img.attr("loading", "lazy");
    img.attr("decoding", "async");
  });

  $("source[srcset]").each((_, element) => {
    const source = $(element);
    source.attr("srcset", relativeSrcset(source.attr("srcset") ?? ""));
  });

  $("a[href]").each((_, element) => {
    const link = $(element);
    link.attr("href", relativeUpload(link.attr("href") ?? ""));
  });

  $("h1").each((_, element) => {
    element.tagName = "h2";
  });

  return $.html();
}
