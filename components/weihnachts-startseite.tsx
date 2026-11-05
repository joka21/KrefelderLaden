import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PostList } from "@/components/post-list";
import { allPosts } from "@/lib/kategorien";
import { getCategory, getCategoryPostIds, getSettings, getTag, getTagPostIds } from "@/lib/kls";
import { defaultMetadata, defaultSchema } from "@/lib/seo";
import {
  heuteInKrefeld,
  MEHR_ZU_WEIHNACHTEN,
  SCHLAGWORT_BLOECKE,
  stelleBloeckeZusammen,
  WEIHNACHTEN_TEXTE,
} from "@/lib/weihnachten";
import { datumKurz, MAERKTE_PATH, naechsteMaerkte } from "@/lib/weihnachtsmaerkte";
import kraehe from "@/public/images/kraehe.webp";

const ABSCHNITT = "mx-auto max-w-6xl px-5 py-12 sm:px-8";
const H2 = "mb-8 text-3xl";

export async function weihnachtsStartseiteMetadata(): Promise<Metadata> {
  return defaultMetadata(await getSettings(), {
    title: WEIHNACHTEN_TEXTE.title,
    description: WEIHNACHTEN_TEXTE.description,
    path: "/",
  });
}

/** IDs der Beiträge je Schlagwort-Block und der Kategorie „weihnachten“; fehlt ein Begriff, bleibt der Block leer. */
async function getBloecke() {
  const [schlagwortIds, weihnachtenIds] = await Promise.all([
    Promise.all(
      SCHLAGWORT_BLOECKE.map(async ({ schlagwort }) => {
        const tag = await getTag(schlagwort);
        return tag && tag.count > 0 ? getTagPostIds(tag) : [];
      }),
    ),
    getCategory(MEHR_ZU_WEIHNACHTEN.kategorie).then((kategorie) =>
      kategorie && kategorie.count > 0 ? getCategoryPostIds(kategorie) : [],
    ),
  ]);
  const hatBeitraege = weihnachtenIds.length > 0 || schlagwortIds.some((ids) => ids.length > 0);
  return stelleBloeckeZusammen(schlagwortIds, weihnachtenIds, hatBeitraege ? await allPosts() : []);
}

/** Startseite bis WEIHNACHTEN_BIS: Kopf, nächste Märkte, Beiträge je Block. */
export async function WeihnachtsStartseite() {
  const [settings, bloecke] = await Promise.all([getSettings(), getBloecke()]);
  const maerkte = naechsteMaerkte(heuteInKrefeld());

  return (
    <>
      <JsonLd data={defaultSchema(settings, { name: WEIHNACHTEN_TEXTE.title, path: "/" })} />

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-10 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:pt-14">
        <Image
          src={kraehe}
          alt="Gezeichnete Krähe vor einem ockerfarbenen Farbfleck"
          priority
          sizes="(min-width: 768px) 28rem, 80vw"
          className="mx-auto h-auto w-full max-w-sm md:max-w-md"
        />
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-green">{WEIHNACHTEN_TEXTE.eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl">{WEIHNACHTEN_TEXTE.heading}</h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed">{WEIHNACHTEN_TEXTE.intro}</p>
          {maerkte.length > 0 ? (
            <Link
              href={MAERKTE_PATH}
              className="mt-5 inline-block rounded-md bg-green px-5 py-3 text-lg font-bold text-white hover:bg-green-dark"
            >
              {WEIHNACHTEN_TEXTE.button}
            </Link>
          ) : null}
        </div>
      </section>

      {maerkte.length > 0 ? (
        <section aria-labelledby="maerkte" className={ABSCHNITT}>
          <h2 id="maerkte" className={H2}>
            {WEIHNACHTEN_TEXTE.maerkteHeading}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {maerkte.map((markt) => (
              <li key={markt.name} className="rounded-lg border border-line p-4">
                <h3 className="text-xl">{markt.kurzname ?? markt.name}</h3>
                <p className="mt-2 font-bold">{datumKurz(markt)}</p>
                <p className="mt-1 text-muted">{markt.ort.name}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8">
            <Link href={MAERKTE_PATH} className="font-bold text-green underline underline-offset-4 hover:text-green-dark">
              {WEIHNACHTEN_TEXTE.alleMaerkte}
            </Link>
          </p>
        </section>
      ) : null}

      {bloecke.map(({ heading, posts }, index) => (
        <section key={heading} aria-labelledby={`block-${index}`} className={ABSCHNITT}>
          <h2 id={`block-${index}`} className={H2}>
            {heading}
          </h2>
          <PostList posts={posts} />
        </section>
      ))}
    </>
  );
}
