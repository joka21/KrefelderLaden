import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/*
 * WordPress-Adresse nur aus der Umgebungsvariablen (nie fest im Code).
 * Hinweis: Rewrites werden beim Build festgelegt – nach einer Änderung von
 * KLS_WP_URL (z. B. Umzug auf die Subdomain) neu bauen bzw. neu deployen.
 */
const wpUrl = process.env.KLS_WP_URL?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Lauffähig ohne Vercel-Dienste, z. B. mit `node .next/standalone/server.js`.
  output: "standalone",
  // Pfade wie in WordPress: immer mit abschließendem Schrägstrich.
  trailingSlash: true,
  // Die Schrägstrich-Weiterleitung übernimmt proxy.ts – nur für Seiten. API-Routen
  // bleiben ohne Weiterleitung erreichbar (WordPress sendet an /api/revalidate und
  // folgt keinen Weiterleitungen).
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,

  async rewrites() {
    if (!wpUrl) {
      console.warn("KLS_WP_URL fehlt: /wp-content/uploads wird nicht weitergeleitet.");
      return [];
    }
    return [
      // Bilder aus WordPress über die Frontend-Domain ausliefern (WordPress-Domain unsichtbar).
      { source: "/wp-content/uploads/:path*", destination: `${wpUrl}/wp-content/uploads/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

/**
 * Beim Build eine Zeile mit dem Wert von SITE_INDEXABLE, damit im Build-Log
 * sichtbar ist, ob die Seiten indexierbar erzeugt werden. Gleiche Auswertung wie
 * isIndexable() in lib/env.ts (dort nicht importierbar: server-only).
 */
function logIndexable(): void {
  // Next.js lädt die Konfiguration beim Build mehrfach (auch in Kindprozessen,
  // die die Umgebung erben) – die Zeile nur einmal ausgeben.
  if (process.env.KL_INDEXABLE_LOGGED) {
    return;
  }
  process.env.KL_INDEXABLE_LOGGED = "1";

  const value = process.env.SITE_INDEXABLE?.trim() ?? "";
  const indexable = value.toLowerCase() === "true";
  console.log(`SITE_INDEXABLE: ${value || "(nicht gesetzt)"} (${indexable ? "indexierbar" : "noindex"})`);
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    logIndexable();
  }
  return nextConfig;
}
