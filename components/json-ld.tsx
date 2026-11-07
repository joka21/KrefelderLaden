import { siteUrl } from "@/lib/env";
import { serializeJsonLd } from "@/lib/json-ld";
import { mitMarke } from "@/lib/schema/marke";

/**
 * Genau ein JSON-LD-Block pro Seite. Das Schema (API oder Frontend) wird
 * unverändert ausgegeben, ergänzt nur um Logo und sameAs der Organization und
 * eine fehlende BreadcrumbList (lib/schema/marke.ts); „<“ maskiert (lib/json-ld.ts).
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(mitMarke(data, siteUrl())) }} />;
}
