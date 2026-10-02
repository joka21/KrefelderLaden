import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { PER_PAGE, RatgeberPage, ratgeberMetadata } from "@/app/ratgeber/ratgeber-page";
import { getPosts } from "@/lib/kls";

export const revalidate = 3600;
export const dynamicParams = true;

/** Nur ganze Zahlen ab 2 in kanonischer Schreibweise; Seite 1 ist /ratgeber/. */
function parsePage(value: string): number {
  if (value === "1") permanentRedirect("/ratgeber/");
  if (!/^[1-9][0-9]{0,3}$/.test(value)) notFound();
  return Number(value);
}

export async function generateStaticParams(): Promise<{ seite: string }[]> {
  try {
    const { total_pages } = await getPosts(PER_PAGE);
    return Array.from({ length: Math.max(0, total_pages - 1) }, (_, index) => ({ seite: String(index + 2) }));
  } catch (error) {
    console.error("generateStaticParams:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/ratgeber/seite/[seite]">): Promise<Metadata> {
  return ratgeberMetadata(parsePage((await params).seite));
}

export default async function RatgeberSeite({ params }: PageProps<"/ratgeber/seite/[seite]">) {
  return <RatgeberPage page={parsePage((await params).seite)} />;
}
