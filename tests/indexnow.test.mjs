// Aufruf: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { INDEXNOW_KEY, indexNowMeldung, indexNowPfade, sollMelden } from "../lib/indexnow.ts";

test("Schlüsseldatei in public/ enthält genau den Schlüssel", () => {
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/);
  assert.equal(readFileSync(new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url), "utf8"), INDEXNOW_KEY);
});

test("nur Seitenpfade, ohne Doppelte", () => {
  assert.deepEqual(indexNowPfade(["/", "/a/", "/a/", "/api/revalidate", "/sitemap.xml", "//evil/", "relativ/"]), ["/", "/a/"]);
});

test("Meldung mit Host, Schlüssel-URL und absoluten, kodierten URLs", () => {
  const meldung = indexNowMeldung("https://krefelder-laden.de/", ["/troedelmarkt-krefeld/", "/hilfe-finden/einrichtung/caf\u00e9/"]);
  assert.deepEqual(meldung, {
    host: "krefelder-laden.de",
    key: INDEXNOW_KEY,
    keyLocation: `https://krefelder-laden.de/${INDEXNOW_KEY}.txt`,
    urlList: ["https://krefelder-laden.de/troedelmarkt-krefeld/", "https://krefelder-laden.de/hilfe-finden/einrichtung/caf%C3%A9/"],
  });
  assert.equal(indexNowMeldung("https://krefelder-laden.de", ["/api/x"]), null);
});

test("gemeldet wird nur aus Production mit SITE_INDEXABLE=true", () => {
  assert.equal(sollMelden({ VERCEL_ENV: "production", SITE_INDEXABLE: "true" }), true);
  assert.equal(sollMelden({ VERCEL_ENV: "preview", SITE_INDEXABLE: "true" }), false);
  assert.equal(sollMelden({ VERCEL_ENV: "production", SITE_INDEXABLE: "" }), false);
  assert.equal(sollMelden({}), false);
});
