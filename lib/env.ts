import "server-only";

/**
 * Zugriff auf die Umgebungsvariablen (nur serverseitig).
 *
 * Secrets und die WordPress-Adresse stehen ausschließlich hier und werden nie
 * an den Browser gegeben (keine NEXT_PUBLIC_-Variablen).
 */

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Umgebungsvariable ${name} fehlt (siehe .env.example).`);
  }
  return value;
}

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Basis-URL von WordPress ohne abschließenden Schrägstrich, z. B. https://krefelder-laden.de */
export function wpUrl(): string {
  return withoutTrailingSlash(required("KLS_WP_URL"));
}

/** Site-Slug im Hub, z. B. krefelder-laden */
export function klsSite(): string {
  return required("KLS_SITE");
}

export function klsApiKey(): string {
  return required("KLS_API_KEY");
}

/** Secret für /api/revalidate; leer = Route lehnt jede Anfrage ab. */
export function revalidateSecret(): string {
  return process.env.KLS_REVALIDATE_SECRET?.trim() ?? "";
}

/** Secret für /api/preview; leer = Route lehnt jede Anfrage ab. */
export function previewSecret(): string {
  return process.env.KLS_PREVIEW_SECRET?.trim() ?? "";
}

/** Endgültige Domain des Frontends ohne abschließenden Schrägstrich, z. B. https://krefelder-laden.de */
export function siteUrl(): string {
  return withoutTrailingSlash(required("SITE_URL"));
}

/** Darf die Website indexiert werden? Nur bei genau „true“ (Standard: nein). */
export function isIndexable(): boolean {
  return process.env.SITE_INDEXABLE?.trim().toLowerCase() === "true";
}
