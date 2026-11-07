import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ottoWeihnachten from "@/public/images/otto-weihnachten.webp";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/env";
import { getPosts, getSettings } from "@/lib/kls";
import { defaultMetadata, defaultSchema } from "@/lib/seo";
import {
  datumKurz,
  EINLEITUNG,
  FRAGEN,
  MAERKTE,
  marktAnker,
  MAERKTE_BESCHREIBUNG,
  MAERKTE_H1,
  MAERKTE_PATH,
  MAERKTE_TITEL,
  STAND,
  wannText,
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
    <article id={marktAnker(markt)} className="scroll-mt-6">
      <h3 className={GRUEN_H3}>{markt.name}</h3>
      <dl className="mt-3 space-y-1 leading-relaxed">
        <Angabe label="Wann">{wannText(markt)}</Angabe>
        {markt.uhrzeit ? <Angabe label="Uhrzeit">{markt.uhrzeit}</Angabe> : null}
        <Angabe label="Wo">{markt.wo}</Angabe>
        {markt.veranstalter ? <Angabe label="Veranstalter">{markt.veranstalter}</Angabe> : null}
        {markt.eintritt ? <Angabe label="Eintritt">{markt.eintritt}</Angabe> : null}
      </dl>
      <p className="mt-3 leading-relaxed">{markt.text}</p>
      {markt.website ? (
        <p className="mt-3">
          <a href={markt.website} className={TEXT_LINK} rel="noopener">
            Offizielle Website
          </a>
        </p>
      ) : null}
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
      <JsonLd data={weihnachtsmaerkteSchema(schema, siteUrl() + MAERKTE_PATH, siteUrl() + ottoWeihnachten.src)} />
      <h1 className={GRUEN_H1}>{MAERKTE_H1}</h1>
      {/* Otto rechts, der Text fließt links daneben: 160 px auf dem Handy, 200 px ab md. */}
      <div className="mt-6 flow-root max-w-3xl text-lg leading-relaxed hyphens-auto md:hyphens-none">
        <Image
          src={ottoWeihnachten}
          alt="Gezeichnete Krähe Otto mit Weihnachtsmütze und Lebkuchenstern im Schnabel, sie steht auf einer Schale mit Nüssen vor einem ockerfarbenen Farbfleck"
          priority
          sizes="(min-width: 768px) 200px, 160px"
          className="float-right mb-2 ml-4 h-auto w-40 md:w-[200px]"
        />
        <p>
          Der Unterschied zwischen Otto und mir: Otto liebt Weihnachtsmärkte, ich nicht so sehr. Dass es überall{" "}
          <Link href="/niederrhein-tapas/" className={TEXT_LINK}>
            so leckere Sachen
          </Link>{" "}
          gibt, ist Ottos Freud und mein Leid. Ich esse dann einfach zu viel und bin abends noch runder als sonst. Otto
          passiert das nicht: uralt, topfit und kein Gramm zu viel.
        </p>
        <p className="mt-4">
          Damit du weißt, wo es sich lohnt, hat Otto alle Weihnachtsmärkte in Krefeld 2026 für dich zusammengetragen, von
          Bruckhausen bis Fischeln.
        </p>
      </div>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Auf einen Blick</h2>
        <p className="mt-4 max-w-prose text-lg leading-relaxed">{EINLEITUNG}</p>
        {/* Mobil je Markt ein Block statt drei Spalten: Die Tabelle passt dort nicht ohne seitliches Scrollen. */}
        <div className="mt-5">
          <table className="block w-full border-collapse text-left sm:table">
            <thead className="sr-only sm:not-sr-only sm:table-header-group">
              <tr className="bg-wash">
                <th scope="col" className="border border-line px-3 py-2">Markt</th>
                <th scope="col" className="border border-line px-3 py-2">Datum</th>
                <th scope="col" className="border border-line px-3 py-2">Stadtteil</th>
              </tr>
            </thead>
            <tbody className="block border-t border-line sm:table-row-group sm:border-t-0">
              {MAERKTE.map((markt) => (
                <tr key={markt.name} className="block border-b border-line py-2.5 sm:table-row sm:border-b-0 sm:py-0">
                  <td className="block font-bold sm:table-cell sm:border sm:border-line sm:px-3 sm:py-2 sm:font-normal">
                    {markt.kurzname ?? markt.name}
                  </td>
                  <td className="mr-3 inline-block sm:table-cell sm:border sm:border-line sm:px-3 sm:py-2 sm:whitespace-nowrap">
                    {datumKurz(markt)}
                  </td>
                  <td className="inline-block text-muted sm:table-cell sm:border sm:border-line sm:px-3 sm:py-2 sm:text-ink">
                    {markt.stadtteil}
                  </td>
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
