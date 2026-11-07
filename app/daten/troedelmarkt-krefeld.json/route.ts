import { jsonAntwort } from "@/lib/feeds/antwort";
import { TROEDEL_FEED, TROEDEL_FEED_TITEL, TROEDEL_PATH, troedelFeedTermine } from "@/lib/troedelmaerkte";

/** Alle kommenden Trödelmarkt-Termine (gleiche Daten wie /troedelmarkt-krefeld/). */
export const revalidate = 3600;

export function GET() {
  return jsonAntwort({ titel: TROEDEL_FEED_TITEL, seite: TROEDEL_PATH, feed: TROEDEL_FEED, termine: troedelFeedTermine });
}
