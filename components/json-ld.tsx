import { serializeJsonLd } from "@/lib/json-ld";

/**
 * Genau ein JSON-LD-Block pro Seite. Das Schema der API wird unverändert
 * ausgegeben, nur „<“ maskiert (siehe lib/json-ld.ts).
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
