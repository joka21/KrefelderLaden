import Link from "next/link";

import { TEXTS } from "@/lib/texts";

/** Hinweis im Draft Mode mit Link zum Beenden der Vorschau. */
export function PreviewBanner() {
  return (
    <div role="status" className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm sm:px-8">
        <p>{TEXTS.preview.notice}</p>
        <Link href="/api/preview/exit/" prefetch={false} className="font-bold underline underline-offset-4">
          {TEXTS.preview.exit}
        </Link>
      </div>
    </div>
  );
}
