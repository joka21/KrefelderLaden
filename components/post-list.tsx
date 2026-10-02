import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/components/format";
import type { KlsPostItem } from "@/lib/kls";
import { relativeUpload } from "@/lib/urls";

/**
 * Liste von Beiträgen (Startseite, Ratgeber). Beiträge mit noindex werden
 * normal angezeigt – noindex betrifft nur Suchmaschinen.
 */
export function PostList({ posts, headingLevel = 3 }: { posts: KlsPostItem[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <article className="group relative flex h-full flex-col">
            {post.featured_image ? (
              <Image
                src={relativeUpload(post.featured_image.url)}
                alt={post.featured_image.alt}
                width={post.featured_image.width ?? 1200}
                height={post.featured_image.height ?? 675}
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                unoptimized
                className="mb-4 aspect-[16/9] w-full rounded-md object-cover"
              />
            ) : null}
            <Heading className="text-xl">
              <Link
                href={post.path}
                className="text-ink underline decoration-green decoration-2 underline-offset-4 after:absolute after:inset-0 group-hover:text-green"
              >
                {post.title}
              </Link>
            </Heading>
            {post.date ? (
              <p className="mt-2 text-sm text-muted">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
            ) : null}
            {post.excerpt ? <p className="mt-3 leading-relaxed">{post.excerpt}</p> : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
