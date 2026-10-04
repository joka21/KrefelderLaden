import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PostList } from "@/components/post-list";
import { SectionTiles } from "@/components/section-tiles";
import kraehe from "@/public/images/kraehe.jpg";
import { getContent, getPosts, getPublishedPaths, getSettings, type KlsContent } from "@/lib/kls";
import { getDraftContent } from "@/lib/preview";
import { visibleSections } from "@/lib/sections";
import { contentMetadata, defaultMetadata, defaultSchema } from "@/lib/seo";
import { TEXTS } from "@/lib/texts";

export const revalidate = 3600;

/** Startseite aus WordPress (front_page), falls gesetzt und veröffentlicht. */
async function frontPage(): Promise<KlsContent | null> {
  const draft = await getDraftContent("/");
  if (draft) return draft;
  const result = await getContent("/");
  return result.found ? result.content : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, front] = await Promise.all([getSettings(), frontPage()]);

  return front
    ? contentMetadata(front, settings)
    : defaultMetadata(settings, { title: TEXTS.home.title, description: TEXTS.home.description, path: "/" });
}

export default async function HomePage() {
  const [settings, front, published, latest] = await Promise.all([
    getSettings(),
    frontPage(),
    getPublishedPaths(),
    getPosts(6),
  ]);
  const sections = visibleSections(published);

  return (
    <>
      <JsonLd data={front ? front.schema : defaultSchema(settings, { name: TEXTS.home.title, path: "/" })} />

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-10 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:pt-14">
        {/* Krähe wie geliefert auf weißem Hintergrund – das einzige verspielte Element. */}
        <Image
          src={kraehe}
          alt="Gezeichnete Krähe vor einem ockerfarbenen Farbfleck"
          priority
          sizes="(min-width: 768px) 28rem, 80vw"
          className="mx-auto h-auto w-full max-w-sm md:max-w-md"
        />
        <div>
          <h1 className="text-4xl sm:text-5xl">{front?.title || TEXTS.home.heading}</h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed">{TEXTS.home.intro}</p>
        </div>
      </section>

      <SectionTiles sections={sections} heading={TEXTS.home.sectionsHeading} />

      {latest.items.length > 0 ? (
        <section aria-labelledby="neueste" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <h2 id="neueste" className="mb-8 text-3xl">
            {TEXTS.home.latestHeading}
          </h2>
          <PostList posts={latest.items} />
          {latest.total > latest.items.length ? (
            <p className="mt-10">
              <Link href="/ratgeber/" className="font-bold text-green underline underline-offset-4 hover:text-green-dark">
                {TEXTS.home.allPosts}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
