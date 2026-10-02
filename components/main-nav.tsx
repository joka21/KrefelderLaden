"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export interface NavItem {
  path: string;
  label: string;
}

function isCurrent(pathname: string, path: string): boolean {
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return current === path || current.startsWith(path);
}

/**
 * Hauptnavigation. Ab 768 px als Leiste, darunter als aufklappbares Menü
 * (Button mit aria-expanded; Escape schließt und setzt den Fokus zurück).
 */
export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Nach einem Seitenwechsel ist das Menü geschlossen.
  if (open && openedAt !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (items.length === 0) {
    return null;
  }

  const linkClass = (path: string) =>
    `block rounded-md px-3 py-2 font-bold hover:text-green hover:underline underline-offset-4 ${
      isCurrent(pathname, path) ? "text-green underline decoration-2" : "text-ink"
    }`;

  return (
    <nav aria-label="Hauptnavigation" className="w-full md:w-auto">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((value) => !value);
          setOpenedAt(pathname);
        }}
        className="absolute right-5 top-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 font-bold md:hidden"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? "✕" : "☰"}
        </span>
        Menü
      </button>
      <ul
        id={listId}
        className={`${open ? "flex" : "hidden"} flex-col gap-1 border-t border-line pt-3 md:flex md:flex-row md:flex-wrap md:items-center md:border-0 md:pt-0`}
      >
        {items.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={linkClass(item.path)}
              aria-current={isCurrent(pathname, item.path) ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
