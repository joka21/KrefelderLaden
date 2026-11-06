import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/env";
import { HILFE_PATH } from "@/lib/hilfe";
import { getSettings } from "@/lib/kls";
import {
  adresse,
  fragen,
  NUR_ANNAHME,
  SECOND_HAND_BESCHREIBUNG,
  SECOND_HAND_H1,
  SECOND_HAND_PATH,
  SECOND_HAND_TITEL,
  secondHandSchema,
  SICHTBARE_ABSCHNITTE,
  STAND,
  type Eintrag,
} from "@/lib/second-hand";
import { defaultMetadata, defaultSchema } from "@/lib/seo";
import { TROEDEL_PATH } from "@/lib/troedelmaerkte";

/** Gleiche Gestaltung wie die Trödelmarkt-Seite (components/troedelmaerkte.tsx). */
const GRUEN_H1 = "rounded-md bg-green px-4 py-3 text-3xl text-white sm:text-4xl";
const GRUEN_H2 = "rounded-md bg-green px-4 py-2.5 text-2xl text-white";
const GRUEN_H3 = "rounded-md bg-green px-4 py-2 text-lg text-white";
const TEXT_LINK = "text-green underline underline-offset-4 hover:text-green-dark";

function Angabe({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline font-bold">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}

function EintragBlock({ item }: { item: Eintrag }) {
  return (
    <article>
      <h3 className={GRUEN_H3}>{item.name}</h3>
      {item.nurAnnahme ? <p className="mt-2 text-sm font-bold text-muted">{NUR_ANNAHME}</p> : null}
      <dl className="mt-3 space-y-1 leading-relaxed">
        <Angabe label="Adresse">{adresse(item)}</Angabe>
        {item.stadtteil ? <Angabe label="Stadtteil">{item.stadtteil}</Angabe> : null}
        <Angabe label="Öffnungszeiten">{item.oeffnungszeiten}</Angabe>
        {item.sortiment ? <Angabe label="Sortiment">{item.sortiment}</Angabe> : null}
        {item.zugang ? <Angabe label="Zugang">{item.zugang}</Angabe> : null}
        {item.ankauf ? <Angabe label="Ankauf">ja</Angabe> : null}
        {item.traeger ? <Angabe label="Träger">{item.traeger}</Angabe> : null}
      </dl>
      {item.geprueft ? <p className="mt-2 text-sm text-muted">{item.geprueft}</p> : null}
      {item.website ? (
        <p className="mt-3">
          <a href={item.website} className={TEXT_LINK} rel="noopener">
            Zur Website
          </a>
        </p>
      ) : null}
    </article>
  );
}

export async function secondHandMetadata(): Promise<Metadata> {
  return defaultMetadata(await getSettings(), {
    title: SECOND_HAND_TITEL,
    description: SECOND_HAND_BESCHREIBUNG,
    path: SECOND_HAND_PATH,
  });
}

/** Verzeichnis unter /second-hand-krefeld/. */
export async function SecondHandSeite() {
  const settings = await getSettings();
  const schema = defaultSchema(settings, { name: SECOND_HAND_TITEL, path: SECOND_HAND_PATH });

  return (
    <div className="mx-auto max-w-6xl px-5 pb-4 pt-10 sm:px-8 sm:pt-14">
      <JsonLd data={secondHandSchema(schema, siteUrl() + SECOND_HAND_PATH)} />
      <h1 className={GRUEN_H1}>{SECOND_HAND_H1}</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed">
        <p>
          Gebraucht kaufen schont den Geldbeutel und die Umwelt. Hier findest du Second-Hand-Läden in Krefeld für Mode,
          Vintage und Kindersachen, dazu Sozialkaufhäuser, An- und Verkauf, Antiquariate und Kleiderkammern.
        </p>
        <p>Zu jeder Adresse stehen Öffnungszeiten und Sortiment, soweit die Läden sie selbst veröffentlichen.</p>
      </div>

      {SICHTBARE_ABSCHNITTE.map(({ id, heading, eintraege }) => (
        <section key={id} className="mt-10">
          <h2 className={GRUEN_H2}>{heading}</h2>
          <div className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-2">
            {eintraege.map((item) => (
              <EintragBlock key={item.name} item={item} />
            ))}
          </div>
          {id === "kleider" ? (
            <p className="mt-8">
              <Link href={HILFE_PATH} className={`font-bold ${TEXT_LINK}`}>
                Weitere Hilfsangebote in Krefeld
              </Link>
            </p>
          ) : null}
        </section>
      ))}

      <aside className="mt-10 rounded-lg border border-line bg-wash p-5 text-lg leading-relaxed">
        <p>
          Lieber auf dem Flohmarkt stöbern?{" "}
          <Link href={TROEDEL_PATH} className={`font-bold ${TEXT_LINK}`}>
            Alle Trödelmärkte in Krefeld mit Terminen
          </Link>
        </p>
      </aside>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Häufige Fragen</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 md:grid-cols-2">
          {fragen().map(({ frage, antwort }) => (
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
          Stand: recherchiert am {STAND.text}. Alle Angaben ohne Gewähr – prüf Öffnungszeiten vor dem Besuch beim Laden.
        </p>
      </section>
    </div>
  );
}
