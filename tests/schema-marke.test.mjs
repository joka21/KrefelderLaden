// Aufruf: npm test – Organization und BreadcrumbList (lib/schema/marke.ts).
import assert from "node:assert/strict";
import { test } from "node:test";

import { LOGO_PFAD, mitMarke } from "../lib/schema/marke.ts";

const BASE = "https://krefelder-laden.de";
const org = { "@type": "Organization", "@id": `${BASE}/#organization`, name: "Krefelder Laden", url: `${BASE}/` };
const seite = (url, name) => ({ "@type": "WebPage", "@id": `${url}#webpage`, url, name });

test("Organization bekommt Logo und Instagram", () => {
  const { "@graph": graph } = mitMarke({ "@graph": [org] }, BASE);
  assert.deepEqual(graph[0].logo, { "@type": "ImageObject", url: BASE + LOGO_PFAD });
  assert.deepEqual(graph[0].sameAs, ["https://www.instagram.com/krefelderladen/"]);
});

test("vorhandenes Logo und sameAs bleiben, Instagram nicht doppelt", () => {
  const vorher = { ...org, logo: "https://x/logo.png", sameAs: ["https://www.instagram.com/krefelderladen/", "https://y"] };
  const [nachher] = mitMarke({ "@graph": [vorher] }, BASE)["@graph"];
  assert.equal(nachher.logo, "https://x/logo.png");
  assert.deepEqual(nachher.sameAs, ["https://www.instagram.com/krefelderladen/", "https://y"]);
});

test("BreadcrumbList für Unterseiten ohne, Name ohne Site-Namen", () => {
  const url = `${BASE}/ratgeber/`;
  const { "@graph": graph } = mitMarke({ "@graph": [org, seite(url, "Ratgeber für Krefeld – Krefelder Laden")] }, BASE);
  const crumbs = graph.find((n) => n["@type"] === "BreadcrumbList");
  assert.deepEqual(
    crumbs.itemListElement.map(({ name, item }) => [name, item]),
    [["Krefelder Laden", `${BASE}/`], ["Ratgeber für Krefeld", url]],
  );
  assert.deepEqual(graph[1].breadcrumb, { "@id": `${url}#breadcrumb` });
});

test("keine BreadcrumbList auf der Startseite und keine zweite", () => {
  const home = mitMarke({ "@graph": [org, seite(`${BASE}/`, "Start")] }, BASE)["@graph"];
  assert.equal(home.filter((n) => n["@type"] === "BreadcrumbList").length, 0);
  const vorhanden = { "@type": "BreadcrumbList", "@id": "x" };
  const mit = mitMarke({ "@graph": [org, seite(`${BASE}/a/`, "A"), vorhanden] }, BASE)["@graph"];
  assert.equal(mit.filter((n) => n["@type"] === "BreadcrumbList").length, 1);
});

test("Schema ohne @graph bleibt unverändert", () => {
  const roh = { "@type": "Thing" };
  assert.equal(mitMarke(roh, BASE), roh);
});
