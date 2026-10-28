import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { ContentView } from "@/components/content-view";
import { JsonLd } from "@/components/json-ld";
import { KategorieSeite, kategorieMetadata } from "@/components/kategorie-seite";
import { HILFE_KATEGORIE, isKategorie, KATEGORIEN, kategoriePath } from "@/lib/kategorien";
import { getContent, getPaths, getSettings, type KlsContent } from "@/lib/kls";
import { getDraftContent } from "@/lib/preview";
import { contentMetadata, contentSchema } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Pfad im Format der API: „/a/b/“, dekodiert. */
function toPath(slug: string[]): string {
  return `/${slug.map(decode).join("/")}/`;
}

/**
 * Kategorieseite zum Pfad: /{kategorie}/ → Seite 1, /{kategorie}/seite/{n}/ → Seite n
 * (Seite 1 dort per 308 auf /{kategorie}/). null = kein Kategoriepfad, also
 * Inhalt aus WordPress. „Hilfe finden“ hat eine eigene Route (app/hilfe-finden).
 */
function kategorieSeite(slug: string[]): { kategorie: string; page: number } | null {
  const [kategorie, seite, nummer] = slug.map(decode);
  if (!isKategorie(kategorie) || kategorie === HILFE_KATEGORIE) {
    return null;
  }
  if (slug.length === 1) {
    return { kategorie, page: 1 };
  }
  if (slug.length !== 3 || seite !== "seite") {
    return null;
  }
  if (nummer === "1") permanentRedirect(kategoriePath(kategorie));
  if (!/^[1-9][0-9]{0,3}$/.test(nummer)) notFound();
  return { kategorie, page: Number(nummer) };
}

/**
 * Alle veröffentlichten Pfade und die Kategorieseiten vorab erzeugen; weitere
 * werden bei Bedarf erzeugt. Einrichtungen (Typ „anbieter“) haben eine eigene
 * Route (app/hilfe-finden/einrichtung).
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const kategorien = KATEGORIEN.filter((kategorie) => kategorie.slug !== HILFE_KATEGORIE).map((kategorie) => ({
    slug: [kategorie.slug],
  }));
  try {
    return [
      ...kategorien,
      ...(await getPaths())
        .filter((item) => item.path !== "/" && item.type !== "anbieter")
        .map((item) => ({ slug: item.path.split("/").filter(Boolean) })),
    ];
  } catch (error) {
    // Ohne erreichbare API werden alle Seiten bei Bedarf erzeugt.
    console.error("generateStaticParams:", error);
    return kategorien;
  }
}

/** Inhalt zum Pfad: im Draft Mode die Vorschau, sonst der veröffentlichte Inhalt. */
async function load(path: string): Promise<KlsContent> {
  const draft = await getDraftContent(path);
  if (draft) return draft;

  const result = await getContent(path);
  if (result.found) return result.content;

  // Weiterleitungen erledigt normalerweise proxy.ts mit dem gelieferten Statuscode;
  // dies ist nur die Rückfallebene (308 bzw. 307).
  if (result.redirect) {
    if (result.redirect.status_code === 301 || result.redirect.status_code === 308) {
      permanentRedirect(result.redirect.destination);
    }
    redirect(result.redirect.destination);
  }

  notFound();
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const kategorie = kategorieSeite(slug);
  if (kategorie) {
    return kategorieMetadata(kategorie.kategorie, kategorie.page);
  }
  const path = toPath(slug);
  // Nicht gefunden bzw. Weiterleitung entscheidet die Seite; hier nicht werfen,
  // damit die 404-Seite vollständig als HTML ausgeliefert wird.
  const draft = await getDraftContent(path);
  const result = draft ? { found: true as const, content: draft } : await getContent(path);
  if (!result.found) {
    return {};
  }
  return contentMetadata(result.content, await getSettings());
}

export default async function ContentPage({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  const kategorie = kategorieSeite(slug);
  if (kategorie) {
    return <KategorieSeite slug={kategorie.kategorie} page={kategorie.page} />;
  }
  const [content, settings] = await Promise.all([load(toPath(slug)), getSettings()]);

  return (
    <>
      <JsonLd data={contentSchema(content, settings)} />
      <ContentView content={content} />
    </>
  );
}
