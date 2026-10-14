import Link from "next/link";

/** Brotkrümel-Navigation über der Überschrift: nur die übergeordneten Seiten. */
export function HilfeBreadcrumb({ items }: { items: { path: string; label: string }[] }) {
  return (
    <nav aria-label="Brotkrümelnavigation" className="mb-4 text-sm">
      <ol className="flex flex-wrap gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.path} className="flex gap-x-2">
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            <Link href={item.path} className="text-green underline underline-offset-4 hover:text-green-dark">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
