import Image from "next/image";
import Link from "next/link";

import { MainNav, type NavItem } from "@/components/main-nav";
import logo from "@/public/images/logo-krefelder-laden.webp";
import { menueKategorien } from "@/lib/kategorien";

/**
 * Navigationspunkte: die Kategorien aus lib/kategorien.ts mit imMenue, in
 * Listenreihenfolge – immer, auch ohne Beiträge (die Seite zeigt dann einen
 * Hinweis).
 */
function navItems(): NavItem[] {
  return menueKategorien().map(({ path, label }) => ({ path, label }));
}

export function SiteHeader() {
  const items = navItems();

  return (
    <header className="border-b border-line bg-white">
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <Link href="/" className="block shrink-0 rounded-sm">
          {/* Logo wie geliefert, nur auf weißem Hintergrund. Linktext unsichtbar als
              Text (statt nur im alt), damit auch Crawler einen Ankertext sehen. */}
          <Image src={logo} alt="" priority sizes="128px" className="h-auto w-24 sm:w-32" />
          <span className="sr-only">Krefelder Laden – Startseite</span>
        </Link>
        <MainNav items={items} />
      </div>
    </header>
  );
}
