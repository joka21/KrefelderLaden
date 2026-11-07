/**
 * Event-JSON-LD für Termine (Weihnachtsmärkte, Trödelmärkte). Ort und
 * Zeitzone kommen aus lib/stadt.ts. Felder ohne Wert fehlen im Ergebnis;
 * nichts wird ergänzt, was die Daten nicht hergeben.
 */

import { STADT } from "../stadt.ts";

export type EventStatus = "abgesagt" | "verschoben";

export interface EventDaten {
  id: string;
  name: string;
  description?: string | null;
  /** Erster Tag, JJJJ-MM-TT. */
  datum: string;
  /** Beginn am ersten Tag, HH:MM; ohne Angabe nur das Datum. */
  beginn?: string;
  /** Letzter Tag bei mehrtägigen Terminen, JJJJ-MM-TT. */
  bisDatum?: string;
  /** Ende am letzten Tag (bzw. am einzigen Tag), HH:MM. */
  ende?: string;
  status?: EventStatus;
  url: string;
  /** Offizielle Website des Termins. */
  website?: string;
  image?: string;
  ort: { name: string; strasse?: string; plz?: string; lat?: string; lon?: string };
  veranstalter?: { name: string; url?: string; person?: boolean };
  eintrittFrei?: boolean;
}

const STATUS_URL: Record<EventStatus | "geplant", string> = {
  geplant: "https://schema.org/EventScheduled",
  abgesagt: "https://schema.org/EventCancelled",
  verschoben: "https://schema.org/EventPostponed",
};

/** Zeitpunkt mit Offset der Zeitzone der Stadt, z. B. 2026-11-07T07:00:00+01:00. */
export function zeitMitOffset(datum: string, hhmm: string, zeitzone: string = STADT.zeitzone): string {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: zeitzone, timeZoneName: "longOffset" })
    .formatToParts(new Date(`${datum}T${hhmm}:00Z`))
    .find(({ type }) => type === "timeZoneName")?.value;
  const offset = name?.replace("GMT", "") || "+00:00";
  return `${datum}T${hhmm}:00${offset}`;
}

const zeitpunkt = (datum: string, hhmm?: string) => (hhmm ? zeitMitOffset(datum, hhmm) : datum);

export function eventSchema(daten: EventDaten) {
  const letzterTag = daten.bisDatum ?? daten.datum;
  const { ort, veranstalter } = daten;
  return {
    "@type": "Event",
    "@id": daten.id,
    name: daten.name,
    ...(daten.description ? { description: daten.description } : {}),
    startDate: zeitpunkt(daten.datum, daten.beginn),
    ...(daten.bisDatum || daten.ende ? { endDate: zeitpunkt(letzterTag, daten.ende) } : {}),
    eventStatus: STATUS_URL[daten.status ?? "geplant"],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: daten.url,
    ...(daten.website ? { sameAs: daten.website } : {}),
    ...(daten.image ? { image: daten.image } : {}),
    location: {
      "@type": "Place",
      name: ort.name,
      address: {
        "@type": "PostalAddress",
        ...(ort.strasse ? { streetAddress: ort.strasse } : {}),
        ...(ort.plz ? { postalCode: ort.plz } : {}),
        addressLocality: STADT.name,
        addressCountry: STADT.land,
      },
      ...(ort.lat && ort.lon ? { geo: { "@type": "GeoCoordinates", latitude: Number(ort.lat), longitude: Number(ort.lon) } } : {}),
    },
    ...(veranstalter
      ? {
          organizer: {
            "@type": veranstalter.person ? "Person" : "Organization",
            name: veranstalter.name,
            ...(veranstalter.url ? { url: veranstalter.url } : {}),
          },
        }
      : {}),
    ...(daten.eintrittFrei ? { isAccessibleForFree: true } : {}),
  };
}
