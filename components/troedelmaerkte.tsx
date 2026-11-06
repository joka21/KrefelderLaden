import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/env";
import { getSettings } from "@/lib/kls";
import { SECOND_HAND_PATH } from "@/lib/second-hand";
import { defaultMetadata, defaultSchema } from "@/lib/seo";
import {
  adresse,
  BESONDERE,
  datumKurz,
  datumLang,
  fragen,
  kommendeMaerkte,
  kommendeTermine,
  nachMonat,
  REGELMAESSIG,
  REGELTERMIN_HINWEIS,
  STAND,
  TROEDEL_BESCHREIBUNG,
  TROEDEL_H1,
  TROEDEL_PATH,
  TROEDEL_TITEL,
  troedelmaerkteSchema,
  uhrzeitText,
  wochenendTermine,
  type Termin,
} from "@/lib/troedelmaerkte";
import { heuteInKrefeld } from "@/lib/weihnachten";

/** Gleiche Gestaltung wie die Weihnachtsmarkt-Seite (components/weihnachtsmaerkte.tsx). */
const GRUEN_H1 = "rounded-md bg-green px-4 py-3 text-3xl text-white sm:text-4xl";
const GRUEN_H2 = "rounded-md bg-green px-4 py-2.5 text-2xl text-white";
const GRUEN_H3 = "rounded-md bg-green px-4 py-2 text-lg text-white";
const TEXT_LINK = "text-green underline underline-offset-4 hover:text-green-dark";
const ZELLE = "sm:table-cell sm:border sm:border-line sm:px-3 sm:py-2";

function Hinweis({ termin }: { termin: Termin }) {
  return termin.art === "regeltermin" ? (
    <span className="mt-1 block text-sm font-bold text-muted">{REGELTERMIN_HINWEIS}</span>
  ) : null;
}

function Angabe({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline font-bold">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}

/** Tabelle mit Datum, Uhrzeit, Markt, Ort, Stadtteil; mobil je Termin ein Block. */
function TerminTabelle({ termine }: { termine: readonly Termin[] }) {
  return (
    <table className="block w-full border-collapse text-left sm:table">
      <thead className="sr-only sm:not-sr-only sm:table-header-group">
        <tr className="bg-wash">
          {["Datum", "Uhrzeit", "Markt", "Ort", "Stadtteil"].map((spalte) => (
            <th key={spalte} scope="col" className="border border-line px-3 py-2">
              {spalte}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="block border-t border-line sm:table-row-group sm:border-t-0">
        {termine.map((termin) => (
          <tr key={termin.zeile} className="block border-b border-line py-2.5 sm:table-row sm:border-b-0 sm:py-0">
            <td className={`mr-3 inline-block font-bold sm:whitespace-nowrap sm:font-normal ${ZELLE}`}>
              {datumKurz(termin.datum)}
            </td>
            <td className={`inline-block ${ZELLE}`}>{uhrzeitText(termin)}</td>
            <td className={`block ${ZELLE}`}>
              {termin.markt}
              <Hinweis termin={termin} />
            </td>
            <td className={`block text-muted sm:text-ink ${ZELLE}`}>{termin.ort}</td>
            <td className={`block text-muted sm:text-ink ${ZELLE}`}>{termin.stadtteil || "–"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Kurze Liste für „Heute und dieses Wochenende“ und die besonderen Märkte. */
function TerminListe({ termine }: { termine: readonly Termin[] }) {
  return (
    <ul className="mt-4 space-y-3 leading-relaxed">
      {termine.map((termin) => (
        <li key={termin.zeile} className="rounded-lg border border-line p-4">
          <p className="font-bold">
            {datumLang(termin.datum)}, {uhrzeitText(termin)}
          </p>
          <p>
            {termin.markt}, {termin.ort}
            {termin.stadtteil ? ` (${termin.stadtteil})` : ""}
          </p>
          <Hinweis termin={termin} />
        </li>
      ))}
    </ul>
  );
}

export async function troedelmaerkteMetadata(): Promise<Metadata> {
  return defaultMetadata(await getSettings(), {
    title: TROEDEL_TITEL,
    description: TROEDEL_BESCHREIBUNG,
    path: TROEDEL_PATH,
  });
}

/** Terminkalender unter /troedelmarkt-krefeld/; „heute“ in Europe/Berlin, die Route erneuert stündlich. */
export async function TroedelmaerkteSeite() {
  const settings = await getSettings();
  const heute = heuteInKrefeld();
  const kommende = kommendeTermine(heute);
  const wochenende = wochenendTermine(heute);
  const naechster = kommende[0];
  const maerkte = kommendeMaerkte(heute);
  const schema = defaultSchema(settings, { name: TROEDEL_TITEL, path: TROEDEL_PATH });

  return (
    <div className="mx-auto max-w-6xl px-5 pb-4 pt-10 sm:px-8 sm:pt-14">
      <JsonLd data={troedelmaerkteSchema(schema, siteUrl() + TROEDEL_PATH, heute)} />
      <h1 className={GRUEN_H1}>{TROEDEL_H1}</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed">
        <p>
          Samstags früh an der Grotenburg stöbern, sonntags bei METRO, Globus oder Kaufland – oder auf einem Bücher- oder
          Kinderflohmarkt. Hier findest du alle Trödelmärkte und Flohmärkte in Krefeld mit Datum, Uhrzeit und Ort.
        </p>
        <p>Vergangene Termine verschwinden von selbst, du siehst also immer nur, was noch kommt.</p>
      </div>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Heute und dieses Wochenende</h2>
        {wochenende.length > 0 ? (
          <TerminListe termine={wochenende} />
        ) : (
          <p className="mt-4 max-w-prose text-lg leading-relaxed">
            Heute und an diesem Wochenende ist nach unseren Daten kein Trödelmarkt in Krefeld.
            {naechster
              ? ` Der nächste Termin: ${naechster.markt} am ${datumLang(naechster.datum)}, ${uhrzeitText(naechster)}, ${naechster.ort}.`
              : " Neue Termine tragen wir nach, sobald sie veröffentlicht sind."}
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Alle Termine</h2>
        {kommende.length > 0 ? (
          nachMonat(kommende).map(({ monat, termine }) => (
            <div key={monat} className="mt-6">
              <h3 className="mb-3 text-xl">{monat}</h3>
              <TerminTabelle termine={termine} />
            </div>
          ))
        ) : (
          <p className="mt-4 max-w-prose leading-relaxed">Gerade haben wir keine weiteren Termine.</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Die Märkte im Einzelnen</h2>
        <div className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-2">
          {maerkte.map(({ markt, naechster: termin }) => (
            <article key={markt}>
              <h3 className={GRUEN_H3}>{markt}</h3>
              <dl className="mt-3 space-y-1 leading-relaxed">
                <Angabe label="Wo">{[termin.ort, adresse(termin)].join(", ")}</Angabe>
                {termin.stadtteil ? <Angabe label="Stadtteil">{termin.stadtteil}</Angabe> : null}
                {termin.veranstalter ? <Angabe label="Veranstalter">{termin.veranstalter}</Angabe> : null}
                {termin.turnus ? <Angabe label="Turnus">{termin.turnus}</Angabe> : null}
                <Angabe label="Nächster Termin">
                  {datumLang(termin.datum)}, {uhrzeitText(termin)}
                </Angabe>
                <Angabe label="Eintritt">{termin.eintritt || "keine Angabe"}</Angabe>
              </dl>
              {termin.url ? (
                <p className="mt-3">
                  <a href={termin.url} className={TEXT_LINK} rel="noopener">
                    Zur Veranstaltung bzw. Quelle
                  </a>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Bücher-, Kinder- und Vintage-Flohmärkte</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 md:grid-cols-3">
          {BESONDERE.map(({ heading, kategorien }) => {
            const termine = kommende.filter(({ kategorie }) => kategorien.includes(kategorie));
            return (
              <div key={heading}>
                <h3 className={GRUEN_H3}>{heading}</h3>
                {termine.length > 0 ? (
                  <TerminListe termine={termine} />
                ) : (
                  <p className="mt-4 leading-relaxed">Gerade keine Termine.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {REGELMAESSIG.length > 0 ? (
        <section className="mt-10">
          <h2 className={GRUEN_H2}>Regelmäßige Märkte – nächster Termin folgt</h2>
          <ul className="mt-4 max-w-prose list-disc space-y-3 pl-6 leading-relaxed">
            {REGELMAESSIG.map((markt) => (
              <li key={markt.markt}>
                <strong>{markt.markt}</strong>: {[markt.ort, markt.strasse].filter(Boolean).join(", ")}
                {markt.stadtteil ? ` (${markt.stadtteil})` : ""}
                {markt.veranstalter ? `, Veranstalter: ${markt.veranstalter}` : ""}
                {markt.turnus ? `, ${markt.turnus}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <aside className="mt-10 rounded-lg border border-line bg-wash p-5 text-lg leading-relaxed">
        <p>
          Lieber im Laden stöbern?{" "}
          <Link href={SECOND_HAND_PATH} className={`font-bold ${TEXT_LINK}`}>
            Second-Hand-Läden in Krefeld
          </Link>
        </p>
      </aside>

      <section className="mt-10">
        <h2 className={GRUEN_H2}>Häufige Fragen</h2>
        <div className="mt-6 grid gap-x-8 gap-y-8 md:grid-cols-2">
          {fragen(heute).map(({ frage, antwort }) => (
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
          Stand: recherchiert am {STAND.text}. Alle Angaben ohne Gewähr – prüf den Termin vor der Anreise beim Veranstalter.
        </p>
      </section>
    </div>
  );
}
