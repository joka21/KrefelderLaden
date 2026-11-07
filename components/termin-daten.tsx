import { siteUrl } from "@/lib/env";
import { MARKE } from "@/lib/stadt";

const TEXT_LINK = "text-green underline underline-offset-4 hover:text-green-dark";

/**
 * Hinweis auf die Termin-Feeds (app/daten): Kalender abonnieren (webcal://, öffnet
 * die Kalender-App), dieselbe Datei als .ics und die Termine als JSON.
 * `feed` ist der Pfad ohne Endung, z. B. /daten/troedelmarkt-krefeld.
 */
export function TerminDaten({ feed }: { feed: string }) {
  const ics = `${siteUrl()}${feed}.ics`;
  const webcal = ics.replace(/^https?:\/\//, "webcal://");

  return (
    <aside aria-label="Kalender und Daten" className="mt-10 rounded-lg border border-line bg-wash p-5 leading-relaxed">
      <p className="text-lg">
        <a href={webcal} className={`font-bold ${TEXT_LINK}`}>
          Kalender abonnieren
        </a>{" "}
        (<a href={ics} className={TEXT_LINK}>
          ICS-Datei
        </a>
        ) ·{" "}
        <a href={`${feed}.json`} className={`font-bold ${TEXT_LINK}`}>
          Termine als Daten
        </a>{" "}
        (JSON)
      </p>
      <p className="mt-2">
        Der Kalender aktualisiert sich jeden Tag. Andere Seiten dürfen ihn mit Quellenangabe „{MARKE.name}“ und einem Link
        auf diese Seite einbinden.
      </p>
    </aside>
  );
}
