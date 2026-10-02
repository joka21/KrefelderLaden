import "server-only";

import type { Metadata } from "next";

import { isIndexable, siteUrl } from "@/lib/env";
import type { KlsContent, KlsImage, KlsRobots, KlsSettings } from "@/lib/kls";
import { absoluteUpload, onSiteUrl } from "@/lib/urls";

/**
 * Metadaten aus dem SEO-Block der API.
 *
 * Title, Description, Canonical, Robots und Open Graph kommen unverändert aus
 * der API (eigene Fallbacks werden nicht berechnet). Angepasst werden nur:
 * - Robots: Solange SITE_INDEXABLE nicht „true“ ist, gilt immer noindex, nofollow.
 * - URLs: Canonical und og:url zeigen auf SITE_URL, Bild-URLs auf /wp-content/uploads
 *   der Frontend-Domain (WordPress-Domain unsichtbar).
 */

export function robots(api: KlsRobots | null): Metadata["robots"] {
  if (!isIndexable()) {
    return { index: false, follow: false };
  }
  return api ? { index: api.index, follow: api.follow } : { index: true, follow: true };
}

function ogImages(image: KlsImage | null) {
  if (!image) {
    return undefined;
  }
  return [
    {
      url: absoluteUpload(image.url),
      ...(image.width ? { width: image.width } : {}),
      ...(image.height ? { height: image.height } : {}),
      ...(image.alt ? { alt: image.alt } : {}),
    },
  ];
}

/** Metadaten für Inhalte aus /content bzw. /preview. */
export function contentMetadata(content: KlsContent, settings: KlsSettings): Metadata {
  const { seo } = content;
  const frontend = settings.site.frontend_url;
  const canonical = onSiteUrl(seo.canonical, frontend);
  const images = ogImages(seo.og.image);

  return {
    title: { absolute: seo.title },
    description: seo.description || undefined,
    alternates: { canonical },
    robots: robots(seo.robots),
    openGraph: {
      title: seo.og.title,
      description: seo.og.description || undefined,
      url: onSiteUrl(seo.og.url, frontend),
      siteName: seo.og.site_name,
      locale: seo.og.locale,
      images,
      ...(seo.og.type === "article"
        ? {
            type: "article",
            publishedTime: seo.og.published_time ?? undefined,
            modifiedTime: seo.og.modified_time ?? undefined,
          }
        : { type: "website" }),
    },
    twitter: {
      card: seo.twitter.card,
      title: seo.og.title,
      description: seo.og.description || undefined,
      images: images?.map((image) => image.url),
    },
  };
}

/** Titel nach dem Muster der API: „{Titel} {Trenner} {Site-Name}“. */
export function pageTitle(title: string, settings: KlsSettings): string {
  return `${title} ${settings.title_separator} ${settings.site.name}`;
}

/**
 * Metadaten für Frontend-Seiten ohne eigenen Inhalt in WordPress (Startseite
 * ohne front_page, Ratgeber-Übersicht). Werte aus /settings.
 */
export function defaultMetadata(
  settings: KlsSettings,
  { title, description, path }: { title: string; description: string; path: string },
): Metadata {
  const url = siteUrl() + path;
  const images = ogImages(settings.og_fallback_image);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: robots(null),
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: settings.site.name,
      locale: settings.site.locale,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

/**
 * JSON-LD für Frontend-Seiten ohne Schema aus der API, nach dem Muster der API
 * (gleiche @id-Werte für Organization und WebSite).
 */
export function defaultSchema(
  settings: KlsSettings,
  { name, path, type = "WebPage" }: { name: string; path: string; type?: "WebPage" | "CollectionPage" },
) {
  const home = `${siteUrl()}/`;
  const url = siteUrl() + path;
  const org = settings.organization;
  const address = Object.values(org.address).some(Boolean)
    ? {
        "@type": "PostalAddress",
        ...(org.address.street ? { streetAddress: org.address.street } : {}),
        ...(org.address.postal_code ? { postalCode: org.address.postal_code } : {}),
        ...(org.address.locality ? { addressLocality: org.address.locality } : {}),
        ...(org.address.country ? { addressCountry: org.address.country } : {}),
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${home}#organization`,
        name: org.name || settings.site.name,
        url: home,
        ...(org.logo ? { logo: absoluteUpload(org.logo.url) } : {}),
        ...(address ? { address } : {}),
        ...(org.telephone ? { telephone: org.telephone } : {}),
        ...(org.email ? { email: org.email } : {}),
        ...(org.same_as.length ? { sameAs: org.same_as } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: settings.site.name,
        inLanguage: settings.site.language,
        publisher: { "@id": `${home}#organization` },
      },
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name,
        isPartOf: { "@id": `${home}#website` },
        inLanguage: settings.site.language,
      },
    ],
  };
}
