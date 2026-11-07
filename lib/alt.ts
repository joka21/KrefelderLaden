import { decodeEntities } from "./entities.ts";
import { MARKE } from "./stadt.ts";

/**
 * Alt-Text für Bilder aus WordPress: der Alt-Text aus der Mediathek, sonst
 * „{Titel} – Krefelder Laden“. Bilder des Frontends (Krähen, Logo) setzen ihren
 * Alt-Text selbst; dekorative bekommen dort alt="".
 */
export function altText(alt: string | null | undefined, titel: string): string {
  return alt?.trim() || `${decodeEntities(titel).trim()} – ${MARKE.name}`;
}
