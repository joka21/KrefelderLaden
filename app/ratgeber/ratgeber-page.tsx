import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { Pagination, ratgeberPageHref } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { getPosts, getSettings } from "@/lib/kls";
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

/** Übersicht aller Beiträge, neueste zuerst (GET /posts). */
export async function RatgeberPage({ page }: { page: number }) {
  const [settings, posts] = await Promise.all([getSettings(), getPosts(PER_PAGE, page)]);

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
    </>
  );
}
