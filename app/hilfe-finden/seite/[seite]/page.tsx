import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { KategorieSeite, kategorieMetadata } from "@/components/kategorie-seite";
import { HILFE_PATH } from "@/lib/hilfe";
import { getKategorieSeite, HILFE_KATEGORIE } from "@/lib/kategorien";

export const revalidate = 3600;
export const dynamicParams = true;

/** Weitere Seiten der Beiträge von „Hilfe finden“; Seite 1 ist /hilfe-finden/ mit dem Verzeichnis. */
function parsePage(value: string): number {
  if (value === "1") permanentRedirect(HILFE_PATH);
  if (!/^[1-9][0-9]{0,3}$/.test(value)) notFound();
  return Number(value);
}

export async function generateStaticParams(): Promise<{ seite: string }[]> {
  try {
    const totalPages = (await getKategorieSeite(HILFE_KATEGORIE, 1))?.totalPages ?? 0;
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({ seite: String(index + 2) }));
  } catch (error) {
    console.error("generateStaticParams:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/hilfe-finden/seite/[seite]">): Promise<Metadata> {
  return kategorieMetadata(HILFE_KATEGORIE, parsePage((await params).seite));
}

export default async function HilfeBeitraegeSeite({ params }: PageProps<"/hilfe-finden/seite/[seite]">) {
  return <KategorieSeite slug={HILFE_KATEGORIE} page={parsePage((await params).seite)} />;
}
