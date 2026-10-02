import "server-only";

import { createHash } from "node:crypto";

import { klsApiKey, klsSite, previewSecret, wpUrl } from "@/lib/env";

/**
 * Zugriff auf die REST-API kls/v1 von KL Setup (headless-Hub).
 *
 * Alle Typen folgen dem Abschnitt „API-Vertrag“ in der readme.txt von
 * kl-setup (Version 3.1.0). Alle Aufrufe laufen ausschließlich serverseitig;
 * der API-Key verlässt den Server nie.
 */

/* ------------------------------------------------------------------ */
/* Typen                                                               */
/* ------------------------------------------------------------------ */

/** Bildobjekt (überall gleich): absolute URL auf der WordPress-Domain. */
export interface KlsImage {
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
}

export interface KlsSettings {
  site: {
    slug: string;
    name: string;
    frontend_url: string;
    locale: string;
    language: string;
  };
  organization: {
    name: string;
    logo: KlsImage | null;
    address: { street: string; postal_code: string; locality: string; country: string };
    telephone: string;
    email: string;
    same_as: string[];
  };
  title_separator: string;
  og_fallback_image: KlsImage | null;
  verification: { google: string; bing: string };
}

export interface KlsRobots {
  index: boolean;
  follow: boolean;
  content: string;
}

export interface KlsSeo {
  title: string;
  description: string;
  canonical: string;
  robots: KlsRobots;
  og: {
    title: string;
    description: string;
    url: string;
    type: "article" | "website";
    site_name: string;
    locale: string;
    image: KlsImage | null;
    published_time?: string | null;
    modified_time?: string | null;
  };
  twitter: { card: "summary_large_image" };
}

export interface KlsSchema {
  "@context": string;
  "@graph": Record<string, unknown>[];
}

export interface KlsBreadcrumb {
  name: string;
  path: string;
  url: string;
}

export interface KlsTerm {
  id: number;
  name: string;
  slug: string;
}

export interface KlsContent {
  id: number;
  type: string;
  site: string;
  path: string;
  url: string;
  status: string;
  title: string;
  content: string;
  excerpt: string;
  date: string | null;
  modified: string | null;
  author: { name: string };
  parent: { id: number; path: string } | null;
  featured_image: KlsImage | null;
  terms: Record<string, KlsTerm[]>;
  password_protected: boolean;
  seo: KlsSeo;
  schema: KlsSchema;
  breadcrumbs: KlsBreadcrumb[];
  /** Nur bei /preview. */
  preview?: true;
}

export interface KlsPathItem {
  path: string;
  lastmod: string;
  type: string;
  id: number;
}

export interface KlsPostItem {
  id: number;
  type: string;
  path: string;
  title: string;
  excerpt: string;
  date: string | null;
  modified: string | null;
  featured_image: KlsImage | null;
  noindex: boolean;
}

export interface KlsPostsPage {
  items: KlsPostItem[];
  total: number;
  total_pages: number;
  page: number;
  limit: number;
}

export interface KlsRedirect {
  source: string;
  destination: string;
  status_code: number;
  permanent: boolean;
}

/** Fehlerformat (WordPress-Standard). */
export interface KlsError {
  code: string;
  message: string;
  data?: {
    status?: number;
    path?: string;
    redirect?: { destination: string; status_code: number } | null;
    allowed?: string[];
  };
}

export class KlsApiError extends Error {
  constructor(
    readonly endpoint: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(`kls/v1 ${endpoint}: HTTP ${status} ${code}`);
    this.name = "KlsApiError";
  }
}

/* ------------------------------------------------------------------ */
/* Cache-Tags                                                          */
/* ------------------------------------------------------------------ */

/**
 * Jeder Abruf trägt das Tag „kls“ plus ein spezifisches Tag. /api/revalidate
 * läuft damit gezielt ab (siehe app/api/revalidate/route.ts).
 */
export const TAGS = {
  all: "kls",
  settings: "kls:settings",
  paths: "kls:paths",
  posts: "kls:posts",
  redirects: "kls:redirects",
  /** Inhalt eines Pfads; lange Pfade werden gehasht (Tags max. 256 Zeichen). */
  content(path: string): string {
    const tag = `kls:content:${path}`;
    return tag.length <= 200 ? tag : `kls:content:#${createHash("sha256").update(path).digest("hex")}`;
  },
} as const;

/** Sicherheitsnetz: zeitbasierte Revalidierung, falls ein Webhook ausbleibt (Sekunden). */
export const REVALIDATE_SECONDS = 3600;

/* ------------------------------------------------------------------ */
/* Abruf                                                               */
/* ------------------------------------------------------------------ */

type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: KlsError };

interface RequestOptions {
  tags?: string[];
  /** Kein Cache (Vorschau). */
  noStore?: boolean;
  headers?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  options: RequestOptions = {},
): Promise<Result<T>> {
  const url = new URL(`${wpUrl()}/wp-json/kls/v1/${encodeURIComponent(klsSite())}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-KLS-Key": klsApiKey(), ...options.headers },
    ...(options.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: REVALIDATE_SECONDS, tags: [TAGS.all, ...(options.tags ?? [])] } }),
  });

  const body: unknown = await response.json().catch(() => null);

  if (response.ok) {
    return { ok: true, data: body as T };
  }

  const error = (body ?? {}) as KlsError;
  return {
    ok: false,
    status: response.status,
    error: { code: error.code ?? "unknown", message: error.message ?? "", data: error.data },
  };
}

function unwrap<T>(endpoint: string, result: Result<T>): T {
  if (!result.ok) {
    throw new KlsApiError(endpoint, result.status, result.error.code);
  }
  return result.data;
}

/** GET /{site}/settings */
export async function getSettings(): Promise<KlsSettings> {
  return unwrap("settings", await request<KlsSettings>("settings", {}, { tags: [TAGS.settings] }));
}

export type ContentResult =
  | { found: true; content: KlsContent }
  | { found: false; redirect: { destination: string; status_code: number } | null };

/**
 * GET /{site}/content?path= – 404 `kls_not_found` ist kein Fehler, sondern
 * „nicht gefunden“ (ggf. mit Weiterleitung). Andere Fehler werfen, damit eine
 * bereits erzeugte Seite bei einem API-Ausfall erhalten bleibt.
 */
export async function getContent(path: string): Promise<ContentResult> {
  const result = await request<KlsContent>("content", { path }, { tags: [TAGS.content(path)] });

  if (result.ok) {
    return { found: true, content: result.data };
  }
  if (result.status === 404 && result.error.code === "kls_not_found") {
    return { found: false, redirect: result.error.data?.redirect ?? null };
  }
  throw new KlsApiError("content", result.status, result.error.code);
}

/** GET /{site}/paths – veröffentlichte, indexierbare Pfade. */
export async function getPaths(): Promise<KlsPathItem[]> {
  const data = unwrap(
    "paths",
    await request<{ site: string; count: number; items: KlsPathItem[] }>("paths", {}, { tags: [TAGS.paths] }),
  );
  return data.items;
}

/** Menge der veröffentlichten Pfade (für Navigation und Kacheln). */
export async function getPublishedPaths(): Promise<Set<string>> {
  return new Set((await getPaths()).map((item) => item.path));
}

/** GET /{site}/posts – neueste zuerst; limit 1–100, page ab 1. */
export async function getPosts(limit: number, page = 1): Promise<KlsPostsPage> {
  return unwrap("posts", await request<KlsPostsPage>("posts", { limit, page }, { tags: [TAGS.posts] }));
}

/** GET /{site}/redirects */
export async function getRedirects(): Promise<KlsRedirect[]> {
  const data = unwrap(
    "redirects",
    await request<{ site: string; count: number; items: KlsRedirect[] }>("redirects", {}, { tags: [TAGS.redirects] }),
  );
  return data.items;
}

/**
 * GET /{site}/preview?id= – Entwurf für den Draft Mode (nie gecacht).
 * Liefert null bei 404 bzw. ungültigem Preview-Secret.
 */
export async function getPreview(id: number): Promise<KlsContent | null> {
  const secret = previewSecret();
  if (!secret) {
    return null;
  }

  const result = await request<KlsContent>("preview", { id }, { noStore: true, headers: { "X-KLS-Preview-Secret": secret } });

  if (result.ok) {
    return result.data;
  }
  if (result.status === 404 || result.status === 401) {
    return null;
  }
  throw new KlsApiError("preview", result.status, result.error.code);
}
