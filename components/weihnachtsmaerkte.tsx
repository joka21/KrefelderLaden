import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/env";
import { getPosts, getSettings } from "@/lib/kls";
import { defaultMetadata, defaultSchema } from "@/lib/seo";
import {
  FRAGEN,
  MAERKTE,
  MAERKTE_BESCHREIBUNG,
  MAERKTE_H1,
  MAERKTE_PATH,
  MAERKTE_TITEL,
  STAND,
  weihnachtsmaerkteSchema,
  type Markt,
} from "@/lib/weihnachtsmaerkte";

/** Überschriften dieser Seite: grüner Hintergrund, weiße Schrift (Kontrast 4,73:1). */
const GRUEN_H1 = "rounded-md bg-green px-4 py-3 text-3xl text-white sm:text-4xl";
const GRUEN_H2 = "rounded-md bg-green px-4 py-2.5 text-2xl text-white";
const GRUEN_H3 = "rounded-md bg-green px-4 py-2 text-lg text-white";

const TEXT_LINK = "text-green underline underline-offset-4 hover:text-green-dark";

const GUT_ZU_WISSEN = [
  {
    titel: "Zwei Märkte an der Dionysiuskirche:",
    text: "MIKS und der Crefelder Weihnachtsmarkt liegen nebeneinander rund um die Alte Kirche, haben aber verschiedene Veranstalter und eigene Öffnungszeiten.",
  },
  {
    titel: "Totensonntag, 22. November:",
    text: "Am stillen Feiertag ist auf den Märkten in der Regel Ruhe. Plane deinen Besuch lieber für das Wochenende davor oder danach.",
  },
  {
    titel: "Nur an einem Wochenende:",
    text: "Bruckhausen, Oppum, Traar, Schinkenplatz, Uerdingen, Linn, der Besondere Weihnachtsmarkt, Hüls und Fischeln sind kurz da. Wer sie sehen will, trägt sie sich am besten gleich ein.",
  },
  {
    titel: "Noch mehr Advent in Krefeld:",
    text: "Am 5. Dezember fährt der Schluff als Nikolausfahrt ab Nordbahnhof, und vom 17. Dezember bis 3. Januar 2027 gastiert der Krefelder Weihnachtscircus an der Uerdinger Straße.",
  },
];

function Angabe({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline font-bold">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}

function MarktBlock({ markt, passend }: { markt: Markt; passend?: { title: string; path: string } }) {
  return (
    <article>
      <h3 className={GRUEN_H3}>{markt.name}</h3>
      <dl className="mt-3 space-y-1 leading-relaxed">
        <Angabe label="Wann">{markt.wann}</Angabe>
        {markt.uhrzeit ? <Angabe label="Uhrzeit">{markt.uhrzeit}</Angabe> : null}
        <Angabe label="Wo">{markt.wo}</Angabe>
        {markt.veranstalter ? <Angabe label="Veranstalter">{markt.veranstalter}</Angabe> : null}
        {markt.eintritt ? <Angabe label="Eintritt">{markt.eintritt}</Angabe> : null}
      </dl>
      <p className="mt-3 leading-relaxed">{markt.text}</p>
      {passend ? (
        <p className="mt-3 leading-relaxed">
          Passend dazu:{" "}
          <Link href={passend.path} className={TEXT_LINK}>
            {passend.title}
          </Link>
        </p>
      ) : null}
    </article>
  );
}

export async function weihnachtsmaerkteMetadata(): Promise<Metadata> {
  return defaultMetadata(await getSettings(), {
    title: MAERKTE_TITEL,
    description: MAERKTE_BESCHREIBUNG,
    path: MAERKTE_PATH,
  });
}

/** Hauptseite der Märkte unter /weihnachtsmaerkte-in-krefeld/. */
export async function WeihnachtsmaerkteSeite() {
  const [settings, { items }] = await Promise.all([getSettings(), getPosts(100)]);
  // Der Beitrag zu Linn erscheint am 3.11.; der Link kommt von selbst, sobald er veröffentlicht ist.
  const kaffeeInLinn = items.find((post) => /kaffee in linn/i.test(post.title));
  const schema = defaultSchema(settings, { name: MAERKTE_TITEL, path: MAERKTE_PATH });

  return (
    <div className="mx-auto max-w-6xl px-5 pb-4 pt-10 sm:px-8 sm:pt-14">
      <JsonLd data={weihnachtsmaerkteSchema(schema, siteUrl() + MAERKTE_PATH)} />
      <h1 className={GRUEN_H1}>{MAERKTE_H1}</h1>
      <div className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed">
        <p>
          Der Unterschied zwischen Otto und mir: Otto liebt Weihnachtsmärkte, ich nicht so sehr. Dass es überall{" "}
          <Link href="/niederrhein-tapas/" className={TEXT_LINK}>
            so leckere Sachen
          </Link>{" "}
          gibt, ist Ottos Freud und mein Leid. Ich esse dann einfach zu viel und bin abends noch runder als sonst. Otto
          passiert das nicht: uralt, topfit und kein Gramm zu viel.
        </p>
        <p>
          Damit du weißt, wo es sich lohnt, hat Otto alle Weihnachtsmärkte in Krefeld 2026 für dich zusammengetragen, von
          Bruckhausen bis Fischeln.
        </p>
      </div>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Auf einen Blick</h2>
        <p className="mt-4 max-w-prose text-lg leading-relaxed">
          Die ersten Märkte starten am 20. November in den Stadtteilen, die Innenstadt folgt am 26. November und bleibt
          bis 23. Dezember.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-wash">
                <th scope="col" className="border border-line px-3 py-2">Markt</th>
                <th scope="col" className="border border-line px-3 py-2">Datum</th>
                <th scope="col" className="border border-line px-3 py-2">Stadtteil</th>
              </tr>
            </thead>
            <tbody>
              {MAERKTE.map((markt) => (
                <tr key={markt.name}>
                  <td className="border border-line px-3 py-2">{markt.kurzname ?? markt.name}</td>
                  <td className="border border-line px-3 py-2 sm:whitespace-nowrap">{markt.datum}</td>
                  <td className="border border-line px-3 py-2">{markt.stadtteil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Die Märkte im Einzelnen</h2>
        <div className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-2">
          {MAERKTE.map((markt) => (
            <MarktBlock
              key={markt.name}
              markt={markt}
              passend={markt.name === "Linner Weihnachtsmarkt" && kaffeeInLinn ? kaffeeInLinn : undefined}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Gut zu wissen</h2>
        <ul className="mt-4 max-w-prose list-disc space-y-3 pl-6 leading-relaxed">
          {GUT_ZU_WISSEN.map(({ titel, text }) => (
            <li key={titel}>
              <strong>{titel}</strong> {text}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Häufige Fragen</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 md:grid-cols-2">
          {FRAGEN.map(({ frage, antwort }) => (
            <div key={frage}>
              <h3 className={GRUEN_H3}>{frage}</h3>
              <p className="mt-3 leading-relaxed">{antwort}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Hinweis</h2>
        <p className="mt-4 max-w-prose leading-relaxed">
          Stand: geprüft am {STAND.text}. Alle Angaben ohne Gewähr. Fehlende Uhrzeiten tragen wir nach, sobald die
          Veranstalter sie veröffentlichen.
        </p>
      </section>
    </div>
  );
}
