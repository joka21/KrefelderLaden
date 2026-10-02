import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { klsSite, revalidateSecret } from "@/lib/env";
import { TAGS } from "@/lib/kls";
import { secretMatches } from "@/lib/secrets";

/**
 * POST /api/revalidate – Revalidation durch WordPress (API-Vertrag, Abschnitt
 * „Revalidation“).
 *
 * Header `X-KLS-Secret` bzw. Feld `secret` = KLS_REVALIDATE_SECRET, sonst 401.
 * Body: { secret, site, events: string[], paths: string[] }
 *
 * Verarbeitet alle gelieferten Pfade, auch Frontend-Routen ohne
 * WordPress-Inhalt wie „/“ und „/ratgeber/“.
 */

const EXPIRE_NOW = { expire: 0 };
const MAX_PATHS = 2000;

/** Ereignisse, bei denen auch /paths und /redirects neu geladen werden. */
const STRUCTURAL_EVENTS = new Set(["path_change", "site_change", "delete", "full"]);

interface Payload {
  secret?: unknown;
  site?: unknown;
  events?: unknown;
  paths?: unknown;
}

function normalizePath(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  const path = value.split(/[?#]/)[0];
  return path.endsWith("/") ? path : `${path}/`;
}

/** Seite des Pfads verwerfen (mit und ohne abschließenden Schrägstrich). */
function revalidatePage(path: string): void {
  revalidatePath(path);
  if (path !== "/") {
    revalidatePath(path.replace(/\/$/, ""));
  }
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as Payload | null;
  const given = request.headers.get("x-kls-secret") || payload?.secret;

  if (!secretMatches(given, revalidateSecret())) {
    return Response.json({ revalidated: false, message: "Ungültiges oder fehlendes Secret." }, { status: 401 });
  }

  if (!payload || payload.site !== klsSite() || !Array.isArray(payload.paths)) {
    return Response.json({ revalidated: false, message: "Ungültige Anfrage (site oder paths)." }, { status: 400 });
  }

  const events = Array.isArray(payload.events) ? payload.events.filter((e): e is string => typeof e === "string") : [];
  const paths = [
    ...new Set(
      payload.paths
        .filter((p): p is string => typeof p === "string")
        .map(normalizePath)
        .filter((p): p is string => p !== null),
    ),
  ].slice(0, MAX_PATHS);

  for (const path of paths) {
    revalidateTag(TAGS.content(path), EXPIRE_NOW);
    revalidatePage(path);
  }

  // Übersichten und Navigation hängen an /posts und /paths (Layout jeder Seite).
  revalidateTag(TAGS.posts, EXPIRE_NOW);
  revalidateTag(TAGS.paths, EXPIRE_NOW);

  if (paths.includes("/ratgeber/")) {
    revalidatePath("/ratgeber/seite/[seite]", "page");
  }

  if (events.some((event) => STRUCTURAL_EVENTS.has(event))) {
    revalidateTag(TAGS.redirects, EXPIRE_NOW);
  }

  if (events.includes("full")) {
    revalidateTag(TAGS.all, EXPIRE_NOW);
    revalidatePath("/", "layout");
  }

  return Response.json({ revalidated: true, events, paths: paths.length });
}
