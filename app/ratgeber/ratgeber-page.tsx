import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeatureNotice } from "@/components/feature-notice";
import { JsonLd } from "@/components/json-ld";
import { Pagination, ratgeberPageHref } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { getPosts, getPublishedPaths, getSettings } from "@/lib/kls";
import { FEATURE } from "@/lib/sections";
import { defaultMetadata, defaultSchema, pageTitle } from "@/lib/seo";
import { TEXTS } from "@/lib/texts";

/** Einträge pro Seite der Ratgeber-Übersicht. */
export const PER_PAGE = 12;

function heading(page: number): string {
  return page > 1 ? `${TEXTS.ratgeber.title} – Seite ${page}` : TEXTS.ratgeber.title;
}

/** Title ohne Site-Namen, z. B. „Ratgeber für Krefeld – Seite 2“. */
function metaTitle(page: number): string {
  return page > 1 ? `${TEXTS.ratgeber.metaTitle} – Seite ${page}` : TEXTS.ratgeber.metaTitle;
}

export async function ratgeberMetadata(page: number): Promise<Metadata> {
  const settings = await getSettings();
  return defaultMetadata(settings, {
    title: pageTitle(metaTitle(page), settings),
    description: TEXTS.ratgeber.description,
    path: ratgeberPageHref(page),
  });
}

/**
 * Übersicht aller Beiträge, neueste zuerst (GET /posts). Auf Seite 1 darunter
 * der Hinweis auf das Schwerpunktthema wie auf der Startseite (zweiter interner
 * Link auf die Themenseite), sofern veröffentlicht.
 */
export async function RatgeberPage({ page }: { page: number }) {
  const [settings, posts, published] = await Promise.all([getSettings(), getPosts(PER_PAGE, page), getPublishedPaths()]);

  if (page > 1 && posts.items.length === 0) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={defaultSchema(settings, {
          name: pageTitle(metaTitle(page), settings),
          path: ratgeberPageHref(page),
          type: "CollectionPage",
        })}
      />
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <h1 className="mb-10 text-4xl">{heading(page)}</h1>
        {posts.items.length > 0 ? <PostList posts={posts.items} headingLevel={2} /> : <p>{TEXTS.ratgeber.empty}</p>}
        <Pagination page={page} totalPages={posts.total_pages} />
      </div>
      {page === 1 && published.has(FEATURE.path) ? <FeatureNotice feature={FEATURE} /> : null}
    </>
  );
}
