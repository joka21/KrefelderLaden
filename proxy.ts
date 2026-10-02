import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (früher „Middleware“), läuft vor jeder Anfrage:
 *
 * 1. Schutz vor Indexierung: Solange SITE_INDEXABLE nicht „true“ ist oder der
 *    Host nicht dem aus SITE_URL entspricht, trägt
 *    jede Antwort den Header „X-Robots-Tag: noindex, nofollow“.
 * 2. Seiten ohne abschließenden Schrägstrich → 308 auf „/…/“ (API-Routen
 *    ausgenommen, siehe skipTrailingSlashRedirect in next.config.ts).
 * 3. Weiterleitungen aus GET /{site}/redirects mit dem gelieferten Statuscode,
 *    ohne neuen Build. Die Liste kommt über /api/redirects aus dem Next.js-Cache
 *    (dort von /api/revalidate geleert) und wird hier höchstens CACHE_MS lang
 *    zwischengespeichert. Ist sie nicht abrufbar, gilt die Rückfallebene in
 *    app/[...slug]/page.tsx.
 */

const CACHE_MS = 30_000;
const STATUS_CODES = new Set([301, 302, 303, 307, 308]);

type RedirectMap = Map<string, { destination: string; status: number }>;

let cache: { map: RedirectMap; expires: number } | null = null;

function normalize(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    // Ungültige Kodierung: Pfad unverändert vergleichen.
  }
  return path.endsWith("/") ? path : `${path}/`;
}

async function redirectMap(origin: string): Promise<RedirectMap> {
  if (cache && cache.expires > Date.now()) {
    return cache.map;
  }

  const map: RedirectMap = new Map();
  try {
    const response = await fetch(`${origin}/api/redirects/`, { cache: "no-store" });
    if (response.ok) {
      const { items } = (await response.json()) as {
        items: { source: string; destination: string; status_code: number }[];
      };
      for (const item of items) {
        map.set(normalize(item.source), {
          destination: item.destination,
          status: STATUS_CODES.has(item.status_code) ? item.status_code : 301,
        });
      }
    }
  } catch (error) {
    console.error("Weiterleitungen (proxy):", error);
  }

  cache = { map, expires: Date.now() + CACHE_MS };
  return map;
}

function hostOf(url: string | undefined): string {
  try {
    return new URL(url ?? "").host.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Indexierbar nur mit SITE_INDEXABLE=true UND auf der Domain aus SITE_URL.
 * Testadressen (z. B. *.vercel.app) bleiben damit auch nach dem Umschalten noindex.
 */
function isIndexableHost(request: NextRequest): boolean {
  return (
    process.env.SITE_INDEXABLE?.trim().toLowerCase() === "true" &&
    request.nextUrl.host.toLowerCase() === hostOf(process.env.SITE_URL?.trim())
  );
}

function withRobots(request: NextRequest, response: NextResponse): NextResponse {
  if (!isIndexableHost(request)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const isPage = !pathname.startsWith("/api/") && !pathname.startsWith("/wp-content/");

  if (isPage && (request.method === "GET" || request.method === "HEAD")) {
    // Seiten immer mit abschließendem Schrägstrich (Dateien wie /robots.txt ausgenommen).
    if (!pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = `${pathname}/`;
      return withRobots(request, NextResponse.redirect(url, 308));
    }

    const target = (await redirectMap(origin)).get(normalize(pathname));
    if (target && target.destination !== normalize(pathname)) {
      return withRobots(request, NextResponse.redirect(new URL(target.destination, request.url), target.status));
    }
  }

  return withRobots(request, NextResponse.next());
}

export const config = {
  // Alles außer den statischen Build-Dateien und der Bildoptimierung.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
