// Crawlt krefelder-laden.de und meldet auffällige URLs (nicht in der Sitemap,
// kein Canonical im <head>, Status ≠ 200, Canonical ≠ eigene URL).
// Nur lokal ausführen, nicht Teil der Website.
//
// Aufruf: node scripts/crawl-check.mjs [browser|semrush|googlebot] [--slash] [--json datei] [--origin url]
//
// --origin: andere Adresse prüfen, z. B. ein Vercel-Preview. URLs von
// krefelder-laden.de in Sitemap, Canonical und Links gelten dann als URLs dieser
// Adresse. Bei geschütztem Preview das Bypass-Secret in
// VERCEL_AUTOMATION_BYPASS_SECRET setzen.
//
// --slash: statt zu crawlen jede Sitemap-URL ohne abschließenden Schrägstrich
// aufrufen und prüfen, dass genau eine Weiterleitung (301/308) direkt auf die
// Sitemap-URL führt und diese mit 200 antwortet.
import { writeFileSync } from "node:fs";

import * as cheerio from "cheerio";

const SITE = "https://krefelder-laden.de";
const originIndex = process.argv.indexOf("--origin");
const ORIGIN = originIndex > 0 ? process.argv[originIndex + 1].replace(/\/+$/, "") : SITE;
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/** URL von SITE → gleiche URL auf ORIGIN (ohne --origin unverändert). */
const local = (url) => (url.startsWith(`${SITE}/`) ? ORIGIN + url.slice(SITE.length) : url);

const MAX_URLS = 500;
const DELAY_MS = 1000;

const USER_AGENTS = {
  browser:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  semrush: "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
  googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
};

/** Zusätzlich geprüfte URLs (Varianten, alte WordPress-Pfade, Paginierung). */
const EXTRA = [
  ...(ORIGIN === SITE ? ["https://www.krefelder-laden.de/", "http://krefelder-laden.de/"] : []),
  `${ORIGIN}/2026/09/24/krefeld-und-seine-geschichte-von-den-roemern-zur-samt-und-seidenstadt/`,
  `${ORIGIN}/hilfe`,
  `${ORIGIN}/ratgeber`,
  `${ORIGIN}/impressum`,
  `${ORIGIN}/hilfe/stadtbezirk/ost`,
  `${ORIGIN}/hilfe/einrichtung/altenheim-st-josef`,
  `${ORIGIN}/ratgeber/weihnachtszeit-in-krefeld`,
  `${ORIGIN}/ratgeber/seite/1/`,
  `${ORIGIN}/ratgeber/seite/2/`,
  `${ORIGIN}/ratgeber/page/2/`,
  `${ORIGIN}/page/2/`,
  `${ORIGIN}/hilfe/einrichtung/`,
  `${ORIGIN}/hilfe/stadtbezirk/`,
  `${ORIGIN}/hilfe-finden`,
  `${ORIGIN}/hilfe-finden/stadtbezirk/ost`,
  `${ORIGIN}/hilfe-finden/einrichtung/altenheim-st-josef`,
  `${ORIGIN}/hilfe-finden/einrichtung/`,
  `${ORIGIN}/hilfe-finden/stadtbezirk/`,
  `${ORIGIN}/hilfe-finden/seite/1/`,
  `${ORIGIN}/weihnachten/`,
  `${ORIGIN}/second-hand/`,
  `${ORIGIN}/niederrhein-tapas/`,
  `${ORIGIN}/mein-krefeld/`,
  `${ORIGIN}/second-hand/seite/2/`,
  `${ORIGIN}/category/allgemein/`,
  `${ORIGIN}/feed/`,
  `${ORIGIN}/?p=1`,
  `${ORIGIN}/?s=krefeld`,
  `${ORIGIN}/index.php`,
];

const mode = USER_AGENTS[process.argv[2]] ? process.argv[2] : "browser";
const slashMode = process.argv.includes("--slash");
const jsonIndex = process.argv.indexOf("--json");
const jsonFile = jsonIndex > 0 ? process.argv[jsonIndex + 1] : null;
const userAgent = USER_AGENTS[mode];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequest = 0;
async function get(url) {
  const wait = lastRequest + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  return fetch(url, { redirect: "manual", headers: headers() });
}

function headers() {
  return { "user-agent": userAgent, ...(BYPASS ? { "x-vercel-protection-bypass": BYPASS } : {}) };
}

/** Interne URL ohne Fragment, sonst null. */
function normalize(href, base) {
  let url;
  try {
    url = new URL(href, base);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "krefelder-laden.de" && host !== new URL(ORIGIN).hostname) return null;
  if (/^\/(_next|wp-content|wp-json|api)\//.test(url.pathname)) return null;
  if (/\.(png|jpe?g|webp|gif|svg|ico|pdf|css|js|woff2?|txt|xml)$/i.test(url.pathname)) return null;
  url.hash = "";
  return local(url.toString());
}

async function loadSitemap() {
  const response = await fetch(`${ORIGIN}/sitemap.xml`, { headers: headers() });
  const $ = cheerio.load(await response.text(), { xml: true });
  return new Set($("loc").map((_, el) => local($(el).text().trim())).get());
}

async function crawl() {
  const sitemap = await loadSitemap();
  const queue = [`${ORIGIN}/`, ...EXTRA];
  const sources = new Map(queue.map((url) => [url, new Set([url === `${ORIGIN}/` ? "(Start)" : "(Zusatzliste)"])]));
  const seen = new Set(queue);
  const results = [];

  const enqueue = (url, from) => {
    if (!sources.has(url)) sources.set(url, new Set());
    sources.get(url).add(from);
    if (!seen.has(url) && seen.size < MAX_URLS) {
      seen.add(url);
      queue.push(url);
    }
  };

  while (queue.length > 0) {
    const url = queue.shift();
    const row = { url, status: 0, location: "", canonical: "", canonicalInBody: false, robots: "", inSitemap: sitemap.has(url) };
    try {
      const response = await get(url);
      row.status = response.status;
      const location = response.headers.get("location");
      if (location) {
        row.location = new URL(location, url).toString();
        const target = normalize(row.location, url);
        if (target) enqueue(target, `Weiterleitung von ${url}`);
      }
      const type = response.headers.get("content-type") ?? "";
      if (type.includes("text/html")) {
        const $ = cheerio.load(await response.text());
        row.canonical = local($("head link[rel='canonical']").attr("href") ?? "");
        row.canonicalInBody = !row.canonical && $("body link[rel='canonical']").length > 0;
        row.robots = $("head meta[name='robots']").attr("content") ?? "";
        if (response.status === 200) {
          $("a[href]").each((_, el) => {
            const target = normalize($(el).attr("href"), url);
            if (target) enqueue(target, url);
          });
        }
      } else {
        await response.arrayBuffer();
      }
    } catch (error) {
      row.status = `Fehler: ${error.message}`;
    }
    results.push(row);
    process.stderr.write(`\r${results.length} geprüft, ${queue.length} offen   `);
  }
  process.stderr.write("\n");

  for (const row of results) row.sources = [...(sources.get(row.url) ?? [])];
  return { sitemap, results };
}

function issues(row) {
  const list = [];
  if (!row.inSitemap) list.push("nicht in Sitemap");
  if (row.status !== 200) list.push(`Status ${row.status}`);
  if (row.status === 200 && !row.canonical) list.push(row.canonicalInBody ? "Canonical nur im <body>" : "kein Canonical");
  if (row.canonical && row.canonical !== row.url) list.push("Canonical ≠ eigene URL");
  return list;
}

/** Weiterleitungskette ab url (höchstens 10 Schritte): [{ url, status, location }]. */
async function chain(url) {
  const hops = [];
  let current = url;
  for (let step = 0; step < 10; step++) {
    const response = await get(current);
    await response.arrayBuffer();
    const location = response.headers.get("location");
    const next = location ? new URL(location, current).toString() : "";
    hops.push({ url: current, status: response.status, location: next });
    if (!next || response.status < 300 || response.status >= 400) break;
    current = next;
  }
  return hops;
}

async function slashCheck() {
  const sitemap = await loadSitemap();
  const rows = [];
  for (const target of sitemap) {
    const url = target.replace(/\/$/, "");
    if (url === ORIGIN) continue; // Startseite: ohne Pfad gibt es keine Variante ohne „/“
    const hops = await chain(url);
    const redirects = hops.filter((hop) => hop.location);
    const final = hops.at(-1);
    const problems = [];
    if (redirects.length !== 1) problems.push(`${redirects.length} Weiterleitungen`);
    if (redirects[0] && ![301, 308].includes(redirects[0].status)) problems.push(`Status ${redirects[0].status}`);
    if (redirects[0] && redirects[0].location !== target) problems.push("erstes Ziel ≠ Sitemap-URL");
    if (final.url !== target || final.status !== 200) problems.push(`Ende ${final.status} ${final.url}`);
    rows.push({ url, target, hops, problems });
    process.stderr.write(`\r${rows.length} geprüft   `);
  }
  process.stderr.write("\n");

  const flagged = rows.filter((row) => row.problems.length > 0);
  console.log(`\nUser-Agent: ${mode} | Modus: ohne Schrägstrich | geprüft: ${rows.length} | auffällig: ${flagged.length}\n`);
  if (flagged.length > 0) {
    console.log("| URL ohne „/“ | Kette | Problem |");
    console.log("|---|---|---|");
    for (const row of flagged) {
      const path = row.hops.map((hop) => `${hop.status}${hop.location ? ` → ${hop.location}` : ""}`).join(" ⇒ ");
      console.log(`| ${row.url} | ${path} | ${row.problems.join("; ")} |`);
    }
  }
  if (jsonFile) writeFileSync(jsonFile, JSON.stringify({ mode, slash: true, rows }, null, 2));
}

if (slashMode) {
  await slashCheck();
  process.exit(0);
}

const { sitemap, results } = await crawl();
const flagged = results.map((row) => ({ ...row, issues: issues(row) })).filter((row) => row.issues.length > 0);
const crawled = new Set(results.map((row) => row.url));
const notReached = [...sitemap].filter((url) => !crawled.has(url));

console.log(`\nUser-Agent: ${mode} | geprüft: ${results.length} | Sitemap: ${sitemap.size} | auffällig: ${flagged.length}\n`);
console.log("| URL | Status | Weiterleitung | Canonical | Robots | Sitemap | Auffällig | Verlinkt von |");
console.log("|---|---|---|---|---|---|---|---|");
for (const row of flagged) {
  const from = row.sources.slice(0, 3).join(", ") + (row.sources.length > 3 ? ` (+${row.sources.length - 3})` : "");
  console.log(
    `| ${row.url} | ${row.status} | ${row.location || "–"} | ${row.canonical || "–"} | ${row.robots || "–"} | ${row.inSitemap ? "ja" : "nein"} | ${row.issues.join("; ")} | ${from} |`,
  );
}
if (notReached.length > 0) {
  console.log(`\nSitemap-URLs ohne internen Link (nicht erreicht): ${notReached.length}`);
  for (const url of notReached) console.log(`- ${url}`);
}
if (jsonFile) writeFileSync(jsonFile, JSON.stringify({ mode, results }, null, 2));
