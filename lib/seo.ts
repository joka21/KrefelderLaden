import "server-only";

import type { Metadata } from "next";

import { decodeEntities } from "@/lib/entities";
import { isIndexable, siteUrl } from "@/lib/env";
import type { KlsContent, KlsImage, KlsRobots, KlsSchema, KlsSettings } from "@/lib/kls";
import { fitTitle, MAX_TITLE_LENGTH } from "@/lib/titles";
import { absoluteUpload, onSiteUrl } from "@/lib/urls";

/**
 * Metadaten aus dem SEO-Block der API.
 *
 * Title, Description, Canonical, Robots und Open Graph kommen aus der API.
 * Angepasst werden nur:
 * - Title: bei Einrichtungen und Beiträgen höchstens 60 Zeichen (contentTitle).
 * - Robots: Solange SITE_INDEXABLE nicht „true“ ist, gilt immer noindex, nofollow.
 * - URLs: Canonical und og:url zeigen auf SITE_URL, Bild-URLs auf /wp-content/uploads
 *   der Frontend-Domain (WordPress-Domain unsichtbar). Ohne Canonical aus der API
 *   gilt die eigene URL (SITE_URL + Pfad).
 * - Bild: Liefert die API kein Bild, gilt das statische Standardbild DEFAULT_OG_IMAGE.
 */

/**
 * Standard-Vorschaubild (public/images/og-standard.png, erzeugt mit
 * scripts/build-og-image.py) für og:image und twitter:image.
 */
const DEFAULT_OG_IMAGE = {
  path: "/images/og-standard.png",
  width: 1200,
  height: 630,
  alt: "Logo des Krefelder Ladens und gezeichnete Krähe",
} as const;

export function robots(api: KlsRobots | "noindex" | null): Metadata["robots"] {
  if (!isIndexable()) {
    return { index: false, follow: false };
  }
  if (api === "noindex") {
    return { index: false, follow: true };
  }
  return api ? { index: api.index, follow: api.follow } : { index: true, follow: true };
}

function ogImages(image: KlsImage | null) {
  if (!image) {
    const { path, ...rest } = DEFAULT_OG_IMAGE;
    return [{ url: siteUrl() + path, ...rest }];
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

/**
 * Seitentitel eines Inhalts: seo.title aus der API, bei mehr als 60 Zeichen mit
 * fitTitle gekürzt – bei Einrichtungen immer, bei Beiträgen nur, wenn seo.title
 * der WordPress-Fallback „{Titel} {Trenner} {Site-Name}“ ist (eigene SEO-Titel
 * bleiben unverändert).
 */
export function contentTitle(content: KlsContent, settings: KlsSettings): string {
  const { title } = content.seo;
  if (title.length <= MAX_TITLE_LENGTH) {
    return title;
  }

  const name = decodeEntities(content.title);
  const isFallback = title === pageTitle(name, settings);
  if (content.type === "anbieter" || (content.type === "post" && isFallback)) {
    return fitTitle(name, settings.site.name, { separator: settings.title_separator });
  }
  return title;
}

/** JSON-LD der API mit angepasstem Seitentitel im WebPage-Knoten (name = seo.title). */
export function contentSchema(content: KlsContent, settings: KlsSettings): KlsSchema {
  const title = contentTitle(content, settings);
  if (title === content.seo.title) {
    return content.schema;
  }
  return {
    ...content.schema,
    "@graph": content.schema["@graph"].map((node) =>
      node["@type"] === "WebPage" && node.name === content.seo.title ? { ...node, name: title } : node,
    ),
  };
}

/** Metadaten für Inhalte aus /content bzw. /preview. */
export function contentMetadata(content: KlsContent, settings: KlsSettings): Metadata {
  const { seo } = content;
  const frontend = settings.site.frontend_url;
  const canonical = seo.canonical ? onSiteUrl(seo.canonical, frontend) : siteUrl() + content.path;
  const title = contentTitle(content, settings);
  // og:title ist in der API gleich seo.title; ein abweichender Wert bleibt erhalten.
  const ogTitle = seo.og.title === seo.title ? title : seo.og.title;
  const images = ogImages(seo.og.image);

  return {
    title: { absolute: title },
    description: seo.description || undefined,
    alternates: { canonical },
    robots: robots(seo.robots),
    openGraph: {
      title: ogTitle,
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
      title: ogTitle,
      description: seo.og.description || undefined,
      images,
    },
  };
}

/** Titel nach dem Muster der API: „{Titel} {Trenner} {Site-Name}“. */
export function pageTitle(title: string, settings: KlsSettings): string {
  return `${title} ${settings.title_separator} ${settings.site.name}`;
}

/**
 * Metadaten für Frontend-Seiten ohne eigenen Inhalt in WordPress (Startseite
 * ohne front_page, Ratgeber-Übersicht, Kategorieseiten). Werte aus /settings;
 * noindex z. B. für leere Kategorien.
 */
export function defaultMetadata(
  settings: KlsSettings,
  { title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean },
): Metadata {
  const url = siteUrl() + path;
  const images = ogImages(settings.og_fallback_image);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: robots(noindex ? "noindex" : null),
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
      images,
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
