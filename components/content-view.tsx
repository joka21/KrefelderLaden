import Image from "next/image";

import { formatDate } from "@/components/format";
import { prepareContent } from "@/lib/html";
import type { KlsContent } from "@/lib/kls";
import { TEXTS } from "@/lib/texts";
import { relativeUpload } from "@/lib/urls";

/** Inhaltsseite bzw. Beitrag: Titel (einzige H1), Beitragsbild, Inhalt. */
export function ContentView({ content }: { content: KlsContent }) {
  const isPost = content.type === "post";
  const image = content.featured_image;

  return (
    <article className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-14">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl">{content.title}</h1>
        {isPost && content.date ? (
          <p className="mt-3 text-sm text-muted">
            <time dateTime={content.date}>{formatDate(content.date)}</time>
          </p>
        ) : null}
      </header>
      {image ? (
        <Image
          src={relativeUpload(image.url)}
          alt={image.alt}
          width={image.width ?? 1600}
          height={image.height ?? 900}
          sizes="(min-width: 48rem) 45rem, 100vw"
          unoptimized
          priority
          className="mb-10 h-auto w-full rounded-md"
        />
      ) : null}
      {content.password_protected ? (
        <p>{TEXTS.passwordProtected}</p>
      ) : (
        <div className="wp-content" dangerouslySetInnerHTML={{ __html: prepareContent(content.content) }} />
      )}
    </article>
  );
}
