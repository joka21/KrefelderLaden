import { jsonAntwort } from "@/lib/feeds/antwort";
import { MAERKTE_FEED, MAERKTE_FEED_TITEL, MAERKTE_PATH, maerkteFeedTermine } from "@/lib/weihnachtsmaerkte";

/** Alle Weihnachtsmärkte, die noch laufen oder kommen (gleiche Daten wie /weihnachtsmaerkte-in-krefeld/). */
export const revalidate = 3600;

export function GET() {
  return jsonAntwort({ titel: MAERKTE_FEED_TITEL, seite: MAERKTE_PATH, feed: MAERKTE_FEED, termine: maerkteFeedTermine });
}
