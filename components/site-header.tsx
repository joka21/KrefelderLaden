import Image from "next/image";
import Link from "next/link";

import { MainNav, type NavItem } from "@/components/main-nav";
import logo from "@/public/images/logo-krefelder-laden.webp";
import { getPosts } from "@/lib/kls";
import { getPublishedSectionPaths, RATGEBER_PATH, visibleSections } from "@/lib/sections";

/**
 * Navigationspunkte: ein Bereich erscheint nur, wenn sein Pfad veröffentlicht
 * ist (/paths bzw. „Hilfe finden“ mit mindestens einer Einrichtung); der
 * Ratgeber, sobald es mindestens einen Beitrag gibt. Ist die API nicht
 * erreichbar, bleibt die Navigation leer statt auf 404 zu verlinken.
 */
async function navItems(): Promise<NavItem[]> {
  try {
    const [published, posts] = await Promise.all([getPublishedSectionPaths(), getPosts(1)]);
    const items: NavItem[] = visibleSections(published).map(({ path, label }) => ({ path, label }));
    if (posts.total > 0) {
      items.push({ path: RATGEBER_PATH, label: "Ratgeber" });
    }
    return items;
  } catch (error) {
    console.error("Navigation:", error);
    return [];
  }
}

export async function SiteHeader() {
  const items = await navItems();

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
