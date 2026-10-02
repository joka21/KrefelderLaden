import Link from "next/link";

/** Seiten-Navigation des Ratgebers: Seite 1 = /ratgeber/, ab Seite 2 /ratgeber/seite/{n}/. */
export function ratgeberPageHref(page: number): string {
  return page <= 1 ? "/ratgeber/" : `/ratgeber/seite/${page}/`;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const linkClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-line px-3 font-bold text-green hover:border-green";

  return (
    <nav aria-label="Seiten" className="mt-14">
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <li>
            <Link href={ratgeberPageHref(page - 1)} rel="prev" className={linkClass}>
              ← Neuere
            </Link>
          </li>
        ) : null}
        {pages.map((number) => (
          <li key={number}>
            {number === page ? (
              <span
                aria-current="page"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-green px-3 font-bold text-white"
              >
                <span className="sr-only">Seite </span>
                {number}
              </span>
            ) : (
              <Link href={ratgeberPageHref(number)} className={linkClass}>
                <span className="sr-only">Seite </span>
                {number}
              </Link>
            )}
          </li>
        ))}
        {page < totalPages ? (
          <li>
            <Link href={ratgeberPageHref(page + 1)} rel="next" className={linkClass}>
              Ältere →
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
