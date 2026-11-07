import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { getSettings } from "@/lib/kls";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";
import {
  SICHTBARE_ABSCHNITTE,
  UEBER_UNS,
  UEBER_UNS_BEREIT,
  UEBER_UNS_PATH,
  ueberUnsBeschreibung,
} from "@/lib/ueber-uns";

const TEXT_LINK = "text-green underline underline-offset-4 hover:text-green-dark";

export async function generateMetadata(): Promise<Metadata> {
  if (!UEBER_UNS_BEREIT) return {};
  const settings = await getSettings();
  return defaultMetadata(settings, {
    title: pageTitle(UEBER_UNS.metaTitle || UEBER_UNS.heading, settings),
    description: ueberUnsBeschreibung(),
    path: UEBER_UNS_PATH,
  });
}

/** /ueber-uns/: Abschnitte aus lib/ueber-uns.ts; ohne Text 404. Im Abschnitt „kontakt“ Kontakt aus /settings und Link aufs Impressum. */
export default async function UeberUnsPage() {
  if (!UEBER_UNS_BEREIT) notFound();
  const settings = await getSettings();
  const { email, telephone } = settings.organization;
  const schema = defaultSchema(settings, {
    name: pageTitle(UEBER_UNS.metaTitle || UEBER_UNS.heading, settings),
    path: UEBER_UNS_PATH,
  });
  // Seite als AboutPage, deren Thema die Organization ist.
  const graph = schema["@graph"].map((knoten) =>
    knoten["@type"] === "WebPage" ? { ...knoten, "@type": "AboutPage", about: { "@id": `${schema["@graph"][0]["@id"]}` } } : knoten,
  );

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-14">
      <JsonLd data={{ ...schema, "@graph": graph }} />
      <h1 className="text-3xl sm:text-4xl">{UEBER_UNS.heading}</h1>
      {SICHTBARE_ABSCHNITTE.map(({ id, heading, absaetze }) => (
        <section key={id} aria-labelledby={`ueber-${id}`} className="mt-10">
          <h2 id={`ueber-${id}`} className="text-2xl">
            {heading}
          </h2>
          {absaetze.map((absatz) => (
            <p key={absatz} className="mt-4 text-lg leading-relaxed">
              {absatz}
            </p>
          ))}
          {id === "kontakt" ? (
            <ul className="mt-4 space-y-1 text-lg">
              {email ? (
                <li>
                  E-Mail:{" "}
                  <a href={`mailto:${email}`} className={TEXT_LINK}>
                    {email}
                  </a>
                </li>
              ) : null}
              {telephone ? <li>Telefon: {telephone}</li> : null}
              <li>
                <Link href="/impressum/" className={TEXT_LINK}>
                  Impressum
                </Link>
              </li>
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
