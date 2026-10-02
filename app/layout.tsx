import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Suspense } from "react";

import { cantarell, notoSans } from "@/app/fonts";
import { Matomo } from "@/components/matomo";
import { PreviewBanner } from "@/components/preview-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/env";
import { getSettings } from "@/lib/kls";
import { robots } from "@/lib/seo";

import "./globals.css";

/** Gemeinsame Metadaten: Basis-URL, Robots (Schutz vor Indexierung), Verifizierung aus /settings. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const { google, bing } = settings.verification;

  return {
    metadataBase: new URL(siteUrl()),
    applicationName: settings.site.name,
    robots: robots(null),
    verification: {
      ...(google ? { google } : {}),
      ...(bing ? { other: { "msvalidate.01": bing } } : {}),
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { isEnabled: isPreview } = await draftMode();
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL?.trim();
  const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID?.trim();

  return (
    <html lang="de" className={`${cantarell.variable} ${notoSans.variable}`}>
      <body className="flex min-h-dvh flex-col bg-white font-body text-ink antialiased">
        <a
          href="#inhalt"
          className="sr-only rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Zum Inhalt springen
        </a>
        {isPreview ? <PreviewBanner /> : null}
        <SiteHeader />
        <main id="inhalt" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/* Tracking nur, wenn beide Matomo-Variablen gesetzt sind; sonst kein Code im HTML. */}
        {matomoUrl && matomoSiteId ? (
          <Suspense fallback={null}>
            <Matomo url={matomoUrl} siteId={matomoSiteId} />
          </Suspense>
        ) : null}
      </body>
    </html>
  );
}
