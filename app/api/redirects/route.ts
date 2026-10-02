import { getRedirects } from "@/lib/kls";

/**
 * GET /api/redirects – Weiterleitungen für proxy.ts.
 *
 * Die Daten liegen im Next.js-Cache (Tag „kls:redirects“) und werden von
 * /api/revalidate geleert. Proxy und Seiten teilen sich keinen Speicher, daher
 * holt proxy.ts die Liste über diese Route.
 */
export async function GET() {
  try {
    const items = (await getRedirects()).map(({ source, destination, status_code }) => ({
      source,
      destination,
      status_code,
    }));
    return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Weiterleitungen:", error);
    return Response.json({ items: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
