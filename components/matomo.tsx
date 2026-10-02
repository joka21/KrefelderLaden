"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

/**
 * Matomo ohne Cookies (disableCookies). Seitenwechsel ohne Neuladen werden
 * gezählt. Wird nur eingebunden, wenn NEXT_PUBLIC_MATOMO_URL und
 * NEXT_PUBLIC_MATOMO_SITE_ID gesetzt sind (siehe app/layout.tsx).
 */
export function Matomo({ url, siteId }: { url: string; siteId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);
  const base = url.endsWith("/") ? url : `${url}/`;

  useEffect(() => {
    const query = searchParams.toString();
    const href = window.location.origin + pathname + (query ? `?${query}` : "");

    // Erster Aufruf: trackPageView steht bereits in der Konfiguration unten.
    if (lastTracked.current === null) {
      lastTracked.current = href;
      return;
    }
    if (lastTracked.current === href) return;

    const paq = (window._paq = window._paq ?? []);
    paq.push(["setReferrerUrl", lastTracked.current]);
    paq.push(["setCustomUrl", href]);
    paq.push(["setDocumentTitle", document.title]);
    paq.push(["trackPageView"]);
    lastTracked.current = href;
  }, [pathname, searchParams]);

  return (
    <>
      <Script id="matomo-config" strategy="afterInteractive">
        {`var _paq = window._paq = window._paq || [];
_paq.push(['disableCookies']);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
_paq.push(['setTrackerUrl', ${JSON.stringify(base + "matomo.php")}]);
_paq.push(['setSiteId', ${JSON.stringify(siteId)}]);`}
      </Script>
      <Script id="matomo" src={`${base}matomo.js`} strategy="afterInteractive" />
    </>
  );
}
