import "server-only";

import { cookies, draftMode } from "next/headers";

import { getPreview, type KlsContent } from "@/lib/kls";

/** Cookie mit der Beitrags-ID der aktuellen Vorschau (gesetzt von /api/preview). */
export const PREVIEW_COOKIE = "kls_preview_id";

/**
 * Im Draft Mode: Vorschau-Inhalt, wenn er zum angefragten Pfad gehört.
 * Sonst null (dann gilt der veröffentlichte Inhalt).
 */
export async function getDraftContent(path: string): Promise<KlsContent | null> {
  const draft = await draftMode();
  if (!draft.isEnabled) {
    return null;
  }

  const id = Number((await cookies()).get(PREVIEW_COOKIE)?.value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const content = await getPreview(id);
  return content && content.path === path ? content : null;
}
