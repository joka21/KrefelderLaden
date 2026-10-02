import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { ContentView } from "@/components/content-view";
import { JsonLd } from "@/components/json-ld";
import { getContent, getPaths, getSettings, type KlsContent } from "@/lib/kls";
import { getDraftContent } from "@/lib/preview";
import { contentMetadata } from "@/lib/seo";

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

/** Alle veröffentlichten Pfade vorab erzeugen; weitere werden bei Bedarf erzeugt. */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  try {
    return (await getPaths())
      .filter((item) => item.path !== "/")
      .map((item) => ({ slug: item.path.split("/").filter(Boolean) }));
  } catch (error) {
    // Ohne erreichbare API werden alle Seiten bei Bedarf erzeugt.
    console.error("generateStaticParams:", error);
    return [];
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
  const path = toPath((await params).slug);
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
  const content = await load(toPath(slug));

  return (
    <>
      <JsonLd data={content.schema} />
      <ContentView content={content} />
    </>
  );
}
