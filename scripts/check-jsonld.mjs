// Prüft das JSON-LD der Kernseiten im ausgelieferten HTML.
// Nur lokal ausführen, nicht Teil der Website.
//
// Aufruf: node scripts/check-jsonld.mjs [--origin url]
//   ohne --origin: https://krefelder-laden.de
//   lokal nach `npm run build`: `npx next start -p 3002` und --origin http://localhost:3002
//
// Je Seite: genau ein JSON-LD-Block, gültiges JSON, erwartete Typen, eindeutige
// @id, Organization mit Logo und sameAs, Pflichtfelder für Event und Recipe.
// Exit-Code 1 bei einem Fehler.
import * as cheerio from "cheerio";

const originIndex = process.argv.indexOf("--origin");
const ORIGIN = (originIndex > 0 ? process.argv[originIndex + 1] : "https://krefelder-laden.de").replace(/\/+$/, "");

/**
 * Kernseiten mit den Typen, die im Graph stehen müssen, und optional solchen,
 * deren Fehlen nur ein Hinweis ist (Recipe braucht ein Beitragsbild).
 */
const SEITEN = [
  ["/", ["Organization", "WebSite"]],
  ["/troedelmarkt-krefeld/", ["Event", "FAQPage", "BreadcrumbList"]],
  ["/weihnachtsmaerkte-in-krefeld/", ["Event", "FAQPage", "BreadcrumbList"]],
  ["/second-hand-krefeld/", ["ItemList", "FAQPage", "BreadcrumbList"]],
  ["/hilfe-finden/", ["CollectionPage", "FAQPage", "BreadcrumbList"]],
  ["/hilfe-finden/einrichtung/jugendeinrichtung-stahlnetz/", ["LocalBusiness", "BreadcrumbList"]],
  ["/ratgeber/", ["CollectionPage", "BreadcrumbList"]],
  ["/niederrhein-tapas/", ["CollectionPage", "BreadcrumbList"]],
  ["/ratgeber/blumenkohlgratin-mit-senf/", ["BlogPosting", "BreadcrumbList"], ["Recipe"]],
];

const typen = (knoten) => [knoten["@type"]].flat().filter(Boolean);

function pruefeEvent(event) {
  const fehler = [];
  if (!event.name) fehler.push("name fehlt");
  if (!/^\d{4}-\d\d-\d\d(T\d\d:\d\d:\d\d[+-]\d\d:\d\d)?$/.test(event.startDate ?? "")) fehler.push(`startDate „${event.startDate}“`);
  if (event.endDate && !/^\d{4}-\d\d-\d\d(T\d\d:\d\d:\d\d[+-]\d\d:\d\d)?$/.test(event.endDate)) fehler.push(`endDate „${event.endDate}“`);
  if (event.endDate && event.endDate.slice(0, 10) < event.startDate.slice(0, 10)) fehler.push("endDate vor startDate");
  if (event.location?.["@type"] !== "Place" || !event.location?.address?.addressLocality) fehler.push("location/address");
  if (!event.eventStatus?.startsWith("https://schema.org/Event")) fehler.push("eventStatus");
  return fehler.map((text) => `Event „${event.name}“: ${text}`);
}

function pruefeRezept(rezept) {
  const fehler = [];
  if (!rezept.name) fehler.push("name fehlt");
  if (!rezept.image || (Array.isArray(rezept.image) && rezept.image.length === 0)) fehler.push("image fehlt");
  if (!Array.isArray(rezept.recipeIngredient) || rezept.recipeIngredient.length === 0) fehler.push("recipeIngredient fehlt");
  if (!Array.isArray(rezept.recipeInstructions) || rezept.recipeInstructions.length === 0) fehler.push("recipeInstructions fehlt");
  return fehler.map((text) => `Recipe: ${text}`);
}

let fehlerGesamt = 0;
for (const [pfad, erwartet, optional = []] of SEITEN) {
  const fehler = [];
  const hinweise = [];
  const antwort = await fetch(ORIGIN + pfad, { redirect: "manual" });
  if (antwort.status !== 200) {
    fehler.push(`Status ${antwort.status}`);
  } else {
    const $ = cheerio.load(await antwort.text());
    const bloecke = $('script[type="application/ld+json"]');
    if (bloecke.length !== 1) fehler.push(`${bloecke.length} JSON-LD-Blöcke statt 1`);
    let graph = [];
    try {
      const daten = JSON.parse(bloecke.first().html() ?? "");
      graph = daten["@graph"] ?? [daten];
      if (daten["@context"] !== "https://schema.org") fehler.push(`@context „${daten["@context"]}“`);
    } catch (error) {
      fehler.push(`ungültiges JSON: ${error.message}`);
    }
    const vorhanden = new Set(graph.flatMap(typen));
    for (const typ of erwartet) {
      if (!vorhanden.has(typ)) fehler.push(`${typ} fehlt`);
    }
    for (const typ of optional) {
      if (!vorhanden.has(typ)) hinweise.push(`Hinweis: ${typ} fehlt${typ === "Recipe" ? " (Beitragsbild fehlt?)" : ""}`);
    }
    const ids = graph.map((knoten) => knoten["@id"]).filter(Boolean);
    if (new Set(ids).size !== ids.length) fehler.push("doppelte @id");
    const org = graph.find((knoten) => typen(knoten).includes("Organization"));
    if (!org?.logo) fehler.push("Organization ohne logo");
    if (!org?.sameAs?.length) fehler.push("Organization ohne sameAs");
    for (const knoten of graph) {
      if (typen(knoten).includes("Event")) fehler.push(...pruefeEvent(knoten));
      if (typen(knoten).includes("Recipe")) fehler.push(...pruefeRezept(knoten));
    }
    const anzahl = Object.entries(
      graph.flatMap(typen).reduce((zaehler, typ) => ({ ...zaehler, [typ]: (zaehler[typ] ?? 0) + 1 }), {}),
    )
      .map(([typ, n]) => (n > 1 ? `${typ} ×${n}` : typ))
      .join(", ");
    console.log(`${fehler.length ? "FEHLER" : "ok    "} ${pfad}  [${anzahl}]`);
  }
  for (const text of [...fehler, ...hinweise]) console.log(`       - ${text}`);
  fehlerGesamt += fehler.length;
}

console.log(fehlerGesamt ? `\n${fehlerGesamt} Fehler` : "\nAlle Kernseiten ok.");
process.exitCode = fehlerGesamt ? 1 : 0;
