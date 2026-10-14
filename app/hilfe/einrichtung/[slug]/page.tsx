import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { HilfeBreadcrumb } from "@/components/hilfe/hilfe-breadcrumb";
import { HilfeQuelle } from "@/components/hilfe/hilfe-quelle";
import { NotrufHinweis } from "@/components/hilfe/notruf-hinweis";
import { JsonLd } from "@/components/json-ld";
import {
  bereichPath,
  bezirkPath,
  einrichtungDescription,
  einrichtungFromContent,
  einrichtungPath,
  einrichtungSchema,
  entfernung,
  findBereich,
  getEinrichtungen,
  inDerNaehe,
  HILFE_PATH,
  HILFE_TEXTS,
} from "@/lib/hilfe";
import { getContent, getSettings, type KlsContent } from "@/lib/kls";
import { getDraftContent } from "@/lib/preview";
import { contentMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

/** Alle veröffentlichten Einrichtungen vorab erzeugen; weitere bei Bedarf. */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    return (await getEinrichtungen())
      .map((item) => item.path.split("/").filter(Boolean).pop() ?? "")
      .filter(Boolean)
      .map((slug) => ({ slug }));
  } catch (error) {
    console.error("generateStaticParams (Hilfe):", error);
    return [];
  }
}

function toPath(slug: string): string {
  try {
    return einrichtungPath(decodeURIComponent(slug));
  } catch {
    return einrichtungPath(slug);
  }
}

/** Inhalt zum Pfad: im Draft Mode die Vorschau, sonst der veröffentlichte Inhalt (wie app/[...slug]). */
async function load(path: string): Promise<KlsContent> {
  const draft = await getDraftContent(path);
  if (draft) return draft;

  const result = await getContent(path);
  if (result.found) return result.content;

  if (result.redirect) {
    if (result.redirect.status_code === 301 || result.redirect.status_code === 308) {
      permanentRedirect(result.redirect.destination);
    }
    redirect(result.redirect.destination);
  }

  notFound();
}

export async function generateMetadata({ params }: PageProps<"/hilfe/einrichtung/[slug]">): Promise<Metadata> {
  const path = toPath((await params).slug);
  const draft = await getDraftContent(path);
  const result = draft ? { found: true as const, content: draft } : await getContent(path);
  if (!result.found) {
    return {};
  }

  const metadata = contentMetadata(result.content, await getSettings());
  const einrichtung = einrichtungFromContent(result.content);
  if (!einrichtung) {
    return metadata;
  }

  // Beschreibung aus den Daten statt des gekürzten Kurztexts der API.
  const description = einrichtungDescription(einrichtung);
  return {
    ...metadata,
    description,
    openGraph: { ...metadata.openGraph, description },
    twitter: { ...metadata.twitter, description },
  };
}

/**
 * Detailseite: Notruf-Kasten (falls gesetzt), Name, Kategorie, Kurztext, Adresse,
 * Stadtbezirk, Website und die 4 nächstgelegenen Einrichtungen (Luftlinie).
 */
export default async function EinrichtungPage({ params }: PageProps<"/hilfe/einrichtung/[slug]">) {
  const content = await load(toPath((await params).slug));
  const einrichtung = einrichtungFromContent(content);

  if (!einrichtung) {
    notFound();
  }

  const [settings, alle] = await Promise.all([getSettings(), getEinrichtungen()]);
  const bereich = findBereich(einrichtung.bereich.slug);
  const naehe = inDerNaehe(einrichtung, alle);
  const homeUrl = `${settings.site.frontend_url.replace(/\/+$/, "")}/`;

  return (
    <>
      <JsonLd data={einrichtungSchema(content, einrichtung, homeUrl, settings.site.name)} />
      <article className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-14">
        {einrichtung.notruf ? <NotrufHinweis className="mb-8" /> : null}
        <HilfeBreadcrumb
          items={[
            { path: HILFE_PATH, label: HILFE_TEXTS.title },
            ...(bereich ? [{ path: bereichPath(bereich.slug), label: bereich.label }] : []),
          ]}
        />
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl">{einrichtung.name}</h1>
          {einrichtung.kategorie ? <p className="mt-3 text-lg text-muted">{einrichtung.kategorie.name}</p> : null}
        </header>

        {einrichtung.kurztext ? <p className="max-w-prose text-lg leading-relaxed">{einrichtung.kurztext}</p> : null}

        <dl className="mt-8 grid gap-x-8 gap-y-4 rounded-lg bg-wash p-6 sm:grid-cols-[auto_1fr]">
          <dt className="font-bold">Adresse</dt>
          <dd>
            {einrichtung.adresse}
            <br />
            {einrichtung.plz} Krefeld
          </dd>

          <dt className="font-bold">Stadtbezirk</dt>
          <dd>
            <Link
              href={bezirkPath(einrichtung.bezirk.slug)}
              className="text-green underline underline-offset-4 hover:text-green-dark"
            >
              Krefeld-{einrichtung.bezirk.name}
            </Link>
            {einrichtung.bezirkBis2025 ? ` (bis 2025: Bezirk ${einrichtung.bezirkBis2025})` : ""}
          </dd>

          {einrichtung.website ? (
            <>
              <dt className="font-bold">Website</dt>
              <dd>
                <a
                  href={einrichtung.website}
                  rel="noopener"
                  className="break-all text-green underline underline-offset-4 hover:text-green-dark"
                >
                  {einrichtung.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </dd>
            </>
          ) : null}
        </dl>

        {naehe.length > 0 ? (
          <section aria-labelledby="in-der-naehe" className="mt-12">
            <h2 id="in-der-naehe" className="mb-4 text-2xl">
              Weitere Einrichtungen in der Nähe
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {naehe.map(({ einrichtung: andere, meter }) => (
                <li key={andere.id} className="group relative rounded-lg border border-line p-4 hover:border-green">
                  <Link
                    href={andere.path}
                    className="font-bold text-ink underline decoration-green decoration-2 underline-offset-4 after:absolute after:inset-0 group-hover:text-green"
                  >
                    {andere.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {andere.kategorie ? `${andere.kategorie.name} · ` : ""}
                    {entfernung(meter)} Luftlinie
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
      <HilfeQuelle />
    </>
  );
}
