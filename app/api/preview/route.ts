import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { previewSecret } from "@/lib/env";
import { getPreview } from "@/lib/kls";
import { PREVIEW_COOKIE } from "@/lib/preview";
import { secretMatches } from "@/lib/secrets";

/**
 * GET /api/preview?secret=…&id=…&type=… – Vorschau aus WordPress (API-Vertrag,
 * Abschnitt „preview“): Secret prüfen (sonst 401), Draft Mode aktivieren,
 * /preview?id=… laden und auf den gelieferten Pfad weiterleiten.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (!secretMatches(params.get("secret"), previewSecret())) {
    return new Response("Ungültiges oder fehlendes Secret.", { status: 401 });
  }

  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Parameter id fehlt oder ist ungültig.", { status: 400 });
  }

  const content = await getPreview(id);
  if (!content) {
    return new Response("Inhalt nicht gefunden.", { status: 404 });
  }

  (await draftMode()).enable();
  (await cookies()).set(PREVIEW_COOKIE, String(id), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  // Ziel ist der Pfad aus der API, nie ein Parameter (keine offene Weiterleitung).
  redirect(content.path);
}
